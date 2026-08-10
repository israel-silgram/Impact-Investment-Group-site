/**
 * fix-about-grounds.cjs — Who We Are goes navy, Why We Exist goes cream.
 *
 * Run from the repo root:  node fix-about-grounds.cjs
 *
 * Restores the alternation: navy → cream → navy → cream footer.
 *
 * ── THE ONE THING THAT MAKES THIS MORE THAN TWO CLASS SWAPS ───────────────
 *
 * The director cards are `bg-cream-card` — a literal cream, not the `panel`
 * utility — so they stay cream on a navy band without being asked, which is
 * what you wanted. But their TEXT was only readable because `.section-light`
 * on the band was rewriting `text-white` to navy ink. Take the band navy and
 * that remap stops: white names on a cream card, invisible.
 *
 * So `.section-light` moves ONTO THE CARD ITSELF. The card then carries the
 * light palette wherever it is placed, and its own rounded corners and shadow
 * are untouched because it is the same element. This is the right fix rather
 * than a wrapper: a wrapper would paint a cream square behind a rounded card.
 *
 * ── THE PHOTOGRAPH COMES OFF WHY WE EXIST ─────────────────────────────────
 *
 * ⚠️ NOT A STYLE CHOICE. The Band doc-block says it plainly: the 9% aerial
 * wash is only ever used on a NAVY band, because on cream there is no scrim
 * dark enough to hold it back — and that is exactly the version Callum
 * rejected on the homepage. Cream band, no image.
 *
 * ── ACCENTS FOLLOW THE GROUND ─────────────────────────────────────────────
 *
 * orange-500 is 2.3:1 on cream and `.section-light` rewrites it to navy ink,
 * so the ladder's orange figure would come out black. ACCENT.orange moves to
 * orange-700 (4.1:1, and these figures are 28–40px extrabold, so large text).
 * On the navy band the Head, the Summary and the team eyebrow move from rust
 * to teal for the same reason in reverse.
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
function rx(f, label, pattern, to) {
  if (!f) return;
  if (!pattern.test(f.src)) { console.error("  MISS  " + f.rel + " :: " + label); failed += 1; return; }
  f.src = f.src.replace(pattern, to);
  console.log("  ok    " + f.rel + " :: " + label);
}

const about = open("src/routes/about.tsx");

/* ── 1 · Who We Are → navy ───────────────────────────────────────────────── */
sub(about, "Who We Are band -> navy",
  '<Band id="about-heading" light>', '<Band id="about-heading">');
rx(about, "its heading eyebrow -> teal", /tone="rust"(\s*\n\s*hero)/, 'tone="teal"$1');
sub(about, "its summary -> teal",
  '<Summary lines={summaries.whoWeAre!} tone="rust" />',
  '<Summary lines={summaries.whoWeAre!} tone="teal" />');
sub(about, "the team eyebrow -> teal",
  '<p className="eyebrow tracking-[0.14em] text-orange-700">{teamTitle}</p>',
  '<p className="eyebrow tracking-[0.14em] text-teal-400">{teamTitle}</p>');

/* ── 2 · Why We Exist → cream, and the wash comes off ────────────────────── */
sub(about, "Why We Exist band -> cream, photograph removed",
  '<Band id="why-heading" image="/images/why-estate-aerial.webp">',
  '<Band id="why-heading" light>');
sub(about, "its heading eyebrow -> rust",
  '<Head eyebrow={whyWeExist.eyebrow} title={whyWeExist.title} id="why-heading" />',
  '<Head eyebrow={whyWeExist.eyebrow} title={whyWeExist.title} id="why-heading" tone="rust" />');
sub(about, "its summary -> rust",
  '<Summary lines={summaries.whyWeExist!} tone="teal" />',
  '<Summary lines={summaries.whyWeExist!} tone="rust" />');
sub(about, "ladder orange accent -> orange-700 (cream-safe)",
  'orange: { text: "text-orange-500", bar: "bg-orange-500", disc: "bg-orange-500 text-white" },',
  'orange: { text: "text-orange-700", bar: "bg-orange-600", disc: "bg-orange-600 text-white" },');

/* ── 3 · the card carries its own light palette ──────────────────────────── */
const card = open("src/components/about/director-card.tsx");
if (card) {
  if (card.src.includes("section-light flex h-full flex-col overflow-hidden rounded-2xl bg-cream-card")) {
    console.log("  --    director-card.tsx :: already carries section-light");
  } else {
    sub(card, "card carries .section-light so its text reads on any ground",
      "flex h-full flex-col overflow-hidden rounded-2xl bg-cream-card",
      "section-light flex h-full flex-col overflow-hidden rounded-2xl bg-cream-card");
  }
}

/* ── proof ───────────────────────────────────────────────────────────────── */
if (about) {
  if (about.src.includes('id="about-heading" light')) { console.error("*** Who We Are is still cream"); failed += 1; }
  if (!about.src.includes('id="why-heading" light')) { console.error("*** Why We Exist is not cream"); failed += 1; }
  if (about.src.includes("why-estate-aerial")) { console.error("*** the aerial wash is still on a cream band"); failed += 1; }
  for (const [what, needle] of [
    ["the four figures", "problemFigures.map"],
    ["the source links", "figure.href"],
    ["the team", "team.slice(1).map"],
    ["the chain", "accountableChain.map"],
    ["the compliance notice", "chainNotice"],
  ]) if (!about.src.includes(needle)) { console.error("*** " + what + " has gone"); failed += 1; }
  const o = (about.src.match(/<Band\b/g) || []).length, c = (about.src.match(/<\/Band>/g) || []).length;
  if (o !== c) { console.error(`*** about.tsx: ${o} <Band> vs ${c} </Band>`); failed += 1; }
}
if (card && !card.src.includes("rounded-full object-cover ring-4")) {
  console.error("*** the circular portrait has gone from the director card"); failed += 1;
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
console.log("  applied. About now runs navy → cream → navy → cream footer.");
console.log("═".repeat(62));
