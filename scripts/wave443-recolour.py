"""Precisely recolour the ten existing brand rasters, with user authorisation.

Default is read-only validation. --write regenerates from the immutable site
baseline, so repeated execution cannot accumulate colour or encoding changes.
No resize, crop, redraw or alpha edit occurs. WebP must be lossless: a lossy
save would also change pixels outside the authorised orange selection.
"""

import argparse
import colorsys
import hashlib
import io
import json
from pathlib import Path
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = "bb39b3ed0eab0f9942882a0c63c45c79e8c49bf9"
ASSETS = [
    *[f"public/images/brand/{name}.webp" for name in (
        "logo-lockup", "logo-lockup-reverse", "logo-lockup-400",
        "logo-lockup-640", "logo-lockup-reverse-400",
        "logo-lockup-reverse-640", "logo-mark", "logo-mark-reverse",
    )],
    "public/images/brand/og-default.png",
    "public/favicon.png",
]
PRIMARY = (225, 94, 49)
INK = (187, 68, 27)
WHITE = (255, 255, 255)


def orange(pixel):
    r, g, b, a = pixel
    hue, saturation, _ = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    return a > 0 and hue <= 0.18 and saturation >= 0.28 and r > g * 1.05 and r > b * 1.2


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    rows = []
    for relative in ASSETS:
        before_bytes = subprocess.check_output(["git", "show", f"{BASE}:{relative}"], cwd=ROOT)
        original = Image.open(io.BytesIO(before_bytes))
        before = original.convert("RGBA")
        expected = before.copy()
        selected = set()
        targets = {"primary": 0, "ink": 0, "white": 0}
        for y in range(before.height):
            for x in range(before.width):
                pixel = before.getpixel((x, y))
                if not orange(pixel):
                    continue
                selected.add((x, y))
                word = "logo-lockup" in relative and x >= before.width * 0.405
                role = "white" if word and "reverse" in relative else "ink" if word else "primary"
                target = {"primary": PRIMARY, "ink": INK, "white": WHITE}[role]
                expected.putpixel((x, y), (*target, pixel[3]))
                targets[role] += 1
        path = ROOT / relative
        if args.write:
            if path.suffix == ".webp":
                expected.save(path, lossless=True, exact=True, method=6)
            else:
                expected.convert(original.mode).save(path, optimize=True)
        after_bytes = path.read_bytes()
        actual = Image.open(io.BytesIO(after_bytes)).convert("RGBA")
        dimensions_match = actual.size == before.size
        if not dimensions_match:
            raise AssertionError(f"Dimensions changed: {relative}")
        outside_changes = alpha_changes = target_mismatches = 0
        for y in range(before.height):
            for x in range(before.width):
                a, b = actual.getpixel((x, y)), before.getpixel((x, y))
                outside_changes += (x, y) not in selected and a != b
                alpha_changes += a[3] != b[3]
                target_mismatches += a != expected.getpixel((x, y))
        row = {
            "path": relative, "dimensions": list(before.size), "selected_pixels": len(selected),
            "target_pixels": targets, "outside_selection_changes": outside_changes,
            "alpha_changes": alpha_changes, "target_mismatches": target_mismatches,
            "before_bytes": len(before_bytes), "after_bytes": len(after_bytes),
            "before_sha256": hashlib.sha256(before_bytes).hexdigest(),
            "after_sha256": hashlib.sha256(after_bytes).hexdigest(),
        }
        assert selected and not (outside_changes or alpha_changes or target_mismatches), row
        rows.append(row)
    print(json.dumps({"baseline": BASE, "assets": len(rows), "rows": rows, "pass": True}, indent=2))


if __name__ == "__main__":
    main()
