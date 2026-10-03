const IDS = ["07-today-before-lunch","08-scan","09-photo-result-analyzing","09-photo-result","07-today-lunch-added","01-welcome","01-welcome-link","02-goal","03-about-you","04-diet","05-allergies","06-target","07-today-empty","16-profile"];
const SUMS = [2775275812,394347154,3134937137,44796468,2125503750,114456330,2358763857,2290276677,1696551106,2816897046,3449139528,2027284437,2370740821,2826716165,1631013892];
const PACK = "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";
const PAGE = "Screens";
const SLOT = [0, 0];
const TOKENS = null;
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
const unpack = (s) => inflate(figma.base64Decode(s));
const sum = (t) => { let h = 5381; for (let i = 0; i < t.length; i++) h = (Math.imul(h, 33) + t.charCodeAt(i)) >>> 0; return h; };
const report = { frames: [], images: [], fonts: {}, fallbacks: [], errors: [], failed: [] };
let parts = [];
try { parts = unpack(PACK).split("\n"); } catch (e) { report.errors.push("unpack: " + e.message); }
const piece = (i) => { if (sum(parts[i] || "") !== SUMS[i]) throw new Error("checksum mismatch"); return JSON.parse(parts[i]); };
const data = { svgs: [] };
try { data.svgs = piece(0); } catch (e) { report.errors.push("svgs: " + e.message); report.failed = IDS.slice(); }
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
return JSON.stringify(report);
