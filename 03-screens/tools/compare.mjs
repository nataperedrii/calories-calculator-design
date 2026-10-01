// Before/after comparisons for the screens changed in step 11.
//   node 03-screens/tools/compare.mjs            → step 11 (before = qa/before/, out = qa/compare/)
//   node 03-screens/tools/compare.mjs step12     → step 12 (before = qa/before-step12/, out = qa/compare-step12/)
// "Before" PNGs were saved to 03-screens/qa/before/ before any change; "after" are the current exports.
// Writes 03-screens/qa/compare/<name>.png (before | after, labelled). Screens that are new in step 11
// have no "before" and are listed as after-only.
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STEP12 = process.argv[2] === "step12";
const BEFORE = resolve(HERE, STEP12 ? "qa/before-step12" : "qa/before");
const OUT = resolve(HERE, STEP12 ? "qa/compare-step12" : "qa/compare");
mkdirSync(OUT, { recursive: true });
const PAIRS = STEP12 ? [
  ["07-today-meals", "07-today-card", "Today dish card: chips + an active “View recipe” button"],
  ["13-recipes", "13-recipes", "Recipes: P, F, C in one row (full-width chip row)"],
  ["14-recipe-detail", "14-recipe-detail-method", "Dish detail: Method section (numbered steps)"],
  ["14-recipe-detail-edit", "14-recipe-detail-steps-edit", "Editing: steps with move up / down / delete"],
  ["14-recipe-detail-deleted", "14-recipe-detail-step-deleted", "Undo after deleting a step"],
  ["flows", "flows", "Flows board: new 2C row"],
] : [
  ["07-today", "07-today", "Today: grid, date button on the margin line"],
  ["07-today-before-lunch", "07-today-before-lunch", "Meals: one Add button, passive meal icons"],
  ["07-today", "07-today-meals", "Meals + dish card (scrolled): macro chips, badge"],
  ["13-recipes", "13-recipes", "Recipes: chips, aligned text, new photo"],
  ["14-recipe-detail", "14-recipe-detail", "Dish detail: new photo, ring + macro bars, editable"],
  ["14-recipe-detail-log", "14-recipe-detail-log", "Log sheet: renamed dish, new photo"],
  ["07-today-dinner-added", "07-today-dinner-added", "Dinner added: new data (462 kcal)"],
  ["flows", "flows", "Flows board"],
];
const uri = (p) => "data:image/png;base64," + readFileSync(p).toString("base64");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
for (const [b, a, title] of PAIRS) {
  const before = resolve(BEFORE, `${b}.png`);
  const after = a === "flows" ? resolve(HERE, "flows.png") : resolve(HERE, "exports", `${a}.png`);
  if (!existsSync(before) || !existsSync(after)) { console.log(`skip ${a}`); continue; }
  const w = a === "flows" ? 1600 : 390;
  await page.setContent(`<body style="margin:0;font:600 16px system-ui;background:#fbf6ee;color:#2b2118">
    <div style="padding:16px 20px">${title}</div>
    <div style="display:flex;gap:24px;padding:0 20px 20px">
      <figure style="margin:0"><figcaption style="padding-bottom:8px">Before</figcaption><img src="${uri(before)}" style="width:${w}px;display:block;border-radius:16px;box-shadow:0 0 0 1px #e9ddcb"></figure>
      <figure style="margin:0"><figcaption style="padding-bottom:8px">After</figcaption><img src="${uri(after)}" style="width:${w}px;display:block;border-radius:16px;box-shadow:0 0 0 1px #e9ddcb"></figure>
    </div></body>`);
  await page.screenshot({ path: resolve(OUT, `${a}.png`), fullPage: true });
  console.log(`✓ ${OUT.split("03-screens/")[1]}/${a}.png`);
}
await browser.close();
