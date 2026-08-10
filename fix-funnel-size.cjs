/**
 * fix-funnel-size.cjs — the funnel stops being a second big section.
 *
 * Run from the repo root:  node fix-funnel-size.cjs
 *
 * ── WHAT I GOT WRONG ──────────────────────────────────────────────────────
 *
 * I capped the beats at max-w-[30ch] to stop them running as one 1500px
 * banner. At 40px type, 30ch is narrower than a single beat — so instead of
 * breaking BETWEEN beats it broke inside one: "Delivering / Support." Four
 * lines of 40px extrabold, which is what made the block enormous.
 *
 * ── THE FIX, AND WHY IT CANNOT BREAK AGAIN ────────────────────────────────
 *
 * The cap is gone. What stops a mid-phrase break now is `whitespace-nowrap` on
 * each beat, not a measure: every beat is its own inline-block that cannot
 * break internally, so the line either fits or wraps at a full stop. That is
 * the correct mechanism — a width cap was always going to be a guess about
 * font size, and this is not.
 *
 * The type drops from 26–40px to 20–30px. At 30px the whole statement is about
 * 840px, so it sits on ONE line in the 1440 container and wraps to two whole
 * beats on a laptop. Still the largest thing in the footer, no longer a
 * headline competing with the page above it.
 *
 * Everything else here is space: the arch loses 50px, and the padding, the gap
 * under the beats and the gap above the buttons each lose a step. Nothing is
 * removed — the eyebrow, the full statement, the supporting line and both
 * buttons are all still there, in about half the height.
 */
const fs = require("fs");
const path = require("path");

const REL = "src/components/site-footer.tsx";
const p = path.join(process.cwd(), REL);
if (!fs.existsSync(p)) { console.error("cannot find " + REL); process.exit(1); }

let src = fs.readFileSync(p, "utf8");
let failed = 0;

function sub(label, from, to) {
  if (!src.includes(from)) { console.error("  MISS  " + label); failed += 1; return; }
  src = src.split(from).join(to);
  console.log("  ok    " + label);
}

/* The arch was 130px of rise before a word appears. */
sub("arch 130px -> 80px",
  'className="relative -mb-px h-[clamp(56px,7vw,130px)] w-full overflow-hidden"',
  'className="relative -mb-px h-[clamp(36px,4.5vw,80px)] w-full overflow-hidden"');

/* The cap goes. This is the line that caused the mid-phrase break. */
sub("beats: drop the 30ch cap",
  '<p className="mx-auto mt-2 max-w-[30ch]">',
  '<p className="mt-3">');

/* nowrap per beat is what actually protects the phrasing. */
sub("beats: smaller, and unbreakable per phrase",
  '"heading-tight inline-block font-heading text-[clamp(1.625rem,3.4vw,2.5rem)] font-extrabold leading-[1.06] tracking-[-0.025em] " +',
  '"heading-tight inline-block whitespace-nowrap font-heading text-[clamp(1.25rem,2.4vw,1.875rem)] font-extrabold leading-[1.2] tracking-[-0.02em] " +');

sub("funnel padding tightened",
  '<div className="mx-auto w-full max-w-[1440px] px-5 pb-10 pt-2 text-center sm:px-8">',
  '<div className="mx-auto w-full max-w-[1440px] px-5 pb-8 pt-1 text-center sm:px-8">');

sub("supporting line tightened",
  '<p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-relaxed text-mist">',
  '<p className="mx-auto mt-2.5 max-w-[58ch] text-[13.5px] leading-relaxed text-mist">');

sub("buttons closer to the statement",
  '<div className="mt-6 flex flex-wrap items-center justify-center gap-3">',
  '<div className="mt-5 flex flex-wrap items-center justify-center gap-3">');

/* Everything that must survive a "condense". */
for (const [what, needle] of [
  ["the eyebrow badge", "PreReleaseBadge"],
  ["the three beats", "closingBeats.map"],
  ["the 30+ years line", "not an estate agency"],
  ["the register button", "registerRoute.label"],
  ["Become a Partner", "Become a Partner"],
]) {
  if (!src.includes(needle)) { console.error("*** " + what + " has gone — refusing to write."); failed += 1; }
}

console.log("");
if (failed) {
  console.error("═".repeat(62));
  console.error("  nothing written — send me the MISS lines.");
  console.error("═".repeat(62));
  process.exit(1);
}
fs.writeFileSync(p, src);
console.log("═".repeat(62));
console.log("  applied. Statement on one line at desktop, whole phrases only,");
console.log("  and roughly half the height. Nothing removed.");
console.log("═".repeat(62));
