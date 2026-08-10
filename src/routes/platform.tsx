import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { registerRoute } from "@/content/site";
import {
  aiTeamNote,
  capitalAtRisk,
  compareHeading,
  compareUpdated,
  demandFigures,
  ourBuild,
  ourBuildHeading,
  ourBuildLabel,
  ourBuildNote,
  sectorRecord,
  sectorRecordHeading,
  sectorRecordMark,
  servicesClose,
  servicesHero,
  steps,
  toolsEyebrow,
  toolsHeading,
  toolsLead,
  workflow,
  workflowFooter,
  trustSource,
  type Seg,
} from "@/content/services";

/**
 * /platform — "Our Services".
 *
 * Rebuilt from the old production platform page, then cut. That page ran a
 * paragraph per step and a paragraph per tool; this runs a line each, with the
 * words worth seeing carried in bold ink or bold orange.
 *
 *   1 · Find it, price it, prove it   cream   hero + the product screenshot
 *   2 · Four steps, nothing hidden    navy    the journey
 *   3 · Find it. Price it. Prove it.   cream   Petra, Peter, Pippa
 *   4 · Built differently             navy    trust, demand, integration
 *   5 · Every figure, sourced         cream   close
 *
 * Same construction as /about: everything is written in the dark idiom and the
 * cream bands carry `.section-light`, which re-points it. `panel` is already a
 * navy card on navy and a white card on cream, so no card is told which ground
 * it is on. The only conditional is the accent orange — `.section-light`
 * rewrites orange-500 to navy ink, and orange-700, the one it lets through, is
 * 4.1:1 on cream and needs large text to pass, which is why emphasised lines
 * are set at 19px semibold.
 */

export const Route = createFileRoute("/platform")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Our Services — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Find it, price it, prove it. We source UK residential property, price every home against named public data, and follow it into managed supported housing.",
      },
      { property: "og:title", content: "Our Services — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "The Property Finder, the Demand Map and an AI team that finds, prices and proves every home — one workflow, every figure sourced.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/platform" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/platform" }],
  }),
});

const ACCENT = {
  teal: { text: "text-teal-400", bar: "bg-teal-400", disc: "bg-teal-400 text-navy-900" },
  orange: { text: "text-orange-500", bar: "bg-orange-500", disc: "bg-orange-500 text-white" },
  white: { text: "text-white", bar: "bg-white/70", disc: "bg-white text-navy-900" },
} as const;

type Accent = keyof typeof ACCENT;

function Rich({ parts, tone }: { parts: Seg[]; tone: "rust" | "teal" }) {
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <strong
            key={i}
            className={cn(
              "font-bold",
              part.em === "accent"
                ? tone === "rust"
                  ? "text-orange-700"
                  : "text-orange-500"
                : "text-white",
            )}
          >
            {part.t}
          </strong>
        ),
      )}
    </>
  );
}

function Band({
  id,
  light,
  children,
}: {
  id: string;
  light?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("border-t border-navy-700", light ? "section-light" : "bg-navy-900")}
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 lg:py-14">{children}</div>
    </section>
  );
}

function Head({
  eyebrow,
  title,
  id,
  tone = "teal",
  hero,
  centre,
}: {
  eyebrow: string;
  title: string;
  id?: string;
  tone?: "rust" | "teal";
  hero?: boolean;
  centre?: boolean;
}) {
  const Tag = hero ? "h1" : "h2";
  return (
    <div className={centre ? "text-center" : undefined}>
      <p
        className={cn(
          "eyebrow tracking-[0.14em]",
          tone === "rust" ? "text-orange-700" : "text-teal-400",
        )}
      >
        {eyebrow}
      </p>
      <Tag
        id={id}
        className={cn(
          "heading-tight mt-2.5 text-balance font-extrabold tracking-[-0.02em] text-white",
          hero ? "text-[clamp(2rem,4.6vw,3.25rem)]" : "text-[clamp(1.5rem,2.8vw,2rem)]",
        )}
      >
        {title}
      </Tag>
    </div>
  );
}

function Summary({
  parts,
  tone,
  centre,
}: {
  parts: Seg[];
  tone: "rust" | "teal";
  centre?: boolean;
}) {
  return (
    <p
      className={cn(
        "mt-4 text-[19px] font-semibold leading-[1.5] text-mist",
        centre ? "mx-auto max-w-[64ch] text-center" : "max-w-[62ch]",
      )}
    >
      <Rich parts={parts} tone={tone} />
    </p>
  );
}

function ServicesPage() {
  return (
    <main>
      {/* ── 1 · Hero + the product ── cream ──────────────────────────────── */}
      <Band id="services-heading" light>
        <div className="mx-auto max-w-[820px] text-center">
          <Head
            eyebrow={servicesHero.eyebrow}
            title={servicesHero.title}
            id="services-heading"
            tone="rust"
            hero
            centre
          />
          <p className="mt-3 text-[17px] font-semibold text-white">{servicesHero.lead}</p>
          <Summary parts={servicesHero.summary} tone="rust" centre />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" asChild>
              <Link to={registerRoute.to} search={registerRoute.search}>
                {servicesClose.cta}
              </Link>
            </Button>
            <Button variant="secondary" asChild withArrow={false}>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
          <p className="mt-3 text-[12.5px] text-slate-muted">{servicesClose.ctaNote}</p>
        </div>

        {/* The product itself, captioned. The caption is the honest bit: this
            is real UI running on illustrative review data, and saying so is
            what stops a reader taking the figures as live listings. */}
        <Reveal className="mt-10">
          <figure className="panel overflow-hidden">
            <img
              src={servicesHero.image.src}
              alt={servicesHero.image.alt}
              width={2241}
              height={1207}
              className="w-full"
            />
            <figcaption className="px-4 py-2.5 text-center text-[12px] text-slate-muted">
              {servicesHero.image.caption}
            </figcaption>
          </figure>
        </Reveal>
      </Band>

      {/* ── 2 · Four steps ── navy ───────────────────────────────────────── */}
      <Band id="steps-heading">
        <Head eyebrow="How it works" title="Four steps, nothing hidden." id="steps-heading" />
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.id} index={i} as="li">
              <div className="panel relative flex h-full flex-col overflow-hidden p-5 pt-6">
                <span
                  aria-hidden="true"
                  className={cn("absolute inset-x-0 top-0 h-[3px]", ACCENT[step.accent as Accent].bar)}
                />
                {/* The supplied artwork, keyed off its grey ground so it sits
                    on the navy rather than in a grey box. Decorative — the step
                    name and body carry the meaning — so it is empty-alt. */}
                <img
                  src={step.image}
                  alt=""
                  width={360}
                  height={360}
                  loading="lazy"
                  decoding="async"
                  className="mx-auto h-24 w-auto"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 grid size-9 place-items-center rounded-full font-heading text-[15px] font-extrabold",
                    ACCENT[step.accent as Accent].disc,
                  )}
                >
                  {i + 1}
                </span>
                <h3 className="mt-3.5 font-heading text-[16px] font-bold text-white">
                  {step.name}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Band>

      {/*
       * ── 3 · Find it. Price it. Prove it. ── cream ──────────────────────
       *
       * This was three tools in a row with three analysts nested inside the
       * third one — six items, and a reader had to work out the relationship
       * before any of it meant anything. Petra, Peter and Pippa ARE find,
       * price and prove, so the two lists became one: three steps, three
       * characters, and the tool each works in on a chip.
       *
       * THE PODIUM. Each character stands on top of their card and breaks out
       * of it. That overlap is the whole idea — three cards in a row is what
       * the rest of the site already does, and the break-out is what stops
       * this reading as another card row. It is why the card carries 104px of
       * top padding and the figure is absolutely positioned above it.
       *
       * The ghost numeral behind the claim is 4.5% navy: a counting cue at the
       * edge of visible, not a design element. It sits BEHIND the text, so it
       * never has to meet a contrast ratio.
       *
       * Audience note, from Callum: most people reading this are 35–60 and on
       * a laptop. That is why the claim is 24px, the body 14px and the measure
       * short — do not shrink any of it to fit something else in.
       */}
      <Band id="tools-heading" light>
        <Head eyebrow={toolsEyebrow} title={toolsHeading} id="tools-heading" tone="rust" />
        <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-mist">{toolsLead}</p>

        <ol className="mt-20 grid gap-6 md:grid-cols-3 md:gap-7">
          {workflow.map((step, i) => {
            const chip =
              step.accent === "orange"
                ? "bg-orange-600/12 text-orange-700"
                : "bg-teal-600/12 text-teal-600";
            return (
              <Reveal key={step.id} index={i} as="li" className="h-full">
                <div className="relative h-full pt-[104px]">
                  {/* Artwork only. `alt=""` — the claim underneath says the
                      same thing, and "cartoon of an orange-haired woman with a
                      magnifying glass" helps nobody. */}
                  <img
                    src={step.portrait}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    width={347}
                    height={520}
                    className="absolute left-1/2 top-0 z-2 h-[188px] w-auto -translate-x-1/2 drop-shadow-[0_14px_26px_rgba(0,17,43,0.22)]"
                  />
                  <div className="panel relative flex h-full flex-col overflow-hidden px-5 pb-6 pt-[92px] text-center">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-[84px] -translate-x-1/2 font-heading text-[86px] font-extrabold leading-none text-navy-900/5"
                    >
                      {i + 1}
                    </span>
                    <h3 className="relative font-heading text-[clamp(1.25rem,2vw,1.5rem)] font-extrabold tracking-[-0.015em] text-navy-900">
                      {step.claim}
                    </h3>
                    <p className="relative mt-2.5 pb-4 text-[14px] leading-relaxed text-slate-ink">
                      {step.body}
                    </p>
                    <p
                      className={cn(
                        "relative mx-auto mt-auto w-fit rounded-full px-3 py-1.5 font-heading text-[11px] font-extrabold uppercase tracking-[0.1em]",
                        chip,
                      )}
                    >
                      {step.chip}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>

        {/* The Demand Map is a tool, not one of the three — see the note in
            content/services.ts for why it is named here and not on a chip. */}
        <p className="mx-auto mt-9 max-w-[72ch] text-center text-[14px] leading-relaxed text-slate-ink">
          {workflowFooter}
        </p>
        <p className="mx-auto mt-3 max-w-[72ch] text-center text-[12px] leading-relaxed text-slate-muted">
          {aiTeamNote}
        </p>
      </Band>

      {/*
       * ── 4 · Built differently ── navy ─────────────────────────────────
       *
       * A CASE FILE AND A SPEC SHEET, not two cards with a "vs" between them.
       * The two sides are arguing different kinds of thing and now they LOOK
       * like different kinds of thing: the left is a public record — ruled
       * paper, numbered 01–04, mono figures, a bordered marker in the corner;
       * the right is a specification — ticks, larger claims, teal. A reader
       * gets the point before reading a word of it.
       *
       * ⚠️ THE MARKER IS NOT A ROTATED STAMP. The mock-up tilted it like a
       * rubber stamp and it was straightened on purpose — see the note on
       * `sectorRecordMark` in content/services.ts. Do not tilt it back.
       *
       * ⚠️ PROVENANCE IS THE WHOLE POINT OF THE LAYOUT. Left = public record,
       * and `trustSource` names the three regulators. Right = OUR OWN
       * ANALYSIS, labelled as such in the panel header. Those two labels are
       * what keep this a comparison rather than an insinuation. Neither may be
       * dropped, and nothing may move from one panel to the other.
       *
       * The ruled paper is a repeating-linear-gradient at ~1% white, which is
       * texture rather than contrast — no text sits on a band edge hard enough
       * to matter, and it disappears entirely under forced-colours mode.
       */}
      <Band id="compare-heading">
        <Head eyebrow="How we compare" title={compareHeading} id="compare-heading" />

        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6">
          {/* ── The case file ─────────────────────────────────────────── */}
          <Reveal>
            <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-orange-600/30 p-5 sm:p-6">
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(180deg,transparent,transparent_29px,rgba(255,255,255,0.028)_29px,rgba(255,255,255,0.028)_58px)] bg-navy-800/60"
              />
              <div className="flex items-start justify-between gap-4">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-orange-500">
                  {sectorRecordHeading}
                </p>
                <span className="shrink-0 rounded-[4px] border border-orange-600/35 px-2.5 py-1 font-heading text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-orange-500/80">
                  {sectorRecordMark}
                </span>
              </div>

              <ol className="mt-4">
                {sectorRecord.map((item, i) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[30px_1fr] gap-3 border-b border-dashed border-orange-600/25 py-3 last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="pt-0.5 font-mono text-[11px] text-orange-500"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-heading text-[15px] font-bold text-white">{item.name}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-mist">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Attribution. Travels with the findings, always. */}
              <p className="mt-4 text-[11px] leading-relaxed text-slate-muted">{trustSource}</p>
            </div>
          </Reveal>

          {/* ── The spec sheet ────────────────────────────────────────── */}
          <Reveal index={1}>
            <div className="rounded-[var(--radius-panel)] border border-teal-600/30 bg-[color-mix(in_oklab,var(--color-teal-600)_10%,var(--color-navy-800))] p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="eyebrow text-teal-400">{ourBuildHeading}</p>
                {/* Not decoration — this is what marks the panel as our claim
                    rather than public record. */}
                <p className="shrink-0 font-heading text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-muted">
                  {ourBuildLabel}
                </p>
              </div>

              <ul className="mt-3">
                {ourBuild.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 border-b border-teal-600/20 py-3.5 last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-full bg-teal-600"
                    >
                      <Icons.Check className="size-3 text-white" strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="font-heading text-[17px] font-extrabold tracking-[-0.01em] text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-mist">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[11.5px] leading-relaxed text-slate-muted">{ourBuildNote}</p>
            </div>
          </Reveal>
        </div>

        {/* The need, in three figures. One accent each, each keeping its
            publisher — a figure here without its source does not ship. */}
        <p className="eyebrow mt-10 text-teal-400">Demand-led · the need is public</p>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {demandFigures.map((figure, i) => {
            const accent = ACCENT[figure.accent as Accent];
            return (
              <Reveal key={figure.id} index={i} as="li">
                <div className="panel relative flex h-full flex-col overflow-hidden p-5 pt-6">
                  <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-[3px]", accent.bar)} />
                  <p
                    className={cn(
                      "font-heading text-[clamp(1.875rem,3vw,2.375rem)] font-extrabold leading-none tracking-[-0.02em]",
                      accent.text,
                    )}
                  >
                    {figure.value}
                  </p>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist">{figure.label}</p>
                  <p className="mt-auto pt-3 text-[11px] font-semibold text-slate-muted">
                    {figure.source}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] text-slate-muted">{compareUpdated}</p>
      </Band>

      {/* ── 5 · Close ── cream ───────────────────────────────────────────── */}
    </main>
  );
}
