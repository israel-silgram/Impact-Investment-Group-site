/**
 * fix-services-close.cjs — the empty closing band comes off /platform.
 *
 * Run from the repo root:  node fix-services-close.cjs
 *
 * The page ended on a cream band carrying one headline and one legal
 * paragraph, then a ~50px navy sliver, then the cream footer. Three grounds
 * inside 400px, most of it empty, and the sliver made the arch look like a
 * mistake — the same fault the homepage had before its closing section went.
 *
 * ── THE COMPLIANCE PARAGRAPH IS NOT LOST ──────────────────────────────────
 *
 * This is the only reason it is safe to delete this band. `legalNotice` runs
 * along the foot of the FOOTER on every page, and carries the same substance:
 *
 *   "Not authorised or regulated by the FCA · not a Collective Investment
 *    Scheme · capital at risk · sourcing, packaging and managed investment
 *    services, not advice · take independent advice."
 *
 * FCA status, scheme status, capital at risk, what the service is, that it is
 * not advice, and the direction to take independent advice — all six points
 * survive, site-wide rather than on one page.
 *
 * ⚠️ IF THE FOOTER LEGAL LINE IS EVER TRIMMED, THIS PARAGRAPH COMES BACK.
 * `servicesClose` and `capitalAtRisk` are untouched in their content files.
 * The Elevate Supported Living sentence — "Investing into property on the
 * platform is also a direct investment into the lives of the people housed by
 * Elevate Supported Living" — is the one line that does NOT appear in the
 * footer version. It is marketing rather than compliance, which is why it goes
 * with the band, but it is worth knowing it went.
 */
const fs = require("fs");
const path = require("path");

const REL = "src/routes/platform.tsx";
const p = path.join(process.cwd(), REL);
if (!fs.existsSync(p)) { console.error("cannot find " + REL); process.exit(1); }

let src = fs.readFileSync(p, "utf8");
const before = src;

const OPEN = '<Band id="services-cta"';
const at = src.indexOf(OPEN);
if (at === -1) {
  console.log("the closing band is already gone — nothing to do.");
  process.exit(0);
}

/* Index arithmetic, not a regex span: take from the start of that line to the
   end of the first </Band> after it. */
const lineStart = src.lastIndexOf("\n", at);
const close = src.indexOf("</Band>", at);
if (close === -1) {
  console.error("*** no </Band> after the closing band — nothing written.");
  process.exit(1);
}

const slice = src.slice(lineStart, close + "</Band>".length);
const o = (slice.match(/<Band\b/g) || []).length;
const c = (slice.match(/<\/Band>/g) || []).length;
if (o !== c) {
  console.error(`*** the block has ${o} <Band> and ${c} </Band> — nothing written.`);
  process.exit(1);
}

src = src.slice(0, lineStart) + src.slice(close + "</Band>".length);

/* Proof the page is still whole and still has its real content. */
const fo = (src.match(/<Band\b/g) || []).length;
const fc = (src.match(/<\/Band>/g) || []).length;
let failed = 0;
if (fo !== fc) { console.error(`*** ${fo} <Band> vs ${fc} </Band>`); failed += 1; }
if (fo === 0) { console.error("*** every band has gone from /platform"); failed += 1; }
if (src === before) { console.error("*** nothing changed"); failed += 1; }

if (failed) { console.error("\nnothing written."); process.exit(1); }

fs.writeFileSync(p, src);
console.log("═".repeat(62));
console.log("  ok — /platform now ends on its last real section, straight into");
console.log("  the arch. Compliance is carried by the footer's legal line.");
console.log("  Bands remaining: " + fo);
console.log("═".repeat(62));
