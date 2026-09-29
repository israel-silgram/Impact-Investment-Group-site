import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/partners/partner-page";
import { getPartnerProfile } from "@/content/partners";

const profile = getPartnerProfile("social-worker");
export const Route = createFileRoute("/partner-with-social-worker")({
  component: () => <PartnerPage profile={profile} />,
  head: () => ({
    meta: [
      { title: "Partner with a Social Worker — Impact Investment Group" },
      { name: "description", content: profile.summary },
      {
        property: "og:title",
        content: "Partner with a Social Worker — Impact Investment Group",
      },
      { property: "og:description", content: profile.summary },
      { property: "og:url", content: profile.path },
    ],
    links: [{ rel: "canonical", href: profile.path }],
  }),
});
