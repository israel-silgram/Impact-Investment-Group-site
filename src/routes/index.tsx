import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import cardHomes from "@/assets/card-homes.jpg";
import cardSupport from "@/assets/card-support.jpg";
import cardLives from "@/assets/card-lives.jpg";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { ProcessRail } from "@/components/ui/process-rail";
import { Reveal } from "@/components/ui/reveal";
import { pillarCards, registerRoles } from "@/content/audiences";
import { deliverySteps } from "@/content/process";

const pillarImages: Record<string, string> = {
  homes: cardHomes,
  support: cardSupport,
  lives: cardLives,
};

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
      <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-navy-900">
        <div className="mx-auto w-full max-w-[1440px] px-5 pb-14 pt-10 sm:px-8 lg:pb-20 lg:pt-14">
          <h1 id="hero-heading" className="sr-only">
            Providing homes, delivering support, transforming lives
          </h1>

          {/* Three pillars: headline above a photograph, divided by hairlines. */}
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {pillarCards.map((card, i) => (
              <Reveal
                key={card.id}
                index={i}
                className={
                  i > 0
                    ? "lg:relative lg:before:absolute lg:before:-left-4 lg:before:top-0 lg:before:h-full lg:before:w-px lg:before:bg-navy-600/70"
                    : undefined
                }
              >


                <div>

                  <h2
                    className={`heading-tight text-center text-[clamp(1.75rem,5vw,2.75rem)] font-bold ${
                      card.tone === "orange" ? "text-orange-500" : "text-white"
                    }`}
                  >
                    {card.title}
                  </h2>
                  <div className="mt-6 overflow-hidden rounded-panel border border-navy-600/70 shadow-panel">
                    <img
                      src={pillarImages[card.id]}
                      alt={card.alt}
                      width={1024}
                      height={768}
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      {...(i === 0 ? { loading: "eager" as const } : { loading: "lazy" as const })}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Register as */}
          <div className="mt-14 flex items-center justify-center gap-4">
            <span aria-hidden="true" className="h-px w-16 bg-orange-500 sm:w-24" />
            <h2 id="register-as" className="text-base text-mist sm:text-lg">
              Register as
            </h2>
            <span aria-hidden="true" className="h-px w-16 bg-orange-500 sm:w-24" />
          </div>

          <Reveal className="mt-8">
            <ul
              aria-labelledby="register-as"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10"
            >
              {registerRoles.map((role) => {
                const Icon = (Icons as unknown as Record<string, LucideIcon>)[role.icon] ?? Icons.User;
                return (
                  <li key={role.id}>
                    <Link
                      to="/contact"
                      search={{ enquiry: role.enquiry }}
                      className="group flex h-full min-h-[44px] flex-col items-center gap-3 rounded-panel border border-navy-600/70 bg-navy-800/40 px-3 py-5 text-center transition-colors duration-200 hover:border-teal-400 hover:bg-navy-800"
                    >
                      <IconCircle icon={Icon} size="md" tone="white" />
                      <span className="heading-tight text-sm font-bold text-white">
                        {role.label}
                      </span>
                      <span className="text-xs leading-snug text-slate-muted">{role.detail}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="delivery-heading"
        className="border-t border-navy-700 bg-navy-950"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-20">
          <h2 id="delivery-heading" className="eyebrow text-center text-slate-muted">
            How delivery works
          </h2>
          <Reveal className="mt-10">
            <ProcessRail steps={deliverySteps} />
          </Reveal>

          <div className="mt-14 flex justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link to="/contact" search={{ enquiry: "demo" }}>
                Register your interest today
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
