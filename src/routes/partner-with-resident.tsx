import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/partners/partner-page";
import { getPartnerProfile } from "@/content/partners";

const profile = getPartnerProfile("resident");
export const Route = createFileRoute("/partner-with-resident")({
  component: () => <PartnerPage profile={profile} />,
  head: () => ({
    meta: [
      { title: "Housing for Residents, Individuals & Families — The Impact Investment Platform" },
      { name: "description", content: profile.summary },
      {
        property: "og:title",
        content: "Housing for Residents, Individuals & Families — The Impact Investment Platform",
      },
      { property: "og:description", content: profile.summary },
      { property: "og:url", content: profile.path },
    ],
    links: [{ rel: "canonical", href: profile.path }],
  }),
});
