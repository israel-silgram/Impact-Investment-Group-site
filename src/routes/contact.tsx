import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowUpRight, Clock, Mail, Phone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { EnquiryForm } from "@/components/contact/enquiry-form";
import {
  enquiryRouteIds,
  enquiryRoutes,
  lookingForHome,
  registeredOffice,
  type EnquiryRouteId,
} from "@/content/contact";
import {
  contactDetails,
  crisisLines,
  crisisNote,
  legalNotice,
  trustRegistrations,
} from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Every CTA on the site deep-links here with the route pre-selected. Both
 * ?enquiry= and ?type= are accepted so either link shape works.
 */
const searchSchema = z.object({
  enquiry: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  role: z.string().optional().catch(undefined),
});

function toRouteId(value: string | undefined): EnquiryRouteId {
  return enquiryRouteIds.includes(value as EnquiryRouteId)
    ? (value as EnquiryRouteId)
    : "demo";
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
          "One form, six routes: book a demo, speak to sales, become a partner, investor enquiries, media and support. Email hello@impactig.co.uk or call +44 7539 088373.",
      },
      { property: "og:title", content: "Contact — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "Choose your route and we reply within one working day. Crisis numbers and our registrations are published on this page.",
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
    void navigate({ search: (prev) => ({ ...prev, enquiry: id, type: id }) });
  };

  return (
    <main className="bg-navy-900">
      {/* 1 · Header */}
      <section aria-labelledby="contact-heading" className="border-b border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <p className="eyebrow text-teal-400">Talk to us</p>
            <h1
              id="contact-heading"
              className="heading-tight mt-4 text-[clamp(2.25rem,5vw,4rem)] font-bold text-white"
            >
              Contact
            </h1>
            <p className="measure mt-5 text-base leading-relaxed text-mist">
              One form, six routes. Choose the route and the fields, the team and the reply time
              change with it.
            </p>
            <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
              <li>
                <a
                  href={`mailto:${contactDetails.email}`}
                  className="flex min-h-11 items-center gap-3 font-heading text-[clamp(1.125rem,2vw,1.5rem)] font-bold text-white hover:text-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                >
                  <Mail aria-hidden="true" className="size-5 shrink-0 text-teal-500" />
                  {contactDetails.email}
                </a>
              </li>
              <li>
                <a
                  href={telHref(contactDetails.phone)}
                  className="flex min-h-11 items-center gap-3 font-heading text-[clamp(1.125rem,2vw,1.5rem)] font-bold text-white hover:text-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
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

      {/* 2 · Route selector */}
      <section aria-labelledby="routes-heading" className="border-b border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:py-16">
          <h2
            id="routes-heading"
            className="heading-tight text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold text-white"
          >
            What do you need?
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {enquiryRoutes.map((option, i) => {
              const active = option.id === selected;
              return (
                <Reveal key={option.id} index={i} as="li">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => select(option.id)}
                    className={cn(
                      "h-full w-full cursor-pointer rounded-[var(--radius-panel)] border p-6 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400",
                      active
                        ? "border-teal-500 bg-teal-950"
                        : "border-navy-700 bg-navy-900 hover:border-navy-600",
                    )}
                  >
                    <span className="font-heading text-lg font-bold text-white">{option.label}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-mist">
                      {option.subline}
                    </span>
                    <span
                      className={cn(
                        "mt-4 block text-[12px] font-semibold uppercase tracking-[0.12em]",
                        active ? "text-teal-400" : "text-slate-muted",
                      )}
                    >
                      {active ? "Selected" : option.reply}
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 3 · The form */}
      <section aria-label="Enquiry form" className="border-b border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20">
          <EnquiryForm route={selected} prefilledRole={role} />
        </div>
      </section>

      {/* 4 · Looking for a home? */}
      <section aria-labelledby="home-route-heading" className="border-b border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:py-16">
          <Reveal className="rounded-[var(--radius-panel)] border border-teal-600 bg-teal-950 p-8 lg:p-10">
            <h2
              id="home-route-heading"
              className="heading-tight text-[clamp(1.375rem,2.4vw,2rem)] font-bold text-white"
            >
              {lookingForHome.title}
            </h2>
            <p className="measure mt-4 text-base leading-relaxed text-mist">
              {lookingForHome.body}
            </p>
            <div className="mt-6">
              <Button variant="secondary" asChild>
                <Link to="/solutions" hash="looking-for-a-home">
                  {lookingForHome.action}
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 · In a crisis */}
      <section aria-labelledby="crisis-heading" className="border-b border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:py-16">
          <div className="rounded-[var(--radius-panel)] border-2 border-orange-500/60 bg-navy-950 p-8">
            <p className="flex items-center gap-3">
              <ShieldAlert aria-hidden="true" className="size-5 shrink-0 text-orange-400" />
              <span
                id="crisis-heading"
                className="font-heading text-lg font-bold uppercase tracking-[0.1em] text-white"
              >
                In a crisis
              </span>
            </p>
            <ul className="mt-6 flex flex-col divide-y divide-navy-700 border-y border-navy-700">
              {crisisLines.map((line) => (
                <li key={line.label}>
                  <a
                    href={telHref(line.detail)}
                    className="flex min-h-11 items-center justify-between gap-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                  >
                    <span className="text-base text-mist">{line.label}</span>
                    <span className="font-heading text-lg font-bold text-white">{line.detail}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-5 font-heading text-base font-bold text-white">{crisisNote}</p>
          </div>
        </div>
      </section>

      {/* 6 · Registrations, redress & cover */}
      <section aria-labelledby="trust-heading" className="border-b border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20">
          <SectionHeader
            eyebrow="Check us"
            title="Registrations, redress & cover"
            lead="Every reference below can be verified on the relevant public register."
          />
          <h2 id="trust-heading" className="sr-only">
            Registrations, redress and cover
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {trustRegistrations.map((reg, i) => (
              <Reveal key={reg.id} index={i} as="li">
                <div className="flex h-full flex-col gap-3 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-900 p-6">
                  <p className="eyebrow text-slate-muted">{reg.category}</p>
                  <p className="font-heading text-lg font-bold text-white">{reg.label}</p>
                  <p className="font-mono text-sm text-mist">{reg.reference}</p>
                  <a
                    href={reg.verifyHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-auto flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                  >
                    {reg.verifyLabel}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 max-w-[100ch] text-[13px] leading-relaxed text-slate-muted">
            {legalNotice}
          </p>
        </div>
      </section>

      {/* 7 · Registered office */}
      <section aria-labelledby="office-heading" className="border-b border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-12 sm:px-8">
          <h2 id="office-heading" className="eyebrow text-slate-muted">
            {registeredOffice.title}
          </h2>
          <p className="mt-3 font-heading text-lg font-bold text-white">
            {registeredOffice.entity}
          </p>
        </div>
      </section>
    </main>
  );
}
