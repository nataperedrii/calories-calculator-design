// Runs inside Figma (use_figma, Plugin API). Rebuilds screens from the compact layer trees made by extract.mjs.
// The batch script prepends:  const IDS = [screen ids]; const SUMS = [checksums]; const PACK = "<base64 of raw deflate>";
//   const PAGE = "<page name>"; const SLOT = [x0, y0]; const TOKENS = <payload or null>;
// PACK inflates to newline-separated JSON pieces: [svg strings], then one { id, name, x, y, label, tree } per screen.
// Each piece must match its checksum, so a damaged character can never build a wrong screen: the screen is
// skipped and listed in report.failed. Returns a short JSON report.
// (batches 00–01 used an LZW packer instead: figma-export/batches/sent/builder-lzw.js)
// <inflate> raw DEFLATE (RFC 1951) decoder, written for this export
const inflate = (src) => {
  let pos = 0, buf = 0, cnt = 0; const out = [];
  const bits = (n) => { let v = 0; for (let i = 0; i < n; i++) { if (!cnt) { buf = src[pos++]; cnt = 8; } v |= (buf & 1) << i; buf >>= 1; cnt--; } return v; };
  const table = (lens) => { const count = new Array(16).fill(0), offs = new Array(16).fill(0), sym = [];
    for (const l of lens) count[l]++; count[0] = 0; for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + count[i - 1];
    lens.forEach((l, i) => { if (l) sym[offs[l]++] = i; }); return { count, sym }; };
  const decode = (h) => { let code = 0, first = 0, index = 0;
    for (let len = 1; len < 16; len++) { code |= bits(1); const c = h.count[len]; if (code - c < first) return h.sym[index + code - first]; index += c; first = (first + c) << 1; code <<= 1; }
    throw new Error("bad deflate code"); };
  const LB = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258], LE = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DB = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577], DE = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  let last;
  do {
    last = bits(1); const type = bits(2);
    if (type === 0) { cnt = 0; const len = src[pos] | (src[pos + 1] << 8); pos += 4; for (let i = 0; i < len; i++) out.push(src[pos++]); continue; }
    let lt, dt;
    if (type === 1) { const l = []; for (let i = 0; i < 288; i++) l.push(i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8); lt = table(l); dt = table(new Array(30).fill(5)); }
    else {
      const hl = bits(5) + 257, hd = bits(5) + 1, hc = bits(4) + 4, ord = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15], cl = new Array(19).fill(0);
      for (let i = 0; i < hc; i++) cl[ord[i]] = bits(3);
      const ct = table(cl), L = [];
      while (L.length < hl + hd) { const s = decode(ct); if (s < 16) { L.push(s); continue; } let r, v = 0;
        if (s === 16) { v = L[L.length - 1]; r = 3 + bits(2); } else if (s === 17) r = 3 + bits(3); else r = 11 + bits(7); while (r--) L.push(v); }
      lt = table(L.slice(0, hl)); dt = table(L.slice(hl));
    }
    for (;;) { const s = decode(lt); if (s < 256) out.push(s); else if (s === 256) break;
      else { const i = s - 257, len = LB[i] + bits(LE[i]), d = decode(dt), dist = DB[d] + bits(DE[d]); for (let k = 0; k < len; k++) out.push(out[out.length - dist]); } }
  } while (!last);
  let str = ""; for (let i = 0; i < out.length; i += 8192) str += String.fromCharCode.apply(null, out.slice(i, i + 8192)); return str;
};
// </inflate>
const unpack = (s) => inflate(figma.base64Decode(s)); // ASCII only: the packer escapes every other character as \uXXXX
const sum = (t) => { let h = 5381; for (let i = 0; i < t.length; i++) h = (Math.imul(h, 33) + t.charCodeAt(i)) >>> 0; return h; };
const report = { frames: [], images: [], fonts: {}, fallbacks: [], errors: [], failed: [] };
let parts = [];
try { parts = unpack(PACK).split("\n"); } catch (e) { report.errors.push("unpack: " + e.message); }
const piece = (i) => { if (sum(parts[i] || "") !== SUMS[i]) throw new Error("checksum mismatch"); return JSON.parse(parts[i]); };
const data = { svgs: [] };
try { data.svgs = piece(0); } catch (e) { report.errors.push("svgs: " + e.message); report.failed = IDS.slice(); } // no icons → build nothing
const STYLE = { 400: ["Regular"], 500: ["Medium"], 600: ["SemiBold", "Semi Bold"], 700: ["Bold"] };
const fontCache = {};
async function fontFor(family, weight) {
  const key = family + weight;
  if (key in fontCache) return fontCache[key];
  for (const style of STYLE[weight] || ["Regular"]) {
    try { await figma.loadFontAsync({ family, style }); fontCache[key] = { family, style }; report.fonts[key] = style; return fontCache[key]; } catch (e) {}
  }
  const fb = { family: "Inter", style: weight >= 600 ? "Semi Bold" : weight >= 500 ? "Medium" : "Regular" };
  await figma.loadFontAsync(fb); fontCache[key] = fb; report.fallbacks.push(key); return fb;
}
const paint = (hex) => {
  const h = hex.replace("#", "");
  const c = { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
  return { type: "SOLID", color: c, opacity: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
};
const rgbaOf = (hex) => { const p = paint(hex); return { ...p.color, a: p.opacity }; };
function boxProps(node, n) {
  node.fills = n.fill ? [paint(n.fill)] : [];
  if (n.r !== undefined) {
    if (Array.isArray(n.r)) { [node.topLeftRadius, node.topRightRadius, node.bottomRightRadius, node.bottomLeftRadius] = n.r; }
    else node.cornerRadius = Math.min(n.r, Math.min(n.w, n.h) / 2);
  }
  if (n.stroke) { node.strokes = [paint(n.stroke[0])]; node.strokeWeight = n.stroke[1]; node.strokeAlign = "INSIDE"; if (n.dash) node.dashPattern = [4, 4]; }
  else if ((n.bottom || n.top) && "strokeTopWeight" in node) {
    const s = n.bottom || n.top; node.strokes = [paint(s[0])]; node.strokeAlign = "INSIDE";
    node.strokeTopWeight = n.top ? n.top[1] : 0; node.strokeBottomWeight = n.bottom ? n.bottom[1] : 0; node.strokeLeftWeight = 0; node.strokeRightWeight = 0;
  }
  if (n.shadow) node.effects = n.shadow.map(([c, x, y, b, sp]) => ({ type: "DROP_SHADOW", color: rgbaOf(c), offset: { x, y }, radius: b, spread: sp, visible: true, blendMode: "NORMAL" }));
  if (n.o !== undefined) node.opacity = n.o;
}
async function build(n, parent) {
  try {
    if (n.t === "F" || n.t === "R") {
      const node = n.t === "F" ? figma.createFrame() : figma.createRectangle();
      node.name = n.n || "frame";
      parent.appendChild(node);
      node.x = n.x || 0; node.y = n.y || 0; node.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01));
      boxProps(node, n);
      if (n.t === "F") { node.clipsContent = !!n.clip; for (const k of n.k || []) await build(k, node); }
      return node;
    }
    if (n.t === "I") {
      const node = figma.createRectangle();
      node.name = "image · " + n.n; parent.appendChild(node);
      node.x = n.x; node.y = n.y; node.resize(n.w, n.h);
      node.fills = [paint("#E9DDCB")]; if (n.r) node.cornerRadius = n.r;
      report.images.push([node.id, n.n]);
      return node;
    }
    if (n.t === "S") {
      const svg = typeof n.v === "number" ? data.svgs[n.v] : n.svg;
      const node = figma.createNodeFromSvg(svg);
      node.name = "icon · " + n.n; parent.appendChild(node);
      node.x = n.x; node.y = n.y;
      if (Math.abs(node.width - n.w) > 0.5 || Math.abs(node.height - n.h) > 0.5) node.resize(n.w, n.h);
      return node;
    }
    if (n.t === "T") {
      const node = figma.createText();
      node.fontName = await fontFor(n.f, n.fw);
      node.characters = n.txt;
      node.name = n.txt.slice(0, 40);
      node.fontSize = n.s;
      if (n.lh) node.lineHeight = { value: n.lh, unit: "PIXELS" };
      if (n.ls) node.letterSpacing = { value: n.ls, unit: "PIXELS" };
      node.fills = [paint(n.c)];
      if (n.tt === "uppercase") node.textCase = "UPPER";
      if (n.u) node.textDecoration = "UNDERLINE";
      if (n.al) node.textAlignHorizontal = n.al === "center" ? "CENTER" : "RIGHT";
      parent.appendChild(node);
      if (n.lines > 1) { node.textAutoResize = "HEIGHT"; node.resize(n.w + 1, n.h); node.x = n.x; }
      else {
        node.textAutoResize = "WIDTH_AND_HEIGHT";
        node.x = n.al === "right" ? n.x + n.w - node.width : n.al === "center" ? n.x + (n.w - node.width) / 2 : n.x;
      }
      node.y = n.y;
      return node;
    }
  } catch (e) { report.errors.push((n.n || n.txt || n.t) + ": " + e.message); }
}
// Starter files allow 3 pages: reuse the new file's empty "Page 1" before creating one
let page = figma.root.children.find((p) => p.name === PAGE);
if (!page) page = figma.root.children.find((p) => /^Page \d+$/.test(p.name) && p.children.length === 0);
if (!page) page = figma.createPage();
page.name = PAGE;
await figma.setCurrentPageAsync(page);
for (let i = 1; i <= (report.failed.length === IDS.length ? 0 : IDS.length); i++) {
  let s;
  try { s = piece(i); if (s.id !== IDS[i - 1]) throw new Error("id mismatch"); }
  catch (e) { report.errors.push(IDS[i - 1] + ": " + e.message); report.failed.push(IDS[i - 1]); continue; }
  if (s.label) {
    const t = figma.createText(); t.fontName = await fontFor("Hanken Grotesk", 700); t.characters = s.label; t.fontSize = 28;
    t.fills = [paint("#2B2118")]; page.appendChild(t); t.x = SLOT[0] + s.x; t.y = SLOT[1] + s.y - 64; t.name = "label · " + s.label;
  }
  const frame = await build(s.tree, page);
  if (!frame) { report.failed.push(s.id); continue; }
  frame.name = s.name; frame.x = SLOT[0] + s.x; frame.y = SLOT[1] + s.y;
  report.frames.push([s.id, frame.id]);
}
// <tokens> (pack.mjs keeps this block only in the batch that carries TOKENS)
// Design tokens (only in the batch that carries TOKENS): local variables, text styles, effect styles
async function makeTokens(T) {
  const out = { variables: 0, textStyles: 0, effectStyles: 0, collections: [] };
  const prim = figma.variables.createVariableCollection("Primitives"), tok = figma.variables.createVariableCollection("Tokens");
  out.collections = [prim.id, tok.id];
  const pm = prim.modes[0].modeId, tm = tok.modes[0].modeId, byName = {};
  // scopes: primitives are hidden from pickers (used only through the semantic tokens)
  const colorScope = (n) => n.startsWith("bg/") ? ["FRAME_FILL", "SHAPE_FILL"] : n.startsWith("text/") ? ["TEXT_FILL"] : n.startsWith("border/") ? ["STROKE_COLOR"] : ["ALL_FILLS", "STROKE_COLOR"];
  const numScope = (n) => n.startsWith("space/") ? ["GAP"] : n.startsWith("radius/") ? ["CORNER_RADIUS"] : n.startsWith("border-width/") ? ["STROKE_FLOAT"] : ["WIDTH_HEIGHT"];
  for (const [name, hex] of T.prim) { const v = figma.variables.createVariable(name, prim, "COLOR"); v.setValueForMode(pm, rgbaOf(hex)); v.scopes = []; byName[name] = v; out.variables++; }
  for (const [name, val] of T.sem) {
    const v = figma.variables.createVariable("color/" + name, tok, "COLOR");
    v.setValueForMode(tm, val.startsWith("@") ? figma.variables.createVariableAlias(byName[val.slice(1)]) : rgbaOf(val)); v.scopes = colorScope(name); out.variables++;
  }
  for (const [name, n] of T.num) { const v = figma.variables.createVariable(name, tok, "FLOAT"); v.setValueForMode(tm, n); v.scopes = numScope(name); out.variables++; }
  for (const [name, fam, size, weight, lh, ls] of T.text) {
    const st = figma.createTextStyle(); st.name = name; st.fontName = await fontFor(fam, weight); st.fontSize = size;
    st.lineHeight = { value: lh, unit: "PERCENT" }; st.letterSpacing = { value: ls, unit: "PERCENT" }; out.textStyles++;
  }
  for (const [name, list] of T.fx) {
    const st = figma.createEffectStyle(); st.name = name;
    st.effects = list.map(([c, x, y, b, sp]) => ({ type: "DROP_SHADOW", color: rgbaOf(c), offset: { x, y }, radius: b, spread: sp, visible: true, blendMode: "NORMAL" })); out.effectStyles++;
  }
  return out;
}
if (TOKENS) { try { report.tokens = await makeTokens(TOKENS); } catch (e) { report.errors.push("tokens: " + e.message); } }
// </tokens>
return JSON.stringify(report);
