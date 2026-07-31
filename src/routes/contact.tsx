import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageShell } from "@/components/page-shell";

const enquiryTypes = [
  "demo",
  "sales",
  "partner",
  "investor",
  "media",
  "support",
] as const;

/** Footer and header deep-links pre-select the enquiry type via ?enquiry=. */
const searchSchema = z.object({
  enquiry: z.enum(enquiryTypes).catch("demo"),
  /** Role the visitor was reading on /solutions, pre-selected in the form. */
  role: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  validateSearch: (search) => searchSchema.parse(search),
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
  const { enquiry, role } = Route.useSearch();
  return (
    <PageShell
      eyebrow={role ? `Contact · ${enquiry} · ${role}` : `Contact · ${enquiry}`}
      title="Tell us which conversation you need"
      lead="The enquiry form validates in the browser and routes to the right team. Enquiry type is pre-selected from the link you followed."
      primaryAction={{ label: "Book a demo", enquiry: "demo" }}
    />
  );
}
