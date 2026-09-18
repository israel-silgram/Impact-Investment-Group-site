import { cn } from "@/lib/utils";
import type { RoleSection } from "@/content/solutions";

/**
 * Sticky navigation for the eight sections.
 * Side rail from 1024px; horizontal chip bar below that.
 */
export function SectionRail({
  sections,
  active,
  onSelect,
}: {
  sections: RoleSection[];
  active: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <nav aria-label="Solutions sections">
      {/* Desktop side rail */}
      <ul className="hidden flex-col gap-1 lg:flex">
        {sections.map((section) => {
          const isActive = section.slug === active;
          return (
            <li key={section.slug}>
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(section.slug)}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-r-[6px] border-l-2 pl-4 pr-3 text-left font-heading text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
                  isActive
                    ? "border-teal-600 bg-page/60 text-ink"
                    : "border-rule text-ink-muted hover:border-rule hover:text-ink-muted",
                )}
              >
                <span className="text-[12px] tabular-nums text-ink-muted">{section.number}</span>
                <span className="truncate">{section.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Mobile / tablet chip bar */}
      <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => {
          const isActive = section.slug === active;
          return (
            <li key={section.slug} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(section.slug)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-full border px-4 font-heading text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
                  isActive
                    ? "border-teal-600 bg-tint-teal text-teal-600"
                    : "border-rule text-ink-muted hover:border-rule hover:text-ink-muted",
                )}
              >
                {section.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
