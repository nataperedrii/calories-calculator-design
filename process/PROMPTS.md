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
