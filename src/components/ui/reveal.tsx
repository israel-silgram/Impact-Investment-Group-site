import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals children with a 16px fade-and-rise, once, on first view.
 * Siblings stagger by 60ms via the `index` prop.
 * Disabled entirely under prefers-reduced-motion.
 */
export function Reveal({
  children,
  index = 0,
  as: Tag = "div",
  className,
  ...rest
}: {
  children: React.ReactNode;
  index?: number;
  as?: "div" | "section" | "li" | "article" | "header" | "span";
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-revealed={revealed}
      style={{ "--reveal-delay": `${index * 60}ms` } as React.CSSProperties}
      className={cn("reveal", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Counts up to `value` on first view; static under reduced motion. */
export function useCountUp(value: number, durationMs = 1200) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(value * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return { ref, display };
}
