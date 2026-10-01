"""WCAG 2.2 contrast check for Ripe tokens.

Reads 02-design-system/tokens.json, resolves aliases, checks every text/background
pair the components actually use, and writes the result table into
02-design-system/README.md between the <!-- contrast:start/end --> markers.

Usage:
  python3 tools/contrast.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKENS = ROOT / "02-design-system" / "tokens.json"
README = ROOT / "02-design-system" / "README.md"

tokens = json.loads(TOKENS.read_text())


def lookup(path):
    node = tokens
    for part in path.split("."):
        node = node[part]
    v = node["$value"]
    return lookup(v[1:-1]) if isinstance(v, str) and v.startswith("{") else v


def rgb(hex_):
    h = hex_.lstrip("#")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def over(top, base):
    """Composite an 8-digit #RRGGBBAA colour over an opaque base (for pressed overlays and scrims)."""
    h = top.lstrip("#")
    if len(h) == 6:
        return top
    a = int(h[6:8], 16) / 255
    t, b = rgb(top), rgb(base)
    return "#" + "".join(f"{round((a * x + (1 - a) * y) * 255):02X}" for x, y in zip(t, b))


def color(spec):
    """'color.x.y' or ('color.overlay', 'color.base') for alpha colours."""
    if isinstance(spec, tuple):
        return over(lookup(spec[0]), lookup(spec[1]))
    return lookup(spec)


def name(spec):
    if isinstance(spec, tuple):
        return f"{spec[0].replace('color.', '')} over {spec[1].replace('color.', '')}"
    return spec.replace("color.", "")


def lum(hex_):
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(c) for c in rgb(hex_))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


T, U, T7 = "text", "ui", "critical"   # text 4.5:1 (AA) · UI/graphics 3:1 · critical text 7:1 (AAA 1.4.6)
PAIRS = [
    # (foreground token, background token, kind, where it's used)
    ("color.text.primary", "color.bg.canvas", T7, "Body text on the app background"),
    ("color.text.primary", "color.bg.surface", T7, "Text on cards and sheets"),
    ("color.text.primary", "color.bg.sunken", T7, "Stepper values, search text"),
    ("color.text.primary", "color.bg.accent-subtle", T7, "Secondary buttons, selected chips"),
    ("color.text.primary", "color.bg.accent-subtle-pressed", T7, "Secondary button, pressed"),
    ("color.text.primary", "color.bg.highlight", T, "'Not sure' marker number"),
    ("color.text.primary", "color.bg.disabled", T, "Text on disabled fills (e.g. chip labels)"),
    ("color.text.secondary", "color.bg.canvas", T7, "Meta text, units"),
    ("color.text.secondary", "color.bg.surface", T7, "Meta text on cards"),
    ("color.text.secondary", "color.bg.sunken", T7, "Placeholder, segmented labels"),
    ("color.text.secondary", "color.bg.accent-subtle", T7, "Captions on apricot tiles"),
    ("color.text.accent", "color.bg.canvas", T7, "Links, ghost buttons, active tab"),
    ("color.text.accent", "color.bg.surface", T7, "Links on cards, active tab"),
    ("color.text.accent", "color.bg.accent-subtle", T, "'New' badge, empty-state icon"),
    ("color.text.on-accent", "color.bg.accent", T7, "Primary button label"),
    ("color.text.on-accent", "color.bg.accent-pressed", T7, "Primary button, pressed"),
    ("color.text.on-accent", "color.status.error", T7, "Error toast, destructive pressed"),
    ("color.text.fresh", "color.bg.fresh-subtle", T, "'Fits your day' tag"),
    ("color.text.inverse", "color.bg.inverse", T7, "Toast message"),
    ("color.text.inverse-accent", "color.bg.inverse", T, "Toast action ('Undo')"),
    ("color.text.inverse-accent", "color.bg.inverse-pressed", T, "Toast action, pressed"),
    ("color.text.inverse-success", "color.bg.inverse", U, "Success icon in toast"),
    ("color.text.inverse-warning", "color.bg.inverse", U, "Warning icon in toast"),
    ("color.status.success-text", "color.bg.surface", T, "'High confidence' label"),
    ("color.status.success-text", "color.status.success-subtle", T, "'Verified' badge"),
    ("color.status.warning-text", "color.bg.surface", T7, "'Check portion', over goal"),
    ("color.status.warning-text", "color.bg.canvas", T7, "Over-goal text on background"),
    ("color.status.warning-text", "color.status.warning-subtle", T, "'Not sure' row"),
    ("color.status.error-text", "color.bg.surface", T7, "Field error message"),
    ("color.status.error-text", "color.status.error-subtle", T7, "Destructive button label"),
    ("color.macro.protein-text", "color.macro.protein-subtle", T7, "P badge"),
    ("color.macro.fat-text", "color.macro.fat-subtle", T7, "F badge"),
    ("color.macro.carbs-text", "color.macro.carbs-subtle", T7, "C badge"),
    ("color.macro.protein", "color.bg.surface", U, "Protein bar and key"),
    ("color.macro.fat", "color.bg.surface", U, "Fat bar and key"),
    ("color.macro.carbs", "color.bg.surface", U, "Carbs bar and key"),
    ("color.bg.accent", "color.bg.surface", U, "Calorie ring value, scan button"),
    ("color.status.warning", "color.bg.surface", U, "Calorie ring when over goal"),
    ("color.border.strong", "color.bg.surface", U, "Text-field border"),
    ("color.border.strong", "color.bg.canvas", U, "Stepper border on background"),
    ("color.border.accent", "color.bg.surface", U, "Focused / selected border"),
    ("color.border.error", "color.bg.surface", U, "Error border"),
    ("color.border.focus", "color.bg.canvas", U, "Keyboard focus ring"),
    ("color.status.success", "color.bg.surface", U, "Confidence icon (high)"),
    # --- states added in v1.1 ---
    ("color.text.primary", "color.status.error-subtle", T7, "Product row: error state, name"),
    ("color.status.error-text", "color.status.error-subtle", T7, "Product row: error message"),
    ("color.text.secondary", "color.bg.accent-subtle", T, "Product row: selected, meta text"),
    ("color.text.secondary", "color.status.error-subtle", T, "Product row: error, 'per 100 g'"),
    ("color.text.secondary", ("color.bg.pressed", "color.bg.surface"), T7, "Pressed row / tab / segment, meta text"),
    ("color.text.primary", ("color.bg.pressed", "color.bg.surface"), T7, "Pressed row / tab, main text"),
    ("color.text.primary", "color.bg.accent-subtle-pressed", T7, "Secondary button, pressed"),
    ("color.text.primary", "color.macro.protein-subtle", T7, "Macro tile / chip value (P)"),
    ("color.text.primary", "color.macro.fat-subtle", T7, "Macro tile / chip value (F)"),
    ("color.text.primary", "color.macro.carbs-subtle", T7, "Macro tile / chip value (C)"),
    ("color.text.secondary", "color.macro.protein-subtle", T7, "Macro tile / chip unit (P)"),
    ("color.text.secondary", "color.macro.fat-subtle", T7, "Macro tile / chip unit (F)"),
    ("color.text.secondary", "color.macro.carbs-subtle", T7, "Macro tile / chip unit (C)"),
    ("color.border.accent", "color.bg.accent-subtle", U, "Product row / chip: selected ring"),
    ("color.border.error", "color.status.error-subtle", U, "Product row: error ring"),
    # --- focus rings (WCAG 1.4.11 / 2.4.7, 2.4.13 guidance: 3:1 against adjacent colours) ---
    ("color.border.focus", "color.bg.canvas", U, "Focus ring on the app background"),
    ("color.border.focus", "color.bg.surface", U, "Focus ring on cards and bars (tab, row)"),
    ("color.border.focus", "color.bg.sunken", U, "Segmented focus ring against the track"),
    ("color.border.focus", "color.bg.canvas", U, "Focus ring around a primary button: the ring sits on the 2 px canvas gap, not on the fill"),
    ("color.text.on-accent", "color.bg.accent", T7, "Primary CTA label (AAA 7:1)"),
    ("color.border.focus", ("color.bg.pressed", "color.bg.surface"), U, "Focus ring on a pressed tab"),
    ("color.text.inverse", "color.bg.inverse", U, "Toast action focus ring (dark toast)"),
    ("color.text.inverse", "color.status.error", U, "Toast action focus ring (error toast)"),
]
EXEMPT = [
    ("color.text.disabled", "color.bg.canvas", "Disabled text: exempt under WCAG 1.4.3"),
    ("color.text.disabled", "color.bg.disabled", "Disabled button / chip label: exempt under WCAG 1.4.3"),
    ("color.text.disabled", "color.bg.surface", "Disabled row text: exempt under WCAG 1.4.3"),
    ("color.border.default", "color.bg.canvas", "Decorative card outline, not needed to identify a control"),
]


def main():
    rows, fails = [], 0
    for fg, bg, kind, use in PAIRS:
        a, b = color(fg), color(bg)
        r = ratio(a, b)
        need = {T: 4.5, U: 3.0, T7: 7.0}[kind]
        ok = r >= need
        fails += not ok
        aaa = " · AAA" if kind in (T, T7) and r >= 7 else ""
        rows.append(f"| `{name(fg)}` `{a}` | `{name(bg)}` `{b}` | {r:.2f}:1 | { {T: 'Text', U: 'UI', T7: 'Critical text'}[kind]} ≥ {need} | {'✅ Pass' + aaa if ok else '❌ Fail'} | {use} |")
    for fg, bg, note in EXEMPT:
        a, b = lookup(fg), lookup(bg)
        rows.append(f"| `{fg.replace('color.', '')}` `{a}` | `{bg.replace('color.', '')}` `{b}` | {ratio(a, b):.2f}:1 | n/a | ➖ Exempt | {note} |")
    table = (
        f"**{len(PAIRS) - fails} of {len(PAIRS)} pairs pass** "
        f"({sum(1 for p in PAIRS if p[2] == T7)} critical text pairs at 7:1 (AAA), {sum(1 for p in PAIRS if p[2] == T)} other text pairs at 4.5:1, {sum(1 for p in PAIRS if p[2] == U)} UI pairs at 3:1). "
        "Generated by `python3 tools/contrast.py`.\n\n"
        "| Foreground | Background | Ratio | Needs | Result | Used for |\n|---|---|---|---|---|---|\n" + "\n".join(rows)
    )
    text = README.read_text()
    text = re.sub(r"<!-- contrast:start -->.*<!-- contrast:end -->",
                  f"<!-- contrast:start -->\n{table}\n<!-- contrast:end -->", text, flags=re.S)
    README.write_text(text)
    print(f"{len(PAIRS) - fails}/{len(PAIRS)} pass; {fails} fail")
    if fails:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
