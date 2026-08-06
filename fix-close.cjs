/**
 * fix-close.cjs — condenses the closing card and puts it back on cream.
 *
 * Run from the repo root:  node fix-close.cjs
 *
 * Three changes to src/routes/index.tsx:
 *
 *   1. The card gets `section-light`, which is the stylesheet's light-palette
 *      switch. That is why none of the text colours below need touching: it
 *      remaps text-white to navy-900 and text-mist to slate-ink automatically.
 *      Setting `bg-[--color-mist-bg]` by hand instead would have left every
 *      label white-on-cream.
 *
 *   2. The vision paragraph comes OUT of the render. It is the single biggest
 *      block of text in the card and the card is a call to action, not a
 *      manifesto.
 *
 *      ⚠️ IT IS NOT DELETED. `closingCopy.lead` stays in content/home.ts,
 *      where it is marked client-approved and verbatim. This only stops it
 *      being rendered here — restoring it is one JSX block.
 *
 *   3. Slightly tighter padding and gaps.
 *
 * The four statements, the badge and all three actions stay exactly as they are.
 */
const fs = require("fs");

const FILE = "src/routes/index.tsx";
let src = fs.readFileSync(FILE, "utf8");
const before = src;
let applied = 0;
const missed = [];

function swap(label, from, to) {
  if (!src.includes(from)) { missed.push(label); return; }
  src = src.split(from).join(to);
  applied += 1;
  console.log("  ok    " + label);
}

// 1 · The card goes cream. `section-light` does the whole palette flip.
swap(
  "card -> cream via section-light",
  '<div className="mx-auto w-full max-w-[1200px] rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800 px-6 py-9 text-center sm:px-10">',
  '<div className="section-light mx-auto w-full max-w-[1200px] rounded-[var(--radius-panel)] px-6 py-8 text-center shadow-[0_18px_48px_-24px_rgba(0,0,0,0.55)] sm:px-10">',
);

// 2 · The vision paragraph comes out of the render (kept in content/home.ts).
const leadBlock = /\n\s*<p className="[^"]*"[^>]*>\s*\{closingCopy\.lead\}\s*<\/p>/;
if (leadBlock.test(src)) {
  src = src.replace(leadBlock, "");
  applied += 1;
  console.log("  ok    vision paragraph removed from the render");
} else {
  missed.push("vision paragraph");
}

// 3 · Tighter rhythm now there is less in the card.
swap(
  "statements row spacing",
  'className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-x-7 gap-y-3"',
  'className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3"',
);
swap("badge spacing", 'className="mt-6 justify-center"', 'className="mt-7 justify-center"');

// ── Safety nets ───────────────────────────────────────────────────────────
// The four statements are the thing that must survive this edit.
if (!src.includes("closingCopy.points.map")) {
  console.error("\n*** REFUSING TO WRITE — the four statements are no longer rendered.");
  process.exit(1);
}
// And the dead-content-key guard that took the homepage down once already.
const GONE = ["demandMapCopy.filters", "demandMapCopy.selectors", "demandMapCopy.filtersLabel",
              "demandMapCopy.selectorNote", "demandMapNote"];
const revived = GONE.filter((k) => src.includes(k));
if (revived.length) {
  console.error("\n*** REFUSING TO WRITE — references keys that do not exist in content/home.ts: "
    + revived.join(", "));
  process.exit(1);
}
if (src === before) {
  console.log("\nnothing changed — already applied?");
  process.exit(0);
}

fs.writeFileSync(FILE, src);
console.log("\n" + applied + "/5 changes applied to " + FILE);
if (missed.length) console.log("not found (left alone): " + missed.join(", "));
console.log("statements intact · no dead content keys · safe to build");
