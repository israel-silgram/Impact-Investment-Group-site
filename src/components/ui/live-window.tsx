import * as React from "react";
import { cn } from "@/lib/utils";

export interface LiveWindowTab {
  id: string;
  label: string;
}

/**
 * LiveWindow — a product panel built as real markup, never a screenshot.
 * Any sample figures inside are labelled once here as illustrative.
 */
export function LiveWindow({
  tabs,
  activeTab,
  onTabChange,
  children,
  label = "illustrative interface data",
  ariaLabel = "Platform interface preview",
  className,
}: {
  tabs?: LiveWindowTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  children: React.ReactNode;
  label?: string | null;
  ariaLabel?: string;
  className?: string;
}) {
  const [internal, setInternal] = React.useState(tabs?.[0]?.id);
  const current = activeTab ?? internal;
  const select = onTabChange ?? setInternal;

  return (
    <figure
      aria-label={ariaLabel}
      className={cn("panel overflow-hidden not-prose m-0", className)}
    >
      {tabs?.length ? (
        <div
          role="tablist"
          aria-label="Interface views"
          className="flex flex-wrap gap-2 border-b border-navy-700 bg-navy-900/40 p-3"
        >
          {tabs.map((tab) => {
            const active = tab.id === current;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => select(tab.id)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-full border px-4 font-heading text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
                  active
                    ? "border-teal-500 bg-teal-950 text-teal-400"
                    : "border-navy-700 text-slate-muted hover:border-navy-600 hover:text-mist",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="p-4 sm:p-6">{children}</div>

      {label ? (
        <figcaption className="border-t border-navy-700 px-4 py-3 text-[12px] text-slate-muted sm:px-6">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
