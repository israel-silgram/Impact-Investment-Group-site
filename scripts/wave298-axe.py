"""Wave 298 accessibility gate: axe-core over the pages this wave changed.

Runs axe against the STATIC build (the same HTML GitHub Pages serves) at 360
and 1440, on the pages the brief's gate names (/legal and /contact) plus the
two other surfaces this wave touched (/ for the footer, /partner-with-resident
for the crisis signpost), and then checks the three things R298-1 names that
axe cannot: exactly one h1 per page, every legal link reachable by keyboard
alone, and every legal link at least 24px on its smallest side.

BOTH BUILDS ARE AUDITED. The footer changed on every route, so there is no
unchanged page inside the after build to use as a control. `BEFORE_DIR` is a
build of the base commit, and a violation that fires in both is pre-existing
chrome that this wave neither introduced nor was asked to fix. Only findings
that appear in `after` and not in `before` belong to this wave.

axe-core is not a dependency of this repo and must not become one: it is a
build-time auditor, not something the site ships. Point AXE at an extracted
copy (`npm pack axe-core && tar xzf axe-core-*.tgz`):

    BEFORE_DIR=/tmp/w298/before AFTER_DIR=/tmp/w298/after \
        AXE=/tmp/w298/axe/package/axe.min.js python scripts/wave298-axe.py

Exits non-zero if this wave adds any violation, or if one of the three manual
checks fails.
"""

import functools
import http.server
import json
import os
import socketserver
import threading

from playwright.sync_api import sync_playwright

BEFORE_DIR = os.environ["BEFORE_DIR"]
AFTER_DIR = os.environ["AFTER_DIR"]
AXE = os.environ["AXE"]

# The trailing slash matters: the prerenderer writes `autoSubfolderIndex`
# directories, so `/legal` without it is a 404 from the static server.
PAGES = ["/", "/contact/", "/legal/", "/partner-with-resident/"]
WIDTHS = [360, 1440]

# WCAG 2.2 AA plus the best-practice set. Incomplete ("review-item") results
# are not failures and are not counted; only violations are.
AXE_OPTIONS = {
    "runOnly": {
        "type": "tag",
        "values": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
    }
}

LEGAL_LINK_LABELS = ["Terms of Service", "Privacy Policy", "Disclaimer", "Legal"]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory: str) -> int:
    handler = functools.partial(Quiet, directory=directory)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def force_revealed(page):
    """Make the reveal animation finished before axe looks.

    Sections start at opacity 0 and fade in on an intersection observer. axe
    skips a transparent element rather than failing it, so without this the
    same page audits differently depending on how much of it happened to be in
    view, and a real contrast finding appears and disappears between runs.
    Forcing every `.reveal` opaque audits ALL the content, in both builds.
    """
    page.add_style_tag(
        content=".reveal, .reveal * { opacity: 1 !important; transform: none !important; "
        "animation: none !important; transition: none !important; }"
    )
    page.wait_for_timeout(120)


def audit(page, base: str, path: str, width: int, axe_source: str):
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(f"{base}{path}", wait_until="networkidle")
    force_revealed(page)
    page.evaluate(axe_source)
    result = page.evaluate("opts => axe.run(document, opts)", AXE_OPTIONS)
    # Keyed on the rule and the offending element's OWN MARKUP, not on axe's
    # CSS selector. The selector is derived from the surrounding DOM, so adding
    # one sibling renames it and the same untouched finding reads as "fixed"
    # and "new" at once. The element's html does not move unless the element
    # does. Truncated because axe includes a slice of the children.
    return {
        f"{v['id']}::{n['html'][:180]}"
        for v in result["violations"]
        if v["impact"] in ("serious", "critical", "moderate", "minor")
        for n in v["nodes"]
    }, {v["id"]: v["impact"] for v in result["violations"]}


def manual_checks(page, base: str, path: str, width: int, failures: list):
    """The three things axe does not answer for the legal links."""
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(f"{base}{path}", wait_until="networkidle")

    h1s = page.locator("h1").count()
    if h1s != 1:
        failures.append(f"{path} @{width}: {h1s} h1 elements, expected exactly 1")

    nav = page.locator("footer nav[aria-label='Legal']")
    if nav.count() != 1:
        failures.append(f"{path} @{width}: footer has {nav.count()} Legal navs, expected 1")
        return

    for label in LEGAL_LINK_LABELS:
        link = nav.get_by_role("link", name=label, exact=False).first
        if link.count() == 0:
            failures.append(f"{path} @{width}: no '{label}' link in the footer Legal nav")
            continue
        box = link.bounding_box()
        if box is None:
            failures.append(f"{path} @{width}: '{label}' link has no box (not rendered)")
            continue
        # WCAG 2.2 target size (minimum) is 24x24 CSS px.
        if min(box["width"], box["height"]) < 24:
            failures.append(
                f"{path} @{width}: '{label}' target is "
                f"{box['width']:.0f}x{box['height']:.0f}, under 24px"
            )

    # Keyboard: tab from the top of the document until every legal link has
    # held focus, or until we run out of patience. A link nothing can focus is
    # a link a keyboard user does not have.
    page.evaluate("() => document.body.focus()")
    page.keyboard.press("Home")
    seen = set()
    for _ in range(400):
        page.keyboard.press("Tab")
        text = page.evaluate(
            "() => { const a = document.activeElement; "
            "return a && a.closest(\"nav[aria-label='Legal']\") ? a.innerText.trim() : ''; }"
        )
        for label in LEGAL_LINK_LABELS:
            if text.startswith(label):
                seen.add(label)
        if len(seen) == len(LEGAL_LINK_LABELS):
            break
    missing = [x for x in LEGAL_LINK_LABELS if x not in seen]
    if missing:
        failures.append(f"{path} @{width}: not reachable by Tab alone: {', '.join(missing)}")


def main():
    axe_source = open(AXE, encoding="utf-8").read()
    before_port = serve(BEFORE_DIR)
    after_port = serve(AFTER_DIR)
    before = f"http://127.0.0.1:{before_port}"
    after = f"http://127.0.0.1:{after_port}"

    added = []
    impacts = {}
    failures = []
    # /legal did not exist before this wave, so it has no control of its own.
    # Its control is the CHROME: every finding the header and footer already
    # produced, at the base commit, on the pages that did exist. A footer
    # finding is not this page's doing just because this page is new.
    chrome_control: set = set()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        for path in PAGES:
            for width in WIDTHS:
                after_set, after_impacts = audit(page, after, path, width, axe_source)
                impacts.update(after_impacts)
                if path == "/legal/":
                    before_set = set(chrome_control)
                else:
                    before_set, _ = audit(page, before, path, width, axe_source)
                    chrome_control |= before_set
                new = sorted(after_set - before_set)
                fixed = sorted(before_set - after_set)
                print(
                    f"{path:28} @{width:<5} after={len(after_set):3} "
                    f"before={len(before_set):3} new={len(new):3} fixed={len(fixed):3}"
                )
                for item in new:
                    rule = item.split("::")[0]
                    print(f"    NEW  [{impacts.get(rule, '?')}] {item}")
                    added.append((path, width, item, impacts.get(rule, "?")))
                manual_checks(page, after, path, width, failures)
        browser.close()

    print()
    for f in failures:
        print("MANUAL FAIL:", f)
    print(json.dumps({"new_violation_nodes": len(added), "manual_failures": len(failures)}))
    raise SystemExit(1 if (added or failures) else 0)


if __name__ == "__main__":
    main()
