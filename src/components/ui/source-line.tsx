import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** The small muted attribution row that sits under every statistic. */
export function SourceLine({ source, className }: { source: string; className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-[12px] leading-snug text-slate-muted", className)}>
      <ShieldCheck aria-hidden="true" className="mt-px size-3 shrink-0 text-teal-500" />
      <span className="min-w-0">{source}</span>
    </p>
  );
}
