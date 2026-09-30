// Ripe design system: automated verification.
//   npm run check
// Runs static validation (paths, tokens, drift, HTML, CSS, contrast) and browser checks
// (file:// vs http, CSS loaded, clipping, overflow, touch targets, component geometry,
// 200% text, axe-core, screenshots). Writes 02-design-system/qa/report.json and exits 1 on any failure.
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { HtmlValidate, FileSystemConfigLoader } from "html-validate";
import stylelint from "stylelint";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import http from "node:http";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DS = resolve(ROOT, "02-design-system");
const QA = resolve(DS, "qa");
const SECTIONS = resolve(QA, "sections");
const CROPS = resolve(QA, "crops");
for (const d of [QA, SECTIONS, CROPS]) mkdirSync(d, { recursive: true });

const results = [];
const facts = {};
function record(group, name, ok, detail = "") {
  results.push({ group, name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} [${group}] ${name}${detail ? ` — ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`);
}

// =====================================================================
// A. Static checks
// =====================================================================
const indexHtml = readFileSync(resolve(DS, "index.html"), "utf8");

// A1. paths: relative, tokens.css first, files exist next to index.html
{
  const hrefs = [...indexHtml.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]).filter((h) => !h.startsWith("http"));
  const ti = hrefs.indexOf("./tokens.css");
  const ci = hrefs.indexOf("./components.css");
  record("paths", "index.html links ./tokens.css and ./components.css", ti >= 0 && ci >= 0, hrefs.join(", "));
  record("paths", "tokens.css is linked before components.css", ti >= 0 && ti < ci);
  record("paths", "all local stylesheet links are relative and exist", hrefs.every((h) => h.startsWith("./") && existsSync(resolve(DS, h))));
  const fontStacks = readFileSync(resolve(DS, "tokens.css"), "utf8").match(/--font-family-\w+: [^;]+/g) || [];
  record("paths", "font stacks have offline fallbacks (≥ 3 families each)", fontStacks.length === 3 && fontStacks.every((s) => s.split(",").length >= 3), fontStacks.map((s) => s.split(":")[0]).join(", "));
}

// A2. tokens.json: valid JSON, W3C DTCG structure, references resolve, no cycles
{
  let tokens;
  try {
    tokens = JSON.parse(readFileSync(resolve(DS, "tokens.json"), "utf8"));
    record("tokens", "tokens.json is valid JSON", true);
  } catch (e) {
    record("tokens", "tokens.json is valid JSON", false, e.message);
  }
  if (tokens) {
    const TYPES = new Set(["color", "dimension", "fontFamily", "fontWeight", "duration", "cubicBezier", "number", "typography", "shadow", "strokeStyle", "border", "transition", "gradient"]);
    const all = new Map();
    const problems = [];
    let described = 0;
    (function walk(node, path, type) {
      if (node.$type) type = node.$type;
      if ("$value" in node) {
        all.set(path.join("."), { node, type });
        if (!type) problems.push(`${path.join(".")}: no $type (own or inherited)`);
        else if (!TYPES.has(type)) problems.push(`${path.join(".")}: unknown $type ${type}`);
        if (node.$description) described++;
        return;
      }
      for (const [k, v] of Object.entries(node)) {
        if (k.startsWith("$")) continue;
        if (typeof v !== "object" || v === null) problems.push(`${[...path, k].join(".")}: not a group or token`);
        else walk(v, [...path, k], type);
      }
    })(tokens, [], undefined);
    const isRef = (v) => typeof v === "string" && /^\{[^}]+\}$/.test(v);
    const refsIn = (v) => (isRef(v) ? [v.slice(1, -1)] : typeof v === "object" && v !== null ? Object.values(v).flatMap(refsIn) : []);
    const fmt = {
      color: (v) => /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(v),
      dimension: (v) => /^-?\d+(\.\d+)?(px|rem)$/.test(v),
      fontWeight: (v) => Number.isInteger(v) && v >= 1 && v <= 1000,
      duration: (v) => /^\d+(\.\d+)?ms$/.test(v),
      cubicBezier: (v) => Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === "number"),
      fontFamily: (v) => Array.isArray(v) || typeof v === "string",
      typography: (v) => ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing"].every((k) => k in v),
      shadow: (v) => (Array.isArray(v) ? v : [v]).every((l) => ["color", "offsetX", "offsetY", "blur", "spread"].every((k) => k in l)),
    };
    for (const [p, { node, type }] of all) {
      const v = node.$value;
      for (const r of refsIn(v)) if (!all.has(r)) problems.push(`${p}: broken reference {${r}}`);
      if (!isRef(v) && fmt[type] && !fmt[type](v)) problems.push(`${p}: value ${JSON.stringify(v)} is not a valid ${type}`);
    }
    // cycles
    const state = new Map();
    const visit = (p, stack) => {
      if (state.get(p) === 1) { problems.push(`cycle: ${[...stack, p].join(" → ")}`); return; }
      if (state.get(p) === 2 || !all.has(p)) return;
      state.set(p, 1);
      for (const r of refsIn(all.get(p).node.$value)) visit(r, [...stack, p]);
      state.set(p, 2);
    };
    for (const p of all.keys()) visit(p, []);
    record("tokens", "W3C DTCG structure: every token has $value and a known $type", !problems.some((x) => /\$type|not a group/.test(x)), `${all.size} tokens`);
    record("tokens", "all {references} resolve, no cycles", !problems.some((x) => /reference|cycle/.test(x)), problems.filter((x) => /reference|cycle/.test(x)).join("; "));
    record("tokens", "values match their $type format", !problems.some((x) => /is not a valid/.test(x)), problems.filter((x) => /is not a valid/.test(x)).join("; "));
    record("tokens", "$description coverage (optional in the spec)", true, `${described} of ${all.size} tokens described`);
    facts.tokens = { count: all.size, described };
  }
}

// A3. tokens.css matches tokens.json
try {
  const out = execFileSync("python3", ["tools/build_tokens.py", "--check"], { cwd: ROOT, encoding: "utf8" });
  record("tokens", "tokens.css matches tokens.json (no drift)", true, out.trim());
} catch (e) {
  record("tokens", "tokens.css matches tokens.json (no drift)", false, (e.stdout || e.message).trim());
}

// A4. every var(--x) used in CSS is defined
{
  const tokensCss = readFileSync(resolve(DS, "tokens.css"), "utf8");
  const files = ["components.css", "docs.css"].map((f) => readFileSync(resolve(DS, f), "utf8"));
  const defined = new Set([...[tokensCss, ...files].join("\n").matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const COMPONENT_API = new Set(["--w", "--c", "--r", "--s", "--is"]); // data values set per element via style=""
  const used = new Set([...[tokensCss, ...files].join("\n").matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  const broken = [...used].filter((v) => !defined.has(v) && !COMPONENT_API.has(v));
  record("css", "no broken var(--…) references", broken.length === 0, broken.join(", ") || `${used.size} variables used`);
  const primitivesInComponents = [...files[0].matchAll(/var\((--color-(?:oat|persimmon|avocado|honey|basil|chili|beetroot|mustard|blueberry|alpha|white)[\w-]*)\)/g)].map((m) => m[1]);
  record("css", "components.css uses semantic tokens only (no primitives)", primitivesInComponents.length === 0, primitivesInComponents.join(", "));
  const hard = files[0].replace(/\/\*[\s\S]*?\*\//g, "").match(/#[0-9a-f]{3,8}\b|\b\d+(\.\d+)?px\b|rgba?\(/gi) || [];
  record("css", "components.css has no hard-coded colours or px values", hard.length === 0, hard.join(", "));
}

// A5. stylelint
{
  const res = await stylelint.lint({ files: ["02-design-system/*.css"], cwd: ROOT });
  const warnings = res.results.flatMap((r) => r.warnings.map((w) => `${r.source.split("/").pop()}:${w.line} ${w.text}`));
  const errors = res.results.flatMap((r) => r.warnings.filter((w) => w.severity === "error"));
  record("validation", "stylelint (stylelint-config-standard): 0 errors", errors.length === 0, warnings.slice(0, 10).join(" | ") || `${res.results.length} files clean`);
  facts.stylelint = { files: res.results.length, errors: errors.length, warnings: warnings.length };
}

// A6. html-validate
{
  const hv = new HtmlValidate(new FileSystemConfigLoader());
  for (const f of ["index.html", "index.standalone.html"]) {
    const report = await hv.validateFile(resolve(DS, f));
    const msgs = report.results.flatMap((r) => r.messages);
    const errs = msgs.filter((m) => m.severity === 2);
    record("validation", `html-validate ${f}: 0 errors`, errs.length === 0, msgs.map((m) => `${m.line}:${m.column} ${m.ruleId} ${m.message}`).slice(0, 8).join(" | ") || "clean");
    facts[`htmlvalidate_${f}`] = { errors: errs.length, warnings: msgs.length - errs.length };
  }
}

// A7. WCAG contrast (text, UI, states, focus rings)
try {
  const out = execFileSync("python3", ["tools/contrast.py"], { cwd: ROOT, encoding: "utf8" });
  record("contrast", "WCAG AA for all text / UI / state / focus pairs", true, out.trim());
  facts.contrast = out.trim();
} catch (e) {
  record("contrast", "WCAG AA for all text / UI / state / focus pairs", false, (e.stdout || e.message).trim());
}

// =====================================================================
// B. Browser checks
// =====================================================================
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = resolve(ROOT, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const HTTP = `http://127.0.0.1:${server.address().port}/02-design-system/index.html`;
const FILE = pathToFileURL(resolve(DS, "index.html")).href;

const browser = await chromium.launch();

async function openPage(url, { width = 1440, dsf = 1 } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: dsf });
  const page = await context.newPage();
  const log = { console: [], failed: [] };
  page.on("console", (m) => { if (m.type() === "error") log.console.push(m.text()); });
  page.on("pageerror", (e) => log.console.push(String(e)));
  page.on("requestfailed", (r) => log.failed.push(`${r.url().slice(0, 90)} ${r.failure()?.errorText}`));
  page.on("response", (r) => { if (r.status() >= 400) log.failed.push(`${r.status()} ${r.url().slice(0, 90)}`); });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return { page, log };
}

async function cssLoaded(page) {
  return page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const btn = document.querySelector(".btn--primary");
    return {
      sheets: [...document.styleSheets].map((s) => (s.href ? s.href.split("/").pop() : `inline:${s.ownerNode?.dataset?.source || "style"}`)),
      canvas: cs.getPropertyValue("--color-bg-canvas").trim(),
      body: getComputedStyle(document.body).backgroundColor,
      btn: btn ? getComputedStyle(btn).backgroundColor : "",
      accent: (() => { const d = document.createElement("div"); d.style.background = "var(--color-bg-accent)"; document.body.append(d); const v = getComputedStyle(d).backgroundColor; d.remove(); return v; })(),
      emptyVars: ["--color-text-primary", "--space-4", "--radius-md", "--type-body", "--size-touch-min"].filter((v) => !cs.getPropertyValue(v).trim()),
      fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family).filter((v, i, a) => a.indexOf(v) === i),
    };
  });
}

const shots = {};
for (const [mode, url] of [["file", FILE], ["http", HTTP]]) {
  const { page, log } = await openPage(url);
  const css = await cssLoaded(page);
  record(`load:${mode}`, "no console errors", log.console.length === 0, log.console.slice(0, 3).join(" | "));
  record(`load:${mode}`, "no failed requests / 4xx", log.failed.length === 0, log.failed.slice(0, 3).join(" | "));
  record(`load:${mode}`, "document.styleSheets includes tokens.css and components.css (tokens first)", css.sheets.includes("tokens.css") && css.sheets.includes("components.css") && css.sheets.indexOf("tokens.css") < css.sheets.indexOf("components.css"), css.sheets.join(", "));
  record(`load:${mode}`, "token variables resolve in the browser", css.canvas.toLowerCase() === "#fbf6ee" && css.emptyVars.length === 0, `--color-bg-canvas=${css.canvas}`);
  record(`load:${mode}`, "token values applied (body = Oat milk, primary button = Persimmon)", css.body === "rgb(251, 246, 238)" && css.btn === css.accent && css.accent !== "", `${css.body} / ${css.btn} (token --color-bg-accent = ${css.accent})`);
  record(`load:${mode}`, "brand fonts loaded", ["Young Serif", "Hanken Grotesk", "Azeret Mono"].every((f) => css.fonts.includes(f)), css.fonts.join(", "));
  shots[mode] = await page.screenshot({ fullPage: true });
  await page.close();
}
{
  const a = PNG.sync.read(shots.file);
  const b = PNG.sync.read(shots.http);
  const same = a.width === b.width && a.height === b.height;
  const diff = same ? pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0 }) : -1;
  record("load", "file:// and http:// render identically (pixel diff)", same && diff === 0, same ? `${a.width}×${a.height}, ${diff} different pixels` : `size ${a.width}×${a.height} vs ${b.width}×${b.height}`);
}

// ---------- geometry audits (run in page) ----------
const AUDIT = () => {
  const out = { clipped: [], overflowing: [], targets: [], docTargets: [] };
  const px = (v) => parseFloat(v) || 0;
  const label = (e) => {
    const sec = e.closest("section[id], h2[id]")?.id || e.closest("[id]")?.id || "page";
    const cls = typeof e.className === "string" ? e.className.split(" ").slice(0, 3).join(".") : e.tagName.toLowerCase();
    return `#${sec} ${e.tagName.toLowerCase()}.${cls}${e.textContent ? ` "${e.textContent.trim().slice(0, 24)}"` : ""}`;
  };
  // visual extent: border box + outline + non-inset, blur-free box-shadow spread (focus rings)
  const extent = (e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    let grow = 0;
    if (cs.outlineStyle !== "none" && px(cs.outlineWidth) > 0) grow = Math.max(grow, px(cs.outlineWidth) + px(cs.outlineOffset));
    for (const layer of (cs.boxShadow === "none" ? "" : cs.boxShadow).split(/,(?![^(]*\))/)) {
      if (/inset/.test(layer)) continue;
      const nums = (layer.replace(/rgba?\([^)]*\)/, "").match(/-?[\d.]+px/g) || []).map(px);
      if (nums.length >= 4 && nums[0] === 0 && nums[1] === 0 && nums[2] === 0) grow = Math.max(grow, nums[3]); // ring = spread only
    }
    return { l: r.left - grow, t: r.top - grow, r: r.right + grow, b: r.bottom + grow, w: r.width, h: r.height };
  };
  // 1. clipping: overflow other than visible must not hide content (sr-only is intentional)
  for (const e of document.querySelectorAll("body *")) {
    if (e.closest("svg") && e.tagName.toLowerCase() !== "svg") continue;
    const cs = getComputedStyle(e);
    if (cs.overflowX === "visible" && cs.overflowY === "visible") continue;
    if (e.classList.contains("visually-hidden") || e.closest(".visually-hidden")) continue;
    const scrolls = /auto|scroll/.test(cs.overflowX + cs.overflowY);
    if ((e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) && !scrolls) out.clipped.push(`${label(e)} overflow:${cs.overflow} scroll ${e.scrollWidth}×${e.scrollHeight} > client ${e.clientWidth}×${e.clientHeight}`);
  }
  // 2. children (incl. focus rings / outlines) must stay inside their parent, inside every component stage
  for (const stage of document.querySelectorAll(".state__stage")) {
    for (const e of stage.querySelectorAll("*")) {
      if (e.closest("svg") && e.tagName.toLowerCase() !== "svg") continue;
      if (e.closest(".visually-hidden")) continue;
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.display === "contents") continue;
      const p = e.parentElement;
      if (cs.display === "inline" && getComputedStyle(p).display === "inline") continue; // inline text runs (e.g. <code> in a sentence)
      const x = extent(e);
      const pr = p.getBoundingClientRect();
      const tol = 0.5;
      if (x.l < pr.left - tol || x.t < pr.top - tol || x.r > pr.right + tol || x.b > pr.bottom + tol) {
        out.overflowing.push(`${label(e)} exceeds ${label(p)} by L${(pr.left - x.l).toFixed(1)} T${(pr.top - x.t).toFixed(1)} R${(x.r - pr.right).toFixed(1)} B${(x.b - pr.bottom).toFixed(1)}`);
      }
    }
  }
  // 2b. content protruding from a box that does not clip (text wider than its element)
  for (const stage of document.querySelectorAll(".state__stage")) {
    for (const e of stage.querySelectorAll("*")) {
      if (e.closest("svg") || /^(INPUT|TEXTAREA|svg)$/i.test(e.tagName) || e.closest(".visually-hidden")) continue;
      const cs = getComputedStyle(e);
      if (cs.display === "inline" || cs.display === "none") continue;
      if (e.scrollWidth > e.clientWidth + 1 && cs.overflowX === "visible") out.clipped.push(`${label(e)} content ${e.scrollWidth}px wider than its box ${e.clientWidth}px`);
    }
  }
  // 3. touch targets: every interactive control in a component stage ≥ 44×44 (48×48 inside data-platform="android")
  const hit = (e) => {
    const b = e.getBoundingClientRect();
    const r = { top: b.top, left: b.left, bottom: b.top + e.offsetHeight, right: b.left + e.offsetWidth }; // untransformed layout size
    let { top, bottom, left, right } = r;
    for (const pseudo of ["::before", "::after"]) {
      const ps = getComputedStyle(e, pseudo);
      if (ps.content === "none" || ps.position !== "absolute" || ps.pointerEvents === "none") continue;
      top = Math.min(top, r.top + px(ps.top));
      bottom = Math.max(bottom, r.bottom - px(ps.bottom));
      left = Math.min(left, r.left + px(ps.left));
      right = Math.max(right, r.right - px(ps.right));
    }
    return { w: right - left, h: bottom - top };
  };
  const controls = document.querySelectorAll(".state__stage :is(button, a[href], input:not([type=radio]):not([type=hidden]), label.segmented__opt, [role=button], select, textarea)");
  for (const c of controls) {
    const target = c.closest("label") || c; // a wrapping <label> is the hit region for its input
    const min = c.closest('[data-platform="android"]') ? 48 : 44;
    const { w, h } = hit(target);
    out.targets.push({ el: label(target), w: +w.toFixed(1), h: +h.toFixed(1), min, ok: w >= min - 0.01 && h >= min - 0.01 });
  }
  // docs chrome links: WCAG 2.5.8 target size (minimum) 24×24
  for (const a of document.querySelectorAll(".doc-nav a")) {
    const r = a.getBoundingClientRect();
    out.docTargets.push({ el: a.textContent, w: r.width, h: r.height, ok: r.height >= 24 && r.width >= 24 });
  }
  return out;
};

const COMPONENTS = () => {
  const r2 = (r) => ({ x: +r.left.toFixed(2), y: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) });
  const res = {};
  // segmented focus ring: 2 px gap + 2 px ring outside the segment, inside the track, not touching neighbours
  res.segmented = [...document.querySelectorAll(".segmented__opt.is-focus")].map((opt) => {
    const track = opt.closest(".segmented").getBoundingClientRect();
    const r = opt.getBoundingClientRect();
    const ring = { l: r.left - 4, t: r.top - 4, r: r.right + 4, b: r.bottom + 4 };
    const sibs = [...opt.parentElement.querySelectorAll(".segmented__opt")].filter((s) => s !== opt).map((s) => s.getBoundingClientRect());
    const overlap = sibs.some((s) => ring.l < s.right - 0.01 && ring.r > s.left + 0.01 && ring.t < s.bottom - 0.01 && ring.b > s.top + 0.01);
    const gapToNeighbour = Math.min(...sibs.map((s) => Math.max(s.left - ring.r, ring.l - s.right)));
    const shadow = getComputedStyle(opt).boxShadow;
    return {
      insideTrack: ring.l >= track.left - 0.01 && ring.t >= track.top - 0.01 && ring.r <= track.right + 0.01 && ring.b <= track.bottom + 0.01,
      overlapsNeighbour: overlap,
      clearanceToNeighbour: +gapToNeighbour.toFixed(2),
      ringColour: /rgb\(43, 33, 24\)/.test(shadow),
      gapColour: /rgb\(255, 252, 246\)/.test(shadow),
      segment: r2(r),
      platform: opt.closest("[data-platform]") ? "android" : "ios",
    };
  });
  // product rows: identical geometry in every state. Clone ONE row into every state so content is identical,
  // then compare (the docs rows have different foods, so their heights may differ at 200% text).
  {
    const list = document.querySelector("#c7 .list");
    const src = list.querySelector(".product");
    const probe = document.createElement("div");
    probe.className = "list";
    probe.style.cssText = `width:${list.getBoundingClientRect().width}px`;
    list.after(probe);
    const states = ["", "is-pressed", "is-selected", "is-disabled", "is-error", "is-focus"];
    res.productRows = states.map((st) => {
      const row = src.cloneNode(true);
      if (st) row.classList.add(st);
      probe.append(row);
      const cs = getComputedStyle(row);
      return { state: st || "default", ...r2(row.getBoundingClientRect()), radius: cs.borderRadius, padding: cs.padding, border: cs.borderTopWidth + "/" + cs.borderRightWidth + "/" + cs.borderBottomWidth + "/" + cs.borderLeftWidth, ring: cs.boxShadow };
    });
    probe.remove();
  }
  // recipe cards: no clipping, text fully inside
  res.recipes = [...document.querySelectorAll("#c8 .recipe-card")].map((card) => {
    const title = card.querySelector(".recipe-card__title");
    const cr = card.getBoundingClientRect();
    const tr = title.getBoundingClientRect();
    const lastText = [...card.querySelectorAll(".recipe-card__body > *")].pop().getBoundingClientRect();
    return {
      state: [...card.classList].find((c) => c.startsWith("is-")) || "default",
      overflow: getComputedStyle(card).overflow,
      height: getComputedStyle(card).height,
      titleInside: tr.bottom <= cr.bottom + 0.5 && tr.right <= cr.right + 0.5,
      contentInside: lastText.bottom <= cr.bottom + 0.5,
      titleLines: Math.round(tr.height / parseFloat(getComputedStyle(title).lineHeight || 28)),
      ...r2(cr),
    };
  });
  // tab bars: tabs, pressed pills, focus rings and the Scan pill inside the bar
  res.tabBars = [...document.querySelectorAll("#c12 .tab-bar")].map((bar) => {
    const br = bar.getBoundingClientRect();
    const cs = getComputedStyle(bar);
    const contentBottom = br.bottom - parseFloat(cs.paddingBottom); // bottom of the bar content area (above the safe area)
    const tabs = [...bar.querySelectorAll(".tab")].map((t) => {
      const r = t.getBoundingClientRect();
      const ps = getComputedStyle(t, "::before");
      const pill = ps.display === "none" ? null : { l: r.left + parseFloat(ps.left), r: r.right - parseFloat(ps.right), t: r.top + parseFloat(ps.top), b: r.bottom - parseFloat(ps.bottom) };
      const fab = t.querySelector(".tab__fab")?.getBoundingClientRect();
      const fabRing = fab && /rgb\(43, 33, 24\)/.test(getComputedStyle(t.querySelector(".tab__fab")).boxShadow) ? { l: fab.left - 4, r: fab.right + 4, t: fab.top - 4, b: fab.bottom + 4 } : null;
      const within = (a, b) => a.l >= b.left - 0.01 && a.r <= b.right + 0.01 && a.t >= b.top - 0.01 && a.b <= b.bottom + 0.01;
      return {
        tab: t.textContent.trim() || t.getAttribute("aria-label"),
        h: +r.height.toFixed(2),
        insideBar: r.top >= br.top + 0.5 && r.bottom <= contentBottom + 0.01 && r.left >= br.left && r.right <= br.right,
        topGap: +(r.top - br.top).toFixed(2),
        pillInsideTab: pill ? within(pill, r) : true,
        fabRingInsideTab: fabRing ? within(fabRing, r) : true,
        focusInset: /inset/.test(getComputedStyle(t).boxShadow) || !t.classList.contains("is-focus") || t.classList.contains("tab--scan"),
      };
    });
    return { platform: bar.closest("[data-platform]") ? "android" : "ios", bar: { h: +br.height.toFixed(2), paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom }, tabs };
  });
  // bottom sheet macro tiles
  {
    const sheet = document.querySelector("#c13 .sheet");
    const scs = getComputedStyle(sheet);
    const sr = sheet.getBoundingClientRect();
    const content = { l: sr.left + parseFloat(scs.paddingLeft), r: sr.right - parseFloat(scs.paddingRight) };
    const tiles = [...sheet.querySelectorAll(".macro-tile")];
    const rects = tiles.map((t) => t.getBoundingClientRect());
    const vals = tiles.map((t) => t.querySelector(".macro-tile__value"));
    const labels = tiles.map((t) => t.querySelector(".macro-tile__label"));
    // baseline of the first line of text = top of the line box + ascent (same font + size → same offset)
    const baseline = (el) => { const range = document.createRange(); range.selectNodeContents(el.firstChild); return range.getClientRects()[0].bottom; }; // first line box
    const rows = [...new Set(rects.map((r) => Math.round(r.top)))];
    res.macroTiles = {
      tiles: tiles.map((t, i) => ({ tile: t.querySelector(".macro-tile__label").textContent, ...r2(rects[i]), padding: getComputedStyle(t).padding })),
      rows: rows.length,
      gaps: rows.length === 1 ? rects.slice(1).map((r, i) => +(r.left - rects[i].right).toFixed(2)) : rects.slice(1).map((r, i) => +(r.top - rects[i].bottom).toFixed(2)),
      equalWidths: Math.max(...rects.map((r) => r.width)) - Math.min(...rects.map((r) => r.width)) < 0.5,
      equalHeights: Math.max(...rects.map((r) => r.height)) - Math.min(...rects.map((r) => r.height)) < 0.5,
      sameTop: rows.length === 1 || rows.length === rects.length,
      equalPadding: new Set(tiles.map((t) => getComputedStyle(t).padding)).size === 1,
      valueBaselines: vals.map((v) => +baseline(v).toFixed(2)),
      labelBaselines: labels.map((v) => +baseline(v).toFixed(2)),
      valueOffsets: vals.map((v, i) => +(baseline(v) - rects[i].top).toFixed(2)),
      tabular: vals.every((v) => getComputedStyle(v).fontVariantNumeric.includes("tabular-nums")),
      insideSheetMargins: rects.every((r) => r.left >= content.l - 0.01 && r.right <= content.r + 0.01),
      sheetContent: { left: +content.l.toFixed(2), right: +content.r.toFixed(2) },
    };
  }
  // page chrome: square, unclipped page
  res.page = ["html", "body", ".doc", ".doc-main"].map((s) => { const e = document.querySelector(s); const cs = getComputedStyle(e); return { s, radius: cs.borderRadius, overflow: cs.overflow }; });
  return res;
};

async function geometry(page, tag) {
  const a = await page.evaluate(AUDIT);
  record(`geometry${tag}`, "no clipped content (overflow hides nothing)", a.clipped.length === 0, a.clipped.slice(0, 6).join(" | ") || "0 clipped");
  record(`geometry${tag}`, "no element (incl. focus ring) extends beyond its parent in any component stage", a.overflowing.length === 0, a.overflowing.slice(0, 6).join(" | ") || "0 overflowing");
  const bad = a.targets.filter((t) => !t.ok);
  record(`geometry${tag}`, "touch targets ≥ 44×44 pt (≥ 48×48 dp in Android variants)", bad.length === 0, bad.slice(0, 6).map((t) => `${t.el} ${t.w}×${t.h} < ${t.min}`).join(" | ") || `${a.targets.length} controls, smallest ${Math.min(...a.targets.map((t) => Math.min(t.w, t.h)))} px`);
  const badDoc = a.docTargets.filter((t) => !t.ok);
  record(`geometry${tag}`, "docs navigation links ≥ 24×24 (WCAG 2.5.8)", badDoc.length === 0, badDoc.map((t) => `${t.el} ${t.w}×${t.h}`).join(" | ") || `${a.docTargets.length} links`);
  return a;
}

async function componentChecks(page, tag) {
  const c = await page.evaluate(COMPONENTS);
  const seg = c.segmented;
  record(`segmented${tag}`, "focus ring has a gap, 3:1 colours, stays inside the track, never overlaps a neighbour", seg.length > 0 && seg.every((s) => s.insideTrack && !s.overlapsNeighbour && s.ringColour && s.gapColour), seg.map((s) => `${s.platform}: inside=${s.insideTrack} overlap=${s.overlapsNeighbour} clearance=${s.clearanceToNeighbour}px`).join(" | "));
  const rows = c.productRows;
  const h0 = rows[0].h;
  record(`product${tag}`, "every row state has identical geometry (height, width, radius, padding, no border)", rows.every((r) => Math.abs(r.h - h0) < 0.5 && Math.abs(r.w - rows[0].w) < 0.5 && r.radius === rows[0].radius && r.padding === rows[0].padding && r.border === "0px/0px/0px/0px"), rows.map((r) => `${r.state} ${r.w}×${r.h} r=${r.radius}`).join(" | "));
  record(`product${tag}`, "state outlines are equal-width inset rings", rows.filter((r) => /selected|error|focus/.test(r.state)).every((r) => /0px 0px 0px 2px inset/.test(r.ring)), rows.filter((r) => r.ring !== "none").map((r) => `${r.state}: ${r.ring}`).join(" | "));
  record(`recipe${tag}`, "cards have no fixed height or clipping; titles and text are fully inside", c.recipes.every((r) => r.overflow === "visible" && r.titleInside && r.contentInside), c.recipes.map((r) => `${r.state}: ${r.w}×${r.h}, title ${r.titleLines} lines, overflow ${r.overflow}`).join(" | "));
  const tb = c.tabBars;
  record(`tabbar${tag}`, "tabs, pressed pills and focus rings stay inside the bar; tabs ≥ 44 / 48", tb.every((b) => b.tabs.every((t) => t.insideBar && t.pillInsideTab && t.fabRingInsideTab && t.focusInset && t.h >= (b.platform === "android" ? 48 : 44) - 0.01)), tb.map((b) => `${b.platform} bar ${b.bar.h}px pad ${b.bar.paddingTop}/${b.bar.paddingBottom}; tabs ${b.tabs.map((t) => `${t.h}`).join(",")}; top gap ${b.tabs[0].topGap}`).join(" | "));
  const mt = c.macroTiles;
  const sameBase = (arr) => Math.max(...arr) - Math.min(...arr) < 0.5;
  const baselinesOk = mt.rows === 1 ? sameBase(mt.valueBaselines) && sameBase(mt.labelBaselines) : sameBase(mt.valueOffsets); // one row: shared baselines; stacked: same offset in every tile
  record(`sheet${tag}`, "macro tiles: equal width/height/padding/gaps, shared baselines, tabular numbers, inside sheet margins", mt.equalWidths && mt.equalHeights && mt.sameTop && mt.equalPadding && baselinesOk && mt.tabular && mt.insideSheetMargins && Math.abs(mt.gaps[0] - mt.gaps[1]) < 0.5, `${mt.rows} row(s) · ` + mt.tiles.map((t) => `${t.tile} x${t.x} w${t.w} h${t.h}`).join(" | ") + ` · gaps ${mt.gaps.join("/")} · value baselines ${mt.valueBaselines.join("/")}`);
  record(`page${tag}`, "page wrapper is square and unclipped (html, body, .doc, .doc-main)", c.page.every((p) => p.radius === "0px" && p.overflow === "visible"), c.page.map((p) => `${p.s} r=${p.radius} ${p.overflow}`).join(" | "));
  return c;
}

const { page } = await openPage(HTTP);
facts.geometry100 = await geometry(page, "");
facts.components100 = await componentChecks(page, "");

// real keyboard focus on a segmented radio → :focus-visible ring
{
  await page.locator('#c5 input[name="unit-1"][value="ml"]').focus();
  const real = await page.evaluate(() => {
    const opt = document.querySelector('#c5 input[name="unit-1"][value="ml"]').closest(".segmented__opt");
    return { visible: document.querySelector('#c5 input[name="unit-1"][value="ml"]').matches(":focus-visible"), shadow: getComputedStyle(opt).boxShadow };
  });
  record("segmented", "real keyboard focus (:focus-visible on the radio) draws the same ring", real.visible && /rgb\(43, 33, 24\)/.test(real.shadow), real.shadow);
  await page.evaluate(() => document.activeElement.blur());
}

// axe-core
{
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  record("a11y", "axe-core: 0 serious / critical violations", serious.length === 0, serious.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target}`).join(" | ") || `${axe.passes.length} rules passed`);
  const minor = axe.violations.filter((v) => !["serious", "critical"].includes(v.impact));
  record("a11y", "axe-core: moderate / minor findings (reported, not blocking)", true, minor.map((v) => `${v.id} [${v.impact}] ×${v.nodes.length}`).join(" | ") || "none");
  facts.axe = { passes: axe.passes.length, violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), incomplete: axe.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })) };
}

// section screenshots at 100%
for (const id of await page.evaluate(() => [...document.querySelectorAll("main [id]")].map((e) => e.id))) {
  const el = page.locator(`#${id}`).first();
  if (await el.evaluate((e) => e.tagName === "H2")) continue;
  await el.screenshot({ path: resolve(SECTIONS, `${id}.png`) });
}
record("screenshots", "section screenshots at 100%", true, "qa/sections/*.png");

// 200% text size (Dynamic Type / Android font scale)
await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
await page.waitForTimeout(150);
facts.geometry200 = await geometry(page, "@200%");
facts.components200 = await componentChecks(page, "@200%");
for (const [sel, name] of [["#c8 .states", "recipe-cards@200"], ["#c7 .list", "product-list@200"], ["#c12 .states", "tab-bars@200"], ["#c13 .frame", "sheet@200"]]) {
  await page.locator(sel).first().screenshot({ path: resolve(CROPS, `${name}.png`) });
}
await page.close();

// zoomed crops at 3× of the fixed problem areas
{
  const { page: z } = await openPage(HTTP, { dsf: 3 });
  const crops = [
    ["#c5 .state:nth-child(3) .state__stage", "segmented-focus"],
    ["#c5 [data-platform] .state__stage", "segmented-focus-android"],
    ["#c7 .list", "product-list-states"],
    ["#c8 .state:nth-child(3)", "recipe-disabled"],
    ["#c12 .state:nth-child(2) .state__stage", "tabbar-pressed-focus"],
    ["#c12 .state:nth-child(3) .state__stage", "tabbar-scan-focus"],
    ["#c12 [data-platform] .state__stage", "tabbar-android"],
    ["#c13 .macro-tiles", "sheet-macro-tiles"],
    ["#c13 .frame", "sheet"],
  ];
  for (const [sel, name] of crops) await z.locator(sel).first().screenshot({ path: resolve(CROPS, `${name}@3x.png`) });
  record("screenshots", "zoomed crops (3×) of every fixed area", true, `${crops.length} crops in qa/crops/`);
  await z.close();
}

// =====================================================================
// C. Standalone page (copied alone into an empty folder)
// =====================================================================
{
  const dir = join(tmpdir(), `ripe-standalone-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  copyFileSync(resolve(DS, "index.standalone.html"), join(dir, "index.html"));
  const { page: s, log } = await openPage(pathToFileURL(join(dir, "index.html")).href);
  const info = await s.evaluate(() => ({
    h: document.documentElement.scrollHeight,
    images: [...document.images].every((i) => i.complete && i.naturalWidth > 0),
    bg: getComputedStyle(document.querySelector(".recipe-card__img--breakfast")).backgroundImage.startsWith('url("data:'),
    canvas: getComputedStyle(document.documentElement).getPropertyValue("--color-bg-canvas").trim(),
    btn: getComputedStyle(document.querySelector(".btn--primary")).backgroundColor,
    accent: (() => { const d = document.createElement("div"); d.style.background = "var(--color-bg-accent)"; document.body.append(d); const v = getComputedStyle(d).backgroundColor; d.remove(); return v; })(),
  }));
  const main = PNG.sync.read(shots.http);
  record("standalone", "renders alone: no failed requests, styles + images inlined", log.failed.length === 0 && log.console.length === 0 && info.images && info.bg && info.canvas.toLowerCase() === "#fbf6ee" && info.btn === info.accent, log.failed.concat(log.console).slice(0, 3).join(" | ") || `tokens ok, images ok`);
  record("standalone", "same layout as index.html (page height)", Math.abs(info.h - main.height) <= 1, `${info.h} vs ${main.height} CSS px`);
  await s.close();
  rmSync(dir, { recursive: true, force: true });
}

await browser.close();
server.close();

// =====================================================================
// D. design-system.png: 2×, full page, square corners
// =====================================================================
{
  const png = PNG.sync.read(readFileSync(resolve(DS, "design-system.png")));
  const main = PNG.sync.read(shots.http);
  const px = (x, y) => { const i = (y * png.width + x) * 4; return png.data.slice(i, i + 3).join(","); };
  const corners = [px(0, 0), px(png.width - 1, 0), px(0, png.height - 1), px(png.width - 1, png.height - 1)];
  record("export", "design-system.png is 2× the full page", png.width === main.width * 2 && Math.abs(png.height - main.height * 2) <= 2, `${png.width}×${png.height} (page ${main.width}×${main.height})`);
  record("export", "design-system.png corners are the page background (nothing cropped or rounded)", corners.every((c) => c === "251,246,238"), corners.join(" | "));
}

// =====================================================================
// report
// =====================================================================
const failed = results.filter((r) => !r.ok);
writeFileSync(resolve(QA, "report.json"), JSON.stringify({ date: new Date().toISOString(), passed: results.length - failed.length, failed: failed.length, results, facts }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `, ${failed.length} FAILED` : ""}. Report: 02-design-system/qa/report.json`);
process.exit(failed.length ? 1 : 0);
