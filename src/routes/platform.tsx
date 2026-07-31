import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { StatBlock } from "@/components/ui/stat-block";
import { DemandMap } from "@/components/home/demand-map";
import { CapabilityRail } from "@/components/platform/capability-rail";
import { HeroWindow } from "@/components/platform/hero-window";
import { AiTeam } from "@/components/platform/ai-team";
import { DeliverySpine } from "@/components/platform/delivery-spine";
import { PortalTabs } from "@/components/platform/portal-tabs";
import { PropertyReport } from "@/components/platform/property-report";
import { useActiveSection, useAnchorScroll } from "@/components/solutions/role-utils";
import {
  analyticsNote,
  analyticsTiles,
  apiEndpoints,
  apiNote,
  capabilityLinks,
  filterNodeIds,
  governance,
  heroSummary,
  aiTeam,
  whatWeDo,
  supportFilters,
} from "@/content/platform";

export const Route = createFileRoute("/platform")({
  component: PlatformPage,
  head: () => ({
    meta: [
      { title: "The Platform — matching on evidence, not guesswork" },
      {
        name: "description",
        content:
          "AI matching with a visible evidence breakdown, demand heat maps, sourced property reports, four role portals, board-ready analytics and an integration API.",
      },
      { property: "og:title", content: "The Platform — matching on evidence, not guesswork" },
      {
        property: "og:description",
        content:
          "Ranked matches with their factor breakdown, licensed public data with named sources, and an audit trail for every placement decision.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/platform" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/platform" }],
  }),
});

const capabilityIds = capabilityLinks.map((c) => c.id);

function PlatformPage() {
  const active = useActiveSection(capabilityIds);
  const scrollTo = useAnchorScroll();
  const [filter, setFilter] = React.useState("all");
  const visibleIds = filter === "all" ? undefined : filterNodeIds[filter];

  return (
    <main className="bg-navy-900">
      {/* 1 · Hero — the product itself */}
      <section aria-labelledby="platform-heading" className="border-b border-navy-700">
        <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
          <Reveal>
            <p className="eyebrow text-teal-400">{heroSummary.eyebrow}</p>
            <h1
              id="platform-heading"
              className="heading-tight mt-4 text-balance text-[clamp(2.25rem,5vw,4rem)] font-bold text-white"
            >
              {heroSummary.title}
            </h1>
            <p className="measure mt-5 text-base leading-relaxed text-mist">{heroSummary.lead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="primary" asChild>
                <Link to="/contact" search={{ enquiry: "waitlist" }}>
                  Register to join the wait list
                </Link>
              </Button>
              <Button variant="secondary" onClick={() => scrollTo("api")}>
                See the API
              </Button>
            </div>
          </Reveal>

          <Reveal index={1}>
            <HeroWindow />
            <p className="mt-4 text-[13px] text-slate-muted">{heroSummary.caption}</p>
          </Reveal>
        </div>
      </section>

      {/* 2 · Sticky capability rail + capability sections */}
      <div className="section-light">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 xl:grid xl:grid-cols-[220px_1fr] xl:gap-14">
          <div className="sticky top-[72px] z-30 -mx-5 border-b border-navy-800 bg-navy-900/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 xl:top-24 xl:mx-0 xl:self-start xl:border-0 xl:!bg-transparent xl:!shadow-none xl:px-0 xl:py-16 xl:backdrop-blur-none">
            <CapabilityRail links={capabilityLinks} active={active} onSelect={scrollTo} />
          </div>

          <div>
            {/* 3a · What we do for you */}
            <Reveal
              as="section"
              id="what-we-do"
              aria-label="What we do for you"
              className="scroll-mt-32 border-b border-navy-800 py-16 lg:py-20"
            >
              <SectionHeader
                eyebrow={whatWeDo.eyebrow}
                title={whatWeDo.title}
                lead={whatWeDo.lead}
              />
              <DeliverySpine className="mt-10" />
            </Reveal>

            {/* 3b · Your AI investment team */}
            <Reveal
              as="section"
              id="ai-team"
              aria-label="Your AI investment team"
              className="scroll-mt-32 border-b border-navy-800 py-16 lg:py-20"
            >
              <SectionHeader eyebrow={aiTeam.eyebrow} title={aiTeam.title} lead={aiTeam.lead} />
              <AiTeam />
            </Reveal>

            {/* 4 · Demand heat maps & property intelligence */}
            <Reveal
              as="section"
              id="demand-heat-maps"
              aria-label="Demand heat maps and property intelligence"
              className="scroll-mt-32 border-b border-navy-800 py-16 lg:py-20"
            >
              <SectionHeader
                eyebrow="Demand heat maps & property intelligence"
                title="Where the need is, and what the property actually is"
              />
              <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
                <div>
                  <ul className="flex flex-wrap gap-2">
                    {supportFilters.map((f) => {
                      const isActive = f.id === filter;
                      return (
                        <li key={f.id}>
                          <button
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setFilter(f.id)}
                            className={`min-h-11 cursor-pointer rounded-full border px-4 font-heading text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
                              isActive
                                ? "border-teal-500 bg-teal-950 text-teal-400"
                                : "border-navy-700 text-slate-muted hover:border-navy-600 hover:text-mist"
                            }`}
                          >
                            {f.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <DemandMap
                    className="mt-8 lg:grid-cols-1 lg:items-start [&>div:first-child]:max-w-[19rem]"
                    {...(visibleIds ? { visibleIds } : {})}
                  />
                </div>

                <div id="property-intelligence" className="scroll-mt-32">
                  <PropertyReport />
                </div>
              </div>
            </Reveal>

            {/* 5 · Four portals, one platform */}
            <Reveal
              as="section"
              id="portals"
              aria-label="Portals"
              className="section-dark scroll-mt-32 my-16 px-5 py-12 sm:px-8 lg:my-20 lg:py-16"
            >
              <SectionHeader eyebrow="Portals" title="Four portals, one platform" />
              <div className="mt-10">
                <PortalTabs />
              </div>
            </Reveal>

            {/* 6 · Analytics */}
            <Reveal
              as="section"
              id="analytics"
              aria-label="Analytics"
              className="scroll-mt-32 border-b border-navy-800 py-16 lg:py-20"
            >
              <SectionHeader
                eyebrow="Analytics"
                title="Numbers appear when they are real"
                lead="These two tiles stay empty until the platform produces the figures itself."
              />
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {analyticsTiles.map((tile) => (
                  <StatBlock
                    key={tile.id}
                    variant="empty"
                    label={tile.label}
                    condition={tile.condition}
                  />
                ))}
              </div>
              <p className="mt-6 text-sm leading-relaxed text-mist">{analyticsNote}</p>
            </Reveal>

            {/* 7 · API integrations */}
            <Reveal
              as="section"
              id="api"
              aria-label="API integrations"
              className="scroll-mt-32 border-b border-navy-800 py-16 lg:py-20"
            >
              <SectionHeader eyebrow="API" title="Integrations, not re-keying" />
              <div className="mt-10 rounded-[var(--radius-panel)] border-l-2 border-teal-500 bg-navy-950 p-5 sm:p-6">
                <ul className="space-y-3">
                  {apiEndpoints.map((endpoint) => (
                    <li
                      key={endpoint.id}
                      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-sm"
                    >
                      <span className="w-14 shrink-0 font-semibold text-teal-400">
                        {endpoint.method}
                      </span>
                      <span className="min-w-0 break-all text-mist">{endpoint.path}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-5 text-sm text-mist">{apiNote}</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* 8 · Governance & audit trail */}
      <section aria-labelledby="governance-heading" className="section-light border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <p className="eyebrow text-slate-muted">{governance.eyebrow}</p>
            <h2
              id="governance-heading"
              className="heading-tight mt-4 text-balance text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold text-white"
            >
              {governance.title}
            </h2>
            <ul className="mt-8 grid gap-6 lg:grid-cols-3">
              {governance.lines.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-500" />
                  <span className="text-sm leading-relaxed text-mist">{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button variant="ghost" asChild>
                <a href="/methodology-pack.txt" download>
                  <FileText aria-hidden="true" />
                  Download the methodology pack
                  <Download aria-hidden="true" />
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 9 · Closing CTA — the page's single orange action */}
      <section aria-labelledby="platform-cta-heading" className="border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <h2
              id="platform-cta-heading"
              className="heading-tight text-balance text-[clamp(1.75rem,3.4vw,3rem)] font-bold text-white"
            >
              See it on your own caseload
            </h2>
            <p className="measure mt-4 text-base leading-relaxed text-mist">
              Bring a live brief. We will run it through the platform with you and show the evidence
              behind every match it returns.
            </p>
            <PreReleaseBadge className="mt-8" />
            <div className="mt-5">
              <Button variant="primary" asChild>
                <Link to="/contact" search={{ enquiry: "waitlist" }}>
                  Register to join the wait list
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
