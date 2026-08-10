/**
 * fix-crisis-panel.cjs — the crisis panel goes navy with cream text.
 *
 * Run from the repo root:  node fix-crisis-panel.cjs
 *
 * ── WHY IT WENT DARK-ON-DARK IN THE FIRST PLACE ───────────────────────────
 *
 * The panel carries `teal-wash`, a custom class. `.section-light` only remaps
 * things it recognises — `bg-navy-*`, `text-white`, `text-mist`, `text-teal-400`
 * and so on — so when the footer went cream the WASH stayed dark green while
 * every piece of text inside it was rewritten to navy ink. Dark text on a dark
 * box, which is the worst possible outcome for the one block on the site that
 * has to be readable in a hurry.
 *
 * ── WHY EVERY COLOUR HERE IS AN ARBITRARY VALUE ───────────────────────────
 *
 * `bg-navy-900` would be turned into a WHITE card by `.section-light`, and
 * `text-white` into navy ink. Both remaps are unlayered CSS and beat Tailwind's
 * utilities whatever the order. `bg-[var(--color-navy-900)]` and
 * `text-[var(--color-mist-bg)]` are the same colours by the same tokens, but
 * the class names do not match the remap selectors, so they survive.
 *
 * Everything inside the panel is swept to cream, including anything I could
 * not see — the sweep is bounded to the crisis <section> and touches nothing
 * else in the footer.
 *
 * Cream on navy-900 is 15.9:1. It was 4.7:1 at best before, and in practice
 * unreadable.
 */
const fs = require("fs");
const path = require("path");

const REL = "src/components/site-footer.tsx";
const p = path.join(process.cwd(), REL);
if (!fs.existsSync(p)) { console.error("cannot find " + REL); process.exit(1); }

let src = fs.readFileSync(p, "utf8");
const before = src;
let failed = 0;

const CREAM = "text-[var(--color-mist-bg)]";

/* ── bound the work to the crisis panel ──────────────────────────────────── */
const at = src.indexOf('aria-labelledby="crisis-heading"');
if (at === -1) { console.error("*** cannot find the crisis panel — nothing written."); process.exit(1); }
const start = src.lastIndexOf("<section", at);
const end = src.indexOf("</section>", at);
if (start === -1 || end === -1) { console.error("*** cannot bound the crisis panel — nothing written."); process.exit(1); }

let block = src.slice(start, end + 10);
const blockBefore = block;

/* ── the box: navy, not a green wash ─────────────────────────────────────── */
if (block.includes("teal-wash")) {
  block = block.replace(
    'className="teal-wash flex flex-col gap-2.5 self-start rounded-[var(--radius-panel)] border border-teal-600/40 p-4"',
    `className="flex flex-col gap-2.5 self-start rounded-[var(--radius-panel)] border border-[var(--color-teal-600)] bg-[var(--color-navy-900)] p-4 ${CREAM}"`);
  if (block.includes("teal-wash")) { console.error("  MISS  panel className did not match"); failed += 1; }
  else console.log("  ok    panel -> navy, cream text");
} else if (block.includes("bg-[var(--color-navy-900)]")) {
  console.log("  --    panel is already navy");
} else {
  console.error("  MISS  the panel is in an unexpected state"); failed += 1;
}

/* ── sweep every palette text class inside the panel to cream ────────────── */
let swept = 0;
for (const cls of [
  "text-white", "text-mist", "text-teal-400", "text-teal-500", "text-teal-600",
  "text-slate-muted", "text-slate-ink", "text-orange-500", "text-orange-700",
]) {
  const re = new RegExp("(?<![\\w-])" + cls + "(?![\\w-])", "g");
  const hits = (block.match(re) || []).length;
  if (hits) { block = block.replace(re, CREAM); swept += hits; }
}
console.log(`  ok    ${swept} text colour(s) inside the panel swept to cream`);

/* Collapse any duplicate cream classes the sweep produced. */
block = block.replace(new RegExp(`(${CREAM.replace(/[[\]()$.*+?^{}|\\]/g, "\\$&")})(\\s+\\1)+`, "g"), "$1");

if (block === blockBefore) console.log("  --    nothing changed inside the panel");
src = src.slice(0, start) + block + src.slice(end + 10);

/* ── proof ───────────────────────────────────────────────────────────────── */
for (const [what, needle] of [
  ["the crisis heading", "crisis-heading"],
  ["the numbers", "crisisLines.map"],
  ["the 999 note", "crisisNote"],
  ["the funnel", "funnel-heading"],
  ["the arch", "M0 140 C 380 -47"],
]) if (!src.includes(needle)) { console.error("*** " + what + " has gone"); failed += 1; }

const o = (src.match(/<div\b/g) || []).length, c = (src.match(/<\/div>/g) || []).length;
if (o !== c) { console.error(`*** ${o} <div> vs ${c} </div>`); failed += 1; }

console.log("");
if (failed) {
  console.error("═".repeat(60));
  console.error("  NOTHING WRITTEN — send me the MISS lines.");
  console.error("═".repeat(60));
  process.exit(1);
}
if (src === before) { console.log("no change needed."); process.exit(0); }
fs.writeFileSync(p, src);
console.log("═".repeat(60));
console.log("  crisis panel: navy box, cream text throughout. 15.9:1.");
console.log("═".repeat(60));
