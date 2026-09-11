"""Wave 295 accessibility gate: axe-core over the two new pages.

Runs axe against /register and every /register/<role>, at 360 and 1440, on the
STATIC build (the same HTML GitHub Pages will serve), and then checks the three
things R295-3 names that axe does not: one h1 per page, a 44px minimum on every
interactive target, and a keyboard order that reaches the submit button.

⚠️ IT ALSO RUNS THE TWO STATES THAT ARE NOT IN THE HTML. A form's error
messages and its success panel are the parts of it most likely to fail a
contrast or a labelling check, and they are exactly the parts a crawl of the
prerendered markup never sees, because neither exists until somebody presses
the button. So the run submits an empty form to put the error state in the DOM,
and submits a valid one against a stubbed 200 to put the success panel there,
and audits both. The review asked for the first; the second is owed for the
same reason.

axe-core is not a dependency of this repo and must not become one: it is a
build-time auditor, not something the site ships. Point AXE at an extracted
copy (`npm pack axe-core && tar xzf ...`):

    AFTER_DIR=... AXE=.../package/axe.min.js python scripts/wave295-axe.py

Exits non-zero on any serious or critical violation.
"""

import functools
import http.server
import json
import os
import socketserver
import threading

from playwright.sync_api import sync_playwright

AFTER_DIR = os.environ["AFTER_DIR"]
AXE = os.environ["AXE"]
ROLES = [
    "investor",
    "landlord",
    "developer",
    "housing-association",
    "local-authority",
    "care-provider",
    "support-provider",
    "social-worker",
    "broker",
    "resident",
]
PAGES = ["/register/"] + [f"/register/{r}/" for r in ROLES]
# Baselines. The header, the footer and the skip link are on every page of the
# site and are not this wave's to change (R295-6), so any finding that also
# fires on these was already there. Anything that fires ONLY on a /register
# page is mine.
BASELINES = ["/contact/", "/about/"]
WIDTHS = [360, 1440]

# WCAG 2.2 AA, plus the best-practice set. "review-item" results are not
# failures and are not counted; only violations are.
AXE_OPTIONS = {
    "runOnly": {
        "type": "tag",
        "values": ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
    }
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory):
    httpd = socketserver.TCPServer(
        ("127.0.0.1", 0), functools.partial(Quiet, directory=directory)
    )
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


TARGET_JS = """
() => {
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const small = [];
  const root = document.querySelector('main') ?? document;
  for (const el of root.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;         // not rendered
    // Not a TARGET: WCAG 2.2 SC 2.5.8 sizes the things a person aims at, and
    // an element taken out of the accessibility tree and out of the tab order
    // is not one of them. This is the spam honeypot, a 1px field parked off
    // screen that a person never meets and a scraper does, and the success
    // panel, which takes tabindex -1 only so focus can land on it.
    if (el.closest('[aria-hidden="true"]')) continue;
    if (el.getAttribute('tabindex') === '-1') continue;
    // A native radio or checkbox is 16px by design; what has to be 44px is the
    // thing a finger lands on, which is its <label>. Measure that instead.
    const box = (el.type === 'radio' || el.type === 'checkbox')
      ? (el.closest('label') ?? el).getBoundingClientRect()
      : r;
    // WCAG 2.2 SC 2.5.8's "Inline" exception: a link inside a sentence is
    // sized by the line-height of the prose around it and is exempt. The
    // privacy line's "Check our ICO registration" is exactly that. A link in
    // a <p> of running text qualifies; a link that IS the whole control does
    // not, and still has to be 44px.
    const inlineInProse =
      el.tagName === 'A' &&
      el.closest('p') !== null &&
      el.closest('p').textContent.trim().length > el.textContent.trim().length;
    if (inlineInProse) continue;
    if (box.height < 44 || box.width < 44) {
      small.push({
        tag: el.tagName.toLowerCase(),
        type: el.type || '',
        text: (el.textContent || el.id || '').trim().slice(0, 40),
        w: Math.round(box.width), h: Math.round(box.height),
      });
    }
  }
  return small;
}
"""


def main():
    port = serve(AFTER_DIR)
    base = f"http://127.0.0.1:{port}"
    axe_src = open(AXE, encoding="utf-8").read()
    failures = 0

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_context().new_page()

        print("BASELINE (the shared chrome, scoped to main, on pages this wave did not touch)")
        page.set_viewport_size({"width": 1440, "height": 900})
        for path in BASELINES:
            page.goto(base + path, wait_until="networkidle")
            page.add_script_tag(content=axe_src)
            r = page.evaluate("async (opts) => await axe.run('main', opts)", AXE_OPTIONS)
            ids = sorted({v["id"] for v in r["violations"]})
            print(f"     1440px {path:<34} axe:{len(r['violations'])} {ids}")
        print()

        for width in WIDTHS:
            page.set_viewport_size({"width": width, "height": 900})
            for path in PAGES:
                page.goto(base + path, wait_until="networkidle")
                page.add_script_tag(content=axe_src)
                # Scoped to <main>: the site chrome around it is shared with
                # every other page and is out of this wave's scope.
                result = page.evaluate(
                    "async (opts) => await axe.run('main', opts)", AXE_OPTIONS
                )
                violations = result["violations"]
                serious = [v for v in violations if v["impact"] in ("serious", "critical")]

                h1s = len(page.query_selector_all("h1"))
                small = page.evaluate(TARGET_JS)

                bad = bool(serious) or h1s != 1 or bool(small)
                mark = "FAIL" if bad else "ok  "
                print(f"{mark} {width:>4}px {path:<34} axe:{len(violations):<2} h1:{h1s} small:{len(small)}")

                if serious:
                    failures += 1
                    for v in serious:
                        print(f"      {v['impact']}: {v['id']} - {v['help']}")
                        for node in v["nodes"][:3]:
                            print(f"        {node['target']}")
                if violations and not serious:
                    for v in violations:
                        print(f"      {v['impact']}: {v['id']} - {v['help']}")
                if h1s != 1:
                    failures += 1
                    print(f"      h1 count is {h1s}, must be exactly 1")
                if small:
                    failures += 1
                    print("      under 44px: " + json.dumps(small[:6]))

        # ── The error state ───────────────────────────────────────────────
        #
        # Submitting an empty form trips every required field at once, which is
        # the densest the error state ever gets. Run at 360 as well: the panel
        # is narrowest there and the messages wrap.
        for width in WIDTHS:
            page.set_viewport_size({"width": width, "height": 900})
            page.goto(base + "/register/investor/", wait_until="networkidle")
            page.click("button[type=submit]")
            page.wait_for_selector("[role=alert]", timeout=10000)
            alerts = len(page.query_selector_all("[role=alert]"))
            page.add_script_tag(content=axe_src)
            result = page.evaluate("async (opts) => await axe.run('main', opts)", AXE_OPTIONS)
            serious = [v for v in result["violations"] if v["impact"] in ("serious", "critical")]
            mark = "FAIL" if (serious or alerts == 0) else "ok  "
            print(f"{mark} {width:>4}px /register/investor INVALID SUBMIT"
                  f"      axe:{len(result['violations']):<2} alerts:{alerts}")
            if alerts == 0:
                failures += 1
                print("      no [role=alert] in the DOM: the error state never rendered")
            for v in serious:
                failures += 1
                print(f"      {v['impact']}: {v['id']} - {v['help']}")
                for node in v["nodes"][:3]:
                    print(f"        {node['target']}")

        # ── The success state ─────────────────────────────────────────────
        #
        # Wave 294's endpoint is not live, so the POST is answered 200 here.
        # The FORM is real: it is filled and submitted through the actual React
        # handler and only the network answer is stubbed.
        page.context.route(
            "**/public/waitlist",
            lambda route: route.fulfill(
                status=200, content_type="application/json", body='{"ok":true}'
            ),
        )
        for width in WIDTHS:
            page.set_viewport_size({"width": width, "height": 900})
            page.goto(base + "/register/investor/", wait_until="networkidle")
            page.fill("#name", "Dana Whitfield")
            page.fill("#email", "dana@northfieldcapital.co.uk")
            page.fill("#organisation", "Northfield Capital")
            # MIN_TIME_ON_FORM_MS: submit sooner and the form treats it as a
            # script and shows success without posting, which would still give
            # a success panel but would not prove the real path.
            page.wait_for_timeout(3200)
            page.click("button[type=submit]")
            page.wait_for_selector("[role=status]", timeout=15000)
            page.add_script_tag(content=axe_src)
            result = page.evaluate("async (opts) => await axe.run('main', opts)", AXE_OPTIONS)
            serious = [v for v in result["violations"] if v["impact"] in ("serious", "critical")]
            focused = page.evaluate(
                "() => document.activeElement?.getAttribute('tabindex') === '-1'"
            )
            mark = "FAIL" if (serious or not focused) else "ok  "
            print(f"{mark} {width:>4}px /register/investor SUCCESS STATE"
                  f"      axe:{len(result['violations']):<2} focus-moved:{focused}")
            if not focused:
                failures += 1
                print("      focus did not move to the success panel")
            for v in serious:
                failures += 1
                print(f"      {v['impact']}: {v['id']} - {v['help']}")
                for node in v["nodes"][:3]:
                    print(f"        {node['target']}")
        page.context.unroute("**/public/waitlist")

        # Keyboard order on one role page: tab from the top and confirm the
        # submit button is reachable without a mouse, and that nothing before
        # it is a trap.
        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(base + "/register/investor/", wait_until="networkidle")
        page.evaluate("() => document.body.focus()")
        reached = False
        for _ in range(220):
            page.keyboard.press("Tab")
            if page.evaluate("() => document.activeElement?.type === 'submit'"):
                reached = True
                break
        print(("ok   " if reached else "FAIL ") + "keyboard: submit button reachable by Tab alone")
        if not reached:
            failures += 1

        browser.close()

    print("\nFAILURES:" if failures else "\nNo serious or critical violations.")
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
