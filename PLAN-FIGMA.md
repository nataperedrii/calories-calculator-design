# Figma export plan (step 22)

Goal: put the final 46 screens of Ripe into Figma as **editable layers** (frames, text, vectors and image fills, not flat pictures), plus the design tokens as local variables and styles. The design must not change. The Figma plan is Starter (free), so every MCP call is budgeted.

## 1. Limits (Phase 0)

| What | Value | Source |
|---|---|---|
| MCP tool calls, Starter plan | **20 per month** ("If you're on a Starter plan (20 tool calls per month)…") | [Rate limits and access](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) |
| Paid plans, View / Collab seat | 6 per month | same page |
| Pro, Dev / Full seat | 200 per day, 10 per minute | same page |
| Exempt tools (not counted) | `whoami`, `create_new_file`, `add_code_connect_map` | same page |
| Write tools | The page says "some tools, such as those that write to Figma files, are exempt", but doesn't name them. **We assume `use_figma`, `upload_assets`, `get_screenshot` and `get_figma_skill` all count.** | same page |
| Conflicting figure | One search snippet says 6 per month for Starter. The official page says 20. We plan on 20 and the answer from the user. | web search, 2026-10-03 |
| Writing to the canvas | Needs a **Full seat**. Custom (local) fonts are not supported. About 20 kB of output per call. The beta notes say "no assets (image) support yet" for `use_figma` itself, so photos go in through `upload_assets`. | [Write to canvas](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas) |
| `use_figma` input | ≤ 50,000 characters of code per call | tool schema |
| `upload_assets` | ≤ 60 upload URLs per call; ≤ 10 MB per asset; `nodeIds` sets each image as a fill on an existing node | tool schema |
| Starter files | 3 design files, **3 pages per file**, 1 project | Figma pricing / plan page |
| `generate_figma_design` (web capture) | **Not available** in this connector, so the screens are rebuilt with the Plugin API | tool list |

**Account (from `whoami`, an exempt call):**
- Plan "Natalia Peredrii's team": tier `starter`, seat **Full**, role admin. The new file goes here.
- The other plan, "UX INTENSIVE BY LISA", is someone else's team with a View seat. It is **not used**.

**Calls already used this month:** these can't be read through the API. The user approved the budget ("ok", 2026-10-03) without giving a number, so we run on the planned assumption of **20 left**. If Figma answers with a limit error, we stop at once and ask (no retries).

## 2. Approach (Phase 2: local, 0 calls)

All the heavy work happens on this machine. Figma only receives finished build scripts.

1. `tools/figma/extract.mjs` opens every screen in headless Chromium at 390 × 844 and reads the rendered DOM into a compact layer tree:
   - **frames:** fill, radius, stroke, shadow, clip;
   - **text:** font, weight, size, line height, tracking, colour, case;
   - **SVG icons:** with resolved colours;
   - **image placeholders.**

   Pseudo-elements, focus rings, the dialog backdrop and the radial scrim are converted too. The SVG logo is inlined as vectors.
2. `tools/figma/preview.mjs` redraws each tree with the same rules and pixel-compares it with the reference PNG in `03-screens/exports/`. Result for all 46 screens: **mean 1.38 %, max 2.58 %** of pixels differ (threshold 0.2). Most of this is anti-aliasing.
3. `tools/figma/tokens.mjs` turns `02-design-system/tokens.json` into a payload:
   - 53 primitive colours, plus 51 semantic colours aliased to them;
   - 64 dimensions (space, radius, size, border width);
   - 14 text styles and 4 effect styles.
4. `tools/figma/pack.mjs` dedupes SVGs, escapes the trees to ASCII, LZW-packs them and writes `figma-export/batches/batch-NN.js` (each = data + `tools/figma/builder.js`). The pack → unpack round trip is checked for every batch.
5. A **mock `figma` API in Node** ran all 5 batches before any call was spent: 46 frames, 3,200 layers, 168 variables, 14 text styles, 4 effect styles, **0 errors**.

**Layout in Figma** (3 pages maximum on Starter):
- **Screens** reuses the new file's empty "Page 1". It holds one row per flow with a label: Flow 2 recipes, Flow 1B/1C search and dish, Flow 1A photo, Flow 0 onboarding, Flow 3 profile and diary.
- **States** has three rows: errors and limits, edit a dish, edit the method.

| Batch | Page | Screens | Characters |
|---|---|---|---|
| batch-00 (trial + tokens) | Screens | 1: 07-today | 21,083 |
| batch-01 | Screens | 10 (Flow 2, Flow 1B/1C) | 49,851 |
| batch-02 | Screens | 13 (Flow 1A, Flow 0) | 49,007 |
| batch-03 | Screens | 9 (Flow 3) | 49,641 |
| batch-04 | States | 13 | 46,824 |

## 3. Budget (Phase 1)

Assumption: **20 calls left this month**. 70 % cap = **14**. Stop and ask if fewer than **4** remain (20 % of 20).

| # | Call | Counts | Why |
|---|---|---|---|
| 1 | `get_figma_skill` figma-use SKILL.md | 1 | `use_figma` requires this guidance first; there is no local copy |
| 2 | `get_figma_skill` figma-create-new-file SKILL.md | 1 | `create_new_file` requires this skill first |
| 3 | `create_new_file` "Ripe: calorie calculator screens" | 0 (exempt) | a new file, in Natalia's own team |
| 4 | `use_figma` batch-00: trial screen 07-today + tokens | 1 | trial |
| 5 | `get_screenshot` of the trial frame | 1 | evaluate before going on |
| 6–9 | `use_figma` batch-01 … batch-04 | 4 | the other 45 screens |
| 10 | `upload_assets`: 39 photo fills in one call | 1 | photos (≤ 60 per call) |
| 11 | `get_screenshot`: one final check | 1 | photos and fonts in place |
| | **Planned total** | **10** | **4 in reserve** within the 14 cap |
| | **Actual total** | **10** | same as planned. The number of build calls stayed at 5 although the packing changed mid-way (see section 7) |

If fewer calls are left:
- 15 or more left: the plan runs as is.
- 13–14 left: drop the final screenshot (9 calls). The `use_figma` reports already list frames, fonts and errors.
- Fewer than 13 left: stop and offer the fallback package (`figma-export/`: PNGs, the layer JSON and the build scripts, ready to run next month).

## 4. Call log

Counter: **used 10 / cap 14 / assumed left 10** (exempt calls are not counted). Final: **10 counted calls, exactly the planned budget; 4 of the 14-call cap unused.** Times are local.

| # | Time | Tool | Counts | Result | Used / left |
|---|---|---|---|---|---|
| – | 2026-10-03 | `whoami` | exempt | Starter, Full seat, team::1456628069424971860 | 0 / 20 |
| 1 | 2026-10-03 01:01 | `get_figma_skill` figma-use SKILL.md | 1 | ok: rules read (paint colour r,g,b only; set variable scopes; one page switch per call; return node ids) | 1 / 19 |
| 2 | 2026-10-03 01:02 | `get_figma_skill` figma-create-new-file SKILL.md | 1 | ok: plan key + editorType design | 2 / 18 |
| 3 | 2026-10-03 01:02 | `create_new_file` "Ripe — calorie calculator screens", team::1456628069424971860 | exempt | ok: file https://www.figma.com/design/Xo47SGfRZervjkNEHIjE0D | 2 / 18 |
| 4 | 2026-10-03 01:04 | `use_figma` batch-00 trial: 07-today + tokens | 1 | ok: frame 1:3, 3 image slots, 0 errors, 0 font fallbacks; 168 variables, 14 text styles, 4 effect styles | 3 / 17 |
| 5 | 2026-10-03 01:06 | `get_screenshot` trial frame 1:3 | 1 | ok: matches the reference; one difference: the kcal arc came in dashed (Figma ignores pathLength / px dash) → extract.mjs fixed, trial arc replaced in batch-02 | 4 / 16 |
| 6 | 2026-10-03 01:11 | `use_figma` batch-01: 10 screens (Flow 2, Flow 1B) | 1 | ok: 10 frames, 17 image slots, 0 errors, 0 failed (checksums all passed) | 5 / 15 |
| 7 | 2026-10-03 01:22 | `use_figma` batch-02: 14 screens. Re-packed with deflate + base64 (≈ 5× smaller than LZW) after two 49k attempts were cut off in my own output before sending (nothing reached Figma) | 1 | ok: 14 frames, 8 image slots, 0 errors, 0 failed (deflate decoded in Figma, checksums passed) | 6 / 14 |
| 8 | 2026-10-03 07:45 | `use_figma` batch-03: 8 screens (Flow 3 Profile + Diary) + trial arc fix | 1 | ok: 8 frames, 10 image slots, 0 errors; trial arc replaced (old 1:27 hidden, new 8:1106) | 7 / 13 |
| 9 | 2026-10-03 07:48 | `use_figma` batch-04: 13 screens (States page) | 1 | ok: 13 frames on the States page, 1 image slot, 0 errors | 8 / 12 |
| 10 | 2026-10-03 07:56 | `upload_assets` 39 photo fills (nodeIds) | 1 | ok: 39 upload URLs; 39/39 POSTs returned 200 (image fills set) | 9 / 11 |
| 11 | 2026-10-03 07:57 | `get_screenshot` final check, frame 1:3 (07 Today: photos + arc fix) | 1 | ok: matches the reference export (photos in, arc fixed); card shadows slightly stronger, see section 5 | 10 / 10 |

## 5. Known differences to fix by hand

Checked on the trial and final screenshots of 07 Today against `03-screens/exports/07-today.png`. Every batch reported 0 errors and 0 failed screens; the other 45 screens were checked locally (redraw from the same layer data, mean 1.36 % pixel difference) but not screenshotted in Figma, to save calls.

1. **No Auto Layout.** Every layer sits at its rendered x/y inside its frame. That keeps the design pixel-true, but resizing a card won't reflow its contents. Rebuild key components (button, chip, product row, recipe card) as Auto Layout components if the file is going to be edited further.
2. **Tokens aren't bound to layers.** The 168 variables (Primitives + Tokens collections), 14 text styles and 4 effect styles exist, but layers use plain fills, text settings and shadows with the same values. Binding them is a manual step (Figma: select → "Apply variable / style").
3. **Card shadows look slightly heavier** in Figma than in the browser (same e1 values: Figma and Chrome blur shadows differently).
4. **Text sits up to 1–2 px off** vertically in places, because Figma and Chrome place line boxes slightly differently.
5. **Icons are vector groups** imported from SVG (named "icon · …"), not instances of an icon component.
6. **Form selects:** the native select chevron is drawn as a small SVG; **dashed outlines** use the dash pattern [4, 4].
7. **Hidden layer in 07 Today:** the first import of the kcal arc came in dashed. A corrected arc ("icon · kcal arc") was added in batch-03; the old layer is **hidden, not deleted** ("icon · kcal arc (dashed import, hidden)"), per the no-delete rule. It can be deleted by hand.
8. **No 360 px Android variants:** the HTML source has 390 × 844 screens only, so the export has none.

## 6. Safety

- Work happened only in the new file "Ripe — calorie calculator screens" in Natalia's own team. Nothing in other files or teams was touched, and nothing was deleted.
- Sharing was not changed. Natalia does it: **Share → "Anyone with the link" → "can view"**, then opens the link in an incognito window to check.
- The link was not published or sent anywhere.
- **No HTML, CSS, token or design-system source was changed** for the export. All new code is in `tools/figma/` and the data in `figma-export/`.

## 7. Result

- **File:** https://www.figma.com/design/Xo47SGfRZervjkNEHIjE0D/Ripe-%E2%80%94-calorie-calculator-screens. Shared by Natalia on 3 October 2026 as "Anyone with the link · can view".
- **Pages (2 of the 3 allowed on Starter):**
  - **Screens:** 33 frames in 5 labelled rows, one per flow.
  - **States:** 13 frames in 3 rows.
- **In Figma:**
  - **All 46 screens** as editable frames. In total: ~3,200 layers of frames, rectangles, real text in Young Serif, Hanken Grotesk and Azeret Mono (0 font fallbacks), and SVG vectors.
  - 39 photo fills.
  - 168 variables, 14 text styles and 4 effect styles.
- **Not in Figma:**
  - the flows board arrows and annotations (`flows.html`);
  - the clickable prototype links;
  - the stylescape and design-system docs pages.

  None of these were in scope.
- **What changed during the run** (tooling only; the design was not touched):
  - **Arc fix:** `extract.mjs` turns single-dash progress arcs into real paths, because Figma ignores `pathLength` and `px` dash values.
  - **Packing switch:** after batch-01, two attempts at a ~49k-character batch were cut off in my own output before the call was sent, so nothing reached Figma and no call was spent. I switched the packing from LZW to deflate + base64 (≈ 5× smaller). That made 3 calls of ≤ 26k characters for the last 35 screens.
  - **Copies:** `figma-export/batches/sent/` holds the exact batches that were sent, and `sent/builder-lzw.js` the builder used for batches 00–01.
- **Reproduce:**
  - `node tools/figma/extract.mjs`, then `node tools/figma/preview.mjs` (local check), then `node tools/figma/pack.mjs`;
  - the reports with node ids are in `figma-export/figma-reports.json`;
  - this call log is kept up to date by `tools/figma/calllog.py`.
