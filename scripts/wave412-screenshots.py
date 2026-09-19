"""Wave 412 gate: every page of the site, at 1280 and at 390, proved light.

    STATIC_BUILD=true bun run build
    python scripts/wave412-screenshots.py

Runs entirely in one foreground process: it serves the static build inside
itself, drives Playwright against it, asserts what each shot is meant to prove,
writes the image, and exits non-zero the moment anything fails. Nothing is left
running. The pattern is scripts/wave411-screenshots.py; what is new here is
that the assertions are about COLOUR rather than about one component.

THE ASSERTIONS ARE THE POINT. The images are evidence for Callum; the numbers
are evidence for anyone who has to believe the site is light without looking at
it. Per page, per width:

  1. NO HORIZONTAL OVERFLOW. documentElement.scrollWidth <= innerWidth.
  2. THE BODY AND THE HEADER ARE LIGHT. Computed background-color of each,
     relative luminance above 0.8. A header that stayed navy is the single
     most visible way this wave could be half-done.
  3. AT MOST ONE NAVY ISLAND INSIDE <main>. `.section-dark` is the site's word
     for a plate that keeps its darkness on purpose. One is a decision; two is
     a dark site with extra steps.
  4. THE DARK-PIXEL SHARE IS UNDER 15%. Every 4th pixel of the full-page
     screenshot, relative luminance under 0.2. This is the number the
     director's complaint was actually about, and the only one here that
     measures the page as a person sees it rather than as the DOM describes it.

     IT IS MEASURED TWICE, AND THE SECOND ONE IS WHY.

     RAW is every pixel of the shot. GROUND is the same measurement with the
     rectangles of <img>, <canvas>, <svg> and `.section-dark` masked out: the
     photographs, the map's dot field, and the one navy plate rule 2 of this
     wave permits. Ground is the page's own colour, and it is what "the site
     is too dark" actually means.

     Both are asserted under 15%. On the home page the raw figure cannot be,
     and the arithmetic says so rather than a judgement:

       - the three approved hero photographs are lamplight and golden hour,
         and about 85% of their pixels are under the 0.2 line on their own;
       - the site's OWN TERRACOTTA, #c15f3c, has a relative luminance of
         0.1985, so every pixel of a brand orange card counts as dark by two
         thousandths; teal-600 (#17796f) is 0.1500 and counts too;
       - deleting the demand map island outright still leaves the page near
         17%, because removing area takes it out of the denominator as well.

     So HOME is listed in RAW_CEILING below at the figure measured at this
     wave's head, rounded up to the last digit this script prints. That is
     not the check being relaxed: the ground assertion still binds at 15%
     there, the raw figure is still asserted, and it is asserted against a
     number it can only go down from. Every other route answers to the flat
     15% on both.
  5. AXE REPORTS NO SERIOUS OR CRITICAL COLOUR-CONTRAST VIOLATION. Inverting a
     palette is exactly the operation that turns passing text into failing
     text, so this runs on every page rather than on a sample.
  6. THE PAGE HAS WORDS ON IT. At least 60 characters of rendered text.
     Trivial, and it is the assertion that caught the most serious defect of
     the run: /404 was serving a BLANK PAGE, because 404.html was a copy of
     the home shell and hydrating the home route's dehydrated state against an
     unknown URL threw before the first paint. A blank page is light, has no
     dark pixels, no overflow and no contrast violations, and passes every
     other check here perfectly.

And once for the run, after the pages:

  7. ABOVE-THE-FOLD CONTENT IS NEVER UN-PAINTED. See reveal_probe(). Wave 412
     shipped a `Reveal` whose already-visible branch still carried the rise-in
     animation, and rise-in begins at opacity 0 with a backwards fill, so a
     prerendered page painted its first block, then blinked it away at
     hydration and faded it back in. The probe throttles the network so the
     gap between the server's paint and hydration is wide and real, samples
     the computed opacity of the first `Reveal` inside <main> every 16ms for
     1200ms, and fails if it ever falls back below 1 after reaching it.

`--baseline` re-runs 2, 3 and 4 as MEASUREMENTS ONLY, with nothing asserted and
no images kept, so the same code can read a build of `origin/main` and produce
the before numbers in docs/WAVE412_REPORT.md. A before number measured by
different code than the after number is not a comparison.
"""

import argparse
import functools
import http.server
import json
import socketserver
import sys
import threading
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
OUT = ROOT / "docs" / "screenshots" / "wave412"
AXE = ROOT / "node_modules" / "axe-core" / "axe.min.js"

WIDTHS = [1280, 390]

# Every route in src/routes that is a page, plus the 404. `/register/investor`
# and `/register/resident` stand for the ten role pages (they are one component
# with one content file); `/partner-with-investor` and
# `/partner-with-local-authority` stand for the ten partner pages the same way.
PAGES = [
    ("/", "home"),
    ("/about", "about"),
    ("/platform", "platform"),
    ("/the-problem", "the-problem"),
    ("/solutions", "solutions"),
    ("/partners", "partners"),
    ("/contact", "contact"),
    ("/register", "register"),
    ("/register/investor", "register-investor"),
    ("/register/resident", "register-resident"),
    ("/partner-with-investor", "partner-with-investor"),
    ("/partner-with-local-authority", "partner-with-local-authority"),
    ("/legal", "legal"),
    ("/this-route-does-not-exist", "404"),
]

MIN_TEXT_CHARS = 60
DARK_PIXEL_CEILING = 0.15
LIGHT_GROUND_FLOOR = 0.8
DARK_PIXEL_LUMINANCE = 0.2
SAMPLE_EVERY = 4

# Routes whose RAW share cannot reach 15% because of approved photography and
# the brand fills. A RATCHET: a later wave may lower these and may not raise
# them without saying why here.
#
# Each is THE FIGURE MEASURED AT THIS HEAD, rounded up to the 0.01 of a point
# this script prints and no further. The wave 412 values, 0.240 and 0.230,
# carried 0.45 and 0.81 points of headroom against measurements of 23.55% and
# 22.19% while the docstring and the report both called them the measured
# figure; rel412 MINOR 7 was right that a ratchet with slack in it is not the
# thing it says it is. Measured at the wave 412b head: 23.56% and 22.19%.
RAW_CEILING = {
    ("home", 1280): 0.2357,
    ("home", 390): 0.2220,
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    """Serves the build, and serves 404.html for anything missing.

    GitHub Pages does this, so a local server that does not would test the
    404 route against Python's own error page rather than against the site's.
    """

    def log_message(self, *args):
        pass

    def send_error(self, code, message=None, explain=None):
        page = Path(self.directory) / "404.html"
        if code == 404 and page.exists():
            body = page.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


def serve(directory: Path) -> int:
    handler = functools.partial(Quiet, directory=str(directory))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def channel(value: float) -> float:
    value /= 255
    return value / 12.92 if value <= 0.03928 else ((value + 0.055) / 1.055) ** 2.4


def luminance(rgb) -> float:
    r, g, b = rgb[0], rgb[1], rgb[2]
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def dark_shares(path: Path, masks) -> tuple[float, float]:
    """(raw, ground) share of sampled pixels darker than DARK_PIXEL_LUMINANCE.

    `masks` are document-space rectangles to exclude from the ground figure.
    A full-page screenshot is taken at deviceScaleFactor 1, so a document
    pixel and an image pixel are the same pixel and no scaling is needed.
    """
    with Image.open(path) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        pixels = rgb.load()
        raw_dark = raw_total = 0
        ground_dark = ground_total = 0
        for y in range(0, height, SAMPLE_EVERY):
            row_masks = [m for m in masks if m[1] <= y < m[3]]
            for x in range(0, width, SAMPLE_EVERY):
                dark = luminance(pixels[x, y]) < DARK_PIXEL_LUMINANCE
                raw_total += 1
                if dark:
                    raw_dark += 1
                if any(m[0] <= x < m[2] for m in row_masks):
                    continue
                ground_total += 1
                if dark:
                    ground_dark += 1
    return (
        raw_dark / raw_total if raw_total else 0.0,
        ground_dark / ground_total if ground_total else 0.0,
    )


def settle(page):
    """Scroll the page once so no section is photographed mid-reveal."""
    page.evaluate(
        "async () => { const step = innerHeight; "
        "for (let y = 0; y < document.body.scrollHeight; y += step) "
        "{ scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } "
        "scrollTo(0, 0); await new Promise(r => setTimeout(r, 200)); }"
    )
    page.wait_for_timeout(600)


# The computed background-color is read through a canvas rather than parsed.
# A custom property with an opacity modifier computes to `oklab(...)` in
# Chromium, and a colour-space parser in this script is a second place for the
# maths to be wrong. Painting the value over white and reading the pixel back
# gives the sRGB the visitor actually sees, in any colour space, composited the
# way the browser composites it.
GROUNDS = """
() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const read = (value) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };
  const header = document.querySelector('header');
  const body = getComputedStyle(document.body).backgroundColor;
  const bar = header ? getComputedStyle(header).backgroundColor : 'rgb(255,255,255)';
  return { body, bar, bodyRgb: read(body), barRgb: read(bar) };
}
"""

# The rectangles that are CONTENT rather than ground: photographs, the map's
# canvas and its SVG, and the one navy plate a route is allowed. Read in
# document space, which is the screenshot's own space.
MASKS = """
() => {
  const out = [];
  document.querySelectorAll('img, canvas, svg, .section-dark').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    out.push([
      Math.floor(r.left + scrollX),
      Math.floor(r.top + scrollY),
      Math.ceil(r.right + scrollX),
      Math.ceil(r.bottom + scrollY),
    ]);
  });
  return out;
}
"""

# ---------------------------------------------------------------------------
# 7. THE REVEAL PROBE
#
# Installed BEFORE any of the page's own scripts, so it is already sampling
# while the browser is still painting the server's HTML. It walks to the first
# `.reveal` inside <main> and records the computed opacity every 16ms.
#
# The interesting window is between the server's paint and HYDRATION, and on a
# fast local server that window is a few milliseconds wide. The caller widens
# it with real network throttling, and then waits for hydration to actually
# land before it stops sampling: a probe that finishes before the bundle runs
# proves nothing at all, which is what the first draft of this one did.
REVEAL_SAMPLER = """
(() => {
  const START = performance.now();
  const MIN_MS = 1200;
  const samples = [];
  window.__revealSamples = samples;
  window.__revealProbeStop = false;
  const tick = () => {
    const el = document.querySelector('main .reveal');
    if (el) {
      samples.push([
        Math.round(performance.now() - START),
        getComputedStyle(el).opacity,
        el.getAttribute('data-revealed') || '',
      ]);
    }
    if (performance.now() - START < MIN_MS || !window.__revealProbeStop) {
      setTimeout(tick, 16);
    }
  };
  setTimeout(tick, 0);
})();
"""

FIRST_REVEAL = (
    "() => { const el = document.querySelector('main .reveal'); return el ? {"
    "  top: Math.round(el.getBoundingClientRect().top + scrollY),"
    "  attr: el.getAttribute('data-revealed') || '(none)',"
    "} : null; }"
)

# Routes where the first `Reveal` inside <main> is in the first viewport, so
# its opacity has no legitimate reason to move at all. /about wraps its whole
# opening block in one; the partner pages wrap their opening statement.
REVEAL_PROBE_PAGES = ["/about", "/partner-with-investor"]
REVEAL_PROBE_WIDTH = 1280
REVEAL_PROBE_MIN_MS = 1200
REVEAL_SETTLE_MS = 600
REVEAL_HYDRATE_TIMEOUT_MS = 20000


def reveal_probe(browser, base: str, failures: list[str]) -> None:
    """Assert that no above-the-fold Reveal is painted, un-painted and re-faded.

    The assertion is one-directional on purpose: opacity may RISE (an element
    the component itself hid, arriving) and may never FALL once it has been 1
    (content the server already painted, being taken away).

    Wave 412 failed this. `Reveal` sent an element that was already on screen
    at mount straight to `data-revealed="true"`, and that state carries
    `animation: rise-in ... both`, whose backwards fill paints opacity 0 on
    the first frame. The prerendered page painted, the bundle landed, and the
    first block of /about blinked out and faded back in.
    """
    for path in REVEAL_PROBE_PAGES:
        page = browser.new_page(viewport={"width": REVEAL_PROBE_WIDTH, "height": 900})
        page.add_init_script(REVEAL_SAMPLER)
        # Real throttling, so the gap between the server's paint and hydration
        # is wide enough to sample rather than a race this would usually win.
        cdp = page.context.new_cdp_session(page)
        cdp.send(
            "Network.emulateNetworkConditions",
            {
                "offline": False,
                "latency": 60,
                "downloadThroughput": 400 * 1024,
                "uploadThroughput": 400 * 1024,
            },
        )
        page.goto(f"{base}{path}", wait_until="commit")

        # Hydration is the event this probe is about. `data-revealed` is set
        # from the component's layout effect and can only appear once the
        # bundle has run, so it is the marker, and waiting for it is what
        # keeps the sampling window honest.
        hydrated = True
        try:
            page.wait_for_selector(
                "main .reveal[data-revealed]", timeout=REVEAL_HYDRATE_TIMEOUT_MS
            )
        except Exception:
            hydrated = False

        # Long enough after hydration for a 350ms rise-in plus its delay to
        # have played out, and never shorter than the 1200ms window.
        page.wait_for_timeout(REVEAL_SETTLE_MS)
        elapsed = page.evaluate("() => { const s = window.__revealSamples; "
                                "return s && s.length ? s[s.length - 1][0] : 0; }")
        if elapsed < REVEAL_PROBE_MIN_MS:
            page.wait_for_timeout(REVEAL_PROBE_MIN_MS - elapsed + 50)
        page.evaluate("() => { window.__revealProbeStop = true; }")

        samples = page.evaluate("() => window.__revealSamples || []")
        first = page.evaluate(FIRST_REVEAL)
        page.close()

        where = f"reveal probe {path} @ {REVEAL_PROBE_WIDTH}"
        if first is None:
            failures.append(f"{where}: no `.reveal` inside <main> to probe.")
            continue
        if not samples:
            failures.append(f"{where}: no samples taken. The probe did not run.")
            continue

        opacities = [float(sample[1]) for sample in samples]
        window_ms = samples[-1][0]
        states = sorted({sample[2] or "(none)" for sample in samples})
        seen_full = False
        dropped = None
        for moment, opacity, attr in samples:
            value = float(opacity)
            if value >= 0.999:
                seen_full = True
            elif seen_full and dropped is None:
                dropped = (moment, value, attr)

        print(
            f"reveal {path:<26} {len(samples):>3} samples over {window_ms}ms  "
            f"min_opacity={min(opacities):.3f}  first_reveal_top={first['top']}px  "
            f"hydrated={'yes' if hydrated else 'NO'}  "
            f"states={'/'.join(states)}  final={first['attr']}"
        )

        if not hydrated:
            failures.append(
                f"{where}: no `.reveal` carried data-revealed within "
                f"{REVEAL_HYDRATE_TIMEOUT_MS}ms, so the bundle never hydrated and "
                f"this probe proved nothing. Loosen the throttle or fix the build."
            )
            continue
        if first["top"] >= 900:
            failures.append(
                f"{where}: the first Reveal is at y={first['top']}, below the "
                f"{REVEAL_PROBE_WIDTH}x900 fold. This probe only proves something "
                f"about above-the-fold content; point it at a route whose first "
                f"Reveal is in the first viewport."
            )
            continue
        if not seen_full:
            failures.append(
                f"{where}: the first Reveal never reached opacity 1 in "
                f"{window_ms}ms (lowest {min(opacities):.3f})."
            )
            continue
        if dropped is not None:
            failures.append(
                f"{where}: opacity fell to {dropped[1]:.3f} at {dropped[0]}ms after "
                f"having been 1 (data-revealed={dropped[2]!r}). Content the server "
                f"painted was taken away and faded back in."
            )


# A raw string: the JS below carries a backslash-s regex.
AXE_RUN = r"""
async () => {
  const results = await axe.run(document, {
    runOnly: { type: 'rule', values: ['color-contrast'] },
  });

  // Read a CSS colour twice, over white and over black, so the caller can
  // recover its alpha and composite it over the ground it ACTUALLY sits on.
  // Parsing `rgba(...)` here would be a second place for the maths to be
  // wrong; the compositor is already in the browser.
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const read = (value, under) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = under;
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };

  const violations = results.violations.flatMap((v) =>
    v.nodes
      .filter((n) => n.impact === 'serious' || n.impact === 'critical')
      .map((n) => ({
        id: v.id,
        impact: n.impact,
        target: n.target.join(' '),
        detail: (n.any[0] && n.any[0].message) || '',
      })),
  );

  // INCOMPLETE IS NOT A CLEAN BILL OF HEALTH. axe returns it when it cannot
  // resolve what is behind the text: a background image, a translucent
  // ancestor, an absolutely positioned overlay. Those are exactly the places
  // an inverted palette goes wrong, so every one of them comes back here with
  // enough information for the caller to measure it off the screenshot.
  const incomplete = [];
  for (const rule of results.incomplete) {
    for (const node of rule.nodes) {
      const selector = node.target.join(' ');
      let element = null;
      try {
        element = document.querySelector(selector);
      } catch (error) {
        element = null;
      }
      const entry = {
        id: rule.id,
        impact: node.impact || '',
        target: selector,
        detail: (node.any[0] && node.any[0].message) || '',
        text: '',
        colour: '',
        overWhite: null,
        overBlack: null,
        inks: [],
        fontSize: 0,
        fontWeight: 400,
        rect: null,
      };
      if (element) {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        entry.text = (element.innerText || element.textContent || '')
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 60);
        entry.colour = style.color;
        entry.overWhite = read(style.color, '#ffffff');
        entry.overBlack = read(style.color, '#000000');
        // Every text colour whose own box OVERLAPS this one. An inline
        // <span> inside a two-colour headline has its SIBLING'S glyphs inside
        // its own bounding box, and without this list the ground reader picks
        // the sibling's ink as the ground and reports 2.90:1 on a headline
        // anybody can read. The overlap test matters as much as the list: a
        // white label elsewhere in the same parent would otherwise disqualify
        // a white GROUND, and then there is nothing left to measure against.
        const scope = element.parentElement || element;
        const overlaps = (other) => {
          const r = other.getBoundingClientRect();
          return !(
            r.right <= box.left ||
            r.left >= box.right ||
            r.bottom <= box.top ||
            r.top >= box.bottom
          );
        };
        const inks = new Set([style.color]);
        if (overlaps(scope)) inks.add(getComputedStyle(scope).color);
        scope.querySelectorAll('*').forEach((child) => {
          if (inks.size < 16 && overlaps(child)) inks.add(getComputedStyle(child).color);
        });
        entry.inks = [...inks].map((value) => read(value, '#ffffff'));
        entry.fontSize = parseFloat(style.fontSize) || 0;
        entry.fontWeight = parseInt(style.fontWeight, 10) || 400;
        entry.rect = [
          Math.floor(box.left + scrollX),
          Math.floor(box.top + scrollY),
          Math.ceil(box.right + scrollX),
          Math.ceil(box.bottom + scrollY),
        ];
      }
      incomplete.push(entry);
    }
  }

  return { violations, incomplete };
}
"""

# ---------------------------------------------------------------------------
# MEASURING WHAT AXE COULD NOT
#
# Wave 412 counted `results.violations` and dropped `results.incomplete`, and
# both of the AA failures the rel412 verdict found were sitting in the second
# list: the /about sourced-figure ledger, whose band carries a photograph
# behind it, and the /platform difference card, which is `bg-page/55` under a
# gradient layer and a blurred radial tint. axe declines to guess at either,
# and a gate that reads only the first list reports a clean page.
#
# So the screenshot answers instead. For each incomplete node: take its
# bounding box out of the full-page shot, call the MODAL pixel in that box the
# ground (in a box drawn round a line of text, the ground is most of it), take
# the element's own computed colour composited onto that ground as the glyph,
# and measure the pair against the floor its size and weight answer to.
#
# A node whose own colour cannot be found anywhere inside its box is not
# painted where its rect says it is (a closed disclosure, a clipped carousel
# slide, an element read at the wrong scroll). Those are reported as
# UNMEASURED and counted, rather than quietly passed.

GLYPH_TOLERANCE = 12  # per channel, enough to tell a glyph from its ground
# Looser, and only for "is this text painted here at all". A 10px glyph in a
# condensed mono face can be anti-aliased all the way through and never reach
# its own colour exactly; 18 per channel is still far nearer the ink than any
# ground the ink would be legible on.
PRESENCE_TOLERANCE = 18
GROUND_SHARE_FLOOR = 0.20  # of the box, or the glyphs have filled it
GROUND_RING = 4  # px read from just outside the box when they have
GROUND_MIN_PIXELS = 24  # below this there is nothing to call a ground
LARGE_TEXT_PX = 24.0
LARGE_BOLD_PX = 18.66
LARGE_BOLD_WEIGHT = 700
AA_BODY = 4.5
AA_LARGE = 3.0


def contrast(first, second) -> float:
    high = max(luminance(first), luminance(second))
    low = min(luminance(first), luminance(second))
    return (high + 0.05) / (low + 0.05)


def composite(over_white, over_black, ground):
    """Recover a colour's alpha from its two readings and lay it on `ground`."""
    spread = sum(w - b for w, b in zip(over_white, over_black)) / 3
    alpha = 1 - max(0.0, min(255.0, spread)) / 255
    return tuple(
        max(0, min(255, round(black + (1 - alpha) * base)))
        for black, base in zip(over_black, ground)
    )


def floor_for(font_size: float, font_weight: int) -> float:
    large = font_size >= LARGE_TEXT_PX or (
        font_size >= LARGE_BOLD_PX and font_weight >= LARGE_BOLD_WEIGHT
    )
    return AA_LARGE if large else AA_BODY


def measure_incomplete(path: Path, nodes):
    """Measure every axe `incomplete` colour-contrast node off the pixels.

    Returns (measured, unmeasured). A measured row is
    (target, text, colour, size, weight, ground, glyph, ratio, floor).
    """
    measured = []
    unmeasured = []
    with Image.open(path) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        pixels = rgb.load()
        for node in nodes:
            label = (
                node["target"],
                node["text"] or "(no text)",
                node["colour"] or "(no colour)",
            )
            box = node["rect"]
            if not box or node["overWhite"] is None:
                unmeasured.append((*label, "axe named an element the page no longer has"))
                continue
            left = max(0, min(width, box[0]))
            top = max(0, min(height, box[1]))
            right = max(0, min(width, box[2]))
            bottom = max(0, min(height, box[3]))
            if right - left < 2 or bottom - top < 2:
                unmeasured.append((*label, "no area inside the shot"))
                continue

            # THE GROUND IS THE MODAL PIXEL INSIDE THE BOX THAT IS NOT A
            # GLYPH. Inside, and not outside: an element that paints its own
            # background (a filled button, a badge, a plate over a photograph)
            # carries its ground WITH it, and a ring read outside such a box
            # measures the page instead, which reported the partner pages'
            # primary button as white on cream at 1.14:1.
            #
            # "Not a glyph" means: not within tolerance of ANY text colour in
            # the neighbourhood. The element's own colour is not enough, since
            # an inline span's bounding box overlaps its siblings' glyphs, and
            # reading the box whole reported a two-colour headline as 2.90:1
            # against its own second colour.
            inks = [tuple(ink) for ink in node["inks"]] or [tuple(node["overWhite"])]

            def is_ink(pixel):
                return any(
                    max(abs(a - b) for a, b in zip(pixel, ink)) <= GLYPH_TOLERANCE
                    for ink in inks
                )

            counts = {}
            for y in range(top, bottom):
                for x in range(left, right):
                    pixel = pixels[x, y]
                    counts[pixel] = counts.get(pixel, 0) + 1
            total = sum(counts.values())
            clean = {pixel: n for pixel, n in counts.items() if not is_ink(pixel)}

            # A box the glyphs have filled has no ground in it to read, so
            # fall back to the ring immediately outside: the same place the
            # rel412 verdict read the /about ledger by hand.
            if sum(clean.values()) < GROUND_SHARE_FLOOR * total:
                clean = {}
                outer = (
                    max(0, left - GROUND_RING),
                    max(0, top - GROUND_RING),
                    min(width, right + GROUND_RING),
                    min(height, bottom + GROUND_RING),
                )
                for y in range(outer[1], outer[3]):
                    inside_rows = top <= y < bottom
                    for x in range(outer[0], outer[2]):
                        if inside_rows and left <= x < right:
                            continue
                        pixel = pixels[x, y]
                        if not is_ink(pixel):
                            clean[pixel] = clean.get(pixel, 0) + 1
            if sum(clean.values()) < GROUND_MIN_PIXELS:
                unmeasured.append((*label, "no ground to read in or around its box"))
                continue
            ground = max(clean.items(), key=lambda item: item[1])[0]
            glyph = composite(node["overWhite"], node["overBlack"], ground)

            # And the glyph has to actually be painted where its rect says it
            # is. A closed disclosure, a clipped slide or an element read at
            # the wrong scroll is reported as unmeasured, never as a pass.
            nearest = 255
            for y in range(top, bottom):
                for x in range(left, right):
                    nearest = min(
                        nearest, max(abs(a - b) for a, b in zip(pixels[x, y], glyph))
                    )
                    if nearest <= PRESENCE_TOLERANCE:
                        break
                if nearest <= PRESENCE_TOLERANCE:
                    break
            if nearest > PRESENCE_TOLERANCE:
                unmeasured.append(
                    (*label, f"its own colour is not painted in its box (nearest {nearest})")
                )
                continue

            measured.append(
                (
                    node["target"],
                    node["text"] or "(no text)",
                    node["colour"],
                    node["fontSize"],
                    node["fontWeight"],
                    ground,
                    glyph,
                    contrast(glyph, ground),
                    floor_for(node["fontSize"], node["fontWeight"]),
                )
            )
    return measured, unmeasured


def main() -> None:
    # Element text comes straight off the page, and the page is full of
    # middots, arrows and curly quotes. A gate that dies of cp1252 on page 9
    # has asserted nothing at all about pages 10 to 14.
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--baseline",
        action="store_true",
        help="measure only: no assertions, no images kept, for reading origin/main",
    )
    parser.add_argument("--build", default=str(BUILD), help="path to a built dist/client")
    args = parser.parse_args()

    build = Path(args.build)
    if not (build / "index.html").exists():
        raise SystemExit(f"No build at {build}. Run: STATIC_BUILD=true bun run build")
    if not AXE.exists():
        raise SystemExit(f"No axe-core at {AXE}. Run: bun install")

    axe_source = AXE.read_text(encoding="utf-8")
    port = serve(build)
    base = f"http://127.0.0.1:{port}"
    out = OUT if not args.baseline else ROOT / "docs" / "screenshots" / "wave412-baseline"
    out.mkdir(parents=True, exist_ok=True)

    failures: list[str] = []
    rows: list[tuple[str, int, float, float, float, int, int, bool]] = []
    incomplete_tally: list[tuple[str, int, int, int, int]] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for path, slug in PAGES:
            for width in WIDTHS:
                page = browser.new_page(viewport={"width": width, "height": 900})
                page.goto(f"{base}{path}", wait_until="networkidle")
                settle(page)

                overflow = page.evaluate(
                    "() => [document.documentElement.scrollWidth, window.innerWidth]"
                )
                grounds = page.evaluate(GROUNDS)
                islands = page.evaluate(
                    "() => document.querySelectorAll('main .section-dark').length"
                )
                text_chars = page.evaluate("() => document.body.innerText.trim().length")

                masks = page.evaluate(MASKS)
                target = out / f"{slug}-{width}.png"
                page.screenshot(path=str(target), full_page=True)
                share, ground = dark_shares(target, masks)

                page.add_script_tag(content=axe_source)
                axe_result = json.loads(json.dumps(page.evaluate(AXE_RUN)))
                violations = axe_result["violations"]
                measured, unmeasured = measure_incomplete(target, axe_result["incomplete"])

                body_luminance = luminance(grounds["bodyRgb"])
                header_luminance = luminance(grounds["barRgb"])
                fits = overflow[0] <= overflow[1]

                print(
                    f"{slug:<30} {width:>5}  raw={share * 100:5.2f}%  "
                    f"ground={ground * 100:5.2f}%  "
                    f"body_L={body_luminance:.3f}  header_L={header_luminance:.3f}  "
                    f"islands={islands}  axe={len(violations)}  "
                    f"incomplete={len(axe_result['incomplete'])}"
                    f"(measured {len(measured)}, unmeasured {len(unmeasured)})  "
                    f"text={text_chars}  "
                    f"scrollWidth={overflow[0]}/{overflow[1]}"
                )
                # Every incomplete node, with the text axe found, the colour it
                # computed, and the pair read back off this shot's own pixels.
                for row in measured:
                    node, words, colour, size, weight, back, ink, value, floor = row
                    print(
                        f"    {'ok ' if value >= floor else 'FAIL'} {value:5.2f}:1 "
                        f"(floor {floor:.1f})  {size:g}px/{weight}  {colour} on "
                        f"rgb{back} -> rgb{ink}  {node}  \"{words}\""
                    )
                for node, words, colour, why in unmeasured:
                    print(f"    --  unmeasured: {why}  {node}  \"{words}\" {colour}")
                incomplete_tally.append(
                    (slug, width, len(axe_result["incomplete"]), len(measured), len(unmeasured))
                )
                rows.append(
                    (
                        slug,
                        width,
                        share,
                        ground,
                        body_luminance,
                        header_luminance,
                        islands,
                        len(violations),
                        fits,
                    )
                )

                if not args.baseline:
                    where = f"{slug} @ {width}"
                    if text_chars < MIN_TEXT_CHARS:
                        failures.append(
                            f"{where}: only {text_chars} characters of rendered text. "
                            f"The page is blank or nearly so."
                        )
                    if not fits:
                        failures.append(
                            f"{where}: horizontal overflow, "
                            f"scrollWidth {overflow[0]} > innerWidth {overflow[1]}"
                        )
                    if body_luminance <= LIGHT_GROUND_FLOOR:
                        failures.append(
                            f"{where}: body ground {grounds['body']} has luminance "
                            f"{body_luminance:.3f}, not above {LIGHT_GROUND_FLOOR}"
                        )
                    if header_luminance <= LIGHT_GROUND_FLOOR:
                        failures.append(
                            f"{where}: header ground {grounds['bar']} has luminance "
                            f"{header_luminance:.3f}, not above {LIGHT_GROUND_FLOOR}"
                        )
                    if islands > 1:
                        failures.append(
                            f"{where}: {islands} .section-dark islands inside <main>, at most 1"
                        )
                    ceiling = RAW_CEILING.get((slug, width), DARK_PIXEL_CEILING)
                    if share >= ceiling:
                        failures.append(
                            f"{where}: {share * 100:.2f}% of pixels are dark, "
                            f"ceiling {ceiling * 100:.1f}%"
                        )
                    if ground >= DARK_PIXEL_CEILING:
                        failures.append(
                            f"{where}: {ground * 100:.2f}% of the page's own GROUND is "
                            f"dark (photographs, the map field and the island masked "
                            f"out), ceiling {DARK_PIXEL_CEILING * 100:.0f}%"
                        )
                    for violation in violations:
                        failures.append(
                            f"{where}: axe {violation['id']} ({violation['impact']}) "
                            f"on {violation['target']}: {violation['detail']}"
                        )
                    for row in measured:
                        node, words, colour, size, weight, back, ink, value, floor = row
                        if value < floor:
                            failures.append(
                                f"{where}: {value:.2f}:1 against a {floor:.1f}:1 floor. "
                                f"{colour} at {size:g}px/{weight} on rgb{back}, measured "
                                f"off the shot's pixels because axe returned it as "
                                f"INCOMPLETE. {node} \"{words}\""
                            )

                page.close()

        if not args.baseline:
            reveal_probe(browser, base, failures)
        browser.close()

    total_incomplete = sum(entry[2] for entry in incomplete_tally)
    total_measured = sum(entry[3] for entry in incomplete_tally)
    total_unmeasured = sum(entry[4] for entry in incomplete_tally)
    print(
        f"\naxe colour-contrast INCOMPLETE nodes: {total_incomplete} across "
        f"{len(incomplete_tally)} shots, {total_measured} measured off the pixels, "
        f"{total_unmeasured} unmeasured."
    )

    worst_raw = max(rows, key=lambda r: r[2])
    worst_ground = max(rows, key=lambda r: r[3])
    print(
        f"\n{len(rows)} shots in {out.relative_to(ROOT)}. "
        f"Darkest raw: {worst_raw[0]} @ {worst_raw[1]}, {worst_raw[2] * 100:.2f}%. "
        f"Darkest ground: {worst_ground[0]} @ {worst_ground[1]}, "
        f"{worst_ground[3] * 100:.2f}%."
    )

    if failures:
        print(f"\n{len(failures)} FAILURE(S):")
        for failure in failures:
            print(f"  - {failure}")
        raise SystemExit(1)
    if not args.baseline:
        print("All assertions passed.")


if __name__ == "__main__":
    main()
