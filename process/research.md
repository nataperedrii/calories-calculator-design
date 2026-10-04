# Competitive research: calorie trackers

A short review of four leading apps, focused on the two user stories in this project:

1. **Calculate calories** in a dish or product.
2. **Find recipes** that fit the user's needs.

Sources: App Store and Google Play listings, public reviews (Trustpilot, app store reviews, a dietitian's review), and product pages, as of September 2026. Prices and paywalls change often, so treat them as indicative.

---

## At a glance

| | **MyFitnessPal** | **Yazio** | **Lifesum** | **FatSecret** |
|---|---|---|---|---|
| **Positioning** | The biggest database, "log everything" | A clean, friendly tracker with fasting and meal plans | Lifestyle and diet plans, with a "health score" angle | A free, practical tracker with a community |
| **Daily goal** | Calculated from weight goal, activity and pace. Exercise calories are added back (net calories) | Calculated from your profile, then split per meal (breakfast, lunch, dinner, snacks) | Calculated from your profile and the diet plan you pick (keto, high-protein…) | Calculated from your profile, with RDI % shown per food |
| **Food database** | Huge, but mostly crowdsourced, so there are many duplicates and wrong entries | Curated and smaller, with good local and branded coverage in the EU | Curated, and each food gets a rating | 2M+ verified foods, including restaurant and branded items |
| **Input methods** | Search, barcode (Premium), meal scan (Premium), quick add | Search, barcode, AI photo | "Multimodal" logging: photo, voice, text, barcode | Search, barcode and photo, all free |
| **Home-made dishes** | Recipe importer from a URL; you match each ingredient by hand | Your own recipes built from ingredients, with a portion count | Your own recipes and meals | Your own recipes, which can be shared with the community |
| **Recipe discovery** | Weak. Mostly inside Premium+ meal plans | Strong. Recipes are filtered by diet and shown with kcal per portion, adjusted to meal targets (Pro) | Strong and visual. Thousands of recipes with smart filters, tied to the diet plan | A large community recipe library with full nutrition. Quality varies |
| **Business model** | Free, Premium and Premium+ (≈ $80–100 per year); ads in the free tier | Free and Pro (≈ £30 per year); upsells are pushed hard | Free and Premium; most of the value is behind the paywall | Mostly free, with an optional Premium tier (meal plans) |

---

## MyFitnessPal

**How calculation works.** You set a goal weight and pace. The app estimates your daily calories (a BMR formula multiplied by an activity factor), then shows *Goal − Food + Exercise = Remaining*. Macros come as default percentages, and custom macro targets need Premium.

**Recipes.** The URL importer is a real time-saver, but the user still has to confirm or replace each ingredient match. Serving count is a single number, and you can't enter the cooked weight of the dish. Recipe *discovery* is thin.

**UX strengths**
- It almost always finds the food you're looking for.
- "Copy meal from yesterday", recents and quick add make logging fast for experienced users.
- A deep ecosystem of wearable and fitness integrations.

**Pain points**
- **You can't trust the data.** Crowdsourced entries mean five versions of "banana" with different kcal values.
- **Core features are behind the paywall.** Barcode scanning moved to Premium, which caused a large user backlash and churn to competitors.
- The free tier has heavy ads and cluttered screens, and logging takes many taps.
- The red "over goal" numbers feel like punishment.

## Yazio

**How calculation works.** Your profile gives a daily kcal target, which is then split per meal. Macro targets appear as simple bars. Intermittent fasting is built in.

**Recipes.** This is the best of the four. Recipes are well organised by diet and goal, show kcal per portion, and (in Pro) are adjusted to the calories you need for that meal. You can create your own recipes and meals and log them in one tap.

**UX strengths**
- Clean, friendly visual style that doesn't overwhelm.
- It learns what you eat regularly, so after about a week most items are suggestions.
- Meal-level targets make "what should I eat for dinner?" answerable.

**Pain points**
- Many recipes and meal plans are locked. The Pro upsell appears on almost every visit.
- An AI pop-up after each entry can't be turned off, and there are too many notifications.
- Some settings are rigid (for example, a fixed fasting start time).

## Lifesum

**How calculation works.** The daily target comes from your profile plus the chosen **diet plan** (keto, Mediterranean, high-protein, and more), which changes the macro split. The weekly **Life Score** combines nutrition, hydration and activity.

**Recipes.** A large, photo-first library with smart filters, linked to the diet plan, so the app suggests recipes that fit your plan.

**UX strengths**
- The most "lifestyle" and aspirational look, with strong food photography.
- Multimodal logging (photo, voice, text or barcode, for a whole meal or a single ingredient) cuts friction.
- Food ratings help beginners understand *quality*, not just quantity.

**Pain points**
- The free tier feels like a demo. Most of the value is behind the paywall.
- Rating foods as good or bad can feel judgmental and can make an unhealthy relationship with food worse.
- Database coverage is patchy outside core markets, and AI photo estimates are hard to verify or correct.

## FatSecret

**How calculation works.** A classic daily target with a diary. Each food shows its share of daily intake (RDI %).

**Recipes.** A large recipe library, mostly community-made, with full nutrition per serving. Users can publish their own recipes.

**UX strengths**
- **The core is free**: barcode scanning, photo recognition and the diary.
- A verified database that includes restaurant and branded foods.
- A supportive community and broad integrations (Apple Health, Google Fit, Fitbit, Samsung Health, Apple Watch).

**Pain points**
- The UI looks dated and dense. It is a web-era information architecture squeezed into mobile.
- Community recipe quality and photos vary a lot.
- Ads in the free tier, and navigation that is hard to learn.

---

## Gaps the whole category shares

- **Home-made dishes are painful everywhere.** Every app makes you split the dish into "servings" and guess. None of them handle the fact that cooking changes weight: 100 g of dry pasta becomes about 230 g cooked. The simplest correct method is to weigh the finished pot and calculate per 100 g. No leader treats that as a primary flow.
- **Discovery and tracking live in separate places.** Recipes sit in one tab and the diary in another. The user does the mental maths to see whether a recipe "fits my day".
- **Tone.** Red numbers, warnings and "bad food" labels are common, even though many users are anxious about food.

---

## 5 key insights for my design

1. **Make "per 100 g" the anchor, and make the cooked-dish calculator a primary flow.**
   Let the user add ingredients by weight, enter the *final cooked weight*, and get kcal and macros per 100 g and per portion. This fixes the biggest shared pain point and is the core of user story 1.
   → Screens: *Dish calculator*, *Add ingredient*, *Result: per 100 g / per portion*.

2. **Show where the numbers come from.**
   One canonical entry per food, a small "verified" badge, and the source (such as USDA) on the product detail screen. Avoid MyFitnessPal's duplicate chaos. Accurate, real per-100 g data is the product's credibility.
   → Components: *food list item with verified badge*, *nutrition table with source line*.

3. **Show recipes by "what fits my remaining budget", not by category alone.**
   Take Yazio's best idea further. Filter recipes by the kcal and protein left for today or this meal, and label each card "Fits your dinner: 480 of 520 kcal". Link the recipe detail straight to logging, with portion scaling.
   → Screens: *Recipe search with fit filters*, *Recipe detail → Log portion*.

4. **Make the core fast and free: two taps to log.**
   Recents and favourites first, then search, barcode and photo. Put no paywall on the basics: the MyFitnessPal barcode backlash shows the cost. Show upsells, if any, in context, and never as a pop-up after each entry.
   → Pattern: *search screen opens with recents*, *quick-portion chips (50 g · 100 g · 1 portion)*.

5. **Calm, non-judgmental visual language.**
   No red alarms and no "bad food" labels. Use neutral colours for "over" and positive colours for progress. Present macros as information, not a grade. Aim for Yazio's clarity with Lifesum's appetite appeal (real food photos), without FatSecret's density.
   → Brand and design system: a warm, calm palette, accessible contrast, and a status colour for "over target" that isn't an error red.

---

### Sources
- [MyFitnessPal pricing 2026 – FitBudd](https://www.fitbudd.com/post/myfitnesspal-app-cost)
- [MyFitnessPal cost – ReciMe](https://www.recime.app/blog/myfitnesspal-cost)
- [Users unhappy with MyFitnessPal's removal of the free barcode scanner – Kimola](https://kimola.com/reports/myfitnesspal-removes-free-barcode-scanner-feature-140890)
- [MyFitnessPal app – Healthify NZ](https://healthify.nz/apps/m/myfitnesspal-app)
- [Yazio reviews – Trustpilot](https://www.trustpilot.com/review/yazio.com?page=5)
- [I tested YAZIO: a dietitian's review – Darwin Nutrition](https://www.darwin-nutrition.fr/?p=60709)
- [Lifesum: AI tool of the week – Silicon Canals](https://siliconcanals.com/ai-tool-of-the-week-lifesum/)
- [Lifesum: AI Calorie Counter – App Pricing Lab](https://apppricinglab.com/app/apple/286906691)
- [Calorie Counter by fatsecret – App Store](https://apps.apple.com/lt/app/id347184248)
- [FatSecret reviews – Trustpilot](https://nz.trustpilot.com/review/www.fatsecret.com)
