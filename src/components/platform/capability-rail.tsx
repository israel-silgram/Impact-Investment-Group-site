import { cn } from "@/lib/utils";
import type { CapabilityLink } from "@/content/platform";

/**
 * Capability jump-nav. Horizontal sticky strip below the header up to 1280px,
 * vertical rail from 1280px.
 */
export function CapabilityRail({
  links,
  active,
  onSelect,
}: {
  links: CapabilityLink[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Platform capabilities">
      {/* Vertical rail ≥1280px */}
      <ul className="hidden flex-col gap-1 xl:flex">
        {links.map((link) => {
          const isActive = link.id === active;
          return (
            <li key={link.id}>
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(link.id)}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center rounded-r-[6px] border-l-2 px-4 text-left font-heading text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400",
                  isActive
                    ? "border-teal-500 bg-navy-800/60 text-white"
                    : "border-navy-700 text-slate-muted hover:border-navy-600 hover:text-mist",
                )}
              >
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Horizontal chip strip below 1280px */}
      <ul className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
        {links.map((link) => {
          const isActive = link.id === active;
          return (
            <li key={link.id} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(link.id)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-full border px-4 font-heading text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400",
                  isActive
                    ? "border-teal-500 bg-teal-950 text-teal-400"
                    : "border-navy-700 text-slate-muted hover:border-navy-600 hover:text-mist",
                )}
              >
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
