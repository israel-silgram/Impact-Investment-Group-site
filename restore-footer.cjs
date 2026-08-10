/**
 * restore-footer.cjs — puts the footer back to the good state: arch on top,
 * cream ground, register funnel, on-cream logo.
 *
 * Run from the repo root:  node restore-footer.cjs
 *
 * Safe to run from ANY of the three states the file might be in:
 *   · original navy footer (if you ran git checkout)  → rebuilds everything
 *   · funnel present, arch removed by my last script  → puts the arch back
 *   · already correct                                 → does nothing
 *
 * ── WHAT I GOT WRONG ──────────────────────────────────────────────────────
 *
 * The complaint was the navy STRIP either side of the dome on pages that end
 * cream — not the dome. I removed the dome. The strip is a consequence of the
 * arch being transparent, so the two are not separable by deleting the arch;
 * they are separable by giving the arch a ground, which is a different fix and
 * one for another day. The arch goes back exactly as it was.
 */
const fs = require("fs");
const path = require("path");

const REL = "src/components/site-footer.tsx";
const p = path.join(process.cwd(), REL);
if (!fs.existsSync(p)) { console.error("cannot find " + REL); process.exit(1); }

let src = fs.readFileSync(p, "utf8");
const before = src;
let failed = 0;

const ARCH =
`      {/*
       * THE ARCH. A dome across the top of the footer, so the register funnel
       * and the footer read as one block rising out of the page rather than as
       * two more stacked bands.
       *
       * Transparent strip, cream path. The control points sit at y=-47, which
       * puts the apex exactly on the top edge — that is what stops it reading
       * as a wave. preserveAspectRatio="none" stretches one path to any width.
       *
       * ⚠️ ON A PAGE WHOSE LAST SECTION IS CREAM the two top corners show the
       * page ground through them, which reads as a navy strip. That is the
       * known cost of a transparent divider and it is NOT fixed by deleting
       * the arch — see restore-footer.cjs.
       */}
      <div
        aria-hidden="true"
        className="relative -mb-px h-[clamp(36px,4.5vw,80px)] w-full overflow-hidden"
      >
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d="M0 140 C 380 -47 1060 -47 1440 140 Z" fill="var(--color-mist-bg)" />
        </svg>
      </div>

`;

const FUNNEL =
`      <div className="section-light">
        {/*
         * THE FUNNEL. One copy, at the top of the footer, on every page.
         *
         * No rule above it and one below: nothing separates it from the page's
         * last section, and the rule underneath groups it with the footer
         * columns, so it reads as the top of the footer rather than a section.
         *
         * whitespace-nowrap per beat is what protects the phrasing — a width
         * cap once broke "Delivering / Support." across two lines. A beat can
         * never split; the line either fits or wraps at a full stop.
         */}
        <section aria-labelledby="funnel-heading" className="border-b border-navy-700">
          <div className="mx-auto w-full max-w-[1440px] px-5 pb-8 pt-1 text-center sm:px-8">
            <h2 id="funnel-heading" className="sr-only">
              Register your interest
            </h2>
            <PreReleaseBadge className="justify-center" />
            <p className="mt-3">
              {closingBeats.map((beat, i) => (
                <span
                  key={beat}
                  aria-hidden="true"
                  className={
                    "heading-tight inline-block whitespace-nowrap font-heading text-[clamp(1.25rem,2.4vw,1.875rem)] font-extrabold leading-[1.2] tracking-[-0.02em] " +
                    (i === 1 ? "text-orange-700" : "text-white") +
                    (i < 2 ? " mr-2" : "")
                  }
                >
                  {beat}
                </span>
              ))}
            </p>
            <p className="mx-auto mt-2.5 max-w-[58ch] text-[13.5px] leading-relaxed text-mist">
              {/* orange-700 is the one orange that survives on cream — 4.1:1,
                  and at 13.5px semibold it is emphasis, not a heading. */}
              <strong className="font-bold text-orange-700">30+ years</strong> across property,
              housing, care and support — not an estate agency, a{" "}
              <strong className="font-bold text-white">national network</strong>.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
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
`;

/* ── state 1 · the original navy footer ─────────────────────────────────── */
if (src.includes('<footer className="border-t border-navy-700 bg-navy-950">')) {
  console.log("  ..    found the ORIGINAL footer — rebuilding everything");

  if (!src.includes("ui/pre-release-badge")) {
    src = src.replace('import { Logo } from "@/components/logo";',
`import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";`);
  }
  if (!src.includes("  closingBeats,")) src = src.replace("  contactDetails,", "  closingBeats,\n  contactDetails,");
  if (!src.includes("  registerRoute,")) src = src.replace("  siteDescription,", "  registerRoute,\n  siteDescription,");

  src = src.replace('<Logo variant="on-navy" />', '<Logo variant="on-cream" />');
  src = src.replace('<footer className="border-t border-navy-700 bg-navy-950">',
    '<footer className="relative isolate">\n' + ARCH + FUNNEL);
  src = src.replace("</footer>", "  </div>\n    </footer>");
  console.log("  ok    arch + cream wrapper + funnel rebuilt");

/* ── state 2 · funnel there, arch missing ───────────────────────────────── */
} else if (src.includes("funnel-heading") && !src.includes("THE ARCH")) {
  console.log("  ..    funnel is present, arch is missing — putting it back");
  const anchor = '<footer className="relative isolate">';
  if (!src.includes(anchor)) {
    console.error("  MISS  cannot find the <footer> opener to anchor the arch");
    failed += 1;
  } else {
    src = src.replace(anchor, anchor + "\n" + ARCH.replace(/\n$/, ""));
    console.log("  ok    arch restored");
  }

/* ── state 3 · already right ────────────────────────────────────────────── */
} else if (src.includes("THE ARCH") && src.includes("funnel-heading")) {
  console.log("  --    the footer already has both the arch and the funnel — nothing to do");
} else {
  console.error("  MISS  the footer is in a state I do not recognise. Send me the file.");
  failed += 1;
}

/* ── proof ──────────────────────────────────────────────────────────────── */
if (!src.includes("funnel-heading")) { console.error("*** no funnel"); failed += 1; }
if (!src.includes("M0 140 C 380 -47")) { console.error("*** no arch"); failed += 1; }
if (!src.includes("registerRoute.label")) { console.error("*** no Register button"); failed += 1; }
if (!src.includes('variant="on-cream"')) { console.error("*** the logo is not the on-cream file — it will be invisible"); failed += 1; }
if (!src.includes("section-light")) { console.error("*** the footer is not cream"); failed += 1; }
const o = (src.match(/<div\b/g) || []).length, c = (src.match(/<\/div>/g) || []).length;
if (o !== c) { console.error(`*** ${o} <div> vs ${c} </div>`); failed += 1; }

console.log("");
if (failed) {
  console.error("═".repeat(60));
  console.error("  NOTHING WRITTEN. Send me the lines above.");
  console.error("═".repeat(60));
  process.exit(1);
}
if (src === before) { console.log("no change needed."); process.exit(0); }
fs.writeFileSync(p, src);
console.log("═".repeat(60));
console.log("  footer restored: arch on top, cream, funnel, Register Here.");
console.log("═".repeat(60));
