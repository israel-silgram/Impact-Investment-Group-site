import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { registerRoute } from "@/content/site";
import {
  aiTeam,
  aiTeamNote,
  capitalAtRisk,
  compareHeading,
  compareNote,
  compareUpdated,
  demandFigures,
  ourBuild,
  ourBuildHeading,
  ourBuildLabel,
  ourBuildNote,
  sectorRecord,
  sectorRecordHeading,
  servicesClose,
  servicesHero,
  steps,
  tools,
  toolsHeading,
  toolsLead,
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
 *   3 · Three tools, one workflow     cream   Finder, Map, AI team
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

const icon = (name: string): LucideIcon =>
  (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle;

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

      {/* ── 3 · Three tools ── cream ─────────────────────────────────────── */}
      <Band id="tools-heading" light>
        <Head eyebrow="The platform, live" title={toolsHeading} id="tools-heading" tone="rust" />
        <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-mist">{toolsLead}</p>

        {/* ── The roadmap ───────────────────────────────────────────────────
            One track, three stops, rather than six boxes in two rows. The AI
            team is a stop on the route and the three analysts live inside it —
            that is what removed the second row and stopped the section reading
            as a wall of cards.

            This band is always cream, so unlike the rest of the page its
            colours are written for the light ground directly. Two things make
            that safe: the discs are FILLS, which have no text-contrast floor,
            and `.section-light` exempts `svg` from its orange guard, so a
            white glyph on an orange-600 disc survives exactly as drawn. */}
        <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {/* The track. Runs behind the discs, teal into orange into navy, so
              the eye is pulled left to right before it reads a word. Hidden
              under md, where the stops stack and a line would go nowhere. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-[16%] top-7 hidden h-[3px] rounded-full bg-gradient-to-r from-teal-600 via-orange-600 to-navy-900 opacity-30 md:block"
          />

          {tools.map((stop, i) => {
            const Icon = icon(stop.icon);
            return (
              <li key={stop.id} className="relative flex flex-col items-center text-center">
                {/* The stop marker: a filled disc on the track, with the step
                    number riding its shoulder. */}
                <div className="relative z-10">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-14 place-items-center rounded-full shadow-[0_8px_20px_-8px_rgba(0,17,43,0.45)] ring-4 ring-[var(--color-mist-bg)]",
                      stop.disc,
                    )}
                  >
                    <Icon className="size-6 text-white" strokeWidth={1.6} />
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-navy-900)_15%,transparent)] bg-white font-heading text-[11px] font-extrabold text-navy-900"
                  >
                    {i + 1}
                  </span>
                </div>

                <h3 className="mt-5 font-heading text-[17px] font-bold text-navy-900">
                  {stop.name}
                </h3>
                <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-slate-ink">
                  {stop.body}
                </p>

                {/* The third stop opens out into the three analysts. */}
                {stop.id === "ai" ? (
                  <ul className="mt-4 flex w-full flex-col gap-1.5">
                    {aiTeam.map((member) => (
                      <li
                        key={member.id}
                        className="flex items-baseline justify-center gap-2 rounded-lg bg-cream-card px-3 py-2 text-[13px]"
                      >
                        <span className="font-heading font-bold text-navy-900">{member.name}</span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-teal-600">
                          {member.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-center text-[12px] leading-relaxed text-slate-ink">
          {aiTeamNote}
        </p>
      </Band>

      {/* ── 4 · Built differently ── navy ────────────────────────────────
          A contrast, laid out as one: what happened to the sector on the left,
          how this is built on the right, a VS between them. That is what the
          section has always been arguing — it was just being argued in two
          unrelated cards with a paragraph each.

          Integration folded into the right column as its third line, which is
          what let a whole card disappear. */}
      <Band id="compare-heading">
        <Head eyebrow="How we compare" title={compareHeading} id="compare-heading" />
        <p className="mt-3 text-[15px] leading-relaxed text-mist">{compareNote}</p>

        <div className="relative mt-8 grid gap-4 lg:grid-cols-2 lg:gap-14">
          {/* The VS badge sits on the gutter between the two columns. */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 z-10 hidden size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-navy-700 bg-navy-800 font-heading text-[12px] font-extrabold uppercase tracking-[0.08em] text-slate-muted lg:grid"
          >
            vs
          </span>

          {/* Their record — orange marks, because this is the harm side. */}
          <Reveal>
            <div className="flex h-full flex-col rounded-[var(--radius-panel)] border border-orange-600/30 bg-[color-mix(in_oklab,var(--color-orange-600)_8%,var(--color-navy-800))] p-5">
              <p className="eyebrow text-orange-500">{sectorRecordHeading}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {sectorRecord.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <Icons.TriangleAlert
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-orange-500"
                      strokeWidth={1.8}
                    />
                    <p className="text-[13.5px] leading-relaxed text-mist">
                      <strong className="font-bold text-white">{item.name}</strong>
                      {" — "}
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
              {/* Attribution. Travels with the findings, always. */}
              <p className="mt-auto pt-4 text-[11px] leading-relaxed text-slate-muted">
                {trustSource}
              </p>
            </div>
          </Reveal>

          {/* Ours — teal marks. */}
          <Reveal index={1}>
            <div className="flex h-full flex-col rounded-[var(--radius-panel)] border border-teal-600/40 bg-[color-mix(in_oklab,var(--color-teal-600)_10%,var(--color-navy-800))] p-5">
              <p className="eyebrow text-teal-400">{ourBuildHeading}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {ourBuild.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <Icons.ShieldCheck
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-teal-400"
                      strokeWidth={1.8}
                    />
                    <p className="text-[13.5px] leading-relaxed text-mist">
                      <strong className="font-bold text-white">{item.title}</strong>
                      {" — "}
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11.5px] leading-relaxed text-slate-muted">{ourBuildNote}</p>
              <p className="mt-auto pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-muted">
                {ourBuildLabel}
              </p>
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
      <Band id="services-cta" light>
        <Reveal className="text-center">
          <h2
            id="services-cta"
            className="heading-tight mx-auto max-w-[24ch] text-balance text-[clamp(1.625rem,3.2vw,2.25rem)] font-extrabold text-white"
          >
            {servicesClose.title}
          </h2>
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
          <p className="mt-3 text-[12.5px] text-slate-ink">{servicesClose.ctaNote}</p>
          {/* Capital at risk, verbatim. Never shortened to fit. */}
          <p className="mx-auto mt-8 max-w-[104ch] text-[11.5px] leading-relaxed text-slate-ink">
            {capitalAtRisk}
          </p>
        </Reveal>
      </Band>
    </main>
  );
}
