"""Derive the purple Zoopla wordmark from the white one.

    python scripts/wave415-zoopla-purple.py

`public/images/brand/zoopla-white.webp` is Zoopla's reversed wordmark: pure
white pixels carried by an alpha mask, keyed from the supplied artwork for a
navy ground. Wave 412 turned the site's ground white, where a white wordmark
is an empty rectangle, and filled the mask with the site's own ink token
instead. That was an honest stand-in and it was never Zoopla's colour.

WAVE 415 SUPERSEDES scripts/wave412-zoopla-ink.py, WHICH THIS FILE IS.
There is still ONE generator and ONE mark; only the fill changed, from the
site's navy ink to Zoopla's own brand purple. No shape, proportion, spacing
or output path is touched, so the credit's markup does not change at all.

THE COLOUR IS MEASURED, NOT GUESSED. The operator sampled the "Powered by
Zoopla" ribbon off the live platform's property page (deal 692681, 19 Sep
2026 12:10 UK): the ribbon's median pixel is #8046F3 with #8046F2 as the
dominant exact value under JPEG noise, and #8046F2 is Zoopla's published
brand purple. Callum asked for exactly this on 19 Sep 2026 about 11:05 UK:
"please ensure the Zoopla logo appears as the Zoopla brands purple colour
the same as the ribbon on the property listing result/match card."

    #8046F2 relative luminance  0.1538
    #8046F2 on white  #ffffff   5.15:1
    #8046F2 on cream  #f7f1e6   4.58:1

Both clear the 3:1 that WCAG 2.2 SC 1.4.11 asks of a graphic, and the mark
draws on white in the home hero. The measured figures off the rendered shot
are in docs/WAVE415_REPORT.md section 2.

⚠ THIS IS STILL A DERIVED MARK, NOT A SUPPLIED ONE. The fill is now Zoopla's
published brand purple rather than the site's ink, which is closer to their
guidelines than wave 412 was, but the artwork is their reversed file keyed
over. Zoopla will have its own positive colourway and its own rules for
minimum size and clear space; this is the honest stand-in until Callum can
ask for the real file. Listed as a proposal in docs/WAVE415_REPORT.md.

The output is committed, so this script is a record of how it was made and a
check that it can be made again rather than something the build runs. Run it
and `git diff` should be empty.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "images" / "brand" / "zoopla-white.webp"
OUT = ROOT / "public" / "images" / "brand" / "zoopla-ink.webp"

# Zoopla's published brand purple, sampled off the live listing ribbon.
# ⚠ THIS HEX LIVES HERE AND NOWHERE ELSE. It is a third party's brand colour
# baked into a third party's artwork, not a token of this site's palette, so
# it must never appear in src/styles.css or in a component.
PURPLE = (0x80, 0x46, 0xF2)


def main() -> None:
    before = OUT.stat().st_size if OUT.exists() else 0
    source = Image.open(SRC).convert("RGBA")
    alpha = source.getchannel("A")
    mark = Image.new("RGBA", source.size, PURPLE + (255,))
    mark.putalpha(alpha)
    mark.save(OUT, "WEBP", lossless=True, quality=100)
    after = OUT.stat().st_size
    print(
        f"wrote {OUT.relative_to(ROOT)} "
        f"(#{PURPLE[0]:02X}{PURPLE[1]:02X}{PURPLE[2]:02X}, "
        f"{after} bytes from {before}, {source.size[0]}x{source.size[1]})"
    )


if __name__ == "__main__":
    main()
