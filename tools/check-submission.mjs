// Submission readiness check (release hygiene, no design checks).
//   npm run check:submission              offline: Cyrillic, private data, placeholders, internal links and images
//   npm run check:submission -- --online  also requests the external links in LINKS.md and README.md
// Exit codes: 0 = all clear; 2 = only the video link is missing (expected until it is recorded); 1 = anything else.
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ONLINE = process.argv.includes("--online");
const TEXT = new Set([".md", ".html", ".css", ".js", ".mjs", ".py", ".json", ".txt", ".svg", ".yml", ".yaml", ""]);
const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" })
  .split("\n").filter((f) => f && !f.startsWith("node_modules/") && !f.startsWith(".venv/") && existsSync(resolve(ROOT, f)));
const textFiles = files.filter((f) => TEXT.has(extname(f).toLowerCase()) && statSync(resolve(ROOT, f)).size < 20e6);
// Embedded data (base64 images and fonts, packed Figma batches) is not prose: strip it before scanning.
const read = (f) => readFileSync(resolve(ROOT, f), "utf8").replace(/data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, "").replace(/[A-Za-z0-9+/=!#$%&()*,.:;<>?@\[\]^_`{|}~-]{200,}/g, "");
const SELF = "tools/check-submission.mjs";
// Cyrillic block U+0400-U+04FF, built from code points so this file stays ASCII-only.
const CYR = new RegExp("[" + String.fromCharCode(0x400) + "-" + String.fromCharCode(0x4ff) + "]+", "g");

const failures = [], warnings = [], expected = [];
const lineOf = (text, index) => text.slice(0, index).split("\n").length;
const section = (title) => console.log(`\n${title}`);

// 1. Cyrillic: the repository must be English only (file names and contents).
section("1. Cyrillic (U+0400–U+04FF)");
let cyr = 0;
for (const f of files) if (new RegExp(CYR.source).test(f)) { cyr++; failures.push(`Cyrillic in file name: ${f}`); }
for (const f of textFiles) {
  const t = read(f); const m = [...t.matchAll(CYR)];
  if (m.length) { cyr += m.length; failures.push(`Cyrillic in ${f}:${lineOf(t, m[0].index)} (${m.length} run(s))`); }
}
console.log(cyr ? `  ✗ ${cyr} occurrence(s)` : "  ✓ 0");

// 2. Private data: personal e-mail addresses, local paths, session transcripts, Figma team IDs, machine names, keys.
section("2. Private data");
const PRIVATE = [
  ["e-mail address", /[A-Za-z0-9._%+-]+@(?!example\.(?:com|org|net)\b)(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}/g],
  ["absolute local path", /\/Users\/[A-Za-z0-9._-]+|\/home\/[a-z][a-z0-9_-]*\/|\b[A-Z]:\\Users\\/g],
  ["Claude Code home folder", /~\/\.claude\b|\.claude\/projects\//g],
  ["session transcript", /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jsonl/g],
  ["Figma team / organization ID", /\b(?:team|organization)::\d+/g],
  ["machine name", /\b[a-z0-9-]+\.home\b|\bmacbook-pro-[a-z0-9-]+/gi],
  ["access key or token", /\bghp_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}|\bsk-[A-Za-z0-9]{20,}|\bAKIA[0-9A-Z]{16}\b|\bxox[abp]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
];
const NOT_EMAIL = /\.(png|jpe?g|svg|webp|css|js|mjs|html|json|md)$|@(?:\d|media|import|font-face|keyframes|supports|layer|axe-core|playwright|types|storybook)\b|^ID\+username@/i; // the last one is the GitHub noreply template, not an address
let priv = 0;
for (const f of textFiles) {
  if (f === SELF) continue;
  const t = read(f);
  for (const [name, re] of PRIVATE) for (const m of t.matchAll(re)) {
    if (name === "e-mail address" && NOT_EMAIL.test(m[0])) continue;
    priv++;
    const v = m[0], masked = v.includes("@") ? v.slice(0, 2) + "***@" + v.split("@")[1].slice(0, 2) + "***" : v.slice(0, 6) + "…";
    failures.push(`${name} in ${f}:${lineOf(t, m.index)} (${masked})`);
  }
}
console.log(priv ? `  ✗ ${priv} finding(s)` : "  ✓ 0");

// 3. Placeholders that must be resolved before submission.
section("3. Placeholders");
const PLACEHOLDERS = /Coming soon|Not recorded yet|To be added|\bTODO\b(?!\.md)/g;
const VIDEO_FILES = new Set(["README.md", "LINKS.md", "index.html"]);
let ph = 0;
for (const f of textFiles) {
  if (f === SELF || f.startsWith("process/") || f === "HOW-IT-WORKS.md") continue; // logs quote the history; this guide names the check
  const t = read(f);
  for (const m of t.matchAll(PLACEHOLDERS)) {
    ph++;
    const ln = lineOf(t, m.index), near = t.split("\n").slice(Math.max(0, ln - 4), ln + 1).join(" ");
    const msg = `"${m[0]}" in ${f}:${ln}`;
    if (VIDEO_FILES.has(f) && /video/i.test(near)) expected.push(`${msg} (video link)`); else failures.push(msg);
  }
}
console.log(ph ? `  ${ph} placeholder(s) (see summary)` : "  ✓ none");

// 4. Internal links and images resolve (HTML href/src, CSS url(), Markdown links and images).
section("4. Internal links and images");
const SKIP = /^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i;
let checked = 0, broken = 0;
for (const f of textFiles) {
  const ext = extname(f).toLowerCase();
  if (![".html", ".md", ".css"].includes(ext) || f.startsWith("figma-export/")) continue;
  const t = readFileSync(resolve(ROOT, f), "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const refs = [];
  if (ext === ".html") for (const m of t.matchAll(/\s(?:href|src|data-href)="([^"]+)"/g)) refs.push(m[1]);
  if (ext === ".html" || ext === ".css") for (const m of t.matchAll(/url\(["']?([^"')]+)["']?\)/g)) refs.push(m[1]);
  if (ext === ".md") for (const m of t.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) refs.push(m[1]);
  for (const r of refs) {
    if (SKIP.test(r) || r.includes("${")) continue;
    const path = decodeURIComponent(r.split("#")[0].split("?")[0]);
    if (!path) continue;
    checked++;
    if (!existsSync(resolve(ROOT, dirname(f), path))) { broken++; failures.push(`broken link in ${f}: ${r}`); }
  }
}
console.log(broken ? `  ✗ ${broken} broken of ${checked}` : `  ✓ ${checked} links and images resolve`);

// 5. External links (online only): every URL in LINKS.md and README.md should answer 200.
section(`5. External links${ONLINE ? "" : " (skipped: run with --online)"}`);
if (ONLINE) {
  const urls = new Set();
  for (const f of ["LINKS.md", "README.md"]) for (const m of readFileSync(resolve(ROOT, f), "utf8").matchAll(/https?:\/\/[^\s)<>|"]+/g)) urls.add(m[0].replace(/[.,]$/, ""));
  for (const u of urls) {
    let status = 0;
    try { status = (await fetch(u, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (submission check)" } })).status; } catch (e) { status = String(e.cause?.code || e.message); }
    if (status === 200) console.log(`  ✓ 200 ${u}`);
    else if (/figma\.com/.test(u) && status === 403) { warnings.push(`${u} answered 403: Figma blocks automated requests. Open it in an incognito window to check.`); console.log(`  ! 403 ${u} (Figma blocks bots: check by hand)`); }
    else { failures.push(`external link ${u} answered ${status}`); console.log(`  ✗ ${status} ${u}`); }
  }
}

// Summary
console.log("\nSummary");
for (const w of warnings) console.log(`  ! ${w}`);
for (const e of expected) console.log(`  … expected until the video is recorded: ${e}`);
for (const x of failures) console.log(`  ✗ ${x}`);
if (failures.length) { console.log(`\n✗ ${failures.length} problem(s) to fix.`); process.exit(1); }
if (expected.length) { console.log("\n… Only the video link is missing: add it to README.md, LINKS.md and index.html, then run again."); process.exit(2); }
console.log("\n✓ Ready to submit."); process.exit(0);
