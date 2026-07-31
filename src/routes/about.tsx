import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Who we are: a UK social-impact property business aligning supported housing supply, care provision and long-term capital.",
      },
      { property: "og:title", content: "About Us — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "A UK social-impact property business aligning supported housing supply, care provision and long-term capital.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <PageShell
      eyebrow="About Us"
      title="A property business built to be checked"
      lead="Registrations, redress and indemnity are published in the footer of every page. Case studies appear here only when the partner has approved them."
      primaryAction={{ label: "Become a partner", enquiry: "partner" }}
    />
  );
}
