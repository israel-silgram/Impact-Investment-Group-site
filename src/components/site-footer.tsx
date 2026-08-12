import { Link } from "@tanstack/react-router";
import { ArrowUpRight, LifeBuoy, Mail, Phone, Clock } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import {
  closingBeats,
  contactDetails,
  contactRoutes,
  crisisLines,
  crisisNote,
  footerSiteLinks,
  legalNotice,
  registerRoute,
  siteDescription,
  trustRegistrations,
} from "@/content/site";

/**
 * Footer, halved and then tightened again (~980px → ~500px → ~430px).
 *
 * Nothing has ever been removed from it. Every link, every crisis number,
 * every registration reference and the legal notice are all still here,
 * verbatim. All of the height has come out of spacing and type scale:
 *
 *  - Padding 56/80px → 32/40px → 28/32px, and the three bands became two.
 *  - Link rows lost the 44px minimum on desktop (they keep it on touch, where
 *    it matters) and sit at 13px with 2px between them — ~25px each, still
 *    clear of the 24px target-size minimum. Do not tighten this further.
 *  - The registrations band used to be its own full-width strip with its own
 *    rule. It now sits under the columns as three compact cards, and the
 *    verify link runs inline on the reference line rather than taking a row
 *    of its own — which is what took the last ~20px out of the tallest card.
 *
 * ⚠️ NO RULE BETWEEN THE COLUMNS AND THE REGISTRATIONS. Removed at Callum's
 * request. The two blocks are now separated by whitespace alone, which is why
 * the top block's bottom padding is deliberately smaller than its top padding
 * — the gap between them IS the separator, so it has to stay a single, even
 * space. If you re-pad this symmetrically the two blocks will look welded
 * together.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate">
      {/*
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

      <div className="section-light">
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

      {/* The commissioning-councils carousel used to sit here as a band
          above these columns. It now runs between Our Mission and the
          demand map in routes/index.tsx — its disclaimer travelled with it
          and must stay wherever it lands. */}
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-6 pt-7 sm:px-8 lg:pb-7 lg:pt-8">
        {/* Column 1 is given the most width so the description settles on four
            lines rather than six — the single biggest saving in this block. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-9">
          {/* Logo + contact */}
          <div className="flex flex-col gap-3">
            <Logo variant="on-cream" />
            <p className="max-w-[74ch] text-[12px] leading-relaxed text-slate-muted">
              {siteDescription}
            </p>
            <ul className="flex flex-col gap-1.5 text-[13px] text-mist">
              <li className="flex items-center gap-2">
                <Mail aria-hidden="true" className="size-3.5 shrink-0 text-teal-500" />
                <a
                  className="transition-colors duration-200 hover:text-white"
                  href={`mailto:${contactDetails.email}`}
                >
                  {contactDetails.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone aria-hidden="true" className="size-3.5 shrink-0 text-teal-500" />
                <a
                  className="transition-colors duration-200 hover:text-white"
                  href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}
                >
                  {contactDetails.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-muted">
                <Clock aria-hidden="true" className="size-3.5 shrink-0 text-teal-500" />
                {contactDetails.hours}
              </li>
            </ul>
          </div>

          {/* Site */}
          <nav aria-label="Footer site links" className="flex flex-col gap-2.5">
            <h2 className="eyebrow text-slate-muted">Site</h2>
            <ul className="flex flex-col gap-1 text-[13px]">
              {footerSiteLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex min-h-11 items-center text-mist transition-colors duration-200 hover:text-white lg:min-h-0 lg:py-px"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact routes */}
          <nav aria-label="Enquiry routes" className="flex flex-col gap-2.5">
            <h2 className="eyebrow text-slate-muted">Contact routes</h2>
            <ul className="flex flex-col gap-1 text-[13px]">
              {contactRoutes.map((item) => (
                <li key={item.enquiry}>
                  <Link
                    to="/contact"
                    search={{ enquiry: item.enquiry, type: item.enquiry }}
                    className="inline-flex min-h-11 items-center text-mist transition-colors duration-200 hover:text-white lg:min-h-0 lg:py-px"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              search={{ enquiry: "partner", type: "partner" }}
              className="inline-flex min-h-11 items-center gap-1 font-heading text-[13px] font-semibold text-teal-400 transition-colors duration-200 hover:text-white lg:min-h-0 lg:py-px"
            >
              Become a Partner
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </nav>

          {/* In a crisis — care information, not marketing. Every number and
              the 999 note are untouched; only the padding and type moved. */}
          <section
            aria-labelledby="crisis-heading"
            className="flex flex-col gap-2.5 self-start rounded-[var(--radius-panel)] border border-[var(--color-teal-600)] bg-[var(--color-navy-900)] p-4 text-[var(--color-mist-bg)]"
          >
            <h2
              id="crisis-heading"
              className="flex items-center gap-2 eyebrow"
              style={{ color: "#ffffff" }}
            >
              <LifeBuoy aria-hidden="true" className="size-3.5" />
              In a crisis
            </h2>
            <ul className="flex flex-col gap-1.5 text-[13px] text-[var(--color-mist-bg)]">
              {crisisLines.map((line) => (
                <li key={line.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-[var(--color-mist-bg)]">{line.label}</span>
                  <span className="font-heading font-semibold">{line.detail}</span>
                </li>
              ))}
            </ul>
            <p className="font-heading text-[13px] font-semibold text-[var(--color-mist-bg)]">{crisisNote}</p>
          </section>
        </div>
      </div>

      {/* Registrations and the legal notice. No rule above this — the block is
          divided from the columns by space only. */}
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-6 sm:px-8">
        <ul className="grid gap-2.5 md:grid-cols-3">
          {trustRegistrations.map((reg) => (
            <li key={reg.id} className="panel flex flex-col gap-0.5 px-3 py-2.5 text-center">
              <p className="font-heading text-[13px] font-semibold leading-tight text-white">
                {reg.label}
              </p>
              {/* Category, reference and the verify link all on one line. The
                  link used to sit on a row of its own pinned to the bottom of
                  the card; inline it is the same words in ~20px less height.
                  It stays a real anchor with a visible label — it is how a
                  visitor checks the registration is genuine. */}
              <p className="text-[11px] leading-snug text-slate-muted">
                <span className="uppercase tracking-[0.1em]">{reg.category}</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono text-mist">{reg.reference}</span>
                <span aria-hidden="true"> · </span>
                <a
                  href={reg.verifyHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-baseline gap-0.5 font-semibold text-teal-400 transition-colors duration-200 hover:text-white"
                >
                  {reg.verifyLabel}
                  <ArrowUpRight aria-hidden="true" className="size-3 self-center" />
                </a>
              </p>
              {/* Published terms verbatim, run inline instead of stacked —
                  same words, fewer lines. */}
              {reg.details?.length ? (
                <p className="text-[11px] leading-snug text-slate-muted">
                  {reg.details.join(" · ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-3 max-w-[120ch] text-balance text-center text-[11px] leading-relaxed text-slate-muted">
          {legalNotice}
        </p>
      </div>
      </div>
    </footer>
  );
}
