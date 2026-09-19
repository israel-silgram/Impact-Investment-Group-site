import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { PreReleaseBadge } from "@/components/ui/pre-release-badge";
import { Reveal } from "@/components/ui/reveal";
import { registerRoute } from "@/content/site";

/**
 * Titled shell for routes whose content has not been signed off yet.
 * Chrome is live; the body is a deliberate empty state, not filler copy.
 */
export function PageShell({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
      <Reveal>
        <SectionHeader as="h1" eyebrow={eyebrow} title={title} lead={lead} />
      </Reveal>
      <Reveal index={1} className="mt-10">
        <PreReleaseBadge className="mb-5" />
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" asChild>
            <Link to={registerRoute.to}>{registerRoute.label}</Link>
          </Button>
          <Button variant="secondary" asChild withArrow={false}>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </Reveal>
      <Reveal index={2} className="mt-14">
        {/* A QUIET DASHED CARD, NOT A WARNING. This is an honest empty state
            on a page whose copy has not been signed off; it should read as a
            reserved space, which is cream and a dashed hairline, rather than
            as something that has gone wrong, which is what an outlined box on
            a white page looks like. */}
        <div className="rounded-[var(--radius-panel)] border border-dashed border-rule bg-page-alt p-8">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Section content slot · empty until approved
          </p>
          <p className="measure mt-3 text-sm text-ink-muted">
            Design system and global chrome are in place. Page sections will be built from typed
            content files once copy and sourced figures are signed off.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
