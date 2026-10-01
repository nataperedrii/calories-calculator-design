// Export 03-screens to PNG with Playwright (headless Chromium).
//   npm run export:screens
// 1. Every screens/*.html → exports/<name>.png at a fixed 390×844 viewport, deviceScaleFactor 2 (780×1688).
// 2. flows.html → flows.png: the full board at deviceScaleFactor 2.
// Waits for web fonts and every image before the screenshot, and fails on console errors or
// failed requests, so a broken export never ships silently.
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readdirSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCREENS = resolve(HERE, "screens");
const EXPORTS = resolve(HERE, "exports");
mkdirSync(EXPORTS, { recursive: true });

const only = process.argv.slice(2); // optional: names to export, e.g. 07-today flows
const browser = await chromium.launch();
let failed = 0;

async function shoot(file, out, { width, height, scale, fullPage }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  const problems = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
  page.on("requestfailed", (r) => problems.push(`request failed: ${r.url()}`));
  await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")));
  problems.push(...broken.map((b) => `image not loaded: ${b}`));
  await page.screenshot({ path: out, fullPage });
  await page.close();
  const png = PNG.sync.read(readFileSync(out));
  const ok = problems.length === 0 && (fullPage || (png.width === width * scale && png.height === height * scale));
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${basename(out)} ${png.width}×${png.height}${problems.length ? " — " + problems.join(" | ") : ""}`);
}

try {
  for (const f of readdirSync(SCREENS).filter((f) => f.endsWith(".html")).sort()) {
    const name = f.replace(/\.html$/, "");
    if (only.length && !only.includes(name)) continue;
    await shoot(resolve(SCREENS, f), resolve(EXPORTS, `${name}.png`), { width: 390, height: 844, scale: 2, fullPage: false });
  }
  const board = resolve(HERE, "flows.html");
  if (existsSync(board) && (!only.length || only.includes("flows"))) {
    await shoot(board, resolve(HERE, "flows.png"), { width: 2400, height: 1200, scale: 2, fullPage: true });
  }
} finally {
  await browser.close();
}
if (failed) {
  console.error(`${failed} export(s) failed`);
  process.exit(1);
}
