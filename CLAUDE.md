# CLAUDE.md

Instructions for Claude Code in this repo. The repo is a design test task, built with an AI-native workflow: everything is made as HTML/CSS with Claude Code and exported to PNG.

## Task summary

Source: [jito-dev/trainee-designer-apr-2026-test-task](https://github.com/jito-dev/trainee-designer-apr-2026-test-task)

Design a **mobile app for calculating calories**, covering two user stories:

1. **Calculate calories** in a dish or product.
2. **Find recipes** that suit the user's needs.

Reviewers look for creative direction, a systematic design approach, an AI-native workflow (no hand-drawn Figma work required), and clearly reasoned decisions. The submission is a public GitHub repo, with GitHub Pages links that open in incognito and a video walkthrough (Loom/FocuSee) of all three deliverables.

Background research: [process/research.md](process/research.md). It compares MyFitnessPal, Yazio, Lifesum and FatSecret and ends with 5 design insights.

## Deliverables

1. **Branding / stylescape** (`01-branding/`): brief and rationale, 2–3 creative directions, then the final stylescape (HTML plus a PNG of about 3840×2160).
2. **Design system** (`02-design-system/`): tokens (JSON and CSS), components with all their states, a documentation page, and a WCAG contrast check.
3. **Key screens and flows** (`03-screens/`): mobile screens for the main journeys, a clickable prototype, a flows board with annotations, and PNG exports.

## Rules

- **All content is in English.** No lorem ipsum anywhere.
- **Use realistic food data.** Kcal and macros (protein, fat, carbs) are real values per 100 g (for example USDA / FoodData Central). Portions and recipe totals must add up.
- **Mobile screens are 390×844** (iPhone 14/15 viewport). PNG exports are @2x (780×1688).
- **Screens use only the design system.** Every screen may use only tokens from `02-design-system/tokens.css` and components from `02-design-system/components.css`. No hard-coded colours, font sizes, spacing, radii or shadows in screen files. If something is missing, add it to the design system first (tokens.json, tokens.css, components.css and the docs page), then use it.
- **Log every step.** After each step, append the user's prompt (verbatim) and a short summary of what was done to `process/PROMPTS.md`.
- **Export PNGs with Playwright** (headless Chromium). Use a fixed viewport and `deviceScaleFactor: 2` for screens. Put the export script in the repo so exports can be reproduced.

## Structure

```
calories-calculator-design/
├── README.md                  ← main page: description, links, image previews
├── LINKS.md                   ← all external links: video, GitHub Pages, (Figma)
├── CLAUDE.md                  ← instructions for Claude Code (shows the process)
├── index.html                 ← GitHub Pages landing page linking to the 3 sections
│
├── 01-branding/
│   ├── BRAND.md               ← brief and rationale: audience, positioning, personality, why these colours/fonts
│   ├── directions.html/.png   ← 2–3 creative directions, one of which is chosen
│   ├── stylescape.html        ← final stylescape
│   ├── stylescape.png         ← the same as an image (≈3840×2160)
│   └── assets/                ← logo (SVG), photos, illustrations
│
├── 02-design-system/
│   ├── README.md              ← system overview + WCAG contrast check
│   ├── tokens.json            ← tokens (colours, typography, spacing, radii, shadows)
│   ├── tokens.css             ← the same tokens as CSS variables
│   ├── components.css         ← components
│   ├── index.html             ← documentation: all tokens and components with states
│   └── design-system.png
│
├── 03-screens/
│   ├── FLOWS.md               ← user flows: list of screens, their purpose, states
│   ├── index.html             ← clickable prototype (start)
│   ├── screens/*.html         ← each screen separately, 390×844
│   ├── flows.html / flows.png ← board with all screens, arrows and annotations
│   └── exports/*.png          ← PNG of each screen @2x
│
└── process/
    ├── PROMPTS.md             ← key prompts and what came out of them
    └── research.md            ← short competitor analysis (MyFitnessPal, Yazio, Lifesum…)
```

## Exporting PNGs

Playwright runs from a local Python venv (`.venv/`, gitignored). To set it up once:

```bash
python3 -m venv .venv && .venv/bin/pip install playwright && .venv/bin/python -m playwright install chromium
```

Export with `tools/export.py`. It defaults to a 390×844 viewport at @2x:

```bash
.venv/bin/python tools/export.py 03-screens/screens/home.html 03-screens/exports/home.png
.venv/bin/python tools/export.py 01-branding/directions.html 01-branding/directions.png --width 2160 --height 1200 --scale 1 --full-page
```

## Design system builds

`02-design-system/tokens.json` is the source of truth. After changing it, run:

```bash
python3 tools/build_tokens.py
```

```bash
python3 tools/build_docs.py
```

```bash
python3 tools/contrast.py
```

These regenerate `tokens.css`, render the token sections of `index.html`, and write the WCAG table into `02-design-system/README.md`.

## Verification (Node tooling)

Node lives in `~/.local/node` (add `~/.local/node/bin` to PATH); dev packages are in `node_modules` (gitignored, `npm install`).

```bash
npm run build:standalone
```

```bash
npm run export:png
```

```bash
npm run check
```

```bash
npm run check:a11y
```

`npm run check:a11y` must also pass: **Tier 1 (WCAG 2.2 A/AA) and Tier 2 (AAA for critical elements) must both have 0 failures.** It runs axe, pa11y, a custom contrast scan (7:1 critical, 4.5:1 regular), axe AAA on critical elements, keyboard, focus, target, reflow, zoom, text-spacing and user-preference checks. Reports go to `02-design-system/a11y/`. Never disable rules or hide elements to make it pass. Use `npm run audit:before` only to record a new baseline.

`npm run check` must pass (61/61) before any design-system change is considered done: it checks paths, tokens (W3C structure, references, drift), stylelint, html-validate, contrast, file:// vs http, CSS loading, clipping, overflow, touch targets (44 pt / 48 dp), component geometry at 100% and 200% text, axe-core, the standalone page and the PNG export. Reports go to `02-design-system/qa/`.

## Working notes

- Use relative paths everywhere so the GitHub Pages links work.
- Keep external dependencies to Google Fonts. Everything else is inline or in the repo.
