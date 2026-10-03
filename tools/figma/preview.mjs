// Figma export, step 2 (0 Figma calls): draw each layer tree back as plain absolutely positioned boxes,
// with the same rules the Figma builder uses, and compare it with the reference export
// (03-screens/exports/<screen>.png). A big difference means the extraction lost something.
// Usage: node tools/figma/preview.mjs [screen …]   → figma-export/preview/<screen>.png + a % difference
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LAYERS = resolve(ROOT, "figma-export/layers");
const OUT = resolve(ROOT, "figma-export/preview");
mkdirSync(OUT, { recursive: true });
const ids = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(LAYERS).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => f.slice(0, -5));
const IMG = pathToFileURL(resolve(ROOT, "01-branding/assets")).href;
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Hanken+Grotesk:wght@400;500;600;700&family=Azeret+Mono:wght@400;500;600&display=swap">';

const css = (n) => {
  const s = [`left:${n.x || 0}px`, `top:${n.y || 0}px`, `width:${n.w}px`, `height:${n.h}px`];
  if (n.fill) s.push(`background:${n.fill}`);
  if (n.r !== undefined) s.push(`border-radius:${Array.isArray(n.r) ? n.r.map((v) => v + "px").join(" ") : n.r + "px"}`);
  const sh = [];
  if (n.stroke && n.dash) s.push(`border:${n.stroke[1]}px dashed ${n.stroke[0]}`);
  else if (n.stroke) sh.push(`inset 0 0 0 ${n.stroke[1]}px ${n.stroke[0]}`);
  if (n.bottom) sh.push(`inset 0 -${n.bottom[1]}px 0 0 ${n.bottom[0]}`);
  if (n.top) sh.push(`inset 0 ${n.top[1]}px 0 0 ${n.top[0]}`);
  (n.shadow || []).forEach(([c, x, y, b, sp]) => sh.push(`${x}px ${y}px ${b}px ${sp}px ${c}`));
  if (sh.length) s.push(`box-shadow:${sh.join(",")}`);
  if (n.clip) s.push("overflow:hidden");
  if (n.o !== undefined) s.push(`opacity:${n.o}`);
  return s.join(";");
};
const draw = (n) => {
  if (n.t === "S" && n.x === 0 && n.y === 0 && n.n === "scrim") return `<div style="position:absolute;left:0;top:0">${n.svg}</div>`;
  if (n.t === "F" || n.t === "R") return `<div style="position:absolute;${css(n)}">${(n.k || []).map(draw).join("")}</div>`;
  if (n.t === "I") return `<img src="${IMG}/${n.n}" style="position:absolute;left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${n.h}px;object-fit:cover;${n.r ? `border-radius:${n.r}px;` : ""}">`;
  if (n.t === "S") return `<div style="position:absolute;left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${n.h}px">${n.svg}</div>`;
  if (n.t === "T") {
    const esc = n.txt.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<div style="position:absolute;left:${n.x}px;top:${n.y}px;width:${n.w + 1}px;font-family:'${n.f}';font-weight:${n.fw};font-size:${n.s}px;line-height:${n.lh ? n.lh + "px" : "normal"};letter-spacing:${n.ls}px;color:${n.c};${n.tt ? `text-transform:${n.tt};` : ""}${n.al ? `text-align:${n.al};` : ""}${n.u ? "text-decoration:underline;" : ""}${n.tab ? "font-variant-numeric:tabular-nums;" : ""}white-space:${n.lines > 1 ? "normal" : "nowrap"}">${esc}</div>`;
  }
  return "";
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const rows = [];
for (const id of ids) {
  const tree = JSON.parse(readFileSync(resolve(LAYERS, `${id}.json`), "utf8"));
  const html = `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>body{margin:0}*{box-sizing:border-box}</style></head><body><div style="position:relative;width:390px;height:844px;overflow:hidden;background:${tree.fill}">${(tree.k || []).map(draw).join("")}</div></body></html>`;
  const file = resolve(OUT, `${id}.html`);
  writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot();
  writeFileSync(resolve(OUT, `${id}.png`), buf);
  const a = PNG.sync.read(buf), b = PNG.sync.read(readFileSync(resolve(ROOT, "03-screens/exports", `${id}.png`)));
  const diff = pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0.2 });
  rows.push({ id, diffPct: +(diff / (a.width * a.height) * 100).toFixed(2) });
}
await browser.close();
writeFileSync(resolve(OUT, "_diff.json"), JSON.stringify(rows, null, 1));
for (const r of rows) console.log(`${r.id.padEnd(30)} ${String(r.diffPct).padStart(6)} % of pixels differ (threshold 0.2)`);
