import * as React from "react";

import ecosystemBand from "@/assets/ecosystem-band.jpg";
import { whatWeDo } from "@/content/platform";
import { cn } from "@/lib/utils";

/**
 * DeliverySpine — the four "what we do for you" steps, drawn with the same
 * horizontal-path pattern as the homepage ecosystem spine. Hover, focus or tap
 * a step to reveal the named counterparty or data source behind it.
 */
export function DeliverySpine({ className }: { className?: string }) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div
      className={cn(
        "section-dark relative overflow-hidden rounded-panel border border-navy-700",
        className,
      )}
    >
      <img
        src={ecosystemBand}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1920}
        height={640}
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/80 to-navy-900/60"
      />

      <div className="relative px-4 py-10 sm:px-8 sm:py-14">
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 24"
          preserveAspectRatio="none"
          className="hidden h-6 w-full md:block"
        >
          <path
            d="M20,12 C240,-6 420,30 560,12 C700,-6 850,26 980,12"
            fill="none"
            stroke="var(--color-teal-500)"
            strokeOpacity="0.6"
            strokeWidth="2"
          />
          <path
            d="M760,19 C840,23 920,10 980,12"
            fill="none"
            stroke="var(--color-orange-500)"
            strokeWidth="2.5"
          />
        </svg>

        <ol className="mt-6 grid gap-6 md:mt-4 md:grid-cols-4 md:gap-4">
          {whatWeDo.steps.map((step, i) => {
            const open = openId === step.id;
            const orange = step.tone === "orange";
            return (
              <li key={step.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onMouseEnter={() => setOpenId(step.id)}
                  onMouseLeave={() => setOpenId((cur) => (cur === step.id ? null : cur))}
                  onFocus={() => setOpenId(step.id)}
                  onClick={() => setOpenId(open ? null : step.id)}
                  className={cn(
                    "group flex min-h-11 w-full cursor-pointer flex-col items-start gap-2 rounded-panel border bg-navy-900/70 p-4 text-left backdrop-blur-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400",
                    orange
                      ? "border-orange-500/60 hover:border-orange-500"
                      : "border-navy-600 hover:border-teal-400",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-7 place-items-center rounded-full font-heading text-xs font-bold",
                        /* Navy ink on the amber fill: white on orange-500 is 2.6:1. */
                        orange ? "bg-orange-500 text-navy-950" : "bg-navy-700 text-teal-400",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className={cn("eyebrow", orange ? "text-orange-400" : "text-teal-400")}>
                      {step.spine}
                    </span>
                  </span>
                  <span className="heading-tight text-lg font-bold text-white">{step.title}</span>
                  <span className="text-sm leading-snug text-mist">{step.detail}</span>
                  <span
                    className={cn(
                      "text-[12px] font-semibold uppercase tracking-[0.12em] transition-opacity duration-200",
                      open ? "opacity-100" : "opacity-0",
                      orange ? "text-orange-400" : "text-teal-400",
                    )}
                  >
                    {step.meta}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
