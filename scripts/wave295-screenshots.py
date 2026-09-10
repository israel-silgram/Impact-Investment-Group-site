"""Wave 295 screenshots: the hero before and after, the picker, a role page,
and that role page's success state, at 360, 768 and 1440.

Runs entirely in one foreground process: it starts two threaded static servers
inside itself (one on the pre-wave build, one on the post-wave build), drives
Playwright against them, and exits. Nothing is left running.

    BEFORE_DIR=/tmp/w295/before AFTER_DIR=/tmp/w295/after \
        python scripts/wave295-screenshots.py

The success state is reached by intercepting the POST and answering 200. The
platform's /public/waitlist endpoint is wave 294's and is not live yet, so
without the interception the form would correctly show its failure line and
there would be no success state to photograph. The FORM is real: the fields are
filled and submitted through the actual React handler, and only the network
answer is stubbed.
"""

import functools
import http.server
import os
import socketserver
import threading
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

BEFORE_DIR = os.environ.get("BEFORE_DIR", "/tmp/w295/before")
AFTER_DIR = os.environ.get("AFTER_DIR", "/tmp/w295/after")
OUT = Path("docs/screenshots/wave295")
WIDTHS = [360, 768, 1440]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory: str) -> int:
    handler = functools.partial(Quiet, directory=directory)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def shoot(page, url: str, name: str, width: int, full=True, before_shot=None):
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(url, wait_until="networkidle")
    # The site reveals sections on scroll; scroll the whole page once so no
    # section is photographed mid-fade, then return to the top.
    page.evaluate(
        "async () => { const step = innerHeight; "
        "for (let y = 0; y < document.body.scrollHeight; y += step) "
        "{ scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } scrollTo(0, 0); }"
    )
    page.wait_for_timeout(500)
    if before_shot:
        before_shot(page)
    OUT.mkdir(parents=True, exist_ok=True)
    png = OUT / f"{name}-{width}.png"
    page.screenshot(path=str(png), full_page=full)
    # Committed as WebP. These are full-page shots of a long questionnaire and
    # the fifteen of them are 13 MB as PNG, which is not a thing to push into a
    # repo Lovable syncs. WebP at 82 is 3.2 MB and loses nothing a reviewer of
    # a layout would see.
    out = png.with_suffix(".webp")
    Image.open(png).convert("RGB").save(out, "WEBP", quality=82, method=6)
    png.unlink()
    print(f"  {out}")


def reveal_resident_consent(page):
    """Choose a health answer so the special-category consent appears."""
    page.check("input[type=checkbox][value='Adapted for a disability']")
    page.wait_for_selector("#consentHealth", timeout=5000)
    page.evaluate("scrollTo(0, 0)")
    page.wait_for_timeout(400)


def show_errors(page):
    """Submit an empty form so every validation message is on screen."""
    page.click("button[type=submit]")
    page.wait_for_selector("[role=alert]", timeout=10000)
    page.evaluate("scrollTo(0, 0)")
    page.wait_for_timeout(400)


def fill_and_submit(page):
    """Fill the investor form the way a person would, then submit it."""
    page.fill("#name", "Dana Whitfield")
    page.fill("#email", "dana@northfieldcapital.co.uk")
    page.fill("#organisation", "Northfield Capital")
    page.check("input[type=radio][value='£1m to £4.9m']")
    page.check("input[type=checkbox][value='Portfolios and blocks']")
    page.check("#consentEmail")
    page.click("button[type=submit]")
    page.wait_for_selector("text=You are on the list", timeout=10000)
    # Back to the top before the shutter: checking the boxes scrolled the page,
    # and a full-page screenshot paints a sticky header wherever it currently
    # sits, which would put the site header through the middle of the panel.
    page.evaluate("scrollTo(0, 0)")
    page.wait_for_timeout(400)


def main():
    before_port = serve(BEFORE_DIR)
    after_port = serve(AFTER_DIR)
    before = f"http://127.0.0.1:{before_port}"
    after = f"http://127.0.0.1:{after_port}"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(device_scale_factor=1)
        # Answer the wait-list POST 200 so the success state renders. Nothing
        # else on any page is intercepted.
        ctx.route(
            "**/public/waitlist",
            lambda route: route.fulfill(
                status=200, content_type="application/json", body='{"ok":true}'
            ),
        )
        page = ctx.new_page()

        for width in WIDTHS:
            print(f"[{width}px]")
            shoot(page, before + "/", "hero-before", width)
            shoot(page, after + "/", "hero-after", width)
            shoot(page, after + "/register", "picker", width)
            shoot(page, after + "/register/investor", "role-investor", width)
            shoot(
                page,
                after + "/register/investor",
                "role-investor-success",
                width,
                before_shot=fill_and_submit,
            )
            # The two states the review turned on, and neither is in the
            # prerendered HTML: they exist only once somebody touches the form.
            shoot(
                page,
                after + "/register/investor",
                "role-investor-errors",
                width,
                before_shot=show_errors,
            )
            shoot(
                page,
                after + "/register/resident",
                "role-resident-consent",
                width,
                before_shot=reveal_resident_consent,
            )

        browser.close()
    print("done")


if __name__ == "__main__":
    main()
