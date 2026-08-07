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
 *   on-navy   logo-lockup-reverse.webp   navy ink lifted to white, orange kept
 *   on-cream  logo-lockup.webp           the artwork exactly as supplied
 *
 * The orange is never substituted, tinted or lifted in either — it is the one
 * part of the mark that holds its contrast on both grounds (7.2:1 on the navy,
 * and it is artwork rather than text on the cream, so the text rule does not
 * bind). Only the navy moves, and only because on navy it is invisible.
 *
 * ⚠️ A LIGHT SECTION MUST PASS variant="on-cream". The default is the reverse
 * file, which is white artwork — invisible on cream. There is no way to detect
 * the ground from inside this component; `.section-light` remaps Tailwind
 * colour utilities, and an <img> has no colour utility to remap.
 *
 * ── Sizing ────────────────────────────────────────────────────────────────
 *
 * Height-driven, width auto: the lockup is 2.7:1 and must never be squeezed.
 * 44px on mobile, 52px from sm — the wordmark is three stacked lines ("Impact
 * / Investment / Group"), so at 44px each line is about 12px and at 52px about
 * 14px. Below ~40px the third line stops being readable and `<LogoMark />`
 * is the right call instead.
 *
 * The files are exported at 264px tall — 5× the largest rendered size — so the
 * mark stays crisp on a 2× display and under browser zoom.
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

export function Logo({
  className,
  variant = "on-navy",
}: {
  className?: string;
  variant?: LogoVariant;
}) {
  return (
    <span className={className}>
      {/*
       * alt="" and aria-hidden, with the name carried by the sr-only span
       * below instead. The lockup is the company name set as a picture — if
       * the <img> carried it too, every link wrapping this logo would announce
       * "Impact Investment Group, Impact Investment Group — home".
       */}
      <img
        src={LOCKUP[variant]}
        alt=""
        aria-hidden="true"
        width={711}
        height={264}
        className="h-11 w-auto sm:h-[52px]"
      />
      <span className="sr-only">Impact Investment Group — home</span>
    </span>
  );
}

/**
 * The ring and house without the wordmark, for anywhere the lockup would have
 * to run below ~40px tall — a collapsed header, a favicon-sized slot, a badge.
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
      alt=""
      aria-hidden="true"
      width={254}
      height={264}
      className={cn("h-9 w-auto", className)}
    />
  );
}
