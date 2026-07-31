import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { Reveal } from "@/components/ui/reveal";
import { SectionRail } from "@/components/solutions/section-rail";
import { RoleSectionBlock } from "@/components/solutions/role-section";
import { roleIcons, useActiveSection, useAnchorScroll } from "@/components/solutions/role-utils";
import { notAnOrganisation, roleSections } from "@/content/solutions";
import { crisisLines, crisisNote } from "@/content/site";

export const Route = createFileRoute("/solutions")({
  component: SolutionsPage,
  head: () => ({
    meta: [
      { title: "Solutions by role — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Eight routes into one evidenced process: local authorities, housing associations, care and support providers, investors, landlords, developers, estate agents and contractors.",
      },
      { property: "og:title", content: "Solutions by role — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "What the platform does for commissioners, providers, landlords, developers and capital partners in UK supported housing.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/solutions" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/solutions" }],
  }),
});

const slugs = roleSections.map((section) => section.slug);

function SolutionsPage() {
  const active = useActiveSection(slugs);
  const scrollTo = useAnchorScroll();

  // Honour a deep link such as /solutions#local-authorities on first paint.
  React.useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && slugs.includes(hash as (typeof slugs)[number])) {
      window.requestAnimationFrame(() => scrollTo(hash));
    }
  }, [scrollTo]);

  const readingRole =
    roleSections.find((section) => section.slug === active)?.slug ?? "local-authorities";

  return (
    <main className="bg-navy-900">
      {/* 1 · Hero — the role picker is the hero */}
      <section aria-labelledby="solutions-heading" className="border-b border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <p className="eyebrow text-teal-400">Our solutions</p>
            <h1
              id="solutions-heading"
              className="heading-tight mt-4 text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-white"
            >
              Solutions
            </h1>
            <p className="measure mt-5 text-base leading-relaxed text-mist">
              Pick your role. Every section answers the same four questions in the same order, so
              you can compare what we hold ourselves to.
            </p>
          </Reveal>

          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roleSections.map((role, i) => {
              const isActive = role.slug === active;
              return (
                <Reveal as="li" key={role.slug} index={i}>
                  <button
                    type="button"
                    onClick={() => scrollTo(role.slug)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex h-full min-h-11 w-full cursor-pointer flex-col items-center gap-3 rounded-[var(--radius-panel)] border p-6 text-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
                      isActive
                        ? "border-teal-500 bg-navy-800/70"
                        : "border-navy-700 bg-navy-800/40 hover:border-navy-600"
                    }`}
                  >
                    <IconCircle icon={roleIcons[role.slug]} />
                    <span className="font-heading text-base font-semibold text-white">
                      {role.title}
                    </span>
                    <span className="text-[13px] leading-relaxed text-slate-muted">
                      {role.cardLine}
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 2 · Sticky rail + 3 · the eight sections */}
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
          <div className="sticky top-[72px] z-30 -mx-5 bg-navy-900/95 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:px-0 lg:py-12 lg:backdrop-blur-none">
            <div className="px-5 sm:px-0 lg:px-0">
              <SectionRail sections={roleSections} active={active} onSelect={scrollTo} />
            </div>
          </div>

          <div className="pb-4">
            {roleSections.map((role) => (
              <RoleSectionBlock key={role.slug} role={role} />
            ))}
          </div>
        </div>
      </div>

      {/* 4 · Not an organisation? */}
      <section aria-labelledby="find-a-home-heading" className="border-t border-navy-700">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal className="rounded-[var(--radius-panel)] border border-teal-600 bg-teal-950 p-8 lg:p-10">
            <h2
              id="find-a-home-heading"
              className="heading-tight text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold text-white"
            >
              {notAnOrganisation.heading}
            </h2>
            <p className="measure mt-4 text-base leading-relaxed text-mist">
              {notAnOrganisation.body}
            </p>
            <div className="mt-6">
              <Button variant="secondary" asChild>
                <Link to="/contact" search={{ enquiry: notAnOrganisation.action.enquiry }}>
                  {notAnOrganisation.action.label}
                </Link>
              </Button>
            </div>
            <p className="measure mt-6 text-sm leading-relaxed text-mist">
              {notAnOrganisation.closing}
            </p>
          </Reveal>

          <Reveal index={1} className="mt-6">
            <ul className="flex flex-col gap-2">
              {crisisLines.map((line) => (
                <li key={line.label} className="flex items-center gap-3 text-sm text-mist">
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-teal-400" />
                  <span className="font-heading font-semibold text-white">{line.label}</span>
                  <a
                    href={`tel:${line.detail.replace(/\s/g, "")}`}
                    className="min-h-11 content-center text-teal-400 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
                  >
                    {line.detail}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3 text-sm text-mist">
                <Phone aria-hidden="true" className="size-4 shrink-0 text-teal-400" />
                <span>{crisisNote}</span>
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 5 · Closing CTA — the page's single orange action */}
      <section aria-labelledby="solutions-cta-heading" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
          <Reveal>
            <h2
              id="solutions-cta-heading"
              className="heading-tight text-balance text-[clamp(1.75rem,3.4vw,3rem)] font-bold text-white"
            >
              See it against your own brief
            </h2>
            <p className="measure mt-4 text-base leading-relaxed text-mist">
              We will walk the platform through the role you have been reading — no generic tour.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="primary" asChild>
                <Link to="/contact" search={{ enquiry: "demo", role: readingRole }}>
                  Book a demo
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/contact" search={{ enquiry: "investor", role: readingRole }}>
                  Investor enquiry
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
