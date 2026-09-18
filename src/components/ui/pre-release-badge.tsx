import { cn } from "@/lib/utils";

/**
 * Understated pre-release marker. Sits directly above a page's primary action
 * so nobody reads the product as live and buyable.
 */
export function PreReleaseBadge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        /* teal-600, not 400. This badge sits on the cream on every
           page of the site, where 400 is 2.14:1 at 11px and 600 is 4.67:1.
           It was the last teal-400 left standing when wave 412 deleted the
           light remap that had been quietly correcting it. */
        "flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-6 bg-teal-600 sm:w-10" />
      <span>Coming soon · Register your interest</span>
      <span aria-hidden="true" className="h-px w-6 bg-teal-600 sm:w-10" />
    </p>
  );
}
