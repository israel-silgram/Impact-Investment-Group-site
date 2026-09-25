"""Wave 421 gate: the hero's warm ground, and the curved divider's two colours.

    STATIC_BUILD=true bun run build
    python scripts/wave421-hero-and-footer.py

Three things are proved here, and all three are read off the RENDERED PIXELS
of a screenshot this script takes itself rather than off token values or
computed styles. A token says what a colour would be on a flat ground; the
hero is not a flat ground any more, and that is the whole of wave 421.

  A. THE FULL-BLEED DECORATIVE IMAGE IS NOT SERVED AT 400px.

     The hero's street wash is `object-cover` across the entire section. Wave
     414 gave it `sizes="320px"` to save bytes, which was right while it was
     painted at seven per cent and invisible; at the opacity Callum asked for
     on 19 September it is a 400px file stretched across 1905, and the
     stretching is visible. This loads `/` at every (width, density) pair in
     VARIANT_PROFILES and reads `currentSrc`, failing on either end of the
     range: a viewport wider than VARIANT_MIN_VIEWPORT that resolves to the
     400px step, and ANY profile that resolves to the 1672px ORIGINAL.

     ⚠ THE DENSITIES ARE THE POINT AND THEY WERE MISSING. `sizes` is in CSS
     pixels and the browser multiplies by the screen's density before
     choosing, so a check that opens every context at `device_scale_factor=1`
     is blind to three quarters of the expression it is checking. That blind
     spot hid the 2x case, which this wave's own review sub-agent found by
     arithmetic, and then hid the 1x-to-1.5x band, which the rel421 verdict
     found the same way. Both are now read off a real browser at a real
     density instead.

     AND IT CHECKS EVERY OTHER IMAGE ON EVERY PAGE for the same fault, rather
     than only the one Callum happened to see: any `<img>` whose chosen source
     is narrower than its own rendered CSS box by more than UPSCALE_TOLERANCE
     is reported. Reported, not asserted, because a decorative wash MAY be
     deliberately under-served and the judgement is a person's; the list is
     printed so the report can state what was found and what was left.

  B. EVERY PAIR OF INK AND GROUND IN THE HERO STILL MEETS ITS FLOOR.

     The hero's ground is now a photograph at HERO_OPACITY under a warm wash,
     so nothing over it sits on a flat colour and no token value describes
     what a glyph actually contrasts against. Each selector in HERO_PAIRS is
     measured the way `scripts/wave412-screenshots.py` measures an axe
     INCOMPLETE node: the element's own computed colour composited over the
     modal non-glyph pixel inside its own box, against the floor its size and
     weight answer to. The WORST pixel of the ground is READ AND PRINTED
     beside the modal one, because a mean ground that passes can still carry
     a dark window frame under one word. It is NOT asserted, and saying so
     here is the point: the orange headline over the hero's photograph reads
     3.48:1 on its modal ground and lower on the darkest pixel a glyph
     touches, which is true of any word set over any photograph and is not
     the pair WCAG measures. The modal reading is the asserted one.

  C. THE CURVED DIVIDER'S TWO COLOURS MATCH THE TWO SECTIONS IT JOINS.

     A curved divider has a background and a shape, and they are not free:
     THE BACKGROUND MUST BE THE COLOUR OF THE SECTION ABOVE IT AND THE SHAPE
     MUST BE THE COLOUR OF THE SECTION BELOW IT. Anything else paints a strip
     of a third colour across the page, which is the "broken white part" in
     Callum's screenshot of 19 September. This walks every page, finds every
     divider by its shape, and reads its four colours OFF THE SHOT: the pixel
     above the strip, the strip's own top-left corner, the dome at its
     thickest, and the pixel below. A computed-style reader cannot do this
     job: the strip's background is `transparent` and always was, so walking
     the ancestors reports the page ground, which is true and says nothing
     about the band a visitor is actually looking at.

Nothing here is a substitute for `scripts/wave412-screenshots.py`; that gate
still owns the dark-pixel shares, the island count and the axe run. This owns
the three things wave 421 changed.
"""

import importlib.util
import json
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
OUT = ROOT / "docs" / "screenshots" / "wave421"

# The wave 412 gate is the site's measuring instrument and this is the same
# instrument, not a second one that happens to agree. Imported by path because
# its filename is not an identifier.
_spec = importlib.util.spec_from_file_location(
    "wave412", ROOT / "scripts" / "wave412-screenshots.py"
)
w412 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(w412)

# (width, density, label), and 421c CHOSE THEM BY RULE RATHER THAN BY MACHINE.
#
# ⚠ THE FIRST TWELVE WERE A LIST OF MACHINES AND THAT IS WHY THEY MISSED. They
# were drawn from the rows in the rel421 verdict, so they sampled the band that
# verdict named and the two safe edges of the bands above it, and the gate was
# green on a site its own assertion would have failed if it had looked one
# density further in. `SIZES_HERO_GROUND` is a set of density BANDS and each
# band's worst case is at its top edge, so the rule is:
#
#   EVERY BAND IN `SIZES_HERO_GROUND` CONTRIBUTES A PROFILE AT THE WORST
#   DENSITY IT CAN SERVE, AT A VIEWPORT WIDE ENOUGH FOR ITS CAP TO BIND.
#
# The last four rows are that rule applied to the four bands 421b left capped
# for their BEST density. Add a band to `SIZES_HERO_GROUND` and add its top
# edge here, or the next reviewer finds it instead of this script.
#
# The width matters as much as the density: below about 768 CSS pixels at 2.5x
# and about 1100 at 1.75x the `50vw` half of `min()` binds instead of the cap,
# so a phone profile proves nothing about a band. That is why 412 at 1.75 and
# 390 at 3x are green and prove nothing about the 1.75x and 3x bands.
VARIANT_PROFILES = [
    # 1x, the four this started with.
    (1905, 1.0, "desktop"),
    (1280, 1.0, "laptop"),
    (768, 1.0, "tablet"),
    (390, 1.0, "phone"),
    # The 1x-to-1.5x band, from the rel421 verdict: real machines in it.
    (1905, 1.25, "125% scaling"),
    (1536, 1.25, "125% scaling"),
    (1440, 1.1, "110% zoom"),
    (1920, 1.33, "133% zoom"),
    # Band edges that were already sampled, at their SAFE end.
    (1600, 1.5, "1.5x edge"),
    (1905, 2.0, "2x edge"),
    # The two profiles the byte figures in the report are read from.
    (412, 1.75, "Lighthouse mobile"),
    (390, 3.0, "3x phone"),
    # ⚠ 421c: THE WORST DENSITY IN EVERY BAND. These four are rel421b MAJOR 1,
    # and at the 421b head every one of them took the 1672px original.
    (1905, 1.75, "1.75x band, worst"),
    (1905, 1.99, "1.75x to 2x band, worst"),
    (1210, 2.5, "2x to 2.5x band, worst"),
    (1008, 2.99, "2.5x to 3x band, worst"),
]

# The original. NOTHING MAY RESOLVE TO IT, and since 421c nothing CAN: the
# hero's ground is the one image on this site whose `srcset` is built with
# `withOriginal: false`, so 400, 640 and 960 are the only candidates it has.
# This assertion stays anyway, because it is the check that would catch the
# candidate list being widened again, and because a check that has gone red
# three times in one wave is not one to delete the moment it goes quiet.
VARIANT_ORIGINAL = "hero-ground-street.webp"

# Wider than this and a 400px source is being stretched past any honest use.
# 640 is the next step up, so a 640 viewport asking for the 400 is the last
# width at which that choice is defensible.
VARIANT_MIN_VIEWPORT = 640

# How far a served source may fall short of its own rendered box before this
# reports it. 1.0 would report every image on a 1x screen that is not served
# at exactly its box width, which is most of them and none of them a fault.
# 0.75 catches a 400 in a 1905 box (0.21) and forgives a 960 in a 1280 (0.75).
UPSCALE_TOLERANCE = 0.75

PAGES = w412.PAGES

# The hero's ink, by the job each glyph does, and every one of them sits over
# the warmed ground. `label` is what the report's table calls the row.
HERO_PAIRS = [
    ("the navy headlines", 'figcaption.text-ink'),
    # ⚠ WAVE 490: `text-orange-700`, NOT `-500`. Wave 443 moved this caption
    # from orange-500 to orange-700 when it took the Brand Kit v4 palette, and
    # did not re-run this gate, so this row has named nothing on the site since
    # 22 September and has been asserting nothing. The selector is corrected
    # rather than the row deleted: `origin/main` `f61b3b8` renders
    # `figcaption ... text-orange-700` at `src/components/home/hero.tsx:272`
    # and that is the glyph this pair is about.
    ('the orange headline "Delivering Support"', "figcaption.text-orange-700"),
    ("the wait-list sub-line", "#register-as"),
    ("a role tile name", ".hero-role-grid a span.text-ink"),
    ("a role tile purpose line", ".hero-role-grid li > span[id^='hero-role-']"),
    ('the "Powered by" credit', "p.mt-6 span.text-ink-muted"),
]

# The footer's ink, all of it on the footer's NEW white ground.
FOOTER_PAIRS = [
    ("the funnel headline, navy beats", "footer #funnel-heading ~ p span.text-ink"),
    ("the funnel headline, orange beat", "footer #funnel-heading ~ p span.text-orange-700"),
    ("the pre-release badge", "footer .eyebrow.text-teal-600, footer p.text-teal-600"),
    ("the 30+ years line", "footer p.text-ink-muted strong.text-orange-700"),
    ("the company description", "footer p.max-w-\\[74ch\\]"),
    ("a column heading", "footer nav[aria-label='Footer site links'] h2"),
    ("a site link", "footer nav[aria-label='Footer site links'] a"),
    ("a contact line", "footer a[href^='mailto:']"),
    ("the opening hours", "footer li.text-ink-muted"),
    ('the "Become a Partner" link', "footer nav[aria-label='Partner pages'] a.text-teal-600"),
    ("a registration card label", "footer li.panel p.text-ink"),
    ("a registration card detail", "footer li.panel p.text-ink-soft"),
    ("a registration verify link", "footer li.panel a.text-teal-600"),
    ("a legal link", "footer nav[aria-label='Legal and policies'] a"),
    ("the legal notice", "footer p.max-w-\\[120ch\\]"),
]


# ---------------------------------------------------------------------------
# A. THE VARIANT


IMAGE_AUDIT = r"""
() => {
  const width = (url) => {
    const match = /-(\d+)\.webp(?:[?#]|$)/.exec(url || '');
    if (match) return parseInt(match[1], 10);
    return null;
  };
  return [...document.querySelectorAll('img')].map((img) => {
    const box = img.getBoundingClientRect();
    return {
      src: img.getAttribute('src') || '',
      currentSrc: img.currentSrc || '',
      sizes: img.getAttribute('sizes') || '',
      hasSrcSet: !!img.getAttribute('srcset'),
      alt: img.getAttribute('alt') || '',
      opacity: parseFloat(getComputedStyle(img).opacity),
      boxWidth: Math.round(box.width),
      servedWidth: width(img.currentSrc),
      naturalWidth: img.naturalWidth,
    };
  });
}
"""


def audit_images(page, where, findings, failures):
    """Report every image served narrower than the box it is stretched across."""
    for img in page.evaluate(IMAGE_AUDIT):
        if img["boxWidth"] < 2:
            continue
        served = img["servedWidth"] or img["naturalWidth"]
        if not served:
            continue
        ratio = served / img["boxWidth"]
        if ratio >= UPSCALE_TOLERANCE:
            continue
        findings.append(
            (
                where,
                img["src"],
                img["sizes"] or "(none)",
                img["boxWidth"],
                served,
                round(ratio, 3),
                round(img["opacity"], 3),
            )
        )


# ---------------------------------------------------------------------------
# B. THE INK OVER THE WARMED GROUND

# Same JS as the wave 412 gate's axe collector, minus axe: a named selector
# instead of a list axe handed us. Everything the measurer needs travels with
# the node, and the two readings over white and over black are what let the
# caller recover a translucent colour's alpha and lay it on the real ground.
NODE_READ = r"""
(selector) => {
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
  let element = null;
  try {
    element = document.querySelector(selector);
  } catch (error) {
    return null;
  }
  if (!element) return null;
  const style = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  if (box.width < 2 || box.height < 2) return null;
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
  return {
    target: selector,
    text: (element.innerText || element.textContent || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 60),
    colour: style.color,
    overWhite: read(style.color, '#ffffff'),
    overBlack: read(style.color, '#000000'),
    inks: [...inks].map((value) => read(value, '#ffffff')),
    fontSize: parseFloat(style.fontSize) || 0,
    fontWeight: parseInt(style.fontWeight, 10) || 400,
    rect: [
      Math.floor(box.left + scrollX),
      Math.floor(box.top + scrollY),
      Math.ceil(box.right + scrollX),
      Math.ceil(box.bottom + scrollY),
    ],
    // ⚠ WAVE 490: the same reading `scripts/wave412-screenshots.py` takes, for
    // the same reason and with the same words beside it there. Below 768px the
    // hero is a snap strip and the second slide's caption is a sliver past the
    // right edge of it: off the screen rather than unmeasurable. This collector
    // is wave 421's own, so the flag has to be computed here too or the shared
    // `measure_incomplete` has nothing to read. Wave 490b (ruling C) narrowed
    // it to `.hero-band` below 768, the same as wave 412's collector.
    pastScrollEdge: (() => {
      const strip = innerWidth < 768 ? element.closest('.hero-band') : null;
      if (!strip || strip.scrollWidth <= strip.clientWidth + 2) return false;
      const lane = strip.getBoundingClientRect();
      const shown = Math.min(box.right, lane.right) - Math.max(box.left, lane.left);
      return shown < box.width / 2;
    })(),
  };
}
"""


def measure_pairs(shot: Path, nodes, rows, failures, where):
    """Measure each collected node off the shot, and assert its floor.

    THE WORST GROUND PIXEL IS MEASURED AS WELL AS THE MODAL ONE. Over a flat
    band those two are the same number; over a photograph they are not, and
    the whole reason this script exists is that the hero is no longer flat.
    The modal reading is the one asserted, because it is the ground the glyph
    predominantly sits on and it is what `scripts/wave412-screenshots.py`
    asserts; the worst is printed beside it so a pair that only just passes on
    average cannot pass silently.
    """
    # ⚠ WAVE 490 added a third bucket to `measure_incomplete`: a node past
    # the edge of its own horizontal scroll container, which is off the
    # screen rather than unmeasurable. It is carried here so a node in that
    # bucket is reported with its own reason instead of "not measured".
    measured, unmeasured, off_screen = w412.measure_incomplete(shot, nodes)
    by_target = {row[0]: row for row in measured}
    skipped = {row[0] for row in off_screen}

    with Image.open(shot) as image:
        pixels = image.convert("RGB").load()
        size = image.size

    for node in nodes:
        row = by_target.get(node["target"])
        if row is None:
            if node["target"] in skipped:
                print(f"    --  off screen: {node['target']}")
                continue
            reason = next(
                (u[-1] for u in unmeasured if u[0] == node["target"]), "not measured"
            )
            failures.append(f"{where}: {node['target']} could not be measured ({reason})")
            continue
        _, text, colour, font_size, font_weight, ground, glyph, ratio, floor = row

        # The darkest non-glyph pixel in the box: the worst ground any part of
        # this glyph is set on.
        left, top, right, bottom = node["rect"]
        left, top = max(0, left), max(0, top)
        right, bottom = min(size[0], right), min(size[1], bottom)
        worst = None
        worst_lum = 2.0
        inks = [tuple(i) for i in node["inks"]]
        for y in range(top, bottom):
            for x in range(left, right):
                pixel = pixels[x, y]
                if any(
                    max(abs(a - b) for a, b in zip(pixel, ink)) <= w412.GLYPH_TOLERANCE
                    for ink in inks
                ):
                    continue
                lum = w412.luminance(pixel)
                if lum < worst_lum:
                    worst_lum, worst = lum, pixel
        worst = worst or ground
        worst_ratio = w412.contrast(
            w412.composite(node["overWhite"], node["overBlack"], worst), worst
        )

        rows.append(
            {
                "where": where,
                "target": node["target"],
                "label": node.get("label", node["target"]),
                "text": text,
                "colour": colour,
                "size": font_size,
                "weight": font_weight,
                "ground": ground,
                "glyph": glyph,
                "ratio": ratio,
                "worstGround": worst,
                "worstRatio": worst_ratio,
                "floor": floor,
            }
        )
        if ratio < floor:
            failures.append(
                f"{where}: {node.get('label', node['target'])} "
                f"({text[:32]!r}) reads {ratio:.2f}:1 on rgb{ground} "
                f"against a floor of {floor:.1f}:1"
            )


# ---------------------------------------------------------------------------
# C. THE DIVIDER'S TWO COLOURS

# A divider is a strip whose only content is a stretched `<svg>` with one
# filled path. Found by SHAPE rather than by class, so a second one added
# anywhere on the site is caught without this list being maintained by hand.
#
# This returns only the strip's document rectangle. THE FOUR COLOURS ARE READ
# OFF THE SCREENSHOT, not off `getComputedStyle`, and the difference is the
# whole defect wave 421 exists to fix: the strip's own background IS
# transparent and always was, and a computed-style reader walks up to the
# page ground and reports a colour that is technically true and tells you
# nothing about the band a visitor is looking at. The pixel above the strip
# is the section above it. Nothing else is.
DIVIDER_READ = r"""
() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg[preserveAspectRatio="none"]')) {
    const path = svg.querySelector('path[fill]');
    if (!path) continue;
    const strip = svg.parentElement;
    const box = strip.getBoundingClientRect();
    if (box.width < 100 || box.height < 4) continue;
    out.push({
      path: path.getAttribute('d').slice(0, 24),
      fill: path.getAttribute('fill'),
      host: strip.closest('footer') ? 'footer' : (strip.closest('main') ? 'main' : 'page'),
      rect: [
        Math.floor(box.left + scrollX),
        Math.floor(box.top + scrollY),
        Math.ceil(box.right + scrollX),
        Math.ceil(box.bottom + scrollY),
      ],
    });
  }
  return out;
}
"""


# ONE CURVED DIVIDER PER PAGE: the footer's arch, drawn by `SiteFooter`.
# Section C used to iterate whatever `DIVIDER_READ` returned and assert
# nothing about the count, so rebuilding the arch with a `clip-path`, or
# dropping its `preserveAspectRatio="none"`, would have emptied the list and
# printed an empty table under a green run.
DIVIDERS_PER_PAGE = 1

# ⚠ EXCEPT ON THE 404, WHICH HAS NO FOOTER AT ALL. `dist/client/404.html` is
# a 1,039-byte standalone shell: a heading, a line of copy and a link home,
# with no header, no footer and none of the site's own chrome. That is a
# deliberate decision of an earlier wave (a 404 that hydrates the home
# route's state against an unknown URL threw before first paint, which is
# what wave 412's "the page has words on it" assertion was written for), and
# it is why the fifteen footer pairs and the one divider are absent there.
#
# Named as a SET rather than forgiven by a bare `if not dividers: continue`,
# because the whole point of the count is that a footer vanishing from a real
# page fails the run. Add a page here only by deciding it has no footer.
PAGES_WITHOUT_FOOTER = {"/this-route-does-not-exist"}

# Darker than any ground this site has and lighter than any ink on it. The two
# light grounds are white (relative luminance 1.0) and the cream (0.845); the
# arch's own hairline is `--color-rule`, slate at 20% over one of those, which
# reads about 0.72. Body ink is navy-900 at 0.008 and the palest type token,
# `ink-soft`, is 0.18. 0.5 clears both by a wide margin.
ARCH_INK_LUMINANCE = 0.5

# A stray anti-aliased pixel is not a covered line. One 15px line of type
# inside the strip paints hundreds.
ARCH_INK_TOLERANCE = 24


def check_arch_is_clear(shot: Path, dividers, failures, where):
    """Fail if ink pokes out from under the arch's strip. A backstop, not a proof.

    THE COLOUR RULE ABOVE CANNOT SEE THIS, because a covered line is covered
    by exactly the right colour. The arch overlaps the page's last band by its
    own height and the band is given that height of extra padding to be
    overlapped; the pair keeps the page the height it was. What the pairing
    does NOT guarantee by itself is that the padding landed on the element
    carrying the band's content: the rule that adds it names
    `#main > :last-child`, and on the routes that render a `<main>` of their
    own that is a transparent wrapper rather than the coloured band inside it.

    ⚠ TWO LIMITS, AND THE DOCSTRING USED TO STATE THIS MORE BROADLY THAN IT
    HOLDS (421b, rel421 MINOR 4). It said "whatever the padding landed on, no
    pixel inside the strip may be dark enough to be type", which is not what
    it can see.

    1. IT ONLY SEES WHAT THE DOME DOES NOT COVER. The dome is filled
       `var(--color-page)` and is painted OVER the last band, so a line of
       type that falls entirely under the fill is hidden by white pixels and
       raises no dark pixel at all. What this catches is the two transparent
       corners and the glyph tops that poke through the curve near the edges,
       which is exactly what caught the home page's "Public data used under
       licence" credit, and the middle of the strip is where a centred
       trailing line would sit. THE MEASUREMENT THAT COVERS THE MIDDLE IS
       `report_last_child_padding` BELOW, which reads the element the padding
       rule names on every route and proves the premise rather than assuming
       it.
    2. IT COUNTS ANY DARK PIXEL AS TYPE. `ARCH_INK_LUMINANCE` with a
       tolerance of a few dozen pixels cannot tell a glyph from a plate, so a
       route that ever ends on one of wave 412's two declared navy islands
       would fail this with a message about covered content while the corners
       were in fact showing that band's own correct colour. No route does
       today; if one ever does, read the shot before believing the message.
    """
    with Image.open(shot) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        pixels = rgb.load()
        for divider in dividers:
            left, top, right, bottom = divider["rect"]
            left, top = max(0, left), max(0, top)
            right, bottom = min(width, right), min(height, bottom)
            dark = 0
            darkest = 1.0
            for y in range(top, bottom):
                for x in range(left, right):
                    value = w412.luminance(pixels[x, y])
                    if value < ARCH_INK_LUMINANCE:
                        dark += 1
                        darkest = min(darkest, value)
            if dark > ARCH_INK_TOLERANCE:
                failures.append(
                    f"{where}: {dark} pixels inside the curved divider's strip are "
                    f"darker than {ARCH_INK_LUMINANCE} (darkest {darkest:.3f}). The "
                    f"arch is pulled up over the page's last band and has covered "
                    f"something that is not that band's trailing space."
                )


# The utilities that would be REPLACED rather than added to by
# `#main > :last-child { padding-bottom: clamp(36px,4.5vw,80px) }`. Tailwind
# emits its utilities inside `@layer utilities` and that rule is unlayered, so
# it outranks every one of these on the same element.
#
# ⚠ `p-` IS IN THE LIST AND IT WAS MISSING (421c, rel421b MINOR 2). An
# all-sides `p-10` sets `padding-bottom` exactly as `pb-10` does, is outranked
# by the same unlayered rule for the same reason, and produces the same
# failure: the band's trailing space becomes exactly the arch's height and the
# arch covers all of it. The old pattern would have printed "none" for it and
# passed. THE HYPHEN IMMEDIATELY AFTER IS WHAT KEEPS THE LIST HONEST: `px-`,
# `pt-`, `pl-`, `pr-`, `ps-`, `pe-` and `pointer-events-none` all fail to
# match, and none of them sets padding-bottom.
PADDING_UTILITY = r"(^|\s)(?:[a-z-]+:)?(?:pb|py|p)-[^\s]+"

LAST_CHILD_READ = """
(pattern) => {
  const main = document.querySelector('#main');
  if (!main) return null;
  const last = main.lastElementChild;
  if (!last) return null;
  const cls = last.getAttribute('class') || '';
  const style = getComputedStyle(last);
  return {
    tag: last.tagName.toLowerCase(),
    cls: cls.slice(0, 40),
    utilities: (cls.match(new RegExp(pattern, 'g')) || []).map((m) => m.trim()),
    paddingBottom: style.paddingBottom,
    background: style.backgroundColor,
  };
}
"""


def report_last_child_padding(page, path, rows, failures):
    """Read the element `#main > :last-child` names, and what padding it had.

    THE PREMISE THIS PROVES. `src/styles.css` says the padding rule "REPLACES
    a `padding-bottom` RATHER THAN ADDING TO ONE" and that "no route's last
    child carries one today". That was asserted and not measured, and a
    replaced `pb-24` would shrink real trailing space to nothing WITHOUT
    producing a single dark pixel inside the strip, so `check_arch_is_clear`
    is no backstop for it (421b, rel421 MINOR 4).

    This reads the element on every route and fails if one of them carries a
    `pb-*` or `py-*` utility, because that is the day the premise stops being
    true and the day somebody has to decide what the padding should be.
    """
    read = page.evaluate(LAST_CHILD_READ, PADDING_UTILITY)
    if read is None:
        rows.append((path, "(no #main)", "", "", ""))
        return
    rows.append(
        (
            path,
            f"{read['tag']} {read['cls']}".strip(),
            " ".join(read["utilities"]) or "none",
            read["paddingBottom"],
            read["background"],
        )
    )
    if read["utilities"]:
        failures.append(
            f"{path}: `#main > :last-child` carries {read['utilities']}, which the "
            f"unlayered `#main > :last-child {{ padding-bottom }}` rule in "
            f"src/styles.css REPLACES rather than adds to. That band's trailing "
            f"space is now exactly the arch's height and the arch covers all of it. "
            f"Decide what the padding should be rather than letting the rule win."
        )


def same(a, b, tolerance=4):
    if a is None or b is None:
        return False
    return all(abs(x - y) <= tolerance for x, y in zip(a[:3], b[:3]))


def check_dividers(shot: Path, dividers, rows, failures, where):
    """Read a divider's four colours off the shot and assert the two rules.

    THE RULE, and it is the general one rather than a patch on one footer:
    a curved divider's BACKGROUND must be the colour of the section ABOVE it
    and its SHAPE must be the colour of the section BELOW it. Break either
    and the page paints a strip of a third colour between two bands, which is
    exactly the broken white band Callum photographed on 19 September.

    ⚠ EVERY PAIR IS READ IN THE SAME COLUMN, and that is not a detail. The
    first draft of this read the strip's left corner and compared it to the
    pixel above the strip's CENTRE, and reported four false mismatches on
    pages whose last band is not one flat colour across its whole width: a
    cream register page with a white card down the middle answered white at
    the centre and cream at the edge, and neither reading was wrong. What a
    visitor sees as an orphaned strip is a DISCONTINUITY IN A COLUMN, so the
    comparison is made in a column.

    The sample points, all of them pixels, at both edges and the centre:

      background  three rows into the strip, three columns in from each edge.
                  At x=0 and x=1440 the dome's own path is at the very bottom
                  of the viewBox, so both top corners are background and
                  nothing else. These are the pixels that WERE white on a
                  cream page. Each is compared to the pixel three rows above
                  it in the same column.
      shape       three quarters of the way down the strip, at the centre,
                  where the dome is at its thickest, compared to the pixel
                  three rows below the strip in the same column.

    TOLERANCE 4 PER CHANNEL rather than exact. A card shadow, a rule's
    anti-aliasing or a 1% tint bleeding to the edge of a band moves a channel
    by two or three, and a gate that fails on that fails on everything. The
    defect this exists for is 8 units of luminance wide at its smallest
    (white 255 against cream 247 in the blue channel it is 25) and nothing
    near the tolerance.
    """
    with Image.open(shot) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        pixels = rgb.load()

        def read(x, y):
            if 0 <= x < width and 0 <= y < height:
                return pixels[x, y]
            return None

        for divider in dividers:
            left, top, right, bottom = divider["rect"]
            centre = (left + right) // 2
            corners = []
            for name, x in (("left", left + 3), ("right", right - 4)):
                corners.append((name, x, read(x, top - 3), read(x, top + 3)))
            shape = read(centre, top + int((bottom - top) * 0.75))
            below = read(centre, bottom + 3)
            shape_ok = same(shape, below)
            background_ok = all(same(corner, above) for _, _, above, corner in corners)
            rows.append(
                {
                    "where": where,
                    "host": divider["host"],
                    "fill": divider["fill"],
                    "rect": divider["rect"],
                    "above": corners[0][2],
                    "corner": corners[0][3],
                    "aboveRight": corners[1][2],
                    "cornerRight": corners[1][3],
                    "shape": shape,
                    "below": below,
                    "ok": bool(background_ok and shape_ok),
                }
            )
            for name, x, above, corner in corners:
                if same(corner, above):
                    continue
                failures.append(
                    f"{where}: a curved divider's background reads rgb{corner} at "
                    f"its {name} corner but the section above it reads rgb{above} in "
                    f"the same column (x={x}). A divider's background must be the "
                    f"colour of the section ABOVE it."
                )
            if not shape_ok:
                failures.append(
                    f"{where}: a curved divider's shape reads rgb{shape} but the "
                    f"section below it reads rgb{below}. A divider's shape must be "
                    f"the colour of the section BELOW it."
                )


# ---------------------------------------------------------------------------


def main() -> None:
    if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    if not BUILD.exists():
        sys.exit("dist/client is missing. Run STATIC_BUILD=true bun run build first.")
    OUT.mkdir(parents=True, exist_ok=True)

    port = w412.serve(BUILD)
    base = f"http://127.0.0.1:{port}"
    failures: list[str] = []
    missing: list[tuple] = []
    upscaled: list[tuple] = []
    variant_rows: list[tuple] = []
    variant_sizes = ""
    contrast_rows: list[dict] = []
    divider_rows: list[dict] = []
    last_child_rows: list[tuple] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        # A. the hero wash's chosen variant, at every width AND every density.
        for width, density, label in VARIANT_PROFILES:
            context = browser.new_context(
                viewport={"width": width, "height": 900}, device_scale_factor=density
            )
            page = context.new_page()
            page.goto(f"{base}/", wait_until="networkidle")
            w412.settle(page)
            w412.to_top(page)
            chosen = page.evaluate(
                "() => { const i = document.querySelector('[data-hero-wash]') || "
                "document.querySelector('img[class*=\"object-cover\"][alt=\"\"]'); "
                "return i ? { currentSrc: i.currentSrc, sizes: i.getAttribute('sizes'), "
                "box: Math.round(i.getBoundingClientRect().width), "
                "dpr: devicePixelRatio, "
                "opacity: getComputedStyle(i).opacity } : null; }"
            )
            where = f"/ at {width} x {density}"
            if chosen is None:
                failures.append(f"{where}: the hero wash image was not found at all")
            else:
                name = chosen["currentSrc"].rsplit("/", 1)[-1]
                variant_sizes = chosen["sizes"] or ""
                variant_rows.append(
                    (
                        width,
                        density,
                        label,
                        name,
                        chosen["box"],
                        round(chosen["box"] * density),
                        chosen["opacity"],
                    )
                )
                if width > VARIANT_MIN_VIEWPORT and name.endswith("-400.webp"):
                    failures.append(
                        f"{where}: the hero wash resolved to {name}, a 400px "
                        f"source stretched across a {chosen['box']}px box. Widen its "
                        f"`sizes`."
                    )
                # ⚠ THE OTHER END OF THE RANGE, and the check the rel421
                # verdict held the push for. A profile that resolves to the
                # original is a profile whose `sizes` branch is not divided by
                # its own density.
                if name == VARIANT_ORIGINAL:
                    failures.append(
                        f"{where} ({label}): the hero wash resolved to {name}, the "
                        f"1672px ORIGINAL. Every density must ask for at most 960 "
                        f"device pixels; this one asked for more, so its band in "
                        f"SIZES_HERO_GROUND is missing or is not divided by its "
                        f"density."
                    )
            context.close()

        # A (continued), B and C: every page, at 1280 and 390.
        for path, slug in PAGES:
            for width in (1280, 390):
                context = browser.new_context(
                    viewport={"width": width, "height": 900}, device_scale_factor=1
                )
                page = context.new_page()
                page.goto(f"{base}{path}", wait_until="networkidle")
                w412.settle(page)
                offset = w412.to_top(page)
                where = f"{path} at {width}"
                if offset > 0.5:
                    failures.append(f"{where}: would not return to the top ({offset}px)")
                    context.close()
                    continue

                audit_images(page, where, upscaled, failures)
                if width == 1280:
                    report_last_child_padding(page, path, last_child_rows, failures)
                dividers = page.evaluate(DIVIDER_READ)

                pairs = list(HERO_PAIRS) if path == "/" else []
                if path not in PAGES_WITHOUT_FOOTER:
                    pairs += FOOTER_PAIRS
                nodes = []
                for label, selector in pairs:
                    node = page.evaluate(NODE_READ, selector)
                    if node is None:
                        # RECORDED, NOT SILENTLY SKIPPED. A selector that names
                        # nothing is the shape of the one regression this
                        # section exists to catch: put the hero credit back to
                        # `text-ink-soft` and a skip-on-miss gate prints "All
                        # assertions passed" with the 4.42:1 failure back on
                        # the page. The misses are listed and a pair that
                        # resolves on NO shot fails the run.
                        missing.append((where, label, selector))
                        continue
                    node["label"] = label
                    nodes.append(node)

                shot = OUT / f"{slug}-{width}.png"
                page.screenshot(path=str(shot), full_page=True)
                measure_pairs(shot, nodes, contrast_rows, failures, where)
                expected = 0 if path in PAGES_WITHOUT_FOOTER else DIVIDERS_PER_PAGE
                if len(dividers) != expected:
                    failures.append(
                        f"{where}: found {len(dividers)} curved divider(s), "
                        f"expected {expected}. Either the footer's arch is no longer "
                        f"a stretched <svg> with a filled path, in which case teach "
                        f"DIVIDER_READ the new shape; or a second one has been added, "
                        f"in which case raise DIVIDERS_PER_PAGE and say why; or this "
                        f"page has lost its footer."
                    )
                check_dividers(shot, dividers, divider_rows, failures, where)
                check_arch_is_clear(shot, dividers, failures, where)
                context.close()

        browser.close()

    print("\n── A. THE HERO WASH'S CHOSEN VARIANT, BY WIDTH AND DENSITY ──")
    print(f"`sizes` is {variant_sizes or '(none)'}")
    print(
        f"{'viewport':>9}{'dpr':>6}  {'profile':<20}{'chosen source':<34}"
        f"{'box css':>8}{'box dev':>9}  opacity"
    )
    for width, density, label, name, box, device_box, opacity in variant_rows:
        print(
            f"{width:>9}{density:>6}  {label:<20}{name:<34}"
            f"{box:>8}{device_box:>9}  {opacity}"
        )

    print(f"\n── A2. IMAGES SERVED UNDER {UPSCALE_TOLERANCE:.0%} OF THEIR BOX ──")
    if not upscaled:
        print("None. Every image on every page is served at or near its rendered width.")
    else:
        seen = set()
        print(f"{'src':<48}{'sizes':<24}{'box':>6}{'served':>8}{'ratio':>8}{'opacity':>9}  first seen")
        for where, src, sizes, box, served, ratio, opacity in upscaled:
            key = (src, box, served)
            if key in seen:
                continue
            seen.add(key)
            print(f"{src:<48}{sizes:<24}{box:>6}{served:>8}{ratio:>8.3f}{opacity:>9}  {where}")

    print("\n── B. INK MEASURED OFF THE RENDERED PIXELS ──")
    print(
        f"{'where':<18}{'pair':<42}{'size/wt':>9}{'ground':>18}{'ratio':>8}"
        f"{'worst':>18}{'worst':>8}{'floor':>7}"
    )
    for row in sorted(contrast_rows, key=lambda r: r["ratio"]):
        print(
            f"{row['where']:<18}{row['label'][:41]:<42}"
            f"{row['size']:.0f}/{row['weight']:<5}"
            f"{str(row['ground']):>18}{row['ratio']:>8.2f}"
            f"{str(row['worstGround']):>18}{row['worstRatio']:>8.2f}"
            f"{row['floor']:>7.1f}"
        )

    print("\n-- C0. THE ELEMENT `#main > :last-child` NAMES, AND ITS OWN PADDING --")
    print(
        f"{'route':<32}{'element':<28}{'pb/py utility':<16}{'computed pb':>12}  background"
    )
    for path, element, utilities, padding, background in last_child_rows:
        print(f"{path:<32}{element:<28}{utilities:<16}{padding:>12}  {background}")

    print("\n── C. EVERY CURVED DIVIDER ON THE SITE ──")
    print(f"{'where':<34}{'host':<8}{'above':>18}{'background':>18}{'shape':>18}{'below':>18}  verdict")
    for row in divider_rows:
        print(
            f"{row['where']:<34}{row['host']:<8}{str(row['above']):>18}"
            f"{str(row['corner']):>18}{str(row['shape']):>18}{str(row['below']):>18}"
            f"  {'correct' if row['ok'] else 'MISMATCH'}"
        )

    print("\n-- B2. PAIRS WHOSE SELECTOR NAMED NOTHING ON A SHOT --")
    if not missing:
        print("None. Every pair in the table resolved on every shot.")
    else:
        for where, label, selector in missing:
            print(f"  {where:<34}{label:<42}{selector}")

    # A PAIR THAT STOPS RESOLVING ANYWHERE IS THE REGRESSION, not an absence.
    # Per-shot misses are legitimate and listed above: the hero pairs only
    # exist on `/`, and a footer column can collapse out of a narrow shot. A
    # row that resolves on NO shot in the run has been asserting nothing since
    # whoever renamed its class, which is the hole this closes.
    resolved = {row["label"] for row in contrast_rows}
    for label, selector in HERO_PAIRS + FOOTER_PAIRS:
        if label not in resolved:
            failures.append(
                f"the pair {label!r} resolved on NO shot in the run. Its selector "
                f"({selector}) names nothing on this site any more, so the row has "
                f"been asserting nothing. Fix the selector or delete the row."
            )

    (OUT / "measurements.json").write_text(
        json.dumps(
            {
                "variants": variant_rows,
                "upscaled": upscaled,
                "contrast": contrast_rows,
                "missing": missing,
                "lastChildren": last_child_rows,
                "dividers": divider_rows,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print(
        f"\n{len(variant_rows)} variant readings · {len(upscaled)} under-served images · "
        f"{len(contrast_rows)} pairs measured · {len(divider_rows)} dividers read"
    )
    if failures:
        print(f"\nFAILED ({len(failures)}):")
        for failure in failures:
            print(f"  - {failure}")
        sys.exit(1)
    print("All assertions passed.")


if __name__ == "__main__":
    main()
