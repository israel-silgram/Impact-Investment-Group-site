"""Wave 295, "one orange": move the five surfaces that the one orange cannot sit on.

`#c15f3c` tops out at 4.90:1, which is its ratio against pure black, so a word
under 24px reaches the 4.5:1 body floor only on a ground at or below navy-950.
Every change here darkens a surface to get there. None of them touches the
orange, and none of them touches the navy SCALE, which CLAUDE.md fixes against
the approved mock-ups.

Run once; it asserts on every anchor, so a second run fails loudly rather than
half-applying.
"""

import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EDITS = [
    # ── 1 · The header ────────────────────────────────────────────────────
    # The active nav label is 15px, so it needs 4.5:1, and it had 4.46:1 on the
    # navy-900 page. Worse, the header was navy-900 at 92% opacity, so over a
    # cream section it lightened to about 3.9:1. Opaque navy-950 gives 4.67:1
    # and gives it everywhere, whatever is scrolling underneath.
    (
        "src/components/site-header.tsx",
        '"sticky top-0 z-50 bg-navy-900/92 backdrop-blur-md transition-colors duration-200",',
        # backdrop-blur goes with the translucency: behind an opaque fill it
        # renders nothing and still costs a compositing layer.
        '"sticky top-0 z-50 bg-navy-950 transition-colors duration-200",',
    ),
    # ── 2 · The dark island inside a cream section ────────────────────────
    # Carries the home page's "See the full picture", 13px, which had 4.46:1.
    # navy-950 gives 4.67:1, and a darker island on the cream is a touch more
    # contrast against the band, not less.
    (
        "src/styles.css",
        """.section-light .section-dark {
  background-color: var(--color-navy-900);""",
        """.section-light .section-dark {
  /* navy-950, not navy-900, since wave 295's "one orange": the 13px orange
     link inside this island reaches 4.5:1 only at or below navy-950. */
  background-color: var(--color-navy-950);""",
    ),
    # ── 3 · A deeper panel, for cards that carry small orange labels ──────
    (
        "src/styles.css",
        """@utility teal-wash {""",
        """/* A panel sunk to navy-950 instead of navy-800.
 *
 * For cards whose own labels are SMALL and ORANGE. Since wave 295 there is one
 * orange on this site, `#c15f3c`, the wait-list button's fill, and it reaches
 * the 4.5:1 body floor only on a ground at or below navy-950: on navy-800 it
 * is 4.01:1 and on navy-700 3.39:1. The card moves; the orange does not.
 *
 * Applied after `panel` in the class list, and defined after it here, so it
 * wins the background and inherits the border, radius and shadow. */
@utility panel-deep {
  background-color: var(--color-navy-950);
}

@utility teal-wash {""",
    ),
    # ── 4 · The accountable-chain cards on /about ─────────────────────────
    # The "01 / 02 / 03" eyebrow is 11px orange and had 4.01:1 on the navy-800
    # panel. The card sinks to navy-950: 4.67:1.
    (
        "src/routes/about.tsx",
        '"panel relative flex h-full flex-col overflow-hidden p-6 pb-[104px]",',
        '"panel panel-deep relative flex h-full flex-col overflow-hidden p-6 pb-[104px]",',
    ),
    # ── 5 · The chain chip ────────────────────────────────────────────────
    # It was a wash of the accent over the card, and orange on its own 16% wash
    # measured 3.52:1. It becomes an outlined pill, so the ground under the
    # word is the card itself. That is also what the platform's own kit does:
    # wave 288 retired the faded orange tint as an information fill.
    (
        "src/routes/about.tsx",
        """            const chip =
              accent === "orange"
                ? "bg-orange-500/16 text-orange-500"
                : "bg-teal-400/16 text-teal-400";""",
        """            // Outlined, not washed. A 10.5px word on a 16% wash of its
            // own colour measured 3.52:1; on the card behind it, 4.67:1.
            const chip =
              accent === "orange"
                ? "border border-orange-500/45 text-orange-500"
                : "border border-teal-400/45 text-teal-400";""",
    ),
    # ── 6 · The selected chapter tab on /platform ─────────────────────────
    # Its 10px accent label had 3.53:1 on the navy-700 fill. The fill sinks to
    # navy-950; selection is still unmistakable from the teal border, the glow,
    # the nudge and the filled disc, none of which move.
    (
        "src/routes/platform.tsx",
        '? "translate-x-0 border-teal-600/45 bg-navy-700/80 shadow-[0_10px_30px_-18px_rgba(36,210,195,0.7)] lg:translate-x-1"',
        '? "translate-x-0 border-teal-600/45 bg-navy-950 shadow-[0_10px_30px_-18px_rgba(36,210,195,0.7)] lg:translate-x-1"',
    ),
]


def main():
    for rel, old, new in EDITS:
        path = os.path.join(ROOT, rel)
        s = io.open(path, encoding="utf-8").read()
        if old not in s:
            raise SystemExit(f"ANCHOR NOT FOUND in {rel}:\n{old[:120]}")
        io.open(path, "w", encoding="utf-8", newline="").write(s.replace(old, new, 1))
        print("ok", rel)


if __name__ == "__main__":
    main()
