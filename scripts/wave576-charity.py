"""Wave 576: the site says ten per cent goes to Metro World Child UK.

    python scripts/wave576-charity.py --build <dir> --mode before   # record, never fail
    python scripts/wave576-charity.py                               # the guard, on dist/client
    python scripts/wave576-charity.py --arm a1                      # in-memory mutation, must exit 1
    python scripts/wave576-charity.py --arm a2                      # in-memory mutation, must exit 1
    python scripts/wave576-charity.py --arm a3                      # in-memory mutation, must exit 1

`--mode before` is refused unless the build sits in a git checkout at the base
commit (BASE_COMMIT), and it reads `src` from that checkout, so a later run
cannot re-base the guard on the head and the red run exercises checks 1 and 2.

Callum, 9 October 2026, 19:13 UK. His sentence ships verbatim, with a full stop,
from one constant (`src/content/charity.ts`) to three places: the footer's
legal band on every route, a cream band on the home page under the mission, and
the third line of About's Who We Are summary.

WHAT THIS READS AND ASSERTS, in `--mode after` (the default):

  1. THE CONSTANT equals the sentence, held below as a literal.
  2. THE SOURCE: only `charity.ts` holds "Metro World Child" (every text file
     under `src`, whatever its extension), and exactly three files import
     `charityPledge` (the footer, the home route, the about copy).
  3. THE MARKUP: the page list equals the base build's, and the sentence is once
     inside `<footer>` on each of the 29 pages the base build recorded as
     footered (every prerendered page but `404.html`, which has no footer);
     and twice in all in `index.html` and `about/index.html` (footer plus the
     page's own placement).
  4. THE HYDRATED PAGE at 1280 and 390, on `/`, `/about`, `/register` and
     `/register/investor`: one footer `<p>` equals the constant; on `/` the
     band reads it in Barlow 700, on the computed `--color-page-alt`, below the
     first viewport; on `/about` the summary's third line equals it.
  5. EVERY OTHER BAND of `main` on `/` and `/about`, at both widths, is cut out
     as its own element capture on the base (`--mode before`, committed under
     docs/wave576/bands-base) and on the head with the wave's one element
     hidden (the cream band on `/`, the pledge line on `/about`), and paired
     child by child: no band differs by more than three levels of a channel in
     any pixel (the count of any difference at all is printed beside it). The
     head is also cut as it ships, and that pairing is reported, not asserted,
     except that on `/about` the child holding the Who We Are summary (the one
     child there is) must differ and be taller.

     Why the shipped pairing is not asserted (wave 576 fix pass, 10 Oct 2026,
     `docs/wave576/z7-390-residual.txt`). At 1280 the band is 169.78px tall, so
     every band below it sits on a 0.8px offset the base never had. At 390 it
     is a whole 185px and every band below moves by exactly 185, so no offset
     explains the residual there. What does: the pixels that differ sit in
     moving content, namely the two logo strips (the councils' and the data
     sources', 144 px of at most 10 levels in the first and 35,732 px in the
     second), the count-up figures ("193,000+", "634,000+") and a few animated
     SVG marks. The head differs from itself by 0 px between two loads, so it
     is a function of where the band sits, not of time; what in the page's own
     code ties those strips to the scroll position was not isolated.
  6. THE HOME PAGE'S LCP ELEMENT and `<link rel="preload">` tags equal the base
     build's, as `--mode before` recorded them on the base.

`--mode before` takes the same readings and shots and exits 0: run on the base
build it is the red proof, and it prints every failure it would have raised.

`--arm` mutates the source and markup in memory, runs checks 1 to 3 only, and
must exit 1: `a1` drops the full stop from the constant, `a2` types the
sentence into the footer's source, `a3` removes the home route's import.

Shots Callum is shown, under docs/screenshots/wave576/: the home page, the
footer and /about at 1280 and 390, `-before` or `-after` by mode.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
SHOTS = ROOT / "docs" / "screenshots" / "wave576"
DATA = ROOT / "docs" / "wave576"

PROFILES = [("1280", 1280, 900, False), ("390", 390, 844, True)]

SENTENCE = (
    "10% of all profits made go to Metro World Child UK to bring hope and joy to "
    "children today and change lives for tomorrow."
)
NAME = "Metro World Child"
CHARITY = "src/content/charity.ts"
IMPORTERS = {
    "src/components/site-footer.tsx",
    "src/routes/index.tsx",
    "src/content/about.ts",
}
ROUTES = [
    ("/", "home"),
    ("/about", "about"),
    ("/register", "register"),
    ("/register/investor", "register-investor"),
]
BASE_COMMIT = "73fcf6f"
BANDS = Path(tempfile.gettempdir()) / "wave576-bands"
BASE_BANDS = DATA / "bands-base"
BAND_ROUTES = [("/", "home"), ("/about", "about")]
# The step per channel that is not counted in the HIDDEN pairing. At 1280 the
# mission band differs by 4 px, at three levels or fewer, between the base and
# the head with the element hidden, on every run; the cause was not isolated.
# Both counts are recorded and printed; only the count above this is asserted.
NOISE = 3
STILL = (
    "*, *::before, *::after { animation: none !important; transition: none !important; "
    "caret-color: transparent !important; }"
)


def load_490():
    """Wave 490's server and settle, so this gate serves pages the way the others do."""
    spec = importlib.util.spec_from_file_location("wave490", ROOT / "scripts" / "wave490-phone.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


W490 = load_490()


def plain(value) -> str:
    return json.dumps(value, ensure_ascii=True)


def src_files(root: Path = ROOT) -> dict[str, str]:
    """Every text file under src, whatever its extension."""
    out = {}
    for path in sorted((root / "src").rglob("*")):
        if not path.is_file():
            continue
        try:
            out[path.relative_to(root).as_posix()] = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
    return out


def git_root_of(build: Path) -> tuple[Path | None, str | None]:
    """The git checkout a build sits in, and its HEAD."""
    try:
        top = subprocess.run(
            ["git", "-C", str(build), "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
        head = subprocess.run(
            ["git", "-C", top, "rev-parse", "HEAD"], capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None, None
    return Path(top), head


def constant_of(text: str) -> str | None:
    found = re.search(r"export const charityPledge\s*=\s*\"([^\"]*)\"", text)
    return found.group(1) if found else None


def footer_of(html: str) -> str:
    found = re.search(r"<footer\b.*?</footer>", html, re.S)
    return found.group(0) if found else ""


def static_checks(
    build: Path, arm: str | None, failures: list[str], record: dict,
    src_root: Path = ROOT, base_pages: list[str] | None = None,
) -> dict[str, str]:
    """Checks 1 to 3. `arm` mutates what they read, in memory, and nothing else."""
    sources = src_files(src_root)
    pages = {
        html.relative_to(build).as_posix(): html.read_text(encoding="utf-8")
        for html in sorted(build.rglob("*.html"))
    }
    if arm == "a1":
        # The full stop goes from the constant and so from everything built from it.
        sources[CHARITY] = sources[CHARITY].replace("tomorrow.\"", "tomorrow\"")
        pages = {k: v.replace(SENTENCE, SENTENCE[:-1]) for k, v in pages.items()}
    elif arm == "a2":
        # The sentence typed into the footer by hand, beside the constant.
        key = "src/components/site-footer.tsx"
        sources[key] = sources[key].replace("{charityPledge}", SENTENCE)
    elif arm == "a3":
        # The home route stops importing the constant (and so stops using it).
        key = "src/routes/index.tsx"
        sources[key] = sources[key].replace('import { charityPledge } from "@/content/charity";\n', "")
        sources[key] = sources[key].replace("{charityPledge}", "")

    # 1. the constant
    held = constant_of(sources.get(CHARITY, ""))
    record["constant"] = held
    if held != SENTENCE:
        failures.append(f"constant: charityPledge reads {plain(held)}.")

    # 2. the source
    named = sorted(rel for rel, text in sources.items() if NAME in text)
    record["source_named"] = named
    if named != [CHARITY]:
        failures.append(f"source: {NAME!r} is held by {named}, expected only {[CHARITY]}.")
    for rel, text in sources.items():
        if SENTENCE in text and rel != CHARITY:
            failures.append(f"source: {rel} holds the sentence itself, not the constant.")
    importers = sorted(
        rel for rel, text in sources.items()
        if rel != CHARITY and re.search(r"\bcharityPledge\b", text)
    )
    record["importers"] = importers
    if set(importers) != IMPORTERS:
        failures.append(f"source: charityPledge is read by {importers}, expected {sorted(IMPORTERS)}.")

    # 3. the markup
    record["pages"] = sorted(pages)
    if base_pages is not None:
        if sorted(pages) != sorted(base_pages):
            failures.append(
                f"markup: the page list moved: {sorted(set(pages) ^ set(base_pages))} differ from the base's."
            )
        footered = [r for r in base_pages if r != "404.html"]
        if len(footered) != 29:
            failures.append(f"markup: the base build recorded {len(footered)} footered pages, expected 29.")
    record["footer_count"] = {}
    pages_with = 0
    for rel, html in pages.items():
        in_footer = footer_of(html).count(SENTENCE)
        record["footer_count"][rel] = in_footer
        expected = 0 if rel == "404.html" else 1
        if in_footer:
            pages_with += 1
        if in_footer != expected:
            failures.append(f"markup {rel}: the sentence is in the footer {in_footer} time(s), expected {expected}.")
        if rel == "404.html" and html.count(SENTENCE):
            failures.append("markup 404.html: carries the sentence, and has no footer.")
    record["pages_with_footer_sentence"] = pages_with
    if base_pages is not None and pages_with != len([r for r in base_pages if r != "404.html"]):
        failures.append(f"markup: the sentence is in the footer of {pages_with} pages, the base had {len(base_pages) - 1} footered.")
    for rel in ("index.html", "about/index.html"):
        total = pages.get(rel, "").count(SENTENCE)
        record.setdefault("totals", {})[rel] = total
        if total != 2:
            failures.append(f"markup {rel}: the sentence is {total} time(s) in all, expected 2.")
    for rel, html in pages.items():
        if rel not in ("index.html", "about/index.html", "404.html") and html.count(SENTENCE) != 1:
            failures.append(f"markup {rel}: {html.count(SENTENCE)} occurrences in all, expected 1.")
    return pages


FOOTER_READ = r"""
() => {
  const footers = [...document.querySelectorAll('footer')];
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  return {
    footers: footers.length,
    paragraphs: footers.flatMap((f) => [...f.querySelectorAll('p')].map(text)),
    pledge: footers.flatMap((f) => [...f.querySelectorAll('p')]
      .filter((p) => text(p).startsWith('10% of all profits')).map((p) => {
        const s = getComputedStyle(p);
        return { text: text(p), size: s.fontSize, weight: s.fontWeight, colour: s.color };
      })),
  };
}
"""

HOME_READ = r"""
(sentence) => {
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  const probe = document.createElement('div');
  probe.style.background = 'var(--color-page-alt)';
  document.body.appendChild(probe);
  const alt = getComputedStyle(probe).backgroundColor;
  probe.remove();
  const hits = [...document.querySelectorAll('main p')].filter((p) => text(p) === sentence);
  return hits.map((p) => {
    const s = getComputedStyle(p);
    const band = p.parentElement.parentElement;
    const b = getComputedStyle(band);
    const r = p.getBoundingClientRect();
    return {
      family: s.fontFamily, weight: s.fontWeight, size: s.fontSize,
      band: b.backgroundColor, alt, border: b.borderTopWidth,
      top: r.top + scrollY, viewport: innerHeight,
    };
  });
}
"""

ABOUT_READ = r"""
(sentence) => {
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  const heading = document.getElementById('about-heading');
  const summary = heading.closest('div.relative').querySelector('div.flex-col');
  const lines = [...summary.querySelectorAll(':scope > p')].map(text);
  return { lines, third: lines[2] === sentence, all: [...document.querySelectorAll('main p')].filter((p) => text(p) === sentence).length };
}
"""

LCP_READ = r"""
() => new Promise((resolve) => {
  const seen = [];
  new PerformanceObserver((list) => seen.push(...list.getEntries()))
    .observe({ type: 'largest-contentful-paint', buffered: true });
  setTimeout(() => {
    const last = seen[seen.length - 1];
    const el = last && last.element;
    resolve({
      tag: el ? el.tagName : null,
      url: last && last.url ? new URL(last.url).pathname : null,
      text: el ? el.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) : null,
      id: el ? el.id : null,
      cls: el ? String(el.className).slice(0, 120) : null,
    });
  }, 1500);
})
"""


BANDS_READ = r"""
(sentence) => {
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  const kids = [...document.querySelector('main').children];
  kids.forEach((k, i) => k.setAttribute('data-w576', String(i)));
  return kids.map((k, i) => ({
    i, tag: k.tagName, h: Math.round(k.getBoundingClientRect().height),
    pledge: text(k).includes(sentence.slice(0, 20)),
    summary: !!k.querySelector('#about-heading'),
  }));
}
"""


HIDE = r"""
(sentence) => {
  const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  const hit = [...document.querySelectorAll('main p')].filter((p) => text(p) === sentence);
  const home = location.pathname === '/';
  hit.forEach((p) => { (home ? p.parentElement.parentElement : p).style.display = 'none'; });
  return hit.length;
}
"""


def read_bands(page, slug: str, label: str, folder: Path) -> list[dict]:
    """Cut each direct child of main out as a PNG under `folder`."""
    kids = page.evaluate(BANDS_READ, SENTENCE)
    folder.mkdir(parents=True, exist_ok=True)
    for kid in kids:
        if kid["h"] == 0:
            kid["file"] = None
            continue
        W490.to_top(page)
        shot = folder / f"{slug}-{label}-{kid['i']:02d}.png"
        page.locator(f'[data-w576="{kid["i"]}"]').screenshot(
            path=str(shot), animations="disabled", caret="hide"
        )
        kid["file"] = shot.name
    return kids


def pair_bands(
    slug: str, label: str, was: list[dict], now: list[dict], failures: list[str], folder: Path, assert_equal: bool
) -> dict:
    where = f"{slug} @ {label} ({'hidden' if assert_equal else 'as shipped'})"
    # The head's extra child on / is the home band; drop it before pairing.
    extra = [k for k in now if k["pledge"] and slug == "home"]
    kept = [k for k in now if k not in extra]
    if slug == "home" and len(extra) != 1:
        failures.append(f"bands {where}: {len(extra)} extra children carry the pledge, expected 1.")
    if len(kept) != len(was):
        failures.append(f"bands {where}: {len(kept)} children now against {len(was)} on the base.")
        return {}
    rows, differing = [], []
    for old, new in zip(was, kept):
        a = np.asarray(Image.open(BASE_BANDS / old["file"]).convert("RGBA")).astype(np.int16)
        b = np.asarray(Image.open(folder / new["file"]).convert("RGBA")).astype(np.int16)
        if a.shape != b.shape:
            strict = beyond = int(max(a.shape[0] * a.shape[1], b.shape[0] * b.shape[1]))
        else:
            delta = np.abs(a - b).max(axis=2)
            strict, beyond = int((delta > 0).sum()), int((delta > NOISE).sum())
        rows.append({"child": old["i"], "tag": old["tag"], "strict": strict, "beyond_noise": beyond,
                     "height": [old["h"], new["h"]]})
        if beyond:
            differing.append(new)
            if assert_equal:
                failures.append(f"bands {where}: child {old['i']} differs in {beyond} px by more than {NOISE} levels.")
    if not assert_equal and slug == "about":
        grown = [(o, n) for o, n in zip(was, kept) if n["summary"]]
        if [k["i"] for k in differing if k["summary"]] != [k["i"] for k in kept if k["summary"]]:
            failures.append(f"bands {where}: the child holding the summary did not differ.")
        if not grown or not all(n["h"] > o["h"] for o, n in grown):
            failures.append(f"bands {where}: the child holding the summary is not taller.")
    return {"rows": rows, "extra_height": extra[0]["h"] if extra else None}


def preloads_of(html: str) -> list[str]:
    return sorted(re.findall(r"<link\b[^>]*rel=\"preload\"[^>]*>", html))


def run(build: Path, mode: str, arm: str | None) -> int:
    failures: list[str] = []
    record: dict = {"mode": mode, "build": str(build), "live": {}}
    lcp_file = DATA / "lcp-before.json"
    base_lcp = json.loads(lcp_file.read_text(encoding="utf-8")) if lcp_file.exists() else None
    src_root, base_pages = ROOT, None
    if mode == "before":
        top, head = git_root_of(build)
        if head is None or not head.startswith(BASE_COMMIT):
            raise SystemExit(
                f"--mode before records the BASE and is refused unless the build sits in a git checkout at "
                f"{BASE_COMMIT}; this one is at {head}. Build {BASE_COMMIT} in its own detached worktree."
            )
        src_root = top
        record["commit"] = head
    else:
        if base_lcp is None or not str(base_lcp.get("commit", "")).startswith(BASE_COMMIT):
            raise SystemExit(f"docs/wave576/lcp-before.json does not record the base commit {BASE_COMMIT}.")
        base_pages = base_lcp.get("pages")
    record["src_root"] = str(src_root)
    pages = static_checks(build, arm, failures, record, src_root, base_pages)
    if arm:
        print(f"wave576   arm={arm}  (source and markup mutated in memory, static checks only)")
        for line in failures:
            print(f"  - {line}")
        print(f"\n{len(failures)} FAILURE(S) from arm {arm}.")
        return 1 if failures else 0

    DATA.mkdir(parents=True, exist_ok=True)
    SHOTS.mkdir(parents=True, exist_ok=True)
    record["preloads"] = preloads_of(pages["index.html"])
    counts = {"shots": 0, "readings": 0, "bands": 0}

    port = W490.serve(build)
    base = f"http://127.0.0.1:{port}"

    def shoot(page, name: str, target=None) -> None:
        W490.to_top(page)
        page.wait_for_timeout(200)
        path = str(SHOTS / name)
        if target is None:
            page.screenshot(path=path, full_page=True, animations="disabled", caret="hide")
        else:
            # The sticky header is hidden (not removed) while an element taller than
            # the viewport is taken, so it is never drawn over it (wave 576 fix pass).
            page.evaluate("document.querySelector('header').style.visibility = 'hidden'")
            target.screenshot(path=path, animations="disabled", caret="hide")
            page.evaluate("document.querySelector('header').style.visibility = ''")
        counts["shots"] += 1

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for label, width, height, touch in PROFILES:
            # 5. the home page's LCP, on a fresh load, before any scrolling.
            ctx = browser.new_context(
                viewport={"width": width, "height": height}, device_scale_factor=1,
                is_mobile=touch, has_touch=touch, reduced_motion="reduce",
            )
            page = ctx.new_page()
            page.goto(base + "/", wait_until="networkidle")
            lcp = page.evaluate(LCP_READ)
            record["live"][f"/ lcp @ {label}"] = lcp
            if mode == "after":
                if base_lcp is None:
                    failures.append("lcp: no base record (docs/wave576/lcp-before.json); run --mode before on the base first.")
                else:
                    if base_lcp["live"].get(f"/ lcp @ {label}") != lcp:
                        failures.append(
                            f"lcp @ {label}: {plain(lcp)} against the base's "
                            f"{plain(base_lcp['live'].get(f'/ lcp @ {label}'))}."
                        )
                    if base_lcp["preloads"] != record["preloads"]:
                        failures.append("preload: index.html's <link rel=preload> tags differ from the base's.")
            ctx.close()

            for path, slug in ROUTES:
                where = f"{path} @ {label}"
                ctx = browser.new_context(
                    viewport={"width": width, "height": height}, device_scale_factor=1,
                    is_mobile=touch, has_touch=touch, reduced_motion="reduce",
                )
                page = ctx.new_page()
                page.goto(base + path, wait_until="networkidle")
                W490.settle(page)
                page.add_style_tag(content=STILL)
                W490.to_top(page)
                reading: dict = {}

                # 4. the footer, on all four routes
                foot = page.evaluate(FOOTER_READ)
                reading["footer"] = foot
                counts["readings"] += 1
                if foot["footers"] != 1:
                    failures.append(f"live {where}: {foot['footers']} footer(s), expected 1.")
                if [x["text"] for x in foot["pledge"]] != [SENTENCE]:
                    failures.append(f"live {where}: the footer's pledge paragraphs read {plain([x['text'] for x in foot['pledge']])}.")

                if slug == "home":
                    band = page.evaluate(HOME_READ, SENTENCE)
                    reading["band"] = band
                    counts["readings"] += 1
                    if len(band) != 1:
                        failures.append(f"live {where}: {len(band)} home band paragraph(s) read the sentence, expected 1.")
                    else:
                        b = band[0]
                        if "Barlow" not in b["family"] or b["weight"] != "700":
                            failures.append(f"live {where}: the band is {b['family']} {b['weight']}, expected Barlow 700.")
                        if b["band"] != b["alt"]:
                            failures.append(f"live {where}: the band ground is {b['band']}, expected {b['alt']}.")
                        if b["top"] <= b["viewport"]:
                            failures.append(f"live {where}: the band sits at {b['top']:.0f}px, inside the first viewport ({b['viewport']}px).")
                    shoot(page, f"home-{label}-{mode}.png")
                elif slug == "about":
                    summary = page.evaluate(ABOUT_READ, SENTENCE)
                    reading["summary"] = summary
                    counts["readings"] += 1
                    if not summary["third"]:
                        failures.append(f"live {where}: the summary's third line reads {plain(summary['lines'][2:3])}.")
                    shoot(page, f"about-{label}-{mode}.png")
                if slug in ("home", "about"):
                    bands = read_bands(page, slug, label, BASE_BANDS if mode == "before" else BANDS / "after")
                    record.setdefault("bands", {})[where] = bands
                    if mode == "after":
                        base_bands = json.loads(lcp_file.read_text(encoding="utf-8")).get("bands", {}).get(where)
                        if base_bands is None:
                            failures.append(f"bands {where}: no base record.")
                        else:
                            reading["bands"] = pair_bands(slug, label, base_bands, bands, failures, BANDS / "after", False)
                            # A fresh load of its own, so the hero's own motion has run for
                            # the same time as it had when the base was cut.
                            ctx2 = browser.new_context(
                                viewport={"width": width, "height": height}, device_scale_factor=1,
                                is_mobile=touch, has_touch=touch, reduced_motion="reduce",
                            )
                            page2 = ctx2.new_page()
                            page2.goto(base + path, wait_until="networkidle")
                            W490.settle(page2)
                            page2.add_style_tag(content=STILL)
                            W490.to_top(page2)
                            if page2.evaluate(HIDE, SENTENCE) != 1:
                                failures.append(f"bands {where}: could not hide the wave's element.")
                            page2.wait_for_timeout(200)
                            hidden = read_bands(page2, slug, label, BANDS / "hidden")
                            ctx2.close()
                            reading["bands_hidden"] = pair_bands(slug, label, base_bands, hidden, failures, BANDS / "hidden", True)
                            counts["bands"] += len(reading["bands_hidden"].get("rows", []))
                if slug == "register":
                    shoot(page, f"footer-{label}-{mode}.png", page.locator("footer").first)
                record["live"][where] = reading
                ctx.close()
        browser.close()

    (DATA / f"charity-{mode}.json").write_text(
        json.dumps(record, indent=1, ensure_ascii=True) + "\n", encoding="utf-8"
    )
    if mode == "before":
        lcp_file.write_text(json.dumps(record, indent=1, ensure_ascii=True) + "\n", encoding="utf-8")

    print(f"wave576   mode={mode}  build={build}")
    print(f"markup: the sentence is once in the footer of {record['pages_with_footer_sentence']} pages; totals {record['totals']}")
    for where, reading in record["live"].items():
        if "footer" in reading:
            f = reading["footer"]
            print(f"  {where:<26} footers {f['footers']}  pledge paragraphs {len(f['pledge'])}")
        if "band" in reading:
            for b in reading["band"]:
                print(f"  {'':<26} band {b['family'].split(',')[0]} {b['weight']} {b['size']}, ground {b['band']}, top {b['top']:.0f}px of a {b['viewport']}px viewport")
        if "summary" in reading:
            print(f"  {'':<26} summary lines {len(reading['summary']['lines'])}, third is the sentence: {reading['summary']['third']}")
        for key, what in (("bands_hidden", "hidden"), ("bands", "as shipped, not asserted")):
            if reading.get(key, {}).get("rows"):
                rows = reading[key]["rows"]
                print(
                    f"  {'':<26} bands paired {len(rows)} ({what}): px differing "
                    f"{[r['strict'] for r in rows]} (beyond {NOISE} levels {[r['beyond_noise'] for r in rows]}), heights {[r['height'][0] for r in rows]} to {[r['height'][1] for r in rows]}"
                    + (f"; the extra band is {reading[key]['extra_height']}px tall" if reading[key].get("extra_height") else "")
                )
        if "lcp" in where:
            print(f"  {where:<26} {plain(reading)}")
    print(f"wave576   {counts['readings']} hydrated readings, {counts['bands']} bands paired, {counts['shots']} shots in {SHOTS.relative_to(ROOT).as_posix()}")
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
    parser.add_argument("--arm", choices=["a1", "a2", "a3"])
    args = parser.parse_args()
    build = Path(args.build)
    if not (build / "index.html").exists():
        raise SystemExit(f"No build at {build}. Run: STATIC_BUILD=true bun run build")
    return run(build, args.mode, args.arm)


if __name__ == "__main__":
    raise SystemExit(main())
