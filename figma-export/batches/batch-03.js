const IDS = ["05-allergies-edit","16-profile-updated","13-recipes-filtered","16-profile-delete","15-diary","15-diary-mon","15-diary-tue","15-diary-wed"];
const SUMS = [1406992540,1214229790,2750167345,3635993214,3956837418,4229994811,1094360318,2141768318,3010371912];
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
try { const f = await figma.getNodeByIdAsync("1:3"); const old = f && f.findOne((n) => n.name === "icon · svg" && Math.round(n.width) === 256 && Math.round(n.height) === 136);
if (!old) throw new Error("old arc not found"); const nu = figma.createNodeFromSvg("<svg viewBox=\"0 0 256 136\" stroke=\"none\" fill=\"#000000\" stroke-width=\"1px\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" width=\"256\" height=\"136\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M16 128 A112 112 0 0 1 240 128\" stroke-width=\"20\" stroke=\"#fce3cc\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"miter\"></path><path stroke-width=\"20\" stroke=\"#c4431a\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"miter\" d=\"M16 128L16.2 122.1L16.6 116.2L17.4 110.3L18.5 104.5L19.9 98.8L21.5 93.1L23.5 87.5L25.8 82.1L28.4 76.8L31.2 71.6L34.3 66.6L37.7 61.7L41.3 57L45.2 52.6L49.3 48.3L53.6 44.3L58.1 40.5L62.8 36.9L67.7 33.6L72.8 30.5L78 27.7L83.4 25.2L88.9 23L94.4 21.1L100.1 19.5L105.9 18.2L111.7 17.2L117.6 16.5L123.5 16.1L129.4 16L135.3 16.2L141.2 16.8L147 17.6L152.8 18.8\"></path></svg>"); nu.name = "icon · kcal arc";
old.parent.insertChild(old.parent.children.indexOf(old) + 1, nu); nu.x = old.x; nu.y = old.y; old.visible = false; old.name = "icon · kcal arc (dashed import, hidden)"; report.fixed = [old.id, nu.id];
} catch (e) { report.errors.push("arc fix: " + e.message); }
return JSON.stringify(report);