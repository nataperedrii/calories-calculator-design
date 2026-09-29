# Brand directions (v2)

Three brand directions for a **light-theme mobile calorie calculator** that has to pass App Store and Google Play review. The core feature is **food analysis from a photo**.

Visual version: [directions.html](directions.html) · [directions.png](directions.png)

> **About the inputs.** The brief points to `00-research/competitor-analysis.md` and `00-research/references/`. Neither exists in this repo, so there are no competitor screenshots. As agreed, this step uses [process/research.md](../process/research.md) as the analysis. Competitors' photo-analysis flows are described from their public product pages and help centres (sources at the end), not from screenshots. Anything below that goes beyond those sources is marked as **our decision**.

All food numbers are real USDA FoodData Central values per 100 g, scaled to the portion shown.

---

## 0. Direct competitors: summary

**Direct competitors** are **MyFitnessPal, Yazio, Lifesum and FatSecret**. All four do the same core job we do: log food, calculate calories and macros against a daily goal, handle recipes, and log from a photo.

**Essential for this kind of app**
- A daily calorie goal with protein, fat and carbs, and a clear "eaten / left" summary.
- A food diary split by meal (breakfast, lunch, dinner, snacks).
- Several fast ways to log: search (recent foods first), barcode, **photo**.
- A trustworthy food database, with values per 100 g and per portion.
- Home-made dishes and recipes calculated from their ingredients.
- Editable portions everywhere. Estimates are never final until the user confirms them.

**What they do well**
- **MyFitnessPal:** database coverage. Meal Scan logs several foods from one photo, and the user **confirms the foods and portions** before anything is saved.
- **Yazio:** a friendly diary. Recipes show kcal per portion and fit meal targets. AI photo logging estimates portion, calories and macros in one step.
- **Lifesum:** "multimodal" logging (photo, voice, text or barcode). **You can adjust each ingredient's amount** after the meal is generated.
- **FatSecret:** photo recognition matched to a **verified** regional database, and the core logging features are free.

**What they do poorly**
- **Trust:** MyFitnessPal's crowdsourced duplicates, and Lifesum's accuracy issues with user-submitted foods. None of the public descriptions mention **showing a recognition confidence** level.
- **Paywalls on the core:** photo logging is Premium in MyFitnessPal and Pro in Yazio, and MyFitnessPal's barcode scanner went Premium after launching free.
- **Noise:** Yazio shows an AI pop-up after each entry with no way to turn it off, pushes upsells hard and sends too many notifications. MyFitnessPal and FatSecret show ads.
- **Tone:** red "over goal" numbers and good/bad food ratings.
- **Home-made dishes:** nobody handles how cooking changes a dish's weight.

---

## 1. MVP scope and the features we adopt

This follows the brief (calculate the calories in a dish or product, find recipes that fit) and the 5 insights in `research.md`. Photo analysis is the core feature, as the v2 brief requires.

| Feature (MVP) | Seen in | Why we need it |
|---|---|---|
| **Photo analysis:** several items per photo, confirm before saving | MyFitnessPal Meal Scan, Yazio, Lifesum, FatSecret | The core feature. Confirming first is the honest pattern (MyFitnessPal) and fixes the accuracy complaints (Lifesum) |
| **Editable portion per detected item** | Lifesum (adjust each ingredient), MyFitnessPal (confirm portion) | Portion size is the biggest error in a photo estimate |
| **Recognition confidence per item** (High / Check / Not sure) | Not documented by any of the four. **Our decision** | Addresses the category's trust problem (research insight 2) |
| **Manual search fallback** from the result screen | All four have search | Needed when recognition fails |
| **Home: daily summary** (kcal eaten and left, P/F/C) | All four | The main question users open the app with |
| **Food diary by meal** | All four | Where confirmed items are saved |
| **Search with recent foods first, plus barcode** | Yazio suggestions, all have barcode | Research insight 4: two taps to log |
| **Dish calculator** (ingredients plus final cooked weight → per 100 g) | Recipe builders in all four; cooked weight is **our decision** | User story 1 and research insight 1 |
| **Recipe search "fits your day"** → log a portion | Yazio (recipes fit meal targets), Lifesum (filters) | User story 2 and research insight 3 |
| **Source and "verified" label on foods** | FatSecret verified database | Research insight 2 |
| **Optional account plus in-app account deletion** | Store requirement | Apple guideline 5.1.1(v) |

**Out of scope** (not in the brief or the analysis): social feed and community, recipe marketplace, coaching, meal plans, fasting, streaks and gamification, water tracking, wearable sync, ads, and AI chat.

---

## 2. Core flow: food analysis from a photo

The same flow applies to every direction. The HTML shows the **result screen** in each direction's style. The full flow is designed in `03-screens`.

1. **Entry:** the central **Scan** tab (bottom nav) or "+ Add" on a meal, then choose *Take photo* or *Choose from library*.
2. **Camera permission (first run only):** a screen before the system prompt explains the purpose. Suggested `NSCameraUsageDescription`: *"{App} uses the camera to photograph your meal so it can estimate calories and nutrients. You can also choose a photo from your library or search instead."* If the user says no, they can still search and pick from the library, with a link to Settings.
3. **Capture guidance:** a plate outline overlay and three short tips (*Whole plate in frame · Good light · Shoot from above, about 45°*), live hints ("Too dark", "Move closer"), a flash toggle, and a library shortcut.
4. **Analyzing (usually 2–4 s):** the photo with a progress shimmer and plain text: *"Finding foods… Estimating portions…"*. A Cancel button, no fake percentages.
5. **Result:**
   - The photo with numbered markers on the detected items.
   - A list of items with name, estimated grams (a stepper and a direct input), kcal, and a **confidence label**:
     - **High:** a check icon.
     - **Check portion:** a half-filled icon. The item is highlighted and the user is asked to confirm it.
     - **Not sure:** a question icon. The app offers *"Is it X or Y?"* alternatives and a *Search instead* button.
   - Totals: kcal, then P, F and C, always shown with letters and values, never colour alone.
   - Meal picker (it suggests *Lunch* based on the time of day), plus *+ Add missing item*.
   - Primary CTA: **"Add to Lunch · 559 kcal"**.
   - Footer: *"Photo estimates can be off by 10–20%. Check portions. Not medical advice."*
6. **Confirm:** a toast reading *"Added to Lunch"* with **Undo**. The diary scrolls to the meal.
7. **Error and low-confidence states:**
   - *Couldn't recognize:* "We couldn't spot any food in this photo." Buttons: *Retake* and *Search manually*.
   - *Partly recognized:* "1 item not recognized." A row with *Search* to add it by hand.
   - *Blurry or dark:* a hint shown before analysis, with *Retake*.
   - *Offline:* "No connection. Your photo is saved, and we'll analyse it when you're back online." The user can also search offline in recent foods.

---

## 3. Colour and food association (shared rules)

**What the colours say**
- **Warm hues** (red, orange, yellow) read as ripeness, cooking heat and appetite. That's why they dominate food packaging and restaurant branding.
- **Greens** read as fresh, natural and "good for me", and they build calm trust.
- **Earthy browns and beiges** suggest whole grains, bread and home cooking.
- **Warm off-whites** (oat, cream, rice) feel like dairy and paper. Pure `#FFFFFF`, especially with cyan or grey, reads as clinical.

**What we avoid**
- Cold clinical cyan, teal and pure white as the main surfaces (they read as a pharmacy or hospital).
- Large blue surfaces. Blue is rare in natural food and often called appetite-suppressing.
- Violet gradients (they look artificial, and they're the "AI look").
- Grey-dominant UI (stale, lifeless).

These associations are largely cultural and associative, not strong causal science. We use them as a direction, not a rule.

**Hard rules for every direction**
- Light theme with a warm off-white background. Cards use a lighter off-white, never `#FFFFFF`.
- **WCAG AA:** text at least 4.5:1, UI components and graphics at least 3:1. Every value in the tables below was measured against the direction's background.
- **Protein, fat and carbs:** a magenta, gold and blue triad. Colour-blindness simulations (protanopia, deuteranopia and tritanopia, Machado 2009) keep every pair clearly separated (ΔE ≥ 22). Macros are **always** labelled P / F / C with numbers, and bars keep a fixed P → F → C order.
- **Semantic colours** (success, warning, error) are taken from the palette's food hues and darkened to 4.5:1 or more. **Going over the goal is never shown as an error.** It uses a neutral or warning tone with neutral copy.

**Shared system foundations**
- **Grid:** 8 pt, with 4 pt for fine steps. Screen frame 390×844 pt. Side margins 16–20 pt (see each direction).
- **Touch targets:** at least 44×44 pt (iOS) and 48×48 dp (Android). Steppers and icon buttons are 44 or 48 even when the icon is 24.
- **Safe areas:** status bar 47 pt, home indicator 34 pt. The bottom nav is 5 items: Today · Diary · **Scan** · Recipes · Profile.
- **Type:** body 16, caption at least 12. Everything scales with iOS Dynamic Type and Android `sp`. Layouts allow wrapping at 200% text size, and number columns use tabular figures.
- **Icons:** a 24 px grid, in sizes 16 / 20 / 24 / 32, with the stroke weight fixed per direction.
- **Nutrition defaults (our decision, for responsible nutrition):**
  - The default goal is the **estimated maintenance** calories.
  - Weight-loss pace is capped at 0.5 kg per week, and the goal never goes below 1,200 kcal.
  - No "bad food" labels and no before/after body imagery.
  - The app is for users aged 18+ (age check in onboarding).
  - There is a *"Not medical advice"* disclaimer in onboarding, in Settings → About, and on the photo result.

---

## 4. Store readiness (shared checklist)

- **App icon:** 1024×1024 PNG, full-bleed square, **no transparency, no pre-rounded corners** (iOS applies its own mask). **Android adaptive icon:** a 108 dp foreground and background, with all key art inside the **66 dp safe zone** circle.
- **Name:** 30 characters or fewer, with no third-party trademarks or competitor names. The proposed names are **not yet trademark-cleared**, so a search is needed before submission.
- **Fonts:** Google Fonts only, all under the SIL Open Font License. **Imagery:** only our own or properly licensed photography and illustration, with no brand logos on packaging.
- **Permissions:** a camera purpose screen before the system prompt. Photo library access uses the system picker (no full-library permission).
- **Account:** optional (for sync). If it exists, **Settings → Account → Delete account** works in-app, with a confirmation and a note about what data is deleted (Apple guideline 5.1.1(v); Google Play account deletion policy).
- **Health:** a not-medical-advice disclaimer, no extreme-diet promotion, no weight shaming, and no aggressive deficits by default.
- **Originality:** we reuse competitors' *behaviour* (confirming before saving, editable portions, recent foods first) and never their visual style.

---

## A · RIPE: Fresh market

**App Store name:** *Ripe: Photo Calorie Counter* (27 characters)

**Positioning:** *Point, snap, know. Calories from a photo, as fresh as the food.*

**Target audience:** Busy adults aged 24–40 who eat a mix of home cooking and takeaway. They gave up on typing every ingredient and want a fast photo estimate they can trust and correct.

**Personality:** Fresh · Quick · Optimistic · Honest · Appetising

**Colour palette** (on Oat `#FBF6EE`)

| Name (food) | HEX | Role | Contrast | Why this food |
|---|---|---|---|---|
| **Oat milk** | `#FBF6EE` | Background | — | Creamy and warm, never clinical |
| **Rice** | `#FFFCF6` | Cards and sheets | — | A lighter off-white for depth, not pure white |
| **Rye crust** | `#2B2118` | Primary text, icons | 14.6:1 | The warm dark brown of baked bread, softer than black |
| **Walnut** | `#6B5A4A` | Secondary text | 6.1:1 | A nut-shell brown for quiet information |
| **Persimmon** | `#C4431A` | Brand, primary CTA (white text 5.0:1) | 4.7:1 | Ripe fruit and cooking heat, the strongest appetite cue |
| **Apricot** | `#FCE3CC` | Tints, selected chips (Rye text 12.8:1) | — | Soft fruit flesh, a friendly highlight |
| **Avocado** | `#4A7326` | Freshness accent, "fits your day" | 5.2:1 | Fresh green, the natural balance to orange |
| **Honey** | `#F2B63D` | Highlights, the goal marker (Rye text 8.7:1) | — | Golden and warm; used only as a fill |
| **Beetroot** · P | `#9B2F63` | Protein | 6.6:1 | A deep magenta root, earthy and dense |
| **Mustard** · F | `#A77A0B` | Fat | 3.6:1 (graphic) | Golden oils and seeds |
| **Blueberry** · C | `#3B6CC0` | Carbs | 4.8:1 | A fruit sugar hue. The only blue, used for data only |
| Success · *Basil* | `#2E7D4F` | Confirmed, high confidence | 4.7:1 | |
| Warning · *Turmeric* | `#9A6400` | "Check portion", over goal | 4.7:1 | |
| Error · *Chili* | `#B3261E` | Failed recognition, errors | 6.1:1 | |

**Fonts:**
- **Headline:** *Young Serif* (a chunky, friendly market-sign serif)
- **Body:** *Hanken Grotesk* (open and very legible at 12–16)
- **Numbers:** *Azeret Mono* (tabular, calm)

**Imagery:** Close, bright natural-light shots of real plates at 45°, the angle the camera guidance asks for. Colours are saturated but not filtered, with market textures (crates, paper bags, cutting boards). No bodies, no scales, no measuring tapes.

**Iconography:** A 2 px rounded stroke on a 24 px grid with rounded caps and joins. Selected state: a Persimmon fill with a Rice stroke.

**Tone of voice:** Upbeat, short and transparent about estimates.
- "Looks like salmon, rice and broccoli. Check the portions?"
- "We're not sure about the glaze. Is it olive oil or teriyaki?"
- "879 kcal left today. Plenty of room for dinner."

**How it's different:** Category leaders lean on blues and greens. Ripe owns **ripe orange and oat**, the colours of food itself. It's the only one that puts **confidence on every detected item**, with a camera-first navigation.

**Tokens**
- **Spacing:** 4 · 8 · 12 · 16 · **20** (screen margin) · 24 · 32 · 40 · 48 · 64
- **Radii:** xs 6 · sm 10 · md 16 · lg 24 · xl 32 · full 999
- **Elevation:**
  - e1 `0 1px 2px rgba(43,33,24,.06), 0 2px 8px rgba(43,33,24,.06)`
  - e2 `0 8px 24px rgba(43,33,24,.10)`
  - e3 (sheets) `0 -8px 32px rgba(43,33,24,.14)`
- **Type scale** (size/line, px):

  | Style | Font | Size/line |
  |---|---|---|
  | Display | Young Serif | 40/44 |
  | H1 | Young Serif | 28/34 |
  | H2 | Young Serif | 22/28 |
  | Title | Hanken 600 | 18/24 |
  | Body | Hanken | 16/24 |
  | Callout | Hanken | 14/20 |
  | Caption | Hanken | 12/16 |
  | Num-XL | Azeret | 44/48 |
  | Num-M | Azeret | 16/24 |
- **Icons:** 16 / 20 / 24 / 32, 2 px stroke.

---

## B · PER100: The honest label

**App Store name:** *Per100: Calorie Calculator* (26 characters)

**Positioning:** *Every food, every photo, reduced to one honest label.*

**Target audience:** Label-readers aged 25–45 (lifters, people who meal-prep, people who read packaging). They distrust "AI magic" and want to see the numbers, the source and the maths.

**Personality:** Frank · Exact · Graphic · Unfussy

**Colour palette** (on Kraft `#F4EDE1`)

| Name (food) | HEX | Role | Contrast | Why this food |
|---|---|---|---|---|
| **Kraft** | `#F4EDE1` | Background | — | A deli-paper, pantry-bag beige |
| **Parchment** | `#FBF7EF` | Cards, the label panel | — | Baking parchment |
| **Black olive** | `#1E1C17` | Text, rules, primary button | 14.6:1 | The deepest food black, warmer than `#000` |
| **Peppercorn** | `#5A5348` | Secondary text | 6.5:1 | Ground-pepper grey-brown |
| **Dijon** | `#E3A82B` | Brand, primary highlight (Black olive text 8.0:1) | — | Mustard, the classic deli condiment and an appetite yellow |
| **Paprika** | `#B23A1C` | Stamp accent, "per 100 g" badges (white text 6.0:1) | 5.1:1 | Smoky spice red, used sparingly |
| **Pickle** | `#3B6526` | "Fits", verified source | 5.9:1 | Brined cucumber green |
| **Plum** · P | `#7C2B5C` | Protein | 7.7:1 | A deep stone fruit |
| **Dijon dark** · F | `#A06F00` | Fat | 3.8:1 (graphic) | Mustard oil |
| **Sloe** · C | `#2D62A8` | Carbs | 5.3:1 | A blue-black wild berry |
| Success · *Pickle* | `#2F6B35` | | 5.5:1 | |
| Warning · *Dijon dark* | `#8F5E00` | | 4.8:1 | |
| Error · *Paprika* | `#A8321C` | | 5.8:1 | |

Macro bars also carry **patterns** (solid P, hatched F, dotted C), in the spirit of a printed label.

**Fonts:**
- **Headline:** *Libre Franklin* 800/900. Franklin Gothic is the typeface family of the classic Nutrition Facts label.
- **Body:** *Public Sans* (neutral, public-service clarity)
- **Numbers:** *Chivo Mono* (a tabular, ink-trap-style mono)

**Imagery:** Packshot-style photos of ingredients on kraft paper, lit by one hard light source, next to their label panel. Ingredients sit whole or cut in half. No lifestyle scenes and no people.

**Iconography:** A 2 px stroke with square caps and mitred joins on a 24 px grid. Everything is drawn from rectangles and circles, like stamps.

**Tone of voice:** Plain facts, with sources, and no hype.
- "Oatmeal, 250 g. Source: USDA. Confidence: high."
- "Honey? We can't tell from the photo. Check it or remove it."
- "Over by 90 kcal. That's about one banana. No big deal."

**How it's different:** It turns the **Nutrition Facts label**, a public visual language nobody owns, into the whole brand. It is maximally transparent (source, confidence and maths on every item), which answers the trust gap in the research.

**Tokens**
- **Spacing:** 4 · 8 · 12 · **16** (screen margin) · 24 · 32 · 48 · 64. The strictest direction, with fewer steps.
- **Radii:** 0 · 2 · 4 · 8 (sheets only). Label edges stay sharp.
- **Elevation:** e0 flat with 1.5 px Black olive rules; e1 `0 0 0 1.5px #1E1C17`; e2 (sheets) `0 -6px 24px rgba(30,28,23,.14)`.
- **Type scale:**

  | Style | Font | Size/line |
  |---|---|---|
  | Display | Franklin 900 | 44/44 |
  | H1 | Franklin 800 | 28/32 |
  | H2 | Franklin 800 | 20/24 |
  | Label caps | Franklin 700 | 13/16, +6% |
  | Body | Public Sans | 16/24 |
  | Callout | Public Sans | 14/20 |
  | Caption | Public Sans | 12/16 |
  | Num-XL | Chivo Mono | 56/56 |
  | Num-M | Chivo Mono | 16/24 |
- **Icons:** 16 / 20 / 24 / 32, 2 px stroke, square caps.

---

## C · SPRIG: Calm kitchen

**App Store name:** *Sprig: Calm Calorie Counter* (27 characters)

**Positioning:** *Know what's on your plate, without the pressure.*

**Target audience:** Adults aged 28–50 who tried trackers before and felt judged or anxious. They want gentle awareness: a photo, a number, and no alarms.

**Personality:** Calm · Kind · Grounded · Clear

**Colour palette** (on Coconut `#F7F4EC`)

| Name (food) | HEX | Role | Contrast | Why this food |
|---|---|---|---|---|
| **Coconut** | `#F7F4EC` | Background | — | Soft coconut flesh |
| **Rice paper** | `#FFFDF7` | Cards | — | A light, translucent off-white |
| **Nori** | `#1C2620` | Text | 14.2:1 | Seaweed green-black, calmer than brown |
| **Sage stem** | `#56635A` | Secondary text | 5.7:1 | Herb stem grey-green |
| **Basil** | `#2F6B45` | Brand, primary CTA (white text 6.3:1) | 5.8:1 | Fresh herbs, natural and trustworthy, never mint-clinical |
| **Cucumber** | `#DDEBD9` | Tints, selected chips (Basil-deep text 6.9:1) | — | Pale fresh green |
| **Apricot** | `#F4A259` | Warm accent: the appetite spark on the plate ring (Nori text 7.5:1) | — | Keeps green from feeling cold |
| **Radish** · P | `#B23A6E` | Protein | 5.1:1 | Pink-red crunchy root |
| **Corn** · F | `#9E7700` | Fat | 3.8:1 (graphic) | Golden kernels and corn oil |
| **Borage** · C | `#2E6DB0` | Carbs | 4.9:1 | A blue edible herb flower, so it stays in the herb family |
| Success · *Basil* | `#2F7A4B` | | 4.8:1 | |
| Warning · *Saffron* | `#946200` | | 4.8:1 | |
| Error · *Chili* | `#B0301F` | | 5.8:1 | |

**Fonts:**
- **Headline:** *Instrument Serif* (calm, editorial, human)
- **Body:** *Albert Sans* (soft geometric sans with generous x-height)
- **Numbers:** *Geist Mono* (quiet, tabular)

**Imagery:** Overhead plates on linen in soft diffused daylight, with lots of negative space and muted, natural colour. Hands appear gently and without urgency.

**Iconography:** A 1.5 px rounded stroke on a 24 px grid, with organic curves and leaf-like terminals. The active state uses a soft Cucumber pill behind the icon.

**Tone of voice:** Gentle, second person, and never urgent.
- "Here's what we found. Adjust anything that doesn't look right."
- "One item wasn't recognized. Want to add it yourself?"
- "You've had 903 kcal so far. Dinner's still ahead."

**How it's different:** A **low-pressure** tracker. There's no over-goal red and no streaks, and the day is shown as a "plate ring" split by meals rather than a countdown. It targets people the research showed feel judged by red numbers and good/bad ratings.

**Tokens**
- **Spacing:** 4 · 8 · 12 · 16 · **20** (screen margin) · 24 · 32 · 40 · 56 · 72. The airiest direction.
- **Radii:** sm 12 · md 16 · lg 24 · xl 32 · full 999
- **Elevation:** e1 `0 1px 3px rgba(28,38,32,.05), 0 6px 16px rgba(28,38,32,.05)`; e2 `0 12px 32px rgba(28,38,32,.08)`; e3 `0 -10px 40px rgba(28,38,32,.12)`
- **Type scale:**

  | Style | Font | Size/line |
  |---|---|---|
  | Display | Instrument Serif | 44/48 |
  | H1 | Instrument Serif | 30/36 |
  | H2 | Instrument Serif | 24/30 |
  | Title | Albert 600 | 17/24 |
  | Body | Albert | 16/24 |
  | Footnote | Albert | 13/18 |
  | Caption | Albert | 12/16 |
  | Num-XL | Geist Mono | 40/44 |
  | Num-M | Geist Mono | 16/24 |
- **Icons:** 16 / 20 / 24 / 32, 1.5 px stroke.

---

## Sample data used in the mini screens

These are USDA per-100 g values scaled to the portion. Totals are rounded.

**RIPE: lunch from a photo** (matches the real photo `assets/dish-salmon-rice-broccoli.jpg`)
- Salmon, cooked, 140 g: 288 kcal
- White rice, cooked, 150 g: 195 kcal
- Broccoli, boiled, 90 g: 32 kcal
- Olive oil (not sure: "oil or glaze?"), 5 g: 44 kcal
- **Total: 559 kcal · P 37 · F 23 · C 49 g**

The day so far is 1,171 of 2,050 kcal:
- Breakfast (Greek yogurt, oats, blueberries): 344 kcal
- Lunch (the plate above): 559 kcal
- Snack (apple, almonds): 268 kcal

**PER100: breakfast from a photo**
- Oatmeal, cooked with water, 250 g: 178 kcal
- Banana, 80 g: 71 kcal
- Peanut butter, 16 g: 94 kcal
- Honey (not sure), 10 g: 30 kcal
- **Total: 373 kcal · P 11 · F 12 · C 60 g**

The day so far is 908 of 1,900 kcal:
- Breakfast (the bowl above): 373 kcal
- Lunch (lentil soup, sourdough): 411 kcal
- Snack (hummus, carrots): 124 kcal

**SPRIG: lunch from a photo**
- Chicken breast, 120 g: 198 kcal
- Romaine, 60 g: 10 kcal
- Cherry tomatoes, 80 g: 14 kcal
- Avocado, 50 g: 80 kcal
- Feta, 30 g: 79 kcal
- Dressing: not recognized
- **Total: 381 kcal · P 44 · F 18 · C 11 g**

The day so far is 903 of 1,800 kcal:
- Breakfast (eggs, wholegrain toast, orange): 314 kcal
- Lunch (the salad above): 381 kcal
- Snack (Greek yogurt, walnuts): 208 kcal

The home screen also suggests a recipe that fits dinner: baked cod, potatoes and peas, 443 kcal per portion:
- Cod, cooked, 150 g: 158 kcal
- Potatoes, boiled, 200 g: 174 kcal
- Green peas, boiled, 80 g: 67 kcal
- Olive oil, 5 g: 44 kcal

---

## Recommendation

Scores are from 1 to 5.

| Criterion | RIPE | PER100 | SPRIG |
|---|---|---|---|
| Food association | **5** Persimmon, oat and avocado are literally food | 3 Label-paper beige and black read as "packaging" more than "meal" | 4 Herb green is fresh, but less appetising alone |
| Differentiation from competitors | **5** No leader owns ripe orange; confidence per item | **5** Label language plus sources everywhere | 3 Green is close to existing category greens |
| Legibility | 4 Strong contrast; orange CTAs need care with small text | **5** Near-black on kraft, the highest contrast | 4 Airy, but the serif display needs large sizes |
| Store-review readiness | **5** Friendly, non-medical, no shaming | 4 A number-first attitude can feel strict about calories | **5** Built around responsible nutrition |
| **Total** | **19** | 17 | 16 |

**Recommendation: A · RIPE.**
- Its palette tells the strongest food story, which is exactly what a photo-first app needs: the photo *is* the interface, and Oat and Persimmon frame food instead of competing with it.
- Its camera-first structure and per-item confidence answer the two biggest category problems (slow logging and distrust).
- Its friendly tone passes the responsible-nutrition bar.

Borrow **PER100's label-panel rigour** for the food-detail and nutrition tables, and **SPRIG's neutral "over goal" language**.

---

### Sources (photo-analysis behaviour)
- [Guide to MyFitnessPal Meal Scan – Passio](https://www.passio.ai/blog/essential-guide-to-myfitnesspal-meal-scan)
- [MyFitnessPal introduces AI photo recognition – BrainStation](https://brainstation.io/magazine/myfitnesspal-introduces-ai-photo-recognition)
- [YAZIO on the App Store](https://apps.apple.com/us/app/yazio-calorie-counter-app/id946099227)
- [Lifesum: AI tracking explained – Help Center](https://help.lifesum.com/en/article/ai-tracking-explained-15sw7rk/)
- [Lifesum launches AI-powered nutrition tracker – Athletech News](https://athletechnews.com/lifesum-launches-ai-powered-nutrition-tracker)
- [FatSecret Platform: Image Recognition & NLP](https://platform.fatsecret.com/features/image-recognition-and-nlp)
- Competitor summary and pain points: [process/research.md](../process/research.md)
