# Wave 567 report: match it, no funnel on the register pages, five years plus

Branch `feat/wave567-the-site-says-match-it-and-five-years-plus`, worktree `iigs-uc567`,
base `origin/main` `26b308b` (wave 507's head, which did not move). Claimed by empty
commit `d44b872`: `feat/wave56*` returned nothing on the site remote, and 56, 560, 562 and
566 on the platform remote, with no `docs/WAVE567*` on the site's `origin/main` and no
queue row 567, so 567 was free on both and nothing was renamed. **Source head `9ba7dd3`**;
everything after it is the gates' expectations for the changed routes, three changes to
the guard (section 1a), a `.gitignore` line, and `docs/`. No `src` file has changed since
`9ba7dd3`. Nothing was pushed to `main`.

**Every string in section 7 is a PROPOSAL until Callum says yes to it.**

## 0. The three changes, in plain words

1. **The register pages no longer end with the "Coming soon" block.** The badge, the
   "Providing Homes. Delivering Support. Transforming Lives." line, the "30+ years" line
   and the two buttons are gone from `/register` and from all ten `/register/<role>`
   pages. The footer there now starts with the site links and the crisis card. Every
   other page still has the block, exactly as it was.
2. **"How we differ" on `/platform` no longer mentions 25 years.** The old model is
   described as "one long fixed term" with no number. Ours says "5 years+ · FRI or
   internal repairing · CPI-linked · renewable", and the third chapter is "Five-year-plus
   leases, renewed on evidence."
3. **"Find it, price it, prove it" is now "Find it, price it, match it"** wherever the
   site said it: the `/platform` headline, Pippa's line ("Pippa matches it."), her door
   ("Enter · Match"), the workflow disc ("Find · Price · Match") and the two search and
   link preview descriptions.

## 1. What shipped

| Item | What | Commit |
|---|---|---|
| The plan | `docs/WAVE567_PLAN.md`, before the first edit | `a7caab0` |
| The guard | NEW `scripts/wave567-copy.py`. Its red run on the base build, by the guard as it now stands: **61 failures** (`docs/wave567/before.txt`, section 1a) | `3dfecba`, then `a40591a` and `3d59e92` |
| W1 | `src/components/site-footer.tsx`: the funnel is not rendered on `/register` or under `/register/` | `d00875a` |
| W2 and W3 | `src/content/services.ts` and `src/routes/platform.tsx`: the lease section and the triad. One commit, because both workstreams edit the same two files | `9ba7dd3` |
| W4 | the gates' expectations for the changed routes, three re-based before shots, the logs, the shots, this report | the commits after `9ba7dd3` |

## 1a. The guard changed after its first red run, and the red run was redone

The first red run, committed at `3dfecba`, read 59 failures. The guard was then changed
three times, and `before.txt` was left as the first version had written it, which the
reviewer of `eb102a7` caught: it printed "'25' in the section" and "the section's text
carries", which the committed guard cannot print. The three changes:

1. **Narrowed** (`a40591a`). The first version failed on any "25" in the whole How we
   differ band. The band also holds the lane of three published figures, whose source
   dates carry "25" and must stay (section 3). The guard now reads the lane apart from
   the story: the story may carry no "25" at all, and the lane may carry it only inside
   "31 March 2025", "31 December 2025" and "2024 to 25". This is a narrower rule than
   the first, not only an escape fix, and the earlier wording of this report was wrong
   to call it that.
2. **The dash as an escape** (`a40591a`). The `DASH` constant held the character
   literally.
3. **Widened** (`3d59e92`). `/register/`, with the trailing slash the prerender writes,
   is read as well as `/register`: 12 hydrated funnel readings where there were 10.

**The red run, redone.** `26b308b` was checked out into a detached worktree of its own
under the temp directory and built there (`STATIC_BUILD=true bun run build`, then
`pages-postbuild.mjs`, rc 0, 30 pages: `docs/wave567/build-base.txt`), and the COMMITTED
guard was run against it with `--mode before`: **61 failures** (`before.txt`,
`copy-before.json`). 13 in the markup (the 11 register pages carrying the funnel, and
the two meta values); 8 hydrated funnels (four register routes at two widths); and 20 on
the hydrated `/platform` at each width, 40 in all (the hero, the two meta values, the
doorway's name and label, the disc, the comic strip, the "prove" words, Pippa's panel,
and 11 failures across the three chapters). The 59 of the first run plus the two readings of `/register/`.
The narrowing removed none on the base: there the story itself says 25 in every
chapter, and the lane's "25"s are all inside the three dates, as the log prints. The
source check reads this branch's source, not the base's, so it adds no failure to the
red run. The head run was then repeated with the same guard: exit 0 (`after.txt`,
`copy-after.json`).

## 2. W1: the register pages drop the funnel (R567-3)

The footer reads the pathname with `useRouterState({ select: (s) => s.location.pathname })`,
as `__root.tsx` and the header already do, and renders the funnel `<section>` only when
the pathname does not match `^/register(/|$)`. The section's markup, classes and copy are
untouched.

**In the built `dist/client`:** `id="funnel-heading"` is present once in **18** pages and
absent from **12**: `register/index.html`, the ten `register/<role>/index.html`, and
`404.html`.

**The brief expected 19 and 11, and that was wrong about the 404.** `404.html` is the
1,039 byte static page `scripts/pages-postbuild.mjs` writes. It has no footer and so no
funnel, at the base as much as at the head (base: 29 with, 1 without).

**Hydrated, at 1280 and 390:** `/register`, `/register/` (the slash form the prerender
writes), `/register/investor` and `/register/resident` carry no `#funnel-heading` and one
footer; `/` and `/platform` carry one of each (`docs/wave567/after.txt`, 12 readings).

**The diff of the footer.** `git diff --stat 26b308b HEAD -- src/components/site-footer.tsx`:

```
 src/components/site-footer.tsx | 92 +++++++++++++++++++++++-------------------
 1 file changed, 51 insertions(+), 41 deletions(-)
```

The same with `-w`, whitespace ignored: `16 +++++++++++++---`, 13 insertions and 3
deletions, which is the import line, the two hook lines, the conditional's two lines and
the two comments. **The other 38 lines each way are the funnel section moved two spaces
to the right and nothing else.** That was not avoidable: the site's lint gate runs
Prettier, and Prettier indents the contents of a conditional. No line inside the section
was rewrapped or reworded.

**A path under `/register/` that is not a role** also loses the funnel when the
not-found component renders inside the root layout (a client-side navigation). On a
direct visit GitHub Pages serves the static `404.html`, which never had it. Nothing was
changed for either.

## 3. W2: How we differ says five years plus and never 25 (R567-2)

- `leaseComparison` gains one field per entry, `strip`, holding the whole visible line,
  and the route prints it verbatim. `term` is "One long fixed term" and "5 years+".
  `leaseComparison` is read at `platform.tsx:395` and `:397` and nowhere else; `label`,
  `title` and `detail` are still read by nothing, and ours were given the smallest edit
  that keeps them true (P16).
- `DIFFERENCE_VISUAL.past` is FIXED and `.solution` is 5+. The size is now chosen by the
  value's shape, `/^\d{1,2}\+?$/`: one or two digits with an optional plus take the
  figure size and a word takes the smaller one, whichever chapter it is in.
- `differenceStory[2]` takes the new title, body and points; its eyebrow, chapters 01
  and 02, the heading, the lead and the three principles are unchanged.

**Measured on the hydrated page, each chapter selected in turn** (`after.txt`):

| Width | Chapter | Figure | Size | Glyphs | Card | "25" in the story |
|---|---|---|---|---|---|---|
| 1280 | 01 | FIXED | 72px | 912 to 1077 | 823 to 1167 | no |
| 1280 | 02 | REVIEW | 72px | 882 to 1107 | 823 to 1167 | no |
| 1280 | 03 | 5+ | 144px | 932 to 1058 | 823 to 1167 | no |
| 390 | 01 | FIXED | 40px | 149 to 241 | 41 to 349 | no |
| 390 | 02 | REVIEW | 40px | 132 to 257 | 41 to 349 | no |
| 390 | 03 | 5+ | 96px | 153 to 237 | 41 to 349 | no |

The strip and chapter 03 read exactly the PROPOSAL strings at both widths.

**One thing the acceptance line could not be made literally true of, and why.** The same
band holds the lane of three published figures under the story, and their sources are
dated "31 March 2025", "31 December 2025" and "2024 to 25" (the site prints the last with
its existing en dash). Those are the dates of gov.uk publications, and the content
module says no figure may lose its date, so they stay. The guard reads the lane apart
from the story and fails on any "25" in it that is not inside one of those three dates.
**Nothing that describes a lease says 25.**

**`rg -n '25' src/content/services.ts src/routes/platform.tsx`, every hit:**

| Hit | What it is |
|---|---|
| `services.ts:245`, `:258` | the source dates "31 March 2025" and "31 December 2025" on two demand figures |
| `services.ts:252` | a comment about the same December 2025 figure |
| `services.ts:265` | the source year "2024 to 25" on the third demand figure |
| `platform.tsx:190` | `3.25rem` in a headline clamp |
| `platform.tsx:242` | `0.025` alpha in the card's grid lines |
| `platform.tsx:324` | `250px`, the visual column's minimum |
| `platform.tsx:327` | `2.25rem` and `-0.025em` on the chapter title |
| `platform.tsx:372` | "250px" in this wave's own comment on the size branch |
| `platform.tsx:526` | `2.25rem` in the portals headline clamp |
| `platform.tsx:554` | `scale-[1.025]` on the doorway hover |
| `platform.tsx:568` | `h-[225px]` on the doorway artwork |
| `platform.tsx:586` | `25%` in a teal gradient mix |
| `platform.tsx:743` | `md:opacity-25` on the workflow panel's artwork |
| `platform.tsx:955` | a `repeating-conic-gradient` ending `...0.10)_0deg_7deg`, matched on `255` |

None is in the How we differ data. `term: "25 years"` and `value: "25"` are gone.

**A side effect, measured: `/platform` is 25px shorter as it loads at 1280.** The word
FIXED at 72px makes a shorter card than the figure 25 did at 144px, so the chapter
panel is 443px tall as it loads where it was 468px, and the page is 5,921px where it was
5,946px (2px shorter at 390). Chapter 02 has always made the same shorter card, so the
section already changed height between chapters; this moves which chapter is the tall
one. Reversed by Callum choosing a different visual for P11.

## 4. W3: match it, everywhere (R567-1)

**`rg -n -i '\bprov(e|es|ed|ing)\b' src public scripts docs/*.md`.** In `src`:

| Hit | Verdict |
|---|---|
| `src/content/services.ts:17` the hero title | triad: changed (P1) |
| `src/content/services.ts:67`, `:73` two comments | triad: changed |
| `src/content/services.ts:85` `toolsHeading` | triad: changed (P2) |
| `src/content/services.ts:122` Pippa's `claim` | triad: changed (P3) |
| `src/routes/platform.tsx:44`, `:46`, `:1085`, `:1090` four comments | triad: changed |
| `src/routes/platform.tsx:68` the `description` meta | triad: changed (P5) |
| `src/routes/platform.tsx:74` `og:description` | triad: changed (P6) |
| `src/routes/platform.tsx:501` `PORTAL_LABEL.pippa` | triad: changed (P7) |
| `src/routes/platform.tsx:672` the disc's small line | triad: changed (P8) |
| `src/content/platform.ts:141` `label: "Pippa proves it"` | **the triad, in a module nothing imports: left, see below** |
| `src/content/home.ts:369` `name: "Prove the impact"` | not the triad: left (the home page is out of scope; it is a step name, not the tagline) |
| `src/content/register.ts:990` "No way to prove our track record to a landlord" | not the triad: left |
| `src/components/home/mission-solution.tsx:362`, `src/content/legal.ts:33`, `src/lib/icon-registry.ts:117`, `src/routes/legal.tsx:169`, `src/styles.css:2629` | not the triad: left (comments) |

`public`: no hit. `scripts`: 44 hits and `docs/*.md`: 31 hits, every one a gate's or a
report's own prose about what a probe proves ("proves nothing", "proved by mutation"),
or wave 295's copy of the register line above, or wave 490's quotation of the disc's old
line at `docs/WAVE490_REPORT.md:988`: not the triad, left.

**`src/content/platform.ts:141` is left, and that is a departure from this wave's own
plan.** Nothing in `src` imports `@/content/platform`, so the string is rendered nowhere.
The plan said it would be changed with the rest. It was not, because that file fails the
lint gate on three formatting errors of its own at the base, and changing one line of it
would have meant either reformatting an unrelated dead module or reporting a changed
file with lint errors. A clean-up wave can delete the module.

**It is dead, checked two ways at the reviewer's request (7 Oct 2026, 13:00 UK):**

```
$ rg -n 'content/platform' src
(no output)
$ rg -il 'proves it' dist/client
(no output)
```

No file in `src` imports the module, and no file in the head build carries "proves it"
in any case, so the string reaches no page, no script bundle and no prerendered
document. `dist/client` was the build of `9ba7dd3`, and `git diff 9ba7dd3 HEAD -- src
public package.json bun.lock vite.config.ts` is empty, so it was not stale. Both
searches printed nothing, so the module is left as it is and no P17 is proposed.

**`rg -n -i 'prove it|prove\.|proves|Price · Prove|PRICE IT · PROVE' src` does not print
nothing.** It prints four lines, none of them rendered and three of them not the triad:

```
src/content/about.ts:185:     *    seeing the quality of vulnerable people's lives improve. He is a
src/content/legal.ts:33: *    the AD01 is what proves the split is an artefact rather than the name.
src/content/platform.ts:141:    { id: "proves", label: "Pippa proves it", tone: "orange" as const },
src/routes/legal.tsx:169:                with a visible label, not an icon: it is how a reader proves the
```

The pattern is wider than the triad ("improve." matches `prove\.`). In the two files
that held the triad it prints nothing, and the guard asserts that.

**The new strings in `src`** (the brief's pattern, less four unrelated lines that say
"match it" about other things in `demand-map.tsx`, `about.ts`, `home.ts` and
`register.ts`):

```
src/content/services.ts:17:  title: "Find it, price it, match it.",
src/content/services.ts:67: * ── FIND IT · PRICE IT · MATCH IT ──
src/content/services.ts:85:export const toolsHeading = "Find it. Price it. Match it.";
src/content/services.ts:122:    claim: "Pippa matches it.",
src/routes/platform.tsx:44: *   1 · Find it, price it, match it   cream   hero + the product screenshot
src/routes/platform.tsx:46: *   3 · Find it. Price it. Match it.   cream   Petra, Peter, Pippa
src/routes/platform.tsx:68:          "Find it, price it, match it. We source UK residential property, ...",
src/routes/platform.tsx:74:          "... an AI team that finds, prices and matches every home [em dash] one workflow, every figure sourced.",
src/routes/platform.tsx:501:  pippa: "Enter · Match",
src/routes/platform.tsx:672:                <small ...>Find · Price · Match</small>
src/routes/platform.tsx:1085:       * ── 3 · Find it. Price it. Match it. ── cream ──
```

**Hydrated `/platform` at 1280 and 390** (`after.txt`): the hero reads "Find it, price it,
match it."; Pippa's doorway reads "Enter · Match" and is named "Meet Pippa [em dash]
Enter · Match"; the disc reads "Find · Price · Match"; the comic strip carries PETRA
FINDS IT., PETER PRICES IT. and PIPPA MATCHES IT.; the workflow panel for Pippa carries
P4; `meta[name=description]` and `og:description` read P5 and P6 in full, in the markup
and in the hydrated page; and the page's text carries no "prove" or "proves" as a word.

**Two things the brief names that the page does not show.**

1. **`toolsHeading` is rendered nowhere.** `src/routes/platform.tsx` does not import it;
   the section it once headed is now "Three doors into one platform." P2 is changed in
   the content module and has no pixel to show.
2. **Each claim is printed once, upper-cased, in the comic strip.** The portals and the
   disc print only the first word of the claim (the name). So "Pippa matches it." appears
   on the page as "PIPPA MATCHES IT." and nowhere in sentence case.

## 5. W4: the gates, on the frozen tree

Source tree `9ba7dd3`, built with `STATIC_BUILD=true bun run build` then
`pages-postbuild.mjs`: **rc 0, 36 prerender lines, 30 pages** (`docs/wave567/build.txt`).
The base was built the same way and kept apart (`build-base.txt` is the log of the
rebuild in section 1a; the base shots the pairing gates read came from the first base
build, of the same commit). Every gate ran
in the foreground on that head build. Logs under `docs/wave567/`.

| Gate | Exit | Numbers |
|---|---|---|
| `wave567-copy.py` on the head (`after.txt`) | **0** | funnel in 18 pages, absent from 12; 12 hydrated funnel readings; 6 chapter readings asserted, no "25" in the story; every PROPOSAL string that renders read back exactly |
| The same committed guard on the base, rebuilt (`before.txt`) | red | **61 failures**: 11 pages with the funnel, the two meta values, 8 hydrated funnels, and 20 readings of `/platform` at each width. Its source check read this branch's source, so it adds none (section 1a) |
| `wave412-screenshots.py` | **0** | 28 shots, all assertions passed; 274 INCOMPLETE nodes, 274 measured, 0 unmeasured, 1 off screen (home @ 390, as before). Darkest raw home @ 1280 **23.07%**, ground **8.21%** (507: 23.06 and 8.17) |
| `wave413-motion.py` | **0** | all assertions passed |
| `wave414-mobile.py` | **0** | 70 shots; 5,958 targets, 0 under 44, 0 closer than 8px; 5,225 type nodes, 0 under floor; 660 headings, 0 breaking; 0 serious or critical axe; 0 overflow. Lockup darkest box header 0.865, footer 0.789 (507: the same). 60 fewer targets and 45 fewer type nodes than 507: the funnel on three register routes at five widths |
| `wave414-responsive-images.py --check` | **0** | every variant present, 24 alpha sources intact |
| `wave415-zoopla-purple.py` | **0** | 31,516 bytes from 31,516 |
| `wave421-hero-and-footer.py` | **0** | 16 variant readings, 13 under-served images, **377 pairs**, 26 dividers, no pair unresolved on any shot (below) |
| `wave443-contrast.mjs --build dist/client` | **0** | 29 pairs, 0 failures, 0 retired hex in source or build |
| `wave490-phone.py`, sweep in two parts plus the probes | **0**, **0**, **0** | 84 shots; 0 empty runs over 96px; 9,153 span nodes, 0 under floor; 252 Verify readings, 0 under 44; 48 cards, 0 tails; 54 pills, 0 split; 0 fixed-layer clashes; 145 drawer runs, 0 under floor; probes PASSED. Rule 8: all 14 routes, 0 px beyond the noise (below) |
| `wave493-logo.py` | **0** | all assertions passed; 10 pairs at 1280, 0 px differ outside the logo's reach (below) |
| `wave493-og.py --check` | **0** | the card is the script's output |
| `wave502-logo-name.py` | **0** | 65 lockup readings, 26 links, 130 tree names; **39 shots paired with 502's before set, 0 differ** |
| `wave507-titles.py --by-design ...` | **0** | 30 pages, 174 live readings, 60 shots; 36 paired whole at 0 px; 24 paired band by band (below). The exact command line, with the twelve named pages and their bands, is at the top of `gate-507.txt` |
| `tsc --noEmit` | **0** | |
| `eslint` on the three changed `src` files | **0** | 0 errors, 0 warnings (`lint.txt`) |
| Hex added under `src` | | 0 |

No gate is NOT RUN.

### The pairing gates: which routes differ, and by how much

**Expected to differ: `/platform`, `/register` and the ten role pages. Found to differ:
those twelve and no other.**

| Gate | Run against | Routes that differ | Every other route |
|---|---|---|---|
| 507, 60 full-page shots | the base build, strictly (`gate-507-strict-red.txt`) | 24 shots: the 12 routes at 1280 and 390 | 36 shots, 0 px, header, main and footer alike |
| 507, band by band (`gate-507.txt`) | the same base shots | `/platform`: header 0 px; main changed height (5,091px to 5,066px at 1280); footer 12,614 px at 1280 and 150 px at 390. The 11 register pages, 22 shots: **header 0 px, main 0 px**, footer changed height (858px to 635px at 1280) | 36 shots, 0 px |
| 490 rule 8, 14 routes at 1280 | its stored before set, strictly (`gate-490-part1-strict.txt`, `gate-490-part2.txt`) | `/platform`: 127,656 px beyond the noise, rows 164 to 5060. `/register`, `/register/investor`, `/register/resident`: 261,885, 261,634 and 261,697 px differ, **all inside the footer**, 0 beyond | home 0 beyond its noise; the other 9 differ on 0 px |
| 490 rule 8, after the re-base (`gate-490-part1.txt`) | `before/platform-1280.png` re-shot at the head | none: `/platform` 0 beyond its noise | as above |
| 493, 10 header and footer pairs at 1280 | its stored before set, strictly (`gate-493-strict-red.txt`) | `/platform` footer 16,002 px; `/register` footer 270,240 px | 5 headers and 3 footers, 0 px |
| 493, after the re-base (`gate-493.txt`) | the two footers re-shot at the head | none | 10 pairs, 0 px |
| 502, 39 header and panel shots | its stored before set | none: this wave touches neither | 39 shots, 0 px |

**Why the `/platform` footer differs at all.** Nothing in it changed. The page above it
is 25.27px shorter (section 3), so the footer starts on a different fraction of a pixel
and some of its lines of type land one row away from where they were. That is the whole
of the 12,614 px in 507's reading and the 16,002 px in 493's.

**How each gate was taught, for the changed routes only:**

- **421** reads fifteen footer pairs on every page. On the three register routes it
  visits, three funnel pairs named nothing, and a fourth, "the pre-release badge",
  resolved to a different teal line in the footer and measured that instead: 383 pairs,
  18 listed as missing, still exit 0. It now skips the four funnel pairs on `/register`
  and under it, asserts the funnel is absent there, and **fails** if a funnel pair names
  nothing on any other route, where it used to list it. 377 pairs, none missing.
- **507** has no stored set: it pairs with the base build by definition, so a re-base
  cannot help a route that changes on purpose. It gains `--by-design slug=band+band`,
  **empty by default**, so rule 5 is whole for any run that does not name a page. A
  named page is paired band by band, each band cut from its own shot; the bands it names
  may differ, every other band must be equal in every pixel, and a named page on which
  nothing differs fails. This run named `/platform` for main and footer and the eleven
  register pages for the footer only.
- **490** rule 8: `before/platform-1280.png` re-shot at the head by the gate's own
  `--mode before` (`gate-490-rebase-platform.txt`). No box was added to `TOUCHED`. The
  register routes needed nothing: the rule already declares the footer touched on every
  route.
- **493**: `before/platform-1280-footer.png` and `before/register-1280-footer.png`
  replaced by the head's shots. Every other before shot is still 493's base.

Each carries a dated comment naming this wave. No rule was loosened for every route.

**No em or en dash added.** `git diff 26b308b HEAD`, added lines: three carry an em dash
at the source head and two at the final head, none of them new.
`src/routes/platform.tsx:74` is P6, whose separator the brief says stays.
`src/components/site-footer.tsx` shows the "30+ years" line as added because it moved
two spaces right with the rest of the funnel (section 2); its words are unchanged. The
third was the guard's own `DASH` constant, which the first commit of the guard held as a
literal character; `a40591a` writes it as an escape, as wave
507's guard had to. 0 en dashes. This report prints neither character. Two raw logs
quoted copy the site already ships, 10 and 4 in `gate-412.txt` and 1 in
`gate-490-probes.txt`; they are written there as `[em dash]` and `[en dash]`.

The other gates rewrite their own `docs/screenshots/wave4xx/` folders and the
`docs/wave493`, `docs/wave502` and `docs/wave507` records; those were restored rather
than committed, except the three re-based before shots named above. 507's 120 full-page
PNGs are not committed; `docs/wave567/gate-507-record.json` keeps each pair's pixel
hashes.

## 6. The shots

Under `docs/screenshots/wave567/`, full page, animations stilled:

| File | What it shows |
|---|---|
| `platform-1280-before.png`, `platform-390-before.png` | the base, as it loads (chapter 01, "25 / YEARS FIXED") |
| `platform-1280-after.png`, `platform-390-after.png` | the head, chapter 03 selected |
| `platform-chapter01-1280-after.png` | the head, chapter 01 (FIXED) |
| `register-1280-before.png`, `register-390-before.png`, `register-1280-after.png`, `register-390-after.png` | `/register`, with and without the funnel |
| `register-investor-1280-before.png`, `register-investor-390-before.png`, `register-investor-1280-after.png`, `register-investor-390-after.png` | `/register/investor`, the same |

## 7. The PROPOSAL strings

Before and after exactly as rendered. Every one needs Callum's yes before `main` moves.

| Id | Where | Before | After (PROPOSAL) |
|---|---|---|---|
| P1 | the `/platform` hero | Find it, price it, prove it. | Find it, price it, match it. |
| P2 | `toolsHeading` (rendered nowhere) | Find it. Price it. Prove it. | Find it. Price it. Match it. |
| P3 | Pippa's claim, shown upper-cased in the comic strip | PIPPA PROVES IT. | PIPPA MATCHES IT. |
| P4 | Pippa's body, in her portal profile and the workflow panel | Pippa scores the social impact of every home and makes the result easy to understand. | Pippa checks every home against the demand in its area and scores its social impact in plain terms. |
| P5 | `/platform` `description` meta | Find it, price it, prove it. We source UK residential property, price every home against named public data, and follow it into managed supported housing. | Find it, price it, match it. We source UK residential property, price every home against named public data, and follow it into managed supported housing. |
| P6 | `/platform` `og:description` | The Property Finder, the Demand Map and an AI team that finds, prices and proves every home [em dash] one workflow, every figure sourced. | The Property Finder, the Demand Map and an AI team that finds, prices and matches every home [em dash] one workflow, every figure sourced. |
| P7 | Pippa's doorway, and its accessible name | Enter · Prove; "Meet Pippa [em dash] Enter · Prove" | Enter · Match; "Meet Pippa [em dash] Enter · Match" |
| P8 | the workflow disc's small line | Find · Price · Prove | Find · Price · Match |
| P9 | the comparison strip, orange side | 25 years · fixed legacy commitment | One long fixed term · the legacy model |
| P10 | the comparison strip, teal side | 5 years · planned review window | 5 years+ · FRI or internal repairing · CPI-linked · renewable |
| P11 | the big figure and caption, chapter 01 | 25 / YEARS FIXED | FIXED / ONE LONG TERM, NO REVIEW POINT |
| P12 | the big figure and caption, chapter 03 | 5 / YEAR REVIEW WINDOW | 5+ / YEAR LEASES, RENEWED ON EVIDENCE |
| P13 | chapter 03 title | Five-year leases create room to adapt responsibly. | Five-year-plus leases, renewed on evidence. |
| P14 | chapter 03 body | Our five-year structure creates a clear point to review political, funding and economic change, while protecting the stability residents need from their home. | Our leases run for five years or more on full repairing and insuring or internal repairing terms, with CPI-linked rent and renewal at the end of the term: a clear point to review demand, funding and policy while residents keep the stability of their home. |
| P15 | chapter 03 points | Check the evidence of demand before renewing / Respond to change without locking in avoidable risk / Use what we have learnt to make each renewal decision | Full repairing and insuring (FRI) or internal repairing terms / Rent linked to CPI for the life of the lease / Renewal at the end of the term, decided on the evidence of demand |
| P16 | `leaseComparison[1]` `title` and `detail` (read by no component) | A planned review window / The lease can be reviewed against current demand, performance and risk before the next commitment is made. | Renewed on evidence / Five years or more on FRI or internal repairing terms, CPI-linked, with renewal at the end of the term reviewed against current demand, performance and risk. |

The captions in P11 and P12 are written in lower case in the source and upper-cased by
the page's CSS, as the old ones were. No user-facing string was added or changed beyond
P1 to P16. `leaseComparison[0].term` and `[1].term` ("One long fixed term", "5 years+")
are no longer printed on their own: the strip prints `strip`.

## 8. Two questions for Callum

1. **Pippa's other lines still speak of impact.** Her quote "What difference will this
   home make?", her expanded line "I turn the social outcome into a visible, reportable
   Impact Score." and her action "Make the outcome visible" are unchanged, and so is her
   chip, "Impact score", which now sits directly above "Pippa checks every home against
   the demand in its area..." in the workflow panel. Keep them, or should they follow
   "match"? The content module's own warning stands either way: her chip must not
   become "Demand Map", which is a tool the visitor uses and not something she runs.
2. **No image carries the old tagline.** The OG card (`og-default.png`) is the lockup on
   white with no words, by `scripts/wave493-og.py`'s own rule. `public` holds no text
   with the triad, and the full-page shots of `/platform` show it nowhere in the
   artwork: the three characters, the four step illustrations and the product capture
   carry no tagline. Nothing to name.

## 9. Left as found, for a later wave

1. `src/content/platform.ts` is imported by nothing and still says "Pippa proves it".
   Both searches in section 4 print nothing: it is dead and can go in a clean-up wave.
2. `src/content/home.ts:369`, the home page step "Prove the impact". Out of scope here;
   Callum may want it to follow.
3. The eyebrows "Option 4 · Character portals" and "Option 2 · Platform mission
   control" on the live `/platform` read like labels from a design review. Not touched.
4. The product capture on `/platform` still shows the old "Impact Investment Platform"
   mark inside the screenshot. It is a picture of the product, not site copy.
5. The How we differ section changes height between chapters (section 3), as it did
   before this wave. A fixed card height would stop it.
6. 507's deferral 5 stands: rule 8's noise pair on `/platform` read 263 px on one run
   and 209,522 px on the next. Both runs passed.

## 10. MANUAL (Callum)

Say yes or no to P1 to P16 and answer the two questions. Cowork: review the branch and,
on Callum's yes, fast-forward the site's `main`. No other step.
