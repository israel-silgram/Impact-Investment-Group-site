/**
 * fix-about-close.cjs — the About page's navy closing band goes, and the
 * "30+ years" line moves into the cream funnel.
 *
 * Run from the repo root:  node fix-about-close.cjs
 *
 * The beats were running twice on that page: once as the heading of the navy
 * "Why Partner With Us?" band, then again in the funnel forty pixels below it.
 * The band goes; the one line worth keeping out of it travels down to sit with
 * the beats as their supporting sentence.
 *
 * ⚠️ THE FUNNEL IS SITE-WIDE, so this line now appears on EVERY page, not just
 * About. That is a deliberate call and it reads correctly — "30+ years across
 * property, housing, care and support" is a claim about the company, not about
 * that page. If it should only ever have been on About, this is the block to
 * delete rather than to move.
 *
 * ⚠️ WHAT ELSE WAS IN THAT BAND. The eyebrow ("Partnership · Why Partner With
 * Us?"), the sr-only <h2> carrying the section name, and `summaries.whyPartner`
 * — all still exported from content/about.ts, none deleted. The <h2> mattered
 * for the document outline; the funnel carries its own sr-only heading
 * ("Register your interest"), so the page does not lose a landmark.
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

/* ══ 1 · the navy band comes off About ═══════════════════════════════════ */
const about = open("src/routes/about.tsx");
if (about) {
  const OPEN = '<Band id="partner-heading">';
  const at = about.src.indexOf(OPEN);
  if (at === -1) {
    console.log("  skip  about.tsx :: the band is already gone");
  } else {
    const lineStart = about.src.lastIndexOf("\n", at);
    const close = about.src.indexOf("</Band>", at);
    if (close === -1) {
      console.error("  MISS  about.tsx :: no </Band> after the partner band");
      failed += 1;
    } else {
      const slice = about.src.slice(lineStart, close + "</Band>".length);
      /* Self-contained or nothing: an unbalanced slice would eat a sibling. */
      const o = (slice.match(/<Band\b/g) || []).length;
      const c = (slice.match(/<\/Band>/g) || []).length;
      if (o !== c) {
        console.error(`  MISS  about.tsx :: slice has ${o} <Band> and ${c} </Band>`);
        failed += 1;
      } else {
        about.src = about.src.slice(0, lineStart) + about.src.slice(close + "</Band>".length);
        console.log("  ok    about.tsx :: navy closing band removed");
      }
    }
  }
}

/* ══ 2 · the line lands in the funnel ════════════════════════════════════ */
const footer = open("src/components/site-footer.tsx");
if (footer) {
  const ANCHOR = '<div className="mt-6 flex flex-wrap items-center justify-center gap-3">';
  if (footer.src.includes("not an estate agency")) {
    console.log("  skip  site-footer.tsx :: the line is already in the funnel");
  } else if (!footer.src.includes(ANCHOR)) {
    console.error("  MISS  site-footer.tsx :: cannot find the funnel button row");
    failed += 1;
  } else {
    const LINE =
`<p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-relaxed text-mist">
              {/* Both emphases are palette classes on purpose: this sits on the
                  cream, where .section-light rewrites text-white to navy ink
                  and orange-500 to the same. orange-700 is the one orange that
                  survives on this ground — 4.1:1, and at 15px semibold it is
                  emphasis rather than a heading, so it stays comfortably inside
                  what that ratio is allowed to carry. */}
              <strong className="font-bold text-orange-700">30+ years</strong> across property,
              housing, care and support — not an estate agency, a{" "}
              <strong className="font-bold text-white">national network</strong>.
            </p>
            ` + ANCHOR;
    footer.src = footer.src.replace(ANCHOR, LINE);
    console.log("  ok    site-footer.tsx :: 30+ years line added under the beats");
  }
}

/* ══ write, or refuse ════════════════════════════════════════════════════ */
if (about) {
  const o = (about.src.match(/<Band\b/g) || []).length;
  const c = (about.src.match(/<\/Band>/g) || []).length;
  if (o !== c) { console.error(`\n*** about.tsx: ${o} <Band> vs ${c} </Band>`); failed += 1; }
  if (!about.src.includes("whoWeAre")) { console.error("\n*** Who We Are has gone from About"); failed += 1; }
  if (!about.src.includes("chainNotice")) { console.error("\n*** the compliance notice has gone from About"); failed += 1; }
}
if (footer) {
  const o = (footer.src.match(/<p\b/g) || []).length;
  const c = (footer.src.match(/<\/p>/g) || []).length;
  if (o !== c) { console.error(`\n*** site-footer.tsx: ${o} <p> vs ${c} </p>`); failed += 1; }
}

console.log("");
if (failed) {
  console.error("═".repeat(62));
  console.error(`  ${failed} PROBLEM(S) — NOTHING WRITTEN. Send me the MISS lines.`);
  console.error("═".repeat(62));
  process.exit(1);
}
for (const f of files) fs.writeFileSync(f.p, f.src);
console.log("═".repeat(62));
console.log("  applied. About now ends on What We Do, straight into the funnel.");
console.log("═".repeat(62));
