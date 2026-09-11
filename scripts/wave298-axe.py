"""Wave 298 gate: the footer census, the render census, and axe, all over
EVERY emitted page.

Three passes.

THE FOOTER CENSUS proves R298-1 the only way it can honestly be proved: by
enumerating every `index.html` the static build emits and asserting, in each
one, all four legal labels and exactly one `<nav aria-label="Legal and
policies">`. Auditing four representative pages would have said nothing about
the other fourteen, and "every footer carries the legal links" is a claim about
every page or it is not a claim at all. The census is a file check, needs no
browser, and runs first so a missing link fails fast.

THE RENDER CENSUS then loads every one of those pages in a real browser and
asserts each one actually renders: no uncaught page error, body text present, an
h1, and the legal nav reachable. It exists because a file check cannot see a
BROKEN PAGE. On 10 September 2026 a build emitted a /contact whose inline
TanStack router manifest was spliced mid-token ("preloads:$Relf.$_TSR,delete
self..."), which threw "Unexpected identifier 'self'", left the body empty, and
still passed every file-level assertion because the markup above the script was
perfectly intact. It did not reproduce on rebuild, so it is a build flake rather
than a source defect, which is exactly why it needs a standing check: a flake
that ships is a blank page on the live site.

THE AXE PASS then runs against the STATIC build (the same HTML GitHub Pages
serves) at 360 and 1440, on EVERY page the build emits (`PAGES` used to be a
fixed list of four representative routes; the release check of 11 Sep 2026
found a contrast regression that had landed on all ten partner-with-* pages
and was never once audited, because only one of the ten was ever on that
list, so the list is gone and every emitted page is read from the build
instead), and checks the three things R298-1 needs that axe cannot answer:
exactly one h1 per page, every legal link reachable by keyboard alone, and
every legal link at least 24px on its smallest side.

BOTH BUILDS ARE AUDITED. The footer changed on every route, so there is no
unchanged page inside the after build to use as a control. `BEFORE_DIR` is a
build of the base commit, and a violation that fires in both is pre-existing
chrome that this wave neither introduced nor was asked to fix. Only findings
that appear in `after` and not in `before` belong to this wave. A page with no
counterpart in `BEFORE_DIR` (every /register/* page, and /legal) borrows a
`chrome_control` built from every page that does have one, so a finding common
to the shared header or footer never reads as new just because the page
carrying it is new.

axe-core is not a dependency of this repo and must not become one: it is a
build-time auditor, not something the site ships. Point AXE at an extracted
copy (`npm pack axe-core && tar xzf axe-core-*.tgz`):

    BEFORE_DIR=/tmp/w298/before AFTER_DIR=/tmp/w298/after \
        AXE=/tmp/w298/axe/package/axe.min.js python scripts/wave298-axe.py

Exits non-zero if the census fails on any page, if this wave adds any
violation, or if one of the three manual checks fails.
"""

import functools
import glob
import io
import http.server
import json
import os
import re
import socketserver
import threading

from playwright.sync_api import sync_playwright

BEFORE_DIR = os.environ["BEFORE_DIR"]
AFTER_DIR = os.environ["AFTER_DIR"]
AXE = os.environ["AXE"]

# ⚠️ RELEASE CHECK, 11 SEP 2026: EVERY EMITTED PAGE, NOT FOUR OF THEM. This
# script used to audit a fixed list of four representative pages. That is
# exactly how the orange-500 retint's contrast failure survived two merges
# unnoticed: it landed on all ten partner-with-* pages, and only one of them
# was ever on this list. PAGES is now computed from the build itself in
# main(), via `routes_in(AFTER_DIR)`, so a page this script has never heard of
# is audited the first time it exists rather than the first time somebody
# remembers to add it here.
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

# The nav's accessible name. Deliberately NOT "Legal": one of the links inside
# it is called Legal, and a region sharing that name announces as "Legal,
# navigation" immediately before "Legal, link".
LEGAL_NAV_LABEL = "Legal and policies"

# ⚠️ RETIRED 10 SEP 2026 (CALLUM). This mailbox does not exist and never did.
# It survived in src/content/register.ts until the release check of 11 Sep
# 2026 caught four more copies of it, in a file the earlier hello@ sweep never
# read. The census below is why that cannot happen silently again: it fails
# any page whose HTML carries this string, not just the pages this script
# already knew to look at.
RETIRED_MAILBOX = "hello@impactig.co.uk"


def footer_census(after_dir: str) -> list:
    """Assert the four legal links on every page the static build emits, and
    that none of them carries the retired mailbox.

    Returns the list of failures, and prints the page count and the routes so
    the wave report can quote a measured number rather than an assumed one.
    """
    failures = []
    paths = sorted(glob.glob(os.path.join(after_dir, "**", "index.html"), recursive=True))
    print(f"footer census: {len(paths)} index.html files emitted by the static build")

    nav_open = re.compile(r'<nav[^>]*aria-label="([^"]*)"')
    for p in paths:
        route = os.path.dirname(os.path.relpath(p, after_dir)).replace(os.sep, "/")
        route = "/" + route if route not in (".", "") else "/"
        html = io.open(p, encoding="utf-8").read()

        navs = [n for n in nav_open.findall(html) if n == LEGAL_NAV_LABEL]
        if len(navs) != 1:
            failures.append(f"{route}: {len(navs)} nav[aria-label='{LEGAL_NAV_LABEL}'], expected 1")

        # ">Legal<" rather than "Legal", because the bare word also appears in
        # "Legal and policies" on the nav itself, so a page that had lost the
        # link entirely would still pass a substring test.
        missing = [
            label
            for label in LEGAL_LINK_LABELS
            if (">Legal<" if label == "Legal" else label) not in html
        ]
        for label in missing:
            failures.append(f"{route}: no '{label}' in the footer")

        retired_count = html.count(RETIRED_MAILBOX)
        if retired_count:
            failures.append(f"{route}: carries the retired mailbox {retired_count} time(s)")

        print(
            f"  {route:34} navs={len(navs)}  labels={4 - len(missing)}/4  "
            f"retired_mailbox={retired_count}"
        )
    return failures


def routes_in(build_dir: str) -> list:
    """Every route the build emitted, as a servable path with a trailing slash."""
    out = []
    for p in sorted(glob.glob(os.path.join(build_dir, "**", "index.html"), recursive=True)):
        r = os.path.dirname(os.path.relpath(p, build_dir)).replace(os.sep, "/")
        out.append("/" + r + "/" if r not in (".", "") else "/")
    return out


def render_one(page, base: str, route: str) -> dict:
    """Load one page and record what it did."""
    errors = []
    handler = lambda exc: errors.append(str(exc)[:200])
    page.on("pageerror", handler)
    try:
        page.goto(f"{base}{route}", wait_until="networkidle")
        page.wait_for_timeout(220)
        return {
            "errors": {_error_key(x) for x in errors},
            "text": page.evaluate("() => document.body.innerText.length"),
            "h1": page.locator("h1").count(),
            "navs": page.locator(f"footer nav[aria-label='{LEGAL_NAV_LABEL}']").count(),
        }
    finally:
        page.remove_listener("pageerror", handler)


def _error_key(message: str) -> str:
    """React minifies its errors and appends a URL with the args in it.

    Two hydration mismatches on different text produce different URLs, so the
    raw string is useless for comparing builds. The error NUMBER is the stable
    identity.
    """
    m = re.search(r"Minified React error #(\d+)", message)
    return f"react#{m.group(1)}" if m else message[:120]


def render_census(page, after_base: str, before_base: str, after_dir: str, before_dir: str) -> list:
    """Load every emitted page and assert it actually renders.

    Structural assertions (body text, one h1, one legal nav) are ABSOLUTE: a
    blank page is a failure whatever the base commit did. Uncaught page errors
    are measured AGAINST THE BEFORE BUILD, because /contact throws a React #418
    hydration mismatch at `8f15cdb` and has done all along; failing on it would
    make the gate red for something this wave neither caused nor was asked to
    fix. A page with no counterpart in the before build (today: /legal) has no
    control and any error on it counts as new.
    """
    failures = []
    before_routes = set(routes_in(before_dir))
    routes = routes_in(after_dir)
    print(f"render census: {len(routes)} pages")
    page.set_viewport_size({"width": 1440, "height": 900})

    for route in routes:
        a = render_one(page, after_base, route)
        control = render_one(page, before_base, route)["errors"] if route in before_routes else set()
        new_errors = sorted(a["errors"] - control)
        old_errors = sorted(a["errors"] & control)

        for x in new_errors:
            failures.append(f"{route}: NEW uncaught page error: {x}")
        if a["text"] < 200:
            failures.append(f"{route}: rendered {a['text']} chars of body text, expected content")
        if a["h1"] != 1:
            failures.append(f"{route}: {a['h1']} h1 elements after hydration, expected 1")
        if a["navs"] != 1:
            failures.append(f"{route}: {a['navs']} legal navs after hydration, expected 1")

        ok = not new_errors and a["text"] >= 200 and a["h1"] == 1 and a["navs"] == 1
        note = f"  pre-existing: {', '.join(old_errors)}" if old_errors else ""
        print(
            f"  {'ok ' if ok else 'FAIL'} {route:34} text={a['text']:>6} "
            f"h1={a['h1']} nav={a['navs']} new_errors={len(new_errors)}{note}"
        )
    return failures


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

    nav = page.locator(f"footer nav[aria-label='{LEGAL_NAV_LABEL}']")
    if nav.count() != 1:
        failures.append(
            f"{path} @{width}: footer has {nav.count()} '{LEGAL_NAV_LABEL}' navs, expected 1"
        )
        return

    for label in LEGAL_LINK_LABELS:
        link = nav.get_by_role("link", name=label, exact=False).first
        if link.count() == 0:
            failures.append(f"{path} @{width}: no '{label}' link in the footer legal nav")
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
            "label => { const a = document.activeElement; "
            "return a && a.closest(`nav[aria-label='${label}']`) ? a.innerText.trim() : ''; }",
            LEGAL_NAV_LABEL,
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

    pages = routes_in(AFTER_DIR)
    before_routes = set(routes_in(BEFORE_DIR))
    shared = [p for p in pages if p in before_routes]
    new_only = [p for p in pages if p not in before_routes]
    print(f"axe pass: {len(pages)} pages total, {len(shared)} with their own before "
          f"build, {len(new_only)} new since {BEFORE_DIR} (their control is the "
          f"chrome: every finding shared header/footer/section markup already "
          f"produced on a page that did exist)")

    added = []
    impacts = {}
    failures = footer_census(AFTER_DIR)
    print()
    per_page_summary = []
    # Pages with no before-build counterpart (every /register/* page, and
    # /legal) borrow this as their control instead of a real before/after
    # diff. Built up from every SHARED page's real before-result, across both
    # widths, so a finding common to the site's chrome never reads as "new"
    # just because the page carrying it is new.
    chrome_control: set = set()

    # Shared pages first, new-only pages second: chrome_control has to be
    # complete (built from every shared page's real before-result) before a
    # single new-only page borrows it, and page paths do not sort that way on
    # their own (/legal/ sorts before /partner-with-*/, alphabetically, but
    # needs the chrome those pages establish).
    ordered = shared + new_only

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        failures += render_census(page, after, before, AFTER_DIR, BEFORE_DIR)
        print()

        for path in ordered:
            for width in WIDTHS:
                after_set, after_impacts = audit(page, after, path, width, axe_source)
                impacts.update(after_impacts)
                if path in before_routes:
                    before_set, _ = audit(page, before, path, width, axe_source)
                    chrome_control |= before_set
                else:
                    before_set = set(chrome_control)
                new = sorted(after_set - before_set)
                fixed = sorted(before_set - after_set)
                print(
                    f"{path:34} @{width:<5} after={len(after_set):3} "
                    f"before={len(before_set):3} new={len(new):3} fixed={len(fixed):3}"
                )
                per_page_summary.append((path, width, len(after_set), len(new)))
                for item in new:
                    rule = item.split("::")[0]
                    print(f"    NEW  [{impacts.get(rule, '?')}] {item}")
                    added.append((path, width, item, impacts.get(rule, "?")))
                manual_checks(page, after, path, width, failures)
        browser.close()

    print()
    print("Per-page result table (axe: total after / new since control):")
    for path, width, after_count, new_count in per_page_summary:
        flag = "PASS" if new_count == 0 else "FAIL"
        print(f"  {flag}  {path:34} @{width:<5} after={after_count:3} new={new_count:3}")

    print()
    for f in failures:
        print("FAIL:", f)
    print(json.dumps({"new_violation_nodes": len(added), "failures": len(failures)}))
    raise SystemExit(1 if (added or failures) else 0)


if __name__ == "__main__":
    main()
