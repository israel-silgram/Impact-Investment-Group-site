import * as React from "react";
import { ArrowUp } from "lucide-react";

/**
 * Back to top.
 *
 * ── THE JOB ───────────────────────────────────────────────────────────────
 *
 * Several routes on this site are long: /platform, /legal and the ten partner
 * pages all run past four screens, and the navigation is at the top of all of
 * them. Without this, getting back to the menu from the foot of /legal is a
 * scroll of several seconds or a swipe the visitor has to keep repeating. One
 * press is the whole point.
 *
 * ── WHY IT IS NOT ALWAYS THERE ────────────────────────────────────────────
 *
 * It appears after TWO viewports of scroll, and not before. A control that
 * says "back to top" while the top is still on the screen is one more thing in
 * the corner of every page, on every route, for no gain. Two viewports is the
 * point at which the header has been out of sight long enough to be missed.
 *
 * ── WHY IT IS NOT AN ELEMENT WAITING AT OPACITY 0 ─────────────────────────
 *
 * It is not rendered at all until it is wanted. The wave 412 invariant is that
 * nothing on this site is invisible without JavaScript, and the cheapest way
 * to keep it is for the markup not to carry the thing at all: the prerendered
 * HTML has no back-to-top button in it, so there is nothing to be stuck
 * hidden. The fade is an entrance on an element that did not exist a frame
 * ago, which is the only kind of entrance this wave allows.
 *
 * The fade OUT is why there are two pieces of state rather than one: the
 * element has to outlive the decision to remove it for as long as the exit
 * takes, or it would vanish rather than leave.
 */

/** Viewports of scroll before the control is offered. */
const APPEAR_AFTER_VIEWPORTS = 2;
/** Must match --duration-route in styles.css, which times the exit. */
const EXIT_MS = 200;

export function BackToTop() {
  const [mounted, setMounted] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const exitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > APPEAR_AFTER_VIEWPORTS * window.innerHeight;
      setShown(past);
      if (past) {
        if (exitTimer.current) {
          clearTimeout(exitTimer.current);
          exitTimer.current = null;
        }
        setMounted(true);
      } else if (!exitTimer.current) {
        exitTimer.current = setTimeout(() => {
          exitTimer.current = null;
          setMounted(false);
        }, EXIT_MS);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      data-state={shown ? "in" : "out"}
      /* The one aria-label this wave adds, and it is on an icon-only control,
         which is the only place the brief allows a new string. Plain words. */
      aria-label="Back to top"
      onClick={() => {
        window.scrollTo({
          top: 0,
          // Under reduced motion a several-thousand-pixel smooth scroll is the
          // single most nauseating thing a page can do, so it is a jump.
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
      }}
      className="back-to-top press fixed bottom-6 right-5 z-40 grid size-11 place-items-center rounded-full border border-rule bg-page text-ink shadow-[var(--shadow-card)] hover:border-teal-600 hover:text-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
    >
      <ArrowUp aria-hidden="true" className="size-5" strokeWidth={1.6} />
    </button>
  );
}
