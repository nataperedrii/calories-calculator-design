# Ripe design system

The design system for **Ripe**, a photo-first calorie calculator. It turns the brand in [01-branding/BRAND.md](../01-branding/BRAND.md) into tokens and components that every screen in `03-screens/` must use.

- **Docs page:** [index.html](index.html) (separate CSS files) · [index.standalone.html](index.standalone.html) (styles and images inlined, works on its own) · PNG: [design-system.png](design-system.png) (full page, 2×)
- **Theme:** light only. Warm off-white backgrounds, never pure `#FFFFFF`.
- **Frame:** 390×844 pt (iPhone 14/15). The system follows Apple HIG and Material 3 sizing. Android sizes switch on with `data-platform="android"`.
- **Verified:** `npm run check` gives **61 / 61 checks passed** (see [Validation report](#validation-report)). `npm run check:a11y` gives **Tier 1: 0 failures, Tier 2: 0 failures** (see [WCAG 2.2 AA + AAA for critical elements](#wcag-22-aa--aaa-for-critical-elements)).

## Files

| File | What it is |
|---|---|
| `tokens.json` | **Source of truth.** [W3C Design Tokens](https://tr.designtokens.org/format/) format: `$type`, `$value`, `$description`, and `{aliases}` |
| `tokens.css` | The same tokens as CSS variables. **Generated**, so don't edit it by hand: `python3 tools/build_tokens.py` (`--check` detects drift) |
| `components.css` | All components and their states. Uses **only** semantic `var(--…)` tokens: no hex colours, no px values, no primitives |
| `docs.css` | Layout of the docs page only |
| `index.html` | Documentation page. Links `./tokens.css`, then `./components.css`, then `./docs.css` |
| `index.standalone.html` | The same page with CSS and images inlined. Generated: `npm run build:standalone` |
| `design-system.png` | Full-page export at 2×. Generated: `npm run export:png` |
| `tools/check.mjs` | Automated verification: `npm run check` |
| `qa/` | Check output: `report.json` and zoomed crops (`qa/crops/`). Section screenshots go to `qa/sections/` (gitignored) |

To use it on a screen:

```html
<link rel="stylesheet" href="../../02-design-system/tokens.css">
<link rel="stylesheet" href="../../02-design-system/components.css">
```

## Tokens

There are two layers:
1. **Primitives** (`--color-oat-50`, `--color-persimmon-600` and so on): the raw palette, with every family named after a food.
2. **Semantic tokens** (`--color-bg-canvas`, `--color-text-secondary`, `--color-macro-protein` and so on): what components use.

The tokens in `tokens.json` become 283 CSS variables, including the `prefers-contrast: more` and `prefers-reduced-motion` modes.

| Group | Tokens | Notes |
|---|---|---|
| **Colour: background** | `bg-canvas`, `bg-surface`, `bg-sunken`, `bg-disabled`, `bg-inverse(-pressed)`, `bg-accent(-pressed)`, `bg-accent-subtle(-pressed)`, `bg-fresh-subtle`, `bg-highlight`, `bg-pressed`, `bg-scrim` | Oat milk background, Rice cards, Persimmon accent |
| **Colour: text** | `text-primary`, `text-secondary`, `text-disabled`, `text-inverse`, `text-on-accent`, `text-accent`, `text-fresh`, `text-inverse-accent/-success/-warning` | Rye crust and Walnut |
| **Colour: border** | `border-subtle`, `border-default`, `border-strong`, `border-accent`, `border-focus`, `border-error`, `border-inverse` (on camera / dark) | `border-strong` (inputs) and `border-focus` meet 3:1 |
| **Colour: status** | `success`, `warning`, `error`, each with `-text` and `-subtle` | Basil, Turmeric, Chili. **Over goal = warning, never error** |
| **Colour: macros** | `macro-protein`, `macro-fat`, `macro-carbs`, each with `-text` and `-subtle`, plus `macro-track` | Beetroot, Mustard, Blueberry. Always labelled P / F / C |
| **Type** | `display`, `h1`, `h2`, `title`, `body`, `body-strong`, `callout`, `label`, `caption`, `overline`, `num-xl`, `num-l`, `num-m`, `num-s` | rem-based (Dynamic Type). `num-*` use tabular figures |
| **Font stacks** | Young Serif → Iowan Old Style, Palatino, Georgia, serif · Hanken Grotesk → system UI fonts → sans-serif · Azeret Mono → SF Mono, Menlo, Consolas, Roboto Mono → monospace | They look right offline and keep numbers tabular |
| **Space** | `space-0 … space-16` on a **4 pt grid**. Grid lines: `space-screen-margin` (20, left **and** right) and `space-card-inset` (16, content inside cards, lists, banners, rows). Gaps: `space-inline-icon` (4, icon → text and macro letter → value), `space-chip-gap` (8, between chips) | Checked by `npm run check:align` (0 px tolerance) |
| **Size** | `touch-min` 44 · `touch-android` 48 · `app-bar` 56 / `app-bar-android` 64 · `tab-bar` 49 / `tab-bar-android` 64 · `tab-indicator` 56×32 · `tab-label-max` 14 · `segment` 36 / `segment-android` 40 · `col-min` 5rem · `chip` 36 · `thumb` 48 · `shutter` 72 · `plate-guide` 280 · `recipe-thumb` 80 · `icon-inset` 10 (hit area → glyph, used to put glyphs on grid lines) · `macro-chip` 24 (compact P/F/C chip) · `step-number` 28 · `measure` 40rem (≈ 75 characters, reading width) · safe areas 47 / 34 | |
| **Icons** | `size-icon-s/m/l/xl` = 16 / 20 / 24 / 32, `size-icon-stroke` 2 | Drawn on a 24 grid |
| **Radius** | `xs` 6 · `sm` 10 · `md` 16 · `lg` 24 · `xl` 32 · `full` | |
| **Border width** | `hairline` 1 · `default` 1.5 · `focus` 2 · `focus-gap` 2 · `rule` 3 | |
| **Elevation** | `shadow-e1` (cards), `e2` (toasts), `e3` (sheets), `accent` (scan) | Warm rye-tinted shadows |
| **Motion** | `duration-fast` 120 ms, `base` 200 ms, `slow` 320 ms, `shimmer` 1400 ms, `easing-standard` | All 0 ms under `prefers-reduced-motion` |

## Components

Every component has **default, pressed, disabled, focus and error** states wherever that state makes sense. They're shown with `.is-*` classes on the docs page, and in real use they come from `:active`, `:disabled`, `:focus-visible` and `aria-invalid`.

**Hard rules** (all enforced by `npm run check`):
1. Text is never clipped. Containers use `min-height`, and text wraps.
2. Nothing extends beyond its parent, including focus rings and pressed fills.
3. Borders and rings are equal on all sides. They're drawn as inset `box-shadow`, so a state never changes a component's size.

| # | Component | Class | States shown |
|---|---|---|---|
| 1 | Buttons, icon buttons | `.btn`, `.icon-btn` | default · pressed · disabled · focus · Android 48 dp |
| 2 | Text field | `.field`, `.field__top`, `.field__count` | default · focus · filled · error · disabled · select · live character count |
| 3 | Search bar | `.search` | default · focus · no results (error) · disabled |
| 4 | Chips | `.chip` | default · pressed · selected · focus · disabled · fresh · locked (allergy) |
| 5 | Segmented control (g / ml / portion) | `fieldset.segmented` + native radios | default · pressed · focus · disabled option · Android |
| 6 | Weight stepper | `.stepper` | default · pressed · focus · at minimum · error · disabled |
| 7 | Product list item | `.product`, `.product--detected`, `.product__thumb--meal`, `.product--chips` (photo + name, chips under the photo, kcal + Add centred) | default · pressed · selected · disabled · error (+ focus) · detected · check portion · photo / icon thumb · meal rows (passive meal icon + one Add button) |
| 8 | Recipe card | `.recipe-card`, `.recipe-card--compact` | default · pressed · disabled (long titles) · compact (80 px wide full-height image, one text column), clickable image (`.recipe-card__img--link`) · View recipe button (default · pressed · focus · disabled) |
| 9 | Nutrition summary | `.nutri`, `.macro`, `.macro-tile--chip` | on track · over goal · macro chips |
| 10 | Nutrition facts table | `.facts` | per 100 g + per portion |
| 11 | Top app bar | `.app-bar` | default · scrolled · large · Android 64 dp |
| 12 | Tab bar | `.tab-bar`, `.tab` | active · pressed · focus · Scan focus · Android 64 dp |
| 13 | Bottom sheet + macro tiles | `.sheet`, `.macro-tiles` | portion sheet over a scrim |
| 14 | Toast | `.toast` | success · warning (pressed action) · error (focused action) |
| 15 | Empty state | `.empty` | empty · error |
| 16 | Badges and confidence | `.badge`, `.confidence`, `.marker` | verified · new · fresh · count · P/F/C · high · check · not sure |
| 17 | Inline banner | `.banner` | info · offline · offline with action |
| 18 | Skeleton | `.skeleton` | list · card (static under reduced motion) |
| 19 | Camera viewfinder | `.viewfinder`, `.shutter`, `.icon-btn--inverse` | live (plate found) · shutter pressed · library focused |
| 21 | Date button | `.date-btn` | default · pressed · focus |
| 22 | Title row and name editing | `.title-row`, `.name-edit` | view · edit · error · saving |
| 23 | Ingredient rows | `.ingredients`, `.ingredient`, `.ingredient--edit`, `.ingredients__servings` | two-line view (name \| amount, chips \| kcal) · servings · edit · delete focused · error · deleted (Undo toast) |
| 24 | Recipe steps (Method) | `.recipe-steps`, `.recipe-step`, `.recipe-step--edit`, `.recipe-step__actions` | view · edit · move disabled / focus / pressed · empty-step error · empty state |
| 25 | Step indicator | `.progress`, `.progress__text`, `.progress__seg` | step 1 / 3 / 5 of 5: upcoming · done · current. Not interactive, so no pressed, focus, disabled or error state |
| 26 | Option card | `.option-group`, `.option-card`, `.option-card--check` | radio: default · pressed · selected · focus · disabled · checkbox · group error |
| 27 | Week strip | `.week`, `.week__day`, `.week__ring`, `.week__note` | default · pressed · selected · focus · today · over · empty · disabled. No error state: days come from the phone |
| 20 | Screen layout | `.screen`, `.status-bar`, `.screen__body`, `.screen__foot`, `.screen__toast`, `.card`, `.photo` | frame with photo markers and footer · inverse status bar · toast row |

---

## WCAG 2.2 AA + AAA for critical elements

Audited with `npm run check:a11y` (`tools/a11y.mjs`). Reports: [a11y/audit-before.md](a11y/audit-before.md) → [a11y/audit-after.md](a11y/audit-after.md) (JSON alongside). Screenshots: `a11y/after/` (focus states, dialogs, forced colours, 320 px reflow, more-contrast mode, text-spacing overrides).

**The audit combines four approaches:**
1. **Two independent checkers:**
   - axe-core with `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice`.
   - pa11y `WCAG2AA` with the htmlcs runner.
2. **Custom contrast scan:** every text node's computed colour, alpha-composited over the real background stack (the worst case for gradients). Each is tagged *critical* (7:1) or *regular* (4.5:1).
3. **AAA pass on critical elements only:** axe `wcag2aaa`, restricted to the critical list.
4. **Browser behaviour:**
   - A full keyboard traversal (focus visible, appearance, not obscured, order, Shift+Tab, radios with arrow keys, dialog trap, Esc, focus return).
   - Targets and their spacing.
   - Reflow at 320 px; 200% text; the WCAG text-spacing overrides.
   - `prefers-reduced-motion`, `prefers-contrast: more` and `forced-colors: active` emulation.
   - A structural checklist.

No rules were disabled, and nothing was excluded or hidden to pass.

| | Before | After |
|---|---|---|
| Tier 1: A + AA (blocking) | **28 failures** (17 real, counting pa11y's own summary row, + 11 checker artefacts*) | **0 failures**, 40 checks pass |
| Tier 2: AAA on critical elements (blocking) | **355 failures** (349 real: 318 contrast findings below 7:1, from the custom scan (164) and axe AAA (154), mostly the same nodes seen twice; 24 nav links under 44 px; 7 missing patterns. Plus 6 checker artefacts*) | **0 failures**, 9 checks pass |
| Tier 3: other AAA (information) | 661 notes | 3 notes (the pressed toast action, reported by both scanners, and a *pass* note for more-contrast mode) |
| axe-core AA + best practice | 0 violations, 46 rules pass | 0 violations, 58 rules pass |
| pa11y WCAG2AA | 4 errors (disabled label text) | **0 errors** |
| Focus stops without a visible indicator | – | 0 of 215 |
| Smallest target | 183 × 24 (24 docs nav links) | 44 × 44 (243 targets, 0 overlapping) |
| Reflow at 320 px | horizontal scroll (520 px) | none (wide tables scroll inside their own region) |

\* The first version of the checker measured three things wrongly:
- **2.4.7, 11 findings:** it looked at the input element instead of its field container (where the focus ring is drawn), and at the Scan tab instead of its pill.
- **2.4.13, 6 findings:** it measured the inner 2 px gap ring of the segmented control instead of the outer rye ring.

Those were fixed in the checker, not hidden. Screenshot review also showed that the selected + focused segment lost its edge, so that state now keeps its inset ring too. Every other "before" failure was a real defect, fixed below.

### Critical elements (Tier 2, closed list)

- **Numbers:** all calorie and macro numbers and their labels; kcal values; text inside the calorie ring; P / F / C values and labels; macro bars; the nutrition facts table.
- **Text:** body text and headings; input text and labels; error messages.
- **Bars and buttons:** text on primary buttons; tab bar items (active and inactive); the top app bar.
- **Interaction:** every interactive element (target size, focus).
- **Irreversible actions:** deleting the account and its data.
- **Motion:** all animations.

Selectors are listed at the top of `tools/a11y.mjs`. Hints, captions, placeholders and metadata are "secondary" (4.5:1), but they reach 7:1 anyway through the new `text-secondary`.

### Criteria

| Criterion | Tier | Result | Evidence |
|---|---|---|---|
| 1.1.1 Non-text Content | 1 | pass (fixed) | Calorie ring `role="img"` + label; icons `aria-hidden`; icon buttons named; logo `alt` |
| 1.2.1–1.2.5 Time-based media | 1 | justified exception | The page has no audio or video, so there is nothing to caption or describe ([Understanding 1.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded)) |
| 1.3.1 Info and Relationships | 1 | fixed | Added `header` / `nav` / `main` / `footer` landmarks, one h1 and no skipped levels, `th scope`, captions on every table (the facts table was missing one), native radiogroup (`fieldset` + radios), macro bars `role="meter"` |
| 1.3.2 Meaningful Sequence · 1.3.3 Sensory Characteristics | 1 | pass | DOM order = visual order; no instruction relies on shape or position |
| 1.3.4 Orientation | 1 | pass | No orientation lock |
| 1.3.5 Identify Input Purpose | 1 | fixed | Sign-in email `autocomplete="email"`. The food fields aren't personal data, so they're out of scope |
| 1.4.1 Use of Color | 1 | pass | Macros: colour + letter + label; errors: colour + icon + text; confidence: icon + word; active tab: colour + bold + underline; selected: ring + check or bold |
| 1.4.2 Audio Control | 1 | justified exception | No audio |
| 1.4.3 Contrast (Minimum) | 1 | fixed | pa11y flagged 4 disabled-label nodes at 2.3:1. Disabled text is now 4.6:1+, and every non-disabled pair is ≥ 4.79:1 |
| 1.4.4 Resize Text | 1 | pass | 200% text: 0 clipped or overflowing elements |
| 1.4.5 Images of Text | 1 | pass | Only the logotype (exempt) |
| 1.4.10 Reflow | 1 | fixed | Was 520 px wide at 320 px. Grids use `min(100%, …)`; token tables scroll in focusable `section` regions (the table exception) |
| 1.4.11 Non-text Contrast | 1 | fixed | Chip boundary 1.25 → 3.83:1; search boundary none → 3.83:1; selected segment fill-only 1.09:1 → 1.5 px ring 3.8:1; active tab now has an underline 7.2:1. Inputs 3.83, macro fills ≥ 3.3, ring value vs track 4.1 (the graphic also has text: [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)) |
| 1.4.12 Text Spacing | 1 | pass | WCAG overrides injected: 0 clipped or overflowing |
| 1.4.13 Content on Hover or Focus | 1 | pass | No custom hover or focus popups (`abbr` tooltips are user-agent controlled) |
| 2.1.1 Keyboard · 2.1.2 No Keyboard Trap | 1 | fixed | All controls are native. The sheet is now a real modal `<dialog>`: focus moves in, Tab and Shift+Tab stay inside, Esc closes, focus returns to the opener (it was a static preview only) |
| 2.1.4 Character Key Shortcuts | 1 | pass | None defined |
| 2.2.1 Timing Adjustable · 2.2.2 Pause, Stop, Hide | 1 | pass (fixed) | Toasts no longer auto-dismiss ("5 seconds" removed); nothing moves by itself |
| 2.3.1 Three Flashes | 1 | pass | No flashing |
| 2.4.1 Bypass Blocks | 1 | fixed | A "Skip to content" link is the first focus stop (44 px) |
| 2.4.2 Page Titled · 2.4.4 Link Purpose · 2.4.6 Headings and Labels | 1 | pass | Descriptive title, nav links and headings |
| 2.4.3 Focus Order | 1 | pass | 215 stops in DOM order; Shift+Tab reverses |
| 2.4.5 Multiple Ways | 1 | justified exception | Applies to "a web page within a set of web pages"; this is one standalone page. It still has a nav, a skip link and in-page anchors ([Understanding 2.4.5](https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways)) |
| 2.4.7 Focus Visible · 2.4.11 Focus Not Obscured (Min) | 1 | pass | 215 of 215 stops show a ≥ 2 px indicator; 0 covered |
| 2.5.1 Pointer Gestures · 2.5.2 Pointer Cancellation · 2.5.4 Motion Actuation · 2.5.7 Dragging | 1 | pass | Single taps only; native click activation; the stepper has ± buttons and a typed value (no drag) |
| 2.5.3 Label in Name | 1 | pass | Visible labels are the accessible names; icon-only buttons have `aria-label` |
| 2.5.8 Target Size (Minimum) | 1 | pass | Smallest target 44 × 44 |
| 3.1.1 Language of Page · 3.1.2 Language of Parts | 1 | pass | `lang="en"`; no other languages |
| 3.2.1 On Focus · 3.2.2 On Input · 3.2.3 · 3.2.4 · 3.2.6 | 1 | pass | No context changes; same nav and component names throughout; no help mechanism to keep consistent |
| 3.3.1 Error Identification · 3.3.2 Labels · 3.3.3 Error Suggestion | 1 | pass | Visible labels (never placeholder-only); errors say how to fix them ("Enter a weight between 1 and 10,000 g", "Did you mean Greek yogurt?"), with `aria-invalid` and `aria-describedby` |
| 3.3.4 Error Prevention (Data) | 1 | fixed | "Delete account" opens a confirm sheet that lists the data, offers 30 days to restore, and focuses the safe option |
| 3.3.7 Redundant Entry | 1 | justified exception | The docs page has no multi-step process. In the app, the portion sheet pre-fills the detected weight |
| 3.3.8 Accessible Authentication (Minimum) | 1 | fixed | Sign-in pattern: email magic link or passkey; paste and password managers allowed |
| 4.1.2 Name, Role, Value | 1 | fixed | Stepper value is now a labelled `input`; macro bars are `role="meter"` with values; sheet is `<dialog>`; segmented control uses native radios |
| 4.1.3 Status Messages | 1 | pass | Toasts `role="status"`, error toast `role="alert"` |
| **1.4.6 Contrast (Enhanced)** | 2 | fixed | 318 critical text nodes were below 7:1. Now all ≥ 7:1 (see the table below); 34 critical token pairs checked by `contrast.py` |
| **2.5.5 Target Size (Enhanced)** | 2 | fixed | 24 docs nav links were 24 px; now 44 px. 243 targets ≥ 44 (Android variants ≥ 48); 0 overlapping hit areas |
| **2.4.12 Focus Not Obscured (Enhanced)** | 2 | pass | No focused element is even partly covered: the sticky nav is in its own column, and the sheets are modal |
| **2.4.13 Focus Appearance** | 2 | pass (checker fixed) | Every one of the 215 stops has a ring ≥ 2 px (outline, double ring or inset ring). Contrast change between focused and unfocused pixels: 14.6:1 on the canvas, 13.4:1 on the segment track, 13.2:1 on a pressed tab, 14.6:1 for the light ring on the dark toast. Screenshots: `a11y/after/focus/` |
| **2.3.3 Animation from Interactions** | 2 | fixed | `prefers-reduced-motion`: motion tokens become 0 ms; sheet and toast entrance animations and the pressed scale are removed (measured: 0 s, `none`) |
| **1.4.8 Visual Presentation (text)** | 2 | fixed | Caption, callout, label, title and num-s line-height 1.33–1.43 → 1.5. Lead and hero text 88 → 65 characters per line. No justified text. Paragraph gaps ≥ 1.5× line spacing |
| **3.1.4 Abbreviations** | 2 | fixed | Abbreviations legend (`dl`) plus `<abbr title>` for kcal, P, F, C, g, ml, pt, dp, USDA |
| **3.3.6 Error Prevention (All)** | 2 | fixed | Confirm sheet for deletion; Undo on every "added" toast |
| **3.3.9 Accessible Authentication (Enhanced)** | 2 | fixed | Sign-in without any cognitive test: magic link or passkey ([Understanding 3.3.9](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced)) |
| **2.2.3 No Timing · 2.2.4 Interruptions · 2.2.6 Timeouts** | 2 | fixed | Toasts stay until dismissed and have a ✕ Dismiss button; no timers; no session timeouts in the patterns |
| 1.2.6–1.2.9, 1.4.7 Media | 3 | AAA, not applied | No audio or video |
| 1.3.6 Identify Purpose | 3 | partial | Landmarks, autocomplete and native controls; no personalisation semantics |
| 1.4.6 on secondary and non-critical text | 3 | pass except 1 | Every secondary pair is ≥ 7:1 except the **pressed** toast action (4.79:1, AA pass; see Open issues) |
| 1.4.8 colours and width parts | 3 | pass | Users can override colours: forced-colours and more-contrast modes are supported; text width ≤ 65 characters |
| 1.4.9 Images of Text (No Exception) | 3 | pass | Logotype only |
| 2.1.3 Keyboard (No Exception) | 3 | pass | Everything works by keyboard |
| 2.2.5 Re-authenticating | 3 | AAA, not applied | The docs page has no session. App guidance: keep diary drafts after re-sign-in |
| 2.3.2 Three Flashes | 3 | pass | No flashing |
| 2.4.8 Location | 3 | AAA, not applied | Single page: the nav doesn't mark the current section while scrolling (would need scroll-spy JS) |
| 2.4.9 Link Purpose (Link Only) · 2.4.10 Section Headings | 3 | pass | Nav links are self-describing; every section has a heading |
| 2.5.6 Concurrent Input Mechanisms | 3 | pass | No input-method restrictions |
| 3.1.3 Unusual Words | 3 | partial | The abbreviations legend covers the domain terms; there's no full glossary |
| 3.1.5 Reading Level | 3 | AAA, not applied | UI copy is plain (short sentences), but the design-system documentation itself is technical by nature |
| 3.1.6 Pronunciation | 3 | AAA, not applied | No words whose meaning depends on pronunciation |
| 3.2.5 Change on Request · 3.3.5 Help | 3 | pass | Nothing changes without a user action; every field has helper text |

### Text contrast: before → after (critical text needs 7:1)

| Pair | Before | After | Threshold | Status |
|---|---|---|---|---|
| `text-secondary` on canvas / card / sunken / apricot | 6.13 / 6.44 / 5.62 / 5.33 | **9.26 / 9.73 / 8.50 / 8.07** | 7:1 | pass |
| `text-accent` on canvas / card / apricot | 6.35 / 6.67 / 5.53 | **8.89 / 9.34 / 7.74** | 7:1 | pass |
| White on primary CTA (`bg-accent`) | 5.04 | **7.21** | 7:1 | pass |
| White on pressed CTA | 6.83 | **9.56** | 7:1 | pass |
| White on error toast / destructive pressed (`chili-600`) | 6.54 | **7.16** | 7:1 | pass |
| Warning text ("kcal over goal", "Check portion") on card / tint | 4.89 / 4.54 | **8.62 / 8.01** | 7:1 | pass |
| Fat label on fat tile | 4.90 | **7.14** | 7:1 | pass |
| Carbs label on carbs tile | 6.30 | **7.15** | 7:1 | pass |
| Protein label on protein tile | 8.00 | 8.00 | 7:1 | pass |
| Success text ("High confidence") on tint | 6.37 | **7.23** | 4.5 (pushed to 7) | pass |
| Fresh text ("Fits your dinner") on tint | 6.57 | **7.16** | 4.5 (pushed to 7) | pass |
| Disabled text on canvas / disabled fill | 2.33 / 1.87 | **5.70 / 4.58** | exempt, target 4.5 | pass |
| `text-primary` on every surface | 10.45–15.38 | unchanged | 7:1 | pass |

The full generated table (67 pairs, including every state and focus ring) is at the end of this README.

### Changed tokens (v1.1 → v1.2)

| Token | Before | After | Why |
|---|---|---|---|
| `color.primitive.persimmon.700` → `bg.accent` | `#A23614` (and `bg.accent` pointed at 600 `#C4431A`) | **`#9B3515`** | White CTA text 5.04 → 7.21 (AAA). Same hue, lower lightness |
| `bg.accent-pressed` | persimmon-700 | **persimmon-800 `#7C2A10`** | White 9.56 |
| `text.accent` | persimmon-700 `#A23614` | **persimmon-800 `#7C2A10`** | ≥ 7.7 on all light surfaces |
| `text.secondary` | oat-600 `#6B5A4A` | **oat-700 `#4E4034`** | ≥ 8.07 everywhere |
| `text.disabled` | oat-400 `#B3A18A` | **new oat-550 `#705F49`** | Legible (4.6–5.7:1) but clearly lighter than secondary; disabled segments are also struck through |
| `status.warning-text` (new) | – (text used honey-700 `#9A6400`) | **new honey-800 `#674300`** | 8.0+ ; `status.warning` stays for icons and the over-goal ring |
| `macro.fat-text` · `macro.carbs-text` | mustard-700 · blueberry-700 | **new mustard-800 `#674B08` · blueberry-800 `#2B4E8B`** | 7.1+ on their tiles |
| `status.success-text` · `text.fresh` | basil-700 · avocado-700 | **new basil-800 `#215A38` · avocado-800 `#36551C`** | Pushed to 7.2 |
| `color.primitive.chili.600` | `#B3261E` | **`#A8241C`** | White 7.16 on error fills |
| `macro.kcal` (new) | – | persimmon-600 `#C4431A` | The calorie ring keeps the bright brand persimmon (graphic, 4.1:1 vs track) |
| `type.caption/callout/label/title/overline/num-s` line-height | 1.23–1.43 | **1.5** | 1.4.8 |
| `border-width.focus-gap`, `size.col-min`, `size.tab-label-max` | from v1.1 | unchanged | – |
| Modes (`$extensions.com.ripe.modes`) | – | `prefers-contrast: more` (secondary → rye, borders → hazelnut or rye, 2 px borders, 3 px focus) · `prefers-reduced-motion: reduce` (durations 0 ms) | Emitted as media queries by `build_tokens.py` |

Brand deviations are documented in [01-branding/BRAND.md](../01-branding/BRAND.md#accessibility-adjustments-v12).

### Open issues

- **Pressed toast action:** 4.79:1 (persimmon-300 on the pressed dark fill). It passes AA and isn't in the critical list; it's shown only while the finger is down. Raising it would need a lighter pressed fill that weakens the pressed cue. Tier 3, AAA not applied.
- **axe "incomplete" (9 nodes, needs review, not violations):**
  - 7 × `color-contrast`: text over the SVG calorie ring and over the pressed-tab pill (a pseudo-element). axe can't compute those backgrounds. The pairs are verified by the custom scan (it composites the real background stack) and by `contrast.py`.
  - 2 × `aria-valid-attr-value`: `aria-controls` on the two dialog openers, combined with `aria-haspopup`. axe says it is "unable to determine if aria-controls referenced ID exists" while the popup is closed. Both IDs exist in the DOM (`#portion-sheet`, `#confirm-delete`), and with the dialog open, axe reports nothing incomplete for this rule.
- **Forced colours:** checked in Chromium's emulation (`forced-colors: active`) only. It still needs a pass in real Windows High Contrast.
- **2.4.8 Location (AAA)** isn't applied: it would need scroll-spy JavaScript on a single documentation page.

---

## Icon & size compliance

Checked on 30 Sep 2026 against current official documentation, not from memory. Apple's HIG pages were read through their JSON endpoints. Material 3 values come from Google's Material 3 token source (Jetpack Compose `material3/tokens`), which the m3.material.io spec tables are generated from.

| Element | Our size | Requirement | Source | Status |
|---|---|---|---|---|
| Hit region, iOS | ≥ 44 × 44 pt for every control (icon buttons, ± buttons, chips via an extended hit area, segments via track padding, tabs) | Default control size 44×44 pt (28×28 minimum). "A button needs a hit region of at least 44x44 pt" | [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) · [HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) | **fixed**: stepper ± buttons were 41 pt (inside a 1.5 px border) and segments were 36 pt. Now 44, measured on 118 controls |
| Touch target, Android | ≥ 48 × 48 dp via `data-platform="android"` | "48dp × 48dp is the recommended minimum … touch target size" | [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility/apps) | **fixed**: Android variant added and measured |
| UI icon size and grid | 24 px glyph on a 24 grid, 2 px stroke; 16 / 20 / 32 for badges, meta and empty states | M3 icon size 24 dp; Apple: "use a consistent size, level of detail, stroke thickness" | [M3 AppBarTokens `IconSize` 24dp](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarTokens.kt) · [HIG Icons](https://developer.apple.com/design/human-interface-guidelines/icons) | ok |
| Tab bar icons | 24 px in a 44 pt / 48 dp tab; active tab = tinted **fill** + bold label | M3 nav item icon 24 dp, active indicator 56×32 dp. HIG: "Prefer filled symbols or icons" in tab bars; custom icon dimensions are in Apple Design Resources (no number in the HIG text) | [M3 NavigationBarVerticalItemTokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarVerticalItemTokens.kt) · [HIG Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) | **fixed**: filled active state added |
| Tab bar height | iOS 49 pt + 34 pt home indicator · Android 64 dp | M3 navigation bar `ContainerHeight` 64 dp (80 dp tall variant) | [M3 NavigationBarTokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarTokens.kt) | **fixed**: Android 64 dp added. The iOS height has no HIG number; 49 + safe area matches the system bar |
| Tab labels | caption 12, capped at 14 px at large text sizes | Bar items don't grow with Dynamic Type; iOS offers the Large Content Viewer | [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | **fixed**: labels no longer overflow tabs at 200% |
| Top app bar | 56 pt with 24 icons in 44 pt buttons · Android 64 dp with 48 dp buttons | M3 small top app bar `ContainerHeight` 64 dp, icon 24 dp | [M3 AppBarSmallTokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarSmallTokens.kt) | **fixed**: Android 64 dp added |
| Body text | 16 (1 rem) | iOS default 17 pt · M3 body large 16 sp | [HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography) · [M3 TypeScaleTokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt) | ok |
| Minimum text | caption 12 | iOS minimum 11 pt · M3 body small 12 sp (label small 11 sp) | same as above | ok |
| Text scaling | every size in rem; tested at **200%** with no clipping | "enlarge text by at least 200 percent" (Dynamic Type) | [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | **fixed**: fields, recipe cards, tiles, segments, ring and tab bar reflow at 200% |
| iOS app icon | `ripe-app-icon-1024.png`: 1024×1024, square, **RGB PNG with no alpha channel** (plus the SVG source) | 1024×1024 px square layers; "provide square layers so the system can apply rounded corners"; background layer "full-bleed and opaque". App Store Connect rejects icons with transparency | [HIG App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons) · [Apple Developer Forums: "contains transparency"](https://developer.apple.com/forums/thread/123146) | **fixed**: opaque PNG exported, colour type 2 verified |
| Google Play icon | `ripe-play-icon-512.png`: 512×512, RGB PNG (no alpha), 15 KB, full square | 512×512 px, 32-bit PNG, sRGB, ≤ 1024 KB, full square (Play applies 30% rounding) | [Play icon specs](https://developer.android.com/distribute/google-play/resources/icon-design-specifications) | **fixed**: exported |
| Android adaptive icon | Foreground and background layers of 108 dp; logo (plate + fruit) ≈ 60 dp inside the 66 dp safe zone | "Size all layers to 108x108 dp"; logo "at least 48x48 dp. It must not exceed 66x66 dp" | [Adaptive icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive) | **fixed**: the logo was 39 dp. Scaled to 60 dp, and the camera-frame corners were removed from this layer because they would cross the 66 dp circle |

## Focus ring: why this solution

WCAG 2.2 has three criteria about focus rings:
- **2.4.7 Focus Visible** (AA): the focused control must be visible.
- **1.4.11 Non-text Contrast** (AA): the indicator needs ≥ 3:1 against the colours next to it.
- **2.4.13 Focus Appearance** (AAA, used as a quality target): the ring should be at least as thick as a 2 px perimeter and contrast ≥ 3:1 between the focused and unfocused states.

(2.4.11 in WCAG 2.2 is *Focus Not Obscured*. We meet it because nothing covers a focused control.)

| Where | Ring | Why |
|---|---|---|
| Standalone controls (buttons, chips, icon buttons) | 2 px Rye crust `outline` with a **2 px `outline-offset`** gap | The gap shows the background, so the ring is visibly separate from the control. Rye is 14.6:1 on the canvas and 15.4:1 on cards. Against the darker v1.2 Persimmon button itself it is only 2.2:1, but the 2 px canvas gap always separates them, and 2.4.13 compares the ring with the unfocused pixels (the canvas) |
| **Segmented control** | `box-shadow: 0 0 0 2px surface, 0 0 0 4px rye`: a 2 px light gap, then a 2 px ring, outside the segment | A plain outline hugged the segment with no gap, and inside the tight track it would overlap neighbours. The double ring gives a **guaranteed light gap** even on the sunken track, and its 4 px fits exactly inside the 4 px track padding and the 8 px gap between segments. Measured: inside the track, never overlapping, **4 px clearance** to each neighbour on iOS and Android. Contrast: ring vs track 13.4:1, ring vs gap 15.4:1 |
| Tabs, list rows, stepper, toast actions | **Inset** 2 px ring (`inset box-shadow` or a negative `outline-offset`) | These sit edge-to-edge in a bar, list or toast, so an outer ring would leave the parent (hard rule 2). The inset ring is inside by definition. Rye on a pressed tab 13.2:1; the light ring on the dark toast 14.6:1 and on the error toast 6.1:1 |
| Scan pill in the tab bar | Double ring around the pill; the pill's width is limited so the ring fits the tab | Measured inside the tab |

---

## Validation report

Run everything with `npm run check`. It needs `node_modules` (`npm install`) and Python 3 for the token scripts. Last run: **61 / 61 passed.** Full detail is in [qa/report.json](qa/report.json).

| Check | Tool | Result |
|---|---|---|
| Paths | `check.mjs` reads the `<link>`s | `./tokens.css` → `./components.css` → `./docs.css`, all relative, all present. Font stacks have ≥ 3 offline fallbacks |
| `tokens.json` | `check.mjs` (JSON parse + W3C DTCG rules) | Valid JSON; 197 tokens, all with `$value` and a known `$type`; values match their type; every `{reference}` resolves; **no cycles**; 117 tokens have `$description` (optional in the spec) |
| No drift | `python3 tools/build_tokens.py --check` | `tokens.css` is byte-identical to a fresh build |
| CSS references | `check.mjs` | 0 broken `var(--…)`; `components.css` uses no primitives, no hex and no px |
| CSS lint | **stylelint 17 + stylelint-config-standard** | **0 errors, 0 warnings** in 3 files. The only config change is `selector-class-pattern`, which allows BEM `block__element--modifier`. Specificity-order issues were fixed by reordering, not by disabling rules |
| HTML | **html-validate** (`html-validate:recommended`) | **0 errors, 0 warnings** in both `index.html` and `index.standalone.html`. The only config change: `no-inline-style` allows the data-only custom properties `--w --c --r --s --is` (bar widths, swatch colours, tile radii). All layout styling lives in CSS |
| CSS actually loads | Playwright, `file://` **and** a local HTTP server | No console errors, no failed requests; `document.styleSheets` includes tokens.css, then components.css; `--color-bg-canvas` resolves to `#fbf6ee`; body and primary button computed colours match the tokens; brand fonts loaded |
| `file://` = `http://` | pixelmatch, full page | **0 different pixels** (1440 × 28,910; animations frozen for the comparison) |
| Clipping | `check.mjs` (every element with `overflow ≠ visible`, plus content wider than its box) | **0** at 100% and **0** at 200% text |
| Nothing leaves its parent | `check.mjs` (border box + outline + focus-ring spread vs parent) | **0** at 100% and 200% |
| Touch targets | `check.mjs` (layout size + `::before/::after` hit extensions) | **200 controls, smallest side 44 px**; all Android variants ≥ 48. Docs nav links and the skip link are 44 px tall too (WCAG 2.5.5); `a11y.mjs` measures 243 targets in total |
| Accessibility | **axe-core** (`@axe-core/playwright`), whole page | **0 violations**; 57 rules pass (58 in `npm run check:a11y`, which adds `wcag22aa` and `best-practice`). 9 nodes are "incomplete" (needs review), see [Open issues](#open-issues) |
| Contrast | `tools/contrast.py` | **67 / 67** text, UI, state and focus-ring pairs pass; the 34 critical text pairs pass 7:1 (see the table below) |
| WCAG 2.2 AA + AAA critical | `npm run check:a11y` (axe, pa11y, custom contrast scan, axe AAA, keyboard, geometry, reflow, preferences) | **Tier 1: 0 / 40 pass · Tier 2: 0 / 9 pass** · 3 Tier 3 notes. See [WCAG 2.2 AA + AAA](#wcag-22-aa--aaa-for-critical-elements) |
| Standalone | Page copied **alone** into an empty temp folder | Renders with no failed requests; tokens, styles and embedded images all load; same page height as `index.html` |
| PNG export | `npm run export:png` | `design-system.png` **2880 × 57,820** = 2 × the 1440 × 28,910 page; all 4 corners are exactly Oat milk (`251,246,238`), so nothing is rounded or cropped. Checked visually at the top, middle and bottom |
| Screenshots | `check.mjs` | Every section at 100% (`qa/sections/`) plus 3× crops of each fixed area and 200% crops (`qa/crops/`). Reviewed by eye; see the changelog |

**Bottom sheet macro tiles, measured bounding boxes** (CSS px; sheet content area x = 313 → 615):

| Tile | x | width | height | padding | value baseline | label baseline |
|---|---|---|---|---|---|---|
| P · Protein | 313.00 | 95.33 | 59.98 | 8 / 12 | +48.98 | +24.00 |
| F · Fat | 416.33 | 95.33 | 59.98 | 8 / 12 | +48.98 | +24.00 |
| C · Carbs | 519.66 | 95.34 | 59.98 | 8 / 12 | +48.98 | +24.00 |

Gaps are 8.00 / 8.00. The last tile ends at 615.00, exactly the sheet margin. Numbers are `tabular-nums`. At 200% text the tiles stack into one column (302 × 99.98 each, 8 px gaps), and every tile keeps the same value offset.

**What is still open**
- **iOS tab bar height.** The HIG gives no number for iPhone tab bar height or custom tab icon size (it points to the Apple Design Resources templates). The 49 pt + safe area follows the system bar, but it isn't sourced from text.
- **Offline fonts.** The Google Fonts brand fonts need a network connection. Offline, the page falls back to the documented stacks (Georgia / system UI / Menlo). It's readable, but not the brand fonts.
- **axe "incomplete" nodes** are covered by the custom contrast scan and `contrast.py` rather than by axe itself (see [Open issues](#open-issues)).

---

## Changelog (v1.10 → v1.11): onboarding, Diary and Profile (step 18)

| Area | Before | After |
|---|---|---|
| **New components** | Listed as gaps in FLOWS.md §6 | **25 Step indicator** (`.progress`): "Step 2 of 5" text + an `aria-hidden` bar.<br><br>**26 Option card**: a native radio or checkbox in a labelled card, with a filled mark + check when selected, an inset 2 px focus ring, and a group error.<br><br>**27 Week strip**: 7 day buttons ≥ 44 with a mini ring. "Today" and "+45" as text, so never colour alone. It uses up to 16 pt of the margins when 7 × 44 don't fit, and reflows to two rows at large text |
| **Token** | – | `size.day-ring` 32 px (285 declarations) |
| **Icon** | – | `copy` (Diary "Copy to today") |
| **Settings rows** | – | `.product--nav`: a plain chevron button at the row end, its glyph on the inset line (Profile) |
| **Facts table** | Values could break mid-number when the name column was long ("1,3 / 30") | `.facts td + td` and `.facts th + th` don't wrap; the name column wraps instead. 11 and 12 render identically |
| **Docs** | Component 23 listed `.macro-line` (removed in step 15) | Corrected: `.ingredients__servings`, two-line view |

## Changelog (v1.9 → v1.10): plan audit (step 17)

| Area | Before | After |
|---|---|---|
| **Stepper** (06) | `inline-flex` with a fixed minimum value width: at 320 pt with 200 % text, "8 portions" made it 346 px wide | `max-width: 100%`; the value grows and wraps the unit under the number. The ± buttons are `flex: none`, so they're always 44 × 44 |
| **Ingredient rows** (23) | – | `.ingredients__servings`: a "Servings" row (label + stepper) with `space-3` above it. It scales the ingredient list; the summary stays per portion. Documented in c23 |
| **Ingredients header** (23) | One line: "Amount" ran off a 320 pt screen at 200 % text | Wraps, and "Amount" stays on the right edge |

## Changelog (v1.8 → v1.9): photos in search rows (step 16)

| Area | Before | After |
|---|---|---|
| **Search rows** (`.product--chips`) | Name + chips, no photo | `.product__thumb` (the Meals thumbnail: `size-thumb`, `radius-sm`, cover) · name, top-aligned. Chips under the photo (`grid-column: 1 / 3`), `space-2` below it. kcal + Add stay in column 3, centred on the row. No new tokens |

## Changelog (v1.7 → v1.8): targeted tweaks (step 15)

| Area | Before | After |
|---|---|---|
| **Search rows** (`.product--chips`) | Photo · green ✓ (`.product__check`) · name, chips under the name; kcal + Add centred on line 1 | **Only the name** on the card-inset line, chips right under it. kcal + Add span both lines, centred on the row. The divider starts on the name line. `.product__check` and `.product__verified` (the green ✓ after names in product rows) were removed, along with the audit's contrast entry for that icon. The `high` glyph stays in its functional uses: success toasts, "High confidence", the scan hint and the "done" step |
| **Compact recipe card** | 80 × 80 square image | Image column `size-recipe-thumb` (80) wide, from the top to the bottom padding (`align-items: stretch`, `min-height: 0`; the photo is absolutely positioned, `object-fit: cover`, `object-position: center`). Own radius on all four corners; the card doesn't clip |
| **Ingredient rows (view)** | Name \| amount, then "158 kcal" + chips on one line (`.macro-line`) | Two lines: name \| amount, then chips \| `.ingredient__kcal` "158 kcal". Amount and kcal share the facts value style (mono, tabular, right-aligned), so they end on one edge. Gap between the lines: `space-2`. `.macro-line` and `.macro-line__item` were removed |
| **Tokens** | – | No change: every token the ✓ used (`color.status.success`, `size.icon-s`, `size.icon-l`) is still used elsewhere |

## Changelog (v1.6 → v1.7): targeted tweaks (step 14)

| Area | Before | After |
|---|---|---|
| **Search rows** (`.product--chips`) | Verified ✓ as a 44 button (`.icon-btn--verified`) on the right, after "+" | `.product__check`: a **passive indicator** ("Verified: USDA", no hit area, no states, no tab stop) in a fixed `size-icon-l` column left of the name, centred on the name's first line. Grid: thumb · ✓ · name · end. Chips span from the name to the right margin. kcal + Add (44) sit on the right margin, centred on line 1. `.icon-btn--verified` was removed |
| **Compact recipe card** | Image left of the title block; chips, Fits and kcal in a full-width foot | Square image `size-recipe-thumb` (**80**, was 112 × auto), object-fit cover. **One** text column (`min-width: 0`), everything left-aligned: title → time → reason → P/F/C → Fits → kcal, all `space-2` apart. Padding `space-card-inset`, image → text `space-3`. The foot is gone |
| **Clickable image** | – | `.recipe-card__img--link`: pointer cursor and a pressed overlay (`color.bg.pressed`, also `.is-pressed` for touch). Used `aria-hidden`, beside a real "View recipe" button |
| **Ingredient line** (`.macro-line`) | Text macros ("P 34 g F 1 g C 0 g", coloured letters) | "158 kcal" + the **macro chips** (`.macro-tile--chip`, the same component). The chip group moves under the kcal as one row when the line is too narrow. `.macro-line__key` and the `--p/--f/--c` item rules were removed |
| **Token** | `size.recipe-thumb` 112 | 80: at 390 pt it leaves a 226 px text column, enough for the P/F/C row (200 px, 225 with 3-digit values) |

## Changelog (v1.5 → v1.6): targeted tweaks

| Area | Before | After |
|---|---|---|
| **Product rows** | One text line of macros ("P 21 · F 53 · C 21") and a small ✓ after the name | `.product--chips`: the name, kcal, Add and **Verified** (`.icon-btn--verified`, 44, focus ring inside the box) on line 1; the macro chips (`.product__macros`) on line 2 |
| **Ingredients** | A list card of their own | `.ingredients--facts` inside a `.facts` card. The rows, header, fonts and value alignment come from the **same rules** as the Nutrition Facts table (shared selectors) |
| **Compact recipe card** | Chips in the foot after Fits and kcal | The foot holds the chips → Fits → kcal, so the order is: reason → P/F/C → Fits |

## Changelog (v1.4 → v1.5): chips in one row, View recipe, compact ingredients, Method

| Area | Before | After |
|---|---|---|
| **Macro chips** | 27 tall, in the narrow text column of compact cards: P, F, C wrapped to two rows at 320 pt | 24 tall (`size-macro-chip`), `white-space: nowrap` inside a chip, and in compact cards a full-width chip row under image + text. One row at 390 and 320 pt, also with 110 g in every chip. They may wrap only at ≥ 150% text, never clipped |
| **View recipe** | A `span` styled as a button (`aria-hidden`), not focusable | A real secondary button, 12.8:1, 44 tall, named "View recipe: &lt;dish&gt;", all states |
| **Ingredient rows (view)** | Chips under every row, 12 px row padding | Compact: name left, amount + unit right on one edge, a text macro line (`.macro-line`: letter + value, letter in the macro text colour, no fills), 8 px row padding |
| **Method** | – | 24 Recipe steps: an ordered list after Ingredients, 16 / 1.5 text up to `size-measure` (≈ 75 characters), meta (clock + time, servings) above. Edit: labelled fields, Move up / down (WCAG 2.5.7), Delete + Undo, empty-step validation, empty state |
| **Fields** | – | `textarea` in `.field__control`, growing with its text (`field-sizing: content`) |

## Changelog (v1.3 → v1.4): grid, meals, dish editing

| Area | Before | After |
|---|---|---|
| **Grid** | Lists ended 8 px further right than cards (row padding 4 vs card 16); app-bar glyphs sat 2 px off the margin; the nutrition row had an extra 8 px inset | Two grid lines from tokens (`space-screen-margin`, `space-card-inset`) on both sides; glyphs (not 44 pt boxes) sit on the lines via `size-icon-inset`; text buttons align by their label. `npm run check:align`: 0 px deviations at 390 and 320 |
| **Meal rows** | An empty meal showed a "+" tile on the left **and** a "+" button on the right | A passive meal-type icon (`breakfast`, `sun`, `snack`, `dinner`) in the same 48 slot, and exactly one Add button with all states |
| **Macros in cards** | "P 42 · F 7 · C 53" as text with dots | `.macro-tile--chip`: the macro tile, inline, in the macro colours (≥ 8.5:1). Gaps from `space-inline-icon` and `space-chip-gap` |
| **Pills** | "Fits your dinner" was an interactive `.chip` (with a 44 hit extension) used as a label | A `.badge--fresh` with its leaf icon: same height, padding and centring as every badge |
| **New components** | – | 21 Date button, 22 Title row + name edit (with `.field__count`), 23 Ingredient rows (view / edit / error / delete), meal-type and edit / trash icons, `select` in fields |
| **Fields** | The input inside a 52 field was only 26 tall (the real tap target) | Inputs and selects are 44 tall inside the 52 field |
| **200% text** | Screen bodies could grow wider than the screen when one item was wide | `.screen__body` has one `minmax(0, 1fr)` column; facts tables wrap |
| **Audit tool** | `check:a11y` hung forever once the infinite skeleton shimmer existed | Waits only for finite animations; runs in ~30 s |

## Changelog (v1.2 → v1.3): building the screens

These were added while building the screens in `03-screens/` (CLAUDE.md rule: if a screen needs something, add it to the design system first).

| Added | Why |
|---|---|
| **17 Inline banner**, **18 Skeleton**, **19 Camera viewfinder**, locked chip | The design-system gaps listed in `03-screens/FLOWS.md` §6 for flows 1 and 2 |
| **20 Screen layout** (`.screen`, `.status-bar`, `.screen__body/foot/toast`, `.card`, `.row-between`, `.section-head`, `.photo`) | Screens may use only design-system classes, so the 390 × 844 frame itself is a component |
| Detected-item row, "check portion" tint, photo / icon thumbnails, compact recipe card, `.recipe-card__fit`, `.product__meta--text`, `.macro__key--p/f/c`, `.screen__foot--split` | Found while building the photo result, search, recipes and dish calculator |
| Tokens `size.shutter`, `size.plate-guide`, `size.recipe-thumb`, `motion.duration.shimmer`, `color.border.inverse` | Values the new components needed; shimmer is 0 ms in reduced-motion mode |
| 8 icons: `info`, `lock`, `flash`, `image`, `chev-r`, `signal`, `wifi`, `battery` | Banner, allergy chip, camera, lists and the status bar |
| Macro goals on the docs page: 100 / 70 / 255 g (was 110 / 68 / 250) | They now match the persona target in `03-screens/FLOWS.md` exactly (400 + 630 + 1,020 = 2,050 kcal) |
| **Toast row:** the toast takes its own space above the tab bar instead of floating over content | axe found a toast covering a control in a screen. A floating toast can hide a focused element (WCAG 2.4.11), so it now never covers anything |
| **Scrolling screen body is focusable** (`tabindex="0"`, inset focus ring) | Keyboard users can scroll a screen that has no controls in view (axe `scrollable-region-focusable`) |

## Changelog (v1.0 → v1.1)

| # | Problem (before) | Fix (after) | Verified by |
|---|---|---|---|
| 1 | **Docs page and PNG looked wrapped in a big radius**, cropping content at the corners | `html`, `body`, `.doc` and `.doc-main` explicitly have `border-radius: 0` and `overflow: visible`. Docs-only styles moved to `docs.css`. Children of flush doc cells now use concentric radii. PNG re-exported **full page at 2×** | Page-wrapper check (radius 0, overflow visible); PNG corners = background colour; top, middle and bottom inspected |
| 2 | **Icons and sizes** not checked against the platforms: stepper ± was 41 pt, segments 36 pt, no Android sizes, no opaque store icons, Android logo 39 dp | Every size checked against the current HIG and Material 3 / Android docs (table above). Adds a `data-platform="android"` scope (48 dp targets, 64 dp bars), 44 pt ± buttons, extended segment hit areas, filled active tab icons, capped tab labels, opaque 1024 and 512 PNGs, and a 60 dp adaptive logo | Touch-target audit (118 controls ≥ 44, Android ≥ 48); PNG colour type 2 (no alpha) |
| 3 | **Segmented focus** had no gap between the outline and the segment | A 2 px surface gap + 2 px rye ring, contained in the track padding and the 8 px segment gap; native radios (`fieldset` + `input[type=radio]`) so real keyboard focus works | Ring inside the track, 0 overlap, 4 px clearance; real `:focus-visible` on the radio draws the same ring; contrast 13.4:1 / 15.4:1 |
| 4 | **Product row (Greek yogurt)**: the pressed/outlined row looked uneven, with a divider step and a list clipped by `overflow: hidden` | Rows are inset 4 px in the list, have their own 16 px radius and **identical padding**, and draw states as a 2 px **inset** ring (no borders). Dividers hide next to highlighted rows. Added **selected** and **error** states | The same row cloned into 6 states: all 334 × 64 at 100% and 334 × 280 at 200%, same radius and padding, border 0 |
| 5 | **Recipe card (disabled)** cut through its text by `overflow: hidden` | No clipping and no fixed height: the image rounds its own top corners, titles wrap (`overflow-wrap: anywhere`), the footer wraps. Long titles added | No clipping at 100% or 200%; titles of 4 and 8 lines fully inside the card |
| 6 | **Tab bar pressed and focus** states extended outside the bar | Tabs are 44 pt (48 dp) with bar padding above and below, the pressed pill is inset inside the tab, the focus ring is inset, and the Scan pill sits inside the bar with its ring inside the tab | All 20 tabs: inside the bar, pill inside the tab, ring inside; top gap 2.5 pt (8 dp on Android) |
| 7 | **Bottom sheet P / F / C blocks** used ad-hoc badges with uneven widths | A new `.macro-tiles` component: a grid of three equal columns, identical padding, **subgrid rows** so labels and values share baselines, tabular numbers. It stacks at large text | Measured table above: equal widths (±0.01), equal gaps (8/8), identical baselines, inside the sheet margins |

Also found and fixed during verification: search inputs had a 26 px hit area (now 44); at 200% text, field placeholders, tab labels, "P · Protein" in the nutrition summary, and the "portion" segment overflowed (now they wrap or stack).

---

## Accessibility summary

- **Contrast:** every critical text pair meets **7:1 (AAA)**, every other text pair 4.5:1, and UI components, graphics and focus rings 3:1 (see the table below and [WCAG 2.2 AA + AAA](#wcag-22-aa--aaa-for-critical-elements)).
- **Touch targets:** at least 44×44 pt (48×48 dp on Android), measured on every control.
- **Colour is never the only signal:**
  - Macros always carry the letter P / F / C and a value.
  - Confidence is always an icon and a word.
  - Selection adds a check icon.
- **Colour blindness:** protein, fat and carbs stay distinguishable under protanopia, deuteranopia and tritanopia (Machado 2009, ΔE ≥ 29).
- **Text size:** everything is rem-based and verified at 200% with no clipping.

### Contrast check (AA, and AAA for critical text)

<!-- contrast:start -->
**67 of 67 pairs pass** (34 critical text pairs at 7:1 (AAA), 11 other text pairs at 4.5:1, 22 UI pairs at 3:1). Generated by `python3 tools/contrast.py`.

| Foreground | Background | Ratio | Needs | Result | Used for |
|---|---|---|---|---|---|
| `text.primary` `#2B2118` | `bg.canvas` `#FBF6EE` | 14.64:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Body text on the app background |
| `text.primary` `#2B2118` | `bg.surface` `#FFFCF6` | 15.38:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Text on cards and sheets |
| `text.primary` `#2B2118` | `bg.sunken` `#F4ECDF` | 13.43:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Stepper values, search text |
| `text.primary` `#2B2118` | `bg.accent-subtle` `#FCE3CC` | 12.75:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Secondary buttons, selected chips |
| `text.primary` `#2B2118` | `bg.accent-subtle-pressed` `#F9C9A6` | 10.45:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Secondary button, pressed |
| `text.primary` `#2B2118` | `bg.highlight` `#F2B63D` | 8.65:1 | Text ≥ 4.5 | ✅ Pass · AAA | 'Not sure' marker number |
| `text.primary` `#2B2118` | `bg.disabled` `#E9DDCB` | 11.75:1 | Text ≥ 4.5 | ✅ Pass · AAA | Text on disabled fills (e.g. chip labels) |
| `text.secondary` `#4E4034` | `bg.canvas` `#FBF6EE` | 9.26:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Meta text, units |
| `text.secondary` `#4E4034` | `bg.surface` `#FFFCF6` | 9.73:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Meta text on cards |
| `text.secondary` `#4E4034` | `bg.sunken` `#F4ECDF` | 8.50:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Placeholder, segmented labels |
| `text.secondary` `#4E4034` | `bg.accent-subtle` `#FCE3CC` | 8.07:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Captions on apricot tiles |
| `text.accent` `#7C2A10` | `bg.canvas` `#FBF6EE` | 8.89:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Links, ghost buttons, active tab |
| `text.accent` `#7C2A10` | `bg.surface` `#FFFCF6` | 9.34:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Links on cards, active tab |
| `text.accent` `#7C2A10` | `bg.accent-subtle` `#FCE3CC` | 7.74:1 | Text ≥ 4.5 | ✅ Pass · AAA | 'New' badge, empty-state icon |
| `text.on-accent` `#FFFFFF` | `bg.accent` `#9B3515` | 7.21:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Primary button label |
| `text.on-accent` `#FFFFFF` | `bg.accent-pressed` `#7C2A10` | 9.56:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Primary button, pressed |
| `text.on-accent` `#FFFFFF` | `status.error` `#A8241C` | 7.16:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Error toast, destructive pressed |
| `text.fresh` `#36551C` | `bg.fresh-subtle` `#E6EFD9` | 7.16:1 | Text ≥ 4.5 | ✅ Pass · AAA | 'Fits your day' tag |
| `text.inverse` `#FBF6EE` | `bg.inverse` `#2B2118` | 14.64:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Toast message |
| `text.inverse-accent` `#F4A06B` | `bg.inverse` `#2B2118` | 7.56:1 | Text ≥ 4.5 | ✅ Pass · AAA | Toast action ('Undo') |
| `text.inverse-accent` `#F4A06B` | `bg.inverse-pressed` `#4E4034` | 4.79:1 | Text ≥ 4.5 | ✅ Pass | Toast action, pressed |
| `text.inverse-success` `#A9C47F` | `bg.inverse` `#2B2118` | 8.17:1 | UI ≥ 3.0 | ✅ Pass | Success icon in toast |
| `text.inverse-warning` `#F2B63D` | `bg.inverse` `#2B2118` | 8.65:1 | UI ≥ 3.0 | ✅ Pass | Warning icon in toast |
| `status.success-text` `#215A38` | `bg.surface` `#FFFCF6` | 7.94:1 | Text ≥ 4.5 | ✅ Pass · AAA | 'High confidence' label |
| `status.success-text` `#215A38` | `status.success-subtle` `#EAF4EE` | 7.23:1 | Text ≥ 4.5 | ✅ Pass · AAA | 'Verified' badge |
| `status.warning-text` `#674300` | `bg.surface` `#FFFCF6` | 8.62:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | 'Check portion', over goal |
| `status.warning-text` `#674300` | `bg.canvas` `#FBF6EE` | 8.20:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Over-goal text on background |
| `status.warning-text` `#674300` | `status.warning-subtle` `#FDF3DF` | 8.01:1 | Text ≥ 4.5 | ✅ Pass · AAA | 'Not sure' row |
| `status.error-text` `#8E1E18` | `bg.surface` `#FFFCF6` | 8.73:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Field error message |
| `status.error-text` `#8E1E18` | `status.error-subtle` `#FCECEA` | 7.80:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Destructive button label |
| `macro.protein-text` `#7C2550` | `macro.protein-subtle` `#F8E9F0` | 8.00:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | P badge |
| `macro.fat-text` `#674B08` | `macro.fat-subtle` `#F8F0DA` | 7.14:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | F badge |
| `macro.carbs-text` `#2B4E8B` | `macro.carbs-subtle` `#EAF0FA` | 7.15:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | C badge |
| `macro.protein` `#9B2F63` | `bg.surface` `#FFFCF6` | 6.88:1 | UI ≥ 3.0 | ✅ Pass | Protein bar and key |
| `macro.fat` `#A77A0B` | `bg.surface` `#FFFCF6` | 3.78:1 | UI ≥ 3.0 | ✅ Pass | Fat bar and key |
| `macro.carbs` `#3B6CC0` | `bg.surface` `#FFFCF6` | 5.01:1 | UI ≥ 3.0 | ✅ Pass | Carbs bar and key |
| `bg.accent` `#9B3515` | `bg.surface` `#FFFCF6` | 7.04:1 | UI ≥ 3.0 | ✅ Pass | Calorie ring value, scan button |
| `status.warning` `#9A6400` | `bg.surface` `#FFFCF6` | 4.89:1 | UI ≥ 3.0 | ✅ Pass | Calorie ring when over goal |
| `border.strong` `#8C7A66` | `bg.surface` `#FFFCF6` | 4.03:1 | UI ≥ 3.0 | ✅ Pass | Text-field border |
| `border.strong` `#8C7A66` | `bg.canvas` `#FBF6EE` | 3.83:1 | UI ≥ 3.0 | ✅ Pass | Stepper border on background |
| `border.accent` `#C4431A` | `bg.surface` `#FFFCF6` | 4.92:1 | UI ≥ 3.0 | ✅ Pass | Focused / selected border |
| `border.error` `#A8241C` | `bg.surface` `#FFFCF6` | 6.99:1 | UI ≥ 3.0 | ✅ Pass | Error border |
| `border.focus` `#2B2118` | `bg.canvas` `#FBF6EE` | 14.64:1 | UI ≥ 3.0 | ✅ Pass | Keyboard focus ring |
| `status.success` `#2E7D4F` | `bg.surface` `#FFFCF6` | 4.93:1 | UI ≥ 3.0 | ✅ Pass | Confidence icon (high) |
| `text.primary` `#2B2118` | `status.error-subtle` `#FCECEA` | 13.74:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Product row: error state, name |
| `status.error-text` `#8E1E18` | `status.error-subtle` `#FCECEA` | 7.80:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Product row: error message |
| `text.secondary` `#4E4034` | `bg.accent-subtle` `#FCE3CC` | 8.07:1 | Text ≥ 4.5 | ✅ Pass · AAA | Product row: selected, meta text |
| `text.secondary` `#4E4034` | `status.error-subtle` `#FCECEA` | 8.70:1 | Text ≥ 4.5 | ✅ Pass · AAA | Product row: error, 'per 100 g' |
| `text.secondary` `#4E4034` | `bg.pressed over bg.surface` `#EEEBE5` | 8.38:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Pressed row / tab / segment, meta text |
| `text.primary` `#2B2118` | `bg.pressed over bg.surface` `#EEEBE5` | 13.24:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Pressed row / tab, main text |
| `text.primary` `#2B2118` | `bg.accent-subtle-pressed` `#F9C9A6` | 10.45:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Secondary button, pressed |
| `text.primary` `#2B2118` | `macro.protein-subtle` `#F8E9F0` | 13.43:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Macro tile / chip value (P) |
| `text.primary` `#2B2118` | `macro.fat-subtle` `#F8F0DA` | 13.85:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Macro tile / chip value (F) |
| `text.primary` `#2B2118` | `macro.carbs-subtle` `#EAF0FA` | 13.76:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Macro tile / chip value (C) |
| `text.secondary` `#4E4034` | `macro.protein-subtle` `#F8E9F0` | 8.50:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Macro tile / chip unit (P) |
| `text.secondary` `#4E4034` | `macro.fat-subtle` `#F8F0DA` | 8.77:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Macro tile / chip unit (F) |
| `text.secondary` `#4E4034` | `macro.carbs-subtle` `#EAF0FA` | 8.71:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Macro tile / chip unit (C) |
| `border.accent` `#C4431A` | `bg.accent-subtle` `#FCE3CC` | 4.08:1 | UI ≥ 3.0 | ✅ Pass | Product row / chip: selected ring |
| `border.error` `#A8241C` | `status.error-subtle` `#FCECEA` | 6.25:1 | UI ≥ 3.0 | ✅ Pass | Product row: error ring |
| `border.focus` `#2B2118` | `bg.canvas` `#FBF6EE` | 14.64:1 | UI ≥ 3.0 | ✅ Pass | Focus ring on the app background |
| `border.focus` `#2B2118` | `bg.surface` `#FFFCF6` | 15.38:1 | UI ≥ 3.0 | ✅ Pass | Focus ring on cards and bars (tab, row) |
| `border.focus` `#2B2118` | `bg.sunken` `#F4ECDF` | 13.43:1 | UI ≥ 3.0 | ✅ Pass | Segmented focus ring against the track |
| `border.focus` `#2B2118` | `bg.canvas` `#FBF6EE` | 14.64:1 | UI ≥ 3.0 | ✅ Pass | Focus ring around a primary button: the ring sits on the 2 px canvas gap, not on the fill |
| `text.on-accent` `#FFFFFF` | `bg.accent` `#9B3515` | 7.21:1 | Critical text ≥ 7.0 | ✅ Pass · AAA | Primary CTA label (AAA 7:1) |
| `border.focus` `#2B2118` | `bg.pressed over bg.surface` `#EEEBE5` | 13.24:1 | UI ≥ 3.0 | ✅ Pass | Focus ring on a pressed tab |
| `text.inverse` `#FBF6EE` | `bg.inverse` `#2B2118` | 14.64:1 | UI ≥ 3.0 | ✅ Pass | Toast action focus ring (dark toast) |
| `text.inverse` `#FBF6EE` | `status.error` `#A8241C` | 6.65:1 | UI ≥ 3.0 | ✅ Pass | Toast action focus ring (error toast) |
| `text.disabled` `#705F49` | `bg.canvas` `#FBF6EE` | 5.70:1 | n/a | ➖ Exempt | Disabled text: exempt under WCAG 1.4.3 |
| `text.disabled` `#705F49` | `bg.disabled` `#E9DDCB` | 4.58:1 | n/a | ➖ Exempt | Disabled button / chip label: exempt under WCAG 1.4.3 |
| `text.disabled` `#705F49` | `bg.surface` `#FFFCF6` | 5.99:1 | n/a | ➖ Exempt | Disabled row text: exempt under WCAG 1.4.3 |
| `border.default` `#E9DDCB` | `bg.canvas` `#FBF6EE` | 1.25:1 | n/a | ➖ Exempt | Decorative card outline, not needed to identify a control |
<!-- contrast:end -->
