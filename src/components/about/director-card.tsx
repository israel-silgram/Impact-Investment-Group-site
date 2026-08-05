import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Director } from "@/content/about";

const icon = (name?: string): LucideIcon =>
  (name && (Icons as unknown as Record<string, LucideIcon>)[name]) || Icons.UserRound;

/**
 * A person on the team, on a cream card.
 *
 * Renders a real photograph when one is supplied, otherwise the person's
 * initials. Never a stock face — a placeholder head is worse than no head,
 * because a reader assumes it is them.
 *
 * ── Why every colour here is written out longhand ──────────────────────────
 *
 * The card is cream and sits on the cream About page. Every colour is stated
 * longhand rather than left to `.section-light`, because these cards also have
 * to survive being dropped on a navy section — the homepage may yet want them.
 * All of it is measured against the CREAM, which is the harsher of the two
 * grounds. From the contrast
 * table in CLAUDE.md, measured against #f7f1e6:
 *
 *   navy-900    16.8:1  ✓ names
 *   slate-ink    6.2:1  ✓ bio and credential lines
 *   teal-600     4.7:1  ✓ roles
 *   orange-700   4.1:1  ✗ for 14px text — large text only, 26px+
 *   orange-600   3.0:1  ✗
 *   orange-500   2.3:1  ✗ — icon glyphs and fills only
 *
 * So no role is set in orange, including Israel's. His seniority is carried by
 * things that are not text and therefore have no contrast floor: the card runs
 * full width, it takes a 4px orange left rule, and his portrait ring, icon and
 * credential markers are orange. Everyone else's are teal. That keeps the
 * hierarchy obvious and the accent legal at the same time.
 *
 * Two shapes, one component:
 *
 *   "lead"    full width, larger portrait, the bio paragraph, orange accent.
 *   "member"  compact card for the grid beneath — credentials, no bio.
 *
 * The hierarchy is size, width and accent. Nobody is shrunk to make the lead
 * look bigger, which is what makes it read as seniority rather than a ranking.
 */
export function DirectorCard({
  director,
  variant = "lead",
  className,
}: {
  director: Director;
  variant?: "lead" | "member";
  className?: string;
}) {
  const lead = variant === "lead";
  const orange = director.accent === "orange";
  const Icon = icon(director.icon);

  /* Graphics, not text — orange is permitted on cream as a fill or a glyph. */
  const ring = orange ? "ring-orange-600" : "ring-teal-600";
  const glyph = orange ? "text-orange-600" : "text-teal-600";
  const marker = orange ? "bg-orange-600" : "bg-teal-600";

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl bg-cream-card",
        /* cream-card (#efe6d6), not the page cream (#f7f1e6): the About page
           is now one continuous cream ground, so a card in the same cream as
           the page behind it would have no edge at all. One step darker plus a
           navy hairline is what makes it read as a card. */
        "border border-[color-mix(in_oklab,var(--color-navy-900)_14%,transparent)]",
        "shadow-[0_1px_2px_rgba(0,17,43,0.05),0_10px_30px_-18px_rgba(0,17,43,0.25)]",
        orange && "border-l-4 border-l-orange-600",
        lead
          ? "gap-5 p-5 sm:flex-row sm:items-start sm:gap-6"
          : "items-center gap-3 p-4 text-center",
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
          className={cn(
            "shrink-0 rounded-full object-cover ring-2",
            lead ? "size-20" : "size-14",
            ring,
          )}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-white font-heading font-bold text-navy-900 ring-2",
            lead ? "size-20 text-2xl" : "size-14 text-lg",
            ring,
          )}
        >
          {director.initials}
        </span>
      )}

      <div className={cn("min-w-0", !lead && "flex w-full flex-col items-center")}>
        {/* The discipline icon. White disc, navy ring at 18%, and exactly one
            accent — the glyph itself. Never two accents, never a filled shape. */}
        {director.icon ? (
          <span
            aria-hidden="true"
            className={cn(
              "grid place-items-center rounded-full bg-white",
              "border border-[color-mix(in_oklab,var(--color-navy-900)_18%,transparent)]",
              lead ? "mb-3 size-9" : "mb-2.5 size-8",
            )}
          >
            <Icon className={cn(lead ? "size-4" : "size-[15px]", glyph)} strokeWidth={1.5} />
          </span>
        ) : null}

        <h3
          className={cn(
            "font-heading font-bold text-navy-900",
            lead ? "text-lg" : "text-[14px]",
          )}
        >
          {director.name}
        </h3>
        {/* teal-600 at 4.7:1. Israel's is teal too — orange is 4.1:1 here and
            fails at this size, and his card is already carrying the accent in
            three places that have no contrast floor. */}
        <p className="mt-0.5 text-[12.5px] font-semibold text-teal-600">{director.role}</p>

        {lead && director.bio ? (
          <p className="mt-3 max-w-[70ch] text-[13px] leading-relaxed text-slate-ink">{director.bio}</p>
        ) : null}

        {director.credentials?.length ? (
          <ul className={cn("mt-3 flex flex-col gap-1", !lead && "items-center")}>
            {director.credentials.map((line) => (
              <li
                key={line}
                className={cn(
                  "flex gap-2 text-[12px] leading-[1.45] text-slate-ink",
                  !lead && "justify-center text-center",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("mt-[6px] size-[5px] shrink-0 rounded-full", marker)}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
