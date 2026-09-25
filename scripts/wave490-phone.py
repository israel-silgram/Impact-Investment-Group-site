#!/usr/bin/env python3
"""Wave 490: the phone defects, measured.

Wave 414 did the structural mobile pass: nothing overflows, every target is 44
by 44, type has a floor, the drawer and the sticky Continue bar work. What it
did not do was LOOK at the result on a phone. This gate is the list of things a
visitor sees that no assertion in 412, 413, 414, 415, 421 or 443 could see,
each one measured off the rendered pixels or the rendered boxes rather than off
the markup.

It runs every route at 360, 390, 414, 768, 667x375 and 1280, writes a full-page
shot per route per profile, and prints a number for each of the thirteen items
in the wave 490 brief. Nothing here replaces an earlier gate: all six of those
scripts re-run whole beside it.

THE FIVE RULES THIS FILE ADDS TO 414's EIGHT, and each is measured rather than
read off a class:

  1  WHAT LOADS, SHOWS. A tile on screen is a decoded image within 1.5s of
     arriving on screen on the slow 4G profile, or it is not a tile.
  2  NO EMPTY BANDS. Inside a section, no vertical run of more than 96 CSS px
     carries nothing but the section's own ground between two pieces of
     content. Measured off the screenshot's pixels, the way wave 412b measures
     the nodes axe returns as INCOMPLETE.
  3  NOTHING FLOATS OVER WORDS. A fixed control's box meets no text node's box
     and no other control's box, at any width, after two viewports of scroll.
  4  A PHONE READS, IT DOES NOT CHASE. Nothing a reader needs to read moves
     under its own power below `md`.
  5  TYPE FLOORS reach inside a paragraph. 414 measured `p` and `li`; a `span`
     inside one of them carries its own font-size and was never read.

Usage:
    python scripts/wave490-phone.py                    # assert at this head
    python scripts/wave490-phone.py --mode before      # record the base
"""

from __future__ import annotations

import argparse
import functools
import http.server
import socketserver
import sys
import threading
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
OUT = ROOT / "docs" / "screenshots" / "wave490"
AXE = ROOT / "node_modules" / "axe-core" / "axe.min.js"

# (label, width, height, is_phone). 1280 is the desktop control and is NOT
# emulated as a touch device, because the thing being held still there is the
# desktop composition and the desktop composition is the hover one.
PROFILES = [
    ("360", 360, 800, True),
    ("390", 390, 844, True),
    ("414", 414, 896, True),
    ("768", 768, 1024, True),
    ("667x375", 667, 375, True),
    ("1280", 1280, 900, False),
]

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

# ── Rule 2, the empty-band scan ──────────────────────────────────────────────
#
# 96 CSS px, which is CLAUDE.md's own desktop section padding and nearly twice
# its mobile one: a run of background taller than the space the brand system
# puts AROUND a section is a hole INSIDE one. A pixel is "ground" when every
# channel is within 6 of the section's modal colour, which is the tolerance a
# WebP-encoded flat fill actually holds.
EMPTY_RUN_MAX = 96
GROUND_TOLERANCE = 6

# ── Item 1, the decode budget ────────────────────────────────────────────────
DECODE_BUDGET_MS = 1500

# ── Item 3, the peeking headline ─────────────────────────────────────────────
#
# "No glyph darker than 70 per cent of the ground." The ground is read from the
# six rows immediately BELOW the caption, in the same column band, because that
# is the page's own ground at that point on the screen and the hero's ground is
# not flat white: it carries a street photograph at a fifth of its strength.
PEEK_INK_FLOOR = 0.70
PEEK_GROUND_ROWS = 6

# ── Item 4, the type floors, reaching inside a paragraph ─────────────────────
SPAN_BODY_MIN_PX = 15.0
SPAN_CAPTION_MIN_PX = 13.0
SPAN_LABEL_MIN_PX = 12.0
# Below this width the floors bind. `lg` is 1024 in this project's Tailwind.
TYPE_FLOOR_BELOW = 1024

# ── Item 2, the two faces ────────────────────────────────────────────────────
FACE_TAIL_MAX = 48

# ── Item 9, the cards that were equalised for a desktop row ──────────────────
CARD_TAIL_MAX = 32

# ── Item 6, the tap target on the capture ────────────────────────────────────
TARGET_MIN = 44.0
EPSILON = 0.05


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
    """One sweep, instant, so nothing is photographed mid-reveal.

    Identical to `settle` in scripts/wave414-mobile.py, including the reason it
    is instant: `html` carries `scroll-behavior: smooth` and an animated
    scrollTo leaves the shutter open at whatever position the animation had
    reached. Four gates, one settle.
    """
    page.evaluate(
        "async () => { const step = innerHeight; "
        "for (let y = 0; y < document.body.scrollHeight; y += step) "
        "{ scrollTo({ top: y, behavior: 'instant' }); "
        "await new Promise(r => setTimeout(r, 120)); } }"
    )
    page.wait_for_timeout(300)


def scroll_to(page, y: float) -> float:
    for _ in range(12):
        page.evaluate(f"() => scrollTo({{ top: {y}, behavior: 'instant' }})")
        page.wait_for_timeout(100)
        if abs(page.evaluate("() => window.scrollY") - y) <= 0.5:
            return float(y)
    return page.evaluate("() => window.scrollY")


def to_top(page) -> float:
    return scroll_to(page, 0)


# ---------------------------------------------------------------------------
# The shared JavaScript preamble. Every probe below needs the same three
# answers: is this element rendered, where does its text actually sit, and what
# is inside its box. Declared once and prefixed on to each probe rather than
# repeated, because three copies of "is this visible" is three chances to
# disagree with each other.
PRELUDE = """
  const seen = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (parseFloat(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1;
  };
  const hidden = (el) => {
    for (let n = el; n; n = n.parentElement) {
      if (n.getAttribute && n.getAttribute('aria-hidden') === 'true') return true;
      if (n.hasAttribute && n.hasAttribute('inert')) return true;
    }
    return false;
  };
  // EVERY TEXT RECT IN A SUBTREE, TAKEN OFF RANGES RATHER THAN OFF ELEMENTS.
  // An element's box is its LINE BOX, which on a centred or a wrapped run is
  // wider than the ink in it; a Range over the text node gives the rectangle
  // the glyphs are actually in, which is what "floats over words" is about.
  const textRects = (root) => {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      const parent = n.parentElement;
      if (!parent || !seen(parent) || hidden(parent)) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.width < 1 || r.height < 1) continue;
        out.push({ x: r.left, y: r.top, r: r.right, b: r.bottom,
                   text: n.nodeValue.trim().slice(0, 40) });
      }
    }
    return out;
  };
  const meets = (a, b) => !(a.r <= b.x || b.r <= a.x || a.b <= b.y || b.b <= a.y);
"""


def js(body: str) -> str:
    return "() => {" + PRELUDE + body + "}"


# ── The section boxes rule 2 is scanned inside ───────────────────────────────
#
# A "section" is what the brand system calls one: a <section>, or a direct
# child band of <main> where a route builds its bands out of <div>. Both are
# collected; a run of background counted twice is still one run, so the scan
# below de-duplicates by the run it finds rather than by the box it found it in.
SECTIONS = js("""
  const boxes = [];
  const main = document.querySelector('main') || document.body;
  const nodes = new Set([...main.querySelectorAll('section'), ...main.children]);
  for (const el of nodes) {
    if (!seen(el)) continue;
    // ⚠ A BOX THAT CONTAINS SECTIONS IS NOT A SECTION, IT IS THE PAGE.
    //
    // Several routes wrap every band in one <div> under <main>, and taking
    // that wrapper as a section makes the space BETWEEN two bands an
    // "interior" run: the first version of this scan reported 135px inside
    // `main` on the partner pages, cropped and looked at, and it is the foot
    // of one band's padding meeting the head of the next one's, which is the
    // rhythm `CLAUDE.md` asks for. A band that holds a section is skipped and
    // the sections inside it are measured on their own.
    if (el.querySelector('section')) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 120) continue;
    boxes.push({
      id: el.tagName.toLowerCase() +
        (el.getAttribute('id') ? '#' + el.getAttribute('id') : '') +
        (el.getAttribute('aria-labelledby') ? '@' + el.getAttribute('aria-labelledby') : ''),
      x: Math.max(0, r.left + scrollX),
      y: r.top + scrollY,
      w: Math.min(r.width, document.documentElement.clientWidth),
      h: r.height,
    });
  }
  return boxes;
""")


# ── ITEM 2. The two faces of the home page's purpose section ─────────────────
FACES = js("""
  const section = document.querySelector('section[aria-labelledby="mission-heading"]');
  if (!section) return null;
  const sr = section.getBoundingClientRect();
  const faces = [...section.children].map((face) => {
    const fr = face.getBoundingClientRect();
    const rects = textRects(face);
    const bottom = rects.length ? Math.max.apply(null, rects.map((t) => t.b)) : null;
    const s = getComputedStyle(face);
    return {
      active: !face.hasAttribute('inert'),
      display: s.display,
      height: Math.round(fr.height * 100) / 100,
      textBottom: bottom === null ? null : Math.round(bottom * 100) / 100,
    };
  });
  const active = faces.filter((f) => f.active)[0] || faces[0];
  return {
    sectionHeight: Math.round(sr.height * 100) / 100,
    faces,
    tail: active && active.textBottom !== null
      ? Math.round((sr.bottom - active.textBottom) * 100) / 100
      : null,
  };
""")


# ── ITEM 4. The type floors, reaching inside a paragraph ─────────────────────
#
# 414 measured every `p`, `li`, `input`, `select` and `textarea`. It did not
# measure a `span` inside one, and a `span` carries its own font-size: the home
# page's three problem bullets are 12.5px spans inside `li`s, and every reading
# the old gate took on that list was of the `li`.
#
# ⚠ THE FOUR FLOORS ARE SHAPES, NOT SELECTORS, AND ONE OF THEM TIGHTENS 414.
#
# 414 sorted a `p` or an `li` by LENGTH: 60 characters or more is body at 15px,
# under it is a label at 12px. That rule is right about the elements it was
# written for and wrong about a run INSIDE one, because a bullet is short and
# is still a sentence somebody reads: "Suitable homes sit empty while demand
# grows" is 42 characters and was running at 12.5px under a floor that called
# it a label. So the classification here asks what the run IS:
#
#   A CONTROL'S OWN NAME is a label. A run whose text is the whole of the
#     accessible name of the `a`, `button`, `summary` or `label` it sits in is
#     that control's name, and the 44px target rule is what governs it.
#     A run that is ONE OF SEVERAL inside a control is copy inside a control
#     and answers to the same floor as copy anywhere else: the flip bar's
#     "The same picture, joined up." is a sentence that happens to sit on a
#     button, not the button's name.
#   AN EYEBROW is uppercase and tracked at 0.1em or more. 12px, the smallest
#     size the brand system declares and the one CLAUDE.md names.
#   A CAPTION is inside a `figcaption` or carries `source-line` in a class.
#     13px, which is the brief's floor for a caption and a source line.
#   MONO is a reference or a badge set in JetBrains Mono. 12px.
#   EVERYTHING ELSE is BODY at 15px when it is a CLAUSE: 20 characters or more
#     with a space in it. Under that it is a figure or a word somebody scans
#     ("111", "Media", "Legal") and it answers to the 12px label floor.
#
# A run with no rendered box of its own is not type: `sr-only` is a 1x1 clipped
# rectangle and measuring its font-size would be measuring nothing.
SPAN_CLAUSE_CHARS = 20

SPANS = js(r"""
  const out = [];
  const HOSTS = 'p, li, article, figcaption, dd, blockquote';
  const CONTROLS = 'a[href], button, summary, label, [role="button"]';
  document.querySelectorAll(HOSTS).forEach((host) => {
    host.querySelectorAll('span, b, strong, em, i, small, a, code, li').forEach((el) => {
      if (!seen(el) || hidden(el)) return;
      const box = el.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) return;
      let own = '';
      for (const n of el.childNodes) {
        if (n.nodeType === Node.TEXT_NODE) own += n.nodeValue;
      }
      own = own.trim().replace(/\s+/g, ' ');
      if (!own) return;
      const control = el.closest(CONTROLS);
      // ⚠ AND A CONTROL'S NAME MAY CARRY AN `sr-only` TAIL. Three links on
      // /legal read "Verify on the ICO register" with "(opens in a new tab)"
      // clipped beside them, so a plain equality test said the visible run was
      // not the whole name and gave a 13px link label a 15px body floor. The
      // screen-reader tail is taken off before the comparison.
      let whole = '';
      if (control) {
        const clone = control.cloneNode(true);
        clone.querySelectorAll('.sr-only').forEach((n) => n.remove());
        whole = (clone.textContent || '').trim().replace(/\s+/g, ' ');
      }
      const isName = !!control && whole === own;
      const s = getComputedStyle(el);
      const size = parseFloat(s.fontSize);
      const tracking = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing) / size;
      const cls = el.getAttribute('class') || '';
      const eyebrow = s.textTransform === 'uppercase' && tracking >= 0.1;
      const caption = !!el.closest('figcaption') || /source-line|caption/.test(cls);
      const mono = /mono/i.test(s.fontFamily);
      const clause = own.length >= """ + str(SPAN_CLAUSE_CHARS) + r""" && own.indexOf(' ') !== -1;
      const kind = isName ? 'name'
        : eyebrow ? 'eyebrow'
        : caption ? 'caption'
        : mono ? 'mono'
        : clause ? 'body' : 'label';
      out.push({
        tag: el.tagName.toLowerCase(),
        kind: kind,
        size: Math.round(size * 100) / 100,
        cls: cls.slice(0, 120),
        text: own.slice(0, 46),
      });
    });
  });
  return out;
""")


# ── ITEM 5. The statistics ticker on /platform ───────────────────────────────
TICKER = js("""
  const lanes = [...document.querySelectorAll('[data-ticker="demand-figures"], .logo-marquee')];
  const lane = lanes.filter((el) =>
    (el.getAttribute('aria-label') || '').indexOf('housing demand') !== -1)[0];
  if (!lane) return null;
  const track = lane.querySelector('.logo-marquee__track');
  const items = track ? [...track.children] : [...lane.children];
  const vw = window.innerWidth;
  const rects = textRects(lane);
  let outside = 0;
  let worst = null;
  for (const t of rects) {
    if (t.x < -0.5 || t.r > vw + 0.5) { outside += 1; if (!worst) worst = t; }
  }
  let animated = 0;
  for (const el of [lane, ...lane.querySelectorAll('*')]) {
    const s = getComputedStyle(el);
    if (s.animationName && s.animationName !== 'none' &&
        s.animationPlayState !== 'paused' && parseFloat(s.animationDuration) > 0) animated += 1;
  }
  return {
    items: items.length,
    clones: items.filter((i) => i.getAttribute('data-clone') === 'true').length,
    strings: rects.length,
    outside: outside,
    worst: worst ? worst.text : null,
    animated: animated,
    trackWidth: Math.round((track || lane).getBoundingClientRect().width),
  };
""")


# ── ITEM 6. The character illustration behind the body copy on /platform ─────
GHOST = js("""
  const cards = [...document.querySelectorAll('[aria-live="polite"]')]
    .filter((c) => c.querySelector('img'));
  return cards.map((card) => {
    const cr = card.getBoundingClientRect();
    const cs = getComputedStyle(card);
    const pad = {
      x: cr.left + parseFloat(cs.paddingLeft) - 0.5,
      y: cr.top + parseFloat(cs.paddingTop) - 0.5,
      r: cr.right - parseFloat(cs.paddingRight) + 0.5,
      b: cr.bottom - parseFloat(cs.paddingBottom) + 0.5,
    };
    const img = card.querySelector('img');
    const ir = img.getBoundingClientRect();
    const box = { x: ir.left, y: ir.top, r: ir.right, b: ir.bottom };
    const clashes = textRects(card).filter((t) => meets(box, t));
    return {
      minHeight: cs.minHeight,
      cardHeight: Math.round(cr.height),
      img: { x: Math.round(ir.left), y: Math.round(ir.top),
             w: Math.round(ir.width), h: Math.round(ir.height),
             opacity: Number(getComputedStyle(img).opacity) },
      insidePadding: box.x >= pad.x && box.y >= pad.y && box.r <= pad.r && box.b <= pad.b,
      clashes: clashes.length,
      firstClash: clashes.length ? clashes[0].text : null,
    };
  });
""")


# ── ITEM 7. The product capture, and the control that opens it ───────────────
CAPTURE = js("""
  const figures = [...document.querySelectorAll('figure')]
    .filter((f) => (f.querySelector('img') || {}).src &&
                    f.querySelector('img').src.indexOf('platform-finder') !== -1);
  if (!figures.length) return null;
  const fig = figures[0];
  const img = fig.querySelector('img');
  const trigger = fig.querySelector('button') || (img.closest('button'));
  const tr = trigger ? trigger.getBoundingClientRect() : null;
  return {
    rendered: Math.round(img.getBoundingClientRect().width),
    natural: img.naturalWidth,
    currentSrc: (img.currentSrc || img.src).split('/').pop(),
    hasTrigger: !!trigger,
    triggerW: tr ? Math.round(tr.width * 100) / 100 : null,
    triggerH: tr ? Math.round(tr.height * 100) / 100 : null,
    triggerName: trigger
      ? (trigger.getAttribute('aria-label') || (img.getAttribute('alt') || '')).slice(0, 60)
      : null,
  };
""")


# ── ITEM 8. Every fixed control, against every word and every other control ──
#
# 414 tested the fixed layers against EACH OTHER. It never tested one against
# the text underneath it, which is how a 44px circle sat on the left end of
# every line at the foot of the viewport on every route without a single
# assertion noticing.
FLOATERS = js("""
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const layers = [];
  document.querySelectorAll('body *').forEach((el) => {
    const s = getComputedStyle(el);
    if (s.position !== 'fixed') return;
    if (!seen(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 100) return;
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return;
    // A scrim is a deliberate cover and the panel it belongs to is the content.
    if ((el.getAttribute('class') || '').indexOf('drawer-scrim') !== -1) return;
    layers.push({
      id: el.tagName.toLowerCase() +
        (el.getAttribute('class') ? '.' + el.getAttribute('class').split(/\\s+/)[0] : ''),
      x: r.left, y: r.top, r: r.right, b: r.bottom,
      w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100,
      right: Math.round((vw - r.right) * 100) / 100,
      bottom: Math.round((vh - r.bottom) * 100) / 100,
    });
  });
  const main = document.querySelector('main') || document.body;
  const words = textRects(main).filter((t) => t.b > 0 && t.y < vh);
  const controls = [];
  document.querySelectorAll('a[href], button, input, select, textarea, summary')
    .forEach((el) => {
      if (!seen(el) || hidden(el)) return;
      const s = getComputedStyle(el);
      if (s.position === 'fixed') return;
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= vh) return;
      controls.push({ x: r.left, y: r.top, r: r.right, b: r.bottom,
                      text: (el.getAttribute('aria-label') || el.textContent || '')
                        .trim().replace(/\\s+/g, ' ').slice(0, 34) });
    });
  const clashes = [];
  for (const layer of layers) {
    for (const w of words) {
      if (meets(layer, w)) clashes.push({ layer: layer.id, kind: 'text', what: w.text });
    }
    for (const c of controls) {
      if (meets(layer, c)) clashes.push({ layer: layer.id, kind: 'control', what: c.text });
    }
  }
  return { layers: layers, words: words.length, controls: controls.length,
           clashes: clashes.slice(0, 12), clashCount: clashes.length };
""")


# ── ITEM 9. The cards equalised for a desktop row ────────────────────────────
#
# The tail is measured from the LAST INK in the card to the card's own bottom
# edge, less the card's own bottom padding, so a card is not failed for having
# the padding the brand system gives it. What is left over is the hole.
CARDS = js("""
  const out = [];
  const pick = (sel) => [...document.querySelectorAll(sel)];
  const cards = [
    ...pick('article').map((c) => ({ el: c, what: 'director' })),
    ...pick('ol > li > div.panel-deep').map((c) => ({ el: c, what: 'chain' })),
  ];
  for (const { el, what } of cards) {
    if (!seen(el)) continue;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const rects = textRects(el);
    if (!rects.length) continue;
    const ink = Math.max.apply(null, rects.map((t) => t.b));
    // Artwork counts as content: a card with a character in its corner is not
    // an empty card, and failing it for one would be failing the design.
    let art = ink;
    el.querySelectorAll('img, svg').forEach((g) => {
      const gr = g.getBoundingClientRect();
      if (gr.width >= 8 && gr.height >= 8) art = Math.max(art, gr.bottom);
    });
    const pad = parseFloat(s.paddingBottom) || 0;
    out.push({
      what: what,
      top: Math.round(r.top + scrollY),
      height: Math.round(r.height),
      minHeight: s.minHeight,
      padBottom: Math.round(pad),
      tailInk: Math.round((r.bottom - ink - pad) * 100) / 100,
      tailAny: Math.round((r.bottom - art - pad) * 100) / 100,
      label: rects[0].text,
    });
  }
  return out;
""")


# ── ITEM 10. Pills whose role and verb must both stay readable ───────────────
#
# ⚠ RULE 7 HAS TWO HALVES AND THE FIRST ONE ALREADY PASSES.
#
# The brief describes the verb itself splitting. Measured at `origin/main`
# `f61b3b8` on 25 September 2026 it does not: "deliver it" renders in ONE rect
# at 360, 390 and 414. What the pill actually does is the other half of the
# same rule. The pill is `inline-flex` with `align-items: baseline` and NO
# wrap, so when "Care & Support Providers" runs out of room it wraps INSIDE
# its own `<b>` and the verb stays on the first baseline beside it:
#
#     Care & Support   deliver it
#     Providers
#
# The pill goes from 43px tall to 68 and the verb sits in a column of its own
# with a justified-looking gap between, which is the composition the brief
# describes and the one rule 7 rules out. So the assertion is both halves: the
# verb renders on one line, AND where the role has wrapped the verb is below
# it rather than beside its first line.
PILLS = js("""
  const out = [];
  document.querySelectorAll('b').forEach((role) => {
    const pill = role.parentElement;
    if (!pill || (pill.getAttribute('class') || '').indexOf('rounded-full') === -1) return;
    const verb = role.nextElementSibling;
    if (!verb || !seen(verb)) return;
    const verbRects = [...verb.getClientRects()];
    const pr = pill.getBoundingClientRect();
    const vr = verb.getBoundingClientRect();
    const rr = role.getBoundingClientRect();
    // ⚠ `getClientRects()` ON THE ROLE IS ONE RECT WHATEVER IT DOES, because a
    // flex item is blockified: the <b> is a block box and a block box that
    // wraps over two lines is still one rectangle. So its lines are counted
    // off its own line box, which is the only reading that can see the wrap.
    const rs = getComputedStyle(role);
    const lh = rs.lineHeight === 'normal'
      ? parseFloat(rs.fontSize) * 1.2
      : parseFloat(rs.lineHeight);
    const roleLines = Math.max(1, Math.round(rr.height / lh));
    // Does the verb sit beside the role's FIRST line while more of the role
    // runs on underneath it? That is the shape rule 7 rules out.
    const beside = roleLines > 1 && vr.top < rr.top + lh - 1;
    out.push({
      role: (role.textContent || '').trim().slice(0, 40),
      verb: (verb.textContent || '').trim().slice(0, 40),
      lines: verbRects.length,
      roleLines: roleLines,
      beside: beside,
      pillW: Math.round(pr.width),
      pillH: Math.round(pr.height),
    });
  });
  return out;
""")


# ── ITEM 11. The reserve at the foot of a registration step ──────────────────
#
# ⚠ MEASURED OFF `offsetTop`, NOT OFF `getBoundingClientRect`, AND THAT IS THE
# WHOLE OF THE ITEM.
#
# `.registration-actions` is `position: sticky`, which changes where an element
# PAINTS and not where it sits in the flow. Its rect therefore reports the
# viewport bottom while the panel's layout still has it a thousand pixels
# further down, and any scan that reads rects, including a full-page
# screenshot, sees the bar at the top of the card and an empty band where its
# flow box is. `offsetTop` and `offsetHeight` are the layout, so this reads the
# gaps a visitor actually scrolls through.
REGISTER = js("""
  const step = document.querySelector('.registration-step');
  const panel = document.querySelector('.registration-panel');
  const bar = document.querySelector('.registration-actions');
  if (!step || !panel) return null;

  // ⚠ THE STICKY BAR IS MADE STATIC FOR THE READING, AND NOTHING ELSE MOVES.
  //
  // `position: sticky` changes where an element PAINTS and not where it sits
  // in the flow, so its rect reports the foot of the viewport while the card's
  // layout still has it a thousand pixels further down. Every rect-based scan
  // therefore sees the bar at the top of the card and an empty band where its
  // flow box is, and that includes a full-page screenshot, which is where the
  // "about 200px of nothing" reading in the wave 490 brief comes from.
  //
  // A sticky box occupies exactly the space a static one would, so setting it
  // static for the duration of the measurement changes no other box on the
  // page and gives the flow the visitor actually scrolls through. It is put
  // back before anything else runs.
  const stuck = [...panel.querySelectorAll('*')]
    .filter((el) => getComputedStyle(el).position === 'sticky');
  const saved = stuck.map((el) => el.style.position);
  stuck.forEach((el) => { el.style.position = 'static'; });
  void panel.getBoundingClientRect();

  const pr = panel.getBoundingClientRect();
  const ps = getComputedStyle(panel);
  const padTop = parseFloat(ps.paddingTop) || 0;
  const padBottom = parseFloat(ps.paddingBottom) || 0;
  const barHeight = bar ? Math.round(bar.getBoundingClientRect().height) : null;
  const barFlowTop = bar ? Math.round(bar.getBoundingClientRect().top - pr.top) : null;

  // Every box with ink or a border in it, in the panel's own coordinates.
  const rows = [];
  panel.querySelectorAll('*').forEach((el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return;
    if (s.position === 'absolute' || s.position === 'fixed') return;
    const r = el.getBoundingClientRect();
    if (r.height < 1 || r.width < 1) return;
    rows.push({ top: r.top - pr.top, bottom: r.bottom - pr.top,
                tag: el.tagName.toLowerCase(),
                cls: (el.getAttribute('class') || '').slice(0, 40) });
  });
  rows.sort((a, b) => a.top - b.top);

  let reach = padTop;
  let worst = 0;
  let worstAt = 0;
  let worstWhat = '';
  for (const row of rows) {
    if (row.top - reach > worst) {
      worst = row.top - reach;
      worstAt = reach;
      worstWhat = row.tag + '.' + row.cls;
    }
    reach = Math.max(reach, row.bottom);
  }
  const contentBottom = pr.height - padBottom;
  const stepHeight = Math.round(step.getBoundingClientRect().height);
  const stepMinHeight = getComputedStyle(step).minHeight;

  stuck.forEach((el, i) => { el.style.position = saved[i]; });

  return {
    panelHeight: Math.round(pr.height),
    stepHeight: stepHeight,
    stepMinHeight: stepMinHeight,
    panelPadBottom: Math.round(padBottom),
    barHeight: barHeight,
    barPosition: bar ? 'sticky-or-static, read static' : null,
    barFlowTop: barFlowTop,
    gap: Math.round((contentBottom - reach) * 100) / 100,
    worstGap: Math.round(worst * 100) / 100,
    worstAt: Math.round(worstAt),
    worstWhat: worstWhat,
  };
""")


# ── ITEM 12. The three Verify links, and the exemption that hid them ─────────
#
# ⚠ THE `inline-in-text` EXEMPTION NOW ASKS WHETHER THE LINK SHARES A LINE.
#
# 414's rule was "an inline anchor whose parent holds more text than the link
# does", which describes a sentence with a link in it. The footer's three
# Verify links pass that test on every route and FAIL what it was for: at
# phone width the reference line wraps and the link stands alone on the last
# line, where it is a 24px target and nothing else is on the row to press.
#
# The rule here adds the second half of the sentence it was always trying to
# say: a link inside a run of text is exempt only where it is ACTUALLY in a
# run of text, which means some of its parent's other ink shares its line box.
# Measured off Ranges over the sibling text nodes rather than off the parent's
# box, because the parent's box is the whole paragraph.
VERIFY = js("""
  const out = [];
  const share = (a, b) => Math.min(a.b, b.b) - Math.max(a.y, b.y);
  document.querySelectorAll('a[href]').forEach((el) => {
    if (!seen(el) || hidden(el)) return;
    const own = (el.textContent || '').trim();
    if (own.slice(0, 6) !== 'Verify') return;
    const r = el.getBoundingClientRect();
    const parent = el.parentElement;
    let sharesLine = false;
    if (parent) {
      for (const t of textRects(parent)) {
        if (t.text === own.slice(0, 40)) continue;
        if (Math.abs(t.x - r.left) < 0.5 && Math.abs(t.y - r.top) < 0.5) continue;
        if (share(t, { y: r.top, b: r.bottom }) > Math.min(t.b - t.y, r.height) / 2) {
          sharesLine = true;
          break;
        }
      }
    }
    out.push({
      label: own.slice(0, 40),
      w: Math.round(r.width * 100) / 100,
      h: Math.round(r.height * 100) / 100,
      sharesLine: sharesLine,
      exempt: sharesLine,
    });
  });
  return out;
""")


# ── ITEM 3. Where the peeking slide's headline is ────────────────────────────
PEEK = js("""
  const band = document.querySelector('.hero-band');
  if (!band) return null;
  const br = band.getBoundingClientRect();
  const panels = [...band.querySelectorAll('.hero-panel')];
  const vw = window.innerWidth;
  const out = [];
  for (let i = 0; i < panels.length; i += 1) {
    const cap = panels[i].querySelector('figcaption');
    if (!cap) continue;
    const cr = cap.getBoundingClientRect();
    // The part of this caption that is inside the strip's visible box AND
    // past the right edge of the panel that is snapped to the left of it:
    // the peek band, which is where a cut-off glyph paints.
    const left = Math.max(cr.left, br.left);
    const right = Math.min(cr.right, br.right, vw);
    if (right - left < 1) continue;
    out.push({
      panel: i,
      text: (cap.textContent || '').trim().slice(0, 30),
      x: left, y: cr.top, r: right, b: cr.bottom,
      fullyVisible: cr.left >= br.left - 0.5 && cr.right <= br.right + 0.5,
    });
  }
  const style = getComputedStyle(band);
  return {
    bandX: br.left, bandR: Math.min(br.right, vw), bandY: br.top, bandB: br.bottom,
    mask: (style.maskImage || style.webkitMaskImage || 'none').slice(0, 90),
    captions: out,
  };
""")


# ---------------------------------------------------------------------------
# THE PIXEL SIDE. Rule 2 and rule 3's peek test are both read off the shot the
# gate has just written, not off the DOM, for the same reason wave 412b started
# measuring axe's INCOMPLETE nodes off the screenshot: the ground under a piece
# of layout is not always the ground its class names, and a hole is a thing a
# visitor SEES rather than a thing the box model admits to.

def _ground(block):
    """The modal colour of a block of pixels: the section's own ground."""
    flat = block.reshape(-1, block.shape[-1])
    if flat.shape[0] > 40000:
        flat = flat[:: max(1, flat.shape[0] // 40000)]
    # Pack RGB into one integer so the mode is a single bincount.
    packed = (flat[:, 0].astype(np.int64) << 16) | (flat[:, 1].astype(np.int64) << 8) | flat[:, 2]
    values, counts = np.unique(packed, return_counts=True)
    top = int(values[int(np.argmax(counts))])
    return np.array([(top >> 16) & 255, (top >> 8) & 255, top & 255], dtype=np.int16)


def empty_runs(pixels, boxes, scale, page_w):
    """Rule 2. Every run of rows inside a section whose every pixel is the
    section's own ground, longer than EMPTY_RUN_MAX CSS pixels.

    ⚠ BETWEEN TWO PIECES OF CONTENT, WHICH MEANS INTERIOR RUNS ONLY.

    A run that touches a section's own top or bottom edge is that section's
    PADDING, and `CLAUDE.md` sets that padding at 96px on a desktop and 56 on
    a phone: counting it would fail the brand system for following itself. The
    first run of this scan did count them and returned 100px at the top of the
    partners hero at 667x375 and 135px under the last band of a partner page,
    both of which are the space the design asks for.

    The hole this wave is actually about is a trailing one, and it is NOT left
    unmeasured by that: item 2 measures the gap between the visible face's last
    line and the foot of its section against a 48px ceiling, and item 9 does
    the same for a card against 32px. Those are the tighter rules and they are
    the right ones for a tail; this is the rule for a hole in the middle.
    """
    found = []
    height, width = pixels.shape[0], pixels.shape[1]
    for box in boxes:
        y0 = max(0, int(round(box["y"] * scale)))
        y1 = min(height, int(round((box["y"] + box["h"]) * scale)))
        x0 = max(0, int(round(box["x"] * scale)))
        x1 = min(width, int(round(min(box["x"] + box["w"], page_w) * scale)))
        if y1 - y0 < EMPTY_RUN_MAX * scale or x1 - x0 < 8:
            continue
        block = pixels[y0:y1, x0:x1, :3].astype(np.int16)
        ground = _ground(block)
        # Uniform row: every pixel within GROUND_TOLERANCE of the ground on
        # every channel. `max` over the row's worst channel deviation.
        deviation = np.abs(block - ground).max(axis=2).max(axis=1)
        uniform = deviation <= GROUND_TOLERANCE
        run = 0
        start = 0
        for index, flag in enumerate(uniform):
            if flag:
                if run == 0:
                    start = index
                run += 1
            elif run:
                # `start > 0` is what makes this interior: a run beginning on
                # the section's first row is its top padding, and the `elif`
                # itself is what ends the scan on content, so a run that
                # reaches the last row is never reported at all.
                if run > EMPTY_RUN_MAX * scale and start > 0:
                    found.append((box["id"], round(box["y"] + start / scale),
                                  round(run / scale)))
                run = 0
    return found


def _relative_luminance(block):
    linear = block.astype(np.float64) / 255.0
    linear = np.where(linear <= 0.04045, linear / 12.92, ((linear + 0.055) / 1.055) ** 2.4)
    return 0.2126 * linear[..., 0] + 0.7152 * linear[..., 1] + 0.0722 * linear[..., 2]


def peek_ink(pixels, band, scale, page_h):
    """ITEM 3. The darkest pixel in a peeking headline, against its own ground.

    THE METHOD, stated because the number means nothing without it. The band
    is the part of the peeking slide's caption that is inside the strip's
    visible box. The GROUND is read from the six CSS-pixel rows immediately
    below that band, in the same column, because the hero's ground is not flat
    white (it carries a street photograph at a fifth of its strength) and a
    flat reference would be a number about the wash rather than about the
    glyph. The assertion is that no pixel in the band is darker than 70 per
    cent of that ground in relative luminance.
    """
    y0 = max(0, int(round(band["y"] * scale)))
    y1 = min(pixels.shape[0], int(round(band["b"] * scale)))
    x0 = max(0, int(round(band["x"] * scale)))
    x1 = min(pixels.shape[1], int(round(band["r"] * scale)))
    if y1 - y0 < 2 or x1 - x0 < 1:
        return None
    g0 = y1
    g1 = min(pixels.shape[0], y1 + int(round(PEEK_GROUND_ROWS * scale)))
    if g1 - g0 < 2:
        g0 = max(0, y0 - int(round(PEEK_GROUND_ROWS * scale)))
        g1 = y0
    if g1 - g0 < 2:
        return None
    ink = _relative_luminance(pixels[y0:y1, x0:x1, :3])
    ground = float(np.median(_relative_luminance(pixels[g0:g1, x0:x1, :3])))
    if ground <= 0:
        return None
    return {
        "darkest": float(ink.min()),
        "ground": ground,
        "share": float(ink.min()) / ground,
        "width": round((x1 - x0) / scale, 1),
    }


def as_pixels(path):
    with Image.open(path) as handle:
        return np.array(handle.convert("RGB"))


# ---------------------------------------------------------------------------
# ITEM 1. WHAT LOADS, SHOWS.
#
# Chrome decides `loading="lazy"` off an element's LAYOUT position, not off the
# transform that is moving it, so a marquee 3,082px wide at 390 has 32 of its
# 36 tiles parked outside the viewport for ever: they scroll past under a
# transform and are never requested. What a phone showed was a row of empty
# white plates gliding by with a crest popping into one now and then.
#
# The budget is 1.5s from the strip's wrapper arriving on screen, on the slow
# 4G profile Lighthouse mobile uses, which is the profile 414 measured on.
SLOW_4G = {
    "offline": False,
    "latency": 150,
    "downloadThroughput": int(1.6 * 1024 * 1024 / 8),
    "uploadThroughput": int(750 * 1024 / 8),
}

STRIP_STATE = """
() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const read = (selector) => {
    const list = [...document.querySelectorAll(selector)];
    const onScreen = list.filter((img) => {
      const r = img.getBoundingClientRect();
      return r.width >= 1 && r.height >= 1 &&
             r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
    });
    const decoded = onScreen.filter((img) => img.complete && img.naturalWidth > 0);
    const pending = onScreen.filter((img) => img.dataset.img === 'pending');
    return {
      total: list.length,
      onScreen: onScreen.length,
      decoded: decoded.length,
      decodedAll: list.filter((img) => img.complete && img.naturalWidth > 0).length,
      pending: pending.length,
      undecoded: list.filter((img) => !(img.complete && img.naturalWidth > 0))
        .map((img) => img.src.split('/').pop()).slice(0, 6),
    };
  };
  return {
    councils: read('.logo-marquee__track img'),
    data: read('img[src*="/images/logos/data/"]'),
  };
}
"""


def logo_probe(browser, base, width, height, failures, mode):
    """Scroll to the strip on a loaded page, start the clock, read at 1.5s."""
    ctx = browser.new_context(
        viewport={"width": width, "height": height},
        is_mobile=width < 1024, has_touch=width < 1024,
        device_scale_factor=2 if width < 1024 else 1,
    )
    page = ctx.new_page()
    requested = {"councils": 0, "data": 0}

    def note(request):
        if "/images/logos/councils/" in request.url:
            requested["councils"] += 1
        elif "/images/logos/data/" in request.url:
            requested["data"] += 1

    page.on("request", note)
    page.goto(f"{base}/", wait_until="networkidle")
    first_paint = dict(requested)

    cdp = ctx.new_cdp_session(page)
    cdp.send("Network.enable")
    cdp.send("Network.emulateNetworkConditions", SLOW_4G)

    for selector, name in ((".logo-marquee", "councils"), ('img[src*="/images/logos/data/"]', "data")):
        # ⚠ THE SCROLL TARGET IS IN PAGE COORDINATES.
        #
        # `bounding_box()` is relative to the VIEWPORT, and this loop has
        # already scrolled once by the time it reaches the second strip. The
        # first run of this probe aimed the data-logo scroll a viewport and a
        # half short and read "0 tiles on screen", which is a fact about the
        # scroll and not about the logos.
        target = page.evaluate(
            "(sel) => { const el = document.querySelector(sel); if (!el) return null; "
            "return Math.max(0, el.getBoundingClientRect().top + scrollY - innerHeight / 3); }",
            selector,
        )
        if target is None:
            failures.append(f"item1 @ {width}: no {name} strip on the home page")
            continue
        scroll_to(page, target)
        page.wait_for_timeout(DECODE_BUDGET_MS)
        # ⚠ AND IT IS SAMPLED, BECAUSE THE LANE IS MOVING.
        #
        # One reading of "every tile on screen has decoded" is a reading of the
        # four tiles that happen to be in a 390px window at that instant, and a
        # 40-second loop brings a different four along every second. The worst
        # reading over three seconds is the one that answers the question the
        # defect is about: does a plate ever glide past with nothing in it.
        # The whole-strip count beside it is the other half: a tile that has
        # decoded before it arrives can never be an empty plate at all.
        state = page.evaluate(STRIP_STATE)[name]
        for _ in range(12):
            page.wait_for_timeout(250)
            sample = page.evaluate(STRIP_STATE)[name]
            if sample["onScreen"] - sample["decoded"] > state["onScreen"] - state["decoded"]:
                state = sample
        whole = page.evaluate(STRIP_STATE)[name]
        print(
            f"item1     {name:<9} @ {width:<5} worst of 13 samples over 3s: on screen="
            f"{state['onScreen']:>3}  decoded={state['decoded']:>3}  pending="
            f"{state['pending']:>2}; whole strip decoded={whole['decodedAll']:>3} of "
            f"{whole['total']:>3}  after {DECODE_BUDGET_MS}ms on slow 4G"
        )
        if whole["decodedAll"] < whole["total"]:
            message = (
                f"item1 @ {width}: {whole['total'] - whole['decodedAll']} of "
                f"{whole['total']} {name} tiles had still not decoded "
                f"{DECODE_BUDGET_MS}ms after the strip arrived, and every one of them "
                f"crosses the window inside one turn of the loop. {whole['undecoded']}"
            )
            (print if mode == "before" else failures.append)(
                ("BEFORE  " + message) if mode == "before" else message
            )
        if state["onScreen"] and state["decoded"] < state["onScreen"]:
            message = (
                f"item1 @ {width}: {state['onScreen'] - state['decoded']} of "
                f"{state['onScreen']} {name} tiles on screen had not decoded "
                f"{DECODE_BUDGET_MS}ms after the strip arrived. {state['undecoded']}"
            )
            (print if mode == "before" else failures.append)(
                ("BEFORE  " + message) if mode == "before" else message
            )
    print(
        f"item1     requests  @ {width:<5} councils={requested['councils']:>3} "
        f"(first paint {first_paint['councils']}), data={requested['data']:>2} "
        f"(first paint {first_paint['data']})"
    )
    ctx.close()
    return requested, first_paint


# ---------------------------------------------------------------------------
# ITEM 7. THE CAPTURE THAT OPENS.
#
# A desktop screenshot served at 348 CSS px on a 390px screen renders every
# word in it under 4px tall. The words are the product; the figure has to open.
def dialog_probe(browser, base, axe_source, failures, mode):
    ctx = browser.new_context(
        viewport={"width": 390, "height": 844},
        is_mobile=True, has_touch=True, device_scale_factor=2,
    )
    page = ctx.new_page()
    page.goto(f"{base}/platform", wait_until="networkidle")
    settle(page)
    to_top(page)
    state = page.evaluate(CAPTURE)
    if not state:
        failures.append("item7: no product capture on /platform")
        ctx.close()
        return None
    print(
        f"item7     capture   rendered={state['rendered']}px natural={state['natural']}px "
        f"src={state['currentSrc']} trigger={state['hasTrigger']} "
        f"{state['triggerW']}x{state['triggerH']}"
    )
    if not state["hasTrigger"]:
        message = "item7: the product capture has no control that opens it at 390"
        (print if mode == "before" else failures.append)(
            ("BEFORE  " + message) if mode == "before" else message
        )
        ctx.close()
        return state
    if (state["triggerW"] or 0) < TARGET_MIN - EPSILON or (state["triggerH"] or 0) < TARGET_MIN - EPSILON:
        failures.append(
            f"item7: the capture's trigger is {state['triggerW']}x{state['triggerH']}, "
            f"under {TARGET_MIN:g}x{TARGET_MIN:g}"
        )
    trigger = page.query_selector("figure button")
    trigger.scroll_into_view_if_needed()
    trigger.click()
    page.wait_for_timeout(400)
    opened = page.evaluate(
        "() => { const d = document.querySelector('[role=\\\"dialog\\\"]'); "
        "if (!d) return null; const c = d.querySelector('button'); "
        "const cr = c ? c.getBoundingClientRect() : null; "
        "const img = d.querySelector('img'); "
        "return { name: d.getAttribute('aria-label') || '', "
        "closeW: cr ? Math.round(cr.width * 100) / 100 : null, "
        "closeH: cr ? Math.round(cr.height * 100) / 100 : null, "
        "imgW: img ? img.naturalWidth : null, "
        "scrollW: img && img.parentElement ? img.parentElement.scrollWidth : null, "
        "clientW: img && img.parentElement ? img.parentElement.clientWidth : null }; }"
    )
    if not opened:
        failures.append("item7: tapping the capture at 390 opened no dialog")
        ctx.close()
        return state
    print(
        f"item7     dialog    name=\"{opened['name'][:40]}\" close="
        f"{opened['closeW']}x{opened['closeH']} image={opened['imgW']}px "
        f"scrollable={opened['scrollW']}>{opened['clientW']}"
    )
    if (opened["closeW"] or 0) < TARGET_MIN - EPSILON or (opened["closeH"] or 0) < TARGET_MIN - EPSILON:
        failures.append(
            f"item7: the dialog's close control is {opened['closeW']}x{opened['closeH']}, "
            f"under {TARGET_MIN:g}x{TARGET_MIN:g}"
        )
    if not opened["name"]:
        failures.append("item7: the open dialog has no accessible name")
    page.add_script_tag(content=axe_source)
    violations = page.evaluate(
        "async () => { const r = await axe.run(document, "
        "{ resultTypes: ['violations'] }); "
        "return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')"
        ".map((v) => v.id + ' x' + v.nodes.length); }"
    )
    print(f"item7     axe       open state: {len(violations)} serious or critical {violations}")
    if violations:
        failures.append(f"item7: the open dialog carries {violations}")
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    if page.evaluate("() => !!document.querySelector('[role=\\\"dialog\\\"]')"):
        failures.append("item7: Escape did not close the dialog")
    else:
        print("item7     escape    closed")
    trigger = page.query_selector("figure button")
    trigger.click()
    page.wait_for_timeout(400)
    page.evaluate(
        "() => { const d = document.querySelector('[role=\\\"dialog\\\"]'); "
        "if (d) d.querySelector('button').click(); }"
    )
    page.wait_for_timeout(400)
    if page.evaluate("() => !!document.querySelector('[role=\\\"dialog\\\"]')"):
        failures.append("item7: the close control did not close the dialog")
    else:
        print("item7     control   closed")
    ctx.close()
    return state


# ---------------------------------------------------------------------------
# ITEM 2, the second half: the swap is instant under reduced motion.
def reduced_motion_probe(browser, base, failures):
    ctx = browser.new_context(
        viewport={"width": 390, "height": 844},
        is_mobile=True, has_touch=True, device_scale_factor=2,
        reduced_motion="reduce",
    )
    page = ctx.new_page()
    page.goto(f"{base}/", wait_until="networkidle")
    settle(page)
    to_top(page)
    before = page.evaluate(FACES)
    page.get_by_role("button", name="See our solution").click()
    page.wait_for_timeout(50)
    at_once = page.evaluate(FACES)
    page.wait_for_timeout(700)
    settled = page.evaluate(FACES)
    moved = abs(at_once["sectionHeight"] - settled["sectionHeight"])
    print(
        f"item2     reduced   before={before['sectionHeight']:.0f}px  "
        f"at 50ms={at_once['sectionHeight']:.0f}px  at 750ms={settled['sectionHeight']:.0f}px  "
        f"still moving by {moved:.2f}px"
    )
    if moved > 1.0:
        failures.append(
            f"item2: under reduced motion the swap was still {moved:.2f}px from its "
            f"resting height 50ms after the press. It has to be instant."
        )
    ctx.close()


# ---------------------------------------------------------------------------
# ITEM 11, THE SECOND READING: WHAT A PHONE ACTUALLY SHOWS.
#
# The layout reading says the account step's flow has a 1px gap in it and a 1px
# tail, so the "about 200px of nothing" in the wave 490 brief is not in the
# layout. This is where it comes from, and it is worth proving rather than
# asserting: a FULL-PAGE screenshot paints a `position: sticky` element where
# it is STUCK and leaves its flow box empty, so `register-investor-390.png`
# shows the Continue bar 500px up the card and a band of nothing where the bar
# belongs. That is a fact about the capture.
#
# So the card is photographed the way a visitor meets it: a real viewport, at
# three real scroll positions, with the empty-run scan of rule 2 over each one.
def register_viewport_probe(browser, base, out, failures, mode):
    for width, height in ((360, 800), (390, 844), (414, 896)):
        for route, slug in (("/register/investor", "register-investor"),
                            ("/register/resident", "register-resident")):
            ctx = browser.new_context(
                viewport={"width": width, "height": height},
                is_mobile=True, has_touch=True, device_scale_factor=2,
            )
            page = ctx.new_page()
            page.goto(f"{base}{route}", wait_until="networkidle")
            settle(page)
            to_top(page)
            reach = page.evaluate(
                "() => Math.max(0, document.body.scrollHeight - innerHeight)"
            )
            worst = 0
            worst_at = 0
            for fraction in (0.0, 0.5, 1.0):
                y = scroll_to(page, round(reach * fraction))
                page.wait_for_timeout(250)
                shot = out / f"{slug}-{width}-fold-{int(fraction * 100)}.png"
                page.screenshot(path=str(shot), full_page=False)
                pixels = as_pixels(shot)
                boxes = page.evaluate(
                    "() => { const p = document.querySelector('.registration-panel'); "
                    "if (!p) return []; const r = p.getBoundingClientRect(); "
                    "return [{ id: 'registration-panel', x: Math.max(0, r.left), "
                    "y: Math.max(0, r.top), w: Math.min(r.width, innerWidth), "
                    "h: Math.min(r.bottom, innerHeight) - Math.max(0, r.top) }]; }"
                )
                for _, at, run in empty_runs(pixels, boxes, 2, width):
                    if run > worst:
                        worst = run
                        worst_at = round(y + at)
            print(
                f"item11    {slug:<20} @ {width:<5} three real viewports at scrollY 0, "
                f"{round(reach / 2)} and {round(reach)}: worst run of nothing inside the "
                f"card = {worst}px" + (f" at document y={worst_at}" if worst else "")
            )
            if worst > EMPTY_RUN_MAX:
                message = (
                    f"item11 {slug} @ {width}: {worst}px of nothing inside the "
                    f"registration card in a real viewport at document y={worst_at}"
                )
                (print if mode == "before" else failures.append)(
                    ("BEFORE  " + message) if mode == "before" else message
                )
            ctx.close()


# ---------------------------------------------------------------------------
# ITEM 13. A PHONE ON ITS SIDE WITH THE KEYBOARD UP.
#
# 667 by 375 leaves 242px of page once the 56px header and the 77px register
# bar are on screen, which 414 accepted and this wave keeps. What 414 never
# asked is whether the FIELD is reachable there, so the viewport is cut to 300
# (roughly a landscape phone with a keyboard open) and the first field of each
# step has to be wholly on screen after one scroll.
def landscape_probe(browser, base, failures):
    for route in ("/register/investor", "/register/resident"):
        ctx = browser.new_context(
            viewport={"width": 667, "height": 300},
            is_mobile=True, has_touch=True, device_scale_factor=2,
        )
        page = ctx.new_page()
        page.goto(f"{base}{route}", wait_until="networkidle")
        settle(page)
        to_top(page)
        field = page.query_selector(".registration-panel input:not([type=hidden])")
        if field is None:
            failures.append(f"item13: {route} at 667x300 has no first field")
            ctx.close()
            continue
        field.focus()
        field.scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        read = page.evaluate(
            "() => { const el = document.activeElement; const r = el.getBoundingClientRect(); "
            "const header = document.querySelector('header'); "
            "const hb = header ? header.getBoundingClientRect().bottom : 0; "
            "const bar = document.querySelector('.registration-actions'); "
            "const bt = bar ? bar.getBoundingClientRect().top : innerHeight; "
            "return { top: Math.round(r.top), bottom: Math.round(r.bottom), "
            "header: Math.round(hb), bar: Math.round(bt), vh: innerHeight, "
            "name: el.getAttribute('name') || el.id || el.tagName }; }"
        )
        clear = read["top"] >= read["header"] - 0.5 and read["bottom"] <= read["vh"] + 0.5
        print(
            f"item13    {route:<20} 667x300 field \"{read['name']}\" "
            f"{read['top']} to {read['bottom']}, header ends {read['header']}, "
            f"bar starts {read['bar']}, viewport {read['vh']}: "
            f"{'fully visible' if clear else 'NOT fully visible'}"
        )
        if not clear:
            failures.append(
                f"item13: {route} at 667x300, the first field sits "
                f"{read['top']} to {read['bottom']} against a header ending at "
                f"{read['header']} and a viewport of {read['vh']}"
            )
        ctx.close()


# ---------------------------------------------------------------------------
# RULE 8. THE DESKTOP DOES NOT MOVE.
#
# Every touched surface is shot at 1280 before the first code commit and again
# at the head, and the two are compared PIXEL FOR PIXEL. Anything that differs
# has to lie inside a box this wave declared it was touching, or inside a
# region that cannot hold still between two runs of the same build.
#
# THE MASKS ARE THE HONEST PART. Three things on this site move on their own at
# 1280 and would differ between two shots of an unchanged build: the council
# marquee (a 40s transform loop), the demand map's dot canvas, and the home
# page's count-up figure, which lands on a different digit depending on when
# the shutter opened. They are excluded and named rather than quietly diffed
# away, and every one of them is also declared as a touched surface or is not
# touched at all.
TOUCHED = {
    "home": [
        'section[aria-labelledby="mission-heading"]',
        ".hero-band",
        ".logo-marquee",
    ],
    "platform": ['[aria-live="polite"]', "figure", ".logo-marquee"],
    "about": ["article", "ol > li > div"],
    "solutions": ["span.rounded-full"],
}
# Every route carries the footer, whose three Verify links item 12 touches.
TOUCHED_EVERYWHERE = ["footer"]
ANIMATED_MASKS = ["canvas", ".logo-marquee", ".tabular-nums"]

# ⚠ AND THE REST OF THE ANIMATED BOXES ARE FOUND, NOT LISTED.
#
# A list of selectors is a list of the things somebody happened to think of.
# The first run of this pairing reported 19,448 device pixels "moved" on
# /platform at 1280 across three bands; cropped and looked at, both shots show
# the same three characters in the same places, and what differs is the rayed
# sunburst turning behind Petra. A region that cannot hold still between two
# shots of the SAME build is not evidence about a change, so the boxes are
# collected off `getComputedStyle` at capture time and excluded with the three
# named above.
RUNNING = """
() => {
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const s = getComputedStyle(el);
    if (!s.animationName || s.animationName === 'none') return;
    if (s.animationPlayState === 'paused') return;
    if (!(parseFloat(s.animationDuration) > 0)) return;
    if (s.animationIterationCount === '1' && s.animationFillMode === 'both') return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    out.push({ x: r.left + scrollX, y: r.top + scrollY,
               r: r.right + scrollX, b: r.bottom + scrollY,
               sel: 'running:' + s.animationName });
  });
  return out;
}
"""

# ⚠ AND THE SHUTTER WAITS FOR THE PICTURES.
#
# `ImageFade` hides an image that has not decoded and fades it in, so whether
# the header's brand lockup is in a shot depends on whether its bytes had
# landed when the shutter opened. Two runs disagreeing about that is what put
# 1,974 "moved" pixels in the header's logo box on /about, /register and
# /partner-with-local-authority, in rows 10 to 61 and columns 32 to 171, which
# is the lockup exactly. Five seconds is a ceiling, not a wait: a build that
# has every image decoded is past this line at once.
AWAIT_IMAGES = """
async () => {
  const pending = [...document.images].filter((i) => !i.complete);
  await Promise.all(pending.map((i) => new Promise((done) => {
    i.addEventListener('load', done, { once: true });
    i.addEventListener('error', done, { once: true });
    setTimeout(done, 5000);
  })));
  return pending.length;
}
"""

# ⚠ AND THE FLOATING CONTROL IS NOT IN THE PICTURE.
#
# `.back-to-top` is `position: fixed`, so a full-page capture paints it
# wherever the capture engine's viewport happened to be and leaves it there in
# the stitched image: 203 "moved" pixels on /legal at 1280, a 44 by 44 square
# in the bottom right, which is the control and not the page. It is measured by
# item 8 off its own box at a confirmed scroll position, which is the reading
# that can actually fail. Hidden for the shutter and put straight back.
HIDE_FLOATERS = """
(hide) => {
  document.querySelectorAll('.back-to-top').forEach((el) => {
    el.style.visibility = hide ? 'hidden' : '';
  });
}
"""

BOXES = """
(selectors) => {
  const out = [];
  for (const selector of selectors) {
    let nodes = [];
    try { nodes = [...document.querySelectorAll(selector)]; } catch (e) { continue; }
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      out.push({ x: r.left + scrollX, y: r.top + scrollY, r: r.right + scrollX,
                 b: r.bottom + scrollY, sel: selector });
    }
  }
  return out;
}
"""


def _cover(boxes, shape, scale, pad=2):
    mask = np.zeros(shape[:2], dtype=bool)
    for box in boxes:
        y0 = max(0, int((box["y"] - pad) * scale))
        y1 = min(shape[0], int((box["b"] + pad) * scale) + 1)
        x0 = max(0, int((box["x"] - pad) * scale))
        x1 = min(shape[1], int((box["r"] + pad) * scale) + 1)
        if y1 > y0 and x1 > x0:
            mask[y0:y1, x0:x1] = True
    return mask


def pair_1280(slug, before_path, after_path, touched, masks, failures):
    """Compare the desktop shot taken at the base with the one at this head."""
    if not before_path.exists():
        failures.append(f"rule8 {slug}: no before shot at {before_path.name}, so nothing is paired")
        return
    before = as_pixels(before_path)
    after = as_pixels(after_path)
    note = ""
    if before.shape != after.shape:
        note = f" (page height {before.shape[0]} -> {after.shape[0]} device px)"
        rows = min(before.shape[0], after.shape[0])
        cols = min(before.shape[1], after.shape[1])
        before = before[:rows, :cols]
        after = after[:rows, :cols]
    differs = np.abs(before.astype(np.int16) - after.astype(np.int16)).max(axis=2) > 2
    total = int(differs.sum())
    allowed = _cover(touched, before.shape, 1) | _cover(masks, before.shape, 1)
    stray = differs & ~allowed
    count = int(stray.sum())
    print(
        f"rule8     {slug:<26} 1280 differs on {total:>9} device px, "
        f"{count:>8} of them outside the touched and animated boxes{note}"
    )
    if count:
        rows = np.where(stray.any(axis=1))[0]
        cols = np.where(stray.any(axis=0))[0]
        failures.append(
            f"rule8 {slug}: {count} device pixels moved at 1280 outside every box this "
            f"wave declared it touched, in rows {rows.min()} to {rows.max()} and "
            f"columns {cols.min()} to {cols.max()}"
        )


# ---------------------------------------------------------------------------
def check_spans(entries, failures, where, width):
    """ITEM 4 and rule 5. The floors, reaching inside a paragraph."""
    if width >= TYPE_FLOOR_BELOW:
        return 0, {}
    floors = {"body": SPAN_BODY_MIN_PX, "caption": SPAN_CAPTION_MIN_PX,
              "eyebrow": SPAN_LABEL_MIN_PX, "mono": SPAN_LABEL_MIN_PX,
              "label": SPAN_LABEL_MIN_PX, "name": SPAN_LABEL_MIN_PX}
    bad = 0
    seen = {}
    for entry in entries:
        kind = entry["kind"]
        seen[kind] = seen.get(kind, 0) + 1
        floor = floors[kind]
        if entry["size"] < floor - 0.01:
            bad += 1
            failures.append(
                f"{where}: <{entry['tag']}> inside a paragraph computes at "
                f"{entry['size']:g}px against the {floor:g}px {kind} floor. "
                f"[{entry['cls']}] \"{entry['text']}\""
            )
    return bad, seen


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser()
    parser.add_argument("--build", default=str(BUILD))
    parser.add_argument("--mode", choices=["before", "after"], default="after")
    parser.add_argument("--profiles", default="")
    parser.add_argument("--pages", default="")
    parser.add_argument("--no-probes", action="store_true")
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

    out = OUT / "before" if args.mode == "before" else OUT
    out.mkdir(parents=True, exist_ok=True)
    axe_source = AXE.read_text(encoding="utf-8")
    port = serve(build)
    base = f"http://127.0.0.1:{port}"

    failures: list[str] = []
    soft: list[str] = []
    fail = soft.append if args.mode == "before" else failures.append
    tally = {"shots": 0, "runs": 0, "spans": 0, "spanbad": 0, "clashes": 0,
             "pills": 0, "pillbad": 0, "verify": 0, "verifybad": 0,
             "cards": 0, "cardbad": 0, "peek": 0, "peekbad": 0}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        for path, slug in pages:
            for label, width, height, phone in profiles:
                ctx = browser.new_context(
                    viewport={"width": width, "height": height},
                    is_mobile=phone, has_touch=phone,
                    device_scale_factor=2 if phone else 1,
                )
                scale = 2 if phone else 1
                page = ctx.new_page()
                page.goto(f"{base}{path}", wait_until="networkidle")
                settle(page)
                where = f"{slug} @ {label}"
                resting = to_top(page)
                if resting > 0.5:
                    failures.append(
                        f"{where}: the page would not return to the top before the shot "
                        f"(scrollY={resting:.0f})"
                    )

                waited = page.evaluate(AWAIT_IMAGES)
                page.evaluate(HIDE_FLOATERS, True)
                page.wait_for_timeout(120)
                shot = out / f"{slug}-{label}.png"
                page.screenshot(path=str(shot), full_page=True)
                page.evaluate(HIDE_FLOATERS, False)
                if waited:
                    print(f"shutter   {where:<22} waited for {waited} images to decode")
                tally["shots"] += 1
                to_top(page)
                page.wait_for_timeout(200)

                pixels = as_pixels(shot)

                # ── RULE 2, off the shot's own pixels ─────────────────────
                sections = page.evaluate(SECTIONS)
                runs = empty_runs(pixels, sections, scale, width)
                tally["runs"] += len(runs)
                for section_id, y, run in runs:
                    fail(
                        f"{where}: {run}px of nothing but the section's own ground inside "
                        f"{section_id}, from y={y}. Over the {EMPTY_RUN_MAX}px a band may "
                        f"carry between two pieces of content."
                    )

                # ── ITEM 4 and rule 5 ─────────────────────────────────────
                spans = page.evaluate(SPANS)
                tally["spans"] += len(spans)
                bad, kinds = check_spans(spans, failures if args.mode == "after" else soft,
                                         where, width)
                tally["spanbad"] += bad

                # ── ITEM 12, on every route ───────────────────────────────
                verify = page.evaluate(VERIFY)
                for link in verify:
                    tally["verify"] += 1
                    if link["exempt"]:
                        continue
                    under = link["h"] < TARGET_MIN - EPSILON or link["w"] < TARGET_MIN - EPSILON
                    if under and width >= TYPE_FLOOR_BELOW:
                        # The desktop control. Rule 6 is a phone rule and rule 8
                        # says the desktop does not move, so this is reported
                        # and not asserted. It is proposal 2 in the report.
                        print(
                            f"item12    {where:<22} \"{link['label'][:34]}\" stands on its "
                            f"own line at {link['w']:g}x{link['h']:g}, under 44 on the "
                            f"desktop control too"
                        )
                        continue
                    if under:
                        tally["verifybad"] += 1
                        fail(
                            f"{where}: \"{link['label']}\" stands on its own line and is "
                            f"{link['w']:g}x{link['h']:g}, under {TARGET_MIN:g}x{TARGET_MIN:g}"
                        )

                # ── THE PER-ROUTE ITEMS ───────────────────────────────────
                if slug == "home":
                    faces = page.evaluate(FACES)
                    if faces:
                        heights = " / ".join(f"{f['height']:.0f}" for f in faces["faces"])
                        print(
                            f"item2     {where:<22} section={faces['sectionHeight']:.0f}px "
                            f"faces={heights}  tail under the visible face="
                            f"{faces['tail']}px"
                        )
                        if width < 768 and faces["tail"] is not None and faces["tail"] > FACE_TAIL_MAX:
                            fail(
                                f"{where}: {faces['tail']:.0f}px between the last line of the "
                                f"visible face and the foot of the purpose section, over "
                                f"{FACE_TAIL_MAX}px"
                            )
                        try:
                            page.get_by_role("button", name="See our solution").click()
                            page.wait_for_timeout(800)
                            flipped = page.evaluate(FACES)
                            print(
                                f"item2     {where:<22} swapped: section="
                                f"{flipped['sectionHeight']:.0f}px  tail={flipped['tail']}px"
                            )
                            if (width < 768 and flipped["tail"] is not None
                                    and flipped["tail"] > FACE_TAIL_MAX):
                                fail(
                                    f"{where}, swapped: {flipped['tail']:.0f}px under the last "
                                    f"line of the solution face, over {FACE_TAIL_MAX}px"
                                )
                            page.get_by_role("button", name="See the need").click()
                            page.wait_for_timeout(500)
                        except Exception as error:
                            fail(f"{where}: the purpose section would not swap ({error})")
                        to_top(page)

                    # ── ITEM 3, the peeking headline ──────────────────────
                    if width < 768:
                        view = out / f"{slug}-{label}-fold.png"
                        page.screenshot(path=str(view), full_page=False)
                        fold = as_pixels(view)
                        peek = page.evaluate(PEEK)
                        if peek:
                            print(f"item3     {where:<22} strip mask={peek['mask'][:56]}")
                            for caption in peek["captions"]:
                                if caption["fullyVisible"]:
                                    continue
                                reading = peek_ink(fold, caption, scale, height)
                                if reading is None:
                                    continue
                                tally["peek"] += 1
                                print(
                                    f"item3     {where:<22} slide {caption['panel']} "
                                    f"\"{caption['text'][:18]}\" peeks {reading['width']}px: "
                                    f"darkest={reading['darkest']:.4f} "
                                    f"ground={reading['ground']:.4f} "
                                    f"share={reading['share']:.3f}"
                                )
                                if reading["share"] < PEEK_INK_FLOOR:
                                    tally["peekbad"] += 1
                                    fail(
                                        f"{where}: the peeking slide's headline paints a pixel "
                                        f"at {reading['share']:.3f} of its ground, under the "
                                        f"{PEEK_INK_FLOOR:g} floor. It reads as cut-off text."
                                    )

                if slug == "platform":
                    ticker = page.evaluate(TICKER)
                    if ticker:
                        print(
                            f"item5     {where:<22} items={ticker['items']} "
                            f"clones={ticker['clones']} track={ticker['trackWidth']}px "
                            f"animated={ticker['animated']} strings outside the "
                            f"viewport={ticker['outside']}"
                        )
                        if width < 768:
                            if ticker["outside"]:
                                fail(
                                    f"{where}: {ticker['outside']} of the ticker's text runs "
                                    f"fall outside the viewport, the first of them "
                                    f"\"{ticker['worst']}\""
                                )
                            if ticker["animated"]:
                                fail(
                                    f"{where}: {ticker['animated']} elements in the sourced "
                                    f"figures are animating. A reader cannot read a statistic "
                                    f"that moves."
                                )
                            if ticker["clones"]:
                                fail(
                                    f"{where}: the ticker renders {ticker['clones']} clone "
                                    f"items below md, which is the same statistic twice"
                                )
                    for card in page.evaluate(GHOST):
                        print(
                            f"item6     {where:<22} card={card['cardHeight']}px "
                            f"min-height={card['minHeight']} art="
                            f"{card['img']['w']}x{card['img']['h']} at "
                            f"({card['img']['x']},{card['img']['y']}) "
                            f"opacity={card['img']['opacity']} "
                            f"inside padding={card['insidePadding']} "
                            f"text clashes={card['clashes']}"
                        )
                        if width < 768:
                            if card["clashes"]:
                                fail(
                                    f"{where}: the character illustration sits under "
                                    f"{card['clashes']} runs of text, the first "
                                    f"\"{card['firstClash']}\""
                                )
                            if not card["insidePadding"]:
                                fail(
                                    f"{where}: the character illustration is not inside the "
                                    f"card's padding box"
                                )

                if slug == "about":
                    read = page.evaluate(CARDS)
                    # ⚠ A CARD THAT SHARES A ROW IS EQUALISED ON PURPOSE, and
                    # that is the whole of what `min-h` and `h-full` are for.
                    # The defect is a minimum height surviving into a SINGLE
                    # COLUMN, where it equalises nothing. Cards that start at
                    # the same y are a row; a card alone on its line is not.
                    rows = {}
                    for card in read:
                        rows[card["top"]] = rows.get(card["top"], 0) + 1
                    for card in read:
                        tally["cards"] += 1
                        if rows[card["top"]] > 1:
                            continue
                        if width < 768 and card["tailAny"] > CARD_TAIL_MAX:
                            tally["cardbad"] += 1
                            fail(
                                f"{where}: a {card['what']} card is {card['height']}px tall "
                                f"with {card['tailAny']:.0f}px of nothing under its last "
                                f"content, over {CARD_TAIL_MAX}px "
                                f"(min-height {card['minHeight']}, \"{card['label']}\")"
                            )
                    if read:
                        print(
                            f"item9     {where:<22} {len(read)} cards, worst tail under any "
                            f"content={max(c['tailAny'] for c in read):.0f}px, worst tail "
                            f"under the last INK={max(c['tailInk'] for c in read):.0f}px, "
                            f"tallest {max(c['height'] for c in read)}px"
                        )
                        for card in read:
                            print(
                                f"item9     {where:<22}   {card['what']:<9} "
                                f"{card['height']:>4}px min-height={card['minHeight']:<8} "
                                f"pad-bottom={card['padBottom']:>3} ink tail="
                                f"{card['tailInk']:>6.1f} any tail={card['tailAny']:>6.1f} "
                                f"\"{card['label'][:26]}\""
                            )

                if slug == "solutions":
                    pills = page.evaluate(PILLS)
                    for pill in pills:
                        tally["pills"] += 1
                        if pill["lines"] != 1:
                            tally["pillbad"] += 1
                            fail(
                                f"{where}: the pill \"{pill['role']}\" splits its verb "
                                f"\"{pill['verb']}\" across {pill['lines']} lines"
                            )
                        elif pill["beside"] and width < 1024:
                            tally["pillbad"] += 1
                            fail(
                                f"{where}: the pill \"{pill['role']}\" wraps its role over "
                                f"{pill['roleLines']} lines and leaves the verb "
                                f"\"{pill['verb']}\" beside the first of them, in a column of "
                                f"its own. Rule 7 asks for the verb under the role."
                            )
                    if pills:
                        tallest = max(p["pillH"] for p in pills)
                        print(
                            f"item10    {where:<22} {len(pills)} pills, "
                            f"{sum(1 for p in pills if p['lines'] != 1)} with a split verb, "
                            f"{sum(1 for p in pills if p['beside'])} with the verb beside a "
                            f"wrapped role, tallest {tallest}px"
                        )

                if slug.startswith("register-"):
                    reg = page.evaluate(REGISTER)
                    if reg:
                        print(
                            f"item11    {where:<22} panel={reg['panelHeight']}px "
                            f"step={reg['stepHeight']}px (min {reg['stepMinHeight']}) "
                            f"bar={reg['barHeight']}px {reg['barPosition']} at flow y="
                            f"{reg['barFlowTop']}  tail under the last content="
                            f"{reg['gap']:.0f}px  widest gap in the flow="
                            f"{reg['worstGap']:.0f}px at y={reg['worstAt']} before {reg['worstWhat'][:40]}"
                        )
                        ceiling = (reg["barHeight"] or 0) + 16
                        if width < 768 and reg["gap"] > ceiling:
                            fail(
                                f"{where}: {reg['gap']:.0f}px between the last content of the "
                                f"step and the foot of the card, over the bar's "
                                f"{reg['barHeight']}px plus 16"
                            )
                        if width < 768 and reg["worstGap"] > ceiling:
                            fail(
                                f"{where}: {reg['worstGap']:.0f}px of the step's flow at "
                                f"y={reg['worstAt']}, before {reg['worstWhat'][:40]}, has nothing laid "
                                f"out in it, over the "
                                f"bar's {reg['barHeight']}px plus 16"
                            )

                # ── ITEM 8, after two viewports of scroll ─────────────────
                reach = page.evaluate(
                    "() => Math.max(0, Math.min(document.body.scrollHeight - innerHeight, "
                    "innerHeight * 2 + 40))"
                )
                scroll_to(page, reach)
                floaters = page.evaluate(FLOATERS)
                names = ", ".join(
                    f"{l['id']}({l['w']:.0f}x{l['h']:.0f} at right={l['right']:.0f} "
                    f"bottom={l['bottom']:.0f})" for l in floaters["layers"]
                ) or "none"
                print(
                    f"item8     {where:<22} scrolled to {reach:.0f}: {names}; "
                    f"{floaters['words']} text runs and {floaters['controls']} controls on "
                    f"screen; {floaters['clashCount']} clashes"
                )
                tally["clashes"] += floaters["clashCount"]
                for clash in floaters["clashes"]:
                    fail(
                        f"{where}: the fixed {clash['layer']} sits over a "
                        f"{clash['kind']}, \"{clash['what']}\""
                    )
                if slug == "register-investor" and width == 390:
                    present = any(
                        "back-to-top" in layer["id"] for layer in floaters["layers"]
                    )
                    bar = page.evaluate(
                        "() => { const b = document.querySelector('.registration-actions'); "
                        "if (!b) return null; const r = b.getBoundingClientRect(); "
                        "return r.bottom > 0 && r.top < innerHeight; }"
                    )
                    print(
                        f"item8     {where:<22} register bar on screen={bar}, "
                        f"back-to-top present={present}"
                    )
                    if bar and present:
                        fail(
                            f"{where}: the back-to-top control is on screen while the "
                            f"registration journey's own sticky bar is"
                        )
                ctx.close()

        if not args.no_probes:
            print()
            logo_probe(browser, base, 390, 844, failures if args.mode == "after" else soft, args.mode)
            logo_probe(browser, base, 360, 800, failures if args.mode == "after" else soft, args.mode)
            logo_probe(browser, base, 1280, 900, failures if args.mode == "after" else soft, args.mode)
            print()
            dialog_probe(browser, base, axe_source,
                         failures if args.mode == "after" else soft, args.mode)
            print()
            try:
                reduced_motion_probe(browser, base, failures if args.mode == "after" else soft)
            except Exception as error:
                fail(f"item2: the reduced-motion swap probe could not run ({error})")
            print()
            landscape_probe(browser, base, failures if args.mode == "after" else soft)
            print()
            register_viewport_probe(
                browser, base, out, failures if args.mode == "after" else soft, args.mode
            )

        # ── RULE 8, the pairing ───────────────────────────────────────────
        if args.mode == "after" and any(p[0] == "1280" for p in profiles):
            print()
            ctx = browser.new_context(viewport={"width": 1280, "height": 900})
            page = ctx.new_page()
            for path, slug in pages:
                page.goto(f"{base}{path}", wait_until="networkidle")
                settle(page)
                to_top(page)
                selectors = TOUCHED.get(slug, []) + TOUCHED_EVERYWHERE
                touched = page.evaluate(BOXES, selectors)
                masks = page.evaluate(BOXES, ANIMATED_MASKS) + page.evaluate(RUNNING)
                pair_1280(slug, OUT / "before" / f"{slug}-1280.png",
                          OUT / f"{slug}-1280.png", touched, masks, failures)
            ctx.close()

        browser.close()

    print()
    print(
        f"wave490   {tally['shots']} shots · {tally['runs']} empty runs over "
        f"{EMPTY_RUN_MAX}px · {tally['spans']} span type nodes, {tally['spanbad']} under "
        f"floor · {tally['verify']} Verify readings, {tally['verifybad']} under 44 · "
        f"{tally['cards']} cards, {tally['cardbad']} with a tail over {CARD_TAIL_MAX}px · "
        f"{tally['pills']} pills, {tally['pillbad']} splitting a verb · "
        f"{tally['peek']} peek readings, {tally['peekbad']} under the ink floor · "
        f"{tally['clashes']} fixed-layer clashes"
    )
    if soft:
        print()
        print(f"BEFORE: {len(soft)} readings that the wave 490 brief calls defects")
        for line in soft:
            print(f"  · {line}")
    if failures:
        print()
        print(f"FAILED: {len(failures)}")
        for line in failures:
            print(f"  · {line}")
        raise SystemExit(1)
    print("PASSED")


if __name__ == "__main__":
    main()
