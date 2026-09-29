# Wave 502 report: the site's logo says the group

**The call**, Callum Saxon, 28 September 2026: "all defaults" to the seven questions of
the 07:30 summary. Question 2: the logo link's screen-reader name becomes "Impact
Investment Group, home" on the site and the platform. This is the SITE half; the platform
half rides platform wave 498 (R498-10).

Branch `feat/wave502-the-site-logo-says-the-group`, worktree `iigs-uc502`, base
`origin/main` `abb5b0b` (wave 493's head, which did not move). Claimed by empty commit
`5c7afd5`: `feat/wave50*` returned nothing on the site remote, and 496 to 501, 503 and 504
on the platform remote, so 502 was free. **Source head `c3aa4dd`**; `780b10d` changes only
the guard script (the escapes below) and adds evidence; everything after it is this report.

## 1. What shipped

| Item | What | Commit |
|---|---|---|
| The name | ONE constant, `LOGO_HOME_NAME = "Impact Investment Group, home"`, in `src/components/logo.tsx`. The lockup's screen-reader span reads it, so every mount says it; the bar's logo link takes it as its `aria-label` | `c3aa4dd` |
| The guard | `scripts/wave502-logo-name.py`: on every route wave 490 sweeps (14), at 1280 and 390, with the phone menu opened, it reads each logo link's accessible name off Chromium's accessibility tree (CDP, not the markup), each lockup's screen-reader text, and every tree node naming the brand beside "home"; it checks `src` for the name and against the old ones; it pairs the header (1280, 390) and the open panel (390) with the before run's shots, and every pixel must be equal | `cf0a06e`, `780b10d` |
| The before set | Wave 490's before set re-shot at `abb5b0b` by `scripts/wave490-phone.py --mode before` (sweep in three parts, then the probes), on a build whose `/contact` prerendered as Support, the same variant as the old set. 100 PNGs changed (below) | `ceb416c` |

**Old and new name, on every mount** (`docs/wave502/before.txt`, `after.txt`):

| Mount | Is it a link? | Before | After |
|---|---|---|---|
| The header bar, `site-header.tsx` | **yes**, the only link wrapping the logo | "Impact Investment Platform [em dash] home" (its `aria-label`) | "Impact Investment Group, home" |
| The phone menu panel, `site-header.tsx` | no | "Impact Investment Group [em dash] home" (sr-only span) | "Impact Investment Group, home" |
| The footer, `site-footer.tsx` | no | "Impact Investment Group [em dash] home" (sr-only span) | "Impact Investment Group, home" |

("[em dash]" stands for the character the old names carried; this report does not print it.)
**The image `alt` does not form the name:** the `<img>` is `alt=""` and `aria-hidden`, and
it stays so. The link's name came from its `aria-label`, which overrode the sr-only span;
both now read the same constant.

**The before set.** 100 PNGs re-shot: 6 each for about, contact, legal, partners,
platform, solutions, the-problem, register, partner-with-investor and
partner-with-local-authority, 10 for home, 15 each for register-investor and
register-resident (their fold shots); 404's six are byte-identical, since the 404 page
has no logo. At 1280 (the only width rule 8 reads) all 13 routes with a bar differ from
the old set in rows 10 to 62, columns 32 to 934 (wave 493's one-line lockup and the nav it
moves) and in the footer's first column, rows about 340 from the page foot, columns 32
to 329 (493's footer lockup); home, platform and register also differ in their animated
regions (the count-up, the marquee, the portal sunburst), which rule 8 masks.

## 2. What the brief got wrong

1. **The old name** was "Impact Investment Platform [em dash] home" (an em dash, no "The"),
   not "The Impact Investment Platform, home".
2. **There is one logo link, not several.** The phone menu and the footer lockups are not
   links; each carried an sr-only "Impact Investment Group [em dash] home", which a screen
   reader reads as text. Changing only the link's `aria-label` would have left those two
   saying different words with an em dash, so the span changed with it through the one
   constant. `src/content` has no logo name in it.
3. **"The phone menu at 1280"** does not exist: the menu button is hidden from 1280 (`xl`).
   The panel is shot at 390; the header at both.
4. **The 404 page has no logo** (a static error page), so it has no mount to rename.

## 3. Gate numbers, measured on the frozen tree

Built with `STATIC_BUILD=true bun run build` then `pages-postbuild.mjs`, 36 prerendered
pages, `/contact` as Support. Logs under `docs/wave502/`.

| Gate | Exit | Numbers |
|---|---|---|
| `wave502-logo-name.py` on the head | **0** | 65 lockup readings, 26 of them links, every one "Impact Investment Group, home"; 130 tree names, every one the new name; `src`: the name in `logo.tsx`, the old names nowhere. **Pixels: 39 shots (26 headers, 13 panels) paired with the base, 0 differ** |
| The same on the base `abb5b0b` (`before.txt`) | red | **354 failures**, every mount on the old name |
| Mutation: the old `aria-label` put back, rebuilt (`mutation.txt`) | **1** | **78 failures**, every bar link on every route; restored and rebuilt, green |
| `wave412-screenshots.py` | **0** | 28 shots, all assertions passed; 274 INCOMPLETE nodes, 274 measured off the pixels, 0 unmeasured, 1 off screen (home @ 390, as at 490 and 493). Darkest raw home @ 1280 **23.07%**, ground **8.20%** (493: 23.07 and 8.20) |
| `wave413-motion.py` | **0** | all assertions passed, first run |
| `wave414-mobile.py` | **0** | 70 shots; 6,018 targets, 0 under 44, 0 closer than 8px; 5,270 type nodes, 0 under floor; 660 headings, 0 breaking; 0 serious or critical axe; 0 overflow. Lockup darkest box header 0.865, footer 0.789 (493: the same) |
| `wave421-hero-and-footer.py` | **0** | 401 pairs, 16 variant readings, 13 under-served images, 26 dividers |
| `wave415-zoopla-purple.py` | **0** | 31,516 bytes from 31,516, `public/` clean |
| `wave443-contrast.mjs --build dist/client` | **0** | 29 pairs, 0 failures, 0 retired hex in source or build |
| `wave414-responsive-images.py --check`, `wave493-og.py --check` | **0**, **0** | every variant present, 24 alpha sources intact; the OG card is the script's output |
| `wave493-logo.py` | **0** | all assertions passed; pairing at 1280, 0 px differ outside the logo's reach on five routes |
| `wave490-phone.py`, whole, sweep in two parts plus the probes | **0**, **0**, **0** | 84 shots; 0 empty runs over 96px; 9,261 span nodes, 0 under floor; 252 Verify readings, 0 under 44; 48 cards, 0 tails; 54 pills, 0 split; 0 fixed-layer clashes; 145 drawer runs, 0 under floor. **Rule 8: all 14 routes, 0 px moved beyond the noise** against the re-shot set (home 19,453 px differ inside its masks against same-build noise of 22,117; platform 26,420 against 26,420; the other 12 differ on 0) |
| `tsc --noEmit` | **0** | |
| Lint, the two changed files | **0** | 0 errors, 0 warnings at the head and at `abb5b0b` |
| `git diff abb5b0b...HEAD -- src/content` | | **EMPTY** |
| Hex added under `src`; new visible strings | | **0**; none |
| U+2014 and U+2013 added | | **0 in `src`, `scripts` and this report.** 16 in three raw logs, each quoting copy the site already ships, printed by the gate reading it: `gate-412.txt` 14, `gate-490-probes.txt` 1 and `before-490-probes.txt` 1 (the product capture's caption). The guard prints every name through `ascii()` |

The other gates rewrite their own `docs/screenshots/wave4xx/` folders; those were restored
rather than committed, as in 493.

## 4. Deferrals, with reasons

1. **The phone menu and footer lockups say "home" but are not links.** CLAUDE.md says the
   logo is always the link to the homepage. Wrapping them changes behaviour and the tab
   order, which this wave may not do. **Proposal:** a small wave making both links to `/`.
2. **Page titles and `og:site_name` still say "The Impact Investment Platform".** Visible
   metadata, out of this wave's one string.

## 5. MANUAL (Callum)

None. Cowork: review the diff and push the branch to the site's `main`.
