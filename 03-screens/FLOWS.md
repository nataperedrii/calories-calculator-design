# Ripe: user flows and screens

This is the plan for `03-screens/`: which screens exist, why, what they show, and every state they can be in. The screens use only the [design system](../02-design-system/README.md) (tokens and components). Missing pieces are listed in [section 6](#6-design-system-gaps-to-add-before-building) and are added to the design system first.

**Built (steps 10–18):** all 16 screens, as 46 HTML files with their key states, exported to PNG, plus the [flows board](flows.html) ([flows.png](flows.png)). See [section 8](#8-built-screens-and-exports).
- **Flows 1 and 2 (07–14):** built in steps 10–17.
- **Onboarding (01–06), Diary (15) and Profile (16):** built in step 18, with flows 0 and 3 end to end.

The audit of this plan against the project is in [PLAN-AUDIT.md](../PLAN-AUDIT.md).

- **Brand:** [01-branding/BRAND.md](../01-branding/BRAND.md): photo first, honest estimates, food not guilt, two taps to log.
- **Research:** [process/research.md](../process/research.md): five insights. The numbers in brackets below, such as (insight 3), point to them.
- **Frame:** 390×844 pt (iPhone 14/15). Tab bar: **Today · Diary · Scan · Recipes · Profile**.

---

## 1. Two user stories

| # | User story | Answered by |
|---|---|---|
| **1** | *As a user, I want to know the calories in a dish or product.* | Three ways in, all ending in the same "log a portion" step:<br>- **Photo** of a plate (flow 1A).<br>- **Search or barcode** for a product (flow 1B).<br>- **Dish calculator** for home cooking: raw ingredients plus the cooked weight (flow 1C, insight 1). |
| **2** | *As a user, I want to find recipes that suit my needs.* | A **Recipes** tab, ranked by what fits the calories and protein I have left, filtered by my diet and allergies (flow 2, insight 3). |

### What "suits me" means

"Suits me" needs personal data, so onboarding asks for it once. The user can edit it any time in Profile.

| Data | Asked on | How it's used for recipes |
|---|---|---|
| Allergies | Onboarding screen 5 | **Hard filter.** A recipe with any of the user's allergens is never shown. A line says how many were hidden and why |
| Diet type | Onboarding screen 4 | **Hard filter.** For example, pescatarian hides meat and poultry |
| Dislikes | Onboarding screen 5 | **Soft.** Recipes with disliked foods drop to the end of the list |
| Daily kcal target, macros | Onboarding screens 2, 3, 6 | **Ranking.** In this order:<br>1. It must fit the kcal left for this meal.<br>2. It should cover the protein still needed today.<br>3. Fewer kcal first, which leaves room for a snack.<br>4. Shorter cooking time. |

### Persona used in all examples

**Sam**, 34. Cooks at home on weekdays and photographs lunch at work.

| Field | Value |
|---|---|
| Goal | Maintain |
| Body | 165 cm · 63 kg · sex for the formula: female · moderately active (3–5 workouts a week) |
| Diet | Pescatarian |
| Allergies | Peanuts |
| Dislikes | Mushrooms |
| Daily target | **2,050 kcal** · P 100 g · F 70 g · C 255 g |

The day used in the examples (Thursday) is shown below. All values are from USDA FoodData Central; see [section 5](#5-sample-data-usda-per-100-g).

| Meal | Foods | kcal |
|---|---|---|
| Breakfast 08:10 | Greek yogurt 2% 200 g · rolled oats 40 g · blueberries 80 g | 344 |
| Lunch 13:10 | From a photo: salmon 140 g · white rice 150 g · broccoli 90 g · olive oil 5 g | 559 |
| Snack 16:30 | Apple 180 g · almonds 30 g | 268 |
| **Eaten by 18:30** | | **1,171 of 2,050 → 879 kcal left for dinner** |

---

## 2. Screen list (16 screens)

| # | Screen | Group | Tab | Main job |
|---|---|---|---|---|
| 01 | Welcome & sign-in | Onboarding | – | Say what Ripe does; sign in with no password |
| 02 | Your goal | Onboarding | – | Lose slowly · Maintain · Gain · Just track |
| 03 | About you | Onboarding | – | Body data for the calorie formula |
| 04 | Diet type | Onboarding | – | A hard filter for recipes |
| 05 | Allergies & dislikes | Onboarding | – | A hard filter (allergies) and a soft one (dislikes) |
| 06 | Your daily target | Onboarding | – | Show the kcal and macro target, explain it, let the user adjust it |
| 07 | Today | Story 1 + 2 | Today | Day progress, meals, a recipe that fits the next meal |
| 08 | Scan | Story 1 | Scan | Camera for a meal photo or a barcode |
| 09 | Photo result | Story 1 | Scan | Check the detected foods and portions, then add to a meal |
| 10 | Add food | Story 1 | – | Search with recents first; the entry to the dish calculator |
| 11 | Food detail & portion | Story 1 | – | Per-100 g facts and the source; choose a portion |
| 12 | Dish calculator | Story 1 | – | Home-cooked dish: raw ingredients + cooked weight → per 100 g and per portion |
| 13 | Recipes | Story 2 | Recipes | Recipes that fit what's left today, with my diet and allergies |
| 14 | Recipe detail | Story 2 | Recipes | Ingredients, nutrition per portion, allergens; log a portion |
| 15 | Diary | Support | Diary | Past days and their meals |
| 16 | Profile & preferences | Support | Profile | Edit goal, body, diet, allergies and target; units; delete account |

**Overlays** (states, not separate screens):
- **Portion sheet:** the DS bottom sheet with macro tiles, used by screens 09, 11, 12 and 14.
- **Toast:** "Added to Lunch · Undo".
- **Delete-account confirm:** the DS confirm sheet.
- **Camera prompt:** the system camera permission prompt.

---

## 3. Flows

Arrows are taps. Numbers are screens.

### Flow 0: Onboarding (first launch, about 60 s)

```
01 Welcome ─ "Get started" ─▶ 02 Goal ─▶ 03 About you ─▶ 04 Diet ─▶ 05 Allergies ─▶ 06 Daily target ─ "Start tracking" ─▶ 07 Today (empty)
                                            │                ╰─ "Skip" (No preference) ╰─ "Skip" (None)
                                            ╰─ goal "Just track" ─▶ skips 03, 06 shows "No target" ─▶ 07
```

- A **step indicator** ("Step 2 of 5") on screens 02–06. A Back button on each.
- **Nothing is required except the goal.** Diet and allergies can be skipped, and Profile says they're empty.
- At the end, Today opens in its **empty** state, with "Snap your first meal" pointing at the Scan tab.

### Flow 1A: Calories from a photo (story 1, the main flow)

```
07 Today ─ Scan tab ─▶ 08 Scan (Photo) ─ shutter ─▶ 09 Photo result: analyzing (2–4 s) ─▶ 09 result
   ─ check "Not sure" item ─▶ answer "Olive oil or teriyaki glaze?" ─▶ "Add to Lunch · 559 kcal"
   ─▶ toast "Added to Lunch · Undo" ─▶ 07 Today (344 → 903 kcal, ring updates)
```

- **First time only:** 08 shows a camera purpose screen before the system prompt. If the user declines: library and search still work, and a "Open Settings" link is shown.
- **Missing item:** "+ Add missing item" opens 10 Add food, which comes back to 09.

### Flow 1B: Calories in a product (search or barcode)

```
07 Today ─ Snack "+ Add" ─▶ 10 Add food ─ type "alm" ─▶ "Almonds" ─▶ 11 Food detail (USDA)
   ─ chip "30 g · 1 handful" ─▶ 174 kcal ─ "Add to Snack" ─▶ toast ─▶ 10 (stays open for the apple, from Recents) ─ Done ─▶ 07 (1,171 kcal)

08 Scan ─ Barcode ─▶ code found ─▶ 11 Food detail ("Greek yogurt 2%, 170 g pot · 124 kcal", source: package label)
                  ╰▶ code not found ─▶ 10 Add food with "We don't know this barcode yet. Search for it instead?"
```

### Flow 1C: Calories in a home-cooked dish (dish calculator)

```
10 Add food ─ "Create a dish" ─▶ 12 Dish calculator (empty)
   ─ "+ Add ingredient" ─▶ 10 (picker mode) ─▶ 11 (enter raw grams) ─▶ back to 12  … ×6
   ─ enter "Cooked weight: 1,700 g" ─▶ result: 72 kcal per 100 g · 246 kcal per 340 g portion
   ─ "Save dish" ─▶ toast "Saved to My dishes"     or     ─ "Log a portion" ─▶ portion sheet ─▶ toast ─▶ 07
```

- **Why the cooked weight:** water evaporates (or is absorbed), so the raw total can't give a per-100 g value (insight 1). Ripe asks for it at the end and explains why in one line.
- **Saved dishes** appear in 10 under "My dishes" and log in two taps next time.

### Flow 2: Find a recipe that suits me (story 2)

```
07 Today ─ card "Fits your dinner: Baked cod, potatoes & broccoli · 462 kcal" ─────────┐
07 Today ─ Recipes tab ─▶ 13 Recipes (Dinner · ≤ 879 kcal · Pescatarian · Peanut-free) ┤
                                                                                       ▼
                                   14 Dish detail ─ "Log 1 portion · 462 kcal"
                                   ─▶ portion sheet (Dinner, 1 portion) ─ Add ─▶ toast ─▶ 07 Today (1,633 of 2,050)
```

- **Filters on 13 come from the profile** and are shown as chips the user can remove. Allergies are **locked chips** with a lock icon and the word "Allergy"; they can only be changed in Profile.
- **Too strict:** when no recipe matches, the empty state suggests removing the softest filter first ("≤ 30 min").

### Flow 3: Change preferences

```
16 Profile ─ "Allergies" ─▶ 05 (edit mode) ─ add "Shellfish" ─ Save ─▶ 16 ─ Recipes tab ─▶ 13
   (Shrimp stir-fry now hidden: "2 recipes hidden: peanuts, shellfish")
```

- Changing the goal or body data recalculates the target on 06 (edit mode). The user sees the old and new numbers before saving.

---

## 4. Screen catalogue

Every screen lists:
- its **purpose**, where you **come from**, and where you **go**;
- the **key content**, with real copy and numbers;
- the **design-system parts** it uses, with new parts marked **(new)**, from section 6;
- its **states**: default, empty, loading and error. When a state can't happen, the table says why instead of "n/a".

### 01 Welcome & sign-in
- **Purpose:** explain Ripe in one line and sign the user in without a password.
- **From:** first launch, or sign-out. **To:** 02, or 07 for a returning user.
- **Key content:**
  - The logo and the real dish photo (salmon, rice, broccoli).
  - Headline **"Point, snap, know."** Sub: "Calories from a photo. Check them, tap once, back to your meal."
  - Buttons: **"Continue with a passkey"** (primary) and **"Email me a sign-in link"** (secondary). An email field appears for the link.
  - Small print: "By continuing you agree to the Terms and Privacy Policy. Not medical advice."
- **DS:** `.btn--primary`, `.btn--secondary`, `.field` (email, `autocomplete="email"`), the sign-in pattern from the docs page.

| State | What the user sees |
|---|---|
| Default | Photo, headline, two sign-in buttons |
| Empty | Not applicable: the content is fixed |
| Loading | After "Email me a link": the button shows "Sending…" and is disabled. Then: "Check your inbox. We sent a link to sam@example.com. It works for 15 minutes." with a "Resend" button and **no countdown that forces anything** |
| Error | Bad email: "Enter an email like name@example.com" under the field. Offline: inline banner **(new)** "No connection. Connect to the internet to sign in." Passkey cancelled: nothing changes, both options stay |

### 02 Your goal
- **Purpose:** choose the direction of the calorie target. Calm options, no weight-loss pressure.
- **From:** 01. **To:** 03, or 04 when the goal is "Just track".
- **Key content:**
  - Title: "What would you like Ripe to help with?"
  - Option cards **(new)**, one choice:
    - **Maintain:** "Eat well and keep your weight." Selected by default.
    - **Lose slowly:** "About 0.25 kg a week (−250 kcal a day)."
    - **Gain:** "About 0.25 kg a week (+250 kcal a day)."
    - **Just track:** "No target. Only see what you eat."
  - Note: "You can change this any time."
- **DS:** option card **(new)**, step indicator **(new)**, `.btn--primary` "Continue", `.app-bar` with Back.

| State | What the user sees |
|---|---|
| Default | Maintain preselected. "Continue" enabled |
| Empty | Not possible: Maintain is always preselected |
| Loading | Not needed: nothing is fetched, the choice is stored on the device until screen 06 |
| Error | Not possible: there is always a valid choice |

### 03 About you
- **Purpose:** collect what the calorie formula needs, and say why.
- **From:** 02. **To:** 04.
- **Key content:**
  - Fields:
    - Age: **34**
    - **Units:** Metric | Imperial (one switch for height and weight, as in Profile)
    - Height: **165 cm**
    - Weight: **63 kg**
    - Sex for the formula, as option cards: Female | Male | Prefer not to say ("We use the average of both formulas")
  - Activity, as option cards:
    - Mostly sitting ×1.2
    - Lightly active ×1.375
    - **Moderately active ×1.55**
    - Very active ×1.725
  - Why we ask: "We use these only to estimate your daily calories. They stay on your account and are never shared."
  - "Prefer not to say" uses the average of the two formulas.
- **DS:** step indicator (25), `.field` with `.field__suffix` (years, cm, kg), `.segmented` (units), option card (26) for sex and activity, `.field__help`.

| State | What the user sees |
|---|---|
| Default | Empty fields with helper text, "Continue" disabled until age, height and weight are valid |
| Empty | The default state is the empty form. Each field has a visible label and help text, never a placeholder-only label |
| Loading | Not needed: no network |
| Error | Out of range: "Enter an age between 18 and 100", "Enter a height between 120 and 230 cm", "Enter a weight between 35 and 250 kg". Under 18: "Ripe's calorie targets are for adults. You can still use Just track." (switches the goal) |

### 04 Diet type
- **Purpose:** a hard filter for recipe suggestions.
- **From:** 03. **To:** 05.
- **Key content:**
  - Option cards, one choice:
    - No preference
    - Vegetarian
    - Vegan
    - **Pescatarian** ("Fish and seafood, no meat")
    - Mediterranean
    - Lower-carb ("Under 130 g carbs a day")
  - A "Skip" text button.
- **DS:** option card **(new)**, step indicator **(new)**, `.btn--ghost` "Skip".

| State | What the user sees |
|---|---|
| Default | No preference preselected |
| Empty | Not possible: "No preference" is a valid answer |
| Loading | Not needed: a fixed list |
| Error | Not possible |

### 05 Allergies & dislikes
- **Purpose:** never suggest a recipe that could harm the user.
- **From:** 04, or 16 (edit mode). **To:** 06.
- **Key content:**
  - Multi-select chips with a check icon when selected, for the major allergens: Gluten · Milk · Egg · **Peanuts** · Tree nuts · Soy · Fish · Shellfish · Sesame · Mustard · Celery · Lupin · Sulphites · Molluscs.
  - **"Foods you'd rather skip"** field with suggestions: Mushrooms ×.
  - Safety note: "We hide recipes with these allergens. Always check product labels; we can't guarantee packaged foods are free of traces."
  - "None" and "Skip" buttons.
- **DS:** `.chip`, `.chip.is-selected`, `.chip-row`, `.field`, inline banner **(new, info)**.

| State | What the user sees |
|---|---|
| Default | No chips selected. Helper text: "Select all that apply" |
| Empty | "None" selected: "No allergies saved. You can add them later in Profile." |
| Loading | Not needed: a fixed list. Dislike suggestions are local |
| Error | A conflict with the diet: picking Fish with Pescatarian shows "Pescatarian recipes often use fish. With a fish allergy you'll see seafood-free and vegetarian recipes only." It isn't blocking |

### 06 Your daily target
- **Purpose:** show the target, explain it, and keep it safe and editable.
- **From:** 05, or 16 (edit mode). **To:** 07.
- **Key content:**
  - **2,050 kcal a day**, with macro bars: Protein 100 g · Fat 70 g · Carbs 255 g.
  - **"How we calculated this"** (expandable):
    - Resting energy (Mifflin-St Jeor) = 10 × 63 + 6.25 × 165 − 5 × 34 − 161 = **1,330 kcal**.
    - × 1.55 (moderately active) = 2,062.
    - Goal Maintain ± 0, rounded to the nearest 50 = **2,050**.
  - Macros:
    - protein 1.6 g per kg = 100 g;
    - fat about 30% = 70 g;
    - the rest is carbs = 255 g.
  - "Adjust" stepper in 50 kcal steps.
- **Safety:**
  - The stepper never goes more than 500 kcal below maintenance, and never below resting energy. For Sam the lowest target is **1,550 kcal** (2,062 − 500, rounded to 50, which is above 1,330). At the floor it says: "We don't go lower than this. Talk to a doctor or dietitian about bigger changes."
  - A footnote for pregnancy, breastfeeding or a history of eating disorders suggests "Just track".
- **DS:** `.t-num-xl`, `.macros` + `.macro` bars (`role="meter"`), `.stepper`, `.btn--primary` "Start tracking".

| State | What the user sees |
|---|---|
| Default | 2,050 kcal and the macro split |
| Empty | Goal "Just track": "No calorie target. You'll still see calories and macros for everything you log." |
| Loading | Not needed: calculated on the device instantly |
| Error | At the floor: the "−" button is disabled with the note above. Missing body data (skipped through edit mode): "Add your height and weight to get a target", linked to 03 |

### 07 Today
- **Purpose:** what I've eaten today, what's left, and what to do next.
- **From:** the Today tab, the end of onboarding, after logging. **To:** 08, 10, 13, 14, 11 (tap a food).
- **Key content (18:30):**
  - Large title "Today". Below it, a date button on the margin line: calendar glyph + **"Thursday · 879 kcal left"** (opens a date picker).
  - Calorie ring: **1,171 of 2,050 kcal · 879 left**.
  - Macros: P 70 / 100 g · F 45 / 70 g · C 127 / 255 g.
  - Meals. A logged meal shows its dish photo and total. An empty meal shows a passive meal-type icon (sun, apple, moon, cup) in the same slot and **one** "+" button on the right ("Add dinner"):
    - Breakfast 344
    - Lunch 559 ("From a photo · 4 items")
    - Snack 268
    - Dinner "–" with "+ Add"
  - Recipe card: **"Fits your dinner: Baked cod, potatoes & broccoli · 462 kcal · 30 min"**, with macro chips P 41 · F 12 · C 49 g and a real **"View recipe"** button (named "View recipe: Baked cod, potatoes & broccoli"; Enter, Space or tap opens 14). Tapping the **dish photo** also opens 14 (step 14). It is a pointer-only shortcut (`aria-hidden`, no tab stop), so "View recipe" stays the one keyboard and screen-reader path.
- **DS:** `.app-bar--large`, `.nutri` ring + `.macros`, `.list` / `.product` rows, `.recipe-card` + `.badge--fresh`, `.tab-bar`, `.toast`.

| State | What the user sees |
|---|---|
| Default | As above |
| Empty | First day: ring 0 of 2,050, four meals with "+ Add", an empty state "Snap your first meal. We'll find the foods and portions." with "Open camera" and "Search instead" |
| Loading | Skeleton **(new)** for the ring and the meal rows. Cached numbers show at once when there are any |
| Error | Can't sync: inline banner **(new)** "Offline. Showing what's on this phone. We'll sync when you're back." Logging still works offline |
| Over target | The ring shows the over part in Turmeric, with "90 kcal over". **No red, no warning icon** (insight 5) |

### 08 Scan
- **Purpose:** the fastest way to log: photo a plate or scan a barcode.
- **From:** the Scan tab, or "+ Add" → "Take photo". **To:** 09 (photo), 11 (barcode found), 10 (barcode unknown, or search).
- **Key content:**
  - Full-screen camera with a plate outline.
  - Mode switch **Photo | Barcode**.
  - Tips: "Whole plate in frame · Good light · Shoot from above, about 45°".
  - Live hints: "Too dark", "Move closer".
  - Shutter, flash, library, Close.
- **DS:** viewfinder overlay **(new)**, `.segmented` (on a dark surface), `.icon-btn`, `.btn--primary` (the shutter is a 72 pt icon button).

| State | What the user sees |
|---|---|
| Default | Live camera with tips |
| First run (no permission yet) | A purpose screen before the system prompt: "Ripe uses the camera to photograph your meal so it can estimate calories. You can also choose a photo or search instead." Buttons "Allow camera" and "Not now" |
| Denied | Empty state: "Camera is off for Ripe." Buttons "Open Settings", "Choose from library", "Search instead" |
| Empty | Not applicable: the camera always shows a picture. In Barcode mode with no code in view, a hint: "Point at the barcode" |
| Loading | The camera is starting: a dark frame with "Starting camera…" for under a second |
| Error | Camera unavailable: "Camera isn't available right now", with "Choose from library". Too dark at capture: the hint "Too dark. Try near a window or turn on the flash" before the photo is sent |

### 09 Photo result
- **Purpose:** check what Ripe found, fix it, and add it. **Nothing is saved until the user confirms** (brand principle 2).
- **From:** 08. **To:** 07 (after Add), 10 (add a missing item or search instead).
- **Key content:**
  - Photo with numbered markers.
  - Rows, each with a weight stepper, kcal and a confidence label:
    1. **Salmon, cooked** 140 g · 288 kcal · *High*.
    2. **White rice** 150 g · 195 kcal · *Check portion*.
    3. **Broccoli, boiled** 90 g · 32 kcal · *High*.
    4. **Olive oil** 5 g · 44 kcal · *Not sure*: "Is it olive oil or teriyaki glaze?" Choices: Olive oil · Teriyaki glaze · Search instead.
  - Totals: **559 kcal · P 37 · F 23 · C 49 g**.
  - Meal picker suggests **Lunch** (13:10). "+ Add missing item".
  - Primary button: **"Add to Lunch · 559 kcal"**.
  - Footer: "Photo estimates can be off by 10–20%. Check portions. Not medical advice."
- **DS:** `.marker`, `.marker--unsure`, `.product` rows, `.stepper`, `.confidence--high` / `--check` / `--unsure`, `.macro-tiles`, meal button (`.btn--secondary`), `.btn--primary`, `.toast--success`.

| State | What the user sees |
|---|---|
| Default | As above |
| Loading (analyzing) | The photo with a shimmer **(new: skeleton)** and plain steps: "Finding foods… Estimating portions…". A Cancel button. **No fake percentage.** Usually 2–4 s |
| Partly recognised | "1 item not recognised" row with "Search" to add it by hand |
| Empty (nothing found) | Empty error state: "We couldn't spot any food in this photo." Buttons "Retake" and "Search instead" |
| Error (offline) | Inline banner **(new)**: "No connection. Your photo is saved and we'll analyse it when you're back online." The user can still log from Recents |
| Error (input) | Weight 0 or over 5,000 g: "Enter a weight between 1 and 5,000 g" under the stepper |
| After Add | Toast "Added to Lunch · 559 kcal" with **Undo** (stays until dismissed, no timer) |

### 10 Add food
- **Purpose:** find any food fast. Recents and favourites first, so logging takes two taps (insight 4).
- **From:** "+ Add" on a meal (07), 09 (missing item), 12 (ingredient picker), barcode not found (08). **To:** 11, 12.
- **Key content:**
  - Search field "Search foods and dishes" with a barcode icon.
  - Tabs: Recents · Favourites · My dishes.
  - **Recents:** Apple 52 kcal / 100 g · Almonds 579 / 100 g · Greek yogurt 73 / 100 g (short names, step 14).
  - Results show one canonical entry per food (step 16):
    - A matching product photo (the Meals thumbnail, 48 × 48) with the name beside it, top-aligned and wrapping. No ✓.
    - The P / F / C chips sit under the photo, from the card-inset line (insight 2). The USDA source is named on the food detail (11).
    - kcal per 100 g and the "+" (44, "Add &lt;food&gt;") sit on the right margin, centred on the whole row.
    - Short names: "Roasted almonds", "Greek yogurt", "Apple".
  - Bottom: **"Create a dish"** (opens 12).
  - In picker mode the title is "Add ingredient" and the bottom link is hidden.
- **DS:** `.search`, `.segmented` (tabs), `.list` / `.product--chips`, `.badge--verified` (on 11), `.btn--secondary`, `.empty`.

| State | What the user sees |
|---|---|
| Default | Recents list, with the keyboard closed |
| Empty (new user) | "Your recent foods will show up here." Plus "Try searching for 'banana' or 'rice'" |
| Empty (no results) | "No match for 'almnds'. Did you mean **almonds**?" Plus "Create a dish" and "Scan a barcode" |
| Loading | Results skeleton **(new)** after 300 ms of typing pause. Recents stay visible while searching |
| Error | Offline: inline banner **(new)** "Search needs a connection. Your recent foods and dishes still work." |

### 11 Food detail & portion
- **Purpose:** see the real per-100 g values and where they come from, then choose a portion.
- **From:** 10, 07 (tap a food), 08 (barcode). **To:** back to 10 or 07 after Add; back to 12 in picker mode.
- **Key content (Almonds):**
  - Nutrition facts table **per 100 g: 579 kcal · Protein 21.2 g · Fat 49.9 g · Carbs 21.6 g**.
  - Source line: "USDA FoodData Central".
  - Portion: unit segmented control **g | portion** above the quick chips **30 g · 1 handful**, **50 g**, **100 g**, then the weight stepper. "portion" shows the same 30 g as **1 portion** (1 handful). The unit set follows the food: **ml** is offered only for liquids such as milk or olive oil, so almonds show g | portion.
  - Live result for 30 g: **174 kcal · P 6.3 · F 15.0 · C 6.5 g**.
  - Meal picker (Snack, from the time). Primary button **"Add to Snack · 174 kcal"**. A favourite button (heart) in the app bar.
  - **Barcode variant:** "Greek yogurt 2%, 170 g pot · 124 kcal". Source line: "Package label", with "Report a wrong value".
- **DS:** `.facts` + `.facts__source`, `.stepper`, `.segmented`, `.chip`, `.macro-tiles`, `.btn--primary`, `.icon-btn`.

| State | What the user sees |
|---|---|
| Default | Facts table and a portion of 30 g, or the food's usual portion |
| Empty | Not possible: you only reach this screen with a food. If a value is missing in the source, the cell shows "–" with "Not in source" |
| Loading | Facts skeleton **(new)** when opened from search on a slow connection; cached foods open at once |
| Error | Weight out of range: "Enter a weight between 1 and 5,000 g". Food can't load: empty error state "Couldn't load this food" with "Try again" |

### 12 Dish calculator
- **Purpose:** calories for a home-cooked dish, where the cooked weight differs from the raw weight (insight 1).
- **From:** 10 "Create a dish", or Recipes "My dishes". **To:** 10 (pick an ingredient), portion sheet, 07.
- **Key content (Red lentil soup):**
  - Name field "Red lentil soup".
  - Ingredients by **raw weight**:
    - red lentils 250 g · 895
    - onion 150 g · 60
    - carrots 150 g · 62
    - garlic 10 g · 15
    - canned tomatoes 400 g · 64
    - olive oil 15 g · 133
    - water 1,000 g · 0
  - **Whole pot: 1,229 kcal**.
  - **Cooked weight** field: 1,700 g. Help text: "Weigh the pot when it's done and subtract the pot's own weight. Cooking changes the weight, so this makes per-100 g values right."
  - Result: **72 kcal per 100 g** · portion stepper **5 portions of 340 g → 246 kcal each · P 13 · F 4 · C 41 g**.
  - Buttons: "Save dish" (primary), "Log a portion" (secondary).
- **DS:** `.field`, `.list` / `.product` (ingredients with delete), `.stepper`, `.facts` (per 100 g), `.macro-tiles`, `.btn--primary`, `.btn--secondary`, `.empty`.

| State | What the user sees |
|---|---|
| Default | As above |
| Empty | No ingredients yet: "Add the raw ingredients you cooked with. Water counts as 0 kcal, but add it so the weight is right." Plus "+ Add ingredient" |
| Loading | Not needed: every ingredient comes from 10 / 11 with its values; the sums update instantly |
| Error | No cooked weight: the result shows the whole-pot total only, with "Add the cooked weight to see per 100 g". A cooked weight below 30% or above 300% of the raw weight: "That's a big change from 1,975 g raw. Check the number?" (it doesn't block) |

### 13 Recipes
- **Purpose:** recipes that suit me: my diet, my allergies and what's left today (story 2, insight 3).
- **From:** the Recipes tab, or "See more" on the 07 card. **To:** 14.
- **Key content:**
  - Header: **"Fits your dinner · 879 kcal left"**.
  - Filter chips:
    - Dinner ✓
    - ≤ 879 kcal ✓
    - Pescatarian ✓
    - 🔒 Peanut-free (Allergy)
    - High protein
    - ≤ 30 min
  - Cards, ranked. Each card has an 80 px wide photo on the left that runs from the top to the bottom padding (step 15) and one left-aligned text column: title → time → reason → P / F / C → "Fits" → kcal, 8 px apart (step 14):
    1. **Baked cod, potatoes & broccoli:** 462 kcal · P 41 g · 30 min · "Covers your protein" · "Fits: 462 of 879 kcal".
    2. **Shrimp & broccoli stir-fry with rice:** 532 kcal · P 46 g · 20 min · "Fits: 532 of 879 kcal · covers your protein".
    3. **Chickpea & spinach curry with rice:** 587 kcal · P 21 g · 35 min · "Fits: 587 of 879 kcal". Vegan.
  - Footer note: **"1 recipe hidden: it contains peanuts. Change allergies in Profile."** (Peanut noodle bowl with tofu.)
  - Tabs at the top: For you · Saved · My dishes.
- **DS:** `.chip` / `.chip--fresh` / `.chip.is-selected`, `.recipe-card`, `.badge--fresh`, `.segmented`, `.empty`, `.tab-bar`.

| State | What the user sees |
|---|---|
| Default | Ranked list as above |
| Empty (no match) | "No recipes fit all your filters." Plus a one-tap fix for the softest filter: "Remove '≤ 30 min' (shows 4 more)". Allergy chips are never offered for removal |
| Empty (target used up) | 0 kcal left: "You've reached today's target. Here are light options under 250 kcal, or plan tomorrow." Calm, not a warning |
| Loading | Card skeletons **(new)**: three cards with grey image and lines |
| Error | Offline: inline banner **(new)** "Recipes need a connection. Saved recipes and My dishes still work." Then the Saved list |

### 14 Dish detail
- **Purpose:** decide and log, and fix a dish that was entered wrong. The numbers per portion always add up from the ingredients.
- **From:** 13, 07 card. **To:** portion sheet → 07.
- **Key content (Baked cod, potatoes & broccoli):**
  - Photo (scrolls with the content), the title with an **Edit name** button, "30 min · Serves 2", the badge "Fits your dinner".
  - **Allergens: Fish.** Shown as words with an icon, never colour alone. "Free from peanuts, milk, gluten and egg."
  - Nutrition summary: calorie ring **462 of the 879 kcal left for dinner**, "Per 100 g 99", macro bars P 41 / F 12 / C 49 g against the daily goal.
  - **Servings stepper** (the DS weight stepper) in the Ingredients card, **1** by default, 1–8. It scales the ingredient amounts, row kcal and chips for cooking; the summary, the ring and "Log 1 portion" stay per portion. "−" is disabled at 1, "+" at 8; the change is announced. In edit mode the row hides and amounts are edited per portion.
  - Ingredients for the chosen servings: the name on the left, the amount on one right edge, in **two lines** (step 15): name | amount, then the P / F / C **macro chips** ("P 34 g", the same component as everywhere) | "158 kcal". Amount and kcal end on one right edge:
    - cod fillet 150 g
    - potatoes 200 g
    - broccoli 100 g
    - olive oil 10 g
    - garlic 5 g
  - **Method** (after Ingredients): "Total 30 min · Serves 2", then 6 numbered steps in an ordered list (see section 5). A recipe without steps shows "No steps yet" with "Add steps".
  - Primary button: **"Log 1 portion · 462 kcal"**.
- **Editing (steps 11–12):**
  - **Edit** turns every row into labelled fields: Ingredient (with suggestions from the food list), Amount, Unit (g / ml / portion), plus Delete. "+ Add ingredient" adds a row.
  - The ring, kcal, per-100 g value, macro bars, allergens and the Log button **recalculate as you type**, announced via `role="status"`.
  - **Delete** moves focus to the next row and shows an Undo toast (no timer).
  - **Save / Cancel** in the footer. Saving shows "Saving…" (disabled, `aria-busy`). Changes are saved as *your version* of the recipe.
  - **Back or Cancel with unsaved changes** asks "Discard changes?" with "Keep editing" first.
  - **Dish name:** a pencil next to the title opens an inline field with a visible label and a live count (max 60). Errors: "Enter a name, for example …" and "Use 60 characters or fewer. It's 73 now."
  - **Steps:** each step becomes a labelled field ("Step 2") with Move up / Move down (no dragging needed, WCAG 2.5.7) and Delete (Undo toast). Focus stays on the moved step. An empty step blocks Save with "Write what to do in this step, or delete it."
  - Units: ml uses each food's density (olive oil 0.91 g/ml); "portion" uses a standard portion (olive oil 1 tbsp = 13.5 g).
- **DS:** `.app-bar`, `.photo`, `.title-row`, `.name-edit`, `.nutri`, `.macros`, `.stepper` + `.ingredients__servings`, `.ingredients` / `.ingredient` (view and edit), `.macro-tile--chip`, `.field` + `.field__count`, `.banner`, `.btn--primary`, `.screen__foot--split`, `.toast`, `.sheet-dialog`, `.sheet`.

| State | What the user sees |
|---|---|
| Default | As above |
| Empty | Not possible: you only reach this screen with a recipe. A recipe with no nutrition data is never listed. If every ingredient is deleted while editing, the list says "No ingredients yet" and the totals are 0 |
| Loading | Photo and text skeleton **(new)**. The title and kcal from the card show at once |
| Error | Can't load: empty error state "Couldn't load this recipe" with "Try again" and "Back to recipes". Editing: an unknown food or an amount outside 1–5,000 marks the row (`aria-invalid`) with a hint; Save moves focus to the first problem |
| Servings | 2 portions: cod 300 g, potatoes 400 g, broccoli 200 g, olive oil 20 g, garlic 10 g; the summary still says 462 kcal per portion |
| Editing | Edit · Edited (totals updated) · Deleted (Undo) · Discard changes? · Saving… · Name error · Method · Edit steps · Step error · Step deleted (Undo) · No steps. Each state has its own export |
| After log | Portion sheet (Dinner · 1 portion · 462 kcal), then the toast "Added to Dinner · Undo". Today shows **1,633 of 2,050** |

### 15 Diary
- **Purpose:** look back. See any day's meals and totals, and copy a meal.
- **From:** the Diary tab. **To:** 11 (tap a food), 07 (today).
- **Key content:**
  - Week strip **(new)**: Mon–Sun, each day with a small ring.
  - Example week (day totals: sums of logged meals, asserted in the generator):
    - Mon 1,703 (breakfast 344 + salmon lunch 559 + snack 268 + shrimp stir-fry 532)
    - Tue 2,095, Turmeric "45 over" (… + baked cod, 2 portions, 924)
    - Wed 1,661 (… chickpea curry 587 for lunch + baked cod 462)
    - **Thu 1,171 (today)**
  - Tapping a day shows its meals, like 07 but read-only, with "Copy to today" on each meal.
- **DS:** date / week strip **(new)**, `.nutri` (small), `.list` / `.product`, `.app-bar`, `.btn--ghost`.

| State | What the user sees |
|---|---|
| Default | This week, today selected |
| Empty | A day with nothing logged: "Nothing logged on Sunday." with "Add food". Days before sign-up are disabled |
| Loading | Skeleton **(new)** while older weeks load |
| Error | Offline: inline banner **(new)** "Showing the last 30 days saved on this phone." |

### 16 Profile & preferences
- **Purpose:** keep "suits me" correct, and give the user control over their data.
- **From:** the Profile tab. **To:** 02, 03, 04, 05, 06 (edit mode), the delete confirm.
- **Key content:**
  - Daily target **2,050 kcal** (edit).
  - Goal Maintain · Body 165 cm, 63 kg · Diet Pescatarian · Allergies Peanuts · Dislikes Mushrooms.
  - Units Metric | Imperial.
  - Account: sam@example.com · Sign out · **Delete account** (opens the DS confirm sheet: "This deletes your diary, recipes and photos from Ripe. You have 30 days to change your mind").
- **DS:** `.list` rows with chevrons, `.segmented`, `.btn--destructive`, `.sheet-dialog` + `.sheet__confirm`, `.toast`.

| State | What the user sees |
|---|---|
| Default | As above |
| Empty | Skipped fields show "Not set" with "Add". For example, Allergies: "Not set. Add allergies to hide unsafe recipes" |
| Loading | Saving an edit: the row shows "Saving…" and then the toast "Saved". Recipes refresh next time they open |
| Error | Save failed: toast "Couldn't save. Check your connection and try again", and the old value stays |

---

## 5. Sample data (USDA, per 100 g)

All values are per 100 g from **USDA FoodData Central** (SR Legacy). Portions are grams × value / 100. Totals are sums of the rounded item kcal, exactly as the screens show them.

USDA kcal use food-specific energy factors, so they can differ a little from P × 4 + F × 9 + C × 4. This happens especially for nuts and high-fibre foods such as almonds. We always show the USDA kcal.

| Food | kcal | Protein | Fat | Carbs |
|---|---|---|---|---|
| Greek yogurt, plain, 2% | 73 | 9.95 | 1.92 | 3.94 |
| Rolled oats, dry | 379 | 13.15 | 6.52 | 67.7 |
| Blueberries, raw | 57 | 0.74 | 0.33 | 14.49 |
| Salmon, Atlantic, cooked | 206 | 22.1 | 12.35 | 0 |
| White rice, cooked | 130 | 2.69 | 0.28 | 28.17 |
| Broccoli, boiled | 35 | 2.38 | 0.41 | 7.18 |
| Olive oil | 884 | 0 | 100 | 0 |
| Apple, raw, with skin | 52 | 0.26 | 0.17 | 13.81 |
| Almonds | 579 | 21.15 | 49.93 | 21.55 |
| Cod, Atlantic, cooked | 105 | 22.83 | 0.86 | 0 |
| Potatoes, boiled in skin | 87 | 1.87 | 0.10 | 20.13 |
| Green peas, boiled | 84 | 5.36 | 0.22 | 15.63 |
| Shrimp, cooked | 99 | 23.98 | 0.28 | 0.20 |
| Soy sauce | 53 | 8.14 | 0.57 | 4.93 |
| Canola oil | 884 | 0 | 100 | 0 |
| Chickpeas, boiled | 164 | 8.86 | 2.59 | 27.42 |
| Spinach, raw | 23 | 2.86 | 0.39 | 3.63 |
| Tomatoes, canned | 16 | 0.79 | 0.28 | 3.47 |
| Onion, raw | 40 | 1.10 | 0.10 | 9.34 |
| Carrots, raw | 41 | 0.93 | 0.24 | 9.58 |
| Garlic, raw | 149 | 6.36 | 0.50 | 33.06 |
| Red lentils, raw | 358 | 23.91 | 2.17 | 63.1 |
| Rice noodles, cooked | 108 | 1.79 | 0.20 | 24.01 |
| Tofu, firm | 144 | 17.27 | 8.72 | 2.78 |
| Peanut butter | 588 | 25.09 | 50.39 | 19.56 |
| Cucumber, raw | 15 | 0.65 | 0.11 | 3.63 |

### The day (screen 07)

| Meal | Items (g → kcal) | kcal | P | F | C |
|---|---|---|---|---|---|
| Breakfast | yogurt 200 → 146 · oats 40 → 152 · blueberries 80 → 46 | **344** | 25.8 | 6.7 | 46.6 |
| Lunch | salmon 140 → 288 · rice 150 → 195 · broccoli 90 → 32 · olive oil 5 → 44 | **559** | 37.1 | 23.1 | 48.7 |
| Snack | apple 180 → 94 · almonds 30 → 174 | **268** | 6.8 | 15.3 | 31.3 |
| **Total** | | **1,171** | **69.7** | **45.1** | **126.6** |
| Target | | 2,050 | 100 | 70 | 255 |
| **Left** | | **879** | **30** | **25** | **128** |

After the cod dinner (462): **1,633 of 2,050**, 417 left. Protein 110 of 100 g, shown as "10 over" in Turmeric.

### Recipes (screen 13, 1 portion each)

| Recipe | Ingredients (g → kcal) | kcal | P | F | C | Allergens |
|---|---|---|---|---|---|---|
| Baked cod, potatoes & broccoli | cod 150 → 158 · potatoes 200 → 174 · broccoli 100 → 35 · olive oil 10 → 88 · garlic 5 → 7 | **462** | 40.7 | 11.9 | 49.1 | Fish |
| Shrimp & broccoli stir-fry with rice | shrimp 150 → 149 · broccoli 150 → 53 · rice 180 → 234 · canola oil 10 → 88 · soy sauce 15 → 8 | **532** | 45.6 | 11.6 | 62.5 | Shellfish, soy, gluten (soy sauce) |
| Chickpea & spinach curry with rice | chickpeas 150 → 246 · spinach 60 → 14 · tomatoes 150 → 24 · onion 50 → 20 · olive oil 10 → 88 · rice 150 → 195 | **587** | 20.8 | 15.0 | 95.4 | None of the major 14 |
| *Hidden:* Peanut noodle bowl with tofu | rice noodles 200 → 216 · tofu 120 → 173 · peanut butter 30 → 176 · cucumber 80 → 12 · soy sauce 15 → 8 | 585 | 33.6 | 26.2 | 60.9 | **Peanuts**, soy, gluten |

### Method: steps for every recipe

Every recipe has a `steps` field: an ordered list of plain strings (in `tools/build_screens.py`, `STEPS`). Times and temperatures are food-safe: fish to 63 °C in the thickest part, shrimp until pink and opaque, rice and chickpeas served hot.

**Baked cod, potatoes & broccoli** (Total 30 min · Serves 2):
1. Heat the oven to 200 °C (180 °C fan). Scrub the potatoes and boil them in their skins in salted water for 15–20 minutes, until a knife slides in easily. Drain.
2. Put the potatoes on a lined baking tray and press each one with the bottom of a glass until the skin cracks open. Brush them with half the olive oil.
3. Pat the cod dry, season it with a pinch of salt and pepper and lay it next to the potatoes. Bake for 12–15 minutes, until the fish is opaque and flakes easily, or 63 °C in the thickest part.
4. While the fish bakes, boil the broccoli florets for 3–4 minutes until just tender, then drain well.
5. Warm the rest of the olive oil in a small pan over low heat. Add the sliced garlic and cook for 1–2 minutes until pale golden; take it off the heat before it browns.
6. Plate the cod, potatoes and broccoli, spoon the garlic oil over the top and serve straight away.

**Shrimp & broccoli stir-fry with rice**: 5 steps. **Chickpea & spinach curry with rice**: 4 steps. **Red lentil soup** (dish calculator): 4 steps.

### Dish calculator (screen 12): Red lentil soup

| Ingredient (raw) | g | kcal | P | F | C |
|---|---|---|---|---|---|
| Red lentils | 250 | 895 | 59.8 | 5.4 | 157.8 |
| Onion | 150 | 60 | 1.6 | 0.1 | 14.0 |
| Carrots | 150 | 62 | 1.4 | 0.4 | 14.4 |
| Garlic | 10 | 15 | 0.6 | 0.1 | 3.3 |
| Canned tomatoes | 400 | 64 | 3.2 | 1.1 | 13.9 |
| Olive oil | 15 | 133 | 0 | 15.0 | 0 |
| Water | 1,000 | 0 | 0 | 0 | 0 |
| **Whole pot** (raw 1,975 g) | | **1,229** | 66.6 | 22.1 | 203.3 |
| **Per 100 g** (cooked weight 1,700 g) | | **72** | 3.9 | 1.3 | 12.0 |
| **Per portion** (340 g, 5 portions) | | **246** | 13.3 | 4.4 | 40.7 |

### Target (screen 06)

| Step | Value |
|---|---|
| Resting energy (Mifflin-St Jeor): 10 × 63 kg + 6.25 × 165 cm − 5 × 34 y − 161 | 1,330 kcal |
| × 1.55 (moderately active) | 2,062 kcal |
| Goal Maintain (± 0), rounded to 50 | **2,050 kcal** |
| Protein 1.6 g/kg × 63 kg ≈ 100 g × 4 | 400 kcal |
| Fat 70 g × 9 (31%) | 630 kcal |
| Carbs, the rest: 255 g × 4 | 1,020 kcal |
| Check: 400 + 630 + 1,020 | **2,050 kcal** |

---

## 6. Design-system gaps to add before building

These are missing from [02-design-system](../02-design-system/index.html). Per the project rules, they are added to `tokens.json` → `tokens.css`, `components.css` and the docs page (with all states and the `npm run check` / `check:a11y` checks) **before** any screen uses them.

| New component | Used on | States to design |
|---|---|---|
| **Step indicator** (onboarding progress) | 02–06 | current · done · upcoming. Text "Step 2 of 5" is always shown, not dots alone |
| **Option card** (radio or checkbox card with title + description) | 02, 03, 04 | default · pressed · selected · focus · disabled. Native radio or checkbox inside |
| **Inline banner** (info / offline) | 01, 05, 07, 09, 10, 13, 15 | info · offline. With an icon and text, an optional action, no auto-hide |
| **Skeleton** (loading placeholder) | 07, 09, 10, 11, 13, 14, 15 | A static block. A shimmer only when motion is allowed (`prefers-reduced-motion` → static) |
| **Camera viewfinder overlay** (plate outline, tips, shutter row) | 08 | live · hint (too dark / move closer) · barcode mode |
| **Week strip** (dates with mini rings) | 15 | default · today · selected · empty day · disabled (before sign-up) · over |
| **Locked filter chip** (allergy) | 13 | locked: a lock icon + "Allergy" label, not removable. A variant of `.chip` |

Everything else uses the existing 16 components.

**Status (step 10, checked again in the plan audit):** inline banner (17), skeleton (18), camera viewfinder (19) and the locked chip (variant of 04) are now in the design system, plus the screen layout (20) and a few variants found while building: the detected-item row and "check portion" tint (07), photo and icon thumbnails (07), the compact recipe card (08), and macro keys for tables (09). **Step 18:** the step indicator (25), option card (26) and week strip (27) are in the design system too, so every gap in this section is closed.

---

## 7. Accessibility in the flows

The design system already meets WCAG 2.2 AA and AAA for critical elements. These rules keep the screens that way:

- **Nothing on a timer:**
  - Toasts stay until dismissed and always have Undo or Dismiss.
  - Sign-in links say how long they last but never force a countdown.
  - Photo analysis has Cancel.
- **Undo instead of "Are you sure?"** for logging (it's reversible). A real confirm only for destructive actions (delete account, delete a saved dish).
- **Never colour alone:**
  - Confidence is an icon + a word.
  - "Over" is a number + the word "over".
  - Allergens are words.
  - Locked chips have a lock icon + "Allergy".
  - Macros always carry P / F / C.
- **Labels, not placeholders:** every field has a visible label and help text that explains the valid range before an error happens.
- **Focus order:**
  - Matches reading order.
  - Sheets are modal and return focus to the button that opened them.
  - The camera screen has a keyboard and VoiceOver path to Library and Search, not only the shutter.
- **Targets:** at least 44 × 44 pt (48 dp on Android), including the stepper buttons, chips and the week strip.
- **Calm language:** no "bad", "cheat" or "warning" for food choices. The over-target colour is Turmeric, never error red.

### Per flow

| Flow | Focus order and keyboard | No time limits | Never colour alone | Targets | Undo vs confirm |
|---|---|---|---|---|---|
| **0 Onboarding** | Back → title → options (native radios / checkboxes in option cards) → Continue; the step indicator is text ("Step 2 of 5") | Sign-in link lasts 15 minutes but no countdown forces anything | Selected option cards have a check and the native control state; allergy chips have a check icon | Option cards, chips and the target stepper ≥ 44 | Nothing to undo; every choice is editable later in Profile |
| **1A Photo** | Camera: Close → mode → tips → Library → Shutter → Search (keyboard and VoiceOver reach Library and Search, not only the shutter); result: rows in marker order | Analysis has Cancel and no fake percentage; the toast stays until dismissed | Confidence is an icon + a word (High / Check portion / Not sure); markers carry numbers | Steppers, choices, the meal button ≥ 44 | Adding is reversible: toast with **Undo**, no confirm |
| **1B Product** | Search → results (each row: name, then its "Add &lt;food&gt;" button) → Create a dish; food detail: unit switch → quick chips → stepper → meal → Add | Search waits for a typing pause, never a timeout | Macros always carry P / F / C and "g"; the source is named in words | "+" 44 × 44 with a focus ring and a gap; chips and stepper ≥ 44 | Toast with Undo |
| **1C Dish** | Name → ingredients → cooked weight (visible label + help) → portions stepper → Save / Log | None | Per-100 g and per-portion values are labelled in words | Delete, stepper, buttons ≥ 44 | Delete an ingredient: Undo toast; deleting a saved dish uses a real confirm |
| **2 Recipes** | Filter chips (allergy chips locked, not focusable as toggles) → cards in rank order → "View recipe"; detail: Edit → servings stepper → ingredients → Method → Log | Toasts and sheets have no timer | Locked chips: lock icon + "Allergy"; allergens in words; "over" is a number + the word | Chips, "View recipe", servings stepper, Move up / down ≥ 44 | Log: Undo toast; leaving with unsaved edits: "Discard changes?" with "Keep editing" first |
| **3 Preferences** | Profile rows in reading order → edit screen → Save returns focus to the row | Saving shows "Saving…", no timeout | "Not set" is text, not a grey style alone | Rows ≥ 44 | Delete account: the DS confirm sheet (destructive, 30 days to change your mind) |

---

## 8. Built screens and exports

Generated by [`tools/build_screens.py`](tools/build_screens.py) from the USDA values in section 5, so every number on screen adds up (the generator asserts the key totals). Exported with [`tools/export.mjs`](tools/export.mjs) at 390 × 844, `deviceScaleFactor: 2`. Checked by [`tools/check.mjs`](tools/check.mjs) (`npm run check:screens`).

| Screen | State | HTML | PNG (780 × 1688) |
|---|---|---|---|
| 07 Today | 13:09, breakfast logged | [07-today-before-lunch.html](screens/07-today-before-lunch.html) | [png](exports/07-today-before-lunch.png) |
| 08 Scan | Live camera, plate found | [08-scan.html](screens/08-scan.html) | [png](exports/08-scan.png) |
| 09 Photo result | Loading (analyzing) | [09-photo-result-analyzing.html](screens/09-photo-result-analyzing.html) | [png](exports/09-photo-result-analyzing.png) |
| 09 Photo result | Default: 4 foods, 559 kcal | [09-photo-result.html](screens/09-photo-result.html) | [png](exports/09-photo-result.png) |
| 07 Today | Lunch added, toast with Undo | [07-today-lunch-added.html](screens/07-today-lunch-added.html) | [png](exports/07-today-lunch-added.png) |
| 10 Add food | Search "alm" + recents | [10-add-food.html](screens/10-add-food.html) | [png](exports/10-add-food.png) |
| 11 Food detail & portion | Almonds, 30 g = 174 kcal | [11-food-detail.html](screens/11-food-detail.html) | [png](exports/11-food-detail.png) |
| 12 Dish calculator | Red lentil soup | [12-dish-calculator.html](screens/12-dish-calculator.html) | [png](exports/12-dish-calculator.png) |
| 07 Today | 18:30, 879 kcal left, recipe card | [07-today.html](screens/07-today.html) | [png](exports/07-today.png) |
| 13 Recipes | Fits your dinner | [13-recipes.html](screens/13-recipes.html) | [png](exports/13-recipes.png) |
| 14 Dish detail | Baked cod, potatoes & broccoli (view) | [14-recipe-detail.html](screens/14-recipe-detail.html) | [png](exports/14-recipe-detail.png) |
| 14 Dish detail | Edit ingredients | [14-recipe-detail-edit.html](screens/14-recipe-detail-edit.html) | [png](exports/14-recipe-detail-edit.png) |
| 14 Dish detail | Edited: potatoes 200 → 150 g, totals 462 → 419 | [14-recipe-detail-edited.html](screens/14-recipe-detail-edited.html) | [png](exports/14-recipe-detail-edited.png) |
| 14 Dish detail | Garlic deleted, Undo toast | [14-recipe-detail-deleted.html](screens/14-recipe-detail-deleted.html) | [png](exports/14-recipe-detail-deleted.png) |
| 14 Dish detail | Back with changes: "Discard changes?" | [14-recipe-detail-discard.html](screens/14-recipe-detail-discard.html) | [png](exports/14-recipe-detail-discard.png) |
| 14 Dish detail | Saving… | [14-recipe-detail-saving.html](screens/14-recipe-detail-saving.html) | [png](exports/14-recipe-detail-saving.png) |
| 14 Dish detail | Dish name: validation error | [14-recipe-detail-name-error.html](screens/14-recipe-detail-name-error.html) | [png](exports/14-recipe-detail-name-error.png) |
| 14 Dish detail | Method: 6 steps | [14-recipe-detail-method.html](screens/14-recipe-detail-method.html) | [png](exports/14-recipe-detail-method.png) |
| 14 Dish detail | Edit steps (move up / down, delete) | [14-recipe-detail-steps-edit.html](screens/14-recipe-detail-steps-edit.html) | [png](exports/14-recipe-detail-steps-edit.png) |
| 14 Dish detail | Empty step: validation error | [14-recipe-detail-step-error.html](screens/14-recipe-detail-step-error.html) | [png](exports/14-recipe-detail-step-error.png) |
| 14 Dish detail | Step deleted, Undo toast | [14-recipe-detail-step-deleted.html](screens/14-recipe-detail-step-deleted.html) | [png](exports/14-recipe-detail-step-deleted.png) |
| 14 Dish detail | No steps: empty state | [14-recipe-detail-no-steps.html](screens/14-recipe-detail-no-steps.html) | [png](exports/14-recipe-detail-no-steps.png) |
| 07 Today | Scrolled to the dish card (View recipe) | [07-today-card.html](screens/07-today-card.html) | [png](exports/07-today-card.png) |
| 14 Dish detail | Servings 2: the ingredient list scales, the summary stays per portion | [14-recipe-detail-servings.html](screens/14-recipe-detail-servings.html) | [png](exports/14-recipe-detail-servings.png) |
| 14 Recipe detail | Log sheet (Dinner, 1 portion) | [14-recipe-detail-log.html](screens/14-recipe-detail-log.html) | [png](exports/14-recipe-detail-log.png) |
| 07 Today | Dinner added: 1,633 kcal, protein 10 g over | [07-today-dinner-added.html](screens/07-today-dinner-added.html) | [png](exports/07-today-dinner-added.png) |
| 01 Welcome | Passkey or email link | [01-welcome.html](screens/01-welcome.html) | [png](exports/01-welcome.png) |
| 01 Welcome | Check your inbox (link sent) | [01-welcome-link.html](screens/01-welcome-link.html) | [png](exports/01-welcome-link.png) |
| 02 Your goal | Step 1 of 5, Maintain preselected | [02-goal.html](screens/02-goal.html) | [png](exports/02-goal.png) |
| 03 About you | Step 2 of 5, Sam's data | [03-about-you.html](screens/03-about-you.html) | [png](exports/03-about-you.png) |
| 03 About you | Height out of range, Continue disabled | [03-about-you-error.html](screens/03-about-you-error.html) | [png](exports/03-about-you-error.png) |
| 04 Diet | Step 3 of 5, Pescatarian | [04-diet.html](screens/04-diet.html) | [png](exports/04-diet.png) |
| 05 Allergies | Step 4 of 5, Peanuts · skip Mushrooms | [05-allergies.html](screens/05-allergies.html) | [png](exports/05-allergies.png) |
| 05 Allergies | Edit from Profile: + Shellfish | [05-allergies-edit.html](screens/05-allergies-edit.html) | [png](exports/05-allergies-edit.png) |
| 06 Daily target | Step 5 of 5: 2,050 kcal, the maths | [06-target.html](screens/06-target.html) | [png](exports/06-target.png) |
| 06 Daily target | At the floor: 1,550 kcal | [06-target-floor.html](screens/06-target-floor.html) | [png](exports/06-target-floor.png) |
| 07 Today | First day: 0 of 2,050, Snap your first meal | [07-today-empty.html](screens/07-today-empty.html) | [png](exports/07-today-empty.png) |
| 13 Recipes | After a shellfish allergy: 2 recipes hidden | [13-recipes-filtered.html](screens/13-recipes-filtered.html) | [png](exports/13-recipes-filtered.png) |
| 15 Diary | Thursday (today) | [15-diary.html](screens/15-diary.html) | [png](exports/15-diary.png) |
| 15 Diary | Monday · Tuesday (45 over) · Wednesday | [15-diary-mon.html](screens/15-diary-mon.html) · [tue](screens/15-diary-tue.html) · [wed](screens/15-diary-wed.html) | [png](exports/15-diary-mon.png) · [tue](exports/15-diary-tue.png) · [wed](exports/15-diary-wed.png) |
| 16 Profile | Your plan, units, account | [16-profile.html](screens/16-profile.html) | [png](exports/16-profile.png) |
| 16 Profile | Allergies saved (toast) | [16-profile-updated.html](screens/16-profile-updated.html) | [png](exports/16-profile-updated.png) |
| 16 Profile | Delete account: confirm sheet | [16-profile-delete.html](screens/16-profile-delete.html) | [png](exports/16-profile-delete.png) |

**Decisions made while building:**
- **Meal picker:** a button ("Lunch ▾"), not a segmented control. Four meals don't fit one row at 390 pt, and a wrapped segmented control reads as two groups.
- **Toast placement:** the toast takes its own row above the tab bar instead of floating over the list. It never covers content or a focused control (WCAG 2.4.11).
- **Analyzing state:** keeps the photo visible behind a small status card, so the user sees what is being analysed.
- **Allergens on recipe detail:** sit above the per-portion numbers, so they're always above the fold.
- **Search results:** two extra rows use USDA values: "Roasted almonds" (USDA "Almonds, dry roasted", 598 kcal · P 20.96 · F 52.54 · C 21.01 per 100 g) and "Almond butter" (614 kcal · P 20.96 · F 55.5 · C 18.82). Each row has its own product photo (step 16, credits in [CREDITS.md](../01-branding/assets/CREDITS.md)).
- **Recipe photos:** the cod recipe now matches its photo exactly: Pixabay's baked cod with potatoes and broccoli, so the recipe uses broccoli instead of peas (step 11). The shrimp and curry photos are close matches from Unsplash. Credits are in [CREDITS.md](../01-branding/assets/CREDITS.md).
- **Onboarding (step 18):**
  - **Units:** one Units switch (Metric | Imperial) instead of a unit control per field, the same switch as in Profile.
  - **Sex for the formula:** option cards instead of a 3-way segmented control, because "Prefer not to say" needs its one-line explanation and doesn't fit a segment at 320 pt.
  - **Skip:** a text button in the app bar.
  - **Link-sent state:** leads with "Check your inbox" (no hero photo), so the message is above the fold.
- **Diary (step 18):**
  - **Example totals:** the example week now uses totals computed from logged meals (1,703 / 2,095 / 1,661) instead of the earlier spec example (1,985 / 2,140 / 1,920), which no combination of the USDA meals produces.
  - **Copy to today:** a 44 pt button with a new `copy` icon on each past meal.
- **Profile (step 18):** settings rows are product rows with a plain chevron button (`.product--nav`). Saving allergies shows a toast, and the Recipes tab opens the re-filtered list.
- **Prototype links:** every screen links to the next one through `data-href` and real links. The full clickable prototype (`index.html`) is a later step.

**Spec vs build.** The catalogue (section 4) is the spec. The built exports show one state per file. These spec details aren't in any built export (checked in the plan audit, [PLAN-AUDIT.md](../PLAN-AUDIT.md)):

| Screen | In the spec, not in the built exports | Why |
|---|---|---|
| 10 Add food | The default state (empty search, tabs Recents · Favourites · My dishes) | The export is the search state "alm" with Recents below |
| 12 Dish calculator | The name field and a delete button per ingredient | The export is the result view: the name is the title, ingredients are a facts table |
| 13 Recipes | Tabs For you · Saved · My dishes | Not built |
| 07–16 | Loading and offline states (skeleton, banner); 08 camera states; 10, 13 and 15 empty states | Specified only; the DS has the components (15, 17, 18). Built: 07 first-day empty state, 03 and 06 error/limit states |
