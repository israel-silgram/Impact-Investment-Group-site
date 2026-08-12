import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Adds restrained desktop wheel momentum while leaving touch scrolling native.
 * Reduced-motion users and precision pointer users keep the browser default.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (reducedMotion.matches || !desktopPointer.matches || window.innerWidth < 768) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.05,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      anchors: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
