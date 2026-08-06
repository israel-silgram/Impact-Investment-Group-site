import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { DirectorCard } from "@/components/about/director-card";
import { cn } from "@/lib/utils";
import {
  accountableChain,
  chainAccents,
  chainNotice,
  chainNoticeEmphasis,
  figureAccents,
  problemFigures,
  problemHeading,
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

/**
 * Bolds the listed substrings inside a plain string, in place.
 *
 * Used for the compliance notice, where the four negatives ("not authorised or
 * regulated by…") have to be the parts a skimming reader's eye stops on. The
 * terms are matched literally and each is expected to appear ONCE — if a term
 * is not found it is silently skipped rather than throwing, because a missing
 * bold is a styling regression and a blank compliance notice is not.
 */
function Emphasise({ text, terms }: { text: string; terms: string[] }) {
  const pattern = terms
    .filter((t) => text.includes(t))
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (!pattern) return <>{text}</>;
  return (
    <>
      {text.split(new RegExp(`(${pattern})`, "g")).map((chunk, i) =>
        terms.includes(chunk) ? (
          <strong key={i} className="font-semibold text-white">
            {chunk}
          </strong>
        ) : (
          <span key={i}>{chunk}</span>
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

      {/*
       * ── 3 · What We Do + the chain ── cream ────────────────────────────
       *
       * Five things on the whole band: eyebrow, title, the statement, three
       * cards, one notice. The sub-head ("Three companies, one accountable
       * chain.") and the descriptive summary line that used to sit between the
       * title and the cards are both GONE — the three claims say it better than
       * a sentence about the three claims did.
       *
       * The cards lead with the claim and credit the company underneath. There
       * is no arrow between them any more and no numbered disc: the left rule,
       * the claim and the chip carry it, and the ordered list still gives the
       * sequence to a screen reader.
       */}
      <Band id="what-heading" light>
        <Head eyebrow={whatWeDo.eyebrow} title={whatWeDo.title} id="what-heading" tone="rust" />
        {/* The statement, not a summary. Larger than a Summary line and on its
            own — this is the sentence the section exists to land. */}
        <p className="mt-4 max-w-[44ch] text-[clamp(1.375rem,2.4vw,1.625rem)] font-semibold leading-[1.32] text-white">
          Three companies. <strong className="font-bold text-orange-700">One chain.</strong> No gap
          for a person to fall through.
        </p>

        <ol className="mt-8 grid items-stretch gap-4 md:grid-cols-3">
          {accountableChain.map((step, i) => {
            const accent = chainAccents[i % chainAccents.length]!;
            const rule = accent === "orange" ? "bg-orange-600" : "bg-teal-600";
            /* The chip is a tinted pill, not a filled one: orange-700 text on a
               12% orange wash is still measured against the CREAM behind it —
               the wash is too light to change the ratio — so it holds 4.1:1 at
               11px uppercase bold, which clears AA for bold small text. A
               filled orange pill with white on it would not. */
            const chip =
              accent === "orange"
                ? "bg-orange-600/12 text-orange-700"
                : "bg-teal-600/12 text-teal-600";
            return (
              <Reveal key={step.id} index={i} as="li" className="h-full">
                <div className="panel relative flex h-full flex-col overflow-hidden p-6 pl-7">
                  <span
                    aria-hidden="true"
                    className={cn("absolute inset-y-0 left-0 w-1", rule)}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="heading-tight max-w-[14ch] font-heading text-[clamp(1.25rem,1.9vw,1.5rem)] font-extrabold tracking-[-0.015em] text-white">
                      {step.claim}
                    </h4>
                    <img
                      src={step.icon}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      width={288}
                      height={288}
                      className="size-14 shrink-0"
                    />
                  </div>
                  <p className="mt-3 pb-4 text-[13px] leading-relaxed text-mist">{step.detail}</p>
                  <p
                    className={cn(
                      "mt-auto w-fit rounded-full px-3 py-1.5 font-heading text-[11px] font-extrabold uppercase tracking-[0.1em]",
                      chip,
                    )}
                  >
                    {step.name}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>

        {/* The compliance notice. It is a NOTICE, not body copy — the shield,
            the tinted strip and the bolded negatives are all there so it reads
            as one, and so the four things it denies are the parts the eye
            stops on. See content/about.ts for what may and may not be cut. */}
        <div className="mt-7 flex items-start gap-3 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/40 p-4">
          <ShieldAlert
            aria-hidden="true"
            className="mt-px size-[17px] shrink-0 text-slate-muted"
            strokeWidth={1.8}
          />
          <p className="max-w-[104ch] text-[12.5px] leading-relaxed text-slate-muted">
            <Emphasise text={chainNotice} terms={chainNoticeEmphasis} />
          </p>
        </div>
      </Band>

      {/*
       * ── 4 · Why Partner + the close ── navy ────────────────────────────
       *
       * The three beats ARE the heading here. "Why Partner With Us?" has been
       * demoted into the eyebrow and the strapline promoted to display size,
       * because this is the last thing on the page before the footer and a
       * closing section should make one loud claim rather than ask a question
       * and then answer it quietly.
       *
       * Middle beat in orange, outer two in white. One accent in a stack of
       * three is a rhythm; three would just be an orange block.
       *
       * ⚠️ THE HEADING IS STILL AN <h2>, and it is still the three beats joined
       * back into the original sentence for anything that reads the document
       * rather than looks at it — `sr-only` carries "Why Partner With Us?" so
       * the outline of the page has not changed just because the type has.
       *
       * Two actions, not three. "Contact Us" was the middle of three and is in
       * both the nav and the footer; with three side by side none of them read
       * as the primary.
       */}
      <Band id="partner-heading">
        <div className="text-center">
          <p className="eyebrow tracking-[0.14em] text-teal-400">
            {whyPartner.eyebrow} · {whyPartner.title}
          </p>
          <h2 id="partner-heading" className="sr-only">
            {whyPartner.title}
          </h2>

          <Reveal className="mt-4">
            {whyPartner.straplineBeats.map((beat, i) => (
              <p
                key={beat}
                className={cn(
                  "heading-tight text-balance font-heading text-[clamp(1.75rem,4.6vw,3.125rem)] font-extrabold leading-[1.04] tracking-[-0.025em]",
                  i === 1 ? "text-orange-500" : "text-white",
                )}
              >
                {beat}
              </p>
            ))}
          </Reveal>

          <Summary lines={summaries.whyPartner!} tone="teal" centre />

          <Reveal index={1}>
            <PreReleaseBadge className="mt-8 justify-center" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" asChild>
                <Link to="/contact" search={{ enquiry: "waitlist", type: "waitlist" }}>
                  {whyPartner.cta}
                </Link>
              </Button>
              <Button variant="secondary" asChild withArrow={false}>
                <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                  Become a Partner
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </Band>
    </main>
  );
}
