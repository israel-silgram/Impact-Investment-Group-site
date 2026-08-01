import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HeartHandshake, Home as HomeIcon, Users } from "lucide-react";

import challengeAerial from "@/assets/challenge-estate-aerial.jpg";
import purposeTerrace from "@/assets/purpose-terrace-morning.jpg";
import { DemandMap } from "@/components/home/demand-map";
import { HomeHero } from "@/components/home/hero";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SourceLine } from "@/components/ui/source-line";
import {
  challengeCopy,
  closingCopy,
  connectCopy,
  demandMapCopy,
  demandMapNote,
  purposeCopy,
  solutionCopy,
  groupSolutions,
  bnbSpendPanel,
  nhsCostPanel,
  problemBars,
} from "@/content/home";
import { cn } from "@/lib/utils";

/** The single orange action this page exists to get. Hero + closing band only. */
const PRIMARY_LABEL = "Book a Demo";

const icon = (name: string): LucideIcon =>
  (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle;

const maxBar = Math.max(...problemBars.map((b) => b.value));

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "The Impact Investment Platform — Social Impact Property & Supported Housing" },
      {
        name: "description",
        content:
          "A UK social-impact property platform matching local authorities, providers, landlords and investors to compliant supported housing.",
      },
      {
        property: "og:title",
        content: "The Impact Investment Platform — Social Impact Property & Supported Housing",
      },
      {
        property: "og:description",
        content:
          "Matching local authorities, care and support providers, landlords and investors to compliant supported housing.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  return (
    <>
      {/* 1 · Hero */}
      <HomeHero />


      {/* 2 · Our purpose | The problem */}
      <section aria-labelledby="purpose-heading" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <SectionHeader
                id="purpose-heading"
                eyebrow={purposeCopy.eyebrow}
                title={purposeCopy.title}
                className="max-w-3xl"
              />
              <p className="measure mt-6 text-base leading-relaxed text-mist">{purposeCopy.body}</p>
            </div>
            <Reveal>
              <img
                src={purposeTerrace}
                alt="Early morning light on a row of British red-brick terraced houses"
                width={1024}
                height={1280}
                loading="lazy"
                className="aspect-[4/5] w-full rounded-xl object-cover ring-1 ring-navy-700/20"
              />
            </Reveal>
          </div>

          <div className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <SectionHeader
                eyebrow={challengeCopy.eyebrow}
                title={challengeCopy.title}
                lead={challengeCopy.lead}
                className="max-w-3xl"
              />

              <ul className="measure mt-8 flex flex-col gap-3">
                {challengeCopy.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-base leading-relaxed text-mist"
                  >
                    <Icons.Minus
                      aria-hidden="true"
                      className="mt-1.5 size-4 shrink-0 text-teal-500"
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="measure mt-6 text-base leading-relaxed text-mist">
                {challengeCopy.close}
              </p>
            </div>
            <Reveal className="lg:self-stretch">
              <img
                src={challengeAerial}
                alt="Aerial view of a dense British suburban housing estate"
                width={1024}
                height={1280}
                loading="lazy"
                className="h-full max-h-[560px] min-h-[320px] w-full rounded-xl object-cover ring-1 ring-navy-700/20"
              />
            </Reveal>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
            <ul className="flex flex-col gap-8">
              {problemBars.map((bar, i) => (
                <Reveal as="li" key={bar.id} index={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-heading text-base font-semibold text-mist">{bar.label}</p>
                    <p
                      className={cn(
                        "font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-none",
                        bar.tone === "orange" ? "text-orange-500" : "text-white",
                      )}
                    >
                      {bar.display}
                    </p>
                  </div>
                  <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-navy-800">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        bar.tone === "orange" ? "bg-orange-500" : "bg-teal-500",
                      )}
                      style={{ width: `${Math.round((bar.value / maxBar) * 100)}%` }}
                    />
                  </div>
                  <SourceLine className="mt-2" source={bar.source} />
                </Reveal>
              ))}
            </ul>

            <Reveal className="panel flex flex-col justify-center gap-3 p-6">
              <p className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-none text-orange-500">
                {nhsCostPanel.value}
              </p>
              <p className="font-heading text-base font-semibold text-mist">{nhsCostPanel.label}</p>
              <SourceLine source={nhsCostPanel.source} />

              <div className="mt-4 border-t border-navy-700 pt-4">
                <p className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-none text-white">
                  {bnbSpendPanel.value}
                </p>
                <p className="mt-2 font-heading text-sm font-semibold text-mist">
                  {bnbSpendPanel.label}
                </p>
                <SourceLine className="mt-2" source={bnbSpendPanel.source} />
              </div>
            </Reveal>
          </div>

          <div className="mt-12">
            <Button variant="ghost" asChild>
              <Link to="/the-problem">See the full picture</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3 · Our solution */}
      <section aria-labelledby="solution-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <SectionHeader
            id="solution-heading"
            eyebrow={solutionCopy.eyebrow}
            title={solutionCopy.title}
            lead={solutionCopy.lead}
            className="max-w-3xl"
          />

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {solutionCopy.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-base leading-relaxed text-mist">
                <Icons.Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-teal-500" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 · The accountable chain behind it */}
      <section aria-labelledby="chain-heading" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <h2 id="chain-heading" className="eyebrow text-teal-400">
            {solutionCopy.subBlockTitle}
          </h2>

          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {groupSolutions.map((item, i) => {
              const Icon = icon(item.icon);
              return (
                <Reveal as="li" key={item.id} index={i} className="h-full">
                  <div className="panel flex h-full flex-col gap-4 p-6">
                    <IconCircle icon={Icon} size="lg" tone="teal" />
                    <h3 className="heading-tight text-xl font-bold text-white">{item.title}</h3>
                    <p className="eyebrow text-teal-400">{item.entity}</p>
                    <p className="text-sm leading-relaxed text-mist">{item.summary}</p>
                    {item.qualifier ? (
                      <p className="mt-auto text-[12px] leading-relaxed text-slate-muted">
                        {item.qualifier}
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 5 · Live UK demand map */}
      <section aria-labelledby="demand-heading" className="border-t border-navy-700 bg-navy-900">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-24 sm:px-8 lg:py-32">
          <SectionHeader
            id="demand-heading"
            eyebrow={demandMapCopy.eyebrow}
            title={demandMapCopy.title}
            lead={demandMapCopy.lead}
            className="max-w-3xl"
          />

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
            <div className="flex flex-col gap-8">
              <ul className="flex flex-col gap-6">
                {[
                  { id: "homes", Icon: HomeIcon, label: "Providing Homes", tone: "neutral" as const },
                  {
                    id: "support",
                    Icon: HeartHandshake,
                    label: "Delivering Support",
                    tone: "orange" as const,
                  },
                  { id: "lives", Icon: Users, label: "Transforming Lives", tone: "neutral" as const },
                ].map(({ id, Icon, label, tone }) => (
                  <li key={id} className="flex items-center gap-4">
                    <Icon
                      aria-hidden="true"
                      size={40}
                      strokeWidth={1.5}
                      className={tone === "orange" ? "text-orange-500" : "text-white"}
                    />
                    <span
                      className={cn(
                        "heading-tight text-[clamp(1.5rem,3vw,2.25rem)] font-bold",
                        tone === "orange" ? "text-orange-500" : "text-white",
                      )}
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <div>
                <Button variant="ghost" asChild>
                  <Link to="/contact" search={{ enquiry: "demo", type: "demo" }}>
                    {PRIMARY_LABEL}
                  </Link>
                </Button>
              </div>
            </div>

            <Reveal>
              <DemandMap />
            </Reveal>
          </div>

          <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="eyebrow text-slate-muted">{demandMapCopy.filtersLabel}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {demandMapCopy.filters.map((filter) => (
                  <li
                    key={filter}
                    className="inline-flex min-h-11 items-center rounded-full border border-teal-500/70 bg-teal-950/40 px-4 text-[13px] font-semibold text-teal-400"
                  >
                    {filter}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row lg:flex-col">
              {demandMapCopy.selectors.map((sel) => (
                <div key={sel.id} className="min-w-[16rem]">
                  <label htmlFor={`demand-${sel.id}`} className="eyebrow block text-slate-muted">
                    {sel.label}
                  </label>
                  <select
                    id={`demand-${sel.id}`}
                    defaultValue={sel.options[0]}
                    className="mt-2 min-h-11 w-full cursor-pointer rounded-panel border border-teal-600/60 bg-navy-800/60 px-4 font-heading text-sm font-semibold text-white transition-colors duration-200 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                  >
                    {sel.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-[12px] leading-snug text-slate-muted">{demandMapNote}</p>
        </div>
      </section>

      {/* 6 · Who we connect — condensed band */}
      <section aria-labelledby="connect-heading" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:py-12">
          <h2 id="connect-heading" className="eyebrow text-center text-teal-400">
            {connectCopy.eyebrow}
          </h2>
          <p className="mt-4 text-center font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-white">
            {connectCopy.title}
          </p>
          <p className="measure mx-auto mt-6 text-center text-sm leading-relaxed text-mist">
            {connectCopy.extras}
          </p>
          <p className="measure mx-auto mt-3 text-center text-sm leading-relaxed text-slate-muted">
            {connectCopy.close}
          </p>
        </div>
      </section>

      {/* 7 · Closing CTA */}
      <section aria-labelledby="closing-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-24 text-center sm:px-8">
          <h2
            id="closing-heading"
            className="heading-tight mx-auto max-w-4xl text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold text-white"
          >
            {closingCopy.title}
          </h2>
          <p className="measure mx-auto mt-6 text-base leading-relaxed text-mist">
            {closingCopy.lead}
          </p>
          <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {closingCopy.points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 font-heading text-sm font-semibold text-mist"
              >
                <Icons.Check aria-hidden="true" className="size-4 shrink-0 text-teal-500" />
                {point}
              </li>
            ))}
          </ul>
          <PreReleaseBadge className="mt-10 justify-center" />
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link to="/contact" search={{ enquiry: "demo", type: "demo" }}>
                {PRIMARY_LABEL}
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild withArrow={false}>
              <Link to="/contact" search={{ enquiry: "waitlist", type: "waitlist" }}>
                Register Your Interest
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                Become a Partner
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
