import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/partners/partner-page";
import { getPartnerProfile } from "@/content/partners";

const profile = getPartnerProfile("local-authority");
export const Route = createFileRoute("/partner-with-local-authority")({
  component: () => <PartnerPage profile={profile} />,
  head: () => ({
    meta: [
      { title: "Partner with a Local Authority — The Impact Investment Platform" },
      { name: "description", content: profile.summary },
      {
        property: "og:title",
        content: "Partner with a Local Authority — The Impact Investment Platform",
      },
      { property: "og:description", content: profile.summary },
      { property: "og:url", content: profile.path },
    ],
    links: [{ rel: "canonical", href: profile.path }],
  }),
});
