# Wave 414 report: the mobile pass

**Branch** `feat/wave414-the-mobile-pass`, cut from `origin/feat/wave413-motion-that-helps`
at `9d9cfc1` (the 413b head), built in the worktree
`C:\Users\Israel\Documents\repos\iigs-uc414`. A stacked wave: neither 412 nor 413 is on
`main` yet. `origin/main` sat at `9adb0bb` when this wave started and had not moved when
it finished, so nothing was merged in. The repository's own checkout on `main` was not
touched; every git command in this wave ran against the worktree with `-C` or from inside
it.

**Number claimed** by pushing an empty commit (`7d116b2`) before the first edit. 414 was
free on both remotes: the site remote carried 411, 412 and 413 and nothing higher, the
platform remote carried 410. No collision.

**The call**, Callum, 18 September 2026, 23:30 UK:

> "Finally ensure that the entire site is built to work with mobile users through out."

**45 source and script files, 2 reports, 98 generated image variants, 70 new screenshots.** 247 files changed, 5,539 lines added and 367 removed, measured at the 414b head against `9d9cfc1`.

**⚠ A 414b FIX PASS SITS ON TOP OF THIS REPORT.** The operator's independent
re-checker read the wave on 19 September and returned HOLD with 2 MAJOR and 11
MINOR. Section 18 is what it found, what changed and what the gate reads now,
and every sentence in sections 1 to 17 that it showed to be false is corrected
in place rather than argued with. Where a figure below moved in 414b, the 414b
figure is the one in the gate table.

---

## 1. The eight phone rules, and how the site meets each

Measured at five profiles, all emulated as touch devices so the site's `hover: none` and
`pointer: coarse` arms are the ones under test: **360x800, 390x844, 414x896** (the three
phone widths the UK actually holds), **768x1024** (a tablet) and **667x375** (a phone on
its side, the one nobody tests and every visitor reaches at least once).

`scripts/wave414-mobile.py` is the instrument. It serves the build inside itself, drives
Playwright over the five profiles, writes a full-page shot per route per profile, and
asserts. All figures below are from its final run at this head.

| # | The rule | How it is measured | Result |
|---|---|---|---|
| 1 | **Nothing overflows** | `documentElement.scrollWidth` against `innerWidth`, every route, every profile | **0 of 70 shots overflow.** It was already 0 before this wave and it still is |
| 2 | **Everything is reachable with a thumb** | every visible interactive element's box, and the gap between neighbours, **at the top of the page and again scrolled** | **2,834 targets measured at the top and 2,895 scrolled, 5,729 in all, 0 under 44x44, 0 closer than 8px.** At 390 alone the home page carried 44 undersized targets before, and the scrolled reading 414b added found one more: the condensed header's own logo link, 37.4px tall under its `scale(0.85)` |
| 3 | **Type is readable without zooming** | computed `font-size`, line box, column measure and heading breaking of every `p`, `li`, `input`, `select`, `textarea` and `h1` to `h6` that renders | **5,265 type nodes measured, 0 under their size floor, 0 under a 1.6 line box, 0 under 30 characters to the line at 360. 655 headings, 0 breaking a word.** 24 to 35 size failures per page before, and 414b found 52 prose nodes under 1.6 and four headings breaking at 768 |
| 4 | **Content order is reading order** | the crisis card first on `/contact` and in the footer, moved in the markup | done, section 5 |
| 5 | **Forms work with the keyboard up** | the keyboard probe at 390x420, plus an audit of every field's attributes | done, section 6 |
| 6 | **Images earn their bytes** | 98 responsive variants, `width`/`height` on every image, a generated manifest | done, section 7 |
| 7 | **Sticky things behave** | every `position: fixed` element collected and tested pairwise, at the top and scrolled | **0 fixed layers at the top of the page and 61 scrolled, 61 tested pairwise, 0 overlapping.** Wave 414 printed 6 here and asserted on both readings, so the 0 covered more layers than the 6 named; 414b prints both populations |
| 8 | **Performance is measured on a phone profile** | Lighthouse mobile 13.5.0 against a gzipping server | section 8. Accessibility and best practices CLEARED, performance met on one of four |

Plus, once for the run: the keyboard probe, the drawer-backdrop probe, and a timing table.
And **0 serious or critical axe violations** on all 70 shots, against the whole rule set
rather than colour-contrast alone.

### The two floors under rule 3, and why there are two

**⚠ STATE IT PLAINLY FIRST, BECAUSE THE NUMBER BESIDE IT IS NOT THE CLAIM A
READER WILL ASSUME. THE TYPE GATE HAS TWO FLOORS: 15px FOR BODY COPY AND 12px
FOR SHORT LABELS AND EYEBROWS.** "5,265 type nodes measured, 0 under their
floor" is therefore NOT the same sentence as "no paragraph on this site is
under 15px". A `p` or an `li` rendering fewer than 60 characters answers to
12px, and the basis for the lower figure is `CLAUDE.md`'s own type scale, which
declares an **Eyebrow at 12px** in the same table that says **Body never below
15px**. The site was running labels at 9, 10, 10.5, 11 and 11.5px, under its own
smallest declared size, and those are what the 12px floor caught. rel414 MIN-8
asked for this to be said rather than left to be read out of the script, and
this is it.

The brief says "body copy at least 15px". `CLAUDE.md` says "Body never below 15px" in the
same breath as declaring an **eyebrow at 12px**. Both are authoritative and they only
disagree if "body copy" is read as "every `p` on the page". It is not: an eyebrow, a stat
label, a chip and a source credit are labels, and the brand system sizes them on purpose.

So the gate asks what a node IS, and the test is length, because length is what separates
a sentence somebody reads from a word somebody scans:

- **60 characters or more of rendered text: BODY.** Floor 15px.
- **Under 60: LABEL.** Floor 12px, which is the smallest size the brand system declares.
- **A text-entry control: 16px**, whatever it says, because iOS zooms the whole page into
  anything smaller and does not zoom back out. A tick box, a radio, a range or a colour
  well is exempt: there is nothing to type into it and it cannot trigger the zoom.

What the site was actually running, before: **six rungs below the bottom of its own
ladder** (9, 10, 10.5, 11, 11.5 and 0.72rem) and prose as low as 11px on a phone. 50 body
elements and 44 micro-labels were given a floor below 1024px, expressed as
`max-lg:text-[15px]` and `max-lg:text-[12px]` beside the size already there, so the class
still says what it renders at the width it was written for. The `eyebrow` utility itself
ran at **11px below 768px and 12px above it**, which made it smallest on the screen that
can least afford it; it is 12px at every width now, with the tracking loosened on a phone
instead, because uppercase at 12px is read letter by letter and what helps is air.

**Desktop type is untouched.** Everything is scoped under `lg` (1024px), which covers all
five gate profiles and leaves the 1280 design Callum approved exactly as it was. Section
11 proposes raising the desktop figures too, with the reasoning.

### The exemptions under rule 2, and why each is a rule rather than a list

An exemption that names a selector is a way of making a gate green; an exemption that
names a shape is a statement about what a target is. There are five:

| Exemption | What it means | Count at 390 |
|---|---|---|
| `inline-in-text` | an anchor whose computed display is inline and whose parent holds more text than the link does: a sentence with a link in it, which the brief exempts | 3 to 5 per route |
| `no-area` | not rendered at this width | 8 per route |
| `aria-hidden` | inside an `aria-hidden` or `inert` subtree, so it is not a target | 0 to 2 |
| `skip-link` | **measured FOCUSED instead**, because `sr-only` is a 1x1 clipped box and exempting it would mean never finding out whether the thing it becomes is a target. It is focused, measured, and blurred | 1 per route |
| `label-is-the-target` | a tick box whose own `<label>` already clears 44x44. Pressing the label activates the control; that is what a label is. If the label is also under 44 the control fails | 2 on the register routes |

---

## 2. The hero, and the measurement that chose the strip

The brief asked for a horizontal snap strip **or** a stack, both measured, and the one
whose first viewport still shows a photograph, the headline and the wait-list action.

**The stack, measured on the built site before any change:**

| Profile | Fold | The band's height | The wait-list rule | The first role tile |
|---|---|---|---|---|
| 360x800 | 800 | **998px** | y=1118 | y=1159 |
| 390x844 | 844 | **1083px** | y=1203 | y=1244 |
| 414x896 | 896 | **1152px** | y=1272 | y=1312 |
| 768x1024 | 1024 | 226px | y=362 | y=402 |
| 667x375 | 375 | **1803px** | y=1939 | y=1980 |

A visitor arriving on a phone saw three photographs and had to scroll a screen and a half
before the page's only call to action existed. **The ten role tiles ARE the call to action
on this page**; there is no button. At 667x375 even the first caption was below the fold.

**The strip, measured at this head:**

| Profile | Fold | The band's height | First photograph | Its headline | The wait-list rule | The first role tile |
|---|---|---|---|---|---|---|
| 360x800 | 800 | **319px** | y=88 | y=315 | y=439 | **y=480** |
| 390x844 | 844 | **348px** | y=88 | y=339 | y=468 | **y=508** |
| 414x896 | 896 | **371px** | y=88 | y=358 | y=491 | **y=531** |
| 768x1024 | 1024 | 226px | y=104 | y=281 | y=362 | y=402 |
| 667x375 | 375 | **218px** | y=68 | y=181 | y=302 | **y=342** |

**The strip wins on the brief's own test and it is not close.** At every one of the five
profiles the first screen now holds a photograph, its headline, the wait-list rule and at
least the first row of role tiles. The gate asserts all three on `/` at every profile and
prints what it found.

**How it works, and it needs no JavaScript.** `scroll-snap-type: x mandatory` on the band
and `scroll-snap-align: start` on each panel, with each panel `calc(100% - 2.25rem)` wide
so **24px of the next photograph peeks past the right edge**. The peek is the affordance:
the strip says it is a strip without a control and without a word. The scrollbar is
hidden, because a 15px scrollbar under a photograph on a phone is not an affordance.

Nothing is only reachable inside the strip: the three photographs are one sentence, and
the hero's `sr-only` h1 says all three lines of it. The lane takes a tab stop below 768px
and nowhere else (at 768 and above it is a three-column grid with nothing to scroll, where
a tab stop would be a stop that does nothing), and it is named by that same h1, so no
string was added. Wave 414's scroll-region probe finds it is **the only horizontally
scrollable box on the whole site at 390, and it has a tab stop and a name**.

### A phone on its side

667x375 is 375px TALL, and that is the constraint. The bar takes 56px there whatever the
width says, with the logo at its own 44px phone size; the strip shows two photographs
rather than one, because a single 5:4 photograph at 667px wide is 480px tall on a 375px
screen; the picture caps at 30svh; and the hero's vertical rhythm comes in, because 32px
above the photographs and another 32 above the wait-list rule is 17 per cent of everything
there is. `object-cover` crops rather than letterboxes, which is the right trade on a
landscape phone and the only place on this site these photographs are cropped at all.

---

## 3. The header, and the measurement that made it static

Carried from the rel413b verdict, MIN-9, done first and in its own commit.

Wave 413 animated the bar from 72px to 56px over 200ms to hand the visitor 16px of
viewport back. A sticky bar occupies flow, so that is a **200ms relayout of the whole
document on every crossing of the threshold**. Measured on the 4x-slowed phone profile the
brief asks for, at 390x844, over five down-and-up scroll cycles that cross it ten times:

| Route | Bar | Max frame | p95 | Frames over 17ms | CLS |
|---|---|---|---|---|---|
| `/` | **animated** | **50.10ms** | 33.40ms | 53 to 56 | 0.0015 to 0.0115 |
| `/` | **static** | **16.80ms** | 16.80ms | **0** | **0.0000** |
| `/register/investor` | **animated** | **33.40ms** | 16.80ms (p99) | 1 to 2 | 0.0000 |
| `/register/investor` | **static** | **16.80ms** | 16.80ms (p99) | **0** | **0.0000** |

Three frames' worth of work inside one frame's budget, fifty times a scroll, on the page
the site exists to be landed on.

**A snapped height with no transition was measured too and is not the answer.** It still
costs 9 to 15 dropped frames and puts 0.0033 to 0.0092 of layout shift on the page,
because an unanimated reflow is still a reflow.

**So the bar has one static height: 56px below 640px and 72px from 640px.** The breakpoint
is the logo's own (`h-11 sm:h-[52px]`), because 44px of artwork clears a 56px bar with 6px
either side and 52px of artwork needs 72. A phone is handed the 16px **on the first paint
and never has it taken away**, where the condense only gave it after 24px of scroll and
took it back on the way up: strictly more viewport than before. Nothing at 640px and above
moves, so the hero's `100svh - 77px` fit is untouched.

The condense still does its two free things, the logo's `scale(0.85)` and the card shadow,
so the bar still visibly tightens under a scroll. What it no longer does is move the
document to do it.

`--header-height-condensed` is retired. `:where([id])`'s `scroll-margin-top` and a new
`scroll-padding-top` on `html` both read `--header-height`, which is an honest single
figure now that the bar cannot be two heights. `Disclosure`'s hard-coded 56 reads the live
bar instead of a constant that would be wrong at one width or the other.

**The law of motion is down to one exception.** Wave 413 declared two transitions on a
layout property. The header's is gone; the accordion's is the only one left on the site.
`docs/WAVE413_REPORT.md` carries a supersession note saying so where the claim was made.

---

## 4. The registration journey on a phone

**Measured before:** at 390 with the viewport cut to **420px**, which is roughly what an
iPhone leaves above an open keyboard, the account step's "Create account and continue"
control sat at **y=1040** and was not reachable with one scroll. Somebody typing their
e-mail address could not see the button that does something with it, and the survey's
Continue was the same shape of problem.

**Measured after:** **y=356, in view**, with the focused field at y=218 and the bar's
bottom at 56. The gate's keyboard probe asserts three things: the Continue-shaped control
is in view or one scroll away, the focused field is not under the header, and the focused
control is at least 16px.

**Both steps get a sticky bottom bar** with `env(safe-area-inset-bottom)` padding, and the
survey's "Registration saved", its `03 / 07` counter and its progress bar get a sticky band
resting at `--header-height`, so how far through a seven-question journey you are does not
scroll away after question one.

**STICKY, NOT FIXED, and that is the whole reason it needed no spacer.** A fixed bar leaves
a hole in the flow that has to be filled with a bottom padding somebody keeps in step with
the bar's height, and it is a second fixed layer to keep out of the back-to-top control's
corner. A sticky one occupies its own space, cannot cover the row beneath it, and stops
sticking at the foot of the fieldset, which is exactly where a visitor stops needing it.

**And the back-to-top control moved left below 1024px**, which the gate's fixed-layer
assertion is what found: it is `fixed bottom-6 right-5` and 44px across, and the journey's
Continue button now finishes in exactly that corner. Left rather than lifted, because
lifting it would leave a hole above the bottom edge on the twelve routes with no bar, and
because the right thumb zone on a phone is where this site's primary actions already are.

The role picker is unchanged: it was already two columns with Resident first and full
width, and its tiles already cleared 44px.

---

## 5. Reading order, and the card that was last

Phone rule 4 names one element: "the crisis card comes first". Below 1024px both layouts
that carry one are a single column, and in both the card was **last**.

- **`/contact`**: under an eight-field enquiry form. It is now the first item in the grid's
  markup, placed back into the right-hand rail on desktop with `lg:col-start-2
  lg:row-start-1`.
- **The footer**: under the company description, six site links, six contact routes and ten
  partner pages, which at 390 is most of a thousand pixels of scroll between a person in
  trouble and three telephone numbers. It is first in the footer's markup now, placed back
  into the fifth column with `lg:col-start-5 lg:row-start-1`.

**Moved in the markup, not with `order`.** `order` moves the paint and leaves the reading
order, the tab order and the screen reader where they were, which on this card is the half
that matters. Nothing at 1024px and above moves; what changes there is that the card comes
first for a keyboard and a screen reader too, which for this card is not a regression.

The footer's other columns keep their established order behind it (logo and contact, site
links, contact routes, partners, then the registration badges and the legal strip). The
brief's list did not mention the logo-and-contact column; it is second rather than dropped,
because it carries the e-mail address and the telephone number and deleting it was not what
was asked for.

**The partner pages' hero photograph is above the text at phone width, never behind it**,
which the brief asked for and which section 10 explains was also a measured contrast
failure. The journey and its stages were already a single column with a vertical numbered
rail, and the three mascots were already scaled inside their own box; the gate confirms no
overflow and no undersized target on either partner route at any profile.

---

## 6. Forms with the keyboard up

Every field on the site, audited in a browser rather than read off the source:

| Field | `type` | `inputMode` | `autocomplete` | Label |
|---|---|---|---|---|
| `/contact` name | text | `text` | `name` | visible |
| `/contact` email | `email` | `email` | `email` | visible |
| `/contact` organisation | text | `text` | `organization` | visible |
| `/contact` role | select | n/a | `off` | visible |
| `/contact` message | textarea | `text` | `off` | visible |
| register email | `email` | `email` | `email` | visible |
| register phone | `tel` | `tel` | `tel` | visible |
| register password | `password` | **none, deliberately** | `new-password` | visible |
| register confirm | `password` | **none, deliberately** | `new-password` | visible |
| survey free text | text | `text` | `name` / `organization` / `off` | visible |
| demand-map authority | select | n/a | `off` | `aria-labelledby` the existing eyebrow |

**No `inputMode` on the two password fields, and that is the decision rather than the
oversight.** There is no input mode that is right for a password, and naming one tells the
keyboard something about what is being typed into a field whose whole point is that it does
not.

**`autocomplete="off"` where there is no token**, rather than nothing. A free-text message
and a bespoke six-route enquiry selector have no autofill token, and an absent attribute
lets a browser guess, which on a phone means offering somebody their home address.

Every label is visible; there is not a placeholder-only field on the site. Errors sit
beside their field with `role="alert"`. Every text-entry control is 16px: `/contact`'s five
were `text-sm`, which is 14, and iOS zooms the page into anything under 16 and does not
zoom back out. The honeypot (`registration-website`) is correctly off-screen,
`aria-hidden`, `tabIndex={-1}` and gets nothing, which is what a honeypot is for.

---

## 7. Images that earn their bytes

### Responsive sources

`scripts/wave414-responsive-images.py` **reads its work list off the source tree**, so a
variant can never be generated for an image nothing renders, and an image that gains a
reference gains its variants on the next run. `public/images` holds a good deal more than
the site draws and none of it was touched.

98 WebP variants at 400, 640, 960 and 1440, from 71 referenced rasters. The originals are
never modified: they stay as the `src`, so a browser that does not understand `srcset` and
a build that has not run the script both still show the picture.

**Three steps were written and then DROPPED, because they came out bigger than their own
source.** Several of the site's images are already well-encoded WebP, and re-encoding one
at a width close to its own is larger; shipping those would make a phone download more
bytes for fewer pixels, which is the exact thing rule 6 exists to stop.

That is why the script emits `src/lib/image-variants.ts` and the components read the
`srcset` from it: **the steps that exist are not the steps anybody would guess**, so a
hand-typed `srcset` would 404 on the ones the encoder refused.
`python scripts/wave414-responsive-images.py --check` fails a build where the manifest and
the directory disagree.

### And the `sizes` that lied

A `sizes` that overstates costs the whole difference, and it is the one part of a `srcset`
that nothing checks for you. A probe that reads `currentSrc` against the rendered box at
390 found three:

| Image | Renders at 390 | Declared | Fetched | Now fetches |
|---|---|---|---|---|
| `ai-team/trio-wave.webp` | 254px (65vw) | `100vw` | the **934px original, 144KB** | `trio-wave-640.webp` |
| `collective-capability-team.png` | 270px (69vw) | `100vw` | the **934px original** | `...-640.webp` |
| `hero-ground-street.webp` | 390px, at **7% opacity** | `100vw` | **960px, 124KB** | `...-640.webp` |

**And the first fix for the wash made it worse.** `sizes` is in CSS pixels and the browser
multiplies by the screen's density before choosing, so `"640px"` on a 2x phone asks for
1280 device pixels and picked the 1672px original. `"320px"` asks for 640 and gets the 640.
That trap is written into the constant in `src/lib/responsive-image.ts`.

### Width and height

Eleven images carried no dimensions at all, so the browser reserved nothing for them and
every line beneath jumped when they landed. They read them from the same manifest now,
because most of these `src` values are expressions (a director's portrait, a partner's
illustration, a portal's art) and a literal pair of numbers beside a variable is a pair of
numbers that will be wrong.

### Loading

The hero's three photographs and its ground wash are `eager`; the Zoopla mark is `eager`
now too (rel413b MIN-5, section 10). Everything else is `lazy`. Total page weight, measured:

| Route | Before | After |
|---|---|---|
| `/` | 3,372 KiB | **928 KiB** |
| `/the-problem` | 473 KiB | **405 KiB** |
| `/register/investor` | 489 KiB | **420 KiB** |
| `/partner-with-investor` | 2,094 KiB | **725 KiB** |

---

## 8. Performance, measured and not claimed

**Lighthouse mobile 13.5.0 ran here**, so these are Lighthouse numbers rather than the
fallback the brief allows. They are taken against a **server that gzips**, because the
first run of this went through Python's `SimpleHTTPRequestHandler`, which does not, and
reported a 13.0s first paint that was a fact about the server and not about the site.
GitHub Pages compresses; a number taken without it is not a number about this site.

| Route | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Bytes |
|---|---|---|---|---|---|---|---|---|---|
| `/` | **68** | **100** | **100** | 100 | 3.7s | 6.0s | 140ms | **0** | 928 KiB |
| `/the-problem` | **85** | **100** | **100** | 92 | 2.9s | 3.6s | 0ms | **0** | 405 KiB |
| `/register/investor` | **83** | **100** | **100** | 92 | 3.1s | 3.8s | 10ms | **0** | 420 KiB |
| `/partner-with-investor` | **78** | **100** | **100** | 92 | 3.0s | 4.6s | 10ms | **0** | 725 KiB |

**And re-measured at the 414b head**, on the same instrument and the same
gzipping server. The bytes went UP on every route, by 16 to 27 KiB, and that is
the cost of the brand lockup having an alpha channel again: a transparent WebP
is larger than a flattened one, and nine of this site's images are transparent.

| Route | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Bytes |
|---|---|---|---|---|---|---|---|---|---|
| `/` | **66** | **100** | **100** | 100 | 3.6s | 6.2s | 170ms | **0** | 955 KiB |
| `/the-problem` | **85** | **100** | **100** | 92 | 2.9s | 3.6s | 10ms | **0** | 421 KiB |
| `/register/investor` | **81** | **100** | **100** | 92 | 3.1s | 4.0s | 20ms | **0** | 437 KiB |
| `/partner-with-investor` | **79** | **100** | **100** | 92 | 3.0s | 4.5s | 0ms | **0** | 741 KiB |

`chrome-launcher` raises `EPERM` deleting its own temporary profile directory on
Windows after each run finishes. It happens after the report is written, the
JSON is complete, and the scores above are that JSON's. Said here rather than
swallowed.

Against the brief's floors: **accessibility 95 CLEARED at 100 on all four. Best practices
90 CLEARED at 100 on all four. Performance 85 MET ON ONE OF FOUR**, and this wave does not
claim otherwise.

The same four routes as this wave found them, for the arithmetic:

| Route | Perf | LCP | CLS | Bytes |
|---|---|---|---|---|
| `/` | 52 | 10.5s | 0.003 | 3,372 KiB |
| `/the-problem` | 84 | 3.6s | 0.003 | 473 KiB |
| `/register/investor` | 70 | 5.0s | 0.001 | 489 KiB |
| `/partner-with-investor` | 67 | 5.2s | **0.149** | 2,094 KiB |

And the gate's own timing probe, browser-measured under a 4x CPU slowdown and a slow 4G
profile at 390x844, which is a different instrument and reports a different LCP because it
measures to network idle with every lazy image in:

| Route | LCP | CLS | INP |
|---|---|---|---|
| `/` | 11,188ms | 0.0002 | 0ms |
| `/the-problem` | 3,816ms | 0.0000 | 0ms |
| `/register/investor` | 4,004ms | 0.0000 | 0ms |
| `/partner-with-investor` | 6,340ms | 0.0000 | 0ms |

### What this wave removed

**A 596 KiB icon chunk on every route.** Six files did
`import * as Icons from "lucide-react"` and four then did `Icons[someStringFromContent]`.
A dynamic index into a namespace import is the one shape Rollup has to give up on: any
export might be reached, so it keeps them all. The site draws about sixty glyphs and names
38 of them from content. `src/lib/icon-registry.ts` is those 38 as named imports in one
explicit map; the chunk is now a 1.2 KiB `createLucideIcon` plus the glyphs actually drawn.

**461 KiB of `lenis` that a phone never ran.** The guard was already right and is unchanged
(no touch, no reduced motion, nothing under 768px), but a static import meant every phone
fetched, parsed and executed the whole wheel-momentum library in order to reach a `return`.
It is behind the same condition now, as a dynamic import.

### What is left, and why it is not a mobile pass

The home page is the outlier at 68. On a 4x-slowed phone it spends **964ms in style and
layout and 968ms in script evaluation**, from a 2,182-module React bundle, a 161 KiB
prerendered document and a page that carries a seven-thousand-dot canvas, a council
marquee and thirty images. Closing that means deciding what the home page may stop doing,
which is Callum's call and not a phone pass's. It is proposal 1.

---

## 9. The layout shift, and the font that caused it

`/partner-with-investor` scored a cumulative layout shift of **0.1481** at Lighthouse's own
mobile emulation, against Google's 0.1 "good" threshold. **0.1461 of it was one event at
2113ms**: one `div.reveal` in the hero went from 448px tall to 406px the moment the fonts
landed. The heading lost a line and everything under it moved up 42px.

`@fontsource` ships `font-display: swap`, which is the right choice: text is readable in a
fallback while the real face arrives. What swap costs is a reflow when it lands, and on a
phone that reflow is the visitor's place on the page moving under their thumb.

**Four metric-matched fallback faces now occupy the same space as the real ones.** Every
override was measured off the woff2 files this site actually ships, with `fontTools`,
against Arial's published metrics (2048 upem, 1854 ascent, -434 descent, 67 line gap, 1017
average lowercase advance):

| Face | upem | hhea ascent | hhea descent | avg lowercase advance |
|---|---|---|---|---|
| Barlow 600 | 1000 | 1000 | -200 | 489.3 |
| Barlow 700 | 1000 | 1000 | -200 | 496.6 |
| Barlow 800 | 1000 | 1000 | -200 | 504.0 |
| Inter variable | 2048 | 1984 | -494 | 1079.1 |

| Face | `size-adjust` | `ascent-override` | `descent-override` | `line-gap-override` |
|---|---|---|---|---|
| Barlow 600 | 98.54% | 101.48% | 20.3% | 0% |
| Barlow 700 | 100.01% | 99.99% | 20% | 0% |
| Barlow 800 | 101.5% | 98.52% | 19.7% | 0% |
| Inter | 106.1% | 91.3% | 22.73% | 0% |

Three Barlow faces rather than one, because the weights differ by 1.5% in advance and the
hero runs at 800 while the section headings run at 700. `local()` and nothing else: if none
of the named faces is installed the rule does not match, the next family in the stack takes
over with no overrides, and the site is exactly as it was. **A fallback that can break
something is not a fallback.**

**And a single `size-adjust` could not close it entirely**, which the wave's own timing
probe found and Lighthouse did not: Lighthouse loads and waits, the probe SCROLLS, and a
shift during a scroll is not "recent input" so it counts. 0.1259 remained, because a scalar
matches an average advance and "Partner with Property Investors." is mixed case, where
Barlow 800's capitals sit differently against Arial's than its lowercase does.

So the three fonts that paint the first screen are **preloaded**: Barlow 800, Barlow 700
and Inter. Imported with `?url` so the hashed path cannot go stale on the next build, and
with `crossOrigin`, because a font preload without it is a second download rather than a
head start. Three and not five: Barlow 600 and JetBrains Mono are below the fold on every
route, and a preload for something not needed immediately competes with the things that
are.

**Measured after: 0.1481 to 0.0000.** CLS is 0 on all four Lighthouse routes and 0.0000 to
0.0002 in the gate's own probe.

---

## 10. Carried from the wave 413 release check (rel413b), done first

`docs/WAVE413_REPORT.md` and `scripts/wave413-motion.py` were corrected in one docs-only
commit; the three code items went in the commit before the phone work.

| Item | What was found | What was done |
|---|---|---|
| **MIN-5** | the Zoopla ink mark was `loading="lazy"` while sitting in the first viewport | `eager`, at low fetch priority like the hero's 7% wash. It **stays** in probe (b)'s first-viewport wash list, and the code says why: that list is every first-viewport element under opacity 1, the probe asserts none is invisible and none animates above its resting value, and a mark at 0.90 is neither. Removing it would stop it being checked, not stop it being wrong |
| **MIN-6** | the drawer backdrop was a plain `div` with an `onClick`, no role, no key handler | kept pointer-only (Escape and the Close control are the keyboard paths) and given `aria-hidden="true"`, so being absent from the accessibility tree is a statement rather than an inference from having no role. **A probe step presses it at 390** and asserts the panel goes, focus returns to the trigger, `aria-expanded` is false and the scroll lock is released. Wave 413 proved every other way out of the drawer and left this one proved only by reading the code |
| **MIN-9** | the header's height transition reflowed the document on every frame | measured and removed. Section 3 |
| **MIN-1** | three reduced-motion rows carried pre-413b figures | the progress bar is a 300ms `scaleX` not a 300ms `width`; the canvas fade and the photograph fade are both 350ms |
| **MIN-2** | two different causes given for the same ratchet raise | the gate-table row defers to section 8, which carries the eight readings, and says so |
| **MIN-3** | section 5 was the old gate and did not say so | its heading and opening paragraph name `59f36e5`. Both tables are kept: a gate table for a superseded head is evidence about that head |
| **MIN-4** | two probe comments described network throttling and an `IMAGE_HOLD_MS` that do not exist | corrected to describe the request parking that is implemented, which is stronger. **Comments only**; not a line of probe logic changed |
| **MIN-7** | "the six standalone probes" is seven | seven, and all seven named |

---

## 11. Three regressions this wave caused, found by re-running the older gates

Named because the gates found them and not because they were expected.

**1. A colour pair, on the partner hero.** The fresh 960px encode of the hero band's
photograph changed the tint enough that the secondary button's teal-600 label measured
**4.07:1** off the shot's own pixels against a 4.5:1 floor. Taking the wash from 20% to 10%
only reached **4.34:1**, and the flat cream is 4.67:1, so there was never room under that
pair for a photograph of any strength. Below 640px the wash is gone and the same picture is
a real photograph above the copy, in the brand's treatment (12px radius, a 1px rule, no
scrim) and in the order phone rule 4 asks for. **Wave 295's ruling holds: the surface
moved, not the ink.** From 640px the composition is exactly as approved, and wave 413's
image-fade probe still asserts its 32% wash, because that probe runs at 1280.

**2. The home page's raw dark-pixel ratchet, in both directions.**

- **At 390 it falls 22.21% to 16.85%**, because the hero is a snap strip and the first
  screen carries one photograph instead of three. Three readings at this head: 16.78%,
  16.78%, 16.78%. **A ratchet lowered by 5.36 points.**
- **At 1280 it rose 23.70% to 23.85%**, and the reason given here was wrong.
  ~~because the hero band now draws the 400px variant into its 392px slot and a
  fresh WebP encode's pixel statistics are not the original's.~~ Three readings
  at the wave 414 head: 23.81%, 23.83%, 23.81%. **It was the brand lockup on a
  black plate**, in the header and the footer of every shot, outside the
  photograph masks, and it is section 18's MAJOR 1. With the alpha kept the page
  reads **23.64%, 23.65%, 23.56% and 23.64%**, which is lighter than the 413
  head the ceiling came from, so the raise is WITHDRAWN and the ceiling is back
  at 23.70%. At 390 the ratchet goes down again too, 16.85% to 16.70%, against
  four readings of 16.58%.

**The page is not darker and the ground figure proves it**: with the photographs, the map
field and the island masked out, the home page reads **9.16% at 1280 against 9.17%
before**, and 7.08% at 390. The whole of the raw movement is inside the masked rectangles,
which is to say inside the pictures. The ground answers to the flat 15% with no ratchet and
no exception, and it went down. `scripts/wave412-screenshots.py` carries all of this where
the numbers are.

The 1280 reading is also far steadier: the wave 413 note records a spread of 0.17 of a
point across eight readings, and this head reads 0.02 across three, because there is
markedly less script racing the shutter.

**3. One serious axe violation, which was not this wave's but is closed by it.** The two
faces of the home page's purpose section are stacked in one grid cell, and the hidden one
was `opacity-0 pointer-events-none aria-hidden` and **still in the tab order**, with every
link inside it focusable. On a phone a visitor tabbing or swiping through the page landed
in a face nobody can see, twice. `inert` on both faces takes the hidden one out of the tab
order, the accessibility tree and find-in-page in one word.

---

## 12. The gate, measured in this worktree

**⚠ THE TABLE BELOW IS THE WAVE 414 GATE, RUN AT `82d217b`, AND THE WAVE
ENDED AT `93d0dcb`.** rel414 MIN-5 is right that that is a gap and that
`93d0dcb` changed `src/lib/image-variants.ts`, which is linted, typechecked and
bundled. The table is kept because a gate table for a head is evidence about
that head. **The gate that answers for the branch is section 18's**, which ran
whole at the 414b head with every source commit in it.

| Gate | Command | Exit | Numbers |
|---|---|---|---|
| Lint, changed files | `bunx eslint` on the changed lintable files | **0** | **0 errors.** Warnings are `react-refresh/only-export-components`, all pre-existing |
| Lint, whole tree | `bunx eslint .` on an LF-normalised export of this head | **0** | **387 errors / 15 warnings** |
| Lint, whole tree, base | the same, on `9d9cfc1` | **0** | **387 errors / 15 warnings. DELTA ZERO** |
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors**, equal to wave 413's |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered** |
| Postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | trimmed a duplicated tail from 1 file |
| **Wave 414's gate** | `python scripts/wave414-mobile.py` | **0** | **70 shots.** 2,840 targets, **0 under 44x44**, **0 closer than 8px**. 5,265 type nodes, **0 under their floor**. 6 fixed layers, **0 overlapping**. **0 serious or critical axe violations**. **0 shots overflow** |
| Wave 412's gate | `python scripts/wave412-screenshots.py` | **0** | **28 shots, every assertion passed.** 275 incomplete axe nodes, **275 measured off the pixels, 0 unmeasured**. Darkest raw home @ 1280 **23.81%**, darkest ground home @ 1280 **9.16%** |
| Wave 413's gate | `python scripts/wave413-motion.py` | **0** | 13 routes at 1280 and 390 plus **all seven** standalone probes, green |
| Responsive images | `python scripts/wave414-responsive-images.py --check` | **0** | every referenced image has the variants it should have |
| Lighthouse mobile | `bunx lighthouse` on four routes, gzipping server | **0** | section 8 |
| U+2014 on added lines | | | **0 authored.** Section 12.1 |
| U+2013 on added lines | | | **0** |
| Hex literals on added lines | | | **0 authored.** Section 12.1 |
| `git diff 9d9cfc1...HEAD -- src/content` | | | **EMPTY** |
| New user-facing strings | | | **none.** Section 12.2 |
| Tests or checks weakened | | | **none.** One replaced with a stronger one, and one ratchet moved both ways. Section 12.3 |

### 12.1 The dash and hex counts, and the two the diff shows

The raw diff shows one U+2014 and one hex literal on added lines. **Both are pre-existing
lines re-emitted because a block moved within its file**, and both were verified verbatim
at `7d116b2`: `contact.tsx`'s "it has to stay choosable" comment, and `site-footer.tsx`'s
`style={{ color: "#ffffff" }}` on the crisis heading, which sat at line 265 of the base
with identical text. Nothing this wave wrote carries either.

`prettier --write` also reflowed five files under `src/content` at one point. Every one was
**restored byte for byte from the base**, and `git diff 9d9cfc1...HEAD -- src/content` is
empty.

### 12.2 No new user-facing string

The two label attributes on added lines are `aria-label="Survey progress"` and the demand
map's `${authority.name} commissioning detail`, both verified present at `7d116b2` and both
only reindented. One `alt=""` was added, which is not a string.

Where a control needed a name, an **existing** one was reused: the demand map's `<select>`
is `aria-labelledby` the readout's existing "Selected area" eyebrow, and the hero's snap
strip is `aria-labelledby` the hero's existing `sr-only` h1.

### 12.3 One check replaced, and it is stronger

Wave 413's probe (c) read **72 / 56 / 72** and passed as long as the bar came back. It
therefore PERMITTED the height to move, which is what it was written to check. It now
requires **all three readings to be identical** and equal to the one height that width is
entitled to. That is a superset: every build the old rule passed with a moving bar, this
one fails. Nothing was removed or relaxed, and the wave added a probe step (the drawer
backdrop), a whole new gate script and an image-variant check.

---

## 13. Screenshots

`docs/screenshots/wave414/` holds **70 full-page shots**: fourteen routes at each of
`360`, `390`, `414`, `768` and `667x375`, named `<route>-<profile>.png`. The fourteen are
`/`, `/about`, `/platform`, `/the-problem`, `/solutions`, `/partners`, `/contact`,
`/register`, `/register/investor`, `/register/resident`, `/partner-with-investor`,
`/partner-with-local-authority`, `/legal` and the 404.

`docs/screenshots/wave412/` (28) and `docs/screenshots/wave413/` (4) were regenerated by
their own gates at this head.

**The four to look at first**, and what each shows:

| Shot | What changed |
|---|---|
| `home-390.png` | the hero as a snap strip: a photograph, its headline, the wait-list rule and two rows of role tiles, all above the fold, where the stack put the first tile at y=1244 |
| `contact-390.png` | the crisis card directly under the contact details, before the eight-field form it used to sit under |
| `register-investor-390.png` | the pinned progress band and the sticky Continue bar |
| `partner-with-investor-390.png` | the hero photograph above the words rather than behind them |

---

## 14. What was NOT built, and why

**The sticky wait-list action on phones (brief item 8) is not in this branch.** The brief
made it conditional: "Build it if it passes rules 2 and 7 and the Lighthouse floor; if it
costs accessibility or overlaps anything, leave it out and put it in the closing as a
proposal."

It fails two of the three conditions as the site stands:

1. **The Lighthouse floor is met on ONE of the four routes and not on the other
   three** (`/the-problem` at 85 meets a floor of 85; `/` at 68, `/register/investor`
   at 83 and `/partner-with-investor` at 78 do not). Sections 1 and 8 say the
   same thing; an earlier draft of this paragraph said "not met on any", which
   was wrong, and rel414 MIN-4 caught it. The brief's condition was that the
   sticky action must pass the floor, and on the route it would live on, the
   home page, it does not.
2. **It overlaps two things.** The back-to-top control is a 44px fixed circle at the bottom
   corner, and the registration journey now has its own sticky bottom bar; a third bottom
   layer would need both of them coordinated through a root-level custom property, and rule
   7 says the fixed layers must not overlap.

And the problem it was for is smaller than it was: **the hero now puts the wait-list action
in the first screen at all five profiles**, which is where a visitor actually meets it.

What remains true, and is the case FOR it, measured at 390 on the built site: the home
page carries thirteen links to a `/register` route, the last of the hero's is at **y=1161**
and the next one anywhere is at **y=5626**, on a page **8,154px** tall. That is **4,465px
of scroll with no way on to the wait list**, across the purpose section, the solution
section and the demand map. A real gap, and it is proposal 3.

---

## 15. Proposals for Callum, each with a recommended default

**1. The home page's performance, and what it may stop doing.**
*Recommended default: split the demand map's dot field behind an intersection observer, and
ask whether the council marquee earns its place on a phone.* The home page scores 68 where
the other three score 78 to 85, and the difference is 964ms of style and layout plus 968ms
of script evaluation on a 4x-slowed phone. The page carries a seven-thousand-point canvas,
a marquee, thirty images and a 2,182-module bundle. Nothing here can be cut without
deciding what the page may stop doing, which is why this wave measured it and stopped.
Building the dot field only when the map is about to be seen is the cheapest single move
and needs no design decision; the marquee is a design decision.

**2. Raise the type on desktop too.**
*Recommended default: yes.* This wave raised 50 body elements and 44 micro-labels to the
brand system's own figures **below 1024px only**, to keep the pass a mobile pass. The same
elements are still under `CLAUDE.md`'s declared scale at 1280: body copy at 11 to 14px
where the spec says 15, and labels at 9 to 11px where the smallest declared size is the
12px eyebrow. Israel's meeting notes ask for "consistent font sizing throughout". Removing
the `max-lg:` prefixes is the whole of the change, and it would take the sub-15px ladder
from eleven rungs to three.

**3. A sticky wait-list bar on phones.**
*Recommended default: not yet, and not until proposal 1 lands.* Section 14 has the
reasoning and the measurement. If it is wanted, the honest way to build it is one fixed
container holding both it and the back-to-top control, absent on `/register/*` where the
journey has its own bar, with `<main>` given matching bottom padding. It needs no new
string: "Register to join the waitlist" already exists.

**4. `font-display: optional` for the headline face.**
*Recommended default: no, keep `swap` and the preloads.* `optional` would make layout shift
from fonts structurally impossible: a first-time visitor on a slow connection would simply
never see Barlow on that visit. CLS is already 0 on all four measured routes with `swap`
plus metric-matched fallbacks plus preloads, so this would buy robustness at the price of
the brand's typeface on exactly the connections this wave is about.

**5. The 44px target rule is stricter than WCAG AA.**
*Recommended default: keep it.* WCAG 2.2's AA target size (2.5.8) is 24x24 with exceptions;
44x44 is the AAA figure (2.5.5) and Apple's and Google's own guidance. The gate enforces 44
and the site now meets it everywhere, so keeping it costs nothing and lowering it would
only permit a regression.

**6. The demand map's polygons on a tablet.**
*Recommended default: keep the select up to 1024px, as built.* Below 1024px the eighteen
authorities are chosen with a native `<select>` rather than by pressing one of 137 district
polygons, the smallest of which renders 4.56 by 3.68 CSS pixels at 390. At 768 on a touch
tablet the polygons are bigger but still well under 44px, and a stylus is not what most
tablet visitors have. If Callum would rather the map stayed pressable on a tablet, the
breakpoint moves from 1024 to 768 in one place.

**7. The footer's logo-and-contact column on a phone.**
*Recommended default: leave it where it is, second.* The brief's stacking order named the
crisis card, the site links, the contact routes, the partners and the legal strip, and did
not mention the column that carries the company description, the e-mail address, the
telephone number and the opening hours. It now sits second, behind the crisis card. If it
was meant to be dropped or moved to the end on a phone, that is one class.

---

**8. The tablet and landscape columns, now that there is a number for them.**
*Recommended default: yes, in a wave of its own.* The measure assertion binds at
360, where the site meets it with 30.9 characters. At 768 and at 667x375 some
rows sit side by side and leave columns of 23.2 and 10.3 characters, which is
narrower than the phone gets. `/about`'s capability card was the worst of them
and is fixed here because it was breaking headings; the rest are a layout pass
across several routes and were not in this fix pass's scope.

---

## 16. What Cowork should show Callum first

1. **`home-390.png`, beside the wave 413 shot of the same page.** It is the change he will
   feel: three photographs and a screen and a half of scroll became a photograph he can
   swipe, its headline, the wait-list line and the roles, all on the first screen.
2. **`contact-390.png`.** The crisis numbers are the first thing under the heading now
   instead of the last thing on the page.
3. **The performance table in section 8**, with the sentence that accessibility and best
   practices are at 100 on all four routes and performance is not at 85 on three of them,
   and proposal 1, which is the decision he actually has to make.

## 17. What wave 414 asks the next wave to keep

**The bar has one height and it must not move.** Wave 413's probe (c) enforces it now, and
the reason is a measurement, not a preference: 50.10ms inside a 16.7ms frame.

**Nothing is a target unless it is 44 by 44.** The exemptions in
`scripts/wave414-mobile.py` are five rules, not a list of selectors, and each is defended
where it is written. Adding a sixth means writing down what shape of thing it describes.

**A `srcset` is built from the manifest, never typed.** The encoder decides which steps are
worth writing and it refuses some; `src/lib/image-variants.ts` is the only record of what
exists. And a `sizes` is multiplied by the device pixel ratio before anything is chosen,
which is the trap that made the first fix in section 7 worse than the problem.

**A glyph named by a string in `src/content` goes in `src/lib/icon-registry.ts`.** A
dynamic index into a namespace import costs 596 KiB on every route and no tool will warn
you.

**The crisis card comes first in the markup**, on `/contact` and in the footer, and the
desktop position is held with grid coordinates rather than by putting it back.


---

## 18. Wave 414b: the fix pass the rel414 re-check asked for

The operator's independent re-checker read the wave at `93d0dcb` on 19 September
2026 and returned **HOLD, 2 MAJOR, 11 MINOR**. It found the hero strip, the
reading-order moves, the type and target work, the static header and the four
carried rel413b items all sound. What held the wave was a picture.

### 18.1 MAJOR 1: the brand lockup was drawn on a solid black rectangle

`scripts/wave414-responsive-images.py` wrote every variant through

```python
scaled = image.convert("RGB").resize(...)
```

`Image.convert("RGB")` **discards** an alpha channel rather than compositing it,
so a source whose transparent pixels carry RGB 0,0,0 comes out opaque black.
`/images/brand/logo-lockup.webp` is one of those, `sizes` asks for 119 to 140 CSS
pixels, and the candidate list is 400w, 640w and the 711w original, so **every
device picked the 400w step**. Navy and orange artwork on a black plate, in the
header and the footer of all 36 prerendered pages, at every width, desktop
included. Thirteen variants of nine transparent sources were affected: both
lockups, the Zoopla ink mark, the solution hub and trio, the AI-team trio wave
and the capability band.

**The pipeline keeps RGBA where the source has it** and WebP carries alpha in
its lossy mode, so a variant is a variant of its source again. Every affected
file was deleted and regenerated.

**And the script now has an assertion for the class rather than the instance:**
any source with an alpha channel must produce variants that have one, checked
off the files on disk in both the write mode and `--check`. It catches all
thirteen on the pre-fix tree and reports **24 referenced sources carrying an
alpha channel, every variant of them still carrying one** on this one.

**The gate can see it now, which it could not before.** Nothing in wave 414's
run could: the element was in the DOM, it had a box, it had an accessible name,
axe was content and the page did not overflow. So the mark is **photographed and
read**. `scripts/wave414-mobile.py` takes an element capture of the header's and
the footer's lockup on every route at every profile and measures the mean
relative luminance of the box against the ground framing it in the same shot.

| | before (the flattened variant) | after | floor |
|---|---|---|---|
| header lockup, on the white bar | **0.200** | **0.814** (darkest of 70 shots) to 0.823 | 0.80 |
| footer lockup, on the cream | **0.200** | **0.673** (darkest of 70) to 0.680 | ground minus 0.30 |

The floor is 0.80 where the ground reads white, which is the header, and on any
ground the mark may be no more than 0.30 darker than the ground beside it. That
second form is what makes one assertion work on the white bar and on the cream
footer, whose own luminance is 0.845 and where no mark with ink in it could
reach 0.80. A black plate is 0.65 darker than its ground; honest artwork is
0.165 to 0.178 darker.

**The dark-pixel share, home at 1280: 23.81% before, 23.64% after.** The ground
figure, which is the one that means the page is light, is 9.16% either way,
because the plates are outside the photograph masks and the ground figure never
saw them. Wave 414 raised `RAW_CEILING` from 23.70% to 23.85% and blamed a fresh
WebP encode; **that was this defect**, and the ceiling is back at 23.70% with
four readings of 23.64%, 23.65%, 23.56% and 23.64% under it. At 390 the ratchet
comes down again, 16.85% to 16.70%, against four readings of 16.58%.

### 18.2 MAJOR 2: the demand map's picker was destroyed on every change

`AuthorityPicker` was declared **inside** `DemandMap`, beside the hooks. A
function component declared inside another is a new type on every render, so
React cannot match it against the last one: it unmounts the old subtree and
mounts a fresh one. Every selection sets `activeId`, which re-renders
`DemandMap`, which threw the `<select>` away and built another, so the node
holding focus was removed and `document.activeElement` fell back to the body. In
Chromium a closed `<select>` fires `change` on an arrow key, so a keyboard
visitor was dropped **mid-selection**. Below 1024px this is the only control the
map has: wave 414 made the 137 district polygons `aria-hidden` with no tab stop
and no pointer events.

Hoisted to module scope with the id, the value and the change handler as props.
**The probe is the shape of the bug:** at 390, focus the select, press
ArrowDown, and assert the control is still there and that the press did what it
was for.

> `picker / @ 390  before=('Manchester', focus='select[data-authority-picker]')`
> `ArrowDown -> after=('Salford', focus='select[data-authority-picker]')`
> `value_moved=yes  figures_moved=yes`

### 18.3 MINOR 1: the landscape header, and it was the capture

`home-667x375.png` had 56px of empty bar at the top of the image and the first
ink at y=68. The re-checker could not tell from a still whether the bar was
missing or the capture was. **It was the capture.** `html` carries
`scroll-behavior: smooth`, so `settle()`'s closing `scrollTo(0, 0)` ANIMATES,
and on a landscape phone the home page is 6,751px against a 375px viewport: the
shutter opened at **scrollY=756**. A `sticky` bar paints where it is stuck, so
the bar was 756px down its own image.

Every scroll in `settle()` is instant now and the return to the top is
**confirmed** before the shutter, with a failure printed if it is ever not 0.
Three assertions were added so this cannot be argued from a still again: the
header exists, has a box of at least 40px and sits at the top of the document;
its lockup is measured for light at every profile including landscape; and the
**saved shot's own first ink** must land inside the header band. The landscape
shot now reads its first ink at **y=6**, with the bar at 56px and the lockup at
(32, 6, 118, 44).

### 18.4 MINOR 2 and 10: the scrolled audit, and the bar over the field

**The 44px rule is measured scrolled as well as at the top.** Wave 414 read the
scrolled audit and used it only for the fixed layers, so the back-to-top control
it had just moved was the one interactive element on the site whose hit area the
gate never read. 2,834 targets at the top and **2,895 scrolled**.

**And it found one immediately.** The condensed header puts `scale(0.85)` on the
logo link, and a transform scales the BOX: the 44px mark was a **37.4px target**
the moment anybody scrolled, on every route at every phone width. 4px of padding
above and below makes the resting box 52px, and 52 by 0.85 is 44.2.

**Nothing proved the sticky Continue bar never covers a focused field.** Wave
414's keyboard probe focused the FIRST input, at the top of the panel, and
asserted only that it was not under the header. There was no
`scroll-margin-bottom` anywhere, so a browser bringing a low field into view had
nothing telling it about the bar at the foot. Every control inside
`.registration-panel` now carries `scroll-margin-bottom: calc(5rem + env(safe-area-inset-bottom))`,
which is the bar's 77px measured plus the safe area and a hair.

The probe focuses the **last** field of the account panel and the **last** option
of the longest survey question, at 390x420, and asserts neither box meets the
bar's. The journey is walked through its own controls with the two registration
endpoints stubbed, because this gate serves a static build with no backend.

| Focused | Its box | The bar | Clear |
|---|---|---|---|
| `#confirmPassword`, the last account field | 210 to 266 | 343 to 420 | **yes, by 77px** |
| the 12th of 12 options, "Anywhere in England" | 190 to 284 | 318 to 395 | **yes, by 34px** |

### 18.5 MINOR 3, 4, 5 and 6: the report's own honesty

- **The fixed-layer sentence counted one population and asserted another.** It
  said "6 fixed layers, 0 overlapping" while testing the top-of-page AND the
  scrolled readings. Both numbers are printed now: **0 at the top of the page and
  61 scrolled, 61 tested pairwise, 0 overlapping.** Zero at the top is correct
  and was always the point: the back-to-top control does not exist until two
  viewports of scroll.
- **Section 14 contradicted sections 1 and 8 on the Lighthouse floor.** Corrected
  in place: met on one of four.
- **The gate table was at `82d217b` and the head was `93d0dcb`.** Section 12 now
  says so, and this section's table is the one that answers for the branch.
- **"3,006 lines added across 246 files" was a count taken at `82d217b`.**
  Refreshed from the final diff at the top of this report.

### 18.6 MINOR 7: the icon registry lost its compile-time check

`export const ICONS: Record<string, LucideIcon>` makes `keyof typeof ICONS`
exactly `string`, so `RegisteredIconName` was `string` and `roleIcons`' `base:
RegisteredIconName` accepted anything, where the `keyof typeof Icons` it
replaced was a real union of Lucide's exports.

`as const satisfies Record<string, LucideIcon>` asserts the same thing about the
values and keeps the literal key type. **Proved rather than asserted:** typing
`HandCoinz` for `HandCoins` in `src/components/register/role-icon.tsx` gives

```
src/components/register/role-icon.tsx(34,15): error TS2820: Type '"HandCoinz"' is
not assignable to type '"CircleDollarSign" | "Home" | ... 24 more ... |
"UsersRound"'. Did you mean '"HandCoins"'?
```

Reverted; `role-icon.tsx` carries no change and `tsc --noEmit` is 0.

### 18.7 MINOR 8, 9 and 11: the phone rules the gate did not cover

**The two floors are stated plainly** at the head of section 1: 15px for body
copy, 12px for short labels and eyebrows, with `CLAUDE.md`'s own type scale as
the basis for the lower one.

**The line box.** Rule 3 asks for 1.6 on body copy and wave 414 collected the
number without testing it. 52 prose nodes across ten class strings were running
at 1.375 to 1.45, which at 15px on a phone is exactly what the rule is about:
the source lines, the compliance badges, `/about`'s ledger captions,
`/contact`'s and the register journey's small print, `/legal`'s and
`/platform`'s footnotes, and the standalone 404's one paragraph.
`max-lg:leading-[1.6]` beside the leading already there, so the class still says
what it renders at the width it was written for. **Desktop is untouched.**

The floor is read on PROSE, and prose is a shape rather than a tag: a `p` set in
Barlow, or at 600 and above, or above the 17px lede, is a card's headline
whatever tag it is written in, and its leading is a brand decision. Under 60
characters it is a label, which is the same line the size floor already draws.

**The measure.** Read as the column width in characters of the element's own
text, which is the brief's second form of the rule, and asserted at **360, where
the brief puts that floor**, and reported at all five profiles.

| Profile | Narrowest column | Where |
|---|---|---|
| **360** | **30.9 characters** | `/about`, the leadership impacts. **The floor binds here and is met by 0.9** |
| 390 | 34.9 | the same paragraph |
| 414 | 38.2 | the same paragraph |
| 768 | 23.2 | `/about`'s group-diagram captions |
| 667x375 | 10.3 | `/about`'s ledger caption beside a fluid figure column |

The average over rendered lines is NOT the measure and would have been the wrong
instrument: a paragraph's last line is ragged, so `chars / lines` understates a
three-line column by about a quarter and would have failed columns that read
perfectly well.

**And 768 found a real defect, which is what a tablet profile is for.**
`/about`'s capability card started its side-by-side arm at `md`. At exactly 768
it gave 29 per cent of its width to the illustration's padding and 190px to the
heading column, leaving 257px for four impacts that then split in two: text
columns of **48px**, a measure of **5.5 characters**, and four `<h3>` headings
13 to 36px wider than the box holding them. The arm starts at `lg` now, so a
tablet gets the stacked layout 390 already uses, and **nothing at 1024 and above
moves**. After: 23.2 characters and 0 headings breaking.

**Headings.** No heading may be wider than its own content box and none may ask
for `hyphens: auto` or `word-break: break-all`. **655 measured, 0 breaking.**
An `sr-only` heading is a 1px clipped box with no rendered measure and is
skipped rather than failed.

**The success state, readable without scrolling.** Build item 3 ends with it and
nothing measured it. The probe walks the journey to its end at 390x844 and reads
the three things that state is:

| | box | first screen |
|---|---|---|
| the heading, "You're registered" | 186 to 226 | 56 to 844 |
| the message, `role="status"` | 242 to 372 | 56 to 844 |
| the action, "Explore the platform" | 404 to 456 | 56 to 844 |

**The demand map's height, bounded.** Build item 2 asked for it and nothing
measured it. **In pixels rather than viewports**, because the thing a reader is
lost in is a distance to scroll: the same band is 2.7 screens upright and 5.5 on
its side, with nothing about the band changed.

| Profile | The section |
|---|---|
| 360 | **2,433px** (3.04 viewports) |
| 390 | 2,288px (2.71) |
| 414 | 2,245px (2.51) |
| 768 | 2,015px (1.97) |
| 667x375 | 2,055px (5.48) |

**The bound is 2,600px**, the tallest reading plus a tenth, and it is a ratchet:
a later wave may lower it and may not raise it without saying why in the script.

**And the one route with no chrome is asserted rather than exempted.**
`scripts/pages-postbuild.mjs` writes `404.html` as a standalone document with no
header and no footer, because GitHub Pages serves it with no router and no
chunk. The exemption is a shape: a page with neither must BE that page, which is
to say it must carry the 404 heading and a link home. A route that loses its
header still fails, because it will still have its footer.

### 18.8 How each route meets the phone rules

The per-route account the brief asked for and section 1 gave as a per-run total.
Every row is five shots, at 360, 390, 414, 768 and 667x375. **Every cell that
can be zero is zero.**

| Route | Shots | Overflows | Targets / under 44 / under 8px apart | Type nodes / under size / under 1.6 / under 30ch | Headings / breaking | Fixed layers / overlapping | axe serious or critical |
|---|---|---|---|---|---|---|---|
| `/` | 5 | **0** | 493 / **0** / **0** | 505 / **0** / **0** / **0** | 60 / **0** | 5 / **0** | **0** |
| `/about` | 5 | **0** | 385 / **0** / **0** | 600 / **0** / **0** / **0** | 105 / **0** | 5 / **0** | **0** |
| `/platform` | 5 | **0** | 485 / **0** / **0** | 470 / **0** / **0** / **0** | 80 / **0** | 5 / **0** | **0** |
| `/the-problem` | 5 | **0** | 345 / **0** / **0** | 450 / **0** / **0** / **0** | 20 / **0** | 5 / **0** | **0** |
| `/solutions` | 5 | **0** | 354 / **0** / **0** | 410 / **0** / **0** / **0** | 40 / **0** | 4 / **0** | **0** |
| `/partners` | 5 | **0** | 475 / **0** / **0** | 320 / **0** / **0** / **0** | 100 / **0** | 5 / **0** | **0** |
| `/contact` | 5 | **0** | 585 / **0** / **0** | 450 / **0** / **0** / **0** | 30 / **0** | 5 / **0** | **0** |
| `/register` | 5 | **0** | 444 / **0** / **0** | 315 / **0** / **0** / **0** | 30 / **0** | 4 / **0** | **0** |
| `/register/investor` | 5 | **0** | 454 / **0** / **0** | 310 / **0** / **0** / **0** | 25 / **0** | 4 / **0** | **0** |
| `/register/resident` | 5 | **0** | 455 / **0** / **0** | 335 / **0** / **0** / **0** | 30 / **0** | 5 / **0** | **0** |
| `/partner-with-investor` | 5 | **0** | 405 / **0** / **0** | 345 / **0** / **0** / **0** | 40 / **0** | 5 / **0** | **0** |
| `/partner-with-local-authority` | 5 | **0** | 404 / **0** / **0** | 345 / **0** / **0** / **0** | 40 / **0** | 4 / **0** | **0** |
| `/legal` | 5 | **0** | 435 / **0** / **0** | 405 / **0** / **0** / **0** | 45 / **0** | 5 / **0** | **0** |
| the 404 | 5 | **0** | 10 / **0** / **0** | 5 / **0** / **0** / **0** | 10 / **0** | 0 / **0** | **0** |

The brand lockup is read on all thirteen chromed routes at all five profiles, 65
header boxes and 65 footer boxes, and the darkest of each is in section 18.1.
The 404 carries no chrome by design and is asserted to be that page instead.

Rules 4, 5 and 6 are per-journey rather than per-route and are proved by the
five standalone probes: the keyboard probe, the drawer-backdrop probe, the
picker probe, the bar-over-field probe and the success probe, all at 390 and all
in this section or section 10.

### 18.9 The gate, whole, at the 414b head

Every command run in the foreground, in this worktree, at **`a761058`**, which
is the last commit that touches a source file, a script or a generated asset.
The commit after it adds this report and the shots this run wrote, and neither
is an input to a lint, a typecheck, a build or a gate.

| Gate | Command | Exit | Numbers |
|---|---|---|---|
| Lint, changed files | `bunx eslint` on the changed lintable files | **0** | **0 errors** |
| Lint, whole tree | `bunx eslint .` on an LF-normalised export of this head | **0** | **387 errors / 15 warnings** |
| Lint, whole tree, base | the same, on `9d9cfc1` | **0** | **387 errors / 15 warnings. DELTA ZERO** |
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors** |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered** |
| Postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | base `/`, 0 files patched, 0 duplicated tails |
| **Wave 414's gate** | `python scripts/wave414-mobile.py` | **0** | **70 shots.** 2,834 targets at the top and 2,895 scrolled, **0 under 44x44**, **0 closer than 8px**. 5,265 type nodes, **0 under their size floor, 0 under a 1.6 line box, 0 under 30 characters at 360**. 655 headings, **0 breaking a word**. 61 fixed layers tested pairwise, **0 overlapping**. **0 serious or critical axe violations**. **0 shots overflow**. Darkest lockup box: header **0.814**, footer **0.673** |
| Wave 412's gate | `python scripts/wave412-screenshots.py` | **0** | **28 shots, every assertion passed.** 275 incomplete axe nodes, **275 measured off the pixels, 0 unmeasured**. Darkest raw home @ 1280 **23.64%** against a ceiling back at 23.70%, darkest ground **9.16%** |
| Wave 413's gate | `python scripts/wave413-motion.py` | **0** | 13 routes at 1280 and 390 plus all seven standalone probes, green |
| Responsive images | `python scripts/wave414-responsive-images.py --check` | **0** | every referenced image has its variants, and **24 sources with an alpha channel have variants that still carry one** |
| Lighthouse mobile | `bunx lighthouse` 13.5.0, four routes, gzipping server | **0** | **66 / 85 / 81 / 79** performance, **100 / 100 / 100 / 100** accessibility, **100 / 100 / 100 / 100** best practices. Section 8 |
| U+2014 on added lines | | | **0** |
| U+2013 on added lines | | | **0** |
| Hex literals on added lines | | | **0** |
| `git diff 9d9cfc1...HEAD -- src/content` | | | **EMPTY** |
| New user-facing strings | | | **none.** One attribute added, `data-authority-picker`, which is not a string anybody reads |

**The performance floor is still unmet on three of four routes and this pass did
not chase it.** It is proposal 1 and it needs a decision about what the home page
may stop doing, which is Callum's and not a fix pass's. The `/` score moved 68 to
66 and `/register/investor` 83 to 81, inside this instrument's own run-to-run
spread and in the direction the 16 to 27 KiB of restored alpha would push it.

### 18.10 What 414b did NOT do

- **The performance floor.** Unmet on `/`, `/register/investor` and
  `/partner-with-investor`, stated rather than chased, proposal 1.
- **The narrow columns at 768 and 667x375** beyond the one that was breaking
  headings. `/about` reads 23.2 characters at 768 and 10.3 at 667x375 against a
  floor the brief binds at 360 only. Both are now measured and printed on every
  run, which is the first time this site has had a number for them. Widening
  them is a layout decision on several routes and is **proposal 8**.
