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
import json
import socketserver
import sys
import threading
from pathlib import Path

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
    """Scroll the page once so nothing is measured or photographed mid-reveal."""
    page.evaluate(
        "async () => { const step = innerHeight; "
        "for (let y = 0; y < document.body.scrollHeight; y += step) "
        "{ scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } "
        "scrollTo(0, 0); await new Promise(r => setTimeout(r, 200)); }"
    )
    page.wait_for_timeout(500)


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
      type.push({
        tag,
        control,
        cls: (el.getAttribute('class') || '').slice(0, 120),
        chars: words.length,
        size: Math.round(parseFloat(s.fontSize) * 100) / 100,
        leading: s.lineHeight === 'normal'
          ? 'normal'
          : Math.round((parseFloat(s.lineHeight) / parseFloat(s.fontSize)) * 100) / 100,
        text: (el.getAttribute('name') || el.textContent || '')
          .trim().replace(/\\s+/g, ' ').slice(0, 50),
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

  return { targets, exempt, type, layers, vw, vh };
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
        page.evaluate("() => scrollBy(0, innerHeight - 80)")
        page.wait_for_timeout(300)
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
        page.evaluate(
            "async () => { for (let y = 0; y < 2400; y += 300) "
            "{ scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } }"
        )
        page.wait_for_timeout(800)
        read = page.evaluate("() => [window.__lcp, window.__cls, window.__inp]")
        rows.append((path, read[0], read[1], read[2]))
        print(
            f"timing    {path:<26} LCP={read[0]:>5}ms  CLS={read[1]:.4f}  "
            f"INP={read[2]:>4}ms   (4x CPU, slow 4G, 390x844)"
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
    tally = {"shots": 0, "targets": 0, "small": 0, "tight": 0, "type": 0, "typebad": 0,
             "layers": 0, "clash": 0, "axe": 0, "overflow": 0}

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

                    flow = page.evaluate(OVERFLOW)
                    audit = page.evaluate(AUDIT)
                    target = OUT / f"{slug}-{label}.png"
                    page.screenshot(path=str(target), full_page=True)

                    page.add_script_tag(content=axe_source)
                    violations = json.loads(json.dumps(page.evaluate(AXE_RUN)))

                    fits = flow["scrollWidth"] <= flow["innerWidth"]
                    small, tight = check_targets(audit["targets"], failures, where)
                    typebad = check_type(audit["type"], failures, where)
                    clash = check_layers(audit["layers"], failures, where)

                    print(
                        f"{slug:<30} {label:>8}  "
                        f"scrollWidth={flow['scrollWidth']}/{flow['innerWidth']} "
                        f"{'ok' if fits else 'OVERFLOW'}  "
                        f"targets={len(audit['targets'])}(under44 {small}, tight {tight})  "
                        f"type={len(audit['type'])}(under floor {typebad})  "
                        f"fixed={len(audit['layers'])}(overlapping {clash})  "
                        f"axe={len(violations)}  "
                        f"exempt={audit['exempt']}"
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
                    tally["small"] += small
                    tally["tight"] += tight
                    tally["type"] += len(audit["type"])
                    tally["typebad"] += typebad
                    tally["layers"] += len(audit["layers"])
                    tally["clash"] += clash
                    tally["axe"] += len(violations)
                    tally["overflow"] += 0 if fits else 1
                    ctx.close()

            print()
            keyboard_probe(browser, base, failures)
            drawer_probe(browser, base, failures)

        if not args.no_timings:
            print()
            timings(browser, base)
        browser.close()

    if not args.timings_only:
        print(
            f"\n{tally['shots']} shots in {OUT.relative_to(ROOT)}. "
            f"{tally['targets']} interactive targets measured, {tally['small']} under "
            f"{TARGET_MIN:g}x{TARGET_MIN:g} and {tally['tight']} closer than {TARGET_GAP:g}px. "
            f"{tally['type']} type nodes measured, {tally['typebad']} under their floor. "
            f"{tally['layers']} fixed layers, {tally['clash']} overlapping. "
            f"{tally['axe']} serious or critical axe violations. "
            f"{tally['overflow']} shots overflow."
        )

    if failures:
        print(f"\n{len(failures)} FAILURE(S):")
        for failure in failures:
            print(f"  - {failure}")
        raise SystemExit(1)
    print("All assertions passed.")


if __name__ == "__main__":
    main()
