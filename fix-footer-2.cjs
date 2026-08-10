/**
 * fix-footer-2.cjs — three fixes to the cream footer.
 *
 * Run from the repo root:  node fix-footer-2.cjs
 *
 * 1 · THE STRANDED NAVY SLIVER. The homepage kept its own cream CTA, so the
 *     page ran cream → 84px of navy → arch → cream. The arch had nothing to
 *     transition from and read as a wonky line. That section also duplicated
 *     the ask: "Join the UK's Housing, Care and Support Ecosystem" with four
 *     points, and then "Providing Homes… Register Here" immediately under it.
 *
 *     It goes. The arch now sits against the navy demand-map section, which is
 *     what the drawing showed.
 *
 *     ⚠️ THE FOUR POINTS GO WITH IT — "Build more homes", "Deliver better
 *     support", "Connect investment with verified need", "Transform lives".
 *     They are NOT deleted: `closingCopy` is untouched in content/home.ts and
 *     the block is one paste from coming back. They were near-duplicates of
 *     the three beats in the funnel below them, which is why they went rather
 *     than the funnel.
 *
 * 2 · THE ARCH WAS TOO SHALLOW. 84px of rise across 1900px of screen is a 5%
 *     gradient — flatter than it looked at the 1440 I drew it at. The viewBox
 *     goes 96 → 140 and the rise with it, so it reads as a dome at any width
 *     rather than a slightly bent edge.
 *
 * 3 · THE CRISIS PANEL WAS UNREADABLE. It carries `teal-wash`, a custom class,
 *     and `.section-light` only remaps things matching `bg-navy-*` — so the box
 *     stayed dark while its `text-white` and `text-teal-400` were rewritten to
 *     navy ink. Dark text on a dark box.
 *
 *     `section-dark` is the stylesheet's escape hatch for exactly this: a dark
 *     island inside a light band, with white and teal restored inside it. It
 *     also wins on specificity over `teal-wash`, so the box goes navy — which
 *     is the right call anyway. Crisis numbers should be the one thing in the
 *     footer that does not blend in.
 */
const fs = require("fs");
const path = require("path");

let failed = 0;
const files = [];

function open(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) { console.error("  MISS  " + rel + " not found"); failed += 1; return null; }
  const f = { rel, p, src: fs.readFileSync(p, "utf8") };
  files.push(f);
  return f;
}

function sub(f, label, from, to) {
  if (!f) return;
  if (!f.src.includes(from)) { console.error("  MISS  " + f.rel + " :: " + label); failed += 1; return; }
  f.src = f.src.split(from).join(to);
  console.log("  ok    " + f.rel + " :: " + label);
}

/* ══ 1 · the homepage gives up its duplicate CTA ═════════════════════════ */
const home = open("src/routes/index.tsx");
if (home) {
  const OPEN = '<section aria-labelledby="closing-heading"';
  const at = home.src.indexOf(OPEN);
  if (at === -1) {
    console.log("  skip  src/routes/index.tsx :: closing section already gone");
  } else {
    /* No regex span. Take from the start of that line to the end of the first
       </section> after it — there are no nested sections inside this block. */
    const lineStart = home.src.lastIndexOf("\n", at);
    const close = home.src.indexOf("</section>", at);
    if (close === -1) {
      console.error("  MISS  src/routes/index.tsx :: no </section> after the closing section");
      failed += 1;
    } else {
      const slice = home.src.slice(lineStart, close + "</section>".length);
      const so = (slice.match(/<section\b/g) || []).length;
      const sc = (slice.match(/<\/section>/g) || []).length;
      if (so !== sc) {
        console.error(`  MISS  src/routes/index.tsx :: block has ${so} <section> and ${sc} </section>`);
        failed += 1;
      } else {
        home.src = home.src.slice(0, lineStart) + home.src.slice(close + "</section>".length);
        console.log("  ok    src/routes/index.tsx :: duplicate closing CTA removed");
      }
    }
  }
}

/* ══ 2 & 3 · the footer ═════════════════════════════════════════════════ */
const footer = open("src/components/site-footer.tsx");

sub(footer, "arch deepened",
  'className="relative -mb-px h-[clamp(40px,5vw,84px)] w-full overflow-hidden"',
  'className="relative -mb-px h-[clamp(56px,7vw,130px)] w-full overflow-hidden"');

sub(footer, "arch curve",
  '<svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="absolute inset-0 size-full">\n          <path d="M0 96 C 400 -32 1040 -32 1440 96 Z" fill="var(--color-mist-bg)" />',
  '<svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="absolute inset-0 size-full">\n          <path d="M0 140 C 380 -47 1060 -47 1440 140 Z" fill="var(--color-mist-bg)" />');

sub(footer, "crisis panel stays dark and readable",
  'className="teal-wash flex flex-col gap-2.5 self-start rounded-[var(--radius-panel)] border border-teal-600/40 p-4"',
  'className="section-dark flex flex-col gap-2.5 self-start rounded-[var(--radius-panel)] p-4"');

/* ══ write, or refuse ═══════════════════════════════════════════════════ */
if (footer) {
  const o = (footer.src.match(/<div\b/g) || []).length;
  const c = (footer.src.match(/<\/div>/g) || []).length;
  if (o !== c) { console.error(`\n*** site-footer.tsx: ${o} <div> vs ${c} </div>`); failed += 1; }
}
if (home) {
  const o = (home.src.match(/<section\b/g) || []).length;
  const c = (home.src.match(/<\/section>/g) || []).length;
  if (o !== c) { console.error(`\n*** index.tsx: ${o} <section> vs ${c} </section>`); failed += 1; }
  if (!home.src.includes("<CouncilPanel />")) { console.error("\n*** the councils strip has gone from the homepage"); failed += 1; }
  if (!home.src.includes("<DemandMap")) { console.error("\n*** the demand map has gone from the homepage"); failed += 1; }
}

console.log("");
if (failed) {
  console.error("═".repeat(64));
  console.error(`  ${failed} PROBLEM(S) — NOTHING WRITTEN. Send me the MISS lines.`);
  console.error("═".repeat(64));
  process.exit(1);
}
for (const f of files) fs.writeFileSync(f.p, f.src);
console.log("═".repeat(64));
console.log("  applied. localhost should now run: navy demand map → arch → cream");
console.log("  funnel → cream footer, with one ask instead of two.");
console.log("═".repeat(64));
