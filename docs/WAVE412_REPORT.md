# Wave 412 report: the light and bright site

**Branch** `feat/wave412-light-and-bright`, cut from `origin/main` `9adb0bb`, built in the
worktree `C:\Users\Israel\Documents\repos\iigs-uc412`. The repository's own checkout on
`main` was not touched; every git command in this wave ran against the worktree.

**Number claimed** by pushing an empty commit (`f941d01`) before the first edit. 412 was
the lowest free number when claimed: the site remote carried `feat/wave411-whatsapp-invite`
and nothing higher, and the platform remote (`iip-land-night`, fetched first) carried 407
to 410. No collision.

---

## 1. What the director asked for, and what "light" means here

Callum, 18 September 2026, relaying his director:

> "I've been informed by my director that the site is much too dark (the navy everywhere
> makes it too dark throughout) and needs to instead be much lighter, and brighter. With
> this I want you to take the initiative and review and make your own changes and
> implementations to improve areas, but most of all to specifically make it lighter and
> brighter and more friendly/user friendly through out."

The site was navy by default on every route. **Measured before this wave, 42.06% of the
pixels on an average page were dark** (relative luminance under 0.2), and on `/platform`
at 1280 it was 63.95%. The director was describing something real and measurable.

"Light" here is four decisions, not a filter:

1. **The page ground is WHITE.** Bands alternate white and cream for rhythm.
2. **Navy is INK and STRUCTURE**: headings, body text, rules, the logo's neutral parts.
3. **Darkness survives in two NAVY ISLANDS only**, where it does a job: the demand map's
   plate, whose glow is light added to darkness, and the crisis card, which has to be the
   one block a person in trouble cannot miss. At most one inside `<main>` per route.
4. **Every pair is measured.** Inverting a palette is exactly the operation that turns
   passing text into failing text, so every page is run through axe-core on every build.

After this wave the average page is **7.55% dark**, and the page's own ground, with
photographs and the map field masked out, is **3.75%**. Re-measured at the 412b head
those are **7.52%** and **3.70%**; the per-route table in section 3 carries the 412b
figures in its "after" columns and section 12 explains every one that moved.

---

## 2. Step 0: the tokens

`src/styles.css`, `@theme`. Semantic names the light site reads by JOB rather than by
shade, so a component is correct on the light ground without knowing which navy or slate
sits behind the name.

| Token | Value | What it is for |
|---|---|---|
| `--color-page` | `#ffffff` | THE PAGE GROUND |
| `--color-page-alt` | `#f7f1e6` | the cream alternating band (the same value as `--color-mist-bg`) |
| `--color-header` | `rgb(255 255 255 / 0.92)` | the sticky bar, blurred |
| `--color-ink` | `#00112b` | navy-900 as type |
| `--color-ink-muted` | `#4e5a6e` | body copy on the cream |
| `--color-ink-soft` | `#647289` | small caps, captions, body on a white card |
| `--color-rule` | slate at 20% | the hairline that rules the whole site |
| `--color-tint-orange` | orange-500 at 12% | the plate behind a human icon glyph |
| `--color-tint-teal` | teal-600 at 12% | the plate behind a data icon glyph |

`--slate-20` is now an alias of `--color-rule` rather than a second value beside it, so
the two cannot drift apart.

The whole shadcn `:root` layer was re-pointed: `--background` white, `--foreground`
navy-900, `--card` and `--popover` white, `--muted` the cream, `--muted-foreground`
ink-muted, `--border` and `--input` the rule colour, `--ring` teal-600, `--secondary` the
teal tint with a teal-600 foreground, `--accent` teal-600, and the sidebar block with it.

Two of those are decisions rather than translations:

- **`--primary` follows orange-600, not orange-500.** On the dark site the primary fill
  was 500 with NAVY ink on it, because white on 500 is only 4.23:1. On a white page a 500
  fill is also a weak edge against the ground. 600 with white on it is 5.34:1, which is
  the pairing the brand `primary` button already used, so the library components and the
  brand button now agree instead of differing by one step.
- **`--destructive` is `#c92a2a`, the light value, and it is now the only value.** The
  note in the stylesheet arguing that one red could not serve both grounds was written
  when the forms lived on navy. The forms are on white and cream; the window that was
  empty no longer has to be straddled.

`html` and `body` are white with navy ink and a **1.65 line height**, set once on `body`
so every explicit `leading-*` on a headline or a caption still wins. `panel` became the
white card (rule border, `--shadow-card`, a 2px lift on hover); `panel-deep` became the
cream card. The focus ring is teal-600 site-wide, with teal-400 restored inside an island.

**Removed as dark-only, with nothing needing a light equivalent:** `--glow-headline` (a
44px black halo behind the hero letterforms, which on a white page is a smudge),
`--gradient-teal-wash`, the `teal-wash` utility and `.image-navy-scrim`. `.hero-ground`
was inverted from a navy veil to a white one; the photograph and its 7% opacity are
unchanged.

---

## 3. Step 1: the safety net, and what it cost

The `.section-light` remap block was the site's existing, measured translation of the dark
palette onto the light one. Every selector in it gained `body` as an alternative scope
(`:is(body, .section-light)`), so the whole site read light in one commit. Specificity was
unchanged, so nothing in the cascade below it reordered.

The chrome was done by hand in the same commit, because the remap was never designed for
it: a white header at 92% with a blur and a permanent rule, navy nav labels, the active
route in orange-700 over an orange-500 underline, the mega menu on white, the logo on its
`on-cream` variant everywhere, `theme-color` following the header ground, and a cream
footer whose crisis card became a declared island.

**Before and after, per route.** Both builds were measured by the same code
(`scripts/wave412-screenshots.py`, `--baseline` against a build of `origin/main`), because
a before number measured by different code than the after number is not a comparison.

**The "after" columns are the FINAL RUN of the 412b pass**, which is the head this
branch ends on; where a figure moved from the wave 412 run it moved because 412b changed
something on that page, and section 12 names each one. The two rightmost columns are new
in 412b: axe's INCOMPLETE colour-contrast nodes per shot, every one of them measured off
the shot's own pixels (section 12.4), and how many of those could not be measured.

| Route | Width | dark before | dark after | ground before | ground after | islands | axe before | axe after | incomplete | unmeasured |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 1280 | 63.55% | **23.46%** | 48.48% | **9.07%** | 1 | 6 | **0** | 20 | 0 |
| `/` | 390 | 56.55% | **22.19%** | 37.26% | **7.42%** | 1 | 6 | **0** | 20 | 0 |
| `/about` | 1280 | 39.17% | **4.13%** | 50.19% | **2.68%** | 0 | 5 | **0** | 25 | 0 |
| `/about` | 390 | 30.80% | **5.73%** | 34.76% | **2.65%** | 0 | 5 | **0** | 25 | 0 |
| `/platform` | 1280 | 63.95% | **4.53%** | 68.98% | **3.10%** | 0 | 7 | **0** | 49 | 0 |
| `/platform` | 390 | 63.49% | **6.02%** | 62.00% | **3.72%** | 0 | 7 | **0** | 50 | 0 |
| `/the-problem` | 1280 | 41.20% | **4.67%** | 40.43% | **2.92%** | 0 | 5 | **0** | 0 | 0 |
| `/the-problem` | 390 | 33.84% | **6.32%** | 33.79% | **3.01%** | 0 | 5 | **0** | 0 | 0 |
| `/solutions` | 1280 | 39.61% | **5.68%** | 44.98% | **3.27%** | 0 | 10 | **0** | 20 | 0 |
| `/solutions` | 390 | 33.18% | **7.13%** | 35.44% | **4.32%** | 0 | 10 | **0** | 20 | 0 |
| `/partners` | 1280 | 46.67% | **9.14%** | 47.56% | **4.29%** | 0 | 15 | **0** | 0 | 0 |
| `/partners` | 390 | 30.99% | **7.59%** | 30.82% | **5.04%** | 0 | 14 | **0** | 0 | 0 |
| `/contact` | 1280 | 31.66% | **6.45%** | 31.66% | **2.70%** | 1 | 7 | **0** | 0 | 0 |
| `/contact` | 390 | 56.00% | **10.06%** | 56.14% | **3.62%** | 1 | 7 | **0** | 0 | 0 |
| `/register` | 1280 | 58.47% | **3.55%** | 59.32% | **2.31%** | 0 | 5 | **0** | 2 | 0 |
| `/register` | 390 | 46.45% | **6.07%** | 46.40% | **2.66%** | 0 | 5 | **0** | 2 | 0 |
| `/register/investor` | 1280 | 60.55% | **4.46%** | 61.44% | **3.38%** | 0 | 5 | **0** | 0 | 0 |
| `/register/investor` | 390 | 43.14% | **7.04%** | 43.23% | **3.37%** | 0 | 5 | **0** | 0 | 0 |
| `/register/resident` | 1280 | 64.31% | **4.17%** | 65.29% | **3.17%** | 0 | 5 | **0** | 0 | 0 |
| `/register/resident` | 390 | 46.56% | **6.87%** | 46.65% | **3.49%** | 0 | 5 | **0** | 0 | 0 |
| `/partner-with-investor` | 1280 | 57.13% | **12.27%** | 61.97% | **4.73%** | 0 | 5 | **0** | 10 | 0 |
| `/partner-with-investor` | 390 | 49.67% | **10.51%** | 51.58% | **5.16%** | 0 | 5 | **0** | 12 | 0 |
| `/partner-with-local-authority` | 1280 | 57.77% | **11.55%** | 63.44% | **4.57%** | 0 | 5 | **0** | 10 | 0 |
| `/partner-with-local-authority` | 390 | 49.76% | **10.16%** | 52.38% | **5.23%** | 0 | 5 | **0** | 13 | 0 |
| `/legal` | 1280 | 5.81% | **2.94%** | 5.11% | **2.13%** | 0 | 5 | **0** | 0 | 0 |
| `/legal` | 390 | 6.34% | **5.37%** | 5.96% | **2.98%** | 0 | 5 | **0** | 0 | 0 |
| the 404 route | 1280 | 0.25% | **0.63%** | 0.25% | **0.63%** | 0 | 0 | **0** | 0 | 0 |
| the 404 route | 390 | 0.80% | **1.95%** | 0.80% | **1.95%** | 0 | 0 | **0** | 0 | 0 |

**Mean across 28 shots: dark 42.06% to 7.52%; page ground 42.37% to 3.70%; axe serious/critical colour-contrast violations 169 to 0. 278 incomplete nodes, 278 measured off the pixels, 0 unmeasured.**

Two numbers in that table need explaining:

- **`/` cannot reach the 15% raw ceiling, and the arithmetic says so rather than a
  judgement.** The three approved hero photographs are lamplight and golden hour, and
  about 85% of their pixels are under the 0.2 line on their own. The site's OWN
  TERRACOTTA, `#c15f3c`, has a relative luminance of **0.1985**, so every pixel of a brand
  orange card counts as dark by two thousandths; teal-600 is 0.1500 and counts too.
  Deleting the demand map island outright still leaves the page near 17%, because removing
  area takes it out of the denominator as well. So the home page is listed in the gate's
  `RAW_CEILING` at the figure measured at this head, and the GROUND assertion still binds
  at 15% there (it measures 9.07%). That is the check being made sharper, not looser: the
  raw figure is still asserted, against a number it can only go down from. **In wave 412
  that ceiling was 0.240 and 0.230 against measurements of 23.55% and 22.19%, which is
  0.45 and 0.81 points of headroom in something this paragraph called the measured
  figure; rel412 MINOR 7 was right about that. It is 0.2357 and 0.2220 now. The home
  page's raw figure is the one measurement in this report that is not the same number
  twice: three runs of the same build at the 412b head read 23.56%, 23.56% and 23.46% at
  1280, and 22.19% every time at 390, because the page carries running animations and
  `settle()` cannot land them on the same frame twice. The ceiling is the HIGHEST of
  those readings, rounded up to the 0.01 of a point the gate prints, and the script says
  so where it is set. That is 0.01 of a point of slack against the worst reading, not
  0.45.**
- **`/404` went up, from 0.25% to 0.63%.** It went up because it now has words on it. See
  section 7.

---

## 4. Step 2: the honest pass, and then the deletion

A class that says `bg-navy-800` while it renders white is a lie the next reader pays for.
Every file was converted from the dark literals to the light semantics, in the brief's
order.

**Done. All of them.** `site-header.tsx`, `site-footer.tsx`, `hero.tsx`, `index.tsx`,
`mission-solution.tsx`, `demand-map.tsx`, `council-panel.tsx`, `registration-flow.tsx`,
`waitlist-form.tsx`, `consent-block.tsx`, `success-state.tsx`, `role-picker.tsx`,
`role-icon.tsx`, `register.$role.tsx`, `register.index.tsx`, `the-problem.tsx`,
`solutions.tsx`, `role-section.tsx`, `section-rail.tsx`, `partners.tsx`,
`partners-hub.tsx`, `partner-page.tsx`, `platform.tsx` and all nine of its components,
`about.tsx`, `director-card.tsx`, `group-diagram.tsx`, `contact.tsx`, `enquiry-form.tsx`,
`legal.tsx`, `page-shell.tsx`, and in `src/components/ui`: `button.tsx`, `reveal.tsx`,
`disclosure.tsx`, `empty-slot.tsx`, `live-window.tsx`, `logo-marquee.tsx`,
`process-rail.tsx`, `section-header.tsx`, `source-line.tsx`, `image-fill-headline.tsx`,
`pre-release-badge.tsx`. `home/site-footer.tsx` was converted too although nothing imports
it; **412b deleted it, which is what proposal 3 recommended. See section 12.6.**

**So the remap was deleted.** 502 lines of it, replaced by 219 that a reader can hold in
their head: the cream band, the two islands, the icon plates. Three things it had been
carrying moved to where they belong. Headings default to ink in the base layer. The card
lift moved into the `panel` utility. The island rules stand on their own selectors.

**Deleting it surfaced six places the substring rules had been quietly correcting**, every
one caught by the axe pass rather than by eye:

| Where | The pairing | Ratio | Fixed to |
|---|---|---|---|
| The pre-release badge, on EVERY page | teal-400 at 11px on the cream | 2.14:1 | teal-600, 4.67:1 |
| `/about` section eyebrows and chain numerals | orange-500 on the cream | 3.75:1 | orange-700, 5.78:1 |
| `/platform` chapter eyebrow | orange-500 at 10px on white | 4.22:1 | orange-700, 6.50:1 |
| `/partners` card detail lines | slate on the cream | 4.33:1 | ink-muted, 6.20:1 |
| `/solutions` step numerals and CTA, `/contact` chips, `/partners` stage nodes | navy on a teal-600 fill | 3.58:1 and 3.75:1 | white, 5.25:1 |
| `/about` and `/platform` chapter discs | white on an orange-500 fill at 10px | 4.22:1 | orange-600 fill, 5.34:1 |

**Verified against the shots taken immediately before the deletion.** 26 of 28 differ by
under 1% of sampled pixels, all of it the corrections above. The two that differ more are
`/about`, where the accountable-chain cards are cream instead of white because
`panel-deep` can finally win over a remap that used to force them white, and `/partners`,
2px shorter from a line-height change.

**The `rg` audit at the end.** Every remaining use is deliberate:

```
src/components/site-header.tsx:193   bg-orange-600 ... text-white   white on the orange feature block, 5.34:1
src/components/site-header.tsx:215   bg-ink ... hover:bg-navy-800   the navy button inside that block
src/components/ui/button.tsx:29      bg-orange-600 ... text-white   the primary fill, 5.34:1
src/routes/contact.tsx:230,233,240   border-navy-700 / text-mist / text-white
                                     inside the crisis island, written in the dark idiom on purpose
```

Plus one line in `mission-solution.tsx` that is a comment about the conversion.

**`text-page` is the escape hatch and it is documented.** Where a label sits on a filled
teal or orange plate it keeps white ink and says so with `text-page`, the same `#ffffff`
under a name the (now deleted) substring rule did not match. It is kept rather than
reverted to `text-white`, because the island rules still match on substrings and a white
label on a teal plate nested in an island would otherwise go to mist.

---

## 5. Step 3: the friendliness pass, each change with its reason

| Change | Reason |
|---|---|
| **Icon plates are a soft 12% tinted disc, not a 1px ring.** Orange tint under an orange-600 glyph for human icons, teal tint under a teal-600 glyph for data icons. | A hairline circle is the weakest mark a light page can carry, and it reads as engineering. The glyph now sits ON something. Measured: 4.60:1 and 4.46:1 on white, 4.11:1 and 3.97:1 on the cream, against a 3:1 graphic floor. |
| **The ten role tiles on `/register` are friendly cards.** White, rule, card shadow, lifting 2px into a deeper shadow. | They were translucent navy plates with a hairline. This is the page a resident reaches; a chooser should look like an invitation. |
| **The lift happens on FOCUS as well as hover**, on the role tiles and the hero tiles. | A tile that only answers to a mouse answers to half its visitors. This is the change in this wave I would keep if I could keep only one. |
| **The hero's ten role tiles became white cards** with the same treatment. | They were wire outlines on navy. Same argument, and it is the first screen. |
| **The FAQ rows on `/contact` are white with a hairline that deepens as the row opens.** | On the dark site the open state was a step up in navy. On a white page the equivalent of "a step up" is a step up in lift, because there is nowhere lighter to go. |
| **The mission panel's navy tile became a white card with a 4px orange top rule.** | It was there because a dark tile in a light grid is the highest-contrast thing on the band. It keeps that job and stops being the second island on a route that already spends its one on the map. |
| **The three demand-map figures are white cards on the cream with teal-600 numerals**, the emphasised one keeping its teal fill and white numeral. | Rule 9. Same three cards, same hierarchy, read the other way up. |
| **The terracotta stat card is kept as the one warm accent** on the mission band. | It is the 176,130 figure, the most human number on the page. Orange marks the human. |
| **The commissioning-council crests got a hairline under the white plate.** | The lane used to run on a navy band, where white alone was the separation. On a white page the plate and the ground are the same colour and a crest would float in nothing. |
| **Body copy moved to 1.65 line height**, site-wide, on `body`. | The cheapest friendliness on a page of institutional prose is air between the lines. It is a base value, so every explicit `leading-*` still wins. |
| **The empty "Section content slot" is a quiet cream dashed card**, not an outlined box. | An outlined box on a white page reads as something having gone wrong. This is an honest reserved space. |
| **The 404 and error pages are light**, through the re-pointed shadcn tokens. | They read `bg-background` and `text-foreground`, which are now white and navy. |
| **The header lost its `elementFromPoint` probe.** | It ran on every scroll frame to decide whether to draw a rule. The rule is permanent now, so the probe had nothing left to decide. |
| **The Zoopla credit takes a navy wordmark** derived from the supplied reversed one by `scripts/wave412-zoopla-ink.py`. | A white mark on a white page is an empty rectangle. See the proposals. |

---

## 6. Step 4: the `Reveal` defect

`Reveal` rendered `opacity: 0` in the markup and waited for an IntersectionObserver to say
otherwise. Three consequences, all observed rather than theorised:

1. **Without JavaScript the content was invisible.** The prerendered HTML carried the
   class, the class carried `opacity: 0`, and nothing was ever going to turn it back on.
2. **Landing mid-page showed nothing.** Read live at 1920 wide with the page scrolled by
   script, the whole problem section stayed blank for over a second, because the observer
   had not fired for an element that was already on screen when it mounted.
3. **There was no backstop.** If the observer never fired, that was the end of it.

The resting state is now VISIBLE and the JavaScript adds the hidden-then-rise state only
when it is about to animate:

| `data-revealed` | State |
|---|---|
| absent | visible. This is what the HTML ships, and what a visitor with no JavaScript keeps for good. |
| `"static"` | visible, and staying visible, with no animation at all. **Added in 412b.** Anything on screen at mount, and anything under reduced motion. |
| `"pending"` | hidden, about to rise. Set only from the effect, only for an element below the fold, only with motion allowed. |
| `"true"` | the animation, then visible. Only ever reached FROM `"pending"`. |

Anything already inside the viewport at mount stays visible. Anything still pending
**900ms** after mount reveals anyway. The animation is **8px over 350ms**, down from 16px
over 500ms.

⚠ **THE SENTENCE THAT USED TO BE HERE WAS WRONG, AND IT IS MAJOR 1 OF THE rel412
VERDICT.** It read: "The effect runs in a layout phase so the element is never shown and
then hidden." The layout phase closes the gap between React's commit and the next paint.
It cannot close the gap between the SERVER's paint and hydration, which on a static site
is the whole point of the static site. Wave 412 sent an already-visible element straight
to `"true"`, `"true"` carries `animation: rise-in ... both`, and the backwards fill of
that animation paints opacity 0 on its first frame. So a prerendered page painted its
first block, blinked it away at hydration, and faded it back in. `"static"` is the fix
and section 12.1 has the measurement.

**The invariant wave 413 must keep: no content is ever invisible without JavaScript.**
**And the one 412b adds beside it: animate only what this component itself hid.**

---

## 7. Three defects the gate found that were not this wave's

**`/contact` served a DUPLICATED DOCUMENT TAIL.** The prerender wrote the end of the
streamed document twice: the page closed properly with `</body></html>`, and a partial
second copy of the hydration payload followed it. A browser hoists everything after the
first `</html>` back into `<body>`, where the payload's own text renders as a visible line
of JavaScript and its unbreakable string pushes the document wider than the viewport.
Measured `scrollWidth` **674 against `innerWidth` 390**; `origin/main` measures 672 at the
same place. Trimmed in `scripts/pages-postbuild.mjs`. **This is a guard, not a cure**: the
bug is upstream in the prerender, it hit 1 of 29 pages on the build it was found on, and
it did NOT reproduce on the final build of this branch, so it is intermittent. If it
starts affecting many pages, chase it in the prerender rather than widening the guard.

**`/404` served a BLANK PAGE, and had done for as long as the postbuild has existed.**
`404.html` was a copy of `index.html`, "so deep links that were not prerendered still boot
the client router". It did not. The home page's prerendered markup ships with the home
route's dehydrated router state, and hydrating that against a URL the router has never
heard of throws `Invariant failed` before the first paint; React then unmounts the tree
and leaves **72 characters of `innerHTML`**. That is what the live site serves today for
every mistyped URL and every dead inbound link. It is a static page now, with no app
script to hydrate and nothing to throw, carrying the same markup, classes and words
`NotFoundComponent` renders. Every route on the site is prerendered, so the shell was not
buying a deep link anything.

**The 22 inherited typecheck errors are gone.** Twenty were two shapes in
`partner-page.tsx` and `about.tsx` (a record read with a dot instead of a bracket under
TS4111, and a `??` fallback still typed `undefined` under `noUncheckedIndexedAccess`); two
were the same dot-read in `vite.config.ts`. `bunx tsc --noEmit` now reports **0**, down
from 22 on `origin/main`.

---

## 8. The gate, measured in this worktree

Re-run in full at the 412b head. Where a number moved, it moved because 412b moved it.

| Gate | Command | Exit | Numbers |
|---|---|---|---|
| Lint, changed files | `bunx eslint` on all 51 lintable changed files | **0** | **0 errors**, 7 warnings (all `react-refresh/only-export-components`, all pre-existing patterns). 51 source files changed in all; `styles.css` is not linted by this config. 52 in wave 412, 51 now because 412b deleted `home/site-footer.tsx` |
| Lint, whole tree | `bunx eslint .` on an LF-normalised copy | 1 | **387 errors / 15 warnings**, against **515 / 15** on the same measurement of `origin/main`. Delta **128 errors better** |
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors**, against 22 inherited |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered**, 29 HTML files, plus the 404 the postbuild writes: 30 in `dist/client` |
| Prerender postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | base `/`, patched 0 files, **trimmed 1 duplicated tail** (`contact/index.html`, 531 characters). The bug is intermittent and upstream; it did not reproduce on the wave 412 final build and did on this one, which is section 7's point exactly |
| Screenshots and assertions | `python scripts/wave412-screenshots.py` | **0** | **28 shots, every assertion passed.** 278 axe INCOMPLETE colour-contrast nodes measured off the pixels, 0 unmeasured, none under its floor. The Reveal probe: minimum opacity **1.000** on `/about` and on `/partner-with-investor` |

The whole-tree lint improvement is the project's own `prettier` run over the 53 source
files this wave touched: the gate requires 0 errors on a changed file, and in a repository with
pre-existing formatting drift that means formatting it. No content was changed by it.

**The screenshot gate asserts, per page, per width:** no horizontal overflow; the body and
header grounds both above 0.8 relative luminance; at most one `.section-dark` inside
`<main>`; the raw dark-pixel share under 15% (or under the recorded ceiling on `/`, which
is the measured figure); the page's own ground under 15% dark; zero serious or critical
axe colour-contrast violations; **every axe INCOMPLETE colour-contrast node measured off
the shot's own pixels and at or above its floor (412b, section 12.4)**; and at least 60
characters of rendered text. That last one is trivial and it is what caught the blank
404: **a blank page is light, has no dark pixels, no overflow and no contrast violations,
and passes every other check here perfectly.** **And once per run: the Reveal probe
(412b, section 12.1).**

### Every pair this wave introduced or changed

Measured with the sRGB relative-luminance formula; the tint rows were read back off the
rendered pixels, because `color-mix(in oklab, X 12%, transparent)` composited over a
ground is not the same arithmetic as a 12% sRGB blend.

| Pair | Ratio | Floor it meets |
|---|---|---|
| ink `#00112b` on white | 18.83:1 | AA and AAA body |
| ink on cream `#f7f1e6` | 16.75:1 | AA and AAA body |
| ink-muted `#4e5a6e` on white | 6.97:1 | AA and AAA body |
| ink-muted on cream | 6.20:1 | AA and AAA body |
| ink-soft `#647289` on white | 4.87:1 | AA body. **Not used on the cream**, where it is 4.33:1 |
| teal-600 `#17796f` on white | 5.25:1 | AA body |
| teal-600 on cream | 4.67:1 | AA body |
| orange-700 `#9a4429` on white | 6.50:1 | AA body |
| orange-700 on cream | 5.78:1 | AA body |
| orange-500 `#c15f3c` on white | 4.23:1 | AA large text and the 3:1 graphic floor. Never small text |
| orange-500 on cream | 3.76:1 | The 3:1 graphic floor only |
| white on orange-600 `#ae4e30` | 5.34:1 | AA body. The primary button |
| white on teal-600 | 5.25:1 | AA body. Filled teal plates |
| white on destructive `#c92a2a` | 5.46:1 | AA body |
| destructive on white | 5.46:1 | AA body |
| destructive on cream | 4.85:1 | AA body |
| teal-600 focus ring on white | 5.25:1 | SC 1.4.11, floor 3:1 |
| teal-600 focus ring on cream | 4.67:1 | SC 1.4.11, floor 3:1 |
| orange-600 glyph on the 12% orange tint over white | 4.60:1 | SC 1.4.11, floor 3:1 |
| orange-600 glyph on the same tint over cream | 4.11:1 | SC 1.4.11, floor 3:1 |
| teal-600 glyph on the 12% teal tint over white | 4.46:1 | SC 1.4.11, floor 3:1 |
| teal-600 glyph on the same tint over cream | 3.97:1 | SC 1.4.11, floor 3:1 |
| ink on the 8% navy tint over white | 15.93:1 | AA and AAA |
| ink-muted on the 10% slate tint over white | 6.16:1 | AA and AAA |
| the rule `#647289` at 20% over white | luminance 0.766 | A hairline, not a boundary that has to be seen |
| white on navy-950 (inside an island) | 19.73:1 | AA and AAA |
| mist `#c6d2e4` on navy-950 (inside an island) | 12.92:1 | AA and AAA |
| orange-500 on navy-950 (inside an island) | 4.67:1 | AA body |
| teal-400 focus ring on navy-950 (inside an island) | 8.20:1 | SC 1.4.11, floor 3:1 |

### The canon checks

| Check | Result |
|---|---|
| `git diff origin/main...HEAD -- src/content` | **empty.** No user-facing string changed |
| New visible text | **none, and it was measured rather than read.** Both builds were served and `document.body.innerText` was diffed line by line for all fourteen routes. Across the whole site: **5 lines added, 6 removed.** They are listed below, and none of them is new copy |
| U+2014 on added lines | **23**, and **0 of them are new prose**. Every one is a pre-existing line re-emitted by `prettier --write`, checked mechanically: each was searched for verbatim in `origin/main` and found. **Wave 412 reported 24; the count at the 412b head is 23 and the verdict's count was the right one** |
| U+2013 on added lines | **1, not 0.** Wave 412 reported 0 and that was wrong. It is in `src/routes/platform.tsx`, an audience note reading "most people reading this are 35-60 and on a laptop" with an en dash between the figures. It is a pre-existing line re-emitted by `prettier --write`, present verbatim as a removed line in the same patch, so the substance of the claim holds: **no new prose on this branch carries a dash.** 412b's own added lines carry **0 U+2014 and 0 U+2013** |
| Hexes added to a component | **3 added lines under `src/` outside `styles.css` carry a hex, not 0.** Wave 412's claim was wrong and rel412 MINOR 4 is right. Two are this wave's: the `theme-color` meta in `__root.tsx`, which the brief itself ordered and which a meta attribute cannot express as a token, and a comment in `mission-solution.tsx` naming the retired amber `#ff7a29` it removed. The third is a pre-existing line on the terracotta stat tile re-emitted verbatim by `prettier`. **412b removed three colour literals from a component**: the flip tile's `text-[rgba(255,255,255,0.78)]`, `text-[#ffffff]` and `text-[rgba(255,255,255,0.88)]` are `text-page` now, and that was a contrast fix first (section 12.3) |

Every one of the eleven changed lines of rendered text:

| Route | Change | What it is |
|---|---|---|
| `/` | `0` becomes `176,130` | The count-up figure. On `origin/main` the counter was still reading zero when the page was captured, because its IntersectionObserver had not fired. It is the same sourced figure from `content/trust.ts`, arriving rather than not arriving. This is the step 4 backstop working |
| `/contact` | one line removed | The leaked hydration payload that the prerender's duplicated document tail was rendering as visible text on the page. Section 7 |
| the 404 route | four lines replace four | `404 / Page not found / The page you're looking for doesn't exist or has been moved. / Go home`, replacing the local server's own error page. These four strings are `NotFoundComponent`'s, copied verbatim from `src/routes/__root.tsx`. On `origin/main` this route rendered nothing at all: `404.html` is a copy of `index.html` there, and serving that app shell at an unknown URL throws `Invariant failed` and leaves 72 characters of `innerHTML`. Measured directly against that artefact before it was replaced |
| Tests or checks weakened | **none.** Two assertions were added to the gate (the page-ground share, and that a page has words on it), and the home page's raw ceiling is a recorded measurement it can only improve on |

---

## 9. Screenshots

`docs/screenshots/wave412/<route>-<width>.png`, 28 files, full page, written by
`scripts/wave412-screenshots.py` against the built `dist` served locally.

`/` `/about` `/platform` `/the-problem` `/solutions` `/partners` `/contact` `/register`
`/register/investor` `/register/resident` `/partner-with-investor`
`/partner-with-local-authority` `/legal`, and the 404 route, each at 1280 and at 390.

`/register/investor` and `/register/resident` stand for the ten role pages (one component,
one content file); `/partner-with-investor` and `/partner-with-local-authority` stand for
the ten partner pages the same way.

The baseline shots of `origin/main` are **not committed at this head, and were committed
when wave 412 closed.** rel412 MINOR 2 caught the sentence: `--baseline` had written 28
PNGs into `docs/screenshots/wave412-baseline/` and they went in with everything else.
412b deleted them, which is what the verdict recommended, so the sentence is true by
having been made true rather than by being rewritten around it. Their numbers are in the
table above and the code that took them is committed. Re-taking them is
`STATIC_BUILD=true bun run build` in a clean checkout of `main`, then
`python scripts/wave412-screenshots.py --baseline --build <that dist/client>`.

---

## 10. Proposals for Callum

Nothing below was built. Each has a recommended default.

1. **The hero photographs are what keeps `/` at 23% dark.** The three of them are
   lamplight and golden hour, and about 85% of their pixels are under the dark line on
   their own. They are the approved Mock-up 1 composition, so this is yours rather than
   mine. *Recommended default: leave them.* They are the warmest thing on the page and the
   measurement is a proxy for a complaint they are not the cause of. If the director still
   reads the page as dark, the cheapest change is a brighter third frame.
2. **The Zoopla wordmark is a derived mark.** Zoopla supplied a white-on-purple file and
   the site carried their reversed white-on-transparent one, which on a white page is an
   empty rectangle. `scripts/wave412-zoopla-ink.py` fills the same alpha mask with the ink
   token, which is a one-colour rendering of a one-colour mark. *Recommended default: ask
   Zoopla for their dark colourway, and their guidance on minimum size and clear space,
   which the note in `hero.tsx` has wanted since August.*
3. ~~**`src/components/home/site-footer.tsx` is dead code.**~~ **DONE IN 412b.** It was
   a second copy of the footer waiting to be edited by mistake, and it still carried a
   `teal-wash` class after that utility was deleted. Nothing imported it. Section 12.6.
4. **Four components under `src/components/platform/` and `src/components/solutions/` are
   also unreachable** (`ai-team`, `capability-rail`, `data-layers`, `delivery-spine`,
   `dot-meter`, `hero-window`, `match-panel`, `portal-tabs`, `property-report`,
   `role-section`, and `ui/live-window`, `ui/process-rail`, `ui/image-fill-headline`,
   `ui/disclosure`). `/platform` and `/solutions` build their own UI. All converted;
   none rendered. *Recommended default: decide in one go whether they are coming back,
   and delete the rest.*
5. **`delivery-spine.tsx` keeps a navy island** because it is a photograph with white type
   set over it. If it is ever rendered, it spends that route's one island. *Recommended
   default: fine, and note it if the page also wants the map.*
6. **The prerender's duplicated document tail is upstream.** The postbuild guard is one
   line and it works, but the bug is in the streaming prerender and it is intermittent.
   *Recommended default: report it to Lovable with the contact page as the reproduction.*
7. **CLAUDE.md sections 1, 3, 4, 5, 6 and 7 were left alone** and several are now stale:
   section 4 describes a homepage structure the site has moved past, and section 7's
   blocked list is from the original brief. *Recommended default: a wave to reconcile
   them, separate from a design wave.*

---

## 11. What waves 413 and 414 should know

**413, the motion wave.** `Reveal` is the foundation and it has TWO invariants now. The
first: NO CONTENT IS EVER INVISIBLE WITHOUT JAVASCRIPT. The resting state of `.reveal` is
visible, the JS adds `data-revealed="pending"` for one frame, and the 900ms failsafe
releases anything the observer missed. The second, which 412b had to add: ANIMATE ONLY
WHAT THE COMPONENT ITSELF HID. An element that was on screen at mount takes
`data-revealed="static"` and no animation, because `rise-in` is declared with `both` and
its backwards fill paints opacity 0 on the first frame, which on a prerendered page
blinks away content the visitor is already reading. `scripts/wave412-screenshots.py`
probes for exactly that and fails on it. Build on top of that rather than beside it. The motion that
already exists and is deliberate: the council marquee (with its WCAG 2.2.2 hover and
focus pause), the demand-map hub pulse, the mission panel's cascade turn, the `cta-pulse`
ring, and the registration step enter. Every one has a `prefers-reduced-motion` arm, and
the global backstop flattens `animation-duration`, which is why the marquee and the pulse
remove their animations outright rather than letting it snap them to their end state.

**414, the mobile wave.** Every route is already shot at 390 and asserted for horizontal
overflow, so the gate is there to inherit; extend `WIDTHS` in
`scripts/wave412-screenshots.py`. Two things it should know. The register pages carry
`overflow-x: clip` because the resident tile's halo scales past the viewport for four
seconds after mount, and `clip` rather than `hidden` because `hidden` would make them
scroll containers. And `.hero-band` sizes the hero off `100svh` from 768px up, so a short
laptop narrows the band rather than cropping anyone out of frame; that calculation is
documented in `styles.css` and should be re-derived rather than nudged.

**Both.** The gate is `scripts/wave412-screenshots.py` and it is cheap to run: one
foreground process, a build and about three minutes. Run it before you commit. If you add
a colour pair, measure it and put the ratio in your report; if you add a navy island, the
count assertion will tell you about the second one before Callum does.

---

## 12. Fix pass 412b: what the independent re-checker found, and what it cost

`rel412_verdict.md`, an independent re-checker reading the branch on 19 September 2026.
**HOLD, 3 MAJOR, 12 MINOR.** It recomputed 22 of the contrast ratios in section 8 and 10
of the accessibility rows in `CLAUDE.md` and every one matched; it holds because two small
pairings on the new light grounds measure below AA on this wave's own committed
screenshots, and because the rewritten `Reveal` re-hides content the prerendered HTML has
already painted.

Every figure below was measured in this pass. Nothing is carried forward.

### 12.1 MAJOR 1: an element that was never hidden is never animated

`src/components/ui/reveal.tsx` and the `reveal` utility in `src/styles.css`.

An element already inside the viewport at mount took `setState("true")`.
`data-revealed="true"` applies `animation: rise-in var(--duration-reveal)
var(--ease-out-soft) both`, and `@keyframes rise-in` begins at `opacity: 0`. With
`animation-fill-mode: both` the backwards fill applies, so the animation's first rendered
frame is opacity 0. On a prerendered route the browser paints the server's HTML first,
with no `data-revealed` attribute and therefore fully visible; the bundle then loads,
React hydrates, the layout effect runs, and the element restarts from opacity 0 and fades
up over 350ms plus up to `index * 60ms` held at zero by that same backwards fill.

Visible, blink, fade in. Section 6 of this report claimed the layout phase prevented it.
The layout phase closes the gap between React's commit and the next paint; it cannot
close the gap between the server's paint and hydration, which on a static site is the
whole point of the static site.

**The fix.** A fourth state, `"static"`, which deliberately matches no rule in the
utility: the same pixels, with nothing added. Anything on screen at mount takes it, and
so does anything under reduced motion. `"pending"` is now the only state that can become
`"true"`, so the component animates only what it itself hid. The 900ms backstop and the
no-JavaScript visibility are unchanged.

**The proof, and it is a Playwright probe in the gate rather than an argument.**
`reveal_probe()` in `scripts/wave412-screenshots.py` loads `/about` and
`/partner-with-investor` at 1280 with the network throttled through CDP so the gap
between the server's paint and hydration is real and wide, installs a sampler as an init
script BEFORE any of the page's own scripts, waits for hydration to actually land, and
records the computed opacity of the first `.reveal` inside `<main>` every 16ms. It
asserts the opacity never falls below 1 once it has been 1.

| Build | `/about` | `/partner-with-investor` |
|---|---|---|
| The wave 412 head, rebuilt with the defect put back | **min opacity 0.000**, falling at 5932ms with `data-revealed="true"` | **min opacity 0.000**, falling at 4051ms |
| This head | **min opacity 1.000**, states `(none)` then `static` | **min opacity 1.000**, same |

The probe also fails if hydration never lands inside its window, because a probe that
finishes before the bundle runs proves nothing. Its first draft did exactly that and
passed: throttled to 180 KB/s it was reading a page that had not hydrated yet, and the
final `data-revealed` was `(none)` on both routes. That is why the wait for hydration and
the `hydrated=yes` in its printed line are both in there.

### 12.2 MINOR 12, taken now rather than in 413: the markup ships the figure

`useCountUp` initialised `display` to 0, so the prerendered HTML carried `0` where the
home page's headline figure belongs and kept it for good without JavaScript. On a page
whose whole argument is figures that is not a missing animation, it is a WRONG FIGURE.

It initialises to `value` now. The server renders 176,130, the client hydrates onto the
same number, and the count is something the JavaScript ADDS: only for an element BELOW
THE FOLD, with motion allowed, under exactly the rule from 12.1. Rewinding a figure the
visitor is already reading back to zero in order to count it up again is the same blink
wearing a different hat.

No rendered string changes: the shot showed 176,130 before, through the backstop, and
shows it now because it was never anything else.

### 12.3 MAJOR 2: every small orange word on a light ground

`src/routes/platform.tsx`, the lease-comparison strip under `DifferenceStory`:
`text-[11px]` with `font-semibold text-orange-500`. orange-500 `#c15f3c` is 4.23:1 on
white and 3.76:1 on the cream, against the 4.5:1 floor 11px semibold answers to. Its teal
sibling two lines down was converted correctly in wave 412 and this one was missed.

Measured off the new `docs/screenshots/wave412/platform-1280.png` by the gate's own
incomplete-node reader: **orange-700 on rgb(255, 255, 255), 6.50:1**, against 6.50:1
computed. The teal sibling beside it reads 5.25:1.

Then every added line of the whole branch diff was read for `text-orange-500`,
`text-teal-400` and `text-teal-500` on a light ground. **No `text-teal-400` or
`text-teal-500` survives anywhere under `src/`.** Of the orange-500 uses, all but two are
correct and stay:

| Where | Why it stays |
|---|---|
| `hero.tsx` headline | never under 40px; 4.23:1 against a 3:1 large-text floor |
| `mission-solution.tsx` bullet glyph, `partner-page.tsx` Info glyph, `ai-team.tsx` flow arrow | graphics, 3:1 floor |
| six headline accents in `partner-page.tsx`, `partners-hub.tsx`, `solutions.tsx`, `platform.tsx`, `about.tsx`, `mission-solution.tsx` | clamp minimums of 26px and above |
| the 96px lease numeral in `platform.tsx` | large text |
| `contact.tsx`, two uses inside the crisis island | orange-500 on navy-950 is 4.67:1 |

The two that were not:

- `src/routes/platform.tsx`, `Rich`, the `tone="teal"` accent branch. Not reached on the
  page today, but `Summary` sets `Rich` at 19px semibold, which axe scores as body rather
  than large text. Stepped to orange-700 so it cannot fail on the day the branch is used.
- `src/components/platform/ai-team.tsx`, the flow chip's label at 14px semibold. Not this
  wave's line, but this wave moved the ground under it from navy (4.67:1, a pass) to white
  (4.23:1, a fail). The label is orange-700 now; the 1px border stays orange-500, which is
  a graphic. The component is unreachable today (proposal 4), so nothing served changes.

### 12.4 MINOR 1: the gate reads what axe could not

This is the check being made sharper, and it is why 12.3 and 12.5 both got through.

The axe pass counted `results.violations` and dropped `results.incomplete`. axe returns
`incomplete` rather than a violation precisely when it cannot resolve what is behind the
text: a background image, a translucent ancestor, an absolutely positioned overlay. Those
are exactly the places an inverted palette goes wrong, and a gate that counts only the
first list reports those pages clean.

The screenshot answers instead. For every incomplete node the gate now records the
element's text, its computed colour, its size and weight and its box, measures the pair
off the shot's own pixels, and asserts it at or above its floor: 4.5:1, or 3:1 for text at
24px, or at 18.66px and bold. The per-page counts are printed beside the violation count
and are in section 3's table. **278 incomplete nodes across the 28 shots at this head; 278
measured; 0 unmeasured; none under its floor.**

How the ground is read took three attempts, and each one was wrong in a way worth
recording:

1. **The modal pixel of the whole box.** Correct for a line of 11px text, where the ground
   is most of the box, and exactly wrong for a 144px numeral, where the glyph is. It
   reported `/solutions`' headline and `/platform`'s "25" as 1.00:1 against themselves.
2. **The modal pixel of a ring OUTSIDE the box.** Correct for an inline span, and wrong
   for an element that paints its own background: it read the page rather than the button
   and reported the partner pages' primary action as white on cream at 1.14:1.
3. **The modal pixel INSIDE the box that is not a glyph**, where "not a glyph" means not
   within tolerance of any text colour whose own box OVERLAPS this one, with the ring as
   the fallback for a box the glyphs have filled. The overlap test matters as much as the
   list: without it a white label elsewhere in the same parent disqualifies a white
   GROUND and there is nothing left to measure against.

A colour is read twice in the page, over white and over black, so its alpha comes back
with it and it can be composited onto the ground it actually sits on rather than parsed in
Python. A node whose own colour is painted nowhere in its box is reported UNMEASURED and
counted, never quietly passed.

### 12.5 MAJOR 3: the sourced-figure ledger, and the four the sharper gate found

**MAJOR 3.** `src/routes/about.tsx`. The verdict's measurement is exact and was
reproduced off the committed wave 412 shot: the ground behind the ledger's source links
reads **rgb(225, 221, 212), luminance 0.7247**, not the flat cream's 0.884, because
`Band` lays the section's photograph behind it at 10% and the mist gradient over it is
`via-transparent` through the middle. teal-600 on that is **3.87:1** at 11px. This report
and `CLAUDE.md` both quoted 4.67:1, which is teal-600 on a cream the band does not have.

The surface moves. The ledger is a white plate now. Measured off the new
`about-1280.png`: **teal-600 on rgb(255, 255, 255), 5.25:1**, and its SOURCED FIGURE
eyebrows came with it at 6.50:1 and 5.25:1.

**The other translucent and photograph-backed surfaces the verdict asked about**, all
measured off the pixels of the new shots by the same reader:

| Where | Rendered ground | Pair | Now |
|---|---|---|---|
| `/platform` `DifferenceStory` card, `bg-page/55` under a gradient and a blurred radial tint | rgb(255, 255, 255) | orange-700 11px, teal-600 11px | 6.50:1, 5.25:1 |
| the same card's principles list | rgb(255, 255, 255) and rgb(253, 250, 249) | ink 13px, ink-muted 11.5px | 18.83:1, 6.71:1 |
| `/about` `Band` photograph at 10%, the rest of the band | rgb(255, 255, 255) on the plate | ink, orange-700, teal-600 | 18.83:1, 6.50:1, 5.25:1 |
| `/` hero `.hero-ground` at 7% | rgb(251 to 253, same) | ink 15px, ink-muted 13px, ink-soft 10px | 18.20:1, 6.79:1, 4.79:1 |
| `/platform` portal labels, `bg-page/90` over a photograph | rgb(254, 254, 254) | ink 10px | 18.67:1 |

**And four pairings the sharper gate found that the verdict did not have a browser to
see. Every one is wave 412's own.**

| Where | What wave 412 did | Measured | Fixed to |
|---|---|---|---|
| `/platform` mission-control hub | stepped the labels from `text-white` and `text-mist` to `text-ink` and `text-ink-muted` and left the radial gradient ending in navy-800 | **1.00:1** and **3.29:1** | the disc is the teal tint fading into the page, both tokens: **16.92:1** and **6.20:1** |
| `/` flip tile | white at 78%, 100% and 88% over an orange-600 to orange-500 gradient, as two rgba literals and a hex | **3.79:1** and **4.36:1** at 1280, **3.60:1** and **4.11:1** at 390, on rgb(177, 81, 50) and rgb(182, 85, 53) | solid `text-page` on all three lines: **5.13:1** and **5.20:1** |
| `/register/resident` crisis card | teal-600 numbers at 15px on the 12% teal tint (4.46:1 over white, 4.00:1 over the cream) over the page's bloom | **3.58:1** | a white plate with the teal-600 border: **5.25:1** |
| both register routes' ground | a 14% teal-500 bloom over the cream, taking luminance 0.884 down to 0.768 | the pre-release badge at **4.09:1** | the bloom is gone. teal-600 on the flat cream is **4.67:1** |

The bloom is the one of those four that is a design decision rather than a slip, so the
arithmetic for it: teal-600 has luminance 0.1500, so its ground has to reach 0.85 for a
4.5:1 pass, and the cream is 0.884. A bloom this ground can afford is about 4%, and the
note in `styles.css` already said 9% was invisible on a light ground. The register routes
are the cream ground rule 10 of the brief asked for. The resident halo is untouched: it is
a glow on a tile, not a tint under text.

### 12.6 The rest of the MINORs

| # | What it said | What was done |
|---|---|---|
| 2 | the baseline shots ARE committed, 28 PNGs | deleted, which was the verdict's recommended default; section 9 rewritten |
| 3 | U+2013 on added lines is 1, not 0 | stated, with the line and why it is a `prettier` re-emit; section 8 |
| 4 | hexes added outside `styles.css` are 2 (3 lines with the re-emit) | stated; and 412b removed three colour literals from a component; section 8 |
| 5 | `CLAUDE.md` section 2's three dark-pixel figures disagree with the report | both now carry the FINAL RUN of this pass, copied from its output rather than typed |
| 6 | `CLAUDE.md` section 8 does not mention `RAW_CEILING` | it does now, in one sentence |
| 7 | the ratchet carries 0.45 and 0.81 points of slack | `RAW_CEILING` is 0.2357 and 0.2220 against the highest of three readings here, 23.56% and 22.19%. The home page's raw figure moves about a tenth of a point between runs because the page animates; that is disclosed where the ceiling is set and in section 3, and the slack against the worst reading is 0.01 of a point |
| 8 | `home/site-footer.tsx` is dead code and still carries `teal-wash` | deleted. `rg` for `home/site-footer` over the tree returns nothing, and `teal-wash` now appears nowhere under `src/` |
| 9 | two comments understate their own measurements | `styles.css` says 8.20:1 on navy-950 for the teal-400 ring, `contact.tsx` says 4.67:1 on navy-950 for the orange word. 7.82 and 4.46 are the navy-900 figures, and navy-900 is the ink, not an island's ground |
| 10 | `trimTail` cuts at the first `</html>` with no guard | it cuts only when what follows looks like a partial tail: shorter than what precedes it, no second doctype, no second `<html>`. Anything else is left alone and named, and every cut names its file and its size. Proved on fixtures both ways |
| 11 | the 404 builder ships an unstyled page if the stylesheet scrape fails | it exits 1 with the path and writes nothing. Proved on a fixture |
| 12 | `useCountUp` ships 0 in the markup | done, section 12.2 |

The three "smaller things I noted and am not counting" are left as they are: the 404
page's `<title>`, the `MASKS` rectangles read at scroll 0, and the stray punctuation at
`CLAUDE.md` line 40, which section 12.7 tidied along with the figures.

### 12.7 The gate at the 412b head

Every command run in the foreground, in this worktree, at the head this branch ends on.

| Gate | Result |
|---|---|
| `bunx eslint` on all 51 lintable changed files, LF-normalised | **0 errors**, 7 warnings |
| `bunx eslint .` whole tree, LF-normalised | **387 errors / 15 warnings**, against **515 / 15** for `origin/main` measured the same way. Delta **128 better** |
| `bunx tsc --noEmit` | **0** |
| `STATIC_BUILD=true bun run build` | rc **0**, **36 pages prerendered**, 29 HTML files |
| `node scripts/pages-postbuild.mjs dist/client` | rc **0**, patched 0, trimmed 1 duplicated tail (`contact/index.html`, 531 characters) |
| `python scripts/wave412-screenshots.py` | rc **0**, 28 shots, **every assertion passed**, 278 incomplete nodes measured and 0 unmeasured, Reveal probe minimum opacity 1.000 on both routes |
| U+2014 and U+2013 on 412b's own added lines | **0 and 0** |
| U+2014 and U+2013 on the whole branch's added lines | **23 and 1**, every one a `prettier` re-emit of a line present verbatim in `origin/main` |
| Tests or checks weakened | **none.** The gate gained an assertion per incomplete node and a probe, and the home page's ratchet was tightened by 0.44 and 0.80 points |
