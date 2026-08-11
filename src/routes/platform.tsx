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
  compareUpdated,
  demandFigures,
  differenceHeading,
  differenceLead,
  differenceStory,
  leaseComparison,
  servicesClose,
  servicesHero,
  steps,
  sustainabilityPrinciples,
  toolsEyebrow,
  toolsHeading,
  toolsLead,
  workflow,
  workflowFooter,
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

const DIFFERENCE_VISUAL = {
  past: { value: "25", unit: "years fixed", tone: "text-orange-500" },
  lessons: { value: "REVIEW", unit: "before risk rolls forward", tone: "text-white" },
  solution: { value: "5", unit: "year review window", tone: "text-teal-400" },
} as const;

function DifferenceStory() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeChapter = differenceStory[activeIndex]!;
  const activeVisual = DIFFERENCE_VISUAL[activeChapter.id as keyof typeof DIFFERENCE_VISUAL];
  const activeAccent = ACCENT[activeChapter.tone as Accent];

  return (
    <>
      <Head eyebrow="How we differ" title={differenceHeading} id="compare-heading" />
      <p className="mt-4 max-w-[66ch] text-[16.5px] leading-relaxed text-mist">
        {differenceLead}
      </p>

      <div className="relative mt-8 overflow-hidden rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/55 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.8)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:36px_36px]"
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -right-28 top-1/2 size-[430px] -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700",
            activeChapter.tone === "orange"
              ? "bg-orange-500/15"
              : activeChapter.tone === "teal"
                ? "bg-teal-400/18"
                : "bg-white/8",
          )}
        />

        <div className="relative grid lg:grid-cols-[240px_minmax(0,1fr)]">
          <div
            className="border-b border-navy-700 p-4 sm:p-5 lg:border-b-0 lg:border-r"
            role="tablist"
            aria-label="How we differ storyline"
          >
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-muted">
              Choose a chapter
            </p>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {differenceStory.map((chapter, i) => {
                const selected = i === activeIndex;
                const accent = ACCENT[chapter.tone as Accent];
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="difference-story-panel"
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "group flex min-h-[64px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-300",
                      selected
                        ? "translate-x-0 border-teal-600/45 bg-navy-700/80 shadow-[0_10px_30px_-18px_rgba(36,210,195,0.7)] lg:translate-x-1"
                        : "border-transparent bg-transparent hover:border-navy-700 hover:bg-navy-800",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-all duration-300",
                        selected
                          ? cn(accent.disc, "border-transparent scale-105")
                          : "border-navy-700 text-slate-muted group-hover:text-white",
                      )}
                    >
                      {chapter.number}
                    </span>
                    <span>
                      <span className={cn("block text-[10px] font-bold uppercase tracking-[0.11em]", selected ? accent.text : "text-slate-muted")}>
                        {chapter.eyebrow}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-mist">
                        {i === 0 ? "What failed" : i === 1 ? "What we learnt" : "What we built"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div id="difference-story-panel" role="tabpanel" className="relative min-h-[500px] p-5 sm:p-8 lg:min-h-[440px] lg:p-10">
            <div key={activeChapter.id} className="[animation:rise-in_520ms_var(--ease-out-soft)_both]">
              <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.78fr)] lg:items-center">
                <div>
                  <p className={cn("eyebrow", activeAccent.text)}>{activeChapter.eyebrow}</p>
                  <h3 className="heading-tight mt-3 max-w-[19ch] font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold tracking-[-0.025em] text-white">
                    {activeChapter.title}
                  </h3>
                  <p className="mt-4 max-w-[54ch] text-[14px] leading-relaxed text-mist">
                    {activeChapter.body}
                  </p>
                  <ul className="mt-6 grid gap-2.5">
                    {activeChapter.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[13px] leading-relaxed text-mist">
                        <span aria-hidden="true" className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", activeAccent.bar)} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative grid min-h-[220px] place-items-center overflow-hidden rounded-2xl border border-navy-700 bg-navy-900/70 p-5 text-center sm:min-h-[260px]">
                  <span aria-hidden="true" className="absolute inset-5 rounded-full border border-dashed border-navy-700 [animation:spin_28s_linear_infinite] motion-reduce:animate-none" />
                  <span aria-hidden="true" className={cn("absolute size-[145px] rounded-full opacity-20 blur-2xl", activeAccent.bar)} />
                  <div className="relative">
                    <p className={cn("font-heading font-extrabold leading-[0.78] tracking-[-0.075em]", activeVisual.tone, activeChapter.id === "lessons" ? "text-[clamp(2.5rem,7vw,4.5rem)]" : "text-[clamp(6rem,14vw,9rem)]")}>
                      {activeVisual.value}
                    </p>
                    <p className="mt-5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-white">
                      {activeVisual.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-navy-700 pt-4 text-[11px] text-slate-muted">
              <span className="font-semibold text-orange-500">{leaseComparison[0]!.term} · fixed legacy commitment</span>
              <Icons.ArrowRight aria-hidden="true" className="size-3.5 text-white" />
              <span className="font-semibold text-teal-400">{leaseComparison[1]!.term} · planned review window</span>
            </div>
          </div>
        </div>

        <ul className="relative grid border-t border-navy-700 sm:grid-cols-3">
          {sustainabilityPrinciples.map((principle, i) => (
            <li key={principle.id} className={cn("px-5 py-4", i > 0 && "border-t border-navy-700 sm:border-l sm:border-t-0")}>
              <p className="font-heading text-[13px] font-extrabold text-white">{principle.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-muted">{principle.detail}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="logo-marquee mt-7 border-y border-navy-700 py-1" aria-label="Sourced housing demand figures">
        <div className="logo-marquee__track">
          {[...demandFigures, ...demandFigures].map((figure, i) => (
            <span key={`${figure.id}-${i}`} data-clone={i >= demandFigures.length ? "true" : undefined} className="inline-flex items-baseline gap-2 px-3">
              <strong className={cn("font-heading text-[22px] font-extrabold", ACCENT[figure.accent as Accent].text)}>{figure.value}</strong>
              <span className="text-[12px] text-mist">{figure.label}</span>
              <span className="text-[10px] text-slate-muted">{figure.source}</span>
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-muted">{compareUpdated}</p>
    </>
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

      {/* ── 4 · How we differ ── navy ─────────────────────────────────────
       *
       * A three-part story replaces the old side-by-side comparison. The
       * section now moves from the sector's structural failures, through the
       * lessons those failures exposed, to the model built in response. The
       * lease comparison is deliberately specific: it explains the review
       * window rather than presenting a shorter term as an end in itself.
       */}
      <Band id="compare-heading">
        <DifferenceStory />
      </Band>

      {/* ── 5 · Close ── cream ───────────────────────────────────────────── */}
    </main>
  );
}
