"""Build the Ripe screens (03-screens/screens/*.html) from one data source.

Every number on every screen is computed here from USDA FoodData Central values per 100 g,
so portions, meal totals and the day add up (see 03-screens/FLOWS.md, section 5).
Screens use only 02-design-system/tokens.css and components.css: no <style>, no hard-coded
colours, sizes or spacing. The only inline styles are data values (--w bar widths,
--x / --y photo marker positions), which the design system allows.

Usage:
  python3 03-screens/tools/build_screens.py
"""
import re
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "03-screens" / "screens"
DS = "../../02-design-system"
IMG = "../../01-branding/assets"

# ---------------------------------------------------------------------------
# Data: USDA FoodData Central (SR Legacy), per 100 g: kcal, protein, fat, carbs
# ---------------------------------------------------------------------------
USDA = {
    "yogurt": ("Greek yogurt, plain, 2%", 73, 9.95, 1.92, 3.94),
    "oats": ("Rolled oats, dry", 379, 13.15, 6.52, 67.7),
    "blueberries": ("Blueberries, raw", 57, 0.74, 0.33, 14.49),
    "salmon": ("Salmon, Atlantic, cooked", 206, 22.1, 12.35, 0),
    "rice": ("White rice, cooked", 130, 2.69, 0.28, 28.17),
    "broccoli": ("Broccoli, boiled", 35, 2.38, 0.41, 7.18),
    "olive_oil": ("Olive oil", 884, 0, 100, 0),
    "apple": ("Apple, raw, with skin", 52, 0.26, 0.17, 13.81),
    "almonds": ("Almonds", 579, 21.15, 49.93, 21.55),
    "almonds_roasted": ("Almonds, dry roasted", 598, 20.96, 52.54, 21.01),
    "almond_butter": ("Almond butter", 614, 20.96, 55.5, 18.82),
    "cod": ("Cod, Atlantic, cooked", 105, 22.83, 0.86, 0),
    "potatoes": ("Potatoes, boiled in skin", 87, 1.87, 0.10, 20.13),
    "peas": ("Green peas, boiled", 84, 5.36, 0.22, 15.63),
    "shrimp": ("Shrimp, cooked", 99, 23.98, 0.28, 0.20),
    "soy_sauce": ("Soy sauce", 53, 8.14, 0.57, 4.93),
    "canola_oil": ("Canola oil", 884, 0, 100, 0),
    "chickpeas": ("Chickpeas, boiled", 164, 8.86, 2.59, 27.42),
    "spinach": ("Spinach, raw", 23, 2.86, 0.39, 3.63),
    "tomatoes": ("Tomatoes, canned", 16, 0.79, 0.28, 3.47),
    "onion": ("Onion, raw", 40, 1.10, 0.10, 9.34),
    "carrots": ("Carrots, raw", 41, 0.93, 0.24, 9.58),
    "garlic": ("Garlic, raw", 149, 6.36, 0.50, 33.06),
    "red_lentils": ("Red lentils, raw", 358, 23.91, 2.17, 63.1),
    "water": ("Water", 0, 0, 0, 0),
    "butter": ("Butter, salted", 717, 0.85, 81.11, 0.06),
    "lemon_juice": ("Lemon juice, raw", 22, 0.35, 0.24, 6.9),
}
# Almonds, extra rows for the facts table (USDA, per 100 g)
ALMOND_EXTRA = {"sat": 3.80, "sugars": 4.35, "fibre": 12.5, "salt": 0.0}


def r0(x):
    """Round half up to a whole number (what the screens show for kcal)."""
    return int(Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def r1(x):
    return f"{Decimal(str(x)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)}"


def item(key, g):
    _, kcal, p, f, c = USDA[key]
    return {"key": key, "g": g, "kcal": r0(kcal * g / 100), "p": p * g / 100, "f": f * g / 100, "c": c * g / 100}


def total(items):
    return {"kcal": sum(i["kcal"] for i in items), "p": sum(i["p"] for i in items),
            "f": sum(i["f"] for i in items), "c": sum(i["c"] for i in items)}


def n(x):
    return f"{x:,}"


BREAKFAST = [item("yogurt", 200), item("oats", 40), item("blueberries", 80)]
LUNCH = [item("salmon", 140), item("rice", 150), item("broccoli", 90), item("olive_oil", 5)]
SNACK = [item("apple", 180), item("almonds", 30)]
COD = [item("cod", 150), item("potatoes", 200), item("broccoli", 100), item("olive_oil", 10), item("garlic", 5)]  # baked cod, potatoes & broccoli (1 portion)
SHRIMP = [item("shrimp", 150), item("broccoli", 150), item("rice", 180), item("canola_oil", 10), item("soy_sauce", 15)]
CURRY = [item("chickpeas", 150), item("spinach", 60), item("tomatoes", 150), item("onion", 50), item("olive_oil", 10), item("rice", 150)]
SOUP = [item("red_lentils", 250), item("onion", 150), item("carrots", 150), item("garlic", 10), item("tomatoes", 400), item("olive_oil", 15), item("water", 1000)]
SOUP_COOKED, SOUP_PORTIONS = 1700, 5

B, L, S = total(BREAKFAST), total(LUNCH), total(SNACK)
DINNER = total(COD)
GOAL = {"kcal": 2050, "p": 100, "f": 70, "c": 255}
# Persona check (FLOWS.md): Mifflin-St Jeor 10*63 + 6.25*165 - 5*34 - 161 = 1,330 x 1.55 = 2,062 -> 2,050
assert GOAL["p"] * 4 + GOAL["f"] * 9 + GOAL["c"] * 4 == GOAL["kcal"]
assert (B["kcal"], L["kcal"], S["kcal"], DINNER["kcal"]) == (344, 559, 268, 462), (B, L, S, DINNER)
DISH = "Baked cod, potatoes &amp; broccoli"
# Method for every recipe: an ordered list of steps (plain strings). Times and temperatures are food-safe:
# fish to 63 °C in the thickest part (US FDA), shrimp until pink and opaque, rice and chickpeas served hot.
STEPS = {
    "cod": [
        "Heat the oven to 200 °C (180 °C fan). Scrub the potatoes and boil them in their skins in salted water for 15–20 minutes, until a knife slides in easily. Drain.",
        "Put the potatoes on a lined baking tray and press each one with the bottom of a glass until the skin cracks open. Brush them with half the olive oil.",
        "Pat the cod dry, season it with a pinch of salt and pepper and lay it next to the potatoes. Bake for 12–15 minutes, until the fish is opaque and flakes easily, or 63 °C in the thickest part.",
        "While the fish bakes, boil the broccoli florets for 3–4 minutes until just tender, then drain well.",
        "Warm the rest of the olive oil in a small pan over low heat. Add the sliced garlic and cook for 1–2 minutes until pale golden; take it off the heat before it browns.",
        "Plate the cod, potatoes and broccoli, spoon the garlic oil over the top and serve straight away.",
    ],
    "shrimp": [
        "Cook the rice according to the packet, about 12–15 minutes, or reheat cooked rice until steaming hot.",
        "Cut the broccoli into small florets. Pat the shrimp dry with kitchen paper.",
        "Heat the oil in a wok or large frying pan over high heat. Stir-fry the broccoli for 3 minutes with a splash of water.",
        "Add the shrimp and stir-fry for 2–3 minutes, until they are pink and opaque all the way through.",
        "Add the soy sauce, toss for 30 seconds and serve over the rice.",
    ],
    "curry": [
        "Finely chop the onion. Heat the olive oil in a pan over medium heat and cook the onion for 5 minutes, until soft.",
        "Add the canned tomatoes and the drained chickpeas. Simmer for 10 minutes, stirring now and then.",
        "Stir in the spinach and cook for 1–2 minutes, until it wilts.",
        "Taste, season with salt and pepper, and serve hot with the rice.",
    ],
    "soup": [
        "Rinse the red lentils in a sieve until the water runs clear.",
        "Chop the onion and carrots and slice the garlic. Warm the olive oil in a large pot over medium heat and cook them for 5–7 minutes, until soft.",
        "Add the lentils, the canned tomatoes and the water. Bring to the boil, then lower the heat and simmer for 20–25 minutes, until the lentils fall apart.",
        "Blend until smooth, or leave it chunky. Season, weigh the pot and enter the cooked weight.",
    ],
}
assert all(all(s.strip() for s in v) for v in STEPS.values())
DISH_IMG = "recipe-baked-cod.jpg"  # one source file for every screen (Pixabay, see CREDITS.md)
DISH_ALT = "Baked cod fillets with crushed roasted potatoes, broccoli and golden garlic in a white dish"


def day(*meals):
    return {k: sum(m[k] for m in meals) for k in ("kcal", "p", "f", "c")}


# ---------------------------------------------------------------------------
# Shared markup
# ---------------------------------------------------------------------------
DOCS = (ROOT / "02-design-system" / "index.html").read_text()
SPRITE = re.search(r'<svg class="visually-hidden" aria-hidden="true" focusable="false">.*?\n</svg>', DOCS, re.S).group(0)


def ic(name, cls=""):
    return f'<svg class="icon{(" " + cls) if cls else ""}" aria-hidden="true"><use href="#i-{name}"/></svg>'


def status_bar(time, inverse=False):
    return (f'<div class="status-bar{" status-bar--inverse" if inverse else ""}" aria-hidden="true"><span>{time}</span>'
            f'<span class="status-bar__icons">{ic("signal", "icon--m")}{ic("wifi", "icon--m")}{ic("battery", "icon--m")}</span></div>')


def tab_bar(active):
    tabs = [("today", "Today", "07-today.html"), ("diary", "Diary", None), ("scan", None, "08-scan.html"),
            ("recipes", "Recipes", "13-recipes.html"), ("profile", "Profile", None)]
    out = ['<nav class="tab-bar" aria-label="Main">']
    for icon, label, href in tabs:
        go = f' data-href="{href}"' if href else ""
        if icon == "scan":
            out.append(f'<button type="button" class="tab tab--scan" aria-label="Scan a meal"{go}><span class="tab__fab">{ic("scan")}</span></button>')
        elif icon == active:
            out.append(f'<button type="button" class="tab is-active" aria-current="page"{go}>{ic(icon)}<span>{label}</span></button>')
        else:
            out.append(f'<button type="button" class="tab"{go}>{ic(icon)}<span>{label}</span></button>')
    out.append("</nav>")
    return "".join(out)


def app_bar(title, back=None, action="", back_label="Back"):
    left = (f'<button type="button" class="icon-btn" aria-label="{back_label}" data-href="{back}">{ic("back")}</button>'
            if back else "<span></span>")
    return f'<header class="app-bar">{left}<h1 class="app-bar__title">{title}</h1>{action or "<span></span>"}</header>'


def stepper(label, value, unit, what):
    return (f'<div class="stepper" role="group" aria-label="{label}">'
            f'<button type="button" class="stepper__btn" aria-label="Less {what}">{ic("minus")}</button>'
            f'<span class="stepper__value"><input class="stepper__input" type="text" inputmode="decimal" value="{value}" aria-label="{label}{" in grams" if unit == "g" else ""}"><small aria-hidden="true">{unit}</small></span>'
            f'<button type="button" class="stepper__btn" aria-label="More {what}">{ic("plus")}</button></div>')


def macro_tiles(t):
    return ('<div class="macro-tiles">'
            f'<div class="macro-tile macro-tile--p"><span class="macro-tile__label">P · Protein</span><span class="macro-tile__value">{r1(t["p"])}<small> g</small></span></div>'
            f'<div class="macro-tile macro-tile--f"><span class="macro-tile__label">F · Fat</span><span class="macro-tile__value">{r1(t["f"])}<small> g</small></span></div>'
            f'<div class="macro-tile macro-tile--c"><span class="macro-tile__label">C · Carbs</span><span class="macro-tile__value">{r1(t["c"])}<small> g</small></span></div></div>')


def macro_chips(t):
    """P / F / C chips: the compact form of the design-system macro tile (same tokens as the detail screen)."""
    out = []
    for k, letter, word in (("p", "P", "Protein"), ("f", "F", "Fat"), ("c", "C", "Carbs")):
        out.append(f'<span class="macro-tile macro-tile--{k} macro-tile--chip"><span class="macro-tile__label" aria-hidden="true">{letter}</span>'
                   f'<span class="visually-hidden">{word}</span><span class="macro-tile__value">{r0(t[k])}<small> g</small></span></span>')
    return f'<div class="macro-tiles macro-tiles--inline">{"".join(out)}</div>'


MEAL_ICONS = {"Breakfast": "breakfast", "Lunch": "sun", "Snack": "snack", "Dinner": "dinner"}


def segmented(legend, name, options, checked):
    opts = "".join(f'<label class="segmented__opt"><input class="visually-hidden" type="radio" name="{name}" value="{o.lower()}"{" checked" if o == checked else ""}>{o}</label>' for o in options)
    return f'<fieldset class="segmented"><legend class="visually-hidden">{legend}</legend>{opts}</fieldset>'


def meal_picker(meal):
    return (f'<div class="row-between"><span class="t-label">Meal</span><button type="button" class="btn btn--secondary btn--m" aria-haspopup="listbox" aria-label="Meal: {meal}. Change">'
            f'{meal}{ic("chev-d", "icon--m")}</button></div>')


def toast(msg):
    return (f'<section class="screen__toast" aria-label="Notification"><div class="toast toast--success" role="status">{ic("high")}<span class="toast__msg">{msg}</span>'
            f'<button type="button" class="toast__action">Undo</button><button type="button" class="toast__close" aria-label="Dismiss">{ic("close")}</button></div></section>')


ARC = 351.86  # length of the ring's half circle (radius 112)


def nutri(d):
    eaten, left = d["kcal"], GOAL["kcal"] - d["kcal"]
    dash = round(min(eaten / GOAL["kcal"], 1) * ARC)
    rows = []
    for k, cls, name in (("p", "p", "Protein"), ("f", "f", "Fat"), ("c", "c", "Carbs")):
        v, g = r0(d[k]), GOAL[k]
        over = v > g
        text = f"{v} of {g} grams" + (f", {v - g} grams over" if over else "")
        goal = f"of {g} g" + (f" · {v - g} over" if over else "")
        rows.append(f'<div class="macro macro--{cls}{" is-over" if over else ""}"><div class="macro__label"><i class="macro__key"></i>{cls.upper()} · {name}</div>'
                    f'<div class="macro__value">{v}<small> g</small></div>'
                    f'<div class="macro__bar" role="meter" aria-label="{name}" aria-valuemin="0" aria-valuemax="{g}" aria-valuenow="{min(v, g)}" aria-valuetext="{text}"><i style="--w: {min(100, round(v / g * 100))}%"></i></div>'
                    f'<div class="macro__goal">{goal}</div></div>')
    return ('<section class="nutri" aria-label="Today\'s calories and macros">'
            f'<div class="nutri__ring"><svg viewBox="0 0 256 136" role="img" aria-label="{n(eaten)} of {n(GOAL["kcal"])} kcal eaten">'
            '<path class="nutri__track" d="M16 128 A112 112 0 0 1 240 128" stroke-width="20"/>'
            f'<path class="nutri__value" d="M16 128 A112 112 0 0 1 240 128" stroke-width="20" stroke-dasharray="{dash} 400"/></svg>'
            f'<div class="nutri__center"><b class="nutri__big">{n(left)}</b><small>kcal left today</small></div></div>'
            f'<div class="nutri__row"><span>Eaten <b>{n(eaten)}</b></span><span>Goal <b>{n(GOAL["kcal"])}</b></span></div>'
            f'<div class="macros">{"".join(rows)}</div></section>')


def meal_row(name, meta, kcal, img=None, href=None, add=None):
    # Logged meal: the dish photo. Empty meal: a passive meal-type icon in the same 48 slot (not a button).
    thumb = (f'<img class="product__thumb" src="{IMG}/{img}" alt="" width="48" height="48">' if img
             else f'<span class="product__thumb product__thumb--icon product__thumb--meal" aria-hidden="true">{ic(MEAL_ICONS[name])}</span>')
    if kcal is None:
        end = f'<button type="button" class="icon-btn icon-btn--tint" aria-label="Add {name.lower()}" data-href="{add}">{ic("plus")}</button>'
    else:
        end = f'<span class="product__kcal">{n(kcal)}<small>kcal</small></span>'
    go = f' data-href="{href}"' if href else ""
    return (f'<div class="product"{go}>{thumb}<div><div class="product__name">{name}</div><div class="product__meta product__meta--text">{meta}</div></div>'
            f'<div class="product__end">{end}</div></div>')


SCRIPT = """<script>
  // Exports of scrolled states: <body data-scroll-to="id"> scrolls that element to the top of the screen body.
  if (document.body.dataset.scrollTo) document.getElementById(document.body.dataset.scrollTo).scrollIntoView({ block: "start" });
  // Prototype navigation: any element with data-href opens that screen.
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-href]");
    if (t) location.href = t.dataset.href;
  });
</script>"""


def page(file, title, description, body, body_attrs="", extra=""):
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} · Ripe</title>
  <meta name="description" content="{description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&amp;family=Hanken+Grotesk:wght@400;500;600;700&amp;family=Azeret+Mono:wght@400;500;600&amp;display=swap">
  <link rel="stylesheet" href="{DS}/tokens.css">
  <link rel="stylesheet" href="{DS}/components.css">
</head>
<body{body_attrs}>
<!-- GENERATED by 03-screens/tools/build_screens.py. Edit the generator, not this file. -->
{SPRITE}
<div class="screen">
{body}
</div>
{SCRIPT}{extra}
</body>
</html>
"""
    (OUT / file).write_text(html)
    return file


# ---------------------------------------------------------------------------
# 07 Today
# ---------------------------------------------------------------------------
def today(file, time, meals, toast_msg=None, card=False, title_note="Thursday", scroll=None):
    d = day(*[m["total"] for m in meals if m.get("total")])
    rows = "".join(meal_row(m["name"], m["meta"], m.get("total", {}).get("kcal"), m.get("img"), m.get("href"), m.get("add")) for m in meals)
    left = GOAL["kcal"] - d["kcal"]
    rec = ""
    if card:
        rec = (f'<div class="section-head" id="fits-head"><h2>Fits your dinner</h2><button type="button" class="btn btn--ghost btn--m" data-href="13-recipes.html">See more</button></div>'
               f'<article class="recipe-card"><div class="recipe-card__img"><img src="{IMG}/{DISH_IMG}" alt="" width="350" height="219"></div>'
               f'<div class="recipe-card__body"><span class="badge badge--fresh">{ic("fresh")}Fits your dinner</span><h3 class="recipe-card__title">{DISH}</h3>'
               f'<div class="recipe-card__meta"><span>{ic("time", "icon--s")}30 min</span><span>Covers your protein</span></div>{macro_chips(DINNER)}'
               f'<div class="recipe-card__foot"><span class="recipe-card__kcal">{DINNER["kcal"]} <small>kcal</small></span><button type="button" class="btn btn--secondary btn--m" data-href="14-recipe-detail.html" aria-label="View recipe: {DISH}">View recipe</button></div></div></article>')
    body = f"""{status_bar(time)}
<header class="app-bar app-bar--large"><h1 class="app-bar__title">Today</h1></header>
<main class="screen__body" tabindex="0">
<button type="button" class="date-btn">{ic("calendar")}<span><b>{title_note}</b> · {n(left)} kcal left<span class="visually-hidden">. Pick another day</span></span></button>
{nutri(d)}
<div class="section-head" id="meals-head"><h2>Meals</h2><span class="t-callout text-secondary"><b class="t-num-m">{n(d["kcal"])}</b> kcal eaten</span></div>
<div class="list">{rows}</div>
{rec}
</main>
{toast(toast_msg) if toast_msg else ""}
{tab_bar("today")}"""
    return page(file, "Today", f"Ripe Today screen at {time}: {n(d['kcal'])} of {n(GOAL['kcal'])} kcal eaten.", body,
                body_attrs=f' data-scroll-to="{scroll}"' if scroll else "")


BREAKFAST_ROW = {"name": "Breakfast", "meta": "Greek yogurt, oats, blueberries", "total": B, "img": "breakfast-granola-blueberries.jpg"}
LUNCH_ROW = {"name": "Lunch", "meta": "From a photo · 4 items", "total": L, "img": "dish-salmon-rice-broccoli.jpg"}
SNACK_ROW = {"name": "Snack", "meta": "Apple, almonds", "total": S, "img": "food-apple.jpg"}
DINNER_ROW = {"name": "Dinner", "meta": f"{DISH} · 1 portion", "total": DINNER, "img": DISH_IMG}

files = []
files.append(today("07-today.html", "18:30", [BREAKFAST_ROW, LUNCH_ROW, SNACK_ROW,
                   {"name": "Dinner", "meta": f"{n(GOAL['kcal'] - day(B, L, S)['kcal'])} kcal left", "add": "10-add-food.html"}], card=True))
files.append(today("07-today-meals.html", "18:30", [BREAKFAST_ROW, LUNCH_ROW, SNACK_ROW,
                   {"name": "Dinner", "meta": f"{n(GOAL['kcal'] - day(B, L, S)['kcal'])} kcal left", "add": "10-add-food.html"}], card=True, scroll="meals-head"))
files.append(today("07-today-card.html", "18:30", [BREAKFAST_ROW, LUNCH_ROW, SNACK_ROW,
                   {"name": "Dinner", "meta": f"{n(GOAL['kcal'] - day(B, L, S)['kcal'])} kcal left", "add": "10-add-food.html"}], card=True, scroll="fits-head"))
files.append(today("07-today-before-lunch.html", "13:09", [BREAKFAST_ROW,
                   {"name": "Lunch", "meta": "Snap your plate when you eat", "add": "08-scan.html"},
                   {"name": "Snack", "meta": "Nothing yet", "add": "10-add-food.html"},
                   {"name": "Dinner", "meta": "Nothing yet", "add": "10-add-food.html"}]))
files.append(today("07-today-lunch-added.html", "13:11", [BREAKFAST_ROW, LUNCH_ROW,
                   {"name": "Snack", "meta": "Nothing yet", "add": "10-add-food.html"},
                   {"name": "Dinner", "meta": "Nothing yet", "add": "10-add-food.html"}],
                   toast_msg=f"Added to Lunch · {L['kcal']} kcal"))
files.append(today("07-today-dinner-added.html", "18:34", [BREAKFAST_ROW, LUNCH_ROW, SNACK_ROW, DINNER_ROW],
                   toast_msg=f"Added to Dinner · {DINNER['kcal']} kcal"))

# ---------------------------------------------------------------------------
# 08 Scan
# ---------------------------------------------------------------------------
body = f"""{status_bar("13:09", inverse=True)}
<main class="viewfinder" aria-labelledby="scan-title">
<h1 class="visually-hidden" id="scan-title">Scan a meal</h1>
<img class="viewfinder__feed" src="{IMG}/dish-salmon-rice-broccoli.jpg" alt="Live camera view: a plate with salmon, rice and broccoli">
<span class="viewfinder__plate"></span>
<div class="viewfinder__top">
<div class="viewfinder__bar"><button type="button" class="icon-btn icon-btn--inverse" aria-label="Close camera" data-href="07-today-before-lunch.html">{ic("close")}</button>{segmented("Camera mode", "mode", ["Photo", "Barcode"], "Photo")}<button type="button" class="icon-btn icon-btn--inverse" aria-label="Flash" aria-pressed="false">{ic("flash")}</button></div>
<ul class="viewfinder__tips" aria-label="Tips"><li class="viewfinder__tip">Whole plate in frame</li><li class="viewfinder__tip">Good light</li><li class="viewfinder__tip">From above, about 45°</li></ul>
</div>
<span></span>
<div class="viewfinder__bottom">
<span class="viewfinder__hint" role="status">{ic("high", "icon--s")}Plate found. Hold still</span>
<div class="viewfinder__controls"><button type="button" class="viewfinder__side" aria-label="Choose from library"><img class="viewfinder__library" src="{IMG}/breakfast-granola-blueberries.jpg" alt="" width="48" height="48"></button><button type="button" class="shutter" aria-label="Take photo" data-href="09-photo-result-analyzing.html">{ic("scan", "icon--xl")}</button><button type="button" class="viewfinder__side" data-href="10-add-food.html"><span class="icon-btn icon-btn--inverse">{ic("search")}</span>Search</button></div>
</div>
</main>"""
files.append(page("08-scan.html", "Scan a meal", "Ripe camera screen: plate guide, tips and shutter, with library and search next to it.", body))

# ---------------------------------------------------------------------------
# 09 Photo result (analyzing + result)
# ---------------------------------------------------------------------------
MARKERS = [("70%", "50%"), ("36%", "52%"), ("52%", "30%"), ("60%", "70%")]


def photo(markers=True):
    m = "".join(f'<span class="marker{" marker--unsure" if i == 3 else ""}" style="--x: {x}; --y: {y}" aria-hidden="true">{i + 1}</span>' for i, (x, y) in enumerate(MARKERS)) if markers else ""
    return f'<div class="photo screen__bleed"><img src="{IMG}/dish-salmon-rice-broccoli.jpg" alt="Your photo: salmon, rice and broccoli on a dark plate" width="390" height="244">{m}'


body = f"""{status_bar("13:10")}
{app_bar("Lunch from a photo", back="08-scan.html", back_label="Back to camera")}
<main class="screen__body screen__body--flush" tabindex="0">
{photo(markers=False)}<div class="photo__status"><div class="card" role="status" aria-live="polite"><span class="t-label">{ic("high", "icon--s")} Finding foods… done</span><span class="t-label">{ic("time", "icon--s")} Estimating portions…</span><button type="button" class="btn btn--ghost btn--m" data-href="08-scan.html">Cancel</button></div></div></div>
<div class="section-head"><h2>Looking at your plate</h2><span class="t-callout text-secondary">Usually 2–4 seconds</span></div>
<div class="list" aria-busy="true"><span class="visually-hidden">Loading the foods we found…</span>
<div class="product"><span class="skeleton skeleton--thumb"></span><div><span class="skeleton"></span></div><span class="skeleton skeleton--short"></span></div>
<div class="product"><span class="skeleton skeleton--thumb"></span><div><span class="skeleton"></span></div><span class="skeleton skeleton--short"></span></div>
<div class="product"><span class="skeleton skeleton--thumb"></span><div><span class="skeleton"></span></div><span class="skeleton skeleton--short"></span></div>
</div>
</main>
<footer class="screen__foot"><button type="button" class="btn btn--primary btn--block" disabled>Add to Lunch</button><p class="screen__note">Nothing is saved until you add it.</p></footer>"""
files.append(page("09-photo-result-analyzing.html", "Analyzing your photo", "Ripe photo result while analyzing: plain progress steps, Cancel, no fake percentage.", body))

DET = [
    ("salmon", "Salmon, cooked", "high", "High confidence", "", ""),
    ("rice", "White rice, cooked", "check", "Check portion", " is-check", '<p class="field__help">Looks like about 1 cup. Is 150 g right?</p>'),
    ("broccoli", "Broccoli, boiled", "high", "High confidence", "", ""),
    ("olive_oil", "Olive oil", "unsure", "Not sure. Is it olive oil or teriyaki glaze?", "", ""),
]
icons = {"high": "high", "check": "check-portion", "unsure": "unsure"}
rows = []
for i, ((key, name, conf, label, extra, help_), it) in enumerate(zip(DET, LUNCH)):
    marked = " is-marked" if conf == "unsure" else ""
    alt = ""
    if conf == "unsure":
        alt = (f'<div class="chip-row" role="group" aria-label="What is item 4?"><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}Olive oil</button>'
               f'<button type="button" class="chip" aria-pressed="false">Teriyaki glaze</button><button type="button" class="chip" data-href="10-add-food.html">{ic("search")}Search instead</button></div>')
    rows.append(f'<div class="product product--detected{extra}"><span class="marker{" marker--unsure" if conf == "unsure" else ""}" aria-hidden="true">{i + 1}</span><div>'
                f'<div class="product__name"><span class="visually-hidden">Item {i + 1}: </span>{name}</div><span class="confidence confidence--{conf}{marked}">{ic(icons[conf])}{label}</span>{help_}'
                f'<div class="product__controls">{stepper(name.split(",")[0] + " weight", it["g"], "g", name.split(",")[0].lower())}{alt}</div></div>'
                f'<span class="product__kcal">{it["kcal"]}<small>kcal</small></span></div>')
body = f"""{status_bar("13:10")}
{app_bar("Lunch from a photo", back="08-scan.html", back_label="Back to camera")}
<main class="screen__body screen__body--flush" tabindex="0">
{photo()}</div>
<div class="section-head"><h2>4 foods found</h2><span class="t-callout text-secondary">Check them, then add</span></div>
<div class="list">{"".join(rows)}</div>
<button type="button" class="btn btn--ghost" data-href="10-add-food.html">{ic("plus")}Add a missing item</button>
<section class="card" aria-labelledby="total-title"><div class="row-between"><h2 class="t-label" id="total-title">Total</h2><span class="t-num-l">{L["kcal"]} <span class="t-callout text-secondary">kcal</span></span></div>{macro_tiles(L)}{meal_picker("Lunch")}</section>
</main>
<footer class="screen__foot"><button type="button" class="btn btn--primary btn--block" data-href="07-today-lunch-added.html">{ic("check")}Add to Lunch · {L["kcal"]} kcal</button><p class="screen__note">Photo estimates can be off by 10–20%. Check portions. Not medical advice.</p></footer>"""
files.append(page("09-photo-result.html", "Lunch from a photo", "Ripe photo result: 4 foods with confidence labels, weights and a 559 kcal total, nothing saved until confirmed.", body))

# ---------------------------------------------------------------------------
# 10 Add food (search)
# ---------------------------------------------------------------------------


def food_row(key, img=None, icon="portion", name=None, href=None, add_label=None):
    nm, kcal, p, f, c = USDA[key]
    name = name or nm
    thumb = (f'<img class="product__thumb" src="{IMG}/{img}" alt="" width="48" height="48">' if img
             else f'<span class="product__thumb product__thumb--icon">{ic(icon)}</span>')
    go = f' data-href="{href}"' if href else ""
    return (f'<div class="product"{go}>{thumb}<div><div class="product__name">{name} <svg class="icon product__verified" role="img" aria-label="Verified: USDA"><use href="#i-high"/></svg></div>'
            f'<div class="product__meta">P {r0(p)} · F {r0(f)} · C {r0(c)}</div></div><div class="product__end"><span class="product__kcal">{kcal}<small>per 100 g</small></span>'
            f'<button type="button" class="icon-btn icon-btn--tint" aria-label="{add_label or "Add " + name.lower()}"{go}>{ic("plus")}</button></div></div>')


body = f"""{status_bar("16:30")}
{app_bar("Add to Snack", back="07-today.html", action=f'<button type="button" class="icon-btn" aria-label="Scan a barcode" data-href="08-scan.html">{ic("barcode")}</button>')}
<main class="screen__body" tabindex="0">
<div class="search">{ic("search")}<input type="search" value="alm" aria-label="Search foods and dishes" autocomplete="off"><button type="button" class="icon-btn" aria-label="Clear search">{ic("close")}</button></div>
<div class="section-head"><h2>Results for “alm”</h2><span class="t-callout text-secondary">3 foods · per 100 g</span></div>
<div class="list">{food_row("almonds", img="food-almonds.jpg", href="11-food-detail.html")}{food_row("almonds_roasted", img="food-almonds.jpg")}{food_row("almond_butter", icon="recipes")}</div>
<div class="section-head"><h2>Recent</h2><span class="t-callout text-secondary">Two taps to log</span></div>
<div class="list">{food_row("apple", img="food-apple.jpg", name="Apple, raw")}{food_row("yogurt", img="breakfast-granola-blueberries.jpg", name="Greek yogurt, 2%")}</div>
<button type="button" class="btn btn--secondary" data-href="12-dish-calculator.html">{ic("recipes")}Create a dish</button>
</main>"""
files.append(page("10-add-food.html", "Add food", "Ripe add food: search results with verified USDA entries, recent foods and the dish calculator.", body))

# ---------------------------------------------------------------------------
# 11 Food detail & portion (almonds, 30 g)
# ---------------------------------------------------------------------------
a100 = USDA["almonds"]
a30 = item("almonds", 30)


def per(x, g):
    return r1(x * g / 100)


facts_rows = [
    ("is-energy", "Energy, kcal", f"{a100[1]}", f"{a30['kcal']}", ""),
    ("", "Protein", f"{r1(a100[2])} g", f"{per(a100[2], 30)} g", "p"),
    ("", "Fat", f"{r1(a100[3])} g", f"{per(a100[3], 30)} g", "f"),
    ("is-sub", "of which saturated", f"{r1(ALMOND_EXTRA['sat'])} g", f"{per(ALMOND_EXTRA['sat'], 30)} g", ""),
    ("", "Carbohydrates", f"{r1(a100[4])} g", f"{per(a100[4], 30)} g", "c"),
    ("is-sub", "of which sugars", f"{r1(ALMOND_EXTRA['sugars'])} g", f"{per(ALMOND_EXTRA['sugars'], 30)} g", ""),
    ("", "Fibre", f"{r1(ALMOND_EXTRA['fibre'])} g", f"{per(ALMOND_EXTRA['fibre'], 30)} g", ""),
    ("", "Salt", "0 g", "0 g", ""),
]
tr = "".join(f'<tr{f" class={chr(34)}{c}{chr(34)}" if c else ""}><td>{f"<i class={chr(34)}macro__key macro__key--{k}{chr(34)}></i>" if k else ""}{name}</td><td>{v1}</td><td>{v2}</td></tr>' for c, name, v1, v2, k in facts_rows)
body = f"""{status_bar("16:30")}
{app_bar("Almonds", back="10-add-food.html", action=f'<button type="button" class="icon-btn" aria-label="Save to favourites" aria-pressed="false">{ic("heart")}</button>')}
<main class="screen__body" tabindex="0">
<div class="row-between"><span class="t-callout text-secondary"><b class="t-num-m">{a100[1]}</b> kcal per 100 g</span><span class="badge badge--verified">✓ USDA</span></div>
<section class="card" aria-labelledby="portion-title">
<h2 class="t-title" id="portion-title">Portion</h2>
<div class="chip-row" role="group" aria-label="Quick portions"><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}30 g · 1 handful</button><button type="button" class="chip" aria-pressed="false">50 g</button><button type="button" class="chip" aria-pressed="false">100 g</button></div>
<div class="row-between">{stepper("Almond weight", 30, "g", "almonds")}<span class="t-num-l">{a30["kcal"]} <span class="t-callout text-secondary">kcal</span></span></div>
{macro_tiles(a30)}
{meal_picker("Snack")}
</section>
<section class="facts" aria-labelledby="facts-title"><h2 class="facts__title" id="facts-title">Nutrition facts</h2><div class="facts__source"><span class="badge badge--verified">✓ USDA</span>Nuts, almonds · FoodData Central</div>
<table><caption class="visually-hidden">Nutrition facts for almonds: per 100 grams and per 30 gram portion</caption><thead><tr><th scope="col">Nutrient</th><th scope="col">Per 100 g</th><th scope="col">Per 30 g</th></tr></thead><tbody>{tr}</tbody></table></section>
</main>
<footer class="screen__foot"><button type="button" class="btn btn--primary btn--block" data-href="10-add-food.html">{ic("check")}Add to Snack · {a30["kcal"]} kcal</button></footer>"""
files.append(page("11-food-detail.html", "Almonds", "Ripe food detail: almonds per 100 g from USDA, a 30 g portion is 174 kcal.", body))

# ---------------------------------------------------------------------------
# 12 Dish calculator (red lentil soup)
# ---------------------------------------------------------------------------
pot = total(SOUP)
raw_g = sum(i["g"] for i in SOUP)
per100 = {k: pot[k] * 100 / SOUP_COOKED for k in ("kcal", "p", "f", "c")}
portion_g = SOUP_COOKED // SOUP_PORTIONS
portion = {k: pot[k] / SOUP_PORTIONS for k in ("kcal", "p", "f", "c")}
assert (pot["kcal"], r0(per100["kcal"]), r0(portion["kcal"]), portion_g) == (1229, 72, 246, 340)
short = {"red_lentils": "Red lentils", "onion": "Onion", "carrots": "Carrots", "garlic": "Garlic", "tomatoes": "Canned tomatoes", "olive_oil": "Olive oil", "water": "Water"}
ing = "".join(f'<tr><td>{short[i["key"]]}</td><td>{n(i["g"])} g</td><td>{i["kcal"]}</td></tr>' for i in SOUP)
body = f"""{status_bar("11:20")}
{app_bar("Red lentil soup", back="10-add-food.html", action=f'<button type="button" class="icon-btn" aria-label="Rename dish">{ic("diary")}</button>')}
<main class="screen__body" tabindex="0">
<section class="card" aria-labelledby="result-title">
<div class="row-between"><h2 class="t-title" id="result-title">Your dish</h2><span class="badge badge--fresh">Homemade · 5 portions</span></div>
<div class="row-between"><span><b class="t-num-l">{r0(per100["kcal"])}</b> <span class="t-callout text-secondary">kcal per 100 g</span></span><span><b class="t-num-l">{r0(portion["kcal"])}</b> <span class="t-callout text-secondary">kcal per portion</span></span></div>
<div class="row-between"><span class="t-label">Portions</span>{stepper("Number of portions", SOUP_PORTIONS, "portions", "portions")}</div>
<p class="t-callout text-secondary">{portion_g} g each. Per portion:</p>
{macro_tiles(portion)}
</section>
<div class="field"><label class="field__label" for="cooked">Cooked weight</label><div class="field__control"><input id="cooked" type="text" inputmode="decimal" value="{n(SOUP_COOKED)}"><span class="field__suffix">g</span></div><p class="field__help">{ic("info", "icon--s")}Weigh the pot when it's done and subtract the pot itself. Cooking changes the weight, so this makes per-100 g right.</p></div>
<section class="facts" aria-labelledby="ing-title"><h2 class="facts__title" id="ing-title">Ingredients</h2><div class="facts__source">Raw weights · <span class="badge badge--verified">✓ USDA</span></div>
<table><caption class="visually-hidden">Raw ingredients of red lentil soup with weight and kcal</caption><thead><tr><th scope="col">Ingredient</th><th scope="col">Raw</th><th scope="col">kcal</th></tr></thead>
<tbody>{ing}<tr class="is-energy"><td>Whole pot</td><td>{n(raw_g)} g</td><td>{n(pot["kcal"])}</td></tr></tbody></table>
<button type="button" class="btn btn--ghost" data-href="10-add-food.html">{ic("plus")}Add ingredient</button></section>
</main>
<footer class="screen__foot screen__foot--split"><button type="button" class="btn btn--secondary">Log a portion</button><button type="button" class="btn btn--primary">Save dish</button></footer>"""
files.append(page("12-dish-calculator.html", "Dish calculator", "Ripe dish calculator: red lentil soup, 1,229 kcal raw, 1,700 g cooked, 72 kcal per 100 g, 246 kcal per portion.", body))

# ---------------------------------------------------------------------------
# 13 Recipes
# ---------------------------------------------------------------------------
LEFT = GOAL["kcal"] - day(B, L, S)["kcal"]
assert LEFT == 879
RECIPES = [
    (DISH, COD, DISH_IMG, 30, "Covers your protein", "14-recipe-detail.html"),
    ("Shrimp &amp; broccoli stir-fry with rice", SHRIMP, "recipe-shrimp-vegetables.jpg", 20, "Covers your protein", None),
    ("Chickpea &amp; spinach curry with rice", CURRY, "recipe-chickpea-curry.jpg", 35, "Vegan", None),
]
cards = []
for i, (title, items, img, mins, why, href) in enumerate(RECIPES):
    t = total(items)
    best = f'<span class="badge badge--fresh">{ic("fresh")}Best fit</span>' if i == 0 else ""
    ttl = f'<a href="{href}">{title}</a>' if href else title
    cards.append(f'<article class="recipe-card recipe-card--compact"><div class="recipe-card__img"><img src="{IMG}/{img}" alt="" width="112" height="160"></div>'
                 f'<div class="recipe-card__body">{best}<h3 class="recipe-card__title">{ttl}</h3><div class="recipe-card__meta"><span>{ic("time", "icon--s")}{mins} min</span><span>{why}</span></div>'
                 f'<span class="recipe-card__fit">{ic("fresh", "icon--s")}Fits: {t["kcal"]} of {LEFT} kcal</span>'
                 f'<span class="recipe-card__kcal">{t["kcal"]} <small>kcal</small></span></div>'
                 f'<div class="recipe-card__foot">{macro_chips(t)}</div></article>')
body = f"""{status_bar("18:31")}
<header class="app-bar app-bar--large"><h1 class="app-bar__title">Recipes</h1><div class="app-bar__actions"><button type="button" class="icon-btn" aria-label="Search recipes">{ic("search")}</button><button type="button" class="icon-btn" aria-label="Saved recipes">{ic("heart")}</button></div></header>
<main class="screen__body" tabindex="0">
<div class="section-head"><h2>Fits your dinner</h2><span class="t-callout text-secondary"><b class="t-num-m">{LEFT}</b> kcal left</span></div>
<div class="chip-row" role="group" aria-label="Filters"><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}Dinner</button><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}≤ {LEFT} kcal</button><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}Pescatarian</button><span class="chip chip--locked">{ic("lock")}Peanut-free <small>Allergy</small></span><button type="button" class="chip" aria-pressed="false">≤ 30 min</button></div>
{"".join(cards)}
<div class="banner" role="note">{ic("info")}<p class="banner__text"><b>1 recipe hidden:</b> it contains peanuts. Change allergies in Profile.</p></div>
</main>
{tab_bar("recipes")}"""
files.append(page("13-recipes.html", "Recipes", "Ripe recipes that fit the 879 kcal left for dinner, pescatarian and peanut-free.", body))

# ---------------------------------------------------------------------------
# 14 Dish detail: view, edit (ingredients, name) and the log sheet
# The ingredients and totals are rendered and recalculated by screens/js/dish-editor.js
# from the JSON written here, so editing works without a reload.
# ---------------------------------------------------------------------------
import json

# Foods the editor knows (friendly name → USDA key, portion grams, density g/ml, allergens)
EDIT_FOODS = {
    "Cod fillet, baked": ("cod", 150, 1.0, ["fish"]),
    "Potatoes, boiled in skin": ("potatoes", 200, 1.0, []),
    "Broccoli, boiled": ("broccoli", 100, 1.0, []),
    "Olive oil": ("olive_oil", 13.5, 0.91, []),
    "Garlic": ("garlic", 3, 1.0, []),
    "Green peas, boiled": ("peas", 80, 1.0, []),
    "White rice, cooked": ("rice", 150, 1.0, []),
    "Salmon, cooked": ("salmon", 140, 1.0, ["fish"]),
    "Shrimp, cooked": ("shrimp", 150, 1.0, ["shellfish"]),
    "Spinach, raw": ("spinach", 30, 1.0, []),
    "Butter, salted": ("butter", 14, 0.96, ["milk"]),
    "Lemon juice": ("lemon_juice", 15, 1.0, []),
}
DISH_ING = [("Cod fillet, baked", 150), ("Potatoes, boiled in skin", 200), ("Broccoli, boiled", 100), ("Olive oil", 10), ("Garlic", 5)]
assert [k for k, _ in DISH_ING] and [EDIT_FOODS[k][0] for k, _ in DISH_ING] == [i["key"] for i in COD]
dish_g = sum(i["g"] for i in COD)
dish_data = {
    "name": "Baked cod, potatoes & broccoli",
    "nameMax": 60,
    "budget": LEFT,
    "goal": {k: GOAL[k] for k in ("p", "f", "c")},
    "back": "13-recipes.html",
    "freeFrom": "Free from peanuts, milk, gluten and egg.",
    "foods": {nm: {"kcal": USDA[k][1], "p": USDA[k][2], "f": USDA[k][3], "c": USDA[k][4], "portion": por, "density": den, "allergens": al}
              for nm, (k, por, den, al) in EDIT_FOODS.items()},
    "ingredients": [{"name": nm, "qty": str(g), "unit": "g"} for nm, g in DISH_ING],
    "steps": STEPS["cod"],
}
DATALIST = "".join(f'<option value="{nm}"></option>' for nm in EDIT_FOODS)


def dish_summary():
    t = DINNER
    dash = round(min(t["kcal"] / LEFT, 1) * ARC)
    rows = []
    for k, name in (("p", "Protein"), ("f", "Fat"), ("c", "Carbs")):
        v, g = r0(t[k]), GOAL[k]
        rows.append(f'<div class="macro macro--{k}" data-macro="{k}"><div class="macro__label"><i class="macro__key"></i>{k.upper()} · {name}</div>'
                    f'<div class="macro__value">{v}<small> g</small></div>'
                    f'<div class="macro__bar" role="meter" aria-label="{name}" aria-valuemin="0" aria-valuemax="{g}" aria-valuenow="{min(v, g)}" aria-valuetext="{v} of {g} grams a day"><i style="--w: {min(100, round(v / g * 100))}%"></i></div>'
                    f'<div class="macro__goal">of {g} g</div></div>')
    return ('<section class="nutri" aria-labelledby="sum-title"><h2 class="visually-hidden" id="sum-title">Per portion</h2>'
            f'<div class="nutri__ring"><svg id="ring" viewBox="0 0 256 136" role="img" aria-label="{n(t["kcal"])} of {n(LEFT)} kcal left for dinner">'
            '<path class="nutri__track" d="M16 128 A112 112 0 0 1 240 128" stroke-width="20"/>'
            f'<path id="ring-value" class="nutri__value" d="M16 128 A112 112 0 0 1 240 128" stroke-width="20" stroke-dasharray="{dash} 400"/></svg>'
            f'<div class="nutri__center"><b class="nutri__big" id="sum-kcal">{t["kcal"]}</b><small>kcal per portion</small></div></div>'
            f'<div class="nutri__row"><span>Dinner budget <b>{n(LEFT)}</b></span><span>Per 100 g <b id="sum-100">{r0(t["kcal"] * 100 / dish_g)}</b></span></div>'
            f'<div class="macros">{"".join(rows)}</div><p class="t-caption text-secondary">Bars show this portion against your daily goal.</p></section>')


def recipe_detail(file, state="view", sheet=False):
    inert = " inert" if sheet else ""
    sheet_html = ""
    if sheet:
        sheet_html = f"""<div class="screen__overlay"><div class="scrim"></div>
<dialog open class="sheet" aria-labelledby="log-title" aria-modal="true">
<div class="sheet__handle"></div>
<div class="sheet__head"><div><h2 class="sheet__title" id="log-title">Log to Dinner</h2><p class="sheet__sub">{DISH} · {DINNER["kcal"]} kcal per portion</p></div><button type="button" class="icon-btn" aria-label="Close" data-href="14-recipe-detail.html">{ic("close")}</button></div>
<div class="sheet__body">
{meal_picker("Dinner")}
<div class="sheet__row">{stepper("Portions", 1, "portion", "portions")}<span class="t-num-l">{DINNER["kcal"]} <span class="t-callout text-secondary">kcal</span></span></div>
{macro_tiles(DINNER)}
</div>
<div class="sheet__foot"><button type="button" class="btn btn--primary btn--block" data-href="07-today-dinner-added.html">{ic("check")}Add to Dinner · {DINNER["kcal"]} kcal</button></div>
</dialog></div>"""
    body = f"""{status_bar("18:32")}
<header class="app-bar"{inert}><button type="button" class="icon-btn" aria-label="Back to recipes" data-href="13-recipes.html" data-dish-back>{ic("back")}</button><span></span><button type="button" class="icon-btn" aria-label="Save recipe" aria-pressed="false">{ic("heart")}</button></header>
<main class="screen__body screen__body--flush" tabindex="0"{inert}>
<div class="photo screen__bleed"><img src="{IMG}/{DISH_IMG}" alt="{DISH_ALT}" width="390" height="244"></div>
<div class="title-row" id="title-view"><h1 class="t-h1" id="dish-title">{DISH}</h1><button type="button" class="icon-btn" id="edit-name" aria-label="Edit dish name">{ic("edit")}</button></div>
<form class="name-edit" id="name-form" hidden novalidate>
<div class="field" id="name-field"><div class="field__top"><label class="field__label" for="name-input">Dish name</label><span class="field__count" id="name-count">30 / 60</span></div>
<div class="field__control"><input id="name-input" type="text" autocomplete="off" aria-describedby="name-help name-count"></div>
<p class="field__help" id="name-help">Up to 60 characters. Shown in Recipes and your diary.</p></div>
<div class="name-edit__actions"><button type="submit" class="btn btn--primary btn--m" id="name-save">Save name</button><button type="button" class="btn btn--ghost btn--m" id="name-cancel">Cancel</button></div>
</form>
<div class="recipe-card__meta"><span class="badge badge--fresh">{ic("fresh")}Fits your dinner</span></div>
<div class="banner" role="note">{ic("alert")}<p class="banner__text" id="allergens-text"><b>Contains: fish.</b> Free from peanuts, milk, gluten and egg.</p></div>
{dish_summary()}
<div class="section-head" id="ing-head"><h2 id="ing-title">Ingredients · 1 portion</h2><button type="button" class="btn btn--ghost btn--m" id="edit-toggle" aria-label="Edit ingredients">{ic("edit", "icon--m")}Edit</button></div>
<ol class="ingredients" id="ingredients" aria-labelledby="ing-title"></ol>
<button type="button" class="btn btn--secondary" id="add-ingredient" hidden>{ic("plus")}Add ingredient</button>
<div class="section-head" id="method-head"><h2 id="method-title">Method</h2><button type="button" class="btn btn--ghost btn--m" id="edit-steps" aria-label="Edit method">{ic("edit", "icon--m")}Edit</button></div>
<div class="recipe-card__meta"><span>{ic("time", "icon--s")}Total 30 min</span><span>Serves 2</span></div>
<ol class="recipe-steps" id="steps" aria-labelledby="method-title"></ol>
<div class="empty" id="steps-empty" hidden><span class="empty__icon">{ic("diary", "icon--xl")}</span><h3 class="empty__title">No steps yet</h3><p class="empty__text">Add how to cook this dish, one action per step, so you can make it again.</p><div class="empty__actions"><button type="button" class="btn btn--primary" id="add-steps-empty">{ic("plus")}Add steps</button></div></div>
<button type="button" class="btn btn--secondary" id="add-step" hidden>{ic("plus")}Add step</button>
<p class="t-caption text-secondary" id="edit-note" hidden>Changes are saved as your version of this recipe. Values per 100 g from USDA FoodData Central; ml uses each food's density.</p>
<datalist id="foods">{DATALIST}</datalist>
<p class="visually-hidden" role="status" id="dish-status"></p>
</main>
<section class="screen__toast" aria-label="Notification" id="toast-row" hidden></section>
<footer class="screen__foot" id="foot-view" aria-label="Dish actions"{inert}><button type="button" class="btn btn--primary btn--block" data-href="14-recipe-detail-log.html">{ic("plus")}<span>Log 1 portion · <span id="log-btn-kcal">{DINNER["kcal"]}</span> kcal</span></button></footer>
<footer class="screen__foot screen__foot--split" id="foot-edit" aria-label="Edit actions" hidden><button type="button" class="btn btn--secondary" id="cancel-edit">Cancel</button><button type="button" class="btn btn--primary" id="save-edit">Save changes</button></footer>
<dialog class="sheet-dialog" id="discard" aria-labelledby="discard-title" aria-describedby="discard-desc">
<div class="sheet confirm"><div class="sheet__handle"></div>
<div class="sheet__head"><div><h2 class="sheet__title" id="discard-title">Discard changes?</h2><p class="sheet__sub" id="discard-desc">If you leave now, your changes to the ingredients are lost.</p></div></div>
<div class="sheet__foot"><button type="button" class="btn btn--secondary btn--block" id="keep-editing" autofocus>Keep editing</button><button type="button" class="btn btn--destructive btn--block" id="discard-confirm">Discard changes</button></div></div>
</dialog>
{sheet_html}"""
    extra = (f'\n<script type="application/json" id="dish-data">{json.dumps(dish_data)}</script>'
             '\n<script src="js/dish-editor.js"></script>')
    titles = {"view": DISH, "edit": "Edit ingredients", "edited": "Edited ingredients", "deleted": "Ingredient deleted",
              "name-error": "Dish name error", "saving": "Saving changes", "discard": "Discard changes?",
              "method": "Method", "steps-edit": "Edit method", "step-error": "Step error", "step-deleted": "Step deleted", "no-steps": "No steps yet"}
    return page(file, "Log to Dinner" if sheet else titles[state],
                f"Ripe dish detail: {DISH}, {DINNER['kcal']} kcal per portion. Edit ingredients and the dish name; totals update live.",
                body, body_attrs=f' data-state="{state}"', extra=extra)


files.append(recipe_detail("14-recipe-detail.html"))
for st in ("edit", "edited", "deleted", "name-error", "saving", "discard", "method", "steps-edit", "step-error", "step-deleted", "no-steps"):
    files.append(recipe_detail(f"14-recipe-detail-{st}.html", state=st))
files.append(recipe_detail("14-recipe-detail-log.html", sheet=True))

for f in files:
    print("wrote 03-screens/screens/" + f)

# ---------------------------------------------------------------------------
# Flows board: 03-screens/flows.html (exported to flows.png by tools/export.mjs)
# Steps show the PNG exports; numbered pins point at the UX decisions in the notes.
# ---------------------------------------------------------------------------
SCREEN_NAMES = {
    "07-today-before-lunch": ("07 Today", "13:09 · breakfast logged"),
    "08-scan": ("08 Scan", "Camera with plate guide"),
    "09-photo-result-analyzing": ("09 Photo result", "Loading: analyzing, 2–4 s"),
    "09-photo-result": ("09 Photo result", "4 foods, confidence, weights"),
    "07-today-lunch-added": ("07 Today", f"Lunch added · {n(day(B, L)['kcal'])} kcal"),
    "10-add-food": ("10 Add food", "Search “alm”, recents"),
    "11-food-detail": ("11 Food detail &amp; portion", "Almonds, 30 g"),
    "12-dish-calculator": ("12 Dish calculator", "Red lentil soup"),
    "07-today": ("07 Today", f"18:30 · {LEFT} kcal left"),
    "13-recipes": ("13 Recipes", "Fits your dinner"),
    "14-recipe-detail": ("14 Dish detail", DISH),
    "14-recipe-detail-log": ("14 Dish detail", "Log sheet"),
    "14-recipe-detail-edit": ("14 Dish detail", "Edit ingredients"),
    "14-recipe-detail-edited": ("14 Dish detail", "Potatoes 200 → 150 g: totals update"),
    "14-recipe-detail-deleted": ("14 Dish detail", "Garlic deleted, Undo"),
    "14-recipe-detail-discard": ("14 Dish detail", "Back with changes"),
    "14-recipe-detail-name-error": ("14 Dish detail", "Name: validation error"),
    "07-today-card": ("07 Today", "Dish card: chips + View recipe"),
    "14-recipe-detail-method": ("14 Dish detail", "Method: 6 steps"),
    "14-recipe-detail-steps-edit": ("14 Dish detail", "Edit steps: move, delete"),
    "14-recipe-detail-step-deleted": ("14 Dish detail", "Step deleted, Undo"),
    "14-recipe-detail-no-steps": ("14 Dish detail", "No steps: empty state"),
    "07-today-dinner-added": ("07 Today", f"Dinner added · {n(day(B, L, S, DINNER)['kcal'])} kcal"),
}

NOTES = {
    1: ("Camera is never the only way in", "Plate guide, three capture tips and a live hint. Library and Search sit next to the shutter."),
    2: ("Honest loading", "Plain steps and Cancel, no fake percentage. Nothing is saved yet, and the primary button says so."),
    3: ("Confidence on every food", "Icon + word: High, Check portion, Not sure. Never colour alone."),
    4: ("One concrete question", "“Check portion” tints the row and asks “Is 150 g right?”. “Not sure” offers the two likely answers and Search."),
    5: ("The button carries the result", "“Add to Lunch · 559 kcal”. Meal is preselected from the time; the estimate range is stated."),
    6: ("Undo, not “Are you sure?”", "Logging is reversible, so it's one tap plus Undo. The toast has no timer."),
    7: ("Two taps from search", "Recents first; one canonical entry per food with a ✓ USDA badge (research insight 2)."),
    8: ("Per 100 g + source", "The anchor value and its source stay on top; quick portions like “30 g · 1 handful”."),
    9: ("Cooked weight fixes home cooking", "Raw ingredients + the cooked pot weight → real kcal per 100 g and per portion (insight 1)."),
    10: ("Lead with what's left", f"The ring answers “can I have dinner?”: {LEFT} kcal left, and a recipe that fits it."),
    11: ("“Suits me” is visible", "Diet and allergy come from onboarding. The allergy is a locked chip (lock + “Allergy”) and can only change in Profile."),
    12: ("Ranked by fit, explained in words", f"Fits the kcal left → covers the protein gap → fewer kcal. “Fits: {DINNER['kcal']} of {LEFT} kcal”, with the reason next to the time."),
    13: ("Safety before the numbers", "Allergens in words above the fold; per-portion kcal and macros add up from the ingredients."),
    14: ("Log without leaving", "A bottom sheet: meal preselected, portions, the same macro tiles, one primary button."),
    15: ("Calm when over", f"Protein is {r0(day(B, L, S, DINNER)['p']) - GOAL['p']} g over: Turmeric and the words “{r0(day(B, L, S, DINNER)['p']) - GOAL['p']} over”. No red, no warning icon."),
    16: ("Fix a dish in place", "Edit turns each row into labelled fields: food, amount, unit. Kcal, the ring and the macro bars update as you type, and screen readers hear the new total."),
    17: ("Delete with Undo", "Focus moves to the next ingredient, so keyboard users don't get lost. The toast offers Undo and has no timer."),
    18: ("Don't lose work", "Leaving with unsaved changes asks “Discard changes?”, with “Keep editing” first."),
    20: ("A real “View recipe” button", "Secondary button, 12.8:1, 44 tall, named “View recipe: Baked cod, potatoes &amp; broccoli”. Enter, Space and click open the dish."),
    21: ("The method is part of the dish", "Numbered steps in an ordered list after Ingredients: 16 px text, line height 1.5, ≤ 80 characters a line. Time and servings above, in the card style."),
    22: ("Reorder without dragging", "Move up / Move down buttons (WCAG 2.5.7) keep focus on the moved step and announce its new position. Disabled at the ends, not hidden."),
    23: ("Never a blank section", "A recipe without steps shows “No steps yet” with “Add steps”, which opens a focused Step 1 field."),
    19: ("Errors say how to fix them", "Empty or too-long names get a message with an example; the field keeps its visible label and a live character count."),
}

FLOW1 = [
    ("07-today-before-lunch", []), ("Tap Scan", "tab bar"), ("08-scan", [(1, "88%", "52%")]),
    ("Shutter", ""), ("09-photo-result-analyzing", [(2, "76%", "20%")]), ("2–4 s", "automatic"),
    ("09-photo-result", [(3, "62%", "55%"), (4, "88%", "76%"), (5, "93%", "87%")]), ("Add to Lunch", "one tap"),
    ("07-today-lunch-added", [(6, "93%", "77%")]),
]
FLOW1B = [
    ("10-add-food", [(7, "58%", "24%")]), ("Tap Almonds", "from search"), ("11-food-detail", [(8, "62%", "15%")]),
    ("Create a dish", "also from Add food", "gap"), ("12-dish-calculator", [(9, "93%", "56%")]),
]
FLOW2 = [
    ("07-today", [(10, "78%", "18%")]), ("Recipes tab", "or the “Fits your dinner” card"),
    ("13-recipes", [(11, "90%", "26%"), (12, "93%", "48%")]), ("Tap Baked cod", ""),
    ("14-recipe-detail", [(13, "93%", "54%")]), ("Log 1 portion", ""), ("14-recipe-detail-log", [(14, "50%", "68%")]),
    ("Add to Dinner", "sheet closes"), ("07-today-dinner-added", [(15, "40%", "48%")]),
]
FLOW2C = [
    ("07-today-card", [(20, "60%", "86%")]), ("View recipe", "Enter / Space / tap"),
    ("14-recipe-detail-method", [(21, "93%", "38%")]), ("Edit method", ""),
    ("14-recipe-detail-steps-edit", [(22, "60%", "47%")]), ("Delete step 3", "Undo in the toast"),
    ("14-recipe-detail-step-deleted", []), ("No steps", "another recipe", "gap"),
    ("14-recipe-detail-no-steps", [(23, "50%", "78%")]),
]
FLOW2B = [
    ("14-recipe-detail-edit", [(16, "93%", "80%")]), ("Change an amount", "totals update live"),
    ("14-recipe-detail-edited", []), ("Delete Garlic", ""),
    ("14-recipe-detail-deleted", [(17, "93%", "86%")]), ("Back", "with changes"),
    ("14-recipe-detail-discard", [(18, "50%", "80%")]), ("Edit the name", "pencil next to the title", "gap"),
    ("14-recipe-detail-name-error", [(19, "93%", "54%")]),
]


def steps(seq):
    out = ['<ol class="steps">']
    for s in seq:
        if s[0] in SCREEN_NAMES:
            name, state = SCREEN_NAMES[s[0]]
            pins = "".join(f'<span class="pin" style="--x: {x}; --y: {y}" aria-hidden="true">{k}</span>' for k, x, y in s[1])
            out.append(f'<li class="step"><figure class="step__frame"><img src="exports/{s[0]}.png" alt="Screen {name}: {state}" width="312" height="675">{pins}</figure>'
                       f'<div class="step__cap"><b>{name}</b><span>{state}</span></div></li>')
        else:
            label, sub = s[0], s[1]
            gap = " arrow--gap" if len(s) > 2 else ""
            out.append(f'<li class="arrow{gap}"><span class="arrow__line">{ic("chev-r")}</span>'
                       f'<span class="arrow__label">{label}{f"<small>{sub}</small>" if sub else ""}</span></li>')
    out.append("</ol>")
    return "".join(out)


def notes(nums):
    return '<ol class="notes">' + "".join(
        f'<li><span class="pin" aria-hidden="true">{k}</span><div><b>{k}. {NOTES[k][0]}</b><p>{NOTES[k][1]}</p></div></li>' for k in nums) + "</ol>"


board = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ripe · Key flows</title>
  <meta name="description" content="Ripe flows board: calculate calories from a photo, a product or a home-cooked dish, and find a recipe that fits what's left today.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&amp;family=Hanken+Grotesk:wght@400;500;600;700&amp;family=Azeret+Mono:wght@400;500;600&amp;display=swap">
  <link rel="stylesheet" href="../02-design-system/tokens.css">
  <link rel="stylesheet" href="../02-design-system/components.css">
  <link rel="stylesheet" href="./flows.css">
</head>
<body>
<!-- GENERATED by 03-screens/tools/build_screens.py. Edit the generator, not this file. -->
{SPRITE}
<div class="board">
<header class="board-head">
  <div><span class="t-overline text-accent">03 · Key screens and flows</span><h1>Ripe: two user stories, end to end</h1>
  <p>Persona Sam: 2,050 kcal a day, pescatarian, allergic to peanuts. One Thursday: breakfast 344, lunch from a photo 559, snack 268, then a dinner that fits the {LEFT} kcal left. All values are USDA FoodData Central per 100 g, scaled to the portion.</p></div>
  <ul class="legend"><li>{ic("chev-r")}Tap or system step</li><li><span class="pin" aria-hidden="true">1</span>UX decision, explained below</li><li><span class="badge badge--verified">✓ USDA</span>Real nutrition data</li></ul>
</header>
<main>
<section class="flow" aria-labelledby="f1">
  <div class="flow__head"><span class="t-overline text-accent">Flow 1 · User story 1</span><h2 id="f1">Calculate calories in a dish or product</h2>
  <p>The main path is a photo: snap, check, add. Search and the dish calculator cover packaged foods and home cooking, and all three end in the same “add a portion” step.</p></div>
  <h3 class="flow__sub">1A · From a photo (main path)</h3>
  {steps(FLOW1)}
  <h3 class="flow__sub">1B · Search a product · 1C · Home-cooked dish</h3>
  {steps(FLOW1B)}
  {notes(range(1, 10))}
</section>
<section class="flow" aria-labelledby="f2">
  <div class="flow__head"><span class="t-overline text-accent">Flow 2 · User story 2</span><h2 id="f2">Find a recipe that suits me</h2>
  <p>“Suits me” means my diet and allergies (hard filters) and what's left today (ranking). The recipe is logged in two taps, and Today updates.</p></div>
  {steps(FLOW2)}
  <h3 class="flow__sub">2B · Fix a dish that was entered wrong</h3>
  {steps(FLOW2B)}
  <h3 class="flow__sub">2C · From the Today card to the method</h3>
  {steps(FLOW2C)}
  {notes(range(10, 24))}
</section>
</main>
<footer class="board-foot">Screens: 390 × 844 pt, exported at 2× with Playwright. Built only from 02-design-system tokens and components. Photos: Unsplash and Pixabay (see 01-branding/assets/CREDITS.md). Full spec: 03-screens/FLOWS.md.</footer>
</div>
</body>
</html>
"""
(ROOT / "03-screens" / "flows.html").write_text(board)
print("wrote 03-screens/flows.html")
