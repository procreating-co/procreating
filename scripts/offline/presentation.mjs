#!/usr/bin/env node
// npm run presentation
//
// Inicia a apresentação offline (não precisa de internet):
//   1. confere que os vídeos já foram baixados (npm run sync:offline)
//   2. gera o build se ele não existir ou estiver desatualizado (funciona offline: fontes são locais)
//   3. sobe o servidor local e abre o navegador
//
// Flags: --no-open (não abre o navegador), --port=4000

import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import {
  ROOT,
  OFFLINE_DIR,
  OFFLINE_PUBLIC,
  MANIFEST_PATH,
  BUILD_ID_PATH,
  NEXT_BIN,
  PRESENTATION_PATH,
  assertNodeVersion,
  readManifest,
  findFreePort,
  startServer,
} from "./shared.mjs";

assertNodeVersion();
const args = process.argv.slice(2);
const noOpen = args.includes("--no-open");
const portArg = Number(args.find((a) => a.startsWith("--port="))?.split("=")[1]);

// 1. Assets ----------------------------------------------------------------------------------------
const manifest = readManifest();
if (!manifest) {
  console.error("\n✗ A apresentação offline ainda não foi preparada.\n  Com internet, rode uma vez:  npm run sync:offline\n");
  process.exit(1);
}
const missing = manifest.videos.filter((v) => {
  const file = path.join(OFFLINE_PUBLIC, v.localUrl);
  return !fs.existsSync(file) || fs.statSync(file).size !== v.bytes;
});
if (missing.length) {
  console.error(`\n✗ Vídeos ausentes ou incompletos:\n${missing.map((v) => `  • ${v.label} (${v.localUrl})`).join("\n")}\n  Com internet, rode:  npm run sync:offline\n`);
  process.exit(1);
}

// 2. Build (refaz só se algo mudou desde o último) -----------------------------------------------------
function newestMtime(target) {
  if (!fs.existsSync(target)) return 0;
  const stat = fs.statSync(target);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let newest = 0;
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    newest = Math.max(newest, newestMtime(path.join(target, entry.name)));
  }
  return newest;
}

const sources = [
  path.join(OFFLINE_DIR, "app"),
  path.join(OFFLINE_DIR, "components"),
  path.join(OFFLINE_DIR, "lib"),
  path.join(OFFLINE_DIR, "fonts"),
  path.join(OFFLINE_DIR, "next.config.mjs"),
  MANIFEST_PATH,
  path.join(ROOT, "components"),
  path.join(ROOT, "data"),
  path.join(ROOT, "lib"),
  path.join(ROOT, "content"),
  path.join(ROOT, "hooks"),
  path.join(ROOT, "app", "globals.css"),
  path.join(ROOT, "app", "pascoal-proposta"),
];
const buildTime = fs.existsSync(BUILD_ID_PATH) ? fs.statSync(BUILD_ID_PATH).mtimeMs : 0;
if (!buildTime || sources.some((s) => newestMtime(s) > buildTime)) {
  console.log(buildTime ? "\n▶ O código mudou desde o último build — gerando de novo (≈1 min, sem internet)…\n" : "\n▶ Gerando o build da apresentação (≈1 min, sem internet)…\n");
  const result = spawnSync(process.execPath, [NEXT_BIN, "build", path.relative(ROOT, OFFLINE_DIR)], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (result.status !== 0) {
    console.error("\n✗ O build falhou. Veja o erro acima.");
    process.exit(result.status ?? 1);
  }
}

// 3. Servidor + navegador ----------------------------------------------------------------------------
const port = await findFreePort(Number.isFinite(portArg) && portArg > 0 ? portArg : 4000);
console.log("\n▶ Iniciando servidor local…");
const { child, baseUrl } = await startServer(port, { quiet: true });
const url = `${baseUrl}${PRESENTATION_PATH}`;

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  APRESENTAÇÃO OFFLINE PRONTA — nenhuma internet é necessária

  Abra:  ${url}

  Tela cheia: ⌃⌘F (Chrome e Safari)
  Encerrar:   Ctrl+C neste terminal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

if (!noOpen && process.platform === "darwin") spawn("open", [url], { stdio: "ignore", detached: true }).unref();
else if (!noOpen && process.platform === "win32") spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
else if (!noOpen) spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();

const stop = () => {
  child.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", (code) => {
  console.error(`\nO servidor encerrou (código ${code}).`);
  process.exit(code ?? 1);
});
