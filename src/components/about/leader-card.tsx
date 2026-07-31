import { cn } from "@/lib/utils";
import type { Leader } from "@/content/about";

/**
 * Leadership card. Renders a real portrait when one is supplied, otherwise the
 * person's initials in a navy-800 circle with a teal ring. Never a stock face.
 */
export function LeaderCard({ leader, className }: { leader: Leader; className?: string }) {
  return (
    <article
      className={cn(
        "flex h-full flex-col gap-5 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/60 p-6",
        className,
      )}
    >
      {leader.portrait ? (
        <img
          src={leader.portrait}
          alt={`${leader.name}, ${leader.role}`}
          loading="lazy"
          width={160}
          height={160}
          className="size-20 rounded-full object-cover ring-2 ring-teal-400"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-20 place-items-center rounded-full bg-navy-800 font-heading text-xl font-bold text-teal-400 ring-2 ring-teal-400"
        >
          {leader.initials}
        </span>
      )}
      <div>
        <h3 className="font-heading text-lg font-bold text-white">{leader.name}</h3>
        <p className="mt-1 text-sm font-semibold text-teal-400">{leader.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-mist">{leader.focus}</p>
      </div>
    </article>
  );
}
