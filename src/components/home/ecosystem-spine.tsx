import * as React from "react";

import ecosystemBand from "@/assets/ecosystem-band.jpg";
import { ecosystemStages } from "@/content/home";
import { cn } from "@/lib/utils";

/**
 * EcosystemSpine — the five delivery stages told properly: a horizontal path
 * drawn over an illustrated band. Hover or tap a stage to reveal who does it.
 * Deliberately larger and interactive, unlike the compact hero rail.
 */
export function EcosystemSpine({ className }: { className?: string }) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div className={cn("relative overflow-hidden rounded-panel border border-navy-700", className)}>
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
        {/* the spine */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 24"
          preserveAspectRatio="none"
          className="hidden h-6 w-full md:block"
        >
          <path
            d="M20,12 C220,-6 380,30 520,12 C660,-6 820,26 980,12"
            fill="none"
            stroke="var(--color-teal-500)"
            strokeOpacity="0.6"
            strokeWidth="2"
          />
          <path
            d="M700,17 C800,22 900,10 980,12"
            fill="none"
            stroke="var(--color-orange-500)"
            strokeWidth="2.5"
          />
        </svg>

        <ol className="mt-6 grid gap-6 md:mt-4 md:grid-cols-5 md:gap-4">
          {ecosystemStages.map((stage, i) => {
            const open = openId === stage.id;
            const orange = stage.tone === "orange";
            return (
              <li key={stage.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onMouseEnter={() => setOpenId(stage.id)}
                  onMouseLeave={() => setOpenId((cur) => (cur === stage.id ? null : cur))}
                  onFocus={() => setOpenId(stage.id)}
                  onClick={() => setOpenId(open ? null : stage.id)}
                  className={cn(
                    "group flex min-h-11 w-full cursor-pointer flex-col items-start gap-2 rounded-panel border bg-navy-900/70 p-4 text-left backdrop-blur-sm transition-colors duration-200",
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
                        orange
                          ? "bg-orange-500 text-white"
                          : "bg-navy-700 text-teal-400",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "eyebrow",
                        orange ? "text-orange-400" : "text-teal-400",
                      )}
                    >
                      {stage.spine}
                    </span>
                  </span>
                  <span className="heading-tight text-lg font-bold text-white">{stage.title}</span>
                  <span className="text-sm leading-snug text-mist">{stage.detail}</span>
                  <span
                    className={cn(
                      "text-[12px] font-semibold uppercase tracking-[0.12em] transition-opacity duration-200",
                      open ? "opacity-100" : "opacity-0",
                      orange ? "text-orange-400" : "text-teal-400",
                    )}
                  >
                    {stage.owner}
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
