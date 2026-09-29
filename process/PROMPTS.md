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
