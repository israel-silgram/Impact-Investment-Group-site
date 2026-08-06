/**
 * fix-cream.cjs — the closing section becomes FULL-WIDTH CREAM, edge to edge.
 *
 * Run from the repo root:  node fix-cream.cjs
 *
 * The last change made it a cream CARD floating on the navy footer ground.
 * That is not what was asked for. The whole band is cream now — no card, no
 * navy showing, the cream running the full width of the page straight into the
 * footer below it.
 *
 * `section-light` moves from the inner div onto the <section> itself. That one
 * move does two things: it paints the whole band cream, and it remaps every
 * text colour inside from the dark idiom to the light one. Painting the
 * background by hand instead would leave white text on cream.
 */
const fs = require("fs");

const FILE = "src/routes/index.tsx";
let src = fs.readFileSync(FILE, "utf8");
const before = src;
let applied = 0;

function swap(label, from, to) {
  if (!src.includes(from)) return false;
  src = src.split(from).join(to);
  applied += 1;
  console.log("  ok    " + label);
  return true;
}

// ── The section itself goes cream, full width ────────────────────────────
// Handles either of the two states it could currently be in.
const sectionDone =
  swap(
    "section -> full-width cream (from navy ground)",
    '<section aria-labelledby="closing-heading" className="bg-navy-950 px-5 pb-10 pt-12 sm:px-8">',
    '<section aria-labelledby="closing-heading" className="section-light">',
  ) ||
  swap(
    "section -> full-width cream (from bordered cream)",
    '<section aria-labelledby="closing-heading" className="section-light border-t border-navy-700">',
    '<section aria-labelledby="closing-heading" className="section-light">',
  );

// ── The inner div stops being a card and goes back to a plain container ──
const cardDone =
  swap(
    "card -> plain container",
    '<div className="section-light mx-auto w-full max-w-[1200px] rounded-[var(--radius-panel)] px-6 py-8 text-center shadow-[0_18px_48px_-24px_rgba(0,0,0,0.55)] sm:px-10">',
    '<div className="mx-auto w-full max-w-[1200px] px-5 py-12 text-center sm:px-8">',
  ) ||
  swap(
    "card -> plain container (navy card variant)",
    '<div className="mx-auto w-full max-w-[1200px] rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800 px-6 py-9 text-center sm:px-10">',
    '<div className="mx-auto w-full max-w-[1200px] px-5 py-12 text-center sm:px-8">',
  );

// ── Safety nets ───────────────────────────────────────────────────────────
const closing = src.slice(src.indexOf('aria-labelledby="closing-heading"'));
const sectionTag = closing.slice(0, 200);

if (!sectionTag.includes("section-light")) {
  console.error("\n*** REFUSING TO WRITE — the closing section is not `section-light`,");
  console.error("    so it would not be cream and its text would not flip to dark.");
  process.exit(1);
}
if (/bg-navy-950|bg-navy-800/.test(sectionTag)) {
  console.error("\n*** REFUSING TO WRITE — a navy background is still set on the closing section.");
  process.exit(1);
}
if (!src.includes("closingCopy.points.map")) {
  console.error("\n*** REFUSING TO WRITE — the four statements are no longer rendered.");
  process.exit(1);
}
if (src === before) {
  console.log("\nnothing matched — the file is not in either expected state.");
  console.log("Send me the closing section of src/routes/index.tsx and I will patch it directly.");
  process.exit(1);
}
if (!sectionDone || !cardDone) {
  console.log("\n  note: only part of the change matched — check the section renders cream.");
}

fs.writeFileSync(FILE, src);
console.log("\n" + applied + "/2 changes applied to " + FILE);
console.log("closing band is full-width cream · statements intact · safe to build");
