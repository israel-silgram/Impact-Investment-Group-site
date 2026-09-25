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
        "flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-[var(--radius-panel)] border border-dashed border-rule bg-page-alt p-6 text-center",
        className,
      )}
    >
      {initials ? (
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full border border-rule font-heading text-sm font-semibold text-ink-muted"
        >
          {initials}
        </span>
      ) : null}
      <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
      {detail ? (
        <p className="max-w-[36ch] text-[12px] max-lg:text-[15px] text-ink-muted">{detail}</p>
      ) : null}
    </div>
  );
}
