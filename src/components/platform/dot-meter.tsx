import { cn } from "@/lib/utils";

/** Five-dot meter. Filled dots are teal-500; the rest are a hollow navy ring. */
export function DotMeter({
  label,
  filled,
  total = 5,
  className,
}: {
  label: string;
  filled: number;
  total?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <span className="font-heading text-sm font-semibold text-mist">{label}</span>
      <span
        role="img"
        aria-label={`${label}: ${filled} out of ${total}`}
        className="flex shrink-0 items-center gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "size-2.5 rounded-full",
              i < filled ? "bg-teal-500" : "border border-navy-600",
            )}
          />
        ))}
      </span>
    </div>
  );
}
