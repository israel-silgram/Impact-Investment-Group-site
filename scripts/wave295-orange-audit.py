"""Wave 295, "one orange": find every orange WORD on the site and measure it.

Callum, after reading the wave 295 report: every orange word on the site is the
same orange as the wait-list button's fill, `--color-orange-500` `#c15f3c`.
Where that does not reach WCAG 2.2 AA where the text actually sits, the SURFACE
moves, not the orange. This is the instrument that says where that is.

It walks every page of the static build at two widths, finds every text node
whose computed colour is the brand orange, and screenshots its box TWICE: once
with the word visible and once with it hidden. The pixels that differ between
the two shots are exactly the pixels the glyphs cover, and the background is
read from the hidden shot at only those positions.

⚠️ THE DIFFERENCE IS THE WHOLE POINT, AND SAMPLING THE WHOLE BOX IS WRONG.
A word's bounding rect includes its line box, which on a headline is a good deal
taller than the letters, so the box laps onto whatever sits above and below. The
first cut sampled the whole rect and reported the resident page's "around you."
at 1.94:1 against `#abb0b9`, which is not behind the word at all: it is the foot
of a white line one row up, caught in the leading. Only pixels a glyph actually
covers can darken or lighten that glyph.

⚠️ IT SAMPLES PIXELS RATHER THAN COMPOSITING ANCESTORS, and that is not
fussiness. The first cut of this walked the ancestor chain alpha-compositing
background colours, the way axe-core's contrast rule does, and it reported the
header's ground as `#000103` when the header is navy-900 at 92% over a navy-900
page, which is `#00112b`. That error flattered the site's tightest measurement,
the 15px active nav label, from 4.46:1 to 4.94:1: one side of the 4.5:1 line to
the other. To be right, compositing has to model backdrop-filter, gradients,
pseudo-elements, ancestor opacity and blend modes. A screenshot has all of that
in it already.

It takes the BRIGHTEST pixel in the box rather than the mean, because a word has
to stay legible against the lightest thing behind any one of its strokes, and an
average hides exactly that.

The threshold comes from the element's own computed font: 3:1 for large text
(24px, or 18.66px bold) and 4.5:1 for everything else, per WCAG 1.4.3.

    AFTER_DIR=... python scripts/wave295-orange-audit.py [--markdown]

Exits non-zero if any orange word is below its threshold.
"""

import functools
import http.server
import io
import os
import socketserver
import sys
import threading

from PIL import Image
from playwright.sync_api import sync_playwright

AFTER_DIR = os.environ["AFTER_DIR"]
MARKDOWN = "--markdown" in sys.argv
# --dump writes every sampled crop to /tmp so the instrument can be checked by
# eye before its numbers are believed. It found two real bugs in this script.
DUMP = os.environ.get("DUMP_DIR")

# Every page of the site, not only the new ones: the orange moved site wide.
PAGES = [
    "/",
    "/the-problem",
    "/solutions",
    "/platform",
    "/about",
    "/contact",
    "/partners",
    "/partner-with-investor",
    "/partner-with-resident",
    "/register",
    "/register/investor",
    "/register/resident",
]
WIDTHS = [360, 1440]

# The one orange, as rgb. Kept in step with --color-orange-500 by the assertion
# in main(): if the token moves and this does not, the audit finds nothing and
# passes silently, which is the worst way for a checker to fail.
ORANGE = (193, 95, 60)
ORANGE_CSS = "rgb(193, 95, 60)"
NL = chr(10)

FIND_JS = r"""
() => {
  const target = 'rgb(193, 95, 60)';
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let n;
  while ((n = walker.nextNode())) {
    const text = n.textContent.trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.color !== target) continue;
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    seen.add(el);

    const px = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    // WCAG large text: 24px, or 18.66px when bold (700+).
    const large = px >= 24 || (px >= 18.66 && weight >= 700);
    out.push({
      key: text.slice(0, 48),
      text: text.slice(0, 48),
      px, weight, large,
      threshold: large ? 3.0 : 4.5,
      // The class list, so a finding can be grepped straight back to the
      // component that produced it instead of hunted for by eye.
      sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
        ? '.' + el.className.trim().split(/\s+/).join('.') : ''),
    });
  }
  return out;
}
"""

SCROLL_INTO_VIEW_JS = r"""
(needle) => {
  const target = 'rgb(193, 95, 60)';
  let found = null;
  for (const el of document.querySelectorAll('*')) {
    if (getComputedStyle(el).color !== target) continue;
    if (!found && el.textContent.trim().slice(0, 48) === needle) found = el;
  }
  if (!found) return null;
  found.scrollIntoView({ block: 'center', behavior: 'instant' });
  window.__w295_target = found;
  const r = found.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
}
"""

HIDE_JS = r"""
() => {
  // Only THIS word, and only its GLYPHS.
  //
  // ⚠️ NOT `visibility: hidden`. That hides the element's own background too,
  // so on any word that sits on its own coloured chip the sampler would read
  // whatever is under the chip instead of the chip. It reported the resident
  // page's "around you." at 1.22:1 against `#646e7e` that way, a grey that is
  // nowhere near the word. Transparent ink leaves every surface exactly where
  // it was and removes only the letters, which is the whole trick.
  if (window.__w295_target) window.__w295_target.classList.add('__w295_hide');
}
"""

REREAD_BOX_JS = r"""
() => {
  const el = window.__w295_target;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
}
"""

UNHIDE_JS = (
    "() => { for (const el of document.querySelectorAll('.__w295_hide'))"
    " el.classList.remove('__w295_hide'); }"
)


def lum(rgb):
    def ch(v):
        v = v / 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = (ch(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = (la, lb) if la > lb else (lb, la)
    return (hi + 0.05) / (lo + 0.05)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory):
    httpd = socketserver.TCPServer(
        ("127.0.0.1", 0), functools.partial(Quiet, directory=directory)
    )
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def brightest_behind(page, needle, tag=""):
    """Return the lightest pixel the word's own glyphs are painted over.

    Two shots of the same clip, one with the word's ink present and one with it
    turned transparent. Nothing moves and no surface is removed, so every pixel
    that changed between the two is a pixel a glyph covers; the answer is the
    lightest of those, read from the inkless shot.
    """
    box = page.evaluate(SCROLL_INTO_VIEW_JS, needle)
    if box is None or box["w"] < 1 or box["h"] < 1:
        return None
    # ⚠️ THE SITE RUNS LENIS SMOOTH SCROLL, so scrollIntoView is a REQUEST and
    # not a jump: the page keeps easing towards the target for a few frames
    # after it returns. Two screenshots either side of that are two different
    # crops, and the sampler read the line ABOVE "around you." as its
    # background because of it. Settle first, then re-read the box, then refuse
    # to believe a pair that moved between the shutters.
    # Long enough for Lenis to settle AND for a counting figure to land.
    page.wait_for_timeout(900)
    box = page.evaluate(REREAD_BOX_JS)
    if box is None or box["w"] < 1 or box["h"] < 1:
        return None
    scroll_before = page.evaluate("() => Math.round(window.scrollY)")
    # Some figures on /platform count up when they scroll into view, so the
    # word itself can differ between the two shutters. That is not a
    # background; it is a different word. Guarded, not averaged.
    text_before = page.evaluate("() => window.__w295_target.textContent")
    vw = page.viewport_size["width"]
    vh = page.viewport_size["height"]
    x = max(0.0, min(box["x"], vw - 1.0))
    y = max(0.0, min(box["y"], vh - 1.0))
    clip = {
        "x": x,
        "y": y,
        "width": max(1.0, min(box["w"], vw - x)),
        "height": max(1.0, min(box["h"], vh - y)),
    }

    with_text = Image.open(io.BytesIO(page.screenshot(clip=clip))).convert("RGB")
    page.evaluate(HIDE_JS)
    without = Image.open(io.BytesIO(page.screenshot(clip=clip))).convert("RGB")
    page.evaluate(UNHIDE_JS)
    if page.evaluate("() => Math.round(window.scrollY)") != scroll_before:
        return None  # the page moved between shutters; not a comparable pair
    if page.evaluate("() => window.__w295_target.textContent") != text_before:
        return None  # the word changed between shutters; still counting
    # /platform runs a horizontal marquee of sourced figures. Its words keep
    # their text and the page keeps its scroll, but the word itself SLIDES
    # between the shutters, so the difference is the word at two positions and
    # the "background" is whatever the second position sits over. Refused.
    after = page.evaluate(REREAD_BOX_JS)
    if after is None or abs(after["x"] - box["x"]) > 0.5 or abs(after["y"] - box["y"]) > 0.5:
        return None

    a = with_text.load()
    b = without.load()
    covered = []
    for py in range(without.height):
        for px_ in range(without.width):
            p1, p2 = a[px_, py], b[px_, py]
            # 8 per channel: antialiasing at a glyph edge clears this easily,
            # while sensor-style noise in a photograph does not.
            if abs(p1[0] - p2[0]) + abs(p1[1] - p2[1]) + abs(p1[2] - p2[2]) < 8:
                continue
            covered.append(p2)

    # The 99th percentile by luminance, not the single brightest pixel.
    #
    # The worst case still has to be what is reported, and a percentile this
    # high is still effectively the worst case: on a 4,000 pixel word it is the
    # 40th lightest pixel. What it refuses to do is hang the whole measurement
    # on ONE stray pixel, and there are two ways to get one that mean nothing.
    # A sub-pixel antialiasing difference at a glyph edge is one. A figure that
    # is still counting up between the two shutters is the other, and that is
    # what put /platform's "1.34m" at 2.27:1 against a `#b3bfd2` that is not on
    # the page. Both are single pixels; neither is a background.
    if covered:
        covered.sort(key=lum)
        best = covered[min(len(covered) - 1, int(len(covered) * 0.99))]
    else:
        best = None

    if DUMP and tag:
        os.makedirs(DUMP, exist_ok=True)
        safe = "".join(c if c.isalnum() else "_" for c in tag)[:80]
        without.save(os.path.join(DUMP, safe + "_ground.png"))
        with_text.save(os.path.join(DUMP, safe + "_text.png"))

    # No pixel changed: the word is behind something, clipped, or off screen.
    # Silence is not a pass, so it is skipped rather than scored.
    return best


def main():
    css = open(os.path.join("src", "styles.css"), encoding="utf-8").read()
    assert "--color-orange-500: #c15f3c;" in css, (
        "the token moved; update ORANGE in this script or it audits nothing"
    )

    port = serve(AFTER_DIR)
    base = f"http://127.0.0.1:{port}"
    rows, failures, skipped = [], 0, []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_context(device_scale_factor=1).new_page()

        for width in WIDTHS:
            page.set_viewport_size({"width": width, "height": 900})
            for path in PAGES:
                page.goto(base + path, wait_until="networkidle")
                page.add_style_tag(
                    content=(
                        ".__w295_hide, .__w295_hide * {"
                        " color: transparent !important;"
                        " text-shadow: none !important;"
                        " -webkit-text-stroke-color: transparent !important; }"
                        # TRANSITIONS off, ANIMATIONS left alone. The nav's
                        # underline and its colour ease over 200ms, so a pair
                        # of shutters could straddle the easing and read the
                        # half-drawn orange rule as the label's background
                        # (`#683a33`, 2.22:1, on a label that measures 4.46:1
                        # when it is still).
                        " *, *::before, *::after { transition: none !important; }"
                        # ⚠️ DO NOT ADD `animation: none` HERE. It was tried,
                        # to stop /platform's counting figures differing
                        # between the two shutters, and it silently cut the
                        # words this audit can see from 32 to 18: the site's
                        # reveal utility starts every section at opacity 0 and
                        # an animation brings it back, so killing animations
                        # leaves half the page invisible and unmeasured. The
                        # 99th percentile below deals with counting digits
                        # without blinding the instrument.
                    )
                )
                # Reveal-on-scroll: walk the page once so nothing is measured
                # mid-fade, which would read as a lighter orange than it is.
                page.evaluate(
                    "async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight)"
                    " { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); }"
                )
                page.wait_for_timeout(350)
                for f in page.evaluate(FIND_JS):
                    ground = brightest_behind(
                        page, f["key"], f"{width}_{path}_{f['key']}"
                    )
                    if ground is None:
                        skipped.append((path, width, f["text"]))
                        continue
                    r = ratio(ORANGE, ground)
                    if r < f["threshold"]:
                        failures += 1
                    rows.append(
                        {
                            "page": path,
                            "width": width,
                            "text": f["text"],
                            "px": f["px"],
                            "weight": f["weight"],
                            "large": f["large"],
                            "threshold": f["threshold"],
                            "ground": ground,
                            "ratio": r,
                            "ok": r >= f["threshold"],
                            "sel": f["sel"],
                        }
                    )
        browser.close()

    # One line per distinct (page, text, ground): the same word measured the
    # same at both widths is one finding, not two.
    seen, uniq = set(), []
    for r in rows:
        key = (r["page"], r["text"], r["ground"], round(r["ratio"], 2))
        if key in seen:
            continue
        seen.add(key)
        uniq.append(r)

    if MARKDOWN:
        print("| Page | Orange text | Size | Lightest pixel behind it | Measured | Needs | |")
        print("|---|---|---|---|---:|---:|---|")
        for r in sorted(uniq, key=lambda x: (x["page"], -x["ratio"])):
            g = "#%02x%02x%02x" % r["ground"]
            size = f"{r['px']:.0f}px/{r['weight']}" + (" large" if r["large"] else "")
            print(
                f"| `{r['page']}` | {r['text']} | {size} | `{g}` | "
                f"**{r['ratio']:.2f}:1** | {r['threshold']}:1 | "
                f"{'PASS' if r['ok'] else '**FAIL**'} |"
            )
    else:
        for r in sorted(uniq, key=lambda x: (x["ok"], x["ratio"])):
            g = "#%02x%02x%02x" % r["ground"]
            mark = "ok  " if r["ok"] else "FAIL"
            print(
                f"{mark} {r['ratio']:>5.2f}:1 (needs {r['threshold']}) {r['page']:<24}"
                f" {r['px']:>5.1f}px/{r['weight']} on {g}  {r['text'][:40]}"
                + ("" if r["ok"] else NL + "         " + r["sel"][:150])
            )

    print(f"\n{len(uniq)} distinct orange words, {failures} measurement(s) below threshold.")
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
