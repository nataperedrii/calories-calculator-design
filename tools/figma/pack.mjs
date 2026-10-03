// Figma export, step 3 (0 Figma calls): pack screens into use_figma batch scripts (≤ 50,000 characters each).
// Layout: three pages (the Starter plan allows 3 pages per design file), one row per flow, 390 × 844 frames.
// Each batch = constants + tools/figma/builder.js; the screen data is SVG-deduplicated, ASCII and LZW-packed.
// The round trip (pack → unpack → identical JSON) is checked here for every batch.
//   node tools/figma/pack.mjs   → figma-export/batches/*.js + figma-export/batches/_plan.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tokenPayload } from "./tokens.mjs";
import { deflateRawSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LAYERS = resolve(ROOT, "figma-export/layers");
const OUT = resolve(ROOT, "figma-export/batches");
mkdirSync(OUT, { recursive: true });
const NAMES = JSON.parse(readFileSync(resolve(ROOT, "figma-export/names.json"), "utf8"));
// comments and indentation are stripped in the batches (the code itself is unchanged)
const BUILDER = readFileSync(resolve(ROOT, "tools/figma/builder.js"), "utf8").split("\n")
  .filter((l) => !/^\s*\/\/(?! <\/?(tokens|inflate)>)/.test(l)).map((l) => l.replace(/\s+\/\/ [^"'`]*$/, "").trimStart()).join("\n");
// the batches without tokens leave out the tokens block of the builder
const BUILDER_NO_TOKENS = BUILDER.replace(/\/\/ <tokens>[\s\S]*?\/\/ <\/tokens>\n/, "");
if (BUILDER_NO_TOKENS === BUILDER) throw new Error("tokens markers not found in builder.js");
const LIMIT = +(process.env.LIMIT || 50000);
// resume: DONE = screens already in Figma (skipped, no trial / tokens), START = first batch number
const DONE = new Set((process.env.DONE || "").split(",").filter(Boolean)), START = +(process.env.START || 0);

// Page → rows (label, screens). Order = priority: key screens first.
export const LAYOUT = [
  ["Screens", [
    ["Flow 2 · A recipe that suits me", ["07-today", "07-today-meals", "07-today-card", "13-recipes", "14-recipe-detail", "14-recipe-detail-servings", "14-recipe-detail-log", "07-today-dinner-added"]],
    ["Flow 1B · 1C · Search and home cooking", ["10-add-food", "11-food-detail", "12-dish-calculator"]],
    ["Flow 1A · Calories from a photo", ["07-today-before-lunch", "08-scan", "09-photo-result-analyzing", "09-photo-result", "07-today-lunch-added"]],
    ["Flow 0 · Onboarding", ["01-welcome", "01-welcome-link", "02-goal", "03-about-you", "04-diet", "05-allergies", "06-target", "07-today-empty"]],
    ["Flow 3 · Profile and Diary", ["16-profile", "05-allergies-edit", "16-profile-updated", "13-recipes-filtered", "16-profile-delete", "15-diary", "15-diary-mon", "15-diary-tue", "15-diary-wed"]],
  ]],
  ["States", [
    ["Errors and limits", ["03-about-you-error", "06-target-floor"]],
    ["Edit a dish", ["14-recipe-detail-edit", "14-recipe-detail-edited", "14-recipe-detail-deleted", "14-recipe-detail-discard", "14-recipe-detail-saving", "14-recipe-detail-name-error"]],
    ["Edit the method", ["14-recipe-detail-method", "14-recipe-detail-steps-edit", "14-recipe-detail-step-error", "14-recipe-detail-step-deleted", "14-recipe-detail-no-steps"]],
  ]],
];
const GAP_X = 80, ROW = 844 + 240;

// raw DEFLATE (level 9) + base64; Figma decodes with figma.base64Decode and the inflate() in builder.js.
// One stream per batch; per-piece checksums catch any damaged character.
const pack = (str) => { if (/[^\x00-\x7f]/.test(str)) throw new Error("non-ASCII after escaping"); return deflateRawSync(Buffer.from(str, "latin1"), { level: 9 }).toString("base64"); };
const inflate = new Function("src", BUILDER.slice(BUILDER.indexOf("const inflate = (src) => {") + "const inflate = (src) => ".length, BUILDER.indexOf("// </inflate>")).trim().replace(/^\{/, "").replace(/\};?$/, ""));
const unpack = (b64) => inflate(Buffer.from(b64, "base64"));
const sum = (t) => { let h = 5381; for (let i = 0; i < t.length; i++) h = (Math.imul(h, 33) + t.charCodeAt(i)) >>> 0; return h; };
const ascii = (s) => s.replace(/[\u0080-￿]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));

// positions
const items = [];
for (const [page, rows] of LAYOUT) rows.forEach(([label, ids], r) => ids.forEach((id, i) => items.push({ page, id, label: i === 0 ? label : undefined, x: i * (390 + GAP_X), y: r * ROW })));

// greedy batching per page, in priority order; the first batch is the single-screen trial
const batches = [];
const makeScript = (page, list) => {
  const svgs = []; const idx = new Map();
  const screens = list.map((it) => {
    const tree = JSON.parse(readFileSync(resolve(LAYERS, `${it.id}.json`), "utf8"));
    (function f(n) { if (n.t === "S") { if (!idx.has(n.svg)) { idx.set(n.svg, svgs.length); svgs.push(n.svg); } n.v = idx.get(n.svg); delete n.svg; } (n.k || []).forEach(f); })(tree);
    const [nm, st] = NAMES[it.id];
    return { id: it.id, name: `${nm} / ${st}`, x: it.x, y: it.y, label: it.label, tree };
  });
  const chunks = [svgs, ...screens].map((d) => ascii(JSON.stringify(d)));
  const text = chunks.join("\n"); // JSON.stringify never emits a raw newline
  const packed = pack(text);
  if (unpack(packed) !== text) throw new Error("round trip failed");
  const head = `const IDS = ${JSON.stringify(screens.map((s) => s.id))};\nconst SUMS = ${JSON.stringify(chunks.map(sum))};\nconst PACK = "${packed.match(/.{1,1500}/g).join('" +\n"')}";\nconst PAGE = ${JSON.stringify(page)};\nconst SLOT = [0, 0];\nconst TOKENS = null;\n`;
  return { script: head + BUILDER_NO_TOKENS, raw: text.length };
};
const TOKENS = JSON.stringify(tokenPayload());
const byPage = (p) => items.filter((i) => i.page === p);
const queue = [...byPage("Screens"), ...byPage("States")];
if (!DONE.size) { const trial = queue.shift(); batches.push({ page: trial.page, list: [trial] }); }
for (let i = queue.length - 1; i >= 0; i--) if (DONE.has(queue[i].id)) queue.splice(i, 1);
let cur = null;
for (const it of queue) {
  if (cur && cur.page === it.page && makeScript(it.page, [...cur.list, it]).script.length <= LIMIT) { cur.list.push(it); continue; }
  cur = { page: it.page, list: [it] }; batches.push(cur);
}
// the design tokens ride along in the trial batch (one screen, ~34k characters free), so the first call
// also proves the variables / styles path before the large batches run
const tokenBatch = DONE.size ? -1 : 0;
// the trial frame (07-today, node 1:3) was built before the arc fix in extract.mjs: add the corrected arc next
// to the old one and hide the old one (nothing is deleted). Rides in the first batch with room for it.
const ARC = (() => { let svg = null; (function f(n) { if (n.t === "S" && n.w === 256 && n.h === 136) svg = n.svg; (n.k || []).forEach(f); })(JSON.parse(readFileSync(resolve(LAYERS, "07-today.json"), "utf8"))); return svg; })();
const FIX = `try { const f = await figma.getNodeByIdAsync("1:3"); const old = f && f.findOne((n) => n.name === "icon \u00b7 svg" && Math.round(n.width) === 256 && Math.round(n.height) === 136);
if (!old) throw new Error("old arc not found"); const nu = figma.createNodeFromSvg(${JSON.stringify(ARC)}); nu.name = "icon \u00b7 kcal arc";
old.parent.insertChild(old.parent.children.indexOf(old) + 1, nu); nu.x = old.x; nu.y = old.y; old.visible = false; old.name = "icon \u00b7 kcal arc (dashed import, hidden)"; report.fixed = [old.id, nu.id];
} catch (e) { report.errors.push("arc fix: " + e.message); }
`;
let fixBatch = -1;
const plan = batches.map((b, i) => {
  let { script, raw } = makeScript(b.page, b.list);
  if (i === tokenBatch) script = script.replace("const TOKENS = null;", `const TOKENS = ${TOKENS};`).replace(BUILDER_NO_TOKENS, BUILDER);
  if ((i > 0 || DONE.size) && fixBatch < 0 && b.page === "Screens" && script.length + FIX.length <= LIMIT) { script = script.replace(/return JSON\.stringify\(report\);\s*$/, FIX + "return JSON.stringify(report);"); fixBatch = i; }
  if (script.length > LIMIT) throw new Error(`${i}: ${script.length} characters is over the use_figma limit`);
  const file = `batch-${String(i + START).padStart(2, "0")}.js`;
  writeFileSync(resolve(OUT, file), script);
  return { file, page: b.page, screens: b.list.map((s) => s.id), tokens: i === tokenBatch, arcFix: i === fixBatch, chars: script.length, rawChars: raw };
});
writeFileSync(resolve(OUT, DONE.size ? `_plan-from-${START}.json` : "_plan.json"), JSON.stringify(plan, null, 1));
for (const p of plan) console.log(`${p.file}${p.tokens ? " +tokens" : p.arcFix ? " +arcfix" : "        "}  ${p.page.padEnd(8)} ${String(p.screens.length).padStart(2)} screens  ${String(p.chars).padStart(6)} chars (raw ${p.rawChars})  ${p.screens.join(", ")}`);
console.log(`total: ${plan.length} use_figma calls for ${plan.reduce((a, p) => a + p.screens.length, 0)} screens`);
