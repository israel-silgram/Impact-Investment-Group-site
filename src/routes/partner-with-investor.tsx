import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/partners/partner-page";
import { getPartnerProfile } from "@/content/partners";

const profile = getPartnerProfile("investor");

export const Route = createFileRoute("/partner-with-investor")({
  component: () => <PartnerPage profile={profile} />,
  head: () => partnerHead(profile.label, profile.summary, profile.path),
});

function partnerHead(label: string, description: string, path: string) {
  return {
    meta: [
      { title: `Partner with ${label} — The Impact Investment Platform` },
      { name: "description", content: description },
      { property: "og:title", content: `Partner with ${label} — The Impact Investment Platform` },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: path },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}
