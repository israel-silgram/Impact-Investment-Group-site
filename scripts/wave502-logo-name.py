"""Wave 502: the logo says the group.

    python scripts/wave502-logo-name.py --build <dir> --mode before   # record, never fail
    python scripts/wave502-logo-name.py                               # the guard, on dist/client

Callum, 28 Sep 2026, question 2 of the 07:30 summary, "all defaults": the logo
link's screen-reader name is "Impact Investment Group, home", on the site and
on the platform. This is the site half.

WHAT THIS READS, on every route wave 490 sweeps, at 1280 and at 390:

  the bar      the logo link in the header: its accessible name as Chromium's
               accessibility tree computes it (CDP, not the markup), and the
               text of the lockup's own screen-reader span
  the panel    at 390, the phone menu opened: the lockup's screen-reader span
  the footer   the lockup's screen-reader span
  the tree     every node in the page's full accessibility tree whose name
               carries "Impact Investment" and "home"

WHAT IT ASSERTS, in `--mode after` (the default):

  1. Every link wrapping the lockup is named exactly NAME.
  2. Every lockup's screen-reader span reads exactly NAME, so a mount that is
     not a link says the same words as the one that is.
  3. No node in the tree names the old brand beside "home", and every node
     that names the group beside "home" says NAME exactly.
  4. Every route with a header has its bar link; at 390 the panel has its
     lockup; every route with a footer has its lockup.
  5. The pixels do not move: the header at 1280 and 390 and the open panel at
     390 are compared with the before run's shots, and every pixel is equal.
     The accessible name is the only thing this wave changes.
  6. `src` holds NAME and does not hold the old name.

`--mode before` takes the same readings and the same shots and exits 0: run on
the base build it is the red proof, because every assertion above would fail
on the old name, and it prints each one.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
SHOTS = ROOT / "docs" / "screenshots" / "wave502"
DATA = ROOT / "docs" / "wave502"

NAME = "Impact Investment Group, home"
# The two names the base build carried: the bar link's aria-label and the
# lockup's screen-reader span. Written with an escape so this file adds no
# em dash to the tree.
OLD = ["Impact Investment Platform — home", "Impact Investment Group — home"]

PROFILES = [("1280", 1280, 900, False), ("390", 390, 844, True)]


def load_490():
    """Wave 490's routes, server and settle, so the two gates read the same pages."""
    spec = importlib.util.spec_from_file_location("wave490", ROOT / "scripts" / "wave490-phone.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


W490 = load_490()

TAG = """
() => {
  const out = [];
  document.querySelectorAll('img[src*="/images/brand/logo"]').forEach((img, i) => {
    const where = img.closest('#site-drawer') ? 'panel'
      : img.closest('header') ? 'bar'
      : img.closest('footer') ? 'footer' : 'other';
    const mount = img.parentElement;
    const link = img.closest('a');
    mount.setAttribute('data-w502', `${where}-${i}`);
    if (link) link.setAttribute('data-w502-link', `${where}-${i}`);
    const sr = mount.querySelector('.sr-only');
    out.push({ where, id: `${where}-${i}`, link: !!link,
               sr: sr ? sr.textContent : null,
               aria: link ? link.getAttribute('aria-label') : null });
  });
  return out;
}
"""


# Every name this gate prints goes through ascii(), so the old name's em dash
# is written as — and no log of this wave adds the character.


def ax_name(cdp, selector: str) -> str | None:
    doc = cdp.send("DOM.getDocument", {"depth": 0})
    node = cdp.send("DOM.querySelector", {"nodeId": doc["root"]["nodeId"], "selector": selector})
    if not node.get("nodeId"):
        return None
    tree = cdp.send("Accessibility.getPartialAXTree", {"nodeId": node["nodeId"], "fetchRelatives": False})
    for ax in tree["nodes"]:
        if not ax.get("ignored"):
            return (ax.get("name") or {}).get("value")
    return None


def tree_names(cdp) -> list[str]:
    names = []
    for ax in cdp.send("Accessibility.getFullAXTree")["nodes"]:
        if ax.get("ignored"):
            continue
        value = (ax.get("name") or {}).get("value") or ""
        if "Impact Investment" in value and "home" in value:
            names.append(value)
    return names


def still(page, selector: str):
    page.wait_for_function(
        """(sel) => {
          const el = document.querySelector(sel);
          return !!el && el.getAnimations({ subtree: true })
            .every((a) => a.playState !== 'running');
        }""",
        arg=selector,
        timeout=10000,
    )


def read_route(page, cdp, where: str, failures: list[str]) -> dict:
    mounts = page.evaluate(TAG)
    reading = {"mounts": [], "tree": tree_names(cdp)}
    for m in mounts:
        entry = {"where": m["where"], "sr": m["sr"], "aria": m["aria"], "link": m["link"]}
        if m["link"]:
            entry["name"] = ax_name(cdp, f'[data-w502-link="{m["id"]}"]')
            if entry["name"] != NAME:
                failures.append(f"{where} {m['where']}: the logo link is named {ascii(entry['name'])}, not {ascii(NAME)}.")
        if m["sr"] != NAME:
            failures.append(f"{where} {m['where']}: the lockup's screen-reader text reads {ascii(m['sr'])}, not {ascii(NAME)}.")
        reading["mounts"].append(entry)
    for value in reading["tree"]:
        if value != NAME:
            failures.append(f"{where}: the accessibility tree carries {ascii(value)}.")
    return reading


def shoot_header(page, path: Path, width: int):
    page.evaluate("() => scrollTo({ top: 0, behavior: 'instant' })")
    page.mouse.move(width - 1, 899 if width > 1000 else 843)
    page.wait_for_timeout(250)
    still(page, "header")
    h = page.evaluate("() => document.querySelector('header').getBoundingClientRect().height")
    path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(path), clip={"x": 0, "y": 0, "width": width, "height": h})


def same(before: Path, after: Path) -> int | None:
    """Differing pixels, or None when the before shot does not exist."""
    if not before.exists():
        return None
    a = np.asarray(Image.open(before).convert("RGBA")).astype(np.int16)
    b = np.asarray(Image.open(after).convert("RGBA")).astype(np.int16)
    if a.shape != b.shape:
        return int(max(a.shape[0] * a.shape[1], b.shape[0] * b.shape[1]))
    return int((np.abs(a - b).max(axis=2) > 0).sum())


def source_check(failures: list[str]) -> dict:
    found = {"name": [], "old": []}
    for path in (ROOT / "src").rglob("*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx", ".css", ".js", ".jsx"}:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        rel = path.relative_to(ROOT).as_posix()
        if NAME in text:
            found["name"].append(rel)
        if any(old in text for old in OLD):
            found["old"].append(rel)
    if not found["name"]:
        failures.append(f"src: nothing in src says {ascii(NAME)}.")
    for rel in found["old"]:
        failures.append(f"src: {rel} still carries an old logo name.")
    return found


def run(build: Path, mode: str) -> int:
    port = W490.serve(build)
    base = f"http://127.0.0.1:{port}"
    failures: list[str] = []
    record: dict = {"mode": mode, "build": str(build), "routes": {}, "pixels": {}}
    shots = SHOTS / mode
    counts = {"links": 0, "mounts": 0, "tree": 0, "shots": 0}

    record["source"] = source_check(failures)

    with sync_playwright() as p:
        for path, slug in W490.PAGES:
            browser = p.chromium.launch()
            for label, width, height, touch in PROFILES:
                where = f"{slug} @ {label}"
                ctx = browser.new_context(
                    viewport={"width": width, "height": height},
                    device_scale_factor=1, is_mobile=touch, has_touch=touch,
                )
                page = ctx.new_page()
                cdp = ctx.new_cdp_session(page)
                page.goto(base + path, wait_until="networkidle")
                W490.settle(page)
                W490.to_top(page)
                has_header = page.locator("header").count() > 0
                has_footer = page.locator("footer").count() > 0
                reading = read_route(page, cdp, where, failures)
                kinds = [m["where"] for m in reading["mounts"]]
                if has_header and "bar" not in kinds:
                    failures.append(f"{where}: the header has no logo.")
                if has_footer and "footer" not in kinds:
                    failures.append(f"{where}: the footer has no logo.")
                if has_header:
                    shoot_header(page, shots / f"{slug}-{label}-header.png", width)
                    counts["shots"] += 1

                trigger = page.locator('header button[aria-controls="site-drawer"]')
                if trigger.count() and trigger.first.is_visible():
                    trigger.first.click()
                    page.wait_for_selector("#site-drawer", state="visible")
                    still(page, "#site-drawer")
                    page.wait_for_timeout(150)
                    panel = read_route(page, cdp, f"{where} menu open", failures)
                    panel["mounts"] = [m for m in panel["mounts"] if m["where"] == "panel"]
                    if not panel["mounts"]:
                        failures.append(f"{where}: the open menu has no logo.")
                    reading["panel"] = panel
                    page.locator("#site-drawer").screenshot(path=str(shots / f"{slug}-{label}-panel.png"))
                    counts["shots"] += 1
                elif label == "390" and has_header:
                    failures.append(f"{where}: no menu button to open.")

                for m in reading["mounts"] + reading.get("panel", {}).get("mounts", []):
                    counts["mounts"] += 1
                    counts["links"] += 1 if m["link"] else 0
                counts["tree"] += len(reading["tree"])
                record["routes"][where] = reading
                ctx.close()
            browser.close()

    if mode == "after":
        for shot in sorted(shots.glob("*.png")):
            moved = same(SHOTS / "before" / shot.name, shot)
            record["pixels"][shot.name] = moved
            if moved is None:
                failures.append(f"pixels: no before shot for {shot.name}.")
            elif moved:
                failures.append(f"pixels: {shot.name} differs from its before shot in {moved} px.")

    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / f"names-{mode}.json").write_text(json.dumps(record, indent=1, ensure_ascii=True) + "\n", encoding="utf-8")

    print(f"wave502   mode={mode}  build={build}")
    for where, reading in record["routes"].items():
        mounts = reading["mounts"] + reading.get("panel", {}).get("mounts", [])
        said = "; ".join(
            f"{m['where']}{' link' if m['link'] else ''}: {ascii(m.get('name') if m['link'] else m['sr'])}"
            for m in mounts
        )
        print(f"  {where:<34} {said or 'no logo'}")
    print(f"src: NAME in {record['source']['name']}; old name in {record['source']['old']}")
    if record["pixels"]:
        moved = sum(1 for v in record["pixels"].values() if v)
        print(f"pixels: {len(record['pixels'])} shots paired with before, {moved} differ")
    print(
        f"wave502   {counts['mounts']} lockup readings, {counts['links']} of them links, "
        f"{counts['tree']} tree names naming the brand beside home, {counts['shots']} shots"
    )
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
