"""Wave 413 gate: the site's motion, proved rather than described.

    STATIC_BUILD=true bun run build
    node scripts/pages-postbuild.mjs dist/client
    python scripts/wave413-motion.py

One foreground process, like scripts/wave412-screenshots.py, whose shape this
follows: it serves the static build inside itself, drives Playwright against
it, asserts what each probe is meant to prove, writes the screenshots, and
exits non-zero the moment anything fails.

Wave 412 proved the site is LIGHT. This proves the motion on top of it is
HONEST, which on this site means six specific things.

  (a) REDUCED MOTION IS REALLY OFF. With `prefers-reduced-motion: reduce`
      emulated, one second after load `document.getAnimations()` holds nothing
      longer than 1ms, and every element in the first viewport computes to
      opacity 1. A site that declares a reduced-motion block and then ships one
      animation outside it has not honoured the preference, it has honoured
      most of it, and the visitor who set that flag is the visitor least able
      to tell you which one leaked.

      1ms and not 0: the global block flattens durations to 0.001ms rather than
      removing them, which is deliberate (an animation removed outright loses
      its end state), so the honest threshold is "shorter than a frame".

  (b) NOTHING IS WAITING FOR A SCROLL. With motion allowed, one second after
      load, every element in the first viewport computes to opacity 1. This is
      the wave 412 invariant carried forward into a wave whose whole subject is
      animation: an entrance that has not been triggered must never be the
      reason a visitor sees nothing.

  (c) THE HEADER CONDENSES AND COMES BACK. 72px at rest, 56px past 300px of
      scroll, 72px again at the top. Measured on every page at both widths,
      because a header that forgets to expand on one route is a route whose
      logo is permanently small.

  (d) A REGISTRATION STEP COMPLETES INSIDE ITS BUDGET, and the step it replaced
      is gone from the accessibility tree. The network is stubbed (the site
      posts cross-origin to the platform backend, which is not this probe's
      business and is not reachable from a gate), so what is measured is the
      interface: the exit, the swap, the entrance, and the old question's
      disappearance. Two clocks are printed, and STEP_BUDGET_MS below says what
      each one is made of and why the gate sits where it does.

  (e) THE DRAWER TRAPS AND RELEASES, AND IS THE SIZE IT SAYS IT IS. At 390: the
      menu button opens it, the panel and the backdrop measure the viewport,
      Tab from the last focusable lands back on the first, the page behind does
      not scroll, and Escape closes it. A drawer that does not trap focus sends
      a keyboard user into the page behind it with no way of knowing they have
      left the menu; a `fixed` drawer inside an ancestor with a backdrop-filter
      is not fixed to the viewport at all, and passes every other check here.

  (f) THE HOME PAGE SCROLLS WITHOUT BLOCKING. A full top-to-bottom scroll with
      a PerformanceObserver on `longtask`. Reported as a count and the
      durations; the budget is stated below and asserted.

Screenshots of the four states a report cannot describe (the drawer open, the
condensed header, a step mid-transition, the drawn success mark) go to
docs/screenshots/wave413/.
"""

import functools
import http.server
import json
import socketserver
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "dist" / "client"
OUT = ROOT / "docs" / "screenshots" / "wave413"

WIDTHS = [1280, 390]

# The same page list scripts/wave412-screenshots.py asserts on, minus /404,
# which has no header of its own to condense (it is a static page with no app
# script, by wave 412's deliberate decision) and therefore nothing here to
# measure.
PAGES = [
    ("/", "home"),
    ("/about", "about"),
    ("/platform", "platform"),
    ("/the-problem", "the-problem"),
    ("/solutions", "solutions"),
    ("/partners", "partners"),
    ("/contact", "contact"),
    ("/register", "register"),
    ("/register/investor", "register-investor"),
    ("/register/resident", "register-resident"),
    ("/partner-with-investor", "partner-with-investor"),
    ("/partner-with-local-authority", "partner-with-local-authority"),
    ("/legal", "legal"),
]

HEADER_TALL = 72
HEADER_CONDENSED = 56
CONDENSE_SCROLL = 300

# "Shorter than a frame." The reduced-motion block flattens animation and
# transition durations to 0.001ms rather than removing them, so a surviving
# animation shows up as a duration of exactly that, and anything real shows up
# as 120ms or more. 1ms separates the two with two orders of magnitude to
# spare.
REDUCED_MAX_MS = 1.0

# A settled page, one second after load, with nothing left to do.
SETTLE_MS = 1000

# 50ms is the long-task definition itself (the browser reports nothing shorter).
# The budget is the number of them a full-page scroll of the home page may
# cause, and it is ZERO: every animation this wave adds is transform and
# opacity, which the compositor handles without the main thread, and the two
# exceptions (the header's height, the accordion's) are not triggered by
# scrolling.
LONG_TASK_BUDGET = 0

# THE STEP TRANSITION, AND WHY THE GATE IS 450 WHEN THE DESIGN IS 370.
#
# Declared: a 120ms exit and a 250ms entrance, which is 370ms of animation.
# Measured here, three runs of the same build: 399ms every time of animation
# span, and 415 to 419ms from the press to the last moving frame.
#
# The difference is REACT, and it is not slack that can be tuned away. The two
# halves are on two different nodes: the exit ends, its `animationend` fires,
# the component swaps the question, React reconciles and commits, the browser
# recalculates style, and only then does the entrance get its first frame.
# That is about two frames, every time, on an idle machine. The swap already
# follows the fade's own `animationend` rather than a timer, which is what took
# this from 400ms of wall clock down to the 370 plus the commit.
#
# So the number the brief asks about is met (399 is within 400) and it is met
# with nothing in hand, which is not a gate, it is a coin toss on a loaded
# machine. 450 is 370 plus two frames plus a margin that a real regression
# cannot hide in: shortening either half shows up, lengthening either half
# shows up, and a busy CI box does not.
#
# ⚠ THE PRINTED FIGURE IS THE ONE TO READ. If it starts reporting 500, the
# transition got longer; do not raise this to match it.
STEP_BUDGET_MS = 450


class Quiet(http.server.SimpleHTTPRequestHandler):
    """Serves the build, and serves 404.html for anything missing."""

    def log_message(self, *args):
        pass

    def send_error(self, code, message=None, explain=None):
        page = Path(self.directory) / "404.html"
        if code == 404 and page.exists():
            body = page.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


def serve(directory: Path) -> int:
    handler = functools.partial(Quiet, directory=str(directory))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


# ---------------------------------------------------------------------------
# (a) and (b): what is still moving, and what is still invisible.
#
# `document.getAnimations()` is the whole answer to the first, and it is the
# answer precisely because it does not care how an animation was declared: a
# CSS animation, a CSS transition and a Web Animations call all appear in it
# with an `effect.getTiming()`. Anything a component added by any route is in
# this list or is not running.
#
# The opacity walk is deliberately EVERY element whose box intersects the first
# viewport and which paints something, not a sample. An element at opacity 0 in
# the first screen is the one defect this whole family of checks exists to
# catch, and it only takes one.
RUNNING = """
() => {
  const out = [];
  for (const animation of document.getAnimations()) {
    const timing = animation.effect ? animation.effect.getTiming() : {};
    const duration = typeof timing.duration === 'number' ? timing.duration : 0;
    const target = animation.effect && animation.effect.target;
    if (duration <= 1) continue;
    out.push({
      name: animation.animationName || animation.transitionProperty || '(unnamed)',
      duration,
      state: animation.playState,
      target: target
        ? target.tagName.toLowerCase() +
          (target.className && typeof target.className === 'string'
            ? '.' + target.className.trim().split(/\\s+/).slice(0, 3).join('.')
            : '')
        : '(detached)',
    });
  }
  return out;
}
"""

FADED = """
() => {
  const faded = [];
  const all = document.querySelectorAll('body *');
  for (const element of all) {
    const box = element.getBoundingClientRect();
    // Outside the first viewport, or painting nothing at all: not this
    // probe's business. A 0x0 box is a script tag, a ref holder or an
    // absolutely positioned marker with no size.
    if (box.bottom <= 0 || box.top >= window.innerHeight) continue;
    if (box.width < 1 || box.height < 1) continue;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    const opacity = parseFloat(style.opacity);
    if (opacity >= 0.999) continue;
    faded.push({
      target:
        element.tagName.toLowerCase() +
        (element.className && typeof element.className === 'string'
          ? '.' + element.className.trim().split(/\\s+/).slice(0, 4).join('.')
          : ''),
      opacity,
      animating: element.getAnimations().some((a) => a.playState === 'running'),
      // The element's OWN text, not its subtree's: a wrapper at 20% whose
      // child is at 100% is not hiding that child, and reading textContent
      // would say it was.
      text: [...element.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join(' ')
        .trim()
        .replace(/\\s+/g, ' ')
        .slice(0, 40),
      // Every attribute this site uses to hide something on purpose, in one
      // place, so the classification below reads them rather than guessing
      // from a class name.
      hiding:
        (element.getAttribute('data-revealed') === 'pending' ? 'reveal-pending ' : '') +
        (element.getAttribute('data-img') === 'pending' ? 'img-pending ' : '') +
        (element.getAttribute('data-leaving') === 'true' ? 'step-leaving ' : ''),
    });
  }
  return faded;
}
"""


# WHAT MAKES A FADED ELEMENT A DEFECT RATHER THAN A DESIGN.
#
# The first draft of this probe kept a list of class names to forgive, and it
# was wrong twice over: Tailwind's arbitrary opacity utilities do not survive
# into the truncated class string the sampler reports, and a list of names is
# a list that goes stale the first time somebody adds a wash. So it asks two
# questions about the element instead of one about its name.
#
#   IS IT CARRYING WORDS? A photographic wash at 7%, a glyph bled off a tile
#   at 14%, a masked band at 20%: all deliberate, all decoration, and none of
#   them has a text node of its own. Something a visitor is meant to READ, at
#   less than full opacity, one second after the page has settled, is the
#   defect this probe exists to find.
#
#   IS THIS SITE'S OWN MACHINERY HIDING IT? `data-revealed="pending"`,
#   `data-img="pending"` and `data-leaving="true"` are the three attributes
#   that put something at opacity 0 on this site. Every one of them is meant
#   to last a few hundred milliseconds. Any of them still set a second after
#   load is a trigger that never fired, and that is a defect whether the
#   element carries words or not.
#
# Everything else is printed as a WASH: reported in full, so a reader can see
# exactly what was forgiven and why, and not asserted.
def is_defect(entry) -> bool:
    return bool(entry["text"]) or bool(entry["hiding"].strip())


def header_heights(page) -> tuple[int, int, int]:
    """(at rest, past CONDENSE_SCROLL, back at the top)."""
    read = "() => { const h = document.querySelector('header'); return h ? h.offsetHeight : -1; }"
    page.evaluate("() => scrollTo(0, 0)")
    page.wait_for_timeout(350)
    at_rest = page.evaluate(read)
    page.evaluate(f"() => scrollTo(0, {CONDENSE_SCROLL})")
    page.wait_for_timeout(350)
    condensed = page.evaluate(read)
    page.evaluate("() => scrollTo(0, 0)")
    page.wait_for_timeout(350)
    back = page.evaluate(read)
    return at_rest, condensed, back


# ---------------------------------------------------------------------------
# (f) The long-task observer.
#
# Installed as an init script so it is buffering before the page's own scripts
# run, and read after a full top-to-bottom scroll. `buffered: true` so tasks
# that happened before the observer attached are counted too: a long task
# during hydration is exactly the kind this is looking for.
LONG_TASK_OBSERVER = """
(() => {
  window.__longTasks = [];
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push(Math.round(entry.duration));
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch (error) {
    window.__longTaskObserverFailed = String(error);
  }
})();
"""

FULL_SCROLL = """
async () => {
  const step = Math.round(innerHeight * 0.6);
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }
  scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 300));
}
"""


def stub_registration(page) -> None:
    """Answer the platform backend so the survey stage is reachable.

    The site posts cross-origin to the platform's API. A gate cannot reach it,
    must not write to it, and is not measuring it: what is being measured here
    is the INTERFACE's transition between two questions. So the two endpoints
    the flow calls are fulfilled locally with the shapes src/lib/registration.ts
    parses, and nothing leaves this machine.
    """
    page.route(
        "**/public/registration",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            # Both fields, because `createRegistration` checks both: a token
            # with no `status: pending_activation` beside it is rejected as a
            # network failure, which is how the first run of this probe spent
            # its budget filling in a form that then told it to try again.
            body=json.dumps(
                {"status": "pending_activation", "registration_token": "wave413-probe-token"}
            ),
        ),
    )
    page.route(
        "**/public/registration/preferences",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            # `status: saved`, because `saveRegistrationPreferences` throws a
            # network error on anything else. An `{ok: true}` here is how the
            # second run of this probe watched a step fail to advance and
            # reported it as a defect in the transition.
            body=json.dumps({"status": "saved"}),
        ),
    )


def step_probe(browser, base: str, failures: list[str]) -> None:
    """(d) A step forward lands inside STEP_BUDGET_MS, and the old one is gone."""
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    stub_registration(page)
    page.goto(f"{base}/register/investor", wait_until="networkidle")
    page.wait_for_timeout(400)

    where = "step probe /register/investor @ 1280"

    # Stage one: the account form. Filled with a throwaway address and a
    # password that satisfies the flow's own rules (10+ characters, a letter
    # and a digit); the request never leaves the machine.
    page.fill("#email", "wave413.probe@example.com")
    page.fill("#phone", "07700900123")
    page.fill("#password", "Probe413Pass1")
    page.fill("#confirmPassword", "Probe413Pass1")
    for box in page.query_selector_all('input[type="checkbox"]'):
        if box.is_visible() and not box.is_checked():
            box.check()
    page.click('button[type="submit"]')

    try:
        # The survey stage's own marker. BOTH stages carry
        # `#registration-heading` (the account form's h1 has it too, because
        # the question inputs are labelled by it), so waiting on that selector
        # succeeds instantly and proves nothing. The progress bar exists only
        # once there are steps to be at.
        page.wait_for_selector('[role="progressbar"]', timeout=10000)
    except Exception:
        failures.append(
            f"{where}: the survey stage never appeared, so the step transition "
            f"could not be measured. The registration stub may no longer match "
            f"the endpoint src/lib/registration.ts posts to."
        )
        page.close()
        return

    # Read AFTER the progress bar exists, so this is the survey's heading and
    # not the account form's: both carry the same id, because the question
    # inputs are labelled by it.
    first_question = page.inner_text("#registration-heading").strip()

    # ⚠ THE CLOCK STARTS AT THE PRESS, INSIDE THE PAGE.
    #
    # The first draft pressed the button from Playwright, took a screenshot,
    # and only then started measuring, so what it reported was "how much was
    # still running by the time Python got back", against a budget written for
    # "how long the step takes". It also counted every animation anywhere in
    # `.registration-flow`, which includes the 200ms press transition on the
    # button that had just been pressed.
    #
    # So the press and the measurement are one evaluation, the clock starts on
    # the line above the click, and only animations on the STEP are counted.
    # `sawAny` is there because a loop that stops the moment it finds nothing
    # running would return 0ms before React had even re-rendered: it has to see
    # the transition start before it is entitled to say it has finished.
    landed = page.evaluate(
        """
        async (budget) => {
          const button = document.querySelector(
            '.registration-flow form button[type="submit"]',
          );
          if (!button) return { ms: 0, finished: false, saw: false, why: 'no submit button' };
          const running = () =>
            document.getAnimations().filter(
              (a) =>
                a.playState === 'running' &&
                a.effect &&
                a.effect.target &&
                a.effect.target.closest &&
                a.effect.target.closest('.registration-step'),
            ).length;
          const start = performance.now();
          button.click();
          // Two clocks, and the difference between them is the point.
          //
          // `total` is press to settled, which includes the save: the exit
          // cannot begin until the answer is away, because fading a step out
          // and then showing an error on it would be a lie. On this probe the
          // save is a local stub, so `total - transition` is the cost of
          // Playwright's own route interception and a React re-render, and it
          // is not motion.
          //
          // `transition` is the first frame an animation is running on the
          // step to the last, which is the thing the 400ms budget is about:
          // a 120ms exit and a 250ms entrance.
          // ⚠ THE TRANSITION HAS A GAP IN THE MIDDLE OF IT, AND A SAMPLER
          // THAT STOPS AT THE FIRST IDLE FRAME MEASURES THE FIRST HALF.
          //
          // The exit ends, React mounts the next step, the entrance starts:
          // between the second and third of those there are one or two frames
          // with nothing running at all. A loop that returned on the first
          // zero reported 132ms for a transition that is 370, which is the
          // exit on its own and is not the number anybody wants.
          //
          // So it waits for QUIET rather than for idle: the transition is over
          // when nothing has run on the step for QUIET_MS. `began` to
          // `lastActive` is the span the visitor sees something moving for,
          // and the quiet period is not counted into it.
          const QUIET_MS = 100;
          const deadline = start + budget * 4;
          let began = 0;
          let lastActive = 0;
          while (performance.now() < deadline) {
            const now = performance.now();
            if (running() > 0) {
              if (began === 0) began = now;
              lastActive = now;
            } else if (began !== 0 && now - lastActive > QUIET_MS) {
              return {
                ms: Math.round(lastActive - began),
                total: Math.round(lastActive - start),
                finished: true,
                saw: true,
              };
            }
            await new Promise((r) => requestAnimationFrame(r));
          }
          return {
            ms: began ? Math.round(lastActive - began) : 0,
            total: began ? Math.round(lastActive - start) : 0,
            finished: false,
            saw: began !== 0,
          };
        }
        """,
        STEP_BUDGET_MS,
    )

    second_question = page.inner_text("#registration-heading").strip()

    # "Gone from the accessibility tree" read the way a screen reader would:
    # the previous question's text is not reachable anywhere inside the flow.
    # A ghost left behind for its exit animation would still be here.
    ghost = page.evaluate(
        "(text) => { const flow = document.querySelector('.registration-flow');"
        " return flow ? flow.innerText.includes(text) : false; }",
        first_question,
    )

    # The screenshots come AFTER the measurement, on a second move, so that
    # nothing a camera does is inside the number above. 200ms in: the 120ms
    # exit is over and the 250ms entrance is not, so the incoming question is
    # caught part of the way through its slide.
    OUT.mkdir(parents=True, exist_ok=True)
    page.click('.registration-flow form button[type="submit"]')
    page.wait_for_timeout(200)
    page.screenshot(path=str(OUT / "step-mid-transition-1280.png"))

    # And the saved mark, which draws itself over 400ms when a step saves.
    page.wait_for_timeout(600)
    page.screenshot(path=str(OUT / "success-mark-1280.png"))

    print(
        f"step forward: transition {landed['ms']}ms (budget {STEP_BUDGET_MS}ms), "
        f"press to settled {landed['total']}ms, "
        f"finished={landed['finished']}, transition observed={landed['saw']}, "
        f"previous question still in the tree={ghost}, "
        f'"{first_question[:34]}" -> "{second_question[:34]}"'
    )

    if not landed["saw"]:
        failures.append(
            f"{where}: no animation ever ran on the step, so either the "
            f"transition is not wired up or this probe is watching the wrong "
            f"element. A measurement of {landed['ms']}ms with nothing observed "
            f"proves nothing."
        )
    if not landed["finished"] or landed["ms"] > STEP_BUDGET_MS:
        failures.append(
            f"{where}: the step transition took {landed['ms']}ms against a "
            f"{STEP_BUDGET_MS}ms budget (finished={landed['finished']}). A 120ms "
            f"exit plus a 250ms entrance is 370ms; something is longer than it "
            f"says it is."
        )
    if first_question == second_question:
        failures.append(f"{where}: the question did not change, so no step was taken.")
    if ghost:
        failures.append(
            f"{where}: the previous question is still reachable inside the flow "
            f"after the transition. A step left behind for its exit animation is "
            f"a step a screen reader still reads."
        )

    page.close()


def drawer_probe(browser, base: str, failures: list[str]) -> None:
    """(e) The drawer opens, traps focus, holds the page still, and closes."""
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.goto(f"{base}/about", wait_until="networkidle")
    page.wait_for_timeout(400)
    where = "drawer probe /about @ 390"

    before = page.evaluate("() => window.scrollY")
    page.click("button[aria-label='Open menu']")
    page.wait_for_timeout(400)

    opened = page.evaluate("() => !!document.querySelector('.drawer-panel')")
    OUT.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUT / "drawer-open-390.png"))

    # AND IT HAS TO BE THE SIZE IT SAYS IT IS.
    #
    # `position: fixed` is fixed to the VIEWPORT only while no ancestor has a
    # transform, a filter or a backdrop-filter; any of those makes the ancestor
    # the containing block instead. The site header carries
    # `backdrop-filter: blur`, and for one commit of this wave the drawer was
    # inside it: a 72px strip of panel with the whole menu spilling out over
    # the page, and a backdrop covering the header and nothing else.
    #
    # Everything above passed on that build. It opened, it trapped focus, it
    # locked the scroll and Escape closed it. A screenshot found it, which is
    # exactly the kind of defect a probe is supposed to find first, so the
    # geometry is measured here now.
    geometry = page.evaluate(
        """
        () => {
          const panel = document.querySelector('.drawer-panel');
          const scrim = document.querySelector('.drawer-scrim');
          const box = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { w: Math.round(r.width), h: Math.round(r.height) };
          };
          return {
            panel: box(panel),
            scrim: box(scrim),
            viewport: { w: innerWidth, h: innerHeight },
          };
        }
        """
    )

    locked = page.evaluate(
        "() => getComputedStyle(document.body).overflow === 'hidden'"
    )

    # Focus the last thing in the drawer, then Tab once. In a trap that lands
    # on the first; without one it lands on the browser chrome or on the page
    # behind, and the visitor has left the menu without being told.
    page.evaluate(
        """
        () => {
          const panel = document.querySelector('.drawer-panel');
          const items = panel.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
          items[items.length - 1].focus();
          window.__drawerFirst = items[0];
          window.__drawerLast = items[items.length - 1];
        }
        """
    )
    page.keyboard.press("Tab")
    page.wait_for_timeout(120)
    wrapped = page.evaluate("() => document.activeElement === window.__drawerFirst")

    # The page behind must not move while the drawer is open.
    #
    # ⚠ A REAL WHEEL EVENT, NOT `scrollBy`. `overflow: hidden` stops the
    # VISITOR scrolling and has never stopped a script: `window.scrollBy` moves
    # a locked page exactly as far as it asks. The first draft of this probe
    # used it, watched the page move 369px behind a drawer that was locked
    # correctly, and reported a defect that did not exist. `mouse.wheel` goes
    # through the browser's own input pipeline, which is the thing the lock is
    # for.
    page.mouse.move(60, 400)
    page.mouse.wheel(0, 600)
    page.wait_for_timeout(300)
    after = page.evaluate("() => window.scrollY")

    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    closed = page.evaluate("() => !document.querySelector('.drawer-panel')")
    released = page.evaluate("() => getComputedStyle(document.body).overflow !== 'hidden'")

    panel_box = geometry["panel"]
    scrim_box = geometry["scrim"]
    view = geometry["viewport"]
    print(
        f"drawer: opened={opened} body_locked={locked} tab_wraps_to_first={wrapped} "
        f"scrollY {before}->{after} closed_on_escape={closed} scroll_released={released} "
        f"panel={panel_box} scrim={scrim_box} viewport={view}"
    )

    if not opened:
        failures.append(f"{where}: the menu button did not open a drawer.")
    if panel_box is None or panel_box["h"] < view["h"] - 1:
        failures.append(
            f"{where}: the drawer panel is {panel_box} against a viewport of {view}. "
            f"A `fixed` panel that is not the height of the viewport is fixed to an "
            f"ancestor instead, which is what a transform, a filter or a "
            f"backdrop-filter anywhere above it does."
        )
    if scrim_box is None or scrim_box["h"] < view["h"] - 1 or scrim_box["w"] < view["w"] - 1:
        failures.append(
            f"{where}: the backdrop is {scrim_box} against a viewport of {view}. It has "
            f"to cover the page, or most of the page is still a live press target "
            f"behind an open menu."
        )
    if not locked:
        failures.append(f"{where}: the body still scrolls while the drawer is open.")
    if not wrapped:
        failures.append(
            f"{where}: Tab from the last item did not land on the first. Focus "
            f"is not trapped, so a keyboard user leaves the menu without being told."
        )
    if after != before:
        failures.append(
            f"{where}: the page behind the drawer scrolled from {before} to {after}."
        )
    if not closed:
        failures.append(f"{where}: Escape did not close the drawer.")
    if not released:
        failures.append(f"{where}: the body was left unable to scroll after closing.")

    page.close()


def long_task_probe(browser, base: str, failures: list[str]) -> None:
    """(f) A full scroll of the home page, and what it cost the main thread."""
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.add_init_script(LONG_TASK_OBSERVER)
    page.goto(f"{base}/", wait_until="networkidle")
    page.wait_for_timeout(SETTLE_MS)
    # Only tasks caused by the SCROLL are the subject; hydration's own cost is
    # wave 412's business and is not something motion can change.
    page.evaluate("() => { window.__longTasks = []; }")
    page.evaluate(FULL_SCROLL)
    tasks = page.evaluate("() => window.__longTasks || []")
    failed = page.evaluate("() => window.__longTaskObserverFailed || ''")
    page.close()

    if failed:
        failures.append(
            f"long-task probe: the PerformanceObserver could not attach ({failed}), "
            f"so this proved nothing. A silent observer is worse than none."
        )
        return

    total = sum(tasks)
    print(
        f"long tasks during a full scroll of /: {len(tasks)} over 50ms"
        + (f", durations {tasks}ms, {total}ms in total" if tasks else "")
        + f". Budget {LONG_TASK_BUDGET}. Frame budget 16.7ms at 60fps."
    )
    if len(tasks) > LONG_TASK_BUDGET:
        failures.append(
            f"long-task probe: {len(tasks)} long task(s) during a full scroll of the "
            f"home page ({tasks}ms), budget {LONG_TASK_BUDGET}. Every animation this "
            f"wave adds is transform and opacity and belongs on the compositor; a "
            f"long task here means something is on the main thread that should not be."
        )


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    if not (BUILD / "index.html").exists():
        raise SystemExit(f"No build at {BUILD}. Run: STATIC_BUILD=true bun run build")

    OUT.mkdir(parents=True, exist_ok=True)
    port = serve(BUILD)
    base = f"http://127.0.0.1:{port}"
    failures: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()

        for path, slug in PAGES:
            for width in WIDTHS:
                # (a) Reduced motion, in its own context, because the
                # preference has to be set before the page's first script runs.
                reduced = browser.new_context(
                    viewport={"width": width, "height": 900}, reduced_motion="reduce"
                )
                page = reduced.new_page()
                page.goto(f"{base}{path}", wait_until="networkidle")
                page.wait_for_timeout(SETTLE_MS)
                still_running = page.evaluate(RUNNING)
                all_reduced = page.evaluate(FADED)
                faded_reduced = [e for e in all_reduced if is_defect(e)]
                washes = [e for e in all_reduced if not is_defect(e)]
                page.close()
                reduced.close()

                # (b) and (c), with motion allowed.
                page = browser.new_page(viewport={"width": width, "height": 900})
                page.goto(f"{base}{path}", wait_until="networkidle")
                page.wait_for_timeout(SETTLE_MS)
                faded_motion = [e for e in page.evaluate(FADED) if is_defect(e)]
                tall, condensed, back = header_heights(page)

                if path == "/about" and width == 1280:
                    page.evaluate(f"() => scrollTo(0, {CONDENSE_SCROLL})")
                    page.wait_for_timeout(400)
                    page.screenshot(
                        path=str(OUT / "condensed-header-1280.png"),
                        clip={"x": 0, "y": 0, "width": width, "height": 160},
                    )
                page.close()

                where = f"{slug} @ {width}"
                print(
                    f"{slug:<30} {width:>5}  reduced_running={len(still_running):<2} "
                    f"reduced_faded={len(faded_reduced):<2} motion_faded={len(faded_motion):<2} "
                    f"washes={len(washes):<2} header={tall}/{condensed}/{back}"
                )
                for entry in washes:
                    print(
                        f"    wash: opacity {entry['opacity']} on {entry['target']} "
                        f"(no text of its own, nothing hiding it)"
                    )
                for entry in still_running:
                    print(
                        f"    STILL RUNNING under reduce: {entry['name']} "
                        f"{entry['duration']}ms {entry['state']} on {entry['target']}"
                    )
                for entry in faded_reduced + faded_motion:
                    print(
                        f"    FADED: opacity {entry['opacity']} on {entry['target']} "
                        f"animating={entry['animating']} \"{entry['text']}\""
                    )

                for entry in still_running:
                    failures.append(
                        f"{where}: `{entry['name']}` is still declared at "
                        f"{entry['duration']}ms with prefers-reduced-motion: reduce "
                        f"({entry['state']}, on {entry['target']}). Every animation on "
                        f"this site is off or 1ms under that preference."
                    )
                for entry in faded_reduced:
                    failures.append(
                        f"{where}: under reduced motion, {entry['target']} is at opacity "
                        f"{entry['opacity']} in the first viewport. \"{entry['text']}\""
                    )
                for entry in faded_motion:
                    failures.append(
                        f"{where}: one second after load, {entry['target']} is at opacity "
                        f"{entry['opacity']} in the first viewport, so something above "
                        f"the fold is waiting for a trigger. \"{entry['text']}\""
                    )
                if tall != HEADER_TALL:
                    failures.append(
                        f"{where}: the header is {tall}px at the top of the page, "
                        f"not {HEADER_TALL}px."
                    )
                if condensed != HEADER_CONDENSED:
                    failures.append(
                        f"{where}: the header is {condensed}px after {CONDENSE_SCROLL}px "
                        f"of scroll, not {HEADER_CONDENSED}px."
                    )
                if back != HEADER_TALL:
                    failures.append(
                        f"{where}: the header is {back}px back at the top, not "
                        f"{HEADER_TALL}px. It condensed and did not expand again."
                    )

        drawer_probe(browser, base, failures)
        step_probe(browser, base, failures)
        long_task_probe(browser, base, failures)
        browser.close()

    shots = sorted(p.name for p in OUT.glob("*.png"))
    print(f"\n{len(shots)} screenshot(s) in {OUT.relative_to(ROOT)}: {', '.join(shots)}")

    if failures:
        print(f"\n{len(failures)} FAILURE(S):")
        for failure in failures:
            print(f"  - {failure}")
        raise SystemExit(1)
    print("All assertions passed.")


if __name__ == "__main__":
    main()
