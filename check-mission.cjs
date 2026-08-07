/**
 * check-mission.cjs — proves the new bento section only references things that
 * actually exist, BEFORE you build.
 *
 * Run from the repo root:  node check-mission.cjs
 *
 * This exists because of a specific failure. The homepage was taken down once
 * by a component referencing `demandMapCopy.filters`, a content key that had
 * been removed — `undefined.map()` at hydration. The prerendered HTML was fine,
 * so the BUILD PASSED and Actions went green while the live page was blank.
 * `vite build` does not type-check, so nothing catches this on the way through.
 *
 * The new mission-solution.tsx was written against content/home.ts read in
 * pieces, which is exactly the situation that produced that bug. So every field
 * it touches is asserted here, plus the two images and the hook it imports.
 */
const fs = require("fs");
const path = require("path");

let bad = 0;
const ok = (m) => console.log("  ok    " + m);
const err = (m) => { console.error("  FAIL  " + m); bad += 1; };

function read(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) { err("missing file: " + rel); return ""; }
  return fs.readFileSync(p, "utf8");
}

const home = read("src/content/home.ts");
const comp = read("src/components/home/mission-solution.tsx");
const reveal = read("src/components/ui/reveal.tsx");

/* ── the exports the component imports ─────────────────────────────────── */
for (const name of [
  "challengeCopy", "impactProof", "purposeCopy", "purposeStats",
  "purposeStatsNote", "solutionCopy",
]) {
  if (new RegExp(`export const ${name}\\b`).test(home)) ok(`content/home.ts exports ${name}`);
  else err(`content/home.ts does NOT export ${name}`);
}

/* ── the fields it reads off them ──────────────────────────────────────────
   Checked as "this key appears somewhere in home.ts". That is deliberately a
   weak test — it cannot prove the key sits on the right object — but it catches
   the case that actually breaks the page, which is a key that is not there at
   all. */
const FIELDS = [
  ["purposeCopy", ["eyebrow", "title", "emphasis", "statement"]],
  ["challengeCopy", ["eyebrow", "title", "lead", "points"]],
  ["solutionCopy", ["eyebrow", "title", "lead", "assertion", "roster", "stages"]],
];
for (const [obj, keys] of FIELDS) {
  const start = home.indexOf(`export const ${obj}`);
  const body = home.slice(start, start + 4000);
  for (const k of keys) {
    if (new RegExp(`\\b${k}\\s*:`).test(body)) ok(`${obj}.${k}`);
    else err(`${obj}.${k} not found`);
  }
}

/* impactProof is nested deeper, so it gets its own pass. */
const ip = home.slice(home.indexOf("export const impactProof"), home.indexOf("export const impactProof") + 3000);
for (const k of ["eyebrow", "multiplier", "from", "to", "figure", "label", "disclaimer"]) {
  if (new RegExp(`\\b${k}\\s*:`).test(ip)) ok("impactProof…" + k);
  else err("impactProof…" + k + " not found");
}

/* stages carry number/name/icon/points — the three tiles on the back face. */
const sol = home.slice(home.indexOf("export const solutionCopy"), home.indexOf("export const solutionCopy") + 4000);
for (const k of ["number", "name", "icon"]) {
  if (new RegExp(`\\b${k}\\s*:`).test(sol)) ok("solutionCopy.stages[]." + k);
  else err("solutionCopy.stages[]." + k + " not found");
}

/* ── the hero tile is selected by id, not by position ──────────────────── */
if (/id:\s*"children-ta"/.test(home)) ok('purposeStats has id "children-ta" (the hero tile)');
else err('no purposeStats entry with id "children-ta" — the hero tile would fall back to the first stat');

/* every stat needs the four fields the tile renders */
const ps = home.slice(home.indexOf("export const purposeStats"), home.indexOf("export const purposeStatsNote"));
for (const k of ["value", "label", "basis", "icon"]) {
  if (new RegExp(`\\b${k}\\s*:`).test(ps)) ok("purposeStats[]." + k);
  else err("purposeStats[]." + k + " not found");
}

/* ── the hook ───────────────────────────────────────────────────────────── */
if (/export function useCountUp/.test(reveal)) ok("reveal.tsx exports useCountUp");
else err("reveal.tsx does NOT export useCountUp — the counting figure will not compile");

/* ── the two images ─────────────────────────────────────────────────────── */
for (const img of ["public/images/why-estate-aerial.webp", "public/images/ai-team/trio-wave.webp"]) {
  if (fs.existsSync(path.join(process.cwd(), img))) ok(img);
  else err("missing image: " + img);
}

/* ── dead keys that took the page down once ─────────────────────────────── */
const GONE = ["demandMapCopy.filters", "demandMapCopy.selectors", "demandMapCopy.filtersLabel"];
const revived = GONE.filter((k) => comp.includes(k));
if (revived.length) err("references removed content keys: " + revived.join(", "));
else ok("no references to removed content keys");

/* ── the section still has exactly one flip control per face ───────────── */
const flips = (comp.match(/<FlipBar/g) || []).length;
if (flips === 2) ok("two flip bars — one per face");
else err("expected 2 flip bars, found " + flips);

/* The three stats are picked by id. If content/home.ts ever drops one of them
   the row silently renders two tiles in a three-column grid — a hole, which is
   the exact fault this rebuild removed. */
for (const id of ["waiting-lists", "temporary-accommodation", "asset-requirement"]) {
  if (new RegExp(`id:\\s*"${id}"`).test(home)) ok(`purposeStats has id "${id}"`);
  else err(`purposeStats has no id "${id}" — the stat row would render with a gap`);
}

/* Three bullets are sliced off challengeCopy.points; fewer than three leaves the
   two-column list lopsided. */
const ptCount = (home.slice(home.indexOf("export const challengeCopy"), home.indexOf("export const solutionCopy")).match(/text:/g) || []).length;
if (ptCount >= 3) ok(`challengeCopy.points has ${ptCount} entries (3 are shown)`);
else err(`challengeCopy.points has only ${ptCount} entries`);

console.log("");
if (bad) { console.error(bad + " problem(s) — do NOT push. Send me this output."); process.exit(1); }
console.log("all checks passed — safe to build");
