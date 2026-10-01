// Grid alignment check for every screen in 03-screens/screens (part of `npm run check`).
//   npm run check:align
// The grid comes from the design tokens, read from the page:
//   line 1  = --space-screen-margin (left) and width − margin (right)
//   line 2  = line 1 ± --space-card-inset (content inside cards, lists, banners, facts, rows)
// Glyphs, not 44 pt hit boxes, are aligned for plain icon buttons; text buttons align by their label.
// Tolerance is 0 px (|Δ| < 0.01). Runs at 390 and 320 CSS px wide. Exits 1 on any deviation.
// Writes 03-screens/qa/align-report.json.
import { chromium } from "playwright";
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCREENS = resolve(HERE, "screens");
const files = readdirSync(SCREENS).filter((f) => f.endsWith(".html")).sort();
const WIDTHS = [390, 320];

const browser = await chromium.launch();
const report = { date: new Date().toISOString(), widths: WIDTHS, screens: {}, sectionHeads: [] };
let deviations = 0;
let measured = 0;

try {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    for (const f of files) {
      await page.goto(pathToFileURL(resolve(SCREENS, f)).href, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const res = await page.evaluate(() => {
        const css = getComputedStyle(document.documentElement);
        const px = (v) => parseFloat(css.getPropertyValue(v));
        const screen = document.querySelector(".screen").getBoundingClientRect();
        const M = px("--space-screen-margin");
        const I = px("--space-card-inset");
        const L1 = screen.left + M, R1 = screen.right - M;
        const out = [];
        const name = (e) => {
          const cls = typeof e.className === "string" ? e.className.split(" ")[0] : e.tagName.toLowerCase();
          const txt = (e.getAttribute?.("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 28);
          return `${e.tagName.toLowerCase()}${cls ? "." + cls : ""}${txt ? ` "${txt}"` : ""}`;
        };
        const visible = (e) => {
          if (!e || e.closest("[hidden], .visually-hidden, dialog:not([open]), template, datalist")) return false;
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        // the box that should sit on the line: glyph for plain icon buttons, label for text buttons
        const edgeBox = (e) => {
          if (e.matches(".icon-btn:not(.icon-btn--surface):not(.icon-btn--tint):not(.icon-btn--inverse):not(.icon-btn--accent)")) {
            const g = e.querySelector("svg"); if (g) return g.getBoundingClientRect();
          }
          if (e.matches(".btn--ghost")) {
            const range = document.createRange(); range.selectNodeContents(e);
            return range.getBoundingClientRect();
          }
          return e.getBoundingClientRect();
        };
        const check = (e, side, line, rule) => {
          if (!visible(e)) return;
          const b = edgeBox(e);
          const v = side === "left" ? b.left : b.right;
          out.push({ el: name(e), side, at: +v.toFixed(2), line: +line.toFixed(2), d: +(v - line).toFixed(2), rule });
        };
        const fullWidth = (e) => {
          const d = getComputedStyle(e).display;
          return !/inline/.test(d) && !e.matches(".date-btn, .chip-row, .recipe-card__meta, .btn--ghost, .viewfinder__hint, .banner .btn");
        };

        // 1. app bars: glyphs on line 1
        for (const bar of document.querySelectorAll(".screen > .app-bar, .screen > header.app-bar")) {
          const kids = [...bar.children].filter(visible);
          const first = kids[0], last = kids[kids.length - 1];
          if (bar.matches(".app-bar--large")) check(bar.querySelector(".app-bar__title"), "left", L1, "large title on margin");
          else if (first && first.matches(".icon-btn")) check(first, "left", L1, "app bar leading glyph on margin");
          const lastBtn = last && (last.matches(".icon-btn") ? last : last.querySelector?.(".icon-btn:last-child"));
          if (lastBtn) check(lastBtn, "right", R1, "app bar trailing glyph on margin");
        }
        // 2. top-level blocks in the scrolling body
        for (const body of document.querySelectorAll(".screen__body")) {
          for (const e of body.children) {
            if (!visible(e) || e.matches(".screen__bleed, .visually-hidden, script, datalist, [role=status].visually-hidden")) continue;
            if (getComputedStyle(e).position === "absolute") continue;
            if (e.matches(".section-head, .row-between, .title-row")) {
              const kids = [...e.children].filter(visible);
              check(kids[0], "left", L1, "row starts on margin");
              if (kids.length > 1) {
                const last = kids[kids.length - 1];
                // wrapped onto its own line (narrow screens, large text): it then starts on the margin instead
                const wrapped = last.getBoundingClientRect().top >= kids[0].getBoundingClientRect().bottom - 0.5;
                if (wrapped) check(last, "left", L1, "wrapped row item starts on margin");
                else check(last, "right", R1, "row ends on margin");
              }
              continue;
            }
            check(e, "left", L1, "block starts on margin");
            if (fullWidth(e)) check(e, "right", R1, "block ends on margin");
          }
        }
        // 3. surfaces: content on line 2 (inside the surface)
        const inner = (s, kids, both = true) => {
          const r = s.getBoundingClientRect();
          for (const k of kids) {
            if (!visible(k)) continue;
            check(k, "left", r.left + I, `content on card inset (${s.className.split(" ")[0]})`);
            if (both && fullWidth(k)) check(k, "right", r.right - I, `content on card inset (${s.className.split(" ")[0]})`);
          }
        };
        for (const s of document.querySelectorAll(".card")) inner(s, s.children);
        for (const s of document.querySelectorAll(".facts")) inner(s, [...s.children].filter((k) => !k.matches("button")));
        for (const s of document.querySelectorAll(".nutri")) inner(s, s.querySelectorAll(":scope > .nutri__row, :scope > .macros, :scope > p"));
        for (const s of document.querySelectorAll(".banner")) inner(s, [s.querySelector(":scope > .icon")], false);
        for (const s of document.querySelectorAll(".recipe-card:not(.recipe-card--compact)")) inner(s, s.querySelectorAll(".recipe-card__body > *"), false);
        // rows in lists and ingredient lists: first and last column on line 2
        for (const list of document.querySelectorAll(".list, .ingredients, .recipe-steps")) {
          const r = list.getBoundingClientRect();
          for (const row of list.children) {
            if (!visible(row)) continue;
            const kids = [...row.children].filter((k) => visible(k) && getComputedStyle(k).position !== "absolute");
            if (!kids.length) continue;
            check(kids[0], "left", r.left + I, "row content on card inset");
            // the last item of each row line ends on the inset line: values, the add/delete button, full-width fields
            for (const e of kids.filter((k) => k.matches(".product__end, .product__kcal, .ingredient__kcal, .ingredient__amount, .icon-btn, .field.ingredient__wide, .recipe-step__actions"))) {
              // .product__end and step actions wrap their buttons: measure the last button inside
              const target = e.matches(".product__end, .recipe-step__actions") ? [...e.children].filter(visible).pop() : e;
              check(target, "right", r.right - I, "row end on card inset");
            }
          }
        }
        // 4. text columns: the same x in every row of a list and in every compact card
        const column = (els, rule) => {
          const xs = [...els].filter(visible).map((e) => e.getBoundingClientRect().left);
          if (xs.length < 2) return;
          for (const e of [...els].filter(visible)) {
            const v = e.getBoundingClientRect().left;
            out.push({ el: name(e), side: "left", at: +v.toFixed(2), line: +xs[0].toFixed(2), d: +(v - xs[0]).toFixed(2), rule });
          }
        };
        for (const list of document.querySelectorAll(".list")) column([...list.querySelectorAll(":scope > .product")].map((p) => p.children[1]), "text column equal in every row");
        column(document.querySelectorAll(".recipe-card--compact .recipe-card__body"), "compact card text column equal");
        column(document.querySelectorAll(".recipe-card--compact .recipe-card__foot > *"), "compact card chips row equal");
        for (const card of document.querySelectorAll(".recipe-card--compact")) {
          const r = card.getBoundingClientRect();
          for (const k of card.querySelectorAll(".recipe-card__foot > *")) check(k, "left", r.left + I, "chips row on card inset");
        }
        for (const list of document.querySelectorAll(".recipe-steps")) {
          column([...list.children].map((li) => li.children[1]), "step text starts on one x");
          column([...list.children].map((li) => li.children[0]), "step numbers on one x");
        }
        for (const body of document.querySelectorAll(".recipe-card--compact .recipe-card__body")) column([...body.children], "card lines start on one x");
        // 5. footers, toast row, sheets
        for (const foot of document.querySelectorAll(".screen__foot")) {
          const kids = [...foot.children].filter(visible);
          if (!kids.length) continue;
          check(kids[0], "left", L1, "footer starts on margin");
          check(kids[kids.length - 1], "right", R1, "footer ends on margin");
        }
        for (const t of document.querySelectorAll(".screen__toast > .toast")) { check(t, "left", L1, "toast on margin"); check(t, "right", R1, "toast on margin"); }
        for (const sh of document.querySelectorAll("dialog[open] .sheet")) {
          const r = sh.getBoundingClientRect();
          const sl = r.left + M, sr = r.right - M;
          for (const k of sh.querySelectorAll(":scope > .sheet__head, :scope > .sheet__body > *, :scope > .sheet__foot > *")) {
            if (!visible(k)) continue;
            if (k.matches(".sheet__head, .row-between, .sheet__row")) {
              const kids = [...k.children].filter(visible);
              check(kids[0], "left", sl, "sheet row starts on margin");
              check(kids[kids.length - 1], "right", sr, "sheet row ends on margin");
            } else { check(k, "left", sl, "sheet content on margin"); if (fullWidth(k)) check(k, "right", sr, "sheet content on margin"); }
          }
        }
        // 6. camera
        for (const bar of document.querySelectorAll(".viewfinder__bar, .viewfinder__controls")) {
          const kids = [...bar.children].filter(visible);
          check(kids[0], "left", L1, "camera row starts on margin");
          check(kids[kids.length - 1], "right", R1, "camera row ends on margin");
        }
        // 7. section heads: same size and spacing to their content everywhere
        const heads = [...document.querySelectorAll(".section-head")].filter(visible).map((h) => {
          const next = h.nextElementSibling;
          const h2 = h.querySelector("h2");
          return { size: getComputedStyle(h2).fontSize, weight: getComputedStyle(h2).fontWeight, gap: next && visible(next) ? +(next.getBoundingClientRect().top - h.getBoundingClientRect().bottom).toFixed(2) : null, text: h2.textContent.trim() };
        });
        return { checks: out, heads, M, I };
      });
      const bad = res.checks.filter((c) => Math.abs(c.d) >= 0.01);
      measured += res.checks.length;
      deviations += bad.length;
      report.screens[`${f}@${width}`] = { measured: res.checks.length, deviations: bad };
      report.sectionHeads.push(...res.heads.map((h) => ({ screen: f, width, ...h })));
      console.log(`${bad.length ? "✗" : "✓"} ${f} @${width}: ${res.checks.length} edges, ${bad.length} off the grid${bad.length ? "\n    " + bad.slice(0, 8).map((b) => `${b.el} ${b.side} ${b.at} ≠ ${b.line} (Δ ${b.d}) — ${b.rule}`).join("\n    ") : ""}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}

// section heads must match across all screens
const sizes = new Set(report.sectionHeads.map((h) => `${h.size}/${h.weight}`));
const gaps = new Set(report.sectionHeads.filter((h) => h.gap !== null).map((h) => h.gap));
const headsOk = sizes.size === 1 && gaps.size === 1;
console.log(`${headsOk ? "✓" : "✗"} section headings: ${report.sectionHeads.length} found; size/weight ${[...sizes].join(", ")}; gap to content ${[...gaps].join(", ")} px`);
if (!headsOk) deviations++;

mkdirSync(resolve(HERE, "qa"), { recursive: true });
writeFileSync(resolve(HERE, "qa/align-report.json"), JSON.stringify({ ...report, measured, deviations }, null, 2));
console.log(`\nAlignment: ${measured} edges measured on ${files.length} screens × ${WIDTHS.length} widths, ${deviations} deviation(s). Report: 03-screens/qa/align-report.json`);
process.exit(deviations ? 1 : 0);
