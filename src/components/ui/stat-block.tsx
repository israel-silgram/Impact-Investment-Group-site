import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconCircle } from "@/components/ui/icon-circle";

interface StatBlockBaseProps {
  label: string;
  className?: string;
  /** Lucide glyph shown in a 40px ring above the figure. */
  icon?: LucideIcon;
  /** Teal is the default: figures are data. Orange stays scarce. */
  tone?: "teal" | "orange";
}

interface StatFilled extends StatBlockBaseProps {
  variant?: "default";
  /** Verified figure exactly as supplied. */
  value: string;
  /**
   * Required. Where the figure comes from, or what it measures. Never dropped
   * to save space: these populations overlap, and the basis is what stops a
   * reader adding them together.
   */
  basis: string;
}

interface StatEmpty extends StatBlockBaseProps {
  variant: "empty";
  /** The condition that will fill this figure. */
  basis?: string;
}

export type StatBlockProps = StatFilled | StatEmpty;

/**
 * A compact data card. Sized for the cream sections: teal-600 figure, navy
 * label, and a quieter basis line beneath it.
 *
 * Deliberately dense. Six of these run in a single row beneath Our Mission |
 * The Problem, and that section has to land inside one screen — so the ring is
 * 32px rather than 40, the figure 26px rather than 30, and the padding and
 * gaps are one step tighter than they would otherwise be. The basis line is
 * never what gets cut to buy that space.
 */
export function StatBlock(props: StatBlockProps) {
  const { icon: Icon, tone = "teal", label, className } = props;

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-1 rounded-xl border p-3",
        props.variant === "empty" && "border-dashed",
        className,
      )}
    >
      {Icon ? <IconCircle icon={Icon} size="xs" tone={tone} /> : null}

      {props.variant === "empty" ? (
        <>
          {/* Rendered literally so a missing number is never mistaken for one. */}
          <span className="font-mono text-[15px] font-bold leading-none text-teal-600">
            [FIGURE TBC]
          </span>
          <span className="sr-only">Figure not yet available</span>
        </>
      ) : (
        <span className="font-heading text-[26px] font-extrabold leading-none tracking-[-0.02em] text-teal-600">
          {props.value}
        </span>
      )}

      <p className="text-[11px] font-semibold uppercase leading-snug tracking-[0.07em] text-[color-mix(in_oklab,var(--color-navy-900)_70%,transparent)]">
        {label}
      </p>

      {props.basis ? (
        <p className="mt-auto text-[10px] leading-snug text-[color-mix(in_oklab,var(--color-navy-900)_55%,transparent)]">
          {props.basis}
        </p>
      ) : null}
    </div>
  );
}
