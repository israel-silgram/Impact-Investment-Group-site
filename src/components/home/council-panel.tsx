import { LogoMarquee } from "@/components/ui/logo-marquee";
import {
  commissioningCouncils,
  councilsCount,
  councilsCountLabel,
  councilsCountOf,
  councilsDisclaimer,
  councilsEyebrow,
} from "@/content/trust";

/**
 * The commissioning-councils band, as an anchored panel rather than a
 * full-bleed strip.
 *
 * It replaced a centred eyebrow, a lane of ragged white plates and a
 * three-line paragraph of disclaimer floating underneath. Two things were
 * wrong with that. The strip read as a logo dump — nothing framed it or said
 * what it was doing there — and the disclaimer, being a loose paragraph under
 * a row, was the first thing any future layout pass would trim for height.
 *
 * The fix is structural. A fixed label block carries the count, the
 * denominator and the disclaimer; the lane scrolls inside the panel beside it.
 * The compliance text is now part of the component instead of a caption
 * beneath it, which is what stops it being cut — and the "18 of ~296" claim is
 * carried by the figure itself rather than repeated in prose.
 *
 * Placement is deliberate: this sits between the mission panel and the demand
 * map because that is the hinge in the argument — this is WHO is asking,
 * immediately before the map showing WHERE. navy-800 against the navy-900
 * beneath it, so it reads as its own strip.
 *
 * ⚠️ The disclaimer travels with the logos. If this panel moves, it moves
 * whole. A wall of protected council crests reads as endorsement unless it
 * says otherwise, and none of these councils has given one.
 */
export function CouncilPanel() {
  return (
    <section
      aria-labelledby="commissioning-councils"
      className="border-y border-navy-700 bg-navy-800 px-5 py-8 sm:px-8"
    >
      <div className="mx-auto grid w-full max-w-[1440px] overflow-hidden rounded-[var(--radius-panel)] border border-navy-700 bg-navy-900 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)]">
        {/* Label block — the count, the denominator, the disclaimer. */}
        <div className="flex flex-col border-b border-navy-700 p-5 lg:border-b-0 lg:border-r">
          <h2 id="commissioning-councils" className="sr-only">
            {councilsEyebrow}
          </h2>

          <p className="font-heading text-[clamp(2.25rem,4vw,2.625rem)] font-extrabold leading-[0.92] tracking-[-0.02em] text-teal-400">
            {councilsCount}
            {/* Not decoration. 18 crests without the denominator implies
                national coverage the platform does not have. */}
            <span className="mt-1.5 block font-sans text-[11.5px] font-semibold leading-snug tracking-normal text-mist">
              {councilsCountOf}
            </span>
          </p>

          <p className="eyebrow mt-2.5 tracking-[0.12em] text-white">{councilsCountLabel}</p>

          <p className="mt-3.5 text-[11px] leading-[1.6] text-white/60">{councilsDisclaimer}</p>
        </div>

        {/* The lane. Plates are fixed at 126 × 58 and the artwork is
            pre-normalised to a constant optical area, so the row scans as one
            rhythm — see the artwork note in content/trust.ts. Crests sit at low
            saturation against the navy and return to full colour on hover, so
            the band stops being the brightest thing on the page without any
            mark being permanently altered. */}
        <div className="flex min-w-0 items-center py-4">
          <LogoMarquee
            items={commissioningCouncils}
            label={councilsEyebrow}
            className="w-full"
            plateClassName="h-[58px] w-[126px] overflow-hidden"
            imgClassName="size-full opacity-85 saturate-[0.2] transition-[filter,opacity] duration-300 hover:opacity-100 hover:saturate-100 motion-reduce:transition-none"
          />
        </div>
      </div>
    </section>
  );
}
