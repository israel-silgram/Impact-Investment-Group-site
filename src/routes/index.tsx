import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DemandMap } from "@/components/home/demand-map";
import { HomeHero } from "@/components/home/hero";
import { MissionSolution } from "@/components/home/mission-solution";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { LogoMarquee } from "@/components/ui/logo-marquee";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { Reveal } from "@/components/ui/reveal";
import { closingCopy, demandMapCopy, demandMapNote } from "@/content/home";
import { registerRoute } from "@/content/site";
import {
  commissioningCouncils,
  councilsDisclaimer,
  councilsEyebrow,
  dataSources,
  dataSourcesDisclaimer,
  dataSourcesEyebrow,
  openStreetMapAttribution,
  platformStats,
  platformStatsSource,
} from "@/content/trust";
import { cn } from "@/lib/utils";

/** The single orange action this page exists to get. Hero + closing band only. */
const PRIMARY_LABEL = registerRoute.label;

const icon = (name: string): LucideIcon =>
  (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle;

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

      {/* 2 · Our mission | The problem, flipping to Our solution */}
      <MissionSolution />

      {/* Commissioning councils — a band, not a numbered section. It sits
          between the mission panel and the demand map because that is the
          hinge in the argument: this is who is asking, immediately before the
          map showing where. navy-800 rather than the navy-900 beneath it, so
          it reads as its own strip rather than as the top of the map section.

          The disclaimer is not optional and is never shortened. A wall of
          protected council crests reads as endorsement unless it says
          otherwise, and it travels with the logos wherever they go. */}
      <section
        aria-labelledby="commissioning-councils"
        className="border-y border-navy-700 bg-navy-800 py-10"
      >
        <h2
          id="commissioning-councils"
          className="eyebrow px-5 text-center tracking-[0.14em] text-teal-400 sm:px-8"
        >
          {councilsEyebrow}
        </h2>

        <LogoMarquee items={commissioningCouncils} label={councilsEyebrow} className="mt-6" />

        <p className="mx-auto mt-6 max-w-[70ch] px-5 text-center text-[12px] leading-relaxed text-white/60 sm:px-8">
          {councilsDisclaimer}
        </p>
      </section>

      {/* 3 · Live UK demand map — stays dark, the glow needs it.

          Rebuilt to land inside one screen, like the hero and the mission
          panel. The map is what forced the restructure: its viewBox is
          620 × 760, so at the two-thirds column it used to sit in it rendered
          over 1000px tall on its own — more than a screen before anything else
          was counted. It is now width-capped at 420px, which puts it at ~515px
          tall, and everything else is arranged around that height rather than
          stacked beneath it.

          Section padding runs at 32/40 rather than the 96 in CLAUDE.md, and
          the icon rings are compact rather than brand-size. Both are the same
          deliberate exceptions the other two sections take to hit one screen.

          `human-insight.jpg` came off this section — there is no height left
          for a photograph once the map, the four statements and the compliance
          copy are in. Nothing else was cut: every statement, filter, dropdown,
          disclaimer and attribution survives. */}
      <section aria-labelledby="demand-heading" className="border-t border-navy-700 bg-navy-900">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8">
          {/* Heading left, the platform's own coverage right — the two used to
              be stacked, which cost 200px for information that reads fine side
              by side. */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[52ch]">
              <p className="eyebrow text-teal-400">{demandMapCopy.eyebrow}</p>
              <h2
                id="demand-heading"
                className="heading-tight mt-2 text-balance text-[clamp(1.5rem,2.8vw,1.875rem)] font-bold text-white"
              >
                {demandMapCopy.title}
              </h2>
              <p className="mt-2 text-[13px] leading-[1.6] text-mist">{demandMapCopy.lead}</p>
            </div>

            {/* A recorded snapshot, not a live feed — see content/trust.ts.
                The caption says so once beneath the row rather than three
                times, once per card, which is also more honest. */}
            <div className="shrink-0 lg:w-[31rem]">
              <ul className="grid grid-cols-3 gap-2.5">
                {platformStats.map((stat) => (
                  <li
                    key={stat.label}
                    className={cn(
                      "rounded-xl border p-3",
                      stat.emphasis ? "border-teal-600 bg-teal-600" : "border-navy-700 bg-navy-800",
                    )}
                  >
                    <span
                      className={cn(
                        "block font-heading text-[22px] font-extrabold leading-none tracking-[-0.02em]",
                        stat.emphasis ? "text-white" : "text-teal-400",
                      )}
                    >
                      {stat.value}
                    </span>
                    <span className="mt-1.5 block text-[12px] font-semibold leading-snug text-white">
                      {stat.label}
                    </span>
                    <span className="mt-1 block text-[10px] leading-snug text-white/60">
                      {stat.detail}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-teal-400">
                <Icons.Activity aria-hidden="true" className="size-3" />
                {platformStatsSource}
              </p>
            </div>
          </div>

          {/* ⚠️ THE MAP TAKES THE WHOLE 600px COLUMN, and the readout sits
              UNDER it (`readout="below"`). It previously asked for a mode that
              did not exist in demand-map.tsx, silently fell back to "beside",
              and the side panel ate 18rem of the column — leaving the map
              rendering at 240px. If you change this prop, check the union in
              demand-map.tsx actually contains the value. */}
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)]">
            <div className="order-2 flex flex-col gap-5 lg:order-1">
              <ul className="grid gap-4 sm:grid-cols-2">
                {demandMapCopy.statements.map((statement) => (
                  <li key={statement.heading} className="flex items-start gap-3">
                    <IconCircle
                      icon={icon(statement.icon)}
                      size="compact"
                      tone={statement.tone}
                      className="mt-0.5"
                    />
                    <div>
                      <h3 className="heading-tight text-[14px] font-bold text-white">
                        {statement.heading}
                      </h3>
                      <p className="mt-1 text-[12px] leading-[1.5] text-mist">{statement.body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div>
                <p className="eyebrow text-slate-muted">{demandMapCopy.filtersLabel}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {demandMapCopy.filters.map((filter) => (
                    <li
                      key={filter}
                      className="inline-flex min-h-9 items-center rounded-full border border-teal-500/70 bg-teal-950/40 px-3 text-[12px] font-semibold text-teal-400"
                    >
                      {filter}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {demandMapCopy.selectors.map((sel) => (
                  <div key={sel.id}>
                    <label htmlFor={`demand-${sel.id}`} className="eyebrow block text-slate-muted">
                      {sel.label}
                    </label>
                    <select
                      id={`demand-${sel.id}`}
                      defaultValue={sel.options[0]}
                      className="mt-1.5 min-h-11 w-full cursor-pointer rounded-panel border border-teal-600/60 bg-navy-800/60 px-3 font-heading text-[13px] font-semibold text-white transition-colors duration-200 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
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

              {/* Compliance copy, both of it. Client-approved disclaimer first,
                  then the ONS/commissioning note. Neither may be trimmed. */}
              <p className="text-[11px] leading-snug text-slate-muted">
                {demandMapCopy.selectorNote}
              </p>
              <p className="text-[11px] leading-snug text-slate-muted">{demandMapNote}</p>

              <div className="mt-auto">
                <Button variant="ghost" asChild>
                  <Link to={registerRoute.to} search={registerRoute.search}>
                    {PRIMARY_LABEL}
                  </Link>
                </Button>
              </div>
            </div>

            <Reveal className="order-1 lg:order-2">
              <DemandMap readout="below" />
            </Reveal>
          </div>

          {/* Provenance of the map's data, so it sits with what it describes.
              The eyebrow runs inline with the logos and the two attributions
              share one line — both saved a row each, and every word of them is
              still here. ODbL requires the OpenStreetMap credit wherever its
              data is used. */}
          <div className="mt-5 border-t border-navy-700 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <h3 className="eyebrow tracking-[0.14em] text-teal-400">{dataSourcesEyebrow}</h3>
              <ul className="flex flex-wrap items-center justify-center gap-3.5">
                {dataSources.map((source) => (
                  <li
                    key={source.id}
                    className="inline-flex h-14 items-center justify-center rounded-lg bg-white px-4 py-2"
                  >
                    <img
                      src={source.logo}
                      alt={`${source.name} — ${source.blurb}`}
                      width={source.artwork.w}
                      height={source.artwork.h}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-auto max-w-[10.5rem] object-contain"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-2.5 text-center text-[11px] leading-relaxed text-slate-muted">
              {dataSourcesDisclaimer} · {openStreetMapAttribution} ·{" "}
              <Link
                to="/about"
                className="font-semibold text-teal-400 transition-colors duration-200 hover:text-white"
              >
                Where our data comes from
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 4 · Closing CTA — A CARD ON THE FOOTER'S GROUND, not a section.
          It used to be a cream band, which made the bottom of the page read as
          two separate blocks stacked on a third. It now sits on navy-950 — the
          same ground the footer uses — with no rule between them, so the close
          and the footer read as one continuous dark block with the CTA as a
          card floating on it.

          ⚠️ THAT MEANS THIS IS NO LONGER `.section-light`. Every colour below
          is written in the DARK idiom (text-white / text-mist). If this is ever
          moved back onto cream, they all have to flip back — `.section-light`
          is what used to do that automatically.

          Halved (~720px → ~370px) without dropping a word. Three changes did
          it: the headline steps from 56px to 34px on a 26ch measure so it
          still breaks over two lines; the vision statement sits on a 40rem
          measure at 15px so it fits two lines instead of three; and the four
          points run as one centred row of 32px rings rather than a two-column
          block of 60px ones, which alone was 176px of the old height. Padding
          drops from 96px to 40/48px. Everything stays centred on one axis. */}
      <section aria-labelledby="closing-heading" className="bg-navy-950">
        <div className="mx-auto w-full max-w-[1200px] px-5 pb-10 pt-12 sm:px-8">
          <div className="rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800 px-6 py-9 text-center sm:px-10">
          <h2
            id="closing-heading"
            className="heading-tight mx-auto max-w-[26ch] text-balance text-[clamp(1.5rem,3vw,2.125rem)] font-extrabold tracking-[-0.02em] text-white"
          >
            {closingCopy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-[40rem] text-pretty text-[15px] leading-relaxed text-mist">
            {closingCopy.lead}
          </p>
          {/* One centred row. The rings are xs (16px icon in a 32px circle) so
              four points cost one line instead of four rows. */}
          <ul className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {closingCopy.points.map((point) => (
              <li key={point.text} className="flex items-center gap-2.5">
                <IconCircle icon={icon(point.icon)} size="xs" tone={point.tone} />
                <span className="font-heading text-[13px] font-semibold text-white">
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
          <PreReleaseBadge className="mt-6 justify-center" />
          {/* size="default" not "lg": 44px instead of 52px. The label stays at
              16px/600, which is the floor white-on-orange-600 needs to pass. */}
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button variant="primary" asChild>
              <Link to={registerRoute.to} search={registerRoute.search}>
                {PRIMARY_LABEL}
              </Link>
            </Button>
            <Button variant="secondary" asChild withArrow={false} className="border-teal-600">
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                Become a Partner
              </Link>
            </Button>
          </div>
          </div>
        </div>
      </section>
    </>
  );
}
