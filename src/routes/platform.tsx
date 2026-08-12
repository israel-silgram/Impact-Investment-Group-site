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
  grid,
  children,
}: {
  id: string;
  light?: boolean;
  grid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "relative overflow-hidden border-t border-navy-700",
        light ? "section-light" : "bg-navy-900",
      )}
    >
      {grid ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(37,209,194,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,209,194,0.08)_1px,transparent_1px)] [background-size:56px_56px]"
        />
      ) : null}
      <div className="relative mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 lg:py-14">
        {children}
      </div>
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

const PORTAL_ART = {
  petra: "/images/ai-team/petra-point.webp",
  peter: "/images/ai-team/peter-present.webp",
  pippa: "/images/ai-team/pippa-present.webp",
} as const;

const PORTAL_LABEL = {
  petra: "Enter · Find",
  peter: "Enter · Price",
  pippa: "Enter · Prove",
} as const;

const PORTAL_ACTION = {
  petra: "Search every sourced listing",
  peter: "Test the full cost picture",
  pippa: "Make the outcome visible",
} as const;

const DEFAULT_WORKFLOW_STEP = workflow[0]!;

/**
 * The approved "Character Portals" concept. Each doorway is a real button,
 * and its expanded profile keeps the existing workflow copy and safeguards.
 */
function CharacterPortals() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = workflow.find((step) => step.id === selectedId) ?? null;

  return (
    <div className="relative">
      <div className="relative z-1">
        <p className="eyebrow tracking-[0.16em] text-teal-400">Option 4 · Character portals</p>
        <h2
          id="tools-heading"
          className="heading-tight mt-2 max-w-[720px] font-heading text-[clamp(2.25rem,5vw,4.35rem)] font-bold text-white"
        >
          Three doors into <span className="text-orange-500">one platform.</span>
        </h2>
        <p className="mt-3 text-[15px] text-mist sm:text-[16px]">
          Choose where you want to begin.
        </p>

        <div className="relative mt-9 min-h-[310px] sm:mt-12 sm:min-h-[390px]">
          <ol
            aria-label="Choose a platform guide"
            className={cn(
              "mx-auto grid max-w-[780px] grid-cols-3 items-end gap-2 transition-opacity duration-300 sm:gap-5 lg:gap-9",
              selected && "pointer-events-none opacity-0",
            )}
          >
            {workflow.map((step) => {
              const id = step.id as keyof typeof PORTAL_ART;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    aria-pressed={selectedId === step.id}
                    aria-label={`Meet ${step.claim.split(" ")[0]} — ${PORTAL_LABEL[id]}`}
                    onClick={() => setSelectedId(step.id)}
                    className={cn(
                      "group relative h-[285px] w-full overflow-hidden rounded-b-[16px] rounded-t-[999px] border-2 border-navy-600 bg-[radial-gradient(circle_at_50%_38%,rgba(37,209,194,0.20),var(--color-navy-800)_66%)] p-0 text-white",
                      "transition-[transform,box-shadow,border-color] duration-500 ease-out motion-reduce:transition-none",
                      "hover:-translate-y-3 hover:scale-[1.025] hover:border-teal-400 hover:shadow-[0_0_48px_rgba(37,209,194,0.28)]",
                      "focus-visible:-translate-y-3 focus-visible:border-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-4 focus-visible:ring-offset-navy-900",
                      "sm:h-[350px] lg:h-[390px]",
                      "before:absolute before:inset-[-60%] before:animate-spin before:bg-[conic-gradient(transparent,rgba(37,209,194,0.36),transparent,rgba(255,107,0,0.30),transparent)] before:[animation-duration:7s] before:content-['']",
                      "after:absolute after:inset-2 after:rounded-[inherit] after:bg-navy-800 after:content-['']",
                    )}
                  >
                    <img
                      src={PORTAL_ART[id]}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      width={347}
                      height={520}
                      className="pointer-events-none absolute bottom-9 left-1/2 z-2 h-[225px] w-[122%] max-w-none -translate-x-1/2 object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.04] motion-reduce:transition-none sm:h-[292px] lg:h-[330px]"
                    />
                    <strong className="absolute inset-x-1.5 bottom-1.5 z-3 rounded-[10px] bg-navy-900/90 px-1 py-2 font-heading text-[10px] font-semibold text-white sm:inset-x-2.5 sm:bottom-2.5 sm:px-2 sm:text-[14px]">
                      {PORTAL_LABEL[id]}
                    </strong>
                  </button>
                </li>
              );
            })}
          </ol>

          {selected ? (
            <div
              role="dialog"
              aria-modal="false"
              aria-labelledby="portal-profile-heading"
              className="absolute inset-0 z-10 grid overflow-hidden rounded-[22px] border border-teal-400/50 bg-navy-800/98 shadow-[0_35px_80px_rgba(0,0,0,0.55)] md:grid-cols-[0.8fr_1.2fr]"
            >
              <div className="relative hidden overflow-hidden bg-[radial-gradient(circle,rgba(37,209,194,0.25),transparent_68%)] md:block">
                <img
                  src={PORTAL_ART[selected.id as keyof typeof PORTAL_ART]}
                  alt={selected.claim.split(" ")[0]}
                  width={347}
                  height={520}
                  className="absolute bottom-0 left-1/2 h-[94%] w-full -translate-x-1/2 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="eyebrow tracking-[0.14em] text-teal-400">{selected.chip}</p>
                <h3
                  id="portal-profile-heading"
                  className="mt-2 font-heading text-[clamp(1.8rem,4vw,3rem)] font-bold text-white"
                >
                  Hi, I’m {selected.claim.split(" ")[0]}.
                </h3>
                <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-mist sm:text-[17px]">
                  {selected.body}
                </p>
                <p className="mt-5 font-heading text-[15px] font-bold text-white sm:text-[17px]">
                  {PORTAL_ACTION[selected.id as keyof typeof PORTAL_ACTION]}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-teal-400 px-4 py-2.5 font-heading text-[13px] font-bold text-navy-900 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                >
                  <Icons.ArrowLeft className="size-4" aria-hidden="true" />
                  Return to the doors
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <p className="mx-auto mt-8 max-w-[72ch] text-center text-[14px] leading-relaxed text-mist">
          {workflowFooter}
        </p>
        <p className="mx-auto mt-3 max-w-[72ch] text-center text-[12px] leading-relaxed text-slate-muted">
          {aiTeamNote}
        </p>
      </div>
    </div>
  );
}

function MissionControl() {
  const [activeId, setActiveId] = React.useState(DEFAULT_WORKFLOW_STEP.id);
  const active = workflow.find((step) => step.id === activeId) ?? DEFAULT_WORKFLOW_STEP;
  const activeKey = active.id as keyof typeof PORTAL_ART;

  return (
    <div className="relative">
      <div className="relative">
        <p className="eyebrow tracking-[0.16em] text-teal-400">Option 2 · Platform mission control</p>
        <h2 id="mission-control-heading" className="heading-tight mt-2 max-w-[760px] font-heading text-[clamp(2rem,4.6vw,3.8rem)] font-bold text-white">
          Choose a specialist. <span className="text-orange-500">Activate their tool.</span>
        </h2>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(360px,1.05fr)_minmax(300px,0.95fr)]">
          <div className="relative mx-auto aspect-square w-full max-w-[500px]">
            <span aria-hidden="true" className="absolute inset-[15%] animate-spin rounded-full border border-dashed border-teal-400/50 [animation-duration:24s] motion-reduce:animate-none" />
            <div className="absolute inset-[34%] grid place-items-center rounded-full border border-teal-400/50 bg-[radial-gradient(circle,rgba(37,209,194,0.22),var(--color-navy-800)_68%)] text-center shadow-[0_0_65px_rgba(37,209,194,0.22)]">
              <span><strong className="block font-heading text-white">One workflow</strong><small className="text-mist">Find · Price · Prove</small></span>
            </div>
            {workflow.map((step, index) => {
              const key = step.id as keyof typeof PORTAL_ART;
              const position = index === 0 ? "left-1/2 top-0 -translate-x-1/2" : index === 1 ? "bottom-[7%] right-[1%]" : "bottom-[7%] left-[1%]";
              return (
                <button key={step.id} type="button" aria-pressed={activeId === step.id} onClick={() => setActiveId(step.id)} className={cn("absolute h-[132px] w-[112px] overflow-hidden rounded-[18px] border bg-navy-700/90 text-white transition duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 sm:h-[142px] sm:w-[126px]", position, activeId === step.id ? "border-teal-400 shadow-[0_0_30px_rgba(37,209,194,0.3)]" : "border-navy-600")}>
                  <img src={PORTAL_ART[key]} alt="" aria-hidden="true" className="mx-auto h-[104px] w-full object-contain sm:h-[112px]" />
                  <span className="font-heading text-[12px] font-bold">{step.claim.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          <div aria-live="polite" className="relative min-h-[340px] overflow-hidden border border-teal-400/35 bg-[repeating-linear-gradient(0deg,rgba(37,209,194,0.035)_0_3px,transparent_3px_7px)] p-7 shadow-[inset_0_0_55px_rgba(37,209,194,0.08)]">
            <img src={PORTAL_ART[activeKey]} alt="" aria-hidden="true" className="absolute -bottom-5 -right-7 h-[280px] opacity-25 saturate-50 drop-shadow-[0_0_18px_rgba(37,209,194,0.7)]" />
            <p className="relative eyebrow tracking-[0.14em] text-teal-400">{active.chip}</p>
            <h3 className="relative mt-3 max-w-[12ch] font-heading text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold text-white">Hi, I’m {active.claim.split(" ")[0]}.</h3>
            <p className="relative mt-4 max-w-[31ch] text-[15px] leading-relaxed text-mist">{active.body}</p>
            <p className="relative mt-5 inline-flex border border-teal-400/40 px-3 py-2 text-[13px] text-teal-400">Tool online · <strong className="ml-1">{PORTAL_ACTION[activeKey]}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LivingComic() {
  const [activeId, setActiveId] = React.useState(DEFAULT_WORKFLOW_STEP.id);

  return (
    <div className="relative font-sans">
      <div className="relative">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.17em] text-teal-400">The platform story</p>
        <h2 id="living-comic-heading" className="mt-2 font-sans text-[clamp(2.3rem,5vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.04em] text-white">
          Not a pop-up. <span className="text-teal-400">A living comic.</span>
        </h2>

        <div
          className="mt-8 grid min-h-[470px] grid-cols-1 gap-3 transition-[grid-template-columns] duration-500 ease-out md:grid-cols-[var(--comic-columns)]"
          style={{
            "--comic-columns": workflow
              .map((step) => (step.id === activeId ? "1.8fr" : "0.6fr"))
              .join(" "),
          } as React.CSSProperties}
        >
          {workflow.map((step, index) => {
            const key = step.id as keyof typeof PORTAL_ART;
            const active = activeId === step.id;
            const quote = index === 0 ? "Tell me what home you need." : index === 1 ? "Now let’s test the numbers." : "What difference will this home make?";
            const expandedCopy = index === 0
              ? "I search the sourced market and bring the closest matches into one view."
              : index === 1
                ? "I run valuation and cost work against named public data, with every figure traceable."
                : "I turn the social outcome into a visible, reportable Impact Score.";
            return (
              <button
                key={step.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveId(step.id)}
                className={cn(
                  "group relative min-h-[390px] min-w-0 overflow-hidden border-[3px] border-white bg-navy-800 text-left transition-[filter,transform] duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/55 md:min-h-[470px]",
                  index === 0 ? "-skew-y-[1deg]" : index === 1 ? "skew-y-[1deg]" : "-skew-y-[0.75deg]",
                  active ? "brightness-110" : "hover:brightness-110",
                )}
              >
                <span aria-hidden="true" className={cn("absolute inset-[-30%] animate-spin bg-[repeating-conic-gradient(from_0deg,rgba(255,107,0,0.16)_0deg_7deg,transparent_7deg_14deg)] [animation-duration:34s] motion-reduce:animate-none", index === 1 && "bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,0.10)_0deg_7deg,transparent_7deg_14deg)]", index === 2 && "bg-[repeating-conic-gradient(from_0deg,rgba(37,209,194,0.18)_0deg_7deg,transparent_7deg_14deg)]")} />
                <span className="absolute left-4 top-4 z-3 -rotate-2 bg-white px-3 py-2 font-sans text-[12px] font-bold text-navy-900 shadow-[6px_6px_0_var(--color-orange-600)] sm:text-[14px]">{step.claim.toUpperCase()}</span>
                <img src={PORTAL_ART[key]} alt="" aria-hidden="true" className={cn("absolute bottom-[-10px] right-[-18%] h-[88%] w-[116%] max-w-none object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.28)] transition-[right,transform] duration-500", active && "right-[-3%] scale-[1.04]")} />
                <span className={cn("absolute inset-x-4 bottom-4 z-3 rounded-[20px] border-[3px] border-navy-900 bg-white p-4 text-center text-[13px] leading-relaxed text-navy-900 transition-[opacity,transform] duration-500 sm:p-5 sm:text-[14px]", active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-7 opacity-0")}>
                  <strong className="mb-1.5 block font-sans text-[15px] font-bold">“{quote}”</strong>{expandedCopy}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
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
      <Band id="tools-heading" grid>
        <CharacterPortals />
      </Band>

      <Band id="mission-control-heading" grid>
        <MissionControl />
      </Band>

      <Band id="living-comic-heading" grid>
        <LivingComic />
      </Band>

      {/* ── How we differ ── navy ─────────────────────────────────────────
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
