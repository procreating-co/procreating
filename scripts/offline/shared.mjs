// Utilitários compartilhados pelos scripts da apresentação offline (sync, validate, presentation).
// Node puro, sem dependências — ver OFFLINE_PRESENTATION.md.

import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OFFLINE_DIR = path.join(ROOT, "offline");
export const OFFLINE_PUBLIC = path.join(OFFLINE_DIR, "public");
export const VIDEOS_DIR = path.join(OFFLINE_PUBLIC, "assets", "videos");
export const MANIFEST_PATH = path.join(OFFLINE_DIR, "generated", "manifest.json");
export const BUILD_ID_PATH = path.join(OFFLINE_DIR, ".next", "BUILD_ID");
export const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");

/** Cliente e rota da apresentação offline. */
export const CLIENT_SLUG = "pascoal";
export const PRESENTATION_PATH = `/clients/${CLIENT_SLUG}/public/past`;

/** Imagem usada pelo FooterSection quando o config não define `footer.backgroundImage` (hardcoded no componente). */
const FOOTER_DEFAULT_IMAGE = "/images/footer-earth-gradient.png";

export function assertNodeVersion() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  // Os scripts importam `data/<slug>/*.ts` direto (type stripping nativo do Node).
  if (major < 22 || (major === 22 && minor < 18)) {
    console.error(`✗ Node ${process.versions.node} é antigo demais. Use Node 22.18+ (recomendado: 24).`);
    process.exit(1);
  }
}

/**
 * Lê os MESMOS arquivos de dados que a versão online usa (`data/pascoal/config.ts` e
 * `data/pascoal/videos.ts`) e devolve a lista de vídeos que a apresentação `/past` renderiza.
 * Nada é listado à mão: trocar um vídeo em `data/pascoal/videos.ts` e rodar `npm run sync:offline`
 * basta para a versão offline acompanhar.
 */
export async function loadPresentationSources() {
  const dataDir = path.join(ROOT, "data", CLIENT_SLUG);
  const { clientConfig } = await import(pathToFileURL(path.join(dataDir, "config.ts")).href);
  const { clientVideos } = await import(pathToFileURL(path.join(dataDir, "videos.ts")).href);

  const videos = [];
  const add = (key, label, src) => {
    if (!src) return;
    if (videos.some((v) => v.src === src)) return;
    videos.push({ key, label, src });
  };

  add("hero-background", "Hero (fundo)", clientConfig.hero.backgroundVideo);
  add("features-background", "Fotos (fundo)", clientConfig.features.backgroundVideo);
  for (const video of clientVideos.socialVideos) add(video.id, `${video.number}. ${video.title}`, video.videoSrc);
  for (const video of [clientVideos.acquisitionVideo, clientVideos.presentationVideo]) {
    if (video) add(video.id, `${video.number}. ${video.title}`, video.videoSrc);
  }
  // downloadHref normalmente é igual ao videoSrc; se algum dia divergir, também precisa existir offline.
  for (const video of [...clientVideos.socialVideos, clientVideos.acquisitionVideo, clientVideos.presentationVideo]) {
    if (video && video.downloadHref && video.downloadHref !== video.videoSrc) add(`${video.id}-download`, `${video.number}. ${video.title} (download)`, video.downloadHref);
  }

  const images = new Set([clientConfig.logo, clientConfig.metadata.ogImage, clientConfig.footer.backgroundImage ?? FOOTER_DEFAULT_IMAGE, "/placeholder.svg"]);
  for (const photo of clientConfig.features.photos) if (photo.src) images.add(photo.src);
  for (const video of [...clientVideos.socialVideos, clientVideos.acquisitionVideo, clientVideos.presentationVideo]) if (video?.poster) images.add(video.poster);

  return { clientConfig, clientVideos, videos, images: [...images].filter(Boolean) };
}

export function isRemote(src) {
  return /^https?:\/\//i.test(src);
}

export function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
}

export function formatBytes(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

// ---------------------------------------------------------------------------------------------
// Inspeção de MP4 (sem ffprobe): lê as caixas ISO-BMFF pra descobrir codec de vídeo, se existe
// faixa de áudio, duração, resolução e se o `moov` vem antes do `mdat` ("faststart").
// ---------------------------------------------------------------------------------------------

function readTopLevelBoxes(fd, fileSize) {
  const boxes = [];
  let offset = 0;
  const header = Buffer.alloc(16);
  while (offset + 8 <= fileSize) {
    fs.readSync(fd, header, 0, 16, offset);
    let size = header.readUInt32BE(0);
    const type = header.toString("latin1", 4, 8);
    let headerSize = 8;
    if (size === 1) {
      size = Number(header.readBigUInt64BE(8));
      headerSize = 16;
    } else if (size === 0) {
      size = fileSize - offset;
    }
    if (size < headerSize) break;
    boxes.push({ type, offset, size, headerSize });
    offset += size;
  }
  return boxes;
}

function childBoxes(buf, start, end) {
  const boxes = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = buf.readUInt32BE(offset);
    const type = buf.toString("latin1", offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      size = Number(buf.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < headerSize || offset + size > end) break;
    boxes.push({ type, start: offset + headerSize, end: offset + size });
    offset += size;
  }
  return boxes;
}

const find = (buf, box, type) => childBoxes(buf, box.start, box.end).find((b) => b.type === type);

export function inspectMp4(filePath) {
  const fileSize = fs.statSync(filePath).size;
  const fd = fs.openSync(filePath, "r");
  try {
    const top = readTopLevelBoxes(fd, fileSize);
    const ftyp = top.find((b) => b.type === "ftyp");
    const moov = top.find((b) => b.type === "moov");
    const mdat = top.find((b) => b.type === "mdat");
    if (!ftyp || !moov) return { valid: false, error: "sem caixas ftyp/moov (não parece um MP4 válido)" };

    const brandBuf = Buffer.alloc(4);
    fs.readSync(fd, brandBuf, 0, 4, ftyp.offset + ftyp.headerSize);
    const moovBuf = Buffer.alloc(moov.size);
    fs.readSync(fd, moovBuf, 0, moov.size, moov.offset);

    const result = { valid: true, brand: brandBuf.toString("latin1"), faststart: !mdat || moov.offset < mdat.offset, video: null, audio: null, durationSec: null };
    const moovBox = { start: moov.headerSize, end: moov.size };

    const mvhd = find(moovBuf, moovBox, "mvhd");
    if (mvhd) {
      const version = moovBuf.readUInt8(mvhd.start);
      const timescale = version === 1 ? moovBuf.readUInt32BE(mvhd.start + 20) : moovBuf.readUInt32BE(mvhd.start + 12);
      const duration = version === 1 ? Number(moovBuf.readBigUInt64BE(mvhd.start + 24)) : moovBuf.readUInt32BE(mvhd.start + 16);
      if (timescale) result.durationSec = duration / timescale;
    }

    for (const trak of childBoxes(moovBuf, moovBox.start, moovBox.end).filter((b) => b.type === "trak")) {
      const mdia = find(moovBuf, trak, "mdia");
      const hdlr = mdia && find(moovBuf, mdia, "hdlr");
      if (!hdlr) continue;
      const handler = moovBuf.toString("latin1", hdlr.start + 8, hdlr.start + 12);
      const minf = find(moovBuf, mdia, "minf");
      const stbl = minf && find(moovBuf, minf, "stbl");
      const stsd = stbl && find(moovBuf, stbl, "stsd");
      if (!stsd) continue;
      const entryStart = stsd.start + 8; // version/flags (4) + entry_count (4)
      const codec = moovBuf.toString("latin1", entryStart + 4, entryStart + 8);
      if (handler === "vide" && !result.video) {
        const width = moovBuf.readUInt16BE(entryStart + 8 + 24);
        const height = moovBuf.readUInt16BE(entryStart + 8 + 26);
        result.video = { codec, width, height };
      } else if (handler === "soun" && !result.audio) {
        result.audio = { codec };
      }
    }
    return result;
  } finally {
    fs.closeSync(fd);
  }
}

/** Codecs que Chrome e Safari (macOS) reproduzem nativamente em <video>. */
export const BROWSER_SAFE_VIDEO_CODECS = { avc1: "H.264", avc3: "H.264", hvc1: "HEVC/H.265", hev1: "HEVC/H.265", av01: "AV1" };
export const BROWSER_SAFE_AUDIO_CODECS = { mp4a: "AAC", "ac-3": "AC-3", "ec-3": "E-AC-3", Opus: "Opus", ".mp3": "MP3" };

// ---------------------------------------------------------------------------------------------
// Servidor local (next start do app offline)
// ---------------------------------------------------------------------------------------------


export const HOST = "127.0.0.1";

export function findFreePort(preferred) {
  return new Promise((resolve) => {
    const tryPort = (port) => {
      const server = net.createServer();
      server.once("error", () => tryPort(port + 1));
      server.once("listening", () => server.close(() => resolve(port)));
      server.listen(port, HOST);
    };
    tryPort(preferred);
  });
}

/** Sobe `next start offline` e resolve quando o servidor responde. `stdio: "inherit"` mostra o log do Next. */
export async function startServer(port, { quiet = false } = {}) {
  const child = spawn(process.execPath, [NEXT_BIN, "start", path.relative(ROOT, OFFLINE_DIR), "-p", String(port), "-H", HOST], {
    cwd: ROOT,
    stdio: quiet ? "ignore" : ["ignore", "inherit", "inherit"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NODE_ENV: "production" },
  });
  const baseUrl = `http://${HOST}:${port}`;
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`o servidor encerrou (código ${child.exitCode})`);
    try {
      const res = await fetch(`${baseUrl}${PRESENTATION_PATH}`);
      if (res.ok) return { child, baseUrl };
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  child.kill();
  throw new Error("o servidor não respondeu em 60s");
}
