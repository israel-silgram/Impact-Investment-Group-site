"""Wave 421 tuning harness. NOT a gate: it exists to choose three numbers.

Kept beside the report as evidence rather than in scripts/, because it is the
working-out for section 2 of docs/WAVE421_REPORT.md and not a check the build
runs. It drives the CURRENT build and injects each candidate as a stylesheet
and a `sizes` attribute, so a candidate costs a page load rather than a
rebuild and all of them are measured against identical pixels everywhere else.

For each candidate it reports, at 1280, 768 and 390:

  variant   what `currentSrc` resolved to, and its bytes
  raw       the home page's raw dark-pixel share, the wave 412 measurement
  ground    the same with img/canvas/svg/.section-dark masked out
  hero RGB  the mean of the hero section's own ground pixels, photographs
            and glyphs excluded: what the warm haze ACTUALLY is
  R-B       how much redder than bluer that mean is. White is 0, the site's
            cream is +17. This is "warmth" as a number.
"""

import importlib.util
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "wave421" / "tune"
_spec = importlib.util.spec_from_file_location(
    "wave412", ROOT / "scripts" / "wave412-screenshots.py"
)
w412 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(w412)

# Only the pixels of the hero section, and only the ones that are ground:
# outside every photograph and lighter than a glyph.
HERO_BOX = """
() => {
  const hero = document.querySelector('section[aria-labelledby="hero-heading"]');
  const r = hero.getBoundingClientRect();
  const photos = [...hero.querySelectorAll('figure img')].map((el) => {
    const b = el.getBoundingClientRect();
    return [Math.floor(b.left + scrollX), Math.floor(b.top + scrollY),
            Math.ceil(b.right + scrollX), Math.ceil(b.bottom + scrollY)];
  });
  return {
    rect: [Math.floor(r.left + scrollX), Math.floor(r.top + scrollY),
           Math.ceil(r.right + scrollX), Math.ceil(r.bottom + scrollY)],
    photos,
  };
}
"""

WASH = "img[data-hero-wash]"

# `opacity` is the photograph's own; `css` is everything else the candidate
# changes. Both are injected, so a candidate is exactly its two strings.
CANDIDATES = [
    ("head", None, "", ""),
    ("A2-0.16-t60", "100vw", "0.16", "tint:60:84:66:90"),
    ("A2-0.18-t55", "100vw", "0.18", "tint:55:82:64:88"),
    ("A2-0.20-t50", "100vw", "0.20", "tint:50:82:62:88"),
    ("A2-0.22-t45", "100vw", "0.22", "tint:45:80:60:86"),
    ("A2-0.24-t40", "100vw", "0.24", "tint:40:80:58:86"),
]

TINT = """
img[data-hero-wash] { opacity: %(opacity)s !important; }
.hero-ground {
  background-image:
    linear-gradient(
      to bottom,
      color-mix(in oklab, var(--color-tint-orange) %(t_edge)s%%, transparent) 0%%,
      color-mix(in oklab, var(--color-tint-orange) %(t_mid)s%%, transparent) 38%%,
      color-mix(in oklab, var(--color-tint-orange) %(t_foot)s%%, transparent) 100%%
    ),
    linear-gradient(
      to bottom,
      color-mix(in oklab, var(--color-page) %(w0)s%%, transparent) 0%%,
      color-mix(in oklab, var(--color-page) %(w1)s%%, transparent) 38%%,
      color-mix(in oklab, var(--color-page) %(w2)s%%, transparent) 100%%
    ) !important;
}
"""

FILTER = """
img[data-hero-wash] {
  opacity: %(opacity)s !important;
  filter: sepia(0.72) hue-rotate(-12deg) saturate(1.35) !important;
}
.hero-ground {
  background-image: linear-gradient(
    to bottom,
    color-mix(in oklab, var(--color-page) 80%%, transparent) 0%%,
    color-mix(in oklab, var(--color-page) 62%%, transparent) 38%%,
    color-mix(in oklab, var(--color-page) 86%%, transparent) 100%%
  ) !important;
}
"""


def hero_mean(shot: Path, box, photos):
    """Mean RGB of the hero's own ground: outside the photographs, not a glyph."""
    with Image.open(shot) as image:
        rgb = image.convert("RGB")
        width, height = rgb.size
        pixels = rgb.load()
        left, top, right, bottom = box
        right, bottom = min(right, width), min(bottom, height)
        r = g = b = n = 0
        for y in range(max(0, top), bottom, 2):
            rows = [p for p in photos if p[1] <= y < p[3]]
            for x in range(max(0, left), right, 2):
                if any(p[0] <= x < p[2] for p in rows):
                    continue
                pixel = pixels[x, y]
                # A glyph, a rule, an icon or a button fill: not the ground.
                if w412.luminance(pixel) < 0.62:
                    continue
                r, g, b, n = r + pixel[0], g + pixel[1], b + pixel[2], n + 1
    return (round(r / n, 1), round(g / n, 1), round(b / n, 1), n)


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    OUT.mkdir(parents=True, exist_ok=True)
    port = w412.serve(ROOT / "dist" / "client")
    base = f"http://127.0.0.1:{port}"
    print(
        f"{'candidate':<16}{'w':>6}{'variant':>34}{'raw':>9}{'ground':>9}"
        f"{'hero mean RGB':>24}{'R-B':>7}"
    )
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for name, sizes, opacity, method in CANDIDATES:
            for width in (1280, 768, 390):
                context = browser.new_context(
                    viewport={"width": width, "height": 900}, device_scale_factor=1
                )
                page = context.new_page()
                page.goto(f"{base}/", wait_until="networkidle")
                if sizes:
                    page.eval_on_selector(
                        WASH, "(el, value) => el.setAttribute('sizes', value)", sizes
                    )
                if method:
                    if method.startswith("tint"):
                        _, t_mid, w0, w1, w2 = method.split(":")
                        page.add_style_tag(
                            content=TINT
                            % {
                                "opacity": opacity,
                                "t_mid": t_mid,
                                "t_edge": round(int(t_mid) * 0.45),
                                "t_foot": round(int(t_mid) * 0.6),
                                "w0": w0,
                                "w1": w1,
                                "w2": w2,
                            }
                        )
                    else:
                        page.add_style_tag(content=FILTER % {"opacity": opacity})
                page.wait_for_timeout(400)
                w412.settle(page)
                w412.to_top(page)
                chosen = page.evaluate(
                    f"() => document.querySelector('{WASH}').currentSrc.split('/').pop()"
                )
                geometry = page.evaluate(HERO_BOX)
                masks = page.evaluate(w412.MASKS)
                shot = OUT / f"{name}-{width}.png"
                page.screenshot(path=str(shot), full_page=True)
                raw, ground = w412.dark_shares(shot, masks)
                mean = hero_mean(shot, geometry["rect"], geometry["photos"])
                print(
                    f"{name:<16}{width:>6}{chosen:>34}{raw:>9.2%}{ground:>9.2%}"
                    f"{str(mean[:3]):>24}{mean[0] - mean[2]:>7.1f}"
                )
                context.close()
        browser.close()


if __name__ == "__main__":
    main()
