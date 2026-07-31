import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HeartHandshake, Home as HomeIcon, Users } from "lucide-react";

import cardHomes from "@/assets/card-homes.jpg";
import cardLives from "@/assets/card-lives.jpg";
import cardSupport from "@/assets/card-support.jpg";
import heroCityGreen from "@/assets/hero-city-green.jpg";
import heroStreetWarm from "@/assets/hero-street-warm.jpg";
import heroTerraceSky from "@/assets/hero-terrace-sky.jpg";
import { DemandMap } from "@/components/home/demand-map";
import { EcosystemSpine } from "@/components/home/ecosystem-spine";
import { Button } from "@/components/ui/button";
import { EmptySlot } from "@/components/ui/empty-slot";
import { IconCircle } from "@/components/ui/icon-circle";
import { ImageFillHeadline } from "@/components/ui/image-fill-headline";
import { LiveWindow } from "@/components/ui/live-window";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { ProcessRail } from "@/components/ui/process-rail";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SourceLine } from "@/components/ui/source-line";
import { pillarCards, registerRoles } from "@/content/audiences";
import {
  demandMapNote,
  groupSolutions,
  heroCounts,
  heroCountsSource,
  bnbSpendPanel,
  matchRows,
  nhsCostPanel,
  platformCapabilities,
  problemBars,
} from "@/content/home";
import { deliverySteps } from "@/content/process";
import { cn } from "@/lib/utils";

const pillarImages: Record<string, string> = {
  homes: cardHomes,
  support: cardSupport,
  lives: cardLives,
};

/** The single orange action this page exists to get. Hero + closing band only. */
const PRIMARY_LABEL = "Register to join the wait list";

const icon = (name: string): LucideIcon =>
  (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle;

const maxBar = Math.max(...problemBars.map((b) => b.value));

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "The Impact Investment Platform — Social Impact Property & Supported Housing" },
      {
        name: "description",
        content:
          "A UK social-impact property platform matching local authorities, providers, landlords and investors to compliant supported housing.",
      },
      {
        property: "og:title",
        content: "The Impact Investment Platform — Social Impact Property & Supported Housing",
      },
      {
        property: "og:description",
        content:
          "Matching local authorities, care and support providers, landlords and investors to compliant supported housing.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  return (
    <>
      {/* 1 · Hero */}
      <section
        aria-labelledby="hero-heading"
        className="relative flex min-h-[calc(100svh-72px)] flex-col justify-between overflow-hidden bg-navy-900"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 pt-10 sm:px-8 lg:pt-14">
          <ImageFillHeadline
            lines={[
              { text: "Building Homes", image: heroTerraceSky, tone: "neutral" },
              { text: "Delivering Support", image: heroStreetWarm, tone: "orange" },
              { text: "Transforming Futures", image: heroCityGreen, tone: "neutral" },
            ]}
            className="mx-auto max-w-[18ch] sm:max-w-none"
          />
          <span id="hero-heading" className="sr-only">
            Building homes, delivering support, transforming futures
          </span>

          <p className="eyebrow mt-8 text-center text-teal-400">The Impact Investment Platform</p>

          <PreReleaseBadge className="mt-6 justify-center" />

          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link to="/contact" search={{ enquiry: "waitlist" }}>
                {PRIMARY_LABEL}
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild withArrow={false}>
              <Link to="/contact" search={{ enquiry: "support" }}>
                Find a home
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-col items-center gap-1">
            <p className="font-heading text-sm font-semibold text-mist sm:text-base">
              {heroCounts.map((count, i) => (
                <span key={count.id}>
                  {i > 0 ? <span className="px-2 text-slate-muted">·</span> : null}
                  <span className="text-white">{count.value}</span> {count.label}
                </span>
              ))}
            </p>
            <SourceLine source={heroCountsSource} />
          </div>
        </div>

        <Reveal className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-16 sm:px-8">
          <ProcessRail steps={deliverySteps} compact />
        </Reveal>
      </section>

      {/* 2 · The problem, in brief */}
      <section aria-labelledby="problem-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <SectionHeader
            eyebrow="The problem"
            title="The gap is measured, published and growing"
            lead="Every figure here is a published national statistic. Nothing on this site is estimated."
            className="max-w-3xl"
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
            <ul className="flex flex-col gap-8">
              {problemBars.map((bar, i) => (
                <Reveal as="li" key={bar.id} index={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-heading text-base font-semibold text-mist">{bar.label}</p>
                    <p
                      className={cn(
                        "font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-none",
                        bar.tone === "orange" ? "text-orange-500" : "text-white",
                      )}
                    >
                      {bar.display}
                    </p>
                  </div>
                  <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-navy-800">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        bar.tone === "orange" ? "bg-orange-500" : "bg-teal-500",
                      )}
                      style={{ width: `${Math.round((bar.value / maxBar) * 100)}%` }}
                    />
                  </div>
                  <SourceLine className="mt-2" source={bar.source} />
                </Reveal>
              ))}
            </ul>

            <Reveal className="panel flex flex-col justify-center gap-3 p-6">
              <p className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-none text-orange-500">
                {nhsCostPanel.value}
              </p>
              <p className="font-heading text-base font-semibold text-mist">{nhsCostPanel.label}</p>
              <SourceLine source={nhsCostPanel.source} />

              <div className="mt-4 border-t border-navy-700 pt-4">
                <p className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-none text-white">
                  {bnbSpendPanel.value}
                </p>
                <p className="mt-2 font-heading text-sm font-semibold text-mist">
                  {bnbSpendPanel.label}
                </p>
                <SourceLine className="mt-2" source={bnbSpendPanel.source} />
              </div>
            </Reveal>
          </div>

          <div className="mt-12">
            <Button variant="ghost" asChild>
              <Link to="/the-problem">See the full picture</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3 · Our solution */}
      <section aria-labelledby="solution-heading" className="border-t border-navy-700 bg-navy-900">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <SectionHeader
            eyebrow="Our solution"
            title="Three companies, one accountable chain"
            lead="Sourcing, tenure and support sit with named entities — so a council knows exactly who is responsible for what."
            className="max-w-3xl"
          />

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {groupSolutions.map((item, i) => {
              const Icon = icon(item.icon);
              return (
                <Reveal as="li" key={item.id} index={i} className="h-full">
                  <div className="panel flex h-full flex-col gap-4 p-6">
                    <IconCircle icon={Icon} size="lg" tone="teal" />
                    <h3 className="heading-tight text-xl font-bold text-white">{item.title}</h3>
                    <p className="eyebrow text-teal-400">{item.entity}</p>
                    <p className="text-sm leading-relaxed text-mist">{item.summary}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 4 · How the ecosystem works */}
      <section aria-labelledby="ecosystem-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <SectionHeader
            eyebrow="How the ecosystem works"
            title="Source → Verify → Lease → Home → Support"
            lead="The same five stages as the rail above, with the responsible entity revealed at each one. Hover or tap a stage."
            className="max-w-3xl"
          />
          <Reveal className="mt-12">
            <EcosystemSpine />
          </Reveal>
        </div>
      </section>

      {/* 5 · Live UK demand map */}
      <section aria-labelledby="demand-heading" className="border-t border-navy-700 bg-navy-900">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-24 sm:px-8 lg:py-32">
          <h2 id="demand-heading" className="eyebrow text-teal-400">
            Live UK demand
          </h2>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
            <div className="flex flex-col gap-8">
              <ul className="flex flex-col gap-6">
                {[
                  { id: "homes", Icon: HomeIcon, label: "Providing Homes", tone: "neutral" as const },
                  {
                    id: "support",
                    Icon: HeartHandshake,
                    label: "Delivering Support",
                    tone: "orange" as const,
                  },
                  { id: "lives", Icon: Users, label: "Transforming Lives", tone: "neutral" as const },
                ].map(({ id, Icon, label, tone }) => (
                  <li key={id} className="flex items-center gap-4">
                    <Icon
                      aria-hidden="true"
                      size={40}
                      strokeWidth={1.5}
                      className={tone === "orange" ? "text-orange-500" : "text-white"}
                    />
                    <span
                      className={cn(
                        "heading-tight text-[clamp(1.5rem,3vw,2.25rem)] font-bold",
                        tone === "orange" ? "text-orange-500" : "text-white",
                      )}
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <div>
                <Button variant="ghost" asChild>
                  <Link to="/contact" search={{ enquiry: "waitlist" }}>
                    {PRIMARY_LABEL}
                  </Link>
                </Button>
              </div>
            </div>

            <Reveal>
              <DemandMap />
            </Reveal>
          </div>

          <p className="mt-10 text-[12px] leading-snug text-slate-muted">{demandMapNote}</p>
        </div>
      </section>

      {/* 6 · Who we connect */}
      <section aria-labelledby="connect-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <h2 id="connect-heading" className="eyebrow text-center text-teal-400">
            Who we connect
          </h2>

          <div className="mt-8 flex items-center justify-center gap-4">
            <span aria-hidden="true" className="h-px w-16 bg-orange-500 sm:w-24" />
            <p id="register-as" className="font-heading text-base font-semibold text-mist sm:text-lg">
              Register as
            </p>
            <span aria-hidden="true" className="h-px w-16 bg-orange-500 sm:w-24" />
          </div>

          <Reveal className="mt-10">
            <ul
              aria-labelledby="register-as"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
            >
              {registerRoles.map((role) => {
                const Icon = icon(role.icon);
                const routeOut = role.tone === "route-out";
                const className = cn(
                  "group flex h-full min-h-11 flex-col items-center gap-3 rounded-panel bg-navy-800/40 px-3 py-6 text-center transition-colors duration-200 hover:bg-teal-950/60",
                  routeOut
                    ? "border-2 border-teal-500 hover:border-teal-400"
                    : "border border-navy-600/70 hover:border-teal-500",
                );
                const body = (
                  <>
                    <IconCircle icon={Icon} size="md" tone={routeOut ? "teal" : "white"} />
                    <span className="heading-tight text-sm font-bold text-white">{role.label}</span>
                    <span className="text-xs leading-snug text-slate-muted">{role.detail}</span>
                  </>
                );
                return (
                  <li key={role.id}>
                    {role.target.kind === "solutions" ? (
                      <Link to="/solutions" hash={role.target.hash} className={className}>
                        {body}
                      </Link>
                    ) : (
                      <Link
                        to="/contact"
                        search={{ enquiry: role.target.enquiry }}
                        className={className}
                      >
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 7 · Three-panel band */}
      <section aria-labelledby="pillars-heading" className="border-t border-navy-700 bg-navy-900">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <h2 id="pillars-heading" className="sr-only">
            Providing homes, delivering support, transforming lives
          </h2>
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {pillarCards.map((card, i) => (
              <Reveal
                key={card.id}
                index={i}
                className={
                  i > 0
                    ? "lg:relative lg:before:absolute lg:before:-left-4 lg:before:top-0 lg:before:h-full lg:before:w-px lg:before:bg-navy-600/70"
                    : ""
                }
              >
                <h3
                  className={cn(
                    "heading-tight text-center text-[clamp(1.75rem,5vw,2.75rem)] font-bold",
                    card.tone === "orange" ? "text-orange-500" : "text-white",
                  )}
                >
                  {card.title}
                </h3>
                <div className="relative mt-6 overflow-hidden rounded-panel border border-navy-600/70 shadow-panel">
                  <img
                    src={pillarImages[card.id]}
                    alt={card.alt}
                    loading="lazy"
                    width={1024}
                    height={768}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/60 to-transparent"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8 · AI platform teaser */}
      <section aria-labelledby="platform-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeader
                eyebrow="AI platform"
                title="The matching engine behind every placement"
              />
              <ul className="mt-8 flex flex-col gap-5">
                {platformCapabilities.map((cap) => {
                  const Icon = icon(cap.icon);
                  return (
                    <li key={cap.id} className="flex items-start gap-4">
                      <IconCircle icon={Icon} size="sm" tone="teal" />
                      <div>
                        <p className="heading-tight text-lg font-bold text-white">{cap.title}</p>
                        <p className="text-sm leading-snug text-mist">{cap.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8">
                <Button variant="secondary" asChild>
                  <Link to="/platform">Explore the platform</Link>
                </Button>
              </div>
            </div>

            <Reveal>
              <MatchingWindow />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9 · Success stories */}
      <section aria-labelledby="stories-heading" className="border-t border-navy-700 bg-navy-900">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <SectionHeader
            eyebrow="Success stories"
            title="Real stories only"
            lead="One verified quote per page · nothing invented."
            className="max-w-3xl"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <EmptySlot
              label="Resident story · consent on file"
              detail="Publishes when a resident has given written consent."
              initials="R"
            />
            <EmptySlot
              label="Case study"
              detail="Publishes when an authority or provider has signed off the figures."
            />
          </div>
        </div>
      </section>

      {/* 10 · Closing CTA */}
      <section aria-labelledby="closing-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-24 text-center sm:px-8">
          <h2
            id="closing-heading"
            className="heading-tight mx-auto max-w-4xl text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold text-white"
          >
            More Than Property · An Investment in Lives
          </h2>
          <PreReleaseBadge className="mt-8 justify-center" />
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link to="/contact" search={{ enquiry: "waitlist" }}>
                {PRIMARY_LABEL}
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild withArrow={false}>
              <Link to="/contact" search={{ enquiry: "partner" }}>
                Become a partner
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

/** LiveWindow in its matching state — real markup, clickable, never a screenshot. */
function MatchingWindow() {
  return (
    <LiveWindow
      tabs={[
        { id: "matches", label: "Matches" },
        { id: "demand", label: "Demand" },
        { id: "placements", label: "Placements" },
      ]}
      ariaLabel="Platform matching preview"
      label="illustrative interface data"
    >
      <ul className="flex flex-col gap-4">
        {matchRows.map((row) => (
          <li key={row.id} className="rounded-lg border border-navy-700 bg-navy-900/50 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-heading text-sm font-semibold text-white">
                {row.property} <span className="text-slate-muted">· {row.rooms}</span>
              </p>
              <p className="font-mono text-sm text-teal-400">{row.score}%</p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
              <div className="h-full rounded-full bg-teal-500" style={{ width: `${row.score}%` }} />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] text-slate-muted">Every match carries its evidence</p>

      <div className="mt-4 border-t border-navy-700 pt-4">
        <Button variant="ghost" asChild>
          <Link to="/platform">Confirm placement</Link>
        </Button>
      </div>
    </LiveWindow>
  );
}
