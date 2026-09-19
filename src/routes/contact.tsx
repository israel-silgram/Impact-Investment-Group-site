import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Clock, LifeBuoy, Mail, Phone, Plus } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { EnquiryForm } from "@/components/contact/enquiry-form";
import {
  contactHero,
  enquiryRouteIds,
  enquiryRoutes,
  type EnquiryRouteId,
} from "@/content/contact";
import { faq, faqEyebrow, faqHeading } from "@/content/faq";
import { contactDetails, crisisLines, crisisNote } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * /contact — three sections.
 *
 *   1 · Talk to us      cream   heading, the direct routes, the trio waving
 *   2 · The form        cream   route chips + form, with the reassurance rail
 *   3 · FAQ             navy    the old site's accordion, verbatim
 *
 * ── WHY THE RAIL EXISTS ───────────────────────────────────────────────────
 *
 * This is the only page on the site where the visitor is trying to DO
 * something rather than read something, so the job is removing doubt, not
 * adding interest. What stops a form being completed is not the layout — it is
 * not knowing who reads it, how long it takes, and what happens next. Those
 * three answers sit in the right-hand column, level with the submit button,
 * because that is where the hesitation happens.
 *
 * ⚠️ THE CRISIS NUMBERS ARE ON THE PAGE, not only in the footer. That is
 * deliberate. The FAQ below openly asks "I'm looking for a home — can this
 * help me?", so people in difficulty do land here, and a number they have to
 * scroll to the footer to find is a number they may not find. They stay
 * duplicated. This is one of the few places where repetition is correct.
 *
 * ── What came off this page, and where it went ────────────────────────────
 *
 * The seven-section version's "Looking for a home", "Registrations" and
 * "Registered office" blocks are all still in the site footer, on every page.
 * The route selector survives as the chip row above the form — every CTA on
 * the site deep-links here with ?enquiry=, so without a control a visitor
 * arriving cold could only ever send a wait-list enquiry.
 *
 * The FAQ is verbatim from the old production site — see content/faq.ts for
 * why those answers are not summarised like the rest of the site's copy.
 */

const searchSchema = z.object({
  enquiry: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  role: z.string().optional().catch(undefined),
});

function toRouteId(value: string | undefined): EnquiryRouteId {
  return enquiryRouteIds.includes(value as EnquiryRouteId) ? (value as EnquiryRouteId) : "waitlist";
}

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Contact — The Impact Investment Platform" },
      {
        name: "description",
        // Interpolated, not typed out. This description carried its own copy of
        // the general address and went stale the day the mailbox changed.
        content: `Tell us what you need and a person replies within one working day. Email ${contactDetails.email} or call ${contactDetails.phone}.`,
      },
      { property: "og:title", content: "Contact — The Impact Investment Platform" },
      {
        property: "og:description",
        content: "Choose the right enquiry route and speak directly with the team.",
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
    <main>
      {/* ── 1 · Talk to us ── cream ───────────────────────────────────────
          The trio wave rather than point. On every other page they explain
          something; here they are the greeting, which is why the artwork is
          cropped at the waist and sits small. */}
      <section aria-labelledby="contact-heading" className="section-light">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-2 pt-14 sm:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <Reveal>
              <p className="eyebrow tracking-[0.14em] text-orange-700">{contactHero.eyebrow}</p>
              <h1
                id="contact-heading"
                className="heading-tight mt-3 max-w-[16ch] text-balance text-[clamp(2.125rem,5.4vw,3.75rem)] font-extrabold tracking-[-0.03em] text-ink"
              >
                {contactHero.title}
              </h1>
              <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-7">
                <li>
                  <a
                    href={`mailto:${contactDetails.email}`}
                    className="flex min-h-11 items-center gap-2.5 font-heading text-[clamp(1rem,1.7vw,1.25rem)] font-bold text-ink transition-colors duration-200 hover:text-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                  >
                    <Mail aria-hidden="true" className="size-[18px] shrink-0 text-teal-600" />
                    {contactDetails.email}
                  </a>
                </li>
                <li>
                  <a
                    href={telHref(contactDetails.phone)}
                    className="flex min-h-11 items-center gap-2.5 font-heading text-[clamp(1rem,1.7vw,1.25rem)] font-bold text-ink transition-colors duration-200 hover:text-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                  >
                    <Phone aria-hidden="true" className="size-[18px] shrink-0 text-teal-600" />
                    {contactDetails.phone}
                  </a>
                </li>
                <li className="flex min-h-11 items-center gap-2.5 text-sm text-ink-muted">
                  <Clock aria-hidden="true" className="size-4 shrink-0 text-teal-600" />
                  {contactDetails.hours}
                </li>
              </ul>
            </Reveal>

            <img
              src="/images/ai-team/trio-wave.webp"
              loading="lazy"
              alt=""
              aria-hidden="true"
              width={934}
              height={558}
              className="hidden w-full lg:block"
            />
          </div>
        </div>
      </section>

      {/* ── 2 · The form + the rail ── cream, joined to section 1 ────────── */}
      <section aria-label="Enquiry form" className="section-light">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-16 pt-6 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              {/* The route changes the fields, the team and the reply time, so
                  it has to stay choosable — a chip row rather than the grid of
                  six cards it used to be. */}
              <p className="eyebrow tracking-[0.14em] text-orange-700">What do you need?</p>
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
                          "min-h-10 cursor-pointer rounded-full border px-4 font-heading text-[13.5px] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
                          active
                            ? /* White on the teal-600 fill is 5.25:1 and is the
                                 measured pairing; `text-page` rather than
                                 `text-white` so the light remap's substring
                                 rule cannot repaint it navy on the teal while
                                 the unconverted files still depend on that
                                 rule. */
                              "border-teal-600 bg-teal-600 text-page"
                            : "border-rule bg-page text-ink hover:border-teal-600",
                        )}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-7">
                <EnquiryForm route={selected} prefilledRole={role} />
              </div>
            </div>

            {/* ── The rail ────────────────────────────────────────────── */}
            <div>
              {/* Care information, not marketing. Duplicated from the footer on
                  purpose; see the note at the top of this file.

                  WAVE 412: THIS ROUTE'S ONE NAVY ISLAND. Everything else on
                  /contact is cream and white, and this card is the one block a
                  person in trouble has to find on a page otherwise built for
                  procurement enquiries. `data-accent="teal"` gives it the teal
                  rule the footer's copy carries, so the two read as the same
                  card on two pages. */}
              <section
                aria-labelledby="crisis-heading"
                data-accent="teal"
                className="section-dark mt-7 p-4"
              >
                <p className="flex items-center gap-2">
                  <LifeBuoy aria-hidden="true" className="size-4 shrink-0 text-orange-500" />
                  {/* Orange TEXT on an island is orange-500, not the
                      orange-700 the light grounds take. This island's ground
                      is navy-950, where orange-500 is 4.67:1 and orange-700
                      is 3.04:1. (4.46:1 is orange-500 on navy-900, which is
                      the ink colour and not this card's ground; wave 412b
                      corrected it. Both pass; the old figure understated it,
                      and 4.46 would have read as a fail.) */}
                  <span id="crisis-heading" className="eyebrow tracking-[0.14em] text-orange-500">
                    In a crisis
                  </span>
                </p>
                <ul className="mt-2.5 flex flex-col">
                  {crisisLines.map((line) => (
                    <li key={line.label}>
                      <a
                        href={telHref(line.detail)}
                        /* INSIDE AN ISLAND THE CLASSES ARE THE ISLAND'S. Navy
                           rules, mist body, white figure and the teal-400 focus
                           ring: the dark palette, written out, because that is
                           what this plate actually is. Converting these to
                           `border-rule` and `text-ink` would be honest about
                           the site and wrong about the card. */
                        className="flex min-h-11 items-center justify-between gap-3 border-b border-navy-700 text-[13px] text-mist last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                      >
                        {line.label}
                        <span className="font-heading text-[14px] font-bold text-white">
                          {line.detail}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-heading text-[12.5px] font-bold text-white">{crisisNote}</p>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 · FAQ ── white, after two cream sections ────────────────────── */}
      <section aria-labelledby="faq-heading" className="border-t border-rule bg-page">
        <div className="mx-auto w-full max-w-[900px] px-5 py-14 sm:px-8 lg:py-16">
          <p className="eyebrow tracking-[0.14em] text-teal-600">{faqEyebrow}</p>
          <h2
            id="faq-heading"
            className="heading-tight mt-2.5 text-balance text-[clamp(1.5rem,2.8vw,2rem)] font-extrabold tracking-[-0.02em] text-ink"
          >
            {faqHeading}
          </h2>

          {/* Native <details>, not a JS accordion: it works before hydration,
              it is keyboard and screen-reader correct for free, and the browser
              finds text inside a closed one when the user searches the page. */}
          <div className="mt-7 flex flex-col gap-2.5">
            {faq.map((item, i) => (
              <Reveal key={item.id} index={i}>
                {/* A white row with a hairline and the card shadow, deepening
                    when it opens. On the dark site the open state was a step
                    up in navy; on a white page the equivalent is a step up in
                    lift, because there is nowhere lighter to go. */}
                <details className="group rounded-[var(--radius-panel)] border border-rule bg-page shadow-[var(--shadow-card)] transition-shadow duration-200 open:shadow-[var(--shadow-card-hover)]">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 font-heading text-[15.5px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <Plus
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-teal-600 transition-transform duration-200 group-open:rotate-45"
                      strokeWidth={2}
                    />
                  </summary>
                  <div className="flex flex-col gap-3 px-4 pb-4">
                    {item.a.map((paragraph) => (
                      <p key={paragraph} className="text-[13.5px] leading-relaxed text-ink-muted">
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
