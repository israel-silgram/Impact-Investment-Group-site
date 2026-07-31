import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

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
    <PageShell
      eyebrow="Our Solutions"
      title="One route for every party in a supported housing placement"
      lead="Commissioners, providers, landlords, developers and capital partners each need a different entry point into the same evidenced process."
      primaryAction={{ label: "Speak to our team", enquiry: "sales" }}
    />
  );
}
