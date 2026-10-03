// Figma export (0 Figma calls): turn 02-design-system/tokens.json into a compact payload for Figma
// local variables and styles. Colours: "Primitives" collection + semantic aliases in "Tokens";
// dimensions (space, radius, size, border width) as numbers; type.* → text styles; shadow.* → effect styles.
//   import { tokenPayload } from "./tokens.mjs"
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const T = JSON.parse(readFileSync(resolve(ROOT, "02-design-system/tokens.json"), "utf8"));
const leaves = (o, p = []) => ("$value" in o ? [[p.join("."), o.$value]] : Object.entries(o).filter(([k]) => !k.startsWith("$")).flatMap(([k, v]) => leaves(v, [...p, k])));
const get = (path) => path.split(".").reduce((o, k) => o[k], T).$value;
const deref = (v) => (typeof v === "string" && /^\{.+\}$/.test(v) ? deref(get(v.slice(1, -1))) : v);
const px = (v) => { v = String(deref(v)); const m = /^(-?[\d.]+)(px|rem)?$/.exec(v); if (!m) return null; return +m[1] * (m[2] === "rem" ? 16 : 1); };
const slash = (p) => p.replace(/\./g, "/");

export function tokenPayload() {
  const prim = [], sem = [], num = [], text = [], fx = [];
  for (const [p, v] of leaves(T.color, ["color"])) {
    if (p.startsWith("color.primitive.")) prim.push([slash(p.slice(16)), v]);
    else sem.push([slash(p.slice(6)), typeof v === "string" && v.startsWith("{color.primitive.") ? "@" + slash(v.slice(17, -1)) : deref(v)]);
  }
  for (const g of ["space", "radius", "size", "border-width"]) for (const [p, v] of leaves(T[g], [g])) { const n = px(v); if (n !== null) num.push([slash(p), +n.toFixed(3)]); }
  for (const [p, v] of leaves(T.type, ["type"])) {
    const fam = deref(v.fontFamily)[0];
    text.push([slash(p), fam, px(v.fontSize), v.fontWeight, +(v.lineHeight * 100).toFixed(2), +(parseFloat(v.letterSpacing || 0) * 100).toFixed(2)]);
  }
  for (const [p, v] of leaves(T.shadow, ["shadow"])) {
    const list = (Array.isArray(v) ? v : [v]).map((s) => [deref(s.color), px(s.offsetX), px(s.offsetY), px(s.blur), px(s.spread)]);
    fx.push([slash(p), list]);
  }
  return { prim, sem, num, text, fx };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { const t = tokenPayload(); console.log(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.length])), JSON.stringify(t).length, "chars"); console.log(JSON.stringify(t).slice(0, 600)); }
