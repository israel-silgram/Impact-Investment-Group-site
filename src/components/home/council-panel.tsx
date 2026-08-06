import { LogoMarquee } from "@/components/ui/logo-marquee";
import {
  commissioningCouncils,
  councilsCount,
  councilsEyebrow,
  councilsStatement,
} from "@/content/trust";

/**
 * The commissioning-councils strip.
 *
 * A SEAM, not a section. It used to be an anchored panel with its own card, a
 * label block and a three-line disclaimer, which made it read as a fourth thing
 * on the page competing with the sections either side of it. It is now a slim
 * band with one sentence over the lane — its job is to join the mission panel
 * to the demand map, not to hold the floor.
 *
 * That is also why the padding is 24/28px rather than the 96px CLAUDE.md sets
 * for a section: a seam that takes a section's height is not a seam.
 *
 * Placement is the argument: this sits between Our Mission and the demand map
 * because that is the hinge — this is WHO is asking, immediately before the map
 * showing WHERE.
 *
 * ── Two things that are not styling choices ───────────────────────────────
 *
 * FULL COLOUR. The logos were previously desaturated. They are not any more —
 * the row holds together because the artwork is normalised to a constant
 * optical size, not because the colour was drained out of it.
 *
 * ⚠️ THE DISCLAIMER IS NO LONGER RENDERED. It was removed at Callum's explicit
 * request, twice asked for. `councilsDisclaimer` is still exported from
 * content/trust.ts and is one line away from coming back — drop it under the
 * lane and it is restored.
 *
 * Recording the reason it existed, since the code is now the only place it is
 * written down: council crests are protected marks, none of these councils has
 * approved anything, and eighteen of them in a row can read as endorsement. If
 * a council ever objects, restoring that line is the first thing to do.
 */
export function CouncilPanel() {
  return (
    <section
      aria-labelledby="commissioning-councils"
      className="border-y border-navy-700 bg-navy-800 py-6 sm:py-7"
    >
      {/* The full sentence stays in the accessibility tree; the visible line is
          shorter than the heading a screen reader wants here. */}
      <h2 id="commissioning-councils" className="sr-only">
        {councilsEyebrow}
      </h2>

      {/* One line, and it has to carry the strip on its own now the small
          print is gone. The figure runs at display scale in teal — the data
          voice — against the statement in white, so the eye lands on "18"
          first and reads the sentence second. */}
      {/* The figure is gone — `councilsCount` is now an empty string and the
          span is conditional, so the line reads as one statement rather than a
          number with a caption. Restoring a count is a one-line change in
          content/trust.ts; see the note there before you do. */}
      <p className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 px-5 text-center sm:px-8">
        {councilsCount ? (
          <span className="font-heading text-[clamp(1.75rem,3.4vw,2.25rem)] font-extrabold leading-none tracking-[-0.02em] text-teal-400">
            {councilsCount}
          </span>
        ) : null}
        <span className="font-heading text-[clamp(1.0625rem,1.9vw,1.375rem)] font-bold text-white">
          {councilsStatement}
        </span>
      </p>

      <LogoMarquee
        items={commissioningCouncils}
        label={councilsEyebrow}
        className="mt-5"
        plateClassName="h-[54px] w-[118px] overflow-hidden"
        imgClassName="size-full"
      />
    </section>
  );
}
