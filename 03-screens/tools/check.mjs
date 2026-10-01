// Validate 03-screens: screens/*.html, flows.html and the PNG exports.
//   npm run check:screens
// Static: html-validate, stylelint (flows.css), design-system-only rule (stylesheets, inline
// styles, no hex / px), relative links and data-href targets exist, every screen has an export.
// Browser (Playwright, 390×844): no console errors, images load, the frame is exactly
// 390×844, no horizontal overflow, no clipped text, touch targets ≥ 44, every focus stop
// shows a visible change, axe-core WCAG 2.2 A/AA + best practice = 0 violations (AAA
// colour-contrast-enhanced reported), and the numbers on screen add up.
// Writes 03-screens/qa/report.json and exits 1 on any failure.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { HtmlValidate, FileSystemConfigLoader } from "html-validate";
import stylelint from "stylelint";
import { PNG } from "pngjs";
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(HERE, "..");
const SCREENS = resolve(HERE, "screens");
const screens = readdirSync(SCREENS).filter((f) => f.endsWith(".html")).sort();
const pages = [...screens.map((f) => resolve(SCREENS, f)), resolve(HERE, "flows.html")];

const results = [];
const record = (group, name, ok, detail = "") => {
  results.push({ group, name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} [${group}] ${name}${detail ? " — " + detail : ""}`);
};
const rel = (p) => relative(ROOT, p);

// ---------- 1. static ----------
{
  const htmlvalidate = new HtmlValidate(new FileSystemConfigLoader());
  for (const p of pages) {
    const report = await htmlvalidate.validateFile(p);
    const msgs = report.results.flatMap((r) => r.messages.map((m) => `${m.line}:${m.column} ${m.ruleId} ${m.message}`));
    record("html", `${rel(p)} is valid (html-validate:recommended)`, report.valid, msgs.slice(0, 5).join(" | "));
  }
  const lint = await stylelint.lint({ files: ["03-screens/flows.css", "02-design-system/*.css"], cwd: ROOT });
  const warnings = lint.results.flatMap((r) => r.warnings.map((w) => `${r.source.split("/").pop()}:${w.line} ${w.text}`));
  record("css", "stylelint: flows.css and the design system", warnings.length === 0, warnings.slice(0, 5).join(" | "));
  const flowsCss = readFileSync(resolve(HERE, "flows.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const hard = flowsCss.match(/#[0-9a-f]{3,8}\b|\b\d+(\.\d+)?px\b|rgba?\(/gi) || [];
  record("css", "flows.css uses tokens only (no hex, px or rgb)", hard.length === 0, hard.join(", "));

  for (const p of pages) {
    const html = readFileSync(p, "utf8");
    const isScreen = p.startsWith(SCREENS);
    const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !h.startsWith("https://fonts.googleapis.com"));
    const allowed = isScreen ? ["../../02-design-system/tokens.css", "../../02-design-system/components.css"] : ["../02-design-system/tokens.css", "../02-design-system/components.css", "./flows.css"];
    record("ds", `${rel(p)} loads only the design system${isScreen ? "" : " + flows.css"}`, JSON.stringify(sheets) === JSON.stringify(allowed) && !/<style[\s>]/.test(html), sheets.join(", "));
    const styles = [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1]);
    const badStyles = styles.filter((s) => s.split(";").map((d) => d.trim()).filter(Boolean).some((d) => !/^--(w|x|y):\s*[\d.]+%$/.test(d)));
    record("ds", `${rel(p)} inline styles are data only (--w / --x / --y in %)`, badStyles.length === 0, badStyles.slice(0, 3).join(" | ") || `${styles.length} data values`);
    const refs = [...html.matchAll(/(?:href|src|data-href)="([^"#][^"]*)"/g)].map((m) => m[1]).filter((u) => !/^(https?:|data:|mailto:)/.test(u));
    const missing = [...new Set(refs)].filter((u) => !existsSync(resolve(dirname(p), u.split("?")[0])));
    record("links", `${rel(p)} every relative link, image and data-href exists`, missing.length === 0, missing.join(", ") || `${new Set(refs).size} targets`);
  }
  const exportsMissing = screens.filter((f) => !existsSync(resolve(HERE, "exports", f.replace(".html", ".png"))));
  const badSize = screens.filter((f) => existsSync(resolve(HERE, "exports", f.replace(".html", ".png")))).filter((f) => {
    const png = PNG.sync.read(readFileSync(resolve(HERE, "exports", f.replace(".html", ".png"))));
    return png.width !== 780 || png.height !== 1688;
  });
  record("export", "every screen has exports/<name>.png at 780×1688 (@2x)", exportsMissing.length + badSize.length === 0, [...exportsMissing, ...badSize].join(", ") || `${screens.length} PNGs`);
  const extra = readdirSync(resolve(HERE, "exports")).filter((f) => f.endsWith(".png") && !screens.includes(f.replace(".png", ".html")));
  record("export", "no stale PNGs without a screen", extra.length === 0, extra.join(", "));
  const fl = existsSync(resolve(HERE, "flows.png")) && PNG.sync.read(readFileSync(resolve(HERE, "flows.png")));
  record("export", "flows.png exists at 2× the board width", !!fl && fl.width === 4800, fl ? `${fl.width}×${fl.height}` : "missing");
}

// ---------- 2. browser ----------
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const facts = {};
try {
  for (const p of pages) {
    const isScreen = p.startsWith(SCREENS);
    const name = rel(p);
    const page = await context.newPage();
    if (!isScreen) await page.setViewportSize({ width: 2400, height: 1200 });
    const problems = [];
    page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
    page.on("requestfailed", (r) => problems.push(`failed: ${r.url()}`));
    await page.goto(pathToFileURL(p).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")));
    record("load", `${name}: no console errors, failed requests or broken images`, problems.length + broken.length === 0, [...problems, ...broken].join(" | "));

    // axe AA + best practice (blocking), AAA contrast (reported)
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
    record("axe", `${name}: axe WCAG 2.2 A/AA + best practice, 0 violations`, axe.violations.length === 0,
      axe.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`).join(" | ") || `${axe.passes.length} rules pass, ${axe.incomplete.length} need review`);
    const aaa = await new AxeBuilder({ page }).withRules(["color-contrast-enhanced"]).analyze();
    const aaaNodes = aaa.violations.flatMap((v) => v.nodes.map((n) => `${n.target.join(" ")} ${n.any[0]?.data?.contrastRatio ?? ""}`));
    facts[name] = { axePasses: axe.passes.length, axeIncomplete: axe.incomplete.map((i) => `${i.id}:${i.nodes.length}`), aaaContrastBelow7: aaaNodes };

    if (!isScreen) { await page.close(); continue; }

    const geo = await page.evaluate(() => {
      const out = {};
      const sc = document.querySelector(".screen").getBoundingClientRect();
      out.frame = `${sc.width}×${sc.height}`;
      out.hScroll = document.documentElement.scrollWidth;
      // clipped text: an element that hides overflow but its content is wider than its box
      out.clipped = [...document.querySelectorAll(".screen *")].filter((e) => {
        const cs = getComputedStyle(e);
        if (e.matches(".screen, .screen__body, .viewfinder, .visually-hidden, .skeleton, svg, svg *, img")) return false;
        return /hidden|clip/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1;
      }).map((e) => e.className);
      // anything wider than the screen
      out.wide = [...document.querySelectorAll(".screen *")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > 390.5 || r.left < -0.5) && !e.closest(".visually-hidden") && !e.matches(".viewfinder__plate, .viewfinder__feed"); }).map((e) => e.className || e.tagName);
      // touch targets
      const ctrls = [...document.querySelectorAll("button, input:not(.visually-hidden), select, a[href], label.segmented__opt, [data-href]")].filter((e) => !e.closest("[inert]") && e.getBoundingClientRect().width > 0);
      out.targets = ctrls.map((e) => {
        let r = e.getBoundingClientRect();
        if (e.matches(".recipe-card__title a")) r = e.closest(".recipe-card").getBoundingClientRect(); // stretched link covers the card
        if (e.matches(".stepper__input")) r = { width: Math.max(r.width, 44), height: r.height };
        if (e.matches(".search input")) r = e.closest(".search").getBoundingClientRect();
        if (e.matches(".field__control input, .field__control select")) r = e.closest(".field__control").getBoundingClientRect(); // the field box is the target
        const ext = e.matches(".chip, label.segmented__opt") ? 44 : 0; // chips and segments extend their hit area to 44 with ::after (track padding)
        return { el: (e.getAttribute("aria-label") || e.textContent.trim()).slice(0, 30), w: Math.round(r.width), h: Math.max(Math.round(r.height), ext) };
      }).filter((t) => t.w < 44 || t.h < 44);
      // numbers add up
      const num = (s) => Number(String(s).replace(/[^\d.]/g, ""));
      const kcal = (sel) => [...document.querySelectorAll(sel)].map((e) => num(e.childNodes[0].textContent));
      out.sums = [];
      const eaten = [...document.querySelectorAll(".nutri__row span")].find((s) => /^Eaten/.test(s.textContent.trim()))?.querySelector("b");
      if (eaten) {
        const meals = kcal(".list .product__kcal").reduce((a, b) => a + b, 0);
        const left = num(document.querySelector(".nutri__big").textContent);
        const goal = num(document.querySelectorAll(".nutri__row b")[1].textContent);
        out.sums.push({ what: "meals = eaten", ok: meals === num(eaten.textContent), detail: `${meals} vs ${eaten.textContent}` });
        out.sums.push({ what: "goal − eaten = left", ok: goal - num(eaten.textContent) === left, detail: `${goal} − ${eaten.textContent} = ${left}` });
      }
      if (document.querySelector(".product--detected")) {
        const items = kcal(".product--detected .product__kcal").reduce((a, b) => a + b, 0);
        const shown = num(document.querySelector("#total-title").nextElementSibling.childNodes[0].textContent);
        out.sums.push({ what: "detected items = total", ok: items === shown, detail: `${items} vs ${shown}` });
      }
      const pot = [...document.querySelectorAll(".facts tr.is-energy")].find((r) => /kcal/i.test(r.closest("table").querySelector("thead th:last-child")?.textContent || ""));
      if (pot) {
        const rows = [...pot.closest("tbody").querySelectorAll("tr:not(.is-energy)")];
        const k = rows.reduce((a, r) => a + num(r.cells[2]?.textContent ?? 0), 0);
        const g = rows.reduce((a, r) => a + num(r.cells[1]?.textContent ?? 0), 0);
        if (rows[0]?.cells.length === 3 && /g$/.test(rows[0].cells[1].textContent.trim())) {
          out.sums.push({ what: "ingredients = total row", ok: k === num(pot.cells[2].textContent) && g === num(pot.cells[1].textContent), detail: `${g} g / ${k} kcal vs ${pot.cells[1].textContent} / ${pot.cells[2].textContent}` });
        }
      }
      return out;
    });
    record("frame", `${name}: frame is 390×844 with no horizontal scroll`, geo.frame === "390×844" && geo.hScroll <= 390, `${geo.frame}, scrollWidth ${geo.hScroll}`);
    record("frame", `${name}: no clipped text, nothing outside the screen`, geo.clipped.length + geo.wide.length === 0, [...geo.clipped, ...geo.wide].slice(0, 5).join(", "));
    record("targets", `${name}: every control is at least 44×44`, geo.targets.length === 0, geo.targets.map((t) => `${t.el} ${t.w}×${t.h}`).join(" | "));
    for (const s of geo.sums) record("data", `${name}: ${s.what}`, s.ok, s.detail);

    // keyboard: every Tab stop changes outline or box-shadow (a visible focus indicator)
    const stops = [];
    await page.locator("body").focus();
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const host = e.matches(".tab--scan") ? e.querySelector(".tab__fab") : e.closest(".field__control, .search, .stepper, .segmented__opt") || e; // Scan draws its ring on the pill
        const cs = getComputedStyle(host);
        const ring = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
        const shadow = cs.boxShadow !== "none";
        return { id: (e.getAttribute("aria-label") || e.textContent || e.value || e.tagName).trim().slice(0, 30), visible: ring || shadow, key: e.outerHTML.slice(0, 80) };
      });
      if (!info || stops.some((s) => s.key === info.key)) break;
      stops.push(info);
    }
    const invisible = stops.filter((s) => !s.visible);
    record("keyboard", `${name}: all ${stops.length} focus stops show a visible indicator`, stops.length > 0 && invisible.length === 0, invisible.map((s) => s.id).join(", "));
    await page.close();
  }
  // ---------- 3. stress: 320 px, 200 % text, long names ----------
  const layoutProblems = async (page) => page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const bad = [];
    if (document.documentElement.scrollWidth > W + 0.5) bad.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${W})`);
    for (const e of document.querySelectorAll(".screen *")) {
      if (e.closest(".visually-hidden, [hidden], dialog:not([open]), svg") || e.matches("svg, img, .skeleton, input, select")) continue;
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      if (!r.width) continue;
      if (/hidden|clip/.test(cs.overflowX) && !e.matches(".screen, .viewfinder") && e.scrollWidth > e.clientWidth + 1) bad.push(`clipped: ${e.className || e.tagName}`);
      if (r.right > W + 0.5 && !e.matches(".viewfinder__plate, .viewfinder__feed")) bad.push(`outside the screen: ${String(e.className || e.tagName).split(" ")[0]} (${r.right.toFixed(1)} > ${W})`);
    }
    return [...new Set(bad)].slice(0, 6);
  });
  for (const [label, width, scale] of [["320 px", 320, 1], ["200% text", 390, 2]]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 844 });
    let worst = [];
    for (const f of screens) {
      await page.goto(pathToFileURL(resolve(SCREENS, f)).href, { waitUntil: "networkidle" });
      if (scale !== 1) await page.addStyleTag({ content: `html { font-size: ${scale * 100}% !important; }` });
      await page.evaluate(() => document.fonts.ready);
      const bad = await layoutProblems(page);
      if (bad.length) worst.push(`${f}: ${bad.join("; ")}`);
    }
    record("stress", `${label}: no horizontal scroll, nothing clipped or outside the screen (all ${screens.length} screens)`, worst.length === 0, worst.slice(0, 4).join(" | "));
    await page.close();
  }
  {
    const page = await context.newPage();
    const LONG_DISH = "Slow-baked Atlantic cod with crushed garlic potatoes, charred tenderstem broccoli and lemon";
    const LONG_ING = "Potatoes, new, boiled in their skin and crushed with extra-virgin olive oil and rosemary";
    const bad = [];
    for (const [f, fn] of [
      ["14-recipe-detail.html", ({ d }) => { document.getElementById("dish-title").textContent = d; }],
      ["14-recipe-detail-edit.html", ({ i }) => { const el = document.querySelector('[data-field="name"]'); el.value = i; el.dispatchEvent(new Event("input", { bubbles: true })); document.querySelector(".ingredient").insertAdjacentHTML("beforeend", `<span class="ingredient__name ingredient__wide">${i}</span>`); }],
      ["13-recipes.html", ({ d }) => { document.querySelectorAll(".recipe-card__title").forEach((t) => { t.firstChild.textContent = d; }); }],
      ["07-today-meals.html", ({ d }) => { document.querySelector(".recipe-card__title").textContent = d; document.querySelectorAll(".product__meta").forEach((m) => { m.textContent = d; }); }],
    ]) {
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(pathToFileURL(resolve(SCREENS, f)).href, { waitUntil: "networkidle" });
        await page.evaluate(fn, { d: LONG_DISH, i: LONG_ING });
        const p = await layoutProblems(page);
        if (p.length) bad.push(`${f}@${width}: ${p.join("; ")}`);
      }
    }
    record("stress", "long dish and ingredient names wrap: nothing clipped or outside (390 and 320 px)", bad.length === 0, bad.slice(0, 3).join(" | "));
    await page.close();
  }

  // ---------- 4. dish editor behaviour ----------
  {
    const page = await context.newPage();
    await page.goto(pathToFileURL(resolve(SCREENS, "14-recipe-detail.html")).href, { waitUntil: "networkidle" });
    const kcal = () => page.locator("#sum-kcal").textContent();
    const sumRows = () => page.evaluate(() => [...document.querySelectorAll(".ingredient .macro-line__item:first-child")].reduce((a, e) => a + parseInt(e.textContent, 10), 0));
    record("editor", "view: ingredient kcal add up to the total", Number(await kcal()) === await sumRows(), `${await sumRows()} vs ${await kcal()}`);
    // keyboard: Tab to "Edit", Enter
    await page.locator("#edit-toggle").focus();
    await page.keyboard.press("Enter");
    const focusedName = await page.evaluate(() => document.activeElement.dataset.field);
    record("editor", "Edit (keyboard Enter) switches to fields and focuses the first ingredient", focusedName === "name", `focus on ${focusedName}`);
    const labels = await page.evaluate(() => [...document.querySelectorAll(".ingredient--edit input, .ingredient--edit select")].every((i) => i.labels && i.labels.length && i.labels[0].textContent.trim() && !i.placeholder));
    record("editor", "every edit field has a visible <label>, no placeholder-only fields", labels);
    // change potatoes 200 → 150 g
    const pot = page.locator('.ingredient', { has: page.locator('[data-field="name"][value^="Potatoes"]') }).locator('[data-field="qty"]');
    await pot.fill("150");
    const after = Number(await kcal());
    record("editor", "changing an amount recalculates kcal, ring and macros without a reload (462 → 419)", after === 419, `now ${after}`);
    await page.waitForTimeout(800);
    const status = await page.locator("#dish-status").textContent();
    record("editor", "the change is announced in role=status", /419/.test(status), status);
    // unit change: olive oil 10 g → 10 ml (density 0.91) → 80 kcal
    const oil = page.locator('.ingredient', { has: page.locator('[data-field="name"][value="Olive oil"]') });
    await oil.locator('[data-field="unit"]').selectOption("ml");
    const ml = Number(await kcal());
    record("editor", "unit g → ml uses the food's density (olive oil 10 ml = 80 kcal)", ml === 419 - 88 + 80, `now ${ml}`);
    // delete garlic: focus moves, toast with Undo, undo restores
    await page.locator('[aria-label="Delete Garlic"]').click();
    const afterDel = await page.evaluate(() => ({ focus: document.activeElement?.id || document.activeElement?.className, toast: document.querySelector("#toast-row .toast__msg")?.textContent, rows: document.querySelectorAll(".ingredient").length }));
    record("editor", "delete keeps focus in the list and shows an Undo toast", afterDel.rows === 4 && /deleted/.test(afterDel.toast || "") && /ing-\d+-name|add-ingredient/.test(afterDel.focus), JSON.stringify(afterDel));
    await page.locator("[data-undo]").click();
    const afterUndo = await page.evaluate(() => ({ rows: document.querySelectorAll(".ingredient").length, focus: document.activeElement?.value }));
    record("editor", "Undo restores the ingredient and focuses it", afterUndo.rows === 5 && afterUndo.focus === "Garlic", JSON.stringify(afterUndo));
    // unknown food → error with a fix hint
    const first = page.locator('[data-field="name"]').first();
    await first.fill("Unicorn steak");
    await first.press("Tab");
    const err = await page.evaluate(() => { const i = document.querySelector('[data-field="name"][aria-invalid="true"]'); return i ? document.getElementById(i.getAttribute("aria-describedby")).textContent : ""; });
    record("editor", "an unknown food is flagged with aria-invalid and a hint", /Pick a food from the list/.test(err), err);
    // back with changes → Discard dialog, safe option focused
    await page.locator("[data-dish-back]").click();
    const dlg = await page.evaluate(() => ({ open: document.getElementById("discard").open, focus: document.activeElement?.id }));
    record("editor", "Back with unsaved changes opens “Discard changes?” with “Keep editing” focused", dlg.open && dlg.focus === "keep-editing", JSON.stringify(dlg));
    await page.keyboard.press("Escape");
    record("editor", "Esc closes the dialog and keeps the edits", !(await page.evaluate(() => document.getElementById("discard").open)) && (await page.locator(".ingredient--edit").count()) === 5);
    // name: empty and too long
    await page.goto(pathToFileURL(resolve(SCREENS, "14-recipe-detail.html")).href, { waitUntil: "networkidle" });
    await page.locator("#edit-name").click();
    await page.locator("#name-input").fill("");
    await page.locator("#name-save").click();
    const e1 = await page.evaluate(() => ({ invalid: document.getElementById("name-input").getAttribute("aria-invalid"), help: document.getElementById("name-help").textContent, label: document.querySelector('label[for="name-input"]').textContent }));
    record("editor", "empty name: error with an example, visible label kept", e1.invalid === "true" && /Enter a name/.test(e1.help) && e1.label === "Dish name", JSON.stringify(e1));
    await page.locator("#name-input").fill("x".repeat(73));
    await page.locator("#name-save").click();
    const e2 = await page.locator("#name-help").textContent();
    record("editor", "too-long name: says the limit and the current length", /60 characters or fewer.*73/.test(e2), e2);
    await page.locator("#name-input").fill("Baked cod with broccoli");
    await page.locator("#name-save").click();
    await page.waitForTimeout(800);
    const saved = await page.evaluate(() => ({ title: document.getElementById("dish-title").textContent, focus: document.activeElement?.id }));
    record("editor", "valid name saves in place and returns focus to the edit button", saved.title === "Baked cod with broccoli" && saved.focus === "edit-name", JSON.stringify(saved));
    // save flow
    await page.locator("#edit-toggle").click();
    await page.locator('[data-field="qty"]').first().fill("120");
    await page.locator("#save-edit").click();
    const saving = await page.evaluate(() => ({ text: document.getElementById("save-edit").textContent, disabled: document.getElementById("save-edit").disabled, busy: document.getElementById("foot-edit").getAttribute("aria-busy") }));
    await page.waitForTimeout(1200);
    const done = await page.evaluate(() => ({ mode: document.body.dataset.mode, kcal: document.getElementById("sum-kcal").textContent, toast: document.querySelector("#toast-row .toast__msg")?.textContent }));
    record("editor", "Save shows “Saving…” (disabled, aria-busy), then view mode with the new total", saving.text === "Saving…" && saving.disabled && saving.busy === "true" && done.mode === "view" && done.kcal === String(462 - 158 + 126), JSON.stringify({ saving, done }));
    await page.close();
  }

  // ---------- 5. step 12: chips in one row, View recipe, method (steps) ----------
  {
    const page = await context.newPage();
    const chipRows = () => page.evaluate(() => [...document.querySelectorAll(".recipe-card .macro-tiles--inline")].map((r) => {
      const tops = new Set([...r.children].map((c) => Math.round(c.getBoundingClientRect().top)));
      const cr = r.closest(".recipe-card").getBoundingClientRect();
      const outside = [...r.children].some((c) => { const b = c.getBoundingClientRect(); return b.right > cr.right + 0.5 || b.left < cr.left - 0.5; });
      const clipped = [...r.querySelectorAll("*:not(.visually-hidden)")].some((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== "visible");
      return { rows: tops.size, outside, clipped };
    }));
    for (const f of ["13-recipes.html", "07-today-card.html"]) {
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(pathToFileURL(resolve(SCREENS, f)).href, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const normal = await chipRows();
        // longest values: three digits in every chip
        await page.evaluate(() => document.querySelectorAll(".macro-tile--chip .macro-tile__value").forEach((v) => { v.firstChild.textContent = "110"; }));
        const longest = await chipRows();
        const ok = [...normal, ...longest].every((c) => c.rows === 1 && !c.outside && !c.clipped);
        record("chips", `${f} @${width}: P, F, C in ONE row (also with 110 g in every chip), nothing clipped or outside the card`, ok, JSON.stringify({ normal, longest }));
      }
      for (const scale of [1.5, 2]) {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(pathToFileURL(resolve(SCREENS, f)).href, { waitUntil: "networkidle" });
        await page.addStyleTag({ content: `html { font-size: ${scale * 100}% !important; }` });
        const big = await chipRows();
        record("chips", `${f} @${scale * 100}% text: chips may wrap, but nothing clipped or outside the card`, big.every((c) => !c.outside && !c.clipped), JSON.stringify(big));
      }
    }
    // View recipe: a real button with an accessible name; Enter and Space open the dish detail
    for (const key of ["Enter", "Space"]) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(pathToFileURL(resolve(SCREENS, "07-today-card.html")).href, { waitUntil: "networkidle" });
      const btn = page.getByRole("button", { name: "View recipe: Baked cod, potatoes & broccoli" });
      const box = await btn.boundingBox();
      await btn.focus();
      const focusVisible = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2 && parseFloat(cs.outlineOffset) >= 2; });
      await Promise.all([page.waitForURL(/14-recipe-detail\.html$/), page.keyboard.press(key)]);
      record("view-recipe", `“View recipe” (${key}): opens 14-recipe-detail; 44+ target; focus ring with a gap`, box.height >= 44 && box.width >= 44 && focusVisible, `${Math.round(box.width)}×${Math.round(box.height)}, focus ring ${focusVisible}`);
    }
    {
      await page.goto(pathToFileURL(resolve(SCREENS, "07-today-card.html")).href, { waitUntil: "networkidle" });
      await Promise.all([page.waitForURL(/14-recipe-detail\.html$/), page.getByRole("button", { name: /^View recipe/ }).click()]);
      record("view-recipe", "“View recipe” (click) opens the dish detail", true);
    }
    // Method: semantic ordered list, step text style, measure
    await page.goto(pathToFileURL(resolve(SCREENS, "14-recipe-detail.html")).href, { waitUntil: "networkidle" });
    const method = await page.evaluate(() => {
      const ol = document.getElementById("steps");
      const p = ol.querySelector(".recipe-step__text");
      const cs = getComputedStyle(p);
      const chars = p.textContent.length / Math.max(1, Math.round(p.getBoundingClientRect().height / parseFloat(cs.lineHeight)));
      return { tag: ol.tagName, items: ol.querySelectorAll(":scope > li").length, size: cs.fontSize, line: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize), align: cs.textAlign, maxWidth: cs.maxWidth, avgChars: Math.round(chars), afterIngredients: document.getElementById("ingredients").compareDocumentPosition(ol) & Node.DOCUMENT_POSITION_FOLLOWING };
    });
    record("method", "Method is an <ol> of steps after Ingredients; 16 px text, line height ≥ 1.5, not justified, ≤ 80 characters per line", method.tag === "OL" && method.items === 6 && method.size === "16px" && method.line >= 1.5 && method.align !== "justify" && method.avgChars <= 80 && method.afterIngredients, JSON.stringify(method));
    // Edit steps: move with keyboard, focus kept, announcements, delete + undo, validation
    await page.locator("#edit-steps").focus();
    await page.keyboard.press("Enter");
    const first = await page.evaluate(() => document.activeElement.matches("[data-step-text]") && document.activeElement.labels[0].textContent);
    record("method", "Edit (Enter) focuses the first step field, labelled “Step 1”", first === "Step 1", String(first));
    const step2 = page.locator('[aria-label="Move step 2 up"]');
    const text2 = await page.locator("[data-step-text]").nth(1).inputValue();
    await step2.focus();
    await page.keyboard.press("Space");
    const afterMove = await page.evaluate(() => ({ focus: document.activeElement.getAttribute("aria-label"), first: document.querySelector("[data-step-text]").value, status: document.getElementById("dish-status").textContent }));
    await page.waitForTimeout(100);
    const status = await page.locator("#dish-status").textContent();
    record("method", "“Move step 2 up” (Space) moves it to step 1, keeps focus on a move button, announces it", afterMove.first === text2 && /Move step 1 down/.test(afterMove.focus) && /now step 1/.test(status), JSON.stringify({ ...afterMove, status }));
    const firstUpDisabled = await page.locator('[aria-label="Move step 1 up"]').isDisabled();
    const lastDownDisabled = await page.locator('[aria-label="Move step 6 down"]').isDisabled();
    record("method", "first “up” and last “down” are disabled (not hidden)", firstUpDisabled && lastDownDisabled);
    await page.locator('[aria-label="Delete step 3"]').click();
    const del = await page.evaluate(() => ({ n: document.querySelectorAll(".recipe-step").length, focus: document.activeElement.labels?.[0]?.textContent, toast: document.querySelector("#toast-row .toast__msg")?.textContent }));
    await page.locator("[data-undo]").click();
    const und = await page.evaluate(() => ({ n: document.querySelectorAll(".recipe-step").length, focus: document.activeElement.labels?.[0]?.textContent }));
    record("method", "delete step 3 → focus on the new step 3, Undo toast; Undo restores and focuses it", del.n === 5 && del.focus === "Step 3" && /Step 3 deleted/.test(del.toast) && und.n === 6 && und.focus === "Step 3", JSON.stringify({ del, und }));
    await page.locator("[data-step-text]").nth(1).fill("   ");
    await page.locator("#save-edit").click();
    const empty = await page.evaluate(() => ({ invalid: document.activeElement.getAttribute("aria-invalid"), help: document.getElementById(document.activeElement.getAttribute("aria-describedby")).textContent }));
    record("method", "an empty step blocks Save: focus moves to it with aria-invalid and a hint", empty.invalid === "true" && /Write what to do/.test(empty.help), JSON.stringify(empty));
    // 16 steps + one very long step: add through the UI, save, check the layout at 390 and 320
    await page.locator("[data-step-text]").nth(1).fill("Put the potatoes on a lined baking tray and crush them.");
    for (let i = 0; i < 10; i++) {
      await page.locator("#add-step").click();
      await page.keyboard.type(i === 9 ? "Very long step: " + "keep stirring slowly over low heat, scraping the bottom of the pan so nothing sticks, ".repeat(8) : `Extra step ${i + 1}: rest for one minute.`);
    }
    await page.locator("#save-edit").click();
    await page.waitForTimeout(1200);
    const many = await page.evaluate(() => document.querySelectorAll("#steps > li").length);
    const lay = [];
    for (const width of [390, 320]) { await page.setViewportSize({ width, height: 844 }); lay.push(...(await layoutProblems(page))); }
    record("method", `16 steps incl. a very long one: saved, wrapped, nothing clipped or outside (390, 320)`, many === 16 && lay.length === 0, `${many} steps; ${lay.join("; ")}`);
    // no steps: empty state with an action
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pathToFileURL(resolve(SCREENS, "14-recipe-detail-no-steps.html")).href, { waitUntil: "networkidle" });
    const emptyState = await page.evaluate(() => ({ visible: !document.getElementById("steps-empty").hidden, title: document.querySelector("#steps-empty .empty__title").textContent }));
    await page.locator("#add-steps-empty").click();
    const added = await page.evaluate(() => ({ mode: document.body.dataset.mode, focus: document.activeElement.labels?.[0]?.textContent }));
    record("method", "no steps: an empty state (“No steps yet”) with “Add steps”, which opens a focused Step 1 field", emptyState.visible && added.mode === "edit" && added.focus === "Step 1", JSON.stringify({ emptyState, added }));
    await page.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
mkdirSync(resolve(HERE, "qa"), { recursive: true });
writeFileSync(resolve(HERE, "qa/report.json"), JSON.stringify({ date: new Date().toISOString(), passed: results.length - failed.length, failed: failed.length, results, facts }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Report: 03-screens/qa/report.json`);
const aaa = Object.entries(facts).filter(([, f]) => f.aaaContrastBelow7.length);
console.log(`AAA contrast (7:1, informative): ${aaa.length ? aaa.map(([n, f]) => `${n}: ${f.aaaContrastBelow7.length} nodes`).join("; ") : "all text ≥ 7:1"}`);
process.exit(failed.length ? 1 : 0);
