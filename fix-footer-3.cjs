/**
 * fix-footer-3.cjs — the funnel stops floating.
 *
 * Run from the repo root:  node fix-footer-3.cjs
 *
 * Two things, both about air rather than colour:
 *
 * 1 · THE ARCH ALREADY IS THE TOP PADDING. The dome rises 130px, and the
 *     funnel then added py-10 on top of that — so between the navy and the
 *     "Coming soon" rule there was the arch plus 40px more, and at the two
 *     corners rather more again. The top padding drops to 2 and the arch
 *     carries it, which is what it is for.
 *
 * 2 · THE BEATS WERE RUNNING AS ONE 1500px LINE. At that measure a display
 *     line stops reading as a statement and starts reading as a banner across
 *     the top of a page. Capped at 30ch it breaks into two lines on a wide
 *     screen — always between whole beats, never mid-phrase, because each beat
 *     is its own inline-block.
 *
 * ⚠️ IF THE CURVE ITSELF IS THE PROBLEM rather than the space around it, the
 * fix is one line, not this file: delete the <div aria-hidden> wrapping the
 * <svg> in site-footer.tsx and the cream meets the navy on a straight edge.
 * Everything else here still applies.
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

sub("funnel top padding: the arch carries it",
  '<div className="mx-auto w-full max-w-[1440px] px-5 py-10 text-center sm:px-8">',
  '<div className="mx-auto w-full max-w-[1440px] px-5 pb-10 pt-2 text-center sm:px-8">');

sub("beats break to two lines instead of one long banner",
  '<p className="mt-4">',
  '<p className="mx-auto mt-2 max-w-[30ch]">');

if (failed) {
  console.error("\n" + "═".repeat(60));
  console.error("  nothing written — send me the MISS lines.");
  console.error("═".repeat(60));
  process.exit(1);
}

fs.writeFileSync(p, src);
console.log("\n" + "═".repeat(60));
console.log("  applied. The cream now starts at the arch, not 200px below it.");
console.log("═".repeat(60));
