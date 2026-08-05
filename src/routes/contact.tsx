import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Clock, Mail, Phone, Plus } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { EnquiryForm } from "@/components/contact/enquiry-form";
import {
  enquiryRouteIds,
  enquiryRoutes,
  type EnquiryRouteId,
} from "@/content/contact";
import { faq, faqEyebrow, faqHeading } from "@/content/faq";
import { contactDetails } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * /contact — three sections, deliberately.
 *
 *   1 · Talk to us   navy    heading, email, phone, hours
 *   2 · The form     cream   route chips + the enquiry form
 *   3 · FAQ          navy    the old site's accordion, verbatim
 *
 * ── What came off this page, and where it went ────────────────────────────
 *
 * It used to run seven sections. Four are gone:
 *
 *   Route selector      not deleted — collapsed into a chip row directly above
 *                       the form. It still has to exist: every CTA on the site
 *                       deep-links here with ?enquiry=, and without a control a
 *                       visitor arriving cold could only ever send a wait-list
 *                       enquiry.
 *   Looking for a home  the FAQ answers it — "I'm looking for a home — can this
 *                       help me?" carries the same signpost AND the crisis
 *                       numbers.
 *   In a crisis         still in the site footer, on every page, with tel:
 *                       links. Not lost.
 *   Registrations,
 *     registered office  also in the footer, on every page, with their verify
 *                        links. Not lost.
 *
 * ⚠️ That last point is the load-bearing one: the crisis numbers and the
 * registrations are only safe to have removed from here BECAUSE the footer
 * carries them site-wide. If the footer is ever trimmed, they come back here.
 *
 * The FAQ is verbatim from the old production site — see the note in
 * content/faq.ts for why those answers are not summarised like the rest of the
 * site's copy.
 */

const searchSchema = z.object({
  enquiry: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  role: z.string().optional().catch(undefined),
});

function toRouteId(value: string | undefined): EnquiryRouteId {
  return enquiryRouteIds.includes(value as EnquiryRouteId)
    ? (value as EnquiryRouteId)
    : "waitlist";
}

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Contact — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Talk to the team, join the wait list, become a partner or ask about investor access. Email hello@impactig.co.uk or call +44 7539 088373.",
      },
      { property: "og:title", content: "Contact — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "One form and the questions people ask us most. We reply within one working day.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const telHref = (value: string) => `tel:${value.replace(/[^+\d]/g, "")}`;

function ContactPage() {
  const { enquiry, type, role } = Route.useSearch();
  const navigate = useNavigate({ from: "/contact" });
  const selected = toRouteId(type ?? enquiry);

  const select = (id: EnquiryRouteId) => {
    void navigate({ search: { ...{ enquiry: id, type: id }, ...(role ? { role } : {}) } });
  };

  return (
    <main className="bg-navy-900">
      {/* ── 1 · Talk to us ─────────────────────────────────────────────── */}
      <section aria-labelledby="contact-heading" className="border-b border-navy-700">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-8 lg:py-16">
          <Reveal>
            <p className="eyebrow text-teal-400">Talk to us</p>
            <h1
              id="contact-heading"
              className="heading-tight mt-3 text-[clamp(2rem,4.6vw,3.25rem)] font-extrabold tracking-[-0.02em] text-white"
            >
              Contact
            </h1>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-mist">
              Tell us what you need and we reply within one working day.
            </p>
            <ul className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
              <li>
                <a
                  href={`mailto:${contactDetails.email}`}
                  className="flex min-h-11 items-center gap-3 font-heading text-[clamp(1.0625rem,1.8vw,1.375rem)] font-bold text-white transition-colors duration-200 hover:text-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                >
                  <Mail aria-hidden="true" className="size-5 shrink-0 text-teal-500" />
                  {contactDetails.email}
                </a>
              </li>
              <li>
                <a
                  href={telHref(contactDetails.phone)}
                  className="flex min-h-11 items-center gap-3 font-heading text-[clamp(1.0625rem,1.8vw,1.375rem)] font-bold text-white transition-colors duration-200 hover:text-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                >
                  <Phone aria-hidden="true" className="size-5 shrink-0 text-teal-500" />
                  {contactDetails.phone}
                </a>
              </li>
              <li className="flex min-h-11 items-center gap-3 text-sm text-slate-muted">
                <Clock aria-hidden="true" className="size-4 shrink-0 text-teal-500" />
                {contactDetails.hours}
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── 2 · The form ───────────────────────────────────────────────── */}
      <section aria-label="Enquiry form" className="section-light border-b border-navy-700">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 lg:py-14">
          {/* The route still has to be choosable — it changes the fields, the
              team and the reply time. It is a chip row rather than the grid of
              six cards it used to be. */}
          <p className="eyebrow text-teal-400">What do you need?</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {enquiryRoutes.map((option) => {
              const active = option.id === selected;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => select(option.id)}
                    className={cn(
                      "min-h-10 cursor-pointer rounded-full border px-4 text-[13.5px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
                      active
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-navy-700 bg-navy-900 text-white hover:border-teal-600",
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <EnquiryForm route={selected} prefilledRole={role} />
          </div>
        </div>
      </section>

      {/* ── 3 · FAQ ────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-heading">
        <div className="mx-auto w-full max-w-[900px] px-5 py-14 sm:px-8 lg:py-16">
          <p className="eyebrow text-teal-400">{faqEyebrow}</p>
          <h2
            id="faq-heading"
            className="heading-tight mt-2.5 text-balance text-[clamp(1.5rem,2.8vw,2rem)] font-extrabold tracking-[-0.02em] text-white"
          >
            {faqHeading}
          </h2>

          {/* Native <details>, not a JS accordion: it works before hydration,
              it is keyboard and screen-reader correct for free, and the browser
              finds text inside a closed one when the user searches the page. */}
          <div className="mt-7 flex flex-col gap-2.5">
            {faq.map((item, i) => (
              <Reveal key={item.id} index={i}>
                <details className="group rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/60 open:bg-navy-800">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 font-heading text-[15.5px] font-bold text-white [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <Plus
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-teal-400 transition-transform duration-200 group-open:rotate-45"
                      strokeWidth={2}
                    />
                  </summary>
                  <div className="flex flex-col gap-3 px-4 pb-4">
                    {item.a.map((paragraph) => (
                      <p key={paragraph} className="text-[13.5px] leading-relaxed text-mist">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
