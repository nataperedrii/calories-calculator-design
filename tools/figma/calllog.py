"""Update the call log in PLAN-FIGMA.md before every counted Figma call.
   python3 tools/figma/calllog.py --done "result of the last row"   (fills in the last pending row)
   python3 tools/figma/calllog.py --next "tool" "what" [--exempt]     (adds the row and bumps the counter BEFORE the call)"""
import re, sys, datetime
P = "PLAN-FIGMA.md"
CAP, ASSUMED = 14, 20
s = open(P).read()
used = int(re.search(r"Counter: \*\*used (\d+)", s).group(1))
args = sys.argv[1:]
if "--done" in args:
    res = args[args.index("--done") + 1]
    s = s.replace("| pending |", f"| {res} |", 1)
if "--next" in args:
    i = args.index("--next"); tool, what = args[i + 1], args[i + 2]
    exempt = "--exempt" in args
    if not exempt:
        used += 1
        if ASSUMED - used < ASSUMED * 0.2: sys.exit(f"STOP: only {ASSUMED - used} left (< 20 %) - ask the user")
        if used > CAP: sys.exit(f"STOP: over the 70 % cap ({CAP})")
    n = len(re.findall(r"^\| \d+ \| 20", s, re.M)) + 1
    row = f"| {n} | {datetime.datetime.now():%Y-%m-%d %H:%M} | `{tool}` {what} | {'exempt' if exempt else 1} | pending | {used} / {ASSUMED - used} |\n"
    s = re.sub(r"(\| – \| 2026-10-03 \| `whoami`[^\n]*\n(?:\|[^\n]*\n)*)", lambda m: m.group(1) + row, s, count=1)
    s = re.sub(r"Counter: \*\*used \d+ / cap 14 / assumed left \d+\*\*", f"Counter: **used {used} / cap {CAP} / assumed left {ASSUMED - used}**", s)
open(P, "w").write(s)
print(f"used {used} / cap {CAP} / left {ASSUMED - used}")
