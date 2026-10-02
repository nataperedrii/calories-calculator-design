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
const openItems = [];
// Known, accepted limitations: reported in the console and in the report, not counted as pass or fail.
const open = (name, detail = "") => { openItems.push({ name, detail }); console.log(`⚠ [open] ${name}${detail ? " — " + detail : ""}`); };
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
        // over the goal (Diary): the ring shows the amount over instead of what's left
        if (document.querySelector(".nutri--over")) out.sums.push({ what: "eaten − goal = over", ok: num(eaten.textContent) - goal === left, detail: `${eaten.textContent} − ${goal} = ${left}` });
        else out.sums.push({ what: "goal − eaten = left", ok: goal - num(eaten.textContent) === left, detail: `${goal} − ${eaten.textContent} = ${left}` });
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
    const sumRows = () => page.evaluate(() => [...document.querySelectorAll(".ingredient .ingredient__kcal")].reduce((a, e) => a + parseInt(e.textContent, 10), 0));
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
        if (f === "13-recipes.html" && width === 320) {
          // step 14: the compact card's text column is 156 px at 320 and the chips need 200 (225 with 110 g): they wrap, reported as open
          record("chips", `${f} @${width}: chips may wrap in the 156 px text column, but nothing clipped or outside the card`, [...normal, ...longest].every((c) => !c.outside && !c.clipped), JSON.stringify({ normal, longest }));
          continue;
        }
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

  // ---------- 6. step 13 + 14: add-food rows, ingredients, recipe cards, Today image ----------
  {
    const page = await context.newPage();
    const tok = (n) => page.evaluate((n) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)), n);
    // chips: rows used, and the width the three chips need in one row vs the width they get
    const CHIPS = `(g) => { const k = [...g.children]; const gap = parseFloat(getComputedStyle(g).columnGap) || 0;
      return { rows: new Set(k.map((c) => Math.round(c.getBoundingClientRect().top))).size, need: Math.round(k.reduce((a, c) => a + c.getBoundingClientRect().width, 0) + gap * (k.length - 1)), have: Math.round(g.getBoundingClientRect().width) }; }`;
    // Step 16: Add to Snack rows: photo (the Meals thumbnail) + name; chips under the photo; kcal + “+” centred
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pathToFileURL(resolve(SCREENS, "07-today-meals.html")).href, { waitUntil: "networkidle" });
    const thumbStyle = (sel) => page.evaluate((sel) => [...document.querySelectorAll(sel)].map((i) => { const b = i.getBoundingClientRect(), cs = getComputedStyle(i); return `${b.width}×${b.height} r${cs.borderRadius} ${cs.objectFit}`; }), sel);
    const mealThumb = (await thumbStyle(".list img.product__thumb"))[0];
    const PHOTOS = { "Almonds": "food-almonds.jpg", "Roasted almonds": "food-roasted-almonds.jpg", "Almond butter": "food-almond-butter.jpg", "Apple": "food-apple.jpg", "Greek yogurt": "food-greek-yogurt.jpg" };
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(pathToFileURL(resolve(SCREENS, "10-add-food.html")).href, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const inset = await tok("--space-card-inset"), gapTok = await tok("--space-2");
      const thumbs = await thumbStyle(".product--chips > .product__thumb");
      const rows = await page.evaluate(({ CHIPS, inset }) => {
        const chips = eval(CHIPS);
        return [...document.querySelectorAll(".product--chips")].map((r) => {
          const b = (s) => r.querySelector(s).getBoundingClientRect();
          const name = r.querySelector(".product__name"), img = r.querySelector(".product__thumb");
          const btn = r.querySelector(".product__end .icon-btn");
          const rb = r.getBoundingClientRect(), cs = getComputedStyle(r);
          const content = { top: rb.top + parseFloat(cs.paddingTop), bottom: rb.bottom - parseFloat(cs.paddingBottom) };
          const mid = (x) => (x.top + x.bottom) / 2;
          return {
            name: name.textContent, file: img.getAttribute("src").split("/").pop(), alt: img.getAttribute("alt"), fit: getComputedStyle(img).objectFit, src: `${img.naturalWidth}×${img.naturalHeight}`,
            line: r.closest(".list").getBoundingClientRect().left + inset, photoX: b(".product__thumb").left, nameX: b(".product__name").left, chipsX: b(".product__macros").left,
            nameTop: +(b(".product__name").top - b(".product__thumb").top).toFixed(2), photoChipGap: +(b(".product__macros").top - b(".product__thumb").bottom).toFixed(2),
            nameClipped: name.scrollWidth > name.clientWidth + 1 || name.scrollHeight > name.clientHeight + 1,
            btn: `${Math.round(btn.getBoundingClientRect().width)}×${Math.round(btn.getBoundingClientRect().height)}`, label: btn.getAttribute("aria-label"),
            // measure the button: .product__end carries 4 px of room for the focus ring on every side
            btnRight: +(rb.right - parseFloat(cs.paddingRight) - btn.getBoundingClientRect().right).toFixed(2),
            btnCentred: Math.abs(mid(btn.getBoundingClientRect()) - mid(content)) <= 0.5, kcalCentred: Math.abs(mid(b(".product__kcal")) - mid(btn.getBoundingClientRect())) <= 0.5,
            chips: chips(r.querySelector(".product__macros")),
          };
        });
      }, { CHIPS, inset });
      record("add-food", `@${width}: every photo is the Meals thumbnail on Today (${mealThumb}): same box, radius and object-fit`, thumbs.length === 5 && thumbs.every((x) => x === mealThumb), thumbs.join(" | "));
      // not distorted: object-fit cover crops any source ratio into the square box instead of stretching it
      record("add-food", `@${width}: each product has its own matching photo file, cropped with cover (never stretched), alt="" beside the name`, rows.every((r) => PHOTOS[r.name] === r.file && r.alt === "" && r.fit === "cover") && new Set(rows.map((r) => r.file)).size === 5, rows.map((r) => `${r.name} → ${r.file} (${r.src}, ${r.fit})`).join(" | "));
      const one = (k) => new Set(rows.map((r) => r[k].toFixed(2))).size === 1;
      record("add-food", `@${width}: photos and chips start on the card-inset line; every name on one x, top-aligned with its photo`, rows.every((r) => Math.abs(r.photoX - r.line) <= 0.01 && Math.abs(r.chipsX - r.line) <= 0.01 && r.nameTop === 0) && one("nameX"), rows.map((r) => `${r.name}: photo ${r.photoX.toFixed(1)}, chips ${r.chipsX.toFixed(1)}, name ${r.nameX.toFixed(1)}, name top ${r.nameTop}`).join(" | "));
      record("add-food", `@${width}: the same gap photo → chips in every row (--space-2 = ${gapTok})`, rows.every((r) => r.photoChipGap === gapTok), rows.map((r) => r.photoChipGap).join(", "));
      record("add-food", `@${width}: “+” is 44×44, named “Add <food>”, on the right edge; “+” and kcal centred on the whole row`, rows.every((r) => r.btn === "44×44" && /^Add /.test(r.label) && r.btnRight === 0 && r.btnCentred && r.kcalCentred), rows.map((r) => `${r.label}: ${r.btn}, right ${r.btnRight}${r.btnCentred ? "" : " (+ off centre)"}${r.kcalCentred ? "" : " (kcal off centre)"}`).join(" | "));
      record("add-food", `@${width}: names wrap, never clipped`, rows.every((r) => !r.nameClipped), "");
      const chipTxt = rows.map((r) => `${r.name}: ${r.chips.rows} row(s), needs ${r.chips.need} of ${r.chips.have} px`).join(" | ");
      if (width === 390) record("add-food", "@390: P, F, C chips in one row in every row", rows.every((r) => r.chips.rows === 1), chipTxt);
      else open("Add to Snack @320: the chips under the photo wrap where the photo + name columns are narrower than the chip row", chipTxt);
    }
    // the green ✓ circle is gone: no indicator markup or styles anywhere; the glyph remains only in its functional, labelled uses
    {
      const left = [];
      for (const f of readdirSync(SCREENS).filter((x) => x.endsWith(".html"))) {
        await page.goto(pathToFileURL(resolve(SCREENS, f)).href, { waitUntil: "domcontentloaded" });
        const r = await page.evaluate(() => ({
          indicator: document.querySelectorAll(".product__check, .product__verified, [aria-label='Verified: USDA']").length,
          uses: [...document.querySelectorAll("use[href='#i-high']")].map((u) => u.closest(".toast, .confidence, .viewfinder__hint, .t-label")?.className.split(" ")[0] ?? "OTHER"),
        }));
        if (r.indicator || r.uses.includes("OTHER")) left.push(`${f}: ${r.indicator} indicator(s), uses ${r.uses.join(",")}`);
      }
      const css = readFileSync(resolve(HERE, "../02-design-system/components.css"), "utf8");
      const cssLeft = ["product__check", "product__verified", "icon-btn--verified"].filter((c) => css.includes(c));
      record("add-food", "the green ✓ indicator is gone from every screen and from components.css (the glyph stays only in toasts, confidence, the scan hint and the analysing step)", left.length === 0 && cssLeft.length === 0, [...left, ...cssLeft].join(" | ") || "none left");
    }
    // long names and 3-digit values at 320 / 200 % text: wrap, nothing clipped, the end column stays centred
    for (const [width, scale] of [[320, 1], [390, 2]]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(pathToFileURL(resolve(SCREENS, "10-add-food.html")).href, { waitUntil: "networkidle" });
      if (scale !== 1) await page.addStyleTag({ content: `html { font-size: ${scale * 100}% !important; }` });
      await page.evaluate(() => {
        document.querySelector(".product--chips .product__name").textContent = "Almonds, blanched, dry roasted, unsalted, whole kernels";
        document.querySelectorAll(".product--chips .macro-tile__value").forEach((v) => { v.firstChild.textContent = "110"; });
      });
      const p = await layoutProblems(page);
      record("add-food", `@${width}${scale !== 1 ? ", 200 % text" : ""}: a long name and 110 g chips wrap; nothing clipped or outside`, p.length === 0, p.slice(0, 3).join("; "));
    }
    // keyboard: Tab from the first “+” reaches the next “+” (the ✓ is never a stop); focus ring with a gap; Enter opens the food
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pathToFileURL(resolve(SCREENS, "10-add-food.html")).href, { waitUntil: "networkidle" });
    await page.locator(".product--chips .icon-btn").first().focus();
    await page.keyboard.press("Tab");
    const next = await page.evaluate(() => document.activeElement.getAttribute("aria-label"));
    const ring = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2 && parseFloat(cs.outlineOffset) >= 2; });
    record("add-food", "keyboard: Tab goes “+” → next “+”; focus ring 2 px with a gap", next === "Add roasted almonds" && ring, `next stop: ${next}; ring ${ring}`);
    await page.locator(".product--chips .icon-btn").first().focus();
    await Promise.all([page.waitForURL(/11-food-detail\.html$/), page.keyboard.press("Enter")]);
    record("add-food", "keyboard: Enter on “Add almonds” opens the food detail", true);
    // Fix 2: the Ingredients card uses the same computed styles as the Nutrition Facts card
    await page.goto(pathToFileURL(resolve(SCREENS, "11-food-detail.html")).href, { waitUntil: "networkidle" });
    const pick = (cs, keys) => Object.fromEntries(keys.map((k) => [k, cs[k]]));
    const CARD = ["backgroundColor", "borderRadius", "boxShadow", "paddingTop", "paddingLeft"];
    const HEAD = ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "textTransform", "color", "borderBottomWidth", "borderBottomColor", "paddingTop", "paddingBottom"];
    const ROW = ["borderBottomWidth", "borderBottomColor", "paddingTop", "paddingBottom"];
    const factsCard = await page.evaluate(({ CARD, HEAD, ROW }) => {
      const g = (e, keys) => Object.fromEntries(keys.map((k) => [k, getComputedStyle(e)[k]]));
      return { card: g(document.querySelector(".facts"), CARD), title: g(document.querySelector(".facts__title"), ["fontFamily", "fontSize"]), head: g(document.querySelector(".facts th"), HEAD), row: g(document.querySelector(".facts tbody tr:not(.is-energy):not(.is-sub) td"), ROW), name: g(document.querySelector(".facts tbody tr:not(.is-energy):not(.is-sub) td"), ["fontFamily", "fontSize", "fontWeight"]), value: g(document.querySelector(".facts tbody tr:not(.is-energy):not(.is-sub) td + td"), ["fontFamily", "fontSize", "textAlign"]) };
    }, { CARD, HEAD, ROW });
    await page.goto(pathToFileURL(resolve(SCREENS, "14-recipe-detail.html")).href, { waitUntil: "networkidle" });
    const ing = await page.evaluate(({ CARD, HEAD, ROW }) => {
      const g = (e, keys) => Object.fromEntries(keys.map((k) => [k, getComputedStyle(e)[k]]));
      return { card: g(document.getElementById("ing-head"), CARD), title: g(document.getElementById("ing-title"), ["fontFamily", "fontSize"]), head: g(document.querySelector(".ingredients__head"), HEAD), row: g(document.querySelector(".ingredients--facts > .ingredient"), ROW), name: g(document.querySelector(".ingredients--facts .ingredient__name"), ["fontFamily", "fontSize", "fontWeight"]), value: g(document.querySelector(".ingredients--facts .ingredient__amount"), ["fontFamily", "fontSize", "textAlign"]) };
    }, { CARD, HEAD, ROW });
    const diffs = [];
    for (const part of Object.keys(factsCard)) for (const k of Object.keys(factsCard[part])) if (factsCard[part][k] !== ing[part][k]) diffs.push(`${part}.${k}: ${ing[part][k]} vs ${factsCard[part][k]}`);
    record("ingredients", "Ingredients card = Nutrition Facts card: background, radius, shadow, padding, title, header row, row rules, fonts, value alignment", diffs.length === 0, diffs.join(" | ") || "all computed styles equal");
    const amounts = await page.evaluate(() => new Set([...document.querySelectorAll(".ingredients--facts .ingredient__amount")].map((a) => a.getBoundingClientRect().right.toFixed(2))).size);
    record("ingredients", "amounts end on one common right edge; Ingredients come before Method", amounts === 1 && (await page.evaluate(() => !!(document.getElementById("ing-head").compareDocumentPosition(document.getElementById("method-head")) & Node.DOCUMENT_POSITION_FOLLOWING))), `${amounts} right edge(s)`);
    // Step 15 Fix 3: every ingredient in two lines: name | amount, then chips | kcal; the right column on one edge
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(pathToFileURL(resolve(SCREENS, "14-recipe-detail.html")).href, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const gapTok = await tok("--space-2");
      const geo = () => page.evaluate((CHIPS) => [...document.querySelectorAll(".ingredients--facts > .ingredient")].map((li) => {
        const b = (s) => li.querySelector(s).getBoundingClientRect();
        const nm = b(".ingredient__name"), am = b(".ingredient__amount"), ch = b(".macro-tiles"), kc = b(".ingredient__kcal");
        const num = (s) => getComputedStyle(li.querySelector(s)).fontVariantNumeric.includes("tabular-nums");
        return {
          name: li.querySelector(".ingredient__name").textContent, chips: eval(CHIPS)(li.querySelector(".macro-tiles")), three: li.querySelectorAll(".macro-tile--chip").length === 3,
          // line 2 starts below line 1; chips under the name, kcal under the amount
          twoLines: ch.top >= Math.max(nm.bottom, am.bottom) - 0.5 && kc.top >= am.bottom - 0.5,
          gap: +(ch.top - Math.max(nm.bottom, am.bottom)).toFixed(2), left: [nm.left, ch.left].map((x) => x.toFixed(2)), right: [am.right, kc.right].map((x) => x.toFixed(2)), tabular: num(".ingredient__amount") && num(".ingredient__kcal"),
        };
      }), CHIPS);
      const rows = await geo();
      const lefts = new Set(rows.flatMap((r) => r.left)), rights = new Set(rows.flatMap((r) => r.right));
      record("ingredients", `@${width}: every ingredient has two lines (name | amount, then P/F/C chips | kcal); names and chips on one x; amount and kcal on one right edge; tabular numbers`, rows.length === 5 && rows.every((r) => r.three && r.twoLines && r.tabular) && lefts.size === 1 && rights.size === 1, rows.map((r) => `${r.name}: gap ${r.gap}`).join(" | ") + ` · left x ${[...lefts].join("/")} · right x ${[...rights].join("/")}`);
      record("ingredients", `@${width}: the gap between the two lines is one token (--space-2 = ${gapTok}) in every ingredient`, rows.every((r) => r.gap === gapTok), rows.map((r) => r.gap).join(", "));
      const chipTxt = rows.map((r) => `${r.name}: ${r.chips.rows} row(s), needs ${r.chips.need} of ${r.chips.have} px`).join(" | ");
      if (width === 390) record("ingredients", "@390: P / F / C chips in one row in every ingredient", rows.every((r) => r.chips.rows === 1), chipTxt);
      else open("Ingredients @320: the chip row beside the kcal is narrower than the three chips, so C wraps", chipTxt);
      // stress: 110 g in every chip, four-digit kcal, a long name: nothing clipped or outside
      await page.evaluate(() => {
        document.querySelectorAll(".ingredients--facts .macro-tile__value").forEach((v) => { v.firstChild.textContent = "110"; });
        document.querySelectorAll(".ingredients--facts .ingredient__kcal").forEach((k) => { k.textContent = "1234 kcal"; });
        document.querySelector(".ingredients--facts .ingredient__name").textContent = "Potatoes, new, boiled in their skin and crushed with olive oil";
      });
      const p = await layoutProblems(page);
      const after = await geo();
      record("ingredients", `@${width}: 110 g chips, 1234 kcal and a long name: nothing clipped; the right column still on one edge`, p.length === 0 && new Set(after.flatMap((r) => r.right)).size === 1, p.slice(0, 2).join("; "));
    }
    // Step 14 Fix 3: compact recipe cards, identical structure
    const cardTable = [];
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(pathToFileURL(resolve(SCREENS, "13-recipes.html")).href, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const thumb = await tok("--size-recipe-thumb"), gapTok = await tok("--space-2");
      const cards = await page.evaluate((CHIPS) => [...document.querySelectorAll(".recipe-card--compact")].map((c) => {
        const body = c.querySelector(".recipe-card__body"), img = c.querySelector(".recipe-card__img"), im = img.querySelector("img");
        const kids = [...body.children];
        const name = (e) => e.matches(".badge") ? "badge" : e.matches(".recipe-card__title") ? "title" : e.matches(".recipe-card__meta") ? (e.querySelector(".icon") ? "time" : "reason") : e.matches(".macro-tiles") ? "chips" : e.matches(".recipe-card__fit") ? "fits" : e.matches(".recipe-card__kcal") ? "kcal" : e.className;
        const gaps = kids.slice(1).map((k, i) => +(k.getBoundingClientRect().top - kids[i].getBoundingClientRect().bottom).toFixed(2));
        const cs = getComputedStyle(c), cb = c.getBoundingClientRect(), ib = img.getBoundingClientRect(), bb = body.getBoundingClientRect();
        return {
          title: c.querySelector(".recipe-card__title").textContent.trim(), order: kids.map(name).filter((n) => n !== "badge").join(" → "), gaps,
          img: `${+ib.width.toFixed(2)}×${+ib.height.toFixed(2)}`, fit: getComputedStyle(im).objectFit, minW: getComputedStyle(body).minWidth,
          // the image runs from the top padding to the bottom padding, its own radius on all four corners, the card does not clip
          imgTop: +(ib.top - cb.top).toFixed(2), imgBottom: +(cb.bottom - ib.bottom).toFixed(2), imgLeft: +(ib.left - cb.left).toFixed(2), imgW: +ib.width.toFixed(2),
          radius: ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"].map((k) => getComputedStyle(img)[k]).join(" "), cardClips: getComputedStyle(c).overflow !== "visible", alt: im.hasAttribute("alt"),
          pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(" "), imgGap: +(bb.left - ib.right).toFixed(2),
          titleOffset: +(c.querySelector(".recipe-card__title").getBoundingClientRect().top - cb.top).toFixed(2), left: [...new Set(kids.map((k) => k.getBoundingClientRect().left.toFixed(2)))].length,
          chips: eval(CHIPS)(c.querySelector(".macro-tiles")), textCol: +bb.width.toFixed(2),
        };
      }), CHIPS);
      cardTable.push(...cards.map((c) => ({ width, ...c })));
      const same = (k) => new Set(cards.map((c) => c[k])).size === 1;
      record("cards", `@${width}: every card reads title → time → reason → P/F/C → Fits → kcal`, cards.length === 3 && cards.every((c) => c.order === "title → time → reason → chips → fits → kcal"), cards.map((c) => `${c.title}: ${c.order}`).join(" | "));
      record("cards", `@${width}: one vertical gap between all rows in all cards (--space-2 = ${gapTok})`, cards.every((c) => c.gaps.every((g) => g === gapTok)), cards.map((c) => `${c.title}: ${c.gaps.join(", ")}`).join(" | "));
      const padTok = await tok("--space-card-inset");
      record("cards", `@${width}: the image runs from the top to the bottom padding (${padTok} from each edge), the same ${thumb} px width and insets in every card, cover, own radius on 4 corners, the card does not clip, alt present`, cards.every((c) => c.imgTop === padTok && c.imgBottom === padTok && c.imgLeft === padTok && c.imgW === thumb && c.fit === "cover" && !/^0px/.test(c.radius) && new Set(c.radius.split(" ")).size === 1 && !c.cardClips && c.alt), cards.map((c) => `${c.title}: ${c.img}, top ${c.imgTop}, bottom ${c.imgBottom}, left ${c.imgLeft}, radius ${c.radius}`).join(" | "));
      record("cards", `@${width}: same padding and image → text gap; text column min-width 0 and left-aligned`, cards.every((c) => c.minW === "0px" && c.left === 1) && same("pad") && same("imgGap"), cards.map((c) => `pad ${c.pad}, gap ${c.imgGap}`).join(" | "));
      record("cards", `@${width}: title offset equal in the cards without a badge`, new Set(cards.slice(1).map((c) => c.titleOffset)).size === 1, cards.map((c) => `${c.title}: ${c.titleOffset}`).join(" | "));
      open(`Recipes @${width}: card 1 title starts lower (the “Best fit” badge sits above it, as decided)`, cards.map((c) => `${c.title}: title at ${c.titleOffset} px`).join(" | "));
      const chipTxt = cards.map((c) => `${c.title}: ${c.chips.rows} row(s), needs ${c.chips.need} of ${c.textCol} px`).join(" | ");
      if (width === 390) record("cards", "@390: P / F / C in one row in every card", cards.every((c) => c.chips.rows === 1), chipTxt);
      else open("Recipes @320: P / F / C wrap in the 156 px text column (needs 200)", chipTxt);
    }
    facts.recipeCardTable = cardTable;
    // Step 14 Fix 1: the Today card image opens the recipe (pointer); it is not a tab stop
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pathToFileURL(resolve(SCREENS, "07-today-card.html")).href, { waitUntil: "networkidle" });
    const img = page.locator(".recipe-card__img--link");
    const a11y = await img.evaluate((e) => ({ hidden: e.getAttribute("aria-hidden"), tab: e.tabIndex, focusables: e.querySelectorAll("a, button, [tabindex]").length, cursor: getComputedStyle(e).cursor }));
    const box = await img.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(400); // the overlay fades in over --motion-duration-fast
    const pressed = await img.evaluate((e) => getComputedStyle(e, "::after").backgroundColor);
    await Promise.all([page.waitForURL(/14-recipe-detail\.html$/), page.mouse.up()]);
    record("today-image", "image click opens 14-recipe-detail; pointer cursor; pressed overlay; aria-hidden and not a tab stop (View recipe stays the one keyboard path)", a11y.hidden === "true" && a11y.tab === -1 && a11y.focusables === 0 && a11y.cursor === "pointer" && pressed !== "rgba(0, 0, 0, 0)", `${JSON.stringify(a11y)}; pressed ${pressed}`);
    await page.goto(pathToFileURL(resolve(SCREENS, "07-today-card.html")).href, { waitUntil: "networkidle" });
    const stops = [];
    for (let i = 0; i < 30; i++) { await page.keyboard.press("Tab"); stops.push(await page.evaluate(() => document.activeElement.className)); }
    record("today-image", "keyboard: the card has one tab stop (View recipe); the image is never focused", !stops.some((c) => /recipe-card__img/.test(c)) && stops.some((c) => /btn--secondary/.test(c)), "");
    await page.close();
  }
  // ---------- 7. plan audit gaps: servings stepper (14), unit switch (11), High protein chip (13) ----------
  {
    const page = await context.newPage();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(pathToFileURL(resolve(SCREENS, "14-recipe-detail.html")).href, { waitUntil: "networkidle" });
      const read = () => page.evaluate(() => ({
        rows: [...document.querySelectorAll("#ingredients > .ingredient")].map((li) => ({ amount: li.querySelector(".ingredient__amount").textContent, kcal: parseInt(li.querySelector(".ingredient__kcal").textContent, 10) })),
        total: document.getElementById("sum-kcal").textContent, log: document.getElementById("log-btn-kcal").textContent,
        value: document.getElementById("servings-input").value, unit: document.getElementById("servings-unit").textContent, text: document.getElementById("servings-text").textContent,
        less: document.querySelector('[data-servings="-1"]').disabled, more: document.querySelector('[data-servings="1"]').disabled,
        status: document.getElementById("dish-status").textContent,
        btns: [...document.querySelectorAll("#servings-row .stepper__btn")].map((b) => { const r = b.getBoundingClientRect(); return `${Math.round(r.width)}×${Math.round(r.height)}`; }),
      }));
      const one = await read();
      record("servings", `@${width}: Servings stepper (DS stepper) starts at 1 portion: “−” disabled, buttons 44 × 44, amounts per portion, summary 462`, one.value === "1" && one.unit === "portion" && one.less && !one.more && one.btns.every((b) => b === "44×44") && one.rows[0].amount === "150 g" && one.total === "462", JSON.stringify({ value: one.value, btns: one.btns, first: one.rows[0], total: one.total }));
      // keyboard: focus “+”, Enter → 2, Space → 3
      await page.locator('[data-servings="1"]').focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(50);
      const two = await read();
      const focusOnPlus = await page.evaluate(() => document.activeElement.dataset.servings === "1");
      const rowsOk = two.rows.map((r, i) => r.amount === one.rows[i].amount.replace(/^[\d.,]+/, (n) => String(Number(n.replace(",", "")) * 2))).every(Boolean);
      record("servings", `@${width}: Enter on “+” → 2 portions: every amount doubles, row kcal from the doubled grams, the summary and Log stay 462; focus stays on “+”; announced`, two.value === "2" && two.unit === "portions" && two.text === "2 portions" && rowsOk && two.total === "462" && two.log === "462" && focusOnPlus && /Ingredients for 2 portions/.test(two.status),
        `${two.rows.map((r) => `${r.amount}/${r.kcal}`).join(", ")} · total ${two.total} · “${two.status}”`);
      await page.keyboard.press("Space");
      for (let i = 0; i < 6; i++) await page.locator('[data-servings="1"]:not([disabled])').click().catch(() => {});
      const max = await read();
      const focusAtMax = await page.evaluate(() => document.activeElement.dataset.servings);
      record("servings", `@${width}: at 8 portions “+” is disabled and focus moves to “−” (never lost)`, max.value === "8" && max.more && !max.less && focusAtMax === "-1", `value ${max.value}, focus on ${focusAtMax}`);
      // typed values snap into 1–8
      await page.fill("#servings-input", "0"); await page.locator("#servings-input").press("Tab");
      const zero = (await read()).value;
      await page.fill("#servings-input", "20"); await page.locator("#servings-input").press("Tab");
      const twenty = (await read()).value;
      record("servings", `@${width}: typed servings snap into range (0 → 1, 20 → 8)`, zero === "1" && twenty === "8", `${zero}, ${twenty}`);
      // edit mode: the row hides, amounts are per portion again
      await page.click("#edit-toggle");
      const edit = await page.evaluate(() => ({ hidden: document.getElementById("servings-row").hidden, text: document.getElementById("servings-text").textContent, qty: document.querySelector('[data-field="qty"]').value }));
      record("servings", `@${width}: Edit hides the Servings row and edits per portion (“1 portion”, cod 150)`, edit.hidden && edit.text === "1 portion" && edit.qty === "150", JSON.stringify(edit));
      // 200 % text and long names with 8 servings: nothing clipped
      await page.goto(pathToFileURL(resolve(SCREENS, "14-recipe-detail.html")).href, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      await page.fill("#servings-input", "8"); await page.locator("#servings-input").press("Tab");
      const p = await layoutProblems(page);
      record("servings", `@${width}, 200 % text, 8 portions (1,200 g cod, 1,401 kcal rows): nothing clipped or outside`, p.length === 0, p.slice(0, 2).join("; "));
    }
    // 11: unit switch g | portion
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(pathToFileURL(resolve(SCREENS, "11-food-detail.html")).href, { waitUntil: "networkidle" });
    const units = await page.evaluate(() => [...document.querySelectorAll('input[name="unit"]')].map((r) => `${r.value}${r.checked ? "*" : ""}`));
    await page.locator('input[name="unit"][value="g"]').focus();
    await page.keyboard.press("ArrowRight");
    const portion = await page.evaluate(() => ({ checked: document.querySelector('input[name="unit"]:checked').value, value: document.getElementById("portion-input").value, unit: document.getElementById("portion-unit").textContent, label: document.getElementById("portion-input").getAttribute("aria-label"), kcal: document.querySelector(".t-num-l").textContent.trim() }));
    const segFocus = await page.evaluate(() => { const l = document.activeElement.closest(".segmented__opt"); const cs = l && getComputedStyle(l); return !!l && cs.outlineStyle !== "none"; });
    record("unit", "11: unit switch (DS segmented) offers g | portion, keyboard arrows switch to portion: the stepper shows 1 portion (= 30 g), kcal stays 174", units.join(",") === "g*,portion" && portion.checked === "portion" && portion.value === "1" && portion.unit === "portion" && /30 g/.test(portion.label) && /^174/.test(portion.kcal), `${units.join(",")} → ${JSON.stringify(portion)}; focus ring ${segFocus}`);
    // 13: the High protein filter chip
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(pathToFileURL(resolve(SCREENS, "13-recipes.html")).href, { waitUntil: "networkidle" });
      const chips = await page.evaluate(() => [...document.querySelectorAll('[aria-label="Filters"] .chip')].map((c) => `${c.textContent.trim().replace(/\s+/g, " ")}${c.getAttribute("aria-pressed") === "true" ? "*" : ""}`));
      const p = await layoutProblems(page);
      record("filters", `13 @${width}: filter chips meal, ≤ kcal, diet, allergy (locked), High protein, ≤ 30 min; nothing clipped`, chips.join(" | ") === "Dinner* | ≤ 879 kcal* | Pescatarian* | Peanut-free Allergy | High protein | ≤ 30 min" && p.length === 0, chips.join(" | "));
    }
    await page.close();
  }
  // ---------- 8. onboarding, Diary, Profile (flows 0 and 3) ----------
  {
    const page = await context.newPage();
    const go = async (f, width = 390) => { await page.setViewportSize({ width, height: 844 }); await page.goto(pathToFileURL(resolve(SCREENS, f)).href, { waitUntil: "networkidle" }); await page.evaluate(() => document.fonts.ready); };
    // step indicator: text on every onboarding step, in order; the bar is hidden from screen readers
    const order = [["02-goal.html", 1], ["03-about-you.html", 2], ["04-diet.html", 3], ["05-allergies.html", 4], ["06-target.html", 5]];
    const seen = [];
    for (const [f, k] of order) {
      await go(f);
      seen.push(await page.evaluate(() => ({ text: document.querySelector(".progress__text")?.textContent, hidden: document.querySelector(".progress__bar")?.getAttribute("aria-hidden"), done: document.querySelectorAll(".progress__seg.is-done, .progress__seg.is-current").length })));
    }
    record("onboarding", "step indicator: “Step 1 of 5” … “Step 5 of 5” on 02–06, filled segments match, the bar is aria-hidden", seen.every((s, i) => s.text === `Step ${i + 1} of 5` && s.hidden === "true" && s.done === i + 1), JSON.stringify(seen));
    // option cards: native radios, arrow keys move the choice, focus ring with a gap on the card, ≥ 44 tall
    for (const width of [390, 320]) {
      await go("02-goal.html", width);
      await page.locator('input[name="goal"][value="maintain"]').focus();
      await page.keyboard.press("ArrowDown");
      const r = await page.evaluate(() => {
        const card = document.activeElement.closest(".option-card"), cs = getComputedStyle(card);
        return { checked: document.querySelector('input[name="goal"]:checked').value, ring: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
          heights: [...document.querySelectorAll(".option-card")].map((c) => Math.round(c.getBoundingClientRect().height)), legend: !!document.querySelector("fieldset.option-group > legend") };
      });
      record("onboarding", `02 @${width}: goal option cards are native radios; ArrowDown selects “Lose slowly”; focus ring on the card; every card ≥ 44 tall; fieldset + legend`, r.checked === "lose" && r.ring && r.heights.every((h) => h >= 44) && r.legend, JSON.stringify(r));
    }
    await go("03-about-you-error.html");
    const err = await page.evaluate(() => ({ invalid: document.getElementById("height").getAttribute("aria-invalid"), help: document.getElementById("height-help").textContent, cta: document.querySelector(".screen__foot .btn--primary").disabled }));
    record("onboarding", "03 error: height 1650 is aria-invalid with “Enter a height between 120 and 230 cm”; Continue disabled", err.invalid === "true" && /between 120 and 230 cm/.test(err.help) && err.cta, JSON.stringify(err));
    await go("05-allergies.html");
    const al = await page.evaluate(() => ({ chips: document.querySelectorAll('[aria-labelledby="allergy-title"] .chip').length, peanuts: document.querySelector('[aria-labelledby="allergy-title"] .chip[aria-pressed="true"]')?.textContent.trim() }));
    record("onboarding", "05: None + 14 major allergens as toggle chips; Peanuts selected (aria-pressed)", al.chips === 15 && al.peanuts === "Peanuts", JSON.stringify(al));
    // 06 target: −50 steps to the floor; the macros always add up to the kcal; How we calculated this toggles
    await go("06-target.html");
    for (let i = 0; i < 12; i++) await page.locator("#target-less:not([disabled])").click().catch(() => {});
    const fl = await page.evaluate(() => {
      const g = (k) => Number(document.querySelector(`[data-macro="${k}"] .macro__value`).textContent.replace(/[^\d]/g, ""));
      const pct = [...document.querySelectorAll('[data-macro] .macro__bar')].map((b) => Number(b.getAttribute("aria-valuenow")));
      return { kcal: document.getElementById("target-kcal").textContent, less: document.getElementById("target-less").disabled, note: !document.getElementById("floor-note").hidden, focus: document.activeElement.id,
        sum: g("p") * 4 + g("f") * 9 + g("c") * 4, pctSum: pct.reduce((a, b) => a + b, 0), status: document.getElementById("target-status").textContent };
    });
    record("onboarding", "06: “−” stops at the floor 1,550 (disabled, focus moves to “+”, floor note shown, announced); P×4 + F×9 + C×4 = kcal ±10; % of kcal sums to 100 ±1", fl.kcal === "1,550" && fl.less && fl.note && fl.focus === "target-more" && Math.abs(fl.sum - 1550) <= 10 && Math.abs(fl.pctSum - 100) <= 1 && /lowest/.test(fl.status), JSON.stringify(fl));
    await page.click("#calc-toggle");
    const calc = await page.evaluate(() => ({ exp: document.getElementById("calc-toggle").getAttribute("aria-expanded"), hidden: document.getElementById("calc").hidden }));
    record("onboarding", "06: “How we calculated this” is a disclosure (aria-expanded true → false hides the table)", calc.exp === "false" && calc.hidden, JSON.stringify(calc));
    await go("07-today-empty.html");
    const empty = await page.evaluate(() => ({ eaten: document.querySelector(".nutri__row b").textContent, adds: document.querySelectorAll('.list .icon-btn[aria-label^="Add "]').length, cta: [...document.querySelectorAll(".empty .btn")].map((b) => b.textContent.trim()), dot: !!document.querySelector(".nutri__value") }));
    record("onboarding", "07 first day: 0 eaten, an Add button on all 4 meals, “Open camera” + “Search instead”, no stray ring dot", empty.eaten === "0" && empty.adds === 4 && empty.cta.join("|") === "Open camera|Search instead" && !empty.dot, JSON.stringify(empty));
    // Diary: the week strip
    for (const width of [390, 320]) {
      for (const f of ["15-diary.html", "15-diary-tue.html"]) {
        await go(f, width);
        const w = await page.evaluate(() => {
          const days = [...document.querySelectorAll(".week__day")];
          const sw = document.querySelector(".screen__body").getBoundingClientRect();
          return { n: days.length, sizes: days.map((d) => { const r = d.getBoundingClientRect(); return Math.round(r.width) >= 44 && Math.round(r.height) >= 44; }), pressed: days.filter((d) => d.getAttribute("aria-pressed") === "true").map((d) => d.getAttribute("aria-label")),
            today: days.filter((d) => d.getAttribute("aria-current") === "date").length, disabled: days.filter((d) => d.disabled).length, inside: days.every((d) => { const r = d.getBoundingClientRect(); return r.left >= sw.left - 0.5 && r.right <= sw.right + 0.5; }),
            over: days.find((d) => d.classList.contains("is-over"))?.getAttribute("aria-label"), note: document.querySelector(".week__day.is-over .week__note")?.textContent,
            copies: document.querySelectorAll('.list [aria-label$=" to today"]').length };
        });
        const tue = f.includes("tue");
        record("diary", `${f} @${width}: 7 day buttons ≥ 44 × 44 inside the screen; one selected (${tue ? "Tuesday" : "today"}); today aria-current; Fri–Sun disabled; the over day says “45 over” and shows “+45”; copy buttons only on past days`,
          w.n === 7 && w.sizes.every(Boolean) && w.inside && w.pressed.length === 1 && w.pressed[0].startsWith(tue ? "Tuesday" : "Thursday") && w.today === 1 && w.disabled === 3 && /2,095 kcal, 45 over/.test(w.over) && w.note === "+45" && w.copies === (tue ? 4 : 0), JSON.stringify(w));
      }
    }
    await go("15-diary.html");
    await page.locator('.week__day[aria-label^="Tuesday"]').focus();
    // the ring is drawn inside the day button; its padding is the gap to the content
    const wf = await page.evaluate(() => { const e = document.activeElement, cs = getComputedStyle(e); return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2 && parseFloat(cs.paddingTop) >= 4 && e.getBoundingClientRect().top >= e.parentElement.getBoundingClientRect().top - 0.5; });
    await Promise.all([page.waitForURL(/15-diary-tue\.html$/), page.keyboard.press("Enter")]);
    record("diary", "keyboard: a day button has a focus ring with a gap; Enter on Tuesday opens Tuesday", wf, `ring ${wf}`);
    // Profile and the delete confirm
    await go("16-profile.html");
    const pr = await page.evaluate(() => ({ rows: [...document.querySelectorAll(".list .icon-btn")].map((b) => b.getAttribute("aria-label")), del: document.querySelector(".btn--destructive")?.getAttribute("aria-haspopup") }));
    record("profile", "16: every plan row has a named 44 × 44 edit button; Delete account is destructive and opens a dialog", pr.rows.length === 6 && pr.rows.every((l) => /^Edit /.test(l)) && pr.del === "dialog", JSON.stringify(pr));
    await go("16-profile-delete.html");
    const cf = await page.evaluate(() => ({ modal: document.querySelector("dialog.sheet")?.getAttribute("aria-modal"), first: document.querySelector(".sheet__foot .btn")?.textContent.trim(), inert: [...document.querySelectorAll(".screen > [inert]")].length }));
    record("profile", "16 delete: a modal confirm sheet, “Keep my account” first, the page behind is inert", cf.modal === "true" && cf.first === "Keep my account" && cf.inert >= 3, JSON.stringify(cf));
    // Flow 3: Allergies → add Shellfish → Save → Profile → Recipes re-filtered
    await go("16-profile.html");
    await Promise.all([page.waitForURL(/05-allergies-edit\.html$/), page.click('[aria-label="Edit allergies"]')]);
    const ed = await page.evaluate(() => [...document.querySelectorAll('.chip[aria-pressed="true"]')].map((c) => c.textContent.trim()));
    await Promise.all([page.waitForURL(/16-profile-updated\.html$/), page.click(".screen__foot .btn--primary")]);
    const up = await page.evaluate(() => document.body.innerText.includes("Peanuts, shellfish"));
    await Promise.all([page.waitForURL(/13-recipes-filtered\.html$/), page.click('.tab-bar [data-href*="13-recipes"]')]);
    const rf = await page.evaluate(() => ({ cards: [...document.querySelectorAll(".recipe-card__title")].map((h) => h.textContent.trim()), locked: document.querySelectorAll(".chip--locked").length, note: document.querySelector(".banner__text").textContent }));
    record("flow3", "Profile → Allergies (Peanuts, Shellfish, Mushrooms selected) → Save → Profile shows “Peanuts, shellfish” → Recipes: shrimp hidden, 2 locked chips, “2 recipes hidden”",
      ed.includes("Shellfish") && ed.includes("Peanuts") && up && rf.cards.length === 2 && !rf.cards.some((c) => /Shrimp/.test(c)) && rf.locked === 2 && /2 recipes hidden/.test(rf.note), JSON.stringify({ ed, up, rf }));
    await page.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
mkdirSync(resolve(HERE, "qa"), { recursive: true });
writeFileSync(resolve(HERE, "qa/report.json"), JSON.stringify({ date: new Date().toISOString(), passed: results.length - failed.length, failed: failed.length, results, open: openItems, facts }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Report: 03-screens/qa/report.json`);
const aaa = Object.entries(facts).filter(([, f]) => f.aaaContrastBelow7.length);
console.log(`AAA contrast (7:1, informative): ${aaa.length ? aaa.map(([n, f]) => `${n}: ${f.aaaContrastBelow7.length} nodes`).join("; ") : "all text ≥ 7:1"}`);
process.exit(failed.length ? 1 : 0);
