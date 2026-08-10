/**
 * fix-platform-cta.cjs — removes the duplicated register CTA from /platform,
 * correctly this time.
 *
 * Run from the repo root, AFTER restoring the file:
 *   git checkout -- src/routes/platform.tsx
 *   node fix-platform-cta.cjs
 *
 * ── WHAT WENT WRONG THE FIRST TIME ────────────────────────────────────────
 *
 * fix-footer.cjs matched this block with a regex anchored on
 * `<div className="mt-6 flex flex-wrap items-center justify-center gap-3">`.
 * That class string appears MORE THAN ONCE in platform.tsx, so the lazy match
 * started at the FIRST one and ran all the way down to the CTA note near the
 * end of the file, deleting several `</div>` that belonged to other blocks.
 * Hence "Expected corresponding JSX closing tag for <div>".
 *
 * ── WHY THIS ONE CANNOT DO THAT ───────────────────────────────────────────
 *
 * No regex spans. It finds the CTA note first — which is unique — then walks
 * BACKWARDS to the nearest opening div before it. That is by definition the
 * right one. Then it counts `<div` against `</div>` inside the slice it is
 * about to remove and refuses to write unless they are equal, so a deletion
 * can never again leave the file unbalanced.
 */
const fs = require("fs");
const path = require("path");

const REL = "src/routes/platform.tsx";
const p = path.join(process.cwd(), REL);
if (!fs.existsSync(p)) { console.error("cannot find " + REL); process.exit(1); }

let src = fs.readFileSync(p, "utf8");

/* ── is the file whole? ──────────────────────────────────────────────────── */
const opens = (src.match(/<div\b/g) || []).length;
const closes = (src.match(/<\/div>/g) || []).length;
if (opens !== closes) {
  console.error("═".repeat(64));
  console.error(`  ${REL} is still broken (${opens} <div>, ${closes} </div>).`);
  console.error("  Restore it first, then run this again:");
  console.error("      git checkout -- src/routes/platform.tsx");
  console.error("      node fix-platform-cta.cjs");
  console.error("═".repeat(64));
  process.exit(1);
}

const NOTE = '<p className="mt-3 text-[12.5px] text-slate-ink">{servicesClose.ctaNote}</p>';
const OPEN = '<div className="mt-6 flex flex-wrap items-center justify-center gap-3">';

if (!src.includes(NOTE)) {
  console.log("the CTA note is not there — already applied, nothing to do.");
  process.exit(0);
}

const noteAt = src.indexOf(NOTE);
const noteEnd = noteAt + NOTE.length;

/* Walk backwards: the LAST opening div before the note is the one wrapping
   these two buttons, whatever else the file contains. */
const divAt = src.lastIndexOf(OPEN, noteAt);
if (divAt === -1) {
  console.error("could not find the button row above the CTA note — send me lines 500-535 of platform.tsx");
  process.exit(1);
}

/* Take the whole line the div starts on, so no orphan indentation is left. */
const lineStart = src.lastIndexOf("\n", divAt);
const slice = src.slice(lineStart, noteEnd);

/* The slice must be self-contained: equal opens and closes, or removing it
   unbalances the file — which is exactly the bug this replaces. */
const sOpen = (slice.match(/<div\b/g) || []).length;
const sClose = (slice.match(/<\/div>/g) || []).length;
if (sOpen !== sClose) {
  console.error("═".repeat(64));
  console.error(`  REFUSING TO WRITE — the block to remove has ${sOpen} <div> and ${sClose} </div>.`);
  console.error("  Removing it would break the file. Send me lines 500-535 of platform.tsx.");
  console.error("═".repeat(64));
  process.exit(1);
}
if (slice.includes("capitalAtRisk")) {
  console.error("\n*** REFUSING TO WRITE — capital at risk is inside the block. Send me the file.");
  process.exit(1);
}

src = src.slice(0, lineStart) + src.slice(noteEnd);

/* Final proof. */
const fOpen = (src.match(/<div\b/g) || []).length;
const fClose = (src.match(/<\/div>/g) || []).length;
if (fOpen !== fClose) { console.error("*** post-edit imbalance — nothing written."); process.exit(1); }
if (!src.includes("capitalAtRisk")) { console.error("*** capital at risk has gone — nothing written."); process.exit(1); }
if (!src.includes("servicesClose.title")) { console.error("*** the closing headline has gone — nothing written."); process.exit(1); }

fs.writeFileSync(p, src);
console.log("═".repeat(64));
console.log("  ok — /platform keeps its headline and the capital-at-risk paragraph;");
console.log("  the duplicated Register / Contact buttons are gone.");
console.log("  divs balanced: " + fOpen + " / " + fClose);
console.log("═".repeat(64));
