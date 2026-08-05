import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Heart, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SourceLine } from "@/components/ui/source-line";
import { IconCircle, cycleTone } from "@/components/ui/icon-circle";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { GroupDiagram } from "@/components/about/group-diagram";
import { DirectorCard } from "@/components/about/director-card";
import streetDusk from "@/assets/about-street-dusk.jpg";
import { imagery } from "@/content/home";
import {
  commissioningContext,
  partnerAsk,
  partnerTypes,
  partnershipSteps,
  team,
  teamContext,
  teamEyebrow,
  teamNote,
  teamTitle,
  teasers,
  technologyPartners,
  values,
  visionMission,
  whatWeDo,
  whoWeAre,
  whyPartner,
  whyWeExist,
} from "@/content/about";

/**
 * /about — four sections, in the client's own order and under his own names.
 *
 *   1 · Who We Are          navy, over the street photograph
 *   2 · Why We Exist        cream
 *   3 · What We Do          navy
 *   4 · Why Partner With Us cream
 *   5 · Where to go next + the page's single orange action, navy
 *
 * The four headings are the client's supplied copy and are set verbatim.
 * Nothing that was on this page before has been dropped — each block was
 * placed inside the section that answers for it, which is why sections 3 and 4
 * are longer than their copy alone would suggest:
 *
 *   the director and team context ....... inside Who We Are
 *   vision and mission .................. inside Why We Exist
 *   group structure, partner types,
 *     technology partners, the
 *     commissioning context ............. inside What We Do
 *   values, how a partnership starts,
 *     what we ask of partners ........... inside Why Partner With Us
 *
 * The group structure matters most of that list: it moved here off the
 * homepage in task 06 precisely so it would not be lost, and it is the answer
 * to "who actually delivers this?" that institutional investors and local
 * authorities ask first. It stays on this page.
 *
 * Backgrounds alternate navy / cream / navy / cream / navy, which is the same
 * rhythm rule the homepage follows.
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

function AboutPage() {
  return (
    <main className="bg-navy-900">
      {/* ── 1 · Who We Are ─────────────────────────────────────────────────
          The lead line is set at display scale because it is the whole page in
          one sentence. The two paragraphs beneath it are the client's copy
          verbatim; the leadership block follows in the same section because
          "who we are" is a question about people before it is one about
          structure. */}
      <section aria-labelledby="about-heading" className="relative isolate overflow-hidden">
        <img
          src={streetDusk}
          alt="A UK residential street at dusk with warm lit windows"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-b from-navy-950/70 via-navy-900/65 to-navy-900"
        />
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:py-28">
          <Reveal>
            <p className="eyebrow text-teal-400">{whoWeAre.eyebrow}</p>
            <h1
              id="about-heading"
              className="heading-tight mt-4 text-[clamp(2.25rem,5vw,4rem)] font-bold text-white"
            >
              {whoWeAre.title}
            </h1>
            <p className="mt-7 max-w-[26ch] font-heading text-[clamp(1.25rem,2.4vw,1.75rem)] font-semibold leading-snug text-white">
              {whoWeAre.lead}
            </p>
            <div className="mt-7 grid max-w-[92ch] gap-4 md:grid-cols-2">
              {whoWeAre.body.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-mist">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          {/* The team — the answer to "who are we" is people, so they sit in
              the hero section rather than three screens down.

              Israel leads on a full-width card: larger portrait, his bio, and
              the only orange accent on the page. The other four run as an even
              four-up row beneath, every card identical to every other. The
              hierarchy is carried by width, size and accent — nobody is shrunk
              to make the lead look bigger, which is what makes it read as
              seniority rather than as a ranking. */}
          <div className="mt-14 border-t border-navy-700 pt-10">
            <SectionHeader eyebrow={teamEyebrow} title={teamTitle} as="h2" />

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

            <Reveal className="mt-8 flex flex-col gap-3">
              <p className="max-w-[92ch] text-base leading-relaxed text-mist">{teamContext}</p>
              <p className="text-[12px] leading-relaxed text-slate-muted">{teamNote}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 2 · Why We Exist ───────────────────────────────────────────────
          The vision and mission cards live here rather than in their own
          section: they are the same question answered at a different scale, and
          side by side with the client's two paragraphs they read as evidence
          for the claim rather than as a separate topic. */}
      <section aria-labelledby="why-heading" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader
            eyebrow={whyWeExist.eyebrow}
            title={whyWeExist.title}
            lead={whyWeExist.lead}
            as="h2"
            id="why-heading"
          />
          <div className="mt-8 grid max-w-[92ch] gap-4 md:grid-cols-2">
            {whyWeExist.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {visionMission.map((card, i) => (
              <Reveal key={card.id} index={i} as="article">
                <div
                  className={`h-full rounded-[var(--radius-panel)] border border-navy-700 border-l-4 bg-navy-800/60 p-7 ${
                    card.rule === "teal" ? "border-l-teal-500" : "border-l-orange-500"
                  }`}
                >
                  <p className="eyebrow text-slate-muted">{card.label}</p>
                  <h3 className="heading-tight mt-4 text-[clamp(1.25rem,2vw,1.625rem)] font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-mist">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 · What We Do ─────────────────────────────────────────────────
          The client's two paragraphs describe the ecosystem in the abstract;
          everything under them is the concrete version of the same claim — who
          holds what, who we work with, and whose briefs shape what we source.
          The order is deliberate: structure, then partners, then evidence. */}
      <section aria-labelledby="what-heading" className="border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader
            eyebrow={whatWeDo.eyebrow}
            title={whatWeDo.title}
            lead={whatWeDo.lead}
            as="h2"
            id="what-heading"
          />
          <div className="mt-8 grid max-w-[92ch] gap-4 md:grid-cols-2">
            {whatWeDo.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-mist">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Group structure — the accountable chain. Three companies, three
              jobs: the lease, the capital and the care never sit in the same
              pair of hands. This is the "who actually delivers this?" answer. */}
          <div className="mt-14 border-t border-navy-700 pt-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:items-center lg:gap-12">
              <SectionHeader
                eyebrow="Group structure"
                title="Who does what"
                lead="Three companies, three jobs. The lease, the capital and the care never sit in the same pair of hands."
                as="h3"
              />
              {/* The supplied crop has an olive-yellow ground that fights the
                  palette, so it carries a navy scrim and reduced saturation. */}
              <Reveal className="relative isolate overflow-hidden rounded-xl border border-navy-700">
                <img
                  src={imagery.partnership.src}
                  alt={imagery.partnership.alt}
                  width={1024}
                  height={1536}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-top saturate-[0.3] lg:aspect-[3/4]"
                />
                <span aria-hidden="true" className="image-navy-scrim absolute inset-0" />
              </Reveal>
            </div>
            <GroupDiagram />
          </div>

          {/* Who we work with */}
          <div className="mt-14 border-t border-navy-700 pt-10">
            <SectionHeader
              eyebrow="Who we work with"
              title="Partner types, and what each relationship actually is"
              as="h3"
            />
            <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {partnerTypes.map((p, i) => (
                <Reveal key={p.id} index={i} as="li">
                  <div className="h-full rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/60 p-6">
                    <h4 className="font-heading text-base font-bold uppercase tracking-[0.08em] text-white">
                      {p.partner}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{p.detail}</p>
                  </div>
                </Reveal>
              ))}
            </ul>

            {/* Technology partners — data licences, deliberately not in the
                grid. The licence note is not decoration and stays with it. */}
            <Reveal className="mt-4">
              <div className="rounded-[var(--radius-panel)] border border-dashed border-navy-600 bg-navy-950 p-6">
                <h4 className="font-heading text-base font-bold uppercase tracking-[0.08em] text-slate-muted">
                  {technologyPartners.partner}
                </h4>
                <p className="mt-3 max-w-[80ch] text-sm leading-relaxed text-mist">
                  {technologyPartners.detail}
                </p>
                <SourceLine className="mt-4" source={technologyPartners.note} />
              </div>
            </Reveal>

            {/* Commissioning context. The disclaimer is the reason this can be
                shown at all — briefs read, not partnerships held. */}
            <Reveal className="mt-8">
              <div className="panel-slate p-7">
                <p className="eyebrow text-slate-muted">{commissioningContext.eyebrow}</p>
                <h4 className="mt-4 font-heading text-xl font-bold text-white">
                  {commissioningContext.title}
                </h4>
                <p className="mt-6 font-display text-[clamp(2.5rem,6vw,4rem)] leading-none text-mist">
                  {commissioningContext.count}
                  <span className="ml-3 font-heading text-base font-semibold text-slate-muted">
                    {commissioningContext.of}
                  </span>
                </p>
                <p className="measure mt-4 text-sm leading-relaxed text-mist">
                  {commissioningContext.body}
                </p>
                <p className="measure mt-3 text-[12px] leading-relaxed text-slate-muted">
                  {commissioningContext.disclaimer}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 4 · Why Partner With Us? ───────────────────────────────────────
          The client's answer is experience and intent; the values and the
          partnership route are the operational version of it. The strapline
          closes the section because it is the same three-part line the homepage
          hero is built on, and landing on it here ties the two pages together. */}
      <section aria-labelledby="partner-heading" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader
            eyebrow={whyPartner.eyebrow}
            title={whyPartner.title}
            as="h2"
            id="partner-heading"
          />
          <div className="mt-8 grid max-w-[92ch] gap-4 md:grid-cols-2">
            {whyPartner.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Values */}
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {values.map((value, i) => {
              const Icon = valueIcons[value.icon];
              return (
                <Reveal key={value.id} index={i} as="li">
                  <div className="h-full rounded-[var(--radius-panel)] border border-navy-700 bg-navy-900 p-6">
                    <IconCircle icon={Icon} size="md" tone={cycleTone(i)} />
                    <h3 className="mt-5 font-heading text-lg font-bold text-white">{value.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{value.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>

          {/* How a partnership starts */}
          <div className="mt-14">
            <h3 className="font-heading text-xl font-bold">How a partnership starts</h3>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {partnershipSteps.map((step, i) => (
                <Reveal key={step.id} index={i} as="li">
                  <div className="flex h-full items-start gap-4 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/60 p-5">
                    <span className="font-display text-2xl leading-none text-teal-400">
                      {step.id}
                    </span>
                    <p className="font-heading text-sm font-semibold leading-snug text-mist">
                      {step.title}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal className="mt-8">
              <aside className="rounded-[var(--radius-panel)] border border-teal-600 bg-teal-950/40 p-6">
                <h4 className="font-heading text-base font-bold text-white">{partnerAsk.title}</h4>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {partnerAsk.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-mist">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-teal-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button variant="secondary" asChild>
                    <Link to="/contact" search={{ enquiry: "partner" }}>
                      Become a partner
                    </Link>
                  </Button>
                </div>
              </aside>
            </Reveal>
          </div>

          {/* The strapline, at display scale. orange-700 is the only orange
              that carries text on the cream — 4.1:1, large text only, which
              this clears at 26px+. */}
          <Reveal className="mt-14">
            <p className="heading-tight text-balance font-heading text-[clamp(1.5rem,3.2vw,2.25rem)] font-extrabold text-orange-700">
              {whyPartner.strapline}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 5 · Where to go next, and the page's single orange action ──────
          The two teasers merged into the closing band rather than sitting in
          their own navy-950 strip above it: that put two dark sections back to
          back for no reason once section 4 turned cream. */}
      <section aria-labelledby="about-cta-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-20">
          <ul className="grid gap-6 lg:grid-cols-2">
            {teasers.map((teaser, i) => (
              <Reveal key={teaser.id} index={i} as="li">
                <div className="flex h-full flex-col gap-4 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-900 p-7">
                  <p className="eyebrow text-teal-400">{teaser.eyebrow}</p>
                  <h3 className="heading-tight text-[clamp(1.125rem,1.8vw,1.5rem)] font-bold text-white">
                    {teaser.title}
                  </h3>
                  <div className="mt-auto pt-2">
                    <Button variant="ghost" asChild withArrow>
                      <Link to={teaser.to}>{teaser.action}</Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-14 border-t border-navy-700 pt-12">
            <h2
              id="about-cta-heading"
              className="heading-tight text-balance text-[clamp(1.75rem,3.4vw,3rem)] font-bold text-white"
            >
              More Than Property
              <span className="mx-3 text-teal-500" aria-hidden="true">
                ·
              </span>
              An Investment in Lives
            </h2>
            <p className="measure mt-4 text-base leading-relaxed text-mist">
              Bring a brief, a building or a mandate. We will tell you plainly whether we are the
              right people for it.
            </p>
            <PreReleaseBadge className="mt-8" />
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {/* The client's own CTA wording, in place of "Register Here". */}
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
              <span className="flex items-center gap-2 text-sm text-slate-muted">
                <ArrowRight aria-hidden="true" className="size-4 text-teal-500" />
                Named contacts, not a shared inbox
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
