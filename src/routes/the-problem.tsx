import { createFileRoute } from "@tanstack/react-router";
import { DemandMap } from "@/components/home/demand-map";
import { PageShell } from "@/components/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/ui/reveal";
import { demandMapNote } from "@/content/home";


export const Route = createFileRoute("/the-problem")({
  component: TheProblemPage,
  head: () => ({
    meta: [
      { title: "The Problem — The Impact Investment Platform" },
      {
        name: "description",
        content:
          "Why supported housing placement, compliance and capital allocation break down across UK local authorities and providers.",
      },
      { property: "og:title", content: "The Problem — The Impact Investment Platform" },
      {
        property: "og:description",
        content:
          "Why supported housing placement, compliance and capital allocation break down across UK local authorities and providers.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/the-problem" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/the-problem" }],
  }),
});

function TheProblemPage() {
  return (
    <>
      <PageShell
        eyebrow="The Problem"
        title="Supply, support and capital do not currently meet in the same place"
        lead="The evidenced case for change, built only from sourced figures. No statistic appears on this page without its origin."
        primaryAction={{ label: "Register to join the wait list", enquiry: "waitlist" }}
      />

      <section
        aria-labelledby="problem-demand-heading"
        className="border-t border-navy-700 bg-navy-950"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8">
          <Reveal>
            <SectionHeader
              id="problem-demand-heading"
              eyebrow="Where the demand sits"
              title="Compare demand authority by authority"
              lead="Every highlighted authority has a published commissioning brief. Select one to compare its sourced homes, potential rooms and demand intensity against the others."
            />
          </Reveal>
          <Reveal index={1} className="mt-10">
            <DemandMap />
          </Reveal>
          <p className="mt-10 text-[12px] leading-snug text-slate-muted">{demandMapNote}</p>
        </div>
      </section>
    </>
  );

}
