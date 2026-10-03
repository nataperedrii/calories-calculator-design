# How it works

A one-page guide to the machinery behind Ripe, for someone new to the repository. Every statement here can be checked in the files it names.

## 1. Tokens: from `tokens.json` to CSS

- **The source of truth is [`02-design-system/tokens.json`](02-design-system/tokens.json)**, written in the W3C Design Tokens format. It holds colours, type, spacing, radii, sizes, shadows and motion.
- **There are two layers of colour:**
  - *primitives*, raw values named after food, such as `color.primitive.oat.50`;
  - *semantic* tokens that point to them, such as `color.bg.canvas = {color.primitive.oat.50}`.
- **`python3 tools/build_tokens.py`** turns the JSON into [`tokens.css`](02-design-system/tokens.css):
  - each token path becomes a CSS variable, with the word `primitive` dropped (`color.primitive.oat.50` → `--color-oat-50`);
  - an alias becomes `var(…)`, so a semantic token stays linked to its primitive;
  - a type token also gets size, line, weight, family and tracking variables.
- **`tokens.css` is generated:** its header says "Do not edit by hand". `build_tokens.py --check` fails if it no longer matches the JSON. `npm run check` runs that test.
- **[`components.css`](02-design-system/components.css)** uses only `var(--…)` tokens. Screens may use only `tokens.css` and `components.css`.
- **`python3 tools/build_docs.py`** rewrites the token sections of the docs page (`02-design-system/index.html`, between `<!-- tokens:start -->` and `<!-- tokens:end -->`), so the page always shows the real values. The component sections are hand-written.
- **`python3 tools/contrast.py`** checks every text/background pair the components use, and writes the WCAG table into [`02-design-system/README.md`](02-design-system/README.md).

## 2. Screens: `build_screens.py`

The 46 screens are not drawn by hand. [`03-screens/tools/build_screens.py`](03-screens/tools/build_screens.py) writes them, along with the flows board and the prototype shell.

1. **Data.** The `USDA` table near the top holds each food's name and its kcal, protein, fat and carbs per 100 g (USDA FoodData Central, SR Legacy).
2. **Portions.** `item("salmon", 140)` scales a food to 140 g. kcal is rounded half up to a whole number; macros keep their decimals. `total([...])` adds the items up. Meals are lists of items, for example `LUNCH = [item("salmon", 140), item("rice", 150), …]`.
3. **Guards.** `assert` lines check that the numbers still add up. For example:
   - breakfast, lunch, snack and dinner are 344, 559, 268 and 462 kcal;
   - 879 kcal are left for dinner;
   - the goal's macros add up to 2,050 kcal;
   - the lentil soup is 72 kcal per 100 g and 246 kcal per portion.

   If a number changes, the build stops and says so.
4. **HTML.** Small functions (`app_bar`, `tab_bar`, `stepper`, `nutri`, `meal_row`, `recipes_screen`, …) return HTML that uses design-system classes only. `page()` wraps them and writes `03-screens/screens/<name>.html`.
5. **Interactive dish detail.** The recipe-detail pages carry their data as JSON in `<script id="dish-data">`. [`screens/js/dish-editor.js`](03-screens/screens/js/dish-editor.js) reads it to recalculate kcal and macros while you edit.

Run it with `npm run build:screens`, then `npm run export:screens` to refresh the PNGs.

## 3. How to change a portion (example)

Say lunch should have 120 g of salmon instead of 140 g:

1. In `build_screens.py`, change `item("salmon", 140)` to `item("salmon", 120)` in `LUNCH`.
2. Run `npm run build:screens`. It **stops** at the `assert` that expects lunch to be 559 kcal. This is intentional: the totals shown on many screens (Today, Diary, the photo result, kcal left, the recipe "fits" numbers) all depend on it.
3. Update the expected numbers in the asserts (for example the lunch total and `LEFT == 879`; `LEFT` itself is computed from the goal and the day). Then run the build again until it passes.
4. Run `npm run export:screens` and `npm run check:screens`. The "numbers add up" section re-checks the totals on the rendered pages.

## 4. What each check verifies

| Command | What it verifies |
|---|---|
| `npm run check` | The design system:<br>• paths and tokens (W3C structure, references, `tokens.css` drift);<br>• stylelint and html-validate;<br>• contrast;<br>• `file://` vs `http://` rendering, CSS loading, clipping and overflow;<br>• 44 pt / 48 dp touch targets and component geometry at 100 % and 200 % text;<br>• axe-core;<br>• the standalone page and the PNG export.<br>Then `npm run check:align`: every heading, text block, card, row and glyph sits on the two grid lines from the tokens, with 0 px tolerance, at 390 and 320 px. |
| `npm run check:screens` | Every screen:<br>• code: html-validate; the design-system-only rule (only `tokens.css` and `components.css`, no hex or px, data-only inline styles); links;<br>• rendering: axe WCAG 2.2 A/AA, the 390 × 844 frame, clipping, 44 px targets, keyboard focus;<br>• data and files: on-screen numbers that add up, export sizes;<br>• stress tests at 320 px, 200 % text and long names;<br>• behaviour: the dish editor, servings, onboarding, Diary, Profile and the prototype shell over http. |
| `npm run check:a11y` | Accessibility of the design-system page:<br>• Tier 1 = WCAG 2.2 A/AA (axe, pa11y, a contrast scan at 4.5:1);<br>• Tier 2 = AAA for critical elements (7:1 contrast, target size, focus appearance).<br>Keyboard, focus, reflow, zoom, text spacing and user-preference checks. Reports are in `02-design-system/a11y/`. |
| `npm run lint:html`, `npm run lint:css` | html-validate on all public pages; stylelint on the CSS files. |
| `python3 tools/contrast.py` | WCAG contrast of every token pair the components use. |
| `python3 tools/build_tokens.py --check` | `tokens.css` still matches `tokens.json`. |
| `npm run check:submission` | Release hygiene:<br>• no Cyrillic and no private data;<br>• open placeholders listed;<br>• internal links and images resolve;<br>• online, the external links answer. |

All of these run in headless Chromium (Playwright). They don't replace testing on real phones or with screen readers.
