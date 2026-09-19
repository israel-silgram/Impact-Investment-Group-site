"""Wave 414 gate: every route on a phone, on a tablet, and on a phone on its side.

    STATIC_BUILD=true bun run build
    node scripts/pages-postbuild.mjs dist/client
    python scripts/wave414-mobile.py

Runs entirely in one foreground process, exactly as `scripts/wave412-screenshots.py`
and `scripts/wave413-motion.py` do: it serves the static build inside itself, drives
Playwright against it, asserts what each shot is meant to prove, writes the image, and
exits non-zero the moment anything fails. Nothing is left running.

THE CALL, Callum, 18 September 2026: "Finally ensure that the entire site is built to
work with mobile users through out." So the five viewports below are not a sample. They
are the three phone widths the UK actually holds (a 360 Android, a 390 iPhone, a 414
iPhone Plus), the tablet that sits between a phone and the desktop the site was drawn
for, and a phone turned on its side, which is the one nobody tests and every visitor
does at least once.

WHAT IS ASSERTED, per route, per profile. Each is one of the eight phone rules in
`docs/WAVE414_REPORT.md` section 1.

  1. NOTHING OVERFLOWS. `document.documentElement.scrollWidth` is not greater than
     `window.innerWidth`. When it is, the offending elements are printed with their
     right edges, because "the page scrolls sideways" is useless and "this grid is
     24px too wide" is a fix.

  2. EVERYTHING IS REACHABLE WITH A THUMB. Every visible interactive element is at
     least 44 by 44 CSS pixels in its hit area, padding included, and no two of them
     come within 8px of each other unless both already clear 44 in the axis that
     separates them. The exemptions are listed at EXEMPT_REASONS and each one is a
     rule rather than an element: a link inside a run of text (the brief exempts
     these, and a 15px line of copy cannot carry a 44px link without becoming a list),
     anything with no rendered area, anything inside `aria-hidden`, and the skip link,
     which has no size until it is focused and is 44px tall when it is.

  3. TYPE IS READABLE WITHOUT ZOOMING. Every `input`, `select` and `textarea`
     computes at 16px or more, because iOS zooms the whole page into any form control
     under 16 and then leaves the visitor there. Every `p` and `li` that renders text
     answers to one of two floors, and the rule that picks between them is at
     BODY_MIN_PX below: running prose is body and takes 15px, a label is a label and
     takes 12px, which is the smallest size the brand system declares.

  4. NO FIXED LAYER OVERLAPS ANOTHER. Every `position: fixed` element with area is
     collected and tested pairwise. The drawer and its backdrop are the one allowed
     pair, because a backdrop that does not cover the panel is not a backdrop; every
     other overlap is two things fighting for the same corner of a phone screen.

  5. THE HOME PAGE'S FIRST SCREEN IS THE HOME PAGE. On `/` at every profile, the first
     viewport contains a photograph, a headline and the way on to the wait list. This
     is the one assertion that is about the hero decision in section 2 of the report
     rather than about a rule, and it is what chose between the snap strip and the
     stack.

  6. AXE REPORTS NO SERIOUS OR CRITICAL VIOLATION. The whole rule set, not just
     colour-contrast: this is the mobile pass, and `target-size`, `meta-viewport` and
     the landmark rules are exactly what it is about. Wave 412's gate keeps the
     colour-contrast half of this at 1280 and 390 and is re-run whole beside this one.

And once for the run, after the pages:

  7. THE KEYBOARD PROBE. `/register/investor` at 390 with the viewport cut to 420px
     tall, which is roughly what an iPhone leaves above an open keyboard. The Continue
     control must be in view or reachable with ONE scroll, and the focused input must
     not be under the header.

  8. THE DRAWER PROBE (rel413b MIN-6). At 390: open the drawer, press the BACKDROP,
     assert the panel is gone and focus is back on the trigger. Wave 413 proved every
     other path out of the drawer and left this one proved only by reading the code.

  9. THE TIMING TABLE. Lighthouse mobile where it can be installed, and it can be
     here (13.5.0 via `bunx`), so this script prints the Playwright-measured LCP, CLS
     and INP as well and `docs/WAVE414_REPORT.md` carries both. Run with
     `--timings-only` to take the timing table without the shots.

`--profiles 390,768` narrows the run while fixing something. The full run is the gate.
"""

import argparse
import functools
import http.server
import io
import json
import socketserver
import sys
import threading
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
OUT = ROOT / "docs" / "screenshots" / "wave414"
AXE = ROOT / "node_modules" / "axe-core" / "axe.min.js"

# (label, width, height). Every one is emulated as a touch device, so the site's
# `@media (hover: none)` arms and `pointer: coarse` are the ones under test rather
# than the desktop ones a plain resize would leave in place.
PROFILES = [
    ("360", 360, 800),
    ("390", 390, 844),
    ("414", 414, 896),
    ("768", 768, 1024),
    ("667x375", 667, 375),
]

# The same fourteen routes wave 412's gate shoots, for the same reason: the ten
# register roles are one component with one content file and `/register/investor`
# and `/register/resident` stand for them, and the ten partner pages likewise.
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

TARGET_MIN = 44.0
TARGET_GAP = 8.0

# ⚠ TWO FLOORS, AND THE RULE THAT PICKS BETWEEN THEM IS STATED HERE RATHER
# THAN LEFT TO A SELECTOR LIST.
#
# The brief says "body copy at least 15px", and `CLAUDE.md` says "Body never
# below 15px" in the same breath as declaring an EYEBROW at 12px. Both are
# authoritative and they only disagree if "body copy" is read as "every `p` on
# the page". It is not: an eyebrow, a stat label, a chip and a source credit
# are labels, and the brand system sizes them deliberately.
#
# So a `p` or `li` is BODY when it is running prose and a LABEL when it is not,
# and the test is length, because length is what distinguishes a sentence
# somebody reads from a word somebody scans. 60 characters is a line and a
# half of copy at this measure; nothing on this site under 60 characters is a
# paragraph and nothing over it is an eyebrow.
#
# BODY answers to 15px, which is the brief's floor and the brand system's.
# LABEL answers to 12px, which is the SMALLEST SIZE THE BRAND SYSTEM DECLARES
# (the eyebrow) and therefore the smallest a component is entitled to ask for.
# Wave 414 found the site running labels at 11px, under its own spec, and
# prose as low as 11px on a phone.
#
# A control answers to 16px whatever it says, because iOS zooms the whole page
# into anything smaller and does not zoom back out.
BODY_MIN_PX = 15.0
LABEL_MIN_PX = 12.0
BODY_CHARS = 60
CONTROL_MIN_PX = 16.0
# Sub-pixel: a 43.99609375 box is a 44px box that went through a layout engine.
EPSILON = 0.05

# ⚠ WAVE 414b: THE BRAND LOCKUP IS MEASURED IN LIGHT, NOT IN MARKUP.
#
# The responsive-image script flattened the alpha out of every variant it
# wrote, so `logo-lockup-400.webp` was navy and orange artwork on a SOLID BLACK
# RECTANGLE, and `sizes` meant every device picked that step. It shipped in the
# header and the footer of all 36 prerendered pages at every width, and NOT ONE
# assertion in this gate could see it: the element was there, it had a box, it
# had an accessible name, axe was happy, and the page did not overflow. The
# only witness was a picture.
#
# So the mark is now photographed and read. The lockup is a transparent mark on
# a white bar: its box measures 0.81 of relative luminance with the alpha
# intact and 0.19 with a black plate under it, so a floor of 0.80 separates the
# two by four times the distance either one varies. It is an assertion about
# what a visitor SEES rather than about what the DOM says is there, which is
# the class of defect it exists for.
LOGO_LUMINANCE_FLOOR = 0.80

# AND THE SAME READING ON A GROUND THAT IS NOT WHITE.
#
# 0.80 is the right floor for the header, whose bar is white: the mark reads
# 0.822 there with its alpha intact and 0.19 with a plate under it. The FOOTER
# lockup sits on the cream, whose own relative luminance is 0.845, so no mark
# with ink in it can reach 0.80 there and a flat floor would be a number about
# the ground rather than about the mark. What is constant is how much darker
# than its ground a piece of transparent artwork is allowed to be: 0.178 on the
# white bar, 0.165 on the cream, against 0.65 for a black plate. The ceiling is
# 0.30, which is nearly twice the worst honest reading and less than half the
# defect, and it holds on any ground including a navy one.
LOGO_INK_MAX = 0.30

# The frame of ground sampled around the mark, in CSS pixels.
LOGO_GROUND_PAD = 10

# Rule 3's other three halves, which wave 414 collected and did not test.
#
# LEADING. 1.6, on running prose only. The brief says "body copy at least 15px
# and 1.6 line-height"; `CLAUDE.md` sets 1.65 on `body` "so that every explicit
# leading-* on a headline or a caption still wins". Both hold if "body copy"
# means prose, and PROSE_MAX_WEIGHT and PROSE_MAX_PX below are what separates
# prose from a display line: a headline set in Barlow, or at 600 and above, or
# above the 17px lede, is a headline whatever tag it is written in, and its
# leading is a brand decision. Everything else in a `p` or an `li` is prose.
#
# MEASURE. 30 characters, at the narrowest width. Read as the COLUMN WIDTH in
# characters of the element's own text (its content box divided by the average
# advance of the string it is actually setting), which is the brief's own
# second form of the rule. The average over rendered lines is not the measure:
# a paragraph's last line is ragged, so `chars / lines` on a three-line
# paragraph understates the column by about a quarter and would fail a column
# that reads perfectly well.
#
# HEADINGS. No heading may break a word: none may overflow its own content box
# and none may ask for automatic hyphenation or `break-all`.
LEADING_MIN = 1.6
MEASURE_MIN_CHARS = 30.0
# The profile the measure floor binds at: the narrowest the site is built for.
NARROWEST = "360"
PROSE_MAX_WEIGHT = 599
PROSE_MAX_PX = 17.5

# ⚠ THE DEMAND MAP'S HEIGHT ON A PHONE, AND IT IS A RATCHET.
#
# Build item 2 asked for "the section's height bounded so a reader is never
# lost inside it" and nothing in wave 414 measured it.
#
# IN PIXELS RATHER THAN IN VIEWPORTS, because the thing a reader is lost in is
# a distance to scroll and not a number of screens: the same band is 2.7
# screens on a 390x844 phone and 5.5 on the same phone turned on its side,
# where nothing about the band has changed at all. The ceiling is 2,600 CSS
# pixels, which is the tallest reading of it plus a tenth, and it is a RATCHET:
# a later wave may lower it and may not raise it without saying why here. The
# section carries a map, a four-point explanation, three figures, a picker and
# a source line, so it was never going to be one screen; what the bound stops
# is it growing.
DEMAND_SECTION = 'section[aria-labelledby="demand-heading"]'
DEMAND_MAX_PX = 2600

EXEMPT_REASONS = {
    "inline-in-text": "a link inside a run of text, which the brief exempts",
    "no-area": "not rendered at this width",
    "aria-hidden": "inside an aria-hidden subtree, so it is not a target",
    "skip-link": "measured FOCUSED instead, which is the state it has a box in",
    "label-is-the-target": "a tick box whose own label is already 44 by 44, and "
                           "pressing the label is what activates the control",
}


# ---------------------------------------------------------------------------
# The server. Identical to wave 412's, including serving 404.html for a miss,
# because GitHub Pages does and a local server that does not would test the 404
# route against Python's own error page.
class Quiet(http.server.SimpleHTTPRequestHandler):
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


def settle(page):
    """Scroll the page once so nothing is measured or photographed mid-reveal.

    ⚠ EVERY SCROLL HERE IS INSTANT, AND THE RETURN TO THE TOP IS WAITED FOR.

    `html` carries `scroll-behavior: smooth`, so `scrollTo(0, 0)` ANIMATES, and
    the animation is not over in the 700ms this used to wait. On a landscape
    phone the home page is 6,751px tall against a 375px viewport and the
    shutter opened at **scrollY = 756**. A `sticky` header paints where it is
    stuck, so `home-667x375.png` was written with 56px of EMPTY BAR at the top
    of the image and the bar itself 756px down it: no logo, no menu button and
    no hairline where the site puts all three. The rel414 re-check read that
    shot and could not tell from a still whether the site or the capture was
    at fault. It was the capture, and a gate that photographs a lie is worse
    than a gate that photographs nothing.

    So the sweep is instant, the return to the top is instant, and `to_top`
    below confirms it landed before anything is shot or measured.
    """
    page.evaluate(
        "async () => { const step = innerHeight; "
        "for (let y = 0; y < document.body.scrollHeight; y += step) "
        "{ scrollTo({ top: y, behavior: 'instant' }); "
        "await new Promise(r => setTimeout(r, 120)); } }"
    )
    page.wait_for_timeout(300)


def scroll_to(page, y: float) -> float:
    """Scroll instantly to `y` and return where the page actually came to rest.

    WAVE 415b, rel415 MAJOR 3. `settle` above was fixed by 414b and this file
    was then reported across wave 415 as one of "three gates that now settle
    identically". IT WAS NOT. Three bare `scrollTo`s survived here untouched,
    under an `html` that carries `scroll-behavior: smooth`, so all three were
    ANIMATED and the fixed waits after them confirmed nothing. The worst of
    them asked for a scroll of up to three viewports, waited 350ms, and read
    `AUDIT` at whatever position the animation happened to have reached: that
    reading is the scrolled half of this gate's headline target count and it
    is the only reading in which the back-to-top control exists at all.

    Identical to `scroll_to` in `scripts/wave413-motion.py`. Four gates, one
    settle. 415c, rel415b MINOR 1: this was not the last bare scroll in this
    file either. A `scrollBy` in the keyboard probe, below, survived this same
    conversion and is fixed there.
    """
    for _ in range(12):
        page.evaluate(f"() => scrollTo({{ top: {y}, behavior: 'instant' }})")
        page.wait_for_timeout(100)
        if abs(page.evaluate("() => window.scrollY") - y) <= 0.5:
            return float(y)
    return page.evaluate("() => window.scrollY")


def to_top(page) -> float:
    """Put the page at the top and return where it actually is.

    Returned rather than asserted here, so the caller names the shot in the
    failure. A page that will not go back to 0 is a page nothing below can be
    measured on.
    """
    return scroll_to(page, 0)


def assert_scrolled(page, y: float, failures: list[str], where: str) -> float:
    """Scroll to `y`, fail the run if the page did not arrive, return where.

    A reading taken at an unconfirmed scroll position is a reading of a
    different page from the one the failure message will name.
    """
    resting = scroll_to(page, y)
    if abs(resting - y) > 0.5:
        failures.append(
            f"{where}: the page would not scroll to y={y:g}, resting at "
            f"scrollY={resting:g}. Everything read at this position was read "
            f"at the wrong one."
        )
    return resting


# ---------------------------------------------------------------------------
# RULE 1. The overflow reading, and the elements responsible when it fails.
#
# The assertion is on scrollWidth alone, because that is the fact a visitor
# feels. The element list is a diagnostic: an element whose right edge passes
# the viewport is usually clipped by an ancestor and perfectly fine, so listing
# it as a failure on its own would cry wolf on every `overflow-hidden` band on
# the site. It is printed only when the page really does scroll sideways.
OVERFLOW = """
() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    if (r.right <= vw + 1 && r.left >= -1) return;
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '').slice(0, 80),
      left: Math.round(r.left),
      right: Math.round(r.right),
    });
  });
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    clientWidth: vw,
    offenders: out.slice(0, 12),
  };
}
"""

# ---------------------------------------------------------------------------
# RULES 2, 3 and 4, read in one pass so the page is only walked once.
#
# ⚠ THE EXEMPTIONS ARE RULES, NOT A LIST OF ELEMENTS. An exemption that names a
# selector is a way of making a gate green; an exemption that names a shape is
# a statement about what a target is. There are four and each is defended in
# EXEMPT_REASONS above.
#
# "A link inside a run of text" is the only one that needs a definition in
# code: an anchor whose computed display is inline AND whose parent holds text
# either side of it, or which sits inside a `p`, `li`, `figcaption`, `small` or
# `label` that has more text than the link does. That is a sentence with a link
# in it. An anchor that IS the whole of its paragraph is a link dressed as
# prose and gets no exemption.
AUDIT = """
() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const seen = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (parseFloat(s.opacity) === 0) return false;
    return true;
  };

  const hidden = (el) => {
    for (let n = el; n; n = n.parentElement) {
      if (n.getAttribute && n.getAttribute('aria-hidden') === 'true') return true;
      if (n.hasAttribute && n.hasAttribute('inert')) return true;
    }
    return false;
  };

  // --- RULE 2: targets -----------------------------------------------------
  const INTERACTIVE = [
    'a[href]', 'button', 'input:not([type="hidden"])', 'select', 'textarea',
    'summary', '[role="button"]', '[role="link"]', '[role="tab"]',
    '[role="checkbox"]', '[role="radio"]', '[role="switch"]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  const TEXTY = new Set(['P', 'LI', 'FIGCAPTION', 'SMALL', 'LABEL', 'BLOCKQUOTE', 'DD', 'TD']);

  const inRunOfText = (el) => {
    if (el.tagName !== 'A') return false;
    const style = getComputedStyle(el);
    if (!style.display.startsWith('inline')) return false;
    const own = (el.textContent || '').trim().length;
    for (let n = el.parentElement; n; n = n.parentElement) {
      if (!TEXTY.has(n.tagName)) break;
      const all = (n.textContent || '').trim().length;
      // More words around it than in it: a sentence with a link in it.
      if (all > own + 8) return true;
    }
    return false;
  };

  // ⚠ A TICK BOX IS NOT THE TARGET; ITS LABEL IS. Pressing anywhere in a
  // wrapping <label>, or in one that names the control with `for`, activates
  // the control: that is what a label is. A 20px box inside a 44px label is
  // therefore a 44px target, and the gate measures the label. If the label is
  // ALSO under 44 the control fails, which is the case this is guarding.
  const labelIsTheTarget = (el) => {
    const t = (el.getAttribute('type') || '').toLowerCase();
    if (el.tagName !== 'INPUT' || (t !== 'checkbox' && t !== 'radio')) return false;
    const labels = [...(el.labels || [])];
    return labels.some((l) => {
      const r = l.getBoundingClientRect();
      return r.width >= 44 - 0.05 && r.height >= 44 - 0.05;
    });
  };

  const targets = [];
  const exempt = { 'inline-in-text': 0, 'no-area': 0, 'aria-hidden': 0,
                   'skip-link': 0, 'label-is-the-target': 0 };
  document.querySelectorAll(INTERACTIVE).forEach((el) => {
    const r = el.getBoundingClientRect();
    const label = (el.getAttribute('aria-label') || el.textContent || '')
      .trim().replace(/\\s+/g, ' ').slice(0, 44) || '(no name)';
    const id = el.tagName.toLowerCase() + ' [' +
      (el.getAttribute('class') || '(no class)').slice(0, 110) + ']';

    // ⚠ THE SKIP LINK IS MEASURED, NOT EXEMPTED. It is `sr-only` until it
    // is focused, which is a 1x1 clipped box, and a gate that exempted it
    // would never find out whether the thing it becomes is a target. So it is
    // focused, measured in the state a keyboard visitor sees, and blurred.
    if (el.classList.contains('sr-only') && (r.width < 2 || r.height < 2)) {
      el.focus();
      const f = el.getBoundingClientRect();
      el.blur();
      if (f.width >= 2 && f.height >= 2) {
        targets.push({
          id: id + ':focus', label: label + ' (focused)',
          w: Math.round(f.width * 100) / 100, h: Math.round(f.height * 100) / 100,
          x: f.left + scrollX, y: f.top + scrollY,
        });
        exempt['skip-link'] += 1;
        return;
      }
    }
    if (!seen(el) || r.width < 1 || r.height < 1) { exempt['no-area'] += 1; return; }
    if (hidden(el)) { exempt['aria-hidden'] += 1; return; }
    if (inRunOfText(el)) { exempt['inline-in-text'] += 1; return; }
    if (labelIsTheTarget(el)) { exempt['label-is-the-target'] += 1; return; }

    targets.push({
      id, label,
      w: Math.round(r.width * 100) / 100,
      h: Math.round(r.height * 100) / 100,
      x: r.left + scrollX, y: r.top + scrollY,
    });
  });

  // --- RULE 3: type --------------------------------------------------------
  const type = [];
  document.querySelectorAll('p, li, input:not([type="hidden"]), select, textarea')
    .forEach((el) => {
      if (!seen(el) || hidden(el)) return;
      const tag = el.tagName.toLowerCase();
      const inputType = (el.getAttribute('type') || 'text').toLowerCase();
      // The 16px floor exists because iOS zooms the page into a TEXT ENTRY
      // under 16px. A tick box, a radio, a colour well or a range slider has
      // nothing to type into and never triggers it, so the floor does not
      // apply and asserting it would be a number with no reader behind it.
      const NOT_TYPED_INTO = ['checkbox', 'radio', 'range', 'color', 'file',
                              'submit', 'button', 'reset', 'image'];
      if (tag === 'input' && NOT_TYPED_INTO.includes(inputType)) return;
      const control = tag === 'input' || tag === 'select' || tag === 'textarea';
      if (!control) {
        // An empty <li> is a grid cell and a <p> with no words is a spacer.
        // Neither is type, and neither can be unreadable.
        if (!(el.textContent || '').trim()) return;
        // Screen-reader-only text is not rendered type either.
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
      }
      const s = getComputedStyle(el);
      const words = (el.textContent || '').trim().replace(/\\s+/g, ' ');
      const size = parseFloat(s.fontSize);
      const lh = s.lineHeight === 'normal' ? size * 1.2 : parseFloat(s.lineHeight);
      const weight = parseInt(s.fontWeight, 10) || 400;

      // PROSE OR A DISPLAY LINE, and the test is the type rather than the tag.
      // A card's headline is often written as a `p`; it is set in Barlow, or at
      // 600 and above, or above the lede's 17px, and its leading and its measure
      // are brand decisions rather than reading comfort.
      const prose = !control && weight <= 599 && size <= 17.5 &&
        !/Barlow|Anton/i.test(s.fontFamily);

      // THE COLUMN, IN CHARACTERS OF THIS ELEMENT'S OWN TEXT. Measured only
      // where the element is the box its text is laid into: a `p` that is a grid,
      // or that holds a block child, has no measure of its own.
      let measure = null;
      let lines = null;
      if (prose && s.display.indexOf('block') === 0 &&
          [...el.children].every((c) => getComputedStyle(c).display.startsWith('inline'))) {
        const box = el.getBoundingClientRect();
        const inner = box.height - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom) -
          parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth);
        lines = Math.max(1, Math.round(inner / lh));
        const ctx = (window.__gateCanvas ||
          (window.__gateCanvas = document.createElement('canvas').getContext('2d')));
        ctx.font = s.fontStyle + ' ' + s.fontWeight + ' ' + s.fontSize + ' ' + s.fontFamily;
        const advance = ctx.measureText(words).width / Math.max(1, words.length);
        const column = box.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight) -
          parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth);
        measure = advance > 0 ? Math.round((column / advance) * 10) / 10 : null;
      }

      type.push({
        tag,
        control,
        prose,
        cls: (el.getAttribute('class') || '').slice(0, 120),
        chars: words.length,
        size: Math.round(size * 100) / 100,
        weight,
        ratio: Math.round((lh / size) * 1000) / 1000,
        measure,
        lines,
        leading: s.lineHeight === 'normal'
          ? 'normal'
          : Math.round((parseFloat(s.lineHeight) / parseFloat(s.fontSize)) * 100) / 100,
        text: (el.getAttribute('name') || el.textContent || '')
          .trim().replace(/\\s+/g, ' ').slice(0, 50),
      });
    });

  // --- RULE 3, the headings: no display size may break a word --------------
  //
  // A heading with more inline content than its own content box is breaking
  // somewhere it was not designed to, and `hyphens: auto` or `break-all` is a
  // heading asking to be broken mid-word. An `sr-only` heading is a 1px clipped
  // box with no rendered measure at all, so it is skipped rather than failed.
  const headings = [];
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
    if (!seen(el) || hidden(el)) return;
    if (el.clientWidth < 2 || el.clientHeight < 2) return;
    const s = getComputedStyle(el);
    headings.push({
      tag: el.tagName.toLowerCase(),
      over: Math.round((el.scrollWidth - el.clientWidth) * 100) / 100,
      hyphens: s.hyphens,
      wordBreak: s.wordBreak,
      overflowWrap: s.overflowWrap,
      text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 44),
    });
  });

  // --- RULE 4: fixed layers ------------------------------------------------
  const layers = [];
  document.querySelectorAll('body *').forEach((el) => {
    const s = getComputedStyle(el);
    if (s.position !== 'fixed') return;
    if (!seen(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 100) return;
    // A fixed element scrolled off screen is not a layer anybody is under.
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return;
    layers.push({
      id: el.tagName.toLowerCase() +
        (el.getAttribute('class') ? '.' + el.getAttribute('class').split(/\\s+/)[0] : ''),
      x: r.left, y: r.top, r: r.right, b: r.bottom,
    });
  });

  // The one section build item 2 asked to be bounded and nothing measured.
  const demandNode = document.querySelector(
    'section[aria-labelledby="demand-heading"]');
  const demand = demandNode
    ? Math.round(demandNode.getBoundingClientRect().height)
    : null;

  return { targets, exempt, type, headings, layers, demand, vw, vh };
}
"""

# ---------------------------------------------------------------------------
# RULE 5. The home page's first screen.
#
# Three facts, each read as "is there one of these whose box intersects the
# first viewport": a photograph (an <img> with real area, not the 7% ground
# wash, which is why the area floor is generous), a headline (any of the three
# hero captions, or the h1 if it is ever made visible), and the way on to the
# wait list (a link to a /register route, or the divider's own copy with a
# tile under it). The third is the one that decides the hero: a stacked hero
# pushes the tiles off the screen and a snap strip does not.
FIRST_SCREEN = """
() => {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const inFirst = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    return r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0;
  };
  const photos = [...document.querySelectorAll('main img, section img')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width >= 120 && r.height >= 90 &&
        parseFloat(getComputedStyle(el).opacity) > 0.5 && inFirst(el);
    })
    .map((el) => ({
      src: (el.getAttribute('src') || '').split('/').pop(),
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    }));
  const headlines = [...document.querySelectorAll('figcaption, h1, h2')]
    .filter((el) => inFirst(el) && (el.textContent || '').trim().length > 3 &&
      getComputedStyle(el).position !== 'absolute')
    .map((el) => (el.textContent || '').trim().slice(0, 40));
  const actions = [...document.querySelectorAll('a[href*="/register"]')]
    .filter(inFirst)
    .map((el) => (el.getAttribute('aria-label') || el.textContent || '')
      .trim().replace(/\\s+/g, ' ').slice(0, 40));
  const divider = [...document.querySelectorAll('#register-as')].filter(inFirst).length;
  return { photos, headlines, actions, divider, vh };
}
"""

AXE_RUN = """
async () => {
  const results = await axe.run(document, {
    resultTypes: ['violations'],
    rules: { 'color-contrast': { enabled: true } },
  });
  return results.violations
    .flatMap((v) => v.nodes
      .filter((n) => n.impact === 'serious' || n.impact === 'critical')
      .map((n) => ({
        id: v.id,
        impact: n.impact,
        target: n.target.join(' '),
        detail: (n.any[0] && n.any[0].message) || (n.all[0] && n.all[0].message) || '',
      })));
}
"""


def overlap(a, b) -> bool:
    return not (a["r"] <= b["x"] or b["r"] <= a["x"] or a["b"] <= b["y"] or b["b"] <= a["y"])


def allowed_layer_pair(a: str, b: str) -> bool:
    """The drawer and its own backdrop. A backdrop that misses the panel is not one."""
    pair = {a.split(".")[-1], b.split(".")[-1]}
    return pair == {"drawer-panel", "drawer-scrim"}


def check_targets(targets, failures, where):
    """Rule 2, both halves: the 44px floor and the 8px between neighbours."""
    small = [t for t in targets if t["w"] < TARGET_MIN - EPSILON or t["h"] < TARGET_MIN - EPSILON]
    for t in small:
        failures.append(
            f"{where}: target {t['w']:g}x{t['h']:g}, under {TARGET_MIN:g}x{TARGET_MIN:g}. "
            f"{t['id']} \"{t['label']}\""
        )

    # THE 8px RULE, AND WHAT IT DOES NOT APPLY TO. Two targets that both clear
    # 44 in the axis that separates them may touch: that is an iOS tab bar and
    # a list of full-width rows, and it is the shape a thumb is best at. The
    # gap only has to exist where at least one of the pair is under 44 in that
    # axis, which is the case the rule was written about.
    tight = []
    for i, a in enumerate(targets):
        for b in targets[i + 1:]:
            ax2, ay2 = a["x"] + a["w"], a["y"] + a["h"]
            bx2, by2 = b["x"] + b["w"], b["y"] + b["h"]
            overlaps_x = a["x"] < bx2 and b["x"] < ax2
            overlaps_y = a["y"] < by2 and b["y"] < ay2
            if overlaps_x and overlaps_y:
                continue  # nested or stacked; the 44px floor already judged them
            if overlaps_y and not overlaps_x:
                gap = b["x"] - ax2 if b["x"] >= ax2 else a["x"] - bx2
                big = a["w"] >= TARGET_MIN - EPSILON and b["w"] >= TARGET_MIN - EPSILON
            elif overlaps_x and not overlaps_y:
                gap = b["y"] - ay2 if b["y"] >= ay2 else a["y"] - by2
                big = a["h"] >= TARGET_MIN - EPSILON and b["h"] >= TARGET_MIN - EPSILON
            else:
                continue
            if gap < TARGET_GAP - EPSILON and not big:
                tight.append((a, b, gap))
    for a, b, gap in tight[:20]:
        failures.append(
            f"{where}: {gap:.1f}px between two targets, under {TARGET_GAP:g}px, and one of "
            f"them is under {TARGET_MIN:g}px in that axis. {a['id']} \"{a['label']}\" and "
            f"{b['id']} \"{b['label']}\""
        )
    return len(small), len(tight)


def type_floor(entry) -> tuple[float, str]:
    """The floor this node answers to, and the word for what it is."""
    if entry["control"]:
        return CONTROL_MIN_PX, "control"
    if entry["chars"] >= BODY_CHARS:
        return BODY_MIN_PX, "body"
    return LABEL_MIN_PX, "label"


def check_type(entries, failures, where):
    bad = []
    for e in entries:
        floor, kind = type_floor(e)
        if e["size"] < floor - 0.01:
            bad.append((e, floor))
            why = {
                "control": " (iOS zooms the page into anything smaller)",
                "body": " (running prose, so it is body copy)",
                "label": " (the smallest size the brand system declares is the 12px eyebrow)",
            }[kind]
            failures.append(
                f"{where}: <{e['tag']}> computes at {e['size']:g}px against the {floor:g}px "
                f"{kind} floor{why}. [{e['cls']}] \"{e['text']}\""
            )
    return len(bad)


def check_prose(entries, failures, where, assert_measure: bool):
    """Rule 3's other two halves: the leading and the measure.

    Both are read on PROSE only, and what prose is was decided in the audit
    rather than here. Returned as (leading failures, measure failures, the
    narrowest column seen) so the run can print the minimum it found rather
    than only the fact that nothing broke.

    ⚠ THE MEASURE IS ASSERTED AT THE NARROWEST PROFILE AND REPORTED AT ALL
    OF THEM, which is the scope the brief gives it: "line length never under 30
    characters ON THE NARROWEST WIDTH". 360 is where a column runs out of room
    on a phone, and it is where the floor binds. It is READ everywhere because
    a number nobody prints is a number nobody acts on: the tablet and the
    landscape phone put some of this site's rows side by side and the columns
    they leave are narrower than the ones a 360 phone gets, which is a real
    finding and is in the report as a proposal rather than smuggled into a
    gate the brief did not ask for.
    """
    bad_leading = 0
    bad_measure = 0
    narrowest = None
    for e in entries:
        # THE SAME BODY-OR-LABEL RULE THE SIZE FLOOR ALREADY USES, and for the
        # same reason. A line box of 1.6 and a measure of 30 characters are
        # facts about reading a paragraph. "Register to join the waitlist as"
        # is a divider, "ICO Registered" is a badge and "Selected area" is an
        # eyebrow: they are scanned, they are one line, and a leading written
        # for them is a brand decision rather than a reading one. 60 characters
        # is the line the gate already draws between the two.
        if not e.get("prose") or e["chars"] < BODY_CHARS:
            continue
        if e["ratio"] < LEADING_MIN - 0.001:
            bad_leading += 1
            failures.append(
                f"{where}: <{e['tag']}> sets {e['size']:g}px on a line box of "
                f"{e['ratio']:g}, under the {LEADING_MIN:g} the brief asks of body "
                f"copy. [{e['cls']}] \"{e['text']}\""
            )
        if e["measure"] is None:
            continue
        if narrowest is None or e["measure"] < narrowest[0]:
            narrowest = (e["measure"], e["text"])
        if assert_measure and e["measure"] < MEASURE_MIN_CHARS - 0.05:
            bad_measure += 1
            failures.append(
                f"{where}: <{e['tag']}> runs {e['measure']:g} characters to the line, "
                f"under the {MEASURE_MIN_CHARS:g} the brief floors the measure at. "
                f"A column this narrow is read a word at a time. "
                f"[{e['cls']}] \"{e['text']}\""
            )
    return bad_leading, bad_measure, narrowest


def check_headings(headings, failures, where):
    """No heading may break a word."""
    bad = 0
    for h in headings:
        if h["over"] > 1:
            bad += 1
            failures.append(
                f"{where}: <{h['tag']}> is {h['over']:g}px wider than its own content "
                f"box, so it is breaking where it was not drawn to. \"{h['text']}\""
            )
        if h["hyphens"] == "auto" or h["wordBreak"] == "break-all" or                 h["overflowWrap"] in ("break-word", "anywhere"):
            bad += 1
            failures.append(
                f"{where}: <{h['tag']}> asks to be broken mid-word "
                f"(hyphens {h['hyphens']}, word-break {h['wordBreak']}, "
                f"overflow-wrap {h['overflowWrap']}). \"{h['text']}\""
            )
    return bad


# ---------------------------------------------------------------------------
# THE BRAND LOCKUP, MEASURED IN LIGHT. See LOGO_LUMINANCE_FLOOR above for why
# this exists and what it caught.
def channel(value: float) -> float:
    value /= 255
    return value / 12.92 if value <= 0.03928 else ((value + 0.055) / 1.055) ** 2.4


def luminance(rgb) -> float:
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])


def mean_luminance(pixels) -> float:
    return sum(luminance(p) for p in pixels) / len(pixels) if pixels else 0.0


def box_and_ground(png: bytes, pad: int, scale: int) -> tuple[float, float]:
    """(the mark's own mean luminance, the mean of the ground framing it).

    The shot is the mark's box grown by `pad` on every side, so the frame is
    the ground the mark is drawn on and the inside is the mark. Reading the
    ground from the same capture is what makes this one assertion work on the
    white bar and on the cream footer without being told which is which.
    """
    with Image.open(io.BytesIO(png)) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        pixels = rgb.load()
        edge = pad * scale
        inside = []
        frame = []
        for y in range(height):
            for x in range(width):
                if edge <= x < width - edge and edge <= y < height - edge:
                    inside.append(pixels[x, y])
                else:
                    frame.append(pixels[x, y])
    return mean_luminance(inside), mean_luminance(frame)


def check_logo(page, failures, where) -> dict:
    """Photograph the header's and the footer's lockup and read their light.

    ⚠ AN ELEMENT SCREENSHOT, NOT A CROP OF THE FULL-PAGE ONE, and that is
    deliberate. The full-page capture of a landscape phone is 27,000 device
    pixels tall and Chromium takes it by a different path; the element capture
    is a plain viewport read with the element scrolled into view, so it is the
    same instrument at all five profiles including the one this gate could not
    previously see a header in at all.
    """
    reading = {}
    for spot in ("header", "footer"):
        mark = page.locator(f'{spot} img[src*="logo-lockup"]').first
        if mark.count() == 0:
            failures.append(
                f"{where}: no brand lockup inside <{spot}>. The mark is on every one "
                f"of the 36 prerendered pages and its absence is not a style question."
            )
            continue
        mark.scroll_into_view_if_needed()
        page.wait_for_timeout(120)
        rect = page.evaluate(
            """
            (spot) => {
              const el = document.querySelector(spot + ' img[src*="logo-lockup"]');
              if (!el) return null;
              const r = el.getBoundingClientRect();
              return { x: r.left, y: r.top, width: r.width, height: r.height,
                       vw: innerWidth, vh: innerHeight };
            }
            """,
            spot,
        )
        if rect is None or rect["width"] < 20 or rect["height"] < 20:
            failures.append(f"{where}: the <{spot}> lockup has no box to measure ({rect}).")
            continue
        pad = LOGO_GROUND_PAD
        clip = {
            "x": max(0.0, rect["x"] - pad),
            "y": max(0.0, rect["y"] - pad),
            "width": min(rect["vw"] - max(0.0, rect["x"] - pad), rect["width"] + pad * 2),
            "height": min(rect["vh"] - max(0.0, rect["y"] - pad), rect["height"] + pad * 2),
        }
        if clip["width"] < rect["width"] + pad * 2 - 0.5 or \
                clip["height"] < rect["height"] + pad * 2 - 0.5:
            failures.append(
                f"{where}: the <{spot}> lockup could not be framed by {pad}px of its own "
                f"ground inside the viewport ({clip}), so it was not measured."
            )
            continue
        value, ground = box_and_ground(page.screenshot(clip=clip), pad, 2)
        reading[spot] = value
        if ground >= 0.95 and value < LOGO_LUMINANCE_FLOOR:
            failures.append(
                f"{where}: the <{spot}> lockup's box reads {value:.3f} of relative "
                f"luminance on a white ground ({ground:.3f}), under the "
                f"{LOGO_LUMINANCE_FLOOR:.2f} floor. The mark is transparent artwork; a "
                f"reading this low means something opaque is under it. A flattened WebP "
                f"variant measures about 0.19 here."
            )
        if ground - value > LOGO_INK_MAX:
            failures.append(
                f"{where}: the <{spot}> lockup's box reads {value:.3f} against a ground "
                f"of {ground:.3f}, {ground - value:.3f} darker, over the "
                f"{LOGO_INK_MAX:.2f} a piece of transparent artwork may be. Something "
                f"opaque is under the mark."
            )
    return reading


def first_ink_row(path: Path, scale: int, limit: int = 240):
    """The first row of the saved shot with any ink in it, in CSS pixels.

    The whole site is white at the top with the bar's own artwork in it, so on
    every route the first ink is the logo at about 6 CSS px. A shot whose first
    ink is BELOW the bar is a shot with no bar in it, which is the artefact
    rel414 MIN-1 read off `home-667x375.png`. Only the top of the image is
    scanned: this is a header assertion, not a page one.
    """
    with Image.open(path) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        pixels = rgb.load()
        for y in range(0, min(limit * scale, height)):
            for x in range(0, width, 2 * scale):
                r, g, b = pixels[x, y][:3]
                if r < 246 or g < 246 or b < 246:
                    return y / scale
    return None


def chrome_or_static_404(page, failures, where) -> bool:
    """True when this document carries the site chrome and must be measured.

    ⚠ ONE ROUTE ON THIS SITE HAS NO HEADER AND NO FOOTER, AND IT IS MEANT
    TO. `scripts/pages-postbuild.mjs` writes `404.html` as a standalone
    document with the built stylesheet and nothing else: GitHub Pages serves it
    for any path it does not have, so it must render with no router, no
    JavaScript and no chunk. A gate that demanded a header there would be
    demanding the 404 stop being a 404.

    So the exemption is a SHAPE and it is asserted rather than assumed: a page
    with neither a header nor a footer must BE that page, which is to say it
    must carry the 404 heading and a link home. A route that loses its header
    still fails, because it will still have its footer.
    """
    read = page.evaluate(
        """
        () => {
          const home = [...document.querySelectorAll('a[href]')]
            .filter((a) => a.getAttribute('href') === '/').length;
          const first = document.querySelector('h1');
          return {
            header: !!document.querySelector('header'),
            footer: !!document.querySelector('footer'),
            h1: first ? (first.textContent || '').trim().slice(0, 12) : null,
            home,
          };
        }
        """
    )
    if read["header"] and read["footer"]:
        return True
    if read["header"] or read["footer"]:
        failures.append(
            f"{where}: the page has a <header> ({read['header']}) and a <footer> "
            f"({read['footer']}) that disagree. Every route carries both or it is the "
            f"standalone 404, which carries neither."
        )
        return True
    if read["h1"] != "404" or read["home"] < 1:
        failures.append(
            f"{where}: no <header> and no <footer>, and this is not the standalone 404 "
            f"either (h1 {read['h1']!r}, {read['home']} links home). The site chrome has "
            f"gone missing from a route that should have it."
        )
        return True
    print(f"    {where}: the standalone 404, no chrome by design, chrome checks skipped")
    return False


def check_header_painted(page, failures, where) -> dict:
    """The bar exists, has a box, and sits at the top of the document.

    Nothing in wave 414 asserted the header EXISTS at any profile, and wave
    413 reads its height only at 1280 and 390. The rel414 re-check found a
    landscape shot with 56px of empty bar in it and could not tell from a
    still whether the site or the capture was at fault. This says which.
    """
    reading = page.evaluate(
        """
        () => {
          const bar = document.querySelector('header');
          if (!bar) return null;
          const r = bar.getBoundingClientRect();
          const s = getComputedStyle(bar);
          const mark = bar.querySelector('img[src*="logo-lockup"]');
          const m = mark ? mark.getBoundingClientRect() : null;
          return {
            top: Math.round(r.top), height: Math.round(r.height),
            position: s.position, display: s.display,
            mark: m ? [Math.round(m.left), Math.round(m.top),
                       Math.round(m.width), Math.round(m.height)] : null,
            src: mark ? (mark.currentSrc || mark.src || '').split('/').pop() : null,
          };
        }
        """
    )
    if reading is None:
        failures.append(f"{where}: no <header> on the route at all.")
        return {}
    if reading["height"] < 40:
        failures.append(
            f"{where}: the header is {reading['height']}px tall. Below 44 there is no "
            f"room for the logo or for a 44px menu control."
        )
    if reading["top"] > 1:
        failures.append(
            f"{where}: the header's top is at {reading['top']} with the page at the top "
            f"of itself, so the bar is not where the site puts it."
        )
    if reading["mark"] is None:
        failures.append(f"{where}: the header carries no brand lockup.")
    return reading


def check_layers(layers, failures, where):
    clashes = 0
    for i, a in enumerate(layers):
        for b in layers[i + 1:]:
            if overlap(a, b) and not allowed_layer_pair(a["id"], b["id"]):
                clashes += 1
                failures.append(
                    f"{where}: two fixed layers overlap, {a['id']} and {b['id']}. "
                    f"On a phone that is two things fighting for the same corner."
                )
    return clashes


# ---------------------------------------------------------------------------
# 7. THE KEYBOARD PROBE
#
# An open iOS keyboard leaves roughly 420px of a 844px iPhone. The register
# journey asks one question per screen and its Continue control is the only way
# forward, so a Continue that lands under the keyboard is a dead end rather
# than a cosmetic fault. The probe cuts the viewport to 420, focuses the first
# input, and asserts two things: the focused field is not under the header, and
# Continue is in view or one scroll away.
KEYBOARD_HEIGHT = 420
KEYBOARD_ROUTE = "/register/investor"
KEYBOARD_WIDTH = 390


def keyboard_probe(browser, base: str, failures: list[str]) -> None:
    ctx = browser.new_context(
        viewport={"width": KEYBOARD_WIDTH, "height": KEYBOARD_HEIGHT},
        is_mobile=True, has_touch=True, device_scale_factor=3,
    )
    page = ctx.new_page()
    page.goto(f"{base}{KEYBOARD_ROUTE}", wait_until="networkidle")
    page.wait_for_timeout(600)
    where = f"keyboard probe {KEYBOARD_ROUTE} @ {KEYBOARD_WIDTH}x{KEYBOARD_HEIGHT}"

    field = page.locator("input:not([type=hidden])").first
    if field.count() == 0:
        failures.append(f"{where}: no input on the route, so this probe proved nothing.")
        ctx.close()
        return
    field.focus()
    page.wait_for_timeout(200)

    reading = page.evaluate(
        """
        () => {
          const bar = document.querySelector('header');
          const barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
          const focused = document.activeElement;
          const f = focused ? focused.getBoundingClientRect() : null;
          const buttons = [...document.querySelectorAll('button, a[href]')]
            .filter((el) => /continue|next|create|save|submit/i.test(
              (el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')));
          const go = buttons[0] || null;
          const g = go ? go.getBoundingClientRect() : null;
          return {
            barBottom,
            focusedTag: focused ? focused.tagName.toLowerCase() : '(none)',
            focusedName: focused ? (focused.getAttribute('name') || '') : '',
            focusedTop: f ? f.top : null,
            focusedBottom: f ? f.bottom : null,
            focusedFontSize: focused ? parseFloat(getComputedStyle(focused).fontSize) : 0,
            goLabel: go ? (go.textContent || '').trim().slice(0, 30) : '(none)',
            goTop: g ? g.top : null,
            goBottom: g ? g.bottom : null,
            goHeight: g ? g.height : null,
            goFixed: go ? getComputedStyle(go.closest('[data-mobile-bar]') || go).position : '',
            vh: innerHeight,
            scrollable: document.documentElement.scrollHeight - innerHeight,
          };
        }
        """
    )

    inView = (
        reading["goTop"] is not None
        and reading["goTop"] < reading["vh"]
        and reading["goBottom"] > reading["barBottom"]
    )
    reachable = inView
    afterOne = None
    if not inView:
        # 415c, rel415b MINOR 1: this was the fourth bare scroll left in the
        # file after 415b's "this is the last of the four" (above), a
        # `scrollBy` under the same `scroll-behavior: smooth` that made the
        # other three unreliable. `scroll_to` polls to a confirmed resting
        # position instead of guessing at one with a fixed wait.
        target = page.evaluate("() => window.scrollY + innerHeight - 80")
        scroll_to(page, target)
        afterOne = page.evaluate(
            """
            () => {
              const b = [...document.querySelectorAll('button, a[href]')]
                .filter((el) => /continue|next|create|save|submit/i.test(
                  (el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')))[0];
              if (!b) return null;
              const r = b.getBoundingClientRect();
              return { top: r.top, bottom: r.bottom, vh: innerHeight };
            }
            """
        )
        reachable = bool(afterOne and afterOne["top"] < afterOne["vh"] and afterOne["bottom"] > 0)

    print(
        f"keyboard  {KEYBOARD_ROUTE} @ {KEYBOARD_WIDTH}x{KEYBOARD_HEIGHT}  "
        f"bar_bottom={reading['barBottom']:.0f}  "
        f"focused=<{reading['focusedTag']} name={reading['focusedName']!r}> "
        f"top={reading['focusedTop']:.0f} font={reading['focusedFontSize']:g}px  "
        f"go={reading['goLabel']!r} top={reading['goTop'] if reading['goTop'] is None else round(reading['goTop'])} "
        f"pos={reading['goFixed']}  in_view={'yes' if inView else 'no'}  "
        f"after_one_scroll={'yes' if reachable else 'NO'}"
    )

    if reading["focusedTop"] is not None and reading["focusedTop"] < reading["barBottom"] - 1:
        failures.append(
            f"{where}: the focused field's top is at {reading['focusedTop']:.0f}, under a bar "
            f"whose bottom is at {reading['barBottom']:.0f}. A sticky header that covers the "
            f"field somebody is typing into is worse than no header."
        )
    if reading["focusedFontSize"] < CONTROL_MIN_PX - 0.01:
        failures.append(
            f"{where}: the focused control is {reading['focusedFontSize']:g}px. iOS zooms the "
            f"page into anything under {CONTROL_MIN_PX:g}px and does not zoom back out."
        )
    if reading["goTop"] is None:
        failures.append(f"{where}: no Continue-shaped control found on the route at all.")
    elif not reachable:
        failures.append(
            f"{where}: the Continue control is neither in view nor reachable with one scroll "
            f"({afterOne})."
        )
    ctx.close()


# ---------------------------------------------------------------------------
# 8. THE DRAWER BACKDROP PROBE (rel413b MIN-6)
#
# Wave 413 asserted the drawer's geometry, its focus trap, its scroll lock,
# Escape and the Close control. It never pressed the backdrop, so the one path
# out of the menu that a thumb actually takes was proved by reading the code.
def drawer_probe(browser, base: str, failures: list[str]) -> None:
    ctx = browser.new_context(
        viewport={"width": 390, "height": 844},
        is_mobile=True, has_touch=True, device_scale_factor=3,
    )
    page = ctx.new_page()
    page.goto(f"{base}/", wait_until="networkidle")
    page.wait_for_timeout(500)
    where = "drawer backdrop probe / @ 390"

    trigger = page.locator('button[aria-controls="site-drawer"]')
    if trigger.count() == 0:
        failures.append(f"{where}: no drawer trigger found.")
        ctx.close()
        return
    trigger.click()
    page.wait_for_selector("#site-drawer", timeout=4000)
    page.wait_for_timeout(350)

    before = page.evaluate(
        """
        () => {
          const scrim = document.querySelector('.drawer-scrim');
          const panel = document.querySelector('#site-drawer');
          const r = scrim ? scrim.getBoundingClientRect() : null;
          const p = panel ? panel.getBoundingClientRect() : null;
          return {
            scrim: scrim ? scrim.tagName : '(none)',
            scrimHidden: scrim ? scrim.getAttribute('aria-hidden') : '(none)',
            scrimBox: r ? [Math.round(r.width), Math.round(r.height)] : null,
            panelBox: p ? [Math.round(p.width), Math.round(p.height)] : null,
            // A point on the scrim and clear of the panel: the left edge of
            // the screen, halfway down.
            topAt: (() => { const e = document.elementFromPoint(12, 400);
              return e ? e.className || e.tagName : '(none)'; })(),
          };
        }
        """
    )
    # Press the backdrop itself, at a point the panel does not cover.
    page.mouse.click(12, 400)
    page.wait_for_timeout(400)
    after = page.evaluate(
        """
        () => ({
          panel: !!document.querySelector('#site-drawer'),
          scrim: !!document.querySelector('.drawer-scrim'),
          focus: document.activeElement
            ? (document.activeElement.getAttribute('aria-controls') || document.activeElement.tagName)
            : '(none)',
          expanded: (() => { const t = document.querySelector('button[aria-controls="site-drawer"]');
            return t ? t.getAttribute('aria-expanded') : '(none)'; })(),
          bodyOverflow: getComputedStyle(document.body).overflow,
        })
        """
    )

    print(
        f"drawer    backdrop press @ 390  scrim=<{before['scrim']} "
        f"aria-hidden={before['scrimHidden']}> {before['scrimBox']}  "
        f"panel={before['panelBox']}  topmost_at(12,400)={before['topAt']!r}  "
        f"-> panel_gone={'yes' if not after['panel'] else 'NO'}  "
        f"scrim_gone={'yes' if not after['scrim'] else 'NO'}  "
        f"focus_returned_to={after['focus']!r}  aria-expanded={after['expanded']}  "
        f"body_overflow={after['bodyOverflow']!r}"
    )

    if before["scrimHidden"] != "true":
        failures.append(
            f"{where}: the backdrop's aria-hidden is {before['scrimHidden']!r}, not 'true'. "
            f"rel413b MIN-6 asked for it to say what it is rather than leave it inferred."
        )
    if after["panel"] or after["scrim"]:
        failures.append(
            f"{where}: pressing the backdrop did not close the drawer "
            f"(panel present: {after['panel']}, scrim present: {after['scrim']})."
        )
    if after["expanded"] != "false":
        failures.append(f"{where}: aria-expanded is {after['expanded']!r} after closing.")
    if after["focus"] != "site-drawer":
        failures.append(
            f"{where}: focus went to {after['focus']!r} rather than back to the trigger."
        )
    if after["bodyOverflow"] == "hidden":
        failures.append(f"{where}: the body scroll lock was not released.")
    ctx.close()


# ---------------------------------------------------------------------------
# 9. THE PICKER PROBE (rel414 MAJ-2)
#
# Below 1024px the demand map has ONE control. The 137 district polygons are
# `aria-hidden`, carry no tab stop and have pointer events off, so the native
# `<select>` beneath the map is the whole of the interface. It was declared
# INSIDE `DemandMap`, beside the hooks, which makes a new component type on
# every render: React cannot match it against the last one, so it unmounted the
# node holding focus and mounted a fresh one on every change, and
# `document.activeElement` fell back to the body. In Chromium a closed select
# fires `change` on an arrow key, so a keyboard visitor lost the control
# mid-selection rather than after one.
#
# The probe is the shape of the bug: press a key, and assert the control is
# still there afterwards AND that the press did what it was for.
PICKER_ROUTE = "/"
PICKER_WIDTH = 390


def picker_probe(browser, base: str, failures: list[str]) -> None:
    ctx = browser.new_context(
        viewport={"width": PICKER_WIDTH, "height": 844},
        is_mobile=True, has_touch=True, device_scale_factor=3,
    )
    page = ctx.new_page()
    page.goto(f"{base}{PICKER_ROUTE}", wait_until="networkidle")
    page.wait_for_timeout(600)
    where = f"picker probe {PICKER_ROUTE} @ {PICKER_WIDTH}"

    picker = page.locator("select[data-authority-picker]").first
    if picker.count() == 0:
        failures.append(
            f"{where}: no authority picker on the page. Below 1024px it is the only "
            f"control the demand map has."
        )
        ctx.close()
        return
    picker.scroll_into_view_if_needed()
    page.wait_for_timeout(250)
    picker.focus()
    page.wait_for_timeout(150)

    read = """
        () => {
          const select = document.querySelector('select[data-authority-picker]');
          const panel = select ? select.closest('aside, [aria-live]') : null;
          const active = document.activeElement;
          return {
            value: select ? select.value : null,
            name: select ? select.options[select.selectedIndex].text : null,
            focus: active ? (active.tagName.toLowerCase() +
              (active.hasAttribute('data-authority-picker') ? '[data-authority-picker]' : ''))
              : '(none)',
            isPicker: !!(active && active.hasAttribute &&
              active.hasAttribute('data-authority-picker')),
            // ⚠ THE READOUT WITHOUT THE PICKER IN IT. The panel's own
            // textContent begins with all eighteen <option> labels, so a
            // slice of it never reaches the figures and would never move.
            figures: panel
              ? (() => {
                  const copy = panel.cloneNode(true);
                  copy.querySelectorAll('select').forEach((s) => s.remove());
                  return (copy.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 140);
                })()
              : null,
          };
        }
    """
    before = page.evaluate(read)
    # A keyboard change, which is what a closed select answers to.
    page.keyboard.press("ArrowDown")
    page.wait_for_timeout(400)
    after = page.evaluate(read)

    print(
        f"picker    {PICKER_ROUTE} @ {PICKER_WIDTH}  before=({before['name']!r}, "
        f"focus={before['focus']!r})  ArrowDown  ->  after=({after['name']!r}, "
        f"focus={after['focus']!r})  value_moved="
        f"{'yes' if before['value'] != after['value'] else 'NO'}  figures_moved="
        f"{'yes' if before['figures'] != after['figures'] else 'NO'}"
    )

    if not before["isPicker"]:
        failures.append(f"{where}: the select did not take focus at all.")
    if not after["isPicker"]:
        failures.append(
            f"{where}: after one keyboard change focus is on {after['focus']!r} rather "
            f"than the select. The control a phone visitor is using was destroyed under "
            f"them, which is what a component declared inside its parent does."
        )
    if before["value"] == after["value"]:
        failures.append(
            f"{where}: the value did not move on ArrowDown, so this probe proved nothing."
        )
    if before["figures"] == after["figures"]:
        failures.append(
            f"{where}: the selected area's figures did not change with the selection "
            f"({after['figures']!r})."
        )
    ctx.close()


# ---------------------------------------------------------------------------
# 10. THE BAR-OVER-FIELD PROBE, AND THE SUCCESS STATE (rel414 MIN-10, MIN-11)
#
# Rule 7 is "sticky things behave", and the shape of the thing it is about is a
# bar at the foot of the screen resting on the field somebody is typing into.
# Wave 414's keyboard probe focused the FIRST input, at the top of the panel,
# and asserted only that it was not under the HEADER, so the bottom bar was
# never tested against anything. This focuses the LAST field of the account
# panel and the LAST option of a long survey question, both with the keyboard
# region simulated at 420px of viewport, and asserts the focused box and the
# bar's box do not meet.
#
# AND IT WALKS THROUGH TO THE SUCCESS STATE, which build item 3 ends with and
# nothing measured. The two registration endpoints are STUBBED here: this gate
# serves a static build with no backend, and the assertion is about what the
# browser does with the panel rather than about what a server returns. Nothing
# in the component is mocked; the journey is driven through its own controls.
BAR_HEIGHT = 420
BAR_ROUTE = "/register/investor"
BAR_WIDTH = 390


def stub_registration(page) -> None:
    page.route(
        "**/public/registration",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"status": "pending_activation", "registration_token": "wave414b"}',
        ),
    )
    page.route(
        "**/public/registration/preferences",
        lambda route: route.fulfill(
            status=200, content_type="application/json", body='{"status": "saved"}'
        ),
    )


BOXES = """
() => {
  const bar = document.querySelector('.registration-actions');
  const b = bar ? bar.getBoundingClientRect() : null;
  const active = document.activeElement;
  const a = active ? active.getBoundingClientRect() : null;
  const label = active && active.closest ? active.closest('label') : null;
  const l = label ? label.getBoundingClientRect() : null;
  return {
    bar: b ? { top: b.top, bottom: b.bottom, height: b.height } : null,
    barPosition: bar ? getComputedStyle(bar).position : null,
    focused: active ? active.tagName.toLowerCase() +
      (active.id ? '#' + active.id : '') +
      (active.getAttribute('value') ? '[' + active.getAttribute('value').slice(0, 20) + ']' : '')
      : '(none)',
    box: a ? { top: a.top, bottom: a.bottom } : null,
    labelBox: l ? { top: l.top, bottom: l.bottom } : null,
    margin: active ? getComputedStyle(active).scrollMarginBottom : null,
    vh: innerHeight,
  };
}
"""


def assert_clear_of_bar(page, failures, where, what):
    read = page.evaluate(BOXES)
    if read["bar"] is None:
        failures.append(f"{where}: no sticky action bar on the panel, so nothing was tested.")
        return read
    box = read["labelBox"] or read["box"]
    if box is None:
        failures.append(f"{where}: nothing has focus, so nothing was tested.")
        return read
    print(
        f"bar/field {what:<34} focused={read['focused']!r} "
        f"box=({box['top']:.0f}..{box['bottom']:.0f}) "
        f"bar=({read['bar']['top']:.0f}..{read['bar']['bottom']:.0f}, "
        f"h={read['bar']['height']:.0f}, {read['barPosition']})  "
        f"scroll-margin-bottom={read['margin']}  vh={read['vh']}  "
        f"clear={'yes' if box['bottom'] <= read['bar']['top'] + 0.5 else 'NO'}"
    )
    if box["bottom"] > read["bar"]["top"] + 0.5 and box["top"] < read["bar"]["bottom"]:
        failures.append(
            f"{where}: the focused {what} occupies {box['top']:.0f} to "
            f"{box['bottom']:.0f} and the sticky action bar occupies "
            f"{read['bar']['top']:.0f} to {read['bar']['bottom']:.0f}. The bar is over "
            f"the thing somebody is answering."
        )
    return read


def bar_probe(browser, base: str, failures: list[str]) -> None:
    ctx = browser.new_context(
        viewport={"width": BAR_WIDTH, "height": BAR_HEIGHT},
        is_mobile=True, has_touch=True, device_scale_factor=3,
    )
    page = ctx.new_page()
    stub_registration(page)
    page.goto(f"{base}{BAR_ROUTE}", wait_until="networkidle")
    page.wait_for_timeout(600)
    where = f"bar probe {BAR_ROUTE} @ {BAR_WIDTH}x{BAR_HEIGHT}"

    # (a) THE LAST FIELD OF THE ACCOUNT PANEL.
    last = page.locator("#confirmPassword")
    if last.count() == 0:
        failures.append(f"{where}: no confirm-password field, so the account panel moved.")
        ctx.close()
        return
    last.focus()
    page.wait_for_timeout(400)
    assert_clear_of_bar(page, failures, where, "account field")

    # Through the account step on its own controls.
    page.fill("#email", "wave414b@example.com")
    page.fill("#phone", "07700900123")
    page.fill("#password", "GateProbe2026")
    page.fill("#confirmPassword", "GateProbe2026")
    page.locator("form button[type=submit]").first.click()
    try:
        page.wait_for_selector(".registration-survey form fieldset", timeout=8000)
    except Exception:
        failures.append(f"{where}: the account step did not reach the survey.")
        ctx.close()
        return
    page.wait_for_timeout(600)

    # (b) THE LAST OPTION OF THE LONGEST QUESTION THIS ROLE ASKS.
    longest = 0
    for _ in range(12):
        options = page.locator(".registration-step label")
        count = options.count()
        longest = max(longest, count)
        if count >= 4:
            options.nth(count - 1).locator("input").first.focus()
            page.wait_for_timeout(400)
            assert_clear_of_bar(page, failures, where, f"survey option {count} of {count}")
            break
        page.locator("form button[type=submit]").first.click()
        page.wait_for_timeout(600)
    else:
        failures.append(
            f"{where}: no question with four or more options was reached (longest seen "
            f"{longest}), so the long-option case was not tested."
        )

    # (c) THE SUCCESS STATE, READABLE WITHOUT SCROLLING. Build item 3's last
    # clause, which nothing in wave 414 measured.
    finish = page.get_by_role("button", name="Finish for now")
    if finish.count() == 0:
        failures.append(f"{where}: no way to finish the journey from the survey.")
        ctx.close()
        return
    finish.first.click()
    ctx.close()


SUCCESS_WIDTH = 390
SUCCESS_HEIGHT = 844


def success_probe(browser, base: str, failures: list[str]) -> None:
    """The success state, at a whole phone screen rather than a keyboard one."""
    ctx = browser.new_context(
        viewport={"width": SUCCESS_WIDTH, "height": SUCCESS_HEIGHT},
        is_mobile=True, has_touch=True, device_scale_factor=3,
    )
    page = ctx.new_page()
    stub_registration(page)
    page.goto(f"{base}{BAR_ROUTE}", wait_until="networkidle")
    page.wait_for_timeout(600)
    where = f"success probe {BAR_ROUTE} @ {SUCCESS_WIDTH}x{SUCCESS_HEIGHT}"

    page.fill("#email", "wave414b@example.com")
    page.fill("#phone", "07700900123")
    page.fill("#password", "GateProbe2026")
    page.fill("#confirmPassword", "GateProbe2026")
    page.locator("form button[type=submit]").first.click()
    try:
        page.wait_for_selector(".registration-survey form fieldset", timeout=8000)
    except Exception:
        failures.append(f"{where}: the account step did not reach the survey.")
        ctx.close()
        return
    page.wait_for_timeout(500)
    finish = page.get_by_role("button", name="Finish for now")
    if finish.count() == 0:
        failures.append(f"{where}: no way to finish the journey from the survey.")
        ctx.close()
        return
    finish.first.click()
    try:
        page.wait_for_selector("p[role=status]", timeout=8000)
    except Exception:
        failures.append(f"{where}: the journey never reached its success state.")
        ctx.close()
        return
    page.wait_for_timeout(900)

    read = page.evaluate(
        """
        () => {
          const panel = document.querySelector('.registration-panel.registration-step');
          if (!panel) return null;
          const heading = panel.querySelector('h1');
          const message = panel.querySelector('p[role=status]');
          const action = panel.querySelector('a[href]');
          const box = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { top: Math.round(r.top), bottom: Math.round(r.bottom),
                     text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 34) };
          };
          const bar = document.querySelector('header');
          return {
            heading: box(heading), message: box(message), action: box(action),
            headerBottom: bar ? Math.round(bar.getBoundingClientRect().bottom) : 0,
            vh: innerHeight, scrollY: Math.round(window.scrollY),
          };
        }
        """
    )
    if read is None or not read["heading"]:
        failures.append(f"{where}: the success panel has no heading to measure.")
        ctx.close()
        return

    print(
        f"success   {BAR_ROUTE} @ {SUCCESS_WIDTH}x{SUCCESS_HEIGHT}  "
        f"scrollY={read['scrollY']}  "
        f"header_bottom={read['headerBottom']}  vh={read['vh']}  "
        f"heading={read['heading']['top']}..{read['heading']['bottom']} "
        f"{read['heading']['text']!r}  "
        f"message={read['message']['top']}..{read['message']['bottom']}  "
        f"action={read['action']['top']}..{read['action']['bottom']} "
        f"{read['action']['text']!r}"
    )

    # ⚠ AND scrollY IS ASSERTED, NOT MERELY READ. WAVE 415, rel414b MINOR 5.
    # The three boxes below are VIEWPORT-relative, so "inside the first
    # screen" is only what they mean at scrollY 0, and
    # `src/components/register/registration-flow.tsx` calls `scrollIntoView`
    # on the very state change this probe has just triggered. 414b read
    # `scrollY` into this dict and never referenced it again, so the probe
    # could have passed on a page that had scrolled the success state into
    # view rather than one that never needed to. This is the one line that
    # closes the gap between the assertion and the sentence beside it.
    if read["scrollY"] > 0.5:
        failures.append(
            f"{where}: the success state was reached at scrollY="
            f"{read['scrollY']}, so the page scrolled itself to show it. The "
            f"three boxes below are viewport-relative and only mean 'in the "
            f"first screen' at 0."
        )

    for name in ("heading", "message", "action"):
        part = read[name]
        if part is None:
            failures.append(f"{where}: the success state has no {name}.")
            continue
        if part["top"] < read["headerBottom"] - 1 or part["bottom"] > read["vh"] + 1:
            failures.append(
                f"{where}: the success state's {name} occupies {part['top']} to "
                f"{part['bottom']} against a first screen of {read['headerBottom']} to "
                f"{read['vh']}. Somebody who has just finished a seven-question journey "
                f"should not have to scroll to be told so."
            )
    ctx.close()


# ---------------------------------------------------------------------------
# 9. THE TIMING TABLE
#
# Lighthouse is the number the brief asks for and it runs here, so it is in the
# report. These are the same three metrics read by the browser itself under the
# same 4x CPU slowdown, which is what makes them comparable between runs on
# this machine rather than only between machines.
TIMING_ROUTES = ["/", "/the-problem", "/register/investor", "/partner-with-investor"]
TIMING_CPU_RATE = 4


def timings(browser, base: str) -> list[tuple]:
    rows = []
    for path in TIMING_ROUTES:
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True, has_touch=True, device_scale_factor=3,
        )
        page = ctx.new_page()
        cdp = ctx.new_cdp_session(page)
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": TIMING_CPU_RATE})
        # Slow 4G, the profile Lighthouse mobile uses.
        cdp.send("Network.enable")
        cdp.send(
            "Network.emulateNetworkConditions",
            {
                "offline": False,
                "latency": 150,
                "downloadThroughput": int(1.6 * 1024 * 1024 / 8),
                "uploadThroughput": int(750 * 1024 / 8),
            },
        )
        page.add_init_script(
            """
            (() => {
              window.__lcp = 0; window.__cls = 0; window.__inp = 0;
              try { new PerformanceObserver((l) => {
                for (const e of l.getEntries()) window.__lcp = Math.round(e.startTime);
              }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
              try { new PerformanceObserver((l) => {
                for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
              }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
              try { new PerformanceObserver((l) => {
                for (const e of l.getEntries())
                  window.__inp = Math.max(window.__inp, Math.round(e.duration));
              }).observe({ type: 'event', buffered: true, durationThreshold: 16 }); } catch (e) {}
            })();
            """
        )
        page.goto(f"{base}{path}", wait_until="networkidle")
        page.wait_for_timeout(1500)
        # One real interaction, so INP has something to report.
        try:
            page.locator("a[href], button").first.hover(timeout=2000)
            page.mouse.down()
            page.mouse.up()
        except Exception:
            pass
        # 415b, rel415 MAJOR 3: instant and polled, like everything else.
        # This sweep is a STIMULUS rather than a measurement, so it is not
        # asserted, but a bare animated scrollTo in a loop under a 4x CPU
        # throttle does not deliver the scroll it asks for, and a warm-up that
        # did not happen is a warm-up that teaches the timings nothing.
        reach = page.evaluate(
            "() => Math.max(0, Math.min(document.body.scrollHeight - innerHeight, 2400))"
        )
        resting = 0.0
        for y in range(0, int(reach) + 1, 300):
            resting = scroll_to(page, min(y, reach))
        page.wait_for_timeout(800)
        read = page.evaluate("() => [window.__lcp, window.__cls, window.__inp]")
        rows.append((path, read[0], read[1], read[2]))
        print(
            f"timing    {path:<26} LCP={read[0]:>5}ms  CLS={read[1]:.4f}  "
            f"INP={read[2]:>4}ms   (4x CPU, slow 4G, 390x844, "
            f"swept to {resting:.0f} of {reach:.0f})"
        )
        ctx.close()
    return rows


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser()
    parser.add_argument("--build", default=str(BUILD))
    parser.add_argument("--profiles", default="", help="comma-separated labels, e.g. 390,768")
    parser.add_argument("--pages", default="", help="comma-separated slugs")
    parser.add_argument("--timings-only", action="store_true")
    parser.add_argument("--no-timings", action="store_true")
    args = parser.parse_args()

    build = Path(args.build)
    if not (build / "index.html").exists():
        raise SystemExit(f"No build at {build}. Run: STATIC_BUILD=true bun run build")
    if not AXE.exists():
        raise SystemExit(f"No axe-core at {AXE}. Run: bun install")

    profiles = PROFILES
    if args.profiles:
        wanted = {p.strip() for p in args.profiles.split(",")}
        profiles = [p for p in PROFILES if p[0] in wanted]
    pages = PAGES
    if args.pages:
        wanted = {p.strip() for p in args.pages.split(",")}
        pages = [p for p in PAGES if p[1] in wanted]

    axe_source = AXE.read_text(encoding="utf-8")
    port = serve(build)
    base = f"http://127.0.0.1:{port}"
    OUT.mkdir(parents=True, exist_ok=True)

    failures: list[str] = []
    tally = {"shots": 0, "targets": 0, "targets_scrolled": 0, "small": 0, "tight": 0,
             "type": 0, "typebad": 0, "leadbad": 0, "measbad": 0, "headings": 0,
             "headbad": 0, "layers": 0, "layers_scrolled": 0, "clash": 0, "axe": 0,
             "overflow": 0, "narrowest": None, "narrow_by_profile": {},
             "logo_header": None, "logo_footer": None}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        if not args.timings_only:
            for path, slug in pages:
                for label, width, height in profiles:
                    ctx = browser.new_context(
                        viewport={"width": width, "height": height},
                        is_mobile=True, has_touch=True, device_scale_factor=2,
                    )
                    page = ctx.new_page()
                    page.goto(f"{base}{path}", wait_until="networkidle")
                    settle(page)
                    where = f"{slug} @ {label}"

                    # ⚠ AT THE TOP BEFORE THE SHUTTER, AND PROVED SO.
                    # A `sticky` bar paints where it is stuck, so a shot taken
                    # at scrollY=756 has the header 756px down the image and
                    # an empty strip where the site draws it. That is what
                    # `home-667x375.png` was, and the rel414 re-check read it
                    # as a possible missing header. `settle` no longer leaves
                    # the page anywhere; this says so in the failure list if
                    # it ever does again.
                    resting = to_top(page)
                    if resting > 0.5:
                        failures.append(
                            f"{where}: the page would not return to the top before the "
                            f"shot (scrollY={resting:.0f}). Everything measured from "
                            f"here, and the shot itself, would be about a scrolled page."
                        )

                    target = OUT / f"{slug}-{label}.png"
                    page.screenshot(path=str(target), full_page=True)

                    # A full-page screenshot walks the page, so the position is
                    # confirmed again after it. The first run of this gate read
                    # the home page's FIRST screen somewhere around the middle
                    # of it and reported a photograph from the ecosystem band
                    # as the hero. Everything below is measured from a known
                    # scroll or it is measured from nowhere.
                    to_top(page)
                    page.wait_for_timeout(250)

                    flow = page.evaluate(OVERFLOW)
                    audit = page.evaluate(AUDIT)

                    # AND THE FIXED LAYERS ARE READ TWICE, because the second
                    # reading is the one that can fail. The back-to-top
                    # control does not exist until two viewports of scroll, so
                    # at the top of the page there is never more than one
                    # fixed layer and the assertion is vacuous. Scrolled, the
                    # control is there, and so is anything else a wave adds to
                    # the bottom of the screen.
                    #
                    # ⚠ AND IT IS READ AT A CONFIRMED POSITION (415b, rel415
                    # MAJOR 3). This used to be a bare animated `scrollTo` of
                    # up to three viewports followed by a blind 350ms, so the
                    # scrolled half of this gate's target count was read
                    # wherever the smooth-scroll animation had got to. The
                    # target is computed and CLAMPED here rather than in the
                    # browser, because a page shorter than three viewports
                    # rests at its own maximum and a poll for the unclamped
                    # figure would never agree.
                    reach = page.evaluate(
                        "() => Math.max(0, Math.min(document.body.scrollHeight - "
                        "innerHeight, innerHeight * 3))"
                    )
                    assert_scrolled(page, reach, failures, f"{where}, scrolled")
                    scrolled = page.evaluate(AUDIT)
                    back = to_top(page)
                    if back > 0.5:
                        failures.append(
                            f"{where}: the page would not return to the top "
                            f"before axe ran, resting at scrollY={back:g}"
                        )

                    page.add_script_tag(content=axe_source)
                    violations = json.loads(json.dumps(page.evaluate(AXE_RUN)))

                    fits = flow["scrollWidth"] <= flow["innerWidth"]
                    small, tight = check_targets(audit["targets"], failures, where)
                    # ⚠ AND THE SCROLLED READING IS MEASURED TOO, which is
                    # what rel414 MIN-2 found missing. The back-to-top control
                    # does not exist until two viewports of scroll, so the one
                    # interactive element this wave MOVED was the one element
                    # whose hit area the gate never read. Anything a later
                    # wave puts behind a scroll is now measured with it.
                    small_s, tight_s = check_targets(
                        scrolled["targets"], failures, f"{where}, scrolled"
                    )
                    typebad = check_type(audit["type"], failures, where)
                    leadbad, measbad, narrowest = check_prose(
                        audit["type"], failures, where, assert_measure=label == NARROWEST
                    )
                    headbad = check_headings(audit["headings"], failures, where)
                    clash = check_layers(audit["layers"], failures, where)
                    clash += check_layers(scrolled["layers"], failures, f"{where}, scrolled")
                    chromed = chrome_or_static_404(page, failures, where)
                    bar = check_header_painted(page, failures, where) if chromed else {}
                    logo = check_logo(page, failures, where) if chromed else {}
                    to_top(page)

                    # THE SECTION THE BRIEF ASKED TO BE BOUNDED. Only the home
                    # page carries it at full size; the narrow embeds on
                    # /platform and /the-problem are a different readout.
                    if audit["demand"] is not None and slug == "home":
                        if audit["demand"] > DEMAND_MAX_PX:
                            failures.append(
                                f"{where}: the demand map's section is {audit['demand']}px "
                                f"tall, over the {DEMAND_MAX_PX}px this gate bounds it at. "
                                f"A band a reader cannot see either end of is a band they "
                                f"get lost inside."
                            )

                    # AND THE SHOT ITSELF IS READ, at the top, for the bar.
                    ink = first_ink_row(target, 2)
                    if chromed and (ink is None or ink > (bar.get("height") or 0) + 1):
                        failures.append(
                            f"{where}: the first ink in {target.name} is at "
                            f"{'nothing in the top 240px' if ink is None else 'y=%g' % ink}"
                            f", below a header that measures {bar.get('height')}px in the "
                            f"live page. The bar is not in its own shot."
                        )

                    lit = ", ".join(f"{k} {v:.3f}" for k, v in logo.items()) or "none"
                    column = f"{narrowest[0]:g}ch" if narrowest else "n/a"
                    band = (
                        f"  demand_section={audit['demand']}px "
                        f"({audit['demand'] / audit['vh']:.2f}vh)"
                        if audit["demand"] is not None
                        else ""
                    )
                    print(
                        f"{slug:<30} {label:>8}  "
                        f"scrollWidth={flow['scrollWidth']}/{flow['innerWidth']} "
                        f"{'ok' if fits else 'OVERFLOW'}  "
                        f"targets={len(audit['targets'])}+{len(scrolled['targets'])} scrolled"
                        f"(under44 {small + small_s}, tight {tight + tight_s})  "
                        f"type={len(audit['type'])}(under floor {typebad}, leading {leadbad}, "
                        f"measure {measbad})  "
                        f"headings={len(audit['headings'])}(breaking {headbad})  "
                        f"fixed={len(audit['layers'])}+{len(scrolled['layers'])} scrolled"
                        f"(overlapping {clash})  "
                        f"axe={len(violations)}  "
                        f"exempt={audit['exempt']}"
                    )
                    print(
                        f"    header h={bar.get('height')} top={bar.get('top')} "
                        f"{bar.get('position')} mark={bar.get('mark')} "
                        f"src={bar.get('src')!r}  first_ink=y{ink}  logo_L={lit}  "
                        f"narrowest_column={column}{band}"
                    )
                    if not fits:
                        for o in flow["offenders"]:
                            print(f"    over: {o['tag']}.{o['cls'][:40]} "
                                  f"left={o['left']} right={o['right']}")
                        failures.append(
                            f"{where}: horizontal overflow, scrollWidth {flow['scrollWidth']} "
                            f"> innerWidth {flow['innerWidth']}"
                        )
                    for v in violations:
                        failures.append(
                            f"{where}: axe {v['id']} ({v['impact']}) on {v['target']}: "
                            f"{v['detail']}"
                        )

                    if slug == "home":
                        first = page.evaluate(FIRST_SCREEN)
                        print(
                            f"    first screen ({first['vh']}px): "
                            f"photos={[p['src'] for p in first['photos']]} "
                            f"headlines={first['headlines'][:3]} "
                            f"actions={len(first['actions'])} divider={first['divider']}"
                        )
                        if not first["photos"]:
                            failures.append(
                                f"{where}: no photograph in the first viewport. The hero is "
                                f"three pictures and their three headlines; a first screen "
                                f"without one of them is not this hero."
                            )
                        if not first["headlines"]:
                            failures.append(f"{where}: no headline in the first viewport.")
                        if not first["actions"]:
                            failures.append(
                                f"{where}: no way on to the wait list in the first viewport. "
                                f"The role tiles ARE the call to action on this page."
                            )

                    tally["shots"] += 1
                    tally["targets"] += len(audit["targets"])
                    tally["targets_scrolled"] += len(scrolled["targets"])
                    tally["small"] += small + small_s
                    tally["tight"] += tight + tight_s
                    tally["type"] += len(audit["type"])
                    tally["typebad"] += typebad
                    tally["leadbad"] += leadbad
                    tally["measbad"] += measbad
                    tally["headings"] += len(audit["headings"])
                    tally["headbad"] += headbad
                    tally["layers"] += len(audit["layers"])
                    # TWO POPULATIONS, AND BOTH ARE COUNTED. rel414 MIN-3: the
                    # wave counted the top-of-page layers and asserted on the
                    # top AND the scrolled ones, so the 0 beside the 6 covered
                    # more layers than the 6 named.
                    tally["layers_scrolled"] += len(scrolled["layers"])
                    tally["clash"] += clash
                    tally["axe"] += len(violations)
                    tally["overflow"] += 0 if fits else 1
                    if narrowest is not None:
                        if (tally["narrowest"] is None
                                or narrowest[0] < tally["narrowest"][0]):
                            tally["narrowest"] = (narrowest[0], f"{where}: {narrowest[1]}")
                        seen_here = tally["narrow_by_profile"].get(label)
                        if seen_here is None or narrowest[0] < seen_here[0]:
                            tally["narrow_by_profile"][label] = (
                                narrowest[0], f"{where}: {narrowest[1]}"
                            )
                    for spot, value in logo.items():
                        key = "logo_" + spot
                        if tally[key] is None or value < tally[key][0]:
                            tally[key] = (value, where)
                    ctx.close()

            print()
            keyboard_probe(browser, base, failures)
            drawer_probe(browser, base, failures)
            picker_probe(browser, base, failures)
            bar_probe(browser, base, failures)
            success_probe(browser, base, failures)

        if not args.no_timings:
            print()
            timings(browser, base)
        browser.close()

    if not args.timings_only:
        narrow = tally["narrowest"]
        column = f"{narrow[0]:g}ch, {narrow[1]}" if narrow else "not measurable"
        print(
            f"\n{tally['shots']} shots in {OUT.relative_to(ROOT)}. "
            f"{tally['targets']} interactive targets measured at the top of the page "
            f"and {tally['targets_scrolled']} scrolled, "
            f"{tally['targets'] + tally['targets_scrolled']} in all, "
            f"{tally['small']} under {TARGET_MIN:g}x{TARGET_MIN:g} and {tally['tight']} "
            f"closer than {TARGET_GAP:g}px."
        )
        print(
            f"{tally['type']} type nodes measured, {tally['typebad']} under their size "
            f"floor, {tally['leadbad']} under a line box of {LEADING_MIN:g} and "
            f"{tally['measbad']} under {MEASURE_MIN_CHARS:g} characters to the line at "
            f"{NARROWEST}, where that floor binds. Narrowest column of the run: {column}."
        )
        for label, _w, _h in profiles:
            found = tally["narrow_by_profile"].get(label)
            if found is None:
                continue
            print(
                f"    narrowest column @ {label:>8}: {found[0]:g} characters  "
                f"({found[1]})" + ("  <- the floor binds here" if label == NARROWEST else "")
            )
        print(
            f"{tally['headings']} headings measured, {tally['headbad']} breaking a word. "
            f"{tally['layers']} fixed layers at the top of the page and "
            f"{tally['layers_scrolled']} scrolled, "
            f"{tally['layers'] + tally['layers_scrolled']} tested pairwise, "
            f"{tally['clash']} overlapping. "
            f"{tally['axe']} serious or critical axe violations. "
            f"{tally['overflow']} shots overflow."
        )
        header_low = tally["logo_header"]
        footer_low = tally["logo_footer"]
        print(
            "brand lockup, darkest box of the run: header "
            + (f"{header_low[0]:.3f} ({header_low[1]})" if header_low else "not found")
            + ", footer "
            + (f"{footer_low[0]:.3f} ({footer_low[1]})" if footer_low else "not found")
            + f", floor {LOGO_LUMINANCE_FLOOR:.2f}."
        )

    if failures:
        print(f"\n{len(failures)} FAILURE(S):")
        for failure in failures:
            print(f"  - {failure}")
        raise SystemExit(1)
    print("All assertions passed.")


if __name__ == "__main__":
    main()
