import { IMAGE_VARIANTS } from "@/lib/image-variants";

/**
 * ── WAVE 414: A PHONE DOES NOT DOWNLOAD A 1600px PICTURE ──────────────────
 *
 * Phone rule 6. Before this, the site had one size of every photograph and a
 * 390px screen fetched all of it: `/partner-with-investor` weighed 2,094 KiB
 * with a single 1,253 KiB network illustration in it, and the home page
 * 1,738 KiB. Measured by Lighthouse mobile against a gzipping server.
 *
 * `scripts/wave414-responsive-images.py` writes the smaller copies and
 * `image-variants.ts` records which ones it actually wrote. This builds the
 * `srcset` from that record rather than from a list of widths somebody keeps
 * in step by hand, which is the difference between a `srcset` and a set of
 * 404s: the script refuses any step that does not come out smaller than its
 * own source, so the steps that exist are not the steps anybody would guess.
 *
 * THE ORIGINAL IS ALWAYS THE LAST CANDIDATE, at its own width, so a wide
 * screen still gets the full picture and a browser with no `srcset` support
 * still gets one from `src`. Nothing here can make an image not load.
 */
export function variantSrcSet(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const entry = IMAGE_VARIANTS[src];
  if (!entry) return undefined;
  const dot = src.lastIndexOf(".");
  const stem = dot === -1 ? src : src.slice(0, dot);
  return [
    ...entry.steps.map((step) => `${stem}-${step}.webp ${step}w`),
    `${src} ${entry.width}w`,
  ].join(", ");
}

/**
 * The picture's own pixel dimensions, for the `width` and `height` attributes.
 *
 * The other half of rule 6, and the half a visitor feels rather than pays
 * for. An `<img>` with no `width`/`height` has no aspect ratio until its
 * bytes arrive, so the browser reserves nothing and every line under it jumps
 * when it lands. Measured before this: `/partner-with-investor` scored a
 * cumulative layout shift of 0.149 against Google's 0.1 "good" threshold, and
 * eleven of its images carried no dimensions at all.
 *
 * Read from the generated manifest rather than typed at the call site,
 * because most of these `src` values are expressions (a director's portrait,
 * a partner's illustration, a portal's art) and a literal pair of numbers
 * beside a variable is a pair of numbers that will be wrong.
 */
export function intrinsic(src: string | undefined): { width: number; height: number } | undefined {
  const entry = src ? IMAGE_VARIANTS[src] : undefined;
  return entry ? { width: entry.width, height: entry.height } : undefined;
}

/**
 * A `sizes` for a picture that is as wide as the page's content column.
 *
 * The site's containers are 1200px and 1440px inside 24px gutters, and below
 * 768px every band is one column. Stated as one string rather than written
 * out at each call site, because a `sizes` that is wrong is worse than none:
 * the browser assumes 100vw without it, and 100vw on a 390px screen at 2x
 * asks for 780px, which for a 112px portrait picks a LARGER file than the
 * original would have been.
 */
export const SIZES_FULL_BLEED = "100vw";

/** A picture that fills its column on a phone and shares a row from 768px. */
export const SIZES_HALF_FROM_TABLET = "(min-width: 768px) 50vw, 100vw";

/** One of three across from 768px. */
export const SIZES_THIRD_FROM_TABLET = "(min-width: 768px) 33vw, 100vw";

/**
 * An illustration that sits inside a card rather than running to the gutters.
 *
 * Measured at 390: the AI-team trio renders 254px (65vw) and the capability
 * band 270px (69vw), and both were declaring 100vw. At two device pixels that
 * asked for 780px, which picked the 934px ORIGINAL for each: 144KB and 189KB
 * to draw a quarter-megapixel. A `sizes` that overstates costs the whole
 * difference, and it is the one part of a `srcset` that nothing checks for
 * you.
 */
export const SIZES_CARD_ILLUSTRATION = "(min-width: 768px) 50vw, 70vw";

/**
 * The hero's street ground, which is full bleed and no longer invisible.
 *
 * ── WAVE 421: IT WAS "320px" AND THAT WAS A 400px FILE ACROSS 1905px ──────
 *
 * Wave 414 declared this one deliberately smaller than its box, and while the
 * photograph was painted at seven per cent that was right: there was no
 * detail in it to resolve, and 100vw at two device pixels was fetching the
 * 960px copy to draw a ghost nobody could see.
 *
 * Callum asked on 19 September for that ghost to become visible, and the
 * moment it is, "320px" is a 400px source stretched five times across a
 * 1905px hero, which is the softness he could see on the live site before
 * anybody told him what it was. `scripts/wave421-hero-and-footer.py` asserts
 * it: a viewport wider than 640 may not resolve to the 400px step.
 *
 * ── EVERY BRANCH ASKS FOR THE SAME THING: AT MOST 960 DEVICE PIXELS ───────
 *
 * The candidates are 400, 640, 960 and the 1672px original. There is no 1440
 * step, because `scripts/wave414-responsive-images.py` encoded one at 225KB
 * against a 199KB source and refused it by its own rule, so ANY request over
 * 960 device pixels jumps straight to a 1672 by 941 original: seventeen times
 * the pixels of the 400px step this ground used to be, and a decode that is
 * main-thread work. `scripts/wave413-motion.py` budgets zero tasks over 50ms
 * during a full scroll of the home page; with the original in place that
 * probe failed one run in two, with tasks of 67ms, 172ms and 185ms, against
 * a base that is clean five runs out of five.
 *
 * ⚠ `sizes` IS IN CSS PIXELS AND THE BROWSER MULTIPLIES BY THE SCREEN'S
 * DENSITY BEFORE CHOOSING. That is the trap wave 414's note here recorded and
 * then walked into, and this wave walked into it a second time: a single
 * `(min-resolution: 1.5x) 50vw` branch reads 50vw of 1905 on a 2x desktop,
 * asks for 1905 device pixels and takes the original, on exactly the machines
 * most likely to be running this site. So there is a branch per density and
 * each one names HALF THE VIEWPORT CAPPED AT 960 DIVIDED BY THAT DENSITY:
 *
 *   3x   min(50vw, 320px)  ->  at most 960 device px
 *   2x   min(50vw, 480px)  ->  at most 960
 *   1.5x min(50vw, 640px)  ->  at most 960
 *   1x   min(100vw, 960px) ->  at most 960
 *
 * The 1x branch asks for the full viewport rather than half, because there
 * the stretch IS visible; above 1x it asks for half, because this ground is
 * a photograph painted at a FIFTH of its own strength under a warm haze and
 * there is no second device pixel of detail in it to find.
 *
 * ⚠ dpi RATHER THAN x, AND THE REASON IS SAFARI. `min-resolution` in `dpi`
 * has been understood since Chrome 29 and in Firefox since before this site
 * existed; the `x` unit did not reach Firefox until 113. Safari understood
 * neither until 16. A browser that cannot parse the feature treats the
 * condition as false and falls through to the 1x branch, where the density
 * multiplication then picks the original: on Safari 15 and earlier, a 390px
 * phone at 3x asks for 1170 and takes the 199KB file. That is a real cost on
 * a shrinking share of phones and it is the price of not capping the 1x
 * branch so low that a 1x desktop is served a soft picture. Named here rather
 * than left to be discovered.
 *
 * 960 across a 1280 viewport is 0.75 of its box and across 1905 is 0.50. For
 * a photograph at 0.2 under a warm haze that is invisible, and it is a
 * different order of thing from the 0.21 Callum could see. Raise any of these
 * only with the long-task probe in hand, and if a 1440 step ever encodes
 * smaller than its source, prefer it to raising a cap.
 */
export const SIZES_HERO_GROUND = [
  "(min-resolution: 288dpi) min(50vw, 320px)",
  "(min-resolution: 192dpi) min(50vw, 480px)",
  "(min-resolution: 144dpi) min(50vw, 640px)",
  "min(100vw, 960px)",
].join(", ");

/** A portrait or a small square: never more than a quarter of a phone. */
export const SIZES_PORTRAIT = "(min-width: 1024px) 200px, 30vw";
