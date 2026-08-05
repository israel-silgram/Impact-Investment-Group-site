import { Link } from "@tanstack/react-router";
import * as React from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { IconCircle } from "@/components/ui/icon-circle";
import { Reveal } from "@/components/ui/reveal";
import {
  aiStatementPlaceholder,
  challengeCopy,
  impactProof,
  imagery,
  purposeCopy,
  purposeStats,
  purposeStatsNote,
  solutionCopy,
} from "@/content/home";
import { cn } from "@/lib/utils";

/**
 * MissionSolution — the need and the answer as two faces of one section.
 *
 * Face one is Our Mission and The Problem; face two is Our Solution. A single
 * control cross-fades between them, so the page carries both without spending
 * two screens on them.
 *
 * Both faces sit in the SAME grid cell. That is the whole trick: the cell
 * takes the height of the taller face, so flipping never moves anything below
 * it on the page. The shorter face spreads into that height rather than
 * leaving a gap at its foot — every column is a flex column whose last element
 * is pushed down with mt-auto.
 *
 * The turn itself is a column cascade — see the panel-turn block in styles.css.
 * The panel's four blocks leave in reading order and the incoming four arrive
 * the same way, 85ms apart, so the layout performs the change rather than the
 * box it sits in. It replaced a 3D rotation, which had to fall back to a plain
 * cross-fade below 1024px; this works identically at every width.
 *
 * There is no separate button. The photograph on the outer edge of each face
 * IS the control: it carries the label, it lights up on hover, and its icon
 * turns over. A plate you can see the other side of is a more honest
 * affordance than a pill that says "click here", and it puts the interaction
 * where the eye already is.
 *
 * The face turned away keeps its box but goes visibility:hidden once the last
 * block has fallen, which is what takes it out of the tab order. Content nobody
 * can see must not be reachable by keyboard, so its pointer-events go
 * immediately and its visibility on a delay timed to the sequence.
 *
 * Both faces are built to the same constraint as the hero: land inside one
 * screen at 100% zoom. Section padding of 40 and 56px icon rings are deliberate
 * exceptions to CLAUDE.md, taken to hit it. Nothing is cut to get there — every
 * figure, basis line, bullet and disclaimer survives on one face or the other.
 */

const icon = (name: string): LucideIcon =>
  (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle;

/**
 * One of the six figures is promoted to display scale; the other five run as a
 * rail beside it. Split here rather than in content so `purposeStats` stays a
 * single list of six — nothing is duplicated and nothing can be dropped by
 * editing one place and not the other.
 *
 * Children in temporary accommodation is the one chosen: it is the most human
 * of the set and the most precisely sourced (gov.uk, a dated snapshot), which
 * is what a figure at that size needs behind it.
 */
const HERO_STAT_ID = "children-ta";
const heroStat = purposeStats.find((stat) => stat.id === HERO_STAT_ID);
const supportingStats = purposeStats.filter((stat) => stat.id !== HERO_STAT_ID);

/* CARD is gone with the TBC panel it framed — the placeholder is now a chip
   on the foot rule rather than a card in prime position. Restore it verbatim
   if a bordered white card is ever needed on this face again. */
const QUIET = "text-[color-mix(in_oklab,var(--color-navy-900)_75%,transparent)]";

/**
 * Marks a block as one step of the cascade and sets its place in the order.
 *
 * The blocks leave and arrive in reading order, `--cascade-step` apart — see
 * the panel-turn block in styles.css. Indices run 0..3 on both faces so the
 * two sides stay in step with each other:
 *
 *   0  the banner / the headline rail
 *   1  the left column
 *   2  the right column
 *   3  the photograph
 *
 * It has to sit INSIDE <Reveal> rather than on it. Reveal's entrance is a CSS
 * animation with `fill: both`, and an animation's filled values beat a
 * transition on the same element — the cascade would simply never run.
 */
function cascade(index: number) {
  return { "data-cascade": "", style: { "--i": index } as React.CSSProperties };
}

/* DIVIDER_Y and GRID are gone with the 6px vertical bar and the three-column
   layout. Both faces now separate their columns with the gap alone and mark
   their headings with the same 2px .panel-rule-under. Restore from git if the
   heavy bar is ever wanted back. */

/**
 * Splits the mission headline so the one emphasised phrase can carry orange.
 * On cream that has to be orange-700: 500 measures 2.3:1 there and 600 3.0:1,
 * so both fail even as large text.
 */
function MissionHeadline({ id }: { id: string }) {
  const [before, after] = purposeCopy.title.split(purposeCopy.emphasis);
  return (
    <h2
      id={id}
      className="heading-tight text-balance text-[clamp(1.375rem,2.4vw,1.5625rem)] font-bold"
    >
      {before}
      <span className="text-orange-700">{purposeCopy.emphasis}</span>
      {after}
    </h2>
  );
}

/**
 * The photograph at the edge of each face, doubling as the flip control.
 *
 * A button rather than a div with an onClick: it has to be reachable by
 * keyboard and announce itself, and aria-expanded plus aria-controls tell a
 * screen reader that this thing governs the panel rather than navigating away.
 */
function FlipPlate({
  src,
  alt,
  width,
  height,
  objectPosition,
  eyebrow,
  label,
  hint,
  expanded,
  onFlip,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  objectPosition: string;
  eyebrow: string;
  label: string;
  hint: string;
  expanded: boolean;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-expanded={expanded}
      aria-controls="mission-solution-faces"
      className={cn(
        "flip-plate group relative block h-[240px] w-full overflow-hidden rounded-xl text-left lg:h-full",
        "border border-[color-mix(in_oklab,var(--color-slate)_25%,transparent)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
      )}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className={cn(
          "size-full object-cover transition-transform duration-[900ms] ease-out",
          "group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          objectPosition,
        )}
      />

      {/* Reads the label against any photograph, and deepens on hover so the
          plate answers the cursor before anything moves. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#000b1c]/95 via-[#000b1c]/45 to-transparent transition-opacity duration-500 group-hover:opacity-90"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent transition-colors duration-300 group-hover:ring-teal-400/70"
      />

      <span className="absolute inset-x-0 bottom-0 flex flex-col p-5">
        <span className="eyebrow flip-plate-eyebrow tracking-[0.14em]">{eyebrow}</span>
        <span className="flip-plate-title mt-2 font-heading text-[clamp(1.125rem,1.5vw,1.375rem)] font-bold leading-tight">
          {label}
        </span>
        <span className="flip-plate-hint mt-3 inline-flex items-center gap-2.5 text-[12.5px] font-semibold">
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/35 bg-white/10 transition-transform duration-[900ms] ease-out group-hover:rotate-180 motion-reduce:transition-none">
            <Icons.RefreshCw aria-hidden="true" className="size-3.5 text-white" />
          </span>
          {hint}
        </span>
      </span>
    </button>
  );
}

export function MissionSolution() {
  const [showSolution, setShowSolution] = React.useState(false);

  return (
    <section
      aria-labelledby={showSolution ? "solution-heading" : "mission-heading"}
      className="section-light border-t border-navy-700"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8">
        <div className="flip-scene">
          <div
            id="mission-solution-faces"
            className="flip-card"
            data-flipped={showSolution}
          >
          {/* ── Face one — Our mission | The problem ─────────────────────── */}
            <div
              data-active={!showSolution}
              aria-hidden={showSolution}
              className="flip-face flex flex-col"
            >
            <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,296px)]">
              <div className="flex min-w-0 flex-col">
                {/* The manifesto banner.

                    These two sentences are the strongest copy on the page and
                    they used to sit mid-column at not much above body size.
                    Given the full width and 29px they become the first thing
                    read, and the second sentence carries the orange — the
                    equality claim made in colour rather than argued in words.
                    orange-700 at 29px is 4.09:1, which clears AA as large
                    text; below 26px it would not. */}
                <Reveal className="panel-rule-under pb-3">
                  <div {...cascade(0)}>
                  <p className="flex items-center gap-3">
                    <IconCircle icon={Icons.HandHeart} size="sm" tone="orange" />
                    <span className="eyebrow tracking-[0.14em] text-teal-600">
                      {purposeCopy.eyebrow}
                    </span>
                  </p>
                  <p className="heading-tight mt-2 text-balance font-heading text-[clamp(1.375rem,2.6vw,1.8125rem)] font-bold text-navy-900">
                    {purposeCopy.closing[0]}
                    <br />
                    <span className="text-orange-700">{purposeCopy.closing[1]}</span>
                  </p>
                  </div>
                </Reveal>

                {/* 10fr / 9fr, not the other way round. The mission column is
                    the wider of the two precisely so every figure label below
                    lands on ONE line — at 7fr they wrapped to two, which cost
                    ~14px a row across five rows and put the panel 70px over
                    one screen. */}
                <div className="mt-4 grid flex-1 gap-9 lg:grid-cols-[minmax(0,10fr)_minmax(0,9fr)]">
                  {/* Our mission */}
                  <Reveal className="flex min-w-0 flex-col">
                    <div {...cascade(1)} className="flex flex-1 flex-col">
                    <MissionHeadline id="mission-heading" />
                    <p className="mt-2.5 text-[13.5px] leading-[1.65] text-navy-900">
                      {purposeCopy.statement}
                    </p>

                    {/* The figures moved out of the full-width row at the foot
                        and into this column. Same card, same contents — ring,
                        figure, label, basis — laid on one line each so the
                        column reads as a rail rather than six tiles. */}
                    <p className="panel-rule-under mt-5 pb-1.5 font-heading text-[12.5px] font-extrabold uppercase tracking-[0.06em] text-navy-900">
                      The scale of it
                    </p>
                    <ul className="mt-2.5 flex flex-col gap-1.5">
                      {supportingStats.map((stat) => {
                        const StatIcon = icon(stat.icon);
                        return (
                          <li
                            key={stat.id}
                            className="grid grid-cols-[26px_112px_minmax(0,1fr)] items-center gap-2.5 rounded-xl border border-[color-mix(in_oklab,var(--color-slate)_25%,transparent)] bg-white px-3 py-1.5"
                          >
                            <span className="icon-tone icon-tone-teal grid size-[26px] place-items-center rounded-full">
                              <StatIcon aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
                            </span>
                            <span className="whitespace-nowrap font-heading text-[19px] font-extrabold leading-none text-teal-600">
                              {stat.value}
                            </span>
                            <span className="flex min-w-0 flex-col">
                              <span className="text-[11.5px] font-semibold leading-[1.3] text-navy-900">
                                {stat.label}
                              </span>
                              <span className="mt-px text-[9.5px] leading-[1.35] text-slate">
                                {stat.basis}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-2 text-[10.5px] leading-snug text-slate-ink">
                      {purposeStatsNote}
                    </p>
                    </div>
                  </Reveal>

                  {/* The problem */}
                  <Reveal index={1} className="flex min-w-0 flex-col">
                    <div {...cascade(2)} className="flex flex-1 flex-col">
                    <p className="eyebrow tracking-[0.14em] text-teal-600">
                      {challengeCopy.eyebrow}
                    </p>
                    <h2 className="panel-rule-under heading-tight mt-1.5 text-balance pb-2 text-[clamp(1.25rem,2.2vw,1.4375rem)] font-bold">
                      {challengeCopy.title}
                    </h2>

                    {/* One figure at display scale instead of six at one
                        weight. This is the most human of the set and the most
                        precisely sourced, and its source travels with it — a
                        number this size must never appear without one. The
                        other five are directly opposite in the mission column,
                        every one of them, with their basis lines. */}
                    {heroStat ? (
                      <p className="mt-3 flex items-center gap-3.5 rounded-2xl bg-cream-card px-4 py-3">
                        <span className="font-heading text-[clamp(2.25rem,4vw,3.125rem)] font-extrabold leading-[0.95] tracking-[-0.02em] text-orange-700">
                          {heroStat.value}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="font-heading text-[13.5px] font-extrabold uppercase leading-[1.2] tracking-[0.04em] text-navy-900">
                            {heroStat.label}
                          </span>
                          <span className="mt-1 text-[11px] text-slate-ink">{heroStat.basis}</span>
                        </span>
                      </p>
                    ) : null}

                    <p className="mt-3 text-[13px] leading-[1.6]">{challengeCopy.lead}</p>

                    {/* Dots, not rings. With the figures gone from this column
                        the bullets no longer need to compete, and five 40px
                        rings were the loudest thing in a column whose headline
                        is the point. */}
                    <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      {challengeCopy.points.map((point) => (
                        <li key={point.text} className="flex gap-2">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "mt-[6px] size-[7px] shrink-0 rounded-full",
                              point.tone === "orange" ? "bg-orange-700" : "bg-teal-600",
                            )}
                          />
                          <span className="text-[12.5px] font-semibold leading-[1.42] text-navy-900">
                            {point.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p className={cn("mt-3.5 text-[12px] leading-[1.55]", QUIET)}>
                      {challengeCopy.close}
                    </p>

                    {/* flex-1 with the pill centred inside it, rather than
                        my-auto on the pill: this puts it in the true middle of
                        the space left at the foot of the column, horizontally
                        as well as vertically. */}
                    <div className="flex flex-1 items-center justify-center pt-4">
                      <Link
                        to="/the-problem"
                        className="panel-pill inline-flex min-h-[52px] items-center gap-2 rounded-full px-6 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                      >
                        See the full picture
                        <Icons.ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </div>
                    </div>
                  </Reveal>
                </div>
              </div>

              {/* The thinking pose belongs to The Problem — this is the
                  question the industry has not answered. The source is 2:3 and
                  the column lands near enough for the crop to be nominal. */}
              <Reveal index={2} className="order-first lg:order-none">
                <div {...cascade(3)} className="h-full">
                <FlipPlate
                  src={imagery.thinking.src}
                  alt={imagery.thinking.alt}
                  width={1024}
                  height={1536}
                  objectPosition="object-center"
                  eyebrow="The other side"
                  label="See our solution"
                  hint="Turn the panel over"
                  expanded={showSolution}
                  onFlip={() => setShowSolution(true)}
                />
                </div>
              </Reveal>
            </div>
          </div>

          {/* ── Face two — Our solution ──────────────────────────────────── */}
            <div
              data-active={showSolution}
              aria-hidden={!showSolution}
              className="flip-face flip-face-back flex flex-col"
            >
            <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,296px)]">
              <div className="flex min-w-0 flex-col">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,322px)_minmax(0,1fr)]">
                  {/* Identity rail — the headline, then the one claim the
                      section is built around. The claim used to sit in the
                      middle column competing with the mechanism paragraph;
                      giving it the orange bar and its own column makes it the
                      single thing the eye lands on. */}
                  <div {...cascade(0)} className="flex flex-col">
                    <IconCircle icon={Icons.Sparkles} size="md" tone="teal" />
                    <p className="eyebrow mt-3 tracking-[0.14em] text-teal-600">
                      {solutionCopy.eyebrow}
                    </p>
                    <h2
                      id="solution-heading"
                      className="heading-tight mt-3 text-balance text-[clamp(1.375rem,2.6vw,1.625rem)] font-bold"
                    >
                      {solutionCopy.title}
                    </h2>
                    {/* The bar carries the emphasis, not the type: orange-700
                        is 4.1:1 on cream and only clears AA as large text, and
                        this sits at 16px. A fill has no such limit. */}
                    <blockquote className="mt-4 border-l-[3px] border-orange-600 pl-3.5">
                      <p className="heading-tight text-[clamp(0.9375rem,1.4vw,1rem)] font-bold text-navy-900">
                        {solutionCopy.assertion}
                      </p>
                    </blockquote>
                  </div>

                  {/* What it does — three named stages, not eight loose rows */}
                  <div {...cascade(1)} className="flex min-w-0 flex-col">
                    <p className="eyebrow tracking-[0.14em] text-teal-600">The platform</p>
                    <p className={cn("mt-2 text-[12.5px] leading-[1.6]", QUIET)}>
                      {solutionCopy.mechanism}
                    </p>

                    <ul className="mt-3.5 grid gap-5 sm:grid-cols-3">
                      {solutionCopy.stages.map((stage) => {
                        const StageIcon = icon(stage.icon);
                        return (
                          <li key={stage.id} className="flex flex-col">
                            <p className="panel-rule-under flex items-center gap-2 pb-1.5">
                              <StageIcon
                                aria-hidden="true"
                                className="size-3.5 shrink-0 text-teal-600"
                                strokeWidth={1.5}
                              />
                              <span className="font-heading text-[12.5px] font-extrabold uppercase tracking-[0.06em] text-navy-900">
                                {stage.name}
                              </span>
                            </p>
                            <ul className="mt-2 flex flex-col gap-1.5">
                              {stage.points.map((point) => (
                                <li key={point.text} className="flex gap-2">
                                  {/* A dot, not a ring: three rings a column
                                      turned the stage heads into noise. The
                                      tone still carries teal for data and
                                      orange for the human consequence. */}
                                  <span
                                    aria-hidden="true"
                                    className={cn(
                                      "mt-[5px] size-[7px] shrink-0 rounded-full",
                                      point.tone === "orange" ? "bg-orange-700" : "bg-teal-600",
                                    )}
                                  />
                                  <span className="text-[12px] font-semibold leading-[1.4] text-navy-900">
                                    {point.text}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>

                    {/* The roster from `lead`, said once. See the note on
                        solutionCopy.roster for why it is chips and not prose. */}
                    <div className="mt-4">
                      <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-slate-ink">
                        Connecting
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {solutionCopy.roster.map((party) => (
                          <li
                            key={party}
                            className="rounded-full border border-[color-mix(in_oklab,var(--color-slate)_25%,transparent)] bg-white px-2.5 py-1 text-[11.5px] font-semibold leading-[1.3] text-navy-900"
                          >
                            {party}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ── What one home does ──────────────────────────────────
                    The payoff. A capability list answers "what does it do";
                    this answers "so what", which is the question a reader
                    actually leaves with. Ending here rather than on the
                    delivery footnote is the whole reason it exists. */}
                <div {...cascade(2)} className="panel-rule-thin mt-auto pt-4">
                  <p className="eyebrow tracking-[0.16em] text-teal-600">{impactProof.eyebrow}</p>
                  <ul className="mt-2.5 grid gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
                    {/* Ours, and illustrative — labelled as such on the card */}
                    <li className="rounded-xl border border-[color-mix(in_oklab,var(--color-slate)_25%,transparent)] bg-white p-3.5">
                      <p className="flex items-center gap-2.5">
                        <span className="font-heading text-[34px] font-extrabold leading-none text-navy-900">
                          {impactProof.multiplier.from.figure}
                        </span>
                        <span className="font-heading text-[11px] font-bold uppercase leading-[1.25] tracking-[0.06em] text-slate-ink">
                          {impactProof.multiplier.from.label}
                        </span>
                        <span className="sr-only"> becomes up to </span>
                        <Icons.ArrowRight
                          aria-hidden="true"
                          className="size-5 shrink-0 text-teal-600"
                          strokeWidth={2}
                        />
                        <span className="font-heading text-[34px] font-extrabold leading-none text-orange-700">
                          {impactProof.multiplier.to.figure}
                        </span>
                        <span className="font-heading text-[11px] font-bold uppercase leading-[1.25] tracking-[0.06em] text-slate-ink">
                          {impactProof.multiplier.to.label}
                        </span>
                      </p>
                      <p className="mt-2 text-[11px] leading-[1.5] text-slate-ink">
                        {impactProof.multiplier.basis}
                      </p>
                      <p className="mt-1 text-[11px] leading-[1.5] text-slate-ink">
                        {impactProof.multiplier.disclaimer}
                      </p>
                    </li>

                    {/* Published, cited, and guarded. The card carries "orange"
                        in its class list, which is what exempts its white type
                        from the .section-light remap — see the note there. */}
                    <li className="rounded-xl bg-orange-700 p-3.5 text-white">
                      <p className="font-heading text-[34px] font-extrabold leading-none">
                        {impactProof.cost.figure}
                      </p>
                      <p className="mt-1.5 text-[11.5px] font-semibold leading-[1.45]">
                        {impactProof.cost.body}
                      </p>
                      <p className="mt-1.5 text-[10px] leading-[1.4]">
                        {impactProof.cost.source} · {impactProof.cost.caveat}
                      </p>
                    </li>

                    <li className="rounded-xl border border-[color-mix(in_oklab,var(--color-slate)_25%,transparent)] bg-white p-3.5">
                      <p className="font-heading text-[12.5px] font-extrabold uppercase tracking-[0.06em] text-navy-900">
                        {impactProof.outcomes.heading}
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {impactProof.outcomes.points.map((point) => {
                          const PointIcon = icon(point.icon);
                          return (
                            <li key={point.text} className="flex gap-2">
                              <PointIcon
                                aria-hidden="true"
                                className="mt-[2px] size-3.5 shrink-0 text-teal-600"
                                strokeWidth={1.5}
                              />
                              <span className="text-[11.5px] leading-[1.42] text-slate-ink">
                                {point.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </div>

                {/* The delivery structure lives on About Us; the AI statement
                    is still pending and is rendered literally so it is never
                    mistaken for a real one. */}
                <p
                  {...cascade(2)}
                  className={cn("mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-[11.5px] leading-[1.6]", QUIET)}
                >
                  <span>
                    {solutionCopy.delivery}{" "}
                    <Link
                      to="/about"
                      className="nav-underline font-semibold text-teal-600 transition-colors duration-200 hover:text-navy-900"
                    >
                      {solutionCopy.deliveryLink}
                    </Link>
                  </span>
                  <span className="rounded-full border border-dashed px-2.5 py-1 font-heading text-[10.5px] font-bold uppercase tracking-[0.06em]">
                    {aiStatementPlaceholder}
                  </span>
                </p>
              </div>

              {/* The site's strongest assertion needs a person making it. His
                  open palm points back into the copy beside him. */}
              <div {...cascade(3)} className="order-first h-full lg:order-none">
                <FlipPlate
                  src={imagery.statement.src}
                  alt={imagery.statement.alt}
                  width={1024}
                  height={1536}
                  objectPosition="object-center"
                  eyebrow="The other side"
                  label="Back to the need"
                  hint="Turn the panel back"
                  expanded={showSolution}
                  onFlip={() => setShowSolution(false)}
                />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
