# Wave 576 report: the site says ten per cent goes to Metro World Child UK

Branch `feat/wave576-the-site-says-ten-percent-goes-to-metro-world-child`, base `origin/main`
`73fcf6f` (wave 567's head, which did not move). Claimed by commit `b51d4c5` (it carries the plan; it is not empty): no other
`feat/wave576*` on the site or platform remote, no `docs/WAVE576*` on the site's `origin/main`, no
queue row 576. Nothing was pushed to `main`.

**PROPOSAL strings: none.** Callum's sentence ships verbatim, with its full stop:

> 10% of all profits made go to Metro World Child UK to bring hope and joy to children today and change lives for tomorrow.

## 0. In plain words

The sentence now appears in three places, all from one constant:

1. **Every page's footer**, in the legal band between the Terms, Privacy, Disclaimer and Legal links and
   the small print, one step larger and bolder than the small print. The register pages carry it too.
2. **The home page**, as a cream band on its own under the mission section and above the council logos,
   below the first screen. Just the sentence, centred, in the headline typeface.
3. **About**, as the third line under "Who We Are".

No logo, image, icon or link was added for the charity. Shots, before and after, under
`docs/screenshots/wave576/`: `home-`, `about-` and `footer-` at 1280 and 390.

## 1. What shipped

| Item | What | Commit |
|---|---|---|
| Plan | `docs/WAVE576_PLAN.md` | `b51d4c5` (with the claim) |
| W1 to W4 | `src/content/charity.ts` (new), `site-footer.tsx`, `index.tsx`, `about.ts` | `16bd53d` |
| Guard | `scripts/wave576-charity.py`, red and green runs, arms | `35c4453`, `bd1f181` |
| Gates | 490, 493, 507 taught the routes that change by design | `bd1f181`, `2d6e023`, the comment commit after it, then the fix pass below |

- **W1.** `rg -n -F 'Metro World Child' src` prints one line, `charity.ts:8`. `charityPledge` is exported
  there and imported by exactly three files.
- **W2.** The sentence is once inside `<footer>` on **29** pages (every page but `404.html`, which has no
  footer), and twice in all in `index.html` and `about/index.html`. Hydrated at 1280 and 390 on `/`,
  `/about`, `/register` and `/register/investor`: one footer `<p>` equals the constant. `git diff --stat
  73fcf6f HEAD -- src/components/site-footer.tsx`: 8 insertions (the import, the `<p>`, its comment). 414's
  target count is 5,958 at base and at head.
- **W3.** Hydrated `/`: Barlow 700, 28px at 1280 and 20px at 390; ground equals the computed
  `--color-page-alt` (`rgb(251, 246, 240)`); top at 1,797px of 900 at 1280 and 2,902px of 844 at 390. LCP
  element equals the base's at both widths (`hero-ground-street-960.webp` at 1280, `hero-homes-400.webp`
  at 390) and `index.html`'s preload links are identical. Home LCP on 414's slow-4G profile, three runs
  each: base 9,612 / 9,592 / 9,628 ms, head 9,572 / 9,612 / 9,552 ms (medians 9,612 and 9,572).
- **W4.** `/about` summary has three lines and the third equals the constant; `git diff 73fcf6f HEAD --
  src/routes/about.tsx` is empty.

## 2. The red and green runs, and the arms

After the fix pass (section 6). `docs/wave576/before.txt`: the committed guard, `--mode before`, on
`73fcf6f` rebuilt in its own detached worktree (`build-base.txt`, rc 0), reading `src` from that
worktree: **73 failures** (the constant reads null; "Metro World Child" is held by nothing;
`charityPledge` has no importer; 29 footer counts, 29 page totals, 12 hydrated readings and the band
and totals lines). `after.txt`: the head, exit 0, 12 hydrated readings and 10 band pairings. Arms, each in
memory, each exit 1: `a1` (drops the full stop) 60 failures; `a2` (types the sentence into the footer)
2; `a3` (removes the home route's import) 1.

## 3. The gate on the frozen head

| Gate | Exit | Numbers |
|---|---|---|
| `wave576-charity.py` | 0 | as above |
| `wave567-copy.py` | 0 | |
| `wave412-screenshots.py` | 0 | 28 shots; 274 INCOMPLETE, 274 measured; darkest raw home @ 1280 **22.26%** (567: 23.07%), ground **7.97%** |
| `wave413-motion.py` | 0 | |
| `wave414-mobile.py` | 0 | head: 5,958 targets, 660 headings, 5,300 type nodes; base (`gate-414-base.txt`, a rebuilt 73fcf6f): 5,958, 660, 5,225; 0 under 44, 0 axe, 0 overflow on both |
| `wave414-responsive-images.py --check` | 0 | |
| `wave415-zoopla-purple.py` | 0 | |
| `wave421-hero-and-footer.py` | 0 | 377 pairs, none missing |
| `wave443-contrast.mjs --build dist/client` | 0 | 0 failures, 0 retired hex |
| `wave490-phone.py` in two parts plus the probes | 0, 0, 0 | rule 8 below |
| `wave493-logo.py`, `wave493-og.py --check` | 0, 0 | |
| `wave502-logo-name.py` | 0 | 39 shots, 0 differ |
| `wave507-titles.py --by-design ...` | 0 | strict, no flag; command at the top of `gate-507.txt` |
| `tsc --noEmit`, `eslint` on the four `src` files | 0, 0 | |

Home LCP on 414's slow-4G profile, three runs each: base 9,612 / 9,592 / 9,628 ms, head 9,572 / 9,612 /
9,552 ms (medians 9,612 and 9,572). Hex added under `src`: 0. Dashes in the added lines of `git diff
73fcf6f HEAD`: 0 em, 0 en (raw logs that quote copy the site already ships print `[em dash]`).

The page counts: the build has **30** pages, which is **29** footered pages plus `404.html`.

### Which routes differ, in pixels

- **507, strict** (`gate-507-strict-red.txt`): 58 of the 60 shots differ; the two `404.html` shots (no
  footer) are equal.
- **507, by design** (`gate-507.txt`, counted by the gate from its own record): 29 named pages, 58 shots,
  plus the 2 shots of the 404 paired whole (60 in all). Header equal in every pixel on 58 of 58; main
  equal in every pixel on 54 of 58 and different on 4 (`/` and `/about` at both widths, by design);
  footer different on 58 of 58. A footer whose height changed counts the whole band, so its figures
  (about 1.14M px) are band sizes, not counts of changed pixels. The bands are element captures of each
  band in each build, with no noise floor (section 6, Z1).
- **The home and about main, band by band** (the guard, `after.txt`): with the one new element hidden,
  every other band of `main` pairs with the base at 0 px beyond three levels of a channel (4 px at three
  levels or fewer in the mission band at 1280, on every run). As shipped, the council panel and the map
  differ: at 1280 by 18,911 and 71,789 px (13,604 and 26,940 beyond three levels), the band being 169.78px
  tall; at 390 by 144 and 220 px (30 and 98 beyond three levels) although the band is a whole 185px. The
  cause at 390 is in section 6, Z7. `/about`'s `main` has one child; it grows from 2,678 to 2,743px at
  1280 and from 5,663 to 5,755px at 390, and with the pledge line hidden pairs at 0 px.
- **490 rule 8**, strictly (`gate-490-strict-red.txt`): `/` and `/about` fail (912,655 and 1,115,462 px
  moved outside the declared boxes, which is the shifted page); every other route 0. After
  `before/home-1280.png` and `before/about-1280.png` were re-shot by `--mode before`: 0 beyond the noise
  on all 14 routes (`gate-490-part1.txt`, `gate-490-part2.txt`). The register routes and the other 9
  differ only inside the footer.
- **493**, strictly (`gate-493-strict-red.txt`): five footers differ (home 52,419 px, about 39,786,
  platform 27,038, partners 26,515, register 22,226), headers 0. The five 1280 footer befores were re-shot
  at the head; then 0. Which rows and why: section 6, Z10.
- **502**: 0 differ.

### The gate changes, as they now stand

1. **490's rule 8 on `/platform` was intermittent.** The gate finds running animations from
   `getComputedStyle(el)`; the portals' turning rings are `before:animate-spin`, a pseudo-element animation
   it does not report, so their box was never masked. Pre-fix, the head read **14,437 to 26,101** px beyond
   the noise on eight runs, and the base build, paired with a before shot taken at the head (page height
   5,954 against 5,921 px, so the two shots differed in the footer), read 0 and 162 on two runs. The walk now
   also reads `::before` and `::after`, and prints every pseudo-element mask with its box on the rule 8
   line (`platform`: `button::before spin 236x390`; `register`: `a::before registration-glow 540x126`)
   and fails on one over 150,000 px squared. After it `/platform` read 0 beyond the noise on six runs: three
   against the before shot taken at the head and three against 567's committed one
   (`gate-490-platform-attempts.txt` says which is which). The mask is the owning element's whole box, on
   every route, which is why it is printed and bounded.
2. **507 reads the by-design bands from element captures.** No tolerance was added (section 6, Z1).

A reviewer's read of the first diff raised that `max-w-[120ch]` is the footer notice's own width. The
footer pledge is 13px at 1280 and 15px on phones, as the brief set it, against CLAUDE.md line 256, "Body
never below 15px" (section 6, Z11).

## 4. Not done

Nothing in the brief was skipped. Not touched: the platform (575), any charity logo, image, icon or link,
the header, the hero, any other copy, fonts, tokens, CSS, preloads, `main`.

## 5. Null findings

- No em or en dash added; no hex added; `about.tsx` unchanged; no new `<link>` in `index.html`.
- The 404 page has no footer and carries no sentence.
- 412's home dark share fell (22.26% against 23.07%): the cream band is light.

## 6. Fix pass of 10 October

The reviewer held the wave on the gate evidence (`_cowork_ops\gate\review_576_verdict.txt`); the product
change (the sentence, its constant, the three placements, the brief's classes) did not change.

| Z | What it was | What changed, measured |
|---|---|---|
| Z1 | 507 only exited 0 through `--band-noise 1` with every footered page named | The flag is gone. The one-level step on seven partner mains was a full-page tile: element captures of `main` on the same pages, base against head, read 0 px at 1280 and 390 (`z1-element-capture-control.txt`). 507 now takes each band as an element capture (sticky header hidden for `main` and `footer`) and reads those for `--by-design`. Run strictly with no flag it exits 0: header 58 of 58 equal, main 54 of 58 (the 4 are `/` and `/about`), footer 0 of 58, the 404 pair whole. Commands: `python scripts/wave507-titles.py --build <base of 73fcf6f> --mode before`, then the by-design command at the top of `gate-507.txt`. The queue row says so |
| Z2 | Figures the logs contradict | Corrected in section 3 and in the 490 comment: 14,437 to 26,101 across eight head runs; the six zero runs against two different before shots; the base control read 5,954 against 5,921 px; 58 of 60 shots; 29 footers of 30 pages; the 507 band figures recounted by the gate into `gate-507.txt`; the 390 band is a whole 185px |
| Z3 | 490's pseudo-element mask hid whole boxes unseen | Printed on the rule 8 line with its box and bounded at 150,000 px squared (platform 92,040; register 68,040). The other route, stilling the animation before capture, was not taken: it would re-base every route's before shot with a running ring, which the brief does not allow. Two parts and the probes re-run: exit 0, 0, 0. Commands: `python scripts/wave490-phone.py --pages home,about,platform,the-problem,solutions,partners,contact --no-probes`, the same with `register,register-investor,register-resident,partner-with-investor,partner-with-local-authority,legal,404`, and `--pages none` |
| Z4 | The guard's base was not pinned | `--mode before` is refused unless the build sits in a git checkout at `73fcf6f` (the refusal was run on the head build and printed); the record holds `commit` and the base page list; the base bands are committed under `docs/wave576/bands-base/` (10 PNGs, 3.9 MB) and read from there |
| Z5 | The red run never exercised checks 1 and 2 | The base checkout's `src` is read in `--mode before`; red run on a rebuilt `73fcf6f`: 73 failures, the constant reads null, nothing holds the name, no importer. Arm `a3` removes the home route's import and exits 1 |
| Z6 | The 29 pages were never asserted | The page list must equal the base record's, the sentence is once in the footer of each of its 29 footered pages, and each other page holds it once in all; every text file under `src` is scanned, whatever its extension |
| Z7 | The 390 residual | A whole 185px band moves every band below by exactly 185 (tops 2,860.922 to 3,045.922 and 3,603.313 to 3,788.313), so no offset explains it. Every differing pixel is in moving content: the council logo strip (144 px, at most 10 levels), and in the map band the count-up figures ("193,000+", "634,000+"), a few animated SVG marks and the data-sources logo strip (35,732 px of the 35,838). The head against itself is 0 px, so it depends on where the band sits, not on time. What in the page ties those strips to the scroll position was not isolated. The shipped pairing is therefore not asserted; the hidden-element pairing is. `docs/wave576/z7-390-residual.txt` |
| Z8 | The footer shot at 390 had the sticky header over the PRS card | The footer is captured with the header hidden (not removed); both `footer-390-before.png` and `footer-390-after.png` re-shot; the PRS Member card now reads whole. The 1280 footers did not change |
| Z9 | The base 414 figures were in no log | `gate-414-base.txt`, 414 on a rebuilt `73fcf6f`: 5,958 targets, 660 headings, 5,225 type nodes; the head 5,958, 660, 5,300. The 75 extra type nodes are one per footer on 13 footered routes at five widths (65) plus one more on `/` and `/about` at five widths each (10) |
| Z10 | 493's re-base without the rows | `gate-493-rows.txt`: in all five the legal band differs (22,231 to 27,569 px, the new line and the notice moved). Platform and register were re-shot at 567, so above the legal band they are equal (0). Partners, home and about are still 493's own base, which has the older stacked lockup, so their logo column differs (26,289, 28,779 and 26,723 px). Home and about also differ in the rest of the footer (24,451 and 11,869 px) because their footer top moved to a different fraction of a pixel (.969 to .750 and .469 to .250), which is why they differ about twice as much |
| Z11 | The 15px claim had no source | CLAUDE.md line 256: "Body never below 15px." The footer pledge, as the brief set it, is 13px at 1280 and 15px on phones, under that line at desktop widths, as the 11px legal notice under it already was. 414 and 490 pass their type floors. The class is unchanged; this is for Callum |
| Z12 | Vault lines unshown | Landing-Queue row 576 updated to the new head and tree, and the 507 decision; nothing else in the vault |
| Z13 | Two contradictions | `b51d4c5` carries the plan and is not empty (the plan and this report now say so); the attempts log header counts ten runs before the fix and six after |

