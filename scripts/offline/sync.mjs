#!/usr/bin/env node
// npm run sync:offline
//
// Prepara TUDO que a apresentação offline precisa (precisa de internet só aqui):
//   1. descobre os vídeos usados pela apresentação lendo data/pascoal/{config,videos}.ts
//   2. baixa os vídeos do R2 (bucket público — nenhuma credencial) para offline/public/assets/videos/
//   3. copia imagens/fotos da galeria de public/ para offline/public/
//   4. grava offline/generated/manifest.json (URL original → arquivo local)
//   5. valida os vídeos (scripts/offline/validate.mjs)
//   6. gera o build de produção do app offline (next build offline)
//   7. pré-aquece o cache de imagens otimizadas da galeria
//
// Flags: --skip-build, --skip-warm, --force (baixa os vídeos de novo mesmo se já existirem)

import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { spawnSync } from "node:child_process";
import {
  ROOT,
  OFFLINE_DIR,
  OFFLINE_PUBLIC,
  VIDEOS_DIR,
  MANIFEST_PATH,
  CLIENT_SLUG,
  assertNodeVersion,
  loadPresentationSources,
  isRemote,
  formatBytes,
  inspectMp4,
} from "./shared.mjs";

assertNodeVersion();
const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");

async function remoteSize(url) {
  const res = await fetch(url, { method: "HEAD" });
  if (!res.ok) throw new Error(`HEAD ${res.status} em ${url}`);
  return Number(res.headers.get("content-length") ?? 0);
}

/** Baixa em `<dest>.part` e renomeia no fim. Se a conexão cair, tenta de novo retomando de onde parou (HTTP Range). */
async function download(url, dest, expectedBytes, label) {
  const tmp = `${dest}.part`;
  const MAX_ATTEMPTS = 8;
  for (let attempt = 1; ; attempt++) {
    const already = fs.existsSync(tmp) ? fs.statSync(tmp).size : 0;
    if (expectedBytes && already === expectedBytes) break;
    try {
      const res = await fetch(url, already ? { headers: { Range: `bytes=${already}-` } } : undefined);
      if (!res.ok || !res.body) throw new Error(`GET ${res.status} em ${url}`);
      const resuming = already > 0 && res.status === 206;
      let received = resuming ? already : 0;
      let lastLog = 0;
      const source = Readable.fromWeb(res.body);
      source.on("data", (chunk) => {
        received += chunk.length;
        const now = Date.now();
        if (now - lastLog > 5000) {
          lastLog = now;
          const pct = expectedBytes ? ` (${((received / expectedBytes) * 100).toFixed(0)}%)` : "";
          console.log(`    ↓ ${label}: ${formatBytes(received)} / ${formatBytes(expectedBytes)}${pct}`);
        }
      });
      await pipeline(source, fs.createWriteStream(tmp, { flags: resuming ? "a" : "w" }));
      break;
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) throw new Error(`${label}: download falhou após ${MAX_ATTEMPTS} tentativas (${error.message})`);
      console.log(`    ! conexão interrompida (${error.message}) — retomando (tentativa ${attempt + 1}/${MAX_ATTEMPTS})…`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  const size = fs.statSync(tmp).size;
  if (expectedBytes && size !== expectedBytes) {
    fs.rmSync(tmp, { force: true });
    throw new Error(`download incompleto de ${label}: ${size} de ${expectedBytes} bytes`);
  }
  fs.renameSync(tmp, dest);
}

/** Copia um arquivo só se o destino não existir ou tiver tamanho/data diferentes. */
function copyIfChanged(src, dest) {
  const s = fs.statSync(src);
  if (fs.existsSync(dest)) {
    const d = fs.statSync(dest);
    if (d.size === s.size && d.mtimeMs + 1000 >= s.mtimeMs) return false; // tolerância: utimes perde precisão sub-ms
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  fs.utimesSync(dest, s.atime, s.mtime);
  return true;
}

function copyTree(srcDir, destDir) {
  let copied = 0;
  let total = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      const r = copyTree(src, dest);
      copied += r.copied;
      total += r.total;
    } else if (entry.isFile()) {
      total++;
      if (copyIfChanged(src, dest)) copied++;
    }
  }
  return { copied, total };
}

function run(label, cmd, cmdArgs) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(cmd, cmdArgs, { cwd: ROOT, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
  if (result.status !== 0) {
    console.error(`\n✗ Falhou: ${label}`);
    process.exit(result.status ?? 1);
  }
}

async function main() {
  console.log("━━━ Sincronizando a apresentação offline ━━━\n");
  const { videos, images } = await loadPresentationSources();
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });

  // 1-2. Vídeos -------------------------------------------------------------------------------
  console.log(`▶ Vídeos (${videos.length}) → offline/public/assets/videos/`);
  const entries = [];
  for (const video of videos) {
    const fileName = `${video.key}.mp4`;
    const dest = path.join(VIDEOS_DIR, fileName);
    const localUrl = `/assets/videos/${fileName}`;

    if (isRemote(video.src)) {
      const bytes = await remoteSize(video.src);
      const upToDate = !FORCE && fs.existsSync(dest) && fs.statSync(dest).size === bytes;
      if (upToDate) {
        console.log(`  ✓ ${video.label} — já baixado (${formatBytes(bytes)})`);
      } else {
        console.log(`  ↓ ${video.label} — baixando ${formatBytes(bytes)} do R2…`);
        await download(video.src, dest, bytes, video.label);
        console.log(`  ✓ ${video.label} — ok`);
      }
      entries.push({ key: video.key, label: video.label, source: "r2", originalSrc: video.src, localUrl, bytes });
    } else {
      // Vídeo que a versão online já serve do próprio public/ (ex.: /videos/hero-background.mp4).
      const src = path.join(ROOT, "public", video.src);
      if (!fs.existsSync(src) || fs.statSync(src).size === 0) {
        throw new Error(`${video.label}: arquivo local ${path.relative(ROOT, src)} não existe ou está vazio (rode "git checkout -- ${path.relative(ROOT, src)}").`);
      }
      copyIfChanged(src, dest);
      const bytes = fs.statSync(dest).size;
      console.log(`  ✓ ${video.label} — copiado de ${path.relative(ROOT, src)} (${formatBytes(bytes)})`);
      entries.push({ key: video.key, label: video.label, source: "local", originalSrc: video.src, localUrl, bytes });
    }
  }

  // Remove vídeos que não são mais usados pela apresentação (ex.: trocados em data/pascoal/videos.ts).
  const keep = new Set(entries.map((e) => path.basename(e.localUrl)));
  for (const file of fs.readdirSync(VIDEOS_DIR)) {
    if (!keep.has(file)) {
      fs.rmSync(path.join(VIDEOS_DIR, file), { force: true });
      console.log(`  − removido (não usado mais): ${file}`);
    }
  }

  for (const entry of entries) {
    const info = inspectMp4(path.join(VIDEOS_DIR, path.basename(entry.localUrl)));
    Object.assign(entry, {
      videoCodec: info.video?.codec ?? null,
      audioCodec: info.audio?.codec ?? null,
      hasAudio: Boolean(info.audio),
      width: info.video?.width ?? null,
      height: info.video?.height ?? null,
      durationSec: info.durationSec ? Math.round(info.durationSec) : null,
      faststart: info.faststart ?? null,
    });
  }

  // 3. Imagens --------------------------------------------------------------------------------
  console.log("\n▶ Imagens → offline/public/");
  const missingImages = images.filter((img) => !fs.existsSync(path.join(ROOT, "public", img)));
  if (missingImages.length) throw new Error(`Imagens referenciadas que não existem em public/: ${missingImages.join(", ")}`);
  // public/images inteiro (21MB — capas, fotos do carrossel, logo, rodapé) e a galeria só da Pascoal.
  const imgs = copyTree(path.join(ROOT, "public", "images"), path.join(OFFLINE_PUBLIC, "images"));
  const gallery = copyTree(path.join(ROOT, "public", "gallery", CLIENT_SLUG), path.join(OFFLINE_PUBLIC, "gallery", CLIENT_SLUG));
  copyIfChanged(path.join(ROOT, "public", "placeholder.svg"), path.join(OFFLINE_PUBLIC, "placeholder.svg"));
  console.log(`  ✓ public/images: ${imgs.total} arquivos (${imgs.copied} atualizados)`);
  console.log(`  ✓ public/gallery/${CLIENT_SLUG}: ${gallery.total} arquivos (${gallery.copied} atualizados)`);

  // 4. Manifesto ------------------------------------------------------------------------------
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  const manifest = { generatedAt: new Date().toISOString(), client: CLIENT_SLUG, videos: entries };
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n✓ Manifesto: ${path.relative(ROOT, MANIFEST_PATH)}`);

  // 5-7. Validação, build e aquecimento ---------------------------------------------------------
  run("Validando vídeos", process.execPath, ["--no-warnings", path.join("scripts", "offline", "validate.mjs"), "--files-only"]);
  if (!args.has("--skip-build")) {
    run("Gerando build da apresentação offline (next build offline)", process.execPath, [path.join("node_modules", "next", "dist", "bin", "next"), "build", path.relative(ROOT, OFFLINE_DIR)]);
    if (!args.has("--skip-warm")) run("Validação completa + pré-aquecimento das imagens da galeria", process.execPath, ["--no-warnings", path.join("scripts", "offline", "validate.mjs"), "--serve", "--warm"]);
  }

  console.log("\n━━━ Pronto. Para apresentar: npm run presentation ━━━");
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`);
  process.exit(1);
});
