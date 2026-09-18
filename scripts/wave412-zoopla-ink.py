"""Derive the navy Zoopla wordmark from the white one.

    python scripts/wave412-zoopla-ink.py

`public/images/brand/zoopla-white.webp` is Zoopla's reversed wordmark: pure
white pixels carried by an alpha mask, keyed from the supplied artwork for a
navy ground. Wave 412 turned the site's ground white, where a white wordmark is
an empty rectangle.

So the mask is kept and the ink is changed: every pixel becomes `navy-900`
(#00112b, the site's ink token) at its existing alpha. That is a one-colour
rendering of a one-colour mark, which is what the reversed file already was,
pointed the other way. No shape, proportion or spacing is touched.

    white on navy-900   18.83:1
    navy-900 on white   18.83:1

The output is committed, so this script is a record of how it was made and a
check that it can be made again rather than something the build runs. Run it
and `git diff` should be empty.

⚠ THIS IS A DERIVED MARK, NOT A SUPPLIED ONE. Zoopla will have its own dark
colourway and its own guidelines for minimum size and clear space; this is the
honest stand-in until Callum can ask for the real file. It is listed as a
proposal in docs/WAVE412_REPORT.md.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "images" / "brand" / "zoopla-white.webp"
OUT = ROOT / "public" / "images" / "brand" / "zoopla-ink.webp"

INK = (0, 17, 43)  # --color-navy-900 / --color-ink


def main() -> None:
    source = Image.open(SRC).convert("RGBA")
    alpha = source.getchannel("A")
    ink = Image.new("RGBA", source.size, INK + (255,))
    ink.putalpha(alpha)
    ink.save(OUT, "WEBP", lossless=True, quality=100)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes, {source.size[0]}x{source.size[1]})")


if __name__ == "__main__":
    main()
