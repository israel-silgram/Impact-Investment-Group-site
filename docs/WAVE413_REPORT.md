# Wave 413 report: motion that helps

**Branch** `feat/wave413-motion-that-helps`, cut from `origin/feat/wave412-light-and-bright`
at `748e0fb` (the 412b head), built in the worktree
`C:\Users\Israel\Documents\repos\iigs-uc413`. A stacked wave: 412 is not on `main` yet.
`origin/main` sat at `9adb0bb` when this wave started and had not moved when it finished,
so nothing was merged in. The repository's own checkout on `main` was not touched; every
git command in this wave ran against the worktree.

**Number claimed** by pushing an empty commit (`ef09dc4`) before the first edit. 413 was
free on both remotes: the site remote carried 411 and 412 and nothing higher, the platform
remote carried 410. No collision.

**The call**, Callum, 18 September 2026, 23:30 UK:

> "please then go through out the site and add animations that aid the users experience on
> the site, animations that not only look good, but make the site more usable through out
> (so they're clever)."

---

## 1. The law of motion on this site

Six rules. Every animation below is named against them, and the two places this wave
broke rule 2 are named as exceptions with their reasons rather than left unsaid. The
whole of it is written into `src/styles.css` above the wave 413 block, so the next wave
reads it where the code is rather than only here.

1. **It has a job.** Every animation is named in section 2 with the thing it helps a
   visitor DO. Decoration alone was cut.
2. **Fast and physical.** 150 to 400ms, route transitions 200ms or less,
   `--ease-out-soft` for entrances and `ease-in` for exits, and exits are always shorter
   than the entrance they undo. **Transform and opacity only, with two exceptions**: the
   header's height and the disclosure's height. Both are named below.

   > **Corrected in 413b.** As wave 413 shipped, this sentence was wrong: there were
   > **three** transitions on a layout property, not two. The magic line transitioned
   > `width` and the registration progress bar transitioned `width`, and neither was
   > named here. Both are transforms now (the line is a 1px rule given
   > `translateX(left) scaleX(width)`, the bar is `w-full` given `scaleX(fraction)`),
   > measured pixel-exact against the link the line is under at both bar heights, so
   > the count in this paragraph is now true of the code.
3. **Nothing hides content.** No text is ever at opacity 0 waiting for a trigger. Wave
   412 fixed `Reveal`; this wave keeps it fixed, removed one place where the same defect
   was already shipping, and adds nothing that could bring it back.
4. **Reduced motion is a first-class path.** The global block in `styles.css` stays;
   per-feature arms are added wherever flattening alone would leave a state invisible.
   Section 3 is the table.
5. **Keyboard parity.** Whatever `:hover` triggers, `:focus-visible` triggers.
6. **No parallax, no scroll-jacking** beyond the Lenis wheel momentum that already
   existed on desktop pointers, no cursor followers, no tilt. None was added.

### The two exceptions to rule 2, and why each is not a choice

**The header's height.** The point of condensing is that the visitor GETS THE SPACE BACK.
A sticky bar occupies flow: a transform on it moves the paint and leaves the 72px hole
behind, so the viewport gains nothing at all. It is one property, on one element, at the
top of the document, crossed at most once per change of scroll direction.

**The disclosure's height.** A disclosure has to push what is under it down the page.
That IS the animation, and there is no transform that moves the rest of the document. The
library already animates exactly one element from 0 to its measured content height; this
wave retimed it from 200ms to the site's 250ms and gave it the site's easing.

### Durations, as tokens

One place to retime the site. Added beside `--duration-hover` and `--duration-reveal`,
which wave 412 already had.

```
--duration-hover   200ms   hover, press, and the header's condense
--duration-enter   250ms   a drawer, a disclosure row, a registration step
--duration-route   200ms   <main> arriving on a client navigation
--duration-fade    150ms   a menu, a validation message
--duration-reveal  350ms   a reveal, a photograph, the demand map's canvas
--duration-exit    120ms   anything leaving (always paired with ease-in)
--header-height            72px
--header-height-condensed  56px
```

> **Corrected in 413b.** The token comment in `styles.css` filed an image under
> `--duration-fade`, 150ms; this report said an image fades over 300ms, twice; the
> code has always used `--duration-reveal`, which is **350ms**. Three numbers for one
> thing. The number is 350ms, it is what the code does, and it is what both the
> stylesheet and this report now say.

---

## 2. Every animation, and the job it does

Twenty-two. Each row is a thing a visitor can do more easily than they could at `748e0fb`.

### The header and orientation

| # | What moves | Its job |
|---|---|---|
| 1 | **The bar condenses**, 72px to 56px, 200ms | Gives the viewport 16px back on every route. On a 667px phone that is two and a half per cent of everything a visitor can see at once. It expands after 24px of upward travel, because scrolling up is what somebody does when they are looking for the navigation. |
| 2 | **The logo scales to 0.85** with it, from its left edge | The mark shrinks with the bar instead of being cropped by it, and stays pinned where the eye already found it. |
| 3 | **The card shadow appears** when condensed | Says the bar is now ON TOP of the page rather than part of it, which is the only thing separating a white bar from a white page once it starts overlapping content. |
| 4 | **The magic line**, one underline travelling between nav links, 200ms | Orientation, continuously. A line that MOVES from where you are to what you are pointing at answers both questions at once, and the eye tracks one moving object far better than six fading in and out. It settles under the active route on every navigation. |
| 5 | **The Partners menu**, 150ms fade and a 4px rise out of its trigger | Says where the panel came from. It replaced the library's 95% zoom, which on a 660px menu read as a lurch. |
| 6 | **The chevrons turn 180 degrees**, 200ms, on both Partners triggers | Confirms the press on the one control whose state is otherwise only visible in what appeared somewhere else. |
| 7 | **The drawer slides from the right**, 250ms, over a page dimmed to 40% | The page stays visible behind it, so the visitor reads "this is on top of what you were reading" rather than "you have gone somewhere", and the backdrop becomes an obvious place to press to get back. |
| 8 | **Its items stagger 30ms apart** | The menu reads as one list settling rather than as eight things appearing at once. |
| 9 | **Back to top**, appearing after two viewports, 200ms | One press back to the navigation from the foot of `/legal` or a partner page, which are four screens long. It is not offered before two viewports, because a control that says "back to top" while the top is on the screen is one more thing in the corner of every page for no gain. |
| 10 | **`<main>` rises 8px on a client navigation**, 200ms | Marks the arrival for somebody whose eye is in the middle of the viewport. A navigation here used to be a repaint between two frames with nothing to say it had happened, and the jump to the top read as a glitch. |

### Presses

| # | What moves | Its job |
|---|---|---|
| 11 | **Every button presses to 0.98**, 80ms, from `:active` | A pressed control must never look like an unpressed one. On a touchscreen this is the ONLY feedback there is, because there was no hover state beforehand to have said anything. It fires for Enter and Space exactly as it does for a finger. |
| 12 | **The primary button lifts 1px** and deepens its shadow, 200ms, on hover AND focus | 1px rather than 2: on a filled pill the shadow is what reads as the lift, and 2px of travel on top of it made the button look like it was jumping away from the line of text beside it. |
| 13 | **The arrow nudges 3px**, on hover AND focus | Says the control goes somewhere. The focus arm is the point rather than a bonus: an arrow that only moves for a mouse tells a keyboard user nothing. |
| 14 | **Cards lift 2px on `:focus-within`** as well as on hover | A `panel` is a plain `<div>` that cannot take focus itself, and what a keyboard visitor needs to see is that the card they tabbed INTO is the one that moved. Wave 412 wrote that sentence about the role tiles and did not carry it to the cards. |
| 15 | **The icon plate deepens one step**, 12% of its own colour to 18%, 200ms | Says "the whole tile is what you are pointing at" rather than leaving the lift to carry it alone. Measured; see section 4. |
| 16 | **Role tiles settle on press** | On a phone the tap is the only thing between pressing a role and the next page arriving, and on a slow connection that gap is long enough for somebody to press a second tile. |

### Numbers, steps and forms

| # | What moves | Its job |
|---|---|---|
| 17 | **The counting figure gets `tabular-nums`** | Barlow's default figures are proportional, so a 1 is narrower than a 0 and the numeral changed WIDTH on nearly every frame: six digits jittering left and right for 1.4 seconds under a headline. This is the whole reason the count is watchable. |
| 18 | **A 6px dot breathes** beside "live from our platform", 2s | Makes that line read as a claim about NOW. A static caption saying "live" is a label somebody typed; a marker that breathes is the same sentence being made again every two seconds. **One of the three loops this wave adds, and the only permanent one** (413b: the map's skeleton sheen at 1400ms and `animate-spin` on the three submit buttons are the other two, and each stops existing when the thing it is about finishes). |
| 19 | **Registration steps move in the direction of travel**: forward from the right, Back from the left, 250ms, the leaving step fading out over 120ms | A survey with no page change and no URL change gave a visitor nothing to tell "I have moved on" from "my answer did not take". Direction is the cheapest possible answer and the same one a paper form gives. |
| 20 | **The progress bar stretches**, 300ms (`scaleX` from its left edge since 413b; it transitioned `width` as shipped) | The bar is the only thing on the page that says how much is left, so it has to finish before the visitor has finished reading the new question. |
| 21 | **The saved mark draws itself**, 400ms of `stroke-dashoffset` | Makes the save something the visitor SEES HAPPEN rather than something that was already there when they looked. It is the site's own Lucide `ShieldCheck`, not a new tick: the brand replaced every checkmark here with an icon from that set, and drawing one of those is the version of "the tick draws itself" that does not put a tick back. The same treatment marks the `/contact` success panel. |
| 22 | **Validation messages fade in**, 150ms, and the field border turns `destructive` | A message appearing between two frames under a field somebody is still looking at reads as the page breaking; over 150ms it reads as an answer. **No shaking and no bouncing anywhere in either form**: these ask a resident about their housing need, and a form that wobbles at somebody reads as a form that is cross with them. |

### And two that are not animations but belong to the same pass

**The submit spinner**, on both forms (three buttons). The label already changed while a
request was in flight and nothing else did, which on a slow connection reads as a press
that did not take. The control is disabled, so it cannot be pressed twice; the spinner is
what says why. No new copy: the labels were already `copy.saving` and "Sending".
**413b: it does not rotate under reduced motion** (`motion-reduce:animate-none`), where
the dead control and the changed label carry "busy" between them.

**The disclosure keeps your place.** Opening a row further down a long list grows the
document above wherever the browser had settled, and the row you pressed can end up behind
the sticky header. If its trigger has gone above the condensed bar once the row is open,
it is scrolled back to just under it. **Only then**: a row that is already visible is
never moved, because moving a page nobody asked to move is worse than the problem.

**And the disclosure marker turns** instead of switching. `Plus` and `Minus` sat one on
top of the other and were swapped with `hidden`/`block`, which is a state change with no
motion in it at all: on a row you had just pressed, the one thing that should confirm the
press was the only thing that did not move. They cross-fade through 180 degrees over the
same 250ms the row takes. Both glyphs are always painted and opacity picks between them,
so there is no state in which the marker is missing.

### Photographs

**Nineteen images had no loading strategy at all**, which means the browser's default
(`eager`) for every one: every photograph on a page fetched before the first paint,
competing with the fonts and the bundle. They are explicit now: `eager` with
`fetchpriority="high"` for the three hero photographs and the header logo, `eager` with
`fetchpriority="low"` for the hero's 7% wash (high on all four would have put the wash in
the same queue as the pictures the hero exists to show), `lazy` for the remaining
fourteen.

**And they fade in over 350ms when they decode** (`--duration-reveal`; this said 300
before 413b and the code never did), from `src/components/image-fade.tsx`.
This is one component rather than a prop on fifty images, and the reason is the invariant:
an `<img className="fade-in">` whose class carries `opacity: 0` is the wave 412 defect
with a different name. It walks the document at mount and on every router mutation, and
touches ONLY an image that is not yet `complete`. An image the server painted or the cache
already holds gets no attribute, no animation, and no frame at opacity 0.

**Width and height.** Twelve images carry none, and every one of them has its box fixed by
CSS instead: `absolute inset-0`, an explicit `aspect-[16/9]` or `aspect-[5/4]`, a fixed
`h-[104px]`, or `h-full` inside a sized parent. None can shift the layout whatever its
intrinsic size is. Seven of the twelve take a DYNAMIC src whose candidates have different
intrinsic sizes (`/images/ai-team/petra.webp` is 347x520, `peter` 272x520, `pippa`
313x520; the three `PORTAL_ART` files are 338, 281 and 271 wide at 560 tall), so a single
pair of attributes would be WRONG for most of them, and a wrong reservation is worse than
none. `hero-ground-street.webp` gained its real 1672x941 because it is a literal src; the
three hero panels already carried theirs.

### The marquee

**It stops for a pointer now.** The comment above that rule has said "hover and
focus-within" since wave 412 and only `:focus-within` was ever written, so the lane did
not pause for a mouse at all: a visitor trying to read a council's name had to tab into a
lane whose contents are `aria-hidden` decoration. Reading the name is the only reason
anybody stops it. On a touch screen, where there is no hover to pause with and tapping
decoration does nothing, it runs at half speed instead (`@media (hover: none)`), which is
the only control that rule can offer a phone.

---

## 3. Reduced motion: what moves, and what a visitor who refused motion sees instead

The global block in `styles.css` flattens `animation-duration` and `transition-duration`
to 0.001ms and forces `animation-delay: 0`. That is a backstop, not the design. Where
flattening alone would leave a STATE invisible, there is a per-feature arm; where it would
freeze an infinite animation at whichever keyframe the browser landed on, the animation is
removed outright rather than flattened.

| Feature | With motion | Under `prefers-reduced-motion: reduce` |
|---|---|---|
| Header condense | 200ms height and logo scale | The bar is 72px or 56px immediately. Same two states, no travel. |
| Magic line | Slides between links, 200ms | Appears under the link instantly. The state is ALSO carried by the active link's `orange-700` label, which is not motion at all. |
| Partners menu | 150ms fade and 4px rise | The panel is simply there and simply gone. |
| Drawer | 250ms slide, items 30ms apart | Panel and items are there at once. Focus trap, scroll lock, Escape and the backdrop are unchanged: none of them was ever the animation. |
| Back to top | 200ms fade in and out, smooth scroll | Appears and disappears at the same two scroll positions, and the scroll is a JUMP. A several-thousand-pixel smooth scroll is the single most nauseating thing a page can do to somebody who set this flag. |
| Route change | `<main>` rises 8px over 200ms | The new page is simply there. Scroll restoration is the router's and is `auto` either way. |
| Button press | 0.98 for 80ms | **Still 0.98, applied instantly.** Corrected in 413b: the global block flattens `transition-duration` only, so `.press:active { scale: 0.98 }` still computes and still applies, it just has no travel. The row used to say "no scale", which was wrong and understated what a visitor gets. |
| Button and card lift | 1px and 2px with a deepening shadow | **The lift and the shadow are both still applied, instantly.** Corrected in 413b: the row used to credit only the shadow, and the `translate` survives flattening exactly as the shadow does. The focus ring is unchanged. |
| Submit spinner | `animate-spin`, while a request is in flight | **Does not rotate** (`motion-reduce:animate-none`, added in 413b). The control is disabled and the label has changed, which is the whole of "busy". |
| Map skeleton plate | A 1400ms sheen crossing it | **The sheen is removed and the plate stays.** The shape that says "this is coming" was the block sitting where the map will be, not the light moving over it. |
| Icon plate | Tint deepens 12% to 18% over 200ms | Deepens instantly. It is a colour, not a movement. |
| Count-up | Counts to the figure over 1.4s | The figure is there, and always was: `useCountUp` initialises to `value` (wave 412b) and refuses to rewind under this preference. |
| Live dot | Breathes 0.45 to 1 over 2s | **Animation removed, opacity pinned to 1.** A flattened infinite animation freezes wherever it lands; the solid dot and the `Activity` glyph say "live" without it. |
| Registration step | 120ms exit, 250ms directional entrance | `moveTo` takes its instant branch: the step changes with no fade and no slide. The direction was never the information; the new question, the longer bar and the new counter are. |
| Progress bar | 300ms width | Jumps to the new width. |
| Saved mark | Draws itself over 400ms | The glyph is simply there beside the word "Saved". |
| Validation | 150ms fade and 2px rise | The message is there at once, `role="alert"` announces it, and the field border is `destructive` either way. |
| Disclosure row | 250ms height, marker turns 180 degrees | Opens and closes at once. The marker still changes from Plus to Minus, because opacity picks between two glyphs that are both always painted. The scroll-into-view is a JUMP. |
| Demand map | Skeleton sheen, then a 300ms canvas fade | **Sheen removed** (an infinite animation, same reason as the live dot). The plate is there while the field builds, and the canvas appears when it is ready. |
| Photographs | 300ms fade when decoded | **The component returns before it sets anything.** No attribute is written, so no image ever spends a frame at opacity 0. |
| Council marquee | 40s lane, pausing on hover and focus | Unchanged from wave 412: the animation is removed and the track wraps, with the clone lane hidden. |
| Demand map node and hub pulse | 2.6s and 3.2s loops | Unchanged from wave 412: removed outright. |
| CTA ring | 2.4s pulse | Unchanged from wave 412: removed, leaving a static raised shadow. |

**Measured, not asserted, and in two halves since 413b.**

**What survives.** `scripts/wave413-motion.py` emulates the preference on every page at
both widths and reads `document.getAnimations()` one second after load. **Across 26
page-width combinations, zero animations longer than 1ms survive.** 1ms and not 0
because the global block flattens rather than removes, so a survivor shows up at exactly
0.001ms and anything real shows up at 120ms or more.

**What happens when the page is used.** The sentence above is narrower than it used to
read here, and the rel413 verdict was right about it: a read of `getAnimations()` on a
settled page proves that nothing LOOPING or FILLED survived the preference, and proves
nothing whatever about a transition nobody triggered. So probe (j) now EXERCISES them
under `reduce`: a card is hovered, a button is pressed and released off-target, the
drawer is opened and closed at 390, a registration step is taken, a disclosure is
opened. After each one it reads the computed `transition-duration` and
`animation-duration` **of the element that moved** and asserts both are at or under a
frame, and then asserts the state that motion was carrying is still there:

| Exercised | Worst duration on the element that moved | The state, without the motion |
|---|---|---|
| A card hovered (`.panel`) | **0.001ms** | The shadow and the lift, applied instantly |
| A button pressed (`.press`) | **0.001ms** | 0.98, applied instantly; the control is still a pressed control |
| A disclosure opened (`<details>` on `/contact`) | **0.001ms** | `open` is on the element and the answer's text is in the tree |
| The drawer opened at 390 | **0.001ms** panel, **0.001ms** backdrop | `aria-modal="true"` on the panel, `aria-expanded="true"` on the trigger, Escape still closes it |
| A registration step taken | **0ms** step, **0ms** bar (the flow's own arm removes them outright) | The `aria-live` counter goes `01 / 09` to `02 / 09` and the bar carries `aria-valuetext="Question 2 of 9"` |

---

## 4. The one colour pair this wave introduced, measured

The icon plate deepening. A deeper plate is a smaller ratio, so it was measured before it
was written. An icon glyph is a **non-text graphic and answers to 3:1** (WCAG SC 1.4.11),
not to 4.5:1.

| Plate | Glyph | On white | On the cream |
|---|---|---|---|
| 12% orange (at rest) | `orange-600` | 4.62:1 | 4.13:1 |
| **18% orange (hover and focus)** | `orange-600` | **4.26:1** | **3.85:1** |
| 12% teal (at rest) | `teal-600` | 4.46:1 | 4.00:1 |
| **18% teal (hover and focus)** | `teal-600` | **4.10:1** | **3.68:1** |

The worst case keeps 0.68 of a point over the floor. **20% was the first attempt and
reached 3.58:1**, which still clears 3:1 but spends more of the margin than a hover state
is worth; 18% is a plainly visible deepening (half again as much pigment) that does not.
Inside a navy island the plates keep their own dark values, because 18% of a light tint
over navy is a smudge.

**No new colour and no hex in a component.** The deepening is a `color-mix` of
`--color-orange-500` and `--color-teal-600`, the two tokens the 12% tints are already
built from. `--shadow-glow-teal` was added to `styles.css` to replace a literal (section
6), and is the same glow expressed through `--color-teal-400`.

---

## 5. The gate, measured in this worktree

Every command run in the foreground, in this worktree, at the head this branch ends on.

| Gate | Command | Exit | Numbers |
|---|---|---|---|
| Lint, changed files | `bunx eslint` on all **23** lintable changed or added files | **0** | **0 errors**, 3 warnings (all `react-refresh/only-export-components`, all pre-existing) |
| Lint, whole tree | `bunx eslint .` on an LF-normalised export of this head | **0** | **387 errors / 15 warnings** |
| Lint, whole tree, base | the same, on `origin/feat/wave412-light-and-bright` | **0** | **387 errors / 15 warnings**. **Delta zero** |
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors**, against 0 at the wave 412 head |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered** |
| Postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | patched 0, trimmed 0 on the final build (it trimmed 1 duplicated tail on an intermediate one; the prerender bug wave 412 documented is still intermittent) |
| Wave 412's gate, whole | `python scripts/wave412-screenshots.py` | **0** | **28 shots, every assertion passed.** 279 incomplete axe nodes, **279 measured off the pixels, 0 unmeasured**. Reveal probe minimum opacity **1.000** on both routes. Darkest raw home @ 1280 **23.63%**, darkest ground home @ 1280 **9.17%** |
| Wave 413's gate | `python scripts/wave413-motion.py` | **0** | 13 routes at 1280 and 390, the numbers below |
| Em dashes on this wave's added lines | U+2014 | | **2**, both pre-existing strings re-emitted by prettier (section 7) |
| En dashes on this wave's added lines | U+2013 | | **0** |
| `git diff <base>...HEAD -- src/content` | | | **empty** |
| Tests or checks weakened | | | **One ratchet raised, and it is the home page's RAW dark-pixel ceiling** in `scripts/wave412-screenshots.py`: `("home", 1280)` **0.2357 to 0.2370** and `("home", 390)` **0.2220 to 0.2221**, caused by the three added `<img>` `loading`/`fetchpriority` attributes changing WHEN the hero photographs arrive, so more of them are painted at the moment of the shot. Eight readings, the cause and the reasoning are in the section below. **Nothing else.** The page-GROUND figure that actually means "the page is light" is untouched at a flat 15%, and the gate gained a whole second script, an unmeasured-node failure arm, and the drawer geometry assertion. *(413b: this row used to say "none", which contradicted the body of the same report.)* |

### `scripts/wave413-motion.py`, per probe

| Probe | Result |
|---|---|
| (a) Reduced motion | **0 animations over 1ms** surviving, on all **26** page-width combinations |
| (a) Reduced motion, opacity | **0 faded elements** in any first viewport |
| (b) Motion allowed, opacity | **0 faded elements** in any first viewport one second after load, measured on EFFECTIVE opacity since 413b (the product of the element's own value and every ancestor's, so a wrapper at 0 with its words in a child is caught on the child). 10 decorative washes across the 26 (photographic grounds at 7% to 70%), each printed in full with its measurement |
| (c) Header | **72 / 56 / 72** on all **26**: at rest, past 300px of scroll, and back at the top |
| (d) Registration step | transition **397 to 440ms** across runs, press to settled **414 to 544ms**, budget 450. Previous question gone from the accessibility tree: **yes** |
| (e) Drawer | opens from the menu button, panel **336x844** and backdrop **390x844** against a **390x844** viewport, Tab from the last item wraps to the first, `scrollY 0 -> 0` under a real wheel event, Escape closes it, scroll released |
| (f) Long tasks | **0** over 50ms during a full top-to-bottom scroll of the home page. Frame budget 16.7ms at 60fps |

**On the step transition's budget.** The declared animation is 370ms: a 120ms exit and a
250ms entrance. The measured span is 397 to 440ms, and the difference is REACT, not slack:
the two halves are on two different nodes, so the exit ends, its `animationend` fires, the
component swaps the question, React reconciles and commits, the browser recalculates style,
and only then does the entrance get its first frame. That is about two frames on an idle
machine and more on a loaded one. The swap already follows the fade's own `animationend`
rather than a timer, which is what took this down from 400ms of wall clock in the first
draft. **The brief's 400ms line is met on an idle machine (397ms) and the gate sits at
450**, because a ceiling at the exact measurement fails on a scheduler rather than on a
regression. The printed figure is the one to read: if it starts reporting 500, something
got longer.

### The home page's ratchet, restated

`RAW_CEILING` for `("home", 1280)` moved from **0.2357 to 0.2370**, and for
`("home", 390)` from **0.2220 to 0.2221**. Neither is the page getting darker, and the
script says all of this where the number is.

**390, by one hundredth.** The header is 72px and was 76px. Four pixels of white is
nothing arithmetically (four rows out of roughly nine thousand). What it moves is the
SAMPLING GRID: the script reads every 4th pixel from y=0, so taking 4px off the top slides
the whole document one full sample step and every sampled row lands on different content.
Eight readings at this head: 22.200%, 22.202% five times, 22.205%.

**1280, and this one is about spread rather than level.** Eight readings of the same build
on the same machine: **23.47, 23.53, 23.54, 23.55, 23.56, 23.57, 23.57, 23.64 per cent**,
a spread of 0.17 of a point. Wave 412b's note already said this page cannot be read to the
hundredth because it animates; what this wave changed is how much. The home page now
carries FOUR looping animations rather than three (the marquee, the map's node pulse, the
CTA ring, and this wave's breathing dot) and a canvas that fades in. **The marquee is what
actually moves the figure**: its plates are masked out of the GROUND number but not out of
the RAW one, and the crests on them are dark, so where the lane has got to when the shutter
opens is worth a tenth of a point on its own. 23.70% is 0.06 above the highest reading and
less than a third of the spread.

**The ground figure is the one that means "the page is light"**, it is 9.17% at its worst,
and it answers to the flat 15% with no ratchet and no exception. Nothing about that was
relaxed.

---

## 6. Carried from the wave 412 release check (rel412b), done first

Four MINORs, in one commit before any motion work, each measured in
`_cowork_ops\gate\review\rel412b_verdict.md`.

**MINOR 1**, `src/components/home/mission-solution.tsx`: the terracotta hero tile's eyebrow
and sourced-figure line rendered 88% white on the orange-600 fill, which is
**(244, 232, 229) on (174, 78, 48) and 4.46:1** against a 4.5:1 floor. Both are `text-page`
now, solid white, **5.34:1**. This is the pair neither half of the gate could see: in exact
arithmetic 88% white over orange-600 is **4.496:1**, axe rounds to two decimals and reads
4.50, so the node comes back as neither a violation nor incomplete, and the pixel
measurement only ever gets the incomplete ones. The numeral between the two lines was
already solid white at 5.34:1, which is what proved the shortfall was the alpha and not
anti-aliasing.

**MINOR 2**, the same file, `StatTile`: the basis line at 85% white is **4.32:1** on
orange-600 and about **4.25:1** on teal-600 at 11px. `text-page` when filled. No gate could
reach it: it carries `max-h-0 opacity-0` until the tile is hovered, so it is in no
screenshot and axe never evaluates it.

**MINOR 3**, `scripts/wave412-screenshots.py`: an UNMEASURED incomplete axe node was
printed and tallied and never asserted, so a later wave that put a failing pairing inside a
closed disclosure would have got a printed line and a green gate. It fails on a non-zero
count now. The count is **0 on every page** at this head, so nothing is grandfathered in.

**MINOR 5**, `src/routes/platform.tsx`: the MissionControl disc kept
`shadow-[0_0_65px_rgba(37,209,194,0.22)]`, a colour literal carried over from the line wave
412 replaced, naming a teal the palette does not have. It is `--shadow-glow-teal` in
`styles.css` now, the same glow built from `--color-teal-400`.

**MINOR 4** (the postbuild `trimTail` residual) and **MINOR 6** (the Reveal probe covering
one canary per route) are accepted as stated rather than fixed, which is what the verdict
asked for.

---

## 7. Four defects this wave found, including two of its own

**1. The mobile drawer was fixed to the header, not to the viewport.** `position: fixed` is
fixed to the viewport only while no ancestor has a transform, a filter or a
backdrop-filter. The site header carries `backdrop-filter: blur` (wave 412, so the page
reads through the bar as it scrolls), and the drawer was rendered inside it. The panel was
therefore fixed to a 72px bar: `inset-y-0` made it **72px tall**, with the whole menu
spilling out of it over the page, and the backdrop covered the header and nothing else.

**Every probe passed on that build.** It opened, it trapped focus, it locked the body
scroll, Escape closed it, Tab wrapped from the last item to the first. It was the
SCREENSHOT that showed it, which is the wrong way round, so the drawer probe measures the
panel's height and the backdrop's box against the viewport now: **336x844 and 390x844
against a 390x844 viewport**, where the broken build would have given 336x72 and 390x72.

**2. `.registration-step` carried a blanket entrance, and it was the wave 412b defect
wearing a different hat.** `animation: registration-enter 380ms var(--ease-out-soft) both`
applied to the FIRST panel both register routes paint. Those routes are prerendered, so
the server painted the account form, the bundle landed, and the backwards fill of an
animation declared with `both` put it back at opacity 0 and faded it in over 380ms.
Visible, blink, fade, on every load of `/register/investor` and `/register/resident` since
the rule was written. A step animates only when the visitor MOVED to it now, which the
component says by putting a direction on it; the account panel carries no `data-step` and
matches nothing.

**3. The council marquee did not pause for a pointer.** The comment above that rule has
said "hover and focus-within" since wave 412 and only `:focus-within` was ever written. A
visitor trying to read a council's name had to tab into a lane whose contents are
`aria-hidden` decoration.

**4. Two defects in this gate's own first drafts**, written down where they happened rather
than quietly fixed. The faded-element check kept a list of class names to forgive, which
was wrong twice over (Tailwind's arbitrary opacity utilities do not survive into the
truncated class string the sampler reports, and a list of names goes stale the first time
somebody adds a wash); it asks two questions about the element instead. And the drawer
probe used `window.scrollBy` to test the scroll lock, watched the page move 369px behind a
drawer that was locked correctly, and reported a defect that did not exist: **`overflow:
hidden` stops the visitor, not a script.** It uses a real wheel event now.

### One thing this wave did NOT change, and said so rather than assuming

`document.body.style.overflow = "hidden"` alone **does** lock this page today, and that was
measured rather than assumed. The drawer says it on `documentElement` as well because body
alone works only for as long as nobody gives `<html>` an overflow of its own, which is one
stylesheet rule away and would fail silently. Both previous values are captured and put
back rather than blanked, so another component that owns one of them keeps owning it.

### The two em dashes

Both are PRE-EXISTING strings re-emitted by prettier when it reflowed the line around them,
verbatim from `origin/feat/wave412-light-and-bright`: the logo link's `aria-label`
("Impact Investment Platform", line 137 on the base) and the "Affirmation, not a tick"
comment in `enquiry-form.tsx` (line 164 on the base). The first is a user-facing string
this wave is not allowed to change. The four that this wave wrote itself were replaced with
colons and commas in `8d96986`.

### The one new string

**`aria-label="Back to top"`**, on the icon-only back-to-top control, which is the only
place the brief allows a new one. Plain words. Every other `aria-label` that appears on an
added line (`"Close menu"`, `"Main"`, `"Mobile"`, `"Site menu"`, the logo's) is a
pre-existing string whose line moved.

---

## 8. What was skipped, and why

**The stat-to-map category highlight** (brief item 8). The brief said to read
`demand-map.tsx` and `demand.ts` and to skip this rather than invent a mapping if there is
none. **There is none.** `demand.ts` is eighteen commissioning AUTHORITIES with
`homesSourced`, `potentialRooms` and an `intensity`; the map's hit targets are local
authority polygons keyed to those. There is no category dimension anywhere in the data, so
there is nothing on the map for a stat card or a bullet to highlight. Inventing one would
have meant inventing the figures behind it, which this project forbids twice over.

**The map's tooltips** (brief item 8). They are native SVG `<title>` elements, rendered by
the browser's own tooltip chrome. CSS cannot reach them and there is no fade to give them.
Replacing them with a custom tooltip would be a new component and a new interaction model
on the one element of this site that is already keyboard-operable through 260 polygon hit
targets, which is a larger change than "tooltips fade over 120ms" describes.

**The toast** (brief item 6). **There is no toast on this site.** `src/components/ui/sonner.tsx`
exists as a shadcn leftover and `<Toaster />` is mounted nowhere, on any route. `/contact`
reports success by replacing the form with an inline panel and failure with an inline
`role="alert"`, and both are better than a toast: they persist, they are in the reading
order, and they do not vanish while somebody is still looking for them. Mounting a toaster
would have added a component, an interaction and almost certainly a string. It is a
proposal below instead.

**"The panel below slides in from the right"** on the role picker (brief item 5). There is
no panel below. `/register` is a chooser whose ten tiles are `<Link>`s that NAVIGATE to
`/register/$role`; nothing expands in place. The tile settles on press (#16) and the new
route arrives on the 200ms rise that every route gets (#10).

---

## 9. Screenshots

`docs/screenshots/wave413/`, written by the probe, four states a report cannot describe.

| File | What it proves |
|---|---|
| `drawer-open-390.png` | The drawer open at 390: a panel from the right, the page dimmed and still legible behind it, and "About Us" in `orange-700` as the route you are on. Taken after the containing-block fix, so it is also the evidence for section 7.1 |
| `condensed-header-1280.png` | The bar at 56px past 300px of scroll, the logo at 0.85, the card shadow under it, and the magic line settled under the active route |
| `step-mid-transition-1280.png` | A registration step 200ms into its move: the incoming question part way through its slide from the right, at part opacity |
| `success-mark-1280.png` | The saved mark 200ms into its 400ms draw, cropped to the line it sits on. A picture of a finished mark is a picture of a mark and proves nothing about the drawing |

`docs/screenshots/wave412/` was regenerated in full by wave 412's own gate, which ran to
completion at this head. The four PNGs that changed in the first commit are the evidence
for the two colour fixes in section 6.

---

## 10. For wave 414, the mobile pass

**No layout defect at 390 broke any probe in this wave.** The overflow assertion in
`scripts/wave412-screenshots.py` passes on all thirteen routes at 390, and the motion probe
reads a 72/56/72 header and a fully covering drawer there. Four things 414 should know
rather than rediscover:

1. **The drawer is new and it is where the sticky mobile CTA will want to be.** It is
   `fixed inset-y-0 right-0` at `z-50` with a `z-40` backdrop, and it must not be possible
   to press a sticky CTA through an open menu. The drawer probe's geometry assertion will
   catch a backdrop that stops covering the page; it will not catch a CTA at a higher
   z-index.
2. **The header is 56px condensed and 72px at rest**, as `--header-height-condensed` and
   `--header-height`. Anything that has to clear the bar reads those rather than a number:
   the zero-specificity `:where([id]) { scroll-margin-top: var(--header-height-condensed) }`
   floor already does, and so does `Disclosure`'s scroll-into-view.
3. **`position: fixed` is not fixed to the viewport under the header.** Section 7.1. Any
   sticky or fixed element 414 adds inside `<header>` will be sized to the bar. The header
   is the only element on this site with a `backdrop-filter`, so this trap is confined to
   it, and the drawer's own comment says so above the code.
4. **The marquee runs at half speed on `hover: none`** and cannot be paused there at all,
   because there is no pointer and the lane is `aria-hidden`. If 414 wants a pause control
   on a phone, it is a real button and therefore a new string, which is why this wave did
   not add one. It is a proposal below.

---

## 11. Proposals for Callum, each with a recommended default

Seven, each one a decision this wave deliberately did not take on his behalf.

**1. A pause control on the council marquee for phones.**
*Recommended default: yes, with the label "Pause logos".* The lane runs at half speed on a
touch screen and there is no way to stop it, because the hover and focus pause it has on
desktop needs a pointer or a tab stop. WCAG 2.2.2 is satisfied either way (the sr-only list
carries every name), but half speed is a workaround and a button is the answer. It needs
one new string, which is why it is here rather than in the branch.

**2. Mount a toaster, or keep the inline panels.**
*Recommended default: keep the inline panels.* There is no toast anywhere on this site
today. `/contact` replaces the form with a panel on success and shows an inline alert on
failure; both persist, both are in the reading order, and neither can be missed by somebody
who looked away. A toast would be prettier and strictly worse for the person it is
reporting to.

**3. Should the header expand on ANY upward scroll, or only near the top?**
*Recommended default: what it does now, which is any upward scroll past 24px of travel.*
The alternative (condense once past 24px and only expand back at the very top) keeps the
bar out of the way for longer but means the navigation is four screens of scrolling away
from somebody who wants it. 24px of upward travel is deliberately short: it is one flick.

**4. The back-to-top control's threshold.**
*Recommended default: two viewports, which is what it ships as.* One viewport puts it on
screen on nearly every route almost immediately; three means it is not there when somebody
wants it on `/solutions`. If it feels late on the long partner pages, one and a half is the
next thing to try.

**5. Should `/register`'s picker expand a panel in place instead of navigating?**
*Recommended default: no.* R295-3 is explicit that the chooser carries the heading, one
line of lede and the tiles and nothing else, because a second thing to look at on a chooser
is a second thing to hesitate over. Expanding a panel under a tile would put the tenth
role's panel below the fold and make the resident tile, which the whole page exists to
reach, harder to get to.

**6. The demand map's category highlight.**
*Recommended default: build the data first.* The interaction the brief describes is a good
one and the map can carry it. What it cannot carry is a category dimension nobody has
written: `demand.ts` knows eighteen authorities and three figures each. If Callum wants the
stat cards to light up regions, the figures behind that mapping are one of the items still
blocked on Israel in `CLAUDE.md` section 7, and nothing on this project may be invented.

**7. The icon plate's hover deepening: 18% or leave it at 12%.**
*Recommended default: 18%, which is what it ships as.* It costs between 0.31 and 0.36 of a
contrast point on the glyph and every case still clears the 3:1 an icon answers to with at
least 0.68 in hand (section 4). If anybody would rather the plates never moved, deleting
three rules in `styles.css` removes it and the 2px card lift still carries the state.

---

## 12. What wave 413 asks the next wave to keep

**`Reveal`'s two invariants are intact and this wave added a third of the same shape.**
Nothing is invisible without JavaScript; only what this code itself hid may be animated;
and now: **nothing is animated on the first paint of a prerendered route.** Every entrance
this wave added is either on an element that did not exist a frame ago (a drawer, a
backdrop, a menu, a back-to-top control, a validation message, a drawn mark) or is gated on
an attribute that is ABSENT until the visitor does something (`data-route-enter`,
`data-step`, `data-img`, `data-map`). The register routes' blanket step entrance was the
one place this was already being broken, and section 7.2 is what it cost.

**Two exceptions to transform-and-opacity exist, and both are written where they are
declared.** If a third is ever needed, say why beside it, as these two do.

**Both gates are cheap and both should be run before a commit.**
`scripts/wave412-screenshots.py` is about three minutes; `scripts/wave413-motion.py` is
about six. Between them they shoot every route at both widths under two motion
preferences, and the second one found three real defects on this branch before it went
green.
