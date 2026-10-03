// Figma export, step 1 (0 Figma calls): render each screen at 390 × 844 and turn the visible DOM into a
// compact layer tree that tools/figma/builder.js recreates as editable Figma layers:
//   FRAME  boxes with a fill, stroke, radius, shadow or clipping (children nested, positions relative)
//   TEXT   real text with family / weight / size / line height / tracking / colour / case
//   SVG    icons and rings, inlined with resolved colours (become editable vectors)
//   IMG    photos: a named rectangle, filled later with upload_assets (cover = FILL);
//          an <img> of an SVG file (the logo) is inlined as SVG instead, since upload_assets cannot fill with SVG
// Usage: node tools/figma/extract.mjs [screen …]   → figma-export/layers/<screen>.json
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SCREENS = resolve(ROOT, "03-screens/screens");
const OUT = resolve(ROOT, "figma-export/layers");
mkdirSync(OUT, { recursive: true });
const ids = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(SCREENS).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const summary = [];
for (const id of ids) {
  await page.goto(pathToFileURL(resolve(SCREENS, `${id}.html`)).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" }); // freeze the state
  await page.waitForTimeout(100);
  const tree = await page.evaluate(() => {
    const screen = document.querySelector(".screen");
    const SR = screen.getBoundingClientRect();
    const r1 = (n) => Math.round(n * 10) / 10;
    const rgba = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return a === 0 ? null : [r, g, b, r1(+a)]; };
    const hex = ([r, g, b, a]) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("") + (a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : "");
    const px = (v) => parseFloat(v) || 0;
    const visible = (e, cs) => cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0 && !e.closest(".visually-hidden, [hidden], [aria-hidden='true'] .visually-hidden");
    const nameOf = (e) => {
      const cls = [...e.classList].filter((c) => !/^is-|^t-|^text-|^fill$/.test(c));
      const label = e.getAttribute("aria-label") || (e.matches("button, a") ? e.textContent.trim().replace(/\s+/g, " ").slice(0, 28) : "");
      return (cls[0] || e.tagName.toLowerCase()) + (label ? ` · ${label}` : "");
    };
    // box visuals: fill, stroke (border or an inset ring box-shadow), radius, drop shadow
    const box = (e, cs) => {
      const v = {};
      const bg = rgba(cs.backgroundColor); if (bg) v.fill = hex(bg);
      const radii = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(px);
      if (radii.some(Boolean)) v.r = radii.every((x) => x === radii[0]) ? radii[0] : radii;
      const bw = px(cs.borderTopWidth), bc = rgba(cs.borderTopColor);
      if (bw && bc && cs.borderTopStyle !== "none" && [cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].every((w) => px(w) === bw)) v.stroke = [hex(bc), bw];
      else if (px(cs.borderBottomWidth) && rgba(cs.borderBottomColor) && cs.borderBottomStyle !== "none") v.bottom = [hex(rgba(cs.borderBottomColor)), px(cs.borderBottomWidth)];
      if (px(cs.borderTopWidth) && !v.stroke && rgba(cs.borderTopColor) && cs.borderTopStyle !== "none") v.top = [hex(rgba(cs.borderTopColor)), px(cs.borderTopWidth)];
      if (cs.boxShadow !== "none") {
        for (const layer of cs.boxShadow.split(/,(?![^(]*\))/)) {
          const col = rgba(layer); const nums = (layer.replace(/rgba?\([^)]*\)/, "").match(/-?[\d.]+px/g) || []).map(px);
          if (!col) continue;
          if (/inset/.test(layer) && nums.length >= 4 && nums[0] === 0 && nums[1] === 0 && nums[2] === 0) { if (!v.stroke) v.stroke = [hex(col), nums[3]]; }
          else if (!/inset/.test(layer) && nums.length >= 3 && (nums[2] > 0 || nums[1] !== 0)) (v.shadow ||= []).push([hex(col), nums[0], nums[1], nums[2], nums[3] || 0]);
          else if (!/inset/.test(layer) && nums.length >= 4 && nums[0] === 0 && nums[1] === 0 && nums[2] === 0 && nums[3] > 0) (v.rings ||= []).push([hex(col), nums[3]]);
        }
      }
      if (cs.borderTopStyle === "dashed" && v.stroke) v.dash = 1;
      if (cs.outlineStyle !== "none" && px(cs.outlineWidth) > 0 && rgba(cs.outlineColor)) v.outline = [hex(rgba(cs.outlineColor)), px(cs.outlineWidth), px(cs.outlineOffset), cs.outlineStyle === "dashed" ? 1 : 0];
      if (+cs.opacity < 1) v.o = +cs.opacity;
      return v;
    };
    // rings and outlines → stroke-only rectangles around the box (children of the frame, coordinates relative to it)
    const ringNodes = (v, w, h) => {
      const out = []; const r0 = Array.isArray(v.r) ? v.r[0] : (v.r || 0);
      if (v.rings) { const sorted = [...v.rings].sort((a, b) => a[1] - b[1]); let prev = 0; for (const [c, sp] of sorted) { out.push({ t: "R", n: "ring", x: -sp, y: -sp, w: w + 2 * sp, h: h + 2 * sp, r: r0 ? r0 + sp : 0, stroke: [c, sp - prev] }); prev = sp; } }
      if (v.outline) { const [c, ow, off, dash] = v.outline; const e = off + ow; out.push({ t: "R", n: "outline", x: -e, y: -e, w: w + 2 * e, h: h + 2 * e, r: r0 ? Math.max(0, r0 + e) : 0, stroke: [c, ow], dash: dash || undefined }); }
      delete v.rings; delete v.outline;
      return out;
    };
    const rel = (rect, parent) => [r1(rect.left - parent.x), r1(rect.top - parent.y), r1(rect.width), r1(rect.height)];
    const svgOf = (svg) => {
      const clone = svg.cloneNode(true);
      // inline <use href="#i-…"> symbols and resolved stroke / fill colours
      clone.querySelectorAll("use").forEach((u) => {
        const sym = document.querySelector(u.getAttribute("href"));
        if (!sym) return;
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.innerHTML = sym.innerHTML;
        if (!clone.getAttribute("viewBox") && sym.getAttribute("viewBox")) clone.setAttribute("viewBox", sym.getAttribute("viewBox"));
        u.replaceWith(g);
      });
      const live = [svg, ...svg.querySelectorAll("*")], copy = [clone, ...clone.querySelectorAll("*")];
      const cs0 = getComputedStyle(svg);
      clone.setAttribute("stroke", cs0.stroke === "none" ? "none" : hex(rgba(cs0.stroke) || [0, 0, 0, 1]));
      clone.setAttribute("fill", cs0.fill === "none" ? "none" : (rgba(cs0.fill) ? hex(rgba(cs0.fill)) : "none"));
      clone.setAttribute("stroke-width", cs0.strokeWidth); clone.setAttribute("stroke-linecap", cs0.strokeLinecap); clone.setAttribute("stroke-linejoin", cs0.strokeLinejoin);
      live.forEach((el, i) => {
        if (i === 0 || !copy[i] || !(el instanceof SVGElement)) return;
        const c = getComputedStyle(el);
        if (el.getAttribute("class")) {
          copy[i].setAttribute("stroke", c.stroke === "none" ? "none" : hex(rgba(c.stroke) || [0, 0, 0, 1])); copy[i].setAttribute("fill", c.fill === "none" || !rgba(c.fill) ? "none" : hex(rgba(c.fill)));
          copy[i].setAttribute("stroke-linecap", c.strokeLinecap); copy[i].setAttribute("stroke-linejoin", c.strokeLinejoin);
          if (c.strokeDasharray !== "none") {
            // Figma's SVG import misreads "201px, 400px" and pathLength: a single dash (a progress arc) becomes
            // the visible part of the path itself (points in the element's own space, so its transform still applies);
            // a real dash pattern keeps plain numbers
            const dash = c.strokeDasharray.split(/[ ,]+/).map(parseFloat), L = el.getTotalLength ? el.getTotalLength() : 0;
            const off = parseFloat(c.strokeDashoffset) || 0;
            if (L && dash.length === 2 && dash[0] + dash[1] >= L) {
              const a = ((-off % L) + L) % L, b = Math.min(L, a + dash[0]), n = Math.max(8, Math.ceil((b - a) / 6)), pts = [];
              for (let j = 0; j <= n; j++) { const q = el.getPointAtLength(a + (b - a) * j / n); pts.push(`${+q.x.toFixed(1)} ${+q.y.toFixed(1)}`); }
              const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
              for (const at of copy[i].getAttributeNames()) if (!["d", "cx", "cy", "r", "x", "y", "width", "height", "pathLength", "stroke-dasharray", "stroke-dashoffset"].includes(at)) path.setAttribute(at, copy[i].getAttribute(at));
              path.setAttribute("d", dash[0] > 0 ? "M" + pts.join("L") : "M0 0");
              if (dash[0] <= 0) path.setAttribute("stroke", "none");
              copy[i].replaceWith(path); copy[i] = path;
            } else copy[i].setAttribute("stroke-dasharray", dash.join(" "));
          }
        }
        copy[i].removeAttribute("class");
      });
      clone.removeAttribute("class"); clone.removeAttribute("aria-hidden"); clone.removeAttribute("role"); clone.removeAttribute("aria-label"); clone.removeAttribute("style");
      const r = svg.getBoundingClientRect();
      clone.setAttribute("width", r.width); clone.setAttribute("height", r.height);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      return clone.outerHTML.replace(/\s+/g, " ").replace(/> </g, "><");
    };
    const font = (cs) => ({ f: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), fw: +cs.fontWeight, s: px(cs.fontSize), lh: cs.lineHeight === "normal" ? null : px(cs.lineHeight), ls: px(cs.letterSpacing) || 0, c: hex(rgba(cs.color) || [0, 0, 0, 1]), tt: cs.textTransform !== "none" ? cs.textTransform : undefined, al: ["center", "right", "end"].includes(cs.textAlign) ? cs.textAlign.replace("end", "right") : undefined, u: /underline/.test(cs.textDecorationLine) ? 1 : undefined, tab: /tabular/.test(cs.fontVariantNumeric) ? 1 : undefined });

    let ROOT;
    function walk(e, parentNode, origin, clip) {
      const out = parentNode.k;
      for (const child of e.childNodes) {
        if (child.nodeType === 3) {
          const raw = child.textContent;
          const text = raw.replace(/\s+/g, " ");
          if (!text.trim()) continue;
          // measure the visible characters only (a leading space would shift the box, e.g. "21" + " g")
          const start = raw.search(/\S/), end = raw.length - raw.split("").reverse().join("").search(/\S/);
          const range = document.createRange(); range.setStart(child, start); range.setEnd(child, end);
          const rects = [...range.getClientRects()].filter((q) => q.width > 0);
          if (!rects.length) continue;
          const left = Math.min(...rects.map((q) => q.left)), right = Math.max(...rects.map((q) => q.right)), top = Math.min(...rects.map((q) => q.top)), bottom = Math.max(...rects.map((q) => q.bottom));
          if (clip && (bottom <= clip.top || top >= clip.bottom || right <= clip.left || left >= clip.right)) continue;
          const cs = getComputedStyle(child.parentElement);
          out.push({ t: "T", x: r1(left - origin.x), y: r1(top - origin.y), w: r1(right - left), h: r1(bottom - top), txt: rects.length > 1 ? text.trim() : text.trim(), lines: rects.length > 1 ? new Set(rects.map((q) => Math.round(q.top))).size : 1, ...font(cs) });
          continue;
        }
        if (child.nodeType !== 1) continue;
        const el = child; const cs = getComputedStyle(el);
        if (!visible(el, cs) || el.matches("script, style, template, datalist, dialog:not([open])")) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 1.5 && rect.height < 1.5 && !el.childElementCount) continue;
        if (clip && (rect.bottom <= clip.top || rect.top >= clip.bottom || rect.right <= clip.left || rect.left >= clip.right)) continue;
        if (el.tagName.toLowerCase() === "svg") { if (rect.width && rect.height) out.push({ t: "S", n: (el.querySelector("use")?.getAttribute("href") || "#svg").slice(1), x: r1(rect.left - origin.x), y: r1(rect.top - origin.y), w: r1(rect.width), h: r1(rect.height), svg: svgOf(el) }); continue; }
        if (el.tagName === "IMG") { out.push({ t: "I", n: el.getAttribute("src").split("/").pop(), x: r1(rect.left - origin.x), y: r1(rect.top - origin.y), w: r1(rect.width), h: r1(rect.height), r: px(cs.borderTopLeftRadius) || undefined, fit: cs.objectFit }); continue; }
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !el.classList.contains("visually-hidden")) {
          const v = box(el, cs);
          const val = el.tagName === "SELECT" ? el.options[el.selectedIndex]?.text : el.value;
          const rings = ringNodes(v, rect.width, rect.height);
          if (Object.keys(v).length || rings.length) out.push({ t: "F", n: el.tagName.toLowerCase(), x: r1(rect.left - origin.x), y: r1(rect.top - origin.y), w: r1(rect.width), h: r1(rect.height), ...v, k: rings });
          // a select shows its chevron (drawn by the platform in the browser)
          if (el.tagName === "SELECT") { const chev = document.querySelector("#i-chev-d"); const sz = 16; if (chev) out.push({ t: "S", n: "chev-d", x: r1(rect.right - origin.x - px(cs.paddingRight) - sz + 4), y: r1(rect.top - origin.y + (rect.height - sz) / 2), w: sz, h: sz, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="${hex(rgba(cs.color))}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${chev.innerHTML}</svg>` }); }
          if (val && el.type !== "radio" && el.type !== "checkbox") {
            const pl = px(cs.paddingLeft), pr = px(cs.paddingRight), fs = font(cs);
            const lh = fs.lh || fs.s * 1.3;
            out.push({ t: "T", x: r1(rect.left - origin.x + pl), y: r1(rect.top - origin.y + (rect.height - lh) / 2), w: r1(rect.width - pl - pr), h: r1(lh), txt: val, lines: 1, ...fs });
          }
          continue;
        }
        const v = box(el, cs);
        const clips = cs.overflowX !== "visible" || cs.overflowY !== "visible";
        // pseudo elements drawn as lines or tints (list dividers, overlays)
        const pseudos = [];
        for (const which of ["::before", "::after"]) {
          const p = getComputedStyle(el, which);
          if (p.content === "none" || p.content === "normal" || p.display === "none" || p.visibility === "hidden") continue;
          if (p.position !== "absolute") continue;
          const bw = px(p.borderTopWidth), bc = rgba(p.borderTopColor), bg = rgba(p.backgroundColor);
          const ol = p.outlineStyle !== "none" && px(p.outlineWidth) > 0 && rgba(p.outlineColor);
          if (!(bw && bc && p.borderTopStyle !== "none") && !bg && !ol) continue;
          const L = p.left === "auto" ? null : px(p.left), Rr = p.right === "auto" ? null : px(p.right), T = p.top === "auto" ? null : px(p.top), B = p.bottom === "auto" ? null : px(p.bottom);
          const W = L !== null && Rr !== null ? rect.width - L - Rr : px(p.width);
          let H = bg || ol ? (T !== null && B !== null ? rect.height - T - B : px(p.height)) : bw;
          if (!H && p.aspectRatio && p.aspectRatio !== "auto") H = W / (parseFloat(p.aspectRatio.split("/")[0]) / (parseFloat(p.aspectRatio.split("/")[1]) || 1));
          let X = L !== null ? L : rect.width - (Rr || 0) - W, Y = T !== null ? T : rect.height - (B || 0) - H;
          if (p.translate && p.translate !== "none") { const [tx, ty = "0"] = p.translate.split(" "); const tr = (v, size) => /%$/.test(v) ? parseFloat(v) / 100 * size : px(v); X += tr(tx, W); Y += tr(ty, H); }
          if (ol && !bg) { const ow = px(p.outlineWidth), off = px(p.outlineOffset), e = off + ow; const rr = px(p.borderTopLeftRadius);
            pseudos.push({ t: "R", n: which.slice(2), x: r1(X - e), y: r1(Y - e), w: r1(W + 2 * e), h: r1(H + 2 * e), r: rr ? rr + e : 0, stroke: [hex(ol), ow], dash: p.outlineStyle === "dashed" ? 1 : undefined }); continue; }
          if (W > 0 && H > 0) pseudos.push({ t: "R", n: which.slice(2), x: r1(X), y: r1(Y), w: r1(W), h: r1(H), fill: hex(bg || bc) });
        }
        // a scrim with a clear circle (radial-gradient: transparent inside, a colour outside) → evenodd vector
        const rg = cs.backgroundImage.match(/radial-gradient\((?:circle )?([\d.]+)px(?: at 50% 50%)?, rgba\(0, 0, 0, 0\) [\d.]+%, (rgba?\([^)]*\)) 100%\)/);
        if (rg) {
          const R = +rg[1], cx = rect.width / 2, cy = rect.height / 2, col = hex(rgba(rg[2]));
          pseudos.push({ t: "S", n: "scrim", x: 0, y: 0, w: r1(rect.width), h: r1(rect.height), svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}"><path fill-rule="evenodd" fill="${col}" d="M0 0H${rect.width}V${rect.height}H0Z M${cx - R} ${cy}A${R} ${R} 0 1 0 ${cx + R} ${cy}A${R} ${R} 0 1 0 ${cx - R} ${cy}Z"/></svg>` });
        }
        const isFrame = Object.keys(v).length || clips || pseudos.length;
        if (el.matches("dialog:modal")) {
          const bd = rgba(getComputedStyle(el, "::backdrop").backgroundColor);
          if (bd) ROOT.k.push({ t: "R", n: "backdrop", x: 0, y: 0, w: 390, h: 844, fill: hex(bd) });
          parentNode = ROOT; origin = { x: SR.left, y: SR.top };
        }
        if (isFrame) {
          const rings = ringNodes(v, rect.width, rect.height);
          const node = { t: "F", n: nameOf(el), x: r1(rect.left - origin.x), y: r1(rect.top - origin.y), w: r1(rect.width), h: r1(rect.height), ...v, clip: clips ? 1 : undefined, k: [] };
          node.k.push(...pseudos, ...rings);
          out.push(node);
          const nclip = clips ? { left: Math.max(rect.left, clip ? clip.left : -1e9), right: Math.min(rect.right, clip ? clip.right : 1e9), top: Math.max(rect.top, clip ? clip.top : -1e9), bottom: Math.min(rect.bottom, clip ? clip.bottom : 1e9) } : clip;
          walk(el, node, { x: rect.left, y: rect.top }, nclip);
          if (!node.k.length && !Object.keys(v).length) out.pop();
        } else walk(el, parentNode, origin, clip);
      }
    }
    const root = { t: "F", n: document.title.replace(" · Ripe", ""), w: 390, h: 844, fill: hex(rgba(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1]), clip: 1, k: [] };
    ROOT = root;
    walk(screen, root, { x: SR.left, y: SR.top }, { left: SR.left, right: SR.right, top: SR.top, bottom: SR.bottom });
    return root;
  });
  (function inlineSvg(n) {
    for (const [i, c] of (n.k || []).entries()) {
      if (c.t === "I" && c.n.endsWith(".svg")) {
        const file = [resolve(ROOT, "01-branding/assets", c.n), resolve(ROOT, "01-branding/assets/logo", c.n)].find((f) => { try { return readFileSync(f); } catch { return false; } });
        const svg = readFileSync(file, "utf8").replace(/<title>.*?<\/title>/s, "").replace("<svg ", `<svg width="${c.w}" height="${c.h}" `).replace(/\s*\n\s*/g, " ").trim();
        n.k[i] = { t: "S", n: c.n.replace(".svg", ""), x: c.x, y: c.y, w: c.w, h: c.h, svg };
      } else inlineSvg(c);
    }
  })(tree);
  const json = JSON.stringify(tree);
  writeFileSync(resolve(OUT, `${id}.json`), json);
  const count = (n) => 1 + (n.k || []).reduce((a, c) => a + count(c), 0);
  const imgs = []; (function f(n) { if (n.t === "I") imgs.push(n.n); (n.k || []).forEach(f); })(tree);
  summary.push({ id, chars: json.length, nodes: count(tree), images: imgs.length, imageFiles: [...new Set(imgs)] });
}
await browser.close();
writeFileSync(resolve(ROOT, "figma-export/layers/_summary.json"), JSON.stringify(summary, null, 1));
for (const s of summary) console.log(`${s.id.padEnd(30)} ${String(s.chars).padStart(7)} chars  ${String(s.nodes).padStart(4)} nodes  ${s.images} images`);
