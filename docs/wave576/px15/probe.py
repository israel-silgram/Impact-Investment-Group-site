"""Wave 576, the 15 px pass (21 Oct 2026, R576-1): the footer pledge, read.

    python docs/wave576/px15/probe.py --label control   # on dist/client at 16fd5a1
    python docs/wave576/px15/probe.py --label head --shots docs/screenshots/wave576/px15

On `/` and `/register/investor` at 1280 and 390: the pledge paragraph's computed
size, weight, line height, its rendered line count (its height over its line
height), its box, the footer's height, and whether the pledge's box overlaps any
other text-bearing element in the footer. With `--shots`, the footer is cut from
a full-page shot at its document box, with the sticky header hidden (not
removed), and named for the route and the width. Reads only; asserts nothing.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location("wave490", ROOT / "scripts" / "wave490-phone.py")
W490 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(W490)

PROFILES = [("1280", 1280, 900, False), ("390", 390, 844, True)]
ROUTES = [("/", "home"), ("/register/investor", "register-investor")]
STILL = "*, *::before, *::after { animation: none !important; transition: none !important; }"

READ = r"""
() => {
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  const foot = document.querySelector('footer');
  const p = [...foot.querySelectorAll('p')].find((x) => text(x).startsWith('10% of all profits'));
  const s = getComputedStyle(p);
  const r = p.getBoundingClientRect();
  const lh = parseFloat(s.lineHeight);
  const clash = [...foot.querySelectorAll('p, li, a, span, h2, h3, h4')]
    .filter((el) => el !== p && !p.contains(el) && !el.contains(p) && text(el))
    .filter((el) => {
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top;
    }).map((el) => text(el).slice(0, 40));
  return {
    size: s.fontSize, weight: s.fontWeight, lineHeight: s.lineHeight, colour: s.color,
    lines: Math.round(r.height / lh), box: [Math.round(r.left), Math.round(r.width), Math.round(r.height * 100) / 100],
    footer: Math.round(foot.getBoundingClientRect().height * 100) / 100, clash,
  };
}
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", default=str(ROOT / "dist" / "client"))
    ap.add_argument("--label", required=True)
    ap.add_argument("--shots", default="")
    args = ap.parse_args()
    port = W490.serve(Path(args.build))
    out = {}
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for label, width, height, touch in PROFILES:
            for path, slug in ROUTES:
                ctx = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=1,
                                          is_mobile=touch, has_touch=touch, reduced_motion="reduce")
                page = ctx.new_page()
                page.goto(f"http://127.0.0.1:{port}{path}", wait_until="networkidle")
                W490.settle(page)
                page.add_style_tag(content=STILL)
                W490.to_top(page)
                reading = page.evaluate(READ)
                out[f"{path} @ {label}"] = reading
                print(f"{args.label:<8} {path:<20} @ {label:<5} {json.dumps(reading)}")
                if args.shots:
                    folder = ROOT / args.shots
                    folder.mkdir(parents=True, exist_ok=True)
                    # A full-page shot cropped to the footer's document box: an
                    # element capture of the home footer at 1280 (894px in a 900px
                    # viewport) landed 220px high on the first run of this probe.
                    page.evaluate("document.querySelector('header').style.visibility = 'hidden'")
                    box = page.evaluate(
                        "(() => { const r = document.querySelector('footer').getBoundingClientRect();"
                        " return [r.left + scrollX, r.top + scrollY, r.width, r.height]; })()")
                    whole = folder / f"_whole-{slug}-{label}.png"
                    page.screenshot(path=str(whole), full_page=True, animations="disabled", caret="hide")
                    page.evaluate("document.querySelector('header').style.visibility = ''")
                    x, y, w, h = (round(v) for v in box)
                    Image.open(whole).crop((x, y, x + w, y + h)).save(folder / f"footer-{slug}-{label}.png", optimize=True)
                    whole.unlink()
                ctx.close()
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
