// Export PNGs with Playwright (Chromium).
//   npm run export:png
// 1. 02-design-system/design-system.png: full page at deviceScaleFactor 2 (square page, nothing cropped).
// 2. 01-branding/assets/logo/ripe-app-icon-1024.png (iOS / App Store) and ripe-play-icon-512.png
//    (Google Play): opaque RGB PNGs (no alpha channel), square, no pre-rounded corners.
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DS = resolve(ROOT, "02-design-system");
const LOGO = resolve(ROOT, "01-branding/assets/logo");

/** Re-encode a PNG buffer as 8-bit RGB (colour type 2): no alpha channel at all. */
function toOpaqueRGB(buf) {
  const src = PNG.sync.read(buf);
  for (let i = 3; i < src.data.length; i += 4) {
    if (src.data[i] !== 255) throw new Error("Icon has transparent pixels");
  }
  return PNG.sync.write(src, { colorType: 2, inputHasAlpha: true });
}

const browser = await chromium.launch();
try {
  // --- design-system.png ---
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(resolve(DS, "index.html")).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const out = resolve(DS, "design-system.png");
  await page.screenshot({ path: out, fullPage: true });
  const size = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
  const png = PNG.sync.read(readFileSync(out));
  console.log(`design-system.png ${png.width}×${png.height} (page ${size.w}×${size.h} CSS px @2x)`);
  await page.close();

  // --- app icons ---
  for (const [svg, file, px] of [
    ["ripe-app-icon-1024.svg", "ripe-app-icon-1024.png", 1024],
    ["ripe-app-icon-1024.svg", "ripe-play-icon-512.png", 512],
  ]) {
    const p = await browser.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
    const dataUrl = "data:image/svg+xml;base64," + readFileSync(resolve(LOGO, svg)).toString("base64");
    await p.setContent(`<!DOCTYPE html><html><body style="margin:0"><img src="${dataUrl}" width="${px}" height="${px}" style="display:block"></body></html>`);
    await p.waitForFunction(() => document.images[0].complete && document.images[0].naturalWidth > 0);
    const raw = await p.screenshot({ clip: { x: 0, y: 0, width: px, height: px } });
    const rgb = toOpaqueRGB(raw);
    writeFileSync(resolve(LOGO, file), rgb);
    console.log(`${file} ${px}×${px}, RGB (no alpha), ${(rgb.length / 1024).toFixed(0)} KB`);
    await p.close();
  }
} finally {
  await browser.close();
}
