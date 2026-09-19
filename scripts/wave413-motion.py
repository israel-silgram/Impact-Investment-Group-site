"""Wave 413 gate: the site's motion, proved rather than described.

    STATIC_BUILD=true bun run build
    node scripts/pages-postbuild.mjs dist/client
    python scripts/wave413-motion.py

One foreground process, like scripts/wave412-screenshots.py, whose shape this
follows: it serves the static build inside itself, drives Playwright against
it, asserts what each probe is meant to prove, writes the screenshots, and
exits non-zero the moment anything fails.

Wave 412 proved the site is LIGHT. This proves the motion on top of it is
HONEST, which on this site means ten specific things.

  (a) REDUCED MOTION IS REALLY OFF ON A SETTLED PAGE. With
      `prefers-reduced-motion: reduce` emulated, one second after load
      `document.getAnimations()` holds nothing longer than 1ms, and every
      element in the first viewport computes to an effective opacity of 1.
      This is a check on what SURVIVES the preference: a short unfilled
      entrance that leaked would have finished and left the list by then, and
      nothing here is triggered. Probe (j) is the other half. A site that declares a reduced-motion block and then ships one
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

  (g) NO IMAGE FADES PAST ITS OWN OPACITY. With every image request PARKED
      until `ImageFade` has run, the computed opacity of every image the fade
      touches is sampled every 16ms from the first byte of the navigation, and
      the highest value ever seen is compared against the value the image
      rests at. (Wave 414, rel413b MIN-4: this comment used to say "with the
      network throttled". There is no throttling in this file and never was;
      what is implemented is the request parking below, which is stronger
      because it cannot lose the race on a fast machine.) Four images on this
      site are decorative washes at 7, 20, 25 and 70 per cent, and wave 413's
      first draft ramped every one of them to FULL STRENGTH for 350ms before
      snapping it back, which no settled screenshot can see.

  (h) A MARK THAT DRAWS ITSELF DRAWS ALL OF ITSELF. Every shape carrying
      `.draw-in` has a `stroke-dasharray` at least as long as its own
      `getTotalLength()`, and the stylesheet's fallback is at least as long as
      the longest path in either glyph that uses it. Wave 413 wrote the dash
      as a flat 48 on the reasoning that no 24px Lucide path is longer than
      that; `shield-check` is 58.75, so a sixth of the shield never drew.

  (i) THE MAGIC LINE IS EXACTLY AS WIDE AS THE LINK IT IS UNDER. It travels
      and stretches on `transform` alone now (wave 413 transitioned `width`
      as well), and a 1px box scaled on X is only the same thing as a box
      given that width if the arithmetic is exact. Measured at both bar
      heights, against the active link's own box.

  (j) AND REDUCED MOTION IS OFF WHEN IT IS ACTUALLY USED. (a) reads
      `getAnimations()` once on a settled page, which proves that nothing
      LOOPING or FILLED survives the preference and proves nothing at all
      about a transition nobody triggered. So the interactions are
      EXERCISED under `reduce`: a card is hovered, a button is pressed, the
      drawer is opened and closed at 390, a registration step is taken, a
      disclosure is opened. After each, the computed transition-duration and
      animation-duration of the element that moved must be at or under 1ms,
      and the STATE the motion was carrying must be there without it.

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
    // ⚠ WAVE 413b: THE EFFECTIVE OPACITY, NOT THE ELEMENT'S OWN.
    //
    // Opacity composites the WHOLE SUBTREE. A wrapper at 0 with its text at 1
    // is an invisible paragraph, and reading `getComputedStyle(child).opacity`
    // says 1 for the child while the parent, having no text node of its own,
    // is filed as a decorative wash. Both forgiven, nothing seen. So it is the
    // product of the element's own value and every ancestor's, which is what
    // the screen actually shows.
    const own = parseFloat(style.opacity);
    let opacity = own;
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const value = parseFloat(getComputedStyle(parent).opacity);
      if (Number.isFinite(value)) opacity *= value;
    }
    opacity = Math.round(opacity * 10000) / 10000;
    if (opacity >= 0.999) continue;
    faded.push({
      target:
        element.tagName.toLowerCase() +
        (element.className && typeof element.className === 'string'
          ? '.' + element.className.trim().split(/\\s+/).slice(0, 4).join('.')
          : ''),
      opacity,
      own,
      animating: element.getAnimations().some((a) => a.playState === 'running'),
      // The element's OWN text, not its subtree's. That is still the right
      // question now that the opacity above is the effective one: a wrapper
      // at 20% is reported on its own account AND every element under it
      // comes out at 0.2 too, so whichever of them is carrying the words is
      // the one that gets flagged.
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
#   ⚠ AND THE OPACITY IT ASKS ABOUT IS THE EFFECTIVE ONE (413b). The first
#   draft read the element's own value, on the premise that a wrapper at 20%
#   whose child is at 100% is not hiding that child. That premise is false for
#   opacity, which composites the entire subtree: the child IS at 20% on the
#   screen and reports 1 to the sampler, so neither was ever flagged. The
#   value is the product of the element's own and every ancestor's now, so a
#   wrapper at 0 with its words in a child is caught on the child.
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

    # And the saved mark, caught PART OF THE WAY THROUGH ITS 400ms draw rather
    # than settled: a picture of a finished tick is a picture of a tick, and
    # proves nothing about the drawing. A third move, then a crop of the line
    # the mark sits on, 200ms in.
    page.wait_for_timeout(700)
    page.click('.registration-flow form button[type="submit"]')
    page.wait_for_timeout(200)
    mark = page.query_selector('.draw-in')
    if mark:
        box = mark.bounding_box()
        page.screenshot(
            path=str(OUT / "success-mark-1280.png"),
            clip={
                "x": max(0, box["x"] - 30),
                "y": max(0, box["y"] - 18),
                "width": 460,
                "height": 52,
            },
        )
    else:
        page.screenshot(path=str(OUT / "success-mark-1280.png"))

    # ⚠ WAVE 413b: AND THE MARK IT JUST DREW DREW ALL OF ITSELF.
    #
    # `.draw-in` needs a dash at least as long as the path it is running down.
    # Wave 413 wrote 48 as a constant and called it comfortably long; Lucide
    # 0.575's `shield-check` outer path is 58.75 user units, so the stroke
    # covered 0 to 48 and the last 10.75 stayed a permanent gap. The dash is
    # measured per shape now (src/hooks/use-draw-mark.ts), and this is the
    # arm that says so: every shape's own length against its own dasharray,
    # read off the glyph the flow has this second finished drawing.
    drawn = page.evaluate(
        """
        () => [...document.querySelectorAll('.draw-in')].flatMap((mark) =>
          [...mark.querySelectorAll('path, circle, polyline, line, polygon, rect, ellipse')]
            .map((shape) => ({
              glyph: mark.getAttribute('class').split(/\\s+/).find((c) => c.startsWith('lucide-')) || '(unnamed)',
              length: Math.round(shape.getTotalLength() * 100) / 100,
              dash: parseFloat(getComputedStyle(shape).strokeDasharray) || 0,
            })),
        )
        """
    )
    for shape in drawn:
        print(
            f"draw-in: {shape['glyph']} path length {shape['length']} "
            f"against a dash of {shape['dash']}"
        )
        if shape["dash"] < shape["length"]:
            failures.append(
                f"{where}: a `.draw-in` shape on {shape['glyph']} has a dash of "
                f"{shape['dash']} against a path of {shape['length']}. The stroke "
                f"stops {round(shape['length'] - shape['dash'], 2)} units short and "
                f"the gap never closes: the mark ends up permanently unfinished."
            )
    if not drawn:
        failures.append(
            f"{where}: no `.draw-in` shape was on the page after the save, so the "
            f"self-drawing mark was not measured."
        )

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

    # ⚠ WAVE 413b: AND NOTHING IN THE BAR IS REACHABLE BEHIND AN OPEN DRAWER.
    #
    # The backdrop shipped at z-40 under a z-50 header, so the top of the
    # screen stayed undimmed white with a live logo link in it while
    # everything below was at 40 per cent: the one thing on the page a pointer
    # could still reach behind an open menu. The geometry assertion below
    # measures the backdrop's BOX and cannot see a z-order, so this asks the
    # browser what is actually on top, across the whole width of the bar.
    #
    # The panel counts as a pass as well as the backdrop: at 390 the panel
    # covers the right two thirds of the bar, including its centre point, and
    # a point under the panel is not a point behind the drawer. What must
    # never come back is anything inside <header>.
    reach = page.evaluate(
        """
        () => {
          const header = document.querySelector('header');
          const logo = header.querySelector('a');
          const box = header.getBoundingClientRect();
          const classify = (x, y) => {
            const el = document.elementFromPoint(x, y);
            if (!el) return 'nothing';
            if (el.closest('.drawer-scrim')) return 'backdrop';
            if (el.closest('.drawer-panel')) return 'panel';
            if (el.closest('header')) return 'HEADER';
            return el.tagName.toLowerCase();
          };
          const y = box.top + box.height / 2;
          const across = [];
          for (let i = 0; i <= 10; i += 1) {
            const x = box.left + (box.width - 1) * (i / 10);
            across.push(classify(Math.max(1, Math.min(innerWidth - 1, x)), y));
          }
          const mark = logo.getBoundingClientRect();
          return {
            across,
            centre: classify(box.left + box.width / 2, y),
            logo: classify(mark.left + mark.width / 2, mark.top + mark.height / 2),
          };
        }
        """
    )
    print(
        f"drawer, what is on top of the bar: centre={reach['centre']}, "
        f"the logo link's own box={reach['logo']}, across the bar={reach['across']}"
    )
    if "HEADER" in reach["across"] or reach["logo"] == "HEADER":
        failures.append(
            f"{where}: part of the header is still the topmost element with the drawer "
            f"open ({reach['across']}, the logo's own box resolves to {reach['logo']}). "
            f"The bar is not dimmed and its logo is a live press target behind a modal "
            f"menu, which sends a visitor off the page they were reading."
        )
    if "backdrop" not in reach["across"]:
        failures.append(
            f"{where}: the backdrop is not the topmost element anywhere across the bar "
            f"({reach['across']}), so nothing here proves it covers the header at all."
        )

    controls = page.evaluate(
        """
        () => {
          const trigger = document.querySelector('header button[aria-expanded]');
          const id = trigger ? trigger.getAttribute('aria-controls') : null;
          return {
            id,
            target: id ? !!document.getElementById(id) : false,
            isPanel: id
              ? !!(document.getElementById(id) || {}).classList?.contains('drawer-panel')
              : false,
            scrimTag: (document.querySelector('.drawer-scrim') || {}).tagName || null,
          };
        }
        """
    )
    print(f"drawer trigger: aria-controls={controls}")
    if not controls["id"] or not controls["target"] or not controls["isPanel"]:
        failures.append(
            f"{where}: the drawer trigger's aria-controls is {controls['id']!r} and does "
            f"not resolve to the drawer panel ({controls})."
        )
    if controls["scrimTag"] != "DIV":
        failures.append(
            f"{where}: the backdrop is a <{controls['scrimTag']}>. A focusable element "
            f"inside an aria-hidden subtree is the shape axe returns as incomplete; a "
            f"div with an onClick says the same thing to a pointer and nothing to the "
            f"accessibility tree."
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


# ---------------------------------------------------------------------------
# (g) WAVE 413b: AN IMAGE NEVER FADES PAST ITS OWN OPACITY.
#
# Wave 413 shipped the photograph fade as a keyframe animation from opacity 0
# to opacity 1. A running animation outranks every normal author declaration,
# so for the 350ms it was running the element's own Tailwind opacity utility
# was ignored, and the four decorative washes on this site (the home hero's
# ground at 7%, the partner page's hero visual at 20 and 32%, the platform
# portal art at 25%, the partners hub band at 70%) each ramped to FULL
# STRENGTH and then snapped back down when the animation ended. On the home
# page that is a full-bleed street photograph at 100% behind the headline, on
# the page wave 412 existed to lighten.
#
# NEITHER GATE COULD SEE IT. scripts/wave412-screenshots.py shoots a settled
# page, and everything above here reads a settled page too. The only way to
# catch it is to WATCH, so this samples the computed opacity of every image
# the fade touches every 16ms from the first byte of the navigation, and
# compares the highest value it ever saw against the value the image rests at.
#
# ⚠ THE RACE HAS TO BE FORCED, NOT HOPED FOR. On a local server serving a
# local build the hero photographs are decoded before the bundle has even
# hydrated: they are `complete`, `ImageFade` never touches them, and the probe
# reports a clean run having measured nothing. That is exactly why wave 413's
# own gate came back green over this defect. So every image response is PARKED
# UNANSWERED until `img[data-img="pending"]` is attached, which is the
# observable fact that `ImageFade` has run, and only then released. That puts
# every image on the page behind the script that fades it, every time.
#
# ⚠ WAVE 414, rel413b MIN-4: this comment used to describe a throttled
# connection and an `IMAGE_HOLD_MS` constant. Neither has ever existed in this
# file. The parking is what is implemented, it is better than either, and the
# comment now says what the code does.
IMAGE_WATCH = """
(() => {
  // Parallel arrays rather than a Map: the records have to come back over the
  // wire and the elements have to stay on this side to be re-read afterwards.
  window.__imgWatch = [];
  window.__imgEls = [];
  window.__imgLastChange = performance.now();
  const seen = new WeakMap();

  const sample = () => {
    const now = performance.now();
    for (const img of document.querySelectorAll('img')) {
      const state = img.getAttribute('data-img');
      let record = seen.get(img);
      if (!record) {
        // Only an image the fade actually touched is this probe's business.
        // Everything else never had an attribute and never had a fade.
        if (!state) continue;
        record = {
          src: (img.getAttribute('src') || '').split('/').pop(),
          cls: String(img.className || '').slice(0, 90),
          max: 0,
          last: 0,
          samples: 0,
          fadedAt: 0,
          pending: true,
          faded: false,
        };
        seen.set(img, record);
        window.__imgWatch.push(record);
        window.__imgEls.push(img);
        window.__imgLastChange = now;
      }
      const opacity = parseFloat(getComputedStyle(img).opacity);
      if (!Number.isFinite(opacity)) continue;
      if (Math.abs(opacity - record.last) > 0.0005) window.__imgLastChange = now;
      if (opacity > record.max) record.max = opacity;
      record.last = opacity;
      record.samples += 1;
      record.pending = state === 'pending';
      if (state === 'in' && !record.faded) {
        record.faded = true;
        record.fadedAt = Math.round(now);
      }
    }
  };

  window.__imgTimer = setInterval(sample, 16);
  sample();
})();
"""

# Scroll the whole page so the `loading="lazy"` images below the fold are
# fetched too: an image that is never requested never fades, and two of the
# four washes this arm exists for (the platform portal art, the partners hub
# band) are below the first screen.
IMAGE_SCROLL = """
async () => {
  const step = Math.round(innerHeight * 0.75);
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  scrollTo(0, 0);
}
"""

# The four routes carrying a decorative wash. The fix names / and
# /partner-with-investor; /platform and /partners are here because the other
# two of the four images live on them and a number that is not measured is a
# number that is asserted.
IMAGE_WATCH_PAGES = ["/", "/partner-with-investor", "/platform", "/partners"]

# How far above its resting value an image may ever be sampled. 0.01 is a
# hundredth of the opacity range, well under what any screen can show and two
# orders of magnitude under the 0.93 the home hero's wash was overshooting by
# before this fix.
IMAGE_OVERSHOOT = 0.01

# THE FOUR DECORATIVE WASHES, BY THE OPACITY THEY REST AT, AND THE ROUTE EACH
# ONE IS ON. Named by opacity rather than by filename because three of the
# four share a file with a full-strength copy of themselves elsewhere on the
# same page, and because the number is the thing being asserted: an assertion
# that the home hero's ground rests at 0.07 IS the assertion about the defect.
# If any one of these is not observed fading, the probe failed to measure the
# thing it exists for and says so rather than passing.
IMAGE_GLOB = "**/*.{png,jpg,jpeg,webp,svg,gif,avif}"

REQUIRED_WASH = {
    "/": ("the home hero's ground", 0.07),
    "/partner-with-investor": ("the partner page's hero visual", 0.32),
    "/platform": ("the platform portal art", 0.25),
    "/partners": ("the partners hub band", 0.70),
}

# No image has changed opacity for this long, so nothing is still on its way
# in. Generous, because the scroll asks for the lazy images below the fold
# after everything else has settled and they answer in their own time.
QUIET_AFTER_MS = 1500


def image_fade_probe(browser, base: str, failures: list[str]) -> None:
    """(g) No image ever fades past the opacity it is meant to rest at."""
    for path in IMAGE_WATCH_PAGES:
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        page.add_init_script(IMAGE_WATCH)

        where = f"image fade probe {path} @ 1280"

        # THE GATE. Every image request is caught and PARKED, unanswered,
        # until the probe lets it go; the handler only appends, so it never
        # blocks Playwright's dispatcher the way a sleeping one does. Held in
        # the browser rather than at the server on purpose: a server that
        # sleeps on an image response holds a socket, six held sockets starve
        # the bundle that has to run before anything can be faded, and the
        # home page came back with nought images touched for exactly that
        # reason.
        held = []
        page.route(IMAGE_GLOB, lambda route: held.append(route))

        try:
            page.goto(f"{base}{path}", wait_until="domcontentloaded")
            # The observable fact that `ImageFade` has run and found something
            # to fade. Everything past here is the fade itself.
            page.wait_for_selector('img[data-img="pending"]', state="attached", timeout=20000)
        except Exception as error:
            failures.append(
                f"{where}: no image was ever marked pending, so ImageFade either did "
                f"not run or found nothing to fade behind the gate ({error})."
            )
            page.close()
            context.close()
            continue

        # Open it, and only then take the interception off: `unroute` discards
        # the parked routes, so releasing has to come first or every one of
        # them comes back invalid.
        released = len(held)
        for route in held:
            try:
                route.continue_()
            except Exception:
                released -= 1
        page.unroute(IMAGE_GLOB)
        print(f"image fade {path}: {released} image request(s) held until ImageFade had run")

        # Every 16ms from the navigation, for the 1200ms the fix names and
        # then until the page goes quiet: an image still arriving at 1200ms
        # has not finished the thing being measured. The scroll in the middle
        # is what fetches the `loading="lazy"` images below the fold, two of
        # which are among the four washes this arm exists for.
        page.wait_for_timeout(1200)
        page.wait_for_load_state("load")
        page.evaluate(IMAGE_SCROLL)
        try:
            page.wait_for_function(
                f"() => performance.now() - window.__imgLastChange > {QUIET_AFTER_MS}",
                timeout=40000,
            )
        except Exception:
            failures.append(
                f"{where}: the opacity sampler never went quiet, so nothing here was "
                f"measured. A probe that times out proves nothing."
            )
            page.close()
            context.close()
            continue

        watched = page.evaluate("() => window.__imgWatch")
        resting = page.evaluate(
            "() => window.__imgEls.map((el) => parseFloat(getComputedStyle(el).opacity))"
        )
        page.close()
        context.close()

        faded = [(r, rest) for r, rest in zip(watched, resting) if r["faded"]]
        never = [r for r in watched if not r["faded"]]
        print(
            f"image fade {path}: {len(watched)} image(s) touched, {len(faded)} faded, "
            f"{len(never)} never requested (lazy, out of view)"
        )
        for record, rest in faded:
            print(
                f"    {record['src']:<34} resting {rest:.3f} max {record['max']:.3f} "
                f"final {record['last']:.3f} faded at {record['fadedAt']}ms "
                f"over {record['samples']} samples"
            )
            if record["max"] > rest + IMAGE_OVERSHOOT:
                failures.append(
                    f"{where}: {record['src']} was sampled at opacity "
                    f"{record['max']:.3f} on its way in and rests at {rest:.3f}. An "
                    f"image that fades past its own opacity darkens the page for as "
                    f"long as it takes, which is the wave 413 defect this arm exists "
                    f"to catch. Class: {record['cls']}"
                )
            if abs(record["last"] - rest) > 0.001:
                failures.append(
                    f"{where}: {record['src']} ended the fade at {record['last']:.3f} "
                    f"and rests at {rest:.3f}. The fade has to land on the element's "
                    f"own opacity, not near it."
                )

        if not faded:
            failures.append(
                f"{where}: not one image on this route was seen to fade, so this "
                f"probe measured nothing, even with {released} image request(s) held "
                f"until after ImageFade had run."
            )

        wash_name, wash_opacity = REQUIRED_WASH[path]
        if not any(abs(rest - wash_opacity) < 0.005 for _, rest in faded):
            failures.append(
                f"{where}: {wash_name} rests at {wash_opacity} and was never seen to "
                f"fade, so the image the whole of probe (g) exists for was not "
                f"measured on this run. A green result that skipped the defect is "
                f"how wave 413 shipped it."
            )


# ---------------------------------------------------------------------------
# (h) The two glyphs that draw themselves, measured.
#
# The fallback in styles.css has to be at least as long as the longest path in
# either of them, because it is what a glyph the hook never reaches draws
# with. Both are on the home page, so both are measurable without exercising a
# form: `shield-check` in the platform band and `hand-heart` in the roles
# band, and Lucide stamps each glyph with its own `lucide-<name>` class.
DRAW_FALLBACK = 64

DRAWN_GLYPHS = ["lucide-shield-check", "lucide-hand-heart"]


def draw_mark_probe(browser, base: str, failures: list[str]) -> None:
    """(h) The dash the marks fall back on is longer than the paths they draw."""
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(f"{base}/", wait_until="networkidle")
    page.wait_for_timeout(300)
    where = "draw mark probe / @ 1280"

    lengths = page.evaluate(
        """
        (glyphs) => {
          const out = {};
          for (const glyph of glyphs) {
            const mark = document.querySelector('.' + glyph);
            if (!mark) { out[glyph] = null; continue; }
            const shapes = [...mark.querySelectorAll(
              'path, circle, polyline, line, polygon, rect, ellipse',
            )];
            out[glyph] = shapes.map(
              (shape) => Math.round(shape.getTotalLength() * 100) / 100,
            );
          }
          return out;
        }
        """,
        DRAWN_GLYPHS,
    )
    page.close()

    for glyph, measured in lengths.items():
        if measured is None:
            failures.append(
                f"{where}: {glyph} is not on the home page any more, so the dash "
                f"this site draws it with was not measured."
            )
            continue
        longest = max(measured) if measured else 0
        print(
            f"{glyph}: {len(measured)} path(s), longest {longest}, "
            f"all {measured}, fallback dash {DRAW_FALLBACK}"
        )
        if longest > DRAW_FALLBACK:
            failures.append(
                f"{where}: {glyph}'s longest path is {longest} against a fallback "
                f"dash of {DRAW_FALLBACK}. A dash shorter than the path leaves a gap "
                f"the draw never closes, which is what `stroke-dasharray: 48` did to "
                f"shield-check for the whole of wave 413."
            )


# ---------------------------------------------------------------------------
# (i) The magic line's geometry.
#
# Wave 413 transitioned the line's `width` as well as its transform, which
# made it one of three layout-property transitions in a wave that claimed two.
# It is a 1px rule scaled on X now, which is the compositor's work rather than
# layout's, and is only correct if `scaleX(n)` really does measure n px
# against the link the line is under. So it is measured, at both bar heights,
# because the condense is the one thing that moves the list under it.
#
# AND IT HAS TO BE INSIDE THE BAR. It shipped at `bottom: -6px` measured
# against the full-height <ul>, which put it 5px BELOW the header's bottom
# rule, painting over page content at z-50. The per-link underline it replaces
# sat 8px inside the bar, because -6px measured against a min-h-11 LINK box in
# a 72px bar is 8px up from the bottom. So: 8px above the rule, at 72 and at
# 56, and never a negative number.
MAGIC_TOLERANCE_PX = 0.5
# 9 and not 8: the line sits 8px up from the LIST's bottom edge and the bar
# carries a 1px bottom rule below that, so measured against the header's own
# bottom it is 9. The figure is the same at 72px and at 56px, which is the
# whole point of measuring it against the list rather than against a link.
MAGIC_ABOVE_RULE_PX = 9
MAGIC_ABOVE_TOLERANCE_PX = 1.0


def magic_line_probe(browser, base: str, failures: list[str]) -> None:
    """(i) The line is the width of the link, at 72px and at 56px."""
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(f"{base}/about", wait_until="networkidle")
    page.wait_for_timeout(400)
    where = "magic line probe /about @ 1280"

    read = """
    () => {
      const line = document.querySelector('.nav-magic__line');
      const link = document.querySelector('[data-nav-link][data-nav-active="true"]');
      const header = document.querySelector('header');
      if (!line || !link || !header) return null;
      const l = line.getBoundingClientRect();
      const a = link.getBoundingClientRect();
      const h = header.getBoundingClientRect();
      return {
        line: Math.round(l.width * 100) / 100,
        link: Math.round(a.width * 100) / 100,
        height: Math.round(l.height * 100) / 100,
        bar: Math.round(h.height),
        // How far the line's bottom edge sits ABOVE the bar's bottom rule.
        above: Math.round((h.bottom - l.bottom) * 100) / 100,
      };
    }
    """

    for label, scroll in (("tall", 0), ("condensed", CONDENSE_SCROLL)):
        page.evaluate(f"() => scrollTo(0, {scroll})")
        page.wait_for_timeout(450)
        geometry = page.evaluate(read)
        if geometry is None:
            failures.append(
                f"{where}: there is no magic line under the active route ({label}), "
                f"so nothing here was measured."
            )
            continue
        print(
            f"magic line ({label}): bar {geometry['bar']}px, line {geometry['line']}px "
            f"against a link of {geometry['link']}px, {geometry['height']}px tall, "
            f"{geometry['above']}px above the bar's bottom rule"
        )
        if abs(geometry["line"] - geometry["link"]) > MAGIC_TOLERANCE_PX:
            failures.append(
                f"{where}: the line measures {geometry['line']}px against a link of "
                f"{geometry['link']}px with the bar at {geometry['bar']}px. A scaled "
                f"1px rule has to land on the link exactly or the underline is not "
                f"the underline of anything."
            )
        if abs(geometry["height"] - 2) > 0.01:
            failures.append(
                f"{where}: the line is {geometry['height']}px tall, not 2px. scaleX "
                f"must not be touching the height."
            )
        if abs(geometry["above"] - MAGIC_ABOVE_RULE_PX) > MAGIC_ABOVE_TOLERANCE_PX:
            failures.append(
                f"{where}: the line's bottom edge is {geometry['above']}px above the "
                f"bar's bottom rule with the bar at {geometry['bar']}px, against "
                f"{MAGIC_ABOVE_RULE_PX}px. A negative figure means it is hanging out of "
                f"the header and painting over the page at z-50."
            )


# ---------------------------------------------------------------------------
# (j) WAVE 413b: REDUCED MOTION, EXERCISED RATHER THAN READ.
#
# Probe (a) reads `document.getAnimations()` once, a second after load, on a
# page nobody has touched. That is a real check and it is worth having: it
# proves no looping or filled animation survives the preference. It is NOT the
# sentence the report used to put over it. A short unfilled entrance that
# leaked would have finished and left the list long before the read, and no
# hover, press, drawer, step or disclosure is ever triggered, so none of them
# was ever measured at all.
#
# So this does the things. Under `reduce`, on a real page: hover a card, press
# a button, open and close the drawer, take a registration step, open a
# disclosure. After each one it reads the computed transition-duration and
# animation-duration OF THE ELEMENT THAT MOVED and asserts both are at or
# under a frame, and then asserts the STATE that motion was carrying is there
# without it. The second half is the point of rule 4: flattening a duration is
# only acceptable because the state has another channel.
DURATIONS = """
(selector) => {
  const element = document.querySelector(selector);
  if (!element) return null;
  const style = getComputedStyle(element);
  const ms = (value) =>
    String(value)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => (part.endsWith('ms') ? parseFloat(part) : parseFloat(part) * 1000))
      .filter((n) => Number.isFinite(n));
  const all = [...ms(style.transitionDuration), ...ms(style.animationDuration)];
  return {
    transition: style.transitionDuration,
    animation: style.animationDuration,
    worst: all.length ? Math.max(...all) : 0,
  };
}
"""


def _reduced_durations(page, failures, where, selector, what):
    """Read what is declared on the element that just moved, and assert it."""
    read = page.evaluate(DURATIONS, selector)
    if read is None:
        failures.append(
            f"{where}: {what} is not on the page ({selector}), so nothing was measured "
            f"after exercising it."
        )
        return
    print(
        f"    reduce, {what}: transition {read['transition']} animation "
        f"{read['animation']}, worst {read['worst']}ms"
    )
    if read["worst"] > REDUCED_MAX_MS:
        failures.append(
            f"{where}: after exercising {what}, the element that moved still declares "
            f"{read['worst']}ms (transition {read['transition']}, animation "
            f"{read['animation']}) under prefers-reduced-motion: reduce."
        )


def reduced_exercise_probe(browser, base: str, failures: list[str]) -> None:
    """(j) Every interaction this wave added, exercised under `reduce`."""

    # ---- a card hovered and a button pressed, at 1280 ----------------------
    context = browser.new_context(
        viewport={"width": 1280, "height": 900}, reduced_motion="reduce"
    )
    page = context.new_page()
    page.goto(f"{base}/contact", wait_until="networkidle")
    page.wait_for_timeout(400)
    where = "reduced-motion exercise /contact @ 1280"

    card = page.locator(".panel").first
    if card.count() > 0:
        card.hover()
        page.wait_for_timeout(120)
        _reduced_durations(page, failures, where, ".panel", "a card on hover")
    else:
        failures.append(f"{where}: no `.panel` card to hover, so the lift was not measured.")

    button = page.locator("button.press, a.press").first
    if button.count() > 0:
        box = button.bounding_box()
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()
        page.wait_for_timeout(120)
        _reduced_durations(page, failures, where, "button.press, a.press", "a button pressed")
        # ⚠ RELEASED OFF THE CONTROL. Most `.press` controls on this site are
        # links, and pressing and releasing on one is a navigation: the first
        # draft of this measured the press, went to /register, and then
        # reported that /contact has no disclosure on it.
        page.mouse.move(2, 2)
        page.mouse.up()
        page.wait_for_timeout(120)
    else:
        failures.append(f"{where}: no `.press` control to press, so the press was not measured.")

    # ---- a disclosure opened -----------------------------------------------
    # Activated through the element's own `click()` rather than through the
    # mouse: the FAQ rows sit inside `Reveal`, which replaces them on mount,
    # and Playwright's stability check spends its whole timeout waiting for a
    # node that keeps being swapped underneath it. This is still a real
    # activation, and `<details>` toggles on it exactly as it does on a press.
    if "/contact" not in page.url:
        failures.append(
            f"{where}: the press navigated to {page.url}; the rest of this probe was "
            f"measuring the wrong page."
        )
    summary = page.locator("details summary").first
    if summary.count() > 0:
        page.evaluate(
            "() => { const s = document.querySelector('details summary');"
            " s.scrollIntoView({ block: 'center' }); s.click(); }"
        )
        page.wait_for_timeout(150)
        _reduced_durations(page, failures, where, "details", "a disclosure opened")
        opened = page.evaluate("() => !!document.querySelector('details[open]')")
        marker = page.evaluate(
            "() => { const d = document.querySelector('details[open]');"
            " return d ? d.innerText.trim().length > 0 : false; }"
        )
        print(f"    reduce, disclosure: open attribute={opened}, answer has text={marker}")
        if not opened:
            failures.append(
                f"{where}: the disclosure did not report `open` after being pressed. "
                f"Under reduced motion the row has no travel to say it opened, so the "
                f"attribute IS the state."
            )
        if not marker:
            failures.append(f"{where}: the opened disclosure has no answer text in it.")
    else:
        failures.append(f"{where}: no `<details>` disclosure on /contact to open.")

    page.close()
    context.close()

    # ---- the drawer, opened and closed, at 390 -----------------------------
    context = browser.new_context(
        viewport={"width": 390, "height": 844}, reduced_motion="reduce"
    )
    page = context.new_page()
    page.goto(f"{base}/about", wait_until="networkidle")
    page.wait_for_timeout(400)
    where = "reduced-motion exercise /about @ 390"

    page.click("button[aria-label='Open menu']")
    page.wait_for_timeout(200)
    _reduced_durations(page, failures, where, ".drawer-panel", "the drawer opened")
    _reduced_durations(page, failures, where, ".drawer-scrim", "the drawer's backdrop")
    opened = page.evaluate(
        """
        () => {
          const panel = document.querySelector('.drawer-panel');
          // The bar's own menu button. The drawer's Partners toggle also
          // carries aria-expanded, and it lives outside <header>.
          const trigger = document.querySelector('header button[aria-expanded]');
          return {
            panel: !!panel,
            modal: panel ? panel.getAttribute('aria-modal') : null,
            expanded: trigger ? trigger.getAttribute('aria-expanded') : null,
          };
        }
        """
    )
    print(f"    reduce, drawer: {opened}")
    if not opened["panel"] or opened["modal"] != "true":
        failures.append(
            f"{where}: the drawer did not open, or does not say it is modal, under "
            f"reduced motion ({opened}). The panel arriving with no slide has to leave "
            f"the state behind it."
        )
    if opened["expanded"] != "true":
        failures.append(
            f"{where}: the drawer trigger reports aria-expanded={opened['expanded']} "
            f"with the drawer open."
        )
    page.keyboard.press("Escape")
    page.wait_for_timeout(200)
    if page.evaluate("() => !!document.querySelector('.drawer-panel')"):
        failures.append(f"{where}: Escape did not close the drawer under reduced motion.")
    page.close()
    context.close()

    # ---- a registration step taken -----------------------------------------
    context = browser.new_context(
        viewport={"width": 1280, "height": 900}, reduced_motion="reduce"
    )
    page = context.new_page()
    stub_registration(page)
    page.goto(f"{base}/register/investor", wait_until="networkidle")
    page.wait_for_timeout(400)
    where = "reduced-motion exercise /register/investor @ 1280"

    page.fill("#email", "wave413b.probe@example.com")
    page.fill("#phone", "07700900123")
    page.fill("#password", "Probe413Pass1")
    page.fill("#confirmPassword", "Probe413Pass1")
    for box in page.query_selector_all('input[type="checkbox"]'):
        if box.is_visible() and not box.is_checked():
            box.check()
    page.click('button[type="submit"]')

    try:
        page.wait_for_selector('[role="progressbar"]', timeout=10000)
    except Exception:
        failures.append(f"{where}: the survey stage never appeared, so no step was taken.")
        page.close()
        context.close()
        return

    before = page.evaluate("() => document.querySelector('[aria-live]').innerText.trim()")
    page.click('.registration-flow form button[type="submit"]')
    page.wait_for_timeout(200)
    _reduced_durations(page, failures, where, ".registration-step", "a step taken")
    _reduced_durations(page, failures, where, ".registration-progress", "the progress bar")
    after = page.evaluate("() => document.querySelector('[aria-live]').innerText.trim()")
    valuenow = page.evaluate(
        "() => document.querySelector('[role=\"progressbar\"]').getAttribute('aria-valuetext')"
    )
    print(f'    reduce, step: aria-live "{before}" -> "{after}", progress "{valuenow}"')
    if before == after or not after:
        failures.append(
            f"{where}: the step's aria-live counter reads \"{after}\" after the move and "
            f"\"{before}\" before it. Under reduced motion there is no slide, so the "
            f"announcement IS how a visitor is told they moved."
        )
    if not valuenow:
        failures.append(f"{where}: the progress bar carries no aria-valuetext after the step.")
    page.close()
    context.close()


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
                        f"    wash: effective opacity {entry['opacity']} "
                        f"(its own {entry['own']}) on {entry['target']} "
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
        image_fade_probe(browser, base, failures)
        draw_mark_probe(browser, base, failures)
        magic_line_probe(browser, base, failures)
        reduced_exercise_probe(browser, base, failures)
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
