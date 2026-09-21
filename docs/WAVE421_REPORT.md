# Wave 421: the hero photograph comes back as a warm ground, and the footer's curve stops being broken

**Branch** `feat/wave421-the-warm-hero-ground-and-the-footer-curve`
**Base** `e07b7f4`, wave 415c's head, which is also `origin/main` at the time of writing
**Head** `7f2d687` for the code and the gates; this report is the commit after it
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

**The assertion.** Section A of the new gate loads `/` at 1905, 1280, 768 and 390, reads
`document.querySelector('img[data-hero-wash]').currentSrc`, and fails if a viewport wider than
640 resolves to a name ending `-400.webp`. It failed three times at the base, which is the
diagnosis proved in this repo rather than taken on trust.

At the head:

| viewport | chosen source | box | ratio |
|---|---|---|---|
| 1905 | `hero-ground-street-960.webp` | 1905 | 0.50 |
| 1280 | `hero-ground-street-960.webp` | 1280 | 0.75 |
| 768 | `hero-ground-street-960.webp` | 768 | 1.25 |
| 390 | `hero-ground-street-400.webp` | 390 | 1.03 |

**Why 960 and not the 1672px original, which is what "the widest sensible variant" would mean.**
The candidates are 400, 640, 960 and the source; `scripts/wave414-responsive-images.py` encoded a
1440 step at 225KB against a 199KB source and refused it by its own rule, so any request over 960
device pixels jumps straight to 1672 by 941, which is seventeen times the pixels of the 400px
step. That decode is main-thread work and it is measurable: with `100vw` in place,
`scripts/wave413-motion.py` failed its zero-budget long-task probe on **one run in two**, with
tasks of 67ms and 185ms during a full scroll of the home page, against a base that is clean five
runs out of five. `sizes` now asks every density for at most 960 device pixels:

```
(min-resolution: 288dpi) min(50vw, 320px),   /* 3x   -> at most 960 device px */
(min-resolution: 192dpi) min(50vw, 480px),   /* 2x   -> at most 960 */
(min-resolution: 144dpi) min(50vw, 640px),   /* 1.5x -> at most 960 */
min(100vw, 960px)                            /* 1x   -> at most 960 */
```

Three drafts of this line were wrong and each one was caught by measurement rather than by
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

**The hero, at 1280.** The ground column is the pixel the glyphs actually sit on.

| pair | px / weight | ground before | before | ground after | after | floor |
|---|---|---|---|---|---|---|
| the navy headlines | 46 / 800 | (253,253,253) | 18.51 | (246,240,238) | **16.70** | 3.0 |
| the orange headline "Delivering Support." | 46 / 800 | (251,251,251) | 4.08 | (237,232,230) | **3.48** | 3.0 |
| the wait-list sub-line | 15 / 400 | (251,251,251) | 18.20 | (236,231,229) | **15.36** | 4.5 |
| a role tile name | 14 / 600 | (255,255,255) | 18.83 | (255,255,255) | **18.83** | 4.5 |
| a role tile purpose line | 13 / 400 | (252,252,251) | 6.79 | (245,240,237) | **6.17** | 4.5 |
| the "Powered by" credit | 10 / 700 | (253,253,253) | 4.79 | (247,243,241) | **6.32** | 4.5 |

**The hero, at 390.**

| pair | px / weight | before | after | floor |
|---|---|---|---|---|
| the navy headlines | 37 / 800 | 18.39 | **15.96** | 3.0 |
| the orange headline "Delivering Support." | 37 / 800 | 4.13 | **3.57** | 3.0 |
| the wait-list sub-line | 15 / 400 | 18.20 | **15.52** | 4.5 |
| a role tile name | 14 / 600 | 18.83 | **18.83** | 4.5 |
| a role tile purpose line | 13 / 400 | 6.62 | **5.97** | 4.5 |
| the "Powered by" credit | 12 / 700 | 4.83 | **6.38** | 4.5 |

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
| **page ground, 1280** | 8.99%, 9.04% | **9.20%** | 8.98% | **flat 15%** | holds by 5.80 points |
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
| Wave 421 | `python scripts/wave421-hero-and-footer.py` | **0** | 4 variant readings, **402 pairs measured with none missing**, **26 dividers, all correct** |
| Dash count | added lines, U+2014 and U+2013 | - | **0 and 0** |
| Content | `git diff e07b7f4...HEAD -- src/content` | - | **empty** |
| Lighthouse | `bunx lighthouse` 13.5.0, mobile preset, gzipping server | - | section 7 |

**Nothing in the brief's gate list was skipped.** `scripts/wave295-*`, `scripts/wave298-*` and
`scripts/wave358-registration.test.ts` are outside this brief's list, as in waves 415 and 414.

**Two flakes were seen at this head and both are named rather than hidden.**

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

**The home page is 35 KiB LIGHTER than the base, and that is the point of the `sizes` work.** At
Lighthouse's 412 CSS pixels and density 1.75 the base's `"320px"` asked for 560 device pixels and
took the 640px step at 61 KiB; the head asks for 361 and takes the 400px step at 27 KiB. The
variant did not need to be smaller, because on a phone it got smaller.

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
