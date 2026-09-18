import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals children with an 8px fade-and-rise, once, on first view.
 * Siblings stagger by 60ms via the `index` prop.
 *
 * ── WAVE 412: THIS USED TO BE ABLE TO HIDE THE PAGE ────────────────────────
 *
 * The old version rendered `opacity: 0` in the markup and waited for an
 * IntersectionObserver to say otherwise. Three things followed from that, all
 * of them observed rather than theorised:
 *
 *   1. WITHOUT JAVASCRIPT THE CONTENT WAS INVISIBLE. The prerendered HTML
 *      carried the class, the class carried `opacity: 0`, and nothing was
 *      ever going to turn it back on. A crawler that runs no scripts, a
 *      request that lost the bundle, a browser mid-hydration: blank.
 *   2. LANDING MID-PAGE SHOWED NOTHING. Read live at 1920 wide with the page
 *      scrolled by script, the whole problem section stayed blank for over a
 *      second, because the observer had not fired for an element that was
 *      already on screen when it mounted.
 *   3. THERE WAS NO BACKSTOP. If the observer never fired, that was the end
 *      of it.
 *
 * So the resting state is now VISIBLE, and the JavaScript adds the
 * hidden-then-rise state only when it is about to animate:
 *
 *   no attribute        visible. This is what the HTML ships, and what a
 *                       visitor with no JavaScript keeps for good.
 *   data-revealed=      hidden, about to rise. Only ever set from the effect,
 *     "pending"         never from the markup, and only for an element that is
 *                       below the fold with motion allowed.
 *   data-revealed=      the animation, then visible.
 *     "true"
 *
 * On top of that: anything already inside the viewport at mount reveals at
 * once rather than waiting to be told, and anything still pending 900ms after
 * mount reveals anyway. The animation is 8px over 350ms, down from 16px over
 * 500ms, so it reads as the page settling rather than as the page arriving.
 *
 * Wave 413 builds the rest of the site's motion on top of this. The invariant
 * it must keep: NO CONTENT IS EVER INVISIBLE WITHOUT JAVASCRIPT.
 */

/** The effect that sets "pending" has to run before paint, or the element is
 *  shown and then hidden and the flicker is worse than the problem. There is
 *  no layout phase on the server, so it degrades to useEffect there. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/** Milliseconds after mount at which anything still pending gives up and shows. */
const FAILSAFE_MS = 900;

type RevealState = "idle" | "pending" | "true";

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
  const [state, setState] = React.useState<RevealState>("idle");

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setState("true");
      return;
    }

    // Already on screen at mount: reveal now. The observer would get here too,
    // but only after a frame or two, and on a page landed mid-scroll that gap
    // is the whole section reading as blank.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setState("true");
      return;
    }

    setState("pending");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("true");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    observer.observe(node);

    // The backstop. Whatever the observer does or fails to do, nothing stays
    // hidden for longer than this.
    const failsafe = window.setTimeout(() => {
      setState("true");
      observer.disconnect();
    }, FAILSAFE_MS);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      {...(state === "idle" ? null : { "data-revealed": state })}
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
    let started = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      started = true;
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

    // Same backstop as Reveal: a counter stuck at zero is a WRONG FIGURE on a
    // page whose whole argument is figures. It only fires if the count never
    // began; snapping a running count to its end value would be a second bug
    // wearing the first one's coat.
    const failsafe = window.setTimeout(() => {
      if (started) return;
      observer.disconnect();
      setDisplay(value);
    }, FAILSAFE_MS);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return { ref, display };
}
