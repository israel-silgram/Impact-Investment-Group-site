import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/partners/partner-page";
import { getPartnerProfile } from "@/content/partners";

const profile = getPartnerProfile("care-provider");
export const Route = createFileRoute("/partner-with-care-provider")({
  component: () => <PartnerPage profile={profile} />,
  head: () => ({
    meta: [
      { title: "Partner with a Care Provider — Impact Investment Group" },
      { name: "description", content: profile.summary },
      {
        property: "og:title",
        content: "Partner with a Care Provider — Impact Investment Group",
      },
      { property: "og:description", content: profile.summary },
      { property: "og:url", content: profile.path },
    ],
    links: [{ rel: "canonical", href: profile.path }],
  }),
});
