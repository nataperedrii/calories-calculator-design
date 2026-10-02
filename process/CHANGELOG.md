# Change reports, step by step

These are the reports written after each round of changes (steps 11–18). They used to be the top of the root README. Each one has a changelog (before → after), the check results and what stayed open. The prompts themselves, verbatim, are in [PROMPTS.md](PROMPTS.md).

## Update: onboarding, Diary and Profile (step 18)

All 16 screens are now built: 46 HTML / PNG files, with flow 0 (onboarding) and flow 3 (preferences, Diary) end to end on the [flows board](../03-screens/flows.html).

| # | What | Details |
|---|---|---|
| 1 | **Design system v1.11** | **New components:**<br>- **25 Step indicator:** text "Step 2 of 5" + an `aria-hidden` bar.<br>- **26 Option card:** native radio or checkbox; selected mark with a check; inset focus ring; group error.<br>- **27 Week strip:** 7 day buttons ≥ 44, mini rings, "Today" and "+45" as text, reflow at large text.<br><br>**Also:** token `size.day-ring`, icon `copy`, settings rows `.product--nav`, and facts values that never break mid-number |
| 2 | **Onboarding 01–06 + first day** | **Sign-in:** passkey or email link (no password).<br><br>**Steps:**<br>- Goal (Maintain preselected).<br>- About you, with the reason we ask and a height error state.<br>- Diet (Pescatarian).<br>- Allergies (14 allergens, Peanuts) and foods to skip.<br>- Daily target: 2,050 kcal, P 100 · F 70 · C 255 g, the Mifflin-St Jeor maths, and Adjust in 50 kcal steps with a floor of 1,550 where the macros still add up.<br><br>**07 first day:** 0 of 2,050 and "Snap your first meal" |
| 3 | **Diary 15** | **This week:** Mon 1,703 · Tue 2,095 (**45 over**, calm Turmeric + "+45") · Wed 1,661 · Thu 1,171 (today) · Fri–Sun upcoming. Every total is a sum of logged USDA meals, asserted in the generator.<br><br>**Past days:** "Copy to today" on each meal |
| 4 | **Profile 16 + flow 3** | **Your plan:** target, goal, body, diet, allergies, foods to skip; units; account; a Delete account confirm sheet.<br><br>**Flow 3:** add Shellfish → Save → the Recipes list hides the shrimp stir-fry ("2 recipes hidden") |

**Checks:**

| Check | Result |
|---|---|
| `npm run check` | 61 / 61, alignment **0 deviations** (3,636 edges, 46 screens, 390 and 320 px) |
| `npm run check:screens` | **603 / 603**, including new onboarding, Diary, Profile and Flow 3 tests at 390 / 320, keyboard and 200 % text |
| `npm run check:a11y` | Tier 1 0 / 39, Tier 2 0 / 9 |
| Tokens, stylelint, html-validate | 0 errors |
| Contrast | 67 / 67 |
| Regression | Every previously committed screen unchanged, apart from the plan audit's known changes |

**Fixed while verifying:**
- **Option-card focus:** it was lost in an error group, and the ring was drawn outside its group. It's now an inset outline.
- **Week strip:** it clipped at 200 % text (it now reflows) and bled past a narrow docs stage (the bleed is now capped).
- **Target screen:** the input clipped "2,050"; the "% of kcal" values went stale at the floor; table numbers broke mid-number.
- **Chevron rule:** at first it also shifted a docs row; it's now scoped to `.product--nav`.
- **Board:** Flow 0 was too wide for the 2,400 px board; it's now two rows.

---

## Update: plan audit (step 17)

The `03-screens/FLOWS.md` plan (`~/.claude/plans/valiant-wandering-sparrow.md`) was audited against the project. The full checklist, before and after, with evidence is in [PLAN-AUDIT.md](../PLAN-AUDIT.md).

**53 items:**

| | Done | Partial | Missing | Superseded | Unclear |
|---|---|---|---|---|---|
| Before | 43 | 3 | 1 | 5 | 1 |
| After | **47** | **0** | **0** | 5 | 1 |

### Changelog (before → after)

| # | Where | Before | After | Compare |
|---|---|---|---|---|
| 1 | **Dish detail: Servings** (plan item S14b, Missing) | No servings stepper. It was in FLOWS at step 09 and dropped in step 11 without a request | DS stepper, 1–8 portions. It scales the ingredient amounts, row kcal and chips; the summary and "Log 1 portion" stay per portion. Keyboard, `role=status`, hidden in edit mode. New export `14-recipe-detail-servings` | [390](../03-screens/qa/compare-audit/14-recipe-detail-ingredients@390.png) · [320](../03-screens/qa/compare-audit/14-recipe-detail-ingredients@320.png) |
| 2 | **Food detail: unit** (S11, Partial) | Grams only | DS segmented "g \| portion": 30 g ↔ 1 portion (1 handful). ml is for liquids only | [390](../03-screens/qa/compare-audit/11-food-detail@390.png) |
| 3 | **Recipes: filters** (S13, Partial) | No "High protein" chip | "High protein" chip, unselected | [390](../03-screens/qa/compare-audit/13-recipes@390.png) · [320](../03-screens/qa/compare-audit/13-recipes@320.png) |
| 4 | **FLOWS.md accessibility** (F6, Partial) | Global rules only | Plus a per-flow table (flows 0–3) | – |

**Also fixed:** two existing overflows found by the new 320 px + 200 % text test.
- **DS stepper:** it now stays inside its row; ± buttons stay 44 × 44.
- **Ingredients header:** "Amount" now wraps instead of running off-screen.

**FLOWS.md reconciled with the build:** 7 statements corrected, plus a "Spec vs build" table.

**Checks:**

| Check | Result |
|---|---|
| `npm run check` | 61 / 61, alignment 0 deviations (2,768 edges, 27 screens) |
| `npm run check:screens` | 387 / 387 |
| `npm run check:a11y` | Tier 1 0 / 39, Tier 2 0 / 9 |
| Tokens, stylelint, html-validate | 0 errors |
| Contrast | 67 / 67 |
| Regression | 21 of 26 screen PNGs pixel-identical; the rest changed by the gaps or by sub-pixel scroll and the shimmer |

**Open questions** (PLAN-AUDIT.md):
1. The plan's ±2 % Atwater rule vs real USDA kcal.
2. Build onboarding, Diary and Profile?
3. Build the GitHub Pages landing page, `LINKS.md` and the clickable prototype?
4. Recipes filter row: 3 rows at 390.

---

## Update: product photos on Add to Snack (step 16)

Before / after images: [03-screens/qa/compare-step16/](../03-screens/qa/compare-step16/), made with `node 03-screens/tools/compare-step16.mjs <step-15 copy>`. The "before" exports are in [qa/before-step16/](../03-screens/qa/before-step16/).

### Changelog (before → after)

| Where | Before | After | Compare |
|---|---|---|---|
| **Add to Snack: rows** | Only the name on the left, chips under it, no photo | **Photo:** a product photo on the left, the name to its right, top-aligned with the photo. The photo is the same `.product__thumb` component as the Meals rows on Today: 48 × 48, radius 10, cover.<br><br>**Chips:** the P / F / C chips sit under the photo, from the left margin, 8 px (`space-2`) below the photo in every row.<br><br>**Unchanged:** kcal "per 100 g" and "+" on the right margin, centred on the row; order, copy, values and insets. | [390](../03-screens/qa/compare-step16/10-add-food@390.png) · [320](../03-screens/qa/compare-step16/10-add-food@320.png) · [Meals reference](../03-screens/qa/compare-step16/07-today-meals@390.png) |

### Product → photo

Each photo was checked by eye against its name. Details are in [01-branding/assets/CREDITS.md](../01-branding/assets/CREDITS.md).

| Product | File | What it shows | Author / source / license |
|---|---|---|---|
| Almonds | `food-almonds.jpg` (already in the repo) | Whole natural almonds, matte skins, in a white bowl | Mockupo · [Unsplash 8LvXmMZuAU0](https://unsplash.com/photos/brown-almond-nuts-on-white-ceramic-bowl-8LvXmMZuAU0) · Unsplash License |
| Roasted almonds | `food-roasted-almonds.jpg` (new, 240 × 240, 33 KB) | Roasted almonds: darker, glossy skins with salt flecks | PublicDomainPictures · [Pixabay 83766](https://pixabay.com/photos/almond-almonds-roasted-roast-nut-83766/) · Pixabay Content License |
| Almond butter | `food-almond-butter.jpg` (new, 240 × 240, 23 KB) | A jar of almond butter with a wooden spoon, whole almonds and crackers | cole yap · [Pexels 33657317](https://www.pexels.com/photo/delicious-almond-butter-with-crackers-on-plate-33657317/) · Pexels License |
| Apple | `food-apple.jpg` (already in the repo, also the Snack meal photo) | One red apple on wood | Frank Albrecht · [Unsplash 5uxgJmZGiVk](https://unsplash.com/photos/red-apple-on-brown-surface-5uxgJmZGiVk) · Unsplash License |
| Greek yogurt | `food-greek-yogurt.jpg` (new, 240 × 240, 19 KB; replaces the granola photo, which didn't match) | A bowl of thick plain yogurt with a mint sprig | Micheile Henderson · [Unsplash NFHeBysjCTI](https://unsplash.com/photos/a-bowl-of-yogurt-with-a-spoon-in-it-NFHeBysjCTI) · Unsplash License |

**Rejected:**
- **Pixabay 3027764:** round, salt-crusted nuts that look like hazelnuts.
- **"Roasted almonds" fair sweets (gebrannte Mandeln):** sugar-coated, so not dry-roasted.
- **A "Greek style" yogurt photo:** a branded cup (Alpro), blueberry-flavoured, with an Apple computer behind it.
- **A plain yogurt bowl on Pexels:** too thin, reads as milk.

**File handling:**
- **New files:** downloaded at 640 px, cropped to a square centred on the product, saved at 240 px.
- **Almonds and Apple:** keep their existing larger files, which other screens also use. `object-fit: cover` crops them, so they're never stretched. `alt=""`: the name next to the photo already names the product.

### Checks

| Check | Result |
|---|---|
| **Photo size vs Meals** (bounding boxes) | Meals thumbnail on Today: **48 × 48, radius 10 px, cover**. All 5 photos at 390 and 320: **48 × 48, radius 10 px, cover**, identical |
| **Alignment** (`check:screens`, 390 and 320) | Photos and chips at x = 36, the card-inset line. Every name at x = 96, top-aligned with its photo (offset 0). Photo → chips gap 8 in all 5 rows. "+" 44 × 44, named, 0 px from the right edge, centred on the row with kcal |
| `npm run check` (incl. alignment) | **61 / 61**, alignment **0 deviations** (2,598 edges). Rule changed: search-row chips start under the photo. One earlier run failed the docs page's file:// vs http:// pixel comparison (226,516 px). I hadn't edited the docs page then; it passed on the next two runs and on the final run, so it was a loading-timing flake |
| `npm run check:a11y` | **Tier 1: 0 / 39 · Tier 2: 0 / 9** |
| `npm run check:screens` | **362 / 362**: Meals-size photos; each product has its own matching file; cover and alt; insets; gap; "+"; long name + 110 g at 320 and 200%; names never clipped |
| Lint, tokens | stylelint 0 · html-validate 0 · contrast 67 / 67 · tokens in sync (no token changes) |
| **Regression** (28 PNGs) | **23 identical.** Changed: Add food, the docs page (search rows) and the board.<br><br>Analyzing (shimmer frame) and the dish calculator (317 px) differ between any two exports of the same files. The latest dish-calculator export matches "before" exactly |

### Open

- **At 320 px the P / F / C chips wrap** to two rows (they need 183–200 px; the photo + name columns give 137). The kcal + "+" column takes the rest of the width. At 390 they're one row (200 of 207). With 3-digit values (110 g, 225 px) they also wrap at 390. Nothing is clipped.
- **At 320 longer names wrap** at word boundaries ("Roasted / almonds", "Almond / butter"). The row then grows, but the photo → chips gap stays 8 because the name fits within the photo's 48 px height.

---

## Update: targeted tweaks (step 15)

Before / after images: [03-screens/qa/compare-step15/](../03-screens/qa/compare-step15/), made with `node 03-screens/tools/compare-step15.mjs <step-14 copy>`. The "before" exports are in [qa/before-step15/](../03-screens/qa/before-step15/).

### Changelog (before → after)

| # | Where | Before | After | Compare |
|---|---|---|---|---|
| 1 | **Add to Snack: rows** | Photo · green ✓ circle · name; kcal + "+" centred on the name line | **Only the name** on the left, on the card-inset line (x = 36 at 390 and 320), top-aligned and wrapping. The P / F / C chips sit right under it.<br><br>kcal "per 100 g" + **"+"** (44 × 44, "Add &lt;food&gt;", 4 states, ring with a gap) sit on the right margin, **centred on the whole row**.<br><br>The ✓ is gone from every screen and component (see "Where the ✓ was" below). | [390](../03-screens/qa/compare-step15/10-add-food@390.png) · [320](../03-screens/qa/compare-step15/10-add-food@320.png) |
| 2 | **Recipes: cards** | 80 × 80 square photo | **Full-height photo:** 80 wide (token unchanged), from the top padding to the bottom padding (16 from each edge, never touching them). Its own radius on all 4 corners; the card doesn't clip. Cover crop, centred. It grows with the card: 239 / 205 / 205 px tall at 390.<br><br>"Best fit" stays where it was (above the title). Everything else is unchanged: order, 8 px gaps, copy, chips. | [390](../03-screens/qa/compare-step15/13-recipes@390.png) · [320](../03-screens/qa/compare-step15/13-recipes@320.png) |
| 3 | **Dish detail: Ingredients** | Name \| amount, then "158 kcal" + chips on one line | **Two lines per ingredient:** name \| amount, then **P / F / C chips** \| **"158 kcal"**.<br><br>Amount and kcal end on one right edge (x = 354 at 390), in tabular mono. Names and chips start on one x. 8 px between the two lines in every ingredient.<br><br>Unchanged: edit mode, delete, Undo, add, recalculation. | [390](../03-screens/qa/compare-step15/14-recipe-detail-ingredients@390.png) · [320](../03-screens/qa/compare-step15/14-recipe-detail-ingredients@320.png) · [edit](../03-screens/qa/compare-step15/14-recipe-detail-edit-ingredients@390.png) |

### Where the ✓ was, and what I did

| Where | What it did | Action |
|---|---|---|
| Add to Snack: 5 rows (`.product__check`) | Informational "Verified: USDA" | **Removed**, with its CSS |
| Docs, product rows (5) + search rows (4) (`.product__verified`, `.product__check`) | Informational | **Removed**, with its CSS and the audit's contrast entry for that icon |
| Toasts "Added to Lunch / Dinner", "Garlic deleted" | Success status, next to the message | **Kept**: functional (status) |
| Photo result "High confidence" | One of 3 confidence levels, each with its own glyph + word | **Kept**: functional. Removing it would leave High as the only level without a glyph |
| Scan "Plate found. Hold still", Analyzing "Finding foods… done" | Live status | **Kept**: functional |

The "✓ USDA" text badge (Food detail, Ingredients) isn't the circle and wasn't touched. Tell me if the functional uses should go too.

### Measurements

**Recipe cards** (from `check:screens`):

| Card | Image at 390 | Image at 320 | Top / bottom / left inset | P/F/C at 390 | P/F/C at 320 |
|---|---|---|---|---|---|
| Baked cod | 80 × 239 | 80 × 298 | 16 / 16 / 16 | 1 row (200 of 226) | 2 rows (200 of 156) |
| Shrimp stir-fry | 80 × 205 | 80 × 237 | 16 / 16 / 16 | 1 row | 2 rows |
| Chickpea curry | 80 × 205 | 80 × 264 | 16 / 16 / 16 | 1 row | 2 rows |

**Chip rows at 320** (needed width / available width):

| Where | Needed | Available |
|---|---|---|
| Add to Snack | 183–200 | 137 |
| Ingredients (beside "158 kcal") | 174–183 | 156–173 |

### Checks

| Check | Result |
|---|---|
| `npm run check` (incl. alignment) | **61 / 61**, alignment **0 deviations** (2,598 edges). New rule: ingredient chips start under the name |
| `npm run check:a11y` | **Tier 1: 0 / 39 · Tier 2: 0 / 9**. Tier 1 has 1 entry fewer: the contrast of the removed ✓ icon |
| `npm run check:screens` | **356 / 356**. New:<br>- **Snack:** name and chips on the inset line; "+" 44 × 44, named, centred with kcal on the row; no clipping.<br>- **✓ gone:** no ✓ markup on any of the 26 screens and none in `components.css`. Every remaining `high` glyph is in a toast, confidence label, scan hint or status step.<br>- **Recipe cards:** image inset 16 / 16 / 16, same width, 4 radii, the card doesn't clip, alt present (empty: decorative next to the dish name).<br>- **Ingredients:** two lines, one left x and one right x, 8 px gap, tabular numbers. With 110 g chips, 1234 kcal and a long name: nothing clipped and the right edge holds.<br>- **Keyboard:** "+" (Tab, Enter, ring); editor Edit / Delete / Undo / Discard / Save tests. |
| Lint, tokens | stylelint 0 · html-validate 0 · contrast 67 / 67 · tokens.json ↔ tokens.css in sync (283, no token changes) |
| **Regression** (28 PNGs) | **21 identical.**<br><br>**Changed by the fixes:** Add food, Recipes, the no-steps state (it shows ingredient rows), the docs page and the board.<br><br>**Method state:** 5 px of anti-aliasing in the Method text below the taller Ingredients card.<br><br>**Not real changes:** Analyzing (shimmer frame). The edited state also gave 102 px in one run; two exports of the same files differ by those same 102 px. |

### Open

- **P / F / C wrap at 320 px:** on Snack, Recipes and Ingredients (see "Chip rows at 320" above). Nothing is clipped. At 390 all three are one row.
- **Resolved as a side effect:** Snack names no longer break mid-word at 320 (step 14's open issue). With the photo and ✓ gone, the name column is 137 px.
- **Recipes:** card 1's title is still 34 px lower than the others because of the "Best fit" badge.
- **Fix 2 asked for "the badge over the image, as now":** the badge has never been over the image. It sits above the title, so it stays there.
- **Fix 3 "same gap between the two rows and between ingredients":** I read this as one token, `space-2` (8 px). It's the gap between the two lines, and the padding on each side of the hairline between ingredients (8 + 1 + 8).

---

## Update: targeted tweaks (step 14)

Before / after images: [03-screens/qa/compare-step14/](../03-screens/qa/compare-step14/), made with `node 03-screens/tools/compare-step14.mjs <step-13 folder>`. The step 13 state was rebuilt in a scratch folder and checked against the saved "before" exports ([qa/before-step14/](../03-screens/qa/before-step14/)): 5 of 6 screens are pixel-identical, and the 6th differs by 29 px.

### Changelog (before → after)

| # | Where | Before | After | Compare |
|---|---|---|---|---|
| 1 | **Today: "Fits your dinner" photo** | Only "View recipe" opened the dish | **The whole photo opens 14 (Baked cod)** on tap or click, with a pointer cursor and a pressed overlay.<br><br>**Choice:** the photo is a pointer-only area (`aria-hidden`, no tab stop). "View recipe" is already a real, named button, so a second link would only add a duplicate stop and a duplicate announcement. | [390](../03-screens/qa/compare-step14/07-today-card@390.png) (no visual change at rest) |
| 2 | **Add to Snack: rows** | ✓ as a 44 button on the far right after "+"; names in an 82 px column | **Layout:** photo · **green ✓ in a fixed 24 px column** · name (top-aligned, wraps, never clipped). The ✓ is centred on the name's first line. Every ✓ and every name starts at one x. P / F / C chips go under the name.<br><br>**Right side:** kcal "per 100 g" and **"+"** (44 × 44, "Add &lt;food&gt;", default / pressed / focus / disabled, ring with a gap) sit on the right margin, centred on each other.<br><br>**The ✓ is an indicator**, not a button ("Verified: USDA"): no hit area, no states, no tab stop.<br><br>**Names shortened (your choice):** "Roasted almonds", "Greek yogurt", "Apple". The name column is now 111 px. | [390](../03-screens/qa/compare-step14/10-add-food@390.png) · [320](../03-screens/qa/compare-step14/10-add-food@320.png) |
| 3 | **Recipes: cards** | Image beside the title block; chips, Fits and kcal in a full-width foot | **Identical in all 3 cards:** an 80 × 80 photo (token `size-recipe-thumb`, cover) and **one left-aligned text column**: title → time → "Covers your protein" → P/F/C → "Fits …" → kcal.<br><br>**Spacing:** every row is 8 apart (`space-2`); padding 16, image → text 12. "Best fit" stays above the title in card 1 (your choice). | [390](../03-screens/qa/compare-step14/13-recipes@390.png) · [320](../03-screens/qa/compare-step14/13-recipes@320.png) |
| 4 | **Dish detail: Ingredients** | "158 kcal P 34 g F 1 g C 0 g" as text | "158 kcal" + **macro chips** "P 34 g" "F 1 g" "C 0 g": the same `.macro-tile--chip` component and tokens, in **one row**. At 320 px the chip group moves under the kcal and stays one row. Nothing else changed: card look, amounts, editing, recalculation. | [390](../03-screens/qa/compare-step14/14-recipe-detail-ingredients@390.png) · [320](../03-screens/qa/compare-step14/14-recipe-detail-ingredients@320.png) |

### Measurements

**Recipe cards.** Gaps between rows, in px; all values are from `check:screens`:

| Card | 390 px | 320 px | Image | Padding / image→text | Title from card top |
|---|---|---|---|---|---|
| Baked cod (badge) | 8 · 8 · 8 · 8 · 8 · 8 | 8 · 8 · 8 · 8 · 8 · 8 | 80 × 80 | 16 / 12 | 50 (badge above) |
| Shrimp stir-fry | 8 · 8 · 8 · 8 · 8 | 8 · 8 · 8 · 8 · 8 | 80 × 80 | 16 / 12 | 16 |
| Chickpea curry | 8 · 8 · 8 · 8 · 8 | 8 · 8 · 8 · 8 · 8 | 80 × 80 | 16 / 12 | 16 |

**P / F / C row width:**

| Where | Width | Text column | Fits on one row? |
|---|---|---|---|
| Recipe cards, 390 | 200 px (225 with 3-digit values) | 226 px | ✓ |
| Recipe cards, 320 | 200 px | 156 px | ✗ (wraps; open) |
| Add to Snack, 390 | 183–200 px | 226 px (name → margin) | ✓ |
| Add to Snack, 320 | 183–200 px | 152 px | ✗ (wraps; open) |
| Ingredients, 390 and 320 | – | – | ✓ (also with 110 g) |

### Checks

| Check | Result |
|---|---|
| `npm run check` (incl. alignment) | **61 / 61**, alignment **0 deviations** (2,498 edges, 26 screens, 390 and 320 px). New rules: search-row names on one x; chips start under the name |
| `npm run check:a11y` | **Tier 1: 0 / 40 · Tier 2: 0 / 9** |
| `npm run check:screens` | **350 / 350**. New for step 14:<br>- **Add to Snack:** ✓ and names on one x; the ✓ on line 1; ✓ passive; "+" 44 × 44 and named; kcal centred with "+"; names never clipped; long name + 110 g at 320 and 200%; Tab skips the ✓; Enter opens the food.<br>- **Recipe cards:** order, gaps table, image / padding / gap, chips at 390 / 320.<br>- **Ingredients:** chips in one row at 390 / 320, also with 110 g.<br>- **Today:** photo click opens 14; pointer, pressed overlay, `aria-hidden`, never focused. "View recipe" Enter / Space / click still open 14. |
| Lint, tokens | stylelint 0 · html-validate 0 (screens, board, docs) · contrast 67 / 67 · tokens.json ↔ tokens.css in sync (283) |
| **Regression** (pixel diff of all 28 PNGs vs before) | **21 identical:** every Today state, Scan, Photo result, Food detail, the dish calculator and all other dish-detail states.<br><br>**Changed by the fixes:** Add food, Recipes, the board, the docs page, and the two Method states. Those Method states scroll past the Ingredients rows, now 1 pt taller with chips; the content below them is identical.<br><br>**Analyzing:** its shimmer is captured at a different frame, which happens on every export. |

### Open (reported, not hidden)

- **The P / F / C row at 320 px wraps** on Recipes cards (needs 200 px, has 156) and on Add to Snack (needs 183–200, has 152). Nothing is clipped. One row at 320 would need an image of 36 px or less in the card, so the brief's "one row at 320" and "image left, everything in one column" can't both hold. At 390 both fit, also with 3-digit values.
- **Add to Snack at 320: names break mid-word** ("Almo / nds"). The photo, the ✓ column and kcal + "+" keep their widths, so the name column is only 41 px. This was already the case before (step 13). A fix would hide the decorative photo below 360 px (+60 px for the name), which goes against "keep photo", so I left it for you to decide.
- **"Vertically centred on the row" (Fix 2):** kcal and "+" are centred on each other on line 1, not on the whole two-line row. Centring them on the whole row would squeeze the chips into the name column, so they would wrap at 390 too.
- **Card 1's title starts 34 px lower** than in cards 2–3, because the "Best fit" badge sits above it (your choice).

---

## Update: targeted tweaks (step 13)

Before / after images: [03-screens/qa/compare-step13/](../03-screens/qa/compare-step13/). They are rendered from the previous commit and the current files with `node 03-screens/tools/compare-step13.mjs`. The "before" exports are in [qa/before-step13/](../03-screens/qa/before-step13/).

### Changelog (before → after)

| # | Where | Before | After | Compare |
|---|---|---|---|---|
| 1 | **Add to Snack: product rows** | Three lines or more: the name with a small green ✓ after it, then "P 21 · F 53 · C 21" as dotted text that wrapped. "598 / per 100 g" and "+" on the right | **Line 1:** the name; "598 / per 100 g" (kept exactly as it was); the "+" add button; and the **✓ as a button** on the right margin:<br>- 44 × 44, named "Verified by USDA. Show the source of …";<br>- default / pressed / focus / disabled, with a focus ring inside the box and a gap around the glyph;<br>- Enter, Space or tap shows the source in a toast.<br><br>**Line 2:** P / F / C **chips**: the same macro-chip component as Recipes and Today, no dots, in one row at 390 px.<br><br>The ✓ became the button and "+" stays next to it, both your choice. | [390](../03-screens/qa/compare-step13/10-add-food@390.png) · [320](../03-screens/qa/compare-step13/10-add-food@320.png) |
| 2 | **Dish detail: Ingredients** | A list card of its own, with the section heading above it | **The Nutrition Facts look:** the list sits in a `.facts` card with the same title style, source line, uppercase header row on the heavy rule, hairline row rules, 14 px names and right-aligned mono values.<br><br>**One definition:** the facts table and `.ingredients--facts` share the same CSS rules. A test compares 27 computed styles; all are equal.<br><br>**Unchanged:** compact rows (letter + value macros), amounts on one right edge, all editing, recalculation, and the order Ingredients → Method. | [view](../03-screens/qa/compare-step13/14-recipe-detail-ingredients@390.png) · [edit](../03-screens/qa/compare-step13/14-recipe-detail-edit-ingredients@390.png) |
| 3 | **Recipes: card order** | Reason → Fits → kcal, with the chips last | Reason ("Covers your protein") → **P / F / C** (one row) → "Fits" → kcal, in all 3 cards. The chips keep the full card width, so they stay on one row at 390 and 320 px, also with 110 g values | [390](../03-screens/qa/compare-step13/13-recipes@390.png) · [320](../03-screens/qa/compare-step13/13-recipes@320.png) |

### Checks

| Check | Result |
|---|---|
| `npm run check` (incl. alignment) | **61 / 61**, alignment **0 deviations** (2,490 edges, 26 screens, 390 and 320 px) |
| `npm run check:a11y` | **Tier 1: 0 / 40 · Tier 2: 0 / 9** (chip and number contrast, targets, focus) |
| `npm run check:screens` | **331 / 331**. Covers:<br>- **Verified ✓:** 44 × 44 with an accessible name, its glyph on the right inset line; Enter and Space show the toast with a visible focus ring.<br>- **Chips:** one row in every Add food row at 390 px; P/F/C in one row on all recipe cards at 390 and 320 px (also 110 g).<br>- **Card order** in all cards at 390 and 320 px.<br>- **Ingredients card** styles equal to the Nutrition Facts card; amounts on one right edge; Ingredients before Method.<br>- 200% text, 320 px and long names on every screen. |
| Lint, tokens | stylelint 0 · html-validate 0 · contrast 67 / 67 · tokens.json ↔ tokens.css in sync (no token changes) |
| **Regression** (pixel diff, before vs after, all 27 PNGs) | **13 screens pixel-identical:** all Today states, Scan, the photo result, Food detail, the dish calculator, the dish view, the log sheet and the name error.<br><br>**Changed by the three fixes:** Add food, Recipes, the dish-detail states that show Ingredients, the board and the docs page.<br><br>**Method states:** identical content, shifted by about 1 px because the Ingredients card above them changed height.<br><br>**Analyzing:** its loading shimmer is captured at a different frame (two exports of the unchanged file also differ by 62,612 px), so this isn't a change. |

### Open issue (Fix 1): rows are not always two lines

On line 1 the name shares the width with "598 / per 100 g" and two 44 px buttons. That leaves the name column about 82 px at 390 px and about 42 px at 320 px:
- **At 390:** 3 of 5 rows are two lines. "Almonds, dry roasted" and "Greek yogurt, 2%" wrap their names, so those rows take 3 lines.
- **At 320:** no row is two lines. The column is narrower than one word, so names break mid-word ("Almo / nds") and rows take 4–7 lines. Nothing is clipped. See [the 320 comparison](../03-screens/qa/compare-step13/10-add-food@320.png).
- **Chips at 320:** they wrap to two rows under the name. You chose "chips under the name", knowing this.

Two-line rows need more room for the name. That means either one 44 px button fewer on line 1 (for example the ✓ back next to the name, or the ✓ as the add action), or kcal moved off line 1. I didn't pick one, because the brief says not to invent a solution. Tell me which and I'll apply it.

---

## Update: chips in one row, View recipe, compact ingredients, Method (step 12)

Before / after images: [03-screens/qa/compare-step12/](../03-screens/qa/compare-step12/). The "before" exports are kept in [03-screens/qa/before-step12/](../03-screens/qa/before-step12/). Step 11 comparisons are in [qa/compare/](../03-screens/qa/compare/).

### Changelog (before → after)

| # | Area | Before (step 11) | After (step 12) | Compare |
|---|---|---|---|---|
| 0 | **Global grid** | Two token grid lines, 0 deviations on 20 screens | **Unchanged rules, more coverage:**<br>- The same rules now also cover the method steps (numbers and text on one x), compact ingredient rows (amount on one right edge) and the card chip row.<br>- **2,322 edges on 26 screens at 390 and 320 px: 0 px deviation.**<br>- All 80 section headings: 18 px / 600, 8 px to their content. | – |
| 1 | **Today: headings, date** | Done in step 11 | Re-verified: headings and the calendar glyph + "Thursday · 879 kcal left" sit on the margin line, centred on each other | [today](../03-screens/qa/compare/07-today.png) |
| 2 | **Meals rows** | Done in step 11 | Re-verified: passive meal icon (no states, `aria-hidden`), one Add button ("Add dinner", 44, all states, focus gap) and a photo once logged, with no shift | [meals](../03-screens/qa/compare/07-today-meals.png) |
| 3 | **Today dish card** | Chips and a badge were done. "View recipe" was a `span` styled as a button (`aria-hidden`, not focusable) | A **real secondary button**:<br>- text 12.8:1, 44 tall, with default / pressed / focus / disabled states;<br>- named **"View recipe: Baked cod, potatoes & broccoli"**;<br>- **Enter, Space and click** all open the dish detail (tested). | [card](../03-screens/qa/compare-step12/07-today-card.png) |
| 4 | **Recipe cards** | P, F, C chips sat in the 136 px text column and **wrapped to two rows at 320 px** | **Compact chips** (`--size-macro-chip` 24, no wrapping inside a chip) in a **full-width row** under the image and text:<br>- **One row at 390 and 320 px**, also with "110 g" in every chip (tested).<br>- At 150% / 200% text they may wrap, but are never clipped or outside the card (tested).<br><br>**Gaps:** letter → value `--space-inline-icon` (4, the clock → time gap); between chips `--space-chip-gap` (8). | [recipes](../03-screens/qa/compare-step12/13-recipes.png) |
| 5a | **Dish name** | Done in step 11 | Re-verified: edit button, inline field, count, errors | – |
| 5b | **Ingredients** | Coloured P/F/C chips in every row, 12 px row padding | **Compact text rows:**<br>- the name on the left;<br>- **amount + unit right-aligned on one edge**;<br>- "158 kcal **P** 34 g **F** 1 g **C** 0 g", where the letter (in the macro text colour) carries the meaning and is separated by the same 4 px gap;<br>- 8 px row padding.<br><br>Edit mode keeps the roomier fields. | [method](../03-screens/qa/compare-step12/14-recipe-detail-method.png) |
| 5c | **Ingredient editing** | Done in step 11 | Re-verified: name, amount, unit, delete + Undo, add; ring, macros and Log button recalculate live | – |
| 5d | **Method** | No recipe steps | **The Method section after Ingredients:**<br>- "Total 30 min · Serves 2" in the card style;<br>- **numbered steps in an `ol`**: 16 px text, line height 1.5, ≤ 80 characters a line, not justified.<br><br>**Every recipe has a `steps` array:** cod 6, shrimp 5, curry 4, lentil soup 4. The cooking is food-safe (fish to 63 °C).<br><br>**Editing steps:**<br>- add a step, or edit its text;<br>- **Move up / Move down** buttons (no dragging, WCAG 2.5.7), which keep focus and announce the new position;<br>- Delete with Undo;<br>- an empty step blocks Save with a hint.<br><br>**No steps:** "No steps yet" with "Add steps". | [method](../03-screens/qa/compare-step12/14-recipe-detail-method.png) · [edit](../03-screens/qa/compare-step12/14-recipe-detail-steps-edit.png) · [undo](../03-screens/qa/compare-step12/14-recipe-detail-step-deleted.png) · [error](../03-screens/exports/14-recipe-detail-step-error.png) · [empty](../03-screens/exports/14-recipe-detail-no-steps.png) |
| 5e–f | **States, a11y** | Ingredients and name only | **The same protections now cover steps:**<br>- view / edit / error / saving, Save and Cancel, "Discard changes?";<br>- Undo for ingredients **and** steps;<br>- visible labels on every field, `role="status"` announcements;<br>- focus kept on delete and move;<br>- buttons named like "Move step 2 up". | – |
| 5g | **Design system** | 23 components | **24 components:**<br>- 24 Recipe steps (view, edit, focus, pressed, disabled move, error, empty);<br>- compact ingredient row (`.macro-line`);<br>- a growing `textarea` in fields;<br>- View recipe states;<br>- the compact chip row;<br>- tokens `size-macro-chip`, `size-step-number`, `size-measure`;<br>- arrow-up and arrow-down icons. | [docs](../02-design-system/index.html) |
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

Before/after images for every changed screen are in [03-screens/qa/compare/](../03-screens/qa/compare/). The "before" exports are kept in [03-screens/qa/before/](../03-screens/qa/before/).

| # | Area | Before | After | Compare |
|---|---|---|---|---|
| 0 | **Global grid** | Content inside lists ended at 362 px, inside cards at 354 px. App-bar glyphs sat at 18 / 372 px instead of on the 20 px margin. The nutrition row had an extra 8 px inset, and text buttons were inset 12 px by their padding | **Two grid lines from tokens on both sides:**<br>- `--space-screen-margin` (20).<br>- `--space-card-inset` (16) for content inside cards, lists, banners and rows.<br><br>**Glyphs, not 44 pt hit boxes, sit on the lines** (`--size-icon-inset`). Text buttons align by their label. Section headings share one size and one gap to their content. New automated check `npm run check:align`: **1,212 edges, 0 px deviation** at 390 and 320 px | [Today](../03-screens/qa/compare/07-today.png) |
| 1 | **Today** | Calendar icon floated in the app bar. "Thursday · 879 kcal left" sat right-aligned next to the Meals heading | A **date button** under the title: the calendar glyph on the margin line, "Thursday · 879 kcal left" vertically centred next to it. All section headings start on the margin line. The Meals heading shows "1,171 kcal eaten" right-aligned on the right margin | [07-today](../03-screens/qa/compare/07-today.png) |
| 2 | **Meals rows** | An empty meal had **two** pluses: a "+" tile where the photo goes and a "+" button | **One meal row component:**<br>- **Empty meal:** a **passive meal-type icon** (sun, apple, moon, cup) in the photo slot. It is muted but legible (8.5:1), `aria-hidden`, not a button: no states and no hit area.<br>- **Add button:** **exactly one**, on the right ("Add lunch"), 44 × 44, with default / pressed / focus / disabled states and a focus ring with a gap.<br>- **Logged meal:** the dish photo in the same 48 slot, so rows never shift. | [before lunch](../03-screens/qa/compare/07-today-before-lunch.png) · [meals](../03-screens/qa/compare/07-today-meals.png) |
| 3 | **Dish card on Today** | "P 42 · F 7 · C 53" as dotted text. The "Fits your dinner" pill was an interactive chip with an invisible 44 hit extension | **Macro chips** (`.macro-tile--chip`): the same macro-tile component and tokens as the dish detail, letter + value, no dots. The pill is a `.badge--fresh` with its leaf icon: same height and padding as every badge, icon and text centred, inside the card | [meals](../03-screens/qa/compare/07-today-meals.png) |
| 4 | **Recipe cards** | Macros as dotted text, and the reason was squeezed into the fit line | **Text and chips:**<br>- Title, meta, chips, fit line and kcal start at one x in every card (checked).<br>- Same macro chips as on the detail screen.<br>- The reason ("Covers your protein") moved next to the time.<br><br>**Gap tokens:**<br>- The clock → time gap (4) is now the token `--space-inline-icon`. Chips use it between the letter and the value.<br>- `--space-chip-gap` (8) sits between chips. | [13-recipes](../03-screens/qa/compare/13-recipes.png) |
| 5 | **Dish detail: editing** | Read-only ingredient table and a fixed title | **Editing ingredients:**<br>- **Edit** turns each ingredient into labelled fields: food (with suggestions), amount, unit (g / ml / portion), delete. "+ Add ingredient" adds a row.<br>- **kcal, the calorie ring, per-100 g, macro bars, allergens and the Log button recalculate as you type** (no reload), announced via `role="status"`.<br>- **Delete** keeps focus in the list and shows an **Undo toast**.<br>- **Save / Cancel**, with a **Saving…** state.<br>- **"Discard changes?"** appears when leaving with unsaved edits.<br><br>**Editing the name:** a pencil next to the title opens an inline field with a visible label, a live 0–60 count and clear errors ("Enter a name, for example …", "Use 60 characters or fewer. It's 73 now.").<br><br>**New design-system components:**<br>- 21 date button;<br>- 22 title row + name edit;<br>- 23 ingredient rows;<br>- `select` in fields, `.field__count`, edit / trash / meal icons. | [14-recipe-detail](../03-screens/qa/compare/14-recipe-detail.png) · states: [edit](../03-screens/exports/14-recipe-detail-edit.png), [edited](../03-screens/exports/14-recipe-detail-edited.png), [deleted](../03-screens/exports/14-recipe-detail-deleted.png), [discard](../03-screens/exports/14-recipe-detail-discard.png), [saving](../03-screens/exports/14-recipe-detail-saving.png), [name error](../03-screens/exports/14-recipe-detail-name-error.png) |
| 6 | **Cod photo** | Fish on greens: not the recipe | **One file, `01-branding/assets/recipe-baked-cod.jpg`,** used by every screen: Today card, Meals thumbnail, Recipes, detail, log sheet and the board. It shows baked cod with roasted potatoes and broccoli, so the recipe became **"Baked cod, potatoes & broccoli"** (cod 150 g, potatoes 200 g, broccoli 100 g, olive oil 10 g, garlic 5 g = **462 kcal**, USDA). The old file was deleted. `object-fit: cover` everywhere, with alt text describing the dish | [log sheet](../03-screens/qa/compare/14-recipe-detail-log.png) · [dinner added](../03-screens/qa/compare/07-today-dinner-added.png) · [board](../03-screens/qa/compare/flows.png) |

**New photo:**
- **Photo:** "Codfish, Cod to the lagareiro" by **Gadini**.
- **Source:** [pixabay.com/photos/815458](https://pixabay.com/photos/codfish-cod-to-the-lagareiro-food-815458/).
- **Licence:** [Pixabay Content License](https://pixabay.com/service/license-summary/): free for commercial and non-commercial use, no attribution required. It is credited anyway in [CREDITS.md](../01-branding/assets/CREDITS.md).
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
