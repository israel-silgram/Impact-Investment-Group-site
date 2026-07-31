import { cn } from "@/lib/utils";

/**
 * Understated pre-release marker. Sits directly above a page's primary action
 * so nobody reads the product as live and buyable.
 */
export function PreReleaseBadge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-400",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-6 bg-teal-600 sm:w-10" />
      <span>Coming soon · Invitation only · Pre-release access</span>
      <span aria-hidden="true" className="h-px w-6 bg-teal-600 sm:w-10" />
    </p>
  );
}
