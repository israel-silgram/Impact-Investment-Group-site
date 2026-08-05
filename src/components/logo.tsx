import { cn } from "@/lib/utils";

/**
 * Brand logo lockup — matches the official Impact Investment mark: a split ring
 * (orange upper arc, neutral lower arc) enclosing an outlined house with a
 * chimney and two figures inside it — a taller neutral adult on the left, a
 * shorter orange child on the right — then the stacked "Impact Investment /
 * Platform" wordmark.
 *
 * The neutral half of the artwork follows the ground it sits on: white on navy,
 * navy-900 on cream. White on cream is invisible, so a light section must pass
 * variant="on-cream". The orange is never substituted or tinted in either.
 */
export function Logo({
  className,
  variant = "on-navy",
}: {
  className?: string;
  variant?: "on-navy" | "on-cream";
}) {
  const neutral = variant === "on-cream" ? "text-navy-900" : "text-white";

  return (
    <span className={className}>
      <span className="flex items-center gap-3">
        <svg viewBox="0 0 64 64" aria-hidden="true" className="size-10 shrink-0 sm:size-11" fill="none">
          {/* split ring — orange upper arc */}
          <path
            d="M4.4 33.2A27.6 27.6 0 0 1 59.6 33.2"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            className="text-orange-500"
          />
          {/* split ring — lower arc */}
          <path
            d="M4.8 30.8A27.2 27.2 0 0 0 59.2 30.8"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            className={neutral}
          />
          {/* house — frame in the brand neutral, interior open */}
          <path
            d="M16 31.5 32 17.5 48 31.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={neutral}
          />
          <path
            d="M20.6 32.5V47.5M43.4 32.5V47.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className={neutral}
          />
          <path
            d="M41 22.4v-4h3.1v9.4"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={neutral}
          />
          {/* figure one — neutral */}
          <circle cx="28" cy="34.2" r="2.7" fill="currentColor" className={neutral} />
          <path
            d="M24.2 47.5v-5.4a3.8 3.8 0 0 1 7.6 0v5.4h-7.6Z"
            fill="currentColor"
            className={neutral}
          />
          {/* figure two — orange */}
          <circle cx="36.4" cy="36.6" r="2.3" fill="currentColor" className="text-orange-500" />
          <path
            d="M33.1 47.5v-4.6a3.3 3.3 0 0 1 6.6 0v4.6h-6.6Z"
            fill="currentColor"
            className="text-orange-500"
          />
        </svg>

        <span className="flex flex-col leading-none">
          <span
            className={cn("font-heading text-lg font-extrabold tracking-tight sm:text-xl", neutral)}
          >
            Impact <span className="text-orange-500">Investment</span>
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span aria-hidden="true" className="h-px w-4 bg-orange-500 sm:w-6" />
            <span
              className={cn(
                "font-heading text-[10px] font-semibold uppercase tracking-[0.34em] sm:text-[11px]",
                neutral,
              )}
            >
              Platform
            </span>
            <span aria-hidden="true" className="h-px w-4 bg-orange-500 sm:w-6" />
          </span>
        </span>
      </span>
      <span className="sr-only">Impact Investment Platform — home</span>
    </span>
  );
}
