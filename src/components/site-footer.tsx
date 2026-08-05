import { Link } from "@tanstack/react-router";
import { ArrowUpRight, LifeBuoy, Mail, Phone, Clock } from "lucide-react";

import { Logo } from "@/components/logo";
import {
  contactDetails,
  contactRoutes,
  crisisLines,
  crisisNote,
  footerSiteLinks,
  legalNotice,
  siteDescription,
  trustRegistrations,
} from "@/content/site";

/**
 * Footer, halved (~980px → ~500px).
 *
 * Nothing was removed. Every link, every crisis number, every registration
 * reference and the legal notice are all still here, verbatim. The height came
 * out of the spacing and the type scale:
 *
 *  - Padding 56/80px → 32/40px, and the three bands became two.
 *  - Link rows lost the 44px minimum on desktop (they keep it on touch, where
 *    it matters) and sit at 13px with 4px between them — ~27px each, still
 *    clear of the 24px target-size minimum.
 *  - The registrations band used to be its own full-width strip with its own
 *    rule. It now sits inside the bottom bar above the legal notice, as three
 *    compact cards: label, then category · reference · verify on one line,
 *    then the published terms run inline rather than stacked.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-navy-700 bg-navy-950">
      {/* The commissioning-councils carousel used to sit here as a band
          above these columns. It now runs between Our Mission and the
          demand map in routes/index.tsx — its disclaimer travelled with it
          and must stay wherever it lands. */}
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:py-10">
        {/* Column 1 is given the most width so the description settles on four
            lines rather than six — the single biggest saving in this block. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
          {/* Logo + contact */}
          <div className="flex flex-col gap-3">
            <Logo variant="on-navy" />
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
                    className="inline-flex min-h-11 items-center text-mist transition-colors duration-200 hover:text-white lg:min-h-0 lg:py-1"
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
                    className="inline-flex min-h-11 items-center text-mist transition-colors duration-200 hover:text-white lg:min-h-0 lg:py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              search={{ enquiry: "partner", type: "partner" }}
              className="inline-flex min-h-11 items-center gap-1 font-heading text-[13px] font-semibold text-teal-400 transition-colors duration-200 hover:text-white lg:min-h-0 lg:py-1"
            >
              Become a Partner
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </nav>

          {/* In a crisis — care information, not marketing. Every number and
              the 999 note are untouched; only the padding and type moved. */}
          <section
            aria-labelledby="crisis-heading"
            className="teal-wash flex flex-col gap-2.5 self-start rounded-[var(--radius-panel)] border border-teal-600/40 p-4"
          >
            <h2 id="crisis-heading" className="flex items-center gap-2 eyebrow text-teal-400">
              <LifeBuoy aria-hidden="true" className="size-3.5" />
              In a crisis
            </h2>
            <ul className="flex flex-col gap-1.5 text-[13px] text-white">
              {crisisLines.map((line) => (
                <li key={line.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-mist">{line.label}</span>
                  <span className="font-heading font-semibold">{line.detail}</span>
                </li>
              ))}
            </ul>
            <p className="font-heading text-[13px] font-semibold text-white">{crisisNote}</p>
          </section>
        </div>
      </div>

      {/* Bottom bar — registrations and the legal notice under one rule. */}
      <div className="border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-5 sm:px-8">
          <ul className="grid gap-3 md:grid-cols-3">
            {trustRegistrations.map((reg) => (
              <li key={reg.id} className="panel flex flex-col gap-1 p-3 text-center">
                <p className="font-heading text-[13px] font-semibold leading-tight text-white">
                  {reg.label}
                </p>
                <p className="text-[11px] leading-snug text-slate-muted">
                  <span className="uppercase tracking-[0.1em]">{reg.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="font-mono text-mist">{reg.reference}</span>
                </p>
                {/* Published terms verbatim, run inline instead of stacked —
                    same words, fewer lines. */}
                {reg.details?.length ? (
                  <p className="text-[11px] leading-snug text-slate-muted">
                    {reg.details.join(" · ")}
                  </p>
                ) : null}
                <a
                  href={reg.verifyHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-auto inline-flex items-center justify-center gap-1 pt-1 text-[11px] font-semibold text-teal-400 transition-colors duration-200 hover:text-white"
                >
                  {reg.verifyLabel}
                  <ArrowUpRight aria-hidden="true" className="size-3" />
                </a>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-4 max-w-[120ch] text-balance text-center text-[11px] leading-relaxed text-slate-muted">
            {legalNotice}
          </p>
        </div>
      </div>
    </footer>
  );
}
