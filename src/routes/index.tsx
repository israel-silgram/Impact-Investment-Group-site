import { createFileRoute, Link } from "@tanstack/react-router";

import heroTerraceSky from "@/assets/hero-terrace-sky.jpg";
import heroStreetWarm from "@/assets/hero-street-warm.jpg";
import heroCityGreen from "@/assets/hero-city-green.jpg";
import { Button } from "@/components/ui/button";
import { ImageFillHeadline } from "@/components/ui/image-fill-headline";
import { ProcessRail } from "@/components/ui/process-rail";
import { Reveal } from "@/components/ui/reveal";
import { deliverySteps } from "@/content/process";

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
        <div className="mx-auto w-full max-w-[1440px] px-5 pb-16 pt-12 sm:px-8 lg:pb-24 lg:pt-16">
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

          <div className="mt-10 flex justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link to="/contact" search={{ enquiry: "demo" }}>
                Register your interest today
              </Link>
            </Button>
          </div>

          <Reveal className="mt-16 lg:mt-20">
            <ProcessRail steps={deliverySteps} />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="home-slots" className="border-t border-navy-700 bg-navy-950">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8">
          <h2 id="home-slots" className="eyebrow text-slate-muted">
            Remaining home sections
          </h2>
          <p className="measure mt-4 text-sm text-mist">
            Chrome, tokens and components are live. Home sections will be assembled from typed
            content files once copy and sourced figures are approved.
          </p>
        </div>
      </section>
    </>
  );
}
