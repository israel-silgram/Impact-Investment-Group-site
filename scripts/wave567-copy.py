"""Wave 567: the site says match it, the register pages drop the funnel, and
How we differ says five years plus.

    python scripts/wave567-copy.py --build <dir> --mode before   # record, never fail
    python scripts/wave567-copy.py                               # the guard, on dist/client

Callum, 7 Oct 2026, three changes to the live site:

  R567-1  "Find it, price it, prove it" becomes "Find it, price it, match it".
  R567-2  How we differ no longer names a 25 year lease anywhere, and says
          five years plus on FRI or internal repairing terms, CPI-linked,
          renewable.
  R567-3  The footer's register funnel is not rendered on /register or on any
          /register/<role> page, and is exactly as it was everywhere else.

WHAT THIS READS AND ASSERTS, in `--mode after` (the default):

  1. THE MARKUP. `id="funnel-heading"` is counted in every prerendered page.
     None under register/, none in the static 404 (which has no footer and
     never had one), exactly one in every other page.
  2. THE MARKUP of /platform: the `description` and `og:description` meta read
     exactly the approved strings.
  3. THE HYDRATED PAGE at 1280 and 390: /register, /register/investor and
     /register/resident carry no #funnel-heading and still carry a footer; /
     and /platform carry one.
  4. THE HYDRATED /platform at 1280 and 390: the hero title, the portal
     doorway's label and accessible name, the workflow disc's small line, the
     three upper-cased claims in the comic strip, Pippa's body in the
     workflow panel, the two meta values, and no "prove" or "proves" as a
     word anywhere in the page's text.
  5. HOW WE DIFFER at 1280 and 390, with each of the three chapters selected
     in turn: the story's text (the heading, the lead, the chapter card, the
     strip and the three principles) never carries "25"; the strip reads the two
     approved sides; chapter 01's figure reads FIXED and chapter 03's reads
     5+, each with its caption; chapter 03's title, body and three points are
     the approved ones; and the figure's own box stays inside its card, which
     is what the size-by-shape branch is for. The band also holds the lane
     of three published figures, whose sources are dated "31 March 2025", "31
     December 2025" and "2024 to 25": those are the dates of gov.uk
     publications and no figure may lose its date, so the lane is read apart
     from the story and every "25" in it has to sit inside one of those dates.
  6. THE SOURCE: no triad string with "prove" is left in the two files that
     held them.

It also writes the full-page shots Callum is shown, under
docs/screenshots/wave567/: /platform, /register and /register/investor at 1280
and 390, `-before` or `-after` by mode, with chapter 03 selected in the after
shot of /platform, and chapter 01 at 1280 beside it.

`--mode before` takes the same readings and shots and exits 0: run on the base
build it is the red proof, and it prints every failure it would have raised.

The separator in the og:description and in the doorway's accessible name is
the one those strings already carried. It is written here as an escape so
this file adds no em dash to the tree.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
SHOTS = ROOT / "docs" / "screenshots" / "wave567"
DATA = ROOT / "docs" / "wave567"

PROFILES = [("1280", 1280, 900, False), ("390", 390, 844, True)]
DASH = "\u2014"

DESCRIPTION = (
    "Find it, price it, match it. We source UK residential property, price every home "
    "against named public data, and follow it into managed supported housing."
)
OG_DESCRIPTION = (
    "The Property Finder, the Demand Map and an AI team that finds, prices and matches "
    f"every home {DASH} one workflow, every figure sourced."
)
HERO = "Find it, price it, match it."
DISC = "Find · Price · Match"
DOOR_LABEL = "Enter · Match"
DOOR_NAME = f"Meet Pippa {DASH} Enter · Match"
CLAIMS = ["PETRA FINDS IT.", "PETER PRICES IT.", "PIPPA MATCHES IT."]
PIPPA_BODY = (
    "Pippa checks every home against the demand in its area and scores its social "
    "impact in plain terms."
)
STRIP = [
    "One long fixed term · the legacy model",
    "5 years+ · FRI or internal repairing · CPI-linked · renewable",
]
# Per chapter: the figure, its caption (as written; the page upper-cases it in
# CSS), and for chapter 03 the title, body and points.
VISUAL = {
    "past": ("FIXED", "one long term, no review point"),
    "lessons": ("REVIEW", "before risk rolls forward"),
    "solution": ("5+", "year leases, renewed on evidence"),
}
SOLUTION = {
    "eyebrow": "Our sustainable solution",
    "title": "Five-year-plus leases, renewed on evidence.",
    "body": (
        "Our leases run for five years or more on full repairing and insuring or internal "
        "repairing terms, with CPI-linked rent and renewal at the end of the term: a clear "
        "point to review demand, funding and policy while residents keep the stability of "
        "their home."
    ),
    "points": [
        "Full repairing and insuring (FRI) or internal repairing terms",
        "Rent linked to CPI for the life of the lease",
        "Renewal at the end of the term, decided on the evidence of demand",
    ],
}
CHAPTERS = ["past", "lessons", "solution"]

# The funnel is read on these hydrated routes: (path, slug, funnels expected).
FUNNEL_ROUTES = [
    ("/register", "register", 0),
    ("/register/investor", "register-investor", 0),
    ("/register/resident", "register-resident", 0),
    ("/", "home", 1),
    ("/platform", "platform", 1),
]
SHOT_SLUGS = {"platform", "register", "register-investor"}

TRIAD_RE = re.compile(r"prove it|prove\.|proves|Price · Prove|PRICE IT · PROVE", re.I)
# The only "25"s the band may show: the dates on the three published figures.
DATE_RE = re.compile(r"31 March 2025|31 December 2025|2024\u201325")
WORD_RE = re.compile(r"\bproves?\b", re.I)

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


def meta_of(html: str, key: str) -> list[str]:
    out = []
    for tag in re.findall(r"<meta\b[^>]*>", html):
        if re.search(rf'(?:name|property)="{re.escape(key)}"', tag):
            found = re.search(r'content="([^"]*)"', tag)
            if found:
                out.append(found.group(1).replace("&amp;", "&"))
    return out


PLATFORM_READ = r"""
() => {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const meta = (sel) => [...document.querySelectorAll(sel)].map((m) => m.content);
  const doors = [...document.querySelectorAll('ol[aria-label="Choose a platform guide"] button')];
  const comic = document.getElementById('living-comic-heading');
  const mission = document.getElementById('mission-control-heading');
  return {
    hero: text(document.querySelector('main h1')),
    description: meta('meta[name="description"]'),
    og: meta('meta[property="og:description"]'),
    doorNames: doors.map((d) => d.getAttribute('aria-label')),
    doorLabels: doors.map((d) => text(d)),
    disc: text(mission && mission.closest('section').querySelector('small')),
    comic: text(comic && comic.closest('section')),
    words: document.body.innerText,
  };
}
"""

PIPPA_READ = r"""
() => {
  const mission = document.getElementById('mission-control-heading').closest('section');
  const button = [...mission.querySelectorAll('button')].find(
    (b) => b.textContent.trim() === 'Pippa');
  if (!button) return null;
  button.click();
  return true;
}
"""

PANEL_READ = r"""
() => {
  const section = document.getElementById('mission-control-heading').closest('section');
  const panel = section.querySelector('[aria-live="polite"]');
  return panel ? panel.textContent.replace(/\s+/g, ' ').trim() : null;
}
"""

DIFFER_READ = r"""
() => {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const section = document.getElementById('compare-heading').closest('section');
  const panel = document.getElementById('difference-story-panel');
  const card = panel.querySelector('.rounded-2xl');
  const figure = card.querySelector('p');
  const strip = [...panel.querySelectorAll('.border-t span.font-semibold')].map(text);
  const lane = section.querySelector('.demand-ticker');
  const laneWords = lane ? lane.innerText : '';
  // The story is the section less the lane of published figures.
  const all = section.innerText;
  const at = laneWords ? all.indexOf(laneWords) : -1;
  const story = at < 0 ? null : all.slice(0, at) + all.slice(at + laneWords.length);
  const c = card.getBoundingClientRect();
  const f = figure.getBoundingClientRect();
  // The glyphs, not the paragraph's box: a range over the text node is what
  // the ink actually spans.
  const range = document.createRange();
  range.selectNodeContents(figure);
  const g = range.getBoundingClientRect();
  return {
    words: story,
    lane: laneWords,
    eyebrow: text(panel.querySelector('p.eyebrow')),
    title: text(panel.querySelector('h3')),
    body: text(panel.querySelector('h3 + p')),
    points: [...panel.querySelectorAll('ul li')].map(text),
    value: text(figure),
    unit: text(card.querySelector('p + p')),
    strip,
    card: [c.left, c.right],
    glyphs: [g.left, g.right],
    fontPx: parseFloat(getComputedStyle(figure).fontSize),
    selected: text(document.querySelector('[role="tab"][aria-selected="true"]')),
  };
}
"""


def run(build: Path, mode: str) -> int:
    failures: list[str] = []
    record: dict = {"mode": mode, "build": str(build), "funnel_markup": {}, "live": {}}

    # ── 1. the funnel in the markup ────────────────────────────────────────
    with_funnel, without_funnel = [], []
    for html in sorted(build.rglob("*.html")):
        rel = html.relative_to(build).as_posix()
        count = html.read_text(encoding="utf-8").count('id="funnel-heading"')
        record["funnel_markup"][rel] = count
        (with_funnel if count else without_funnel).append(rel)
        expected = 0 if rel.startswith("register/") or rel == "404.html" else 1
        if count != expected:
            failures.append(f"markup {rel}: funnel-heading {count} time(s), expected {expected}.")
    register_pages = [r for r in record["funnel_markup"] if r.startswith("register/")]
    if len(register_pages) != 11:
        failures.append(f"markup: {len(register_pages)} pages under register/, expected 11.")

    # ── 2. the /platform meta in the markup ────────────────────────────────
    platform_html = (build / "platform" / "index.html").read_text(encoding="utf-8")
    record["platform_markup"] = {
        "description": meta_of(platform_html, "description"),
        "og:description": meta_of(platform_html, "og:description"),
    }
    if record["platform_markup"]["description"] != [DESCRIPTION]:
        failures.append(f"markup /platform description: {plain(record['platform_markup']['description'])}")
    if record["platform_markup"]["og:description"] != [OG_DESCRIPTION]:
        failures.append(f"markup /platform og:description: {plain(record['platform_markup']['og:description'])}")

    # ── 6. the source ──────────────────────────────────────────────────────
    record["source"] = []
    for rel in ("src/content/services.ts", "src/routes/platform.tsx"):
        for number, line in enumerate((ROOT / rel).read_text(encoding="utf-8").splitlines(), 1):
            if TRIAD_RE.search(line):
                record["source"].append(f"{rel}:{number}")
                failures.append(f"src {rel}:{number} still carries the old triad: {plain(line.strip()[:90])}")

    port = W490.serve(build)
    base = f"http://127.0.0.1:{port}"
    SHOTS.mkdir(parents=True, exist_ok=True)
    counts = {"shots": 0, "chapters": 0, "funnel": 0}

    def shoot(page, name: str) -> None:
        W490.to_top(page)
        page.wait_for_timeout(200)
        page.screenshot(path=str(SHOTS / name), full_page=True, animations="disabled", caret="hide")
        counts["shots"] += 1

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for path, slug, expected in FUNNEL_ROUTES:
            for label, width, height, touch in PROFILES:
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

                # ── 3. the funnel on the hydrated page ─────────────────────
                funnel = page.locator("#funnel-heading").count()
                footers = page.locator("footer").count()
                counts["funnel"] += 1
                reading = {"funnel": funnel, "footer": footers}
                if funnel != expected:
                    failures.append(f"live {where}: {funnel} #funnel-heading, expected {expected}.")
                if footers != 1:
                    failures.append(f"live {where}: {footers} footer(s), expected 1.")

                if slug == "platform":
                    read_platform(page, where, label, mode, reading, failures, counts, shoot)
                elif slug in SHOT_SLUGS:
                    shoot(page, f"{slug}-{label}-{mode}.png")
                record["live"][where] = reading
                ctx.close()
        browser.close()

    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / f"copy-{mode}.json").write_text(
        json.dumps(record, indent=1, ensure_ascii=True) + "\n", encoding="utf-8"
    )

    print(f"wave567   mode={mode}  build={build}")
    print(f"markup: funnel-heading present once in {len(with_funnel)} pages, absent from {len(without_funnel)}")
    print(f"  absent: {', '.join(without_funnel)}")
    for where, reading in record["live"].items():
        print(f"  {where:<26} funnel {reading['funnel']}  footer {reading['footer']}")
        for chapter, row in reading.get("differ", {}).items():
            print(
                f"  {'':<26} chapter {chapter:<8} figure {plain(row['value'])} at {row['fontPx']:.0f}px, "
                f"glyphs {row['glyphs'][0]:.0f} to {row['glyphs'][1]:.0f} in a card {row['card'][0]:.0f} to "
                f"{row['card'][1]:.0f}; caption {plain(row['unit'])}; \"25\" in the story: "
                f"{'YES' if '25' in row['words'] else 'no'}; in the figures lane only in {plain(row.get('laneDates'))}"
            )
        if "platform" in reading:
            r = reading["platform"]
            print(f"  {'':<26} hero {plain(r['hero'])}; disc {plain(r['disc'])}; door {plain(r['doorNames'][-1:])}")
    print(
        f"wave567   {counts['funnel']} hydrated funnel readings, {counts['chapters']} chapter readings, "
        f"{counts['shots']} shots in {SHOTS.relative_to(ROOT).as_posix()}"
    )
    if failures:
        tail = " (recorded, not failed: before mode)" if mode == "before" else ""
        print(f"\n{len(failures)} FAILURE(S){tail}:")
        for line in failures:
            print(f"  - {line}")
        return 0 if mode == "before" else 1
    print("\nAll assertions passed.")
    return 0


def read_platform(page, where, label, mode, reading, failures, counts, shoot) -> None:
    # ── 4. the triad on the hydrated page ──────────────────────────────────
    r = page.evaluate(PLATFORM_READ)
    words = r.pop("words")
    comic = r.pop("comic") or ""
    r["claims"] = [c for c in CLAIMS if c in comic]
    r["claimsOld"] = "PIPPA PROVES IT." in comic
    reading["platform"] = r
    if r["hero"] != HERO:
        failures.append(f"live {where}: the hero title reads {plain(r['hero'])}.")
    if r["description"] != [DESCRIPTION]:
        failures.append(f"live {where}: description reads {plain(r['description'])}.")
    if r["og"] != [OG_DESCRIPTION]:
        failures.append(f"live {where}: og:description reads {plain(r['og'])}.")
    if r["doorNames"][-1:] != [DOOR_NAME]:
        failures.append(f"live {where}: Pippa's doorway is named {plain(r['doorNames'][-1:])}.")
    if r["doorLabels"][-1:] != [DOOR_LABEL]:
        failures.append(f"live {where}: Pippa's doorway reads {plain(r['doorLabels'][-1:])}.")
    if r["disc"] != DISC:
        failures.append(f"live {where}: the workflow disc reads {plain(r['disc'])}.")
    if r["claims"] != CLAIMS:
        failures.append(f"live {where}: the comic strip carries {plain(r['claims'])} of {plain(CLAIMS)}.")
    stray = sorted(set(m.group(0) for m in WORD_RE.finditer(words)))
    r["proveWords"] = stray
    if stray:
        failures.append(f"live {where}: the page's text still carries {plain(stray)}.")

    if page.evaluate(PIPPA_READ):
        page.wait_for_timeout(150)
        panel = page.evaluate(PANEL_READ) or ""
        r["pippaPanel"] = panel
        if PIPPA_BODY not in panel:
            failures.append(f"live {where}: the workflow panel for Pippa reads {plain(panel)}.")
    else:
        failures.append(f"live {where}: no Pippa button in the workflow disc.")

    # ── 5. How we differ, each chapter in turn ─────────────────────────────
    reading["differ"] = {}
    tabs = page.locator('[role="tablist"][aria-label="How we differ storyline"] [role="tab"]')
    if tabs.count() != 3:
        failures.append(f"live {where}: {tabs.count()} chapter tabs, expected 3.")
        return

    def select(index: int) -> dict:
        tabs.nth(index).click()
        page.wait_for_timeout(200)
        counts["chapters"] += 1
        return page.evaluate(DIFFER_READ)

    for index, chapter in enumerate(CHAPTERS):
        row = select(index)
        reading["differ"][chapter] = row
        there = f"live {where} chapter {chapter}"
        if row["words"] is None:
            failures.append(f"{there}: the lane of published figures could not be told from the story.")
            row["words"] = ""
        if "25" in row["words"]:
            failures.append(f"{there}: the story's text carries \"25\".")
        if "25" in DATE_RE.sub("", row["lane"]):
            failures.append(f"{there}: the figures lane carries a \"25\" outside a source date.")
        row["laneDates"] = sorted(set(DATE_RE.findall(row["lane"])))
        if row["strip"] != STRIP:
            failures.append(f"{there}: the strip reads {plain(row['strip'])}.")
        if (row["value"], row["unit"]) != VISUAL[chapter]:
            failures.append(f"{there}: the figure reads {plain([row['value'], row['unit']])}.")
        if row["glyphs"][0] < row["card"][0] or row["glyphs"][1] > row["card"][1]:
            failures.append(
                f"{there}: the figure's glyphs run {row['glyphs'][0]:.0f} to {row['glyphs'][1]:.0f}, "
                f"outside its card ({row['card'][0]:.0f} to {row['card'][1]:.0f})."
            )
        if chapter == "solution":
            for key in ("eyebrow", "title", "body", "points"):
                if row[key] != SOLUTION[key]:
                    failures.append(f"{there}: {key} reads {plain(row[key])}.")

    # The shots Callum is shown. Before: the page as it loads (chapter 01).
    # After: chapter 03 selected, and chapter 01 at 1280 beside it.
    if mode == "before":
        select(0)
        shoot(page, f"platform-{label}-before.png")
    else:
        if label == "1280":
            select(0)
            shoot(page, "platform-chapter01-1280-after.png")
        select(2)
        shoot(page, f"platform-{label}-after.png")


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
