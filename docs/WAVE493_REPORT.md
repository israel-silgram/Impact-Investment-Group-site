# Wave 493 report: one logo on every page of the site

**The call**, Callum Saxon, 26 September 2026, about 19:05 UK: "ensure that on every site
page, and the platform the logo stays as what's currently seen on the nav bar on the
platform as that image with the Impact Investment Group written normally rather than
stacked on top of each other, then ensure that since the image is a different size than
the stacked one, that it fits every page and on mobile properly throughout". This is the
SITE half; wave 494 is the platform half.

Branch `feat/wave493-one-logo-on-the-site`, worktree `iigs-uc493`, base `origin/main`
`a94200a` (which did not move, so nothing was merged in). Claimed by empty commit
`c693317`. **Code head `27b05b2`**; everything after it is evidence and this report.

## 1. What shipped

| Item | What | Commit |
|---|---|---|
| Measure first | `scripts/wave493-logo.py --mode before` on the base build: the bar, the phone menu panel and the footer on `/`, `/platform`, `/about`, `/partners`, `/register` at 360, 390, 414, 667x375, 768, 1024, 1280 and 1440. `docs/wave493/measure-before.json`, `before.txt`, `docs/screenshots/wave493/before/` | `5512c92`, re-shot `120cc31` |
| The artwork | The staged one-line pair (2006 by 310) over `logo-lockup.webp` and `logo-lockup-reverse.webp`. The stacked 400 and 640 steps deleted; the responsive script wrote 400, 640, 960 and 1440 from the new source, alpha intact, manifest regenerated. `scripts/make_reverse.py` committed with its source named; run on the platform's `iig-logo.png` it reproduces the staged reverse PNG pixel for pixel. `<img>` reserves 2006 by 310 | `397d6ad` |
| The sizes | `Logo` takes `size="bar" \| "panel" \| "footer"`. Bar: 34px under 640 and on a phone held sideways, 44px from 640, **36px from 1280 to 1439**, 44px from 1440. Panel: 34px at every width. Footer: 44px, or its column's width where the column is narrower (37px at 1024). The logo link keeps a 52px box (`min-height`), so the condensed bar still leaves a 44.2px target. The sizing note in `logo.tsx` now carries the real arithmetic | `383fb21` |
| OG image | `og-default.png` made by `scripts/wave493-og.py` from the committed lockup: 1200 by 630 on white, lockup 960 by 148 centred, no words not in the artwork. 107,980 bytes before (the ring and house alone), 60,083 after. `docs/screenshots/wave493/{before,after}/og-default.png` | `2b737f1` |
| Sweep | `rg "logo-lockup\|LogoMark\|three stacked\|stacked" src`: `logo.tsx` no longer says stacked; the bar-height note in `styles.css` states the new heights. Every other hit is a list, a band or a pair of faces | `720f966` |
| Guard | `scripts/wave493-logo.py`, mutation-checked (section 3) | `27b05b2` |

The bar and the footer before and after, at 390 and 1280: `docs/screenshots/wave493/before_after/`.
Every surface at every width: `docs/screenshots/wave493/after/`.

## 2. What the brief got wrong

1. **The anchors.** There is no `src/components/home/site-footer.tsx` (one footer, `site-footer.tsx`, mounted on every route) and no `src/content/seo.ts`. The OG image is named in `src/routes/index.tsx`. **There is no structured-data logo on the site at all** (no `ld+json` anywhere), so R493-5's `logo.url` had nothing to move; none was added, since that would be new content. Every `Logo` mount was already `on-cream`, including the bar, not `on-navy`.
2. **"The orange action" on the phone bar.** Below 1280 the register pill and Log in are `hidden xl:flex`; the phone bar holds the lockup and the menu button only. The 12px rule was applied to the menu button in the bar and the close button in the panel.
3. **44 to 48px at 1280 does not fit.** At 1280 the six nav links (641px) and the pill with Log in (283px) share 1,216px with the lockup. At 44px (285 wide) the row is 25px too wide. 36px (233 wide) is the tallest that leaves the two `justify-between` spaces either side of the nav (29.7px) no tighter than the nav's own 28px between links; the guard asserts both spaces. 44px returns at 1440 (83.8px either side).
4. **32 to 36px on the phone, measured: 34.** The binding surface is the menu panel at 360 (min(21rem, 88vw) with a 1px rule and 20px padding leaves 231.8px beside a 44px button): 34px keeps 12.4px clear, 35px would keep 6.1. The bar matches the panel, as R493-3 asks.
5. **The footer at 40 to 48px.** From 1024 to 1279 the footer's first column is 240 to 311px, so the lockup scales to the column's width (37.2px tall at 1024) by `max-height` and `max-width` on an auto-sized image, never squeezed. At every width the brief named it is 44px.
6. **Tailwind order.** `min-[1440px]:h-11` is emitted before the named breakpoints, so `xl:h-9` won at 1440; the class is `xl:max-[1440px]:h-9`, a closed band whose order cannot matter. Commented in `logo.tsx`.
7. **Palette.** The new artwork's two oranges are exactly the two wave 443 put in the stacked files (187, 68, 27 and 225, 94, 49 within one level). Its navy is the platform artwork's own (2, 35, 83), where the stacked file's was (0, 30, 72); it is the owner's file, used as supplied.

## 3. Gate numbers, measured on the frozen tree at `27b05b2`

`git diff -- src scripts public | git hash-object --stdin` was the empty blob `e69de29` before and after the gate (only `src/routeTree.gen.ts`'s CRLF rewrite, no bytes). Build: `STATIC_BUILD=true bun run build` **rc 0, 36 pages**, postbuild rc 0.

**The wave 493 guard** (`gate-493.txt`): **All assertions passed**, 8 widths by 5 routes, identical on every route. Pairing at 1280: **0 px differ** outside the lockup, the nav it pushes and the footer column, on all five routes, header and footer.

| width | bar h x w, gap to first control | panel h x w, gap | footer h x w |
|---|---|---|---|
| 360 | 34 x 219.3, 56.7 to menu | 34 x 219.3, **12.4** | 44 x 283.9 |
| 390 | 34 x 219.3, 86.7 | 34 x 219.3, 31.7 | 44 x 283.9 |
| 414 | 34 x 219.3, 110.7 | 34 x 219.3, 31.7 | 44 x 283.9 |
| 667x375 | 34 x 219.3, 339.7 | 34 x 219.3, 31.7 | 44 x 283.9 |
| 768 | 44 x 283.9, 376.1 | 34 x 219.3, 31.7 | 44 x 283.9 |
| 1024 | 44 x 283.9, 632.1 | 34 x 219.3, 31.7 | 37.2 x 240.3, column-bound |
| 1280 | 36 x 232.3, **29.7** to About Us, 29.6 after the nav | none (no menu) | 44 x 283.9 |
| 1440 | 44 x 283.9, 83.8 either side of the nav | none | 44 x 283.9 |

Aspect 6.45 everywhere (the 400 step is 400 by 62). Logo link 52px at the top and 44.2px condensed at every width. No route scrolls sideways at any width. Before, the stacked lockup was 44 x 118.1 on the phone and 52 x 139.6 from 640.

**Mutations** (`docs/wave493/mutations.txt`, raw): the stacked file put back fails the aspect and the decoded-file check on every surface (rc 1); the bar at 52px at 360 fails the height, **the gap at -6.0px**, the menu button at 22px wide and the press (rc 1). The gap is read from where the button would start at its full 44px; the first draft read the button's own left edge, which a squeezed flex row leaves 16px away, and did not fail. Fixed before the gate.

| Gate | Exit | Numbers |
|---|---|---|
| `wave412-screenshots.py` | **0** | 28 shots, all assertions passed. 274 INCOMPLETE nodes measured off the pixels, 0 unmeasured, 1 off screen (the hero caption at 390, as at 490). Darkest raw home @ 1280 **23.07%** (490: 23.08), ground **8.20%** (490: 8.17) |
| `wave413-motion.py` | **1, then 0** | Run 1 with the machine at 100% CPU and 1.7 GB free, read just after it (other waves building): the investor step took 499ms against 450, and two long tasks (78ms, 2,404ms) in the home scroll. Run 2, same build: **All assertions passed**. Neither probe reads the logo. Both runs in `gate-413.txt` |
| `wave414-mobile.py` | **0** | 70 shots, 6,018 targets, 0 under 44, 0 closer than 8px; 5,270 type nodes, 0 under floor; 660 headings, 0 breaking; 0 axe serious or critical; 0 overflow. **All assertions passed: the 13 pre-existing lockup failures at 768 in `docs/WAVE490_REPORT.md` 5.1 are gone.** The one-line lockup reads 0.891 on white against the stacked file's 0.821, so the header's darkest box is now 0.865 against the 0.80 floor. No floor moved |
| `wave421-hero-and-footer.py` | **0** | 401 pairs, 16 variant readings, 13 under-served images, 26 dividers |
| `wave415-zoopla-purple.py` | **0** | 31,516 bytes from 31,516, `public/` clean |
| `wave443-contrast.mjs --build dist/client` | **0** | 29 pairs, 0 failures, 0 retired hex in source or build |
| `wave414-responsive-images.py --check` | **0** | every referenced image has its variants; 24 alpha sources, every variant still alpha |
| `wave493-og.py --check` | **0** | the committed card is this script's output byte for byte |
| `wave490-phone.py`, whole, in four parts | probes **0**; sweeps **1** | 84 shots; 0 empty runs over 96px; 9,261 span nodes, 0 under floor; 252 Verify readings, 0 under 44; 48 cards, 0 tails; 54 pills, 0 split; 0 fixed-layer clashes; 145 drawer runs, 0 under floor. **Rule 8: 13 routes fail, each in rows 10 to 62 and columns 32 to 934 at 1280**, which is this wave's lockup and the nav it pushes, paired against wave 490's own before set (`f61b3b8`); the 404 has no bar and reads 0. `/platform`'s box runs on to row 2,381: below the bar, a band from row 1,972 differing from 490's before by at most 4 levels. The same pairing on the **base** build reads that band at up to 8 levels and passes only because its same-launch noise that run was 150,026px. It is the page's own noise, not this wave. See section 4 |
| `wave490-perf.py`, 5 runs, median | measure | head against base: `/` perf 69 (68), LCP 6,048 (6,358); `/platform` 78 (77); `/register/investor` 81 (80); `/about` 80 (78). **Every route 44 KiB lighter.** CLS 0.000 throughout. `gate-perf.txt`, `lh-*.json` |
| Lint, changed files | **0** | 0 errors, 0 warnings |
| Lint, whole tree, LF archive | 1 and 1 | **432 errors, 15 warnings at the head and at `a94200a`: delta zero** (490's figures) |
| `tsc --noEmit` | **0** | |
| `git diff origin/main...HEAD -- src/content` | | **EMPTY** |
| U+2014 and U+2013 added, `src` and `scripts` | | **0 and 0**. Across the whole diff 11 and 4, every one in `gate-412.txt` or `gate-490.txt` quoting text the site already ships (the three portal buttons' `aria-label`s, the capture caption) |
| Hex added under `src` | | **0** |
| New user-facing strings | | **none** |

The other gates rewrite their own `docs/screenshots/wave4xx/` folders (about 190 MB). They were restored rather than committed: those folders stay their own waves' evidence, and every number above is in this wave's logs under `docs/wave493/`.

## 4. Deferrals, with reasons

1. **Wave 490's rule 8 is red on the bar, by design of that rule.** It pairs every route against wave 490's before set and declares only 490's own surfaces; a new lockup in the bar cannot pass it. Declaring `header` in its `TOUCHED` would exempt the bar from every later wave's pairing, so the script was not edited. This wave's own pairing (0 px outside the lockup, the nav and the footer column, on five routes) is the R493-6 check. **Proposal:** when Cowork next re-baselines 490's before set, shoot it at this head.
2. **`LogoMark` is now rendered nowhere.** Kept, as R493-2 keeps the mark files, for a favicon-sized slot. No surface used it before either, so R493-4's list of surfaces is empty.
3. **The `on-navy` lockup is rendered nowhere** (true on the base too); its file and steps are replaced so it is right if a navy surface ever takes it.
4. **The 413 timing probes are load-sensitive**, as wave 490 found; run 2 is the clean reading.

## 5. MANUAL (Callum)

None. Cowork: the branch is ready for the independent re-check; do not merge before it says RELEASE.

## Session-end

- Landing-Queue row **493 SITE** set **ready** at code head `27b05b2`, final head as pushed.
- Worktree `iigs-uc493` removed after the final push; the branch is the record.
