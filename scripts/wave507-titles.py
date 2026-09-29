"""Wave 507: the site's titles and link previews say the group.

    python scripts/wave507-titles.py --build <dir> --mode before   # record, never fail
    python scripts/wave507-titles.py                               # the guard, on dist/client

Callum, 29 Sep 2026, answering wave 502's deferral 2: the page titles and the
link previews (what Google and WhatsApp show) say "Impact Investment Group"
where they said "The Impact Investment Platform". Each page's own part of its
title stays as it is, and nothing on the page moves.

WHAT THIS READS, on every prerendered page in the build:

  the markup   off the HTML file itself, which is what a crawler and a link
               unfurler read, since neither runs the page's JavaScript: every
               <title> in <head>, the og:site_name, og:title and twitter:title
               meta, and the "name" of every application/ld+json block
  the page     the same page served and hydrated in Chromium at 1280 and 390:
               document.title and the same meta, as the tab and a bookmark
               read them, and a full-page shot split into header, main and
               footer

WHAT IT ASSERTS, in `--mode after` (the default):

  1. No field above, in the markup or the hydrated page, carries the old name,
     "Impact Investment Platform", with or without "The".
  2. og:site_name reads exactly NEW on every page that has one, and every page
     but the static 404 has one.
  3. Each page's own part is unchanged: every value read before, with the old
     name replaced by NEW, equals the value read now, field for field and page
     for page. No page gains or loses a field.
  4. The hydrated page says what the markup says.
  5. The pixels do not move: header, main and footer at 1280 and 390, every
     route, equal to the before run's shots in every pixel.
  6. `src/routes` carries NEW in its titles and not the old name.

`--mode before` takes the same readings and the same shots and exits 0: run on
the base build it is the red proof, and it prints every failure it would have
raised.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
SHOTS = ROOT / "docs" / "screenshots" / "wave507"
DATA = ROOT / "docs" / "wave507"

NEW = "Impact Investment Group"
OLD_RE = re.compile(r"(?:The )?Impact Investment Platform")
FIELDS = ("og:site_name", "og:title", "twitter:title")
PROFILES = [("1280", 1280, 900, False), ("390", 390, 844, True)]


def load_490():
    """Wave 490's server and settle, so this gate serves pages the way the others do."""
    spec = importlib.util.spec_from_file_location("wave490", ROOT / "scripts" / "wave490-phone.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


W490 = load_490()


def plain(value) -> str:
    """Every value this gate prints or writes goes through here, so the em
    dash the titles already carry is written as a word and no log of this
    wave adds the character."""
    text = json.dumps(value, ensure_ascii=False) if not isinstance(value, str) else value
    return text.replace("\u2014", "[em dash]").replace("\u2013", "[en dash]")


class Head(HTMLParser):
    """The <head>'s titles and meta, and every ld+json block in the document."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_head = False
        self.in_title = False
        self.in_ld = False
        self.titles: list[str] = []
        self.meta: dict[str, list[str]] = {}
        self.ld: list[str] = []
        self._buf = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "head":
            self.in_head = True
        elif tag == "title" and self.in_head:
            self.in_title, self._buf = True, ""
        elif tag == "meta" and self.in_head:
            key = a.get("property") or a.get("name")
            if key in FIELDS:
                self.meta.setdefault(key, []).append(a.get("content") or "")
        elif tag == "script" and (a.get("type") or "").lower() == "application/ld+json":
            self.in_ld, self._buf = True, ""

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False
        elif tag == "title" and self.in_title:
            self.titles.append(self._buf)
            self.in_title = False
        elif tag == "script" and self.in_ld:
            self.ld.append(self._buf)
            self.in_ld = False

    def handle_data(self, data):
        if self.in_title or self.in_ld:
            self._buf += data


def ld_names(blocks: list[str]) -> list[str]:
    names: list[str] = []

    def walk(node):
        if isinstance(node, dict):
            for key, value in node.items():
                if key in {"name", "alternateName", "legalName"} and isinstance(value, str):
                    names.append(value)
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    for block in blocks:
        try:
            walk(json.loads(block))
        except json.JSONDecodeError:
            names.append(f"<unparsed ld+json: {block[:80]}>")
    return names


def read_markup(path: Path) -> dict:
    parser = Head()
    parser.feed(path.read_text(encoding="utf-8"))
    out = {"title": parser.titles}
    for key in FIELDS:
        if key in parser.meta:
            out[key] = parser.meta[key]
    if parser.ld:
        out["ld+json name"] = ld_names(parser.ld)
    return out


LIVE = """
() => {
  const out = { title: [document.title] };
  for (const key of %s) {
    const found = [...document.head.querySelectorAll(
      `meta[property="${key}"], meta[name="${key}"]`)].map((m) => m.content);
    if (found.length) out[key] = found;
  }
  return out;
}
""" % json.dumps(list(FIELDS))

STILL = (
    "*, *::before, *::after { animation: none !important; transition: none !important; "
    "caret-color: transparent !important; }"
)


def route_of(build: Path, html: Path) -> str:
    rel = html.relative_to(build).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def slug_of(route: str) -> str:
    return route.strip("/").replace("/", "-").replace(".html", "") or "home"


def regions(page) -> dict:
    return page.evaluate(
        """() => {
          const box = (sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { y: Math.round(r.top + scrollY), h: Math.round(r.height) };
          };
          return { header: box('header'), main: box('main'), footer: box('footer'),
                   height: document.documentElement.scrollHeight };
        }"""
    )


def diff_count(before: Path, after: Path, band: dict | None) -> int | None:
    if not before.exists():
        return None
    a = np.asarray(Image.open(before).convert("RGBA")).astype(np.int16)
    b = np.asarray(Image.open(after).convert("RGBA")).astype(np.int16)
    if a.shape != b.shape:
        return int(max(a.shape[0] * a.shape[1], b.shape[0] * b.shape[1]))
    moved = np.abs(a - b).max(axis=2) > 0
    if band is not None:
        moved = moved[max(band["y"], 0): band["y"] + band["h"]]
    return int(moved.sum())


def pixel_sha(path: Path) -> str | None:
    """SHA-256 of the decoded RGBA pixels, so the record proves the pairs
    without the 84 MB of PNGs being committed."""
    if not path.exists():
        return None
    return hashlib.sha256(np.asarray(Image.open(path).convert("RGBA")).tobytes()).hexdigest()


def source_check(failures: list[str]) -> dict:
    found = {"new": [], "old": []}
    for path in sorted((ROOT / "src" / "routes").rglob("*.tsx")):
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT).as_posix()
        heads = re.findall(r'(?:title|content)\s*[:=]\s*[`"]([^`"]*)[`"]', text)
        if any(NEW in h for h in heads):
            found["new"].append(rel)
        for h in heads:
            if OLD_RE.search(h):
                found["old"].append(f"{rel}: {plain(h)}")
    for line in found["old"]:
        failures.append(f"src: {line} still names the platform.")
    if not found["new"]:
        failures.append(f"src: no route's metadata says {NEW!r}.")
    return found


def run(build: Path, mode: str) -> int:
    failures: list[str] = []
    record: dict = {"mode": mode, "build": str(build), "markup": {}, "live": {}, "pixels": {}}
    pages = sorted(build.rglob("*.html"))

    for html in pages:
        route = route_of(build, html)
        reading = read_markup(html)
        record["markup"][route] = reading
        for field, values in reading.items():
            for value in values:
                if OLD_RE.search(value):
                    failures.append(f"markup {route} {field}: {plain(value)}")
        if html.name != "404.html" and reading.get("og:site_name") != [NEW]:
            failures.append(f"markup {route} og:site_name reads {plain(reading.get('og:site_name'))}, not {NEW!r}.")

    before_file = DATA / "titles-before.json"
    if mode == "after":
        if not before_file.exists():
            failures.append("no before record: run --mode before on the base build first.")
        else:
            before = json.loads(before_file.read_text(encoding="utf-8"))["markup"]
            if sorted(before) != sorted(record["markup"]):
                failures.append(f"the page set moved: before {sorted(before)}, now {sorted(record['markup'])}.")
            for route, fields in before.items():
                now = record["markup"].get(route, {})
                if sorted(fields) != sorted(now):
                    failures.append(f"{route}: fields were {sorted(fields)}, now {sorted(now)}.")
                for field, values in fields.items():
                    want = [OLD_RE.sub(NEW, v) for v in values]
                    if now.get(field) != want:
                        failures.append(
                            f"{route} {field}: expected {plain(want)} (the old value with the name swapped), "
                            f"read {plain(now.get(field))}."
                        )

    record["source"] = source_check(failures)

    port = W490.serve(build)
    base = f"http://127.0.0.1:{port}"
    shots = SHOTS / mode
    shots.mkdir(parents=True, exist_ok=True)
    counts = {"pages": len(pages), "fields": 0, "shots": 0}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for html in pages:
            route = route_of(build, html)
            slug = slug_of(route)
            for label, width, height, touch in PROFILES:
                where = f"{route} @ {label}"
                ctx = browser.new_context(
                    viewport={"width": width, "height": height}, device_scale_factor=1,
                    is_mobile=touch, has_touch=touch, reduced_motion="reduce",
                )
                page = ctx.new_page()
                page.goto(base + route, wait_until="networkidle")
                W490.settle(page)
                page.add_style_tag(content=STILL)
                W490.to_top(page)
                page.wait_for_timeout(200)
                live = page.evaluate(LIVE)
                record["live"][where] = live
                markup = record["markup"][route]
                for field, values in live.items():
                    for value in values:
                        counts["fields"] += 1
                        if OLD_RE.search(value):
                            failures.append(f"live {where} {field}: {plain(value)}")
                    if field != "title" and values != markup.get(field):
                        failures.append(f"live {where} {field}: {plain(values)} but the markup says {plain(markup.get(field))}.")
                if markup["title"] and live["title"] != markup["title"][:1]:
                    failures.append(f"live {where}: the tab reads {plain(live['title'])}, the markup {plain(markup['title'])}.")
                shot = shots / f"{slug}-{label}.png"
                page.screenshot(path=str(shot), full_page=True, animations="disabled", caret="hide")
                counts["shots"] += 1
                record.setdefault("regions", {})[shot.name] = regions(page)
                ctx.close()
        browser.close()

    if mode == "after":
        for shot in sorted(shots.glob("*.png")):
            bands = record["regions"][shot.name]
            row = {"whole": diff_count(SHOTS / "before" / shot.name, shot, None)}
            for part in ("header", "main", "footer"):
                row[part] = diff_count(SHOTS / "before" / shot.name, shot, bands[part]) if bands[part] else "absent"
            row["sha_before"] = pixel_sha(SHOTS / "before" / shot.name)
            row["sha_after"] = pixel_sha(shot)
            record["pixels"][shot.name] = row
            if row["whole"] is None:
                failures.append(f"pixels: no before shot for {shot.name}.")
            elif row["whole"]:
                failures.append(f"pixels: {shot.name} differs from its before shot: {row}.")

    DATA.mkdir(parents=True, exist_ok=True)
    out = DATA / f"titles-{mode}.json"
    # ensure_ascii, so the titles' existing em dash is written as an escape.
    out.write_text(json.dumps(record, indent=1, ensure_ascii=True) + "\n", encoding="utf-8")

    print(f"wave507   mode={mode}  build={build}")
    for route, fields in record["markup"].items():
        print(f"  {route:<34} title {plain(fields['title'])}")
        for key in FIELDS + ("ld+json name",):
            if key in fields:
                print(f"  {'':<34} {key} {plain(fields[key])}")
    print(f"src: NEW in {len(record['source']['new'])} route files; old name in {len(record['source']['old'])} metadata strings")
    if record["pixels"]:
        moved = sum(1 for v in record["pixels"].values() if v["whole"])
        print(f"pixels: {len(record['pixels'])} full-page shots paired with before (header, main, footer each read), {moved} differ")
    print(f"wave507   {counts['pages']} pages, {counts['fields']} live readings, {counts['shots']} shots")
    if failures:
        tail = " (recorded, not failed: before mode)" if mode == "before" else ""
        print(f"\n{len(failures)} FAILURE(S){tail}:")
        for line in failures:
            print(f"  - {line}")
        return 0 if mode == "before" else 1
    print("\nAll assertions passed.")
    return 0


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", default=str(BUILD))
    parser.add_argument("--mode", choices=["before", "after"], default="after")
    args = parser.parse_args()
    build = Path(args.build)
    if not (build / "index.html").exists():
        raise SystemExit(f"No build at {build}. Run: STATIC_BUILD=true bun run build")
    return run(build, args.mode)


if __name__ == "__main__":
    raise SystemExit(main())
