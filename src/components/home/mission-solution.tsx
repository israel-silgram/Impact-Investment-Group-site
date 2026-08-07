import { Link } from "@tanstack/react-router";
import * as React from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal, useCountUp } from "@/components/ui/reveal";
import {
  challengeCopy,
  impactProof,
  purposeCopy,
  purposeStats,
  purposeStatsNote,
  solutionCopy,
} from "@/content/home";
import { cn } from "@/lib/utils";

/**
 * MissionSolution — the need and the answer, as one bento grid with two faces.
 *
 * ── THE THREE THINGS THAT WERE WRONG WITH THE FIRST BENTO ─────────────────
 *
 * Callum: "colours look very dull… tons of gaps… still too much information."
 * All three were the same mistake in different clothes, and all three are
 * fixed by rules rather than by nudging:
 *
 * 1 · GAPS. Six stat tiles in a three-across grid is two rows with an empty
 *     sixth slot, and that tall right column stretched the orange hero into a
 *     mostly-empty rectangle. THE COUNT NOW DIVIDES THE ROW. Three stats, one
 *     row, no orphan — and the two columns come out close enough in height
 *     that nothing has to stretch to fill.
 *
 *     ⚠️ IF YOU ADD A FOURTH STAT, ADD A FIFTH AND A SIXTH TOO, or change the
 *     grid to four across. Anything that leaves a hole brings the gaps back.
 *
 * 2 · DULL. Everything on the cream face was a white card, so the only colour
 *     in a very large block was one orange rectangle. On cream the brand's
 *     teal only passes contrast as a DARK text colour, which reads muted — so
 *     brightness here cannot come from text. It comes from FILLS: the problem
 *     tile is navy, one stat tile is solid teal with white on it, the flip bar
 *     is an orange gradient. Four grounds in one grid instead of one.
 *
 * 3 · TOO MUCH. Six figures became three. Five bullets became three, and they
 *     moved INSIDE the problem tile rather than sitting in a box of their own —
 *     one fewer container, one fewer border, one fewer gap. The progress bars
 *     are gone: they compared a count of households against a sum of pounds,
 *     which was decoration pretending to be data.
 *
 * ⚠️ THE DROPPED FIGURES ARE NOT DELETED. `purposeStats` still holds all six in
 * content/home.ts; `SHOWN` below picks three by id. Swapping which three is a
 * one-line change and nothing else has to move.
 *
 * ── THE TWO FACES ─────────────────────────────────────────────────────────
 *
 * Both faces share one grid — same columns, same tile positions, same block
 * order: statement tile, three tiles, flip bar. Reading one face teaches you
 * the other. Only the ground and the content change.
 *
 * They are stacked in a single grid cell and crossfaded rather than rotated in
 * 3D: a 3D flip on a block this tall is heavy, and the cell takes the height of
 * the taller face so nothing jumps.
 *
 * ⚠️ THE GROUND TRAVELS WITH THE FACE, NOT THE SECTION. The front carries
 * `.section-light` and the back `bg-navy-900`; the <section> is transparent. A
 * background on the section shows through the crossfade as a flash of the wrong
 * colour.
 */

/** Three, because three divides the row. See note 1 above before changing. */
const SHOWN = ["waiting-lists", "temporary-accommodation", "asset-requirement"] as const;

const icon = (name?: string): LucideIcon =>
  name ? ((Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle) : Icons.Circle;

/**
 * The hero figure, counting.
 *
 * `useCountUp` wants a number and the content gives a formatted string, so the
 * digits come out and are re-formatted on the way back — en-GB, because this is
 * a UK statistic and the separator must be a comma wherever the visitor is.
 * The static string stays in the accessibility tree: a screen reader should
 * hear "176,130", not a number ticking.
 */
function CountUpFigure({ value, className }: { value: string; className?: string }) {
  const target = Number(value.replace(/[^0-9]/g, "")) || 0;
  const { ref, display } = useCountUp(target, 1400);
  return (
    <>
      <span ref={ref} aria-hidden="true" className={className}>
        {display.toLocaleString("en-GB")}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}

/**
 * A stat tile. The first of the three is SOLID TEAL with white on it; the other
 * two are the standard panel. That is the rhythm — a row of three identical
 * white cards is what made this block read as beige.
 *
 * White on teal-600 is 5.25:1, which passes AA at any size, so the fill is safe
 * for the label as well as the figure.
 */
function StatTile({ stat, filled }: { stat: (typeof purposeStats)[number]; filled: boolean }) {
  const Glyph = icon(stat.icon);
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] p-5 transition-all duration-300",
        "hover:-translate-y-1",
        filled
          ? "bg-teal-600 hover:shadow-[0_18px_34px_-18px_rgba(15,143,132,0.8)]"
          : "panel hover:shadow-[0_18px_34px_-20px_rgba(0,17,43,0.5)]",
      )}
    >
      <Glyph
        aria-hidden="true"
        strokeWidth={1.7}
        className={cn(
          "absolute -right-3 -top-3 size-20 opacity-[0.13]",
          filled ? "text-[#ffffff]" : "text-teal-600",
        )}
      />
      <p
        className={cn(
          "font-heading text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold leading-none tracking-[-0.03em]",
          filled ? "text-[#ffffff]" : "text-orange-700",
        )}
      >
        {stat.value}
      </p>
      <p
        className={cn(
          "mt-2 text-[13px] font-bold leading-snug",
          filled ? "text-[#ffffff]" : "text-white",
        )}
      >
        {stat.label}
      </p>
      {/* The source line is the reward for hovering. Hidden from the eye, not
          from assistive tech — three sources printed under three figures is
          what "too much information" looks like. */}
      <p
        className={cn(
          "mt-1 max-h-0 overflow-hidden text-[11px] leading-snug opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100",
          filled ? "text-[rgba(255,255,255,0.85)]" : "text-slate-muted",
        )}
      >
        {stat.basis}
      </p>
    </div>
  );
}

/**
 * The flip control — a full-width bar across the foot of the column rather than
 * a tile in the grid.
 *
 * It was a white card sitting quietly beside the content, which is the last
 * thing an invitation should be. As a bar it spans the column, carries the
 * orange gradient and is unmistakably the thing to press.
 */
function FlipBar({
  label,
  title,
  hint,
  onFlip,
}: {
  label: string;
  title: string;
  hint: string;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-panel)] bg-linear-to-r from-orange-600 to-orange-500 px-6 py-4 text-left transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
    >
      <span className="min-w-0">
        <span className="block font-heading text-[10px] font-extrabold uppercase tracking-[0.16em] text-[rgba(255,255,255,0.78)]">
          {label}
        </span>
        <span className="heading-tight block font-heading text-[clamp(1.0625rem,1.6vw,1.25rem)] font-extrabold text-[#ffffff]">
          {title}
        </span>
        <span className="block text-[12.5px] text-[rgba(255,255,255,0.88)]">{hint}</span>
      </span>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/18 transition-transform duration-500 group-hover:rotate-180">
        <Icons.RefreshCw aria-hidden="true" className="size-5 text-[#ffffff]" />
      </span>
    </button>
  );
}

export function MissionSolution() {
  const [showSolution, setShowSolution] = React.useState(false);
  const flip = React.useCallback(() => setShowSolution((v) => !v), []);

  /* Picked BY ID, never by position — re-ordering content/home.ts must not
     silently promote a different statistic into the big orange tile. */
  const hero = purposeStats.find((s) => s.id === "children-ta") ?? purposeStats[0]!;
  const shown = SHOWN.map((id) => purposeStats.find((s) => s.id === id)).filter(
    (s): s is (typeof purposeStats)[number] => Boolean(s),
  );

  /* Three of the five bullets. The full list stays in content/home.ts. */
  const points = challengeCopy.points.slice(0, 3);

  const faceBase = "col-start-1 row-start-1 transition-opacity duration-500 ease-out";

  return (
    <section aria-labelledby="mission-heading" className="relative isolate grid">
      {/* ══ FRONT — the need ══════════════════════════════════════════════ */}
      <div
        className={cn(
          faceBase,
          "section-light",
          showSolution ? "pointer-events-none opacity-0" : "opacity-100",
        )}
        aria-hidden={showSolution}
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-11 sm:px-8 lg:py-12">
          <Reveal>
            <p className="eyebrow tracking-[0.14em] text-orange-700">{purposeCopy.eyebrow}</p>
            <h2
              id="mission-heading"
              className="heading-tight mt-2 max-w-[24ch] text-balance font-heading text-[clamp(1.625rem,3.2vw,2.375rem)] font-extrabold tracking-[-0.025em] text-white"
            >
              {/* The emphasis is picked out of the title rather than the title
                  being split into two fields — one source of truth for the
                  sentence, and the highlight cannot drift out of it. */}
              {purposeCopy.title.split(purposeCopy.emphasis).map((part, i, all) => (
                <React.Fragment key={i}>
                  {part}
                  {i < all.length - 1 ? (
                    <span className="text-orange-700">{purposeCopy.emphasis}</span>
                  ) : null}
                </React.Fragment>
              ))}
            </h2>
          </Reveal>

          <div className="mt-6 flex flex-col gap-3.5 lg:flex-row">
            {/* ── left column ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-3.5 lg:w-[41%]">
              {/* THE HERO TILE. Content is BOTTOM-ALIGNED. Centred, it floated
                  in an orange field with dead space above and below; against
                  the foot of the tile the space above reads as deliberate, the
                  way a poster's does. The glyph fills the top so it is never
                  empty. */}
              <Reveal className="flex flex-1">
                <div className="relative flex w-full flex-col justify-end overflow-hidden rounded-[var(--radius-panel)] bg-orange-600 p-6 lg:min-h-[270px]">
                  <Icons.Baby
                    aria-hidden="true"
                    strokeWidth={1.2}
                    className="pointer-events-none absolute -right-8 -top-8 size-48 text-[#ffffff] opacity-[0.14]"
                  />
                  <p className="eyebrow tracking-[0.14em] text-[rgba(255,255,255,0.88)]">{hero.label}</p>
                  <p className="mt-1.5 font-heading text-[clamp(3rem,6.6vw,4.75rem)] font-extrabold leading-none tracking-[-0.04em] text-[#ffffff]">
                    <CountUpFigure value={hero.value} />
                  </p>
                  <p className="mt-2.5 text-[12px] text-[rgba(255,255,255,0.88)]">{hero.basis}</p>
                </div>
              </Reveal>

              {/* The only photograph in the section, and the reason the block
                  does not read as a dashboard. The scrim runs to 92% at the
                  foot — at 88% the caption was still fighting the roofs. */}
              <Reveal index={1}>
                <div className="group relative h-[150px] overflow-hidden rounded-[var(--radius-panel)]">
                  <img
                    src="/images/why-estate-aerial.webp"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    width={1600}
                    height={640}
                    className="size-full scale-105 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-[rgba(0,17,43,0.92)] via-[rgba(0,17,43,0.45)] to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="eyebrow tracking-[0.14em] text-[#2fbaaa]">Where this happens</p>
                    <p className="heading-tight mt-0.5 font-heading text-[17px] font-extrabold text-[#ffffff]">
                      Every local authority in the UK
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ── right column ─────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col gap-3.5">
              {/* NAVY ON CREAM. The single biggest lift out of "dull": a dark
                  tile in a light grid is the highest-contrast thing on the
                  band, so the sentence the section is arguing lands first. The
                  bullets live inside it — one fewer box, one fewer gap. */}
              <Reveal index={1}>
                <div className="section-dark p-6">
                  <p className="eyebrow tracking-[0.14em] text-teal-400">
                    {challengeCopy.eyebrow}
                  </p>
                  <h3 className="heading-tight mt-1.5 font-heading text-[clamp(1.25rem,2.1vw,1.5rem)] font-extrabold text-white">
                    {challengeCopy.title}
                  </h3>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {points.map((point) => {
                      const Glyph = icon(point.icon);
                      return (
                        <li key={point.text} className="flex items-start gap-2.5">
                          <Glyph
                            aria-hidden="true"
                            strokeWidth={1.9}
                            className={cn(
                              "mt-px size-4 shrink-0",
                              point.tone === "orange" ? "text-[#ff7a29]" : "text-[#2fbaaa]",
                            )}
                          />
                          <span className="text-[12.5px] leading-snug text-mist">{point.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    to="/the-problem"
                    className="mt-4 inline-flex items-center gap-1.5 font-heading text-[13px] font-bold text-teal-400 transition-colors duration-200 hover:text-orange-500"
                  >
                    See the full picture
                    <Icons.ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              </Reveal>

              <div className="grid flex-1 gap-3.5 sm:grid-cols-3">
                {shown.map((stat, i) => (
                  <Reveal key={stat.id} index={i} className="flex">
                    <StatTile stat={stat} filled={i === 0} />
                  </Reveal>
                ))}
              </div>

              <Reveal index={2}>
                <FlipBar
                  label="The other side"
                  title="See our solution"
                  hint="The same picture, joined up."
                  onFlip={flip}
                />
              </Reveal>
            </div>
          </div>

          <p className="mt-3.5 text-[11px] leading-relaxed text-slate-muted">{purposeStatsNote}</p>
        </div>
      </div>

      {/* ══ BACK — the answer ═════════════════════════════════════════════ */}
      <div
        className={cn(
          faceBase,
          "bg-navy-900",
          showSolution ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!showSolution}
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-11 sm:px-8 lg:py-12">
          <Reveal>
            <p className="eyebrow tracking-[0.14em] text-teal-400">{solutionCopy.eyebrow}</p>
            <h2 className="heading-tight mt-2 max-w-[24ch] text-balance font-heading text-[clamp(1.625rem,3.2vw,2.375rem)] font-extrabold tracking-[-0.025em] text-white">
              {/* The last of the three carries the accent — the same rhythm the
                  closing strapline uses everywhere else on the site. */}
              {solutionCopy.title.split(". ").map((part, i, all) => (
                <span key={part} className={i === all.length - 1 ? "text-orange-500" : undefined}>
                  {part}
                  {i < all.length - 1 ? ". " : ""}
                </span>
              ))}
            </h2>
          </Reveal>

          <div className="mt-6 flex flex-col gap-3.5 lg:flex-row">
            <div className="flex flex-col gap-3.5 lg:w-[41%]">
              {/* Mirrors the orange tile exactly — same position, same
                  bottom-aligned content, same oversized glyph. */}
              <Reveal className="flex flex-1">
                <div className="relative flex w-full flex-col justify-end overflow-hidden rounded-[var(--radius-panel)] bg-teal-600 p-6 lg:min-h-[270px]">
                  <Icons.House
                    aria-hidden="true"
                    strokeWidth={1.2}
                    className="pointer-events-none absolute -right-8 -top-8 size-48 text-[#ffffff] opacity-[0.14]"
                  />
                  <p className="eyebrow tracking-[0.14em] text-white/85">{impactProof.eyebrow}</p>
                  <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 font-heading font-extrabold leading-none tracking-[-0.04em] text-white">
                    <span className="text-[clamp(2.25rem,4vw,3rem)]">
                      {impactProof.multiplier.from.figure}
                    </span>
                    <span className="text-[13px] font-semibold">
                      {impactProof.multiplier.from.label}
                    </span>
                    <Icons.ArrowRight aria-hidden="true" className="size-6 shrink-0" />
                    <span className="text-[clamp(3rem,6.6vw,4.75rem)]">
                      {impactProof.multiplier.to.figure}
                    </span>
                    <span className="text-[13px] font-semibold">
                      {impactProof.multiplier.to.label}
                    </span>
                  </p>
                  {/* ⚠️ ILLUSTRATIVE, AND IT SAYS SO. A conversion model, not a
                      delivered result. The disclaimer travels with the figure
                      and is not a caption a later layout pass may trim. */}
                  <p className="mt-2.5 text-[11.5px] leading-snug text-white/85">
                    {impactProof.multiplier.disclaimer}
                  </p>
                </div>
              </Reveal>

              <Reveal index={1}>
                <div className="group relative h-[150px] overflow-hidden rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800">
                  <img
                    src="/images/ai-team/trio-wave.webp"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    width={934}
                    height={558}
                    className="absolute -bottom-1 right-2 h-[152px] w-auto translate-y-3 transition-transform duration-700 ease-out group-hover:translate-y-0"
                  />
                  <div className="absolute inset-y-0 left-0 flex max-w-[54%] flex-col justify-center p-5">
                    <p className="eyebrow tracking-[0.14em] text-teal-400">Who it is for</p>
                    <p className="heading-tight mt-0.5 font-heading text-[17px] font-extrabold text-white">
                      Everyone in the chain, in one place
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="flex flex-1 flex-col gap-3.5">
              {/* The mirror of the navy tile on the front — here it is teal-edged
                  on navy, and it carries the roster inside it for the same
                  reason the bullets moved: one fewer box. */}
              <Reveal index={1}>
                <div className="rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800 p-6">
                  <p className="eyebrow tracking-[0.14em] text-teal-400">The platform</p>
                  <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed text-mist">
                    {solutionCopy.assertion}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {solutionCopy.roster.map((name) => (
                      <li
                        key={name}
                        className="rounded-full border border-teal-600 px-3 py-1.5 text-[11.5px] font-semibold text-white"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <div className="grid flex-1 gap-3.5 sm:grid-cols-3">
                {solutionCopy.stages.map((stage, i) => {
                  const Glyph = icon(stage.icon);
                  const filled = i === 0;
                  return (
                    <Reveal key={stage.id} index={i} className="flex">
                      <div
                        className={cn(
                          "group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-panel)] p-5 transition-all duration-300 hover:-translate-y-1",
                          filled
                            ? "bg-teal-600"
                            : "border border-navy-700 bg-navy-800 hover:border-teal-600",
                        )}
                      >
                        <Glyph
                          aria-hidden="true"
                          strokeWidth={1.5}
                          className={cn(
                            "absolute -right-3 -top-3 size-20 opacity-[0.14]",
                            filled ? "text-white" : "text-teal-400",
                          )}
                        />
                        <span
                          className={cn(
                            "font-heading text-[11px] font-extrabold tracking-[0.14em]",
                            filled ? "text-white/80" : "text-teal-400",
                          )}
                        >
                          {stage.number}
                        </span>
                        <p className="heading-tight mt-1 font-heading text-[15px] font-extrabold text-white">
                          {stage.name}
                        </p>
                        <ul className="mt-2.5 flex flex-col gap-1.5">
                          {stage.points.map((point) => (
                            <li
                              key={point.text}
                              className={cn(
                                "text-[11.5px] leading-snug",
                                filled ? "text-white/90" : "text-mist",
                              )}
                            >
                              {point.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              <Reveal index={2}>
                <FlipBar
                  label="Back to it"
                  title="See the need"
                  hint="The problem this answers."
                  onFlip={flip}
                />
              </Reveal>
            </div>
          </div>

          <p className="mt-3.5 text-[11px] leading-relaxed text-slate-muted">
            <Link to="/solutions" className="font-semibold text-teal-400 hover:text-white">
              Read how it works →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
