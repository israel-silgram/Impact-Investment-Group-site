/**
 * fix-footer.cjs — the register funnel and the footer become ONE CREAM BLOCK
 * with an arched top, on every page.
 *
 * Run from the repo root:  node fix-footer.cjs
 *
 * ── WHY THIS IS A .cjs AND NOT THE .ps1 I SENT FIRST ──────────────────────
 *
 * The PowerShell version was run and changed nothing — `site-footer.tsx` on
 * main still had the untouched anchor — and the commit went up as a no-op
 * without anybody noticing. This one CANNOT do that: it counts every edit, and
 * if a single anchor misses it prints a banner and writes nothing at all.
 * A half-applied footer is worse than an unapplied one.
 *
 * ── THE ARCH ──────────────────────────────────────────────────────────────
 *
 * An SVG on a transparent strip, not a border-radius on the footer. The
 * section above the footer is cream on some routes and navy on others, and a
 * rounded corner has to know what colour sits behind it. A transparent strip
 * does not — whatever the last section is shows through the two top corners,
 * so this is correct on every page without the footer knowing which page it is
 * on. preserveAspectRatio="none" stretches one path to any width.
 *
 * ── WHAT .section-light DOES AND DOES NOT DO ──────────────────────────────
 *
 * It repaints the ground AND remaps the dark palette to the light one: white
 * text to navy ink, navy cards to white cards, mist to slate. That is why
 * almost nothing inside the footer is touched here. Two things it cannot do:
 *
 *   · THE LOGO is an image and an image has no colour utility to rewrite, so
 *     the footer has to ask for the on-cream file or it renders white on cream
 *     and vanishes.
 *   · ORANGE-500 becomes navy ink on cream (it is 2.3:1 there). The middle beat
 *     uses orange-700 — 4.1:1, AA for large text, and the beats are 26px+
 *     extrabold so they qualify.
 */
const fs = require("fs");
const path = require("path");

const edits = [];
let failed = 0;

function file(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) { console.error("  MISS  " + rel + " — file not found"); failed += 1; return null; }
  return { rel, p, src: fs.readFileSync(p, "utf8") };
}

function sub(f, label, from, to, { optional = false } = {}) {
  if (!f) return;
  if (!f.src.includes(from)) {
    if (optional) { console.log("  skip  " + f.rel + " :: " + label + " (already applied)"); return; }
    console.error("  MISS  " + f.rel + " :: " + label);
    failed += 1;
    return;
  }
  f.src = f.src.split(from).join(to);
  console.log("  ok    " + f.rel + " :: " + label);
}

function rx(f, label, pattern, to = "") {
  if (!f) return;
  if (!pattern.test(f.src)) { console.error("  MISS  " + f.rel + " :: " + label); failed += 1; return; }
  f.src = f.src.replace(pattern, to);
  console.log("  ok    " + f.rel + " :: " + label);
}

/* ══ 1 · the footer ══════════════════════════════════════════════════════ */
const footer = file("src/components/site-footer.tsx");

sub(footer, "imports", 'import { Logo } from "@/components/logo";',
`import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";`);

sub(footer, "closingBeats import", "  contactDetails,", "  closingBeats,\n  contactDetails,");
sub(footer, "registerRoute import", "  siteDescription,", "  registerRoute,\n  siteDescription,");
sub(footer, "logo colourway", '<Logo variant="on-navy" />', '<Logo variant="on-cream" />');

sub(footer, "arch + cream wrapper + funnel",
  '<footer className="border-t border-navy-700 bg-navy-950">',
`<footer className="relative isolate">
      {/*
       * THE ARCH. A dome across the top of the footer, so the register funnel
       * and the footer read as one block rising out of the page rather than as
       * two more stacked bands.
       *
       * Transparent strip, cream path — see the note at the top of
       * fix-footer.cjs for why this is not a border-radius. The control points
       * sit at y=-32, which puts the apex exactly on the top edge; that is what
       * stops it reading as a wave.
       */}
      <div
        aria-hidden="true"
        className="relative -mb-px h-[clamp(40px,5vw,84px)] w-full overflow-hidden"
      >
        <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d="M0 96 C 400 -32 1040 -32 1440 96 Z" fill="var(--color-mist-bg)" />
        </svg>
      </div>

      <div className="section-light">
        {/*
         * THE FUNNEL. One copy, at the top of the footer, on every page. It
         * used to be a <section> rebuilt at the foot of five routes.
         *
         * No rule above it and one below: nothing separates it from the page's
         * last section, and the rule underneath groups it with the footer
         * columns. It reads as the top of the footer, not a sixth section.
         *
         * The beats run 26–40px against the 28–50 the old cream closes used,
         * because this block now carries the footer columns as well. At 1440
         * the statement still sits on one line; below that it breaks between
         * whole beats and never mid-phrase.
         */}
        <section aria-labelledby="funnel-heading" className="border-b border-navy-700">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-10 text-center sm:px-8">
            <h2 id="funnel-heading" className="sr-only">
              Register your interest
            </h2>
            <PreReleaseBadge className="justify-center" />
            <p className="mt-4">
              {closingBeats.map((beat, i) => (
                <span
                  key={beat}
                  aria-hidden="true"
                  className={
                    "heading-tight inline-block font-heading text-[clamp(1.625rem,3.4vw,2.5rem)] font-extrabold leading-[1.06] tracking-[-0.025em] " +
                    (i === 1 ? "text-orange-700" : "text-white") +
                    (i < 2 ? " mr-2" : "")
                  }
                >
                  {beat}
                </span>
              ))}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" asChild>
                <Link to={registerRoute.to} search={registerRoute.search}>
                  {registerRoute.label}
                </Link>
              </Button>
              <Button variant="secondary" asChild withArrow={false}>
                <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                  Become a Partner
                </Link>
              </Button>
            </div>
          </div>
        </section>
`);

sub(footer, "cream wrapper closed", "</footer>", "  </div>\n    </footer>");

/* ══ 2 · the pages give up their own closing funnels ═════════════════════ */
const prob = file("src/routes/the-problem.tsx");
rx(prob, "close section removed", /\{\/\*\s*\*\s*── 5 · Close[\s\S]*?<\/section>/);

const sol = file("src/routes/solutions.tsx");
rx(sol, "close section removed", /\{\/\* ── 5 · Close[\s\S]*?<\/section>/);

const home = file("src/routes/index.tsx");
rx(home, "badge removed", /\n\s*<PreReleaseBadge className="mt-7 justify-center" \/>/);
rx(home, "buttons removed", /\n\s*\{\/\* size="default" not "lg"[\s\S]*?<div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">[\s\S]*?<\/div>/);

const about = file("src/routes/about.tsx");
rx(about, "badge removed", /\n\s*<PreReleaseBadge className="mt-8 justify-center" \/>/);
rx(about, "buttons removed", /\n\s*<div className="mt-4 flex flex-wrap items-center justify-center gap-3">[\s\S]*?<\/div>/);

const plat = file("src/routes/platform.tsx");
rx(plat, "buttons + note removed", /\n\s*<div className="mt-6 flex flex-wrap items-center justify-center gap-3">[\s\S]*?<p className="mt-3 text-\[12\.5px\] text-slate-ink">\{servicesClose\.ctaNote\}<\/p>/);

/* ══ write, or refuse ════════════════════════════════════════════════════ */
const all = [footer, prob, sol, home, about, plat].filter(Boolean);

/* Capital at risk is the one thing on this page that may not be lost. */
if (plat && !plat.src.includes("capitalAtRisk")) {
  console.error("\n*** capitalAtRisk has gone from /platform — refusing to write.");
  failed += 1;
}
/* An unbalanced div would render the whole footer inside the funnel. */
if (footer) {
  const open = (footer.src.match(/<div\b/g) || []).length;
  const close = (footer.src.match(/<\/div>/g) || []).length;
  if (open !== close) {
    console.error(`\n*** site-footer.tsx has ${open} <div> and ${close} </div> — refusing to write.`);
    failed += 1;
  }
}

console.log("");
if (failed) {
  console.error("═".repeat(64));
  console.error(`  ${failed} EDIT(S) DID NOT APPLY — NOTHING HAS BEEN WRITTEN.`);
  console.error("  Send me the MISS lines above. Do not commit.");
  console.error("═".repeat(64));
  process.exit(1);
}

for (const f of all) fs.writeFileSync(f.p, f.src);
console.log("═".repeat(64));
console.log("  all edits applied to " + all.length + " files.");
console.log("  npm run dev  →  check localhost:8080  →  then build and push.");
console.log("═".repeat(64));
