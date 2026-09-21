# Wave 421: the hero photograph comes back as a warm ground, and the footer's curve stops being broken

**Branch** `feat/wave421-the-warm-hero-ground-and-the-footer-curve`
**Base** `e07b7f4`, wave 415c's head, which is also `origin/main` at the time of writing
**Head** see section 12; the 421b fix pass sits on top of wave 421's own head `3be1544`
**Owner** Claude Code, Opus 5, MEDIUM effort
**Call** Callum, 19 Sep 2026 about 14:00 UK, looking at the live site

> "Can you add the faded hero image to the background of the hero section on the site, and
> instead of making it navy faded maybe make it faded through orange a little, but still keep
> the background itself white. Also then fix the footer section seen in the image as it's
> curved look is broken, maybe change the footer to navy, or switch it to white so it's still
> curved and stands out as a section, but doesn't have that broken white part."

---

## 1. The ledger

| file | + | - | what |
|---|---|---|---|
| `src/styles.css` | 194 | 23 | `.hero-ground` warmed and `.hero-ground-photo` raised to 0.2, `.hero-ground-layer` promoted to the compositor, `.footer-arch` and the padding that makes room for it |
| `src/components/site-footer.tsx` | 83 | 15 | the arch's two colours and its hairline, the footer body from cream to white |
| `src/components/home/hero.tsx` | 67 | 17 | the ground's class and `sizes`, the Zoopla credit's ink, four stale claims corrected |
| `src/lib/responsive-image.ts` | 67 | 16 | `SIZES_HERO_WASH` becomes `SIZES_HERO_GROUND` |
| `src/components/image-fade.tsx` | 10 | 4 | a comment that still said the hero's ground rests at 7% |
| `scripts/wave421-hero-and-footer.py` | 741 | 0 | the new gate, three sections |
| `scripts/wave412-screenshots.py` | 44 | 0 | the ratchet's note, seven readings, no number moved |
| `scripts/wave413-motion.py` | 11 | 2 | `REQUIRED_WASH["/"]` follows the photograph from 0.07 to 0.2 |
| | **1,217** | **77** | 8 files |

`src/content` is byte-untouched: `git diff e07b7f4...HEAD -- src/content` is empty. No new user-facing
string. No hex in a component. No emoji. Zero em dashes and zero en dashes on added lines, counted
on the diff.

**R421-1 is recorded in `Closed-Rulings.md`.** The Landing-Queue row is registered as `ready`.

⚠ **THIS REPORT HAS BEEN CORRECTED IN PLACE BY TWO FIX PASSES.** The rel421 re-check returned
HOLD with 1 MAJOR and 5 MINOR, closed in **section 12**; the rel421b re-check returned HOLD with 1
MAJOR and 2 MINOR, closed in **section 13**. Sections 2.1, 2.1b, 2.5, 3, 4.4, 6 and 7 carry the
corrections rather than notes pointing at them. The ledger above is wave 421's; sections 12 and 13
carry each pass's own numbers.

---

## 2. The hero ground

### 2.1 Fault A, the wrong variant, and its fix

The brief's diagnosis is confirmed. At the base, `src/lib/responsive-image.ts` declared
`SIZES_HERO_WASH = "320px"` for an image that is `object-cover` across the whole hero, so a
1905px viewport resolved to `hero-ground-street-400.webp`: a 400px source across a 1905px box,
**0.21 of its own width**. Wave 414 chose that deliberately and was right to while the photograph
was painted at seven per cent and invisible; the moment it is visible the choice is the softness
Callum could see.

Measured at the base by `scripts/wave421-hero-and-footer.py` before anything was changed:

| viewport | `sizes` | chosen source | box |
|---|---|---|---|
| 1905 | `320px` | `hero-ground-street-400.webp` | 1905 |
| 1280 | `320px` | `hero-ground-street-400.webp` | 1280 |
| 768 | `320px` | `hero-ground-street-400.webp` | 768 |
| 390 | `320px` | `hero-ground-street-400.webp` | 390 |

**The assertion, and 421b widened it.** Section A of the gate loads `/` at every
`(width, density)` pair in `VARIANT_PROFILES`, reads
`document.querySelector('img[data-hero-wash]').currentSrc`, and fails at **both ends of the
range**: a viewport wider than 640 that resolves to the 400px step, and **any profile that
resolves to the 1672px original**. It failed three times at the base, which is the diagnosis
proved in this repo rather than taken on trust.

⚠ **THE DENSITIES WERE MISSING AND THAT IS WHAT LET MAJOR 1 SHIP.** `sizes` is in CSS pixels and
the browser multiplies by the screen's density before choosing, so a check that opens every
context at `device_scale_factor=1` is blind to three quarters of the expression it is checking.
That blind spot hid the 2x case, which this wave's own review sub-agent found by arithmetic
(section 8, finding 1), and then hid the band between 1x and 1.5x, which the rel421 verdict found
the same way. Both are now read off a real browser at a real density.

**Sixteen profiles at the 421c head, every one asserted.** Twelve were added by 421b and the last
four by 421c, which chose them **by rule**: every band in `SIZES_HERO_GROUND` contributes a profile
at the **worst density it can serve**, at a viewport wide enough for its cap to bind.

| viewport | dpr | profile | chosen source | box, css | box, device |
|---|---|---|---|---|---|
| 1905 | 1.0 | desktop | `hero-ground-street-960.webp` | 1905 | 1905 |
| 1280 | 1.0 | laptop | `hero-ground-street-960.webp` | 1280 | 1280 |
| 768 | 1.0 | tablet | `hero-ground-street-960.webp` | 768 | 768 |
| 390 | 1.0 | phone | `hero-ground-street-400.webp` | 390 | 390 |
| **1905** | **1.25** | **125% scaling** | `hero-ground-street-960.webp` | 1905 | 2381 |
| **1536** | **1.25** | **125% scaling** | `hero-ground-street-960.webp` | 1536 | 1920 |
| **1440** | **1.1** | **110% zoom** | `hero-ground-street-960.webp` | 1440 | 1584 |
| **1920** | **1.33** | **133% zoom** | `hero-ground-street-960.webp` | 1920 | 2554 |
| 1600 | 1.5 | 1.5x edge | `hero-ground-street-960.webp` | 1600 | 2400 |
| 1905 | 2.0 | 2x edge | `hero-ground-street-960.webp` | 1905 | 3810 |
| 412 | 1.75 | Lighthouse mobile | `hero-ground-street-400.webp` | 412 | 721 |
| 390 | 3.0 | 3x phone | `hero-ground-street-640.webp` | 390 | 1170 |
| **1905** | **1.75** | **1.75x band, worst** | `hero-ground-street-960.webp` | 1905 | 3334 |
| **1905** | **1.99** | **1.75x to 2x band, worst** | `hero-ground-street-960.webp` | 1905 | 3791 |
| **1210** | **2.5** | **2x to 2.5x band, worst** | `hero-ground-street-960.webp` | 1210 | 3025 |
| **1008** | **2.99** | **2.5x to 3x band, worst** | `hero-ground-street-960.webp` | 1008 | 3014 |

**The four bold rows in the middle are rel421 MAJOR 1** and took the 1672px original before 421b.
**The four bold rows at the foot are rel421b MAJOR 1** and took it before 421c. **The srcset for
this one image no longer contains the original at all**, so no row can take it again; see section
2.1c.

### 2.1b MAJOR 1: the band between 1x and 1.5x, and the proof that the check bites

**What shipped in wave 421 and what was wrong with it.** The `sizes` named 288dpi, 192dpi and
144dpi and then fell through to `min(100vw, 960px)`. 1x is exactly 96dpi, so those three branches
cover 1.5x, 2x and 3x and **nothing covered the open band above 1x**. Everything in it fell
through to the one branch that is **not divided by its density**, and 960 CSS pixels at 1.25 is
1200 device pixels, which takes the original. The comment above the line was headed "EVERY BRANCH
ASKS FOR THE SAME THING: AT MOST 960 DEVICE PIXELS" and section 2.1 of this report repeated it.
**Both were false for that band.**

**Who that band is, and why it is not an edge case.** Windows display scaling at 125 per cent
reports `devicePixelRatio` 1.25 and is the out-of-the-box default on a great many laptops. Page
zoom multiplies the ratio in Chrome and in Firefox, so **an ordinary 1x reader who zooms to 110,
125 or 133 per cent to read the page more easily is moved into that band by the act of zooming**,
which makes it an accessibility cohort as well as a large one. Against the live site those
machines had been taking the 27KB 400px step, so wave 421 as reviewed was a **172KB regression on
the home page's critical path** for them, plus the exact decode this wave's own long-task evidence
says is harmful.

**The fix is one line**, immediately before the fallback, capped for the worst density in its own
band:

```
"(min-resolution: 100dpi) min(50vw, 640px)",
min(100vw, 960px)
```

At 1.25x that asks for 800 device pixels and at 1.49x for 954, both inside the 960 cap, and it is
more generous than the 960 across a 3810 device-pixel box the 2x branch already accepts. 100dpi
rather than 97: 1x is exactly 96dpi, so 100 is the first round number that excludes 1x and
includes everything above it, and the 144dpi branch takes over before this one could over-serve.

**Proved by mutation, because a check that has never gone red is not a check.** With the new
branch removed and the gate re-run against a rebuilt site, **exactly the four rows the verdict
predicted go red and no others**:

```
- / at 1905 x 1.25 (125% scaling): the hero wash resolved to hero-ground-street.webp, the 1672px ORIGINAL.
- / at 1536 x 1.25 (125% scaling): the hero wash resolved to hero-ground-street.webp, the 1672px ORIGINAL.
- / at 1440 x 1.1 (110% zoom):     the hero wash resolved to hero-ground-street.webp, the 1672px ORIGINAL.
- / at 1920 x 1.33 (133% zoom):    the hero wash resolved to hero-ground-street.webp, the 1672px ORIGINAL.
```

With the branch restored, all twelve profiles take the 960 step or smaller and the run is green.
The full mutated output is kept at `docs/wave421/gate421-mutated.txt`.

**Lighthouse is unaffected and the claim in section 7 is unchanged**, because 412 CSS pixels at
1.75 resolves to 206 either way. (At the 421c head it matches the 168dpi branch and resolves
`min(50vw, 480px)` to the same 206, so it still takes the 400px step; see section 2.1c.) The wave
413 long-task probe after the 421b fix: **0 tasks over 50ms, all assertions passed.**

### 2.1c rel421b MAJOR 1: the class, not the instance, and why it took three passes

**The same mechanism, one band up.** 421b's branches WERE divided by a density. They were divided
by the **best** density in their band rather than the worst:

| branch after 421b | band it served | cap | worst density in it | asked |
|---|---|---|---|---|
| `(min-resolution: 144dpi) min(50vw, 640px)` | 1.5x to 2x | 640 = 960 / 1.5 | 1.99x | **1274** |
| `(min-resolution: 192dpi) min(50vw, 480px)` | 2x to 3x | 480 = 960 / 2 | 2.99x | **1434** |

Both are over 960, there is no candidate between 960 and the 1672px source, so **both readings are
the source**. The file's own comment printed 1274 and 1440 directly under a heading that said "at
most 960"; it presented them as ceilings that had been accepted, and they were the fault written
down. Whom that reached, measured by the same model this report's tables use:

| machine | viewport, density | device px asked | 421b served | base `"320px"` served | delta |
|---|---|---|---|---|---|
| Windows 175 per cent scaling, 4K laptop | 2194 at 1.75 | 1120 | **1672 (199 KB)** | 640 (61 KB) | **+138 KB** |
| 1.99x desktop | 1905 at 1.99 | 1274 | **1672** | 640 | +138 KB |
| Retina Mac at 110 per cent zoom | 1375 at 2.2 | 1056 | **1672** | 960 (124 KB) | **+75 KB** |
| Retina Mac at 125 per cent zoom | 1210 at 2.5 | 1200 | **1672** | 960 | +75 KB |
| 2.99x over 768 CSS px | 1008 at 2.99 | 1435 | **1672** | 960 | +75 KB |

**Three passes each fixed the band the last reviewer named**: the 2x case by this wave's own review
sub-agent, 1x to 1.5x by rel421, and these two by rel421b. That pattern is the finding. 421c
therefore does **both** of the things the verdict offered rather than choosing the cheaper one.

**(a) The guard: the original leaves this image's candidate list.** `variantSrcSet` takes
`withOriginal: false` and the hero's ground is the one image on the site that uses it, so its
`srcset` is **400, 640 and 960 and nothing else**. Read off the prerendered HTML at the 421c head:

```
srcset="/images/hero-ground-street-400.webp 400w,
        /images/hero-ground-street-640.webp 640w,
        /images/hero-ground-street-960.webp 960w"
src="/images/hero-ground-street.webp"
```

**No arithmetic error in `sizes` can select a file that is not a candidate.** The worst a future
mistake can now do to this image is serve the 960px step to a screen that could have used more,
which is a soft picture rather than a 199KB decode on the home page's critical path. The original
stays on `src`, so a browser with no `srcset` support is unaffected, and photographs a reader is
meant to look at keep theirs: the rule and its limit are both written at the function.

**(b) The optimisation: each band capped by its own upper bound.** Seven branches, each cap 960
divided by the worst density that branch can serve, with the bands split wherever that would
otherwise exceed 960. Every band edge checked: **1.5x asks 816, 1.75x asks 840, 2x asks 768, 2.5x
asks 800, 2.99x asks 957, 3x asks 960**, and every one of them still resolves to the 960px step, so
the split makes **no machine's picture softer** than the four-branch version it replaces. Two edges
it cannot cover are named in the source rather than hidden: 100dpi is 1.0417x, so a custom Windows
scaling of 102 per cent still falls through to the 1x branch, and the 3x branch is unbounded above.
Neither can select the original any more, which is the point of doing both halves.

**(c) The instrument, by rule rather than by machine.** `VARIANT_PROFILES` was twelve rows drawn
from the rel421 verdict's own table, so it sampled that verdict's band and the **safe edges** of the
two bands above it, and the gate was green on a site its own assertion would have failed if it had
looked one density further in. The rule is now written at the list: **every band in
`SIZES_HERO_GROUND` contributes a profile at the worst density it can serve, at a viewport wide
enough for its cap to bind.** That adds 1905 at 1.75, 1905 at 1.99, 1210 at 2.5 and 1008 at 2.99,
making sixteen. The width matters as much as the density: under about 768 CSS pixels at 2.5x and
about 1100 at 1.75x the `50vw` half of `min()` binds instead of the cap, which is why the phone
profiles at 1.75x and 3x were green throughout and proved nothing about those bands.

**Proved by two mutations, because the two halves have to be shown to be independent.**

| mutation | what was reverted | result |
|---|---|---|
| **A** | the original put back into the `srcset`, the seven branches kept | **all sixteen green.** The branches alone are sufficient |
| **B** | the original put back **and** 421b's four-branch `sizes` restored | **exactly the four new profiles red**, with the gate's own message, and no others |

Mutation B reproduces the rel421b verdict's arithmetic on a real browser, row for row. Outputs at
`docs/wave421/gate421-mutation-a.txt` and `gate421-mutation-b.txt`. With both halves restored the
run is green and the wave 413 long-task probe reads **0 tasks over 50ms**.

**Why 960 and not the 1672px original, which is what "the widest sensible variant" would mean.**
The candidates are 400, 640, 960 and the source; `scripts/wave414-responsive-images.py` encoded a
1440 step at 225KB against a 199KB source and refused it by its own rule, so any request over 960
device pixels jumps straight to 1672 by 941, which is seventeen times the pixels of the 400px
step. That decode is main-thread work and it is measurable: with `100vw` in place,
`scripts/wave413-motion.py` failed its zero-budget long-task probe on **one run in two**, with
tasks of 67ms and 185ms during a full scroll of the home page, against a base that is clean five
runs out of five.

⚠ **THE SENTENCE THAT USED TO STAND HERE WAS "`sizes` now asks every density for at most 960 device
pixels", AND IT WAS FALSE WHEN IT WAS WRITTEN, TWICE.** After wave 421 it was false for every
density between 1x and 1.5x, and after 421b it was still false for every density strictly inside
1.5x to 2x and 2x to 3x, where the branches were capped for the best density in their band rather
than the worst. It is **true of the seven branches that ship at the 421c head**, and each one's
cap is 960 divided by the worst density it can serve:

```
(min-resolution: 288dpi) min(50vw, 320px),   /* 3x and up:     960 at 3x        */
(min-resolution: 240dpi) min(50vw, 320px),   /* 2.5x to 3x:    957 at 2.99x     */
(min-resolution: 192dpi) min(50vw, 384px),   /* 2x to 2.5x:    956 at 2.49x     */
(min-resolution: 168dpi) min(50vw, 480px),   /* 1.75x to 2x:   955 at 1.99x     */
(min-resolution: 144dpi) min(50vw, 544px),   /* 1.5x to 1.75x: 947 at 1.74x     */
(min-resolution: 100dpi) min(50vw, 640px),   /* just over 1x:  954 at 1.49x     */
min(100vw, 960px)                            /* exactly 1x:    960              */
```

**Every figure in that block is under 960, and so is every band edge**: 1.5x asks 816, 1.75x asks
840, 2x asks 768, 2.5x asks 800, 2.99x asks 957 and 3x asks 960. All of them still resolve to the
960px step, so **the split makes no machine's picture softer** than the version it replaces.

**Five drafts of this line were wrong** and each one was caught by measurement rather than by
reading:

1. `320px`, the base. A 400px file across 1905.
2. `(min-resolution: 2x) 50vw, 100vw`. Lighthouse mobile emulates 412 CSS pixels at a density of
   **1.75**, under 2x, so the phone fell through to `100vw` and took the 960px step: the home
   page went from 957 KiB to **1,020 KiB** and its performance score from 67 to 66.
3. `(min-resolution: 1.5x) 50vw, min(100vw, 960px)`. The review sub-agent worked the arithmetic
   and found that a **2x desktop** matches the first branch, asks for 50vw of 1905 at two device
   pixels, needs 1905, and takes the 1672px original: the exact decode the 960 cap exists to
   prevent, handed to the machines most likely to be running the site. The gate could not see it,
   because every context it opens is `device_scale_factor=1`.
4. The three-branch version that shipped for review. It fixed 1.5x, 2x and 3x and left the band
   between 1x and 1.5x on the undivided fallback, so the **same** original went to every desktop
   at 125 per cent scaling or 110 to 133 per cent zoom. The rel421 verdict found it, by the same
   arithmetic, through the same blind spot in the same instrument. See section 2.1b.
5. The four-branch version 421b shipped. It fixed the band it was asked about and left the two
   above it capped for the **best** density in their band: 640 is 960 divided by 1.5 and 480 is
   960 divided by 2, so 1.99x asked 1274 device pixels and 2.99x asked 1434, and both took the
   original. The comment **printed 1274 and 1440** under a heading that said "at most 960". The
   rel421b verdict found it, and observed that three passes had each now fixed the band the last
   reviewer happened to name. See section 2.1c.

**`dpi` rather than `x`, and the residual.** `min-resolution` in `dpi` has been understood since
Chrome 29 and in Firefox since long before this site; the `x` unit did not reach Firefox until
113 and Safari understood neither until 16. A browser that cannot parse the feature reads the
condition as false and falls through to the 1x branch, where the density multiplication then
picks the original: **on Safari 15 and earlier a 390px phone at 3x asks for 1170 and takes the
199KB file.** That is a real cost on a shrinking share of phones and it is the price of not
capping the 1x branch so low that a 1x desktop is served a soft picture. It is named in the
source rather than left to be found.

### 2.2 Every other full-bleed decorative image, as the brief asked

Section A2 of the gate reports every `<img>` on every page whose chosen source is under 75% of
its own rendered box. **Thirteen readings, ten distinct images, and none of them is fixed here.**

| src | `sizes` | box | served | ratio | opacity | verdict |
|---|---|---|---|---|---|---|
| `why-estate-aerial.webp` | `(min-width: 768px) 50vw, 100vw` | 1280 | 640 | 0.500 | **0.1** | decorative wash, left |
| `platform-finder.webp` | `(min-width: 768px) 50vw, 100vw` | 1134 | 640 | 0.564 | 1 | **content**, left, see below |
| `ai-team/petra-point.webp` | none | 798 | 338 | 0.424 | 1 | content, left |
| `ai-team/peter-present.webp` | none | 399 | 281 | 0.704 | 1 | content, left |
| `ai-team/pippa-present.webp` | none | 399 | 271 | 0.679 | 1 | content, left |
| `partners/connected-network-investor.png` | `(min-width: 768px) 50vw, 100vw` | 1134 | 640 | 0.564 | 1 | content, left |
| `partners/connected-network-local-authority.png` | same | 1134 | 640 | 0.564 | 1 | content, left |
| `ai-team/petra.webp` | `(min-width: 1024px) 200px, 30vw` | 197 | 117 | 0.594 | 1 | portrait, left |
| `ai-team/peter.webp` | same | 197 | 117 | 0.594 | 1 | portrait, left |
| `ai-team/pippa.webp` | same | 197 | 117 | 0.594 | 1 | portrait, left |

**Only one of the ten is a full-bleed decorative wash like the hero's**: `why-estate-aerial.webp`
at 0.1 opacity, and at 0.500 of its box it is nowhere near the 0.21 that made the hero soft.
Every other row is a picture a reader is meant to LOOK at, several at full opacity, and at 0.42
to 0.70 of their boxes on a 1x screen they are soft in a way that matters more than the hero's
ground did. **Fixing them is not this wave.** They are on `/platform`, `/about` and the partner
pages, none of which this brief scopes, each needs its own `sizes` judgement, and the wave 414
note in `responsive-image.ts` is explicit that a `sizes` which overstates costs the whole
difference. **Proposal 3 in section 9 asks Callum for a wave that does them properly.** The list
is printed on every run of the gate so it cannot be forgotten.

### 2.3 The opacity, and why 0.2

The photograph rested at 0.07 under a white scrim at 86 / 72 / 90 per cent. It now rests at
**0.2** under a white scrim at 82 / 62 / 88 per cent, with a wash of `--color-tint-orange` over
it at 23 / 50 / 30 per cent.

The number was chosen by **looking at the rendered shot at 1280, 768 and 390**, which is the only
way it can be chosen. `docs/wave421/tune.py` drives the built page and injects each candidate as
a stylesheet, so a candidate costs a page load rather than a rebuild and every other pixel on the
page is identical. Its warmth figure (how much redder than bluer the mean of the hero's own
ground pixels is, photographs and glyphs excluded; flat white is 0 and the site's cream is +17)
moves by **four tenths of a unit across the whole 0.14 to 0.24 range**, because the wash
dominates the mean. So the mean cannot decide it. The shots can:

| opacity | what the shot shows |
|---|---|
| 0.14 | the ground is warm and the street is not in it. Callum's fault, in a warmer colour |
| 0.16 | the street is findable at 390 and not at 1280 |
| **0.20** | the brick courses and window heads read as texture at 390, where the ground is most exposed, and as a haze at 1280, where the three photographs cover the middle. **CHOSEN** |
| 0.24 | it starts to read as a photograph behind the role tiles and competes with the three the hero exists to show |

The side-by-side comparisons are at `docs/wave421/tune/r2-full.png` (1280, head against 0.16,
0.20 and 0.24) and `r2-390.png` (the same at 390, where the street is most visible), with the
first round's wash-against-filter strip at `compare-full.png` and `compare-ground.png`. The
per-candidate full-page shots were deleted after the composites were made; `tune.py` regenerates
them. The chosen result is at `docs/wave421/hero-after-1280.png`, `hero-after-390.png` and
`hero-after-1905.png`.

### 2.4 The warming method, with both measurements

The brief allowed a low-alpha orange wash or a `sepia()` plus `hue-rotate()` filter, and asked
for the warmer ground at the lower dark-pixel cost. Both were measured on the same build at 1280,
768 and 390 by `docs/wave421/tune.py`:

| method | hero mean RGB at 1280 | warmth (R minus B) | raw dark share | page-ground share |
|---|---|---|---|---|
| base, no warming, photograph at 0.07 | (252.0, 251.8, 251.5) | **+0.5** | 23.64% | 9.16% |
| **B**, `sepia(0.72) hue-rotate(-12deg) saturate(1.35)`, photograph at 0.18 | (249.5, 248.7, 247.8) | **+1.7** | 23.64% | 9.16% |
| **A**, orange wash over a lighter white scrim, photograph at 0.18 | (247.4, 244.0, 242.3) | **+5.1** | 23.64% | 9.16% |

**The wash is three times the warmth at the same dark-pixel cost, to the hundredth of a point at
every width.** The reason is not subtle once measured: a filter can only warm the pixels the
photograph actually paints, and at a fifth of its own strength the photograph paints almost
nothing, so `sepia()` had almost nothing to act on. The wash warms the whole plane. The filter is
not in the shipped CSS.

The result reads as a warm cream-to-white haze with the street just visible in it. It is not an
orange block: the orange layer is a gradient of `--color-tint-orange` (itself orange-500 at 12%)
at 23 / 50 / 30 per cent, so the strongest point is orange-500 at **six per cent**.

**No new colour token was needed.** `--color-tint-orange` and `--color-page` already existed.

### 2.5 The contrast table, before and after, measured off the rendered pixels

Every row is the element's own computed colour composited onto the **modal non-glyph pixel inside
its own box**, read from a full-page screenshot, which is how `scripts/wave412-screenshots.py`
measures an axe INCOMPLETE node. Not one figure here is taken from the table in `CLAUDE.md`:
nothing in the hero sits on flat white any more, so no row of that table describes it.

**The hero, at 1280.** The ground column is the pixel the glyphs actually sit on. The last two
columns are the ones the gate has always computed and this report used to withhold (421b, rel421
MINOR 3): the DARKEST non-glyph pixel inside the same box, and what the ink reads on it.

| pair | px / weight | ground before | before | ground after | after | worst ground | on worst | floor |
|---|---|---|---|---|---|---|---|---|
| the navy headlines | 46 / 800 | (253,253,253) | 18.51 | (246,240,238) | **16.70** | (13,28,52) | 1.11 | 3.0 |
| the orange headline "Delivering Support." | 46 / 800 | (251,251,251) | 4.08 | (237,232,230) | **3.48** | (196,105,73) | 1.10 | 3.0 |
| the wait-list sub-line | 15 / 400 | (251,251,251) | 18.20 | (236,231,229) | **15.36** | (13,29,52) | 1.11 | 4.5 |
| a role tile name | 14 / 600 | (255,255,255) | 18.83 | (255,255,255) | **18.83** | (16,31,56) | 1.14 | 4.5 |
| a role tile purpose line | 13 / 400 | (252,252,251) | 6.79 | (245,240,237) | **6.17** | (91,101,119) | 1.19 | 4.5 |
| the "Powered by" credit | 10 / 700 | (253,253,253) | 4.79 | (247,243,241) | **6.32** | (91,101,119) | 1.19 | 4.5 |

**The hero, at 390.**

| pair | px / weight | before | after | worst ground | on worst | floor |
|---|---|---|---|---|---|---|
| the navy headlines | 37 / 800 | 18.39 | **15.96** | (13,28,52) | 1.11 | 3.0 |
| the orange headline "Delivering Support." | 37 / 800 | 4.13 | **3.57** | (199,111,80) | 1.17 | 3.0 |
| the wait-list sub-line | 15 / 400 | 18.20 | **15.52** | (13,28,52) | 1.11 | 4.5 |
| a role tile name | 14 / 600 | 18.83 | **18.83** | (14,30,54) | 1.13 | 4.5 |
| a role tile purpose line | 13 / 400 | 6.62 | **5.97** | (91,101,119) | 1.19 | 4.5 |
| the "Powered by" credit | 12 / 700 | 4.83 | **6.38** | (91,101,119) | 1.19 | 4.5 |

⚠ **READ THE WORST-GROUND COLUMN FOR WHAT IT IS, AND THIS IS WHY IT IS NOT ASSERTED.** It is the
darkest pixel in the box that is not within tolerance of any ink in the neighbourhood, and on a box
drawn tightly round a line of type the darkest such pixel is **the element's own anti-aliased glyph
edge**, not the photograph. The role tile name proves it: its modal ground is flat white 18.83:1
and its "worst ground" is (16,31,56), which is the navy of its own letterforms part-way through
their anti-aliasing. Every row in these two columns reads near 1.1 for the same reason, and
**none of them is a contrast reading of ink against ground**. Asserting this column would fail
every legible page on the site.

**The number that does bound the orange headline is the LAYER STACK, and it is 3.33:1.** The
rel421 verdict derived it and this wave recomputed it from the sRGB coefficients rather than
taking it on trust. The darkest ground the hero can produce at any pixel is a **black** photograph
pixel at `opacity: 0.2` over the white page, giving (204,204,204); under the white scrim at its
**thinnest** point, 62 per cent, giving (235.6,235.6,235.6); under the orange wash at its
**strongest**, 50 per cent of `--color-tint-orange`, which is orange-500 at 12 per cent and so an
effective alpha of 0.06, giving **rgb(233, 227, 225)**. Orange-500 `#c15f3c` has a relative
luminance of 0.19846 and that ground 0.77700, so the pair is `(0.77700 + 0.05) / (0.19846 + 0.05)`
= **3.328:1**. So the pair cannot fall under 3:1 **at any pixel, at any width, whatever the
photograph does**, and the unasserted column is not hiding a sub-floor reading. The measured
modal readings of 3.48 and 3.57 sit where they should, between that bound and the 4.23:1 the
orange makes on flat white.

**Every pair passes.** The worst is the orange headline at **3.48:1 against its 3:1 floor** at
1280, which it answers to at 46px and weight 800; it was 4.08:1 over the old near-white ground.
The ground did not have to move for it: the ruling of wave 295 is that where a pairing fails the
surface moves and never the orange, and this pairing does not fail.

**The one pair that did fail, and what moved.** The Zoopla credit's "POWERED BY" label is
`ink-soft`, 4.87:1 on flat white, and the warm ground cost it 0.45: the gate measured it at
**4.42:1 at 1280 and 4.46:1 at 390**, a fail on both. It is now `ink-muted` and reads 6.32:1 and
6.38:1. **The ink moved and not the ground, and that is not a breach of wave 295's ruling**:
that ruling protects the one orange, which may not be lightened to pass. This is the site's own
neutral scale, where `CLAUDE.md` already says `ink-soft` is for white cards and fails as body copy
on the cream, and the ground under this line is now nearer the cream than the white. Wave 412 made
exactly this move in the footer for exactly this reason.

**The Zoopla mark itself.** It is a graphic, not text, and it answers to the 3:1 of SC 1.4.11.
Its comment claimed 5.15:1, which was a reading against flat white. Re-measured on the new ground
at 390, where its box has ground in it to read: the ring reads rgb(249, 244, 242) and Zoopla's
purple on it is **4.65:1 modal, 4.72:1 darkest**. The comment now says so.

**The worst ground pixel is read and printed beside the modal one and is NOT asserted**, and the
gate's docstring says so plainly. Over a photograph the darkest pixel a glyph touches is always
worse than the modal one, for any word over any picture; it is not the pair WCAG measures. The
column is printed so a pair that only just passes on average cannot pass silently.

---

## 3. The ratchet: it did not move, and that is the measurement

The brief expected `RAW_CEILING` to rise and instructed that it be re-baselined in the same
commit. **It did not rise. It is therefore not re-baselined**, and the reasoning is written at
the number in `scripts/wave412-screenshots.py` rather than a new figure, because a ratchet moved
without a measurement behind it is the thing the rel412 verdict objected to.

**Seven readings at the head, 1280 raw, in the order taken:**

```
23.56%   23.53%   23.67%   23.52%   23.53%   23.52%   23.52%
```

and **16.57% at 390 on every one of them**. Against the base `e07b7f4`, read by the same script on
the same machine: **23.53% and 23.57% at 1280, 16.58% at 390**. The head's median is 23.53% and
the base's two readings straddle it.

| figure | base | head, worst of seven | head, median | ceiling | verdict |
|---|---|---|---|---|---|
| raw, 1280 | 23.53%, 23.57% | 23.67% | 23.53% | 0.2370 ratchet | holds |
| raw, 390 | 16.58% | 16.57% | 16.57% | 0.1670 ratchet | holds |
| **page ground, 1280** | 8.99%, 9.04% | **9.20%** (worst of these seven) | 8.98% | **flat 15%** | holds by 5.80 points |
| **page ground, 390** | 7.26% | **7.25%** | 7.25% | **flat 15%** | holds by 7.75 points |

**The 23.67% is an outlier and it is left in**, because a distribution with its worst reading
deleted is not a distribution. It is 0.03 under the ceiling. The same run read the ground figure
at 9.20% against a median of 8.98%, so **the whole page was darker on that shutter rather than the
hero**: the council marquee's plates are outside the ground masks, the crests on them are dark,
and the file's own note already measures that at a tenth of a point. This page has read 23.64% and
23.65% on heads before this wave, so 23.67% is not out of family for it.

**Neither figure is lowered either.** The existing note records a spread of up to 0.17 of a point
across eight readings of one build; 0.15 of headroom at 1280 is already less than that spread, and
a ratchet that fails on a phase of the marquee is worse than no ratchet.

⚠ **TWO SAMPLES OF THE GROUND SHARE ARE QUOTED IN THIS WAVE AND THEY ARE NOW LABELLED** (421b,
rel421 MINOR 2). **9.20% is the worst of the SEVEN readings in this section**, taken for the
ratchet. **9.02% is the worst of the THREE readings quoted in `src/styles.css`**, taken beside the
raw figures that block quotes. Both clear the flat 15% by more than five points, both are readings
of the same head, and the wider sample is the one to quote when a single "worst" is wanted. The
four places the verdict found disagreeing, `scripts/wave412-screenshots.py` at its two lines,
`src/styles.css`, this table and the closing, each now name the sample the figure came from.

**Why it costs nothing: every pixel the new ground adds is a LIGHT pixel.** A photograph at 0.2
under a white scrim at 62 per cent cannot cross the 0.2 relative luminance the gate counts as
dark. A page that is visibly warmer is not measurably darker.

---

## 4. The footer: the mechanism, the ruling, and every divider on the site

### 4.1 The mechanism, in one paragraph

The footer's arch is a transparent strip `clamp(36px, 4.5vw, 80px)` tall containing one stretched
`<svg>` whose single path fills a dome: it runs bottom-left, bows above the top of the viewBox and
closes bottom-right. Everything outside the dome, which is the two top corners of the strip, is
transparent, and because the footer itself is transparent those corners showed the white page
behind. The path was filled with `--color-mist-bg`, cream, and the footer body below it was
`.section-light`, cream. That was correct while every route's last section was white: white
corners, cream dome, cream footer. Wave 412 made five of the thirteen routes end on the cream band
instead, and on those the page painted **cream, then a white strip with a cream arch sitting in
it, then cream**. That white strip is the "broken white part" in Callum's screenshot.

### 4.2 R421-1

> **2026-09-19, Callum Saxon (R421-1):** the site footer is WHITE and the curve reads cream into
> white. Callum offered two ways out, "maybe change the footer to navy, or switch it to white so
> it's still curved and stands out as a section, but doesn't have that broken white part", and the
> operator chose white: wave 412 declared exactly TWO navy islands on this site, the demand map's
> plate and the crisis card, and a navy footer would be a third and the largest block on the page,
> undoing on the last screen the thing Friday's whole brief was about. The crisis card stays navy
> and separates MORE from white than it did from the cream.

Recorded in `Closed-Rulings.md`. **Callum can overrule it**; the navy version is a two-line change
and a new island declaration.

### 4.3 The fix, which is structural rather than a second colour

**The rule, written into `SiteFooter` as a comment because the next person to change a band's
colour will otherwise break this again: a curved divider's BACKGROUND must be the colour of the
section ABOVE it, and its SHAPE must be the colour of the section BELOW it.**

The brief prescribed cream for the background and white for the shape. **That would have broken
eight routes**, and the measurement is in section 10. Instead the strip is **pulled up over the
page's last band by exactly its own height**, so its transparent corners show that band's own
ground on every route and on every route added later. Nothing declares the colour above, so
nothing can declare it wrongly.

- `.footer-arch` carries `height: clamp(36px,4.5vw,80px)` and `margin-top: calc(that * -1)`.
- `#main > :last-child` is given exactly that height of extra `padding-bottom`, so the arch takes
  back space that was added for it. **The page is the same height it was** and the spacing between
  the last line and the footer is unchanged. Without this half, the arch buried the home page's
  "Public data used under licence" credit: its closing band ends `py-10`, 40px, against a 57.6px
  arch at 1280. That screenshot exists and it is why the padding is there.
- The dome is filled `var(--color-page)`, the footer's own ground.
- A second path draws the arc alone, `fill="none" stroke="var(--color-rule)"` at 1px with
  `vector-effect="non-scaling-stroke"`. **Eight of the thirteen routes end white**, and there a
  white dome on a white ground is a curve nobody can see; the hairline is the same rule the site
  draws every other section boundary with, so the footer still reads as its own section on every
  route. On the five cream-ending routes the colour sweep carries it as well.
- The control points moved from y=-47 to y=-44. For this cubic the apex is at
  `(140 + 3a + 3a + 140) / 8`, so -47 put it a quarter of a unit **above** the top of the viewBox:
  invisible with a fill, but a 1px stroke centred there had its upper half clipped by the strip's
  `overflow-hidden` across the middle of the arc, and on a white-ending route that hairline is the
  whole boundary. -44 puts the apex at y=+2, about one device pixel inside the clip, and both paths
  carry the same number so the stroke stays on the fill's own edge.
- `-mb-px` and the `clamp(36px,4.5vw,80px)` height are kept, as the brief asked.
- **The crisis card is untouched.** It is still `section-dark`, still navy, still first in the
  footer's markup on a phone.

### 4.4 Every curved divider on the site

`rg -n 'M0 140 C' src/` and `rg -n 'preserveAspectRatio="none"' src/` both return **exactly one
hit**, in `src/components/site-footer.tsx`. There is one curved divider on this site and it is
drawn on every route by the shared footer. The gate finds them by shape rather than by that
knowledge, asserts the count, and reads the colours off the shot at 1280 and 390.

**The brief's second sweep, `rg -n 'mist-bg' src/`, which this report skipped** (421b, rel421
MINOR 5). It is the sweep that would name any OTHER place the cream is assumed, and it returns
**15 hits in 6 files. None is a divider and none is a band's ground.** (421c, rel421b MINOR 1:
this prose said "14 hits in 7 files" over a table of 15 in 6. The sweep was re-run and this is what
it prints; the table below was right and the sentence over it was a transcription slip.)

| where | hits | what the cream is doing | verdict |
|---|---|---|---|
| `src/styles.css` | 4 | the token declaration `--color-mist-bg: #f7f1e6`, the note that `--color-page-alt` is the same value, and two comments | the definition |
| `src/components/site-footer.tsx` | 4 | `text-[var(--color-mist-bg)]` inside the crisis card | **INK on the navy island**, not a ground. Untouched by this wave and correct: cream type on navy-950 |
| `src/components/partners/partner-page.tsx` | 3 | `bg-mist-bg` on two bordered cards, and one horizontal gradient behind a band | cards and a fade on `/partner-with-*`, nowhere near the footer |
| `src/components/partners/partners-hub.tsx` | 2 | `bg-mist-bg` on the hub's tiles | tiles |
| `src/routes/about.tsx` | 1 | a `from-`/`to-` marquee fade | a fade over a band, not the band |
| `src/routes/solutions.tsx` | 1 | a vertical `-z-10` gradient | the same |

**Nothing in that list assumes the cream is the colour of a section ABOVE or BELOW anything**, so
nothing else on the site carries the fault this wave fixed. The four in the footer are the case
worth naming twice: they are cream INK inside the navy crisis card, so making the footer's ground
white changed nothing about them, which is why the crisis card needed no re-measurement.

| route | section above | background | shape | section below | before | after |
|---|---|---|---|---|---|---|
| `/` | cream (247,241,230) | cream | white | white | **MISMATCH** | correct |
| `/about` | white | white | white | white | correct | correct |
| `/platform` | white | white | white | white | correct | correct |
| `/the-problem` | white | white | white | white | correct | correct |
| `/solutions` | white | white | white | white | correct | correct |
| `/partners` | white | white | white | white | correct | correct |
| `/contact` | white | white | white | white | correct | correct |
| `/register` | cream | cream | white | white | **MISMATCH** | correct |
| `/register/investor` | cream | cream | white | white | **MISMATCH** | correct |
| `/register/resident` | cream | cream | white | white | **MISMATCH** | correct |
| `/partner-with-investor` | white | white | white | white | correct | correct |
| `/partner-with-local-authority` | white | white | white | white | correct | correct |
| `/legal` | cream | cream | white | white | **MISMATCH** | correct |
| `/this-route-does-not-exist` | no footer | n/a | n/a | n/a | n/a | n/a |

**Five routes were broken, not thirteen**, and eight were already correct. Both widths agree on
every row. The 404 has no footer at all: `dist/client/404.html` is a 1,039-byte standalone shell
with no header, no footer and none of the site's chrome, which is why its fifteen footer pairs and
its divider are absent. The gate names it in `PAGES_WITHOUT_FOOTER` rather than forgiving an empty
result, so a footer vanishing from a real page still fails.

The 1280 shots of the boundary are at `docs/wave421/arch-after.png` and the 390 shots at
`docs/wave421/arch-after-390.png`.

---

## 5. The footer's ink, re-measured on white

Every pair read off the rendered pixels at 1280. The ground moved from cream (247,241,230) to
white (255,255,255) for every row that was on the band; the three registration cards were already
white `.panel`s and did not move.

| pair | px / weight | before, on cream | after, on white | floor |
|---|---|---|---|---|
| the funnel headline, navy beats | 30 / 800 | 16.75 | **18.83** | 3.0 |
| the funnel headline, orange beat | 30 / 800 | 5.78 | **6.50** | 3.0 |
| the pre-release badge | 11 / 600 | 4.67 | **5.25** | 4.5 |
| the "30+ years" line | 14 / 700 | 5.78 | **6.50** | 4.5 |
| the company description | 12 / 400 | 6.20 | **6.97** | 4.5 |
| a column heading | 12 / 700 | 4.67 | **5.25** | 4.5 |
| a site link | 13 / 400 | 6.20 | **6.97** | 4.5 |
| a contact line | 13 / 400 | 6.20 | **6.97** | 4.5 |
| the opening hours | 13 / 400 | 6.20 | **6.97** | 4.5 |
| the "Become a Partner" link | 13 / 600 | 4.67 | **5.25** | 4.5 |
| a registration card label | 13 / 600 | 18.83 | **18.83** | 4.5 |
| a registration card detail | 11 / 400 | 4.87 | **4.87** | 4.5 |
| a registration verify link | 11 / 600 | 5.25 | **5.25** | 4.5 |
| a legal link | 13 / 500 | 6.20 | **6.97** | 4.5 |
| the legal notice | 11 / 400 | 6.20 | **6.97** | 4.5 |

**Every pair improved or held, and none moved to a darker ink**, because white is a lighter ground
than the cream and the cream was the binding one. The narrowest is the registration card detail at
4.87:1, unchanged: it is `ink-soft` on a white `.panel`, which is the pairing `CLAUDE.md` licenses.
At 390 the same fifteen read the same or better, because several of them step up in size under
`max-lg:`.

**Fifteen named pairs are a sample, not an inventory, and the report should not pretend otherwise.**
The inventory is `scripts/wave412-screenshots.py`: it runs axe over every node of every page and
measures every node axe cannot resolve off the shot. At the head that is **275 incomplete nodes
across 28 shots, all 275 measured, 0 unmeasured, and 0 serious or critical colour-contrast
violations**. The named fifteen are the ones whose ground this wave moved.

**The crisis card is unchanged and still navy**, so its white-on-navy-950 at 19.73:1 is untouched.
It now separates from a white footer rather than a cream one, which is more contrast between the
plate and its surround, not less.

---

## 6. The gate at the final head

Build `STATIC_BUILD=true bun run build` then `node scripts/pages-postbuild.mjs dist/client` before
every gate run. All runs in the foreground.

| check | command | rc | result |
|---|---|---|---|
| Working tree | `git status --porcelain` | - | clean of strays before and after; only the intended files and the re-shot screenshots |
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors** |
| Lint, changed files | `bunx eslint` on the five changed source files, LF-normalised | **0** | **0 errors, 0 warnings** |
| Lint, whole tree, head | `bunx eslint .` on an LF-normalised tree | 1 | **387 errors / 15 warnings** |
| Lint, whole tree, base | the same figure, standing since wave 414 | 1 | **387 errors / 15 warnings. DELTA ZERO** |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered** |
| Postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | see the defect in section 10 |
| Wave 412 | `python scripts/wave412-screenshots.py` | **0** | **28 shots**, ratchet unmoved with its note, **275 incomplete nodes, 275 measured, 0 unmeasured**, 0 axe violations |
| Wave 413 | `python scripts/wave413-motion.py` | **0** | **13 routes**, 0 long tasks, `REQUIRED_WASH["/"]` at 0.2 |
| Wave 414 images | `python scripts/wave414-responsive-images.py --check` | **0** | 71 images, every variant present, **24 alpha sources and every variant keeps its alpha** |
| Wave 414 mobile | `python scripts/wave414-mobile.py` | **0** | **70 shots**, 660 headings, 0 overflow, 0 axe violations |
| Wave 421 | `python scripts/wave421-hero-and-footer.py` | **0** | **12 variant profiles across four densities**, **402 pairs measured with none missing**, **26 dividers, all correct**, **13 last-child paddings, none a utility** |
| Dash count | added lines, U+2014 and U+2013 | - | **0 and 0** over everything hand-written: 2,354 added lines across `src/`, `scripts/`, this report and `docs/wave421/tune.py`. See the note under this table |
| Content | `git diff e07b7f4...HEAD -- src/content` | - | **empty** |
| Lighthouse | `bunx lighthouse` 13.5.0, mobile preset, gzipping server | - | section 7 |

**Nothing in the brief's gate list was skipped.** `scripts/wave295-*`, `scripts/wave298-*` and
`scripts/wave358-registration.test.ts` are outside this brief's list, as in waves 415 and 414.

⚠ **WHAT THE DASH COUNT EXCLUDES AND WHY.** It is 0 and 0 over every line this wave wrote. Six
files under `docs/wave421/` DO carry dashes on added lines and every one of them is a verbatim
capture of another program's stdout, kept as evidence rather than written:
`gate412-before.txt`, `gate412-after-run1.txt`, `gate412-r1.txt`, `gate412-r2.txt`,
`gate412-r3.txt` (15, 15, 14, 14 and 14 hits, which are the site's own existing copy echoed back
by the axe pass) and `lint-head.txt` (20, which are eslint's own arrows and rules). The
`lh-*.json` Lighthouse dumps are excluded for the same reason. Rewriting a program's output to
satisfy a prose rule would make it stop being evidence.

**Three flakes were seen at this head and all three are named rather than hidden.** (421c,
rel421b MINOR 1: this sentence said "two" over a numbered list of three, in wave 421's report and
again after 421b.)

1. **The wave 413 long-task probe, once in fourteen runs, a single 60ms task.** Before the 960 cap
   and the compositor promotion it was **two in four, at 67ms, 172ms and 185ms**; the base is
   clean five in five. The final configuration is 13 clean runs in 14 and the recorded run is
   clean. The residual is a 60ms task, ten milliseconds over the threshold, on a machine running
   four other Claude Code sessions. **It is a real residual and it is not claimed to be gone.**
2. **The wave 412 reveal probe on `/partner-with-investor`, once**, with the message "no `.reveal`
   carried data-revealed within 20000ms, so the bundle never hydrated": the probe throttles the
   network and the machine was loaded. Nothing in this wave touches that route's hydration. It
   passed on every other run.
3. **The wave 413 magic-line probe on `/about`, once in eight**, at 65.45px against a link of
   66.28px. That probe measures the header's active-route underline; this wave changes nothing in
   the header, and the header is outside `<main>` and unaffected by the padding rule.

---

## 7. Lighthouse mobile, before and after

`bunx lighthouse` 13.5.0, default mobile preset with simulated throttling, against a gzipping
server: a 42-line Node server written for the run and deleted after it, because Python's
`SimpleHTTPRequestHandler` does not gzip and GitHub Pages does.

| route | perf before | perf after | a11y | best practices | SEO | CLS | bytes before | bytes after |
|---|---|---|---|---|---|---|---|---|
| `/` | 67 | **66** | **100** | **100** | 100 | **0** | 957 KiB | **922 KiB** |
| `/the-problem` | 85 | **85** | **100** | **100** | 92 | **0** | 421 KiB | **421 KiB** |
| `/register/investor` | 81 | **81** | **100** | **100** | 92 | **0** | 438 KiB | **439 KiB** |
| `/partner-with-investor` | 78 | **78** | **100** | **100** | 92 | **0** | 741 KiB | **742 KiB** |

**Accessibility 100 and best practices 100 hold on all four. CLS is 0 on all four.**

**The home page is 35 KiB LIGHTER than the base at this density, and that is the point of the
`sizes` work.** At Lighthouse's 412 CSS pixels and density 1.75 the base's `"320px"` asked for 560
device pixels and took the 640px step at 61 KiB; the head asks for 361 and takes the 400px step at
27 KiB. The variant did not need to be smaller, because on a phone it got smaller.

⚠ **THE 35 KiB IS DENSITY-SPECIFIC AND THE WHOLE RANGE IS IN SECTION 2.1.** The figure above is a
reading of ONE profile, 412 CSS pixels at 1.75, which is the only profile this instrument
measures. Wave 421 as reviewed was 172 KB HEAVIER than the base at 1.25 and 1.33, which no
Lighthouse run on this list would have shown, and which is why 421b's fix is proved by a browser
at twelve densities rather than by this table. At the 421b head **no profile takes the original**
and every one of the twelve is at or below the 960px step.

**The one point on `/` is inside this instrument's noise and it is not claimed as a win or a
loss.** The caveat waves 414 and 415 both recorded still stands: this machine runs several Claude
Code sessions. Measured on a loaded machine, three readings of the head gave 59, 59 and 60 with a
total blocking time of 350 to 410ms, and **three readings of the BASE taken minutes later on the
same load gave 55, 58 and 60 at 360 to 440ms**. The table above is the quiet-machine pass of both.
TBT at the head reads 140ms against the base's 170ms.

---

## 8. The review sub-agent, and what was done with each finding

One read-only sub-agent over the diff and the new gate, before the final gate run. **Thirteen
findings. Ten were acted on, one is deferred to a proposal, two were corrections to prose.**

| # | severity | finding | what was done |
|---|---|---|---|
| 1 | high | `(min-resolution: 1.5x) 50vw` hands the 1672px original to every HiDPI desktop, the exact decode the 960 cap exists to prevent, and the gate cannot see it because every context is `device_scale_factor=1` | **FIXED.** Four branches, one per density, each asking for at most 960 device pixels. Section 2.1 |
| 2 | high | a contrast pair whose selector matches nothing was skipped, not failed, so reverting the one ink change this wave made would have passed the gate | **FIXED.** Misses are recorded and printed; a pair that resolves on no shot fails the run |
| 3 | high | the divider rule was asserted only on dividers that happened to be found, and nothing asserted one was found | **FIXED.** `DIVIDERS_PER_PAGE` is asserted per shot, with `PAGES_WITHOUT_FOOTER` naming the 404 |
| 4 | medium | `#main > :last-child` is a transparent wrapper on the fifteen routes that render a `<main>` of their own, so the comment's "nothing can declare it wrongly" is false | **COMMENT CORRECTED** to state the limit exactly, and the gate already measures the outcome on every route at both widths. The reviewer confirmed no route is wrong today |
| 5 | medium | the padding rule is unlayered and REPLACES a `pb-*` utility rather than adding to it, and is a no-op for a fixed-height or out-of-flow last child; in each case the arch eats real content | **COMMENT CORRECTED, and a new assertion added**: `check_arch_is_clear` fails on any pixel inside the strip dark enough to be type. That is the failure a reader would see, and the colour rule cannot see it because a covered line is covered by the right colour |
| 6 | medium | browsers with no `min-resolution` support fall through to the 1x branch and a 3x phone then takes the original | **PARTLY FIXED and NAMED.** `dpi` rather than `x` moves the cliff from Firefox <113 and Safari <16 to Safari <16 alone; the residual is written into the source and into section 2.1 |
| 7 | medium | two comments said "every route" where the gate walks 13 pages plus the 404 | **CORRECTED** to say one of every distinct page component, and which |
| 8 | medium | on the eight white-ending routes the divider is white on white with only a 1.17:1 hairline, and the gate's colour rule is satisfied *because* everything is white | **DEFERRED to proposal 1.** It is the honest consequence of R421-1 and it needs Callum, not me |
| 9 | low | the module docstring sold the worst ground pixel as a check; only the inner docstring admitted it is not | **CORRECTED**, with the reason it cannot be one |
| 10 | low | the stroked arc is clipped at its own apex because the curve crosses above the viewBox | **FIXED.** Control points -47 to -44 on both paths. Section 4.3 |
| 11 | low | `styles.css` quoted 23.64% and 9.16% for the shipped build; those were the tuning harness's figures at opacity 0.18 | **FIXED.** The shipped figures are quoted and the harness's are labelled as the comparison that chose the method |
| 12 | low | `image-fade.tsx` still said the hero's ground rests at 7%, and the Zoopla claim of 5.15:1 was against flat white | **FIXED.** Both updated, the Zoopla figure re-measured at 4.65:1 modal / 4.72:1 darkest |
| 13 | low | "every pair of ink and ground in here was re-measured" overstates fifteen hand-named selectors, and `querySelector` reads one element each | **CORRECTED** in the source and in section 5 |

The reviewer also confirmed, and these were checked rather than assumed: the compositor promotion
changes no stacking or clipping; the `ImageFade` transition still lands on 0.2 because
`img[data-img="pending"]` is the more specific of two unlayered rules; the divider tolerance of 4
per channel is far below the 8/14/25 the defect actually is; the arch's negative margin cannot
collapse out because the footer is a flex item; and the arch paints over the last band because the
footer is positioned and later in tree order.

---

## 9. Proposals for Callum, with recommended defaults

1. **The curve is a hairline on eight of the thirteen routes, and a colour sweep on five.**
   R421-1 gives a white footer, so the curve only reads as colour where the band above is cream.
   **Recommended: make the last band of every route cream**, so the sweep reads everywhere and the
   footer stands out as a section on every page rather than on five. That is a one-class change per
   route and it would need the section rhythm re-checked above it. The alternative is to accept the
   hairline, which is what ships today.
2. **The navy footer is still available.** If Callum prefers his first suggestion, it is two lines
   and a third island declaration, and the report records exactly why white was chosen.
3. **Nine images on `/platform`, `/about` and the partner pages are served at 0.42 to 0.70 of
   their boxes on a 1x screen**, several at full opacity. Section 2.2 lists them. **Recommended: a
   small wave that gives each one an honest `sizes`**, using the method proved here. They are
   outside this brief and each needs its own judgement.
4. **The prerender drops 565 characters of its own router payload onto `/contact` as visible text
   on roughly one build in three.** Section 10. The existing guard in `pages-postbuild.mjs` cuts
   it, which removes the visible text; **recommended: a wave that fixes it in the prerender, and
   meanwhile changes the guard from a cut to a splice**, which this wave proved is byte-exact.
5. **`SIZES_HERO_GROUND`'s Safari 15 residual.** A phone on Safari 15 or earlier takes the 199KB
   original. **Recommended: leave it** and revisit if the analytics ever show that share is worth
   a `-webkit-min-device-pixel-ratio` branch.

---

## 10. What this brief got wrong, measured

1. **"The section immediately above is cream" is true of five of the thirteen routes, not all of
   them, and the brief's prescribed fix would have broken the other eight.** The brief says: "The
   divider's background becomes the cream of the section above (`--color-mist-bg`), and the dome's
   fill becomes white (`--color-page`)." Measured off the pixels at the base, the band above the
   footer is **cream on `/`, `/register`, `/register/investor`, `/register/resident` and `/legal`,
   and white on `/about`, `/platform`, `/the-problem`, `/solutions`, `/partners`, `/contact`,
   `/partner-with-investor` and `/partner-with-local-authority`.** A cream strip named literally
   would have painted a cream band between a white section and a white footer on those eight: the
   same defect, mirrored, on more routes than it fixed. The structural fix in section 4.3 is why
   the wave ships the rule rather than the colour.
2. **The dark-pixel ratchet did not move.** The brief says "Raising the hero photograph WILL raise
   the raw figure" and instructs a re-baseline with a comment naming both figures. Seven readings
   say the median is 23.53% at the head against 23.53% and 23.57% at the base. The instruction is
   followed in spirit: the comment is written at the number and it says the measurement found no
   move. Section 3.
3. **The hero does not carry the elements the brief lists.** The brief asks for the contrast of
   "the two headlines, the eyebrow, the sub-line and the ten role tiles". The hero carries **three**
   headlines (Providing Homes, Delivering Support, Transforming Lives), **no eyebrow and no
   button** (the "COMING SOON" badge and "Register to join the waitlist" are in the footer's funnel
   and in the header), the wait-list sub-line, the ten role tiles with their purpose lines, and the
   Zoopla credit. Everything that is there was measured, and the funnel's badge and headline were
   measured too because the footer moved under them.
4. **"The `sizes` should resolve to the widest sensible variant, `sizes="100vw"`" is not what the
   evidence supports.** `100vw` picks the 1672px original on a 1x desktop, and that decode fails
   the wave 413 long-task probe on one run in two. The widest SENSIBLE variant here is the 960px
   step, and the reason is the missing 1440 step that `wave414-responsive-images.py` refused by its
   own rule. Section 2.1.
5. **A defect on the live site that this wave did not cause and did not fix.** The prerenderer
   truncates the TanStack barrier script on `/contact` and appends **565 characters of the router
   payload after `</html>`**, where a browser hoists it into `<body>` and renders it as visible
   JavaScript at the foot of the page; its unbreakable strings also give the page a **275px
   horizontal scroll on a phone** (`documentElement.scrollWidth` 665 against 390). Measured on the
   base `e07b7f4` with its own sources restored: **one build in three**, deterministic within a
   build and random between them. `scripts/pages-postbuild.mjs` already guards it, written by wave
   412 for this exact defect, and it fired once during this wave's runs. Two things are worth
   recording. The guard **cuts** the tail, which removes the visible text but leaves the barrier
   script a syntax error; splicing the tail back before its `</script>` reconstitutes a good build
   **byte for byte except the timestamp**, which this wave verified by diffing a repaired broken
   build against a clean one. And **the gate only catches it if `pages-postbuild.mjs` is run**, so
   a wave that shoots screenshots straight off `dist/client` will see a red gate it did not cause.
   Proposal 4.
6. **The brief's `RAW_CEILING` figures were slightly stale.** It quotes "0.2370 for `/` at 1280
   (the measured figure is 23.64 per cent)" and a ground figure of 9.16 per cent. The base at
   `e07b7f4` measures 23.53% and 23.57% raw and 8.99% and 9.04% ground. Nothing turns on it; the
   ceiling quoted is the one in the file.

---

## 11. Files, and what was deleted

`gzserve.mjs` and `run-lighthouse.sh` were written for the Lighthouse runs and **deleted after
them**, which is what waves 414 and 415 did with the same server. They are not committed: nothing
in the gate needs them, and a static server that only exists to gzip is not a part of this site.

`docs/wave421/` keeps the working-out: `tune.py` and the five composites made from its shots,
the before and after gate output, the Lighthouse JSON for both passes, and the crops in this
report. `docs/screenshots/wave421/`
keeps the 28 shots the new gate takes.

---

## 12. 421b, the fix pass on the rel421 verdict

The independent re-check returned **HOLD with 1 MAJOR and 5 MINOR** and recorded that the contrast
arithmetic, the ratchet, the divider fix and the wave 413 law all held under recomputation. All six
are closed below, each in its own commit.

| # | severity | what the verdict found | what 421b did | evidence |
|---|---|---|---|---|
| 1 | **MAJOR** | `SIZES_HERO_GROUND` named 288, 192 and 144dpi and fell through to `min(100vw, 960px)`, the one branch not divided by its density, so **every desktop between 1x and 1.5x took the 1672px original**: Windows at 125 per cent scaling, or any reader zoomed to 110 to 140 per cent. A 172KB regression against the live site for that cohort, and the decode the wave 413 probe fails on | Added `(min-resolution: 100dpi) min(50vw, 640px)` before the fallback, so 1.25x asks 800 device pixels and 1.49x asks 954, both inside the cap. Corrected the comment and section 2.1, and **claimed** that "every density at most 960 device pixels" was thereby true. ⚠ **IT WAS NOT**: 421b fixed the band it was asked about and left the two above it capped for the best density in their band, which rel421b found. The claim is true of the code that ships at the 421c head, not of 421b's. Gave section A of the gate twelve (width, density) profiles, drawn from the verdict's rows rather than from the rule, which is why they did not sample either broken band | section 2.1b and 2.1c, `docs/wave421/gate421-mutated.txt` |
| 2 | MINOR | `hero.tsx` quoted "ink-muted reads 6.44:1 here", a figure no run produced | Quotes **6.32:1 at 1280 and 6.38:1 at 390** with their widths and says they are the gate's | section 2.5 |
| 3 | MINOR | The worst page-ground share read 9.20% in one place and 9.02% in three others, each called "the worst" | Every one of the four now **names its sample**: 9.20% is the worst of the seven readings taken for the ratchet, 9.02% the worst of the three quoted in `src/styles.css` | section 3 |
| 4 | MINOR | `measure_pairs` computes `worstGround` and `worstRatio` and the report printed neither, for the one pair with under half a point of headroom | **Both columns are in the two hero tables**, with a plain statement of what the column actually is (the element's own anti-aliased glyph edge, which is why it is not asserted) and the **layer-stack bound of 3.33:1**, recomputed here from the sRGB coefficients and agreeing with the verdict's derivation exactly | section 2.5 |
| 5 | MINOR | `check_arch_is_clear` is blind under the dome and counts any dark pixel as type; and the padding rule's "no route's last child carries a `pb-` utility" was asserted, not measured | Docstring **narrowed to what it holds**, with both limits named. Added `report_last_child_padding`, a new **section C0** that reads the element `#main > :last-child` names on every route, prints its class list, computed padding and background, and **fails the run** on any `pb-*` or `py-*` | the table below |
| 6 | MINOR | The brief asked for `rg -n 'mist-bg' src/` and the report substituted a different sweep | Run and reported: **15 hits in 6 files, none a divider and none a band's ground** (the totals were mis-transcribed as 14 in 7 and corrected in 421c) | section 4.4 |

### 12.1 Section C0, the measurement behind the padding rule

Printed by the gate on every run, at 1280, and asserted:

| route | `#main > :last-child` | `pb-`/`py-` utility | computed padding-bottom | background |
|---|---|---|---|---|
| `/` | `section.section-light` | **none** | 57.6px | cream |
| `/about` | `main` | **none** | 57.6px | transparent |
| `/platform` | `main` | **none** | 57.6px | transparent |
| `/the-problem` | `main` | **none** | 57.6px | transparent |
| `/solutions` | `main` | **none** | 57.6px | transparent |
| `/partners` | `main` | **none** | 57.6px | transparent |
| `/contact` | `main` | **none** | 57.6px | transparent |
| `/register` | `div.registration-picker` | **none** | 57.6px | cream |
| `/register/investor` | `div.registration-page` | **none** | 57.6px | cream |
| `/register/resident` | `div.registration-page` | **none** | 57.6px | cream |
| `/partner-with-investor` | `main` | **none** | 57.6px | transparent |
| `/partner-with-local-authority` | `main` | **none** | 57.6px | transparent |
| `/legal` | `section.section-light` | **none** | 57.6px | cream |
| `/this-route-does-not-exist` | no `#main` | n/a | n/a | n/a |

57.6px is `clamp(36px, 4.5vw, 80px)` at 1280 and nothing else, so the rule is adding the arch's
height and replacing nothing on any route. **The seven `main` rows are the limit section 4.3 names
in its own comment**: there the padding lands on a transparent wrapper rather than the coloured
band, and the corners show the page. All seven of those routes end white on a white page, so the
two agree, and the gate measures them agreeing at both widths rather than taking it on trust.

### 12.2 The gate at the 421b head

Every script re-run in the foreground after the fixes, on a rebuilt tree.

| check | rc | result |
|---|---|---|
| `bunx tsc --noEmit` | **0** | 0 errors |
| `bunx eslint` on the changed files | **0** | 0 errors, 0 warnings |
| `bunx eslint .`, LF-normalised tree | 1 | **387 errors / 15 warnings, delta zero against the base** |
| `STATIC_BUILD=true bun run build` | **0** | **36 pages** |
| `node scripts/pages-postbuild.mjs dist/client` | **0** | trimmed a duplicated tail from `/contact` on this build, see below |
| `python scripts/wave412-screenshots.py` x3 | **0** | 28 shots; raw 23.54, 23.52, 23.51 at 1280 and 16.58 at 390; ground 9.02, 8.98, 8.97; 275 incomplete nodes, 275 measured, 0 unmeasured |
| `python scripts/wave413-motion.py` | **0** | **0 long tasks over 50ms** |
| `python scripts/wave414-responsive-images.py --check` | **0** | 71 images, every variant present, alpha intact |
| `python scripts/wave414-mobile.py` | **0** | 70 shots, 660 headings, 0 overflow, 0 axe violations |
| `python scripts/wave421-hero-and-footer.py` | **0** | **12 variant profiles**, 402 pairs, 26 dividers, 13 last-child paddings |
| Dash count | - | **0 and 0** over 2,354 hand-written added lines |
| `git diff e07b7f4 -- src/content` | - | **empty** |

⚠ **THE PRERENDER DEFECT OF SECTION 10.5 FIRED AGAIN ON THIS PASS, AND BIGGER.** The build that
the 421b gates ran against dropped **2,238 characters** of router payload after `</html>` on
`/contact`, where wave 421's own occurrence was 565. `scripts/pages-postbuild.mjs` trimmed it and
the gates were clean afterwards. It is still one build in roughly three, still on the live site's
own head, still not caused or fixed by this wave, and the varying size is one more reason
proposal 4 should be taken.

### 12.3 Lighthouse at the 421b head

Same instrument and the same gzipping server. **The `sizes` branch added by MAJOR 1 does not
change what this profile takes**, because 412 CSS pixels at 1.75 resolves `min(50vw, 640px)` to
206 under both the old and the new expression, so these figures are a re-measurement rather than a
new result.

| route | base | wave 421 | **421b** | bytes, base | bytes, **421b** |
|---|---|---|---|---|---|
| `/` | 67 | 66 | **65, 66, 67** over three runs | 957 KiB | **922 KiB** |
| `/the-problem` | 85 | 85 | **86** | 421 KiB | **421 KiB** |
| `/register/investor` | 81 | 81 | **82** | 438 KiB | **439 KiB** |
| `/partner-with-investor` | 78 | 78 | **79** | 741 KiB | **742 KiB** |

Accessibility **100** and best practices **100** on all four, CLS **0** on all four. The home
page's three readings straddle the base's single one, with total blocking time 200 to 220ms, and
the byte figure is unchanged from wave 421 and **35 KiB under the base at this density**. The
density-specific caveat in section 7 is the one that matters: the bytes this table cannot see are
the ones MAJOR 1 was about.

---

## 13. 421c, the fix pass on the rel421b verdict

The re-check of 421b returned **HOLD with 1 MAJOR and 2 MINOR**, and verified all six rel421
findings closed. All three are closed below, each in its own commit.

| # | severity | what the verdict found | what 421c did | evidence |
|---|---|---|---|---|
| 1 | **MAJOR** | MAJOR 1 was fixed as an instance, not a class. The 1.5x-to-2x and 2x-to-3x branches are capped for the **best** density in their band (640 = 960/1.5, 480 = 960/2), so 1.99x asks 1274 and 2.99x asks 1434 and both take the 1672px original. The comment printed 1274 and 1440 under a heading saying "at most 960". The twelve gate profiles sampled neither band's interior | **Both halves.** (a) The original is out of this image's `srcset`: candidates are 400, 640 and 960, so no `sizes` error can select it. (b) Seven branches, each capped by its band's **upper** bound, every edge checked and stated. (c) `VARIANT_PROFILES` chosen **by rule**, the worst density of every band, sixteen in all. Section 2.1's false sentence and section 12's claim that it was true are both corrected in place | section 2.1c, `gate421-mutation-a.txt`, `gate421-mutation-b.txt` |
| 2 | MINOR | The `mist-bg` sweep's prose said "14 hits in 7 files" over a table of 15 in 6; and "Two flakes were seen at this head" headed a list of three | Sweep **re-run**: it prints **15 hits in 6 files**, which is the table. Both totals corrected, and the flake count corrected to three, with the slip named in place rather than quietly fixed | section 4.4, section 6 |
| 3 | MINOR | `PADDING_UTILITY` matched `pb-` and `py-` but not `p-`, which sets `padding-bottom` just as they do and is outranked by the same unlayered rule, so section C0 would have printed `none` for an all-sides `p-10` and passed | Widened to `(?:pb\|py\|p)-`. The required hyphen keeps `px-`, `pt-`, `pl-`, `pr-`, `ps-`, `pe-` and `pointer-events-none` out, each checked against the compiled pattern | section 13.1 |

### 13.1 Section C0 with the widened pattern

Re-run at the 421c head. All thirteen routes still read **none** and a computed **57.6px**, which
is `clamp(36px, 4.5vw, 80px)` at 1280 and nothing else, so the padding rule is still adding the
arch's height and replacing nothing. The pattern was checked term by term before the run:

| class | matches | correct? |
|---|---|---|
| `pb-10`, `py-10`, `p-10`, `p-[2px]`, `lg:p-8`, `max-lg:py-2` | **yes** | yes, all set `padding-bottom` |
| `px-5`, `pt-4`, `pl-2`, `pointer-events-none`, `panel` | **no** | yes, none sets `padding-bottom` |

### 13.2 The gate at the 421c head

Every script re-run in the foreground after the fixes, on a rebuilt tree.

| check | rc | result |
|---|---|---|
| `bunx tsc --noEmit` | **0** | 0 errors |
| `bunx eslint` on the changed files | **0** | 0 errors, 0 warnings |
| `bunx eslint .`, LF-normalised tree | 1 | **387 errors / 15 warnings, delta zero against the base** |
| `STATIC_BUILD=true bun run build` | **0** | **36 pages** |
| `node scripts/pages-postbuild.mjs dist/client` | **0** | clean on this build |
| `python scripts/wave412-screenshots.py` | **0** | 28 shots, 275 incomplete nodes all measured, 0 unmeasured, 0 axe violations |
| `python scripts/wave413-motion.py` | **0** | **0 long tasks over 50ms** |
| `python scripts/wave414-responsive-images.py --check` | **0** | 71 images, every variant present, alpha intact |
| `python scripts/wave414-mobile.py` | **0** | 70 shots, 660 headings, 0 overflow, 0 axe violations |
| `python scripts/wave421-hero-and-footer.py` | **0** | **16 variant profiles**, 402 pairs, 26 dividers, 13 last-child paddings |
| Dash count | - | **0 and 0** over the hand-written added lines, same exclusions as section 6 |
| `git diff e07b7f4 -- src/content` | - | **empty** |

### 13.3 Lighthouse at the 421c head

The `srcset` and `sizes` changes do not alter what Lighthouse's profile takes: 412 CSS pixels at
1.75 resolves `min(50vw, 480px)` to 206 and takes the **400px step**, as it did at every head of
this wave. These figures are therefore a re-measurement rather than a new result.

⚠ **THIS PASS WAS MEASURED ON A LOADED MACHINE AND THE SCORES ARE NOT USABLE AS A COMPARISON.**
Two runs of all four routes, minutes apart, with the site unchanged between them:

| route | base | 421b | 421c pass 1 | 421c pass 2 | TBT, pass 1 then 2 | bytes, 421b and 421c |
|---|---|---|---|---|---|---|
| `/` | 67 | 65, 66, 67 | 60 | 58 | 340ms, 510ms | **922 KiB** both |
| `/the-problem` | 85 | 86 | 85 | 84 | 10ms, 110ms | **421 KiB** both |
| `/register/investor` | 81 | 82 | 77 | **93** | 50ms, 0ms | **439 KiB** both |
| `/partner-with-investor` | 78 | 79 | 75 | 64 | 90ms, 480ms | **742 KiB** both |

`/register/investor` moving 77 to 93 and `/partner-with-investor` 75 to 64 between two runs of the
same bytes is the instrument, not the site: four other Claude Code sessions were building on this
machine. **Accessibility 100, best practices 100 and CLS 0 on all four routes in both passes**, and
**every byte figure is identical to the 421b head**, which is the deterministic part and the part
that matters here: this pass changed which FILE some densities ask for, and Lighthouse's density is
not one of them.

The caveat in section 7 stands and is the important one: **the bytes this instrument cannot see are
the ones the three MAJOR 1 findings were about.** Section 2.1's sixteen-profile table is where they
are measured, and it is measured on a real browser at a real density rather than by a score.
