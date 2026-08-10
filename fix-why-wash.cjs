/**
 * fix-why-wash.cjs — the aerial wash comes back to Why We Exist, on cream.
 *
 * Run from the repo root:  node fix-why-wash.cjs
 *
 * ── WHY IT COULDN'T JUST BE PUT BACK ──────────────────────────────────────
 *
 * `Band`'s image layer is a photograph plus a SCRIM, and the scrim was
 * hardcoded navy — `from-navy-900 via-transparent to-navy-900`. Dropped onto a
 * cream band that paints the top and bottom of the section dark, which is why
 * the doc-block said never to do it. The scrim now follows the ground: cream on
 * a light band, navy on a dark one. Same photograph, same idea, correct veil.
 *
 * Opacity goes 9% → 10%, the bottom of the range you asked for. On cream a
 * dark photograph reads much stronger than the same file on navy, because it is
 * subtracting from a light ground rather than adding to a dark one.
 *
 * ⚠️ IF THE SMALL TEAL SOURCE LINKS START LOOKING WEAK, THIS IS WHY. They are
 * 11px teal-600, which is 4.7:1 on clean cream and falls as the wash gets
 * stronger. 10% is fine; if it ever goes to 15% re-measure them rather than
 * assuming. Dropping to 0.07 is a one-character change.
 */
const fs = require("fs");
const path = require("path");

const REL = "src/routes/about.tsx";
const p = path.join(process.cwd(), REL);
if (!fs.existsSync(p)) { console.error("cannot find " + REL); process.exit(1); }

let src = fs.readFileSync(p, "utf8");
let failed = 0;

function sub(label, from, to) {
  if (!src.includes(from)) { console.error("  MISS  " + label); failed += 1; return; }
  src = src.split(from).join(to);
  console.log("  ok    " + label);
}

/* 1 · the scrim follows the ground instead of being hardcoded navy */
sub("scrim follows the band's ground",
  'className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-navy-900 via-transparent to-navy-900"',
  `className={cn(
              "pointer-events-none absolute inset-0 -z-10 bg-linear-to-b",
              light
                ? "from-[var(--color-mist-bg)] via-transparent to-[var(--color-mist-bg)]"
                : "from-navy-900 via-transparent to-navy-900",
            )}`);

/* 2 · 9% -> 10% */
sub("wash 9% -> 10%", 'opacity-[0.09]', 'opacity-[0.10]');

/* 3 · the photograph goes back on */
sub("aerial wash restored to Why We Exist",
  '<Band id="why-heading" light>',
  '<Band id="why-heading" light image="/images/why-estate-aerial.webp">');

/* 4 · the standing note said never do this. It is now wrong. */
if (src.includes("It is only ever used on a NAVY band.")) {
  src = src.replace(
    /It is only ever used on a NAVY band\.[\s\S]*?do not put one behind a `\.section-light` band\./,
    `It works on EITHER ground now: the scrim follows \`light\`, so it fades to
 * cream on a light band and to navy on a dark one. It was navy-only for a
 * while, and dropping that navy scrim onto cream is what darkened the top and
 * bottom of the section — the version Callum rejected on the homepage. If the
 * scrim is ever hardcoded again, this comes back with it.`);
  console.log("  ok    doc-block corrected");
} else {
  console.log("  --    doc-block note not found (already rewritten?)");
}

/* proof */
if (!src.includes("why-estate-aerial")) { console.error("*** the photograph is not referenced"); failed += 1; }
if (!src.includes('id="why-heading" light image=')) { console.error("*** the band is not light+image"); failed += 1; }
if (!src.includes("from-[var(--color-mist-bg)]")) { console.error("*** the cream scrim is missing"); failed += 1; }
if (!src.includes("problemFigures.map")) { console.error("*** the figures have gone"); failed += 1; }

console.log("");
if (failed) {
  console.error("═".repeat(60));
  console.error("  NOTHING WRITTEN — send me the MISS lines.");
  console.error("═".repeat(60));
  process.exit(1);
}
fs.writeFileSync(p, src);
console.log("═".repeat(60));
console.log("  applied. Aerial wash at 10%, fading to cream top and bottom.");
console.log("═".repeat(60));
