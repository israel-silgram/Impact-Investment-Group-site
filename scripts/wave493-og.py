"""Wave 493: the link card carries the one-line lockup.

    python scripts/wave493-og.py            # write public/images/brand/og-default.png
    python scripts/wave493-og.py --check    # assert the file on disk is what this writes

`og-default.png` is the picture WhatsApp, LinkedIn and X draw for a shared
link to the site (`src/routes/index.tsx`). Until wave 493 it was the ring and
house alone on white, and the site had no script that made it: wave 443
recoloured it by hand. It is now MADE, from the committed on-light lockup
(`public/images/brand/logo-lockup.webp`, 2006 by 310), so the card and the
bar show the same artwork and the next change to the artwork is one command.

THE CANVAS. 1200 by 630 on the page's own white, which is what the old card
used and what the lockup's navy and orange are drawn for. The lockup is
scaled as one piece, never squeezed, to LOCKUP_WIDTH and centred. 960px wide
is 148px tall: 120px either side, which keeps the words clear of the rounded
corners and the edge crops the three apps put on a large card. Nothing else is
drawn: no words that are not in the artwork.

UNDER 300 KB, because WhatsApp ignores a larger file (the note beside the meta
tag). The script refuses to write one that is not.
"""

import argparse
import io
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "images" / "brand" / "logo-lockup.webp"
TARGET = ROOT / "public" / "images" / "brand" / "og-default.png"

CANVAS = (1200, 630)
GROUND = (255, 255, 255)
LOCKUP_WIDTH = 960
MAX_BYTES = 300 * 1024


def render() -> bytes:
    with Image.open(SOURCE) as source:
        art = source.convert("RGBA")
    height = round(art.height * LOCKUP_WIDTH / art.width)
    art = art.resize((LOCKUP_WIDTH, height), Image.LANCZOS)
    card = Image.new("RGBA", CANVAS, GROUND + (255,))
    left = (CANVAS[0] - LOCKUP_WIDTH) // 2
    top = (CANVAS[1] - height) // 2
    card.alpha_composite(art, (left, top))
    out = io.BytesIO()
    card.convert("RGB").save(out, "PNG", optimize=True)
    print(f"lockup {LOCKUP_WIDTH} by {height} at ({left}, {top}) on a {CANVAS[0]} by {CANVAS[1]} card")
    return out.getvalue()


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = render()
    if len(data) > MAX_BYTES:
        print(f"{len(data)} bytes, over the {MAX_BYTES} WhatsApp reads. Not written.")
        return 1
    if args.check:
        same = TARGET.exists() and TARGET.read_bytes() == data
        print(f"{TARGET.relative_to(ROOT)} {'matches' if same else 'DOES NOT MATCH'} this script's output")
        return 0 if same else 1
    TARGET.write_bytes(data)
    print(f"wrote {TARGET.relative_to(ROOT)}, {len(data)} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
