import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CouncilPanel } from "@/components/home/council-panel";
import { DemandMap } from "@/components/home/demand-map";
import { HomeHero } from "@/components/home/hero";
import { MissionSolution } from "@/components/home/mission-solution";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { Reveal } from "@/components/ui/reveal";
import { closingCopy, demandMapCopy } from "@/content/home";
import { registerRoute } from "@/content/site";
import {
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
          map showing where.

          Now an anchored panel rather than a loose strip. The count, the
          "of ~296" denominator and the disclaimer live in a fixed label block
          inside the component, so the compliance text is structural instead of
          a caption that a later layout pass would trim. See CouncilPanel. */}
      <CouncilPanel />

      {/* 3 · Live UK demand map — stays dark, the glow needs it.

          Option A of four: the map moves right and roughly doubles, and
          everything that used to sit under the statements comes out.

          What was removed was dead UI, not features. The ten category chips
          were <li> elements with no handler and were never passed to
          <DemandMap visibleIds>; both dropdowns carried options and no
          onChange. Hover, click, selection and the readout all live inside
          DemandMap and are untouched by this.

          Two disclaimers were under there. The commissioning-briefs one was a
          straight duplicate of what CouncilPanel now states in full beside the
          crests, so it is deleted — see the note in content/home.ts. The
          illustrative-purposes one is NOT tied to the dropdowns: the map still
          shows illustrative data, so it survives as one line behind an info
          icon in the left column.

          The map column is capped in WIDTH because the SVG scales off its
          620 × 760 viewBox — width is the only thing that controls its height.
          560px puts it at ~686px tall, which is roughly the height of the left
          column beside it, so the two balance. */}
      <section aria-labelledby="demand-heading" className="border-t border-navy-700 bg-navy-900">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8">
          <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:items-stretch">
            <div className="flex min-w-0 flex-col">
              <p className="eyebrow text-teal-400">{demandMapCopy.eyebrow}</p>
              <h2
                id="demand-heading"
                className="heading-tight mt-2 max-w-[20ch] text-balance text-[clamp(1.5rem,2.8vw,2rem)] font-bold text-white"
              >
                {demandMapCopy.title}
              </h2>
              <p className="mt-2.5 max-w-[52ch] text-[13.5px] leading-[1.6] text-mist">
                {demandMapCopy.lead}
              </p>

              {/* A recorded snapshot, not a live feed — see content/trust.ts.
                  The caption says so once beneath the row rather than three
                  times, once per card, which is also more honest. */}
              <ul className="mt-6 grid grid-cols-3 gap-2.5">
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
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-teal-400">
                <Icons.Activity aria-hidden="true" className="size-3" />
                {platformStatsSource}
              </p>

              {/* Client-approved copy, verbatim. */}
              <ul className="mt-7 grid gap-4">
                {demandMapCopy.statements.map((statement) => (
                  <li key={statement.heading} className="flex items-start gap-3">
                    <IconCircle
                      icon={icon(statement.icon)}
                      size="compact"
                      tone={statement.tone}
                      className="mt-0.5"
                    />
                    <div className="min-w-0">
                      <h3 className="heading-tight text-[14.5px] font-bold text-white">
                        {statement.heading}
                      </h3>
                      <p className="mt-1 max-w-[62ch] text-[12.5px] leading-[1.55] text-mist">
                        {statement.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* The action sits directly under the statements rather than at
                  the foot of the column. It follows on from them — read what
                  the platform does, then go and look at it — and at the bottom
                  it was sharing a corner with the compliance note, which made
                  the note look like the button's small print.

                  It also no longer points at registration. "Our Services" is
                  /platform in primaryNav (content/site.ts), so this is the
                  same destination the nav calls Our Services.

                  ⚠️ That means this section now has no registration CTA at
                  all. The hero role cards and the closing band still do, so the
                  page is not without one — but if this section was pulling its
                  weight on sign-ups, this is the change that stops it. */}
              <div className="mt-7">
                <Button variant="primary" asChild>
                  <Link to="/platform">View Our Platform</Link>
                </Button>
              </div>

              {/* mt-auto keeps the note at the foot of the column, level with
                  the bottom of the map rather than floating up the middle. */}
              <p className="mt-auto flex items-start gap-2 pt-7 text-[11px] leading-[1.55] text-slate-muted">
                <Icons.Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
                {demandMapCopy.illustrativeNote}
              </p>
            </div>

            <Reveal>
              <DemandMap readout="below" />
            </Reveal>
          </div>

          {/* Provenance of the map's data, so it sits with what it describes.
              The eyebrow runs inline with the logos and the two attributions
              share one line — both saved a row each, and every word of them is
              still here. ODbL requires the OpenStreetMap credit wherever its
              data is used. */}
          <div className="mt-8 border-t border-navy-700 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <h3 className="eyebrow tracking-[0.14em] text-teal-400">{dataSourcesEyebrow}</h3>
              <ul className="flex flex-wrap items-center justify-center gap-3">
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

      {/* 4 · Closing CTA — cream. With Who We Connect gone the page alternates
          cleanly again: navy hero, cream mission/solution, navy demand map,
          cream close, navy footer. The orange button is a fill, not text, so it
          survives on the light ground; everything else re-points to the cream
          palette.

          Halved (~720px → ~370px) without dropping a word. Three changes did
          it: the headline steps from 56px to 34px on a 26ch measure so it
          still breaks over two lines; the vision statement sits on a 40rem
          measure at 15px so it fits two lines instead of three; and the four
          points run as one centred row of 32px rings rather than a two-column
          block of 60px ones, which alone was 176px of the old height. Padding
          drops from 96px to 40/48px. Everything stays centred on one axis. */}
      <section aria-labelledby="closing-heading" className="section-light">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-12 text-center sm:px-8">
          <h2
            id="closing-heading"
            className="heading-tight mx-auto max-w-[26ch] text-balance text-[clamp(1.5rem,3vw,2.125rem)] font-extrabold tracking-[-0.02em] text-white"
          >
            {closingCopy.title}
          </h2>
          {/* One centred row. The rings are xs (16px icon in a 32px circle) so
              four points cost one line instead of four rows. */}
          <ul className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {closingCopy.points.map((point) => (
              <li key={point.text} className="flex items-center gap-2.5">
                <IconCircle icon={icon(point.icon)} size="xs" tone={point.tone} />
                <span className="font-heading text-[13px] font-semibold text-white">
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
          <PreReleaseBadge className="mt-7 justify-center" />
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
      </section>
    </>
  );
}
