import { useEffect } from "react";

/**
 * Adds restrained desktop wheel momentum while leaving touch scrolling native.
 * Reduced-motion users and precision pointer users keep the browser default.
 *
 * ⚠ WAVE 414: THE LIBRARY IS IMPORTED ONLY WHERE IT WILL RUN.
 *
 * The gate below is wave 358's and is unchanged and correct: Lenis never runs
 * on a touch screen, under reduced motion, or under 768px. What the phone
 * pass found is that `import Lenis from "lenis"` at the top of the file is a
 * STATIC import, so every phone downloaded, parsed and executed the whole
 * library in order to reach a guard that returns before using it.
 *
 * `await import("lenis")` moves it behind the same condition it was already
 * behind. A desktop pointer fetches it a frame later than before, which is
 * momentum on a wheel and cannot be missed; a phone never fetches it.
 *
 * The cleanup has to cope with the effect being torn down while the import is
 * still in flight, which is why the instance is held in a local that the
 * returned function closes over rather than returned from the effect body.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (reducedMotion.matches || !desktopPointer.matches || window.innerWidth < 768) return;

    let instance: { destroy: () => void } | null = null;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      instance = new Lenis({
        autoRaf: true,
        duration: 1.05,
        easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
        anchors: true,
      });
    });

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, []);

  return null;
}
