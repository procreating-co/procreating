#!/usr/bin/env node
// npm run test:offline
//
// Teste de ponta a ponta no Google Chrome real, com a INTERNET BLOQUEADA no navegador:
// `--host-resolver-rules` faz todo domínio falhar na resolução de DNS, exceto 127.0.0.1 (o
// servidor local). Então qualquer dependência externa que tivesse sobrado quebraria aqui.
//
// Verifica: páginas carregam, nenhuma request sai do computador, nenhum erro no console, todas as
// imagens carregam, fontes locais carregam, o vídeo de fundo toca, e CADA vídeo começa a tocar com
// um clique real do mouse (gesto de usuário, política de autoplay padrão), com áudio decodificado.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { BUILD_ID_PATH, CLIENT_SLUG, PRESENTATION_PATH, assertNodeVersion, findFreePort, readManifest, startServer } from "./shared.mjs";

assertNodeVersion();
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!fs.existsSync(CHROME)) {
  console.error("✗ Google Chrome não encontrado em /Applications — teste manual necessário.");
  process.exit(1);
}
if (!readManifest() || !fs.existsSync(BUILD_ID_PATH)) {
  console.error("✗ Rode antes: npm run sync:offline");
  process.exit(1);
}

const problems = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- servidor + Chrome ------------------------------------------------------------------------------
const port = await findFreePort(4200);
const { child: server, baseUrl } = await startServer(port, { quiet: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "offline-presentation-test-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
    // Política padrão do Chrome desktop: som só depois de um gesto do usuário (como na reunião).
    "--autoplay-policy=user-gesture-required",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const cleanup = () => {
  try { chrome.kill(); } catch {}
  try { server.kill(); } catch {}
};
process.on("exit", cleanup);

let devtoolsPort;
for (let i = 0; i < 100 && !devtoolsPort; i++) {
  await sleep(100);
  const file = path.join(profile, "DevToolsActivePort");
  if (fs.existsSync(file)) devtoolsPort = fs.readFileSync(file, "utf8").split("\n")[0];
}
if (!devtoolsPort) throw new Error("Chrome não abriu a porta de depuração");
const targets = await (await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`)).json();
const pageTarget = targets.find((t) => t.type === "page");

// --- cliente CDP mínimo -----------------------------------------------------------------------------
const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});
let nextId = 1;
const pending = new Map();
const listeners = [];
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    for (const fn of listeners) fn(msg);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
};

const external = new Set();
const consoleErrors = [];
const failedLocal = [];
listeners.push(({ method, params }) => {
  if (method === "Network.requestWillBeSent") {
    const url = params.request.url;
    if (!/^(data:|blob:|about:)/.test(url) && !url.startsWith(baseUrl)) external.add(url);
  }
  if (method === "Network.loadingFailed" && !params.canceled && params.errorText !== "net::ERR_ABORTED") failedLocal.push(`${params.errorText} (${params.requestId})`);
  if (method === "Runtime.exceptionThrown") consoleErrors.push(params.exceptionDetails.exception?.description ?? params.exceptionDetails.text);
  if (method === "Runtime.consoleAPICalled" && params.type === "error") consoleErrors.push(params.args.map((a) => a.value ?? a.description).join(" "));
  if (method === "Log.entryAdded" && params.entry.level === "error") consoleErrors.push(`${params.entry.text} ${params.entry.url ?? ""}`);
});

await send("Network.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });

async function goto(route) {
  const loaded = new Promise((resolve) => listeners.push(function onLoad({ method }) {
    if (method === "Page.loadEventFired") {
      listeners.splice(listeners.indexOf(onLoad), 1);
      resolve();
    }
  }));
  await send("Page.navigate", { url: `${baseUrl}${route}` });
  await loaded;
  await sleep(800);
}

async function scrollThrough() {
  await evaluate(`(async () => {
    const step = innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 250)); }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 300));
  })()`);
}

async function checkImages(label) {
  const broken = await evaluate(`(async () => {
    const imgs = [...document.images];
    await Promise.all(imgs.map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 5000); })));
    // Falha = imagem que o navegador tentou carregar e deu erro. Imagens lazy ainda fora da tela
    // (ex.: capas não ativas do slideshow da galeria) só não foram pedidas ainda — não é erro.
    return imgs.filter(img => img.complete && img.naturalWidth === 0).map(img => img.currentSrc || img.src);
  })()`);
  const [count, pending] = await evaluate(`[document.images.length, [...document.images].filter(img => !img.complete).length]`);
  console.log(`  ${broken.length ? "✗" : "✓"} ${count - broken.length - pending}/${count} imagens carregadas (${label})${pending ? ` · ${pending} lazy ainda fora da tela` : ""}`);
  for (const src of broken) console.log(`      ✗ ${src.replace(baseUrl, "")}`);
  for (const src of broken) problems.push(`${label}: imagem não carregou: ${src}`);
}

async function click(selector) {
  const rect = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    el.scrollIntoView({ block: "center", behavior: "instant" });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  await sleep(250);
  for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
    await send("Input.dispatchMouseEvent", { type, x: rect.x, y: rect.y, button: "left", clickCount: type === "mouseMoved" ? 0 : 1 });
  }
}

try {
  // --- Apresentação principal -------------------------------------------------------------------------
  console.log(`\n━━━ Chrome sem internet · ${baseUrl} ━━━\n`);
  console.log(`▶ ${PRESENTATION_PATH}`);
  await goto(PRESENTATION_PATH);
  await sleep(1500);

  const hero = await evaluate(`(() => { const v = document.querySelector("video.hero-bg-video"); return v && { src: v.currentSrc, paused: v.paused, t: v.currentTime, ready: v.readyState }; })()`);
  const heroOk = hero && !hero.paused && hero.t > 0 && hero.src.startsWith(baseUrl);
  console.log(`  ${heroOk ? "✓" : "✗"} vídeo de fundo do hero tocando (${hero?.src?.replace(baseUrl, "")}, t=${hero?.t?.toFixed(1)}s)`);
  if (!heroOk) problems.push(`hero: vídeo de fundo não está tocando (${JSON.stringify(hero)})`);

  const title = await evaluate(`document.querySelector("h1 [aria-label]")?.getAttribute("aria-label")`);
  console.log(`  ✓ título: "${title}"`);

  const fonts = await evaluate(`(async () => {
    await document.fonts.ready;
    const faces = [...document.fonts].filter(f => f.status === "loaded").map(f => f.family);
    const h = getComputedStyle(document.querySelector("h1")).fontFamily;
    const mono = getComputedStyle(document.querySelector(".font-mono")).fontFamily;
    return { faces: [...new Set(faces)], h, mono };
  })()`);
  const fontsOk = fonts.faces.length >= 2;
  console.log(`  ${fontsOk ? "✓" : "✗"} fontes locais carregadas: ${fonts.faces.join(", ")}`);
  if (!fontsOk) problems.push(`fontes: esperado 2 fontes carregadas, obtido ${JSON.stringify(fonts)}`);

  await scrollThrough();
  await checkImages("apresentação");

  // --- Cada vídeo: clique real → toca com áudio ----------------------------------------------------
  const buttons = await evaluate(`[...document.querySelectorAll('button[aria-label^="Abrir vídeo em tela cheia"]')].map((b, i) => { b.dataset.testIndex = i; return b.getAttribute("aria-label").replace("Abrir vídeo em tela cheia: ", ""); })`);
  console.log(`\n▶ ${buttons.length} vídeos — clique → reprodução`);
  for (const [i, label] of buttons.entries()) {
    await evaluate(`(() => {
      window.__playT = null;
      const v = document.querySelector('[role="dialog"] video');
      v.addEventListener("playing", () => { window.__playT ??= performance.now() - window.__clickT; }, { once: true });
      document.addEventListener("mousedown", () => { window.__clickT = performance.now(); }, { once: true, capture: true });
    })()`);
    await click(`button[data-test-index="${i}"]`);
    await sleep(2500);
    const s = await evaluate(`(() => {
      const d = document.querySelector('[role="dialog"]'); const v = d.querySelector("video");
      return { open: getComputedStyle(d).display !== "none", src: v.currentSrc, paused: v.paused, t: v.currentTime, muted: v.muted, volume: v.volume,
               audioBytes: v.webkitAudioDecodedByteCount, videoBytes: v.webkitVideoDecodedByteCount, startMs: window.__playT, err: v.error && v.error.code };
    })()`);
    const local = s.src.startsWith(baseUrl);
    const playing = s.open && !s.paused && s.t > 0.3;
    const withAudio = !s.muted && s.volume > 0 && s.audioBytes > 0;
    const ok = local && playing && withAudio;
    const n = String(i + 1).padStart(2, "0");
    console.log(`  VIDEO ${n} ${ok ? "✓" : "✗"}  ${label}`);
    console.log(`           ${s.src.replace(baseUrl, "")} · tocando=${playing} · áudio=${withAudio ? `sim (${Math.round(s.audioBytes / 1024)} KB decodificados)` : "NÃO"} · começou em ${s.startMs != null ? `${Math.round(s.startMs)} ms` : "?"}`);
    if (!ok) problems.push(`VIDEO ${n} (${label}): ${JSON.stringify(s)}`);
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await sleep(400);
    const closed = await evaluate(`getComputedStyle(document.querySelector('[role="dialog"]')).display === "none" && document.querySelector('[role="dialog"] video').paused`);
    if (!closed) problems.push(`VIDEO ${n}: Esc não fechou/pausou o player`);
  }

  // --- Navegação ---------------------------------------------------------------------------------------
  const links = await evaluate(`[...new Set([...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")))]`);
  console.log(`\n▶ Links da página: ${links.join("  ")}`);
  for (const href of links.filter((h) => h.startsWith("/") && !h.startsWith("/assets/"))) {
    const res = await fetch(`${baseUrl}${href}`);
    if (!res.ok) problems.push(`link ${href} → HTTP ${res.status}`);
  }
  for (const href of links.filter((h) => /^https?:/.test(h))) problems.push(`link externo na apresentação: ${href}`);

  // Menu "Proposta de Continuidade" aparece depois de 10s (easter egg do site online)
  await sleep(8000);
  const proposta = await evaluate(`[...document.querySelectorAll("header a")].some(a => a.getAttribute("href") === "/clients/${CLIENT_SLUG}/public/proposta")`);
  console.log(`  ${proposta ? "✓" : "✗"} botão "Proposta de Continuidade" apareceu no menu após 10s`);
  if (!proposta) problems.push("menu: link da proposta não apareceu após 10s");

  // --- Outras páginas ------------------------------------------------------------------------------------
  console.log(`\n▶ /clients/${CLIENT_SLUG}/public/galeria`);
  await goto(`/clients/${CLIENT_SLUG}/public/galeria`);
  await evaluate(`document.querySelector("input")?.focus()`);
  await send("Input.insertText", { text: "pascoal" });
  await click("form button:not([type=button])");
  await sleep(2500);
  const unlocked = await evaluate(`!document.querySelector("form input")`);
  console.log(`  ${unlocked ? "✓" : "✗"} galeria desbloqueada com o código de acesso`);
  if (!unlocked) problems.push("galeria: não desbloqueou com o código");
  await scrollThrough();
  await checkImages("galeria");

  for (const route of [`/clients/${CLIENT_SLUG}/public/prospeccao`, `/clients/${CLIENT_SLUG}/public/proposta`, "/"]) {
    console.log(`\n▶ ${route}`);
    await goto(route);
    await scrollThrough();
    await checkImages(route);
  }

  // --- Resultado ---------------------------------------------------------------------------------------
  console.log("\n━━━ Rede e console ━━━");
  console.log(external.size ? `  ✗ ${external.size} request(s) externa(s):` : "  ✓ Nenhuma request saiu do computador (0 requests externas).");
  for (const url of external) problems.push(`request externa: ${url}`);
  const realErrors = consoleErrors.filter(Boolean);
  console.log(realErrors.length ? `  ✗ ${realErrors.length} erro(s) no console` : "  ✓ Nenhum erro no console.");
  for (const e of realErrors) problems.push(`console: ${e}`);
  if (failedLocal.length) for (const f of failedLocal) problems.push(`request local falhou: ${f}`);
} finally {
  ws.close();
  cleanup();
  await sleep(500);
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}

if (problems.length) {
  console.log(`\n✗ ${problems.length} problema(s):`);
  for (const p of problems) console.log(`  • ${p}`);
  process.exit(1);
}
console.log("\n✓ Teste no navegador sem internet: tudo OK.");
