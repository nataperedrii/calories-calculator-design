# Prompts log

The key prompts used with Claude Code, and what came out of each one.

---

## 01 — Project setup

**Prompt**

> Read the test task at https://github.com/jito-dev/trainee-designer-apr-2026-test-task.
> Create CLAUDE.md for this project with: a task summary, the 3 deliverables, and rules:
> - all content in English, no lorem ipsum — realistic food data (real kcal/macros per 100 g)
> - mobile screens are 390×844
> - every screen must use ONLY tokens from 02-design-system/tokens.css and components from components.css
> - after each step, append my prompt and a short summary to process/PROMPTS.md
> - export PNGs with Playwright
>
> Also create the folder structure below and an empty process/PROMPTS.md. Don't design anything yet.
>
> *(A folder-structure tree was attached. It is recorded in CLAUDE.md.)*

**Result**

- Read the task brief and wrote `CLAUDE.md` with a task summary (2 user stories: calculate calories, find recipes), the 3 deliverables, the project rules and the folder structure.
- Created `01-branding/assets/`, `02-design-system/`, `03-screens/screens/`, `03-screens/exports/` and `process/`.
- Nothing designed yet.
- Note: this prompt was sent together with 02 but only carried out after it (confirmed with "Yes").

---

## 02 — Competitive research

**Prompt**

> Do a short competitive analysis of MyFitnessPal, Yazio, Lifesum and FatSecret:
> how they handle calorie calculation and recipe search, their UX strengths and pain points.
> Save to process/research.md with 5 key insights I can use in my design.

**Result**

- Wrote `process/research.md`. It has a comparison table, a profile of each app (how it calculates calories, how it handles recipes, UX strengths, pain points), the gaps all four share, and sources.
- 5 design insights:
  1. Calories per 100 g as the anchor, plus a calculator for cooked dishes that uses the final cooked weight.
  2. Show where the numbers come from: one entry per food, a "verified" badge, the data source.
  3. Recipe search by what fits the remaining calories and protein ("Fits your dinner").
  4. Two taps to log, with recent foods first and no paywall on the basics.
  5. Calm, non-judgmental visuals: no red warnings, no "bad food" labels.

---

## 03 — Brand directions (v1, superseded by 04)

**Prompt**

> Act as a senior brand designer. For a calorie calculator mobile app, propose 3 distinct brand directions.
> For each: app name, one-line positioning, target audience, 3–5 personality keywords,
> color palette (HEX + role of each color), Google Fonts pairing (headline, body, numbers),
> imagery style, iconography style, tone of voice with 3 sample UI microcopy lines.
> Make them bold and opinionated — avoid the generic "AI look" (default purple gradients, Inter-only).
> Save to 01-branding/directions.md and build 01-branding/directions.html showing them
> side by side as mini moodboards. Export directions.png.

**Result**

- `01-branding/directions.md` describes 3 directions, each with a name, positioning, audience, keywords, a 6-colour palette with roles, a font trio, imagery, iconography, tone of voice and 3 microcopy lines:
  - **A · GRAMM**: "The kitchen scale, as an app." Precise and Swiss-utilitarian. Paper, Ink and Signal Orange `#FF5B1F`. Archivo Expanded, IBM Plex Sans, IBM Plex Mono.
  - **B · PINCH**: "Count calories the way you cook." A warm cookbook feel. Cream, Terracotta `#C8553D`, Olive and Saffron. Fraunces, Figtree, Fragment Mono.
  - **C · ZEST**: "Food is fuel." Pop and neo-brutalist sticker style. Lime `#C6F432`, Pepper Pink, Blueberry and Tangerine with 2.5 px Ink outlines. Bricolage Grotesque, Onest, Anton.
- The file ends with a comparison matrix against the research insights. **Recommendation: GRAMM**, with a touch of PINCH's warmth.
- `01-branding/directions.html` shows the three as side-by-side moodboards: logo lockup, palette, type specimen, an SVG imagery sketch, an icon set, a UI sample card with real USDA numbers, and microcopy styled as toasts.
- Added the reusable Playwright export script `tools/export.py` (Python venv, headless Chromium) and exported `01-branding/directions.png` (2160×2607).

---

## 04 — Brand directions v2 (rewrite of step 03)

**Prompt**

*(Sent with a note: the step 03 result wasn't liked, so all of its outputs should be overwritten.)*

> Act as a senior product designer with 20 years of experience designing mobile health & nutrition apps. We are designing a mobile calorie calculator app that must pass Apple App Store and Google Play review. The current theme is LIGHT.
>
> ## Step 0. Read the inputs first (do not invent anything)
> - 00-research/competitor-analysis.md — our competitor analysis
> - 00-research/references/ — competitor reference screenshots
> - The original brief and the MVP scope defined in the analysis.
> Before designing, decide who the direct competitors are and write a short summary (max 1 page): which features are essential for this kind of app, what competitors do well, and what they do poorly.
>
> ## Scope rule
> Take from direct competitors ONLY the features and patterns needed for our MVP as defined in the analysis. Do not add anything outside our brief (e.g. social feed, recipe marketplace, coaching, gamification) unless the analysis explicitly includes it. For every feature you adopt, briefly justify where it comes from and why we need it.
>
> ## Core feature: food analysis from a photo
> This is the most important feature. Study how competitors implement it (from the screenshots and the analysis) and design the complete flow:
> camera/gallery → capture guidance → "analyzing" state → result (detected items, calories and macros, editable portions, recognition confidence) → confirm and add to a meal → error and low-confidence states ("couldn't recognize", manual search fallback).
> Every direction must show at least the analysis result screen.
>
> ## Color and food association
> Analyze color psychology for food & nutrition: which hues evoke appetite, freshness, naturalness and trust, and which to avoid (e.g. cold clinical colors that read as medical rather than food). Name every palette color by its food association (e.g. "tomato", "avocado", "oat") and justify it.
> Requirements:
> - light theme, warm off-white backgrounds instead of pure #FFFFFF;
> - WCAG AA contrast (4.5:1 for text, 3:1 for UI components);
> - distinct protein / fat / carb colors that are also distinguishable for color-blind users;
> - semantic colors (success, warning, error) harmonized with the palette.
>
> ## Design-system rigor (details matter)
> - 8pt grid (4pt allowed for fine steps), 16–20pt screen side margins;
> - minimum touch target 44×44pt (iOS) / 48×48dp (Android);
> - type scale: body 16, minimum caption 12, support Dynamic Type / font scaling;
> - safe areas (status bar, home indicator), bottom navigation with 3–5 items;
> - defined radius scale, elevation scale, icon sizes (24px grid, consistent stroke weight);
> - 390×844 frames, aligned with Apple HIG and Material 3.
>
> ## Apple and Google store readiness
> Reflect this in the design and copy:
> - app icon 1024×1024 with no transparency and no pre-rounded corners (iOS) + adaptive icon with safe zone (Android);
> - app name max 30 characters, no third-party trademarks or competitor names;
> - open-license fonts only (Google Fonts), no infringing imagery;
> - camera permission request with a clear purpose explanation;
> - in-app account deletion flow if sign-up exists (Apple requirement);
> - disclaimer that the app is not medical advice;
> - responsible approach to nutrition: no promotion of extreme dieting, no weight shaming, no aggressive calorie deficits by default;
> - do not copy competitors' visual style, only behavioral patterns.
>
> ## Task
> Propose 3 distinct brand directions. For each:
> app name, one-line positioning, target audience, 3–5 personality keywords, color palette (HEX + role of each color + food association), Google Fonts pairing (headline, body, numbers), imagery style, iconography style, tone of voice with 3 sample UI microcopy lines, how it differentiates from competitors, design tokens (spacing, radii, type scale).
> Make them bold and opinionated. Avoid the generic "AI look" (default purple gradients, Inter-only, faceless cards).
>
> ## Deliverables
> - 01-branding/directions.md
> - 01-branding/directions.html: the three directions side by side as mini moodboards, each with 3 light-theme mini screens (Home with daily summary, Photo analysis result, Food diary) + app icon preview;
> - 01-branding/directions.png (export).
> End with a recommendation: which direction is strongest and why (score against: food association, differentiation from competitors, legibility, store-review readiness).
>
> ## Self-check
> Render the HTML, take a screenshot, verify contrast, spacing and alignment, fix issues, and only then export the PNG. If the result looks templated, redo it.

**Result**

- **Inputs:** `00-research/` (the analysis and screenshots) doesn't exist. The user chose to use `process/research.md` as the analysis. Competitors' photo flows were taken from public product and help pages (sources are in directions.md). Anything not sourced is marked *our decision*.
- **`01-branding/directions.md`**, rewritten from scratch:
  - A one-page summary of the direct competitors (MyFitnessPal, Yazio, Lifesum, FatSecret).
  - An MVP feature table with where each feature comes from and why we need it.
  - The full photo-analysis flow: permission, guidance, analyzing, result with confidence, confirm and Undo, error and offline states.
  - Colour psychology rules for food, shared system foundations, and a store-readiness checklist.
- **The three directions:**
  - **A · RIPE:** "Fresh market". Persimmon `#C4431A` on Oat milk. Young Serif, Hanken Grotesk, Azeret Mono.
  - **B · PER100:** "The honest label". Black olive and Dijon on Kraft, with patterned macros. Libre Franklin, Public Sans, Chivo Mono.
  - **C · SPRIG:** "Calm kitchen". Basil `#2F6B45` on Coconut, with a plate ring split by meal. Instrument Serif, Albert Sans, Geist Mono.
- **Checks:**
  - Every colour was checked with a WCAG contrast script. Four failing pairs were found and fixed: small warning text on its tint, letter badges on the macro colours, the Persimmon avatar, and the hatched low-confidence row.
  - Protein, fat and carbs use a magenta, gold and blue triad. It was checked with protanopia, deuteranopia and tritanopia simulations (ΔE ≥ 22). The first SPRIG salmon and corn pair failed deuteranopia (ΔE 9) and was replaced with radish and corn.
- **`01-branding/directions.html`:**
  - Shared foundations, then three moodboards. Each has 3 real 390×844 mini screens (Home, Photo result, Diary) built from USDA data, an app icon master with iOS and Android adaptive previews (66/108 safe zone), tokens, type, tone and differentiation.
  - It ends with a scorecard.
- **Self-check:** rendered with Playwright and checked each screen at native size, with a script that flags horizontal overflow. Fixed the text overflow in the not-sure rows, a wrapping macro value, the SPRIG note and disclaimer, the icon-preview wrapping, and a misaligned caption. "Day 34" was removed from PER100 because it reads as a streak.
- **Recommendation: A · RIPE** (19 of 20). It borrows PER100's label tables and SPRIG's neutral "over goal" copy.
- **Export:** `01-branding/directions.png`, 3840×4150.

---

## 05 — Ripe chosen: photo, trademark check, stylescape and BRAND.md

**Prompt**

> I want to have a generated dish instead of an image of a dish, that is, a beautiful photograph.
> And that this dish should have the same food as the illustration, but it should be like a photo of the dish. I also want you to immediately check this name Ripe for a trademark.
>
> I choose Direction A (Ripe)
> Because, based on my needs, this option is more suitable.
> Build the final stylescape as 01-branding/stylescape.html — a wide collage board (3840×2160)
> in the spirit of the attached reference stylescapes: logo + app name, color palette with HEX,
> typography specimen with usage notes, 2–3 UI fragments (calorie ring, recipe card, product row),
> food imagery, icon samples, a tagline and 3–4 brand principles.
> Create the logo and icons as SVG. Use photos from 01-branding/assets/.
> Export it to stylescape.png and write 01-branding/BRAND.md explaining the rationale in simple English.

**Result**

- **Photos:** `01-branding/assets/` was empty and there's no image-generation tool in this session, so the user chose free Unsplash photos. Six were downloaded with the user's approval (credits are in `assets/CREDITS.md`). No free photo of salmon with *brown* rice exists, so the user approved switching the data to **white rice** to match the hero photo. The plate is now 559 kcal (P 37 · F 23 · C 49) and the day is 1,171 of 2,050 kcal.
- **Directions page:** the Ripe result screen and the Home lunch thumbnail now use the real photo, with detection pins re-positioned on the salmon, rice, broccoli and glaze. Exports were refreshed.
- **Trademark check** (preliminary): USPTO "RIPE", Reg. 5109348, Class 9 (a restaurant-dishes app) was **cancelled on 7 Jul 2023**. No live "RIPE" Class 9 registration was found. There's a medium confusion risk from App Store apps "Ripe Yet?" and "VisionRipe". A professional search in Classes 9, 42 and 44 is recommended. Details are in BRAND.md §12.
- **Logo and icons (SVG):**
  - The wordmark is Young Serif converted to outlines with fontTools.
  - The symbol is a persimmon in a camera frame, in normal and reversed versions.
  - There's a 1024 iOS app icon (square, opaque) and Android adaptive foreground and background layers.
  - 16 UI icons (24 px, 2 px round stroke).
- **References:** the user added 3 reference boards (`assets/references/`). The stylescape follows their collage style: edge-to-edge tiles, overlapping UI, cut-out photos, a circular text badge, stickers and big display type.
- **`01-branding/stylescape.html` + `.png` (3840×2160):**
  - Brand block with the tagline "Point, snap, know." and a persimmon badge.
  - Hero photo with live detection labels and confidence states.
  - A phone showing the photo result screen.
  - UI fragments: calorie ring, recipe card, per-100 g product rows, confidence and over-goal states.
  - Palette with HEX codes, typography with usage notes, icon grid, app icon previews, and 4 brand principles.
- **Self-check:** reviewed the render. Fixed a clipped store-name chip, the "Aa" overlapping the type notes, a sticker covering the phone, and empty space in the fragments tile.
- **`01-branding/BRAND.md`:** the brand rationale in simple English, covering idea, audience, principles, colours (with contrast), fonts, logo rules, app icon, imagery, icons, tone, name check and a file map.

---

## 06 — Design system

**Prompt**

> Based on 01-branding/BRAND.md, create the design system in 02-design-system/:
> 1. tokens.json (W3C Design Tokens format) + tokens.css: color primitives and semantic tokens
>    (background, surface, text, accent, success/warning/error, and dedicated colors for
>    protein / fat / carbs), type scale (display → caption, tabular numbers for kcal),
>    spacing on a 4pt grid, radius, elevation, icon sizes.
> 2. components.css with states (default / pressed / disabled / focus / error):
>    buttons, text field, search bar, chips, segmented control (g / ml / portion),
>    weight stepper, product list item, recipe card, nutrition summary (calorie ring + macro bars),
>    nutrition facts table, top app bar, tab bar, bottom sheet, toast, empty state, badges.
> 3. index.html — a documentation page showing every token and component with names and usage notes.
> Check WCAG AA contrast for all text colors and report results in 02-design-system/README.md.
> Export design-system.png.

**Result**

- **`tokens.json`** (W3C DTCG format: `$type`, `$value`, `$description`, aliases) is the single source of truth. It has two layers:
  - **Primitives:** food-named ramps (oat, persimmon, avocado, honey, basil, chili, beetroot, mustard, blueberry).
  - **Semantic tokens:** bg, text, border, status (success, warning, error), macro (protein, fat, carbs, plus text and subtle variants).
  - **Also defined:** fonts and a 14-step type scale (rem-based for Dynamic Type; `num-*` styles are tabular), a 4 pt spacing scale, sizes (touch 44/48, safe areas 47/34, icons 16/20/24/32 with a 2 px stroke), radius, border widths, elevation (warm shadows) and motion.
- **`tools/build_tokens.py`** generates **`tokens.css`** (241 CSS variables), keeping semantic tokens linked to primitives through `var()`.
- **`components.css`:** 16 components (buttons, text field, search, chips, segmented g/ml/portion, weight stepper, product item, recipe card, nutrition summary, nutrition facts, app bar, tab bar, bottom sheet, toast, empty state, badges and confidence).
  - Each has default, pressed, disabled, focus and error states wherever they apply.
  - An audit confirmed **no hex colours, pixel values or primitive references**, only semantic `var(--…)` tokens.
- **`index.html`:** the docs page. The token sections are generated from the JSON by `tools/build_docs.py`. The component sections are hand-written with real USDA data and usage notes (do and don't).
- **`README.md` + `tools/contrast.py`:** **44 of 44 text and UI pairs pass WCAG 2.2 AA.** Disabled text and decorative outlines are listed as exempt.
- **Self-check:** screenshot each component section and fix overflows:
  - Text-field inputs forced cells wider than the grid.
  - Button labels wrapped.
  - Phone-width components (recipe card, nutrition summary, sheet) were cramped, so they now get 350 px cells.
  - Product rows now use a compact verified icon and whole-gram macros.
  - Macro values collided, so they're now a value in grams, a bar, and "of 110 g".
  - The Scan button was clipped.
- **Export:** `design-system.png` (1440 × ~18,000 px, full page). `CLAUDE.md` now documents the token build commands.

---

## 07 — Design system QA pass (fix, don't rewrite)

**Prompt**

> Continuing Step 2 (Design System). You are acting as a senior product designer with 20 years of experience AND as a strict QA engineer. 02-design-system/ already contains tokens.json, tokens.css, components.css, index.html, README.md and design-system.png. FIX them (do not rewrite from scratch): keep the tokens, component names and overall visual style, and change only what is described below.
>
> *(Full prompt: golden rule "render → screenshot → measure → fix → repeat"; 3 hard design rules: no clipped text, nothing leaves its container, even borders; 7 fixes: page radius and 2× PNG, icon and size compliance against current Apple/Google docs, segmented focus gap, product-row uneven outline, recipe-card clipping, tab-bar states outside the bar, bottom-sheet P/F/C alignment; automated verification `tools/check.mjs` + `npm run check` covering file:// vs http, CSS loading, paths, fonts, clipping, touch targets, screenshots; `index.standalone.html`; html-validate, stylelint-config-standard, tokens validation and drift, axe-core, WCAG contrast for all states; README sections "Icon & size compliance", "Validation report", "Changelog".)*

**Result**

- **Tooling:**
  - Homebrew couldn't install Node without sudo, so the user approved the official Node 22 LTS tarball from nodejs.org, SHA-256 verified, installed in `~/.local/node`.
  - `package.json` provides `npm run check`, `build:standalone`, `export:png`, `lint:css` and `lint:html`.
  - Dev dependencies: Playwright, @axe-core/playwright, html-validate, stylelint (+ config-standard), pngjs and pixelmatch.
- **Research:** sizes checked against current official sources.
  - Apple HIG, read as JSON: 44×44 pt hit region, 17/11 pt text, 1024 square unmasked layers with an opaque background.
  - Android: 48 dp targets, adaptive icon 108 dp with a 48–66 dp logo, Play icon 512 px 32-bit PNG.
  - Material 3 token source: navigation bar 64 dp, small app bar 64 dp, icons 24 dp, indicator 56×32, body 16 / 12 sp.
- **The 7 fixes:**
  1. Square page with no clipping; 2× full-page PNG with background-coloured corners.
  2. Compliance table plus fixes: 44 pt stepper and segments, an Android 48 dp / 64 dp scope, filled active tab icons, capped tab labels, opaque 1024 and 512 PNG icons, and an adaptive logo at 60 dp (was 39 dp).
  3. Segmented focus: a double ring with a 2 px gap, contained, on native radios.
  4. Product rows: inset rows, inset rings, identical geometry across 6 states.
  5. Recipe cards: no clipping, long titles.
  6. Tab bar: every indicator inside the bar.
  7. New `.macro-tiles`: equal columns, subgrid baselines, measured.
- **Code quality:**
  - `components.css` reformatted to stylelint-standard (0 problems) with semantic tokens only.
  - Docs styles moved to `docs.css`.
  - `index.html` is valid (0 html-validate errors): typed buttons, labelled inputs, unique nav landmarks, native radios, data-only inline custom properties.
  - `tokens.css` generator: quoted font names, short hex, 0 without units, `--check` for drift.
  - Font stacks with offline fallbacks.
- **Verification:** `npm run check` gives **61 / 61 passed**.
  - Static: tokens, drift, stylelint, html-validate, and contrast (66 / 66, including focus rings).
  - Browser: file:// = http:// (0-pixel diff), CSS loaded, 0 clipping and 0 overflow at 100% and 200% text, 118 controls ≥ 44 px (Android ≥ 48), component geometry, axe 0 violations, the standalone page alone, the PNG export.
  - Also found and fixed by the checks and by looking at crops:
    - The Scan focus ring was 1 px outside its tab.
    - Search inputs had a 26 px hit area.
    - Several 200% overflows: fields, tab labels, macro labels, the "portion" segment, "42.3" in tiles.
    - Tab-bar and app-bar corners poked past rounded doc cells.
    - The nav group spacing was missing.
- **Open (stated in the README):** the iOS tab-bar height has no HIG number; brand fonts need a network connection (fallbacks are in place); 9 axe "incomplete" nodes are covered by contrast.py instead.

## 08 — Design system accessibility: WCAG 2.2 AA + AAA for critical elements

**Prompt**

> Continuing Step 2 (Design System), accessibility phase. You are acting as a senior product designer with 20 years of experience AND a strict accessibility auditor. 02-design-system/ already contains the fixed tokens.json, tokens.css, components.css, index.html, index.standalone.html, README.md, design-system.png and tools/check.mjs. Task: verify everything against WCAG 2.2 Level AA (the mandatory baseline) and additionally meet AAA requirements for the critical elements. Find ALL defects and fix them. Do not rewrite the system from scratch: keep token names, component names, brand hues and overall style.
>
> *(Full prompt: golden rule "audit → fix → re-audit" with no disabled rules, exclusions or hidden elements, and W3C citations instead of "N/A". Three tiers: Tier 1 = all A/AA, blocking; Tier 2 = AAA on a closed list of critical elements (numbers, macros, body text, inputs, errors, primary buttons, tab bar, app bar, all interactive targets, irreversible actions, animations): 1.4.6, 2.5.5, 2.4.12, 2.4.13, 2.3.3, 1.4.8 text, 3.1.4, 3.3.6, 3.3.9, 2.2.3/2.2.4/2.2.6, blocking; Tier 3 = the rest of AAA, best effort. Tooling: `npm run check:a11y` with axe (wcag2a/aa/21a/21aa/22aa/best-practice), pa11y WCAG2AA, a custom contrast script, axe wcag2aaa on critical elements, and geometry/focus/zoom/reflow checks; audit-before / audit-after JSON + MD with screenshots. Fix at the token level first; document brand deviations; README section "WCAG 2.2 AA + AAA for critical elements"; regenerate design-system.png at 2×; final message with counts by tier, open items and changed colour tokens.)*

**Result**

- **Tooling:** `02-design-system/tools/a11y.mjs` (`npm run check:a11y`, and `npm run audit:before` for the baseline).
  - Two independent checkers: axe-core (AA tags + best-practice) and pa11y (htmlcs).
  - Custom contrast scan: every text node, alpha-composited over its real background stack, tagged critical (7:1) or regular (4.5:1).
  - axe `wcag2aaa`, restricted to the critical selectors.
  - Keyboard traversal (visible, appearance, not obscured, order, Shift+Tab, dialog trap, Esc, focus return), target size and spacing.
  - Reflow at 320 px, 200% text, WCAG text-spacing overrides, and reduced-motion / more-contrast / forced-colours emulation.
  - A structural checklist.
  - Reports and screenshots: `02-design-system/a11y/audit-{before,after}.{json,md}`, `a11y/{before,after}/`.
- **Before:** Tier 1 **28** failures, Tier 2 **355**, Tier 3 661 notes.
  - 11 Tier 1 and 6 Tier 2 findings came from the first version of the checker (wrong focus-indicator element, inner gap ring); the checker was fixed.
  - The real defects: disabled text 2.3:1, secondary / accent / CTA text below 7:1, chip / search / selected segment / active tab boundaries under 3:1, 24 px nav links, no skip link, no landmarks, a static non-modal sheet, a stepper value that wasn't an input, macro bars with no role, a table with no caption, no reduced-motion handling, invisible boundaries in forced colours, reflow to 520 px at 320, 88-character lines, tight line heights, no abbreviations, no confirm step for deletion, timed toasts, no accessible sign-in pattern.
- **Fixes (token level first):**
  - Deeper shades of the same hues: `bg.accent` persimmon-700 `#9B3515` (white 7.21), `text.accent` persimmon-800, `text.secondary` oat-700, `text.disabled` oat-550.
  - New tokens: `status.warning-text`, macro fat/carbs text 800s, success/fresh 800s, `chili-600` `#A8241C`, `macro.kcal`.
  - Line-height 1.5; `prefers-contrast: more` and `prefers-reduced-motion` modes, generated from `$extensions`.
  - Components:
    - Chip, search and segmented rings; underline on the active tab.
    - A modal `<dialog>` sheet and a delete confirmation, with a focus trap.
    - Toast dismiss button, no timers.
    - Meters, stepper input, skip link, landmarks, abbreviations legend, sign-in pattern (magic link / passkey).
    - 44 px nav links, a 65-character measure, scrollable table regions, forced-colours outlines.
- **After:** Tier 1 **0** failures / 40 passes, Tier 2 **0** / 9, Tier 3 **3** notes (stable over repeated runs).
  - axe 0 violations (56 rules pass); pa11y 0 errors.
  - 142 focus stops all visible and unobscured; 165 targets ≥ 44 px with 0 overlaps.
  - Reflow at 320 px, 200% text, text spacing, reduced motion, forced colours and more-contrast all OK.
  - `npm run check` 61 / 61; `contrast.py` 67 / 67 (34 critical pairs at 7:1).
  - `design-system.png` 2880 × 43,756.
- **Docs:**
  - README section "WCAG 2.2 AA + AAA for critical elements": critical list, a table of every criterion, contrast before → after, changed tokens, open issues.
  - BRAND.md "Accessibility adjustments (v1.2)".
  - CLAUDE.md now lists `npm run check:a11y`.
- **Open:**
  - The pressed toast action is 4.79:1 (AA, non-critical, Tier 3).
  - 9 axe "incomplete" nodes are verified by the custom scan.
  - Forced colours were tested only in Chromium emulation.
  - 2.4.8 Location (AAA) isn't applied on a single page.
