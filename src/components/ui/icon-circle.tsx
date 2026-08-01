import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "size-10", icon: "size-4" },
  md: { box: "size-14", icon: "size-5" },
  lg: { box: "size-20", icon: "size-7" },
} as const;

const tones = {
  teal: { icon: "text-teal-400", ring: "border-teal-500/70 bg-teal-950/40" },
  white: { icon: "text-white", ring: "border-navy-600 bg-navy-900/60" },
  /** Orange only when this circle marks the active or primary item. */
  orange: { icon: "text-orange-500", ring: "border-orange-500/70 bg-orange-600/10" },
  slate: { icon: "text-slate", ring: "border-slate/60 bg-slate/10" },
  navy: { icon: "text-mist", ring: "border-navy-600 bg-navy-600/30" },
} as const;

/**
 * Cycles a grid's icon circles through teal, slate and navy so the grid has
 * life in it. Exactly one item per grid gets orange — the accent stays scarce.
 */
const cycleOrder = ["teal", "slate", "navy"] as const;

export function cycleTone(index: number, orangeIndex = 1): keyof typeof tones {
  if (index === orangeIndex) return "orange";
  const offset = index > orangeIndex ? index - 1 : index;
  return cycleOrder[offset % cycleOrder.length]!;
}

export function IconCircle({
  icon: Icon,
  size = "md",
  tone = "teal",
  className,
  label,
}: {
  icon: LucideIcon;
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  className?: string;
  /** Accessible name when the circle carries meaning on its own. */
  label?: string;
}) {
  const s = sizes[size];
  return (
    <span
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": "true" })}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full border transition-colors duration-200",
        tones[tone].ring,
        s.box,
        className,
      )}
    >
      <Icon className={cn(s.icon, tones[tone].icon)} strokeWidth={1.5} />
    </span>
  );
}
