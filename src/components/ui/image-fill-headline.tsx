import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ImageFillHeadline — the signature hero treatment.
 *
 * Anton uppercase lines with photography showing through the letterforms
 * (background-clip: text). Degrades to solid white/orange text where
 * background-clip: text is unsupported, via @supports.
 */
export interface HeadlineLine {
  /** Keep to 2–3 words so it never squashes at 360px. */
  text: string;
  /** Photograph shown through the letterforms. */
  image: string;
  /** Fallback / stroke colour and tint register for this line. */
  tone?: "neutral" | "orange";
}

export function ImageFillHeadline({
  lines,
  as: Heading = "h1",
  className,
  align = "center",
}: {
  lines: HeadlineLine[];
  as?: "h1" | "h2";
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <Heading
      className={cn(
        "display-hero text-balance",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {lines.map((line, i) => (
        <span
          key={`${line.text}-${i}`}
          className={cn(
            "block",
            line.tone === "orange" ? "text-orange-500" : "text-white",
          )}
          style={
            {
              "--fill-image": `url(${line.image})`,
            } as React.CSSProperties
          }
        >
          <span className="image-fill-line" data-tone={line.tone ?? "neutral"}>
            {line.text}
          </span>
        </span>
      ))}
    </Heading>
  );
}
