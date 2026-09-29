# Wave 507 report: the site's titles and link previews say the group

**The call**, Callum Saxon, 29 September 2026, about 09:00 UK, answering site wave 502's
deferral 2: the page titles and link previews (what Google and WhatsApp show) say
"Impact Investment Group" where they said "The Impact Investment Platform". Each page's
own part of its title stays as it is; nothing visible changes.

Branch `feat/wave507-the-site-titles-say-the-group`, worktree `iigs-uc507`, base
`origin/main` `9eae21a` (wave 502's head, which did not move). Claimed by empty commit
`e4e916d`: `feat/wave50*` returned only 502 on the site remote, and 50, 500, 501, 503,
504, 505 and 506 on the platform remote, with no `docs/WAVE507*` on the site's
`origin/main` and no queue row 507, so 507 was free on both. **Source head `5a6a01d`**;
everything after it is the guard's escape fix (below) and `docs/`.

## 1. What shipped

| Item | What | Commit |
|---|---|---|
| The guard | `scripts/wave507-titles.py`. On every prerendered page in the build (30: 29 routes and the 404) it reads the MARKUP a crawler or link unfurler reads (every `<title>` in `<head>`, `og:site_name`, `og:title`, `twitter:title`, and the names in any `application/ld+json`), then serves and hydrates each page in Chromium at 1280 and 390 and reads `document.title` and the same meta. It fails on the old name (with or without "The") in any of them, on an `og:site_name` that is not exactly "Impact Investment Group", on any value that is not the before value with only the name swapped (so each page's own part is pinned, field for field), on the hydrated page disagreeing with the markup, and on any old name left in a `src/routes` title string. It takes a full-page shot of every page at both widths (animations and transitions stilled, reduced motion) and pairs it with the before run: header, main and footer are each counted, and the whole shot must be equal in every pixel, with a SHA-256 of both shots' decoded pixels kept in the record | `76f41f2` |
| The red run | `--mode before` on the base build: **319 failures** (`docs/wave507/before.txt`) | `76f41f2` |
| The names | 38 metadata strings in 20 route files: every `title`, `og:title` and the root's `og:site_name` and fallback `title`. "The Impact Investment Platform" becomes "Impact Investment Group" in 37 of them and "Impact Investment Platform" (no "The", `/partners`) in one. The comment in `legal.tsx` that said "Every other page ends 'The Impact Investment Platform'" is brought up to date; its title is untouched | `5a6a01d` |

## 2. Every title and preview value, old and new

Read off the built HTML by the guard (`docs/wave507/titles-before.json`,
`titles-after.json`). "[em dash]" stands for the separator the titles already carried
and still carry (section 5); this report does not print the character. The `/register`
role titles use a pipe, written here as `\|`. **No page carries `twitter:title` or
structured data, before or after**, so those columns are absent; `/partners` and
`/404.html` carry no `og:title`, and the 404 carries no `og:site_name`.

| Page | Field | Before | After |
|---|---|---|---|
| `/404.html` | title | Page not found | unchanged |
| `/about/` | title | About Us [em dash] The Impact Investment Platform | About Us [em dash] Impact Investment Group |
| `/about/` | og:title | About Us [em dash] The Impact Investment Platform | About Us [em dash] Impact Investment Group |
| `/about/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/contact/` | title | Contact [em dash] The Impact Investment Platform | Contact [em dash] Impact Investment Group |
| `/contact/` | og:title | Contact [em dash] The Impact Investment Platform | Contact [em dash] Impact Investment Group |
| `/contact/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/` | title | The Impact Investment Platform [em dash] Social Impact Property & Supported Housing | Impact Investment Group [em dash] Social Impact Property & Supported Housing |
| `/` | og:title | The Impact Investment Platform [em dash] Social Impact Property & Supported Housing | Impact Investment Group [em dash] Social Impact Property & Supported Housing |
| `/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/legal/` | title | Legal and company information · Impact Investment Group UK Limited | unchanged |
| `/legal/` | og:title | Legal and company information · Impact Investment Group UK Limited | unchanged |
| `/legal/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-broker/` | title | Partner with a Broker [em dash] The Impact Investment Platform | Partner with a Broker [em dash] Impact Investment Group |
| `/partner-with-broker/` | og:title | Partner with a Broker [em dash] The Impact Investment Platform | Partner with a Broker [em dash] Impact Investment Group |
| `/partner-with-broker/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-care-provider/` | title | Partner with a Care Provider [em dash] The Impact Investment Platform | Partner with a Care Provider [em dash] Impact Investment Group |
| `/partner-with-care-provider/` | og:title | Partner with a Care Provider [em dash] The Impact Investment Platform | Partner with a Care Provider [em dash] Impact Investment Group |
| `/partner-with-care-provider/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-developer/` | title | Partner with a Developer [em dash] The Impact Investment Platform | Partner with a Developer [em dash] Impact Investment Group |
| `/partner-with-developer/` | og:title | Partner with a Developer [em dash] The Impact Investment Platform | Partner with a Developer [em dash] Impact Investment Group |
| `/partner-with-developer/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-housing-association/` | title | Partner with a Housing Association [em dash] The Impact Investment Platform | Partner with a Housing Association [em dash] Impact Investment Group |
| `/partner-with-housing-association/` | og:title | Partner with a Housing Association [em dash] The Impact Investment Platform | Partner with a Housing Association [em dash] Impact Investment Group |
| `/partner-with-housing-association/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-investor/` | title | Partner with Property Investor [em dash] The Impact Investment Platform | Partner with Property Investor [em dash] Impact Investment Group |
| `/partner-with-investor/` | og:title | Partner with Property Investor [em dash] The Impact Investment Platform | Partner with Property Investor [em dash] Impact Investment Group |
| `/partner-with-investor/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-landlord/` | title | Partner with a Landlord [em dash] The Impact Investment Platform | Partner with a Landlord [em dash] Impact Investment Group |
| `/partner-with-landlord/` | og:title | Partner with a Landlord [em dash] The Impact Investment Platform | Partner with a Landlord [em dash] Impact Investment Group |
| `/partner-with-landlord/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-local-authority/` | title | Partner with a Local Authority [em dash] The Impact Investment Platform | Partner with a Local Authority [em dash] Impact Investment Group |
| `/partner-with-local-authority/` | og:title | Partner with a Local Authority [em dash] The Impact Investment Platform | Partner with a Local Authority [em dash] Impact Investment Group |
| `/partner-with-local-authority/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-resident/` | title | Housing for Residents, Individuals & Families [em dash] The Impact Investment Platform | Housing for Residents, Individuals & Families [em dash] Impact Investment Group |
| `/partner-with-resident/` | og:title | Housing for Residents, Individuals & Families [em dash] The Impact Investment Platform | Housing for Residents, Individuals & Families [em dash] Impact Investment Group |
| `/partner-with-resident/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-social-worker/` | title | Partner with a Social Worker [em dash] The Impact Investment Platform | Partner with a Social Worker [em dash] Impact Investment Group |
| `/partner-with-social-worker/` | og:title | Partner with a Social Worker [em dash] The Impact Investment Platform | Partner with a Social Worker [em dash] Impact Investment Group |
| `/partner-with-social-worker/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partner-with-support-provider/` | title | Partner with a Support Provider [em dash] The Impact Investment Platform | Partner with a Support Provider [em dash] Impact Investment Group |
| `/partner-with-support-provider/` | og:title | Partner with a Support Provider [em dash] The Impact Investment Platform | Partner with a Support Provider [em dash] Impact Investment Group |
| `/partner-with-support-provider/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/partners/` | title | Our Partners [em dash] Impact Investment Platform | Our Partners [em dash] Impact Investment Group |
| `/partners/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/platform/` | title | Our Services [em dash] The Impact Investment Platform | Our Services [em dash] Impact Investment Group |
| `/platform/` | og:title | Our Services [em dash] The Impact Investment Platform | Our Services [em dash] Impact Investment Group |
| `/platform/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/broker/` | title | Both sides of your deal, on one platform \| The Impact Investment Platform | Both sides of your deal, on one platform \| Impact Investment Group |
| `/register/broker/` | og:title | Both sides of your deal, on one platform \| The Impact Investment Platform | Both sides of your deal, on one platform \| Impact Investment Group |
| `/register/broker/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/care-provider/` | title | Stop losing referrals because the building is not there \| The Impact Investment Platform | Stop losing referrals because the building is not there \| Impact Investment Group |
| `/register/care-provider/` | og:title | Stop losing referrals because the building is not there \| The Impact Investment Platform | Stop losing referrals because the building is not there \| Impact Investment Group |
| `/register/care-provider/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/developer/` | title | Know where the demand is before you commit to the site \| The Impact Investment Platform | Know where the demand is before you commit to the site \| Impact Investment Group |
| `/register/developer/` | og:title | Know where the demand is before you commit to the site \| The Impact Investment Platform | Know where the demand is before you commit to the site \| Impact Investment Group |
| `/register/developer/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/housing-association/` | title | Stock, partners and demand, in one view \| The Impact Investment Platform | Stock, partners and demand, in one view \| Impact Investment Group |
| `/register/housing-association/` | og:title | Stock, partners and demand, in one view \| The Impact Investment Platform | Stock, partners and demand, in one view \| Impact Investment Group |
| `/register/housing-association/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/` | title | Register to join the waitlist \| The Impact Investment Platform | Register to join the waitlist \| Impact Investment Group |
| `/register/` | og:title | Register to join the waitlist \| The Impact Investment Platform | Register to join the waitlist \| Impact Investment Group |
| `/register/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/investor/` | title | Tell us the deal you want to see, and see it first \| The Impact Investment Platform | Tell us the deal you want to see, and see it first \| Impact Investment Group |
| `/register/investor/` | og:title | Tell us the deal you want to see, and see it first \| The Impact Investment Platform | Tell us the deal you want to see, and see it first \| Impact Investment Group |
| `/register/investor/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/landlord/` | title | Tell us what you own, and we will bring the demand to you \| The Impact Investment Platform | Tell us what you own, and we will bring the demand to you \| Impact Investment Group |
| `/register/landlord/` | og:title | Tell us what you own, and we will bring the demand to you \| The Impact Investment Platform | Tell us what you own, and we will bring the demand to you \| Impact Investment Group |
| `/register/landlord/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/local-authority/` | title | Tell us where the pressure is, and we will go and find the homes \| The Impact Investment Platform | Tell us where the pressure is, and we will go and find the homes \| Impact Investment Group |
| `/register/local-authority/` | og:title | Tell us where the pressure is, and we will go and find the homes \| The Impact Investment Platform | Tell us where the pressure is, and we will go and find the homes \| Impact Investment Group |
| `/register/local-authority/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/resident/` | title | Tell us what you need, and where \| The Impact Investment Platform | Tell us what you need, and where \| Impact Investment Group |
| `/register/resident/` | og:title | Tell us what you need, and where \| The Impact Investment Platform | Tell us what you need, and where \| Impact Investment Group |
| `/register/resident/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/social-worker/` | title | One place to look, instead of ringing round \| The Impact Investment Platform | One place to look, instead of ringing round \| Impact Investment Group |
| `/register/social-worker/` | og:title | One place to look, instead of ringing round \| The Impact Investment Platform | One place to look, instead of ringing round \| Impact Investment Group |
| `/register/social-worker/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/register/support-provider/` | title | The commission comes first and the building never does \| The Impact Investment Platform | The commission comes first and the building never does \| Impact Investment Group |
| `/register/support-provider/` | og:title | The commission comes first and the building never does \| The Impact Investment Platform | The commission comes first and the building never does \| Impact Investment Group |
| `/register/support-provider/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/solutions/` | title | The Solution [em dash] The Impact Investment Platform | The Solution [em dash] Impact Investment Group |
| `/solutions/` | og:title | The Solution [em dash] The Impact Investment Platform | The Solution [em dash] Impact Investment Group |
| `/solutions/` | og:site_name | The Impact Investment Platform | Impact Investment Group |
| `/the-problem/` | title | The Problem [em dash] The Impact Investment Platform | The Problem [em dash] Impact Investment Group |
| `/the-problem/` | og:title | The Problem [em dash] The Impact Investment Platform | The Problem [em dash] Impact Investment Group |
| `/the-problem/` | og:site_name | The Impact Investment Platform | Impact Investment Group |

Three values were already right and stay as they were: the 404's title, which names
no brand, and `/legal`'s title and `og:title`, which name the registered company
("Legal and company information · Impact Investment Group UK Limited"). `/legal`'s
`og:site_name` did say the platform, as every page's did, and now says the group.

**The tab says what the preview says.** The hydrated page's `document.title` and meta
equal the markup on all 30 pages at both widths: 174 live readings, none with the old
name.

## 3. What the brief got wrong

1. **There is no `src/content/seo.ts`.** Every title and `og:` value is written inline in
   the route's `head()`, in `src/routes`; `og:site_name` once, in `__root.tsx`. So the
   diff is in `src/routes`, and `git diff 9eae21a...HEAD -- src/content` is **empty**.
2. **No `twitter:title` and no structured data exist on the site**, before or after. X
   falls back to `og:title`. Nothing was added, since this wave changes names rather
   than adding tags; the guard fails on the old name in either if one ever appears.
3. **The old name had two forms**: "The Impact Investment Platform" in 19 files, and
   "Impact Investment Platform" in `/partners`'s title. Both are gone; the guard matches
   both.
4. **`siteName = "Impact Investment Platform"` in `src/content/site.ts` is read by
   nothing** (no import anywhere in `src`). It is not a title or a preview, so it is
   left alone and listed below.

## 4. Gate numbers, measured on the frozen tree

Source tree `5a6a01d`, built with `STATIC_BUILD=true bun run build` then
`pages-postbuild.mjs`: **rc 0, 36 prerendered pages** (`docs/wave507/build.txt`). The
gates ran on that source; the mutation build came after them, then the tree was
restored, rebuilt, and the guard re-run on the rebuild. Logs under `docs/wave507/`.

| Gate | Exit | Numbers |
|---|---|---|
| `wave507-titles.py` on the head (`after.txt`) | **0** | 30 pages; 0 old names in markup or live; every value equal to its before value with only the name swapped; `og:site_name` "Impact Investment Group" on all 29 routes; 174 live readings; `src/routes`: 0 old names in metadata. **Pixels: 60 full-page shots (30 pages at 1280 and 390) paired with the base, 0 differ, in header, main and footer alike, and all 60 pixel hashes equal** |
| The same on the base `9eae21a` (`before.txt`) | red | **319 failures**: in the markup 28 old titles, 27 old `og:title`s, 29 old `og:site_name`s and the same 29 not reading the group; in the hydrated pages at both widths 56 old titles and 112 old `og:` values; in `src/routes` 38 old strings |
| Pixel noise, the base against itself (`noise-base-vs-base.txt`) | | 60 shots, **0 differ**: the stilled shot has no run-to-run noise to hide a change in |
| Mutation: the old `og:site_name` put back in `__root.tsx` and `/partners`'s own part changed ("Our Partners" to "Partners"), rebuilt (`mutation.txt`) | **1** | **147 failures**: 145 naming `og:site_name` on every page, and `/partners`'s title caught by the own-part rule; restored, rebuilt, green |
| `wave412-screenshots.py` | **0** | 28 shots, all assertions passed; 274 INCOMPLETE nodes, 274 measured off the pixels, 0 unmeasured, 1 off screen (home @ 390, as at 490, 493 and 502). Darkest raw home @ 1280 **23.06%**, ground **8.17%** (502: 23.07 and 8.20) |
| `wave413-motion.py` | **0** | all assertions passed |
| `wave414-mobile.py` | **0** | 70 shots; 6,018 targets, 0 under 44, 0 closer than 8px; 5,270 type nodes, 0 under floor; 660 headings, 0 breaking; 0 serious or critical axe; 0 overflow. Lockup darkest box header 0.865, footer 0.789 (502: the same) |
| `wave421-hero-and-footer.py` | **0** | 401 pairs, 16 variant readings, 13 under-served images, 26 dividers |
| `wave415-zoopla-purple.py` | **0** | 31,516 bytes from 31,516, `public/` clean |
| `wave443-contrast.mjs --build dist/client` | **0** | 29 pairs, 0 failures, 0 retired hex in source or build |
| `wave414-responsive-images.py --check`, `wave493-og.py --check` | **0**, **0** | every variant present, 24 alpha sources intact; the OG card is the script's output |
| `wave493-logo.py` | **0** | all assertions passed; pairing at 1280, 0 px differ outside the logo's reach |
| `wave502-logo-name.py` | **0** | 65 lockup readings, 26 links, 130 tree names, every one "Impact Investment Group, home"; **39 shots paired with 502's before set, 0 differ** |
| `wave490-phone.py`, sweep in two parts plus the probes | **0**, **0**, **0** | 84 shots; 0 empty runs over 96px; 9,261 span nodes, 0 under floor; 252 Verify readings, 0 under 44; 48 cards, 0 tails; 54 pills, 0 split; 0 fixed-layer clashes; 145 drawer runs, 0 under floor; probes PASSED. **Rule 8: all 14 routes, 0 px moved beyond the noise** (home 23,105 differ against same-build noise of 21,153; platform 26,398 against 35,558; the other 12 differ on 0). See the note below |
| `tsc --noEmit` | **0** | |
| Lint, the 21 changed `src` files, read from the committed blobs | **0** | 0 errors, 0 warnings at the head and at `9eae21a` (`lint.txt`) |
| `git diff 9eae21a...HEAD -- src/content` | | **EMPTY** |
| Hex added under `src`; new visible strings | | **0**; none |

**Rule 8 on `/platform`: one red run, then green.** The first part-1 sweep
(`gate-490-part1-run1-red.txt`) failed rule 8 on `/platform` at 1280: 41 device px beyond
the noise in rows 2000 to 2380, the animated band. That run's same-build noise pair
caught the animation in step (noise 0 against 28,537 px differing from 490's before
set), so nothing was masked. Of two platform-only re-runs (`gate-490-platform-rerun1.txt`
and `rerun2.txt`), one read 41 again (noise 19,504) and one read 0 (noise 44,082); the
whole part-1 sweep re-run then read 0 (noise 35,558) and passed. The wave changes
`<head>` only, and this wave's own stilled full-page pair of `/platform` at 1280 is
identical in every pixel, so the 41 px are the animation's timing, not this change.
Recorded as a flake in rule 8's noise sampling on an animated page and not fixed here
(section 5).

**No em or en dash added.** In `src`: the 33 title strings that carried the separator
still carry exactly one each; 33 lines out, 33 in, net 0; the legal comment adds none.
`scripts/wave507-titles.py` writes both characters as escapes (as committed in
`76f41f2` the line that replaces them held them literally; the commit after `5a6a01d`
fixes that line and nothing else in the script), and every value it prints or records goes through that replacement or
`ensure_ascii`. This report prints none. Two raw gate logs quote copy the site already
ships, printed by the gate reading it, as at 502: `gate-412.txt` 14 and
`gate-490-probes.txt` 1.

The other gates rewrite their own `docs/screenshots/wave4xx/` folders and the
`docs/wave493` and `docs/wave502` records; those were restored rather than committed.
This wave's own 120 full-page PNGs (84 MB) are **not committed**; the record keeps each
pair's pixel hashes instead, and `python scripts/wave507-titles.py --build <base build>
--mode before` then the default run on the head reproduce them.

## 5. Deferrals, with reasons

1. **The em dash separator in 33 titles** ("About Us [em dash] Impact Investment Group").
   The house rule forbids writing the character, and this wave could not remove it
   without changing each page's own title, which the call ruled out. **Proposal:** a
   small wave moving every title to the pipe the register titles already use, with the
   guard's own-part rule updated to that separator.
2. **The descriptions still name the platform.** The `description` and `og:description`
   values of the ten register role routes ("Join the Impact Investment Platform waiting
   list as ...") come from `src/content/register.ts`, and the FAQ and the capital-at-risk
   notices say "The Impact Investment Platform" as the product's name. Those are copy
   and descriptions, not titles, and outside this call.
3. **No `twitter:title`, no structured data.** An `Organization` block naming "Impact
   Investment Group" would be new markup, so it is a proposal, not a change.
4. **`siteName` in `src/content/site.ts`** still reads "Impact Investment Platform" and
   is used nowhere; a clean-up wave can delete it.
5. **Rule 8's noise pair can miss the `/platform` animation**, as above. **Proposal:**
   take the noise as the maximum over three shots, or mask the band the gate already
   knows animates.
6. **`og:url` is root-relative on most routes** (already noted in `legal.tsx`);
   unchanged.

## 6. MANUAL (Callum)

None. Cowork: review the diff and push the branch to the site's `main`.
