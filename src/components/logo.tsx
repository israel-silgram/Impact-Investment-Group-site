/**
 * Brand logo lockup, inline SVG — a circle containing a house glyph with two
 * figures inside it (one white, one orange), then the wordmark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="flex items-center gap-3">
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className="size-10 shrink-0 sm:size-11"
          fill="none"
        >
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" className="text-white" />
          {/* house */}
          <path
            d="M15 33 32 19l17 14"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          />
          <path
            d="M19 33v13h26V33"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          />
          {/* figure one — white */}
          <circle cx="27.5" cy="35" r="2.6" fill="currentColor" className="text-white" />
          <path
            d="M23.6 46v-4.4a3.9 3.9 0 0 1 7.8 0V46"
            fill="currentColor"
            className="text-white"
          />
          {/* figure two — orange */}
          <circle cx="37" cy="37.5" r="2.2" fill="currentColor" className="text-orange-500" />
          <path
            d="M33.6 46v-3.4a3.4 3.4 0 0 1 6.8 0V46"
            fill="currentColor"
            className="text-orange-500"
          />
        </svg>

        <span className="flex flex-col leading-none">
          <span className="font-heading text-lg font-extrabold tracking-tight text-white sm:text-xl">
            Impact <span className="text-orange-500">Investment</span>
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span aria-hidden="true" className="h-px w-4 bg-orange-500 sm:w-6" />
            <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.34em] text-white sm:text-[11px]">
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
