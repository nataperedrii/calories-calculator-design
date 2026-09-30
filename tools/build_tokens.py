"""Build 02-design-system/tokens.css from 02-design-system/tokens.json (W3C Design Tokens format).

Usage:
  python3 tools/build_tokens.py            # write tokens.css
  python3 tools/build_tokens.py --check    # fail if tokens.css has drifted from tokens.json

Naming: the token path joined with "-", with the "primitive" group dropped.
  color.primitive.oat.50  -> --color-oat-50
  color.bg.canvas         -> --color-bg-canvas
  type.body               -> --type-body (font shorthand) + --type-body-size / -line / -weight / -family / -tracking
Aliases like "{color.primitive.oat.50}" become var(--color-oat-50), so semantic tokens stay linked to primitives.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "02-design-system" / "tokens.json"
OUT = ROOT / "02-design-system" / "tokens.css"


def var_name(path):
    return "--" + "-".join(p for p in path if p != "primitive")


def ref(value):
    """'{a.b.c}' -> 'var(--a-b-c)'; anything else is returned unchanged."""
    if isinstance(value, str) and value.startswith("{") and value.endswith("}"):
        return f"var({var_name(value[1:-1].split('.'))})"
    return value


def shadow(v):
    layers = v if isinstance(v, list) else [v]
    return ", ".join(f"{l['offsetX']} {l['offsetY']} {l['blur']} {l['spread']} {ref(l['color'])}" for l in layers)


def css_value(v):
    """Normalise values the way stylelint-config-standard expects: 0 without a unit, short hex."""
    if isinstance(v, str):
        v = re.sub(r"(?<![\w.])0px\b", "0", v)
        v = re.sub(r"#([0-9A-Fa-f])\1([0-9A-Fa-f])\2([0-9A-Fa-f])\3\b(?![0-9A-Fa-f])", r"#\1\2\3", v)
        v = v.lower() if v.startswith("#") else v
    return v


def emit(path, token, ttype, lines):
    v = token["$value"]
    name = var_name(path)
    desc = token.get("$description")
    comment = f"  /* {desc} */" if desc else ""
    if ttype == "typography":
        fam, size, weight, line, track = (ref(v["fontFamily"]), v["fontSize"], v["fontWeight"], v["lineHeight"], v["letterSpacing"])
        lines += [f"  {name}-family: {fam};", f"  {name}-size: {size};", f"  {name}-weight: {weight};",
                  f"  {name}-line: {line};", f"  {name}-tracking: {track};",
                  f"  {name}: {weight} {size}/{line} {fam};"]
        return
    if ttype == "fontFamily":
        generic = {"serif", "sans-serif", "monospace", "ui-monospace", "system-ui", "-apple-system", "cursive", "fantasy"}
        val = ", ".join(f if f in generic else f'"{f}"' for f in v)
    elif ttype == "shadow":
        val = " ".join(css_value(x) for x in shadow(v).split(" "))
    elif ttype == "cubicBezier":
        val = f"cubic-bezier({', '.join(str(n) for n in v)})"
    else:
        val = ref(v) if isinstance(v, str) else str(v)
    lines.append(f"  {name}: {css_value(val)};{comment}")


def walk(node, path, ttype, lines):
    ttype = node.get("$type", ttype)
    if "$value" in node:
        emit(path, node, ttype, lines)
        return
    for key, child in node.items():
        if key.startswith("$") or not isinstance(child, dict):
            continue
        if "$value" not in child:
            lines.append(f"\n  /* {'.'.join(path + [key])} */")
        walk(child, path + [key], ttype, lines)


def main():
    tokens = json.loads(SRC.read_text())
    lines = []
    for key, group in tokens.items():
        if key.startswith("$"):
            continue
        lines.append(f"\n  /* ===== {key} ===== */")
        walk(group, [key], group.get("$type"), lines)
    modes = tokens.get("$extensions", {}).get("com.ripe.modes", {})
    media = ""
    for query, overrides in modes.items():
        body = "\n".join(f"    {var_name(path.split('.'))}: {css_value(ref(v))};" for path, v in overrides.items())
        media += f"\n@media ({query}) {{\n  :root {{\n{body}\n  }}\n}}\n"
    css = (
        "/* Ripe design tokens: GENERATED from tokens.json by tools/build_tokens.py. Do not edit by hand.\n"
        "   Light theme. Font sizes are rem-based so they scale with Dynamic Type / Android font size. */\n\n"
        ":root {\n" + "\n".join(lines).lstrip("\n") + "\n}\n" + media
    )
    if "--check" in sys.argv:
        current = OUT.read_text() if OUT.exists() else ""
        if current != css:
            print(f"DRIFT: {OUT.relative_to(ROOT)} does not match tokens.json. Run python3 tools/build_tokens.py")
            sys.exit(1)
        print(f"OK: {OUT.relative_to(ROOT)} matches tokens.json ({css.count(';')} declarations)")
        return
    OUT.write_text(css)
    print(f"Wrote {OUT.relative_to(ROOT)} ({css.count(';')} declarations)")


if __name__ == "__main__":
    main()
