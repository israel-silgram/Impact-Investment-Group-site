import { Link } from "@tanstack/react-router";

import { RoleIcon } from "@/components/register/role-icon";
import { registerRoles } from "@/content/audiences";
import { registerAsDivider } from "@/content/register";
import { cn } from "@/lib/utils";

/**
 * HomeHero — the approved Mock-up 1 composition: three photographs captioned
 * with the three headlines, the wait-list divider and ten role cards. No
 * buttons, no statistics, no scroll indicator. The role cards are the call to
 * action.
 *
 * The photographs lead and the words follow, and the whole section is built to
 * land inside the first screen — nothing here should need scrolling to. That
 * constraint drives the sizing: everything below the pictures is a fixed
 * stack, so the pictures take whatever height is left over and the band's
 * width follows from that rather than from the page's.
 */

const headlines = [
  { id: "homes", text: "Providing Homes", orange: false },
  { id: "support", text: "Delivering Support", orange: true },
  { id: "lives", text: "Transforming Lives", orange: false },
] as const;

/**
 * One size for all three headlines, in `cqw` — a percentage of the panel,
 * whose width is the photograph's width. Sizing each line to fill its own
 * column instead makes the short one visibly larger than the other two, which
 * reads as a mistake rather than as alignment.
 *
 * So the size is set by the widest string and the other two centre under
 * their pictures. Derived from Barlow 800's own advance widths, read off
 * `@fontsource/barlow/files/barlow-latin-800-normal.woff2` at 1000 upem, plus
 * the -0.02em tracking that CSS applies after every character, the last one
 * included:
 *
 *   Providing Homes     7.554em − 15 × 0.02 = 7.254em  → spans 86% of its column
 *   Delivering Support  8.344em − 18 × 0.02 = 7.984em  → spans 95%
 *   Transforming Lives  8.753em − 18 × 0.02 = 8.393em  → the binding one, 100%
 *
 * 100 / 8.393 = 11.91, less 0.5% for sub-pixel rounding. This is the largest
 * common size that fits; anything above it overflows "Transforming Lives".
 * Barlow applies no kerning to any pair in these three strings — checked
 * against its GPOS table, all three total zero — so the fit is exact rather
 * than approximate.
 *
 * If the copy ever changes, re-measure the longest line. Do not nudge by eye.
 */
const HEADLINE_FILL_CQW = 11.85;

/**
 * Served from /public, not imported as modules: the originals were Lovable
 * asset descriptors whose URLs only resolve inside Lovable's hosting, so they
 * rendered as broken images everywhere else.
 *
 * All three are 1280×1024 — exactly the 5:4 the frames are set to, so
 * object-cover never actually crops anything at any viewport. They are the
 * page's LCP, hence fetchPriority high and no lazy loading.
 *
 * 5:4 landscape is not a free choice. In the site's 1440px container the three
 * slots are 445px wide, and what is left of a screen once the headlines, the
 * Register as rule and the ten tiles are accounted for is a little under 380px.
 * 5:4 is the tallest standard ratio that both fills the row and keeps the
 * section inside one screen. The earlier 4:5 portrait set needed 556px of
 * height for the same width, which is why the band had to shrink away from the
 * page edges to fit.
 *
 * Supplied as 1536×1024 and centre-cropped 128px each side. WebP q90 rather
 * than PNG: 4.4 MB became 0.62 MB. The superseded `hero-{1,2,3}-*.png` files
 * in public/images are no longer referenced.
 */
const photos = [
  {
    id: "homes",
    src: "/images/hero-homes.webp",
    width: 1280,
    height: 1024,
    alt: "A woman handing a set of keys to a man on the pavement outside a brick terrace at sunset",
  },
  {
    id: "support",
    src: "/images/hero-support.webp",
    width: 1280,
    height: 1024,
    alt: "A carer in uniform resting a hand on the shoulder of an older woman seated in an armchair in a lamplit living room",
  },
  {
    id: "lives",
    src: "/images/hero-lives.webp",
    width: 1280,
    height: 1024,
    alt: "A family of four smiling together outside the navy front door of their red-brick home",
  },
] as const;

/**
 * Photograph and headline travel together, so the caption can never drift out
 * of step with the image above it. Matched on the shared id rather than on
 * array position — the two lists are edited independently.
 */
const panels = photos.map((photo) => ({
  ...photo,
  headline: headlines.find((line) => line.id === photo.id) ?? headlines[0],
}));

export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex flex-col justify-center overflow-hidden bg-navy-900 md:min-h-[calc(100svh_-_77px)]"
    >
      {/* The street, ghosted. Decorative only — it carries no information the
          copy does not, so it is empty-alt and hidden from the tree.

          z-0 rather than -z-10: a negative index would put it behind the
          section's own navy background and it would never be seen. The content
          wrappers below therefore have to be positioned to paint over it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <img
          src="/images/hero-ground-street.webp"
          alt=""
          decoding="async"
          className="size-full object-cover object-[60%_45%] opacity-[0.14]"
        />
        <div className="hero-ground absolute inset-0" />
      </div>

      <h1 id="hero-heading" className="sr-only">
        Providing homes, delivering support, transforming lives
      </h1>

      {/* Row 1 — three photographs, each captioned with its own headline.
          Landscape at every width, and 5:4 is the photographs' own ratio, so
          nothing is ever cropped. From 768px the band is sized off the
          viewport's height rather than the page's width — see .hero-band —
          so the whole section lands inside the first screen. */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pt-8 sm:px-8">
        <div className="hero-band grid grid-cols-1 gap-5 md:grid-cols-3">
          {panels.map((panel) => (
            <figure key={panel.id} className="hero-panel flex flex-col">
              <img
                src={panel.src}
                alt={panel.alt}
                width={panel.width}
                height={panel.height}
                sizes="(min-width: 768px) 30vw, 100vw"
                fetchPriority="high"
                className="aspect-[5/4] w-full rounded-xl border border-white/14 object-cover"
              />
              {/* Sized to the panel, so the longest line spans its photograph
                  exactly and the other two centre under theirs. nowrap is safe
                  here in a way it never was at a fixed size: the size is
                  derived from the widest string's own width, so no line can
                  outgrow its column at any viewport. */}
              <figcaption
                style={{ fontSize: `${HEADLINE_FILL_CQW}cqw` }}
                className={cn(
                  "whitespace-nowrap pt-4 text-center font-heading font-extrabold leading-tight tracking-[-0.02em]",
                  /* orange-400, not orange-500: this word is set over the
                     ghosted street, where the terracotta measures 3.15:1
                     against the brightest pixel. See .hero-ground. */
                  panel.headline.orange ? "text-orange-400" : "text-white",
                )}
              >
                {panel.headline.text}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-6 sm:px-8">
        {/* Row 2 — the wait-list divider. The rules are non-text marks, so they
            keep orange-500 at 4.01:1 on the navy. */}
        <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
          <span aria-hidden="true" className="h-0.5 w-8 shrink-0 bg-orange-500 sm:w-[90px]" />
          <p
            id="register-as"
            className="text-center text-[15px] font-normal leading-snug text-white"
          >
            {registerAsDivider}
          </p>
          <span aria-hidden="true" className="h-0.5 w-8 shrink-0 bg-orange-500 sm:w-[90px]" />
        </div>

        {/* Row 3 — ten role cards. The card itself is now just the icon and
            the role: the detail line sits outside it, beneath, so the tile
            stays compact. It is tied back to the link with aria-describedby,
            otherwise moving it out of the anchor would strip that context
            from anyone navigating by link. */}
        <ul
          aria-labelledby="register-as"
          className="hero-role-grid mt-5 items-stretch gap-3"
        >
          {registerRoles.map((role) => {
            const detailId = `hero-role-${role.id}-detail`;
            const className =
              "flex w-full min-h-11 flex-col items-center gap-2.5 rounded-xl border border-white/16 px-2.5 py-3 text-center transition-colors duration-200 hover:border-orange-500/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400";
            const body = (
              <>
                <RoleIcon roleId={role.id} />
                {/* Two lines reserved: "Housing Association" wraps where the
                    shorter roles do not, and every card in the row has to end
                    at the same height so the detail lines share a baseline. */}
                <span className="flex min-h-[2.6em] items-center text-[14px] font-semibold leading-snug text-white">
                  {role.label}
                </span>
              </>
            );
            return (
              <li key={role.id} className="flex flex-col">
                {/* Wave 295: the tiles used to scatter — nine into anchors on
                    /solutions and the resident's into the contact form. They
                    now all land on the same shape of page, the one that asks
                    this role its own questions. The label above the tile is
                    the promise; that page is the promise kept. */}
                <Link
                  to="/register/$role"
                  params={{ role: role.id }}
                  aria-describedby={detailId}
                  className={className}
                >
                  {body}
                </Link>
                <span
                  id={detailId}
                  className="mt-2 px-1 text-center text-[13px] font-normal leading-[1.4] text-white/62"
                >
                  {role.detail}
                </span>
              </li>
            );
          })}
        </ul>

          {/*
           * Data provenance, at the foot of the hero rather than the top.
           *
           * It went here and not beside the header because the gap between the
           * header and the photographs is 32px â€” a credit line in it collides
           * with the Register Here button directly above. At the foot it closes
           * the section, sits on the fold, and competes with nothing.
           *
           * White wordmark on transparent, keyed from the supplied artwork.
           * Zoopla's own file is white-on-purple; the purple would fight the
           * navy, and their reversed mark is the one meant for dark grounds.
           *
           * THE AGREEMENT THAT BACKS THIS CLAIM sits with the backend team â€”
           * it is a Zoopla data agreement for the platform, and the line was
           * added on their instruction (Callum, Aug 2026). Recording it here
           * because this is a claim about a commercial relationship carrying
           * a third party's trademark, and the next person to read this file
           * will otherwise have to go and ask.
           *
           * Still worth doing once: check Zoopla's brand guidelines for the
           * reversed mark, minimum size and clear space. Deleting this block
           * is the whole of the rollback.
           */}
          <p className="mt-6 flex items-center justify-center gap-2.5">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
              Powered by
            </span>
            <img
              src="/images/brand/zoopla-white.webp"
              alt="Zoopla"
              width={548}
              height={120}
              className="h-[18px] w-auto opacity-90"
            />
          </p>
      </div>
    </section>
  );
}
