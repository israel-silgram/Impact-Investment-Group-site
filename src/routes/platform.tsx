import { createFileRoute } from "@tanstack/react-router";

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
    <main>
      <h1>The Platform</h1>
    </main>
  );
}
