import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { DirectorCard } from "@/components/about/director-card";
import { imagery } from "@/content/home";
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
 * cream and only clears AA as LARGE text. That is why these lines are set at
 * 19px semibold: at that size and weight orange-700 qualifies as large text and
 * passes. On navy the brighter orange-500 is used instead, at 7.2:1.
 */
function Rich({ parts, tone }: { parts: Seg[]; tone: "rust" | "teal" }) {
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <strong
            key={i}
            className={cn(
              "font-bold",
              part.em === "accent"
                ? tone === "rust"
                  ? "text-orange-700"
                  : "text-orange-500"
                : "text-white",
            )}
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

/** Section shell: one ground, one container, one padding value everywhere. */
function Band({
  id,
  light,
  children,
}: {
  id: string;
  light?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "border-t border-navy-700",
        light ? "section-light" : "bg-navy-900",
      )}
    >
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

/** One summarised line per section, in place of two paragraphs. */
function Summary({
  parts,
  tone,
  centre,
}: {
  parts: Seg[];
  tone: "rust" | "teal";
  centre?: boolean;
}) {
  return (
    <p
      className={cn(
        "mt-4 text-[19px] font-semibold leading-[1.5] text-mist",
        centre ? "mx-auto max-w-[62ch] text-center" : "max-w-[62ch]",
      )}
    >
      <Rich parts={parts} tone={tone} />
    </p>
  );
}

function AboutPage() {
  return (
    <main>
      {/* ── 1 · Who We Are + the team ── cream ───────────────────────────── */}
      <Band id="about-heading" light>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <Reveal>
            <Head
              eyebrow={whoWeAre.eyebrow}
              title={whoWeAre.title}
              id="about-heading"
              tone="rust"
              hero
            />
            <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-white">
              {whoWeAre.lead}
            </p>
            <Summary parts={summaries.whoWeAre!} tone="rust" />
          </Reveal>

          {/* Captioned — what stops an illustrative photograph reading as
              documentary. */}
          <Reveal index={1}>
            <figure className="panel overflow-hidden">
              <img
                src={imagery.meeting.src}
                alt={imagery.meeting.alt}
                width={1536}
                height={1024}
                className="aspect-[3/2] w-full object-cover"
              />
            </figure>
          </Reveal>
        </div>

        {/* The team — kept as built. */}
        <div className="mt-10">
          <p className="eyebrow tracking-[0.14em] text-orange-700">The team</p>
          <h2 className="heading-tight mt-2.5 text-[clamp(1.5rem,2.8vw,2rem)] font-extrabold tracking-[-0.02em] text-white">
            {teamTitle}
          </h2>

          <Reveal className="mt-6">
            <DirectorCard director={team[0]!} variant="lead" />
          </Reveal>

          <ul className="mt-3.5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {team.slice(1).map((member, i) => (
              <Reveal key={member.name} index={i} as="li">
                <DirectorCard director={member} variant="member" />
              </Reveal>
            ))}
          </ul>
        </div>
      </Band>

      {/* ── 2 · Why We Exist + the figures ── navy ───────────────────────── */}
      <Band id="why-heading">
        <Head eyebrow={whyWeExist.eyebrow} title={whyWeExist.title} id="why-heading" />
        <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-white">
          {whyWeExist.lead}
        </p>
        <Summary parts={summaries.whyWeExist!} tone="teal" />

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
        <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-white">
          {whatWeDo.lead}
        </p>
        <Summary parts={summaries.whatWeDo!} tone="rust" />

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
        <Summary parts={summaries.whyPartner!} tone="teal" centre />

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
