# Wave 415: the Zoopla mark in Zoopla's own purple, the unreachable components, the WhatsApp card's two corrections, and the six notes the 414b re-check left

**Branch** `feat/wave415-the-zoopla-mark-and-the-dead-components`
**Base** `origin/main` at `2f46e2e`, the head GitHub Pages is serving (run #47, success, 12:30 UK 19 Sep 2026).
**Every number below was measured in this worktree, in the foreground, at the final head.**

---

## 1. The ledger

| # | Commit | What |
|---|---|---|
| 0 | `4fe391b` | the number claimed, empty, pushed before the first edit |
| 1 | `e6f28b3` | the Zoopla mark in Zoopla's own purple |
| 2 | `78f1b10` | the fourteen unreachable components deleted, verified |
| 3 | `ea895b3` + `166fbdf` | the wave 411 WhatsApp card merged, then its two corrections and its light surface |
| 4 | `198e459` | the encoding is measured per variant, not assumed (rel414b MINOR 6) |
| 5 | `c4c3011` | the five remaining notes from the 414b re-check |
| 6 | `a4d453b` | the Zoopla mark's RENDERED contrast, measured off the shot |

**31 files changed outside `docs/screenshots` and `public/images`, 947 insertions, 1,344 deletions.** More is removed than added, which is the point of item 2.

Callum's call, 19 Sep 2026 about 11:05 UK, in his words: *"please ensure the Zoopla logo appears as the Zoopla brands purple colour the same as the ribbon on the property listing result/match card. Then try and fix those components, if they're old, not important or expired then yes delete them (as long as it doesn't effect the functionality of our site."* And on the WhatsApp card of wave 411, asked whether to drop the `aria-label` and whether to show the card on the investor page only: **"WhatsApp: yes both"**.

---

## 2. The Zoopla mark

### The purple

`#8046F2`. Not guessed. The operator sampled the "Powered by Zoopla" ribbon off the live platform's property page (deal 692681, 19 Sep 12:10 UK): the ribbon's median pixel is `#8046F3` with `#8046F2` as the dominant exact value under JPEG noise, and `#8046F2` is Zoopla's published brand purple.

Recomputed here rather than carried forward. The regenerated `public/images/brand/zoopla-ink.webp` has **14,135 opaque pixels and every one of them is exactly `(128, 70, 242)`**, so the fill is the colour and nothing else.

| | relative luminance | ratio |
|---|---|---|
| `#8046F2` | **0.1538** | the brief said 0.1545; 0.1538 is what the sRGB coefficients give |
| `#8046F2` on white `#ffffff` | | **5.15:1** |
| `#8046F2` on cream `#f7f1e6` | | **4.58:1** |

### And the flat figure is not the rendered one

~~`src/components/home/hero.tsx` draws the credit at `opacity-90`, which wave 413's first-viewport wash probe already lists and asserts. **Measured off a full-page shot of `/` at four widths**, the darkest purple pixel of the rendered mark is `rgb(140, 88, 243)`, L = **0.1903**, against a ground reading `rgb(254, 254, 253)`:

| viewport | rendered ratio |
|---|---|
| 360 | **4.33:1** |
| 390 | **4.33:1** |
| 414 | **4.33:1** |
| 1280 | **4.30:1**, the ground there samples `rgb(253, 253, 253)` |~~

⚠ **CORRECTED in 415c (rel415b MAJOR 1): this passage described the PRE-FIX render and was
false at the 415b head, unmarked, while eight other wrong sentences in this document were struck
through.** `opacity-90` is gone (section 11.1). Measured off the shipped shot at 390, the darkest
ink pixel is **(128, 70, 242)**, L = **0.15383**, rendered **5.1052:1** against the ground
`(254, 254, 253)`, **5.1520:1** flat on white, **5.0233:1** modal. The full per-viewport table,
taken at DPR 2 with the mark scrolled into view, is in section 11.1.

Both the flat and the rendered figure clear the **3:1** WCAG 2.2 SC 1.4.11 asks of a graphic, and a logotype is exempt from the text floors altogether. The mark draws **on white at every width**, never on the cream, so 4.58 is a reference figure and not a reading of anything on this site today.

### The generator

`scripts/wave412-zoopla-ink.py` was **renamed** to `scripts/wave415-zoopla-purple.py`, not duplicated: there is still one generator and one mark, and only the fill changed. The old script is **gone**, and it had to be, because two generators writing the same path is how a mark ends up in two colours. The alpha mask, the shape, the proportions, the output path and the credit's markup are untouched.

**The hex lives in the generator and nowhere else.** It is a third party's brand colour baked into a third party's artwork, not a colour of this palette, so it is not a token in `src/styles.css` and not a literal in a component. No token was added and none was needed: the mark carries its own colour in its own pixels.

`public/images/brand/zoopla-ink.webp` is 31,516 bytes before and after, coincidentally identical. `zoopla-ink-400.webp` was regenerated through `scripts/wave414-responsive-images.py` and went **17,906 to 22,012 bytes**, which is the purple being a busier colour for the encoder than the near-black navy was.

### Its rendered size on a phone

| viewport | rendered box | file actually fetched |
|---|---|---|
| 360 | **82.2 x 18.0 CSS px** | `zoopla-ink.webp` |
| 390 | **82.2 x 18.0 CSS px** | `zoopla-ink.webp` |
| 414 | **82.2 x 18.0 CSS px** | `zoopla-ink.webp` |
| 1280 | **82.2 x 18.0 CSS px** | `zoopla-ink.webp` |

The box does not change with the viewport: the credit is `h-[18px] w-auto` on a 548 by 120 source, so it is 82.2 wide everywhere. **This is a proposal, not a change** (proposal 2): 82px is small for a partner's trademark, this site's own lockup has a stated 140px minimum, and Zoopla's guidelines for their positive mark are not in our hands. The August note in `hero.tsx` has been asking this question since it was written and it is still the right question.

Two other facts the probe turned up, both proposals rather than changes: the credit has **no `srcSet`**, so the 400w variant is generated and never served; and the 548px source is drawn at 82px, which is 6.7 times the pixels the phone needs.

---

## 3. The fourteen components

`docs/WAVE412_REPORT.md` proposal 4 named fourteen. **That list was three waves old and waves 413 and 414 edited two of them, so every one was verified here before it was touched**, three independent ways:

1. a basename sweep of `src/` and `scripts/`;
2. an exact import-specifier sweep, for `from "...<path>"`, `from ".../<basename>"` and `import(...)`;
3. a **whole-tree reachability walk** from the real entry points (`src/routes/**`, `router.tsx`, `server.ts`, `start.ts`, `routeTree.gen.ts`), resolving every `@/` and relative specifier through `.ts`, `.tsx` and `index.*`. 149 files under `src/`, **79 reachable**.

There are **no barrel files** under `src/components` and **no `import.meta.glob` and no `require(` anywhere in `src/`**, so there is no indirect path in. The resolver was cross-checked against grep on six known cases and agreed on all six.

| component | imported? | by what | verdict |
|---|---|---|---|
| `platform/ai-team` | no | nothing | **deleted** |
| `platform/capability-rail` | no | nothing | **deleted** |
| `platform/data-layers` | no | nothing. The `"data-layers"` in `content/platform.ts` is a string id, not the module | **deleted** |
| `platform/delivery-spine` | no | nothing | **deleted** |
| `platform/dot-meter` | yes, only from inside the set | `platform/match-panel` | **deleted** |
| `platform/hero-window` | no | nothing | **deleted** |
| `platform/match-panel` | yes, only from inside the set | `platform/ai-team` | **deleted** |
| `platform/portal-tabs` | no | nothing | **deleted** |
| `platform/property-report` | no | nothing | **deleted** |
| `solutions/role-section` | no | nothing. Edited by 413/414, still unreached | **deleted** |
| `ui/live-window` | yes, only from inside the set | `hero-window`, `match-panel`, `portal-tabs`, `role-section` | **deleted** |
| `ui/process-rail` | yes, from `src/content/process.ts` | `import type { ProcessStep }`, and `content/process.ts` is itself unreached | **deleted** |
| `ui/image-fill-headline` | no | nothing. Edited by 413/414, still unreached | **deleted** |
| `ui/disclosure` | no | nothing. **CORRECTED in 415b (rel415 MINOR 3): the 21 "disclosure" hits are NOT all prose and `disclosure-content`.** Five of them are `.disclosure-marker` and its four `[data-mark]` rules in `src/styles.css`, which only this component emitted, so they died with it. `disclosure-content` does stay, and `ui/accordion.tsx` does use it | **deleted** |

**Fourteen verified unreachable, fourteen deleted, none kept.**

**A fifteenth file went with them.** `src/content/process.ts` is itself unreachable and its only remaining content is a type imported from `ui/process-rail`, so it does not compile once that is gone. It is a deletion forced by this one. Nothing rendered any of its strings, because nothing imported it.

**1,242 lines and 47,113 bytes removed.**

### The proof that nothing moved

Before and after the deletions the static build was rendered and **all 29 prerendered HTML files were compared** with their `<script>` payloads stripped and their asset hashes normalised. **29 pages compared, 0 moved.**

One page first read as different, `/contact`, by 565 characters. That was the duplicated document tail `scripts/pages-postbuild.mjs` exists to trim, present in the before copy because it had been snapshotted ahead of postbuild. With postbuild run on both sides: **0 moved**. No single deletion had to be reverted, because none of them moved a page.

Nothing in `dist/` carries a marker unique to any of the fifteen: eight distinct `className` strings, one per component, return 0 files. The single apparent hit, `image-fill-line`, is a **CSS rule in `src/styles.css`**, not markup from the component.

### What did NOT get deleted, and why

Per the brief's own rule for unreferenced assets, these are **proposals, not deletions** (proposal 3):

- **`src/content/platform.ts`** is now unreferenced: all nine of its consumers were the deleted `platform/*` components. It compiles fine on its own and nothing breaks either way.
- **`src/components/solutions/role-utils.ts`** was imported only by `role-section`, and **`src/components/solutions/section-rail.tsx`** was already unreached.
- **`.image-fill-line`** in `src/styles.css`, about line 1537, is now dead CSS, its only consumer deleted.
- ⚠ **`.disclosure-marker` and its four `[data-mark]` rules** in `src/styles.css` were dead too and this list MISSED them (rel415 MINOR 3). They are **deleted in 415b**, not left as a proposal, because unlike the four below they are not a judgement call: `src/components/ui/disclosure.tsx` was the only thing that ever wrote that class or those attributes, `ui/accordion.tsx` uses a `ChevronDown` with a Tailwind rotate, and `/contact`'s native `<details>` uses a lucide `Plus` with `group-open:rotate-45`. The newly dead set is exactly `{image-fill-line, disclosure-marker}`.
- **No `public/images` asset became unreferenced.** None of the fifteen names a `/images/` path, so `scripts/wave414-responsive-images.py` reads the same 71 referenced sources before and after and the generated manifest is byte-identical. This was the specific hazard the brief named and it did not arise.

---

## 4. The WhatsApp card

### The merge

`git merge --no-edit origin/feat/wave411-whatsapp-invite`, at `bc3eb4c`. Not cherry-picked, not rebased. Its base `9adb0bb` is an ancestor of this branch's base.

**The merge was CLEAN. There were no conflicts anywhere**, including in `src/routes/register.$role.tsx`, where the brief expected one.

⚠ **CORRECTED in 415b (rel415 MINOR 5): the reason given for that was wrong, and so was the surprise.** The sentence used to read "which wave 414 also edited". **Neither wave 414 nor 414b touched `src/routes/register.$role.tsx`.** The last waves to edit it were 412 and 412b. **A clean merge was therefore the EXPECTED outcome, not a notable one**, and the brief's "expect a conflict there" was working from the same wrong premise this report then repeated.

The related claim, **"Every part of 414's work on that page is untouched"** (the sticky bottom bar, the safe area, the type floors, the target sizes), is true but is about **`src/components/register/registration-flow.tsx`**, not about the route file, and wave 411 never touched that file either. The mobile gate re-run confirms it, which is the part that was worth saying.

It brought: `src/content/site.ts` (the `whatsappCommunity` constant), `public/images/whatsapp-community-qr.svg`, `scripts/make-whatsapp-qr.ts`, the `qr` package script, `qrcode` and `@types/qrcode` as devDependencies, `scripts/wave411-screenshots.py`, `docs/WAVE411_REPORT.md` and two wave 411 screenshots.

### Correction 1: the `aria-label` is gone

The briefed `aria-label`, "Join our investor WhatsApp community", set an accessible name that does **not contain** the control's visible label, "Open WhatsApp". That fails **WCAG 2.5.3 Label in Name (Level A)** against the site's stated 2.2 AA standard: someone driving the page by voice says the words they can see and the control does not answer.

Removed. The accessible name is now the visible text, which is the only arrangement that cannot drift apart. `whatsappCommunity.label` went with it rather than sitting in `src/content/site.ts` unread; nothing else read it, because `scripts/make-whatsapp-qr.ts` takes the `url` alone.

**Verified in the built output: `Join our investor WhatsApp` appears in 0 of 29 prerendered HTML files.**

### Correction 2: the investor page only

Wave 411's brief named no role condition, so the card drew on all ten `/register/<role>` pages and put a sentence about sourced deals and their figures in front of a resident looking for a home. `role.id === "investor"` gates it.

**Verified in the built output: `Prefer WhatsApp?` appears in exactly one file, `dist/client/register/investor/index.html`.**

### And a third thing, which the brief did not ask for and the light rules did

Wave 411 was built from `origin/main` at `9adb0bb`, which is **before wave 412 turned the ground white**. The card arrived as a navy plate: `border-navy-700 bg-navy-800/50 text-white text-mist`. On the registration page's cream that is:

- **a second navy island inside `<main>`**, which `scripts/wave412-screenshots.py` counts and fails at two; and
- **not a contrast pair at all**: white on `navy-800` at 50% over cream is a mid-slate under white text, and `--color-mist` (`#c6d2e4`) is an on-navy colour with nothing to say on a light ground.

Per the standing rule the **SURFACE moves, never the content**: the card is now `panel`, the site's own white card on the cream, with `text-ink` and `text-ink-muted`. The `Button variant="secondary"` was already light-correct, a teal-600 outline. **No string changed in the move.**

### Every string it brings, verbatim

Wave 411's copy, asked for by Callum on **18 Sep 2026 21:05** and approved in principle then. Nothing here is new to wave 415.

| where | string |
|---|---|
| heading | `Prefer WhatsApp?` |
| body | `Join our investor community for one sourced deal a day and the figures behind it.` |
| button | `Open WhatsApp` |
| QR `alt` | `QR code for the Impact Investment Group WhatsApp community` |
| the url, in `src/content/site.ts` | `https://chat.whatsapp.com/DXa179wyz2xI2ffqr3Xjte` |

**Removed** by correction 1: `Join our investor WhatsApp community`, which was the `aria-label` and the `label` field.

⚠ **The QR `alt` says "Impact Investment Group" and the site's own `siteName` is "Impact Investment Platform".** It is wave 411's string and this wave changed none of them, so it is left verbatim and raised as **proposal 4** rather than edited under a no-new-strings rule.

### Its phone-rule numbers

The card is inside the full `scripts/wave414-mobile.py` run and answers to every rule like anything else. At the final head, across all 70 shots including `register-investor` at 360, 390, 414, 768 and 667x375:

- **0 shots overflow** at any of the five profiles;
- **0 of 5,733 interactive targets under 44 x 44**, and 0 closer than 8px. The "Open WhatsApp" link is one of them;
- **0 of 5,270 type nodes under their floor**, 0 under a 1.6 line box;
- **0 serious or critical axe violations**;
- **the QR image is absent at 390**, exactly as 411 built it: `hidden ... sm:block`, and `sm` is 640.

`register-investor` reads **4.41% raw / 3.09% ground at 1280** and **6.47% / 3.38% at 390**, well under the flat 15%, with **0 navy islands**.

---

## 5. The encoding policy (rel414b MINOR 6)

### What the note said

`scripts/wave414-responsive-images.py` encoded every variant at `quality=82, method=6`, a photograph policy, over brand artwork that is flat and on the eager critical path of all 36 pages. Its docstring said "lossless is never used: these are photographs", which was not true of four of the seven transparent sources. The re-checker measured a synthetic flat frame at **3.9 times smaller** lossless and named those bytes as the wave's own stated cause of `/` drifting 68 to 66.

### The measured property

**Encode both ways and keep whichever is smaller, per source, per step, with both byte counts and the decision printed on every write run.** That is the most direct measured property of a source there is.

It is deliberately not a proxy. **Two proxies were measured across all 71 referenced sources first, and both were rejected because neither predicts the outcome:**

- **unique colours per pixel** puts `logo-lockup.webp` at **0.219** (41,080 distinct values in 187,704 pixels), *higher* than most of the photographs, because the supplied lockup is an anti-aliased raster render and not line art;
- a **flat-neighbourhood share** puts `zoopla-ink.webp` at **0.94**, the flattest file on the site, which lossless still loses on.

A threshold over either would have been the hand-written filename list the brief forbids, with arithmetic in front of it.

### The answer, and it is not the one MINOR 6 expected

**Lossless is LARGER on all 101 candidate variants of all 42 eligible sources.** Every one.

| file | lossy q82 m6 | lossless m6 | penalty |
|---|---|---|---|
| `zoopla-ink-400.webp` | **22,012** | 29,016 | 1.32x |
| `logo-lockup-reverse-400.webp` | **26,022** | 40,980 | 1.57x |
| `logo-lockup-400.webp` | **30,488** | 55,706 | 1.83x |
| `logo-lockup-reverse-640.webp` | **49,964** | 91,344 | 1.83x |
| `logo-lockup-640.webp` | **58,392** | 114,042 | 1.95x |
| `hub-400.webp` | **26,612** | 60,536 | 2.27x |
| `collective-capability-team-400.webp` | **34,162** | 141,046 | 4.13x |
| `trio-wave-400.webp` | **34,096** | 142,054 | 4.17x |
| the photographs | | | up to **13.12x** |

The re-checker's 3.9x was measured on a **synthetic flat frame**. This site's brand artwork is a soft-edged raster with an anti-aliased alpha ramp, which is the case lossless WebP is worst at. Four further encoder settings were measured on the three brand files and none is usable: `lossless quality=100` and `quality=0` are both larger still, and `alpha_quality=50` is smaller only by degrading the mask the whole fix exists to preserve.

⚠ **The fourth was `exact=False`, and that claim is WITHDRAWN in 415b (rel415 MINOR 6).** Pillow's `WebPImagePlugin._save` reads `exact = 1 if im.encoderinfo.get("exact") else 0`, and `scripts/wave414-responsive-images.py` passes no `exact` on either branch, **so the default already IS `False` and the measurement compared a setting with itself. It could not have failed and it proved nothing.** The setting worth measuring for artwork whose transparent pixels carry RGB 0,0,0, which this script's own comment says the site's keyed brand assets do, is **`exact=True`**, and 415b measures it: see section 11.5. Three usable settings were measured, not four.

### So the bytes

**ZERO BYTES MOVE.** All 98 variants on disk were **deleted and regenerated** under the new policy and **every one came back byte-identical**: `git status --porcelain public/images` is empty after the run. The eager critical path is unchanged. `logo-lockup-400.webp` is still 30,488 bytes, `zoopla-ink-400.webp` still 22,012.

**Total bytes removed from the eager critical path: 0.** There is no before-and-after Lighthouse to separate, because the served files are the same files. The four numbers at the final head are in section 7.

What the change buys is the **rule** rather than the bytes: flat artwork added later takes the lossless branch on its own, measured, with no edit here and no list to keep.

### The alpha check still passes and still bites

`--check` rc **0**, 24 transparent sources, every variant of them still transparent. Flattening `public/images/brand/zoopla-ink-400.webp` to RGB by hand made it fail with the named file and the right reason; the file was restored.

---

## 6. The five notes

### MINOR 1: the smooth-scroll capture bug, fixed in one gate of three

`src/styles.css`, about line 434, carries `scroll-behavior: smooth` on `html`, so **every bare `scrollTo(0, y)` a gate issues is animated** and every fixed `wait_for_timeout` after one is a guess.

⚠ **CORRECTED in 415b (rel415 MAJOR 3): "414b fixed it in `scripts/wave414-mobile.py` alone" was wrong, and so was everything this wave built on it.** 414b fixed `settle` in that file. It left **three bare `scrollTo`s** elsewhere in the same file, one of them reading `AUDIT` at an unconfirmed position. This wave then fixed the other two gates and reported all three as done. **Section 11.3 has what was still broken, what it cost, and the two numbers that moved when it was fixed.**

**`scripts/wave412-screenshots.py`**, the gate that produces the dark-pixel numbers:

- `settle()` now scrolls with `behavior: 'instant'` throughout;
- a new `to_top()` polls up to 12 times and **returns** the resting scroll, and `main()` fails the named shot if it exceeds 0.5;
- a new `first_ink_row()` **reads the saved image** and fails if the first ink is deeper than `HEADER_INK_MAX = 90` CSS px on any chromed route. The 404 is exempt by name, because `scripts/pages-postbuild.mjs` writes it without chrome on purpose.

**`scripts/wave413-motion.py`**, which was not in the 414b diff at all and carried **five** bare `scrollTo`s, one of them immediately before a saved shot:

- new `scroll_to()`, `to_top()` and `assert_scrolled()`, all instant and all polled;
- `FULL_SCROLL`, `IMAGE_SCROLL`, `header_heights`, the magic-line probe and the `condensed-header-1280.png` shot all go through them;
- the one `scrollIntoView` is instant too;
- `has_ink()` reads `condensed-header-1280.png` and fails on a blank clip.

**All four new assertions were broken on purpose and all four failed.**

| break | result |
|---|---|
| `HEADER_INK_MAX` set to 2.0 | **27 failures, rc 1.** Real readings: first ink at y=10 at 1280 and y=6 at 390, on every chromed route |
| `to_top()` parked at 400 | **27 failures, rc 1** |
| `has_ink()` given an impossible threshold | **1 failure, rc 1** |
| `assert_scrolled` sent to an unreachable y | **1 failure, rc 1**, resting at 2708 |

All four reverted.

**And the numbers moved, which is the point.** The gate had been photographing pages mid-scroll:

| reading | 414b head | 415 head |
|---|---|---|
| home raw @ 1280 | 23.64% | **23.59%** |
| home ground @ 1280 | 9.16% | **9.06%** |
| home raw @ 390 | 16.58% | **16.58%** |
| home ground @ 390 | 7.25% | **7.26%** |

Both ratchets, `0.2370` and `0.1670`, still clear, unchanged and not raised.

### MINOR 2: the 390 ground share rose inside a sentence that said it fell

**7.08% to 7.25% is +0.17 of a point**, between the 414 and 414b heads, on the figure the wave itself calls the one that means the page is light. The 1280 figure did go down, 9.17 to 9.16; the sentence carried both and ended "and it went down".

Corrected in `scripts/wave412-screenshots.py`, in the comment above `RAW_CEILING`, and in section 11 of `docs/WAVE414_REPORT.md`, with **both numbers stated**.

**The cause**: the `max-lg:leading-[1.6]` reflow moving the `SAMPLE_EVERY = 4` grid the share is counted on, worth hundredths of a point at 1280 and more at 390 because the column is narrower and every line moved.

**Nothing shipped darker.** 7.25% clears its flat **15%** ceiling by **7.75 points**, the ground answers to that 15% with no ratchet and no exception, and the raw ratchet went down at both widths in the same pass.

### MINOR 3: "the plates are outside the photograph masks" is backwards

`MASKS` in `scripts/wave412-screenshots.py` is `querySelectorAll('img, canvas, svg, .section-dark')`, and the lockup is an `<img>` whose rendered box the re-checker measured at **118 by 44 CSS px** in `home-390.png` and **140 by 52** in `home-768.png`, far over the `width < 2 || height < 2` skip. **The plates were INSIDE the masks.**

So "9.16% either way" is right **because** they were masked. The ground figure is **silent** about that defect rather than exonerating of it, and using it as proof the page was not darker was using the wrong instrument. Rewritten in the gate comment and in section 18.1 of `docs/WAVE414_REPORT.md`, with what actually proves the plates are gone named instead: the alpha assertion in `scripts/wave414-responsive-images.py` and the header and footer luminance readings in `scripts/wave414-mobile.py`, both of which read pixels the masks do not hide.

### MINOR 4: two wrong counts

- **"Thirteen variants of nine transparent sources" is SEVEN.** The distinct stems are `logo-lockup`, `logo-lockup-reverse`, `zoopla-ink`, `hub`, `trio`, `trio-wave` and `collective-capability-team`, which is the same seven the report's own next sentence lists. Thirteen is right.
- **"Darkest of 70 shots" is 65.** The run is 70 shots, but `check_logo` is called only where the page is chromed, and the 404 carries no header and no footer by design: 13 chromed routes at 5 profiles is **65 header boxes and 65 footer boxes**.

Both corrected in `docs/WAVE414_REPORT.md`. **No figure anywhere was derived from either**, and the `0.814` and `0.673` minima are unchanged, because they are the minimum of the set and the set was always the 65.

### MINOR 5: the success-state probe read `scrollY` and never asserted it

It does now, and **it found a real defect on its first run**.

`scripts/wave414-mobile.py`'s `success_probe` asserts `window.scrollY <= 0.5` before its three viewport-relative box checks. The first run read **scrollY = 187**: `src/components/register/registration-flow.tsx` was aligning the heading to `block: "start"` on every `[stage, index]` change, which is right for the nine questions and wrong for the end of them. The success panel is shorter than a viewport and sits under the page's own chrome, so aligning its heading to the top of the screen scrolled past the role header and the back link to show something already on screen. **414b's stated "first screen 56 to 844" had been measured on a page that scrolled itself**, exactly as the re-checker suspected.

**Simply skipping the scroll was tried FIRST and measured WORSE**: the gate read **scrollY = 1398**, with the heading **1,025px above the top of the screen**, because somebody reaching the end has scrolled down through nine questions. So the `done` stage now scrolls the **window** to 0, and the nine questions are untouched. Focus still moves on every change including this one.

| run | scrollY | heading | message | action | first screen |
|---|---|---|---|---|---|
| 414b, unasserted | 187 | 186..226 | 242..372 | 404..456 | 56..844 |
| 415, scroll skipped | **1398** | **-1025..-985** | -969..-839 | -807..-755 | 56..844 |
| 415, scroll to top | **0** | **373..413** | **429..559** | **591..643** | 56..844 |

**The assertion bit twice on real states, at 187 and at 1398**, which is stronger evidence than breaking it on purpose would have been. At the final head the gate exits 0.

---

## 7. The gate at the final head

Every one run in the foreground, whole, at `a4d453b`, and read here. `a4d453b` is the last commit on this branch carrying a source file; the head, `a613f3a`, adds only this report and the shots these runs took.

| check | command | rc | numbers |
|---|---|---|---|
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors**, the standing figure since 412 |
| Lint, changed files | `bunx eslint <each>` | **0** | **0 errors** on every changed `.ts` and `.tsx` file |
| Lint, whole tree, head | `bunx eslint .` on an LF-normalised copy | 1 | **387 errors / 15 warnings** |
| Lint, whole tree, base | the same, on `2f46e2e` in a sibling worktree | 1 | **387 errors / 15 warnings. DELTA ZERO** |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered** |
| Postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | patched 0, trimmed 0 |
| Wave 412's gate | `python scripts/wave412-screenshots.py` | **0** | **28 shots, every assertion passed.** 275 incomplete axe nodes, **275 measured off the pixels, 0 unmeasured**. Darkest raw home @ 1280 **23.59%** under a ceiling of 23.70%; darkest ground home @ 1280 **9.06%** under the flat 15%. **0 serious or critical axe violations** on any shot. Body and header luminance **1.000** everywhere. At most **1 island** anywhere |
| Wave 413's gate | `python scripts/wave413-motion.py` | **0** | 13 routes at 1280 and 390 plus every standalone probe, green. **4 screenshots**, each now asserted |
| Responsive images | `python scripts/wave414-responsive-images.py --check` | **0** | 71 referenced images, every one has the variants it should have, **24 transparent sources and every variant of them still transparent** |
| Wave 414's gate | `python scripts/wave414-mobile.py` | **0** | **70 shots.** 2,839 targets at the top and 2,894 scrolled, **5,733 in all, 0 under 44x44, 0 closer than 8px**. 5,270 type nodes, **0 under their size floor, 0 under a 1.6 line box, 0 under 30 characters at 360**. 660 headings, **0 breaking a word**. 55 fixed layers tested pairwise, **0 overlapping**. **0 serious or critical axe violations. 0 shots overflow.** Picker, keyboard, drawer, bar-over-field and success probes all green. Darkest lockup box: **header 0.814 against a floor of 0.80**, and **footer 0.673 against ITS OWN floor, which is the footer ground minus 0.30** (rel415 MINOR 7: there is no single floor, and compressing the two into one number made the footer read as 0.127 under a floor it is not measured against) |
| Dashes on added lines | over ~~948~~ **1,299 added lines** | | **U+2014: 0. U+2013: 0.** rel415 MINOR 8: 948 matched nothing in the diff. `415_stat.txt` says 1,354 insertions, of which **1,299 are in text files** once `bun.lock` (54) and the QR SVG (1) are taken out, and 1,299 is the denominator the re-checker counted independently and confirmed at 0 and 0 |
| `git diff 2f46e2e...HEAD -- src/content` | | | **NOT empty**, and it contains exactly two things, listed below |

### `src/content`, in full

1. **`src/content/site.ts`, +25 lines**: the `whatsappCommunity` constant the wave 411 merge brings, with `url` only, and its docstring explaining why there is no `label` any more.
2. **`src/content/process.ts`, deleted, -36 lines**: the fifteenth dead file of item 2, which cannot compile once `ui/process-rail` is gone. Nothing rendered it.

**And nothing else.** No other file under `src/content` is touched.

### Lighthouse mobile

`bunx lighthouse` 13.5.0, mobile preset, against a **gzipping** server, a 22-line Node server written for the run and deleted after it, because Python's `SimpleHTTPRequestHandler` does not gzip and GitHub Pages does.

⚠ **THIS INSTRUMENT WAS CONTAMINATED BY MACHINE LOAD AND THE NUMBERS SHOULD BE READ AS A RANGE.** The brief warned that other sessions would be building in other worktrees on this machine, and they were. Total blocking time on `/` read **1,410ms, 2,710ms and 570ms** across three passes of the *same build*, which is a fact about the machine and not about the site. Three passes, all reported:

| route | pass 1 | pass 2 | pass 3, quietest | a11y | best practices | SEO | CLS | bytes |
|---|---|---|---|---|---|---|---|---|
| `/` | 42 | 37 | **54** | **100** | **100** | 100 | **0** | 971 KiB |
| `/the-problem` | 78 | 79 | **83** | **100** | **100** | 92 | **0** | 421 KiB |
| `/register/investor` | 75 | 71 | **93** | **100** | **100** | 92 | **0** | 438 KiB |
| `/partner-with-investor` | 68 | 67 | **82** | **100** | **100** | 92 | **0** | 700 KiB |

**Accessibility 100 and best practices 100 hold on all four routes in all three passes.** That is the part the gate binds and it is met.

**The performance floor of 85 is unmet and stays a stated shortfall, not a chased one**, exactly as the brief instructs. It is met on `/register/investor` in the quietest pass, at 93, and nowhere else. These are **not comparable** with 414b's 66 / 85 / 83 / 79: that run was on a quiet machine and this one was not, and this wave removed no bytes from the critical path, section 5, so there is no reason to expect a real movement in either direction.

### Not run, and why

- ~~**`scripts/wave411-screenshots.py`** came in with the merge and was **not run**. It was written against the navy card on the pre-412 dark site and its assertions are about a surface that no longer exists.~~ **FALSE, and corrected in 415b (rel415 MAJOR 1): the script contains no colour, surface or plate assertion at all.** Its four assertions are the heading, the QR breakpoint, the invite href and the presence of a form, and all four hold on the light site. **It was run in 415b, rc 0**, and its two shots were re-taken at the 415b head. See section 11.2.
- **`scripts/wave295-*`, `scripts/wave298-*` and `scripts/wave358-registration.test.ts`** are earlier waves' gates and outside this brief's four.
- **One transient**: an intermediate `wave414-mobile.py` run reported `contact @ 667x375` with no ink and a missing `<title>`, under heavy concurrent load. It did not recur in either subsequent full run and the final run is clean. Recorded rather than hidden.

---

## 8. Proposals for Callum, with recommended defaults

1. **Ask Zoopla for their positive mark and their brand guidelines.** The mark on the site is still **derived**: their reversed white artwork with the mask filled, now in their published purple rather than our navy, which is closer than wave 412 was but is not the file they would hand us. Their guidelines would also settle the next one. **Recommended: ask.**
2. **The credit renders at 82.2 x 18.0 CSS px at every width, including 360.** That is small for a partner's trademark and this site's own lockup carries a stated 140px minimum. Nothing was changed, because the right size is Zoopla's call and not ours. **Recommended: raise it to about 110px wide once their minimum is known.**
3. **Four things are now dead and were deliberately left alive**: `src/content/platform.ts`, `src/components/solutions/role-utils.ts`, `src/components/solutions/section-rail.tsx` and the `.image-fill-line` rule in `src/styles.css`. They are a consequence of item 2 and outside its named list. **Recommended: delete them in the next wave, by the same three-way verification.**
4. ~~**The QR image's `alt` says "Impact Investment Group"; `siteName` says "Impact Investment Platform". Recommended: change it to "Impact Investment Platform".**~~ **WITHDRAWN in 415b (rel415 MINOR 10): the recommended edit would have introduced the error, not fixed it.** Re-read at this head, "Group" is the ORGANISATION and "Platform" is the PRODUCT, and the site is consistent about it: `src/components/logo.tsx` line 83 gives the lockup the accessible name **"Impact Investment Group, home"**, `src/content/legal.ts` records the company as **"Impact Investment Group UK Limited"**, and the general enquiries address is **enquires@impactig.co.uk**. A WhatsApp community is run by the organisation. **The `alt` is already right**, and changing it would have made the QR disagree with the logo three inches above it and silently broken `scripts/wave411-screenshots.py`, whose selector is that exact string. **Recommended: no edit. Put it to Callum as a question if the Group/Platform split is ever formalised.**
5. ~~**`scripts/wave411-screenshots.py` asserts a surface that no longer exists. Recommended: delete it.**~~ **WITHDRAWN in 415b.** The premise was false: the script asserts no surface, no colour and no plate. It is a working gate, it is the only check that binds the QR to the `sm` breakpoint rather than to a screenshot a human has to read, and deleting it would have been the one thing in this wave that removed a check. It is run, green, and now settles like the other three. **Recommended instead: keep it, and run it in every wave that touches `/register/<role>`.**
6. **The Zoopla credit has no `srcSet`**, so `zoopla-ink-400.webp` is generated, committed and never served, and a 548px source is drawn at 82px. **Recommended: give it `variantSrcSet` like the other images, worth about 9 KiB on the home page's eager path.**
7. **The performance floor.** Unmet on three or four routes depending on machine load, and untouched by this wave. It needs a decision about what the home page may stop doing, which is Callum's. **Recommended: take a Lighthouse reading on a quiet machine before deciding anything.**
8. **`/about` runs a 23.2-character column at 768 and 10.3 at 667x375**, carried forward from 414b unchanged and still measured and printed on every run.

---

## 9. What this brief got wrong, measured

1. **"The re-checker measured lossless WebP at about 3.9 times smaller for the same file."** Measured here on the real files, **lossless is 1.32x to 13.12x LARGER, on all 101 variants, without exception**. The 3.9x was a synthetic flat frame. The brief's own escape clause, "if lossless comes out LARGER for a given source, keep lossy for it and say so", is what this wave executed, for every source rather than for some. Section 5.
2. **"Choose the split by a MEASURED property of the source."** Two candidate properties were measured across all 71 sources and **neither predicts the outcome**: `logo-lockup.webp` is *more* colourful per pixel than most photographs, and `zoopla-ink.webp` is the flattest file on the site and still loses. The only property that predicts the answer is the answer. Section 5.
3. **"`#8046F2` ... measures 5.14:1 [against white]."** The flat figure is **5.15:1** by the sRGB coefficients. ~~The **rendered** figure is **4.33:1**, because the credit draws at `opacity-90`, which the brief did not account for.~~ **CORRECTED in 415c (rel415b MAJOR 1): `opacity-90` is gone (section 11.1); the rendered figure at this head is 5.1052:1 darkest, 5.0233:1 modal.** Both clear the 3:1 floor. Section 2.
4. **"Expect a conflict there."** There was **no conflict anywhere** in the wave 411 merge. Section 4.
5. **"Fourteen components ... none of them rendered."** True, and the brief was right to demand re-verification: it also turns out that **a fifteenth file**, `src/content/process.ts`, cannot survive the fourteenth. Section 3.
6. **"MINOR 5 ... the success panel is probably shorter than one viewport, in which case `scrollIntoView` is a no-op and the numbers are right."** It is not a no-op. The page was at **scrollY 187**, and the site needed a fix, not just the probe. Section 6.
7. **"The performance floor ... is still unmet on three routes."** On this machine under load it is unmet on **four**; on the quietest pass it is unmet on three. The instrument is the variable, not the site. Section 7.

---

## 10. What a follow-up wave needs

1. **Zoopla's own artwork and guidelines**, which closes proposals 1 and 2 and lets the derived mark be retired.
2. **A quiet machine for the Lighthouse table.** Every performance number in section 7 is contaminated and the wave says so; none of them should be compared with 414b's until one run exists with nothing else building.
3. **The second sweep of dead code**, proposal 3: four named things, by the same three-way verification this wave used, which is now written down and repeatable.
4. **The `srcSet` on the Zoopla credit**, proposal 6, which is the only measured byte saving this wave found and did not take, because it is a markup change to the hero and item 1 was a colour change.
5. **`/about`'s narrow columns at 768 and 667x375**, carried from 414b and still open.
6. ~~**The three gates now settle identically.**~~ **FALSE when written, TRUE now (rel415 MAJOR 3).** `scripts/wave414-mobile.py` still carried three bare `scrollTo`s when that sentence was written, and there were four gates in the tree rather than three, the fourth being `scripts/wave411-screenshots.py`, which this wave added without running and without giving it `settle` either. **All four settle identically at the 415b head**, and all four carry `settle`, `to_top` and a polled assertion that FAILS rather than waits. If a fifth is ever written it inherits them, or it inherits the bug.

---

# 11. The 415b fix pass

The operator's independent re-checker read this wave and returned **HOLD: 3 MAJOR, 10 MINOR**
(`_cowork_ops/gate/review/rel415_verdict.md`). It confirmed the deletions, the encoding null
result and three of the five carried notes under its own measurement, and it agreed that 4.33:1
is fine for a brand mark. The HOLD was for three things this report stated that the patch and
the shots contradicted, **one of them the wave's own headline deliverable**.

All three MAJORs are closed and all ten MINORs are closed. **Nine of the thirteen were wrong
sentences in this document**, and every one is struck through and corrected in place above
rather than quietly rewritten, so a reader can see what was claimed as well as what is true.
**I disagreed with none of the thirteen.** Both proposals the re-checker attacked were
withdrawn, because both were wrong.

## 11.1 MAJOR 2: the mark shipped as a 90 per cent tint of Zoopla's purple, and this report never said so

Callum's instruction was *"the same as the ribbon on the property listing result/match card"*,
and the platform's ribbon is full strength `#8046F2`. `src/components/home/hero.tsx` drew the
mark at **`opacity-90`**, so what the page rendered was a 90 per cent tint of the file, measured
by the re-checker at `(141, 90, 243)` where the file carries `(128, 70, 242)`. **A tint is not
the same colour.** This report raised eight proposals and none of them was "drop the 0.90", so
an owner who asked for an exact match had not been told he did not get one.

**`opacity-90` is gone.** It was buying nothing: not a contrast decision, not a layout decision,
not a wave 413 requirement. Re-measured off a new full-page shot of `/` at DPR 2 with the mark
scrolled into view:

| viewport | computed opacity | darkest ink pixel | modal ink pixel | ground beside it |
|---|---|---|---|---|
| 360 | **1** | **(128, 70, 242)** | (129, 72, 242), 374 of 2,111 | (254, 254, 253) |
| 390 | **1** | **(128, 70, 242)** | (129, 72, 242), 373 of 2,111 | (254, 254, 253) |
| 414 | **1** | **(128, 70, 242)** | (129, 72, 242), 373 of 2,111 | (254, 254, 253) |
| 1280 | **1** | **(128, 70, 242)** | (129, 72, 242), 373 of 2,109 | (253, 253, 253) |

**The darkest pixel is the file's own colour exactly, with zero units of deviation on any
channel, at every width.** That is the proof the tint is gone: under `opacity-90` the same
reading was `(140, 88, 243)`.

The modal pixel sits **two units off on green**, and that is not a tint. The mark is a 548px
source drawn into an 82.2 CSS px box, so at DPR 2 it is resampled into 164 device px and almost
every pixel of a letterform that thin carries some edge blend. The tint moved the modal pixel
**13 units on red and 20 on green**; the resample moves it 1 and 2.

| reading | ratio |
|---|---|
| flat `#8046F2` on `#ffffff` | **5.152:1** |
| flat `#8046F2` on the cream `#f7f1e6` | 4.583:1, a reference figure; the mark never draws on the cream |
| **rendered, darkest pixel, on the ground beside it** | **5.105:1** |
| **rendered, modal pixel, on the ground beside it** | **5.023:1** |

Against the **3:1** WCAG 2.2 SC 1.4.11 asks of a graphic, and a logotype is exempt from the text
floors altogether.

**MINOR 2 is closed by construction**: every figure above names which reading it is. The old
report quoted **4.33:1**, which was the darkest pixel, without saying so, while the modal pixel
read 4.26:1. Nothing turned on it and nothing turns on it now, but a number whose reading is not
stated is a number the next reader has to re-derive.

**MINOR 1**, same file: the hex was written into the comment three lines above a sentence saying
the hex is in no component, and `scripts/wave415-zoopla-purple.py` line 74 goes further and says
it must never appear in a component at all. The hex is **out of the comment**. `rg 8046F2 src/`
returns nothing. The generator still carries it and is still the only place it lives.

**Nothing darkened.** The mark is 2,111 ink pixels at DPR 2 on a home page 1280 by about 16,000,
and the gate's own figures moved **down**: raw 23.59% to **23.56%** at 1280 and ground 9.06% to
**9.02%**, both inside the page's known tenth-of-a-point run-to-run spread and both under their
ceilings.

## 11.2 MAJOR 1: wave 411's gate was skipped on a false premise

This report said the script *"was written against the navy card on the pre-412 dark site and its
assertions are about a surface that no longer exists"*, and proposal 5 recommended deleting it
on the same ground. **The re-checker read all 104 lines and the premise is false: there is no
colour, surface or plate assertion anywhere in the file.**

**It was run, at this head, rc 0.**

```
1280: form=True, qr=True,  button=True, card on screen at 470..502, resting scrollY=0.0
390:  form=True, qr=False, button=True, card on screen at 462..494, resting scrollY=0.0
```

All four of its assertions hold, on exactly the one route the card survives on after this wave's
gating: the `Prefer WhatsApp?` heading, the QR visible if and only if the width is at least 640,
an `href` starting `https://chat.whatsapp.com/`, and a form on the page.

**The two screenshots are re-shot, not deleted.** `docs/screenshots/wave411/register-1280.png`
and `register-390.png` were **new files in this branch's diff**, carried in unchanged by the
merge of `bc3eb4c`, which was built at `9adb0bb` from **before wave 412 turned the ground
white**. The tree was shipping two committed images of a navy card the site no longer has.
Measured over `register-390.png` whole. **415c, rel415b MINOR 2:** the "dark share" figure below
had no stated method, and no definition reproduces the old row's **46.10%** or the re-shot row's
**5.95%**; the re-checker tried eight definitions on the re-shot image and landed between 4.28%
and 8.48%. The old shot was overwritten by the re-shoot, so its own figure cannot be re-derived
under any definition now. The claim that survives, and the one that actually matters, is the
commonest and second-commonest colours, exact by pixel count and reproducible from the committed
file:

| | size | dark share, as reported (method not stated, old shot no longer exists to re-check) | second commonest colour |
|---|---|---|---|
| as committed, shot at `9adb0bb` | 390 x 4151 | 46.10% | navy-800 `(4, 28, 61)` |
| re-shot at the 415b head | 390 x 4613 | 5.95% | **white `(255, 255, 255)`, 33.56%, behind cream `(247, 241, 230)` at 44.39% first** |

The reproducible reading is the one that carries the argument: the re-shot image's two commonest
colours are cream and white, not navy, so the navy ground is gone and the light ground is what
the page now is.

Deleting the pair was the alternative and was not taken: the script works, so the right answer
is a true picture rather than no picture.

**And it now settles like the other three.** It was added to the tree in this wave without
inheriting rel414b MINOR 1's fix, while section 10 item 6 claimed a fourth gate would. It
carried a bare `scrollTo` in a loop, a bare `scrollTo(0, 0)` and a blind 600ms wait. Now:
`settle()` scrolls `behavior: 'instant'` throughout; `to_top()` polls and `main()` **fails the
named shot** if the page does not rest at 0 before the shutter; and a new `assert_on_screen()`
(renamed `assert_heading_on_screen()` in 415c, rel415b MINOR 3: it measures the heading's own
box, not the card) polls and **fails** if the heading never comes to rest inside the viewport,
which is wave 413's
`assert_scrolled` in the shape this gate needs.

**Both new assertions were broken on purpose and both failed.**

| break | result |
|---|---|
| `to_top` parked at 400 | **rc 1**, "the page would not return to the top before the shutter (scrollY=400.0)" |
| `assert_on_screen` given an impossible window | **rc 1**, "the card never came to rest on screen (box y=470.5 h=31.3, innerHeight=900)" |

Both reverted, clean re-run rc 0.

**Proposal 5 is withdrawn.** It recommended deleting a working gate on a false premise, which
would have been the one thing in this wave that removed a check.

## 11.3 MAJOR 3: the mobile gate still had three bare `scrollTo`s, and they were losing ten readings

Section 10 item 6 said *"The three gates now settle identically"*. It was false.
`scripts/wave414-mobile.py` still carried three bare `scrollTo`s, untouched at the base; this
wave's only edit to the file was +18 lines inside `success_probe`, which is what let the claim
through unchecked. Under an `html` carrying `scroll-behavior: smooth` all three were animated:

| line | what it did |
|---|---|
| 1685 | the timings warm-up, a loop of eight animated scrolls with a fixed 90ms between them |
| 1790 | an **animated scroll of up to three viewports**, a blind 350ms, then `AUDIT` read at whatever position the animation had reached |
| 1795 | a second animated scroll back, a blind 200ms, then axe |

Line 1790 is the one that mattered. That reading is the scrolled half of this gate's headline
target count **and the only reading in which the back-to-top control exists at all**.

All three are now the polled helpers. The file gains `scroll_to` and `assert_scrolled`, matching
`scripts/wave413-motion.py`; `to_top` delegates to `scroll_to` and keeps its behaviour exactly.
The three-viewport target is computed and **clamped in Python rather than in the browser**,
because a page shorter than three viewports rests at its own maximum and a poll for the
unclamped figure would never agree. The return before axe now **fails** rather than hopes.

**The gate was re-run whole, rc 0, and two numbers moved.**

| reading | 415 head | 415b head | |
|---|---|---|---|
| interactive targets at the top | 2,839 | 2,839 | unchanged |
| **interactive targets scrolled** | 2,894 | **2,904** | **+10** |
| **targets in all** | 5,733 | **5,743** | **+10** |
| **fixed layers tested pairwise** | 55 | **65** | **+10** |
| type nodes | 5,270 | 5,270 | unchanged |
| headings | 660 | 660 | unchanged |

**Both movements are the same defect.** 65 is 13 chromed routes at 5 profiles, which is **every
chromed shot**; the gate had been reaching the back-to-top control on 55 of them and
photographing the other 10 before it existed. **Ten interactive targets and ten fixed layers
were going unmeasured, in the reading that exists precisely to measure them.** Still 0 under
44x44, 0 closer than 8px, 0 overlapping, 0 serious or critical axe violations, 0 shots overflow.

**Not a regression, recorded anyway.** The first run of this gate in 415b came back **rc 1 with
30 failures**, all five profiles of the 404 route, reporting no header, no footer, no brand
lockup and a 1.2 line box. The cause was mine and not the site's: I had run the build without
then running `node scripts/pages-postbuild.mjs dist/client`, which is what writes
`dist/client/404.html`, so the gate's server fell through to Python's own
`SimpleHTTPRequestHandler` error page and correctly reported that it was not the site's 404.
Postbuild run, gate re-run, rc 0. **The gate was right and the operator was wrong**, which is
the outcome a gate exists for.

## 11.4 MINOR 9: the ink test asserted less than it claimed, and is tighter now rather than merely documented

`first_ink_row` in `scripts/wave412-screenshots.py` and `has_ink` in `scripts/wave413-motion.py`
asked whether **any** channel of any sampled pixel was under 246. The site's cream is
`(247, 241, 230)`, whose green and blue already are, so on any page whose top rows are cream
rather than white both returned row 0 and passed **with no bar on screen**. The comment said
they asserted the bar was there; they asserted that something non-white was there.

`INK_MAX = 200` in both files now, requiring **every** channel under 200. That is below the
darkest channel of either ground this site has (230, the cream's blue) and far above the bar's
navy logo ink `(0, 17, 43)`. Measured over all 28 shots of the 412 gate:

| | deepest first ink | the pixel it finds |
|---|---|---|
| old, any channel under 246 | 10 CSS px | `(255, 235, 227)`, a near-white orange fringe |
| **new, every channel under 200** | **14 CSS px** | `(197, 128, 107)` the mark's arc, `(182, 185, 198)` the nav's navy |

Still far under `HEADER_INK_MAX = 90`. All four wave 413 clips still have ink. **The remaining
limit is stated in both docstrings rather than claimed away**: it is a test for INK, and it
cannot tell the bar from anything else dark in the top rows. That is the limit of reading a
picture, and it belongs beside the number.

## 11.5 MINOR 6: the encoder setting that was measured could not have failed

Section 5 claimed `exact=False` was byte-identical. Pillow's `WebPImagePlugin._save` reads
`exact = 1 if im.encoderinfo.get("exact") else 0`, and `scripts/wave414-responsive-images.py`
passes no `exact` on either branch, **so the default already is `False` and the measurement
compared a setting with itself.** Claim withdrawn, the count corrected from four usable settings
to three, and the setting that **can** differ measured instead. Pillow 12.3.0, the script's own
resize and both its branches:

| variant | lossy q82 m6 | lossless m6 | lossless `exact=True` | penalty for `exact` |
|---|---|---|---|---|
| `zoopla-ink-400` | **22,012** | 29,016 | 29,170 | +154 |
| `logo-lockup-400` | **30,488** | 55,706 | 56,328 | +622 |
| `logo-lockup-640` | **58,392** | 114,042 | 114,488 | +446 |
| `logo-lockup-reverse-400` | **26,022** | 40,980 | 41,350 | +370 |
| `logo-lockup-reverse-640` | **49,964** | 91,344 | 91,804 | +460 |

**Larger on all five**, and all five are far larger than the lossy branch already on disk. The
null result stands, now for a measured reason rather than a vacuous one. The lossy column
reproduces section 5's figures exactly, which is an independent confirmation of that table.

## 11.6 The other five MINORs

| # | file | what was wrong | what is true |
|---|---|---|---|
| 3 | `src/styles.css`, this report | the dead-CSS list named only `.image-fill-line`, justified by a sentence saying the 21 "disclosure" hits were all prose and `disclosure-content` | **false.** `.disclosure-marker` and its four `[data-mark]` rules were dead too, 33 lines, and only the deleted `ui/disclosure.tsx` ever emitted them. **Deleted**, not left as a proposal. `.disclosure-content` stays; `ui/accordion.tsx` uses it |
| 4 | `src/components/ui/accordion.tsx` | the comment named `Disclosure` as "the component the site's own pages use" | wave 415 deleted it. Rewritten to say what is true now |
| 5 | this report, section 4 | "which wave 414 also edited" | **neither 414 nor 414b touched `register.$role.tsx`**; 412 and 412b did. So the clean merge was the expected outcome, not a notable one, and the brief's "expect a conflict there" worked from the same wrong premise this report repeated |
| 7 | this report, section 7 | "header 0.814, footer 0.673, floor 0.80" | there is no single floor. The header's is `LOGO_LUMINANCE_FLOOR = 0.80`; the footer's is its own ground minus 0.30. Compressed into one number the footer read as 0.127 under a floor it is not measured against. Separated |
| 8 | this report, section 7 | "948 added lines" | matched nothing in the diff. **1,299** is the figure, once `bun.lock` (54) and the QR SVG (1) come out of 1,354 insertions. 0 and 0 unchanged, and independently confirmed by the re-checker over the same 1,299 |
| 10 | this report, proposal 4 | recommended changing the QR `alt` from "Impact Investment Group" to "Impact Investment Platform" | **it would have introduced the error.** `src/components/logo.tsx` gives the lockup the accessible name "Impact Investment Group, home", `src/content/legal.ts` records "Impact Investment Group UK Limited", and the enquiries address is `enquires@impactig.co.uk`. Group is the organisation, Platform is the product. The `alt` is already right, and the edit would have made the QR disagree with the logo three inches above it and **silently broken `scripts/wave411-screenshots.py`**, whose selector is that exact string. **Withdrawn** |

## 11.7 The gate at the 415b head

Every one run in the foreground, whole, at ``5afc176``, the last commit on this branch carrying
a source file; the head adds only this section and the shots these runs took.

| check | command | rc | numbers |
|---|---|---|---|
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors** |
| Lint, changed files | `bunx eslint <each>` on the LF-normalised copy | **0** | **0 errors** on all six surviving changed `.ts`/`.tsx` files |
| Lint, whole tree, head | `bunx eslint .` on an LF-normalised copy | 1 | **387 errors / 15 warnings** |
| Lint, whole tree, base | the same, on `2f46e2e` | 1 | **387 errors / 15 warnings. DELTA ZERO** |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered** |
| Postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | patched 0, trimmed 1 (the `/contact` duplicate tail this script exists to trim on a fresh build) |
| Wave 412's gate | `python scripts/wave412-screenshots.py` | **0** | **28 shots, every assertion passed. 275 incomplete axe nodes, 275 measured off the pixels, 0 unmeasured.** Darkest raw: home @ 1280 **23.56%** under its ratchet of 23.70%. **Darkest GROUND of the whole run: home @ 1280 at 9.02%, against the flat 15%, clearing it by 5.98 points.** 0 serious or critical axe violations on any shot. Body and header luminance **1.000** everywhere. At most **1 island** anywhere |
| Wave 413's gate | `python scripts/wave413-motion.py` | **0** | 13 routes at 1280 and 390 plus every standalone probe, green. 0 reduced-motion animations running, 0 faded, header 72/72/72 and 56/56/56 on every route. **4 screenshots, each asserted.** The Zoopla mark is no longer in the wash list, because it is at opacity 1 |
| Responsive images | `python scripts/wave414-responsive-images.py --check` | **0** | 71 referenced images, every one has the variants it should have, **24 transparent sources and every variant of them still transparent** |
| Wave 414's gate | `python scripts/wave414-mobile.py` | **0** | **70 shots.** 2,839 targets at the top and **2,904 scrolled, 5,743 in all, 0 under 44x44, 0 closer than 8px.** 5,270 type nodes, **0 under their size floor, 0 under a 1.6 line box, 0 under 30 characters at 360.** 660 headings, **0 breaking a word. 65 fixed layers tested pairwise, 0 overlapping. 0 serious or critical axe violations. 0 shots overflow.** Picker, keyboard, drawer, bar-over-field and success probes all green. Darkest lockup: header **0.814** against its floor of 0.80, footer **0.673** against its own floor of ground minus 0.30 |
| Wave 411's gate | `python scripts/wave411-screenshots.py` | **0** | **2 shots**, both re-taken. All four assertions green at both widths, card on screen, resting scrollY 0.0 at both |
| Dashes on added lines | over **268 added lines** in the 415b diff, text files only | | **U+2014: 0. U+2013: 0** |

### Lighthouse mobile at the 415b head

`bunx lighthouse` 13.5.0, **default mobile preset with simulated throttling**, against a
**gzipping** server (a 31-line Node server written for the run and deleted after it, because
Python's `SimpleHTTPRequestHandler` does not gzip and GitHub Pages does).

⚠ **THE LOAD CAVEAT OF SECTION 7 STILL STANDS AND THESE NUMBERS SHOULD STILL BE READ AS A
RANGE.** They are, however, taken on a markedly quieter machine than section 7's were: nothing
else was building, and the gates had all finished. That is the most likely reason performance
reads higher here than in any of section 7's three passes, and it is **evidence for section 7's
caveat rather than evidence of a change this wave made**. This wave removed no bytes from the
critical path, so nothing here should be attributed to it.

| route | performance | accessibility | best practices | SEO | CLS | TBT | LCP | bytes |
|---|---|---|---|---|---|---|---|---|
| `/` | 67 | **100** | **100** | 100 | **0** | 147ms | 6,182ms | 955 KiB |
| `/the-problem` | **85** | **100** | **100** | 92 | **0** | 5ms | 3,613ms | 420 KiB |
| `/register/investor` | 81 | **100** | **100** | 92 | **0** | 12ms | 3,978ms | 437 KiB |
| `/partner-with-investor` | 78 | **100** | **100** | 92 | **0** | 12ms | 4,660ms | 740 KiB |

**Accessibility 100 and best practices 100 hold on all four routes.** That is the part the gate
binds and it is met. **CLS is 0 on all four.**

**The performance floor of 85 is met on one route and stays a stated shortfall, not a chased
one**, exactly as the brief instructs. It needs a decision about what the home page may stop
doing, which is Callum's, and proposal 7 still stands.

## 11.8 What 415b did not do, and why

1. **The eight proposals of section 8 are still proposals**, minus the two withdrawn here.
   Proposals 1, 2, 3, 6, 7 and 8 are unchanged and still Callum's to decide. Nothing in the
   re-check asked for them to be taken and taking any of them would have been new work inside a
   fix pass.
2. **`src/content/platform.ts`, `solutions/role-utils.ts`, `solutions/section-rail.tsx` and the
   `.image-fill-line` rule are still alive**, as proposal 3 says. `.disclosure-marker` was
   deleted here rather than left with them because it is not a judgement call: it is CSS with no
   possible emitter, which the report had wrongly certified as not existing.
3. **No Lighthouse comparison with 414b.** The instrument is still the variable: section 7 says
   so and 415b changes nothing about it. This wave removed no bytes from the critical path.
4. **`scripts/wave295-*`, `scripts/wave298-*` and `scripts/wave358-registration.test.ts`** remain
   outside this brief's gates, as in wave 415.
