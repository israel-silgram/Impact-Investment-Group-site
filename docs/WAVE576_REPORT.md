# Wave 576 report: the site says ten per cent goes to Metro World Child UK

Branch `feat/wave576-the-site-says-ten-percent-goes-to-metro-world-child`, base `origin/main`
`73fcf6f` (wave 567's head, which did not move). Claimed by empty commit `b51d4c5`: no other
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
| Gates | 490, 493, 507 taught the routes that change by design | `bd1f181`, `2d6e023`, and the comment commit after it |

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

`docs/wave576/before.txt`: the committed guard, `--mode before`, on `73fcf6f` rebuilt in its own detached
worktree (`build-base.txt`, rc 0): **44 failures** (29 footer counts, 3 markup totals, 12 hydrated).
`after.txt`: the head, exit 0, with 12 hydrated readings and 10 band pairings. The red run was redone
after the guard's last change, so the log is the committed guard's. Arms: `a1` (drops the full stop) exits 1
with 33 failures; `a2` (types the sentence into the footer) exits 1 with 2.

## 3. The gate on the frozen head

| Gate | Exit | Numbers |
|---|---|---|
| `wave576-charity.py` | 0 | as above |
| `wave567-copy.py` | 0 | |
| `wave412-screenshots.py` | 0 | 28 shots; 274 INCOMPLETE, 274 measured; darkest raw home @ 1280 **22.26%** (567: 23.07%), ground **7.97%** |
| `wave413-motion.py` | 0 | |
| `wave414-mobile.py` | 0 | 5,958 targets (base 5,958), 660 headings (660), 0 under 44, 0 axe, 0 overflow; type nodes 5,300 (base 5,225: the new paragraphs) |
| `wave414-responsive-images.py --check` | 0 | |
| `wave415-zoopla-purple.py` | 0 | |
| `wave421-hero-and-footer.py` | 0 | 377 pairs, none missing |
| `wave443-contrast.mjs --build dist/client` | 0 | 0 failures, 0 retired hex |
| `wave490-phone.py` in two parts plus the probes | 0, 0, 0 | rule 8 below |
| `wave493-logo.py`, `wave493-og.py --check` | 0, 0 | |
| `wave502-logo-name.py` | 0 | 39 shots, 0 differ |
| `wave507-titles.py --band-noise 1 --by-design ...` | 0 | command at the top of `gate-507.txt` |
| `tsc --noEmit`, `eslint` on the four `src` files | 0, 0 | |

Hex added under `src`: 0. Dashes in the added lines of `git diff 73fcf6f HEAD`: 0 em, 0 en (two raw logs
quote copy the site already ships and print `[em dash]`).

### Which routes differ, in pixels

- **507, strict** (`gate-507-strict-red.txt`): every one of 60 shots differs, as expected.
- **507, band by band**: header 0 px on all 30 pages; footer differs on all 30 (about 1.14M px at 1280 and
  390: it is a taller footer); main 0 px on 23 pages, **1 level of one channel** on seven partner pages
  (482 to 3,352 px, a card shadow landing one level off when a taller page tiles differently), and
  changed by design on `/` and `/about`.
- **The home and about main, band by band** (the guard, `after.txt`): with the one new element hidden,
  every other band of `main` pairs with the base at 0 px beyond three levels of a channel (4 px at three
  levels or fewer in the mission band at 1280). As shipped, the council panel and the map differ by
  thousands of px, because the new band is not a whole number of pixels tall (170px at 1280, 185px at 390)
  and so places everything below it on a fractional offset. About's summary child grows from 2,678 to 2,743px
  at 1280 and 5,663 to 5,755px at 390 and is the only About band that differs.
- **490 rule 8**, strictly (`gate-490-strict-red.txt`): `/` and `/about` fail (912,655 and 1,115,462 px
  moved outside the declared boxes, which is the shifted page); every other route 0. After
  `before/home-1280.png` and `before/about-1280.png` were re-shot by `--mode before`: 0 beyond the noise on
  all 14 routes. The register routes and the other 9 differ only inside the footer.
- **493**, strictly (`gate-493-strict-red.txt`): five footers differ (home 52,419 px, about 39,786,
  platform 27,038, partners 26,515, register 22,226), headers 0. The five 1280 footer befores were re-shot
  at the head; then 0.
- **502**: 0 differ.

### Two things the gates could not do as they stood

1. **490's rule 8 on `/platform` was intermittent.** The gate finds running animations from
   `getComputedStyle(el)`; the portals' turning rings are `before:animate-spin`, a pseudo-element animation
   it does not report, so their box was never masked. On the **base** build with no change to the page it
   read 0 and then 162 px beyond the noise; on the head, 12,173 to 26,101 across eight runs. The walk now
   also reads `::before` and `::after` (dated comment), after which `/platform` reads 0 on six
   consecutive runs against 567's committed before shot (`gate-490-platform-attempts.txt`). This applies to
   every route, and masks only the owning element's box.
2. **507 had no tolerance for one level of one channel** on by-design pages. `--band-noise N` (default 0,
   so every run that does not name it is as strict as before) ignores steps of N levels or fewer, and only
   on the pages `--by-design` names; the run used 1.

A reviewer's read of the diff raised three further points, none a defect: the footer pledge is 13px on
desktop (the brief's own size, with the 11px notice below it; 15px on mobile) against the brand's 15px body
floor; `max-w-[120ch]` is the footer notice's own width; and `--band-noise` applies to all three bands of a
named page, not only the allowed ones, which matters only if the flag is passed.

## 4. Not done

Nothing in the brief was skipped. Not touched: the platform (575), any charity logo, image, icon or link,
the header, the hero, any other copy, fonts, tokens, CSS, preloads, `main`.

## 5. Null findings

- No em or en dash added; no hex added; `about.tsx` unchanged; no new `<link>` in `index.html`.
- The 404 page has no footer and carries no sentence.
- 412's home dark share fell (22.26% against 23.07%): the cream band is light.
