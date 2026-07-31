import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";
import { cn } from "@/lib/utils";

export interface ProcessStep {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  active?: boolean;
}

/**
 * The connected step row from the approved hero mockup.
 * Horizontal on desktop, vertical timeline on mobile.
 */
export function ProcessRail({
  steps,
  className,
}: {
  steps: ProcessStep[];
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex flex-col gap-8 md:flex-row md:items-start md:gap-0",
        className,
      )}
    >
      {steps.map((step, i) => (
        <li
          key={step.id}
          className="relative flex min-w-0 gap-4 md:flex-1 md:flex-col md:items-center md:gap-3 md:text-center"
        >
          {/* mobile vertical rule */}
          {i < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute left-[27px] top-14 h-[calc(100%+2rem)] w-px bg-navy-600 md:hidden"
            />
          ) : null}

          {/* desktop horizontal rule with midpoint dot */}
          {i < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-7 hidden h-px w-full translate-x-1/2 bg-navy-600 md:block"
            >
              <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500" />
            </span>
          ) : null}

          <IconCircle
            icon={step.icon}
            size="lg"
            tone={step.active ? "orange" : "white"}
            className="relative z-10 bg-navy-900"
          />
          <div className="min-w-0 md:px-3">
            <h3 className="font-heading text-base font-semibold text-white">{step.title}</h3>
            <p className="mt-1 text-sm leading-snug text-mist">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
