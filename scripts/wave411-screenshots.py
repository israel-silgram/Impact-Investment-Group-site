"""Wave 411 screenshots: the registration page at 1280 and at 390, each
showing the wait-list form with the WhatsApp card below it.

Runs entirely in one foreground process: it serves a static build inside
itself, drives Playwright against it, asserts what the shots are meant to
prove, and exits. Nothing is left running.

    STATIC_BUILD=true bun run build
    python scripts/wave411-screenshots.py

It shoots /register/investor rather than /register, because /register is the
role picker and the card sits under the form, which lives on the role pages.

The assertions are the point, not the images. A screenshot of a page where the
QR silently failed to load looks very like a screenshot of a page where it
worked, so the run fails loudly if the QR is not visible at 1280, if it is
visible at 390, or if the button is missing from either.
"""

import functools
import http.server
import socketserver
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
OUT = ROOT / "docs" / "screenshots" / "wave411"
PATH = "/register/investor"
WIDTHS = [1280, 390]

QR = 'img[alt="QR code for the Impact Investment Group WhatsApp community"]'
BUTTON = 'a[href^="https://chat.whatsapp.com/"]'


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory: Path) -> int:
    handler = functools.partial(Quiet, directory=str(directory))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def settle(page):
    """Scroll the page once so no section is photographed mid-fade."""
    page.evaluate(
        "async () => { const step = innerHeight; "
        "for (let y = 0; y < document.body.scrollHeight; y += step) "
        "{ scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } "
        "scrollTo(0, 0); }"
    )
    page.wait_for_timeout(600)


def main() -> None:
    if not (BUILD / "register" / "investor" / "index.html").exists():
        raise SystemExit(f"No build at {BUILD}. Run: STATIC_BUILD=true bun run build")

    port = serve(BUILD)
    base = f"http://127.0.0.1:{port}"
    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in WIDTHS:
            page = browser.new_page(viewport={"width": width, "height": 900})
            page.goto(f"{base}{PATH}", wait_until="networkidle")
            settle(page)

            card = page.get_by_role("heading", name="Prefer WhatsApp?")
            card.wait_for(state="visible")
            card.scroll_into_view_if_needed()
            page.wait_for_timeout(400)

            qr_visible = page.locator(QR).is_visible()
            button_visible = page.locator(BUTTON).is_visible()
            form_present = page.locator("form").count() > 0

            expect_qr = width >= 640  # the site's own `sm` breakpoint
            if qr_visible is not expect_qr:
                raise SystemExit(f"{width}: QR visible={qr_visible}, expected {expect_qr}")
            if not button_visible:
                raise SystemExit(f"{width}: the Open WhatsApp button is not visible")
            if not form_present:
                raise SystemExit(f"{width}: no form on the page, so the card is not below one")

            target = OUT / f"register-{width}.png"
            page.screenshot(path=str(target), full_page=True)
            print(
                f"{width}: wrote {target.relative_to(ROOT)} "
                f"(form={form_present}, qr={qr_visible}, button={button_visible})"
            )
            page.close()
        browser.close()


if __name__ == "__main__":
    main()
