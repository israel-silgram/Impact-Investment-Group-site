import * as React from "react";
import { cn } from "@/lib/utils";
import { SourceLine } from "@/components/ui/source-line";
import { useCountUp } from "@/components/ui/reveal";

interface StatBlockBaseProps {
  label: string;
  className?: string;
}

interface StatFilled extends StatBlockBaseProps {
  variant?: "default";
  /** Verified figure exactly as supplied. */
  value: string;
  /** Required. No bare statistics anywhere on this site. */
  source: string;
  /** Optional numeric target for the count-up; omit for non-numeric values. */
  countTo?: number;
  /** Rendered after the counted number, e.g. "%" or "+". */
  suffix?: string;
  /** Rendered before the counted number, e.g. "£". */
  prefix?: string;
}

interface StatEmpty extends StatBlockBaseProps {
  variant: "empty";
  /** The condition that will fill this figure. */
  condition: string;
}

export type StatBlockProps = StatFilled | StatEmpty;

export function StatBlock(props: StatBlockProps) {
  const numberClass =
    "font-heading font-bold leading-none text-white text-[clamp(2rem,4vw,3.5rem)] tracking-[-0.02em]";

  if (props.variant === "empty") {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 rounded-[var(--radius-panel)] border border-dashed border-navy-600 p-5",
          props.className,
        )}
      >
        <span className={numberClass} aria-hidden="true">
          —
        </span>
        <span className="sr-only">Figure not yet available</span>
        <p className="font-heading text-base font-semibold text-mist">{props.label}</p>
        <p className="text-[12px] leading-snug text-slate-muted">{props.condition}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", props.className)}>
      <StatValue value={props.value} countTo={props.countTo} prefix={props.prefix} suffix={props.suffix} className={numberClass} />
      <p className="font-heading text-base font-semibold text-mist">{props.label}</p>
      <SourceLine source={props.source} />
    </div>
  );
}

function StatValue({
  value,
  countTo,
  prefix,
  suffix,
  className,
}: {
  value: string;
  countTo?: number;
  prefix?: string;
  suffix?: string;
  className: string;
}) {
  const { ref, display } = useCountUp(countTo ?? 0);
  if (countTo === undefined) {
    return <span className={className}>{value}</span>;
  }
  const rounded = Math.round(display).toLocaleString("en-GB");
  return (
    <span ref={ref} className={className}>
      {prefix}
      {rounded}
      {suffix}
    </span>
  );
}
