/**
 * fix-home.cjs — applies the four homepage changes to src/routes/index.tsx.
 *
 * WHY THIS EXISTS RATHER THAN ME JUST WRITING THE FILE:
 *
 * The copy of the repo I can read from here went stale. The homepage I shipped
 * was built against a version of content/home.ts that still had
 * `demandMapCopy.filters` and `.selectors`; the real file has neither, so
 * `demandMapCopy.filters.map(...)` hit undefined and the whole page failed to
 * hydrate. The prerendered HTML was fine, which is why the build passed and the
 * site still went white.
 *
 * So: restore index.tsx from the last good commit, then run this. Every
 * replacement is a literal string swap — nothing is inserted or nested — and
 * anything that does not match is reported rather than silently skipped.
 *
 * Run from the repo root:  node fix-home.cjs
 */
const fs = require("fs");

const FILE = "src/routes/index.tsx";
let src = fs.readFileSync(FILE, "utf8");
let applied = 0;
const missed = [];

function swap(label, from, to) {
  if (!src.includes(from)) {
    missed.push(label);
    return;
  }
  src = src.split(from).join(to);
  applied += 1;
  console.log("  ok    " + label);
}

// 1 · The map gets a wider column. It renders at the full width of this column
//     because `readout="below"` puts the readout underneath rather than taking
//     18rem out of it. If that prop is ever changed, check the union in
//     components/home/demand-map.tsx actually contains the new value — that
//     mismatch is what shrank the map to 240px.
swap(
  "map column 560px -> 600px",
  "lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]",
  "lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)]",
);

// 2 · Data-source logo plates: 36px -> 56px tall.
swap(
  "logo plate h-9 -> h-14",
  'className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-2.5 py-1.5"',
  'className="inline-flex h-14 items-center justify-center rounded-lg bg-white px-4 py-2"',
);
swap(
  "logo max width 7rem -> 10.5rem",
  'className="h-full w-auto max-w-[7rem] object-contain"',
  'className="h-full w-auto max-w-[10.5rem] object-contain"',
);

// 3 · The closing CTA stops being a cream band and becomes a CARD sitting on
//     the footer's own ground, with no rule between them — so the bottom of the
//     page reads as one block instead of three.
//
//     ⚠️ It is no longer `.section-light`, so every colour below is rewritten
//     in the dark idiom by hand. If this is ever moved back onto cream they all
//     have to flip back; `.section-light` is what used to do that for free.
swap(
  "closing section -> footer ground",
  '<section aria-labelledby="closing-heading" className="section-light border-t border-navy-700">',
  '<section aria-labelledby="closing-heading" className="bg-navy-950 px-5 pb-10 pt-12 sm:px-8">',
);
swap(
  "closing container -> card",
  '<div className="mx-auto w-full max-w-[1440px] px-5 py-10 text-center sm:px-8 lg:py-12">',
  '<div className="mx-auto w-full max-w-[1200px] rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800 px-6 py-9 text-center sm:px-10">',
);
swap(
  "closing heading -> white",
  'className="heading-tight mx-auto max-w-[26ch] text-balance text-[clamp(1.5rem,3vw,2.125rem)] font-bold"',
  'className="heading-tight mx-auto max-w-[26ch] text-balance text-[clamp(1.5rem,3vw,2.125rem)] font-extrabold tracking-[-0.02em] text-white"',
);
swap(
  "closing lead -> mist",
  'className="mx-auto mt-3 max-w-[40rem] text-pretty text-[15px] leading-relaxed text-[color-mix(in_oklab,var(--color-navy-900)_75%,transparent)]"',
  'className="mx-auto mt-3 max-w-[40rem] text-pretty text-[15px] leading-relaxed text-mist"',
);
swap(
  "closing points -> white",
  '<span className="font-heading text-[13px] font-semibold text-navy-900">',
  '<span className="font-heading text-[13px] font-semibold text-white">',
);

// ── Safety net ────────────────────────────────────────────────────────────
// The crash this whole file exists to undo was a reference to a content key
// that no longer exists. Refuse to write if any of them have come back.
const GONE = ["demandMapCopy.filters", "demandMapCopy.selectors", "demandMapCopy.filtersLabel",
              "demandMapCopy.selectorNote", "demandMapNote"];
const revived = GONE.filter((k) => src.includes(k));
if (revived.length) {
  console.error("\n*** REFUSING TO WRITE — index.tsx references keys that do not exist in");
  console.error("    content/home.ts: " + revived.join(", "));
  console.error("    That is exactly what took the homepage down. Restore index.tsx from git.");
  process.exit(1);
}

fs.writeFileSync(FILE, src);
console.log("\n" + applied + "/8 changes applied to " + FILE);
if (missed.length) {
  console.log("not found (left alone, nothing broken): " + missed.join(", "));
}
console.log("no references to removed content keys — safe to build");
