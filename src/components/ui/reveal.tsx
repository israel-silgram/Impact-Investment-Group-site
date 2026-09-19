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
 *   data-revealed=      visible, and STAYING visible. No animation at all.
 *     "static"          Set for anything that was already on screen at mount,
 *                       and for anything under reduced motion.
 *   data-revealed=      hidden, about to rise. Only ever set from the effect,
 *     "pending"         never from the markup, and only for an element that is
 *                       below the fold with motion allowed.
 *   data-revealed=      the animation, then visible. Only ever reached FROM
 *     "true"            "pending", so it only ever animates what was hidden.
 *
 * ── WAVE 412b: WHY "static" HAD TO EXIST ──────────────────────────────────
 *
 * Wave 412 sent an already-visible element straight to "true", and "true"
 * carries `animation: rise-in ... both`. `both` means the backwards fill
 * applies, and the first frame of rise-in is `opacity: 0`. So on a
 * PRERENDERED route the browser painted the server HTML (no attribute,
 * visible), the bundle loaded, React hydrated, and the element restarted from
 * opacity 0 and faded back in over 350ms plus up to index * 60ms of delay
 * held at zero. Visible, blink, fade in. The layout phase below closes the
 * gap between React's commit and the next paint; it cannot close the gap
 * between the SERVER's paint and hydration, which on a static site is the
 * whole point of the static site.
 *
 * The rule that follows, and the one wave 413 inherits: ANIMATE ONLY WHAT
 * THIS COMPONENT ITSELF HID. Everything else is already on the screen and the
 * only honest thing to do with it is leave it alone.
 *
 * On top of that: anything already inside the viewport at mount stays visible
 * rather than waiting to be told, and anything still pending 900ms after
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

type RevealState = "idle" | "static" | "pending" | "true";

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
      setState("static");
      return;
    }

    // Already on screen at mount: leave it exactly as the server painted it.
    // NOT "true": "true" is the animation, and the animation begins at
    // opacity 0, which on a prerendered page would blink content the visitor
    // is already reading. "static" is the same pixels, with nothing added.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setState("static");
      return;
    }

    // Below the fold, motion allowed. This is the only path that hides
    // anything, and so the only path that is allowed to reach "true".
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

/**
 * Counts up to `value` on first view; static under reduced motion.
 *
 * ── WAVE 412b: THE MARKUP SHIPS THE FIGURE, NOT ZERO ──────────────────────
 *
 * `display` used to initialise to 0, so the prerendered HTML carried `0`
 * where the home page's headline figure belongs and kept it for good without
 * JavaScript. On a page whose whole argument is figures, a counter stuck at
 * zero is not a missing animation, it is a WRONG FIGURE. It initialises to
 * `value` now: the server renders the real number, the client hydrates onto
 * the same number, and the count is something the JavaScript ADDS.
 *
 * And it adds it under the same rule as `Reveal`: ONLY FOR AN ELEMENT BELOW
 * THE FOLD. Rewinding a figure the visitor is already reading back to zero to
 * count it up again is the blink this pass exists to remove, wearing a
 * different hat.
 */
export function useCountUp(value: number, durationMs = 1200) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = React.useState(value);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Motion refused, or no observer to tell us when to start: the figure is
    // already on the screen and correct. Nothing to do.
    if (reduced || typeof IntersectionObserver === "undefined") return;

    // On screen at mount: it has been read. Leave it.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    // Below the fold, motion allowed. Rewind it, out of sight, and count it
    // up when it arrives.
    setDisplay(0);

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
