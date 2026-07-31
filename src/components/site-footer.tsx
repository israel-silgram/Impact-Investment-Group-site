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
  trustRegistrations,
} from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-navy-700 bg-navy-950">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-10">
          {/* Logo + contact */}
          <div className="flex flex-col gap-6">
            <Logo />
            <ul className="flex flex-col gap-3 text-sm text-mist">
              <li className="flex items-center gap-2">
                <Mail aria-hidden="true" className="size-4 shrink-0 text-teal-500" />
                <a className="hover:text-white" href={`mailto:${contactDetails.email}`}>
                  {contactDetails.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone aria-hidden="true" className="size-4 shrink-0 text-teal-500" />
                <a className="hover:text-white" href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}>
                  {contactDetails.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-muted">
                <Clock aria-hidden="true" className="size-4 shrink-0 text-teal-500" />
                {contactDetails.hours}
              </li>
            </ul>
          </div>

          {/* Site */}
          <nav aria-label="Footer site links" className="flex flex-col gap-4">
            <h2 className="eyebrow text-slate-muted">Site</h2>
            <ul className="flex flex-col gap-3 text-sm">
              {footerSiteLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex min-h-11 items-center text-mist transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact routes */}
          <nav aria-label="Enquiry routes" className="flex flex-col gap-4">
            <h2 className="eyebrow text-slate-muted">Contact routes</h2>
            <ul className="flex flex-col gap-3 text-sm">
              {contactRoutes.map((item) => (
                <li key={item.enquiry}>
                  <Link
                    to="/contact"
                    search={{ enquiry: item.enquiry }}
                    className="inline-flex min-h-11 items-center text-mist transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* In a crisis — care information, not marketing */}
          <section
            aria-labelledby="crisis-heading"
            className="teal-wash flex flex-col gap-4 rounded-[var(--radius-panel)] border border-teal-600/40 p-5"
          >
            <h2 id="crisis-heading" className="flex items-center gap-2 eyebrow text-teal-400">
              <LifeBuoy aria-hidden="true" className="size-4" />
              In a crisis
            </h2>
            <ul className="flex flex-col gap-3 text-sm text-white">
              {crisisLines.map((line) => (
                <li key={line.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-mist">{line.label}</span>
                  <span className="font-heading font-semibold">{line.detail}</span>
                </li>
              ))}
            </ul>
            <p className="font-heading text-sm font-semibold text-white">{crisisNote}</p>
          </section>
        </div>
      </div>

      {/* Trust block */}
      <div className="border-t border-navy-700">
        <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-5 py-10 sm:px-8 md:grid-cols-3">
          {trustRegistrations.map((reg) => (
            <div key={reg.id} className="panel flex flex-col gap-2 p-5">
              <p className="eyebrow text-slate-muted">{reg.category}</p>
              <p className="font-heading text-base font-semibold text-white">{reg.label}</p>
              <p className="font-mono text-xs text-mist">{reg.reference}</p>
              {reg.details?.map((detail) => (
                <p key={detail} className="text-[11px] leading-snug text-slate-muted">
                  {detail}
                </p>
              ))}
              <a
                href={reg.verifyHref}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm text-teal-400 transition-colors duration-200 hover:text-white"
              >
                {reg.verifyLabel}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-navy-700">
        <p className="mx-auto w-full max-w-[1440px] px-5 py-8 text-[12px] leading-relaxed text-slate-muted sm:px-8">
          {legalNotice}
        </p>
      </div>
    </footer>
  );
}
