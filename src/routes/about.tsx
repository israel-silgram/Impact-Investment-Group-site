import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Heart, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SourceLine } from "@/components/ui/source-line";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { GroupDiagram } from "@/components/about/group-diagram";
import { DirectorCard } from "@/components/about/director-card";
import streetDusk from "@/assets/about-street-dusk.jpg";
import {
  aboutHero,
  commissioningContext,
  director,
  teamContext,
  teamNote,
  partnerAsk,
  partnerTypes,
  partnershipSteps,
  teasers,
  technologyPartners,
  values,
  visionMission,
} from "@/content/about";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Why we exist, how the group is structured, who does what, and who we work with across the NHS, councils, housing associations, care providers and investors.",
      },
      { property: "og:title", content: "About Us — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "Our vision, values, leadership and group structure — plus how a partnership with us actually starts.",
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
      {/* 1 · Hero — why we exist */}
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
        <div className="mx-auto w-full max-w-[1440px] px-5 py-24 sm:px-8 lg:py-32">
          <Reveal>
            <p className="eyebrow text-teal-400">{aboutHero.eyebrow}</p>
            <h1
              id="about-heading"
              className="heading-tight mt-4 text-[clamp(2.25rem,5vw,4rem)] font-bold text-white"
            >
              {aboutHero.heading}
            </h1>
            <p className="mt-8 max-w-[22ch] font-heading text-[clamp(1.25rem,2.4vw,1.75rem)] font-semibold leading-snug text-white">
              {aboutHero.statement}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2 · Vision and mission */}
      <section aria-labelledby="vision-heading" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Direction"
            title="Vision and mission"
            lead="Two different things, side by side, so they can be compared without scrolling."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {visionMission.map((card, i) => (
              <Reveal key={card.id} index={i} as="article">
                <div
                  className={`h-full rounded-[var(--radius-panel)] border border-navy-700 border-l-4 bg-navy-800/60 p-7 ${
                    card.rule === "teal" ? "border-l-teal-500" : "border-l-orange-500"
                  }`}
                >
                  <p className="eyebrow text-slate-muted">{card.label}</p>
                  <h3
                    id={card.id === "vision" ? "vision-heading" : undefined}
                    className="heading-tight mt-4 text-[clamp(1.25rem,2vw,1.625rem)] font-bold text-white"
                  >
                    {card.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-mist">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · Values */}
      <section aria-label="Values" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader eyebrow="How we work" title="Values" as="h2" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {values.map((value, i) => {
              const Icon = valueIcons[value.icon];
              return (
                <Reveal key={value.id} index={i} as="li">
                  <div className="h-full rounded-[var(--radius-panel)] border border-navy-700 bg-navy-900 p-6">
                    <span className="grid size-11 place-items-center rounded-full border border-navy-600">
                      <Icon aria-hidden="true" className="size-5 text-teal-400" />
                    </span>
                    <h3 className="mt-5 font-heading text-lg font-bold text-white">{value.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{value.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 4 · Leadership */}
      <section aria-label="Leadership" className="border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Leadership"
            title="Who you would be contracting with"
            lead="Named people, named responsibilities."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
            <Reveal>
              <DirectorCard director={director} />
            </Reveal>
            <Reveal index={1} className="flex flex-col gap-4">
              <p className="text-base leading-relaxed text-mist">{teamContext}</p>
              <p className="text-[12px] leading-relaxed text-slate-muted">{teamNote}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5 · Group structure */}
      <section aria-label="Group structure" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Group structure"
            title="Who does what"
            lead="Three companies, three jobs. The lease, the capital and the care never sit in the same pair of hands."
          />
          <GroupDiagram />
        </div>
      </section>

      {/* 6 · Who we work with */}
      <section aria-label="Who we work with" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Who we work with"
            title="Partner types, and what each relationship actually is"
          />

          {/* Part one — partner types */}
          <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {partnerTypes.map((p, i) => (
              <Reveal key={p.id} index={i} as="li">
                <div className="h-full rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/60 p-6">
                  <h3 className="font-heading text-base font-bold uppercase tracking-[0.08em] text-white">
                    {p.partner}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{p.detail}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          {/* Technology partners — data licences, deliberately not in the grid */}
          <Reveal className="mt-4">
            <div className="rounded-[var(--radius-panel)] border border-dashed border-navy-600 bg-navy-950 p-6">
              <h3 className="font-heading text-base font-bold uppercase tracking-[0.08em] text-slate-muted">
                {technologyPartners.partner}
              </h3>
              <p className="mt-3 max-w-[80ch] text-sm leading-relaxed text-mist">
                {technologyPartners.detail}
              </p>
              <SourceLine className="mt-4" source={technologyPartners.note} />
            </div>
          </Reveal>

          {/* Part two — commissioning context */}
          <Reveal className="mt-12">
            <div className="panel-slate p-7">
              <p className="eyebrow text-slate-muted">{commissioningContext.eyebrow}</p>
              <h3 className="mt-4 font-heading text-xl font-bold text-white">
                {commissioningContext.title}
              </h3>
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

          {/* Part three — how a partnership starts */}
          <div className="mt-12">
            <h3 className="font-heading text-xl font-bold text-white">
              How a partnership starts
            </h3>
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
        </div>
      </section>

      {/* 7 · Two teasers */}
      <section aria-label="Where to go next" className="border-t border-navy-700 bg-navy-950">
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
        </div>
      </section>

      {/* 8 · Closing — the page's single orange action */}
      <section aria-labelledby="about-cta-heading" className="border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
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
              <Button variant="primary" asChild>
                <Link to="/contact" search={{ enquiry: "demo", type: "demo" }}>
                  Book a Demo
                </Link>
              </Button>
              <Button variant="secondary" asChild withArrow={false}>
                <Link to="/contact" search={{ enquiry: "waitlist", type: "waitlist" }}>
                  Register Your Interest
                </Link>
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
