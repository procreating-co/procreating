#!/usr/bin/env node
// npm run validate:offline
//
// Valida a apresentação offline:
//   1. VÍDEOS  — cada arquivo existe, tem tamanho > 0, é .mp4 válido, bate com o manifesto; mostra
//                codec, áudio, duração e se está otimizado pra começar rápido (moov no início).
//   2. FONTES  — todo vídeo usado hoje por data/pascoal/* tem cópia local (nada aponta pro R2).
//   3. BUILD   — varre o JS/CSS/HTML gerado procurando domínios externos (R2, Cloudflare, Vercel,
//                Google Fonts, Supabase…).
//   4. SERVIDOR (--serve) — sobe o servidor local e confere que cada vídeo é servido localmente
//                (HTTP 206 com Range, video/mp4) e que as páginas respondem 200.
//   (--warm) pré-gera as miniaturas otimizadas da galeria, pra ela abrir sem atraso.
//
// Flags: --files-only (só 1 e 2), --serve, --warm

import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  OFFLINE_DIR,
  OFFLINE_PUBLIC,
  VIDEOS_DIR,
  BUILD_ID_PATH,
  PRESENTATION_PATH,
  CLIENT_SLUG,
  assertNodeVersion,
  loadPresentationSources,
  readManifest,
  formatBytes,
  inspectMp4,
  findFreePort,
  startServer,
  BROWSER_SAFE_VIDEO_CODECS,
  BROWSER_SAFE_AUDIO_CODECS,
} from "./shared.mjs";

assertNodeVersion();
const args = new Set(process.argv.slice(2));
const problems = [];
const notes = [];
const fail = (msg) => problems.push(msg);

// 1. Vídeos -----------------------------------------------------------------------------------
const manifest = readManifest();
if (!manifest) {
  console.error("✗ offline/generated/manifest.json não existe. Rode: npm run sync:offline");
  process.exit(1);
}

console.log("━━━ Vídeos da apresentação offline ━━━\n");
let totalBytes = 0;
const withoutAudio = [];
manifest.videos.forEach((entry, index) => {
  const n = String(index + 1).padStart(2, "0");
  const file = path.join(OFFLINE_PUBLIC, entry.localUrl);
  const errors = [];
  let info = null;

  if (!entry.localUrl.startsWith("/assets/videos/")) errors.push(`URL local inesperada: ${entry.localUrl}`);
  if (path.extname(file).toLowerCase() !== ".mp4") errors.push("extensão não é .mp4");
  if (!fs.existsSync(file)) {
    errors.push("arquivo não existe");
  } else {
    const size = fs.statSync(file).size;
    totalBytes += size;
    if (size === 0) errors.push("arquivo vazio");
    else if (entry.bytes && size !== entry.bytes) errors.push(`tamanho ${size} ≠ esperado ${entry.bytes} (download incompleto?)`);
    if (size > 0) {
      info = inspectMp4(file);
      if (!info.valid) errors.push(info.error);
    }
  }

  const videoCodec = info?.video?.codec;
  const audioCodec = info?.audio?.codec;
  if (info?.valid && !videoCodec) errors.push("sem faixa de vídeo");
  if (videoCodec && !BROWSER_SAFE_VIDEO_CODECS[videoCodec]) errors.push(`codec de vídeo "${videoCodec}" pode não tocar no Chrome/Safari`);
  if (videoCodec === "av01") notes.push(`VIDEO ${n}: AV1 só decodifica no Safari em Macs com chip M3+.`);
  if (videoCodec === "hvc1" || videoCodec === "hev1") notes.push(`VIDEO ${n}: HEVC — Safari ok; Chrome no macOS depende de decodificação por hardware.`);
  if (info?.valid && !audioCodec) withoutAudio.push(`VIDEO ${n} (${entry.label})`);
  if (audioCodec && !BROWSER_SAFE_AUDIO_CODECS[audioCodec]) errors.push(`codec de áudio "${audioCodec}" pode não tocar`);

  const details = info?.valid
    ? [
        formatBytes(fs.statSync(file).size),
        `${BROWSER_SAFE_VIDEO_CODECS[videoCodec] ?? videoCodec} ${info.video.width}x${info.video.height}`,
        audioCodec ? `áudio ${BROWSER_SAFE_AUDIO_CODECS[audioCodec] ?? audioCodec}` : "SEM ÁUDIO",
        info.durationSec ? `${Math.floor(info.durationSec / 60)}:${String(Math.round(info.durationSec % 60)).padStart(2, "0")}` : null,
        info.faststart ? "início rápido" : "moov no fim (ok localmente)",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  console.log(`VIDEO ${n} ${errors.length ? "✗" : "✓"}  ${entry.label}`);
  console.log(`         ${entry.localUrl}${details ? `  —  ${details}` : ""}`);
  for (const e of errors) {
    console.log(`         ✗ ${e}`);
    fail(`VIDEO ${n} (${entry.label}): ${e}`);
  }
});

// Nenhum arquivo extra/sobrando na pasta
const expected = new Set(manifest.videos.map((v) => path.basename(v.localUrl)));
for (const file of fs.existsSync(VIDEOS_DIR) ? fs.readdirSync(VIDEOS_DIR) : []) {
  if (!expected.has(file)) notes.push(`Arquivo não usado em offline/public/assets/videos/: ${file}`);
}

console.log(`\nTotal: ${manifest.videos.length} vídeos · ${formatBytes(totalBytes)} · em ${path.relative(ROOT, VIDEOS_DIR)}/`);
console.log(withoutAudio.length ? `Sem faixa de áudio: ${withoutAudio.join(", ")}` : "Áudio: todos os vídeos têm faixa de áudio.");

// 2. Manifesto x dados atuais --------------------------------------------------------------------
const { videos: sources, images } = await loadPresentationSources();
const bySource = new Map(manifest.videos.map((v) => [v.originalSrc, v]));
for (const source of sources) {
  if (!bySource.has(source.src)) fail(`"${source.label}" (${source.src}) está em data/${CLIENT_SLUG}/ mas não foi baixado — rode npm run sync:offline`);
}
for (const img of images) {
  if (!fs.existsSync(path.join(OFFLINE_PUBLIC, img))) fail(`imagem ausente em offline/public: ${img} — rode npm run sync:offline`);
}
for (const v of manifest.videos) {
  if (/^https?:/i.test(v.localUrl)) fail(`manifesto aponta pra URL remota: ${v.localUrl}`);
}

// 3. Auditoria do build ------------------------------------------------------------------------
const FORBIDDEN = [
  [/r2\.dev|r2\.cloudflarestorage\.com/i, "Cloudflare R2"],
  [/cloudflare\.com|cdnjs\.cloudflare/i, "Cloudflare"],
  [/vercel\.(app|com)|_vercel\/insights|vitals\.vercel/i, "Vercel"],
  [/fonts\.googleapis\.com|fonts\.gstatic\.com/i, "Google Fonts"],
  [/supabase\.(co|in)/i, "Supabase"],
  [/googletagmanager|google-analytics|plausible\.io|posthog/i, "analytics"],
  [/unpkg\.com|jsdelivr\.net/i, "CDN"],
];
// Hosts que aparecem só como texto (mensagens de erro do React/Next, namespace SVG) ou como link
// que a pessoa clica de propósito — nenhum é carregado pela página.
const LINK_ONLY_HOSTS = /^(www\.w3\.org|react\.dev|reactjs\.org|nextjs\.org|github\.com|wa\.me|instagram\.com|www\.instagram\.com|drive\.google\.com|fb\.me|legacy\.reactjs\.org|developer\.mozilla\.org|html\.spec\.whatwg\.org|localhost)$/;

if (!args.has("--files-only")) {
  console.log("\n━━━ Auditoria de dependências externas ━━━\n");
  if (!fs.existsSync(BUILD_ID_PATH)) {
    fail("build offline não encontrado — rode npm run sync:offline");
  } else {
    const dirs = [path.join(OFFLINE_DIR, ".next", "static"), path.join(OFFLINE_DIR, ".next", "server", "app")];
    const otherHosts = new Map();
    let scanned = 0;
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(js|css|html|rsc|json|body|meta)$/.test(entry.name)) {
          scanned++;
          const text = fs.readFileSync(full, "utf8");
          for (const [re, label] of FORBIDDEN) {
            if (re.test(text)) fail(`${label} referenciado em ${path.relative(ROOT, full)}`);
          }
          for (const match of text.matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
            const host = match[1].toLowerCase();
            if (!LINK_ONLY_HOSTS.test(host) && !FORBIDDEN.some(([re]) => re.test(host))) otherHosts.set(host, path.relative(ROOT, full));
          }
        }
      }
    };
    dirs.filter((d) => fs.existsSync(d)).forEach(walk);
    console.log(`${scanned} arquivos do build verificados.`);
    if (!problems.some((p) => FORBIDDEN.some(([, label]) => p.startsWith(label)))) console.log("✓ Nenhuma referência a R2, Cloudflare, Vercel, Google Fonts, Supabase, analytics ou CDN.");
    for (const [host, file] of otherHosts) notes.push(`Host externo encontrado no build (verificar): ${host} em ${file}`);
    console.log("ℹ Links externos que só abrem se alguém clicar (não carregam nada sozinhos): WhatsApp (wa.me), Instagram, Google Drive (botão da galeria).");
  }
}

// 4. Servidor local ------------------------------------------------------------------------------
if (args.has("--serve") || args.has("--warm")) {
  console.log("\n━━━ Teste servindo localmente ━━━\n");
  const port = await findFreePort(4100);
  const { child, baseUrl } = await startServer(port, { quiet: true });
  try {
    for (const route of [PRESENTATION_PATH, `/clients/${CLIENT_SLUG}/public/galeria`, `/clients/${CLIENT_SLUG}/public/prospeccao`, `/clients/${CLIENT_SLUG}/public/proposta`, "/"]) {
      const res = await fetch(`${baseUrl}${route}`);
      const html = await res.text();
      const ok = res.ok && !/r2\.dev/.test(html);
      console.log(`PÁGINA ${ok ? "✓" : "✗"}  ${route} (${res.status})`);
      if (!ok) fail(`página ${route}: status ${res.status}${/r2\.dev/.test(html) ? " e contém URL do R2" : ""}`);
      if (route === PRESENTATION_PATH) {
        for (const v of manifest.videos) {
          if (!html.includes(v.localUrl)) fail(`a página não referencia ${v.localUrl}`);
        }
      }
    }
    for (const [index, v] of manifest.videos.entries()) {
      const n = String(index + 1).padStart(2, "0");
      const res = await fetch(`${baseUrl}${v.localUrl}`, { headers: { Range: "bytes=0-1023" } });
      await res.arrayBuffer();
      const type = res.headers.get("content-type") ?? "";
      const ok = res.status === 206 && type.startsWith("video/mp4");
      console.log(`SERVE  ${ok ? "✓" : "✗"}  VIDEO ${n} ${v.localUrl} (${res.status}, ${type})`);
      if (!ok) fail(`VIDEO ${n}: servidor local respondeu ${res.status} ${type}`);
    }

    if (args.has("--warm")) {
      // Mesmas URLs que components/gallery/* pedem (grade: optimizedGallerySrc 384/640/750; capas das
      // pastas: next/image 1080/1920/3840; foto ampliada: 1920@85), com o mesmo Accept de Chrome/Safari.
      const galleryDir = path.join(OFFLINE_PUBLIC, "gallery", CLIENT_SLUG);
      const photos = [];
      for (const folder of fs.readdirSync(galleryDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        for (const file of fs.readdirSync(path.join(galleryDir, folder.name)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
          photos.push(`/gallery/${CLIENT_SLUG}/${folder.name}/${file}`);
        }
      }
      const urls = photos.flatMap((src) => [[384, 75], [640, 75], [750, 75], [1080, 75], [1920, 75], [3840, 75], [1920, 85]].map(([w, q]) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}`));
      console.log(`\nPré-aquecendo ${urls.length} miniaturas da galeria (${photos.length} fotos)…`);
      let done = 0;
      let failed = 0;
      const worker = async () => {
        while (urls.length) {
          const url = urls.shift();
          const res = await fetch(`${baseUrl}${url}`, { headers: { Accept: "image/avif,image/webp,image/*,*/*;q=0.8" } }).catch(() => null);
          if (res) await res.arrayBuffer();
          if (!res?.ok) failed++;
          if (++done % 100 === 0) console.log(`  ${done} prontas…`);
        }
      };
      await Promise.all(Array.from({ length: 4 }, worker));
      console.log(`✓ ${done - failed} miniaturas em cache${failed ? ` (${failed} falharam)` : ""}.`);
      if (failed) notes.push(`${failed} miniaturas da galeria não puderam ser pré-geradas.`);
    }
  } finally {
    child.kill();
  }
}

// Resultado --------------------------------------------------------------------------------------
if (notes.length) {
  console.log("\nObservações:");
  for (const n of notes) console.log(`  • ${n}`);
}
if (problems.length) {
  console.log(`\n✗ ${problems.length} problema(s):`);
  for (const p of problems) console.log(`  • ${p}`);
  process.exit(1);
}
console.log("\n✓ Validação da apresentação offline OK.");
