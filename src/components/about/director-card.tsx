import { cn } from "@/lib/utils";
import type { Director } from "@/content/about";

/**
 * Single director card. Renders a real photograph when one is supplied,
 * otherwise the person's initials in a navy circle with a teal ring.
 * Never a stock face.
 */
export function DirectorCard({
  director,
  className,
}: {
  director: Director;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col gap-6 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/60 p-8 sm:flex-row sm:items-start sm:gap-8",
        className,
      )}
    >
      {director.portrait ? (
        <img
          src={director.portrait}
          alt={`${director.name}, ${director.role}`}
          loading="lazy"
          width={224}
          height={224}
          className="size-28 shrink-0 rounded-full object-cover ring-2 ring-teal-400"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-28 shrink-0 place-items-center rounded-full bg-navy-900 font-heading text-3xl font-bold text-teal-400 ring-2 ring-teal-400"
        >
          {director.initials}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="font-heading text-xl font-bold text-white">{director.name}</h3>
        <p className="mt-1 text-sm font-semibold text-teal-400">{director.role}</p>
        <p className="mt-4 text-sm leading-relaxed text-mist">{director.bio}</p>
      </div>
    </article>
  );
}
