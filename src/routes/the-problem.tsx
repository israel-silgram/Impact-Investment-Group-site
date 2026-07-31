import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/the-problem")({
  component: TheProblemPage,
  head: () => ({
    meta: [
      { title: "The Problem — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Why supported housing placement, compliance and capital allocation break down across UK local authorities and providers.",
      },
      { property: "og:title", content: "The Problem — The Impact Investment Platform" },
      {
        name: "og:description",
        content:
          "Why supported housing placement, compliance and capital allocation break down across UK local authorities and providers.",
      },
      { property: "og:description", content: "Where supported housing supply and demand fail to meet." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/the-problem" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/the-problem" }],
  }),
});

function TheProblemPage() {
  return (
    <main>
      <h1>The Problem</h1>
    </main>
  );
}
