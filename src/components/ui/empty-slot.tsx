import { cn } from "@/lib/utils";

/**
 * Deliberate empty state. Used where real material does not exist yet —
 * never a stock-photo stand-in.
 */
export function EmptySlot({
  label = "Case study slot · empty until real",
  detail,
  initials,
  className,
}: {
  label?: string;
  detail?: string;
  /** Optional initials circle where a portrait would otherwise sit. */
  initials?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-[var(--radius-panel)] border border-dashed border-navy-600 p-6 text-center",
        className,
      )}
    >
      {initials ? (
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full border border-navy-600 font-heading text-sm font-semibold text-slate-muted"
        >
          {initials}
        </span>
      ) : null}
      <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-slate-muted">
        {label}
      </p>
      {detail ? <p className="max-w-[36ch] text-[12px] text-slate-muted">{detail}</p> : null}
    </div>
  );
}
