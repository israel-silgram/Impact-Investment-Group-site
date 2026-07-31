import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/solutions")({
  component: SolutionsPage,
  head: () => ({
    meta: [
      { title: "Our Solutions — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Solutions for local authorities, housing associations, care providers, landlords, developers and investors in supported housing.",
      },
      { property: "og:title", content: "Our Solutions — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "Tailored routes for commissioners, providers, landlords and capital partners in UK supported housing.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/solutions" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/solutions" }],
  }),
});

function SolutionsPage() {
  return (
    <main>
      <h1>Our Solutions</h1>
    </main>
  );
}
