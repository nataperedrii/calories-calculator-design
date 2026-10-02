// Preview images (1200 × 675 JPG) for README.md and the landing page (index.html).
// The full exports are too large to embed (design-system.png is ~59,000 px tall, flows.png ~18,000 px).
//   node tools/previews.mjs   (or: npm run previews)
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "previews");
mkdirSync(OUT, { recursive: true });
const W = 1200, H = 675;
const browser = await chromium.launch();

async function shot(file, name, { width = W, scale = 1, scrollTo } = {}) {
  const page = await browser.newPage({ viewport: { width, height: Math.round(H / scale) }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(resolve(ROOT, file)).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  if (scrollTo) await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: "start" }), scrollTo);
  await page.screenshot({ path: resolve(OUT, name), type: "jpeg", quality: 85, animations: "disabled" });
  await page.close();
  console.log(`✓ previews/${name}`);
}

// 01 Stylescape: the page scales its 3840 × 2160 canvas to the viewport width
await shot("01-branding/stylescape.html", "stylescape.jpg");
// 02 Design system: the top of the documentation page
await shot("02-design-system/index.html", "design-system.jpg", { width: 1440, scale: W / 1440 });
// 03 Flows board: Flow 1 (calories from a photo)
await shot("03-screens/flows.html", "flows.jpg", { width: 2400, scale: 0.5, scrollTo: 'section[aria-labelledby="f1"]' });

// 03 Prototype: four exported screens side by side, one per main step of the story
const screens = ["07-today", "09-photo-result", "13-recipes", "15-diary-tue"];
const imgs = screens.map((s) => `data:image/png;base64,${readFileSync(resolve(ROOT, "03-screens/exports", `${s}.png`)).toString("base64")}`);
const page = await browser.newPage({ viewport: { width: W, height: H } });
// #FBF6EE is the brand "Oat milk" background (tokens: color.oat.50), #E9DDCB a hairline
await page.setContent(`<body style="margin:0;background:#FBF6EE;display:flex;gap:20px;justify-content:center;align-items:center;height:${H}px">
  ${imgs.map((src) => `<img src="${src}" style="height:560px;border-radius:28px;box-shadow:0 0 0 1px #E9DDCB,0 12px 32px rgba(43,33,24,.12)">`).join("")}</body>`);
await page.screenshot({ path: resolve(OUT, "prototype.jpg"), type: "jpeg", quality: 85 });
console.log("✓ previews/prototype.jpg");
await browser.close();
