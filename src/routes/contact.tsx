import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Contact the team to discuss supported housing placements, property partnerships or impact investment opportunities.",
      },
      { property: "og:title", content: "Contact — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "Talk to us about supported housing placements, property partnerships or impact investment.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
  return (
    <main>
      <h1>Contact</h1>
    </main>
  );
}
