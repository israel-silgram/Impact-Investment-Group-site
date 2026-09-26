import { variantSrcSet } from "@/lib/responsive-image";
import { cn } from "@/lib/utils";

/**
 * Brand logo lockup — THE ACTUAL ARTWORK, not a redrawing of it.
 *
 * This used to be a hand-built SVG that approximated the mark: paths traced by
 * eye, a two-line "Impact Investment / Platform" wordmark set in Barlow, and a
 * ring that was close to the real one without being it. Every page carried that
 * approximation. It is gone. Both files below are the supplied brand artwork,
 * background keyed to transparency and trimmed to the ink.
 *
 * ── The two colourways ────────────────────────────────────────────────────
 *
 * The supplied logo is drawn in navy and orange for a WHITE ground. Placed on
 * this site's navy, the navy half of it — the house, the lower arc of the ring,
 * "Impact" and "Group" — disappears. So there are two files:
 *
 *   on-navy   logo-lockup-reverse.webp   white mark and words, orange kept
 *   on-cream  logo-lockup.webp           the supplied navy and orange
 *
 * WAVE 493: ONE LINE, NOT THREE. Callum, 26 Sep 2026: every page shows the
 * logo as the platform's bar shows it, the ring-and-house mark, a rule, and
 * "Impact Investment Group" on ONE line. Both files are 2006 by 310, the
 * platform's own `iig-logo.png` exported to WebP; the reverse is derived from
 * it by `scripts/make_reverse.py` (every navy or neutral pixel lifted to
 * white, every orange pixel and the alpha untouched), never redrawn. Its two
 * oranges are the same two wave 443 put in the three-line files, the primary ink
 * in the word and the primary in the mark, so the palette did not move.
 *
 * ⚠️ A LIGHT SECTION MUST PASS variant="on-cream". The default is the reverse
 * file, which is white artwork — invisible on cream. There is no way to detect
 * the ground from inside this component; `.section-light` remaps Tailwind
 * colour utilities, and an <img> has no colour utility to remap.
 *
 * ── Sizing ────────────────────────────────────────────────────────────────
 *
 * Height-driven, width auto, never squeezed and never cropped: the lockup is
 * 6.47:1, so every height below is also a width. Measured by
 * `scripts/wave493-logo.py` on the built site, which asserts each of them.
 *
 *   bar, under 640px     34px tall, 220 wide. The bar is 56px, and 34 is the
 *                        tallest the PANEL can take at 360 (below), which the
 *                        bar matches so the two read as one mark.
 *   bar, 640 to 1279     44px, 285 wide. Only the menu button shares the bar.
 *   bar, 1280 to 1439    36px, 233 wide. The six nav links (641px) and the
 *                        register pill with Log in (283px) share 1216px with
 *                        it, and justify-between splits what is left into the
 *                        two spaces either side of the nav. At 36 each is
 *                        29px, no tighter than the nav's own 28px between
 *                        links, so the three groups still read as three. At
 *                        44 the bar is 25px too narrow and something breaks.
 *   bar, 1440 and up     44px again, with 83px either side of the nav.
 *   panel, every width   34px. The menu panel is min(21rem, 88vw) wide with
 *                        a 1px rule, 20px of padding and a 44px close button,
 *                        which at 360 leaves 231.8px: 34px tall is 219 wide
 *                        and keeps 12.4px clear of the button. 35 would not.
 *   footer               44px, 285 wide, unless its grid column is narrower.
 *                        At 1024 to 1279 the first column is 240 to 311px, so
 *                        the lockup takes the column's width and its height
 *                        follows (37px at 1024), by max-width and max-height
 *                        on an auto-sized image, which scale it as one.
 *
 * The one-line wordmark stays readable well under every height above (R493-4
 * puts the floor at 28px), so nothing on the site needs the mark on its own
 * any more; `<LogoMark />` stays for a favicon-sized slot.
 *
 * `sizes` states those widths, so a 2x phone takes the 640px step for a
 * 440-pixel box and a 1x one takes the 400.
 */

const LOCKUP = {
  "on-navy": "/images/brand/logo-lockup-reverse.webp",
  "on-cream": "/images/brand/logo-lockup.webp",
} as const;

const MARK = {
  "on-navy": "/images/brand/logo-mark-reverse.webp",
  "on-cream": "/images/brand/logo-mark.webp",
} as const;

export type LogoVariant = keyof typeof LOCKUP;

/** Where the lockup sits, which decides its height. See the sizing note. */
export type LogoSize = "bar" | "panel" | "footer";

const SIZE: Record<LogoSize, { className: string; sizes: string }> = {
  // `xl:max-[1440px]:h-9` rather than `xl:h-9 min-[1440px]:h-11`: Tailwind 4
  // emits an arbitrary `min-[...]` rule BEFORE the named breakpoints, so the
  // second form left the bar at 36px at 1440 too. A band that closes is the
  // form whose order cannot matter.
  bar: {
    className: "h-[34px] w-auto sm:h-11 xl:max-[1440px]:h-9",
    sizes: "(min-width: 1440px) 285px, (min-width: 1280px) 233px, (min-width: 640px) 285px, 220px",
  },
  panel: { className: "h-[34px] w-auto", sizes: "220px" },
  footer: { className: "h-auto w-auto max-h-11 max-w-full", sizes: "285px" },
};

export function Logo({
  className,
  variant = "on-navy",
  size = "bar",
}: {
  className?: string;
  variant?: LogoVariant;
  size?: LogoSize;
}) {
  return (
    <span className={className}>
      {/*
       * alt="" and aria-hidden, with the name carried by the sr-only span
       * below instead. The lockup is the company name set as a picture: if
       * the <img> carried it too, every link wrapping this logo would announce
       * the name twice.
       */}
      <img
        src={LOCKUP[variant]}
        srcSet={variantSrcSet(LOCKUP[variant])}
        sizes={SIZE[size].sizes}
        loading="eager"
        fetchPriority="high"
        alt=""
        aria-hidden="true"
        width={2006}
        height={310}
        className={SIZE[size].className}
      />
      <span className="sr-only">Impact Investment Group — home</span>
    </span>
  );
}

/**
 * The ring and house without the wordmark, for a slot too small for the
 * lockup at 28px tall: a favicon-sized slot or a badge. Nothing renders it
 * since wave 493.
 * Same two colourways and the same rule about which ground takes which.
 */
export function LogoMark({
  className,
  variant = "on-navy",
}: {
  className?: string;
  variant?: LogoVariant;
}) {
  return (
    <img
      src={MARK[variant]}
      srcSet={variantSrcSet(MARK[variant])}
      sizes="36px"
      loading="eager"
      fetchPriority="high"
      alt=""
      aria-hidden="true"
      width={254}
      height={264}
      className={cn("h-9 w-auto", className)}
    />
  );
}
