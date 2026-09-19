"""Wave 414: the responsive sources a phone actually needs.

    python scripts/wave414-responsive-images.py            # write what is missing
    python scripts/wave414-responsive-images.py --check    # assert nothing is missing

Phone rule 6 is "images earn their bytes": a phone must not download a 1920px
image to draw it 390px wide. Before this script the site had exactly one size
of every photograph, and the arithmetic of that on a slow 4G connection was:

  /partner-with-investor   2,094 KiB, of which one 1,253 KiB PNG
  /                        1,738 KiB, of which four hero images at 200 to 270 KiB

⚠ THE WORK LIST IS READ OFF THE SOURCE TREE, NOT TYPED HERE. Every `src="..."`
and `srcSet="..."` under `src/` is collected, so a variant can never be
generated for an image nothing renders, and an image that gains a reference
gains its variants the next time this runs. `public/images` holds a good deal
more than the site draws (superseded PNG sets, mock-up references, the logo
crops) and none of it is touched.

WHAT IS WRITTEN. For each referenced raster wider than the smallest step, a
WebP at each step below its own width, beside it, named `<stem>-<width>.webp`.

⚠ THE ENCODING IS MEASURED PER VARIANT, NOT DECIDED BY FILENAME. WAVE 415.
Wave 414b's version said "lossless is never used: these are photographs" and
saved every variant at `quality=82, method=6`. The rel414b re-check (MINOR 6)
pointed out that four of the seven transparent sources are brand artwork
rather than photographs, that a synthetic flat frame encodes 3.9 times
smaller lossless, and that those bytes sit on the eager critical path of all
36 pages. So the policy is now: ENCODE BOTH WAYS AND KEEP WHICHEVER IS
SMALLER, per source, per step, with both byte counts printed.

That is the most direct measured property there is, and it is deliberately
not a proxy for one. Two proxies were measured across all 71 referenced
sources first and both were rejected, because neither predicts the outcome:
unique colours per pixel puts `logo-lockup.webp` at 0.219 (41,080 distinct
values in 187,704 pixels), higher than most of the photographs, because the
supplied lockup is an anti-aliased raster render and not line art; and a
flat-neighbourhood share puts `zoopla-ink.webp` at 0.94, the flattest file on
the site, which lossless still loses on. A threshold over either would have
been a filename list with arithmetic in front of it.

THE ANSWER ON THIS TREE, AND IT IS NOT THE ONE MINOR 6 EXPECTED: lossless is
LARGER on all 101 variants of all 42 eligible sources, by 1.32x on
`zoopla-ink-400` (22,012 lossy against 29,016 lossless), 1.83x on
`logo-lockup-400` (30,488 against 55,706), 1.57x on
`logo-lockup-reverse-400` (26,022 against 40,980) and up to 13.1x on the
photographs. The re-checker's 3.9x was measured on a synthetic flat frame;
this site's brand artwork is a soft-edged raster with an anti-aliased alpha
ramp, which is the case lossless WebP is worst at. So every variant on disk
stays at `quality=82, method=6`, the file bytes are unchanged, and the rule
that chose them is now in the script instead of in a sentence. Flat artwork
added later will take the lossless branch on its own, measured, with no edit
here.

⚠ AND THE ORIGINAL IS NEVER TOUCHED. It stays as the `src`, so a browser
that does not understand `srcset` and a build that has not run this script
both still show the picture. The variants are additive.

`--check` is what the gate runs: it writes nothing and exits non-zero if a
referenced image is missing a variant it should have, so a photograph added
without running this script fails the build rather than quietly shipping at
full size.
"""

import argparse
import io
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
PUBLIC = ROOT / "public"

# The widths a phone, a tablet and a desktop actually draw these at, measured
# at the five profiles in scripts/wave414-mobile.py and rounded up to a step
# that survives a 2x display. 400 covers a 390px phone at 1x and a 200px slot
# at 2x; 1440 is the widest any photograph is drawn on this site.
STEPS = [400, 640, 960, 1440]

# Under this, a second copy costs more in requests than it saves in bytes.
MIN_SOURCE_WIDTH = 500
QUALITY = 82

REFERENCE = re.compile(r'["\'](/images/[^"\']+\.(?:webp|png|jpg|jpeg))["\']', re.I)
# A variant this script wrote, so a re-run does not recurse over its own output.
VARIANT = re.compile(r"-(?:" + "|".join(str(s) for s in STEPS) + r")\.webp$")


def referenced() -> list[Path]:
    """Every /images/... raster named anywhere under src/."""
    found: set[str] = set()
    for path in list(SRC.rglob("*.tsx")) + list(SRC.rglob("*.ts")):
        for match in REFERENCE.finditer(path.read_text(encoding="utf-8")):
            found.add(match.group(1))
    out = []
    for url in sorted(found):
        if VARIANT.search(url):
            continue
        candidate = PUBLIC / url.lstrip("/")
        if candidate.exists():
            out.append(candidate)
    return out


def variants_for(width: int) -> list[int]:
    """The steps below this image's own width. Never an upscale."""
    return [step for step in STEPS if step < width]


def has_alpha(image: Image.Image) -> bool:
    """Whether this frame carries transparency at all.

    A palette image can carry it in `info` rather than in its mode, so both
    are read. This is the fact the whole alpha check below turns on: a source
    with transparency whose variant has none is a picture that gained a
    background nobody drew.
    """
    return image.mode in ("RGBA", "LA") or "transparency" in image.info


def alpha_failures(sources) -> list[str]:
    """Every variant on disk that lost the transparency its source has.

    ⚠ THIS IS A GATE, NOT A DIAGNOSTIC, and it runs in both modes. The
    defect it exists for shipped: two flattened steps of the brand lockup were
    committed and served, and no assertion in the wave could see them because
    they are a fact about pixels rather than about markup or about which files
    exist. A variant is only a variant of its source if it still has the
    source's channels.
    """
    out: list[str] = []
    for source in sources:
        with Image.open(source) as image:
            if not has_alpha(image):
                continue
        for step in STEPS:
            target = source.with_name(f"{source.stem}-{step}.webp")
            if not target.exists():
                continue
            with Image.open(target) as variant:
                if not has_alpha(variant):
                    out.append(
                        f"{target.relative_to(ROOT)} is {variant.mode} while "
                        f"{source.relative_to(ROOT)} carries an alpha channel: the "
                        f"transparency was flattened, so this draws on an opaque plate"
                    )
    return out


MANIFEST = ROOT / "src" / "lib" / "image-variants.ts"

MANIFEST_HEADER = """/**
 * GENERATED BY scripts/wave414-responsive-images.py. DO NOT EDIT BY HAND.
 *
 * Which widths of each photograph actually exist on disk, so a `srcset` can
 * never name a file that is not there. The script refuses any step that does
 * not come out smaller than its own source, so this map is the ONLY honest
 * record of what was written: a hand-typed `srcset` would 404 on the steps it
 * dropped, and a list of widths shared between the script and the components
 * would go stale the first time an encoder disagreed with it.
 *
 * Re-run the script after adding a photograph;
 * `python scripts/wave414-responsive-images.py --check` fails a build where
 * this file and the directory disagree.
 */
"""


def write_manifest(sources, check: bool) -> bool:
    """Write src/lib/image-variants.ts. Returns True if it changed."""
    rows = []
    for source in sources:
        url = "/" + source.relative_to(PUBLIC).as_posix()
        steps = sorted(
            step for step in STEPS if source.with_name(f"{source.stem}-{step}.webp").exists()
        )
        # EVERY referenced raster, not only the ones with variants. The map
        # doubles as the intrinsic-size registry the components read for their
        # `width` and `height` attributes, and an image too small to be worth
        # a second copy still needs its box reserved before it arrives. That
        # is the other half of rule 6 and it is what a layout shift is.
        with Image.open(source) as image:
            rows.append((url, steps, image.size[0], image.size[1]))
    # ⚠ ONE ENTRY PER FOUR LINES, NEVER ONE PER LINE, AND THAT IS ABOUT
    # PRETTIER RATHER THAN ABOUT TASTE. This file is generated AND it is
    # linted, so `--check` only means something if the two agree. Prettier
    # collapses a short object onto one line, but it PRESERVES one that
    # already has a line break between `{` and its first key, so an expanded
    # entry is a fixed point and a one-line entry is not: the first draft of
    # this wrote one line per image, prettier rewrapped the long ones, and
    # `--check` then failed on every run for a difference nobody made.
    lines = [
        MANIFEST_HEADER,
        "export const IMAGE_VARIANTS: Record<string, "
        "{ steps: number[]; width: number; height: number }> = {",
    ]
    for url, steps, width, height in sorted(rows):
        joined = ", ".join(str(step) for step in steps)
        lines.append(f'  "{url}": {{')
        lines.append(f"    steps: [{joined}],")
        lines.append(f"    width: {width},")
        lines.append(f"    height: {height},")
        lines.append("  },")
    lines.append("};")
    lines.append("")
    text = chr(10).join(lines)
    previous = MANIFEST.read_text(encoding="utf-8") if MANIFEST.exists() else ""
    if text == previous:
        return False
    if not check:
        MANIFEST.write_text(text, encoding="utf-8", newline="")
        print(f"  {MANIFEST.relative_to(ROOT)}  {len(rows)} images")
    return True


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="assert only, write nothing")
    args = parser.parse_args()

    sources = referenced()
    if not sources:
        raise SystemExit("No /images references found under src/. Something is wrong.")

    written = 0
    skipped = 0
    missing: list[str] = []
    dropped: list[str] = []
    saved_bytes = 0

    for source in sources:
        with Image.open(source) as image:
            width, height = image.size
            source_has_alpha = has_alpha(image)
            if width < MIN_SOURCE_WIDTH:
                skipped += 1
                continue
            steps = variants_for(width)
            if not steps:
                skipped += 1
                continue
            for step in steps:
                target = source.with_name(f"{source.stem}-{step}.webp")
                if target.exists():
                    continue
                if args.check:
                    # A step this script itself refused is not a missing one:
                    # the encoder decides that per image and the only way to
                    # know is to encode it. `--check` therefore asserts that
                    # SOME variant exists for a source that should have them,
                    # which is the thing a forgotten run actually breaks.
                    if not any(
                        source.with_name(f"{source.stem}-{other}.webp").exists()
                        for other in steps
                    ):
                        missing.append(
                            f"{source.relative_to(ROOT)} has no variant at any of {steps}"
                        )
                    break
                # ⚠ RGBA WHERE THE SOURCE HAS IT, AND NEVER convert("RGB").
                # `convert("RGB")` DISCARDS the alpha channel rather than
                # compositing it, so a transparent pixel keeps whatever RGB it
                # was carrying underneath, which in a keyed-out brand asset is
                # 0,0,0. The brand lockup came out of that as navy and orange
                # artwork on a SOLID BLACK RECTANGLE, in the header and the
                # footer of every one of the 36 prerendered pages, at every
                # width. Found by the rel414 re-check reading the shots.
                # WebP carries alpha in its lossy mode, so an RGBA frame saved
                # here is a transparent variant at the same quality; nothing
                # is composited onto anything, because there is no ground here
                # to composite onto and the page is the ground.
                mode = "RGBA" if source_has_alpha else "RGB"
                scaled = image.convert(mode).resize(
                    (step, max(1, round(height * step / width))), Image.LANCZOS
                )
                # ⚠ BOTH ENCODINGS, THEN THE SMALLER ONE. WAVE 415, rel414b
                # MINOR 6. Flat artwork with hard edges and large uniform
                # areas can encode several times smaller lossless than under
                # a photograph policy, and the brand lockups are on the eager
                # critical path of every one of the 36 prerendered pages, so
                # the question is worth asking of every file rather than
                # assumed either way. It is asked by ENCODING IT, because no
                # cheap property of the source predicts the answer: see the
                # module docstring for the two that were measured and
                # rejected. Nothing is written until both are in hand, so a
                # variant on disk is always the smaller of the two.
                lossy = io.BytesIO()
                scaled.save(lossy, "WEBP", quality=QUALITY, method=6)
                lossless = io.BytesIO()
                scaled.save(lossless, "WEBP", lossless=True, method=6)
                use_lossless = len(lossless.getvalue()) < len(lossy.getvalue())
                chosen = lossless if use_lossless else lossy
                target.write_bytes(chosen.getvalue())
                print(
                    f"  encode {target.name}  "
                    f"lossy {len(lossy.getvalue())} vs lossless "
                    f"{len(lossless.getvalue())}  -> "
                    f"{'LOSSLESS' if use_lossless else 'lossy q82'}"
                )
                # ⚠ A VARIANT THAT IS NOT SMALLER IS NOT A VARIANT. Several of
                # the site's sources are already well-encoded WebP, and
                # re-encoding one of those at a width close to its own comes
                # out BIGGER: `solution-street-blueprint` is 217KB at 1600px
                # and its 1440 step first came out at 232KB. Shipping that in
                # a `srcset` would make a phone download more bytes for fewer
                # pixels, which is the exact thing rule 6 exists to stop. The
                # step is dropped and the browser falls back to the next one
                # up, which is the original.
                if target.stat().st_size >= source.stat().st_size:
                    print(
                        f"  dropped {target.relative_to(ROOT)}  "
                        f"{target.stat().st_size / 1024:.0f}KB is not smaller than the "
                        f"{source.stat().st_size / 1024:.0f}KB source"
                    )
                    target.unlink()
                    dropped.append(f"{source.stem}-{step}")
                    continue
                saved_bytes += source.stat().st_size - target.stat().st_size
                written += 1
                print(
                    f"  {target.relative_to(ROOT)}  "
                    f"{target.stat().st_size / 1024:.0f}KB from "
                    f"{source.stat().st_size / 1024:.0f}KB at {width}px"
                )

    print(
        f"\n{len(sources)} referenced images, {skipped} too small or already at the "
        f"smallest step, {written} variants written, {len(dropped)} dropped for being "
        f"no smaller than their source, {saved_bytes / 1024 / 1024:.1f}MB saved on "
        f"this run against serving the source at every step."
    )
    # THE ALPHA CHECK, IN BOTH MODES. A write run has just encoded these, so
    # it is proving its own output; a `--check` run is proving what is on disk,
    # which is what the site serves.
    flattened = alpha_failures(sources)
    if flattened:
        print(chr(10) + f"{len(flattened)} FLATTENED VARIANT(S):")
        for name in flattened:
            print(f"  - {name}")
        raise SystemExit(
            "Delete the files above and re-run "
            "`python scripts/wave414-responsive-images.py`."
        )
    transparent = 0
    for source in sources:
        with Image.open(source) as image:
            if has_alpha(image):
                transparent += 1
    print(
        f"{transparent} referenced sources carry an alpha channel and every variant "
        f"of them still does."
    )

    if write_manifest(sources, check=args.check) and args.check:
        missing.append(f"{MANIFEST.relative_to(ROOT)} is out of date with the directory")
    if args.check:
        if missing:
            print(f"\n{len(missing)} MISSING VARIANT(S):")
            for name in missing:
                print(f"  - {name}")
            raise SystemExit(
                "Run `python scripts/wave414-responsive-images.py` and commit the result."
            )
        print("Every referenced image has the variants it should have.")


if __name__ == "__main__":
    main()
