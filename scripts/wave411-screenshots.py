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

WAVE 415b, rel415 MAJOR 1. This gate was carried in by the wave 411 merge and
NOT RUN, on a stated premise that it "asserts the pre-412 navy card that no
longer exists". That premise was false and the re-checker read every line to
show it: there is no colour, surface or plate assertion anywhere in this file.
Its four assertions are the heading, the QR breakpoint, the invite href and
the presence of a form, and all four hold on the light site, on the one route
the card now survives on. It is run now, and its two shots are re-taken at the
415b head, because the pair committed by the merge were shot at 9adb0bb, from
BEFORE wave 412 turned the ground white, and showed a navy card the site no
longer has.

And it now settles the way the other three do (rel414b MINOR 1, which this
gate was added to the tree without inheriting): `src/styles.css` carries
`scroll-behavior: smooth` on `html`, so the bare `scrollTo(0, y)` this used to
issue in a loop, and the bare `scrollTo(0, 0)` after it, were ANIMATED, and
the blind 600ms wait that followed confirmed nothing. Instant scroll, a polled
top confirmation that FAILS rather than waits, and a polled confirmation that
the "Prefer WhatsApp?" heading really is on screen before the shutter opens.

WAVE 415c, rel415b MINOR 3: `assert_on_screen` was renamed to
`assert_heading_on_screen`. It always measured the heading's own 32px box,
not the card, which at 1280 also holds a QR many times that tall; the name,
docstring and messages now say so.
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
    """Scroll the page once so no section is photographed mid-fade.

    Every scroll is `behavior: 'instant'`. Identical to `settle` in
    `scripts/wave412-screenshots.py` and `scripts/wave414-mobile.py` on
    purpose: four gates, one settle. The return to the top is NOT done here,
    because a scroll nothing confirms is a guess; `to_top` below does it and
    reports where the page actually is.
    """
    page.evaluate(
        "async () => { const step = innerHeight; "
        "for (let y = 0; y < document.body.scrollHeight; y += step) "
        "{ scrollTo({ top: y, behavior: 'instant' }); "
        "await new Promise(r => setTimeout(r, 120)); } }"
    )
    page.wait_for_timeout(300)


def to_top(page) -> float:
    """Put the page at the top and return where it actually is.

    Returned rather than asserted here, so the caller names the shot in the
    failure. Identical to `to_top` in `scripts/wave412-screenshots.py` and
    `scripts/wave414-mobile.py`.
    """
    for _ in range(12):
        page.evaluate("() => scrollTo({ top: 0, behavior: 'instant' })")
        page.wait_for_timeout(100)
        if page.evaluate("() => window.scrollY") <= 0.5:
            return 0.0
    return page.evaluate("() => window.scrollY")


def assert_heading_on_screen(page, locator, where: str) -> tuple[float, float]:
    """Poll until the heading is inside the viewport, and FAIL if it never is.

    `scroll_into_view_if_needed` is a request, and `html { scroll-behavior:
    smooth }` makes the browser's own scrolls animate too. This is the
    `assert_scrolled` of `scripts/wave413-motion.py` in the shape this gate
    needs: the thing the shot exists to show has to be on screen before the
    reading is taken, and a fixed wait after a scroll request proves nothing.

    415c, rel415b MINOR 3: named and worded for what it binds. It measures
    the "Prefer WhatsApp?" HEADING's own box, 32px tall, not the card that
    contains it; at 1280 the card also holds a QR many times that height,
    which `main` below asserts visible separately. Returns the heading's top
    and bottom in viewport coordinates.
    """
    for _ in range(12):
        box = locator.bounding_box()
        height = page.evaluate("() => innerHeight")
        if box and box["y"] >= -0.5 and box["y"] + box["height"] <= height + 0.5:
            return box["y"], box["y"] + box["height"]
        page.wait_for_timeout(100)
    box = locator.bounding_box()
    raise SystemExit(
        f"{where}: the heading never came to rest on screen "
        f"(box={box}, innerHeight={page.evaluate('() => innerHeight')})"
    )


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
            top, bottom = assert_heading_on_screen(page, card, f"{width}")

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

            resting = to_top(page)
            if resting > 0.5:
                raise SystemExit(
                    f"{width}: the page would not return to the top before the "
                    f"shutter (scrollY={resting:.1f}), so this shot would be a "
                    f"photograph of a page mid-scroll"
                )

            target = OUT / f"register-{width}.png"
            page.screenshot(path=str(target), full_page=True)
            print(
                f"{width}: wrote {target.relative_to(ROOT)} "
                f"(form={form_present}, qr={qr_visible}, button={button_visible}, "
                f"heading on screen at {top:.0f}..{bottom:.0f}, resting scrollY={resting:.1f})"
            )
            page.close()
        browser.close()


if __name__ == "__main__":
    main()
