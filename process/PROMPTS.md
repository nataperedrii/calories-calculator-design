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

## 09 — Screens step 1: user flows spec (`03-screens/FLOWS.md`)

**Prompt**

> Write 03-screens/FLOWS.md with user flows for both user stories.
> List every screen: purpose, key content, and states (empty, loading, error).
> Include onboarding (goal, diet type, allergies, daily kcal target) — "suitable for me" needs personal data.
> Target 12–16 screens. Don't build yet.

**Result**

- Planned first, then approved: 16 screens. No HTML or PNG yet.
- **Screens:**
  - Onboarding 01–06: welcome & passwordless sign-in, goal, about you, diet type, allergies & dislikes, daily target with "How we calculated this".
  - Story 1, 07–12: Today, Scan (photo / barcode), photo result with confidence, add food (recents first), food detail & portion (per 100 g + USDA source), dish calculator (raw ingredients + cooked weight).
  - Story 2, 13–14: recipes that fit the kcal left, filtered by diet and allergies; recipe detail with "Log 1 portion".
  - Support: Diary and Profile.
- **Flows:** 0 onboarding, 1A photo, 1B product / barcode, 1C home-cooked dish, 2 find a recipe, 3 change preferences. Each is traced from entry to the logged toast.
- **"Suits me" logic:**
  - Allergies and diet are hard filters (hidden recipes are counted and explained).
  - Dislikes are soft.
  - Ranking: fits the kcal left → covers the protein gap → fewer kcal → time.
- **States:** every screen has default, empty, loading and error (plus offline, partial, denied and over-target where relevant). Where a state can't happen, the table says why.
- **Data:** USDA FDC per-100 g values, computed with a script. The sums use rounded item kcal, as the screens show them.
  - Persona Sam: 34, 165 cm, 63 kg, moderately active, pescatarian, peanut allergy → Mifflin-St Jeor 1,330 × 1.55 = 2,062 → 2,050 kcal (P 100 / F 70 / C 255 = 2,050).
  - The day: 344 + 559 + 268 = 1,171, so 879 left.
  - Recipes: cod 443, shrimp 532, chickpea curry 587; peanut bowl 585 is hidden.
  - Lentil soup: 1,229 kcal raw pot, cooked 1,700 g → 72 kcal per 100 g, 246 per 340 g portion.
- **Design-system gaps found** (to add to the DS before building): step indicator, option card, inline banner, skeleton, camera viewfinder overlay, week strip, locked allergy chip.

## 10 — Screens for flows 1 and 2, PNG exports, flows board, validation

**Prompt**

> Export every screen to PNG @2x into 03-screens/exports/.
> Create 03-screens/flows.html — an overview board with Flow 1 and Flow 2 in rows, arrows between
> screens, and short annotations explaining key UX decisions. Export flows.png.
> And validate the HTML and other results of your work.

**Clarifications:**
- **Screens:** no screens existed yet. I asked, and the user chose to build only the screens of flows 1 and 2 (07–14).
- **Photos:** the user approved downloading 6 more Unsplash photos (cod, shrimp, chickpea curry, almonds, apple, lentil soup). They're credited in `01-branding/assets/CREDITS.md`.

**Result**

- **Design system first (v1.3):**
  - New components 17 Inline banner, 18 Skeleton, 19 Camera viewfinder and 20 Screen layout, plus a locked allergy chip.
  - Variants: detected-item row, "check portion" tint, photo and icon thumbnails, compact recipe card, macro keys.
  - 5 tokens, 8 icons.
  - The toast now takes its own row above the tab bar instead of floating over content (axe showed it covering a control; WCAG 2.4.11).
  - Docs macro goals now match the persona (100 / 70 / 255 g = 2,050 kcal).
- **Screens:** `03-screens/tools/build_screens.py` generates 13 HTML files (8 screens + key states) from the USDA data. It asserts the totals: 344 + 559 + 268 = 1,171, so 879 kcal are left; cod 443; soup 1,229 kcal raw pot, 72 per 100 g, 246 per portion. Screens link to each other (`data-href` and real links).
- **Exports:** `03-screens/tools/export.mjs` (`npm run export:screens`) renders 13 PNGs at 780 × 1688 (390 × 844 @2x) and `flows.png` at 4800 × 6558. It waits for fonts and images and fails on any error.
- **Flows board:** `flows.html` has Flow 1 (1A photo path; 1B search, 1C dish calculator) and Flow 2 (recipes) in rows, with arrows labelled by the tap. Numbered pins match 15 short notes on the key UX decisions.
- **Validation:** `03-screens/tools/check.mjs` (`npm run check:screens`) gives **153 / 153**.
  - html-validate on all pages.
  - The design-system-only rule: only `tokens.css` and `components.css`, data-only inline styles, no hex or px.
  - Every link, image and `data-href` exists.
  - axe WCAG 2.2 A/AA + best practice: 0 violations; AAA contrast: all text ≥ 7:1.
  - The frame is exactly 390 × 844 with no overflow or clipped text; every target is ≥ 44 × 44; every focus stop is visible.
  - The numbers add up: meals = eaten, goal − eaten = left, items = photo total, ingredients = pot.
  - PNG sizes are correct.
  - The checker caught real bugs, which were fixed: `aria-label` on markers, unescaped `&`, the toast over a button, a scrolling area with no focus stop. It also exposed 4 mistakes in the checker itself, which were corrected.
- **Design system re-verified:** `npm run check` gives 61 / 61 (after fixing the standalone image inlining, the skeleton height, the viewfinder geometry and the docs demos). `contrast.py` gives 67 / 67. Lint is clean.


## 11 — Global grid, Today / Meals / Recipes fixes, dish editing, cod photo

**Prompt**

<details><summary>Full prompt (verbatim)</summary>

> Improving the existing app flows. You are acting as a senior product designer with 20 years of experience AND a strict QA engineer. The screens, components and design system already exist in the project: locate the relevant files and FIX them, do not create parallel versions. Keep the tokens, component names, color palette, light theme and everything fixed earlier (text is never clipped, nothing extends beyond its container, borders are even, focus has a gap, touch targets ≥ 44×44, WCAG AA as the baseline and AAA for critical elements).
>
> ## Golden rule
> Never consider the work done without verifying it in a browser. Loop: make the change → render → screenshot → look at it → measure geometry → fix → repeat. Save a "before" and "after" screenshot for every screen. If something could not be verified, say so explicitly.
>
> ## Step 0. Global grid and margins (do this first, then everything else)
> 1. Define one set of horizontal screen margins (left and right) as tokens and apply them on ALL screens: every heading, subheading, text block, card, row and icon starts on the same vertical line on the left.
> 2. Right-aligned text (values, prices, kcal, time, counters, right-hand buttons) ends exactly on the right margin. The right margin equals the left margin on every screen.
> 3. Section headings on all screens share the same left inset, the same size and the same spacing to their content. Find places where heading insets differ and unify them.
> 4. Text must not "jump": in lists and cards the first line of text starts at the same x coordinate. Achieve this with a shared container/grid, not by tweaking individual margins.
> 5. Spacing only from the 4pt/8pt token scale. No arbitrary values in code.
> Automated check: a Playwright script that, for every screen, collects the left/right bounding box edges of all headings, text blocks, icons and cards, groups them by x, and reports deviations from the grid (tolerance 0 px). Add it to `npm run check` as a separate alignment check.
>
> ## Fixes by screen
>
> 1. Today screen
> - Align section headings to the grid on the left edge (on the side-margin line).
> - Align the calendar icon and the text next to it (the day and how many calories are left) to the same left line as the headings. Icon and text are vertically centered relative to each other.
>
> 2. Today → Meals section (Lunch / Snack / Dinner rows)
> - Currently a plus sign sits on the left where the dish photo should be. Replace it with a meal-type icon (in the style of the Almond butter dish icon, from the same icon set). Until a dish is added, this icon is passive: not a button, no pressed/hover/focus states, no hit area or pointer cursor; visually muted but legible.
> - Currently each row has two plus signs. Exactly ONE must remain: the one on the right, as a proper button (hit area ≥ 44×44, all states default / pressed / focus / disabled, an accessible name such as "Add lunch", focus ring with a gap).
> - Once a dish is added, show the dish photo (thumbnail) in place of the icon with the same size and spacing so rows do not shift.
> - Follow the grid: the icon, the meal-type label and the right-hand button are aligned identically in every row.
>
> 3. Dish card on Today (the card with the green pill and leaf; in my description it is labeled "first … dinner")
> - Find this card in the screenshots and code and work on it.
> - Give the numbers and the P, F, C letters colored backgrounds (chips) in the macro colors, as on this dish's detail screen. Use the same tokens and the same component as the detail screen, not a copy of the styles. Remove the dot separators between them.
> - Align the text and the green pill with its text and leaf to the grid: equal pill height, internal padding, vertical alignment of icon and text, the pill does not extend beyond the card, text is not clipped.
>
> 4. Recipes section, recipe cards
> - Align the text in all cards to the left edge on the grid (it currently "jumps"): the first line of the title, captions and the row of values start at the same x coordinate in every card.
> - Add the same colored chips for the numbers and P, F, C as on the dish detail (same component). Remove the dot separators.
> - I like the gap between the clock icon and the time. Take that value from the current card, record it as a token and apply the same gap between the number and the P/F/C letter inside every chip (and define a separate token for the gap between chips).
>
> 5. Dish detail: editing
> - Ingredients: the user can edit ingredients that were added incorrectly: change the name, amount and unit (g / ml / portion), delete an ingredient, add a new one. After a change, the dish's calories and P/F/C are recalculated (the nutrition summary, calorie ring and macro bars update) without a reload.
> - Dish name: the user can change it if it was entered incorrectly (an edit button next to the name; edit in place or in a sheet). Validation: not empty, length limit, a clear error message with a hint on how to fix it.
> - States: view / edit / validation error / saving. Save and Cancel buttons, unsaved-changes protection on exit ("Discard changes?"), the ability to undo deleting an ingredient (undo toast).
> - Accessibility: all fields have visible labels (a placeholder never replaces a label), hit areas ≥ 44×44, keyboard operable, focus is not lost when a row is deleted, changes are announced via role=status. Long names wrap and are never clipped. Add every new component (editable ingredient row, amount stepper/fields, inline name edit) to the design system (components.css, the index.html docs), keeping tokens.json and tokens.css in sync.
>
> 6. Photo for Baked cod, potatoes & peas
> - Replace the photo currently used for this dish EVERYWHERE (Today, Meals, Recipes, detail, thumbnails, previews and exports) with a different photo that actually shows baked cod, potatoes and peas.
> - Source: a freely licensed photo (Unsplash / Pexels / Pixabay) with author, link and license recorded, or a file provided by the user in the project folder. No competitor photos and no copyrighted images. If there is no network access and no suitable file, put a clearly labeled placeholder and ask the user for a file in the report.
> - A single source file in assets, with all screens referencing it; optimized size, a consistent aspect ratio and object-fit: cover, alt text describing the dish.
>
> ## Verification
> 1. `npm run check` (CSS loads via file:// and HTTP, no text clipping, touch targets) plus the new alignment check: zero deviations from the grid on the left and right.
> 2. `npm run check:a11y`: zero AA violations and zero AAA violations for critical elements (7:1 contrast for calorie and macro numbers, focus, touch targets, reduced motion). The colored P/F/C chips must pass text contrast, and macros must be distinguishable by more than color (letter + label).
> 3. html-validate, stylelint, tokens.json validation and its parity with tokens.css: 0 errors.
> 4. Browser checks: 390px and 320px widths, 200% font scaling, long dish names, long ingredient names. Keyboard traversal of the new elements. LOOK at the screenshots and describe what you see.
> 5. Regression: confirm that nothing fixed earlier broke (even borders, focus with a gap, tab bar and bottom sheet within bounds, no clipping).
>
> ## Deliverables
> - Fixed screen and component files, updated design-system tokens/components/docs.
> - Before and after screenshots for every changed screen (Today, Meals, Recipes, dish detail, editing states).
> - A report in README.md: "Changelog" (items 1–6: before → after), check results, the source and license of the new photo, and a list of open issues.
> - Final message: what changed, what was verified, what remains open. If any check fails, say so plainly and keep fixing.

</details>

**Clarification:**
- **Photo:** no free photo showed baked cod, potatoes *and* peas (about 300 searched on Unsplash, Pexels and Pixabay). The user chose the Pixabay baked cod with potatoes and broccoli (Gadini, Pixabay Content License) and approved renaming the dish to "Baked cod, potatoes & broccoli".

**Result**

- **Before screenshots:** saved first (`03-screens/qa/before/`).
- **Step 0, the grid:**
  - **Tokens:** `--space-card-inset` (16), `--space-inline-icon` (4, the clock → time gap), `--space-chip-gap` (8), `--size-icon-inset` (10).
  - **Edges:** lists, cards, banners, the nutrition summary and the search bar end on the same inset line on both sides. App-bar glyphs sit on the 20 px margin, and text buttons align by their label.
  - **Checker:** new `03-screens/tools/align.mjs`, chained into `npm run check`: 1,212 edges on 20 screens at 390 and 320 px, **0 px deviation**; one size and one gap for section headings.
- **Today:**
  - **Date button:** the calendar glyph and "Thursday · 879 kcal left" sit on the margin line, centred on each other.
  - **Meal rows:** a passive meal-type icon (new icons: breakfast, snack, dinner; lunch reuses sun) and exactly one Add button with all states.
  - **Dish card:** macro chips (`.macro-tile--chip`, the same component as the detail screen) and a `.badge--fresh` pill.
- **Recipes:** chips instead of dotted text; every text line in the cards on one x; the reason ("Covers your protein") next to the time.
- **Dish detail editing:**
  - **Design system:** new components 21 date button, 22 title row + name edit, 23 ingredient rows, plus `select` in fields and `.field__count`.
  - **Editor:** `screens/js/dish-editor.js` recalculates kcal, ring, per-100 g, macro bars, allergens and the Log button live.
  - **States:** delete with Undo and focus management, "Discard changes?", Saving…, name validation. Each state is a separate export.
- **Photo:** one file, `recipe-baked-cod.jpg`, used everywhere; the old file was deleted. Data recomputed: 462 kcal, P 40.7, F 11.9, C 49.1; the day is 1,633, so 417 kcal are left.
- **Found and fixed while verifying:**
  - inputs were only 26 px tall inside 52 px fields;
  - screen bodies could grow wider than the screen at 200% text;
  - facts tables didn't wrap;
  - the Add button's focus ring could leave its wrapper;
  - the select didn't shrink at 320 px;
  - `check:a11y` hung on the infinite shimmer animation.
- **Checks:**
  - `npm run check`: 61/61 + alignment 0;
  - `npm run check:a11y`: Tier 1 0/40, Tier 2 0/9;
  - `npm run check:screens`: 241/241 (new: 320 px, 200% text, long names, editor behaviour);
  - contrast 67/67; tokens in sync; lint 0.
- **Report:** in the root `README.md`: changelog items 0–6, check results, photo source and licence, open issues. Before/after images are in `03-screens/qa/compare/`.


## 12 — Chips in one row, a real “View recipe”, compact ingredients, Method (steps)

**Prompt**

<details><summary>Full prompt (verbatim)</summary>

> Improving the existing flows of the calorie calculator app. You are acting as a senior product designer with 20 years of experience AND a strict QA engineer. The screens, components and design system already exist in the project: locate the relevant files and FIX them, do not create parallel versions. Keep the tokens, component names, color palette, light theme and everything fixed earlier (text never clipped, nothing extends beyond its container, borders are even, focus has a gap, touch targets ≥ 44×44). Accessibility: WCAG 2.2 AA as the mandatory baseline, plus AAA for critical elements (calorie and macro numbers, body text, errors, primary buttons, tab bar, focus, touch targets, irreversible actions, animations): 7:1 contrast, enhanced focus, Target Size Enhanced, etc.
>
> ## Golden rule
> Never consider the work done without verifying it in a browser. Loop: make the change → render → screenshot → look at it → measure geometry → fix → repeat. Save a "before" and "after" screenshot for every screen. If something could not be verified, say so explicitly.
>
> ## Step 0. Global grid and margins (do this first, then everything else)
> 1. Define one set of horizontal screen margins (left and right) as tokens and apply them on ALL screens: every heading, subheading, text block, card, row and icon starts on the same vertical line on the left.
> 2. Right-aligned text (values, prices, kcal, time, counters, right-hand buttons) ends exactly on the right margin. The right margin equals the left margin on every screen.
> 3. Section headings on all screens share the same left inset, the same size and the same spacing to their content. Find places where heading insets differ and unify them.
> 4. Text must not "jump": in lists and cards the first line of text starts at the same x coordinate. Achieve this with a shared container/grid, not by tweaking individual margins.
> 5. Spacing only from the 4pt/8pt token scale. No arbitrary values in code.
> Automated check: a Playwright script that, for every screen, collects the left/right bounding box edges of all headings, text blocks, icons and cards, groups them by x, and reports deviations from the grid (tolerance 0 px). Add it to `npm run check` as a separate alignment check.
>
> ## Fixes by screen
>
> 1. Today screen
> - Align section headings to the grid on the left edge (on the side-margin line).
> - Align the calendar icon and the text next to it (the day and how many calories are left) to the same left line as the headings. Icon and text are vertically centered relative to each other.
>
> 2. Today → Meals section (Lunch / Snack / Dinner rows)
> - Currently a plus sign sits on the left where the dish photo should be. Replace it with a meal-type icon (in the style of the Almond butter dish icon, from the same icon set). Until a dish is added, this icon is passive: not a button, no pressed/hover/focus states, no hit area or pointer cursor; visually muted but legible.
> - Currently each row has two plus signs. Exactly ONE must remain: the one on the right, as a proper button (hit area ≥ 44×44, all states default / pressed / focus / disabled, an accessible name such as "Add lunch", focus ring with a gap).
> - Once a dish is added, show the dish photo (thumbnail) in place of the icon with the same size and spacing so rows do not shift.
> - The icon, the meal-type label and the right-hand button are aligned identically in every row.
>
> 3. Today → dish card at the bottom (the card with the green pill and leaf; in my description it is labeled "first … dinner")
> - Find this card in the screenshots and code and work on it.
> - Give the numbers and the P, F, C letters colored backgrounds (chips) in the macro colors, as on the dish detail screen. Use the same tokens and the same component as the detail screen, not a copy of the styles. Remove the dot separators between them.
> - Align the text and the green pill with its text and leaf to the grid: equal pill height, internal padding, vertical alignment of icon and text, the pill does not extend beyond the card, text is not clipped.
> - The "View recipe" button in this card currently looks inactive. Make it active: a proper button with a clear appearance (secondary or primary per the design system), text contrast ≥ 7:1 (important action), hit area ≥ 44×44, states default / pressed / focus / disabled, focus ring with a gap, accessible name ("View recipe: <dish name>"). Pressing it opens that dish's detail screen in Recipes. Verify that navigation actually works (click and keyboard: Enter / Space).
>
> 4. Recipes section, recipe cards
> - Align the text in all cards to the left edge on the grid (it currently "jumps"): the first line of the title, captions and the row of values start at the same x coordinate in every card.
> - Add the same colored chips for the numbers and P, F, C as on the dish card on Today (same component). Remove the dot separators.
> - P, F and C must sit in ONE row, not two, in every card. To achieve this make the chips more compact (size and spacing tokens), with no wrapping (nowrap) and no clipping. This must hold at 390px and 320px widths at the default font size. At enlarged font sizes (150% scaling and above) wrapping is allowed, but text is never clipped and nothing extends beyond the card. Test the longest values (e.g. 100+ g).
> - I like the gap between the clock icon and the time. Take that value from the current card, record it as a token and apply the same gap between the number and the P/F/C letter inside every chip (and define a separate token for the gap between chips).
>
> 5. Dish detail (Recipes → tap a dish)
> a) Dish name: the user can change it if it was entered incorrectly (an edit button next to the name; edit in place or in a sheet). Validation: not empty, length limit, a clear error message with a hint on how to fix it.
> b) Ingredients: make the section more compact. In ingredient rows remove the colored chips for P, F, C and keep a compact text form (number + P/F/C letter + unit) with the same gap between number and letter; macros are distinguished by more than color (the letter). Reduce vertical spacing between rows to values from the 4pt/8pt scale, but keep control hit areas ≥ 44×44 (extend the hit area with invisible padding without increasing visual height). Keep this list on the grid: the ingredient name on the left, the amount and unit right-aligned (one common right edge).
> c) Ingredient editing: if an ingredient was added incorrectly, the user can change its name, amount and unit (g / ml / portion), delete it, or add a new one. After a change the dish's calories and P/F/C are recalculated (the nutrition summary, calorie ring and macro bars update) without a reload. In edit mode rows may be roomier; in view mode they are compact.
> d) Recipe (cooking steps): AFTER the Ingredients section comes a "Method / Instructions" section with the actual recipe. This is a mandatory part of the screen.
> - Numbered steps, each in its own block with a number and text; long steps wrap and nothing is clipped.
> - Meta information above the steps: total cooking time and number of servings. Same style as the cards (clock icon + time, same gap token). Do not add new metrics unless they appear in the competitor analysis.
> - Step text: body 16, line spacing ≥ 1.5, line length ≤ 80 characters, no justified text.
> - Recipes without steps show a clear empty state with an explanation and an "Add steps" action, never blank space.
> - Step editing: add, edit text, delete (with an undo toast), reorder. Reordering has a non-drag alternative ("move up / move down" buttons, WCAG 2.5.7). Validation: a step cannot be empty.
> - Data: extend the recipe structure with a steps field (an ordered array of strings). Fill every existing recipe with steps (realistic, correct cooking text, including Baked cod, potatoes & peas). No unsafe advice: temperatures, times and cooking safety must be sensible.
> - Step numbers and text follow the same grid: identical left and right margins, the first line of every step starts at the same x coordinate.
> e) States and protection: view / edit / validation error / saving; Save and Cancel buttons; unsaved-changes protection on exit ("Discard changes?"); undo after deleting an ingredient or a step.
> f) Accessibility: fields have visible labels (a placeholder never replaces a label), keyboard operable, focus is not lost when deleting or moving, changes announced via role=status, steps in a semantic ordered list (ol/li), accessible button names ("Move step 2 up"). Long names wrap and are never clipped.
> g) Add every new component (editable ingredient row, compact ingredient row, amount fields, inline name edit, recipe step, editable recipe step) to the design system (components.css, the index.html docs) with states default / focus / pressed / disabled / error; tokens.json and tokens.css stay in sync.
>
> 6. Photo for Baked cod, potatoes & peas
> - Replace the photo currently used for this dish EVERYWHERE (Today, Meals, Recipes, detail, thumbnails, previews and exports) with a different photo that actually shows baked cod, potatoes and peas.
> - Source: a freely licensed photo (Unsplash / Pexels / Pixabay) with author, link and license recorded, or a file provided by the user in the project folder. No competitor photos and no copyrighted images. If there is no network access and no suitable file, put a clearly labeled placeholder and ask the user for a file in the report.
> - A single source file in assets, with all screens referencing it; optimized size, a consistent aspect ratio and object-fit: cover, alt text describing the dish.
>
> ## Verification (mandatory)
> 1. `npm run check` (CSS loads via file:// and HTTP, no text clipping, touch targets) plus the new alignment check: zero deviations from the grid on the left and right. Separately verify that P, F, C in the Recipes cards sit in one row at 390px and 320px.
> 2. `npm run check:a11y`: zero AA violations and zero AAA violations for critical elements (7:1 contrast for calorie and macro numbers and the "View recipe" button, focus, touch targets, reduced motion). The colored P/F/C chips pass text contrast, and macros are distinguishable by more than color (letter + label).
> 3. html-validate, stylelint, tokens.json validation and its parity with tokens.css: 0 errors.
> 4. Browser checks: 390px and 320px widths, 200% font scaling, long dish names, long ingredient names, very long steps, a recipe with no steps, a recipe with 15+ steps. Keyboard traversal of all new and changed elements (Tab / Shift+Tab / Enter / Space / Esc). LOOK at the screenshots and describe what you see.
> 5. Regression: confirm that nothing fixed earlier broke (even borders, focus with a gap, tab bar and bottom sheet within bounds, no clipping).
>
> ## Deliverables
> - Fixed screen and component files, updated design-system tokens/components/docs.
> - Before and after screenshots for every changed screen (Today, Meals, Recipes, dish detail, editing states).
> - A report in README.md: "Changelog" (items 1–6: before → after), check results, the source and license of the new photo, and a list of open issues.
> - Final message: what changed, what was verified, what remains open. If any check fails, say so plainly and keep fixing.

</details>

**Result**

- **Before screenshots:** `03-screens/qa/before-step12/`. Already done in step 11 and re-verified: items 0–2, 5a, 5c, 6.
- **Today card:** "View recipe" is a real secondary button named "View recipe: Baked cod, potatoes & broccoli", 12.8:1, 44 px tall, with all states. Enter, Space and click open the dish detail (tested).
- **Recipe cards:**
  - Compact chips: the token `size-macro-chip` (24) and no wrapping inside a chip.
  - The chips sit in a full-width row of the compact card, so P, F, C are on **one row at 390 and 320 px**, including 110 g values. They wrap only at 150% text or more, never clipped.
- **Dish detail:**
  - **Compact ingredients:** amount + unit right-aligned; a text macro line (`.macro-line`) of letter + value.
  - **Method section** after Ingredients: time and servings meta, numbered steps in an `ol` (16 / 1.5, ≤ 80 characters). Every recipe has a `steps` array with food-safe cooking.
  - **Step editing:** labelled fields; Move up / down (WCAG 2.5.7) with focus kept and announced; Delete + Undo; empty-step validation; a "No steps yet" empty state with "Add steps".
  - **Exports:** method, edit steps, step error, step deleted, no steps, and the Today card.
- **Design system v1.5:**
  - 24 Recipe steps, the compact ingredient row, a growing `textarea` in fields, View recipe states and the chip row.
  - Tokens `size-macro-chip`, `size-step-number`, `size-measure` (40rem ≈ 75 characters).
  - Icons arrow-up and arrow-down.
- **Board:** a new "2C" row: Today card → Method → Edit steps → Step deleted → No steps, with notes 20–23.
- **Checks:**
  - `npm run check`: 61/61 + alignment 0 (2,322 edges, 26 screens);
  - `check:a11y`: Tier 1 0/40, Tier 2 0/9;
  - `check:screens`: 322/322 (new: one-row chips, View recipe keys, method, 16 steps + a very long step, no steps);
  - contrast 67/67; tokens in sync; lint 0.
- **Fixed while verifying:**
  - the textarea cut text at 3 lines;
  - `80ch` isn't a valid token dimension;
  - the audit didn't map `textarea` focus;
  - a chip test counted screen-reader labels as clipped.
- **Open:** the cod photo still shows broccoli, not peas (no free photo exists); prototype edits are not persisted.


## 13 — Targeted tweaks: Add-food rows, Ingredients in the Nutrition Facts look, recipe card order

**Prompt**

<details><summary>Full prompt (verbatim)</summary>

> Targeted tweaks to the existing mockup. You are acting as a senior product designer with 20 years of experience AND a strict QA engineer. These are SMALL fixes: fix the existing files, do not create parallel versions, and DO NOT TOUCH anything not mentioned here (content, spacing, colors, other screens and components stay unchanged). Keep the tokens, light theme and everything fixed earlier: equal side margins and the grid, text never clipped, nothing extends beyond its container, touch targets ≥ 44×44, WCAG 2.2 AA as the baseline and AAA for critical elements (7:1 contrast for calorie and macro numbers).
>
> ## Golden rule
> Never consider the work done without verifying it in a browser: make the change → render → screenshot → look at it → measure → fix → repeat. Save before and after screenshots for every changed screen. Find screens and components by the text in the UI and in the code. If you cannot unambiguously find something described here, say so plainly and show what you found instead of guessing.
>
> ## Fix 1. Add-food screen for Snack: the product row (e.g. "Almonds dry roasted")
> Currently the product row takes three lines. It must take two:
> - Line 1: the product name and the checkmark (selection button/indicator) side by side on one line. The name on the left at the left margin, the checkmark on the right at the right margin (hit area ≥ 44×44, accessible name, states default / pressed / focus / disabled, focus ring with a gap). A long name wraps within its own column, is not clipped and does not push the checkmark out.
> - Line 2: P — number, F — number, C — number in EXACTLY the same form as everywhere in the app: colored chips in the macro colors, the same component and tokens (not a copy of the styles), no dots between them, the same gap between number and letter, in ONE row (nowrap) at 390px and 320px at the default font size.
> - Do not delete any other information that was in the line that disappears (if there is any, e.g. kcal or serving size): place it in line 2 before the chips if everything fits in one row at 390px. If it does not fit, do not invent a solution: leave it as it was and describe the problem with a screenshot in the report.
> - Do not change anything else on this screen.
>
> ## Fix 2. Recipes → dish detail: the Ingredients section
> The Ingredients section must look like the Nutrition Facts card of the Almonds dish (the same design: background, border, radius, internal padding, row dividers, fonts, value alignment). The structure is different (a list of ingredients, not a table of nutrients), so reproduce the LOOK and reuse the same tokens and styles of the Nutrition Facts card rather than copying values by hand. Keep what was already agreed: compact rows without colored chips (number + P/F/C letter + unit), the ingredient name on the left, amount and unit right-aligned on one common edge, control hit areas ≥ 44×44, plus all the editing functionality (change name, amount, unit, delete, add) and nutrient recalculation. The screen order is unchanged: Ingredients, then the Method.
>
> ## Fix 3. Recipes: recipe cards (in ALL cards)
> The row of three chips P — number, F — number, C — number (colored chips, the same component) must sit in ONE row after the "covers your protein" line and BEFORE the "fits" line. Order in the card: ... → "covers your protein" → P / F / C row → "fits" → ... Apply to every card in the section. Do not change anything else in the cards. Test the longest values (e.g. 100+ g) at 390px and 320px: the row stays on one line, nothing is clipped; at enlarged fonts (150% and above) wrapping is allowed but nothing may be clipped.
>
> ## Verification (mandatory)
> 1. Before and after screenshots for every changed screen; LOOK at them and describe what you see.
> 2. `npm run check` (CSS loads via file:// and HTTP, no text clipping, touch targets) together with the alignment check: zero deviations from the grid on the left and right. Separately: on the Snack screen every product row is exactly two lines, P/F/C in one row at 390px and 320px; in the Recipes cards the order "covers your protein" → P/F/C → "fits" in all cards.
> 3. `npm run check:a11y`: zero AA violations and zero AAA violations for critical elements (chip and number contrast, touch targets, checkmark focus).
> 4. html-validate, stylelint, tokens.json validation and its parity with tokens.css: 0 errors.
> 5. 390px and 320px widths, 200% font scaling, long product names, the longest macro values. Keyboard check of the checkmark.
> 6. Regression: show that no other screen or component changed (compare before/after screenshots of the unchanged screens).
>
> ## Deliverables
> Fixed files, before and after screenshots, a short note in README.md (Changelog: 3 items, before → after) and a final message: what changed, what was verified, what remains open. If any check fails, say so plainly and keep fixing.

</details>

**Clarifications:**
- **Which "checkmark":** the screen had two candidates, the green ✓ next to the name (a USDA "verified" indicator) and the "+" add button. The user chose the green ✓: it becomes a button on the right margin, and the "+" stays next to it.
- **Line 2 at 320 px:** the chips don't fit under the name at 320. The user chose "chips under the name", accepting a wrap at 320.

**Result**

- **Fix 1:**
  - `.product--chips` rows on Add to Snack. Line 1: name, "598 / per 100 g" (kept as it was), "+", and the Verified button (`.icon-btn--verified`, 44 × 44, inset focus ring, Enter / Space shows the USDA source in a toast). Line 2: the P/F/C chips (the same macro-chip component), in one row at 390.
  - **Open:** with two buttons and kcal on line 1, the name column is about 82 px at 390 and about 42 px at 320. 3 of 5 rows are two lines at 390; at 320 names break mid-word and rows take 4–7 lines. Reported with a screenshot; no solution was invented.
- **Fix 2:** the Ingredients list sits in a `.facts` card. Its rows, header and fonts come from the same CSS rules as the Nutrition Facts table (shared selectors); a test compares 27 computed styles, all equal. Editing and recalculation are unchanged.
- **Fix 3:** compact recipe cards read reason → P/F/C (full width, one row at 390 / 320, also 110 g) → Fits → kcal, in all cards.
- **Checks:**
  - `npm run check`: 61/61 + alignment 0 (2,490 edges);
  - `check:a11y`: Tier 1 0/40, Tier 2 0/9;
  - `check:screens`: 331/331 (new tests for the Verified button, chips, card order, the facts look; open items reported separately);
  - lint 0; tokens unchanged.
- **Regression:**
  - 13 screens are pixel-identical.
  - The method states are shifted by about 1 px (the Ingredients card above changed height).
  - The analyzing screen's shimmer frame differs between any two exports.
- **Fixed while verifying:**
  - the Verified button's outward focus ring left its row by 2 px (now drawn inside the box);
  - the alignment check did not handle rows that wrap inside cards;
  - two test bugs (mouse-dismissed toast, the Energy row compared instead of a nutrient row).
- **Before / after:** `03-screens/qa/compare-step13/` (`tools/compare-step13.mjs`).


## 14 — Targeted tweaks: Today photo link, Add-to-Snack rows, recipe card column, Ingredients chips

**Prompt**

<details><summary>Full prompt (verbatim)</summary>

> Targeted tweaks to the existing mockup. You are acting as a senior product designer with 20 years of experience AND a strict QA engineer. These are SMALL fixes: fix the existing files, do not create parallel versions, and DO NOT TOUCH anything not mentioned here (content, copy, colors, other screens and components stay unchanged). Keep the tokens, light theme and everything fixed earlier: equal side margins and the grid, text never clipped, nothing extends beyond its container, touch targets ≥ 44×44, WCAG 2.2 AA as the baseline and AAA for critical elements (7:1 contrast for calorie and macro numbers). The new fixes take priority over earlier ones where they conflict (noted below).
>
> ## Golden rule
> Never consider the work done without verifying it in a browser: make the change → render → screenshot → look at it → measure → fix → repeat. Save before and after screenshots for every changed screen. Find screens and components by the text in the UI and in the code. If you cannot unambiguously find something, say so plainly and show what you found instead of guessing.
>
> ## Fix 1. Today → "Fits your dinner" section
> Tapping the dish image in this section opens that dish's recipe (the same detail screen in Recipes that the "View recipe" button opens). Do not change anything else on the Today screen.
> - The whole image block is clickable (tap and click), with visible pressed feedback and a pointer cursor on desktop.
> - Accessibility: the "View recipe" button already provides keyboard access, so the image must not create a redundant duplicate focus stop: make it a clickable area (aria-hidden, tabindex=-1) or the single link with the same accessible name "View recipe: <dish name>". Choose one and explain it in the report.
> - Verify that navigation works: clicking the image, clicking the button, keyboard (Enter / Space on the button), and that it opens exactly this dish's recipe.
>
> ## Fix 2. "Add to snack" screen: product rows (Almond and others)
> New layout (it replaces the previous one where the checkmark was on the right):
> - Left: the green circle with a checkmark next to the product name, in a narrow fixed-width column so ALL names start at the same x coordinate. The circle is top-aligned with the first line of the name.
> - Names are aligned to the top and to the top-left corner (not vertically centered in the row). A long name wraps within its own column and is not clipped. Below the name stays the P / F / C chip row in one line (as done earlier, unchanged).
> - Right: the "per 100 g" calories and the red button with a plus are aligned to the RIGHT edge (the right margin) and to the VERTICAL CENTER of the row. Button: hit area ≥ 44×44, states default / pressed / focus / disabled, accessible name ("Add <product name>"), focus ring with a gap.
> - The circle with a checkmark: if it is a selection indicator rather than a button, do not make it interactive; if it is a button, give it a hit area ≥ 44×44 (invisible padding), an accessible name and states.
> - Do not change anything else on this screen.
>
> ## Fix 3. Recipes → recipe cards (identical in ALL cards)
> Card structure: the dish image on the left, all information on the right, EVERYTHING left-aligned within the text column. Order in the column from top to bottom: title → cooking time → "covers your protein" → P / F / C chip row in one line → "Fits …" with the calorie information → the calorie amount. Use the existing copy and components; invent and change nothing in the content, only the layout changes.
> - Image: the same size and aspect ratio in every card (tokens), object-fit: cover, pinned to the left; the text column has min-width: 0 and wraps without clipping; card height grows with content.
> - The same vertical gap between all rows of the column (one token from the 4pt/8pt scale), identical in every card. Identical card padding and image-to-text gap.
> - The first lines of the text columns start at the same x coordinate in every card; the first lines of titles start at the same distance from the top of the card.
> - The P/F/C row must stay in one line at 390px and 320px at the default font size. Choose the image size (token) so that the row fits even at 320px. If it cannot fit without clipping, do not clip or silently break the row: show measurements and a screenshot in the report. At enlarged fonts (150% and above) wrapping is allowed but nothing may be clipped.
>
> ## Fix 4. Recipes → dish detail: Ingredients
> In the ingredient rows, add the unit g to the P, F, C values and show colored chips of different colors, THE SAME as everywhere in the design (the same component and tokens, not a copy of the styles): "P 12 g", "F 3 g", "C 20 g" in the macro colors, no dots between them, the same gap between letter and number, in ONE row. This replaces the current compact text form of P/F/C in these rows and overrides the earlier decision "no chips in Ingredients". Placement: in the ingredient row in place of the current P/F/C text (or as a second line under the name if it does not fit in the first line). Change nothing else in this section: the structure, card look, alignment, editing and recalculation stay as they are. Macros are distinguished by more than color (letter + number + g); numbers use tabular numerals.
>
> ## Verification (mandatory)
> 1. Before and after screenshots for every changed screen; LOOK at them and describe what you see.
> 2. `npm run check` (CSS loads via file:// and HTTP, no text clipping, touch targets) with the alignment check: zero deviations from the grid. Separately: on the Snack screen all names and circles start at the same x coordinate, the button and calories sit on the right margin at the vertical center; in the Recipes cards the gaps between rows are identical (measure and output a table across all cards), images are the same size, P/F/C in one row at 390px and 320px; in Ingredients all chips are in one row.
> 3. `npm run check:a11y`: zero AA violations and zero AAA violations for critical elements (chip and number contrast, touch targets, button focus).
> 4. html-validate, stylelint, tokens.json validation and its parity with tokens.css: 0 errors.
> 5. 390px and 320px widths, 200% font scaling, long product and dish names, the longest macro values (100+ g). Keyboard check of the "View recipe" button, the plus and the circle.
> 6. Regression: show that no other screen or component changed (compare screenshots of the unchanged screens).
>
> ## Deliverables
> Fixed files, before and after screenshots, a short note in README.md (Changelog: 4 items, before → after) and a final message: what changed, what was verified, what remains open. If any check fails, say so plainly and keep fixing.

</details>

**Clarifications:**
- **Fix 2, fit:** at 390 the right block (kcal + 44 px "+") left too little room for long names. The user chose "Make the name shorter so that everything fits properly": "Almonds, dry roasted" → "Roasted almonds", "Greek yogurt, 2%" → "Greek yogurt", "Apple, raw" → "Apple".
- **Fix 2, layout:** "Keep photo, chips under name". The chips run from the name to the right margin, and kcal + "+" sit on line 1.
- **Fix 3, badge:** "Keep above the title". Card 1's title offset therefore differs, and this is reported as open.

**Result**

- **Fix 1:**
  - The Today card photo is `.recipe-card__img--link` with `data-href="14-recipe-detail.html"`: pointer cursor and a pressed overlay (`:active` and `.is-pressed` on pointerdown).
  - Chosen approach: `aria-hidden`, no tab stop. "View recipe" stays the only keyboard and screen-reader path, so there is no duplicate stop.
  - The unused toast script from step 13 was replaced by the press handler.
- **Fix 2:**
  - `.product--chips` grid: thumb · `.product__check` (a passive ✓ "Verified: USDA" in a `size-icon-l` column, centred on the name's first line) · name · end. Chips sit under the name. kcal + Add (44) are on the right margin.
  - `.icon-btn--verified` was removed.
  - The name column grew from 82 to 111 px at 390.
- **Fix 3:**
  - The compact card is an 80 px square image (token 112 → 80; 88 was tried first, but 3-digit chips need 225 px and 88 left 218) plus one text column: title → time → reason → chips → fits → kcal, all `space-2` apart.
  - The foot was removed.
- **Fix 4:**
  - `dish-editor.js` `macroLine` renders "158 kcal" + `.macro-tile--chip` chips (the same markup as `macro_chips()` in the generator).
  - The `.macro-line__key` rules were removed. Docs c7, c8 and c23 were updated.
- **Checks:**
  - `npm run check`: 61/61 + alignment 0 (2,498 edges);
  - `check:a11y`: Tier 1 0/40, Tier 2 0/9;
  - `check:screens`: 350/350 (new step 14 tests, a recipe-card gap table in `qa/report.json`);
  - stylelint 0, html-validate 0, contrast 67/67, tokens in sync.
- **Regression:**
  - 21 of 28 PNGs are pixel-identical.
  - The rest changed by the fixes, or (analyzing) by the shimmer frame.
- **Fixed while verifying:**
  - 88 px image → 80 (3-digit chips wrapped at 390);
  - the pressed-overlay test read the colour mid-transition;
  - the right-block test measured `.product__end`, which carries 4 px of focus-ring room;
  - a local `facts` variable in `check.mjs` shadowed the report's `facts`.
- **Open:**
  - P/F/C wrap at 320 (Recipes 156 px column, Snack 152 px; they need 183–200);
  - Snack names break mid-word at 320 (41 px column; this was already so before);
  - kcal + "+" are centred on line 1, not on the whole row;
  - card 1's title is 34 px lower because of the badge.
- **Before / after:** `03-screens/qa/compare-step14/` (`tools/compare-step14.mjs`).


## 15 — Targeted tweaks: no ✓ in search rows, full-height recipe images, two-line ingredients

**Prompt**

<details><summary>Full prompt (verbatim)</summary>

> Targeted tweaks to the existing mockup. You are acting as a senior product designer with 20 years of experience AND a strict QA engineer. These are SMALL fixes: fix the existing files, do not create parallel versions, and DO NOT TOUCH anything not mentioned here (content, copy, colors, other screens and components stay unchanged). Keep the tokens, light theme and everything fixed earlier: equal side margins and the grid, text never clipped, nothing extends beyond its container, touch targets ≥ 44×44, WCAG 2.2 AA as the baseline and AAA for critical elements (7:1 contrast for calorie and macro numbers). The new fixes take priority over earlier ones where they conflict (noted below).
>
> ## Golden rule
> Never consider the work done without verifying it in a browser: make the change → render → screenshot → look at it → measure → fix → repeat. Save before and after screenshots for every changed screen. Find screens and components by the text in the UI and in the code. If you cannot unambiguously find something, say so plainly and show what you found instead of guessing.
>
> ## Fix 1. "Add to snack" screen: product rows
> - REMOVE the green circle with the green checkmark. Delete it from ALL screens and components of the app where it appears (find it by searching the code and the screenshots), together with its styles, tokens and states if nothing else uses them. If it carries a function somewhere (e.g. selection), do not delete it silently: show in the report where, and what you did.
> - On the left of the row only the product name remains (at the left margin, top-aligned; a long name wraps within its column and is not clipped). Right under the name, the three P / F / C chips in the macro colors in one row (as done earlier, unchanged).
> - On the right: the calorie amount with the "per 100 g" label and the red button with a plus are aligned to the RIGHT edge (the right margin) and to the VERTICAL CENTER of the row. Button: hit area ≥ 44×44, states default / pressed / focus / disabled, accessible name ("Add <product name>"), focus ring with a gap.
> - After removing the circle, all names start at the same x coordinate (the left margin). Do not change anything else on this screen.
>
> ## Fix 2. Recipes → recipe cards: full-height image respecting the card padding
> - The dish image stretches vertically from the card's top inner padding to its bottom inner padding (the card's top and bottom padding is preserved, the image does NOT touch the card edges). The left and top insets are the same as now. Currently the image is a small square; it must become a tall vertical block spanning the full height of the card's content.
> - The image width stays as it is now (token) so it does not take space from the text and the P/F/C row fits on one line. Do not widen it.
> - The image has its own rounded corners on all four corners (as the current thumbnail does). Do not round via overflow: hidden on the whole card, so that text is never clipped.
> - object-fit: cover: the image may be cropped, keep the dish in frame (use object-position if needed). The "Best fit" badge stays over the image in the same place as now (or as in the current design) and does not shift.
> - Card height grows with content and the image stretches with it (CSS grid: two columns, align-items: stretch; the image column with min-height: 0).
> - The same image width and the same insets in every card.
> - The P/F/C row must stay in one line at 390px and 320px at the default font size. If it cannot fit without clipping, do not silently break the row: show measurements and a screenshot in the report. At enlarged fonts (150% and above) wrapping is allowed but nothing may be clipped.
> - Leave everything else in the cards (row order, gaps between rows, copy, alignment, chips) unchanged.
>
> ## Fix 3. Recipes → dish detail: the Ingredients section, each ingredient in TWO rows
> This replaces the previous ingredient row layout. For EVERY ingredient:
> - Top row: on the LEFT the ingredient name (e.g. "Cod Fillet Baked"), left-aligned; on the RIGHT the amount in grams (e.g. "150 g"), right-aligned.
> - Bottom row: on the LEFT, under the name, the three colored chips P — number g, F — number g, C — number g (the same chips as everywhere in the design: the same component and tokens, no dots between them, the same gap between letter and number, in one row); on the RIGHT, under the grams, the calorie amount (e.g. "158 kcal"; use the same unit and format as in the rest of the app), right-aligned.
> - The right column (grams and calories) ends on one common edge, with tabular numerals so numbers do not jump between rows. The left column starts at the same x coordinate.
> - Apply identically to all ingredients in all dishes. The same vertical gap between the two rows and between ingredients (tokens from the 4pt/8pt scale).
> - Do not change anything else in the section: the card look, editing functions (name, amount, unit, delete, add) and nutrient recalculation stay. Editing controls do not break the layout, hit areas ≥ 44×44.
>
> ## Verification (mandatory)
> 1. Before and after screenshots for every changed screen; LOOK at them and describe what you see.
> 2. `npm run check` (CSS loads via file:// and HTTP, no text clipping, touch targets) with the alignment check: zero deviations from the grid. Separately:
> - the green circle appears nowhere any more (search the code and the DOM);
> - on the Snack screen all names start at the same x coordinate, and the button and calories sit on the right margin at the vertical center;
> - in the Recipes cards the image stretches from the card's top inner padding to its bottom inner padding, does not touch the edges, has the same width in every card, and P/F/C stay in one row at 390px and 320px;
> - in Ingredients every ingredient has two rows and the right column is on one line.
> 3. `npm run check:a11y`: zero AA violations and zero AAA violations for critical elements (chip and number contrast, touch targets, button focus). The card image has alt text (or an empty alt if it is purely decorative next to the dish name).
> 4. html-validate, stylelint, tokens.json validation and its parity with tokens.css: 0 errors.
> 5. 390px and 320px widths, 200% font scaling, long product, dish and ingredient names, the longest values (100+ g, four-digit kcal). Keyboard check of the plus button and the editing controls.
> 6. Regression: show that no other screen or component changed (compare screenshots of the unchanged screens).
>
> ## Deliverables
> Fixed files, before and after screenshots, a short note in README.md (Changelog: 3 items, before → after) and a final message: what changed, what was verified, what remains open. If any check fails, say so plainly and keep fixing.

</details>

**Interpretations (stated in the README):**
- **"Only the product name remains (at the left margin)":** the photo was removed from the Add to Snack rows too, not only the ✓.
- **"The badge stays over the image, as now":** "Best fit" has always been above the title, so it stays there.
- **"The same vertical gap between the two rows and between ingredients":** one token, `space-2` (8).

**Result**

- **Fix 1:**
  - `food_row` renders only the name, chips, kcal and "+". The `.product--chips` grid is `1fr auto`; `.product__end` spans both lines, centred on the row. The search-row divider starts on the name line.
  - Removed the ✓ markup and CSS everywhere: `.product__check`, `.product__verified`, the docs rows, and the audit's contrast entry for that icon.
  - Kept the functional uses of the `high` glyph (toasts, "High confidence", scan hint, "done" step) and listed them in the README.
- **Fix 2:**
  - The compact card uses `align-items: stretch`. The image column is 80 wide (token unchanged) with `min-height: 0`; the photo is absolutely positioned with cover / centre and has its own radius.
  - The image runs 16 px from the top and bottom edges: 239 / 205 / 205 px tall at 390.
- **Fix 3:**
  - `dish-editor.js` renders name | amount, then chips | `.ingredient__kcal`. kcal shares the facts value rule (mono, tabular, right-aligned).
  - The gap between the two lines is `space-2`. `.macro-line` was removed and docs c23 updated.
- **Checks:**
  - `npm run check`: 61/61 + alignment 0 (2,598 edges);
  - `check:a11y`: Tier 1 0/39 (one entry fewer: the removed icon), Tier 2 0/9;
  - `check:screens`: 356/356;
  - stylelint 0, html-validate 0, contrast 67/67, tokens in sync (no token changes).
- **Regression:**
  - 21 of 28 PNGs are identical.
  - The rest changed by the fixes, plus 5 px of anti-aliasing in Method and the shimmer frame.
- **Open:**
  - P/F/C wrap at 320 on Snack (137 px), Recipes (156 px) and Ingredients (156–173 px); they need 174–200;
  - card 1's title offset (badge).
- **Before / after:** `03-screens/qa/compare-step15/` (`tools/compare-step15.mjs`).


## 16 — Add to Snack: a matching photo per product, chips under the photo

**Prompt**

<details><summary>Full prompt (verbatim)</summary>

> Targeted tweak to the existing mockup. You are acting as a senior product designer with 20 years of experience AND a strict QA engineer. This is a SMALL fix: fix the existing files, do not create parallel versions, and DO NOT TOUCH anything not mentioned here (content, copy, colors, other screens and components stay unchanged). Keep the tokens, light theme and everything fixed earlier: equal side margins and the grid, text never clipped, nothing extends beyond its container, touch targets ≥ 44×44, WCAG 2.2 AA as the baseline and AAA for critical elements (7:1 contrast for calorie and macro numbers).
>
> ## Golden rule
> Never consider the work done without verifying it in a browser: make the change → render → screenshot → look at it → measure → fix → repeat. Save before and after screenshots. Find the screen by "Add to snack" in the UI text and in the code. If you cannot unambiguously find something, say so plainly instead of guessing.
>
> ## Fix. "Add to snack" screen: product photos
> For EVERY product in the list (Almonds, Roasted almonds and all the others) use this row layout:
> - On the left the product photo, with the product name next to it (to the right of the photo). The name is top-aligned with the photo; a long name wraps within its own column and is not clipped.
> - UNDER the photo, a row of three colored chips P / F / C (the same chips as everywhere in the design: the same component and tokens, no dots between them, the same gap between letter and number, in one row), starting at the left margin (the left edge of the photo). The same vertical gap between the photo and the chips in every row (token from the 4pt/8pt scale).
> - On the right, as before: the calorie amount with the "per 100 g" label and the red button with a plus are aligned to the RIGHT edge (the right margin) and to the vertical center of the row. Change nothing about them (hit area ≥ 44×44, states, accessible name).
> - The photo size is EXACTLY the same as the thumbnails in the Meals section on the Today screen: take the same size token, radius and object-fit (cover) rather than new values; if the Meals thumbnail is its own component, use it. All photos in the list have the same size and proportions.
> - The photo must match the product name: "Almonds" shows almonds, "Roasted almonds" shows roasted almonds, and likewise for every product. Pick a separate matching photo for each product. Source: freely licensed photos (Unsplash / Pexels / Pixabay) with author, link and license recorded, or files provided by the user in the project folder. No competitor photos and no copyrighted images. After choosing, LOOK at each photo and confirm with your own eyes that it shows exactly this product; do not rely on the file name or the search result alone. If there is no network access or no suitable photo, put a clearly labeled placeholder and list in the report which products need files.
> - Store photos in assets, one file per product, optimized size, stable file names; alt text with the product name (or an empty alt if the adjacent name already carries the meaning).
> - Do not change anything else on this screen (product order, copy, values, buttons, edge insets).
>
> ## Verification (mandatory)
> 1. Before and after screenshots of the screen; LOOK at them and describe what you see, and separately describe what each photo shows and whether it matches the name.
> 2. `npm run check` (CSS loads via file:// and HTTP, no text clipping, touch targets) with the alignment check: zero deviations from the grid. Separately: all photos on the screen have exactly the same size as the Meals thumbnails on Today (measure and compare bounding boxes); all names start at the same x coordinate; the P/F/C chips under the photo are in one row at 390px and 320px; the button and calories sit on the right margin at the vertical center.
> 3. `npm run check:a11y`: zero AA violations and zero AAA violations for critical elements (chip and number contrast, touch targets, button focus).
> 4. html-validate, stylelint, tokens.json validation and its parity with tokens.css: 0 errors.
> 5. 390px and 320px widths, 200% font scaling, long product names, the longest macro values (100+ g). Check that photos are not stretched or distorted.
> 6. Regression: show that no other screen or component changed (compare screenshots of the unchanged screens).
>
> ## Deliverables
> Fixed files, before and after screenshots, a table "product → photo file → author / source / license", a short note in README.md (Changelog) and a final message: what changed, what was verified, what remains open. If any check fails, say so plainly and keep fixing.

</details>

**Clarification:** downloading needs explicit permission. I asked to download 3 photos (file, source and size listed); the answer was "Yes, download all 3".

**Result**

- **Photos:** checked by eye.
  - Almonds and Apple keep the photos already in the repo.
  - New: roasted almonds (Pixabay 83766, PublicDomainPictures), almond butter (Pexels 33657317, cole yap) and Greek yogurt (Unsplash NFHeBysjCTI, Micheile Henderson). Each was cropped to a centred square and saved at 240 px (19–33 KB). Credits are in `01-branding/assets/CREDITS.md`.
  - Rejected: hazelnut-like salted nuts, sugar-coated fair almonds, a branded yogurt cup, a thin yogurt.
- **Layout:**
  - `.product--chips` grid: `size-thumb | 1fr | auto`. The photo is `.product__thumb` (the Meals thumbnail) with the name top-aligned beside it.
  - The chips span columns 1–2 under the photo, `space-2` below it. kcal + Add stay centred on the row. Docs c7 updated.
- **Checks:**
  - `npm run check`: 61/61 + alignment 0 (one earlier run had a file:// vs http:// flake on the docs page, then passed);
  - `check:a11y`: Tier 1 0/39, Tier 2 0/9;
  - `check:screens`: 362/362 (photo boxes equal the Meals thumbnail, 48 × 48, r10, cover);
  - lint 0, tokens in sync.
- **Regression:**
  - 23 of 28 PNGs are identical.
  - Analyzing and the dish calculator vary between any two exports.
- **Open:** at 320 the chips wrap (they need 183–200 px, the space is 137). At 390 they're one row (200 of 207); 3-digit values also wrap at 390.
- **Before / after:** `03-screens/qa/compare-step16/` (`tools/compare-step16.mjs`).


## 17 — Plan audit: FLOWS.md plan vs the project, gaps built

**Prompt**

<details><summary>Full prompt (verbatim)</summary>

> Audit the plan against the actual project state: build what is missing and verify the result. You are acting as a senior product designer with 20 years of experience AND a strict QA engineer and technical project manager. Invent nothing: every statement about the state must be backed by evidence (a file, a line, git history, a check result, a screenshot).
>
> ## Golden rule
> Never consider the work done without verifying it in a browser: make the change → render → screenshot → look at it → measure → fix → repeat. Do not say "done" until every check in Phase 4 passes. If something could not be verified, say so plainly.
>
> ## Phase 0. Find the plan
> Look for the plan created earlier in planning mode, in this order: ~/.claude/plans/ (all .md files, newest and most relevant to this project), the project root and docs/, plan/, .claude/ folders (PLAN.md, plan*.md, TODO.md, ROADMAP.md), the project README.md, git history (git log) and commit messages. If you find several versions, take the latest relevant one and state which and why. If you cannot find a plan, stop and ask the user for the path. Do NOT reconstruct or invent a plan from memory.
>
> ## Phase 1. Turn the plan into a checklist
> Break the plan into atomic items and save it as PLAN-AUDIT.md (in the project root or docs/): ID, item, expected result, acceptance criteria (what exactly must be true for the item to count as done), files where it should live. Keep the plan's structure and order (steps, phases). Skip nothing and do not merge items in a way that loses requirements.
>
> ## Phase 2. Audit the actual state
> For every item determine a status with evidence:
> - Done: fully implemented, evidence exists, acceptance criteria pass;
> - Partial: partly implemented (describe what is missing);
> - Missing: absent;
> - Superseded: replaced by a later user decision (e.g. later targeted mockup tweaks changed or cancelled the original item). This is NOT a defect: do not revert such changes. Cite the file or commit that confirms it, and if the evidence is missing, mark it "unconfirmed" and ask;
> - Unclear: ambiguous item or contradiction; do not guess, put it in the questions list.
> Evidence for each status: what exactly you opened, ran and saw (file path, command, result, screenshot). A "Done" status for visual items without a browser check is forbidden. Separately run the project's existing checks (`npm run check`, `npm run check:a11y`, html-validate, stylelint, tokens.json validation) and factor the results into the statuses.
> Also find what exists in the project but is NOT in the plan (extra screens, components, files) and record it under "Outside the plan".
>
> ## Phase 3. Gap report and build-out
> 1. Show the gap table: ID | item | status | evidence | what to do. Execution starts right from it (no separate confirmation needed), but do not execute items with status Unclear; list the questions for the user at the end.
> 2. Build everything with status Missing and Partial in priority order: first what other items depend on, then the rest; sequentially, in batches, with verification after each batch (re-audit exactly those items, screenshots, `npm run check`). Do not stop after the first batch until all Missing and Partial items are closed or you hit a blocker; describe the blocker precisely.
> 3. Follow the already agreed design and requirements: tokens, light theme, equal side margins and the grid (zero deviations), text never clipped, nothing extends beyond its container, touch targets ≥ 44×44, WCAG 2.2 AA as the baseline and AAA for critical elements (7:1 contrast for calorie and macro numbers, focus with a gap), compliance with Apple App Store and Google Play requirements. Do not break anything fixed earlier.
> 4. Do NOT change or delete anything outside the gaps. No destructive actions (force git commands, deleting files outside the gaps). Do not create parallel versions: fix the existing files. Add new components to the design system (tokens, components, docs) with states default / pressed / focus / disabled / error; tokens.json and tokens.css stay in sync.
> 5. If the gap is very large, do not rush: work by priority and honestly leave whatever you could not finish with status Missing and a reason.
>
> ## Phase 4. Verify yourself
> After the build-out, go through the WHOLE checklist again regardless of what you just did (do not trust your own notes; check the actual state again):
> 1. Re-audit all items with evidence; each item's status must be confirmed by a fresh check.
> 2. `npm run check`, `npm run check:a11y` (zero AA violations and zero AAA violations for critical elements), html-validate, stylelint, tokens.json validation and parity with tokens.css: 0 errors. For checks the project does not have yet but needs, create them or state plainly that they are missing.
> 3. Browser checks: 390px and 320px widths, 200% font scaling, long texts, keyboard traversal of new and changed elements. LOOK at the screenshots and describe what you see. For the relevant screens: dish photos match their names, nothing is clipped, spacing is consistent.
> 4. Regression: compare screenshots of the screens that should remain unchanged with the previous ones.
> 5. Reconcile the plan with reality and UPDATE the plan: in PLAN-AUDIT.md and in the plan file itself (if it lives in the project) record the actual statuses, deviations (Superseded) with the reason and a reference, and the "Outside the plan" section. The plan must match the project state exactly; after updating, do a last pass and confirm that every line of the plan matches what is in the code and in the screenshots.
>
> ## Deliverables
> - PLAN-AUDIT.md: the checklist "before" and "after" with statuses and evidence.
> - The gap table and what exactly was built (files, before and after screenshots).
> - A checks report (what was run and the results).
> - The updated plan file that matches reality.
> - Final message: the item counts by status (Done / Partial / Missing / Superseded / Unclear) before and after, what was built, what remains and why, and the list of questions for the user. If any check fails, say so plainly and keep fixing.

</details>

**Result**

- **Plan:** `~/.claude/plans/valiant-wandering-sparrow.md` is the only plan file. Its in-project result is `03-screens/FLOWS.md`.
- **Checklist:** `PLAN-AUDIT.md` has 53 atomic items with evidence (scripts, Playwright text, screenshots, checks, git history and PROMPTS.md).
  - Before: 43 Done, 3 Partial, 1 Missing, 5 Superseded, 1 Unclear.
  - After: 47 Done, 0 Partial, 0 Missing, 5 Superseded, 1 Unclear.
- **Built:**
  - S14b: the servings stepper on dish detail. It had been dropped in step 11 without a request (transcript evidence).
  - S11: the unit switch g | portion.
  - S13: the "High protein" chip.
  - F6: accessibility per flow.
  - Fixed while verifying: the DS stepper and the Ingredients header overflowed at 320 pt with 200 % text.
  - FLOWS.md reconciled with the build: corrected statements and a "Spec vs build" table.
- **Checks:**
  - `npm run check`: 61/61 + alignment 0 (2,768 edges);
  - `check:screens`: 387/387;
  - `check:a11y`: Tier 1 0/39, Tier 2 0/9;
  - tokens, stylelint, html-validate 0; contrast 67/67.
- **Regression:** 21 of 26 screen PNGs are identical.
- **Questions (not executed):**
  1. The ±2 % Atwater rule vs USDA kcal.
  2. Build 01–06, 15, 16?
  3. Landing page, LINKS.md, prototype?
  4. The Recipes filter row wraps to 3 rows.
- **Before / after:** `03-screens/qa/compare-audit/` (`tools/compare-audit.mjs`), "before" exports in `03-screens/qa/before-audit/`.


## 18 — Build onboarding (01–06), Diary (15) and Profile (16)

**Prompt** (verbatim, the user's answer to question 2 of the plan audit):

> << Should I build onboarding (01–06), Diary (15) and Profile (16)? In step 10 you chose to build flows 1 and 2 only. They'd also need three new design-system components: a step indicator, an option card and a week strip. >>
>
> Yes, please build

**Result**

- **Design system v1.11:**
  - Components 25 Step indicator (`.progress`; the class `.steps` was taken by the flows board), 26 Option card and 27 Week strip, each with all its states and documented in `index.html`.
  - Token `size.day-ring`, icon `copy`, `.product--nav`, and facts values with `nowrap`.
- **Screens:** 19 new, 46 total.
  - 01 welcome + link sent, 02 goal, 03 about you + error, 04 diet, 05 allergies (+ edit from Profile), 06 target + floor, 07 first day, 13 re-filtered, 15 Diary × 4 days, 16 Profile + saved + delete confirm.
  - Diary totals come from logged meals (1,703 / 2,095 / 1,661 / 1,171); FLOWS.md's example week was updated (the old totals have no exact USDA combination).
- **Board:** Flow 0 (2 rows + errors) and Flow 3 (+ Diary), notes 24–34. Tab bar Diary and Profile now link.
- **Checks:**
  - `npm run check`: 61/61 + alignment 0 (3,636 edges);
  - `check:screens`: 603/603;
  - `check:a11y`: Tier 1 0/39, Tier 2 0/9;
  - tokens in sync (285); stylelint 0; html-validate 0; contrast 67/67.
  - Regression: the committed screens are unchanged apart from the plan audit's known changes.
- **Fixed while verifying:** option-card focus (error group, ring outside the group); week strip at 200 % and in a narrow docs stage; target input clipping; stale "% of kcal" at the floor; numbers breaking in facts tables; the chevron rule scoped; the board width; the link-sent message below the fold.
- **Checker corrections:** a lone app-bar Back button is the leading glyph; the week strip's documented bleed; the over-goal day in the data check.


## 19 — Landing page, README and LINKS.md

**Prompt**

> Create root index.html (a landing page linking to the stylescape, design system, prototype and flows board)
> and write root README.md in English: overview, links (GitHub Pages + video placeholder),
> embedded preview images, concept summary, how I used Claude Code (link to process/PROMPTS.md),
> repository structure, what I'd do next. Create LINKS.md with the same external links.

**Result**

- **`index.html` (landing):**
  - Uses the brand tokens and fonts; layout CSS uses tokens only.
  - **Content:** a hero with both user stories; four deliverable cards with previews (stylescape, design system, prototype, flows board); documents; a video placeholder; credits.
  - **Checks:** html-validate 0; axe WCAG 2.2 AA 0 violations at 1440, 390 and 320 px; no horizontal scroll; 44 px skip link as the first tab stop; every relative link resolves.
- **Previews:** `tools/previews.mjs` (`npm run previews`) renders four 1200 × 675 JPGs into `previews/`. The full exports are too tall to embed.
- **README.md:** rewritten as overview, links, previews, concept, how I used Claude Code, repository structure, rebuild commands, what I'd do next, and credits. The step 11–18 reports moved unchanged to `process/CHANGELOG.md`, with their links re-pointed.
- **LINKS.md:** every external link, the video as a placeholder, and how to enable GitHub Pages. On 2–3 Oct 2026 the Pages address returns 404, because Pages isn't enabled and the work isn't on `main` yet.
- **Found while making previews:** the docs page header still said "v1.2 · 283 CSS variables · 24 components". `tools/build_docs.py` now computes the version, unique variables (268) and components (27) on every build. The old "283" counted semicolons.
- **Also:** `.nojekyll` (Pages serves the files as-is) and the CLAUDE.md structure list (previews, PLAN-AUDIT.md, process/CHANGELOG.md).
- **Not built (not asked for):** `03-screens/index.html`, a phone-frame prototype shell. The prototype link opens the start screen (01 Welcome) directly; on a desktop it shows at phone width in the top-left corner.
- **Checks:** `npm run check` 61/61 + alignment 0 (3,636 edges); `check:screens` 603/603; `check:a11y` Tier 1 0/39, Tier 2 0/9; tokens in sync.


## 20 — Publish: push, merge to main, GitHub Pages

**Prompt**

> enabled github pages. push all the results to github and merge to main. make sure pages link is working. update docs if needed

**Result**

- **Commit and merge:** `584766a` on `design-system` (steps 17–19), pushed. `main` fast-forwarded from `db09594` to `584766a` and pushed (no merge conflicts: `main` hadn't moved since PR #1).
- **Pages:** the old build served the Jekyll-rendered README. The new landing page was live about 30 s after the push.
- **Live check (fresh browser context, like incognito):**
  - 52 pages: landing, stylescape, directions, design system + standalone, flows board, all 46 screens. All answered 200, with 0 failed requests, 0 broken images and 0 script errors.
  - 32 internal links resolve.
  - I looked at the landing page (1280 px) and Today (390 px) on the live site.
- **Docs:** LINKS.md (status "Live", check details, no more "404") and the README Pages note.


## 21 — Clickable prototype shell (`03-screens/index.html`)

**Prompt** (verbatim, the answer to "There's no phone-frame prototype page yet … Should I build it?")

> yes, please build

**Result**

- **`03-screens/index.html`:** every screen in a phone frame (a 390 × 844 iframe in a bezel), scaled to fit the window and never above 1:1.
  - **Picker:** grouped by flow (0 · 1A · 1B/1C · 2 · 2B/2C · 3).
  - **Info panel:** "19 of 46", the screen name and state, Previous / Next, "Open this screen on its own", the flows board and FLOWS.md.
  - **Navigation:** ← / → keys, `#screen` deep links (an unknown hash falls back to 01 Welcome). A tap inside the phone moves the picker and the hash along (same origin over http; from file:// the last picked screen stays shown).
  - **Layout:** desktop is picker | sticky phone | sticky info, with the whole phone visible on load. Phones get one column: header, phone, info, picker.
- **Generated** by `03-screens/tools/build_screens.py`, which asserts that every screen file is in the picker exactly once. Styles are in `03-screens/prototype.css` (tokens only). The missing board names for 5 screens were added.
- **Fixed while verifying:** the scale read a CSS `calc()` as a number (NaN, a 0 × 0 phone); picking a screen scrolled the page away from the phone on mobile; the phone was 1 px below the fold at 1280 × 720 and started below the header on desktop; the picker scrolled inside the page (nested scrolling).
- **Tests:** `check:screens` section 9 serves the repo over http and checks the picker covers all 46 screens, Next / Prev / →, the in-phone click sync, deep links and a bad hash, the fit at 1440, 1280 × 720, 390 and 320, and axe 0. Result: 610 / 610.
- **Lint:** `lint:css` now includes `prototype.css`; `lint:html` includes both index pages.
- **Docs:** the landing page, README (links, preview link, structure, checks, next steps), LINKS.md, FLOWS.md, CLAUDE.md and PLAN-AUDIT.md (question 3 closed).
