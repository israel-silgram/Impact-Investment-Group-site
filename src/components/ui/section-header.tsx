import * as React from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  align = "left",
  eyebrowTone = "teal",
  as: Heading = "h2",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  eyebrowTone?: "teal" | "muted";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const centred = align === "center";
  return (
    <div className={cn("flex flex-col gap-4", centred && "items-center text-center", className)}>
      {eyebrow ? (
        <div className={cn("flex items-center gap-3", centred && "justify-center")}>
          <span aria-hidden="true" className="h-px w-8 bg-navy-600" />
          <span
            className={cn("eyebrow", eyebrowTone === "teal" ? "text-teal-400" : "text-slate-muted")}
          >
            {eyebrow}
          </span>
        </div>
      ) : null}
      <Heading id={id} className="heading-tight text-balance text-[clamp(1.75rem,3.2vw,2.75rem)] font-bold text-white">
        {title}
      </Heading>
      {lead ? (
        <p className={cn("measure text-base leading-relaxed text-mist", centred && "mx-auto")}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}
