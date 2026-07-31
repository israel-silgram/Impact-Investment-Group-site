import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/platform")({
  component: PlatformPage,
  head: () => ({
    meta: [
      { title: "The Platform — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Inside the platform: property matching, compliance evidence, placement workflow and investor reporting for supported housing.",
      },
      { property: "og:title", content: "The Platform — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "Matching, compliance evidence and reporting workflows built for procurement-grade scrutiny.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/platform" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/platform" }],
  }),
});

function PlatformPage() {
  return (
    <PageShell
      eyebrow="The Platform"
      title="Matching, evidence and reporting in one auditable workflow"
      lead="Built as real interface, not screenshots. Every sample figure shown inside a live panel is labelled as illustrative interface data."
      primaryAction={{ label: "Book a demo", enquiry: "demo" }}
    />
  );
}
