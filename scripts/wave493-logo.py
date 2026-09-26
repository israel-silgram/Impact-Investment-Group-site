"""Wave 493: one logo on every page, the one-line lockup, sized to fit at every width.

    python scripts/wave493-logo.py --build <dir> --mode before   # measure, never fail
    python scripts/wave493-logo.py                               # the guard, on dist/client

Callum, 26 Sep 2026: every page shows the logo as the platform's bar shows it,
the ring-and-house mark, a rule and "Impact Investment Group" on ONE line, and
because that artwork is a different shape from the stacked one (6.47:1 against
2.69:1) it is sized so it fits every page on desktop and on the phone.

WHAT THIS READS, at every width in PROFILES and on every route in ROUTES:

  the bar      the lockup's box, the rendered file, the logo link's box at the
               top and scrolled (the bar condenses and scales the link), and
               the box of every control to the lockup's right
  the panel    the phone menu, opened, with its own lockup and close button
  the footer   the lockup and the grid column it sits in

WHAT IT ASSERTS, in `--mode after` (the default):

  1. The lockup is never squeezed: its box is between ASPECT_MIN and
     ASPECT_MAX wide per unit of height, and so is the file it decoded. The
     stacked artwork is 2.69 and fails both.
  2. The file is the lockup and nothing else: `logo-lockup` or its reverse,
     at the original width or one of the steps the responsive script wrote.
  3. The lockup runs at the height R493-3 gives its surface: BAR_PHONE on a
     bar under 640px wide or under 480px tall, BAR_WIDE from 640px except
     BAR_NAV from 1280 to 1439, where the nav shares the bar and the spaces
     either side of it are held to NAV_SPACE_MIN, the
     panel at the bar's phone size everywhere, the footer at FOOTER unless
     its grid column is narrower than that, in which case it fills the column
     at full aspect.
  4. At least GAP_MIN between the lockup and the first control to its right,
     measured from where that control starts at its full 44px width, in the
     bar and in the panel; the menu and close buttons keep that width and can
     be pressed; nothing overlaps the viewport's edge.
  5. The logo link is a 44px target at the top and in the condensed bar.
  6. No route scrolls sideways.

`--mode before` takes the same readings and the same shots on the base build,
prints what would fail and exits 0: it is the record of where the stacked
lockup sat, which the after run's pairing reads back.

THE PAIRING (R493-6). At 1280 the after run compares its header and footer
shots with the before run's, pixel for pixel, OUTSIDE the boxes the logo is
allowed to move: the lockup's own box before and after, the nav it pushes
along the bar, and the footer's first column, which is the one column the
lockup's height moves. Any other differing pixel is a defect.
"""

from __future__ import annotations

import argparse
import functools
import http.server
import json
import re
import socketserver
import sys
import threading
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
SHOTS = ROOT / "docs" / "screenshots" / "wave493"
DATA = ROOT / "docs" / "wave493"

# (label, width, height, touch). 667x375 is the phone held sideways, where
# the bar is 56px whatever the width says.
PROFILES = [
    ("360", 360, 800, True),
    ("390", 390, 844, True),
    ("414", 414, 896, True),
    ("667x375", 667, 375, True),
    ("768", 768, 1024, True),
    ("1024", 1024, 800, False),
    ("1280", 1280, 900, False),
    ("1440", 1440, 900, False),
]

ROUTES = [
    ("/", "home"),
    ("/platform", "platform"),
    ("/about", "about"),
    ("/partners", "partners"),
    ("/register", "register"),
]

# The one-line artwork is 2006 by 310, which is 6.47. Its steps are resampled
# to a rounded height, so a 400px step is 400 by 62 (6.45).
ASPECT_MIN = 6.3
ASPECT_MAX = 6.6

# R493-3, the measured heights. See the sizing note in src/components/logo.tsx
# for the arithmetic that chose each one.
BAR_PHONE = (32.0, 36.0)
BAR_WIDE = (44.0, 48.0)
# 1280 to 1439, where the six nav links and the two actions share the bar and
# 44px does not fit. See the sizing note in src/components/logo.tsx.
BAR_NAV = (36.0, 36.0)
# And there the two spaces justify-between leaves either side of the nav are
# no tighter than the nav's own 28px between links, so logo, nav and actions
# still read as three groups rather than one run.
NAV_SPACE_MIN = 28.0
FOOTER = (40.0, 48.0)
GAP_MIN = 12.0
TARGET_MIN = 44.0
EPSILON = 0.5

FILE = re.compile(r"^logo-lockup(-reverse)?(-(400|640|960|1440))?\.webp$")

READ = """
(scope) => {
  const seen = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (parseFloat(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1;
  };
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height,
             right: r.right, bottom: r.bottom + scrollY };
  };
  const root = document.querySelector(scope);
  if (!root) return null;
  const img = root.querySelector('img[src*="/images/brand/logo"]');
  if (!img) return { img: null };
  const link = img.closest('a');
  const mine = img.getBoundingClientRect();
  const controls = [...root.querySelectorAll('a[href], button')]
    .filter((el) => el !== link && seen(el))
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.left >= mine.left && r.top < mine.bottom && r.bottom > mine.top)
    .sort((a, b) => a.r.left - b.r.left)
    .map(({ el, r }) => ({
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
      x: r.left, w: r.width, h: r.height,
    }));
  const column = img.closest('footer') ? img.closest('div.flex-col') : null;
  return {
    img: box(img),
    file: (img.currentSrc || img.src || '').split('/').pop(),
    natural: [img.naturalWidth, img.naturalHeight],
    complete: img.complete,
    link: box(link),
    root: box(root),
    column: box(column),
    nav: box(root.querySelector('nav')),
    controls,
    vw: innerWidth,
    vh: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
  };
}
"""


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory: Path) -> int:
    handler = functools.partial(Quiet, directory=str(directory))
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def settle_images(page):
    page.wait_for_function(
        "() => [...document.images].filter((i) => i.src.includes('/images/brand/logo'))"
        ".every((i) => i.complete && i.naturalWidth > 0)",
        timeout=15000,
    )


def still(page, selector: str):
    """Wait for every animation on and under `selector` to finish."""
    page.wait_for_function(
        """(sel) => {
          const el = document.querySelector(sel);
          return !!el && el.getAnimations({ subtree: true })
            .every((a) => a.playState !== 'running');
        }""",
        arg=selector,
        timeout=10000,
    )


def band_for_bar(label: str, width: int, height: int) -> tuple[float, float]:
    if width < 640 or height <= 480:
        return BAR_PHONE
    if 1280 <= width < 1440:
        return BAR_NAV
    return BAR_WIDE


def check_lockup(r, where, failures, band, gap_needed: bool, fit_column: bool = False):
    """The assertions every surface shares. Returns the reading's summary."""
    img = r["img"]
    aspect = img["w"] / img["h"] if img["h"] else 0.0
    nw, nh = r["natural"]
    natural = nw / nh if nh else 0.0
    summary = {
        "height": round(img["h"], 2),
        "width": round(img["w"], 2),
        "aspect": round(aspect, 3),
        "file": r["file"],
        "natural": [nw, nh],
    }
    if not (ASPECT_MIN <= aspect <= ASPECT_MAX):
        failures.append(
            f"{where}: the lockup's box is {img['w']:.1f} by {img['h']:.1f}, an aspect of "
            f"{aspect:.3f}, outside {ASPECT_MIN} to {ASPECT_MAX}. The one-line lockup is "
            f"6.47 and the stacked one 2.69."
        )
    if not (ASPECT_MIN <= natural <= ASPECT_MAX):
        failures.append(
            f"{where}: the decoded file {r['file']} is {nw} by {nh} ({natural:.3f}), which "
            f"is not the one-line artwork."
        )
    if not FILE.match(r["file"]):
        failures.append(f"{where}: the rendered file is {r['file']!r}, not the lockup.")
    lo, hi = band
    if fit_column and r.get("column"):
        column = r["column"]
        summary["column"] = round(column["w"], 2)
        if img["right"] > column["right"] + EPSILON:
            failures.append(
                f"{where}: the lockup runs to {img['right']:.1f}, past its column's "
                f"right edge at {column['right']:.1f}."
            )
        bound = img["w"] >= column["w"] - EPSILON
        if bound:
            summary["column_bound"] = True
        if not bound and not (lo - EPSILON <= img["h"] <= hi + EPSILON):
            failures.append(
                f"{where}: the lockup is {img['h']:.1f}px tall with room in its column; "
                f"the footer runs it at {lo:.0f} to {hi:.0f}."
            )
    elif not (lo - EPSILON <= img["h"] <= hi + EPSILON):
        failures.append(
            f"{where}: the lockup is {img['h']:.1f}px tall, outside the {lo:.0f} to "
            f"{hi:.0f} this surface runs it at."
        )
    if img["x"] < -EPSILON or img["right"] > r["vw"] + EPSILON:
        failures.append(
            f"{where}: the lockup runs from {img['x']:.1f} to {img['right']:.1f}, off a "
            f"{r['vw']}px viewport."
        )
    root = r["root"]
    if img["y"] < root["y"] - EPSILON or img["bottom"] > root["bottom"] + EPSILON:
        failures.append(
            f"{where}: the lockup ({img['y']:.1f} to {img['bottom']:.1f}) is cut by its "
            f"container ({root['y']:.1f} to {root['bottom']:.1f})."
        )
    if gap_needed:
        if not r["controls"]:
            failures.append(f"{where}: no control to the lockup's right to measure a gap to.")
        else:
            first = r["controls"][0]
            # R493-3 is a gap to the control AT ITS FULL WIDTH. A flex row
            # that runs out of room squeezes the menu button rather than the
            # lockup, so the button's left edge alone would still read a
            # healthy 16px of flex gap beside a 22px button; measured from
            # where a 44px button would start, the same bar reads -6.
            full = max(first["w"], TARGET_MIN) if first["label"] in (
                "Open menu", "Close menu"
            ) else first["w"]
            gap = first["x"] + first["w"] - full - img["right"]
            summary["first_control"] = first["label"]
            summary["first_control_box"] = [round(first["w"], 2), round(first["h"], 2)]
            summary["gap"] = round(gap, 2)
            if gap < GAP_MIN - EPSILON:
                failures.append(
                    f"{where}: {gap:.1f}px between the lockup and {first['label']!r}, under "
                    f"the {GAP_MIN:.0f}px R493-3 asks for."
                )
            for control in r["controls"]:
                if control["w"] < TARGET_MIN - 0.05 and control["label"] in (
                    "Open menu", "Close menu"
                ):
                    failures.append(
                        f"{where}: the {control['label']!r} control is {control['w']:.1f}px "
                        f"wide, under its 44px target."
                    )
    return summary


def shoot(page, clip, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(path), clip=clip)


def run(build: Path, mode: str, profiles, routes, out_json: Path, shots: Path) -> int:
    port = serve(build)
    base = f"http://127.0.0.1:{port}"
    failures: list[str] = []
    record: dict = {"mode": mode, "build": str(build), "readings": {}}

    with sync_playwright() as p:
        for label, width, height, touch in profiles:
            browser = p.chromium.launch()
            for route, name in routes:
                where = f"{name} @ {label}"
                ctx = browser.new_context(
                    viewport={"width": width, "height": height},
                    device_scale_factor=1,
                    is_mobile=touch,
                    has_touch=touch,
                )
                page = ctx.new_page()
                page.goto(base + route, wait_until="networkidle")
                page.wait_for_timeout(400)
                settle_images(page)
                page.evaluate("() => scrollTo({ top: 0, behavior: 'instant' })")
                page.wait_for_timeout(250)
                still(page, "header")
                reading: dict = {}

                bar = page.evaluate(READ, "header")
                if not bar or not bar.get("img"):
                    failures.append(f"{where}: no lockup in the header.")
                    ctx.close()
                    continue
                reading["bar"] = check_lockup(
                    bar, f"{where} bar", failures, band_for_bar(label, width, height), True
                )
                reading["bar"]["link_height_top"] = round(bar["link"]["h"], 2)
                reading["bar"]["box"] = [round(bar["img"][k], 2) for k in ("x", "y", "w", "h")]
                if bar["nav"]:
                    reading["bar"]["nav"] = [round(bar["nav"][k], 2) for k in ("x", "y", "w", "h")]
                if bar["nav"] and bar["nav"]["w"] > 0:
                    nav = bar["nav"]
                    after_nav = [c for c in bar["controls"] if c["x"] >= nav["right"] - EPSILON]
                    before_space = nav["x"] - bar["img"]["right"]
                    after_space = (after_nav[0]["x"] - nav["right"]) if after_nav else None
                    reading["bar"]["nav_spaces"] = [
                        round(before_space, 2),
                        round(after_space, 2) if after_space is not None else None,
                    ]
                    for side, space in (("before", before_space), ("after", after_space)):
                        if space is None or space < NAV_SPACE_MIN - EPSILON:
                            failures.append(
                                f"{where} bar: the space {side} the nav is {space}px, under "
                                f"the nav's own {NAV_SPACE_MIN:.0f}px between links."
                            )
                if bar["link"]["h"] < TARGET_MIN - 0.05:
                    failures.append(
                        f"{where} bar: the logo link is {bar['link']['h']:.1f}px tall at the "
                        f"top, under its 44px target."
                    )
                if bar["scrollWidth"] > bar["vw"] + EPSILON:
                    failures.append(
                        f"{where}: the page is {bar['scrollWidth']}px wide in a "
                        f"{bar['vw']}px viewport, so it scrolls sideways."
                    )
                reading["scroll_width"] = bar["scrollWidth"]
                header_h = page.evaluate(
                    "() => document.querySelector('header').getBoundingClientRect().height"
                )
                shoot(
                    page,
                    {"x": 0, "y": 0, "width": width, "height": header_h},
                    shots / f"{name}-{label}-header.png",
                )

                # The panel, where there is one to open.
                trigger = page.locator('header button[aria-controls="site-drawer"]')
                pressed = False
                if trigger.count() and trigger.first.is_visible():
                    try:
                        trigger.first.click(timeout=5000)
                        pressed = True
                    except Exception as error:  # noqa: BLE001, the reason is the finding
                        first_line = str(error).splitlines()[0]
                        failures.append(
                            f"{where}: the menu button cannot be pressed ({first_line}). "
                            f"Something in the bar covers it."
                        )
                if pressed:
                    page.wait_for_selector("#site-drawer", state="visible")
                    still(page, "#site-drawer")
                    page.wait_for_timeout(150)
                    panel = page.evaluate(READ, "#site-drawer")
                    if not panel or not panel.get("img"):
                        failures.append(f"{where}: no lockup in the open menu panel.")
                    else:
                        reading["panel"] = check_lockup(
                            panel, f"{where} panel", failures, BAR_PHONE, True
                        )
                        reading["panel"]["box"] = [
                            round(panel["img"][k], 2) for k in ("x", "y", "w", "h")
                        ]
                        reading["panel"]["panel_width"] = round(panel["root"]["w"], 2)
                        if width < 640 and abs(panel["img"]["h"] - bar["img"]["h"]) > EPSILON:
                            failures.append(
                                f"{where} panel: the lockup is {panel['img']['h']:.1f}px tall "
                                f"against the bar's {bar['img']['h']:.1f}; the panel runs "
                                f"the bar's phone size."
                            )
                        if panel["root"]["right"] > panel["vw"] + EPSILON:
                            failures.append(f"{where} panel: the panel runs off the viewport.")
                    page.locator("#site-drawer").screenshot(
                        path=str(shots / f"{name}-{label}-panel.png")
                    )
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(300)

                # The condensed bar: the link scales, and stays a 44px target.
                page.evaluate("() => scrollTo({ top: 700, behavior: 'instant' })")
                page.wait_for_timeout(120)
                page.evaluate("() => scrollTo({ top: 760, behavior: 'instant' })")
                page.wait_for_timeout(450)
                condensed = page.evaluate(READ, "header")
                if condensed and condensed.get("link"):
                    reading["bar"]["link_height_condensed"] = round(condensed["link"]["h"], 2)
                    if condensed["link"]["h"] < TARGET_MIN - 0.05:
                        failures.append(
                            f"{where} bar: the logo link is {condensed['link']['h']:.1f}px "
                            f"tall in the condensed bar, under its 44px target."
                        )

                # The footer.
                page.locator("footer").scroll_into_view_if_needed()
                page.wait_for_timeout(200)
                foot = page.evaluate(READ, "footer")
                if not foot or not foot.get("img"):
                    failures.append(f"{where}: no lockup in the footer.")
                else:
                    reading["footer"] = check_lockup(
                        foot, f"{where} footer", failures, FOOTER, False, fit_column=True
                    )
                    reading["footer"]["box"] = [
                        round(foot["img"][k] - (foot["root"]["x"] if k == "x" else 0), 2)
                        for k in ("x", "y", "w", "h")
                    ]
                    reading["footer"]["box"][1] = round(foot["img"]["y"] - foot["root"]["y"], 2)
                    if foot["column"]:
                        c = foot["column"]
                        reading["footer"]["column_box"] = [
                            round(c["x"] - foot["root"]["x"], 2),
                            round(c["y"] - foot["root"]["y"], 2),
                            round(c["w"], 2),
                            round(c["h"], 2),
                        ]
                    reading["footer"]["footer_height"] = round(foot["root"]["h"], 2)
                # The sticky bar overlays the top of the footer when the footer
                # is scrolled to the top of the screen, so it is hidden for the
                # shot: this is a picture of the footer, not of the bar over it.
                page.evaluate("() => { document.querySelector('header').style.visibility = 'hidden'; }")
                page.locator("footer").screenshot(path=str(shots / f"{name}-{label}-footer.png"))
                page.evaluate("() => { document.querySelector('header').style.visibility = ''; }")

                record["readings"][where] = reading
                ctx.close()
            browser.close()

    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"readings written to {out_json}")
    for where, reading in record["readings"].items():
        parts = []
        for surface in ("bar", "panel", "footer"):
            s = reading.get(surface)
            if not s:
                continue
            text = f"{surface} {s['width']:.1f}x{s['height']:.1f} ({s['aspect']:.2f}) {s['file']}"
            if "gap" in s:
                text += f" gap {s['gap']:.1f} to {s['first_control']!r}"
            if s.get("column_bound"):
                text += " column-bound"
            parts.append(text)
        print(f"  {where}: " + "; ".join(parts))
    return report(failures, mode)


def pair(before_json: Path, after_json: Path, failures: list[str]) -> None:
    """R493-6 at 1280: nothing outside the logo's own reach may differ."""
    before = json.loads(before_json.read_text(encoding="utf-8"))["readings"]
    after = json.loads(after_json.read_text(encoding="utf-8"))["readings"]
    out = SHOTS / "before_after"
    out.mkdir(parents=True, exist_ok=True)
    for where, reading in after.items():
        if not where.endswith("@ 1280"):
            continue
        name = where.split(" @ ")[0]
        was = before.get(where)
        if not was:
            continue
        for surface in ("header", "footer"):
            a_path = SHOTS / "before" / f"{name}-1280-{surface}.png"
            b_path = SHOTS / "after" / f"{name}-1280-{surface}.png"
            if not a_path.exists() or not b_path.exists():
                failures.append(f"{where} {surface}: a before or after shot is missing.")
                continue
            a = Image.open(a_path).convert("RGB")
            b = Image.open(b_path).convert("RGB")
            if a.size != b.size:
                print(f"  {where} {surface}: before {a.size}, after {b.size}")
                if surface == "header" or a.size[0] != b.size[0]:
                    failures.append(
                        f"{where} {surface}: the shot is {b.size} after and {a.size} before."
                    )
                    continue
                h = min(a.size[1], b.size[1])
                a, b = a.crop((0, 0, a.size[0], h)), b.crop((0, 0, b.size[0], h))
            mask = Image.new("L", a.size, 255)
            draw = ImageDraw.Draw(mask)
            key = "bar" if surface == "header" else "footer"
            boxes = [was[key]["box"], reading[key]["box"]]
            if surface == "header":
                boxes += [s["nav"] for s in (was["bar"], reading["bar"]) if s.get("nav")]
            else:
                boxes += [s["column_box"] for s in (was["footer"], reading["footer"])
                          if s.get("column_box")]
            for x, y, w, h in boxes:
                draw.rectangle([x - 2, y - 2, x + w + 2, y + h + 2], fill=0)
            diff = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v else 0)
            outside = ImageChops.multiply(diff, mask)
            count = outside.histogram()[255]
            print(f"  pairing {where} {surface}: {count} px differ outside the logo's reach")
            if count:
                failures.append(
                    f"{where} {surface}: {count} px differ between before and after outside "
                    f"the lockup, the nav it pushes and the footer column it sits in."
                )
    # The before and after pairs Callum is shown: header and footer, 390 and 1280.
    for label in ("390", "1280"):
        for surface in ("header", "footer"):
            a_path = SHOTS / "before" / f"home-{label}-{surface}.png"
            b_path = SHOTS / "after" / f"home-{label}-{surface}.png"
            if not (a_path.exists() and b_path.exists()):
                continue
            a, b = Image.open(a_path).convert("RGB"), Image.open(b_path).convert("RGB")
            gutter = 24
            if surface == "header":
                sheet = Image.new(
                    "RGB", (max(a.width, b.width), a.height + b.height + gutter), (200, 200, 200)
                )
                sheet.paste(a, (0, 0))
                sheet.paste(b, (0, a.height + gutter))
            else:
                sheet = Image.new(
                    "RGB", (a.width + b.width + gutter, max(a.height, b.height)), (200, 200, 200)
                )
                sheet.paste(a, (0, 0))
                sheet.paste(b, (a.width + gutter, 0))
            sheet.save(out / f"home-{label}-{surface}.png", optimize=True)


def report(failures: list[str], mode: str) -> int:
    if failures:
        print(f"\n{len(failures)} FAILURE(S){' (recorded, not failed: before mode)' if mode == 'before' else ''}:")
        for failure in failures:
            print(f"  - {failure}")
        return 0 if mode == "before" else 1
    print("\nAll assertions passed.")
    return 0


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", default=str(BUILD))
    parser.add_argument("--mode", choices=["before", "after"], default="after")
    parser.add_argument("--profiles", default="", help="comma list of labels")
    parser.add_argument("--routes", default="", help="comma list of names")
    parser.add_argument("--no-pair", action="store_true")
    parser.add_argument(
        "--scratch",
        default="",
        help="write shots and readings under this directory instead of docs/ "
        "(the mutation runs, which must not overwrite the evidence)",
    )
    args = parser.parse_args()

    profiles = [p for p in PROFILES if not args.profiles or p[0] in args.profiles.split(",")]
    routes = [r for r in ROUTES if not args.routes or r[1] in args.routes.split(",")]
    if args.scratch:
        out_json = Path(args.scratch) / f"measure-{args.mode}.json"
        shots = Path(args.scratch) / args.mode
    else:
        out_json = DATA / f"measure-{args.mode}.json"
        shots = SHOTS / args.mode
    code = run(Path(args.build), args.mode, profiles, routes, out_json, shots)
    if args.mode == "after" and not args.no_pair and not args.scratch:
        failures: list[str] = []
        before_json = DATA / "measure-before.json"
        if before_json.exists():
            pair(before_json, out_json, failures)
            if failures:
                print(f"\n{len(failures)} PAIRING FAILURE(S):")
                for failure in failures:
                    print(f"  - {failure}")
                code = 1
            else:
                print("Pairing at 1280: nothing differs outside the logo's reach.")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
