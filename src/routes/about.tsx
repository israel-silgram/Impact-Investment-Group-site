import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Heart, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { IconCircle, cycleTone } from "@/components/ui/icon-circle";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { DirectorCard } from "@/components/about/director-card";
import { imagery } from "@/content/home";
import {
  aboutHeroImage,
  accountableChain,
  chainNotices,
  partnerAsk,
  partnershipSteps,
  problemFigures,
  problemHeading,
  straplines,
  team,
  teamContext,
  teamNote,
  teamTitle,
  values,
  whatWeDo,
  whoWeAre,
  whyPartner,
  whyWeExist,
} from "@/content/about";

/**
 * /about — rebuilt to the old production site's About page.
 *
 * The layout, not the homepage's. That page is one continuous cream ground
 * with very large navy headings, white rounded cards with a soft shadow, a
 * captioned illustrative image beside the hero, a numbered three-company chain
 * and a row of sourced-figure cards. There is no navy/cream alternation on it
 * at all, and reproducing it means not adding one.
 *
 * Three things come from three places:
 *
 *   LOOK   the old iip-web About page
 *   COPY   the client's four sections — Who We Are, Why We Exist, What We Do,
 *          Why Partner With Us — set as the headings, verbatim
 *   TEAM   kept exactly as built: Israel leading on a full-width card with the
 *          other four beneath. The old page had only "team details coming soon"
 *          and a single director card, so this is the one part of it not worth
 *          copying.
 *
 * Blocks the old page carried that nothing else on this site does are folded
 * into the section that answers for them: the three-company chain and its two
 * compliance paragraphs into What We Do, the four sourced figures into Why We
 * Exist. Every figure keeps a live link to its publication — that is the whole
 * point of the block and none may appear without one.
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

const valueIcons = {
  shield: Shield,
  badge: BadgeCheck,
  target: Target,
  heart: Heart,
} as const;

/** The old page's section head: small rust eyebrow, then a very large navy line. */
function Head({
  eyebrow,
  title,
  id,
  size = "lg",
}: {
  eyebrow?: string;
  title: string;
  id?: string;
  size?: "xl" | "lg";
}) {
  return (
    <>
      {eyebrow ? (
        <p className="eyebrow tracking-[0.14em] text-orange-700">{eyebrow}</p>
      ) : null}
      <h2
        id={id}
        className={
          size === "xl"
            ? "heading-tight mt-3 text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tracking-[-0.02em] text-navy-900"
            : "heading-tight mt-3 text-balance text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold tracking-[-0.01em] text-navy-900"
        }
      >
        {title}
      </h2>
    </>
  );
}

/** White card, 16px radius, hairline rule, soft lift — the old page's card. */
const CARD =
  "rounded-2xl border border-[color-mix(in_oklab,var(--color-navy-900)_12%,transparent)] bg-white p-6 shadow-[0_1px_2px_rgba(0,17,43,0.05),0_10px_30px_-18px_rgba(0,17,43,0.25)]";

function AboutPage() {
  return (
    <main className="section-light">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        {/* ── 1 · Who We Are ──────────────────────────────────────────────
            The old page's hero: copy left, a captioned illustrative image
            right, and the heading at display scale. */}
        <section aria-labelledby="about-heading">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
            <Reveal>
              <p className="eyebrow tracking-[0.14em] text-orange-700">{whoWeAre.eyebrow}</p>
              <h1
                id="about-heading"
                className="heading-tight mt-3 text-balance text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold tracking-[-0.02em] text-navy-900"
              >
                {whoWeAre.title}
              </h1>
              <p className="mt-6 max-w-[46ch] text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-relaxed">
                {whoWeAre.lead}
              </p>
              {whoWeAre.body.map((paragraph) => (
                <p key={paragraph} className="mt-4 max-w-[62ch] text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </Reveal>

            {/* Captioned, exactly as the old page does it — the caption is what
                stops an illustrative photograph reading as documentary. */}
            <Reveal index={1}>
              <figure className="overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-navy-900)_12%,transparent)] bg-white shadow-[0_10px_30px_-18px_rgba(0,17,43,0.3)]">
                <img
                  src={imagery.meeting.src}
                  alt={imagery.meeting.alt}
                  width={1536}
                  height={1024}
                  className="aspect-[3/2] w-full object-cover"
                />
                <figcaption className="px-4 py-3 text-[13px] text-slate-ink">
                  {aboutHeroImage.caption}
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* The team — kept as built. */}
          <div className="mt-16">
            <Head eyebrow="The team" title={teamTitle} size="lg" />

            <Reveal className="mt-8">
              <DirectorCard director={team[0]!} variant="lead" />
            </Reveal>

            <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {team.slice(1).map((member, i) => (
                <Reveal key={member.name} index={i} as="li">
                  <DirectorCard director={member} variant="member" />
                </Reveal>
              ))}
            </ul>

            <Reveal className="mt-8 flex flex-col gap-2">
              <p className="max-w-[92ch] text-base leading-relaxed">{teamContext}</p>
              <p className="text-[12px] leading-relaxed text-slate-ink">{teamNote}</p>
            </Reveal>
          </div>
        </section>

        {/* ── 2 · Why We Exist ────────────────────────────────────────────
            The client's copy, then the old page's sourced-figure row. The
            figures are the evidence for the claim the copy makes, so they sit
            under it rather than in a section of their own. */}
        <section aria-labelledby="why-heading" className="mt-20 border-t border-[color-mix(in_oklab,var(--color-navy-900)_12%,transparent)] pt-14">
          <Head eyebrow={whyWeExist.eyebrow} title={whyWeExist.title} id="why-heading" />
          <p className="mt-6 max-w-[52ch] text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-relaxed">
            {whyWeExist.lead}
          </p>
          <div className="mt-6 grid max-w-[92ch] gap-4 md:grid-cols-2">
            {whyWeExist.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <h3 className="heading-tight mt-12 text-balance text-[clamp(1.375rem,2.4vw,1.875rem)] font-bold text-navy-900">
            {problemHeading}
          </h3>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {problemFigures.map((figure, i) => (
              <Reveal key={figure.id} index={i} as="li">
                <div className={`flex h-full flex-col ${CARD}`}>
                  <p className="eyebrow text-teal-600">{figure.kind}</p>
                  <p className="mt-3 font-heading text-[clamp(1.875rem,3vw,2.375rem)] font-extrabold leading-none tracking-[-0.02em] text-navy-900">
                    {figure.value}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed">{figure.label}</p>
                  {/* A figure without its source does not go on this page. */}
                  <a
                    href={figure.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-auto inline-flex items-start gap-1 pt-4 text-[11.5px] leading-snug font-semibold text-teal-600 transition-colors duration-200 hover:text-navy-900"
                  >
                    <span>Source: {figure.source}</span>
                    <ArrowUpRight aria-hidden="true" className="mt-px size-3 shrink-0" />
                  </a>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ── 3 · What We Do ──────────────────────────────────────────────
            The client's copy, then the old page's numbered chain and both of
            its compliance paragraphs. Neither notice may be dropped. */}
        <section aria-labelledby="what-heading" className="mt-20 border-t border-[color-mix(in_oklab,var(--color-navy-900)_12%,transparent)] pt-14">
          <Head eyebrow={whatWeDo.eyebrow} title={whatWeDo.title} id="what-heading" />
          <p className="mt-6 max-w-[52ch] text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-relaxed">
            {whatWeDo.lead}
          </p>
          <div className="mt-6 grid max-w-[92ch] gap-4 md:grid-cols-2">
            {whatWeDo.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <h3 className="heading-tight mt-12 text-balance text-[clamp(1.375rem,2.4vw,1.875rem)] font-bold text-navy-900">
            Three companies, one accountable chain.
          </h3>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {accountableChain.map((company, i) => (
              <Reveal key={company.id} index={i} as="li">
                <div className={`flex h-full flex-col ${CARD}`}>
                  <p className="font-heading text-2xl font-extrabold leading-none text-navy-900">
                    {company.number}
                  </p>
                  <h4 className="mt-4 font-heading text-base font-bold text-navy-900">
                    {company.name}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed">{company.body}</p>
                  {company.qualifier ? (
                    <p className="mt-3 text-[12px] leading-relaxed text-slate-ink">
                      {company.qualifier}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </ul>

          {/* Compliance, both paragraphs, verbatim. */}
          <div className="mt-8 flex flex-col gap-3">
            {chainNotices.map((notice) => (
              <p key={notice} className="max-w-[100ch] text-[12.5px] leading-relaxed text-slate-ink">
                {notice}
              </p>
            ))}
          </div>
        </section>

        {/* ── 4 · Why Partner With Us? ────────────────────────────────────*/}
        <section aria-labelledby="partner-heading" className="mt-20 border-t border-[color-mix(in_oklab,var(--color-navy-900)_12%,transparent)] pt-14">
          <Head eyebrow={whyPartner.eyebrow} title={whyPartner.title} id="partner-heading" />
          <div className="mt-6 grid max-w-[92ch] gap-4 md:grid-cols-2">
            {whyPartner.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {values.map((value, i) => {
              const Icon = valueIcons[value.icon];
              return (
                <Reveal key={value.id} index={i} as="li">
                  <div className={`h-full ${CARD}`}>
                    <IconCircle icon={Icon} size="md" tone={cycleTone(i)} />
                    <h3 className="mt-5 font-heading text-lg font-bold text-navy-900">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed">{value.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>

          <h3 className="heading-tight mt-12 text-[clamp(1.25rem,2vw,1.5rem)] font-bold text-navy-900">
            How a partnership starts
          </h3>
          <ol className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {partnershipSteps.map((step, i) => (
              <Reveal key={step.id} index={i} as="li">
                <div className={`flex h-full items-start gap-4 ${CARD}`}>
                  <span className="font-heading text-2xl font-extrabold leading-none text-teal-600">
                    {step.id}
                  </span>
                  <p className="font-heading text-sm font-semibold leading-snug text-navy-900">
                    {step.title}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-8">
            <aside className={CARD}>
              <h4 className="font-heading text-base font-bold text-navy-900">{partnerAsk.title}</h4>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {partnerAsk.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-teal-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </Reveal>

          {/* The straplines and the close, the way the old page ends. */}
          <Reveal className="mt-14 text-center">
            <p className="heading-tight text-balance font-heading text-[clamp(1.5rem,3.2vw,2.25rem)] font-extrabold text-orange-700">
              {whyPartner.strapline}
            </p>
            <div className="mt-4 flex flex-col items-center gap-1.5">
              {straplines.map((line) => (
                <p key={line} className="font-heading text-[15px] font-semibold text-navy-900">
                  {line}
                </p>
              ))}
            </div>

            <PreReleaseBadge className="mt-8 justify-center" />
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <Button variant="primary" asChild>
                <Link to="/contact" search={{ enquiry: "waitlist", type: "waitlist" }}>
                  {whyPartner.cta}
                </Link>
              </Button>
              <Button variant="secondary" asChild withArrow={false} className="border-teal-600">
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                  Become a Partner
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
