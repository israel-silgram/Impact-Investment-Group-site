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
 * The hero's 7% street wash, and the only `sizes` on the site that is
 * deliberately smaller than the box it fills.
 *
 * It is `object-cover` across the whole hero, so by width it wants 100vw, and
 * at two device pixels that fetched the 960px copy: 124KB, the third largest
 * thing on the home page. It is painted at SEVEN PER CENT OPACITY behind the
 * headline. There is no detail in it to resolve at any density.
 *
 * ⚠ 320, NOT 640, AND THE DIFFERENCE IS THE DEVICE PIXEL RATIO. `sizes` is
 * in CSS pixels and the browser multiplies it by the screen's density before
 * choosing. "640px" on a 2x phone asks for 1280 device pixels, and the
 * candidates are 400, 640, 960 and the 1672px original, so it picked the
 * ORIGINAL: worse than the 100vw it replaced. "320px" asks for 640 and gets
 * the 640. Written down because this is the trap in `sizes` and the first
 * attempt walked into it.
 */
export const SIZES_HERO_WASH = "320px";

/** A portrait or a small square: never more than a quarter of a phone. */
export const SIZES_PORTRAIT = "(min-width: 1024px) 200px, 30vw";
