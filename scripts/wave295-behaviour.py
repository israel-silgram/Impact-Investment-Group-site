"""Wave 295 review fixes: the behaviours, driven in a real browser.

The payload script proves the shape of what is sent. This proves the things
that only exist once a person touches the form, which is where the review found
the defects: the special-category gate on the resident page, the phone
validation, the honeypot, the minimum time on form, and the three different
things the page says when the backend refuses.

    AFTER_DIR=... python scripts/wave295-behaviour.py

Exits non-zero on the first behaviour that does not hold.
"""

import functools
import http.server
import os
import socketserver
import threading

from playwright.sync_api import sync_playwright

AFTER_DIR = os.environ["AFTER_DIR"]

failures = 0


def check(label, ok, detail=""):
    global failures
    if not ok:
        failures += 1
    print(f"{'ok  ' if ok else 'FAIL'} {label}{f' :: {detail}' if detail else ''}")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory):
    httpd = socketserver.TCPServer(
        ("127.0.0.1", 0), functools.partial(Quiet, directory=directory)
    )
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def main():
    port = serve(AFTER_DIR)
    base = f"http://127.0.0.1:{port}"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context()
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 1000})

        posts: list[dict] = []
        status = {"code": 200}

        def handler(route):
            posts.append({"body": route.request.post_data})
            route.fulfill(
                status=status["code"],
                content_type="application/json",
                body='{"ok":true}',
            )

        ctx.route("**/public/waitlist", handler)

        # ── The resident special-category gate ────────────────────────────
        page.goto(base + "/register/resident/", wait_until="networkidle")
        check(
            "resident: the health consent is absent until an answer needs it",
            page.query_selector("#consentHealth") is None,
        )
        check(
            "resident: the open free-text box is gone",
            "Anything you want us to know" not in page.content(),
        )

        page.check("input[type=checkbox][value='Adapted for a disability']")
        page.wait_for_selector("#consentHealth", timeout=5000)
        check("resident: choosing a health answer reveals the consent", True)
        check(
            "resident: the consent starts unticked",
            page.is_checked("#consentHealth") is False,
        )

        page.fill("#name", "Amara Bello")
        page.fill("#email", "amara@example.com")
        page.wait_for_timeout(3200)
        page.click("button[type=submit]")
        page.wait_for_timeout(700)
        check(
            "resident: submitting without the consent posts NOTHING",
            len(posts) == 0,
            f"{len(posts)} post(s)",
        )
        check(
            "resident: and says why",
            page.query_selector("#consentHealth-error") is not None,
        )

        page.check("#consentHealth")
        page.click("button[type=submit]")
        page.wait_for_selector("[role=status]", timeout=15000)
        check("resident: ticking it lets the answers through", len(posts) == 1)
        if posts:
            check(
                "resident: the consent is recorded in answers",
                '"health_data_consent":"yes"' in (posts[0]["body"] or "").replace(" ", ""),
                (posts[0]["body"] or "")[:120],
            )

        # ── The phone ─────────────────────────────────────────────────────
        posts.clear()
        page.goto(base + "/register/investor/", wait_until="networkidle")
        page.fill("#name", "Dana Whitfield")
        page.fill("#email", "dana@example.co.uk")
        page.fill("#organisation", "Northfield")
        page.fill("#phone", "12345")
        page.wait_for_timeout(3200)
        page.click("button[type=submit]")
        page.wait_for_selector("#phone-error", timeout=5000)
        check("phone: a non-UK number is refused", len(posts) == 0)
        check(
            "phone: with its own message",
            "UK number" in (page.inner_text("#phone-error") or ""),
            page.inner_text("#phone-error"),
        )

        page.fill("#phone", "07700 900123")
        page.click("button[type=submit]")
        page.wait_for_selector("[role=status]", timeout=15000)
        check("phone: a UK number is accepted", len(posts) == 1)
        if posts:
            check(
                "phone: normalised to E.164 on the wire",
                '"phone":"+447700900123"' in (posts[0]["body"] or "").replace(" ", ""),
            )

        # ── The honeypot ──────────────────────────────────────────────────
        posts.clear()
        page.goto(base + "/register/investor/", wait_until="networkidle")
        page.fill("#name", "Bot")
        page.fill("#email", "bot@example.com")
        page.fill("#organisation", "Bot Co")
        page.evaluate(
            "() => { const el = document.querySelector('#website');"
            " const setter = Object.getOwnPropertyDescriptor("
            "window.HTMLInputElement.prototype, 'value').set;"
            " setter.call(el, 'http://spam.example');"
            " el.dispatchEvent(new Event('input', { bubbles: true })); }"
        )
        page.wait_for_timeout(3200)
        page.click("button[type=submit]")
        page.wait_for_selector("[role=status]", timeout=15000)
        check("honeypot: a filled trap posts nothing", len(posts) == 0, f"{len(posts)} post(s)")
        check("honeypot: and the page says success anyway", True)

        # ── Minimum time on form ──────────────────────────────────────────
        posts.clear()
        page.goto(base + "/register/investor/", wait_until="networkidle")
        page.fill("#name", "Too Fast")
        page.fill("#email", "fast@example.com")
        page.fill("#organisation", "Fast Co")
        page.click("button[type=submit]")
        page.wait_for_selector("[role=status]", timeout=15000)
        check("min time: a submit inside 3s posts nothing", len(posts) == 0)

        # ── What the page says when the backend refuses ───────────────────
        for code, needle, label in [
            (429, "wait a minute", "429 asks for a minute"),
            (422, "could not accept", "a 4xx that is not 429 offers the email"),
            (503, "try again", "a 5xx keeps the retry line"),
        ]:
            posts.clear()
            status["code"] = code
            page.goto(base + "/register/investor/", wait_until="networkidle")
            page.fill("#name", "Dana Whitfield")
            page.fill("#email", "dana@example.co.uk")
            page.fill("#organisation", "Northfield")
            page.wait_for_timeout(3200)
            page.click("button[type=submit]")
            page.wait_for_selector("form [role=alert]", timeout=15000)
            said = page.inner_text("form [role=alert]")
            check(label, needle in said, said[:90])
            check(
                f"{code}: the button is not stuck on Sending",
                "Sending" not in page.inner_text("button[type=submit]"),
                page.inner_text("button[type=submit]"),
            )

        browser.close()

    print(f"\n{failures} behaviour(s) failed.")
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
