import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/partners/partner-page";
import { getPartnerProfile } from "@/content/partners";

const profile = getPartnerProfile("support-provider");
export const Route = createFileRoute("/partner-with-support-provider")({
  component: () => <PartnerPage profile={profile} />,
  head: () => ({
    meta: [
      { title: "Partner with a Support Provider — Impact Investment Group" },
      { name: "description", content: profile.summary },
      {
        property: "og:title",
        content: "Partner with a Support Provider — Impact Investment Group",
      },
      { property: "og:description", content: profile.summary },
      { property: "og:url", content: profile.path },
    ],
    links: [{ rel: "canonical", href: profile.path }],
  }),
});
