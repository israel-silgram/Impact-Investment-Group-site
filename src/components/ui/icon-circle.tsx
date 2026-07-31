import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "size-10", icon: "size-4" },
  md: { box: "size-14", icon: "size-5" },
  lg: { box: "size-20", icon: "size-7" },
} as const;

const tones = {
  teal: "text-teal-400",
  white: "text-white",
  /** Orange only when this circle marks the active or primary item. */
  orange: "text-orange-500",
} as const;

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
        "inline-grid shrink-0 place-items-center rounded-full border border-navy-600 bg-navy-900/60 transition-colors duration-200",
        s.box,
        className,
      )}
    >
      <Icon className={cn(s.icon, tones[tone])} strokeWidth={1.5} />
    </span>
  );
}
