// Ripe design system: WCAG 2.2 accessibility audit.
//   npm run check:a11y            → writes 02-design-system/a11y/audit-after.{json,md}
//   node 02-design-system/tools/a11y.mjs before   → audit-before.{json,md}
//
// Tier 1 = WCAG 2.2 A + AA (blocking). Tier 2 = AAA for the closed list of critical elements (blocking).
// Tier 3 = other AAA (information). Exit code 1 if any Tier 1 or Tier 2 finding fails.
//
// Checks: axe-core (wcag2a/aa, 21a/aa, 22aa, best-practice) · pa11y WCAG2AA (htmlcs) · computed-style contrast
// for every text node (alpha composited, worst case) · non-text contrast · axe wcag2aaa on critical elements ·
// targets + spacing · keyboard traversal (focus visible / not obscured / order, Shift+Tab, radios, dialog trap, Esc) ·
// reflow 320 px · 200 % text · text-spacing overrides · reduced motion · prefers-contrast · forced colours · checklist.
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import pa11y from "pa11y";
import http from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const LABEL = process.argv[2] || "after";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DS = resolve(ROOT, "02-design-system");
const OUT = resolve(DS, "a11y");
const SHOTS = resolve(OUT, LABEL);
rmSync(SHOTS, { recursive: true, force: true });
for (const d of [OUT, SHOTS, resolve(SHOTS, "focus")]) mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Critical elements (Tier 2, closed list from the brief). Matched with Element.closest().
// ---------------------------------------------------------------------------
const CRITICAL = [
  // calorie and macro numbers and labels, ring text, P/F/C, macro bars, facts table
  ".nutri", ".macros", ".macro", ".macro-tiles", ".macro-tile", ".facts", ".product__kcal", ".recipe-card__kcal",
  ".stepper__value", ".stepper", ".badge--p", ".badge--f", ".badge--c", ".field__suffix", ".t-num-xl", ".t-num-l", ".t-num-m",
  // body text and headings, input text and labels, error messages
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", ".doc-lead", ".t-body", "input", "label", ".field__label",
  ".field.is-error .field__help", ".search__help", ".stepper-help", ".product.is-error .product__meta", "[role=alert]", ".doc-note-error",
  // primary CTA, tab bar, top app bar
  ".btn--primary", ".tab-bar", ".tab", ".app-bar",
  // irreversible actions
  ".btn--destructive", ".confirm",
];
// Secondary text (hints, captions, placeholder, metadata): regular 4.5:1 even inside a critical container
const SECONDARY = ["figcaption", ".t-caption", ".field__help", ".product__meta", ".recipe-card__meta", ".sw small", ".sw code", ".type-row .meta", ".type-row .use", ".tile", ".doc-nav p", ".facts__source", ".sheet__sub", ".empty__text", ".confidence", ".badge"];
const ERRORS = [".field.is-error .field__help", ".search__help", ".stepper-help", ".product.is-error .product__meta", "[role=alert]"];

const findings = [];
let fid = 0;
function add(f) {
  const item = { id: `A${String(++fid).padStart(3, "0")}`, status: "fail", ...f };
  findings.push(item);
  return item;
}

// ---------------------------------------------------------------------------
// server + browser
// ---------------------------------------------------------------------------
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = resolve(ROOT, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const URL_ = `http://127.0.0.1:${server.address().port}/02-design-system/index.html`;
const browser = await chromium.launch();

async function open({ width = 1440, height = 900, dsf = 1, media = {} } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, ...media });
  const page = await ctx.newPage();
  await page.goto(URL_, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400); // let entrance animations finish
  return { ctx, page };
}

// shared in-page helpers (injected as a string)
const HELPERS = `
window.__a11y = (() => {
  const CRITICAL = ${JSON.stringify(CRITICAL)};
  const SECONDARY = ${JSON.stringify(SECONDARY)};
  const ERRORS = ${JSON.stringify(ERRORS)};
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
  const over = (top, base) => ({ r: top.r * top.a + base.r * (1 - top.a), g: top.g * top.a + base.g * (1 - top.a), b: top.b * top.a + base.b * (1 - top.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  // background under an element: composite ancestor backgrounds until opaque. Gradients: every stop is a candidate (worst case).
  function background(el) {
    const layers = []; let image = null;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const stops = [...cs.backgroundImage.matchAll(/rgba?\\([^)]+\\)/g)].map((m) => parse(m[0]));
        if (/url\\(/.test(cs.backgroundImage) && !image) image = e;
        if (stops.length) { layers.push({ gradient: stops }); }
      }
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) { layers.push({ color: bg }); if (bg.a >= 1) break; }
    }
    let candidates = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (const l of layers.reverse()) {
      if (l.color) candidates = candidates.map((c) => over(l.color, c));
      else candidates = candidates.flatMap((c) => l.gradient.map((s) => over(s, c)));
    }
    return { candidates, image };
  }
  const isHidden = (e) => { const cs = getComputedStyle(e); return cs.visibility === 'hidden' || cs.display === 'none' || e.closest('.visually-hidden,[hidden]') || e.getClientRects().length === 0; };
  const isDisabled = (e) => !!e.closest(':disabled, [aria-disabled=true], .is-disabled, fieldset:disabled') || (e.tagName === 'LABEL' && e.querySelector('input:disabled')) || !!e.closest('label')?.querySelector('input:disabled');
  const critical = (e) => { if (ERRORS.some((s) => e.closest(s))) return true; if (SECONDARY.some((s) => e.closest(s))) return false; return CRITICAL.some((s) => e.closest(s)); };
  const label = (e) => { const sec = e.closest('section[id]')?.id || e.closest('[id]')?.id || 'page'; const cls = (typeof e.className === 'string' ? e.className : '').trim().split(/\\s+/).slice(0, 3).join('.'); return '#' + sec + ' ' + e.tagName.toLowerCase() + (cls ? '.' + cls : ''); };
  const stateOf = (e) => { const s = e.closest('.is-pressed,.is-focus,.is-selected,.is-error,.is-disabled,.is-active,.is-over,[aria-current],:disabled,[aria-invalid=true],.nutri--over'); if (!s) return 'default'; return (s.className.match(/is-[a-z]+|nutri--over/) || [s.matches(':disabled') ? 'disabled' : s.hasAttribute('aria-current') ? 'active' : 'error'])[0].replace('is-', ''); };
  return { parse, over, ratio, hex, background, isHidden, isDisabled, critical, label, stateOf, lum };
})();`;

// ===========================================================================
// 1. axe-core AA + best practice (Tier 1)
// ===========================================================================
const { ctx, page } = await open();
await page.addScriptTag({ content: HELPERS });
{
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
  for (const v of r.violations) for (const n of v.nodes) add({ source: "axe", criterion: v.tags.find((t) => /^wcag\d{3,4}$/.test(t))?.replace(/wcag(\d)(\d)(\d+)/, "$1.$2.$3") || "best-practice", rule: v.id, tier: 1, element: n.target.join(" "), state: "", measured: n.failureSummary?.split("\n")[1]?.trim() || v.help, required: v.help, impact: v.impact });
  add({ source: "axe", criterion: "all A/AA", rule: "summary", tier: 1, status: r.violations.length ? "fail" : "pass", element: "whole page", measured: `${r.violations.reduce((s, v) => s + v.nodes.length, 0)} violating nodes in ${r.violations.length} rules; ${r.passes.length} rules pass; ${r.incomplete.length} incomplete`, required: "0 violations" });
  var axeIncomplete = r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target.join(" ")) }));
}

// ===========================================================================
// 2. pa11y WCAG2AA (htmlcs) (Tier 1)
// ===========================================================================
{
  const r = await pa11y(URL_, { standard: "WCAG2AA", runners: ["htmlcs"], timeout: 180000, chromeLaunchConfig: { executablePath: chromium.executablePath(), args: ["--no-sandbox"] } });
  const errors = r.issues.filter((i) => i.type === "error");
  for (const i of errors) add({ source: "pa11y", criterion: (i.code.match(/(\d)_(\d)_(\d+)/) || []).slice(1).join(".") || i.code, rule: i.code.split(".").slice(-2).join("."), tier: 1, element: i.selector, measured: i.message.slice(0, 160), required: "WCAG2AA (htmlcs)" });
  add({ source: "pa11y", criterion: "all AA", rule: "summary", tier: 1, status: errors.length ? "fail" : "pass", element: "whole page", measured: `${errors.length} errors, ${r.issues.length - errors.length} warnings/notices`, required: "0 errors" });
}

// ===========================================================================
// 3. Custom contrast: every text node, computed styles, alpha composited, worst case (Tier 1 / Tier 2)
// ===========================================================================
const textPairs = await page.evaluate(() => {
  const A = window.__a11y;
  const out = [];
  const els = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) { const t = walker.currentNode; if (t.textContent.trim() && t.parentElement && !t.parentElement.closest("svg,script,style,title")) els.add(t.parentElement); }
  for (const e of document.querySelectorAll("input")) els.add(e);
  for (const e of els) {
    if (A.isHidden(e)) continue;
    const cs = getComputedStyle(e);
    const bgInfo = A.background(e);
    const variants = [{ kind: "text", color: cs.color, text: e.tagName === "INPUT" ? e.value : [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim() }];
    if (e.tagName === "INPUT" && e.placeholder && !e.value) variants[0] = { kind: "placeholder", color: getComputedStyle(e, "::placeholder").color, text: e.placeholder };
    for (const v of variants) {
      if (!v.text) continue;
      const fg = A.parse(v.color);
      let worst = Infinity, worstBg = null;
      for (const b of bgInfo.candidates) { const c = fg.a < 1 ? A.over(fg, b) : fg; const r = A.ratio(c, b); if (r < worst) { worst = r; worstBg = b; } }
      const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10);
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const critical = v.kind === "placeholder" ? false : A.critical(e);
      const disabled = A.isDisabled(e);
      out.push({ el: A.label(e), text: v.text.slice(0, 40), kind: v.kind, fg: A.hex(fg), bg: A.hex(worstBg), overImage: !!bgInfo.image, ratio: +worst.toFixed(2), size, weight, large, critical, disabled, state: A.stateOf(e) });
    }
  }
  return out;
});
{
  const groups = new Map();
  for (const p of textPairs) {
    const aa = p.large ? 3 : 4.5;
    const aaa = p.large ? 4.5 : 7;
    const key = `${p.fg}|${p.bg}|${p.critical}|${p.large}|${p.disabled}`;
    const g = groups.get(key) || { ...p, nodes: 0, examples: [] };
    g.nodes++; if (g.examples.length < 3) g.examples.push(`${p.el} "${p.text}"`);
    groups.set(key, g);
    if (p.disabled) continue; // judged below as a group (exempt, target 4.5)
    if (p.ratio < aa) add({ source: "contrast", criterion: "1.4.3", tier: 1, element: p.el, state: p.state, measured: `${p.ratio}:1 (${p.fg} on ${p.bg}, ${p.size}px/${p.weight})`, required: `${aa}:1`, text: p.text });
    else if (p.critical && p.ratio < aaa) add({ source: "contrast", criterion: "1.4.6", tier: 2, element: p.el, state: p.state, measured: `${p.ratio}:1 (${p.fg} on ${p.bg}, ${p.size}px/${p.weight})`, required: `${aaa}:1 (critical)`, text: p.text });
    else if (!p.critical && p.ratio < aaa) add({ source: "contrast", criterion: "1.4.6", tier: 3, status: "info", element: p.el, state: p.state, measured: `${p.ratio}:1 (${p.fg} on ${p.bg})`, required: `${aaa}:1 (AAA, secondary text: best effort)`, text: p.text });
  }
  for (const g of groups.values()) if (g.disabled && g.ratio < 4.5) add({ source: "contrast", criterion: "1.4.3 (disabled exempt)", tier: 3, status: "info", element: g.examples[0], state: "disabled", measured: `${g.ratio}:1 (${g.fg} on ${g.bg}), ${g.nodes} nodes`, required: "exempt; target ≥ 4.5:1 for legibility" });
  var contrastGroups = [...groups.values()].sort((a, b) => a.ratio - b.ratio);
  add({ source: "contrast", criterion: "1.4.3 / 1.4.6", rule: "summary", tier: 1, status: "info", element: "all text", measured: `${textPairs.length} text nodes in ${groups.size} colour pairs; worst non-disabled ${Math.min(...textPairs.filter((p) => !p.disabled).map((p) => p.ratio))}:1`, required: "AA 4.5 / critical 7" });
}

// ===========================================================================
// 4. Non-text contrast (1.4.11): component boundaries, state indicators, graphics
// ===========================================================================
{
  const nt = await page.evaluate(() => {
    const A = window.__a11y;
    const res = [];
    const bgOf = (e) => A.background(e).candidates[0];
    const ringColor = (e) => { const s = getComputedStyle(e).boxShadow; const m = s.match(/rgba?\([^)]+\)(?= 0px 0px 0px [\d.]+px inset)/) || s.match(/rgba?\([^)]+\)/); return m ? A.parse(m[0]) : null; };
    const push = (name, sel, fg, bg, need, crit, note) => res.push({ name, el: sel, fg: fg && A.hex(fg), bg: bg && A.hex(bg), ratio: fg && bg ? +A.ratio(fg, bg).toFixed(2) : 0, need, crit, note });
    const first = (s) => document.querySelector(s);
    // input boundaries against the stage background
    for (const [n, s] of [["text field border", "#c2 .field:not(.is-disabled) .field__control"], ["search boundary", "#c3 .search:not(.is-disabled)"], ["stepper boundary", "#c6 .stepper:not(.is-disabled)"], ["chip boundary (default)", "#c4 .chip:not(.is-selected):not(:disabled):not(.chip--fresh)"]]) {
      const e = first(s); if (!e) { push(n, s, null, null, 3, true, "missing"); continue; }
      const ring = ringColor(e); const cs = getComputedStyle(e);
      const border = cs.borderTopStyle !== "none" && parseFloat(cs.borderTopWidth) > 0 ? A.parse(cs.borderTopColor) : null;
      push(n, A.label(e), ring || border, bgOf(e.parentElement), 3, true, ring ? "inset ring" : border ? "border" : "no boundary");
    }
    // selected vs unselected segment
    { const sel = first("#c5 .segmented__opt.is-selected, #c5 .segmented__opt:has(input:checked)"); const track = sel?.closest(".segmented");
      const ring = sel && ringColor(sel); const selBg = sel && A.parse(getComputedStyle(sel).backgroundColor);
      const best = ring ? A.ratio(ring, A.parse(getComputedStyle(track).backgroundColor)) : A.ratio(selBg, A.parse(getComputedStyle(track).backgroundColor));
      res.push({ name: "selected segment indicator vs track", el: sel && A.label(sel), ratio: +best.toFixed(2), need: 3, crit: true, note: ring ? "ring" : "fill only" }); }
    // selected chip indicator
    { const c = first("#c4 .chip.is-selected"); push("selected chip ring", A.label(c), ringColor(c), bgOf(c.parentElement), 3, true, "ring"); }
    // macro bar fills vs track
    for (const k of ["p", "f", "c"]) { const i = first(`#c9 .macro--${k} .macro__bar > i`); push(`macro bar ${k.toUpperCase()} fill vs track`, A.label(i), A.parse(getComputedStyle(i).backgroundColor), A.parse(getComputedStyle(i.parentElement).backgroundColor), 3, true, "graphic"); }
    // calorie ring value vs track
    { const v = first("#c9 .nutri__value"), t = first("#c9 .nutri__track"); push("calorie ring value vs track", A.label(v), A.parse(getComputedStyle(v).stroke), A.parse(getComputedStyle(t).stroke), 3, true, "graphic (values also shown as text)"); }
    // icons
    for (const [n, s] of [["icon in tint icon button", "#c1 .icon-btn--tint"], ["icon in plain icon button", "#c11 .icon-btn"], ["tab icon (inactive)", "#c12 .tab:not(.is-active):not(.tab--scan)"], ["active tab indicator", "#c12 .tab.is-active"]]) {
      const e = first(s); if (!e) continue; const cs = getComputedStyle(e);
      const ind = n === "active tab indicator" ? A.parse(getComputedStyle(e.querySelector("span")).textDecorationColor) : A.parse(cs.color);
      push(n, A.label(e), ind && ind.a > 0 ? ind : null, bgOf(e), 3, true, n === "active tab indicator" ? "2 px label underline" : "icon stroke");
    }
    // error state ring
    { const e = first("#c2 .field.is-error .field__control"); push("error ring", A.label(e), ringColor(e), bgOf(e.parentElement), 3, true, "ring"); }
    return res;
  });
  for (const n of nt) {
    if (n.ratio < n.need) add({ source: "non-text", criterion: "1.4.11", tier: 1, element: `${n.name}: ${n.el}`, measured: `${n.ratio}:1 ${n.fg || ""} vs ${n.bg || ""} (${n.note})`, required: "≥ 3:1" });
    else add({ source: "non-text", criterion: "1.4.11", tier: 1, status: "pass", element: `${n.name}: ${n.el}`, measured: `${n.ratio}:1 (${n.note})`, required: "≥ 3:1" });
  }
  var nonText = nt;
}

// ===========================================================================
// 5. Tier 2: axe wcag2aaa on critical elements only (other AAA findings → Tier 3 info)
// ===========================================================================
{
  const r = await new AxeBuilder({ page }).withTags(["wcag2aaa"]).analyze();
  for (const v of r.violations) for (const n of v.nodes) {
    const isCrit = await page.evaluate((sel) => { const e = document.querySelector(sel); return !!(e && window.__a11y.critical(e)); }, n.target[0]).catch(() => false);
    add({ source: "axe-aaa", criterion: v.tags.find((t) => /^wcag\d{3,4}$/.test(t))?.replace(/wcag(\d)(\d)(\d+)/, "$1.$2.$3") || v.id, rule: v.id, tier: isCrit ? 2 : 3, status: isCrit ? "fail" : "info", element: n.target.join(" "), measured: n.failureSummary?.split("\n")[1]?.trim() || v.help, required: v.help });
  }
  add({ source: "axe-aaa", criterion: "AAA (critical)", rule: "summary", tier: 2, status: "info", element: "critical elements", measured: `${r.violations.length} AAA rules with findings; ${r.passes.length} pass`, required: "0 on critical elements" });
}

// ===========================================================================
// 6. Targets (2.5.8 AA ≥ 24, 2.5.5 AAA ≥ 44 / 48 Android) + spacing
// ===========================================================================
{
  const t = await page.evaluate(() => {
    const A = window.__a11y;
    const px = (v) => parseFloat(v) || 0;
    const hit = (e) => {
      const b = e.getBoundingClientRect();
      let top = b.top, left = b.left, bottom = b.top + e.offsetHeight, right = b.left + e.offsetWidth;
      for (const ps of ["::before", "::after"]) { const s = getComputedStyle(e, ps); if (s.content === "none" || s.position !== "absolute" || s.pointerEvents === "none") continue; top = Math.min(top, b.top + px(s.top)); bottom = Math.max(bottom, b.top + e.offsetHeight - px(s.bottom)); left = Math.min(left, b.left + px(s.left)); right = Math.max(right, b.left + e.offsetWidth - px(s.right)); }
      return { top, left, bottom, right, w: right - left, h: bottom - top };
    };
    const els = [...document.querySelectorAll("a[href], button, input:not([type=radio]):not([type=hidden]), label.segmented__opt, select, textarea, [tabindex]:not([tabindex='-1']), summary")].filter((e) => !A.isHidden(e) && !e.closest("dialog:not([open])"));
    const out = els.map((c) => { const target = c.closest("label") || c; const r = hit(target); return { el: A.label(target), text: (target.textContent || target.getAttribute("aria-label") || "").trim().slice(0, 30), w: +r.w.toFixed(1), h: +r.h.toFixed(1), min: c.closest('[data-platform="android"]') ? 48 : 44, inline: !!c.closest("p, li") && c.tagName === "A", r }; });
    // spacing: overlapping hit areas between different targets
    const overlaps = [];
    for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) { const a = out[i].r, b = out[j].r; if (a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5 && out[i].el !== out[j].el) overlaps.push(`${out[i].el} ↔ ${out[j].el}`); }
    return { targets: out.map(({ r, ...x }) => x), overlaps };
  });
  for (const x of t.targets) {
    if (x.inline) continue;
    if (x.w < 24 || x.h < 24) add({ source: "geometry", criterion: "2.5.8", tier: 1, element: `${x.el} "${x.text}"`, measured: `${x.w}×${x.h}`, required: "≥ 24×24" });
    else if (x.w < x.min - 0.01 || x.h < x.min - 0.01) add({ source: "geometry", criterion: "2.5.5", tier: 2, element: `${x.el} "${x.text}"`, measured: `${x.w}×${x.h}`, required: `≥ ${x.min}×${x.min}` });
  }
  for (const o of t.overlaps) add({ source: "geometry", criterion: "2.5.5 / 2.5.8 spacing", tier: 2, element: o, measured: "hit areas overlap", required: "separate targets" });
  const sizes = t.targets.filter((x) => !x.inline).map((x) => Math.min(x.w, x.h));
  add({ source: "geometry", criterion: "2.5.5", rule: "summary", tier: 2, status: "info", element: `${t.targets.length} targets`, measured: `smallest side ${Math.min(...sizes)} px; ${t.overlaps.length} overlapping pairs`, required: "≥ 44 (48 Android), no overlap" });
  var targets = t;
}

// ===========================================================================
// 7. Keyboard: traversal, focus visible (2.4.7), appearance (2.4.13), not obscured (2.4.11/2.4.12), order (2.4.3)
// ===========================================================================
const focusLog = [];
{
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.mouse.click(1, 1).catch(() => {});
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    await page.keyboard.press("Tab");
    // measure the settled focus state; infinite animations (the skeleton shimmer) never "finish", so only wait for finite ones
    await page.evaluate(() => Promise.all(document.getAnimations().filter((x) => x.effect?.getComputedTiming().iterations !== Infinity).map((x) => x.finished.catch(() => {}))));
    const info = await page.evaluate(() => {
      const A = window.__a11y;
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const target = e.matches("input[type=radio]") ? e.closest("label") : e;
      // where the indicator is drawn: inputs show focus on their field container, the Scan tab on its pill
      const ind = (e.matches("input, select, textarea") && e.closest(".field__control, .search, .stepper")) || target.querySelector(":scope > .tab__fab") || target;
      const cs = getComputedStyle(ind);
      const r = target.getBoundingClientRect();
      const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2 ? { w: parseFloat(cs.outlineWidth), off: parseFloat(cs.outlineOffset), c: cs.outlineColor } : null;
      const rings = [...cs.boxShadow.matchAll(/(rgba?\([^)]+\)) 0px 0px 0px ([\d.]+)px( inset)?/g)].map((m) => ({ c: m[1], spread: +m[2], inset: !!m[3] }));
      const ring = rings.filter((x) => x.spread >= 2).sort((a, b) => b.spread - a.spread)[0]; // outermost ring
      // colour behind the ring: the parent's background for outer rings, the element's own for inset rings
      const ringColor = outline ? A.parse(outline.c) : ring ? A.parse(ring.c) : null;
      const behind = A.background(outline || (ring && !ring.inset) ? ind.parentElement : ind).candidates[0];
      const own = A.background(ind).candidates[0];
      // not obscured: sample 5 points inside the element
      // sample points at 25/75 % so rounded corners (which hit-test to the parent) don't count as "covered"
      const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + r.width * 0.25, r.top + r.height * 0.25], [r.left + r.width * 0.75, r.top + r.height * 0.25], [r.left + r.width * 0.25, r.top + r.height * 0.75], [r.left + r.width * 0.75, r.top + r.height * 0.75]];
      const inView = r.top >= 0 && r.bottom <= innerHeight;
      const covered = pts.filter(([x, y]) => { const hitEl = document.elementFromPoint(x, y); return hitEl && hitEl !== target && !target.contains(hitEl) && !hitEl.contains(target); }).length;
      const sticky = [...document.querySelectorAll("*")].some((s) => { const p = getComputedStyle(s).position; if (!/fixed|sticky/.test(p) || s.contains(target)) return false; const q = s.getBoundingClientRect(); return q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top; });
      const order = [...document.querySelectorAll("*")].indexOf(e);
      const path = (() => { const parts = []; for (let n = e; n && n !== document.body; n = n.parentElement) { if (n.id) { parts.unshift("#" + CSS.escape(n.id)); break; } const same = [...n.parentElement.children].filter((c) => c.tagName === n.tagName); parts.unshift(n.tagName.toLowerCase() + (same.length > 1 ? `:nth-of-type(${same.indexOf(n) + 1})` : "")); } return parts.join(" > "); })();
      return { el: A.label(target), text: (target.textContent || target.getAttribute("aria-label") || "").trim().slice(0, 28), section: target.closest("section[id]")?.id || target.closest("[id]")?.id || "page",
        indicator: outline ? `outline ${outline.w}px offset ${outline.off}px` : ring ? `ring ${ring.spread}px${ring.inset ? " inset" : ""}` : "none",
        thick: !!(outline || ring), gap: outline ? outline.off >= 1 || outline.off < 0 : ring ? rings.length > 1 || ring.inset : false,
        ringContrast: ringColor ? +A.ratio(ringColor, behind).toFixed(2) : 0, ringVsOwn: ringColor ? +A.ratio(ringColor, own).toFixed(2) : 0,
        inView, covered, sticky, order, path, tag: e.tagName, rect: { x: r.left, y: r.top + scrollY, w: r.width, h: r.height } };
    });
    if (!info) break;
    const key = `${info.el}|${info.order}`;
    if (seen.has(key)) break;
    seen.add(key);
    focusLog.push(info);
    if (prev && info.order < prev.order) add({ source: "keyboard", criterion: "2.4.3", tier: 1, element: info.el, measured: `focus moved backwards in DOM order after ${prev.el}`, required: "logical order" });
    prev = info;
  }
  const bad = focusLog.filter((f) => !f.thick);
  for (const f of bad) add({ source: "keyboard", criterion: "2.4.7", tier: 1, element: `${f.el} "${f.text}"`, measured: "no visible focus indicator ≥ 2 px", required: "visible indicator" });
  for (const f of focusLog.filter((x) => x.thick && x.ringContrast < 3)) add({ source: "keyboard", criterion: "2.4.13", tier: 2, element: `${f.el} "${f.text}"`, measured: `${f.indicator}, ${f.ringContrast}:1 vs adjacent`, required: "≥ 2 px, 3:1 change" });
  for (const f of focusLog.filter((x) => x.covered > 0 || x.sticky)) add({ source: "keyboard", criterion: f.covered >= 5 ? "2.4.11" : "2.4.12", tier: f.covered >= 5 ? 1 : 2, element: `${f.el} "${f.text}"`, measured: `${f.covered}/5 sample points covered${f.sticky ? ", overlaps a sticky/fixed element" : ""}`, required: "not obscured" });
  add({ source: "keyboard", criterion: "2.1.1 / 2.4.3 / 2.4.7", rule: "summary", tier: 1, status: "info", element: `${focusLog.length} focus stops`, measured: `${bad.length} without indicator; ${focusLog.filter((x) => x.covered || x.sticky).length} obscured`, required: "all visible, none obscured" });
  // Shift+Tab walks back in reverse order
  const back = [];
  for (let i = 0; i < 5; i++) { await page.keyboard.press("Shift+Tab"); back.push(await page.evaluate(() => [...document.querySelectorAll("*")].indexOf(document.activeElement))); }
  const monotonic = back.every((v, i) => i === 0 || v < back[i - 1]);
  add({ source: "keyboard", criterion: "2.1.1 / 2.4.3", rule: "shift-tab", tier: 1, status: monotonic ? "pass" : "fail", element: "last 5 stops", measured: monotonic ? "reverse order correct" : `order ${back.join(",")}`, required: "Shift+Tab reverses order" });
  // skip link is the first stop
  const first = focusLog[0];
  add({ source: "checklist", criterion: "2.4.1", tier: 1, status: first && /skip/i.test(first.text) ? "pass" : "fail", element: first?.el || "none", measured: first ? `first focus stop: "${first.text}"` : "no focus stops", required: "skip link to main content" });
}

// focus screenshots: one per component section (3× crops) + radios via arrows + dialog trap
{
  const sections = [...new Set(focusLog.map((f) => f.section))];
  const { ctx: c3, page: p3 } = await open({ dsf: 2 });
  for (const s of sections) {
    const f = focusLog.find((x) => x.section === s);
    if (!f) continue;
    await p3.evaluate(({ path }) => { const e = document.querySelector(path); e.scrollIntoView({ block: "center" }); }, f);
    await p3.locator(f.path).first().focus();
    await p3.keyboard.press("Shift+Tab"); await p3.keyboard.press("Tab"); // keyboard modality → :focus-visible
    await p3.waitForTimeout(160);
    const handle = await p3.evaluateHandle(() => { const e = document.activeElement.matches("input[type=radio]") ? document.activeElement.closest("label") : document.activeElement; return e.closest(".state__stage, .doc-nav, .doc-hero, .tok-table, header, footer") || e; });
    await handle.asElement()?.screenshot({ path: resolve(SHOTS, "focus", `${s}.png`) }).catch(() => {});
  }
  // radios: arrow keys move the checked option inside a segmented control
  const radio = p3.locator('#c5 input[type=radio]').first();
  if (await radio.count()) {
    await radio.focus(); await p3.keyboard.press("ArrowRight");
    const moved = await p3.evaluate(() => document.activeElement.matches("input[type=radio]:checked") && document.activeElement.value !== "g");
    add({ source: "keyboard", criterion: "2.1.1 / 4.1.2", rule: "radio-arrows", tier: 1, status: moved ? "pass" : "fail", element: "#c5 segmented radios", measured: moved ? "ArrowRight moves and checks the next unit" : "arrow keys do not move selection", required: "native radiogroup behaviour" });
  } else add({ source: "keyboard", criterion: "4.1.2", rule: "radio-arrows", tier: 1, element: "#c5 segmented", measured: "no radios", required: "radiogroup" });
  // modal sheet: opens with Enter, focus moves in, Tab stays in, Esc closes, focus returns
  const opener = p3.locator("[data-open-sheet]").first();
  if (await opener.count()) {
    await opener.focus(); await p3.keyboard.press("Enter"); await p3.waitForTimeout(450);
    const inside0 = await p3.evaluate(() => !!document.activeElement.closest("dialog:modal"));
    await p3.screenshot({ path: resolve(SHOTS, "focus", "dialog-open.png") });
    let trapped = inside0;
    for (let i = 0; i < 14; i++) { await p3.keyboard.press("Tab"); trapped = trapped && (await p3.evaluate(() => !!document.activeElement.closest("dialog:modal"))); }
    for (let i = 0; i < 3; i++) { await p3.keyboard.press("Shift+Tab"); trapped = trapped && (await p3.evaluate(() => !!document.activeElement.closest("dialog:modal"))); }
    await p3.keyboard.press("Escape"); await p3.waitForTimeout(300);
    const closed = await p3.evaluate(() => !document.querySelector("dialog:modal"));
    const returned = await p3.evaluate(() => document.activeElement?.hasAttribute("data-open-sheet"));
    add({ source: "keyboard", criterion: "2.1.2 / 2.4.3", rule: "dialog", tier: 1, status: inside0 && trapped && closed && returned ? "pass" : "fail", element: "portion sheet (dialog)", measured: `focus moves in: ${inside0}; stays in on Tab/Shift+Tab: ${trapped}; Esc closes: ${closed}; focus returns to opener: ${returned}`, required: "move in, stay in, Esc closes, focus returns" });
    // destructive confirm dialog
    const del = p3.locator("[data-open-confirm]").first();
    if (await del.count()) { await del.focus(); await p3.keyboard.press("Enter"); await p3.waitForTimeout(450); await p3.screenshot({ path: resolve(SHOTS, "focus", "confirm-delete.png") }); const inside = await p3.evaluate(() => document.activeElement.closest("dialog:modal")?.id || ""); await p3.keyboard.press("Escape"); add({ source: "checklist", criterion: "3.3.4 / 3.3.6", rule: "confirm", tier: 2, status: inside ? "pass" : "fail", element: "Delete account", measured: inside ? `confirm dialog #${inside} opens with focus inside; Esc cancels` : "no confirmation", required: "review / confirm / undo before irreversible action" }); }
  } else add({ source: "keyboard", criterion: "2.1.2", rule: "dialog", tier: 1, element: "bottom sheet", measured: "no interactive modal sheet to test (static preview only)", required: "dialog with focus management" });
  if (!(await p3.locator("[data-open-confirm]").count())) add({ source: "checklist", criterion: "3.3.6", rule: "confirm", tier: 2, element: "Delete account button", measured: "no confirm / review / undo pattern", required: "confirm before irreversible action" });
  await c3.close();
}

// ===========================================================================
// 8. Reflow (1.4.10), 200% text (1.4.4), text spacing (1.4.12)
// ===========================================================================
const CLIP = () => {
  const out = [];
  for (const e of document.querySelectorAll("body *")) {
    if (e.closest("svg") || e.closest(".visually-hidden") || /^(INPUT|TEXTAREA)$/.test(e.tagName)) continue;
    const cs = getComputedStyle(e);
    if (cs.display === "none" || cs.display === "inline") continue;
    const clips = !(cs.overflowX === "visible" && cs.overflowY === "visible") && !/auto|scroll/.test(cs.overflowX + cs.overflowY);
    if (clips && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) out.push(`${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]} clipped`);
    else if (cs.overflowX === "visible" && e.closest(".state__stage") && e.scrollWidth > e.clientWidth + 1) out.push(`${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]} content wider than box (${e.scrollWidth}>${e.clientWidth})`);
  }
  return out;
};
{
  const { ctx: c, page: p } = await open({ width: 320, height: 640 });
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); if (b.width === 0) return false; const inScroller = e.closest("[data-scroll-x]"); return !inScroller && (b.right > vw + 1 || b.left < -1); }).slice(0, 8).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]} ${Math.round(e.getBoundingClientRect().right)}`);
    return { scroll: document.documentElement.scrollWidth, vw, wide };
  });
  add({ source: "layout", criterion: "1.4.10", tier: 1, status: r.scroll <= r.vw + 1 && r.wide.length === 0 ? "pass" : "fail", element: "page at 320 CSS px", measured: `scrollWidth ${r.scroll} vs ${r.vw}; outside viewport: ${r.wide.join(", ") || "none"}`, required: "no horizontal scroll (tables may scroll in their own region)" });
  const clip320 = await p.evaluate(CLIP);
  add({ source: "layout", criterion: "1.4.10", rule: "clip-320", tier: 1, status: clip320.length ? "fail" : "pass", element: "page at 320 CSS px", measured: clip320.slice(0, 6).join(" | ") || "no clipping", required: "no loss of content" });
  await p.screenshot({ path: resolve(SHOTS, "reflow-320.png"), fullPage: false });
  await c.close();
}
{
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await page.waitForTimeout(200);
  const clip200 = await page.evaluate(CLIP);
  add({ source: "layout", criterion: "1.4.4", tier: 1, status: clip200.length ? "fail" : "pass", element: "page at 200% text", measured: clip200.slice(0, 6).join(" | ") || "no clipping or overflow", required: "no loss of content or function" });
  await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  await page.addStyleTag({ content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}" });
  await page.waitForTimeout(200);
  const clipTS = await page.evaluate(CLIP);
  add({ source: "layout", criterion: "1.4.12", tier: 1, status: clipTS.length ? "fail" : "pass", element: "page with WCAG text-spacing overrides", measured: clipTS.slice(0, 6).join(" | ") || "no clipping or overflow", required: "no loss of content" });
  await page.locator("#c13").screenshot({ path: resolve(SHOTS, "text-spacing-c13.png") });
}
await ctx.close();

// ===========================================================================
// 9. User preferences: reduced motion (2.3.3), prefers-contrast (1.4.8 part), forced colours
// ===========================================================================
{
  const { ctx: c, page: p } = await open({ media: { reducedMotion: "reduce" } });
  const m = await p.evaluate(() => {
    const d = (s, prop = "transitionDuration") => { const e = document.querySelector(s); return e ? getComputedStyle(e)[prop] : "missing"; };
    return { btn: d(".btn--primary"), ring: d(".nutri__value"), sheetAnim: d(".sheet", "animationName"), toastAnim: d(".toast", "animationName"), pressedTransform: d(".btn--primary.is-pressed", "transform") };
  });
  const ok = /^0s|^0\.00/.test(m.btn) && /^0s|^0\.00/.test(m.ring) && m.sheetAnim === "none" && m.toastAnim === "none" && m.pressedTransform === "none";
  add({ source: "preferences", criterion: "2.3.3", tier: 2, status: ok ? "pass" : "fail", element: "ring, sheet, toast, buttons", measured: JSON.stringify(m), required: "prefers-reduced-motion: no motion" });
  await c.close();
}
{
  const { ctx: c, page: p } = await open({ media: { contrast: "more" } }).catch(async () => open());
  const v = await p.evaluate(() => ({ normal: "#5c4c3e", secondary: getComputedStyle(document.documentElement).getPropertyValue("--color-text-secondary").trim(), border: getComputedStyle(document.documentElement).getPropertyValue("--color-border-default").trim(), matches: matchMedia("(prefers-contrast: more)").matches }));
  const changed = v.matches && /oat-900|oat-700|#2b2118|#4e4034/i.test(v.secondary) && /#8c7a66|#6b5a4a|#2b2118|#4e4034/i.test(v.border);
  add({ source: "preferences", criterion: "prefers-contrast", tier: 3, status: changed ? "pass" : "info", element: ":root tokens", measured: `media matches: ${v.matches}; text-secondary → ${v.secondary}; border-default → ${v.border}`, required: "strengthened tokens under prefers-contrast: more" });
  await p.locator("#c7").screenshot({ path: resolve(SHOTS, "prefers-contrast-more-c7.png") });
  await c.close();
}
{
  const { ctx: c, page: p } = await open({ media: { forcedColors: "active" } });
  const f = await p.evaluate(() => {
    const vis = (s) => { const e = document.querySelector(s); if (!e) return "missing"; const cs = getComputedStyle(e); const o = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0; const b = cs.borderTopStyle !== "none" && parseFloat(cs.borderTopWidth) > 0; return o || b ? "visible" : "invisible"; };
    const bar = (() => { const i = document.querySelector("#c9 .macro__bar > i"); const cs = getComputedStyle(i); return cs.forcedColorAdjust === "none" && cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? "visible" : "invisible"; })();
    return { field: vis("#c2 .field__control"), search: vis("#c3 .search"), stepper: vis("#c6 .stepper"), chip: vis("#c4 .chip"), selectedSegment: vis("#c5 .segmented__opt:has(input:checked)"), segFocus: vis("#c5 .segmented__opt.is-focus"), rowSelected: vis("#c7 .product.is-selected"), tabFocus: vis("#c12 .tab.is-focus"), macroBar: bar, matches: matchMedia("(forced-colors: active)").matches };
  });
  const bad = Object.entries(f).filter(([k, v]) => v === "invisible" || v === "missing");
  add({ source: "preferences", criterion: "1.4.11 (forced colours)", tier: 1, status: bad.length ? "fail" : "pass", element: "boundaries, selection, focus, bars", measured: bad.length ? `invisible in forced colours: ${bad.map(([k]) => k).join(", ")}` : "all visible", required: "components stay visible without box-shadow" });
  for (const id of ["c2", "c5", "c7", "c9", "c12"]) await p.locator(`#${id}`).screenshot({ path: resolve(SHOTS, `forced-colors-${id}.png`) });
  await c.close();
}

// ===========================================================================
// 10. Checklist (structure, names/roles, language, forms, timing, 1.4.8 text, 3.1.4, 3.3.9)
// ===========================================================================
{
  const { ctx: c, page: p } = await open();
  const k = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const qa = (s) => [...document.querySelectorAll(s)];
    const heads = qa("h1,h2,h3,h4,h5,h6").map((h) => +h.tagName[1]);
    const skips = heads.filter((l, i) => i > 0 && l > heads[i - 1] + 1).length;
    const topLevel = (s) => qa(s).some((e) => !e.closest("main, article, aside, section, nav") || e.parentElement === document.body);
    // 1.4.8: multi-line text blocks
    const blocks = qa("main p, main li, main figcaption, main dd, .doc-nav p").filter((e) => e.getClientRects().length && e.getBoundingClientRect().height > parseFloat(getComputedStyle(e).lineHeight) * 1.5);
    const lh = blocks.filter((e) => parseFloat(getComputedStyle(e).lineHeight) / parseFloat(getComputedStyle(e).fontSize) < 1.495).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]} ${(parseFloat(getComputedStyle(e).lineHeight) / parseFloat(getComputedStyle(e).fontSize)).toFixed(2)}`);
    const ctx = document.createElement("canvas").getContext("2d");
    const longLines = blocks.filter((e) => { const cs = getComputedStyle(e); ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; const avg = ctx.measureText("abcdefghijklmnopqrstuvwxyz ").width / 27; return e.getBoundingClientRect().width / avg > 80; }).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]}`);
    const justified = qa("body *").filter((e) => getComputedStyle(e).textAlign === "justify").length;
    const paras = qa("main p + p").filter((e) => { const prev = e.previousElementSibling; const gap = e.getBoundingClientRect().top - prev.getBoundingClientRect().bottom; return gap < 1.5 * parseFloat(getComputedStyle(e).lineHeight) - parseFloat(getComputedStyle(e).lineHeight) + 0.5 && gap < parseFloat(getComputedStyle(e).lineHeight) * 0.5; }).length;
    return {
      lang: document.documentElement.lang, title: document.title,
      landmarks: { banner: !!q("body > header, .doc > header, [role=banner]"), nav: !!q("nav"), main: qa("main").length, contentinfo: !!q("footer, [role=contentinfo]") },
      h1: qa("h1").length, skips,
      tablesWithoutTh: qa("table").filter((t) => !t.querySelector("th")).length,
      thWithoutScope: qa("th").filter((th) => !th.getAttribute("scope")).length,
      factsCaption: !!q(".facts table caption"),
      abbrLegend: !!q("#abbreviations dl, [data-legend=abbreviations]"),
      abbrTags: qa("abbr[title]").map((a) => a.textContent.trim()),
      toastDismiss: qa(".toast").every((t) => t.querySelector(".toast__close, [data-dismiss]")),
      toastRoles: qa(".toast").every((t) => /status|alert/.test(t.getAttribute("role") || "")),
      toastNoTimer: !/for 5 seconds|disappears after|auto-?dismiss/i.test(q("#c14")?.textContent || ""),
      ringAlt: qa(".nutri__ring svg").every((s) => s.getAttribute("role") === "img" && s.getAttribute("aria-label")),
      meters: qa(".macro__bar").every((b) => /meter|progressbar/.test(b.getAttribute("role") || "") && b.hasAttribute("aria-valuenow") && b.hasAttribute("aria-valuemax")),
      stepperValue: qa(".stepper").every((s) => s.querySelector("input, [role=spinbutton], output")),
      segmentedRadios: qa(".segmented").every((s) => s.tagName === "FIELDSET" && s.querySelector("input[type=radio]")),
      sheetDialog: !!q("dialog.sheet, dialog .sheet, [role=dialog] .sheet, .sheet[role=dialog]"),
      signIn: (() => { const f = q("[data-pattern=sign-in]"); return f ? { email: !!f.querySelector("input[autocomplete=email]"), noPassword: !f.querySelector("input[type=password]") || !!f.querySelector("input[type=password][autocomplete]"), alt: /passkey|link/i.test(f.textContent) } : null; })(),
      autocompleteEmail: qa("input[type=email]").every((i) => i.autocomplete),
      lh, longLines, justified, paras,
    };
  });
  const chk = (criterion, tier, ok, element, measured, required) => add({ source: "checklist", criterion, tier, status: ok ? "pass" : "fail", element, measured, required });
  chk("3.1.1", 1, k.lang === "en", "html", `lang="${k.lang}"`, 'lang="en"');
  chk("2.4.2", 1, !!k.title, "title", k.title, "descriptive title");
  chk("1.3.1 landmarks", 1, k.landmarks.banner && k.landmarks.nav && k.landmarks.main === 1 && k.landmarks.contentinfo, "page", JSON.stringify(k.landmarks), "header, nav, one main, footer");
  chk("1.3.1 headings", 1, k.h1 === 1 && k.skips === 0, "h1–h6", `${k.h1} h1, ${k.skips} skipped levels`, "one h1, no skipped levels");
  chk("1.3.1 tables", 1, k.tablesWithoutTh === 0 && k.thWithoutScope === 0, "tables", `${k.tablesWithoutTh} without th, ${k.thWithoutScope} th without scope`, "th with scope");
  chk("1.3.1 facts caption", 1, k.factsCaption, ".facts table", k.factsCaption ? "caption present" : "no caption", "table caption");
  chk("3.1.4", 2, k.abbrLegend && ["kcal", "P", "F", "C", "g", "ml"].every((a) => k.abbrTags.includes(a)), "abbreviations", `legend: ${k.abbrLegend}; <abbr>: ${[...new Set(k.abbrTags)].join(", ") || "none"}`, "kcal, P, F, C, g, ml expanded (legend + abbr on first use)");
  chk("2.2.3 / 2.2.4 / 2.2.6", 2, k.toastDismiss && k.toastNoTimer, ".toast", `dismiss control: ${k.toastDismiss}; no auto-dismiss timer: ${k.toastNoTimer}`, "no timer, dismissible");
  chk("4.1.3", 1, k.toastRoles, ".toast", k.toastRoles ? "role=status / alert" : "missing role", "status messages exposed");
  chk("1.1.1 / 4.1.2 ring", 1, k.ringAlt, ".nutri__ring svg", k.ringAlt ? "role=img + aria-label" : "no text alternative", "text alternative");
  chk("4.1.2 macro bars", 1, k.meters, ".macro__bar", k.meters ? "role=meter with values" : "no role/value", "meter or progressbar with value");
  chk("4.1.2 stepper", 1, k.stepperValue, ".stepper", k.stepperValue ? "value exposed (input/spinbutton)" : "value is plain text only", "value exposed to AT");
  chk("4.1.2 segmented", 1, k.segmentedRadios, ".segmented", k.segmentedRadios ? "fieldset + radios" : "not a radiogroup", "radiogroup");
  chk("4.1.2 sheet", 1, k.sheetDialog, ".sheet", k.sheetDialog ? "dialog" : "not exposed as dialog", "dialog with aria-modal / <dialog>");
  chk("3.3.8 / 3.3.9", 2, !!(k.signIn && k.signIn.email && k.signIn.noPassword && k.signIn.alt), "sign-in pattern", k.signIn ? JSON.stringify(k.signIn) : "no sign-in pattern documented", "no cognitive test; email link / passkey; paste allowed");
  chk("1.3.5", 1, k.autocompleteEmail, "input[type=email]", k.autocompleteEmail ? "autocomplete set" : "missing autocomplete", "autocomplete on personal data");
  chk("1.4.8 line spacing", 2, k.lh.length === 0, "multi-line text blocks", k.lh.slice(0, 6).join(", ") || "all ≥ 1.5", "line-height ≥ 1.5");
  chk("1.4.8 line length", 2, k.longLines.length === 0, "multi-line text blocks", k.longLines.slice(0, 6).join(", ") || "all ≤ 80 characters", "≤ 80 characters");
  chk("1.4.8 justification", 2, k.justified === 0, "all text", `${k.justified} justified elements`, "none");
  chk("1.4.8 paragraph spacing", 2, k.paras === 0, "main p + p", `${k.paras} paragraph gaps too small`, "≥ 1.5 × line spacing");
  await c.close();
}

await browser.close();
server.close();

// ===========================================================================
// report
// ===========================================================================
const blocking = findings.filter((f) => f.status === "fail" && (f.tier === 1 || f.tier === 2));
const summary = {
  label: LABEL, date: new Date().toISOString(),
  tier1: { fail: findings.filter((f) => f.tier === 1 && f.status === "fail").length, pass: findings.filter((f) => f.tier === 1 && f.status === "pass").length },
  tier2: { fail: findings.filter((f) => f.tier === 2 && f.status === "fail").length, pass: findings.filter((f) => f.tier === 2 && f.status === "pass").length },
  tier3: { info: findings.filter((f) => f.tier === 3).length },
};
writeFileSync(resolve(OUT, `audit-${LABEL}.json`), JSON.stringify({ summary, findings, contrastPairs: contrastGroups, nonText, targets: targets.targets, focus: focusLog, axeIncomplete }, null, 2));
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const rows = (list) => list.map((f) => `| ${f.id} | ${f.criterion} | ${f.tier} | ${f.status} | ${esc(f.element)} | ${esc(f.state)} | ${esc(f.measured)} | ${esc(f.required)} | ${f.source} |`).join("\n");
const md = `# Accessibility audit: ${LABEL}

Generated by \`02-design-system/tools/a11y.mjs\` on ${summary.date}.

| Tier | Meaning | Failures | Passes |
|---|---|---|---|
| 1 | WCAG 2.2 A + AA (blocking) | **${summary.tier1.fail}** | ${summary.tier1.pass} |
| 2 | AAA for critical elements (blocking) | **${summary.tier2.fail}** | ${summary.tier2.pass} |
| 3 | Other AAA / information | ${summary.tier3.info} notes | – |

## Failures (Tier 1 and 2)

| ID | Criterion | Tier | Status | Element | State | Measured | Required | Source |
|---|---|---|---|---|---|---|---|---|
${rows(blocking) || "| – | – | – | – | none | – | – | – | – |"}

## Passes and information

| ID | Criterion | Tier | Status | Element | State | Measured | Required | Source |
|---|---|---|---|---|---|---|---|---|
${rows(findings.filter((f) => !blocking.includes(f)))}

## Text contrast pairs (${contrastGroups.length} colour pairs, worst first)

| Foreground | Background | Ratio | Critical | Large | Disabled | Nodes | Example |
|---|---|---|---|---|---|---|---|
${contrastGroups.map((g) => `| \`${g.fg}\` | \`${g.bg}\` | ${g.ratio}:1 | ${g.critical ? "yes (7:1)" : "no (4.5:1)"} | ${g.large ? "yes" : ""} | ${g.disabled ? "exempt" : ""} | ${g.nodes} | ${esc(g.examples[0])} |`).join("\n")}
`;
writeFileSync(resolve(OUT, `audit-${LABEL}.md`), md);
console.log(`\n[${LABEL}] Tier 1: ${summary.tier1.fail} fail / ${summary.tier1.pass} pass · Tier 2: ${summary.tier2.fail} fail / ${summary.tier2.pass} pass · Tier 3: ${summary.tier3.info} notes`);
console.log(`Report: 02-design-system/a11y/audit-${LABEL}.md`);
process.exit(blocking.length ? 1 : 0);
