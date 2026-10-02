"""Render the token sections of 02-design-system/index.html from tokens.json.

Everything between <!-- tokens:start --> and <!-- tokens:end --> is replaced, so the
docs page always shows the real token values. Component sections are hand-written.

Usage:
  python3 tools/build_docs.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DS = ROOT / "02-design-system"
tokens = json.loads((DS / "tokens.json").read_text())


def node(path):
    n = tokens
    for p in path.split("."):
        n = n[p]
    return n


def resolve(v):
    return resolve(node(v[1:-1])["$value"]) if isinstance(v, str) and v.startswith("{") else v


def css_var(path):
    return "--" + "-".join(p for p in path.split(".") if p != "primitive")


def lum(h):
    h = h.lstrip("#")[:6]
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


def children(n):
    return [(k, v) for k, v in n.items() if not k.startswith("$") and isinstance(v, dict)]


e = html.escape
out = []
CANVAS = resolve(node("color.bg.canvas")["$value"])

# ---------------- colour ----------------
out.append('<h2 class="doc-h2" id="colour"><small>Foundations</small>Colour</h2>')
out.append('<p class="doc-lead">Two layers. <b>Primitives</b> are the raw palette, and every family is named after a food. '
           '<b>Semantic tokens</b> say what a colour is for; components only use these. Each contrast ratio is measured on the background that colour is actually used on.</p>')
out.append('<h3 class="doc-h3">Primitives</h3>')
for fam, fnode in children(node("color.primitive")):
    steps = [(k, v) for k, v in children(fnode)] if "$value" not in fnode else [("", fnode)]
    out.append(f'<div class="fam-h">{e(fam.capitalize())} <span>{e(fnode.get("$description", ""))}</span></div><div class="sw-row">')
    for step, t in steps:
        path = f"color.primitive.{fam}" + (f".{step}" if step else "")
        hexv = t["$value"]
        out.append(f'<div class="sw"><i style="--c: var({css_var(path)})"></i><div><b>{e(fam)}{"-" + step if step else ""}</b>'
                   f'<code>{hexv}</code><small>{e(t.get("$description", ""))}</small></div></div>')
    out.append("</div>")

# Which background each colour is actually used on (for the contrast column).
DEFAULT_ON = {"text": "color.bg.canvas", "border": "color.bg.surface"}
ON = {
    "color.bg.accent": "color.bg.surface", "color.bg.inverse": "color.bg.canvas",
    "color.text.inverse": "color.bg.inverse", "color.text.inverse-accent": "color.bg.inverse",
    "color.text.inverse-success": "color.bg.inverse", "color.text.inverse-warning": "color.bg.inverse",
    "color.text.on-accent": "color.bg.accent", "color.text.fresh": "color.bg.fresh-subtle",
    "color.status.success": "color.bg.surface", "color.status.success-text": "color.status.success-subtle",
    "color.status.warning": "color.status.warning-subtle", "color.status.error": "color.bg.surface",
    "color.status.error-text": "color.status.error-subtle",
    "color.macro.protein": "color.bg.surface", "color.macro.fat": "color.bg.surface", "color.macro.carbs": "color.bg.surface",
    "color.macro.protein-text": "color.macro.protein-subtle", "color.macro.fat-text": "color.macro.fat-subtle",
    "color.macro.carbs-text": "color.macro.carbs-subtle",
}
GROUPS = [("bg", "Background"), ("text", "Text"), ("border", "Border"), ("status", "Status"), ("macro", "Macros")]
for g, title in GROUPS:
    gnode = node(f"color.{g}")
    out.append(f'<h3 class="doc-h3">{title}</h3>')
    if gnode.get("$description"):
        out.append(f'<p class="doc-lead">{e(gnode["$description"])}</p>')
    out.append(f'<section class="table-scroll" data-scroll-x tabindex="0" aria-label="{title} colour tokens"><table class="tok-table"><caption class="visually-hidden">{title} colour tokens</caption><thead><tr><th scope="col" class="chipcol"><span class="visually-hidden">Swatch</span></th><th scope="col">Token</th><th scope="col">Points to</th><th scope="col">Value</th><th scope="col">Contrast</th><th scope="col">Use</th></tr></thead><tbody>')
    for k, t in children(gnode):
        path = f"color.{g}.{k}"
        alias = t["$value"]
        val = resolve(alias)
        on = ON.get(path, DEFAULT_ON.get(g))
        if on and len(val.lstrip("#")) == 6:
            r = ratio(val, resolve(node(on)["$value"]))
            rtxt = f"{r:.2f}:1 <small>on {on.split('.')[-1]}</small>"
        else:
            rtxt = "—"
        out.append(f'<tr><td class="chipcol"><span class="dot" style="--c: var({css_var(path)})"></span></td>'
                   f'<td><code>{css_var(path)}</code></td><td><code>{css_var(alias[1:-1]) if alias.startswith("{") else alias}</code></td>'
                   f'<td class="ratio">{val}</td><td class="ratio">{rtxt}</td><td>{e(t.get("$description", ""))}</td></tr>')
    out.append("</tbody></table></section>")

# ---------------- typography ----------------
SAMPLES = {
    "display": "Point, snap, know.", "h1": "Today", "h2": "We found 4 foods", "title": "Oat & blueberry yogurt bowl",
    "body": "Check the portion, then add it to Lunch.", "body-strong": "Salmon, cooked", "callout": "Weigh the whole pot after cooking",
    "label": "Final cooked weight", "caption": "High confidence · per 100 g", "overline": "Brand principles",
    "num-xl": "879", "num-l": "559 kcal", "num-m": "150 g · 195 kcal", "num-s": "P 37 · F 23 · C 49",
}
USES = {
    "display": "Hero numbers of the brand, onboarding", "h1": "Large app-bar titles", "h2": "Sheet and card titles",
    "title": "Small app-bar titles, section titles", "body": "Default text", "body-strong": "Food names in lists",
    "callout": "Secondary sentences, meta", "label": "Field labels, chips, buttons M", "caption": "Minimum size (12). Confidence, helper text",
    "overline": "Section kickers (uppercase)", "num-xl": "kcal left on Home", "num-l": "Card totals", "num-m": "Steppers, list kcal", "num-s": "Macro lines, per-100 g meta",
}
out.append('<h2 class="doc-h2" id="type"><small>Foundations</small>Typography</h2>')
out.append('<p class="doc-lead">Three Google Fonts (SIL OFL). <b>Young Serif</b> is for headlines only (20 px and up). '
           '<b>Hanken Grotesk</b> is for all UI text. <b>Azeret Mono</b> is for every number, with tabular figures. '
           'Sizes are in rem, so they follow Dynamic Type; the pixel values are at the default text size.</p>')
for k, t in children(node("type")):
    v = t["$value"]
    px = float(v["fontSize"].replace("rem", "")) * 16
    lh = round(px * v["lineHeight"])
    fam = resolve(v["fontFamily"])[0]
    out.append(f'<div class="type-row"><div><code>--type-{k}</code></div>'
               f'<div class="t-{k}">{e(SAMPLES.get(k, k))}</div>'
               f'<div><div class="meta">{fam} · {px:g}/{lh} · {v["fontWeight"]}</div><div class="use">{e(USES.get(k, ""))}</div></div></div>')

# ---------------- spacing ----------------
out.append('<h2 class="doc-h2" id="space"><small>Foundations</small>Spacing</h2>')
out.append('<p class="doc-lead">A 4 pt grid (bars drawn at 4× scale). Use multiples of 8 for layout, and 4 or 12 only for fine steps. Screen side margin: <code>--space-screen-margin</code> (20).</p><div class="bars">')
for k, t in children(node("space")):
    val = resolve(t["$value"])
    out.append(f'<div class="bar-row"><code>--space-{k}</code><span class="ratio">{val}</span><span><i style="--w: var(--space-{k})"></i></span></div>')
out.append("</div>")

# ---------------- radius + borders ----------------
out.append('<h2 class="doc-h2" id="radius"><small>Foundations</small>Radius &amp; borders</h2><div class="tiles">')
for k, t in children(node("radius")):
    out.append(f'<div class="tile" style="--r: var(--radius-{k}); --s: inset 0 0 0 var(--border-width-default) var(--color-border-strong)"><span><b>{k}</b>{t["$value"]}<br>{e(t.get("$description", ""))}</span></div>')
out.append('</div><h3 class="doc-h3">Border widths</h3><div class="tiles">')
for k, t in children(node("border-width")):
    out.append(f'<div class="tile" style="--r: var(--radius-md); --s: inset 0 0 0 var(--border-width-{k}) var(--color-text-primary)"><span><b>{k}</b>{t["$value"]}<br>{e(t.get("$description", ""))}</span></div>')
out.append("</div>")

# ---------------- elevation ----------------
out.append('<h2 class="doc-h2" id="elevation"><small>Foundations</small>Elevation</h2>'
           '<p class="doc-lead">Warm, rye-tinted shadows, never grey. Most surfaces are flat; elevation marks things that float.</p><div class="tiles">')
for k, t in children(node("shadow")):
    out.append(f'<div class="tile" style="--r: var(--radius-lg); --s: var(--shadow-{k})"><span><b>{k}</b>{e(t.get("$description", ""))}</span></div>')
out.append("</div>")

# ---------------- icons + sizes ----------------
ICONS = ["today", "diary", "scan", "recipes", "profile", "search", "barcode", "plus", "minus", "check", "close", "back",
         "high", "check-portion", "unsure", "fresh", "viewfinder", "portion", "time", "heart", "calendar", "alert", "info", "lock", "flash", "image", "chev-r", "signal", "wifi", "battery", "breakfast", "sun", "snack", "dinner", "edit", "trash", "arrow-up", "arrow-down", "copy"]
out.append('<h2 class="doc-h2" id="icons"><small>Foundations</small>Icons &amp; sizes</h2>'
           '<p class="doc-lead">Drawn on a 24 px grid with a 2 px round stroke, coloured with <code>currentColor</code>. SVG files are in <code>01-branding/assets/icons/</code>. '
           'Confidence icons are always paired with a word.</p><div class="tiles">')
for k, t in children(node("size.icon")):
    out.append(f'<div class="tile" style="--is: var(--size-icon-{k})"><span><svg class="icon" aria-hidden="true"><use href="#i-scan"/></svg><b>{k} · {t["$value"]}</b>{e(t.get("$description", ""))}</span></div>')
out.append('</div><div class="sw-row">')
for name in ICONS:
    out.append(f'<div class="sw sw--icon"><svg class="icon" aria-hidden="true"><use href="#i-{name}"/></svg><div><code>{name}</code></div></div>')
out.append('</div><h3 class="doc-h3">Component sizes and safe areas</h3><section class="table-scroll" data-scroll-x tabindex="0" aria-label="Component size tokens"><table class="tok-table"><caption class="visually-hidden">Component size tokens</caption><thead><tr><th scope="col">Token</th><th scope="col">Value</th><th scope="col">Use</th></tr></thead><tbody>')
for k, t in children(node("size")):
    if "$value" not in t:
        continue
    out.append(f'<tr><td><code>--size-{k}</code></td><td class="ratio">{t["$value"]}</td><td>{e(t.get("$description", ""))}</td></tr>')
out.append("</tbody></table></section>")

page = DS / "index.html"
text = page.read_text()
text = re.sub(r"<!-- tokens:start -->.*<!-- tokens:end -->", "<!-- tokens:start -->\n" + "\n".join(out) + "\n<!-- tokens:end -->", text, flags=re.S)
# Header and footer figures, computed so they never drift: CSS variables in tokens.css, documented
# components (sections c1…cN) and the version from the latest changelog heading in README.md
n_vars = len(set(re.findall(r"(--[\w-]+)\s*:", (DS / "tokens.css").read_text())))  # unique variables (modes redefine some)
n_comp = len(re.findall(r'<section class="doc-comp" id="c\d+">', text))
version = re.search(r"## Changelog \(v[\d.]+ → (v[\d.]+)\)", (DS / "README.md").read_text()).group(1)
text = re.sub(r"<b>\d+</b><span>CSS variables</span>", f"<b>{n_vars}</b><span>CSS variables</span>", text)
text = re.sub(r"<b>\d+</b><span>components</span>", f"<b>{n_comp}</b><span>components</span>", text)
text = re.sub(r"Design system · v[\d.]+ ·", f"Design system · {version} ·", text)
text = re.sub(r"Ripe design system v[\d.]+ ·", f"Ripe design system {version} ·", text)
page.write_text(text)
print("Token sections rendered into", page.relative_to(ROOT))
