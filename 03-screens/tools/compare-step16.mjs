// Step 16 before/after images: renders the step 15 state (a copy in a scratch folder, passed as argv[2])
// and the current files the same way, side by side. Includes views that are not separate exports:
// the Ingredients card (scrolled), the Today card (scrolled) and 320 px widths.
//   node 03-screens/tools/compare-step16.mjs <folder with the step 15 03-screens + 02-design-system + 01-branding>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BEFORE = resolve(process.argv[2]);
const OUT = resolve(ROOT, "03-screens/qa/compare-step16");
mkdirSync(OUT, { recursive: true });
const VIEWS = [
  ["10-add-food", 390, null, "Add to Snack @390: a matching photo per product, the name beside it, chips under the photo"],
  ["10-add-food", 320, null, "Add to Snack @320 (open: the chips wrap in 137 px)"],
  ["07-today-meals", 390, null, "Reference, unchanged: the Meals thumbnails on Today (the same 48 × 48 .product__thumb)"],
];
const browser = await chromium.launch();
const shot = async (root, file, width, scroll) => {
  const p = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
  await p.goto(pathToFileURL(resolve(root, "03-screens/screens", `${file}.html`)).href, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  if (scroll) await p.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: "start" }), scroll);
  const buf = await p.screenshot({ animations: "disabled" });
  await p.close();
  return "data:image/png;base64," + buf.toString("base64");
};
for (const [file, width, scroll, title] of VIEWS) {
  const [b, a] = [await shot(BEFORE, file, width, scroll), await shot(ROOT, file, width, scroll)];
  const page = await browser.newPage({ viewport: { width: width * 2 + 64, height: 900 } });
  await page.setContent(`<body style="margin:0;font:600 15px system-ui;background:#fbf6ee;color:#2b2118;padding:16px 20px">${title}
    <div style="display:flex;gap:24px;margin-top:12px"><figure style="margin:0">Before<img src="${b}" style="width:${width}px;display:block;margin-top:6px;box-shadow:0 0 0 1px #e9ddcb"></figure>
    <figure style="margin:0">After<img src="${a}" style="width:${width}px;display:block;margin-top:6px;box-shadow:0 0 0 1px #e9ddcb"></figure></div></body>`);
  const name = `${file}${scroll ? "-ingredients" : ""}@${width}.png`;
  await page.screenshot({ path: resolve(OUT, name), fullPage: true });
  await page.close();
  console.log(`✓ qa/compare-step16/${name}`);
}
await browser.close();
