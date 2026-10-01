# Ripe: a photo-first calorie calculator (design test task)

Design for a mobile app that answers two questions: **how many calories are in this dish or product**, and **which recipes suit me**. Everything is built AI-natively as HTML/CSS with Claude Code and exported to PNG with Playwright. The full process is logged in [process/PROMPTS.md](process/PROMPTS.md).

| Deliverable | Start here | Preview |
|---|---|---|
| 01 Branding | [BRAND.md](01-branding/BRAND.md) · [stylescape](01-branding/stylescape.html) | [stylescape.png](01-branding/stylescape.png) |
| 02 Design system | [docs page](02-design-system/index.html) · [README](02-design-system/README.md) | [design-system.png](02-design-system/design-system.png) |
| 03 Screens and flows | [FLOWS.md](03-screens/FLOWS.md) · [flows board](03-screens/flows.html) · [screens](03-screens/screens/) | [flows.png](03-screens/flows.png) · [exports](03-screens/exports/) |

Background: [process/research.md](process/research.md) (MyFitnessPal, Yazio, Lifesum, FatSecret → 5 insights).

---

## Update: chips in one row, View recipe, compact ingredients, Method (step 12)

Before / after images: [03-screens/qa/compare-step12/](03-screens/qa/compare-step12/). The "before" exports are kept in [03-screens/qa/before-step12/](03-screens/qa/before-step12/). Step 11 comparisons are in [qa/compare/](03-screens/qa/compare/).

### Changelog (before → after)

| # | Area | Before (step 11) | After (step 12) | Compare |
|---|---|---|---|---|
| 0 | **Global grid** | Two token grid lines, 0 deviations on 20 screens | **Unchanged rules, more coverage:**<br>- The same rules now also cover the method steps (numbers and text on one x), compact ingredient rows (amount on one right edge) and the card chip row.<br>- **2,322 edges on 26 screens at 390 and 320 px: 0 px deviation.**<br>- All 80 section headings: 18 px / 600, 8 px to their content. | – |
| 1 | **Today: headings, date** | Done in step 11 | Re-verified: headings and the calendar glyph + "Thursday · 879 kcal left" sit on the margin line, centred on each other | [today](03-screens/qa/compare/07-today.png) |
| 2 | **Meals rows** | Done in step 11 | Re-verified: passive meal icon (no states, `aria-hidden`), one Add button ("Add dinner", 44, all states, focus gap) and a photo once logged, with no shift | [meals](03-screens/qa/compare/07-today-meals.png) |
| 3 | **Today dish card** | Chips and a badge were done. "View recipe" was a `span` styled as a button (`aria-hidden`, not focusable) | A **real secondary button**:<br>- text 12.8:1, 44 tall, with default / pressed / focus / disabled states;<br>- named **"View recipe: Baked cod, potatoes & broccoli"**;<br>- **Enter, Space and click** all open the dish detail (tested). | [card](03-screens/qa/compare-step12/07-today-card.png) |
| 4 | **Recipe cards** | P, F, C chips sat in the 136 px text column and **wrapped to two rows at 320 px** | **Compact chips** (`--size-macro-chip` 24, no wrapping inside a chip) in a **full-width row** under the image and text:<br>- **One row at 390 and 320 px**, also with "110 g" in every chip (tested).<br>- At 150% / 200% text they may wrap, but are never clipped or outside the card (tested).<br><br>**Gaps:** letter → value `--space-inline-icon` (4, the clock → time gap); between chips `--space-chip-gap` (8). | [recipes](03-screens/qa/compare-step12/13-recipes.png) |
| 5a | **Dish name** | Done in step 11 | Re-verified: edit button, inline field, count, errors | – |
| 5b | **Ingredients** | Coloured P/F/C chips in every row, 12 px row padding | **Compact text rows:**<br>- the name on the left;<br>- **amount + unit right-aligned on one edge**;<br>- "158 kcal **P** 34 g **F** 1 g **C** 0 g", where the letter (in the macro text colour) carries the meaning and is separated by the same 4 px gap;<br>- 8 px row padding.<br><br>Edit mode keeps the roomier fields. | [method](03-screens/qa/compare-step12/14-recipe-detail-method.png) |
| 5c | **Ingredient editing** | Done in step 11 | Re-verified: name, amount, unit, delete + Undo, add; ring, macros and Log button recalculate live | – |
| 5d | **Method** | No recipe steps | **The Method section after Ingredients:**<br>- "Total 30 min · Serves 2" in the card style;<br>- **numbered steps in an `ol`**: 16 px text, line height 1.5, ≤ 80 characters a line, not justified.<br><br>**Every recipe has a `steps` array:** cod 6, shrimp 5, curry 4, lentil soup 4. The cooking is food-safe (fish to 63 °C).<br><br>**Editing steps:**<br>- add a step, or edit its text;<br>- **Move up / Move down** buttons (no dragging, WCAG 2.5.7), which keep focus and announce the new position;<br>- Delete with Undo;<br>- an empty step blocks Save with a hint.<br><br>**No steps:** "No steps yet" with "Add steps". | [method](03-screens/qa/compare-step12/14-recipe-detail-method.png) · [edit](03-screens/qa/compare-step12/14-recipe-detail-steps-edit.png) · [undo](03-screens/qa/compare-step12/14-recipe-detail-step-deleted.png) · [error](03-screens/exports/14-recipe-detail-step-error.png) · [empty](03-screens/exports/14-recipe-detail-no-steps.png) |
| 5e–f | **States, a11y** | Ingredients and name only | **The same protections now cover steps:**<br>- view / edit / error / saving, Save and Cancel, "Discard changes?";<br>- Undo for ingredients **and** steps;<br>- visible labels on every field, `role="status"` announcements;<br>- focus kept on delete and move;<br>- buttons named like "Move step 2 up". | – |
| 5g | **Design system** | 23 components | **24 components:**<br>- 24 Recipe steps (view, edit, focus, pressed, disabled move, error, empty);<br>- compact ingredient row (`.macro-line`);<br>- a growing `textarea` in fields;<br>- View recipe states;<br>- the compact chip row;<br>- tokens `size-macro-chip`, `size-step-number`, `size-measure`;<br>- arrow-up and arrow-down icons. | [docs](02-design-system/index.html) |
| 6 | **Cod photo** | Replaced in step 11 | Unchanged: one file, `recipe-baked-cod.jpg`, by Gadini, [Pixabay](https://pixabay.com/photos/codfish-cod-to-the-lagareiro-food-815458/), Pixabay Content License. The prompt still says "potatoes & peas": no free photo shows cod, potatoes **and** peas (about 300 searched in step 11), so with your approval the recipe uses broccoli. To switch back to peas, drop a photo into `01-branding/assets/recipe-baked-cod.jpg` and change one line of the dish data (`COD`) in `tools/build_screens.py`. | – |

### Check results (final files)

| Check | Result |
|---|---|
| `npm run check` (design system + alignment) | **61 / 61** + alignment **0 deviations** (2,322 edges, 26 screens, 390 and 320 px) |
| `npm run check:a11y` | **Tier 1: 0 fail / 40 pass · Tier 2: 0 fail / 9 pass** · 3 Tier 3 notes · axe 0 violations (58 rules) · pa11y 0 · 215 focus stops visible · 243 targets ≥ 44 |
| `npm run check:screens` | **322 / 322**; all text ≥ 7:1 (AAA). Covers:<br>- **P, F, C in one row** at 390 and 320 px (also with 110 g values);<br>- chips at 150% / 200% text;<br>- **View recipe** with Enter, Space and click;<br>- the Method `ol` and its text style;<br>- moving steps with the keyboard (focus and announcement);<br>- disabled move buttons at the ends;<br>- deleting a step and undoing it;<br>- an empty step error;<br>- **16 steps including a very long one** (saved, wrapped, nothing clipped at 390 and 320 px);<br>- the no-steps empty state;<br>- 320 px, 200% text and long names on every screen. |
| Contrast · tokens · lint | 67 / 67 · tokens.json ↔ tokens.css in sync (283) · stylelint 0 · html-validate 0 |

**What I looked at:** the Recipes cards, which have one chip row at 390 and 320 px. Also the Today card with View recipe, the compact ingredients, and Method in its view, edit, error, deleted and empty states. Finally the board, with its new "2C" row.

**Fixed while verifying:**
- The step field was cut at 3 lines and now grows with its text.
- `size-measure` was written as `80ch`, which isn't a valid token dimension; it's now `40rem` (≈ 75 characters).
- The accessibility audit didn't map `textarea` focus to its field box.
- A chip test counted screen-reader-only labels as "clipped".

### Open issues (step 12)

- **Cod with peas:** no free photo exists; the recipe follows the photo (broccoli). See row 6.
- **No pressed state on Method rows:** in view mode, steps and ingredient rows have no controls, so they have no pressed state by design. Their actions live on the section's Edit buttons (44 px).
- **Prototype only:** steps, like ingredients, are kept in the page only.
- Still open from step 11: native `datalist` styling, single-line fields scroll long values, forced colours checked only in emulation, onboarding / Diary / Profile not built.

---

## Update: grid, meals, recipes, dish editing (step 11)

### Changelog (before → after)

Before/after images for every changed screen are in [03-screens/qa/compare/](03-screens/qa/compare/). The "before" exports are kept in [03-screens/qa/before/](03-screens/qa/before/).

| # | Area | Before | After | Compare |
|---|---|---|---|---|
| 0 | **Global grid** | Content inside lists ended at 362 px, inside cards at 354 px. App-bar glyphs sat at 18 / 372 px instead of on the 20 px margin. The nutrition row had an extra 8 px inset, and text buttons were inset 12 px by their padding | **Two grid lines from tokens on both sides:**<br>- `--space-screen-margin` (20).<br>- `--space-card-inset` (16) for content inside cards, lists, banners and rows.<br><br>**Glyphs, not 44 pt hit boxes, sit on the lines** (`--size-icon-inset`). Text buttons align by their label. Section headings share one size and one gap to their content. New automated check `npm run check:align`: **1,212 edges, 0 px deviation** at 390 and 320 px | [Today](03-screens/qa/compare/07-today.png) |
| 1 | **Today** | Calendar icon floated in the app bar. "Thursday · 879 kcal left" sat right-aligned next to the Meals heading | A **date button** under the title: the calendar glyph on the margin line, "Thursday · 879 kcal left" vertically centred next to it. All section headings start on the margin line. The Meals heading shows "1,171 kcal eaten" right-aligned on the right margin | [07-today](03-screens/qa/compare/07-today.png) |
| 2 | **Meals rows** | An empty meal had **two** pluses: a "+" tile where the photo goes and a "+" button | **One meal row component:**<br>- **Empty meal:** a **passive meal-type icon** (sun, apple, moon, cup) in the photo slot. It is muted but legible (8.5:1), `aria-hidden`, not a button: no states and no hit area.<br>- **Add button:** **exactly one**, on the right ("Add lunch"), 44 × 44, with default / pressed / focus / disabled states and a focus ring with a gap.<br>- **Logged meal:** the dish photo in the same 48 slot, so rows never shift. | [before lunch](03-screens/qa/compare/07-today-before-lunch.png) · [meals](03-screens/qa/compare/07-today-meals.png) |
| 3 | **Dish card on Today** | "P 42 · F 7 · C 53" as dotted text. The "Fits your dinner" pill was an interactive chip with an invisible 44 hit extension | **Macro chips** (`.macro-tile--chip`): the same macro-tile component and tokens as the dish detail, letter + value, no dots. The pill is a `.badge--fresh` with its leaf icon: same height and padding as every badge, icon and text centred, inside the card | [meals](03-screens/qa/compare/07-today-meals.png) |
| 4 | **Recipe cards** | Macros as dotted text, and the reason was squeezed into the fit line | **Text and chips:**<br>- Title, meta, chips, fit line and kcal start at one x in every card (checked).<br>- Same macro chips as on the detail screen.<br>- The reason ("Covers your protein") moved next to the time.<br><br>**Gap tokens:**<br>- The clock → time gap (4) is now the token `--space-inline-icon`. Chips use it between the letter and the value.<br>- `--space-chip-gap` (8) sits between chips. | [13-recipes](03-screens/qa/compare/13-recipes.png) |
| 5 | **Dish detail: editing** | Read-only ingredient table and a fixed title | **Editing ingredients:**<br>- **Edit** turns each ingredient into labelled fields: food (with suggestions), amount, unit (g / ml / portion), delete. "+ Add ingredient" adds a row.<br>- **kcal, the calorie ring, per-100 g, macro bars, allergens and the Log button recalculate as you type** (no reload), announced via `role="status"`.<br>- **Delete** keeps focus in the list and shows an **Undo toast**.<br>- **Save / Cancel**, with a **Saving…** state.<br>- **"Discard changes?"** appears when leaving with unsaved edits.<br><br>**Editing the name:** a pencil next to the title opens an inline field with a visible label, a live 0–60 count and clear errors ("Enter a name, for example …", "Use 60 characters or fewer. It's 73 now.").<br><br>**New design-system components:**<br>- 21 date button;<br>- 22 title row + name edit;<br>- 23 ingredient rows;<br>- `select` in fields, `.field__count`, edit / trash / meal icons. | [14-recipe-detail](03-screens/qa/compare/14-recipe-detail.png) · states: [edit](03-screens/exports/14-recipe-detail-edit.png), [edited](03-screens/exports/14-recipe-detail-edited.png), [deleted](03-screens/exports/14-recipe-detail-deleted.png), [discard](03-screens/exports/14-recipe-detail-discard.png), [saving](03-screens/exports/14-recipe-detail-saving.png), [name error](03-screens/exports/14-recipe-detail-name-error.png) |
| 6 | **Cod photo** | Fish on greens: not the recipe | **One file, `01-branding/assets/recipe-baked-cod.jpg`,** used by every screen: Today card, Meals thumbnail, Recipes, detail, log sheet and the board. It shows baked cod with roasted potatoes and broccoli, so the recipe became **"Baked cod, potatoes & broccoli"** (cod 150 g, potatoes 200 g, broccoli 100 g, olive oil 10 g, garlic 5 g = **462 kcal**, USDA). The old file was deleted. `object-fit: cover` everywhere, with alt text describing the dish | [log sheet](03-screens/qa/compare/14-recipe-detail-log.png) · [dinner added](03-screens/qa/compare/07-today-dinner-added.png) · [board](03-screens/qa/compare/flows.png) |

**New photo:**
- **Photo:** "Codfish, Cod to the lagareiro" by **Gadini**.
- **Source:** [pixabay.com/photos/815458](https://pixabay.com/photos/codfish-cod-to-the-lagareiro-food-815458/).
- **Licence:** [Pixabay Content License](https://pixabay.com/service/license-summary/): free for commercial and non-commercial use, no attribution required. It is credited anyway in [CREDITS.md](01-branding/assets/CREDITS.md).
- **File:** downloaded at 1280 × 853, 291 KB.
- **Why broccoli, not peas:** no free photo showed cod, potatoes *and* peas together. About 300 photos were searched on Unsplash, Pexels and Pixabay. With your approval, the recipe now matches the photo instead.

### Check results (all run on the final files)

| Check | Command | Result |
|---|---|---|
| Design system: paths, tokens (W3C, references, drift), stylelint, html-validate, contrast, file:// = http://, clipping, overflow, touch targets, geometry at 100% / 200%, axe, standalone, PNG | `npm run check` | **61 / 61** |
| Grid alignment (new) | `npm run check:align` (part of `npm run check`) | **1,212 edges on 20 screens × 2 widths (390, 320): 0 px deviation**; section headings: one size, one gap |
| WCAG 2.2 AA + AAA for critical elements (docs page) | `npm run check:a11y` | **Tier 1: 0 fail / 40 pass · Tier 2: 0 fail / 9 pass** · 3 Tier 3 notes. axe 0 violations (58 rules), pa11y 0 errors, 204 focus stops all visible, 229 targets ≥ 44, reflow 320, 200% text, reduced motion, forced colours, more contrast all OK |
| Screens: html-validate, design-system-only rule, links, axe AA + AAA contrast, 390 × 844 frame, clipping, targets, keyboard, data sums, exports; **320 px, 200% text, long names, editor behaviour** (new) | `npm run check:screens` | **241 / 241**; all text ≥ 7:1 (AAA) |
| Contrast pairs (incl. macro chips ≥ 8.5:1) | `python3 tools/contrast.py` | **67 / 67** (34 critical at 7:1) |
| Tokens JSON ↔ CSS parity | `python3 tools/build_tokens.py --check` | in sync (280 declarations) |
| Lint | `npm run lint:css` · `npm run lint:html` | 0 errors |

**Editor behaviour, tested in a real browser (part of `check:screens`):**
- **Keyboard:** Enter on "Edit" focuses the first field.
- **Recalculation:**
  - potatoes 200 → 150 g: 462 → **419** kcal, announced;
  - olive oil 10 g → 10 ml uses the density: **80** kcal.
- **Delete and Undo:**
  - deleting keeps focus in the list and shows Undo;
  - Undo restores the row and focuses it.
- **Validation:**
  - an unknown food gets `aria-invalid` and a hint;
  - an empty name shows an error with an example;
  - a 73-character name shows the limit and the current length.
- **Leaving:** Back with changes opens "Discard changes?" with "Keep editing" focused; Esc keeps the edits.
- **Saving:** shows "Saving…" (disabled, `aria-busy`), then the view with the new total.

**What I looked at:** I reviewed every changed export by eye:
- **Today:** the date button on the margin, the meal rows (one "+", a passive moon icon).
- **Recipes:** the chips and aligned text.
- **Detail:** view, edit, edited, deleted, discard, saving, name error.
- **Elsewhere:** the log sheet, dinner added, and the board.

**Regressions checked:** even borders, the focus gap, the tab bar and bottom sheet inside their bounds, no clipping. They're covered by the 61 design-system checks and the 241 screen checks, which all pass.

**Fixed along the way:**
- **Design system:**
  - The 26 px input inside a 52 px field was the real tap target; inputs and selects are now 44 px.
  - Screen bodies could grow wider than the screen at 200% text.
  - Facts tables didn't wrap.
  - The Add button's focus ring could leave its wrapper.
- **Audit tool:** `check:a11y` hung forever once the infinite skeleton shimmer existed. It now waits only for finite animations.
- **Checkers corrected:**
  - The design-system checker no longer measures `<option>` elements or single-line inputs that scroll their value.
  - The audit now maps `select` focus to its field box.

### Open issues

- **Single-line fields scroll long values.** Ingredient and dish-name fields scroll their value by platform convention. Everywhere names are *displayed* (title, rows, cards, meta), long names wrap and are tested at 390 and 320 px.
- **The suggestion list is native.** It's a browser `datalist`, which isn't styled by the design system; Chrome shows its own ▼ on focus.
- **Edits are not persisted.** This is a prototype: "Saved as your version" is simulated in the page, so reloading resets it.
- **Unit conversions are approximate.** ml uses per-food densities (oils 0.91 g/ml; most foods ≈ 1 g/ml), and "portion" uses a standard portion per food.
- **The accessibility audit covers the docs page only.** `check:a11y` audits the design-system docs page. Screens are covered by `check:screens` (axe AA, AAA contrast, targets, keyboard, 320 / 200%), but pa11y and forced-colours emulation don't run per screen.
- **The pressed toast action stays a Tier 3 note.** It's 4.79:1: AA, not critical, unchanged from step 08.
- **The old dish is still in the branding exploration.** `01-branding/directions.*` still mentions "baked cod, potatoes and peas, 443 kcal". That's the step 04 direction board, kept as a historical record.
- **Some screens aren't built yet.** Onboarding (01–06), Diary (15) and Profile (16) are specified in FLOWS.md but not built.
