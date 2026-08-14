import { createFileRoute } from "@tanstack/react-router";

import { PartnersHub } from "@/components/partners/partners-hub";

export const Route = createFileRoute("/partners")({
  component: PartnersPage,
  head: () => ({
    meta: [
      { title: "Our Partners — Impact Investment Platform" },
      {
        name: "description",
        content:
          "Explore the ten partners connecting housing need, property, investment, care and support around residents, individuals and families.",
      },
    ],
  }),
});

function PartnersPage() {
  return <PartnersHub />;
}
