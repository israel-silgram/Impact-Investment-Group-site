import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Landmark, Mail, ScrollText, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import {
  companyRecord,
  companyRecordFields,
  legalLinks,
  legalMailboxes,
  legalPageEyebrow,
  legalPageLead,
  legalPageTitle,
  policiesNote,
} from "@/content/legal";
import { trustRegistrations } from "@/content/site";

/**
 * /legal, the company block the footer's `Legal` link opens.
 *
 * A PAGE, NOT A PANEL, and the reason is the build: this site prerenders to
 * static HTML for GitHub Pages, so a page is a real URL a council, a solicitor
 * or a reader can bookmark, quote in a complaint and reach with JavaScript
 * off. A disclosure panel that only exists once React has hydrated is a
 * disclosure that some readers do not get. It is added to the prerender list
 * in `vite.config.ts` and to the sitemap.
 *
 * ⚠ EVERY VALUE ON THIS PAGE COMES FROM A REGISTER, NOT FROM COPY.
 * The company fields are read off Companies House (see content/legal.ts for
 * the source URL, the date it was read and the note on how the register splits
 * the address); the ICO and PRS references and the insurance position come
 * from `trustRegistrations`, which the footer already prints. Nothing here may
 * be softened, rounded or filled in with a placeholder: if a value cannot be
 * evidenced it is left off the page and raised in the wave report instead.
 *
 * ⚠ NO CLAIM OF AUTHORISATION OR EXEMPTION belongs on this page. The company's
 * regulatory position is stated once, in the footer notice, and it says what
 * the company is NOT. Listing registrations is not the same as claiming a
 * regulator has approved anything, and this page must never read as if it is.
 */

const title = "Legal and company information · The Impact Investment Platform";
const description =
  "Registered company name, number, registered office and jurisdiction for Impact Investment Group UK Limited, with its public registrations and the documents that govern its services.";

export const Route = createFileRoute("/legal")({
  component: LegalPage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/legal" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/legal" }],
  }),
});

function SectionIcon({ children }: { children: React.ReactNode }) {
  /* 24px glyph in a 60px ring, per the icon system. Ring is the cream-ground
     value; the stroke is navy and the accent is teal, because everything on
     this page is verification, not action. */
  return (
    <span className="grid size-[60px] shrink-0 place-items-center rounded-full border border-navy-700 text-teal-400">
      {children}
    </span>
  );
}

function LegalPage() {
  const documents = legalLinks.filter((item) => item.external);

  return (
    <main>
      <section aria-labelledby="legal-heading" className="section-light">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-8 pt-14 sm:px-8 lg:pt-20">
          <Reveal>
            <p className="eyebrow tracking-[0.14em] text-orange-700">{legalPageEyebrow}</p>
            <h1
              id="legal-heading"
              className="heading-tight mt-3 max-w-[14ch] text-balance text-[clamp(2.125rem,5.4vw,3.75rem)] font-extrabold tracking-[-0.03em] text-white"
            >
              {legalPageTitle}
            </h1>
            <p className="measure mt-5 text-[17px] leading-relaxed text-mist">{legalPageLead}</p>
          </Reveal>
        </div>
      </section>

      {/* ── The company ──────────────────────────────────────────────────── */}
      <section aria-labelledby="company-heading" className="section-light">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-14 sm:px-8">
          <Reveal className="panel p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <SectionIcon>
                <Landmark aria-hidden="true" className="size-6" strokeWidth={1.6} />
              </SectionIcon>
              <h2 id="company-heading" className="font-heading text-[26px] font-bold text-white">
                The company
              </h2>
            </div>

            <dl className="mt-7 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {companyRecordFields.map((field) => (
                <div key={field.label} className="flex flex-col gap-1">
                  <dt className="eyebrow text-slate-muted">{field.label}</dt>
                  <dd className="font-heading text-[17px] font-semibold leading-snug text-white">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* The verify link is the point of the block. It is a real anchor
                with a visible label, not an icon: it is how a reader proves the
                four values above without taking our word for any of them. */}
            <p className="mt-7 text-[13px] leading-relaxed text-slate-muted">
              Read from the Companies House public register on {companyRecord.verifiedOn}.{" "}
              <a
                href={companyRecord.registerHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-baseline gap-1 font-semibold text-teal-400 underline underline-offset-4 transition-colors duration-200 hover:text-white"
              >
                {companyRecord.registerLabel}
                <ArrowUpRight aria-hidden="true" className="size-3.5 self-center" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Registrations ────────────────────────────────────────────────── */}
      <section aria-labelledby="registrations-heading" className="section-light">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-14 sm:px-8">
          <Reveal>
            <div className="flex items-center gap-4">
              <SectionIcon>
                <ShieldCheck aria-hidden="true" className="size-6" strokeWidth={1.6} />
              </SectionIcon>
              <h2
                id="registrations-heading"
                className="font-heading text-[26px] font-bold text-white"
              >
                Registrations and cover
              </h2>
            </div>
            <p className="measure mt-4 text-[15px] leading-relaxed text-mist">
              Each of these is independently checkable on the register that issues it. A
              registration is a record that the company is listed, not an approval of anything it
              does.
            </p>
          </Reveal>

          <ul className="mt-7 grid gap-4 md:grid-cols-3">
            {trustRegistrations.map((reg, index) => (
              <Reveal key={reg.id} index={index} as="li" className="panel flex flex-col gap-2 p-5">
                <p className="eyebrow text-slate-muted">{reg.category}</p>
                <p className="font-heading text-[17px] font-semibold text-white">{reg.label}</p>
                <p className="font-mono text-[13px] text-mist">{reg.reference}</p>
                {reg.details?.map((detail) => (
                  <p key={detail} className="text-[12px] leading-snug text-slate-muted">
                    {detail}
                  </p>
                ))}
                <a
                  href={reg.verifyHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-auto inline-flex min-h-11 items-center gap-1 pt-2 text-[13px] font-semibold text-teal-400 underline underline-offset-4 transition-colors duration-200 hover:text-white"
                >
                  {reg.verifyLabel}
                  <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The documents ────────────────────────────────────────────────── */}
      <section aria-labelledby="documents-heading" className="section-light">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-14 sm:px-8">
          <Reveal>
            <div className="flex items-center gap-4">
              <SectionIcon>
                <ScrollText aria-hidden="true" className="size-6" strokeWidth={1.6} />
              </SectionIcon>
              <h2 id="documents-heading" className="font-heading text-[26px] font-bold text-white">
                The documents
              </h2>
            </div>
            <p className="measure mt-4 text-[15px] leading-relaxed text-mist">{policiesNote}</p>
          </Reveal>

          <ul className="mt-7 grid gap-4 md:grid-cols-3">
            {documents.map((doc, index) => (
              <Reveal
                key={doc.label}
                index={index}
                as="li"
                className="panel flex flex-col gap-2 p-5"
              >
                <p className="font-heading text-[17px] font-semibold text-white">{doc.label}</p>
                <p className="text-[13px] leading-relaxed text-slate-muted">{doc.description}</p>
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-auto inline-flex min-h-11 items-center gap-1 pt-2 text-[13px] font-semibold text-teal-400 underline underline-offset-4 transition-colors duration-200 hover:text-white"
                >
                  Read the {doc.label}
                  <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Contacts ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="contacts-heading" className="section-light">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 sm:px-8">
          <Reveal className="panel p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <SectionIcon>
                <Mail aria-hidden="true" className="size-6" strokeWidth={1.6} />
              </SectionIcon>
              <h2 id="contacts-heading" className="font-heading text-[26px] font-bold text-white">
                Contacting the company
              </h2>
            </div>

            <dl className="mt-7 grid gap-x-10 gap-y-5 sm:grid-cols-3">
              {legalMailboxes.map((box) => (
                <div key={box.address} className="flex flex-col gap-1">
                  <dt className="eyebrow text-slate-muted">{box.purpose}</dt>
                  <dd>
                    <a
                      href={`mailto:${box.address}`}
                      className="inline-flex min-h-11 items-center break-all font-heading text-[15px] font-semibold text-white underline underline-offset-4 transition-colors duration-200 hover:text-teal-400"
                    >
                      {box.address}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-[13px] leading-relaxed text-slate-muted">
              Post can be sent to the registered office above. To ask a question about this site
              rather than about the company,{" "}
              <Link
                to="/contact"
                className="font-semibold text-teal-400 underline underline-offset-4 transition-colors duration-200 hover:text-white"
              >
                use the contact form
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
