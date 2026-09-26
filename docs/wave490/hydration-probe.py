#!/usr/bin/env python3
"""Fix pass 490c, FIX C: does the page go back to the top when it hydrates?

Proposal 13 in docs/WAVE490_REPORT.md says a phone visitor who scrolls
before the bundle hydrates is sent back to the top. It was measured at the
head only. This probe takes the same reading on any build, so it can be run
on the base and the head alike and the two traces compared.

It borrows the item 1 probe's instrument from scripts/wave490-phone.py
unchanged: the gzipped server, the slow 4G profile with the cache disabled
before `goto`, `STRIP_WATCH` for the hydration mark, and the scroll to the
council strip on the first frame its stylesheet applies. Then, instead of
timing the strip, it samples `scrollY` every 50ms until 4s after hydration
(or 40s, whichever comes first) and prints the trace and a verdict.

Usage:
    python docs/wave490/hydration-probe.py --build <dir> [--width 390 --height 844]
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("phone", ROOT / "scripts" / "wave490-phone.py")
phone = importlib.util.module_from_spec(spec)
spec.loader.exec_module(phone)


def probe(browser, base: str, width: int, height: int, run: int) -> None:
    ctx = browser.new_context(
        viewport={"width": width, "height": height},
        is_mobile=True, has_touch=True, device_scale_factor=2,
    )
    page = ctx.new_page()
    page.add_init_script(phone.STRIP_WATCH)
    cdp = ctx.new_cdp_session(page)
    cdp.send("Network.enable")
    cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})
    cdp.send("Network.emulateNetworkConditions", phone.SLOW_4G)
    page.goto(f"{base}/", wait_until="commit", timeout=120000)
    page.wait_for_function(
        "() => { const l = document.querySelector('.logo-marquee'); "
        "return !!l && getComputedStyle(l).overflowX === 'hidden'; }",
        polling="raf", timeout=60000,
    )
    styled = page.evaluate("() => Math.round(performance.now())")
    target = page.evaluate(
        "() => { const el = document.querySelector('.logo-marquee'); "
        "return Math.round(Math.max(0, el.getBoundingClientRect().top + scrollY - innerHeight / 3)); }"
    )
    page.evaluate(f"() => scrollTo({{ top: {target}, behavior: 'instant' }})")
    landed = page.evaluate("() => Math.round(scrollY)")

    trace = []
    hydrated = 0
    while True:
        now, y, h = page.evaluate(
            "() => [Math.round(performance.now()), Math.round(scrollY), Math.round(window.__hydrated)]"
        )
        trace.append((now, y))
        if h and not hydrated:
            hydrated = h
        if (hydrated and now > hydrated + 4000) or now > 40000:
            break
        page.wait_for_timeout(50)

    first_top = next((t for t, y in trace if y < 1), None)
    changes = []
    last = None
    for t, y in trace:
        if y != last:
            changes.append(f"{t}ms y={y}")
            last = y
    final = trace[-1][1]
    jumped = final < landed / 2
    print(
        f"hydration run {run} @ {width}x{height}: styled at {styled}ms, scrolled to the strip "
        f"target={target} landed at scrollY={landed}; hydrated at {hydrated}ms; "
        f"scrollY at the end ({trace[-1][0]}ms) = {final}; first at scrollY 0: "
        f"{first_top if first_top is not None else 'never'}"
        f"{'ms' if first_top is not None else ''}"
    )
    print(f"  trace of changes: {'; '.join(changes)}")
    print(f"  VERDICT run {run}: {'JUMPED to the top' if jumped else 'held its position'}")
    ctx.close()


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("--build", required=True)
    parser.add_argument("--width", type=int, default=390)
    parser.add_argument("--height", type=int, default=844)
    parser.add_argument("--runs", type=int, default=1)
    args = parser.parse_args()
    build = Path(args.build)
    base = f"http://127.0.0.1:{phone.serve(build, compress=True)}"
    print(f"build {build}")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for run in range(1, args.runs + 1):
            probe(browser, base, args.width, args.height, run)
        browser.close()


if __name__ == "__main__":
    main()
