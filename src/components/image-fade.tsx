import * as React from "react";

/**
 * Photographs arrive rather than pop.
 *
 * ── THE JOB ───────────────────────────────────────────────────────────────
 *
 * This site's imagery is lamplight and golden hour on a white page, which is
 * the highest-contrast thing on most of these routes. An image that snaps in
 * at full strength the instant its last byte lands pulls the eye off whatever
 * the visitor was reading, and on a slow connection it does it several times
 * on the way down a page. 300ms of fade turns that into something the eye
 * notices and then ignores, which is what it should be doing.
 *
 * ── WHY IT IS ONE COMPONENT AND NOT A PROP ON FIFTY IMAGES ────────────────
 *
 * Because of the invariant. An `<img className="fade-in">` whose class carries
 * `opacity: 0` is the wave 412 defect with a different name: the prerendered
 * HTML would ship fifty invisible photographs and keep them invisible for good
 * without JavaScript. The rule from that wave is ANIMATE ONLY WHAT THIS CODE
 * ITSELF HID, and the only way to honour it here is to hide nothing in the
 * markup and let the client decide, per image, one frame before it fades it.
 *
 * So this walks the document once at mount, and again whenever the router adds
 * markup, and for each `<img>`:
 *
 *   ALREADY DECODED (`complete`, which covers every cached and every already
 *   painted image): nothing happens at all. No attribute, no animation, no
 *   frame at opacity 0. This is the common case on a second page view and it
 *   is the case that matters, because it is the one that could have blinked.
 *
 *   NOT YET DECODED: `data-img="pending"` hides it for as long as it has
 *   nothing to show anyway, and `load` or `error` moves it to `data-img="in"`,
 *   which is the fade. `error` as well as `load` on purpose: a broken image
 *   must not be a permanently invisible one.
 *
 * Under reduced motion it does nothing whatsoever: no attribute is ever set,
 * so every photograph simply appears when it appears.
 */
export function ImageFade() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: Array<() => void> = [];

    const watch = (image: HTMLImageElement) => {
      if (image.dataset["img"]) return;
      // Decoded already: it is on the screen, and taking it away to fade it
      // back in is the exact defect wave 412b removed from `Reveal`.
      if (image.complete) return;
      image.dataset["img"] = "pending";
      const done = () => {
        image.dataset["img"] = "in";
        image.removeEventListener("load", done);
        image.removeEventListener("error", done);
      };
      image.addEventListener("load", done);
      image.addEventListener("error", done);
      cleanups.push(done);
    };

    const sweep = (root: ParentNode) => {
      if (root instanceof HTMLImageElement) watch(root);
      root.querySelectorAll?.("img").forEach(watch);
    };

    sweep(document.body);

    // The router replaces <main> on every navigation, so the images on the
    // page after this one have never been seen by the sweep above.
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) sweep(node as Element);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      for (const done of cleanups) done();
    };
  }, []);

  return null;
}
