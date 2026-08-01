/**
 * Brand logo lockup — matches the official Impact Investment mark: a split ring
 * (orange upper arc, brand ring lower arc) enclosing a solid house with two
 * figures inside it, one in the brand neutral and one in orange, then the
 * stacked "Impact Investment / Platform" wordmark.
 *
 * On this site the chrome ground is navy, so the navy elements of the official
 * artwork are rendered in white for contrast; the orange is unchanged.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="flex items-center gap-3">
        <svg viewBox="0 0 64 64" aria-hidden="true" className="size-10 shrink-0 sm:size-11" fill="none">
          {/* split ring — orange upper arc */}
          <path
            d="M4.6 34A27.4 27.4 0 0 1 59.4 34"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-orange-500"
          />
          {/* split ring — lower arc */}
          <path
            d="M6.4 26a26 26 0 0 0 51.2 0"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-white"
          />
          {/* solid house with chimney */}
          <path
            d="M32 14.5 15 30h4.6v18h5.2V32.6h14.4V48h5.2V30H49l-5.1-4.7V17.6h-4.3v3.9L32 14.5Z"
            fill="currentColor"
            className="text-white"
          />
          {/* figure one — neutral */}
          <circle cx="28.3" cy="33.6" r="3.1" fill="currentColor" className="text-white" />
          <path
            d="M23.6 48v-6.1a4.7 4.7 0 0 1 9.4 0V48h-9.4Z"
            fill="currentColor"
            className="text-white"
          />
          {/* figure two — orange */}
          <circle cx="37.4" cy="36.4" r="2.7" fill="currentColor" className="text-orange-500" />
          <path
            d="M33.3 48v-5.1a4.1 4.1 0 0 1 8.2 0V48h-8.2Z"
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
