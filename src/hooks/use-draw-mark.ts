import * as React from "react";

/**
 * A mark that draws itself, measured rather than guessed.
 *
 * `.draw-in` runs `stroke-dashoffset` down a Lucide glyph's own paths, which
 * needs a dash at least as long as the path it is drawing. Wave 413 wrote that
 * length as a constant 48 and called it "comfortably longer than the longest
 * path in a 24px Lucide glyph", and it is not: Lucide 0.575's `shield-check`
 * outer path measures 58.75 user units, so the drawn stroke covered 0 to 48
 * and left the last 10.75 as a permanent gap, about a sixth of the shield
 * missing for good. It also meant the draw STARTED with that tail already
 * painted rather than from nothing.
 *
 * A constant cannot know this. The browser can: `getTotalLength()` on an
 * SVGGeometryElement is the path's own length, so each shape is measured at
 * mount and told its own figure through `--draw-length`. The ref callback runs
 * during the commit that inserts the glyph, before the first frame is painted,
 * so the animation never sees the fallback.
 *
 * The fallback is 64 rather than 48, so that a glyph this hook somehow never
 * reaches still draws WHOLE. Too long a dash costs a few milliseconds at the
 * start of the draw; too short a one leaves a gap that never closes.
 */
const DRAWN_SHAPES = "path, circle, polyline, line, polygon, rect, ellipse";

export function useDrawMark() {
  return React.useCallback((svg: SVGSVGElement | null) => {
    if (!svg) return;
    for (const shape of svg.querySelectorAll<SVGGeometryElement>(DRAWN_SHAPES)) {
      if (typeof shape.getTotalLength !== "function") continue;
      let length = 0;
      try {
        length = shape.getTotalLength();
      } catch {
        // jsdom and any renderer without a geometry implementation. The CSS
        // fallback covers it.
        continue;
      }
      if (!Number.isFinite(length) || length <= 0) continue;
      // Rounded up to a hundredth: the dash has to be at least the path, and
      // a value the stylesheet can read is a value a probe can read back.
      shape.style.setProperty("--draw-length", String(Math.ceil(length * 100) / 100));
    }
  }, []);
}
