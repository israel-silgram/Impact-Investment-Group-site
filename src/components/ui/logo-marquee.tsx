import { cn } from "@/lib/utils";
import type { LogoCredit } from "@/content/trust";

/**
 * A continuous logo lane, restyled from the production site's
 * `CommissioningStrip`. The scroll behaviour is that component's, not an
 * approximation — see `.logo-marquee` in styles.css for the half-gap
 * correction the loop depends on.
 *
 * The lane itself is aria-hidden decorative motion; the names ride alongside
 * as a real visually-hidden list, so assistive tech gets the content rather
 * than a wall of unreachable images.
 */
export function LogoMarquee({
  items,
  label,
  className,
}: {
  items: LogoCredit[];
  /** Accessible name for the list of credits behind the lane. */
  label: string;
  className?: string;
}) {
  // Duplicated once so the translate loops seamlessly. Keys carry the index
  // because every logo appears twice.
  const lane = [...items, ...items];

  return (
    <div className={cn("logo-marquee", className)}>
      <div className="logo-marquee__track" aria-hidden="true">
        {lane.map((item, i) => (
          <span
            key={`${item.name}-${i}`}
            // The second lane exists only to make the loop seamless. Under
            // reduced motion the track wraps instead of scrolling, so the
            // clone is hidden or every council would appear twice.
            {...(i >= items.length ? { "data-clone": "true" } : null)}
            className="inline-flex h-14 shrink-0 items-center justify-center rounded-lg bg-white px-3 py-3"
          >
            <img
              src={item.logo}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-auto max-w-[9rem] object-contain"
            />
          </span>
        ))}
      </div>

      {/* The marquee is decoration; this is the content. */}
      <ul className="sr-only">
        <li>{label}</li>
        {items.map((item) => (
          <li key={item.name}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
