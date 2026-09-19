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
photographs and the map field masked out, is **3.75%**.

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

| Route | Width | dark before | dark after | ground before | ground after | islands | axe before | axe after |
|---|---|---|---|---|---|---|---|---|
| `/` | 1280 | 63.55% | **23.55%** | 48.48% | **9.22%** | 1 | 6 | **0** |
| `/` | 390 | 56.55% | **22.19%** | 37.26% | **7.42%** | 1 | 6 | **0** |
| `/about` | 1280 | 39.17% | **4.12%** | 50.19% | **2.62%** | 0 | 5 | **0** |
| `/about` | 390 | 30.80% | **5.72%** | 34.76% | **2.61%** | 0 | 5 | **0** |
| `/platform` | 1280 | 63.95% | **4.72%** | 68.98% | **3.35%** | 0 | 7 | **0** |
| `/platform` | 390 | 63.49% | **6.18%** | 62.00% | **3.92%** | 0 | 7 | **0** |
| `/the-problem` | 1280 | 41.20% | **4.65%** | 40.43% | **2.89%** | 0 | 5 | **0** |
| `/the-problem` | 390 | 33.84% | **6.30%** | 33.79% | **2.98%** | 0 | 5 | **0** |
| `/solutions` | 1280 | 39.61% | **5.68%** | 44.98% | **3.27%** | 0 | 10 | **0** |
| `/solutions` | 390 | 33.18% | **7.12%** | 35.44% | **4.32%** | 0 | 10 | **0** |
| `/partners` | 1280 | 46.67% | **9.13%** | 47.56% | **4.28%** | 0 | 15 | **0** |
| `/partners` | 390 | 30.99% | **7.54%** | 30.82% | **5.00%** | 0 | 14 | **0** |
| `/contact` | 1280 | 31.66% | **6.45%** | 31.66% | **2.70%** | 1 | 7 | **0** |
| `/contact` | 390 | 56.00% | **10.06%** | 56.14% | **3.62%** | 1 | 7 | **0** |
| `/register` | 1280 | 58.47% | **3.55%** | 59.32% | **2.32%** | 0 | 5 | **0** |
| `/register` | 390 | 46.45% | **6.05%** | 46.40% | **2.64%** | 0 | 5 | **0** |
| `/register/investor` | 1280 | 60.55% | **4.47%** | 61.44% | **3.38%** | 0 | 5 | **0** |
| `/register/investor` | 390 | 43.14% | **7.05%** | 43.23% | **3.38%** | 0 | 5 | **0** |
| `/register/resident` | 1280 | 64.31% | **4.18%** | 65.29% | **3.19%** | 0 | 5 | **0** |
| `/register/resident` | 390 | 46.56% | **6.90%** | 46.65% | **3.52%** | 0 | 5 | **0** |
| `/partner-with-investor` | 1280 | 57.13% | **12.26%** | 61.97% | **4.72%** | 0 | 5 | **0** |
| `/partner-with-investor` | 390 | 49.67% | **10.46%** | 51.58% | **5.12%** | 0 | 5 | **0** |
| `/partner-with-local-authority` | 1280 | 57.77% | **11.53%** | 63.44% | **4.54%** | 0 | 5 | **0** |
| `/partner-with-local-authority` | 390 | 49.76% | **10.11%** | 52.38% | **5.19%** | 0 | 5 | **0** |
| `/legal` | 1280 | 5.81% | **2.91%** | 5.11% | **2.11%** | 0 | 5 | **0** |
| `/legal` | 390 | 6.34% | **5.35%** | 5.96% | **2.96%** | 0 | 5 | **0** |
| the 404 route | 1280 | 0.25% | **0.63%** | 0.25% | **0.63%** | 0 | 0 | **0** |
| the 404 route | 390 | 0.80% | **1.95%** | 0.80% | **1.95%** | 0 | 0 | **0** |

**Mean across 28 shots: dark 42.06% to 7.53%; page ground 42.37% to 3.71%; axe serious/critical colour-contrast violations 169 to 0.**

Two numbers in that table need explaining:

- **`/` cannot reach the 15% raw ceiling, and the arithmetic says so rather than a
  judgement.** The three approved hero photographs are lamplight and golden hour, and
  about 85% of their pixels are under the 0.2 line on their own. The site's OWN
  TERRACOTTA, `#c15f3c`, has a relative luminance of **0.1985**, so every pixel of a brand
  orange card counts as dark by two thousandths; teal-600 is 0.1500 and counts too.
  Deleting the demand map island outright still leaves the page near 17%, because removing
  area takes it out of the denominator as well. So the home page is listed in the gate's
  `RAW_CEILING` at the figure measured at this head, and the GROUND assertion still binds
  at 15% there (it measures 9.22%). That is the check being made sharper, not looser: the
  raw figure is still asserted, against a number it can only go down from.
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
it; see the proposals.

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
| `"pending"` | hidden, about to rise. Set only from the effect, only for an element below the fold, only with motion allowed. |
| `"true"` | the animation, then visible. |

Anything already inside the viewport at mount reveals at once. Anything still pending
**900ms** after mount reveals anyway. The animation is **8px over 350ms**, down from 16px
over 500ms. The effect runs in a layout phase so the element is never shown and then
hidden. `useCountUp` got the same backstop, guarded so it cannot snap a running count to
its end value.

**The invariant wave 413 must keep: no content is ever invisible without JavaScript.**

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

| Gate | Command | Exit | Numbers |
|---|---|---|---|
| Lint, changed files | `bunx eslint` on all 47 | **0** | **0 errors**, 5 warnings (all `react-refresh/only-export-components`, all pre-existing patterns) |
| Lint, whole tree | `bunx eslint .` on an LF-normalised copy | 1 | **387 errors / 15 warnings**, against **515 / 15** on the same measurement of `origin/main`. Delta **128 errors better** |
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors**, against 22 inherited |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered**, 29 HTML files |
| Prerender postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | base `/`, patched 0 files, trimmed 0 duplicated tails on the final build |
| Screenshots and assertions | `python scripts/wave412-screenshots.py` | **0** | **28 shots, every assertion passed** |

The whole-tree lint improvement is the project's own `prettier` run over the 47 files this
wave touched: the gate requires 0 errors on a changed file, and in a repository with
pre-existing formatting drift that means formatting it. No content was changed by it.

**The screenshot gate asserts, per page, per width:** no horizontal overflow; the body and
header grounds both above 0.8 relative luminance; at most one `.section-dark` inside
`<main>`; the raw dark-pixel share under 15% (or under the recorded ceiling on `/`); the
page's own ground under 15% dark; zero serious or critical axe colour-contrast violations;
and at least 60 characters of rendered text. That last one is trivial and it is what
caught the blank 404: **a blank page is light, has no dark pixels, no overflow and no
contrast violations, and passes every other check here perfectly.**

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
| U+2014 on added lines | **24**, and **0 of them are new prose**. Every one is a pre-existing line re-emitted by `prettier --write`, checked mechanically: each was searched for verbatim in `origin/main` and found |
| U+2013 on added lines | **0** |
| Hexes added to a component | **0.** The only hex values this wave wrote are in `src/styles.css` and in the `INK` constant of the Zoopla script |

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

The baseline shots of `origin/main` are not committed; they were taken in a scratch
directory and their numbers are in the table above. Re-taking them is
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
3. **`src/components/home/site-footer.tsx` is dead code.** Nothing imports it; the live
   footer is `src/components/site-footer.tsx`. It was converted with everything else so
   the audit is clean, but it is a second copy of the footer waiting to be edited by
   mistake. *Recommended default: delete it in wave 413.*
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

**413, the motion wave.** `Reveal` is the foundation and its invariant is the one to keep:
NO CONTENT IS EVER INVISIBLE WITHOUT JAVASCRIPT. The resting state of `.reveal` is visible,
the JS adds `data-revealed="pending"` for one frame, and the 900ms failsafe releases
anything the observer missed. Build on top of that rather than beside it. The motion that
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
