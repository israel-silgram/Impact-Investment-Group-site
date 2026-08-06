import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { DirectorCard } from "@/components/about/director-card";
import { cn } from "@/lib/utils";
import {
  accountableChain,
  chainAccents,
  chainNotices,
  figureAccents,
  problemFigures,
  problemHeading,
  straplines,
  summaries,
  team,
  teamTitle,
  whatWeDo,
  whoWeAre,
  whyPartner,
  whyWeExist,
  type Seg,
} from "@/content/about";

/**
 * /about — the old production site's layout, on the homepage's section rhythm.
 *
 *   1 · Who We Are + the team        cream
 *   2 · Why We Exist + the figures   navy
 *   3 · What We Do + the chain       cream
 *   4 · Why Partner + the close      navy
 *
 * ── How the two grounds are handled ───────────────────────────────────────
 *
 * Everything is written in the DARK idiom — `text-white`, `text-mist`,
 * `text-teal-400`, `panel`, `border-navy-700` — and the cream sections carry
 * `.section-light`, which re-points all of it onto the light palette. That is
 * what the stylesheet is built to do, and it is why there is not a single
 * conditional colour in this file. `panel` in particular is a utility that is
 * a navy card on navy and a white card on cream, so every card here adapts
 * without being told which section it is in.
 *
 * The one exception is the eyebrow. The old site's rust eyebrow reads well on
 * cream but not on navy, and orange-700 is the only orange `.section-light`
 * lets through as text — so `Head` takes a tone and the navy sections use teal.
 *
 * LOOK comes from the old iip-web About page; COPY is the client's four
 * sections, verbatim; the TEAM layout is kept as built. Blocks that only
 * existed on the old page are folded into the section that answers for them:
 * the sourced figures into Why We Exist, the three-company chain and both of
 * its compliance paragraphs into What We Do. Every figure keeps a live link to
 * its publication — none may appear without one.
 */

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Who we are, why we exist, what we do and why partner with us — a national property and housing ecosystem connecting investors, landlords and developers with councils, housing associations and care and support organisations.",
      },
      { property: "og:title", content: "About Us — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "Connecting property, investment and housing demand to transform lives. Our purpose, our ecosystem, our group structure and how a partnership starts.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

/**
 * Emphasis inside a summary line.
 *
 * "ink" is bold in the section's strongest text colour — `text-white`, which
 * `.section-light` re-points to navy-900, so it is black on cream and white on
 * navy without a conditional.
 *
 * "accent" cannot do the same trick. `.section-light` rewrites orange-500 to
 * navy ink, and orange-700 — the one orange it lets through — is 4.1:1 on the
 * cream and only clears AA as LARGE text. So the claim line is set at 20px
 * minimum, semibold, where orange-700 qualifies as large text and passes; the
 * smaller lines under it get `small` and their accents fall back to ink. On
 * navy none of this applies — orange-500 is 7.2:1 at any size.
 */
function Rich({
  parts,
  tone,
  small,
}: {
  parts: Seg[];
  tone: "rust" | "teal";
  small?: boolean;
}) {
  /*
   * On the CREAM, an accent in a small line is demoted to navy ink. orange-700
   * is 4.1:1 there and only passes as large text, so orange below ~19px
   * semibold would be a real contrast failure rather than a style choice. Ink
   * is 16.8:1 and still reads as emphasis. On NAVY there is no such problem —
   * orange-500 is 7.2:1 at any size — so `small` changes nothing there.
   */
  const accent =
    tone === "teal" ? "text-orange-500" : small ? "text-white" : "text-orange-700";
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <strong
            key={i}
            className={cn("font-bold", part.em === "accent" ? accent : "text-white")}
          >
            {part.t}
          </strong>
        ),
      )}
    </>
  );
}

/** Per-card accents, so a row of data does not read as one block of colour. */
const ACCENT = {
  teal: { text: "text-teal-400", bar: "bg-teal-400", disc: "bg-teal-400 text-navy-900" },
  orange: { text: "text-orange-500", bar: "bg-orange-500", disc: "bg-orange-500 text-white" },
  white: { text: "text-white", bar: "bg-white/70", disc: "bg-white text-navy-900" },
} as const;

/**
 * Section shell: one ground, one container, one padding value everywhere.
 *
 * `image` washes a photograph in behind the copy at 12% — texture, not a
 * picture. Three things keep it from becoming decoration that fights the text:
 *
 *   · 9%. It started at 12% and Callum took three points off it by eye. Past
 *     ~15% the stat cards start to sit on shapes rather than on a ground and
 *     the eye reads the roofs instead of the figures — 9% is texture you
 *     notice only once you look for it, which is the point.
 *   · The scrim fades to solid navy at the top and bottom, so the band still
 *     meets its neighbours on a clean edge rather than a torn photograph.
 *   · `alt=""` and `aria-hidden`. It carries no information; a screen reader
 *     announcing "aerial view of a housing estate" here would be noise.
 *
 * It is only ever used on a NAVY band. On cream there is no scrim dark enough
 * to hold it back, which is exactly the version of this Callum rejected on the
 * homepage — do not put one behind a `.section-light` band.
 */
function Band({
  id,
  light,
  image,
  children,
}: {
  id: string;
  light?: boolean;
  image?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "relative isolate border-t border-navy-700",
        light ? "section-light" : "bg-navy-900",
        image && "overflow-hidden",
      )}
    >
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1600}
            height={640}
            className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-[0.09]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-navy-900 via-transparent to-navy-900"
          />
        </>
      ) : null}
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 lg:py-14">{children}</div>
    </section>
  );
}

/** Small eyebrow over a large heading — the old page's section head. */
function Head({
  eyebrow,
  title,
  id,
  tone = "teal",
  hero,
}: {
  eyebrow: string;
  title: string;
  id?: string;
  tone?: "teal" | "rust";
  hero?: boolean;
}) {
  const Tag = hero ? "h1" : "h2";
  return (
    <>
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
          hero
            ? "text-[clamp(2rem,4.6vw,3.25rem)]"
            : "text-[clamp(1.5rem,2.8vw,2rem)]",
        )}
      >
        {title}
      </Tag>
    </>
  );
}

/** Sub-head inside a band. */
function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="heading-tight mt-10 text-balance text-[clamp(1.25rem,2.2vw,1.5rem)] font-bold text-white">
      {children}
    </h3>
  );
}

/**
 * A section's whole copy: one or two SHORT lines, in place of a lead sentence
 * plus a two-paragraph body.
 *
 * The first line is the claim and runs large and semibold. Anything after it is
 * a step down — smaller, regular weight, a narrower measure. That size drop is
 * doing the work: a reader takes the first line at a glance and only reads on
 * if they want the detail, which is not true of two paragraphs set identically.
 *
 * ⚠️ The measures are deliberately tight (52ch / 58ch, against the usual 62ch).
 * Long lines are the other half of why the old copy read as heavy — the eye
 * loses the start of the next line somewhere past ~65 characters.
 */
function Summary({
  lines,
  tone,
  centre,
}: {
  lines: Seg[][];
  tone: "rust" | "teal";
  centre?: boolean;
}) {
  return (
    <div className={cn("mt-5 flex flex-col gap-3", centre && "items-center")}>
      {lines.map((parts, i) => (
        <p
          key={i}
          className={cn(
            i === 0
              ? /* The claim. Scales with the viewport so it still reads as the
                   loudest thing under the heading on a large screen. Never
                   below 20px — that is the floor at which orange-700 on the
                   cream is still legally large text. */
                "max-w-[48ch] text-[clamp(1.25rem,2.1vw,1.5rem)] font-semibold leading-[1.35] text-white"
              : "max-w-[56ch] text-[16.5px] leading-[1.6] text-mist",
            centre && "text-center",
          )}
        >
          <Rich parts={parts} tone={tone} small={i > 0} />
        </p>
      ))}
    </div>
  );
}

function AboutPage() {
  return (
    <main>
      {/*
       * ── 1 · Who We Are + the team ── cream ─────────────────────────────
       *
       * TWO COLUMNS, NOT THREE BLOCKS. This used to be copy + an AI-generated
       * meeting photograph, and then the team as a separate full-width block
       * underneath — three things stacked, and the illustrative photograph was
       * the least true of them.
       *
       * The photograph is gone. Israel now holds that slot as a tall portrait
       * card on the right, and the team folds into the left column beneath the
       * copy as four rows. Two rows stack to roughly the height of the portrait
       * card, which is what makes the two columns finish level.
       *
       * The order is deliberate on narrow screens too: copy, then Israel, then
       * the rest of the team — `order-*` puts the portrait between them rather
       * than leaving it stranded at the bottom.
       */}
      <Band id="about-heading" light>
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start lg:gap-10">
          {/* Explicit grid placement rather than `order-*`: source order is
              already the reading order on a phone — copy, Israel, then the
              team — and the placement classes only take effect from lg up. */}
          <Reveal className="lg:col-start-1 lg:row-start-1">
            <Head
              eyebrow={whoWeAre.eyebrow}
              title={whoWeAre.title}
              id="about-heading"
              tone="rust"
              hero
            />
            <Summary lines={summaries.whoWeAre!} tone="rust" />
          </Reveal>

          <Reveal index={1} className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <DirectorCard director={team[0]!} variant="portrait" />
          </Reveal>

          {/* One column, not two. Four stacked rows come out at almost exactly
              the height of Israel's card, which is what makes the two columns
              finish level — and a row is easier to read than a 2×2 grid of
              them.

              NO WIDTH CAP. They deliberately run the full width of the column,
              right up to the grid gap beside Israel's card, so the block reads
              as one team rather than a narrow list floating in the section. */}
          <div className="lg:col-start-1 lg:row-start-2">
            <p className="eyebrow tracking-[0.14em] text-orange-700">{teamTitle}</p>
            <ul className="mt-3.5 flex flex-col gap-3">
              {team.slice(1).map((member, i) => (
                <Reveal key={member.name} index={i} as="li">
                  <DirectorCard director={member} variant="row" />
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Band>

      {/* ── 2 · Why We Exist + the figures ── navy ───────────────────────── */}
      <Band id="why-heading" image="/images/why-estate-aerial.webp">
        <Head eyebrow={whyWeExist.eyebrow} title={whyWeExist.title} id="why-heading" />
        <Summary lines={summaries.whyWeExist!} tone="teal" />

        <SubHead>{problemHeading}</SubHead>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {problemFigures.map((figure, i) => (
            <Reveal key={figure.id} index={i} as="li">
              {/* One accent per card — a 3px top bar and the figure itself. Four
                  identical cards made the row read as a single block. */}
              <div className="panel relative flex h-full flex-col overflow-hidden p-5 pt-6">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-0 h-[3px]",
                    ACCENT[figureAccents[i % figureAccents.length]!].bar,
                  )}
                />
                <p className={cn("eyebrow", ACCENT[figureAccents[i % figureAccents.length]!].text)}>
                  {figure.kind}
                </p>
                <p
                  className={cn(
                    "mt-2.5 font-heading text-[clamp(1.75rem,2.8vw,2.125rem)] font-extrabold leading-none tracking-[-0.02em]",
                    ACCENT[figureAccents[i % figureAccents.length]!].text,
                  )}
                >
                  {figure.value}
                </p>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist">{figure.label}</p>
                {/* A figure without its source does not go on this page. */}
                <a
                  href={figure.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-auto inline-flex items-start gap-1 pt-3.5 text-[11px] font-semibold leading-snug text-teal-400 transition-colors duration-200 hover:text-white"
                >
                  <span>Source: {figure.source}</span>
                  <ArrowUpRight aria-hidden="true" className="mt-px size-3 shrink-0" />
                </a>
              </div>
            </Reveal>
          ))}
        </ul>
      </Band>

      {/* ── 3 · What We Do + the chain ── cream ──────────────────────────── */}
      <Band id="what-heading" light>
        <Head eyebrow={whatWeDo.eyebrow} title={whatWeDo.title} id="what-heading" tone="rust" />
        <Summary lines={summaries.whatWeDo!} tone="rust" />

        <SubHead>Three companies, one accountable chain.</SubHead>
        {/* An actual chain rather than three cards in a row: numbered discs,
            an arrow between each pair, and one accent per company. The arrows
            are decorative — the ordered list carries the sequence for anyone
            not seeing them. */}
        <ol className="mt-5 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {accountableChain.map((company, i) => {
            const accent = ACCENT[chainAccents[i % chainAccents.length]!];
            return (
              <React.Fragment key={company.id}>
                {i > 0 ? (
                  <li
                    aria-hidden="true"
                    className="hidden items-center justify-center md:flex"
                  >
                    <ArrowRight className="size-5 text-slate-muted" strokeWidth={2} />
                  </li>
                ) : null}
                <Reveal index={i} as="li" className="h-full">
                  <div className="panel flex h-full flex-col p-5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-9 place-items-center rounded-full font-heading text-[15px] font-extrabold",
                        accent.disc,
                      )}
                    >
                      {i + 1}
                    </span>
                    <h4 className="mt-3.5 font-heading text-[15px] font-bold text-white">
                      {company.name}
                    </h4>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{company.body}</p>
                    {company.qualifier ? (
                      <p className="mt-auto pt-3 text-[12px] leading-relaxed text-slate-muted">
                        {company.qualifier}
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              </React.Fragment>
            );
          })}
        </ol>

        {/* Compliance, both paragraphs, verbatim. Neither may be dropped. */}
        <div className="mt-6 flex flex-col gap-2.5">
          {chainNotices.map((notice) => (
            <p key={notice} className="max-w-[104ch] text-[12px] leading-relaxed text-slate-muted">
              {notice}
            </p>
          ))}
        </div>
      </Band>

      {/* ── 4 · Why Partner + the close ── navy ──────────────────────────── */}
      <Band id="partner-heading">
        {/* Centred end to end — heading, line, strapline and actions all on one
            axis. Left-aligned copy over centred buttons was what made this read
            as two half-finished layouts stacked. */}
        <div className="text-center">
          <Head eyebrow={whyPartner.eyebrow} title={whyPartner.title} id="partner-heading" />
        </div>
        <Summary lines={summaries.whyPartner!} tone="teal" centre />

        <Reveal className="mt-10 text-center">
          <p className="heading-tight text-balance font-heading text-[clamp(1.375rem,2.8vw,1.875rem)] font-extrabold text-orange-500">
            {whyPartner.strapline}
          </p>
          <p className="mt-3 text-[14px] font-semibold text-mist">
            {straplines.join("  ·  ")}
          </p>

          <PreReleaseBadge className="mt-6 justify-center" />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" asChild>
              <Link to="/contact" search={{ enquiry: "waitlist", type: "waitlist" }}>
                {whyPartner.cta}
              </Link>
            </Button>
            <Button variant="secondary" asChild withArrow={false}>
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                Become a Partner
              </Link>
            </Button>
          </div>
        </Reveal>
      </Band>
    </main>
  );
}
