"""Wave 298 screenshots: the footer before and after, the Legal page, the
notice at collection and the resident crisis signpost, at 360 and 1440.

Runs entirely in one foreground process: it starts two threaded static servers
inside itself (one on a build of the base commit, one on this branch's build),
drives Playwright against them, and exits. Nothing is left running.

    BEFORE_DIR=/tmp/w298/before AFTER_DIR=/tmp/w298/after \
        python scripts/wave298-screenshots.py

The footer shots are cropped to the footer element rather than taken full-page,
because the point of comparison is four links appearing in a block that is
otherwise unchanged, and a full-page shot of a long marketing page makes that
invisible.
"""

import functools
import http.server
import os
import socketserver
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

BEFORE_DIR = os.environ.get("BEFORE_DIR", "/tmp/w298/before")
AFTER_DIR = os.environ.get("AFTER_DIR", "/tmp/w298/after")
OUT = Path("docs/screenshots/wave298")
WIDTHS = [360, 1440]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory: str) -> int:
    handler = functools.partial(Quiet, directory=directory)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def settle(page):
    """Scroll the page once so no section is photographed mid-fade."""
    page.evaluate(
        "async () => { const step = innerHeight; "
        "for (let y = 0; y < document.body.scrollHeight; y += step) "
        "{ scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } }"
    )
    page.wait_for_timeout(400)


def shoot(page, base: str, path: str, selector: str | None, name: str, width: int):
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(f"{base}{path}", wait_until="networkidle")
    settle(page)
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / f"{name}-{width}.webp"
    if selector:
        page.locator(selector).first.scroll_into_view_if_needed()
        page.wait_for_timeout(250)
        page.locator(selector).first.screenshot(path=str(target), type="jpeg", quality=88)
        target.rename(target.with_suffix(".jpg"))
    else:
        page.screenshot(path=str(target.with_suffix(".jpg")), full_page=True, type="jpeg", quality=82)
    print("  wrote", target.with_suffix(".jpg"))


def main():
    before = f"http://127.0.0.1:{serve(BEFORE_DIR)}"
    after = f"http://127.0.0.1:{serve(AFTER_DIR)}"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        for width in WIDTHS:
            # The footer, before and after, on the same page at the same width.
            shoot(page, before, "/contact/", "footer", "footer-before", width)
            shoot(page, after, "/contact/", "footer", "footer-after", width)
            # The Legal block itself.
            shoot(page, after, "/legal/", None, "legal-page", width)
            shoot(page, after, "/legal/", "#company-heading ~ dl, dl", "legal-company-block", width)
            # The notice at collection, beside the submit control.
            shoot(page, after, "/contact/", "form", "contact-form", width)
            # The crisis signpost, above the fold on the resident page. It is
            # an aria-label'd region rather than a heading-labelled one (it
            # sits above the page's h1), so it is found by its label text.
            shoot(
                page,
                after,
                "/partner-with-resident/",
                "main section[aria-label='If you need help now']",
                "resident-crisis-signpost",
                width,
            )
        browser.close()


if __name__ == "__main__":
    main()
