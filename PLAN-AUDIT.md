# Plan audit: `03-screens/FLOWS.md` plan vs the project

**Audited:** 2 Oct 2026, on branch `design-system` at commit `a94d07f`.

## The plan

| Where looked | Result |
|---|---|
| `~/.claude/plans/` | **One file:** `valiant-wandering-sparrow.md` (1 Oct 2026, 90 lines), "Plan: write `03-screens/FLOWS.md` (no screens built yet)". It's the only plan made in planning mode, so it's the plan audited here |
| Project root, `docs/`, `plan/`, `.claude/` | No `PLAN.md`, `plan*.md`, `TODO.md` or `ROADMAP.md`. There are no `docs/` or `plan/` folders |
| `README.md`, `CLAUDE.md` | They describe the deliverables of the whole test task, not this plan. Deliverables outside this plan are listed under [Outside the plan](#outside-the-plan) |
| `git log` (6 commits) | No plan file is committed. Step 09 of `process/PROMPTS.md` (line 331) records that this plan was approved and carried out |

**What the plan delivers.** The plan's deliverable is the document `03-screens/FLOWS.md`. Its own first line calls it "the plan for `03-screens/`". Step 10 (PROMPTS.md, line 371) records your decision to **build only the screens of flows 1 and 2 (07–14)**.

So each screen item is checked in two places:
- **Spec:** in FLOWS.md, for all 16 screens.
- **Build:** in the built HTML and PNG, for 07–14.

Screens 01–06, 15 and 16 are spec-only, by that decision.

**Statuses:**

| Status | Meaning |
|---|---|
| **Done** | Implemented, with evidence that it meets the criteria |
| **Partial** | Partly there; what's missing is named |
| **Missing** | Not there |
| **Superseded** | Replaced by a later decision of yours, with the source cited |
| **Unclear** | A contradiction, listed as a question at the end |

**How the evidence was gathered:**

| Check | How it ran |
|---|---|
| **A1** | A Python script parsed every catalogue entry in FLOWS.md for Purpose, From/To, Key content, DS and the Default / Empty / Loading / Error rows. All 16 pass |
| **A2** | Every class named in a "DS:" line was looked up in `components.css`. 0 are missing |
| **A3** | Every Markdown table has a consistent column count, and every relative link resolves. 0 problems |
| **A4** | Every sample number was recomputed from the USDA per-100 g table with half-up rounding |
| **A5** | Playwright extracted the visible text of 07–14 |
| **A6** | I looked at the PNG exports 07, 08, 09, 10, 11, 12, 13, 14 in this session |
| **A7** | The project checks ran at baseline (results below) |

## Baseline checks (before)

| Check | Result |
|---|---|
| `npm run check` | 61 / 61, alignment 0 deviations (2,598 edges) |
| `npm run check:screens` | 362 / 362 |
| `npm run check:a11y` | Tier 1: 0 fail / 39 · Tier 2: 0 fail / 9 |
| `tools/build_tokens.py --check` | tokens.css matches tokens.json (283) |
| stylelint, html-validate | 0 errors · 0 errors |
| `tools/contrast.py` | 67 / 67 |

## Checklist (before)

### Context: inputs the plan reuses

| ID | Item | Acceptance | Where | Before | Evidence |
|---|---|---|---|---|---|
| C1 | Use the 5 research insights | The insights are referenced in FLOWS | FLOWS.md | Done | "(insight 1)" … "(insight 5)" appear in sections 1, 3 and 4 (A1) |
| C2 | Reuse the photo flow from BRAND.md | FLOWS covers each of: camera purpose screen, capture tips, analyzing 2–4 s, confidence High / Check portion / Not sure, "Add to Lunch · 559 kcal", toast with Undo, error and offline | FLOWS.md 08, 09 | Done | FLOWS lines 314–358; built 08 and 09 (A6) |
| C3 | Use the existing DS (16 components, sign-in pattern, delete confirm) | DS classes exist | FLOWS "DS:" lines | Done | A2: 0 classes missing |

### Screen list (16 screens)

| ID | Item (plan text) | Acceptance | Where | Before | Evidence |
|---|---|---|---|---|---|
| S01 | Welcome & sign-in: value proposition, passkey or e-mail link | Spec with states | FLOWS 01 | Done (spec) | FLOWS 165–180. Not built: your step 10 decision |
| S02 | Goal: Lose slowly · Maintain · Gain · Just track, Maintain by default | Same | FLOWS 02 | Done (spec) | FLOWS 182–200 |
| S03 | About you: age, height, weight, sex with "Prefer not to say", activity, a line on why | Same | FLOWS 03 | Done (spec) | FLOWS 202–225 |
| S04 | Diet: No preference · Vegetarian · Vegan · Pescatarian · Mediterranean · Low-carb | Same | FLOWS 04 | Done (spec) | FLOWS 227–246 ("Lower-carb") |
| S05 | Allergies & dislikes: major-allergen chips, dislikes field, hard filter, "always check labels" | Same | FLOWS 05 | Done (spec) | FLOWS 248–263 |
| S06 | Daily target: 2,050 kcal + P / F / C, "How we calculated this", Adjust stepper, safety floor | Same | FLOWS 06 | Done (spec) | FLOWS 265–289 |
| S07 | Today: ring 1,171 / 2,050, meals, "Fits your dinner" card | Spec + build | FLOWS 07, `07-today*.html` | Done | FLOWS 291–312; A5 and A6 (07-today: 1,171 / 2,050, 4 meals, card) |
| S07b | Today: "+ Add" on **every** meal | – | – | **Superseded** | Step 11, item 2 (PROMPTS.md line 423): a passive meal icon plus one Add on an empty meal only |
| S08 | Scan: Photo / Barcode, plate overlay, tips, library; first-run purpose and denied states | Spec + build | FLOWS 08, `08-scan.html` | Done | FLOWS 314–332; A6: segmented control, plate outline, 3 tips, library thumbnail, Search |
| S09 | Photo result: markers, items with confidence, steppers, totals, meal picker, "Add to Lunch · 559 kcal" | Spec + build | FLOWS 09, `09-photo-result.html` | Done | FLOWS 334–358; A5 and A6 |
| S10 | Add food: recents first, "Create a dish" entry | Spec + build | FLOWS 10, `10-add-food.html` | Done | FLOWS 360–382 (Recents · Favourites · My dishes in the default state); built search state shows Recent + "Create a dish" (A5) |
| S10b | Add food: results with a **verified badge** | – | – | **Superseded** | Step 15 Fix 1 (PROMPTS.md line 762): the green ✓ was removed everywhere; the source sits on 11 |
| S11 | Food detail: per-100 g facts + USDA source, **portion stepper (g / ml / portion)**, quick chips 50 g · 100 g · 1 portion, live kcal and macros, "Add to {meal}" | Spec + build show a unit switch | FLOWS 11, `11-food-detail.html` | **Partial** | Facts, source, chips (30 g · 1 handful = 1 portion, 50 g, 100 g), live 174 kcal and "Add to Snack" are there (A5, A6). **Missing:** the built screen has no unit switch (grep: no `segmented` in the file), and FLOWS line 390 says "g \| portion" without saying when ml applies |
| S12 | Dish calculator: raw ingredients (picked through 10), cooked weight, per 100 g and per portion, Save / Log | Spec + build | FLOWS 12, `12-dish-calculator.html` | Done | A5 and A6: 7 raw ingredients, 1,700 g, 72 per 100 g, 246 per portion, "Add ingredient" → 10, Save / Log |
| S13 | Recipes: "Fits your dinner · 879 kcal left", filter chips (**meal, ≤ kcal, high protein, ≤ 30 min, diet**), "Fits: … of 879", allergen recipes hidden with a note | Spec + build show all 5 filter kinds | FLOWS 13, `13-recipes.html` | **Partial** | The spec lists all chips (FLOWS 434–440). The **built screen has no "High protein" chip**: A5 shows "Dinner, ≤ 879 kcal, Pescatarian, Peanut-free Allergy, ≤ 30 min". The rest is there, including "1 recipe hidden: it contains peanuts" |
| S13b | Recipes: "Fits: 443 of 879" | – | – | **Superseded** | Step 11 (PROMPTS.md line 465): the dish became "Baked cod, potatoes & broccoli", 462 kcal |
| S14 | Recipe detail: photo, nutrition per portion, allergens line, "Log 1 portion" opens the portion sheet | Spec + build | FLOWS 14, `14-recipe-detail*.html` | Done | A5 and A6; the log sheet is `14-recipe-detail-log.html` |
| S14b | Recipe detail: **servings stepper (scales the ingredients)** | Spec + build have a stepper that scales the ingredient amounts | FLOWS 14, `14-recipe-detail.html`, `dish-editor.js` | **Missing** | Step 09's FLOWS had "Servings stepper: **1** (scales the ingredients)" (session transcript, line 2549). It was **dropped in step 11 by me** while rewriting the entry for editing (transcript line 4218). Step 11's prompt never asked for this (PROMPTS.md lines 438–446). Neither FLOWS nor the build has it now (A5: only "Serves 2" in Method) |
| S15 | Diary: week strip, past days with totals, tap a day | Spec | FLOWS 15 | Done (spec) | FLOWS 492–510. Not built: step 10 decision |
| S16 | Profile: edit goal, body, diet, allergies, target (re-filters recipes), units, delete account (DS confirm) | Spec | FLOWS 16 | Done (spec) | FLOWS 512–527 |
| O1 | Overlays: portion sheet, toast with Undo, delete confirm, system camera prompt | Listed as states, not screens | FLOWS 76–80 | Done | FLOWS 76–80; the sheet and toast are built (`14-recipe-detail-log`, `07-today-lunch-added`) |

### FLOWS.md structure

| ID | Item | Acceptance | Before | Evidence |
|---|---|---|---|---|
| F1 | Intro: two stories, persona, "suits me": hard filters (allergies, diet) and soft ranking (kcal left → protein gap → time) | Section 1 has all of it | Done | FLOWS 13–51 |
| F2.0 | Flow 0 onboarding 01 → 06 → 07 (empty Today) | Arrow diagram | Done | FLOWS 88–98 |
| F2.1 | Flow 1A photo: 07 or Scan → 08 → 09 → toast → 07 | Same | Done | FLOWS 100–109 |
| F2.2 | Flow 1B product: 07 + Add → 10 → 11 → toast; barcode 08 → 11, not found → 10 | Same | Done | FLOWS 111–119 |
| F2.3 | Flow 1C dish: 10 "Create a dish" → 12 ↔ 10 → save or log | Same | Done | FLOWS 121–131 |
| F2.4 | Flow 2 recipes: card or tab → 13 → 14 → sheet → toast → 07 (ring updates) | Same | Done | FLOWS 133–144 |
| F2.5 | Flow 3 preferences: 16 → allergies → 13 re-filtered | Same | Done | FLOWS 146–153 |
| F3 | Catalogue: purpose, entry, exits, key content, DS parts, states (default · empty · loading · error, + offline / partial / denied) with a reason instead of "n/a" | Every entry | Done | A1: 16 / 16 complete; "Not applicable: …" always has a reason |
| F4a | USDA per-100 g values | A table | Done | FLOWS 537–564 |
| F4b | Reuse the salmon lunch 559 (P 37 · F 23 · C 49) | Same numbers | Done | FLOWS 571; A4 recomputes 559 / 37.1 / 23.1 / 48.7 |
| F4c | Reuse the day: 1,171 | Same | Done | A4: 344 + 559 + 268 = 1,171 |
| F4d | Reuse the cod recipe 443 kcal (P 42 · F 7 · C 53) | – | **Superseded** | Step 11 (PROMPTS.md line 465): now 462 (P 40.7 · F 11.9 · C 49.1), A4 recomputes it |
| F4e | Onboarding calculation: 34 y, 165 cm, 63 kg, F, moderately active → 1,330 × 1.55 = 2,062 → 2,050 | Numbers correct | Done | A4: 1,330 / 2,062; FLOWS 617–627 |
| F4f | Macros 100 / 70 / 255 → 400 + 630 + 1,020 = 2,050 | Same | Done | A4 |
| F4g | Remaining = 879 | Same | Done | A4 |
| F4h | Dish calculator example: lentil soup raw → cooked → per 100 g → per portion | Same | Done | A4: 1,229 / 72 / 246 / P 13.3 |
| F4i | 3–4 pescatarian, peanut-free cards + one hidden peanut recipe | Same | Done | FLOWS 579–586; A4 recomputes all 4 (shrimp 532 with half-up rounding) |
| F5 | DS gaps listed: skeleton, step indicator, inline banner, option card, viewfinder, date / week strip | Section 6 lists them | Done | FLOWS 631–647 (plus the locked chip) |
| F6 | **Accessibility notes per flow:** focus order, no time limits, confidence word + icon, allergens not by colour, 44 pt, Undo vs confirm | Notes **per flow** | **Partial** | Section 7 (FLOWS 651–672) has every topic, but as global rules, not per flow |

### Plan steps

| ID | Item | Before | Evidence |
|---|---|---|---|
| P1 | Compute the data with a script and recheck the reused totals | Done | `03-screens/tools/build_screens.py` holds the USDA values and asserts the totals; A4 recomputes them |
| P2 | Write FLOWS.md in simple English (short sentences, tables, no lorem ipsum) | Done | `03-screens/FLOWS.md`, 715 lines |
| P3 | Log step 09 in PROMPTS.md: the prompt verbatim + a summary | Done | `process/PROMPTS.md` lines 331–359 |
| P4 | No HTML, no exports, no commit unless asked | **Superseded** | Step 10 asked for the screens and exports (PROMPTS.md line 361). Commits were made on your requests ("Save all the work in GitHub", "Save your work to GitHub") |

### Plan verification

| ID | Item | Before | Evidence |
|---|---|---|---|
| V1 | 16 screens; each has purpose, key content and empty / loading / error rows or a reason | Done | A1 |
| V2 | Each screen lists only existing DS components or a section-6 gap | Done | A2 |
| V3a | Portions × per-100 g = shown kcal; day totals and kcal left are consistent | Done | A4: every meal and recipe matches |
| V3b | Macros × 4 / 9 / 4 within ±2 % of kcal | **Unclear** | A4: within ±2 %: breakfast +1.7 %, lunch −1.4 %, cod +0.9 %, shrimp +1.3 %. **Outside:** snack +8.2 %, curry +2.2 %, peanut bowl +4.9 %, lentil soup +4.0 %. USDA uses food-specific energy factors (FLOWS line 535). The CLAUDE.md rule "real values from USDA" and this ±2 % rule can't both hold. See question 1 |
| V4 | Tables have consistent columns; links are relative and resolve | Done | A3 |
| V5 | Onboarding covers goal, diet, allergies, daily target; stories 1 (photo, product, dish) and 2 are traced from entry to logged | Done | F2.0–F2.4 |

### Count (before)

53 items: Context 3, Screens 22, Structure 19, Steps 4, Verification 6.

| Done | Partial | Missing | Superseded | Unclear |
|---|---|---|---|---|
| 43 | 3 (S11, S13, F6) | 1 (S14b) | 5 (S07b, S10b, S13b, F4d, P4) | 1 (V3b) |

## Gap table (before → build)

| ID | Item | Status | Evidence | What to do |
|---|---|---|---|---|
| S14b | Servings stepper that scales the ingredients | Missing | FLOWS 14 and the build have no stepper (A5) | Add the DS stepper (component 06) to the Ingredients card on 14. It scales the amounts, row kcal and chips; the per-portion summary stays. Keyboard and `role=status`. Tests; FLOWS 14 |
| S11 | Unit switch g / ml / portion | Partial | No `segmented` on 11 | Add the DS segmented control (component 05) "g \| portion" to the Portion card. The stepper switches 30 g ↔ 1 portion (1 handful). ml applies to liquids only; for almonds it isn't offered, and FLOWS 11 says so. Tests |
| S13 | "High protein" filter chip | Partial | A5 | Add an unselected "High protein" chip (DS chip, component 04) between "Peanut-free" and "≤ 30 min", in the FLOWS order. Tests |
| F6 | Accessibility notes per flow | Partial | FLOWS 651–672 | Add a "Per flow" table to FLOWS section 7, built from what the catalogue already specifies |
| V3b | ±2 % Atwater rule | Unclear | A4 | Not executed. Question 1 |

## Outside the plan

The project has these, and the plan doesn't mention them. They're **not defects**.

| Area | What it is | Evidence |
|---|---|---|
| **Built screens** | 26 HTML files and 26 PNGs for 07–14 and their states, generated by `03-screens/tools/build_screens.py` | FLOWS section 8, `03-screens/exports/` |
| **Flows board** | `03-screens/flows.html` / `flows.png`, 23 notes | Step 10 |
| **DS components 17–24** | Banner, skeleton, viewfinder, screen layout, date button, title row, ingredient rows, recipe steps, plus variants | `02-design-system/index.html` |
| **Dish editing** | `screens/js/dish-editor.js`: ingredients, name, method, Undo, Discard, Saving | Steps 11–12 |
| **Tools** | `export.mjs`, `check.mjs` (screens), `align.mjs` (grid), `compare*.mjs`; QA folders `03-screens/qa/*` | `package.json` scripts |
| **Product photos** | 6 recipe and food photos (step 10) and 3 product photos (step 16) with credits | `01-branding/assets/CREDITS.md` |
| **Project deliverables not in this plan, and missing** | Root `index.html` (GitHub Pages landing), `LINKS.md` and `03-screens/index.html` (clickable prototype). `ls` reports "No such file" for all three. FLOWS line 715 calls the prototype "a later step" | CLAUDE.md "Structure"; question 3 |
| **DS gaps for the unbuilt screens** | Step indicator, option card and week strip aren't in the DS. They're needed only by 01–06 and 15, which aren't built (step 10 decision) | FLOWS line 647; question 2 |

---

## What was built (gap closure)

The work was done in batches; after each batch I re-audited the items, looked at screenshots and ran `npm run check` / `check:screens`.

| ID | Built | Files | Before / after |
|---|---|---|---|
| S14b | **Servings stepper** on dish detail (the DS weight stepper, 06) in the Ingredients card: 1 by default, range 1–8.<br><br>**What scales:** the amounts, the row kcal (from the scaled grams) and the P / F / C chips. The summary, the ring and "Log 1 portion · 462 kcal" stay per portion.<br><br>**Behaviour:** "−" is disabled at 1 and "+" at 8, and focus moves to the other button at a limit. Typed values snap into 1–8. ↑ / ↓ work in the input. Each change is announced via `role="status"`. In edit mode the row hides and amounts are edited per portion.<br><br>**New export state:** `14-recipe-detail-servings` (2 portions: cod 300 g … garlic 10 g). | `03-screens/screens/js/dish-editor.js`, `03-screens/tools/build_screens.py`, `02-design-system/components.css` (`.ingredients__servings`), `02-design-system/index.html` (c23), `03-screens/FLOWS.md` | [390](03-screens/qa/compare-audit/14-recipe-detail-ingredients@390.png) · [320](03-screens/qa/compare-audit/14-recipe-detail-ingredients@320.png) · [edit, unchanged](03-screens/qa/compare-audit/14-recipe-detail-edit-ingredients@390.png) · [export](03-screens/exports/14-recipe-detail-servings.png) |
| S11 | **Unit switch** "g \| portion" (DS segmented, 05) in the Portion card. Choosing "portion" shows the same 30 g as **1 portion** (1 handful); kcal and macros don't change. ml is offered only for liquids, and FLOWS 11 now says so | `build_screens.py`, FLOWS.md 11 | [390](03-screens/qa/compare-audit/11-food-detail@390.png) |
| S13 | **"High protein"** filter chip (DS chip, 04), unselected, in the FLOWS order between "Peanut-free" and "≤ 30 min" | `build_screens.py` | [390](03-screens/qa/compare-audit/13-recipes@390.png) · [320](03-screens/qa/compare-audit/13-recipes@320.png) |
| F6 | **Accessibility per flow:** a table in FLOWS section 7 for flows 0, 1A, 1B, 1C, 2 and 3, covering focus order and keyboard, timers, colour, targets, and Undo vs confirm. It's built from what the catalogue specifies | `03-screens/FLOWS.md` §7 | – |

**Found and fixed while verifying.** These are existing defects that the new 320 px + 200 % text test exposed, both of the "nothing extends beyond its container" rule:
1. **Stepper too wide.** The DS **stepper** could be wider than its row: 346 px on a 320 px screen with "8 portions".
   - Now it has `max-width: 100 %`, and the unit wraps under the number.
   - The ± buttons are `flex: none`, so they stay 44 × 44. I briefly broke this (the buttons shrank to 42 px), and `npm run check` geometry@200 % caught it.
2. **"Amount" header off-screen.** The Ingredients header label "Amount" ran off the screen (331 > 320). The header now wraps with "Amount" kept on the right edge.

**Reconciled FLOWS.md with the build (Phase 4.5):**
- **Updated statements:** "Built so far" (now 27 files), the Flow 1B arrow ("Almonds" without ✓), Recents names, the favourite (heart, not star), the hidden-recipe note text, and the "Roasted almonds" name.
- **New "Spec vs build" table** in section 8: spec details that no built export shows (10 default state with tabs; 12 name field and delete; 13 tabs; empty / loading / error states).

## Checklist (after): every item re-checked

**Fresh evidence for all items:**
- **A1–A3** re-run on the updated FLOWS.md (738 lines): 16 / 16 catalogue entries complete, 0 DS classes missing, 0 table or link problems. Links in this file resolve too.
- **A4** numbers unchanged: same data, no edits to section 5.
- **Built screens:** `check:screens` 387 / 387, and I looked at the PNGs of every changed screen.

| ID | After | Fresh evidence |
|---|---|---|
| C1–C3 | Done | A1, A2 |
| S01–S06, S15, S16 | Done (spec) | A1; not built (step 10 decision, PROMPTS.md line 371) |
| S07, S08, S09, S10, S12, S14, O1 | Done | `check:screens` 387 / 387; exports 07–14 looked at |
| S07b, S10b, S13b | Superseded | Step 11 item 2 / step 15 / step 11 (unchanged) |
| **S11** | **Done** (was Partial) | `unit` test: radios g\*, portion; arrows switch to portion → stepper "1 portion (= 30 g)", kcal 174. Screenshot `11-food-detail.png` |
| **S13** | **Done** (was Partial) | `filters` test at 390 and 320: "Dinner\* \| ≤ 879 kcal\* \| Pescatarian\* \| Peanut-free Allergy \| High protein \| ≤ 30 min", nothing clipped |
| **S14b** | **Done** (was Missing) | `servings` tests at 390 and 320: start 1 ("−" disabled, 44 × 44); Enter → 2 (all amounts ×2, summary and Log 462, focus kept, announced); Space; at 8 "+" disabled, focus → "−"; typed 0 → 1, 20 → 8; Edit hides the row (cod 150); 200 % text + 8 portions: nothing clipped. Export `14-recipe-detail-servings.png` looked at |
| F1–F5, F4a–F4i (except F4d) | Done | A1, A3, A4 |
| F4d | Superseded | Step 11 |
| **F6** | **Done** (was Partial) | FLOWS §7 "Per flow", 6 rows × 5 columns (A3: consistent columns) |
| P1–P3 | Done | Unchanged |
| P4 | Superseded | Unchanged |
| V1, V2, V3a, V4, V5 | Done | A1, A2, A4, A3, F2 |
| V3b | Unclear | Unchanged; question 1 |

### Count, before → after

| | Done | Partial | Missing | Superseded | Unclear |
|---|---|---|---|---|---|
| **Before** | 43 | 3 | 1 | 5 | 1 |
| **After** | 47 | 0 | 0 | 5 | 1 |

## Checks report

| Check | Before | After |
|---|---|---|
| `npm run check` | 61 / 61, alignment 0 (2,598 edges, 26 screens) | **61 / 61, alignment 0** (2,768 edges, 27 screens) |
| `npm run check:screens` | 362 / 362 | **387 / 387** (+25: servings 12, unit 1, filters 2, plus 10 per-file checks for the new export) |
| `npm run check:a11y` | Tier 1 0 / 39 · Tier 2 0 / 9 | **Tier 1 0 / 39 · Tier 2 0 / 9** |
| Tokens (`build_tokens.py --check`) | in sync (283) | **in sync (283)**; no token changes |
| stylelint · html-validate | 0 · 0 | **0 · 0** |
| `contrast.py` | 67 / 67 | **67 / 67** |
| Exports | 26 PNG | **27 PNG** (+ `14-recipe-detail-servings`) |

**Browser checks:** the new `servings`, `unit` and `filters` tests run at 390 and 320 px, at 200 % text, with the longest values (8 portions: 1,200 g, 1,401 kcal rows) and from the keyboard.

**Regression** (pixel diff of all 28 "before" PNGs in `03-screens/qa/before-audit/`):

| Result | Screens |
|---|---|
| Identical (21) | Every Today state, Scan, Photo result, Add food, the dish calculator, and the dish view, edit, edited, deleted, discard, saving, name-error, step and log states |
| Changed by the gaps | 11, 13, the docs page and the board |
| Sub-pixel only | 14-method (10 px) and 14-no-steps (9 px). They scroll to Method below the Ingredients card, which now has the servings row |
| Not real changes | 09-analyzing: its shimmer frame differs between runs. 07-today-lunch-added: export noise; re-exports match "before" |

## Questions for you (not executed)

1. **V3b, the ±2 % Atwater rule.** The plan wants P × 4 + F × 9 + C × 4 within ±2 % of kcal. With real USDA values that fails for 4 items: the snack is +8.2 % because of almonds, the curry +2.2 %, the peanut bowl +4.9 % and the lentil soup +4.0 %. USDA uses food-specific energy factors (FLOWS line 535). Do we keep the USDA kcal and drop the ±2 % criterion, or something else?
2. **Screens 01–06, 15 and 16.** These are onboarding, Diary and Profile. They are specified but not built, by your step 10 decision. They'd also need three DS components: step indicator, option card and week strip. Should I build them?
3. **Project deliverables outside this plan.** CLAUDE.md lists a root `index.html` (GitHub Pages landing), `LINKS.md` and `03-screens/index.html` (clickable prototype). None of them exist. Should I build them next?
4. **Recipes filter row.** With "High protein" the six chips need 3 rows at 390 (4 at 320). Two rows would need 355 px; the space is 350. Keep wrapping, or make the chip row scroll sideways?

## Outside the plan (after)

The earlier list still holds, plus:
- **New audit files:** `PLAN-AUDIT.md`, `03-screens/tools/compare-audit.mjs`, and `03-screens/qa/before-audit/` and `compare-audit/`.
- **Plan file location:** the plan itself lives outside the project (`~/.claude/plans/valiant-wandering-sparrow.md`), so it isn't edited. Its in-project result, `03-screens/FLOWS.md`, is updated to match the project.


---

## Update: step 18, your answer to question 2

You answered "Yes, please build" to building onboarding (01–06), Diary (15) and Profile (16).

**Design system first** (v1.11):
- New components: 25 Step indicator, 26 Option card, 27 Week strip, with all their states.
- Token `size.day-ring`, icon `copy`, settings rows `.product--nav`.
- The DS gaps in FLOWS.md §6 are now all closed.

**Screens:** 19 new HTML / PNG files, 46 in total. They cover flow 0 end to end (01 → 01-link → 02 → 03 → 04 → 05 → 06 → 07 first day, plus 03 error and 06 at the floor) and flow 3 end to end (16 → 05 edit → 16 saved → 13 re-filtered; 16 delete confirm; 15 Diary for 4 days).

**Board:** Flow 0 and Flow 3 rows, notes 24–34.

**Item statuses after step 18:**

| ID | Before | After | Evidence |
|---|---|---|---|
| S01–S06 | Done (spec), not built | **Done (spec + build)** | `03-screens/screens/01-…06-*.html` and exports. `check:screens` "onboarding" tests: step text 1–5 of 5; radios and arrow keys at 390 and 320; height error; 15 allergen chips; target floor 1,550 with macros adding up; disclosure |
| S15 | Done (spec), not built | **Done (spec + build)** | `15-diary*.html`. "diary" tests at 390 and 320 for both states: 7 days ≥ 44 inside the screen, one selected, today, 3 disabled, "45 over" / "+45", copy only on past days; keyboard Enter opens Tuesday |
| S16 | Done (spec), not built | **Done (spec + build)** | `16-profile*.html`. "profile" and "flow3" tests: named edit buttons, modal confirm with "Keep my account" first, Flow 3 end to end with shrimp hidden |
| F5 (DS gaps) | Done (listed) | Done (listed **and** built) | `02-design-system/index.html` c25–c27; `npm run check` 61 / 61 |

**Count:** unchanged at 47 Done · 0 Partial · 0 Missing · 5 Superseded · 1 Unclear (V3b, question 1). The three screen items now also have a build.

**Checks after step 18:**

| Check | Result |
|---|---|
| `npm run check` | 61 / 61, alignment **0 deviations (3,636 edges, 46 screens)** |
| `npm run check:screens` | **603 / 603** |
| `npm run check:a11y` | Tier 1 0 / 39 · Tier 2 0 / 9 |
| Tokens | in sync (285) |
| stylelint, html-validate | 0 · 0 |
| Contrast | 67 / 67 |
| Regression | 21 of the 26 committed screens are pixel-identical to commit `a94d07f`. The other 5 are the 4 known plan-audit changes (same pixel counts) plus the analyzing shimmer |

**Still open:** questions 1, 3 and 4 above. Question 2 is answered and done.

**Data change:** the Diary's example week now uses totals computed from logged meals: Mon 1,703, Tue 2,095 (45 over), Wed 1,661. They replace FLOWS.md's earlier example (1,985 / 2,140 / 1,920), which no combination of the USDA meals produces exactly (a search script found 0 combinations). The FLOWS.md text was updated to match.
