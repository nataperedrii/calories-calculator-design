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
    tabs = [("today", "Today", "07-today.html"), ("diary", "Diary", "15-diary.html"), ("scan", None, "08-scan.html"),
            ("recipes", "Recipes", "13-recipes.html"), ("profile", "Profile", "16-profile.html")]
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


def macro_chips(t, extra=""):
    """P / F / C chips: the compact form of the design-system macro tile (same tokens as the detail screen)."""
    out = []
    for k, letter, word in (("p", "P", "Protein"), ("f", "F", "Fat"), ("c", "C", "Carbs")):
        out.append(f'<span class="macro-tile macro-tile--{k} macro-tile--chip"><span class="macro-tile__label" aria-hidden="true">{letter}</span>'
                   f'<span class="visually-hidden">{word}</span><span class="macro-tile__value">{r0(t[k])}<small> g</small></span></span>')
    return f'<div class="macro-tiles macro-tiles--inline{(" " + extra) if extra else ""}">{"".join(out)}</div>'


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


def nutri(d, label="Today's calories and macros", left_text="kcal left today"):
    eaten, left = d["kcal"], GOAL["kcal"] - d["kcal"]
    over_kcal = left < 0
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
    return (f'<section class="nutri{" nutri--over" if over_kcal else ""}" aria-label="{label}">'
            f'<div class="nutri__ring"><svg viewBox="0 0 256 136" role="img" aria-label="{n(eaten)} of {n(GOAL["kcal"])} kcal eaten{f", {n(-left)} over" if over_kcal else ""}">'
            '<path class="nutri__track" d="M16 128 A112 112 0 0 1 240 128" stroke-width="20"/>'
            + (f'<path class="nutri__value" d="M16 128 A112 112 0 0 1 240 128" stroke-width="20" stroke-dasharray="{dash} 400"/>' if dash else "") + '</svg>'
            f'<div class="nutri__center"><b class="nutri__big">{n(abs(left))}</b><small>{"kcal over" if over_kcal else left_text}</small></div></div>'
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
  // Pointer-only image links (aria-hidden, no tab stop): pressed feedback for touch, where :active on a div is unreliable.
  const pressable = ".recipe-card__img--link";
  document.addEventListener("pointerdown", (e) => e.target.closest(pressable)?.classList.add("is-pressed"));
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
    document.addEventListener(ev, () => document.querySelectorAll(pressable + ".is-pressed").forEach((el) => el.classList.remove("is-pressed")), true));
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
FIRST_DAY = (f'<div class="empty"><span class="empty__icon">{ic("scan", "icon--xl")}</span><h2 class="empty__title">Snap your first meal</h2>'
             f'<p class="empty__text">We\'ll find the foods and portions. You check them, then add.</p>'
             f'<div class="empty__actions"><button type="button" class="btn btn--primary" data-href="08-scan.html">{ic("scan")}Open camera</button>'
             f'<button type="button" class="btn btn--secondary" data-href="10-add-food.html">{ic("search")}Search instead</button></div></div>')


def today(file, time, meals, toast_msg=None, card=False, title_note="Thursday", scroll=None, first_day=False):
    d = day(*[m["total"] for m in meals if m.get("total")])
    rows = "".join(meal_row(m["name"], m["meta"], m.get("total", {}).get("kcal"), m.get("img"), m.get("href"), m.get("add")) for m in meals)
    left = GOAL["kcal"] - d["kcal"]
    rec = ""
    if card:
        rec = (f'<div class="section-head" id="fits-head"><h2>Fits your dinner</h2><button type="button" class="btn btn--ghost btn--m" data-href="13-recipes.html">See more</button></div>'
               f'<article class="recipe-card"><div class="recipe-card__img recipe-card__img--link" data-href="14-recipe-detail.html" aria-hidden="true"><img src="{IMG}/{DISH_IMG}" alt="" width="350" height="219"></div>'
               f'<div class="recipe-card__body"><span class="badge badge--fresh">{ic("fresh")}Fits your dinner</span><h3 class="recipe-card__title">{DISH}</h3>'
               f'<div class="recipe-card__meta"><span>{ic("time", "icon--s")}30 min</span><span>Covers your protein</span></div>{macro_chips(DINNER)}'
               f'<div class="recipe-card__foot"><span class="recipe-card__kcal">{DINNER["kcal"]} <small>kcal</small></span><button type="button" class="btn btn--secondary btn--m" data-href="14-recipe-detail.html" aria-label="View recipe: {DISH}">View recipe</button></div></div></article>')
    body = f"""{status_bar(time)}
<header class="app-bar app-bar--large"><h1 class="app-bar__title">Today</h1></header>
<main class="screen__body" tabindex="0">
<button type="button" class="date-btn">{ic("calendar")}<span><b>{title_note}</b> · {n(left)} kcal left<span class="visually-hidden">. Pick another day</span></span></button>
{nutri(d)}
{FIRST_DAY if first_day else ""}<div class="section-head" id="meals-head"><h2>Meals</h2><span class="t-callout text-secondary"><b class="t-num-m">{n(d["kcal"])}</b> kcal eaten</span></div>
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


def food_row(key, img, name=None, href=None, add_label=None):
    nm, kcal, p, f, c = USDA[key]
    name = name or nm
    go = f' data-href="{href}"' if href else ""
    # Search row: the product photo (the Meals thumbnail component) with the name beside it, top-aligned;
    # P / F / C chips under the photo; kcal per 100 g + Add on the right edge, centred on the whole row.
    # The photo is decorative next to the name: alt="".
    return (f'<div class="product product--chips"{go}><img class="product__thumb" src="{IMG}/{img}" alt="" width="48" height="48">'
            f'<div class="product__name">{name}</div>'
            f'<div class="product__end"><span class="product__kcal">{kcal}<small>per 100 g</small></span>'
            f'<button type="button" class="icon-btn icon-btn--tint" aria-label="{add_label or "Add " + name.lower()}"{go}>{ic("plus")}</button></div>'
            f'{macro_chips({"p": p, "f": f, "c": c}, "product__macros")}</div>')


body = f"""{status_bar("16:30")}
{app_bar("Add to Snack", back="07-today.html", action=f'<button type="button" class="icon-btn" aria-label="Scan a barcode" data-href="08-scan.html">{ic("barcode")}</button>')}
<main class="screen__body" tabindex="0">
<div class="search">{ic("search")}<input type="search" value="alm" aria-label="Search foods and dishes" autocomplete="off"><button type="button" class="icon-btn" aria-label="Clear search">{ic("close")}</button></div>
<div class="section-head"><h2>Results for “alm”</h2><span class="t-callout text-secondary">3 foods · per 100 g</span></div>
<div class="list">{food_row("almonds", "food-almonds.jpg", href="11-food-detail.html")}{food_row("almonds_roasted", "food-roasted-almonds.jpg", name="Roasted almonds")}{food_row("almond_butter", "food-almond-butter.jpg")}</div>
<div class="section-head"><h2>Recent</h2><span class="t-callout text-secondary">Two taps to log</span></div>
<div class="list">{food_row("apple", "food-apple.jpg", name="Apple")}{food_row("yogurt", "food-greek-yogurt.jpg", name="Greek yogurt")}</div>
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
{segmented("Unit", "unit", ["g", "portion"], "g")}
<div class="chip-row" role="group" aria-label="Quick portions"><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}30 g · 1 handful</button><button type="button" class="chip" aria-pressed="false">50 g</button><button type="button" class="chip" aria-pressed="false">100 g</button></div>
<div class="row-between">{stepper("Almond weight", 30, "g", "almonds").replace('class="stepper__input"', 'class="stepper__input" id="portion-input"').replace('<small aria-hidden="true">g</small>', '<small aria-hidden="true" id="portion-unit">g</small>')}<span class="t-num-l">{a30["kcal"]} <span class="t-callout text-secondary">kcal</span></span></div>
{macro_tiles(a30)}
{meal_picker("Snack")}
</section>
<section class="facts" aria-labelledby="facts-title"><h2 class="facts__title" id="facts-title">Nutrition facts</h2><div class="facts__source"><span class="badge badge--verified">✓ USDA</span>Nuts, almonds · FoodData Central</div>
<table><caption class="visually-hidden">Nutrition facts for almonds: per 100 grams and per 30 gram portion</caption><thead><tr><th scope="col">Nutrient</th><th scope="col">Per 100 g</th><th scope="col">Per 30 g</th></tr></thead><tbody>{tr}</tbody></table></section>
</main>
<footer class="screen__foot"><button type="button" class="btn btn--primary btn--block" data-href="10-add-food.html">{ic("check")}Add to Snack · {a30["kcal"]} kcal</button></footer>"""
# Unit switch: the same 30 g shown as grams or as 1 portion (1 handful); kcal and macros don't change
UNIT_SCRIPT = """
<script>
  document.querySelectorAll('input[name="unit"]').forEach((r) => r.addEventListener("change", () => {
    const portion = r.value === "portion";
    const input = document.getElementById("portion-input");
    input.value = portion ? "1" : "30";
    input.setAttribute("aria-label", portion ? "Almond amount in portions (1 portion = 30 g)" : "Almond weight in grams");
    document.getElementById("portion-unit").textContent = portion ? "portion" : "g";
  }));
</script>"""
files.append(page("11-food-detail.html", "Almonds", "Ripe food detail: almonds per 100 g from USDA, a 30 g portion is 174 kcal.", body, extra=UNIT_SCRIPT))

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
RECIPE_ALLERGENS = {RECIPES[1][0]: "shellfish"}  # the shrimp stir-fry; the hidden peanut bowl is counted below


def recipes_screen(file, allergies=("peanuts",), description="Ripe recipes that fit the 879 kcal left for dinner, pescatarian and peanut-free."):
    cards = []
    shown = [r for r in RECIPES if RECIPE_ALLERGENS.get(r[0]) not in allergies]
    for i, (title, items, img, mins, why, href) in enumerate(shown):
        t = total(items)
        best = f'<span class="badge badge--fresh">{ic("fresh")}Best fit</span>' if i == 0 else ""
        ttl = f'<a href="{href}">{title}</a>' if href else title
        cards.append(f'<article class="recipe-card recipe-card--compact"><div class="recipe-card__img"><img src="{IMG}/{img}" alt="" width="80" height="80"></div>'
                     f'<div class="recipe-card__body">{best}<h3 class="recipe-card__title">{ttl}</h3>'
                     f'<div class="recipe-card__meta"><span>{ic("time", "icon--s")}{mins} min</span></div><div class="recipe-card__meta"><span>{why}</span></div>'
                     f'{macro_chips(t)}'
                     f'<span class="recipe-card__fit">{ic("fresh", "icon--s")}Fits: {t["kcal"]} of {LEFT} kcal</span>'
                     f'<span class="recipe-card__kcal">{t["kcal"]} <small>kcal</small></span></div></article>')
    locked = "".join(f'<span class="chip chip--locked">{ic("lock")}{a.capitalize()[:-1] if a.endswith("s") else a.capitalize()}-free <small>Allergy</small></span>' for a in allergies)
    hidden = 1 + (len(RECIPES) - len(shown))  # the peanut noodle bowl is always hidden for Sam
    note = ("<b>1 recipe hidden:</b> it contains peanuts." if hidden == 1
            else f"<b>{hidden} recipes hidden:</b> they contain {' or '.join(allergies)}.")
    body = f"""{status_bar("18:31")}
<header class="app-bar app-bar--large"><h1 class="app-bar__title">Recipes</h1><div class="app-bar__actions"><button type="button" class="icon-btn" aria-label="Search recipes">{ic("search")}</button><button type="button" class="icon-btn" aria-label="Saved recipes">{ic("heart")}</button></div></header>
<main class="screen__body" tabindex="0">
<div class="section-head"><h2>Fits your dinner</h2><span class="t-callout text-secondary"><b class="t-num-m">{LEFT}</b> kcal left</span></div>
<div class="chip-row" role="group" aria-label="Filters"><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}Dinner</button><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}≤ {LEFT} kcal</button><button type="button" class="chip is-selected" aria-pressed="true">{ic("check")}Pescatarian</button>{locked}<button type="button" class="chip" aria-pressed="false">High protein</button><button type="button" class="chip" aria-pressed="false">≤ 30 min</button></div>
{"".join(cards)}
<div class="banner" role="note">{ic("info")}<p class="banner__text">{note} Change allergies in Profile.</p></div>
</main>
{tab_bar("recipes")}"""
    return page(file, "Recipes", description, body)


files.append(recipes_screen("13-recipes.html"))

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
    "servingsMax": 8,
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


# Servings: the DS weight stepper (component 06) scales the ingredient amounts; the summary stays per portion.
servings_stepper = (stepper("Servings", 1, "portion", "servings")
                    .replace('aria-label="Less servings"', 'aria-label="Less servings" data-servings="-1" disabled')
                    .replace('aria-label="More servings"', 'aria-label="More servings" data-servings="1"')
                    .replace('class="stepper__input"', 'class="stepper__input" id="servings-input"')
                    .replace('<small aria-hidden="true">portion</small>', '<small aria-hidden="true" id="servings-unit">portion</small>'))


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
<section class="facts" id="ing-head" aria-labelledby="ing-title">
<div class="row-between"><h2 class="facts__title" id="ing-title">Ingredients</h2><button type="button" class="btn btn--ghost btn--m" id="edit-toggle" aria-label="Edit ingredients">{ic("edit", "icon--m")}Edit</button></div>
<div class="facts__source"><span><span id="servings-text">1 portion</span> · </span><span class="badge badge--verified">✓ USDA</span></div>
<div class="row-between ingredients__servings" id="servings-row"><span class="t-label" id="servings-label">Servings</span>{servings_stepper}</div>
<div class="ingredients__head" aria-hidden="true"><span>Ingredient</span><span>Amount</span></div>
<ol class="ingredients ingredients--facts" id="ingredients" aria-labelledby="ing-title"></ol>
</section>
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
              "method": "Method", "steps-edit": "Edit method", "step-error": "Step error", "step-deleted": "Step deleted", "no-steps": "No steps yet", "servings": "Ingredients for 2 portions"}
    return page(file, "Log to Dinner" if sheet else titles[state],
                f"Ripe dish detail: {DISH}, {DINNER['kcal']} kcal per portion. Edit ingredients and the dish name; totals update live.",
                body, body_attrs=f' data-state="{state}"', extra=extra)


files.append(recipe_detail("14-recipe-detail.html"))
for st in ("edit", "edited", "deleted", "name-error", "saving", "discard", "method", "steps-edit", "step-error", "step-deleted", "no-steps", "servings"):
    files.append(recipe_detail(f"14-recipe-detail-{st}.html", state=st))
files.append(recipe_detail("14-recipe-detail-log.html", sheet=True))

# ---------------------------------------------------------------------------
# Onboarding 01–06 (flow 0), first-day Today, Diary 15, Profile 16 (flow 3)
# New DS components: 25 step indicator (.progress), 26 option card, 27 week strip
# ---------------------------------------------------------------------------
def progress(cur, total_steps=5):
    segs = "".join(f'<span class="progress__seg{" is-done" if i < cur else (" is-current" if i == cur else "")}"></span>' for i in range(1, total_steps + 1))
    return f'<div class="progress"><p class="progress__text">Step {cur} of {total_steps}</p><div class="progress__bar" aria-hidden="true">{segs}</div></div>'


def option_card(name, value, title, desc="", checked=False, kind="radio"):
    d = f'<span class="option-card__desc">{desc}</span>' if desc else ""
    mod = " option-card--check" if kind == "checkbox" else ""
    chk = " checked" if checked else ""
    return (f'<label class="option-card{mod}"><input class="visually-hidden" type="{kind}" name="{name}" value="{value}"{chk}>'
            f'<span class="option-card__body"><span class="option-card__title">{title}</span>{d}</span><span class="option-card__mark" aria-hidden="true">{ic("check")}</span></label>')


def option_group(legend, cards, visible=True):
    lg = "option-group__legend" if visible else "visually-hidden"
    return f'<fieldset class="option-group"><legend class="{lg}">{legend}</legend>{"".join(cards)}</fieldset>'


def setup_bar(back, action=""):
    left = f'<button type="button" class="icon-btn" aria-label="Back" data-href="{back}">{ic("back")}</button>' if back else "<span></span>"
    return f'<header class="app-bar">{left}<span></span>{action or "<span></span>"}</header>'


def onboarding(file, title, description, step, heading, content, cta_href, back, skip=None, cta="Continue", cta_attrs="", extra="", body_attrs=""):
    action = f'<button type="button" class="btn btn--ghost btn--m" data-href="{skip}">Skip</button>' if skip else ""
    body = f"""{status_bar("08:02")}
{setup_bar(back, action)}
<main class="screen__body" tabindex="0">
{progress(step)}
<h1 class="t-h1">{heading}</h1>
{content}
</main>
<footer class="screen__foot"><button type="button" class="btn btn--primary btn--block" data-href="{cta_href}"{cta_attrs}>{cta}</button></footer>"""
    return page(file, title, description, body, extra=extra, body_attrs=body_attrs)


def field(fid, label, value, help_text, suffix="", error=None, mode="numeric"):
    err = " is-error" if error else ""
    inv = ' aria-invalid="true"' if error else ""
    sfx = f'<span class="field__suffix">{suffix}</span>' if suffix else ""
    hp = f'{ic("alert", "icon--s")}{error}' if error else help_text
    return (f'<div class="field{err}"><label class="field__label" for="{fid}">{label}</label><div class="field__control">'
            f'<input id="{fid}" type="text" inputmode="{mode}" value="{value}" autocomplete="off" aria-describedby="{fid}-help"{inv}>{sfx}</div>'
            f'<p class="field__help" id="{fid}-help">{hp}</p></div>')


# 01 Welcome & sign-in: passkey first, an email link second, never a password
def welcome(file, sent=False):
    if sent:
        main = (f'<div><img src="{IMG}/logo/ripe-logo.svg" alt="Ripe" width="134" height="46"></div>'
                f'<h1 class="t-h1">Check your inbox</h1>'
                f'<p class="t-body text-secondary" role="status">We sent a sign-in link to <b>sam@example.com</b>. It works for 15 minutes. Open it on this phone to continue.</p>'
                f'<div class="field"><label class="field__label" for="email">Email</label><div class="field__control"><input id="email" type="email" value="sam@example.com" autocomplete="email" aria-describedby="email-help"></div>'
                f'<p class="field__help" id="email-help">Wrong address? Change it and send the link again.</p></div>'
                f'<button type="button" class="btn btn--ghost btn--m">Resend link</button>')
        foot = (f'<button type="button" class="btn btn--primary btn--block" data-href="02-goal.html">Open your email app</button>'
                f'<button type="button" class="btn btn--secondary btn--block" data-href="01-welcome.html">Continue with a passkey</button>')
    else:
        main = (f'<div class="photo screen__bleed"><img src="{IMG}/dish-salmon-rice-broccoli.jpg" alt="A plate of salmon, rice and broccoli" width="390" height="244"></div>'
                f'<div><img src="{IMG}/logo/ripe-logo.svg" alt="Ripe" width="134" height="46"></div>'
                f'<h1 class="t-display">Point, snap, know.</h1>'
                f'<p class="t-body text-secondary">Calories from a photo. Check them, tap once, back to your meal.</p>')
        foot = (f'<button type="button" class="btn btn--primary btn--block" data-href="02-goal.html">Continue with a passkey</button>'
                f'<button type="button" class="btn btn--secondary btn--block" data-href="01-welcome-link.html">Email me a sign-in link</button>')
    body = f"""{status_bar("08:00")}
<main class="screen__body" tabindex="0">
{main}
</main>
<footer class="screen__foot">{foot}<p class="screen__note">By continuing you agree to the Terms and Privacy Policy. Not medical advice.</p></footer>"""
    return page(file, "Welcome" if not sent else "Check your inbox", "Ripe welcome: sign in with a passkey or an email link, no password.", body)


files.append(welcome("01-welcome.html"))
files.append(welcome("01-welcome-link.html", sent=True))

# 02 Your goal
files.append(onboarding("02-goal.html", "Your goal", "Ripe onboarding step 1 of 5: choose a goal. Maintain is preselected.", 1,
    "What would you like Ripe to help with?",
    option_group("Your goal", [
        option_card("goal", "maintain", "Maintain", "Eat well and keep your weight.", checked=True),
        option_card("goal", "lose", "Lose slowly", "About 0.25 kg a week (−250 kcal a day)."),
        option_card("goal", "gain", "Gain", "About 0.25 kg a week (+250 kcal a day)."),
        option_card("goal", "track", "Just track", "No target. Only see what you eat."),
    ], visible=False) + '<p class="t-callout text-secondary">You can change this any time in Profile.</p>',
    "03-about-you.html", "01-welcome.html"))


# 03 About you (Sam): Mifflin-St Jeor needs age, height, weight and the sex for the formula
def about_you(file, height="165", error=None):
    content = (f'<p class="t-callout text-secondary">We use these only to estimate your daily calories. They stay on your account and are never shared.</p>'
               + segmented("Units", "units", ["Metric", "Imperial"], "Metric")
               + field("age", "Age", "34", "18 to 100 years", "years")
               + field("height", "Height", height, "120 to 230 cm", "cm", error)
               + field("weight", "Weight", "63", "35 to 250 kg", "kg")
               + option_group("Sex for the formula", [
                   option_card("sex", "female", "Female", checked=True),
                   option_card("sex", "male", "Male"),
                   option_card("sex", "unsaid", "Prefer not to say", "We use the average of both formulas."),
               ])
               + option_group("How active are you?", [
                   option_card("activity", "1.2", "Mostly sitting", "×1.2 · little or no exercise"),
                   option_card("activity", "1.375", "Lightly active", "×1.375 · 1–3 workouts a week"),
                   option_card("activity", "1.55", "Moderately active", "×1.55 · 3–5 workouts a week", checked=True),
                   option_card("activity", "1.725", "Very active", "×1.725 · hard exercise 6–7 days a week"),
               ]))
    return onboarding(file, "About you" if not error else "About you: check height", "Ripe onboarding step 2 of 5: age, height, weight, sex for the formula and activity.", 2,
                      "About you", content, "04-diet.html", "02-goal.html", cta_attrs=" disabled" if error else "",
                      body_attrs=' data-scroll-to="age"' if error else "")


files.append(about_you("03-about-you.html"))
files.append(about_you("03-about-you-error.html", height="1650", error="Enter a height between 120 and 230 cm"))

# 04 Diet type: a hard filter for recipes
DIETS = [("none", "No preference", "Everything"), ("vegetarian", "Vegetarian", "No meat or fish"), ("vegan", "Vegan", "No animal products"),
         ("pescatarian", "Pescatarian", "Fish and seafood, no meat"), ("mediterranean", "Mediterranean", "Vegetables, fish, olive oil"),
         ("lowcarb", "Lower-carb", "Under 130 g carbs a day")]
files.append(onboarding("04-diet.html", "Diet", "Ripe onboarding step 3 of 5: diet type, a hard filter for recipe suggestions.", 3,
    "Do you follow a diet?",
    '<p class="t-callout text-secondary">Recipes that don\'t fit it are never suggested.</p>'
    + option_group("Diet", [option_card("diet", v, ttl, d, checked=v == "pescatarian") for v, ttl, d in DIETS], visible=False),
    "05-allergies.html", "03-about-you.html", skip="05-allergies.html"))

# 05 Allergies & dislikes: allergies are a hard filter, dislikes a soft one
ALLERGENS = ["Gluten", "Milk", "Egg", "Peanuts", "Tree nuts", "Soy", "Fish", "Shellfish", "Sesame", "Mustard", "Celery", "Lupin", "Sulphites", "Molluscs"]


def chip(label, selected=False):
    return (f'<button type="button" class="chip{" is-selected" if selected else ""}" aria-pressed="{"true" if selected else "false"}">'
            f'{ic("check") if selected else ""}{label}</button>')


def allergies_content(selected):
    return (f'<h2 class="t-title" id="allergy-title">Allergies</h2>'
            f'<div class="chip-row" role="group" aria-labelledby="allergy-title">{chip("None")}{"".join(chip(a, a in selected) for a in ALLERGENS)}</div>'
            f'<div class="banner" role="note">{ic("info")}<p class="banner__text">We hide recipes with these allergens. Always check product labels: we can\'t guarantee packaged foods are free of traces.</p></div>'
            f'<h2 class="t-title" id="dislike-title">Foods you\'d rather skip</h2>'
            f'<div class="chip-row" role="group" aria-labelledby="dislike-title">{chip("Mushrooms", True)}{chip("Olives")}{chip("Coriander")}{chip("Blue cheese")}</div>'
            + field("dislike", "Add another food", "", "Recipes with these move to the end of the list.", mode="text"))


files.append(onboarding("05-allergies.html", "Allergies", "Ripe onboarding step 4 of 5: allergies (a hard filter) and foods to skip (a soft one).", 4,
    "Allergies and dislikes", allergies_content({"Peanuts"}), "06-target.html", "04-diet.html", skip="06-target.html"))


# 05 in edit mode, from Profile (flow 3): no step indicator, Save returns to Profile
def allergies_edit(file):
    body = f"""{status_bar("19:05")}
{app_bar("Allergies and dislikes", back="16-profile.html")}
<main class="screen__body" tabindex="0">
{allergies_content({"Peanuts", "Shellfish"})}
</main>
<footer class="screen__foot"><button type="button" class="btn btn--primary btn--block" data-href="16-profile-updated.html">{ic("check")}Save</button></footer>"""
    return page(file, "Edit allergies", "Ripe Profile: edit allergies. Shellfish added; Save re-filters recipes.", body)


files.append(allergies_edit("05-allergies-edit.html"))

# 06 Your daily target: Mifflin-St Jeor for Sam, macros, Adjust with a safety floor
BMR = r0(10 * 63 + 6.25 * 165 - 5 * 34 - 161)
TDEE = r0(BMR * 1.55)
FLOOR = max(r0((TDEE - 500) / 50) * 50, BMR)
assert (BMR, TDEE, GOAL["kcal"], FLOOR) == (1330, 2062, 2050, 1550), (BMR, TDEE, FLOOR)
TARGET_SCRIPT = """
<script>
  // Adjust in 50 kcal steps; never below the floor. Fat is about 30.75 percent of kcal, protein 1.6 g/kg, carbs the rest.
  (() => {
    const FLOOR = %d, P = %d;
    let kcal = %d;
    const $ = (id) => document.getElementById(id);
    const fmt = (x) => x.toLocaleString("en-US");
    function render(announce) {
      const f = Math.round(kcal * 0.3075 / 9), c = Math.round((kcal - P * 4 - f * 9) / 4);
      $("target-kcal").textContent = fmt(kcal);
      $("target-input").value = String(kcal);
      $("macro-f").textContent = f; $("macro-c").textContent = c;
      for (const [k, g, per] of [["p", P, 4], ["f", f, 9], ["c", c, 4]]) {
        const pct = Math.round(g * per / kcal * 100), m = document.querySelector(`[data-macro="${k}"]`), bar = m.querySelector(".macro__bar");
        bar.setAttribute("aria-valuenow", pct); bar.setAttribute("aria-valuetext", `${pct}%% of calories`);
        bar.querySelector("i").style.setProperty("--w", `${pct}%%`);
        m.querySelector(".macro__goal").textContent = `${pct}%% of kcal`;
      }
      const less = $("target-less");
      less.disabled = kcal <= FLOOR;
      $("floor-note").hidden = kcal > FLOOR;
      if (announce) $("target-status").textContent = `Daily target ${fmt(kcal)} kcal` + (kcal <= FLOOR ? ". This is the lowest target for you." : ".");
    }
    $("target-less").addEventListener("click", () => { kcal = Math.max(FLOOR, kcal - 50); render(true); if ($("target-less").disabled) $("target-more").focus(); });
    $("target-more").addEventListener("click", () => { kcal += 50; render(true); });
    $("calc-toggle").addEventListener("click", (e) => { const open = e.currentTarget.getAttribute("aria-expanded") === "true"; e.currentTarget.setAttribute("aria-expanded", String(!open)); $("calc").hidden = open; });
    if (document.body.dataset.state === "floor") { kcal = FLOOR; render(false); }
  })();
</script>""" % (FLOOR, GOAL["p"], GOAL["kcal"])


def target_screen(file, state=""):
    rows = []
    for k, name, g, unit_kcal, mid in (("p", "Protein", GOAL["p"], 4, ""), ("f", "Fat", GOAL["f"], 9, ' id="macro-f"'), ("c", "Carbs", GOAL["c"], 4, ' id="macro-c"')):
        pct = r0(g * unit_kcal / GOAL["kcal"] * 100)
        rows.append(f'<div class="macro macro--{k}" data-macro="{k}"><div class="macro__label"><i class="macro__key"></i>{k.upper()} · {name}</div>'
                    f'<div class="macro__value"><span{mid}>{g}</span><small> g</small></div>'
                    f'<div class="macro__bar" role="meter" aria-label="{name} share of calories" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{pct}" aria-valuetext="{pct}% of calories"><i style="--w: {pct}%"></i></div>'
                    f'<div class="macro__goal">{pct}% of kcal</div></div>')
    calc = [("Resting energy, kcal (Mifflin-St Jeor): 10 × 63 + 6.25 × 165 − 5 × 34 − 161", n(BMR)),
            ("× 1.55 moderately active, kcal", n(TDEE)), ("Maintain ± 0, rounded to 50, kcal", n(GOAL['kcal'])),
            ("Protein, g: 1.6 per kg × 63 kg", GOAL['p']), ("Fat, g: about 30 % of kcal", GOAL['f']), ("Carbs, g: the rest", GOAL['c'])]
    tr = "".join(f"<tr><td>{a}</td><td>{b}</td></tr>" for a, b in calc)
    step = (stepper("Daily target", GOAL["kcal"], "kcal", "calories")
            .replace('aria-label="Less calories"', 'aria-label="Less calories" id="target-less"')
            .replace('aria-label="More calories"', 'aria-label="More calories" id="target-more"')
            .replace('class="stepper__input"', 'class="stepper__input" id="target-input"'))
    content = (f'<section class="card" aria-label="Your daily target"><div><b class="nutri__big" id="target-kcal">{n(GOAL["kcal"])}</b><span class="t-callout text-secondary">kcal a day</span></div>'
               f'<div class="macros">{"".join(rows)}</div></section>'
               f'<div class="row-between"><span class="t-label">Adjust</span>{step}</div>'
               f'<p class="t-callout text-secondary">Steps of 50 kcal. The lowest target for you is {n(FLOOR)} kcal.</p>'
               f'<div class="banner" role="note" id="floor-note" hidden>{ic("info")}<p class="banner__text"><b>We don\'t go lower than this.</b> Talk to a doctor or dietitian about bigger changes.</p></div>'
               f'<p class="visually-hidden" role="status" id="target-status"></p>'
               f'<button type="button" class="btn btn--ghost btn--m" id="calc-toggle" aria-expanded="true" aria-controls="calc">How we calculated this</button>'
               f'<section class="facts" id="calc" aria-label="How we calculated this"><table><caption class="visually-hidden">How the daily target is calculated</caption>'
               f'<thead><tr><th scope="col">Step</th><th scope="col">Value</th></tr></thead><tbody>{tr}</tbody></table></section>'
               f'<p class="t-caption text-secondary">Pregnant, breastfeeding, or a history of eating disorders? Choose “Just track” and talk to your doctor.</p>')
    return onboarding(file, "Your daily target" if not state else "Daily target: lowest", "Ripe onboarding step 5 of 5: 2,050 kcal a day, P 100 · F 70 · C 255 g, how it's calculated, adjust with a safety floor.", 5,
                      "Your daily target", content, "07-today-empty.html", "05-allergies.html", cta="Start tracking", extra=TARGET_SCRIPT,
                      body_attrs=f' data-state="{state}"' if state else "")


files.append(target_screen("06-target.html"))
files.append(target_screen("06-target-floor.html", state="floor"))

# 07 Today on the first day (end of onboarding): nothing logged, the empty state points at the camera
EMPTY_MEALS = [{"name": m, "meta": "Nothing yet", "add": "10-add-food.html"} for m in ("Breakfast", "Lunch", "Snack", "Dinner")]
files.append(today("07-today-empty.html", "08:05", EMPTY_MEALS, title_note="Thursday", first_day=True))

# 15 Diary: the week of 28 Sep – 4 Oct 2026; Thursday 1 Oct is today. Every day total is a sum of logged meals.
SHRIMP_T, CURRY_T = total(SHRIMP), total(CURRY)
COD2 = {k: DINNER[k] * 2 for k in ("kcal", "p", "f", "c")}
WEEK = [
    ("mon", "Mon", "Monday", 28, "September", [("Breakfast", "Greek yogurt, oats, blueberries", B, "breakfast-granola-blueberries.jpg"), ("Lunch", "Salmon, rice, broccoli", L, "dish-salmon-rice-broccoli.jpg"),
                                               ("Snack", "Apple, almonds", S, "food-apple.jpg"), ("Dinner", "Shrimp &amp; broccoli stir-fry · 1 portion", SHRIMP_T, "recipe-shrimp-vegetables.jpg")]),
    ("tue", "Tue", "Tuesday", 29, "September", [("Breakfast", "Greek yogurt, oats, blueberries", B, "breakfast-granola-blueberries.jpg"), ("Lunch", "Salmon, rice, broccoli", L, "dish-salmon-rice-broccoli.jpg"),
                                                ("Snack", "Apple, almonds", S, "food-apple.jpg"), ("Dinner", f"{DISH} · 2 portions", COD2, DISH_IMG)]),
    ("wed", "Wed", "Wednesday", 30, "September", [("Breakfast", "Greek yogurt, oats, blueberries", B, "breakfast-granola-blueberries.jpg"), ("Lunch", "Chickpea &amp; spinach curry · 1 portion", CURRY_T, "recipe-chickpea-curry.jpg"),
                                                  ("Snack", "Apple, almonds", S, "food-apple.jpg"), ("Dinner", f"{DISH} · 1 portion", DINNER, DISH_IMG)]),
    ("thu", "Thu", "Thursday", 1, "October", [("Breakfast", "Greek yogurt, oats, blueberries", B, "breakfast-granola-blueberries.jpg"), ("Lunch", "From a photo · 4 items", L, "dish-salmon-rice-broccoli.jpg"),
                                              ("Snack", "Apple, almonds", S, "food-apple.jpg"), ("Dinner", None, None, None)]),
]
DAY_TOTALS = {key: day(*[m[2] for m in meals if m[2]]) for key, *_, meals in WEEK}
assert [DAY_TOTALS[k]["kcal"] for k in ("mon", "tue", "wed", "thu")] == [1703, 2095, 1661, 1171], DAY_TOTALS


def week_day(key, short, long_name, date, month, selected, today_=False, disabled=False):
    d = DAY_TOTALS.get(key)
    kcal = d["kcal"] if d else 0
    over = kcal - GOAL["kcal"]
    pct = min(100, r0(kcal / GOAL["kcal"] * 100)) if d else 0
    val = f'<circle class="week__value" cx="18" cy="18" r="15.9155" stroke-dasharray="{pct} 100"/>' if d else ""
    note = "Today" if today_ else (f"+{over}" if over > 0 else "")
    cls = (" is-over" if over > 0 else "") + ("" if d else " is-empty")
    label = f"{long_name} {date} {month}" + (", today" if today_ else "") + (f": {n(kcal)} kcal" if d else ": upcoming") + (f", {over} over" if over > 0 else "")
    cur = ' aria-current="date"' if today_ else ""
    dis = " disabled" if disabled else ""
    go = f' data-href="15-diary{"" if key == "thu" else "-" + key}.html"' if d else ""
    return (f'<button type="button" class="week__day{cls}" aria-pressed="{"true" if selected else "false"}"{cur}{dis} aria-label="{label}"{go}>'
            f'<span class="week__dow" aria-hidden="true">{short[0]}</span><span class="week__ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="week__track" cx="18" cy="18" r="15.9155"/>{val}</svg>'
            f'<span class="week__date">{date}</span></span><span class="week__note" aria-hidden="true">{note}</span></button>')


def diary(file, sel):
    days = [week_day(k, s, ln, dt, mo, k == sel, today_=k == "thu") for k, s, ln, dt, mo, _ in WEEK]
    days += [week_day(k, s, ln, dt, "October", False, disabled=True) for k, s, ln, dt in (("fri", "Fri", "Friday", 2), ("sat", "Sat", "Saturday", 3), ("sun", "Sun", "Sunday", 4))]
    key, short, long_name, date, month, meals = next(w for w in WEEK if w[0] == sel)
    is_today = sel == "thu"
    rows = []
    for name, meta, tot, img in meals:
        if tot is None:
            rows.append(f'<div class="product"><span class="product__thumb product__thumb--icon product__thumb--meal" aria-hidden="true">{ic(MEAL_ICONS[name])}</span>'
                        f'<div><div class="product__name">{name}</div><div class="product__meta product__meta--text">Nothing logged yet</div></div><div class="product__end"></div></div>')
            continue
        copy = "" if is_today else f'<button type="button" class="icon-btn icon-btn--tint" aria-label="Copy {name.lower()} to today">{ic("copy")}</button>'
        rows.append(f'<div class="product"><img class="product__thumb" src="{IMG}/{img}" alt="" width="48" height="48"><div><div class="product__name">{name}</div><div class="product__meta product__meta--text">{meta}</div></div>'
                    f'<div class="product__end"><span class="product__kcal">{n(tot["kcal"])}<small>kcal</small></span>{copy}</div></div>')
    when = f"{long_name}, {date} {month}" + (" · today" if is_today else "")
    extra = (f'<button type="button" class="btn btn--secondary" data-href="07-today.html">{ic("today")}Open Today</button>' if is_today
             else '<p class="t-callout text-secondary">Copy a meal to today with the button next to it. Past days are read-only.</p>')
    body = f"""{status_bar("18:40")}
<header class="app-bar app-bar--large"><h1 class="app-bar__title">Diary</h1></header>
<main class="screen__body" tabindex="0">
<div class="section-head"><h2>This week</h2><span class="t-callout text-secondary">28 Sep – 4 Oct</span></div>
<div class="week" role="group" aria-label="Days of this week">{"".join(days)}</div>
<div class="section-head" id="day-head"><h2>{when}</h2></div>
{nutri(DAY_TOTALS[sel], label=f"{long_name}: calories and macros", left_text="kcal left" if not is_today else "kcal left today")}
<div class="list">{"".join(rows)}</div>
{extra}
</main>
{tab_bar("diary")}"""
    return page(file, f"Diary: {long_name}", f"Ripe Diary: {long_name} {date} {month}, {n(DAY_TOTALS[sel]['kcal'])} of {n(GOAL['kcal'])} kcal.", body)


files.append(diary("15-diary.html", "thu"))
for k in ("mon", "tue", "wed"):
    files.append(diary(f"15-diary-{k}.html", k))


# 16 Profile & preferences
def profile(file, allergies="Peanuts", toast_msg=None, confirm=False):
    inert = " inert" if confirm else ""

    def row(icon, name, value, label, href):
        return (f'<div class="product product--nav"><span class="product__thumb product__thumb--icon" aria-hidden="true">{ic(icon)}</span>'
                f'<div><div class="product__name">{name}</div><div class="product__meta product__meta--text">{value}</div></div>'
                f'<div class="product__end"><button type="button" class="icon-btn" aria-label="{label}"{f" data-href={chr(34)}{href}{chr(34)}" if href else ""}>{ic("chev-r")}</button></div></div>')
    plan = "".join([
        row("calendar", "Daily target", f"{n(GOAL['kcal'])} kcal a day", "Edit daily target", "06-target.html"),
        row("fresh", "Goal", "Maintain", "Edit goal", "02-goal.html"),
        row("profile", "About you", "34 · 165 cm · 63 kg · moderately active", "Edit body data", "03-about-you.html"),
        row("recipes", "Diet", "Pescatarian", "Edit diet", "04-diet.html"),
        row("lock", "Allergies", allergies, "Edit allergies", "05-allergies-edit.html"),
        row("close", "Foods you'd rather skip", "Mushrooms", "Edit foods to skip", "05-allergies-edit.html"),
    ])
    sheet = ""
    if confirm:
        sheet = f"""<div class="screen__overlay"><div class="scrim"></div>
<dialog open class="sheet confirm" aria-labelledby="cd-title" aria-describedby="cd-desc" aria-modal="true">
<div class="sheet__handle"></div>
<div class="sheet__head"><div><h2 class="sheet__title" id="cd-title">Delete your account?</h2><p class="sheet__sub" id="cd-desc">This deletes your diary, recipes and photos from Ripe. You have 30 days to change your mind: sign in again and everything comes back.</p></div><button type="button" class="icon-btn" aria-label="Cancel and close" data-href="16-profile.html">{ic("close")}</button></div>
<ul class="sheet__confirm"><li>4 days of diary entries</li><li>1 edited recipe</li><li>3 meal photos</li></ul>
<div class="sheet__foot"><button type="button" class="btn btn--secondary btn--block" data-href="16-profile.html">Keep my account</button><button type="button" class="btn btn--destructive btn--block" data-href="01-welcome.html">Delete account and data</button></div>
</dialog></div>"""
    body = f"""{status_bar("19:00")}
<header class="app-bar app-bar--large"{inert}><h1 class="app-bar__title">Profile</h1></header>
<main class="screen__body" tabindex="0"{inert}>
<div class="section-head"><h2>Your plan</h2><span class="t-callout text-secondary">Recipes follow it</span></div>
<div class="list">{plan}</div>
<div class="section-head"><h2>Units</h2></div>
{segmented("Units", "units", ["Metric", "Imperial"], "Metric")}
<div class="section-head"><h2>Account</h2></div>
<div class="list"><div class="product"><span class="product__thumb product__thumb--icon" aria-hidden="true">{ic("profile")}</span><div><div class="product__name">sam@example.com</div><div class="product__meta product__meta--text">Signs in with a passkey or an email link</div></div><div class="product__end"></div></div></div>
<button type="button" class="btn btn--secondary" data-href="01-welcome.html">Sign out</button>
<button type="button" class="btn btn--destructive" data-href="16-profile-delete.html" aria-haspopup="dialog">Delete account</button>
</main>
{toast(toast_msg) if toast_msg else ""}
<div{inert}>{tab_bar("profile").replace('data-href="13-recipes.html"', 'data-href="13-recipes-filtered.html"') if "shellfish" in allergies else tab_bar("profile")}</div>
{sheet}"""
    return page(file, "Profile" if not confirm else "Delete your account?", "Ripe Profile: daily target, goal, body, diet, allergies, units and account.", body)


files.append(profile("16-profile.html"))
files.append(profile("16-profile-delete.html", confirm=True))
files.append(profile("16-profile-updated.html", allergies="Peanuts, shellfish", toast_msg="Allergies saved. Recipes are updated."))
files.append(recipes_screen("13-recipes-filtered.html", allergies=("peanuts", "shellfish"),
                            description="Ripe recipes after adding a shellfish allergy in Profile: the shrimp stir-fry is hidden too."))

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
    "14-recipe-detail-servings": ("14 Dish detail", "Servings 2: amounts scale"),
    "01-welcome": ("01 Welcome", "Passkey or email link"),
    "01-welcome-link": ("01 Welcome", "Check your inbox"),
    "02-goal": ("02 Your goal", "Step 1 of 5"),
    "03-about-you": ("03 About you", "Step 2 of 5"),
    "03-about-you-error": ("03 About you", "Height out of range"),
    "04-diet": ("04 Diet", "Step 3 of 5"),
    "05-allergies": ("05 Allergies", "Step 4 of 5"),
    "06-target": ("06 Daily target", "Step 5 of 5 · 2,050 kcal"),
    "06-target-floor": ("06 Daily target", "At the floor: 1,550 kcal"),
    "07-today-empty": ("07 Today", "First day: 0 of 2,050"),
    "15-diary": ("15 Diary", "This week, today selected"),
    "15-diary-tue": ("15 Diary", "Tuesday: 45 over"),
    "16-profile": ("16 Profile", "Your plan, units, account"),
    "05-allergies-edit": ("05 Allergies", "Edit from Profile: + Shellfish"),
    "16-profile-updated": ("16 Profile", "Saved: recipes update"),
    "13-recipes-filtered": ("13 Recipes", "Shrimp hidden: 2 recipes"),
    "16-profile-delete": ("16 Profile", "Delete account: confirm"),
    "07-today-dinner-added": ("07 Today", f"Dinner added · {n(day(B, L, S, DINNER)['kcal'])} kcal"),
}

NOTES = {
    1: ("Camera is never the only way in", "Plate guide, three capture tips and a live hint. Library and Search sit next to the shutter."),
    2: ("Honest loading", "Plain steps and Cancel, no fake percentage. Nothing is saved yet, and the primary button says so."),
    3: ("Confidence on every food", "Icon + word: High, Check portion, Not sure. Never colour alone."),
    4: ("One concrete question", "“Check portion” tints the row and asks “Is 150 g right?”. “Not sure” offers the two likely answers and Search."),
    5: ("The button carries the result", "“Add to Lunch · 559 kcal”. Meal is preselected from the time; the estimate range is stated."),
    6: ("Undo, not “Are you sure?”", "Logging is reversible, so it's one tap plus Undo. The toast has no timer."),
    7: ("Two taps from search", "Recents first; one canonical entry per food. The USDA source is named on the food detail (research insight 2)."),
    8: ("Per 100 g + source", "The anchor value and its source stay on top; quick portions like “30 g · 1 handful”."),
    9: ("Cooked weight fixes home cooking", "Raw ingredients + the cooked pot weight → real kcal per 100 g and per portion (insight 1)."),
    10: ("Lead with what's left", f"The ring answers “can I have dinner?”: {LEFT} kcal left, and a recipe that fits it."),
    11: ("“Suits me” is visible", "Diet and allergy come from onboarding. The allergy is a locked chip (lock + “Allergy”) and can only change in Profile."),
    12: ("Ranked by fit, explained in words", f"Fits the kcal left → covers the protein gap → fewer kcal. “Fits: {DINNER['kcal']} of {LEFT} kcal”. One text column: title, time, reason, P/F/C, fit, kcal."),
    13: ("Safety before the numbers", "Allergens in words above the fold; per-portion kcal and macros add up from the ingredients."),
    14: ("Log without leaving", "A bottom sheet: meal preselected, portions, the same macro tiles, one primary button."),
    15: ("Calm when over", f"Protein is {r0(day(B, L, S, DINNER)['p']) - GOAL['p']} g over: Turmeric and the words “{r0(day(B, L, S, DINNER)['p']) - GOAL['p']} over”. No red, no warning icon."),
    16: ("Fix a dish in place", "Edit turns each row into labelled fields: food, amount, unit. Kcal, the ring and the macro bars update as you type, and screen readers hear the new total."),
    17: ("Delete with Undo", "Focus moves to the next ingredient, so keyboard users don't get lost. The toast offers Undo and has no timer."),
    18: ("Don't lose work", "Leaving with unsaved changes asks “Discard changes?”, with “Keep editing” first."),
    20: ("A real “View recipe” button", "Secondary button, 12.8:1, 44 tall, named “View recipe: Baked cod, potatoes &amp; broccoli”. Enter, Space and click open the dish. The photo opens it too, for pointer users only (no extra tab stop)."),
    21: ("The method is part of the dish", "Numbered steps in an ordered list after Ingredients: 16 px text, line height 1.5, ≤ 80 characters a line. Time and servings above, in the card style."),
    22: ("Reorder without dragging", "Move up / Move down buttons (WCAG 2.5.7) keep focus on the moved step and announce its new position. Disabled at the ends, not hidden."),
    23: ("Never a blank section", "A recipe without steps shows “No steps yet” with “Add steps”, which opens a focused Step 1 field."),
    24: ("No password to forget", "A passkey first, an email link second (WCAG 3.3.8: no memory or puzzle test). Nothing is asked before the value is shown."),
    25: ("One question per screen", "Option cards are native radios: the whole card is the target, arrows move the choice. Maintain is preselected; nothing extreme is offered."),
    26: ("Say why we ask", "Body data is only for the formula and never shared. “Prefer not to say” uses the average of both formulas; errors say the valid range."),
    27: ("Allergies are a hard filter", "14 major allergens as toggle chips, with “always check labels”. Foods you'd rather skip only move recipes down."),
    28: ("A target that's safe", "The maths is shown (Mifflin-St Jeor × activity). −50 steps stop at 1,550 kcal with a calm note; the macros always add up."),
    29: ("The first day has one next step", "Ring 0 of 2,050, four Add buttons, and “Snap your first meal” with Open camera or Search instead."),
    30: ("Profile keeps “suits me” right", "Each row edits one onboarding answer with a named 44 pt button. Changing an allergy re-filters recipes at once."),
    31: ("Hidden recipes are explained", "Shellfish added: the shrimp stir-fry disappears, a second locked chip appears, and the note says why 2 recipes are hidden."),
    32: ("Destructive needs a real confirm", "What is deleted, 30 days to change your mind, and “Keep my account” first. The page behind is inert."),
    33: ("A week at a glance", "Seven day buttons (≥ 44 pt, even at 320 pt) with mini rings. Today is marked in words, future days are disabled."),
    34: ("Calm when over, in Diary too", "Tuesday is 45 over: a Turmeric ring and “+45” in the strip, “45 kcal over” in words. Past meals copy to today in one tap."),
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
FLOW0 = [
    ("01-welcome", [(24, "90%", "80%")]), ("Email me a link", ""), ("01-welcome-link", []), ("Open the link", "email app"),
    ("02-goal", [(25, "93%", "28%")]), ("Continue", ""), ("03-about-you", [(26, "88%", "27%")]), ("Continue", ""),
    ("04-diet", []),
]
FLOW0C = [
    ("05-allergies", [(27, "93%", "24%")]), ("Continue", "or Skip"),
    ("06-target", [(28, "82%", "52%")]), ("Start tracking", ""), ("07-today-empty", [(29, "88%", "68%")]),
]
FLOW0B = [("03-about-you-error", []), ("Fix the height", "", "gap"), ("06-target-floor", [])]
FLOW3 = [
    ("16-profile", [(30, "92%", "50%")]), ("Allergies", "edit"), ("05-allergies-edit", []), ("Save", "toast"),
    ("16-profile-updated", []), ("Recipes tab", ""), ("13-recipes-filtered", [(31, "60%", "26%")]),
    ("Delete account", "from Profile", "gap"), ("16-profile-delete", [(32, "90%", "85%")]),
]
FLOW3B = [("15-diary", [(33, "50%", "23%")]), ("Tap Tuesday", "week strip"), ("15-diary-tue", [(34, "24%", "25%")])]
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
<section class="flow" aria-labelledby="f0">
  <div class="flow__head"><span class="t-overline text-accent">Flow 0 · Onboarding</span><h2 id="f0">Set up what “suits me” means</h2>
  <p>About a minute: sign in without a password, then goal, body data, diet, allergies and a daily target that shows its maths. Only the goal is required.</p></div>
  {steps(FLOW0)}
  <h3 class="flow__sub">0 · continued: allergies, target, first day</h3>
  {steps(FLOW0C)}
  <h3 class="flow__sub">0B · Errors and limits</h3>
  {steps(FLOW0B)}
  {notes(range(24, 30))}
</section>
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
<section class="flow" aria-labelledby="f3">
  <div class="flow__head"><span class="t-overline text-accent">Flow 3 · Profile and Diary</span><h2 id="f3">Change preferences, look back at the week</h2>
  <p>Profile edits the onboarding answers, and recipes re-filter at once. Diary shows the week; a day over the goal is calm, and past meals copy to today.</p></div>
  {steps(FLOW3)}
  <h3 class="flow__sub">3B · Diary</h3>
  {steps(FLOW3B)}
  {notes(range(30, 35))}
</section>
</main>
<footer class="board-foot">Screens: 390 × 844 pt, exported at 2× with Playwright. Built only from 02-design-system tokens and components. Photos: Unsplash and Pixabay (see 01-branding/assets/CREDITS.md). Full spec: 03-screens/FLOWS.md.</footer>
</div>
</body>
</html>
"""
(ROOT / "03-screens" / "flows.html").write_text(board)
print("wrote 03-screens/flows.html")
