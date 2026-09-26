# Wave 490 report: the phone defects

**The call**, Callum Saxon, 25 September 2026, about 17:00 UK:

> "review the site as a mobile user throughout every page, and then improve the design as
> a mobile user specifically for every page, so that on mobile the website loads perfectly
> and there are no design issues, and it follows all the mobile design rules for websites,
> so that we can display the same information but ensure it fits perfectly on a mobile
> device."

Wave 414 did the structural work eight days earlier: no route scrolls sideways, every
target is 44 by 44, type has a floor, the drawer and the sticky Continue bar work. What it
did not do was LOOK at the result. This wave is the thirteen things a visitor sees that no
assertion in 412, 413, 414, 415, 421 or 443 could see, each one measured before, changed,
and measured again.

**Two of the thirteen turned out not to be defects, and both are reported with the
measurement that says so rather than "fixed" with a change nobody needed.** One of them is
an artefact of the instrument the review itself was using.

---

## 0c. The fix pass 490c, and what the second re-check found

The second independent re-check, rel490b, read this branch at `ce157b4` (code head
`9752c60`) and returned **HOLD on two MAJORs, one of them documentation, and six MINORs**.
The fix pass 490c is documentation and evidence, plus one comment. It changes no
behaviour, adds no string and weakens no test.

| finding | what the fix pass 490c did |
|---|---|
| MAJOR 1: `before.txt` was never re-run with the fix pass's instrument, so the base figures lived only in prose | **FIX A.** The base `f61b3b8` was built in a scratch git worktree and measured by the gate script as it stands at the code head, `--mode before`; the output is `docs/wave490/before.txt`, and the old log is kept as `docs/wave490/before-first-pass.txt`. Every rebuilt base figure in sections 2 and 7 is now quoted with its line number. The mutations 3a, 3b and 3c were run again, FAILED and then PASSED, raw, in `docs/wave490/mutations.txt` |
| MAJOR 2: `/contact` is not deterministic | **FIX F**, documentation only: the next section, headed as a pre-existing build defect, with the evidence, the mechanism and the recommended fix |
| MINOR 1: the 1280 cold reading, and the rollback's Lighthouse batch | **FIX B.** Item 1 states the 1280 cold landing time as unmeasured; the comment in `src/components/ui/logo-marquee.tsx` is corrected to the two widths that were measured (`c9d9303`, the only source change). The rollback batch was not logged, and section 6 says so |
| MINOR 2: the data logos' check loosened without a ruling | **FIX E**, proposal 16 |
| MINOR 3: proposal 13 not checked on the base | **FIX C**, below: **the base jumps too** |
| MINOR 4: three links outside item 12's list | **FIX E**, proposal 17 |
| MINOR 5: the capture's scroll box is a focusable group with no name | not in this pass's brief; unchanged, and it is what FIX 13 asked for (axe reads 0) |
| MINOR 6: four report slips | **FIX D**: the broken bold marker in ruling C, "three more" above six rows (now "six"), the sentence in section 5.1 that did not parse (rewritten as two), and 275 against 274 (section 5 says which is right and why) |

### The hydration scroll to the top, checked on the base

**The base goes back to the top as well. This wave did not introduce it.** Proposal 13 was
measured on the head only. The fix pass 490c ran one probe on both builds,
`docs/wave490/hydration-probe.py`, which is the item 1 probe's own instrument (gzipped
server, slow 4G with the cache disabled before `goto`, a scroll to the council strip on the
first styled frame) followed by `scrollY` sampled every 50ms until 4s after hydration. Two
runs per build per width, nothing else running on the machine
(`docs/wave490/hydration-jump.txt`):

| build | width | scrolled to | hydrated at | at scrollY 0 by | verdict |
|---|---|---|---|---|---|
| base `f61b3b8` | 390 | 2,702 | 5,362 and 5,347ms | 6,229 and 6,241ms | **jumped**, both runs |
| base `f61b3b8` | 1280 | 1,533 | 5,604 and 5,610ms | 6,270 and 6,251ms | **jumped**, both runs |
| head `c9d9303` | 390 | 2,675 | 5,132 and 5,105ms | 6,044 and 6,016ms | **jumped**, both runs |
| head `c9d9303` | 1280 | 1,533 | 5,842 and 5,803ms | 6,503 and 6,456ms | **jumped**, both runs |

The shape is the same on both builds: the page holds its position until about 0.1s after
the hydration mark, then travels to 0 over about 0.7 to 0.9s in an eased curve rather than
a single step, which is what a `scrollTo` to the top looks like under the site's own
`html { scroll-behavior: smooth }` (`src/styles.css:382` on the base). Something resets the
scroll on the first client render, and it did so before this wave. The first suspect is
unchanged, the router's initial-load scroll handling (`src/router.tsx` sets
`scrollRestoration: true`), and the one thing already ruled out is unchanged too (a scratch
build with it `false` does the same). Proposal 13 stands as a pre-existing defect with its
recommended default, and this jump is also why the 1280 cold landing time in item 1 is
unmeasured.

---

## A pre-existing build defect this wave did not cause and does not fix: which page `/contact` is

**The page served at `/contact` is whichever enquiry variant the prerenderer wrote last.**
It was proposal 15; the second independent re-check, rel490b, made it MAJOR 2, and this
fix pass (490c) gives it this section so that nobody reads it as a wave 490 change. This
wave did not cause it, and this wave does not fix it.

**The evidence.**

- **Five builds of the code head `9752c60`** prerendered `/contact` as **Investor enquiry,
  Media, Investor enquiry, Media and Support**, in that order
  (`docs/wave490/gate-lint.txt:10` to `:15`).
- **Four builds of the base `f61b3b8`** prerendered it as **Media once and Support three
  times** (section 9, proposal 15).
- **The live site serves Support**: `https://impactinvestmentgroup.co.uk/contact/` fetched
  on 26 September 2026 at 00:29 UTC has the Support button pressed
  (`docs/wave490/contact-variants.txt`).
- **The two builds this fix pass made** fit the mechanism below exactly: the base build
  finished the Support variant last and serves Support, and the head build finished the
  Media variant last and serves Media (`docs/wave490/contact-variants.txt`, each build's
  own `[prerender]` lines).
- **The postbuild trim varies with it**: `scripts/pages-postbuild.mjs` has trimmed 1,677,
  2,242, 230 and 0 characters of duplicated tail from `contact/index.html` on different
  builds of the same source (section 4.1), and 795 and 0 on this pass's two.

**The likely mechanism.** `vite.config.ts` prerenders with `crawlLinks: true` and
`autoSubfolderIndex: true`. The crawl reaches six query variants of the page,
`/contact?enquiry=waitlist`, `partner`, `demo`, `investor`, `media` and `support`, from the
site's own links, and prerenders each as well as `/contact`. The query string is not part
of the output path, so all seven write `contact/index.html`, concurrently, and the one that
finishes last is the page that ships. A write that overlaps another would also explain the
duplicated document tail the postbuild step exists to trim.

**What a visitor gets.** Somebody who types the address, or follows any plain link to
`/contact`, lands on a form with an enquiry type already chosen by the race: Support on the
live site today, and on the next deploy possibly Media or Investor, with a different
deadline field and a different reply promise. After hydration the header's "Contact Us"
can read orange or navy depending on the variant.

**What this wave did about it.** Nothing to the build. Rule 8's 1280 pairing needs the head
and the base to be the same page, so the wave 490 gate rebuilt until the head's `/contact`
matched the before set's Support, and records every attempt (section 4.3). That makes
the `/contact` pairing a comparison on a CHOSEN build, and it is said here as such.

**Recommended: the next site wave**, a short build wave that makes `/contact` one
deterministic output: stop prerendering the query variants (exclude `/contact?` from the
crawl and let the client apply the query), or write them somewhere other than
`contact/index.html`, and then assert in the gate that `contact/index.html` has no enquiry
type pressed. Until then, every deploy re-rolls which enquiry type `/contact` opens on.

---

## 0. The fix pass 490b, and what the re-check found

The independent re-check of this branch at `04539cd` (code head `ee833f3`), rel490,
returned **HOLD with 4 MAJOR and 10 MINOR**. Its findings were right, and several of them
were about this report saying more than its own logs did. Every one is closed below by a
commit of its own, with the proof in the commit message, and the figures in sections 2 to
7 are re-quoted from the runs at the new code head `9752c60`. Where a sentence in the
wave 490 text was wrong, it has been corrected in place rather than annotated.

### The three rulings, each ASSUMED on 25 September 2026 pending Callum's word

The operator took these on Callum's standing instruction to take the initiative. None of
them is Callum's own ruling yet, and each is written here so that one sentence from him
settles it.

- **RULING A. The back-to-top control stays REMOVED below `lg`**, exactly as commit
  `78d44ec` made it. At 390 wide the content runs from x=20 to x=370, and a 44px
  control at `right: 20px` spans x=326 to 370, so no floating control at that width can
  avoid the text column, which is what rule 3 forbids; and a phone has its own scroll to
  top. **This is a removal, and it is put to Callum as one.** The restore path is item 8's
  original spec (`right: max(20px, env(safe-area-inset-right))`,
  `bottom: max(24px, env(safe-area-inset-bottom))` at every width, hidden while the
  register bar or the drawer is on screen), which is commit `b88fdc0`'s state: **one
  commit, `git revert 78d44ec`, brings it back**, and it applies cleanly at the code head
  (`git diff 78d44ec^ 78d44ec | git apply -R --check` passes).
- **RULING B. The flip bar's orange-600 end below `lg` stays.** It clears a pre-existing
  4.27:1 failure with a brand token and no new colour. It is a visible change and it is
  named to Callum as one: section 9, proposal 11.
- **RULING C. The wave 412 off-screen bucket is narrowed to the hero strip
  (`.hero-band`) below 768 only.** Every other INCOMPLETE node is measured or failed
  exactly as wave 412b wrote it. At the code head the bucket holds **1 node, the second
  slide's caption "Delivering Support" on home @ 390, and nothing else on any route or
  width**.

### The four MAJORs

| # | finding | closed by | proof |
|---|---|---|---|
| 1 | Back-to-top removed below `lg`, unrequested | **Ruling A** (above) | the removal stands as a proposal with its one-commit restore path |
| 2 | The report said wave 412 passed; the committed log ended 4 FAILURE(S), and the off-screen bucket was site-wide | `28db505` (FIX 1) | wave 412 re-run at the code head: exit 0, 28 shots, 275 INCOMPLETE nodes, **274 measured, 0 unmeasured, 1 off screen** (section 5 says why the log's summary line reads 274), All assertions passed; bucket narrowed to `.hero-band` below 768; the flip bar at 390 reads **5.21:1** on all three lines |
| 3a | Item 11's reading put wrappers in its rows, so its widest gap could not fail; the tail read minus 74 and minus 98 while the report said 1px | `d377ffd` (FIX 2) | rows are leaf ink boxes; head reads widest gap **46.0px**, tail **15.0px**; mutation `pb-[200px]!` on the bar: **FAILED**, 233px |
| 3b | Rule 2 never reported a run at a section's edge or last row, so the brief's own 295px hole was invisible to it | `c990596` (FIX 3) | base build: **301px at 390** (280 at 360, 279 at 414) found; head: **0**; mutation, a 200px interior spacer: **FAILED: 9** |
| 3c | The reduced-motion probe passed on the base, and the report quoted the base's 1,559px as the head's proof | `539453f` (FIX 4) | head **1,355 then 1,566px**; base **1,559 throughout, FAILED** |
| 4 | Item 1's "slow 4G" proof was taken after the page had loaded unthrottled | `62dba1d`, `76eba85` (FIX 5) | throttled before `goto`, cold, gzipped; LOADED reading asserted: on-screen crests and **all 36** decoded at +1.5s at 390, 360 and 1280, the base **FAILS** (32, 32, 25 of 36 undecoded); COLD reading on the first styled frame is a **FINDING** (0 of 4 at 390 at +1.5s), because the priority change that fixed it cost the home page's Lighthouse LCP 300ms and was taken back |

### The ten MINORs

| # | finding | outcome |
|---|---|---|
| 1 | "0 dashes" was unscoped | **closed**, section 4 states it with its scope |
| 2 | Section 11 and the sweep table were incomplete; proposal 5 called a fixed line unfixed | **closed**, sections 3, 9 and 11 |
| 3 | Item 12's rule lived only in wave 490's gate | **closed**, `28a122b` (FIX 8): the rule is in `scripts/wave414-mobile.py`, and it found three more links of the same shape, fixed below `lg` |
| 4 | Item 3's snap landing, mask cost and caption clip were unmeasured | **closed**, `a749fb4` (FIX 9) |
| 5 | Item 13 never asserted the bar, and read only step 1 | **closed**, `f52eee0` (FIX 10) |
| 6 | Lighthouse was single runs, and the regressions were unexplained | **closed**, `8b95f48` (FIX 11): five runs per route per build, medians, section 6 |
| 7 | Two unfloored runs, and the drawer never opened | **closed**, `1da07ae` (FIX 12) |
| 8 | The flip bar colour change was unnamed | **closed**, ruling B and proposal 11 |
| 9 | The swap's scroll offset, the focus drop, and the caption announced twice | **the double announcement fixed**, `5de1879` (FIX 13); the scroll offset and the focus drop are recorded as known, item 2 |
| 10 | Section 5.1 claimed a 360 base reading it did not have | **closed**, the 360 base run is committed as `docs/wave490/base-414-360.txt` and quoted |

---

## 1. The ledger

| | |
|---|---|
| Repo | `Impact-Investment-Group-site` (the marketing site, GitHub Pages from `main`, Lovable-connected) |
| Worktree | `C:\Users\Israel\Documents\repos\iigs-uc490` |
| Branch | `feat/wave490-the-phone-defects` |
| Base | `origin/main` at `f61b3b8` (wave 443's head, 22 Sep). `origin/main` did not move during the wave, so nothing was merged in |
| Number claimed | empty commit `0264024`, pushed before the first edit. `git ls-remote --heads origin 'refs/heads/feat/wave49*'` returned **nothing** on the site remote and **`feat/wave49-admin-console`** on the platform remote, which is wave 49 and not 490. No collision |
| First code head | `ee833f3` (wave 490), re-checked as rel490: **HOLD, 4 MAJOR, 10 MINOR** |
| Code head of the gate | **9752c60** (the fix pass 490b, section 0). Every gate figure in this report was measured on a build of it |
| Code head | **c9d9303** (the fix pass 490c). It changes ONE JSX comment in `src/components/ui/logo-marquee.tsx` and nothing else (`git diff --stat 9752c60 c9d9303` is that file, 7 insertions and 2 deletions, all inside the comment). A build of it is **byte-identical** to a build of 9752c60's source: the 86 files of `dist/client/assets` hash the same, file for file |
| Final head | the last commit on the branch, a documentation one. **Every commit after the code head changes only `docs/`**: `git diff --name-only c9d9303..HEAD | grep -v '^docs/'` prints nothing. (The one `.gitignore` line wave 490 added, excluding `docs/screenshots/wave490/control/`, is before the code head.) |

The repository's own checkout on `main` carries an uncommitted SEO refactor and was not
touched: every git command in this wave ran from inside the worktree.

**The raw logs of every run quoted below are under `docs/wave490/`**, kept because a
number in a report that nobody can re-read is a number nobody can check:
`docs/wave490/before.txt` (the base build `f61b3b8` measured by the gate script as it
stands at the code head, `python scripts/wave490-phone.py --build <base build> --mode
before`, re-run in the fix pass 490c: every "before" figure in sections 2 and 7 is quoted
from it with its line number), `docs/wave490/before-first-pass.txt` (the same base measured
by the WAVE 490 script at `ee833f3`, kept because it is what the wave 490 text quoted; its
instrument could not see a trailing run, so its rule 2 line reads "0 empty runs over
96px" where the rebuilt one reads 3), `docs/wave490/mutations.txt` (the raw FAILED and
PASSED runs for the fix pass's mutations 3a, 3b and 3c), `docs/wave490/gate.txt`
(every figure in the "after" column), `docs/wave490/base-412.txt` and `base-414.txt`
(the two pre-existing red gates measured on the base build), and the six `gate-41*` and
`gate-421`/`gate-443` files for the earlier gates re-run at this head.

---

## 2. The thirteen items

Every "before" figure below was measured by `scripts/wave490-phone.py --mode before`
against a build of `origin/main` `f61b3b8`, on the same profiles as the "after" figure
beside it. **Since the fix pass 490c the log behind them is `docs/wave490/before.txt`,
taken on 26 September 2026 by the script as it stands at the code head (the fix pass 490b
rebuilt five of its instruments and had not re-run it), against a build of `f61b3b8` in a
scratch git worktree**, and the figures the fix pass rebuilt are quoted with their line
numbers. Nothing here is quoted from the brief without being re-measured.

**One caveat on that run, stated rather than hidden.** Its route sweep ran alone, but while
its item 1 probe was running this pass was building the mutation 3b and restored trees in
the same machine, so the base's COLD item 1 timings in it were taken with a build
competing for the CPU. The asserted LOADED figures do not depend on timing (on the base a
lazy tile off the layout is never requested at all) and they read exactly what the fix pass
490b reported: 4, 4 and 11 of 36.

### Item 1 · The council logo strip showed blank white plates

**Before.** `src/components/ui/logo-marquee.tsx` rendered its 36 tiles
`loading="lazy"`. Chrome decides lazy loading off an element's LAYOUT position and knows
nothing about the transform that is moving it, so in a track 3,082px wide inside a 390px
window, 32 of the 36 tiles are parked outside the viewport for ever and are never
requested.

**How it is measured (rewritten in the fix pass, FIX 5).** The wave 490 probe loaded the
page to `networkidle` and only then turned the throttle on, so every crest had arrived
over loopback before its clock started: the re-check was right that "measured on the slow
4G profile" was not true of it. The probe now:

- turns on slow 4G (150ms, 1.6Mbps down) and disables the cache **before** `goto`;
- serves the build **gzipped**, as GitHub Pages does and as the Lighthouse runs are
  served (the plain server leaves the page unstyled until 5.6s on its own, because the
  211KB stylesheet goes uncompressed);
- scrolls to the strip **on the first frame its stylesheet applies** (before that the
  "strip" is a 4,264px column of stacked images, and "tiles on screen" means nothing);
- polls the wrapper's box, times the entry by the page's own clock, restarts the clock if
  the page moves the strip off screen, and reads **1.5s after an entry the wrapper holds
  without a break**. One fresh cold context per strip and per reading.

It takes **two readings**. **COLD**: the scroll lands on the strip on the first frame its
stylesheet applies, about 1.4s after navigation, with the page still arriving. **LOADED**:
the same cold slow 4G load, and the scroll lands once the page has loaded and hydrated,
which is when a visitor who has read down to the strip arrives. The LOADED reading is the
one asserted, on the tiles on screen AND on the whole lane of 36, because the defect was
the tiles further along the lane that cross the window later as empty plates. The COLD
reading is printed as a FINDING, for the reason below.

**Before**, the base build on this instrument (`docs/wave490/before.txt`, line numbers in
the last row):

| | 390 | 360 | 1280 |
|---|---|---|---|
| LOADED: crests on screen decoded at +1.5s | 4 of 4 | 3 of 3 | 9 of 9 |
| LOADED: the whole lane decoded at +1.5s | **4 of 36** | **4 of 36** | **11 of 36** |
| COLD: crests on screen decoded at +1.5s | 0 of 4 | 0 of 3 | 1 of 9 |
| crests requested by the reading, cold then loaded | 4, 4 | 3, 4 | 9, 11 |
| `before.txt` lines, cold and loaded | 225, 229 and 230 | 232, 236 and 237 | 239, 243 and 244 |

The LOADED reading **fails on the base**: "32 of 36 council tiles had not decoded" at 390
and 360 (`before.txt:230` and `:237`), 25 of 36 at 1280 (`:244`). The script in before
mode lists these under BEFORE rather than FAILED; run as a gate against the same build it
is FAILED: 3, as the fix pass 490b recorded. (The fix pass 490b's own base table read
0 of 9 COLD at 1280 and "9 to 10" requests; this run reads 1 of 9 and 11, with the CPU
caveat above. The cold 1280 figure on the base, like the head's, never settles:
`before.txt:239` reads "+over 16500ms", for the reason given under the head table below.) The first few tiles of the lane sit in layout, so
even lazy they load; every tile after them is parked outside the layout for ever.

**The change.** Wave 490: `loading="eager"` with `fetchpriority="low"`, so all eighteen
distinct crests are requested at first paint without competing with the hero.

**After**, at the code head:

| | 390 | 360 | 1280 |
|---|---|---|---|
| LOADED: crests on screen decoded at +1.5s | **4 of 4** | **3 of 3** | **9 of 9** |
| LOADED: the whole lane decoded at +1.5s | **36 of 36** | **36 of 36** | **36 of 36** |
| COLD: crests on screen decoded at +1.5s (FINDING) | 0 of 4, all by +3.25s | 0 of 3, all by +2.75s | 0 of 9; **landing time UNMEASURED** |
| distinct crest requests before the entry | 18 | 18 | 18 |

**The 1280 cold landing time was not measured (fix pass 490c, rel490b MINOR 1).** At 1280
the cold reading was taken (0 of 9 decoded at +1.5s, `docs/wave490/gate.txt:231`), but the
probe then waits for every crest on screen to decode, and at 1280 it never saw one:
`gate.txt:231` and `:232` read "every tile on screen decoded by +over 16500ms". That is not
a 16.5 second crest. The page hydrated at about 4.5s (the loaded 1280 readings,
`gate.txt:235` and `:236`, put hydration at 4,493 and 4,503ms), hydration took the page
back to the top (proposal 13, and section 0c, where the base is shown to do the same), the strip went off screen, and the settle loop, which counts only crests on
screen, had nothing to wait for until it gave up. So every cold landing time in this
report is a 360 or 390 figure, and the one at 1280 is **unmeasured**. The comment in
`src/components/ui/logo-marquee.tsx` said "3 to 9 crests ... land at +2.25 to +3.25s",
which took in 1280; it is corrected in `c9d9303`, the only source change in the fix pass
490c, to the two widths that were measured.

**Item 1's 1.5s budget is enforced only by the LOADED reading, and that is narrower than
it looks.** The LOADED reading waits for `load`, and `load` waits for every eager image, so
it binds against the tiles being lazy (which is the defect, and it fails on the base) and
against nothing else. The cold readings are printed, not asserted. What a phone visitor on
a cold slow 4G load actually sees, from `gate.txt`: the page is unstyled until about
1.4s; a visitor already on the strip 1.5s later sees 4 white plates at 390 (3 at 360) with
no crest in them; the crests land by +3.25s at 390 and +2.75s at 360; a visitor who
arrives after the page has loaded (about 5.1s) sees every crest.

**A FINDING, and a change tried and taken back.** On the COLD reading the crests are
queued behind the hero photographs, the stylesheet, the fonts and the bundle, and they
land at +2.75 to +3.25s at 360 and 390. Leaving `fetchpriority` off (auto, so Chrome's own boost for
on-screen images applies) changed nothing, +3.0s at 390. Putting the first nine tiles,
the most any width shows at once, at `high` (commit `62dba1d`) did bring them inside the
1.5s, and my own real-throttling measurement of the home page's LCP showed no cost (2,432ms
median at low, 2,260ms at high, 4x CPU, five runs). **Lighthouse mobile disagreed, and it is
the brief's instrument**: five runs each, the hero photograph the LCP element in every run,
**6,654ms with the nine at high against 6,353ms with every tile at low** (the base reads
6,326ms). 300ms of the first screen for every visitor, bought for the one who scrolls
3,000px inside 1.4s. The trade goes to the first screen: commit `76eba85` put every tile
back at `low`, and the cold shortfall is stated here rather than bought.

**Eighteen requests and not thirty-six.** The lane renders each crest twice against one
URL, so the browser makes one request per distinct file. The eighteen weigh **73,714
bytes, 4,095 on average**.

**The responsive pipeline already considered these and refused.**
`src/lib/image-variants.ts` records `steps: []` for all eighteen: the sources are 240 by
104 and the tiles render at 118 by 54 CSS px, which is 236 by 108 device pixels on a 2x
phone, so the 240px source IS the right variant and every larger step the encoder tried
came out bigger than its own source. There is nothing smaller to serve.

**The `ImageFade` invariant is honoured, and it was already.** The white plate is the
`<span>` that wraps each tile (`border border-rule bg-white`), not the image, so a tile
that has not decoded shows its plate and its hairline with nothing in it and the crest
fades in on top. Nothing is hidden in the markup, nothing waits at opacity 0 for
JavaScript, and no border flashes.

**A FINDING: the five data-source logos miss the 1.5s budget on this cold load.** The
wave 490 text said "5 of 5 at 360, 390 and 1280"; that was a reading taken after the page
had loaded, and it is withdrawn. On the cold instrument they are lazy, so they are first
requested when the grid is seen, and at +1.5s: **0 of 5 at 390, 1 of 5 at 360 and 3 of 5 at 1280, every one by +2.75s, +2.0s and +1.75s; on the LOADED reading all 5 of 5 at every width**. Two alternatives were
measured and rejected: `loading="eager" fetchpriority="low"` was slower (+3.25 to
+3.75s, because the low queue waits behind everything), and lazy at `high` was no faster
(+2.0 to +2.5s). The brief's own words for these five are "plain lazy is fine, but ...
measure it", and its "Prove" for item 1 is the council tiles, so the gate prints this as a
FINDING with its numbers and does not fail on it. It is proposal 12.

**And a second finding the new instrument met.** On that cold load the page is scrolled to
the strip and **the page goes back to the top when the bundle hydrates**: at 390,
scrolled to y=2,639 at the first styled frame, hydrated at 5,365ms, back at scrollY 0 by
6,257ms. It is not the router's `scrollRestoration` flag (a scratch build with it set to
`false` does the same). A visitor on a slow phone who has started reading is taken back
to the hero. Its cause is not established, and **the base does it too**: the fix pass 490c
ran the same instrument on `f61b3b8` and the page went back to 0 at 390 and at 1280 in
every run (section 0c, `docs/wave490/hydration-jump.txt`). It is pre-existing, and it is
proposal 13.

### Item 2 · 295px of empty cream under the purpose section

**Before.** `src/components/home/mission-solution.tsx` places both faces of the section in
ONE grid cell (`col-start-1 row-start-1`) so they can cross-fade, and a grid cell takes
the height of its tallest occupant. At 1280 and at 768 the two faces are the same height,
so that costs nothing. At 390 they are not.

| profile | section height | need face | solution face | gap under the visible face's last line |
|---|---|---|---|---|
| 360 | 1,597px | 1,597 | 1,597 | **279.0px** |
| 390 | 1,559px | 1,559 | 1,559 | **297.6px** |
| 414 | 1,517px | 1,517 | 1,517 | **275.8px** |
| 667x375 | 1,144px | 1,144 | 1,144 | 98.8px |
| 768 | 1,122px | 1,122 | 1,122 | 132.3px |
| 1280 | 812px | 812 | 812 | 121.7px |

The brief's own reading of this at 390 was 294px, taken on the live site on 25
September; this gate reads 297.6px on a build of the same commit, which is the
same hole measured with a different ruler.

**The change.** `src/components/home/mission-solution.tsx:269` to `:296` and the two
face class lists at `:352` and `:471`: below `md` the inactive face leaves the grid
(`hidden md:block`), so the cell is the height of the face somebody is reading. Above
`md` nothing changes at all: both faces are in the cell, both are the same height, and
the cross-fade is the one wave 412 shipped.

**It is a display swap and not an animated height.** Wave 413's law of motion is transform
and opacity only with ONE named exception, the disclosure's height, and a 300px height
transition on a section this tall would have been a second one bought for a flourish. An
element coming out of `display: none` has no before-change style for a transition to start
from, so the incoming face simply appears.

**After:**

| profile | section, need face showing | swapped | gap, need face | gap, solution face |
|---|---|---|---|---|
| 360 | **1,415px** | **1,621px** | **47.4px** | **47.4px** |
| 390 | **1,355px** | **1,566px** | **47.4px** | **47.4px** |
| 414 | **1,355px** | **1,524px** | **47.4px** | **47.4px** |
| 667x375 | **1,114px** | **1,150px** | **47.4px** | **47.4px** |
| 768 | 1,128 / 1,128 | 1,128 | 76.0px | 47.4px |
| 1280 | 812 / 812 | 812 | 121.7px | 50.9px |

Every phone profile, on both faces, at or under the 48px ceiling. The 768 and 1280 rows
still carry BOTH faces at the same height, which is what "above `md` nothing changes"
means, and the 1280 pairing reads zero moved pixels on `/`.

**And one byte saving comes with it.** The solution face's illustration,
`trio-wave.webp`, is `loading="lazy"` inside a subtree that is now `display: none` below
`md`, so a phone does not request it at all until the reader asks for the solution face.
That is 144 KB a phone no longer downloads to look at the need face, and it is why the
home page comes out LIGHTER after this wave than before it despite eighteen eager
crests: section 6.

**Under reduced motion the swap is instant**, measured rather than asserted, at the code
head at 390: the section reads **1,355px before the press, 1,566px 50ms after it and
1,566px at 750ms**, still moving by 0.00px, and its height changed by **211px** across the
swap. (The wave 490 text quoted 1,559px three times here. Those were the BASE build's
figures, where both faces share one cell and nothing changes height at all, and the probe
passed there too. The re-check caught it. The probe now also asserts that the section's
height changes across the swap at 390, so it cannot pass on the base: run against the base
build it reads 1,559 throughout and **FAILS**, FIX 4: `docs/wave490/before.txt:250` and
`:251` read "before=1559px at 50ms=1559px at 750ms=1559px" and "changed by 0px across the
swap", and `:926` is the failure, "at 390 the section reads 1559px on both faces". The run
as a gate, FAILED: 1, and the head's pass beside it are in `docs/wave490/mutations.txt`,
3c.)

**Rule 2's scan now sees this hole too.** It used to report only interior runs, so a run
reaching a section's last row, which is exactly what this hole is, was invisible to it
(FIX 3). On the base build it now reports **280px at 360, 301px at 390 and 279px at 414**
inside `section@mission-heading`, "last row", with the face's own 44px padding allowed
(`docs/wave490/before.txt:301`, `:321` and `:341`; the summary at `:298` reads "3 empty
runs over 96px"); at the code head, **0**. The same scan failing a 200px interior spacer,
and passing once it is taken out, is `docs/wave490/mutations.txt`, 3b.

**Two behaviours of the swap are known and left as they are**, both measured by the
re-check. Flipping from the solution face (1,566px at 390) back to the need face (1,355px)
shortens the section by 211px, so a reader who flips back while scrolled below it is left
about 211px further down the page than the content they were reading. And when a face
becomes `inert`, focus on a control inside it falls to `<body>`; that is pre-existing, the
same on the base build. Neither is a string, and neither is changed in this pass.

### Item 3 · The hero strip's clipped headline

**Before.** The snap strip shows 24px of the next photograph past the right edge, which is
the affordance. What also showed was the next slide's HEADLINE. "Delivering Support" is
sized to span 95 per cent of its own panel, so it starts 8px inside it and its first
glyph, an orange D, painted 16px from the right edge of the screen.

Measured off the first viewport's own pixels, taking the ground from the six rows
immediately below the caption in the same column band, because the hero's ground is not
flat white and a flat reference would be a number about the wash:

| profile | peeking slide | band | darkest pixel | ground | share of ground |
|---|---|---|---|---|---|
| 360 | "Delivering Support" | 24.0px | 0.1478 | 0.8418 | **0.176** |
| 390 | "Delivering Support" | 24.0px | 0.1478 | 0.8356 | **0.177** |
| 414 | "Delivering Support" | 24.0px | 0.1478 | 0.8276 | **0.179** |
| 667x375 | "Transforming Lives" | 12.0px | 0.0271 | 0.8449 | **0.032** |

against a floor of 0.70. A single orange letter at the edge of the screen reads as text
somebody forgot to fit, not as "there is more".

**The change.** `src/styles.css:2216` to `:2273`, inside the existing
`@media (max-width: 767px)` block, so the desktop hero is untouched:

- a right-edge mask on `.hero-band`,
  `linear-gradient(to right, #000 calc(100% - 56px), transparent calc(100% - 6px))`, with
  the `-webkit-` form beside it;
- `overflow: clip` with `overflow-clip-margin: 2px` on each slide's `figcaption`, as a
  guard so a future headline cannot paint outside its own slide at all;
- `outline-offset: -3px` on the band's focus ring.

**The ramp is arithmetic, not taste.** 56px reaching nothing 6px short of the edge holds
the glyph at 16px in at 0.20 of its strength, and leaves the photograph's own peek at 24px
in at 0.36, still visible as a sliver of the next picture. A shorter ramp leaves the glyph
legible; a longer one takes the peek with it.

**The focus ring had to come inside, and that is the cost of the mask.** `mask-clip` is
the border box and the band's ring is drawn at `outline-offset: 4px`, outside it: masked,
the ring would not paint at all. Measured by differencing a blurred shot against a focused
one, so the reading is what changes on the screen and not what the computed style claims:

| profile | ring pixels painted | rows | columns |
|---|---|---|---|
| 360x800 | **1,863** | 89 to 405 | 21 to 330 |
| 390x844 | **2,041** | 89 to 434 | 21 to 360 |
| 414x896 | **2,183** | 89 to 457 | 21 to 384 |
| 667x375 | **2,798** | 69 to 284 | 33 to 625 |

The ring is a 2px solid `teal-600` on all four sides of the strip; its right-hand segment
fades with everything else in the last 56px, and the other three sides and the great
majority of its length are at full strength.

**After:**

| profile | peeking slide | darkest pixel | ground | share of ground |
|---|---|---|---|---|
| 360 | "Delivering Support" | 0.6867 | 0.8395 | **0.818** |
| 390 | "Delivering Support" | 0.7004 | 0.8413 | **0.833** |
| 414 | "Delivering Support" | 0.7072 | 0.8338 | **0.848** |
| 667x375 | "Transforming Lives" | 0.8356 | 0.8872 | **0.942** |

Nothing at or under the 0.70 floor at any of the four.

**Measured in the fix pass (FIX 9), the three things this item had only asserted:**

- **The snap still lands at `start`.** Three raw touch drags of 250px (past half a
  slide) and a programmatic scroll 37px short of slide 1, at 360, 390, 414 and 667x375:
  every landing rests on a slide's start, **0.00px off at 360, 390 and 414 and 0.50px at
  667x375** (half-pixel layout), on slides 1, 2 and 1 in turn. `synthesizeScrollGesture`
  with a touch source does not move this strip in headless Chromium at all, so the drags
  are raw touch events with a 100ms pause before the lift, as a finger has; without the
  pause the gesture never ends and nothing snaps, on the base build either.
- **The mask costs no frame on the 4x CPU profile.** At 390, three runs each of four touch
  swipes across the strip (it reached scrollLeft 652 of 652 every time) and a 900px page
  scroll, mask on against mask off: **mask on 1,293 frames, mean 16.76ms, p95
  16.80ms, 7 frames over 25ms; mask off 1,310 frames, mean 16.87ms, p95 16.80ms, 16 over
  25ms** (the final run; the first run read 11 against 19). The mask stays.
- **The caption clip cuts no glyph.** Each slide snapped at 360, 390, 414 and 667x375,
  shot with `overflow: clip` on its caption and with it lifted, against a control pair of
  the same state: **0 device px differ on all twelve, noise 0**. `overflow-clip-margin`
  stays at 2px.

Mutation: `scroll-snap-type: none` and `max-height: 1.5rem` on the caption in a scratch
build, **FAILED: 22** (resting up to 121px off a start; up to 16,977 device px of glyph lost
to the clip).

### Item 4 · The type floor did not reach inside a paragraph

Section 3 is the sweep table. In short: wave 414 sorted every `p` and `li` by LENGTH, 60
characters or more being body at 15px and anything under it a label at 12. That rule is
right about the elements it was written for and blind to a run INSIDE one, because a
`span` carries its own font-size and the gate only ever read the `li`.

### Item 5 · The six statistics ticker on /platform

**Before**, at 360, 390 and 414: **6 items including 3 clones, a track 3,082px wide, 1
running animation, and 17 of the section's text runs falling outside the viewport**, the
first of them the figure "1.34m" itself. A 22px figure and its 12px label went through a
390px window cut mid-word at one edge and running off the other, at walking pace.

**The change.** `src/routes/platform.tsx:405` to `:470` (`DemandTicker`) and
`src/styles.css:655` to `:697` (`.demand-ticker`). Below `md` the same three items render
as three rows, figure over label over source. **Not one string changes**; this is the
reflow the ruling asks for.

**Two mechanisms, and both are deliberate.** The stylesheet stops the lane and stacks it
with no JavaScript at all, so the prerendered document is right at every width before a
byte of bundle lands, and the clones are `display: none` rather than merely still. The
media query in the component then drops the clones from the DOM once the bundle is there,
so a phone carries three items and not six. It defaults to the LANE, so the prerendered
markup is exactly the one this page has always shipped and nothing can mismatch at
hydration.

**After:**

| profile | items | clones | track | running animations | strings outside the viewport |
|---|---|---|---|---|---|
| 360 | **3** | **0** | 320px | **0** | **0** |
| 390 | **3** | **0** | 350px | **0** | **0** |
| 414 | **3** | **0** | 374px | **0** | **0** |
| 667x375 | **3** | **0** | 603px | **0** | **0** |
| 768 | 6 | 3 | 3,546px | 1 | 16 |
| 1280 | 6 | 3 | 3,036px | 1 | 11 |

The 768 and 1280 rows are the lane, unchanged, which is what the brief asks for. The 768
track is wider than the base's 3,097px because the label now answers to the 15px floor
below `lg`; the lane itself is the same lane. **Proposal 4 in section 9 asks whether the
cut should be `lg` rather than `md`**, because a tablet reads a moving statistic no better
than a phone does.

The "Updated 2 June 2026" line follows at **13px** below `lg` (`max-lg:text-[13px]`,
`src/routes/platform.tsx:469`).

### Item 6 · Petra's ghost behind the body text

**Before**, at 390: the card was 340px tall with a `min-height` of 340, the illustration
**169 by 280** at x=228, clipped by the card at 370 with its pointing arm cut off, at
**opacity 0.25**, **not inside the card's padding box**, and sitting under **3 runs of
copy** including "Describe the home you need. Petra searches the whole sourced market for
the closest fit." At 360 it sat under **5**.

**One card, three characters.** The `src` follows whichever of Petra, Peter and Pippa is
selected, so this is the whole of the fix for all three.

**The change.** `src/routes/platform.tsx:705` and `:734`. Below `md` the illustration is a
96px figure, right-aligned above the copy, at full strength and full colour,
`object-contain` so nothing is cropped, and the card's `min-h` becomes `md:min-h-[340px]`
because 340px was reserving room for artwork no longer in the text column.

**After:**

| profile | card | min-height | art | opacity | inside the padding box | text clashes |
|---|---|---|---|---|---|---|
| 360 | 451px | **auto** | **58 x 96** | **1** | **yes** | **0** |
| 390 | 421px | **auto** | **58 x 96** | **1** | **yes** | **0** |
| 414 | 421px | **auto** | **58 x 96** | **1** | **yes** | **0** |
| 667x375 | 421px | **auto** | **58 x 96** | **1** | **yes** | **0** |
| 768 | 340px | 340px | 169 x 280 | 0.25 | no | 0 |
| 1280 | 340px | 340px | 169 x 280 | 0.25 | no | 0 |

The 768 and 1280 rows are byte for byte the base's.

### Item 7 · The product screenshot

**Before.** The Property Finder capture is a **2,241 by 1,207 desktop screenshot** served
at **348 CSS px** at 390 through `sizes="(min-width: 768px) 50vw, 100vw"`, so every word
inside it renders under 4px tall, and there was **no control that opened it**.

**The change.** `src/routes/platform.tsx:788` to `:860` (`ProductCapture`). Below `md` the
figure is a button that opens the capture at its own width in a horizontally scrollable,
pinch-zoomable box, with a 44px close control, focus trapped by Radix, `Escape` and the
control both closing it.

**No new string but one.** The trigger takes its accessible name from the capture's
existing `alt`; the dialog takes its name from the figure's existing caption, which is
also the sentence a visitor needs while looking at illustrative figures at full size.

**The caption is announced once (FIX 13).** The scroll box inside the dialog used to point
`aria-labelledby` at the same title, so the caption was the name of the dialog and again of
the group inside it. The group keeps its role and its tab stop and has no name of its own.
Read off Chromium's accessibility tree on the open state at 390, the nodes whose computed
name is the caption are **{dialog: 1, heading: 1, StaticText: 1, InlineTextBox: 1}**: one
dialog, and no group. With `aria-labelledby` put back in a scratch build the same reading
adds `group: 1` and the gate **FAILS**. The
one string this wave authors is `aria-label="Close"` on the icon-only close control, which
is the single case the canon allows, and it is listed in section 4.

**The desktop gains no control at all.** The query defaults to false, so the prerendered
document is the figure this page has always shipped at every width, and a phone with no
JavaScript gets exactly what it gets today rather than a button that does nothing.

### Item 8 · The back-to-top control over the words

This is the item that changed shape under measurement, and the reasoning is worth having
in full because it ends in a feature not being offered on a phone.

**Before.** `src/components/ui/back-to-top.tsx:92` declares `fixed bottom-6 right-5`, and a
rule in `src/styles.css` moved it to `right: auto; left: 1.25rem` below 1024px. Wave 414
made that move deliberately and wrote down why (section 4 of `docs/WAVE414_REPORT.md`): the
registration journey's new sticky Continue bar finishes in the bottom right and a 44px
circle would land on it. The reasoning is sound about the register routes and was applied
to all twenty-nine.

What it cost everywhere else was never measured, because 414's fixed-layer assertion tests
the fixed layers against EACH OTHER and never against the words underneath them. The
computed box at 390 is `left: 20px; right: 326px; bottom: 24px`, 44 by 44 from x=20 to
x=64, covering the first 44px of whatever line sits at the foot of the viewport.

**Measured at the base, over eleven routes, after two viewports of scroll, counting every
intersection with a text node's rendered ink or another control's box:**

| profile | intersections |
|---|---|
| 360 | **5** |
| 390 | **10** |
| 414 | **7** |
| 768 | 1 |
| 667x375 | 2 |
| 1280 | **0** |

**The first change was the brief's: put it back in the right-hand gutter with the safe
area under it.** `src/styles.css:2606` to `:2636`. It made the arithmetic visible rather
than fixing it: at 390 the page's gutters are 20px and the content column is the other
350, so a 44px circle against EITHER gutter covers an eighth of every line it lands on.
The left gutter puts it on the starts of those lines; the right gutter puts it on their
ends. Re-measured with the control in the right gutter: **5 intersections at 360, 10 at
390, 7 at 414, 2 at 667x375, 1 at 768, 0 at 1280.** The same count, different words.

**There is no third position.** A phone has no gutter wide enough to hold a 44px target
beside a full-width column, and 44px is rule 6's own floor, so the control cannot be made
smaller either. Rule 3 admits no exception: "they sit in the right-hand gutter or below
the content's last line".

**So the control is offered from `lg` and not below it.** `src/components/ui/back-to-top.tsx:41`
to `:88`. `lg` is the width at which the rest of this site switches to its desktop
composition: the demand map becomes pressable, the solutions rail becomes a side rail, and
the register journey's sticky bands stop sticking. It is **not rendered** below that
rather than hidden with CSS, so a phone carries no markup and no tab stop.

**After: 0 intersections at every width on every route**, and on `/register/investor` at
390 with the bar on screen the control is **absent**, which is item 8's own second
assertion.

**This is a REMOVAL on phones and tablets, and it was not asked for.** The brief's item 8
said "at every width". The re-check made it MAJOR 1, rightly: disclosure is not
authorisation. It stands under **ruling A, assumed on 25 September 2026 pending Callum's
word** (section 0), and the restore path is one commit: `git revert 78d44ec` puts the
control back in the right gutter at every width, on the safe area, hidden while the
register bar or the drawer is on screen, which is item 8's original spec, and it applies
cleanly at the code head. What restoring it costs is the arithmetic above, 5 to 10 text
runs covered per phone profile over eleven routes. One side effect is stated rather than
left for a reader to find: wave 414's fixed-layer check now reads **0 fixed layers on every
phone profile**, so on phones it tests nothing until a fixed layer comes back.

`body:has(.drawer-panel) .back-to-top { display: none }` stays and is live rather than
decorative: the drawer is reachable up to `xl` and the control is offered from `lg`, so the
two widths overlap.

### Item 9 · The desktop minimum heights on /about

**Before.** `src/components/about/director-card.tsx:105` put `min-h-[356px]` on every team
card at every width. 356px is the height of the tallest card in a row of four; below `md`
there is no row.

| profile | cards | tail under the last content |
|---|---|---|
| 360 | 5 at 356px | 34.2, **59.0**, **59.0**, 34.2, **59.0** px |
| 390 | 5 at 356px | 34.2, **59.0**, **59.0**, 34.2, **59.0** px |
| 414 | 5 at 356px | 34.2, **59.0**, **59.0**, 34.2, **59.0** px |
| 667x375 | 5 at 356px | the row is two across here and equalises on purpose |

**Sixteen card readings over the 32px ceiling** across the whole baseline run.

**The change.** `md:min-h-[356px]`. The card's own `pb-5` is the gap now, which is the
20px the design already gives every other card on this page.

**After**, at 390: five cards at **346, 338, 314, 370 and 314px**, every tail **4.0px**,
and **0 of 48 card readings over the ceiling** across the run. The cards are not all
shorter than 356 because item 4 raised their credential lines from 12px to 15px; what has
gone is the floor that made a 314px card 356px tall and put the difference under the last
line.

A card that SHARES a row is exempt, because equalisation is exactly what a row is for.
Below `md` these five are one per line and share nothing, which is why the exemption does
not reach them.

**At 1280 the row still equalises** and the 1280 pairing reads **0 moved pixels on
`/about` against 0 pixels of same-build noise**, which is the strictest reading this gate
can give.

**The three "What we do" cards were measured and NOT changed.** The brief reports 105px
empty under the company pill. Measured at 390 they are 274, 274 and 294px tall with
`pb-[104px]`, and the reserve is not empty: it holds the character illustration, whose box
ends **111px past the card's padding edge**. The tail under the last INK is 11.8px and the
tail under any content is **-111px**. Rule 2's pixel scan over `/about` returns **0 runs
over 96px at every width**, read with edge and last-row runs counted as the fix pass
rewrote the scan (the wave 490 figure was read by a scan that could not see a trailing
run, so it said nothing about this corner; the rewritten one does, and still reads 0). It
is a filled corner, not a hole, and tightening it on a
phone is proposal 3 rather than a change made on a reading nobody took.

### Item 10 · The pill that splits its verb

**The brief's diagnosis does not reproduce, and the measurement says what does.** At
`origin/main` `f61b3b8`, "deliver it" renders in **ONE** client rect at 360, 390 and 414.
What the pill actually does is the other half of rule 7. It is `inline-flex` with
`align-items: baseline` and NO wrap, so when "Care & Support Providers" runs out of room it
wraps INSIDE its own `<b>` and the verb stays on the first baseline beside it:

```
Care & Support   deliver it
Providers
```

68px tall at 360 and 390 against 43 for every other pill on the page, with a
justified-looking gap between two columns. That is the composition the brief describes and
the one rule 7 rules out.

**Finding it needed the gate fixed twice.** `getClientRects()` on the role returns ONE
rect whatever it does, because a flex item is blockified and a block box that wraps over
two lines is still one rectangle; the role's lines are counted off its own line box now.

**The change.** `src/routes/solutions.tsx:221` to `:249`: `flex-wrap` so the verb drops
under the role, `whitespace-nowrap` on the verb so it stays together when it lands there,
and `gap-x-[7px] gap-y-0.5`. **`gap-x-[7px]` and not the brief's `gap-x-2`**, because 7px
is the horizontal gap the desktop uses and the desktop does not move.

**After:** 9 pills at every width, **0 splitting a verb, 0 with the verb beside a wrapped
role**. The tallest pill is 68px at 360 and 390 (role on one line, verb under it) and 43px
at 414, 768, 667x375 and **1280, which is the base's own figure**.

### Item 11 · The empty space inside the account card · NOT A DEFECT

**This one is an artefact of the instrument, and the instrument was a screenshot.**

`.registration-actions` is `position: sticky`. Sticky changes where an element PAINTS and
not where it sits in the flow, so its rect reports the foot of the viewport while the
card's layout still has it a thousand pixels further down. Every rect-based reading
therefore sees the bar near the top of the card and a band of nothing where its flow box
is, **and that includes a full-page screenshot**, which is what the review was reading.

Read off the layout instead, with the sticky boxes set static for the duration of the
measurement (which changes no other box on the page, because a sticky box occupies exactly
the space a static one would):

**Re-measured in the fix pass (FIX 2), because the first reading could not fail.** It put
every descendant of the panel into its rows, the step wrapper and the form included, and
a wrapper spans every gap inside it: every reading printed "1px before
div.registration-step" whatever the step held, and the tail read **minus 74px at 390 and
414 and minus 98 at 360** in `gate.txt` while this table said 1px. The rows are now LEAF
boxes that carry ink, every text node's Range rects and every input, select, textarea,
button, img and svg, with the body of a closed `<details>` left out and its summary kept.
The ceiling is the bar's height plus 16, as the brief sets it, **capped at rule 2's 96**,
because the bar's height is read off the bar and a reserve added to the bar's own padding
would otherwise raise its own ceiling.

| route | profile | panel | step | bar (its controls) | bar's flow position | leaf ink boxes | widest gap between two inks | tail under the last ink |
|---|---|---|---|---|---|---|---|---|
| `/register/investor` | 360 | 1,314px | 1,272px | 77px (52px) | y=1,156 | 41 | **46.0px** | **15.0px** | |
| `/register/investor` | 390 | 1,274px | 1,232px | 77px (52px) | y=1,116 | 39 | **46.0px** | **15.0px** | |
| `/register/investor` | 414 | 1,248px | 1,206px | 77px (52px) | y=1,090 | 38 | **46.0px** | **15.0px** | |
| `/register/resident` | 390 | 1,274px | 1,232px | 77px (52px) | y=1,116 | 39 | **46.0px** | **15.0px** | |

The widest gap is the one before the bar's button: the disclosure's foot, the bar's
`mt-4` and its own top padding. **Mutation:** the brief's own mutation, `pb-[200px]` on
`.registration-actions`, **does not apply below `lg`**: the bar's padding is set by an
unlayered rule inside `@media (max-width: 1023px)` in `src/styles.css`, which beats a
layered Tailwind utility, so the bar stays 77px and the reading is unchanged. That is a
fact about the mutation, not a pass. With `pb-[200px]!` the bar is 265px, the reading is
"233px of the step's flow ... before "Already registered? Sign in", carries no ink, over
the ceiling of 96px", **FAILED: 1**; uncapped, the ceiling would have been 281px and it
would have passed. Re-run in the fix pass 490c at 360, 390 and 414 with the raw output
committed (`docs/wave490/mutations.txt`, 3a): **FAILED: 3**, 233px at each width, and
PASSED with 46.0px and 15.0px once the class was taken out and the tree rebuilt.

**The base reads the same as the head here, which is what "not a defect" means.**
`docs/wave490/before.txt:160`, `:162` and `:165`: on `f61b3b8` at 360, 390 and 414 the
widest gap between two inks is **46.0px** and the tail **15.0px**, with the panel 3px
shorter than the head's (1,271px against 1,274 at 390).

The form is 999px tall inside a step of 1,229 at 390, which are the brief's own figures and
are correct. **The reserve is the bar's height once**, its own `mt-4` and the sign-in
line's `mt-5`, which is 113px of flow between the disclosure and "Already registered? Sign
in" and is exactly what a sticky bar that occupies its own space costs. There is no second
reserve and no `min-h` on the account step (`min-height: 0px`, measured).

**And the second reading is what a phone actually shows.** Three REAL viewports per width,
at scrollY 0, half way and the foot of the page, with rule 2's empty-run scan over the
card in each one:

| route | 360 | 390 | 414 |
|---|---|---|---|
| `/register/investor` | **0px** | **0px** | **0px** |
| `/register/resident` | **0px** | **0px** | **0px** |

(Read with rule 2 as the fix pass rewrote it, so a run at the card's edge or its last
visible row counts too.)

Nothing changed, and nothing should have.

### Item 12 · The footer's three Verify links

**Before.** `src/components/site-footer.tsx:394` renders the three as
`a.inline-flex.items-baseline.gap-0.5`. On a desktop they are genuinely a link inside a run
of text, which is the exemption 414's target audit grants. Below `lg` the reference line
runs at 15px, wraps, and the link ends up ALONE on the last line, where it is a 24px-tall
target with nothing else on the row to press.

Measured at 390 on every route: **139.4 x 24, 180.7 x 24 and 278.9 x 24**. Across all 14
routes and all 6 profiles: **252 readings, 143 of them under 44**.

**The change.** `max-lg:min-h-11 max-lg:items-center` on the three. `max-lg:` only, so the
desktop line is not pushed apart by a 44px inline box it does not need.

**And the exemption rule now reads:** an inline anchor inside a run of text is exempt only
where it is ACTUALLY in a run of text, which means some of its parent's other ink shares
its line box. Measured off Ranges over the sibling text nodes rather than off the parent's
box, because the parent's box is the whole paragraph. 414's rule was the first half of that
sentence and this is the second.

**After: 252 readings, 0 under 44.**

**And the rule is wave 414's own now (FIX 8).** The re-check found it lived only in
`scripts/wave490-phone.py` while `scripts/wave414-mobile.py` still exempted the three
links. `inRunOfText` in wave 414 now asks both halves: the host holds more text than the
link, AND some of the host's other ink shares a line box with the link (`sharesALine`,
Ranges over the host's other text nodes). The three Verify links are measured as targets
and pass. Exempt as inline-in-text across wave 414's 70 shots: **225 under the old rule
at `ee833f3`, 59 at the code head.**

**The tighter rule found three more links of the same shape**, each a sentence-final link
that wraps onto a line of its own below `lg`: "Find a home →" on `/solutions` at 667x375
(108.11 x 19), "Read the Privacy Policy" on `/contact` at 667x375 (169.36 x 19), and the
Companies House register link on `/legal` at 768 and 667x375 (368.61 x 24.38). Eight
readings, all fixed as item 12 was and below `lg` only: `max-lg:min-h-11
max-lg:items-center`, with `max-lg:inline-flex` on the two plain inline links
(`src/routes/solutions.tsx:329`, `src/components/contact/enquiry-form.tsx:486`,
`src/routes/legal.tsx:177`). No string changed; the three routes pair at 1280 on **0
device px**.

**One reading is reported and not asserted.** At 1280 the three links ALSO stand on their
own line inside the footer's three-column grid (208.3 x 15.1 for the FCA one), because the
cards are narrow there too. Rule 6 is a phone rule and rule 8 says the desktop does not
move, so the desktop reading is printed by the gate and carried to Callum as proposal 2.

### Item 13 · Landscape and tablet · NOTHING BROKE

Every route re-shot at 667x375 and at 768: **28 shots**, and the assertions of items 1 to
12 hold at both. The one thing 414 never asked was whether the register journey's first
field is reachable in landscape with the keyboard up, so the viewport is cut to 300 (a
landscape phone with a keyboard open) and the field is focused and scrolled to:

| route | step | field | box | header ends | bar starts | viewport | verdict |
|---|---|---|---|---|---|---|---|
| `/register/investor` | 1 | `email` | 150 to 206 | 56 | 223 | 300 | **fully visible, clear of the bar** |
| `/register/investor` | 2 | `preferred_regions` | 96 to 176 | 56 | 223 | 300 | **fully visible, clear of the bar** |
| `/register/resident` | 1 | `email` | 150 to 206 | 56 | 223 | 300 | **fully visible, clear of the bar** |
| `/register/resident` | 2 | `who_for` | 96 to 176 | 56 | 223 | 300 | **fully visible, clear of the bar** |

The wave 490 probe printed where the bar started and asserted nothing about it, and read
step 1 only (MINOR 5). It now fails when the field's bottom is below the bar's top, and it
completes the account step against a local stub of the registration endpoint (wave 414's
own) to read step 2. Mutation, `pt-[120px]!` on the account step's bar: "bar starts 138"
over a field ending at 206 on both routes, **FAILED: 2**, while the visibility half alone
still said "fully visible" (FIX 10).

---

## 3. The type-floor sweep

Wave 414 gave every `p`, `li`, `input`, `select` and `textarea` on the site a floor, and
it sorted them by LENGTH: 60 characters or more of rendered text is body at 15px, anything
under it is a label at 12px, which is the smallest size the brand system declares. That
rule is defended at length in `docs/WAVE414_REPORT.md` and it is right about the elements
it was written for.

**It is blind to a run INSIDE one of them.** A `span` carries its own `font-size`, and the
home page's three problem bullets are 12.5px spans inside 15px list items: every reading
the old gate took on that list was of the `li`.

### The rule this wave adds, as four shapes rather than a list of selectors

| shape | test | floor |
|---|---|---|
| **a control's own name** | the run is the whole of the accessible name of the `a`, `button`, `summary` or `label` it sits in, with any `sr-only` tail taken off first | 12px, and rule 6's 44px target is what actually governs it |
| **an eyebrow** | `text-transform: uppercase` and letter-spacing at or above 0.1em | 12px, the size `CLAUDE.md` declares |
| **a caption** | inside a `figcaption`, or carrying `source-line` or `caption` in a class | 13px |
| **mono** | set in JetBrains Mono: a reference, a badge | 12px |
| **body** | everything else inside a `p`, `li` or `article` that is a CLAUSE: 20 characters or more with a space in it | **15px** |

Under 20 characters, or with no space, is a figure or a word somebody scans ("111",
"Media", "Legal") and it answers to the 12px label floor.

**A run that is one of SEVERAL inside a control is copy inside a control, not the
control's name.** The flip bar's "The same picture, joined up." is a sentence that happens
to sit on a button, and it gets the body floor; "Our Services" is the whole of a link and
does not.

### Every utility the wave moved, by file and line at the code head

The wave 490 table stopped short: the re-check found eleven changed utilities it did not
list (MINOR 2), and the fix pass floored two more. All of them are here.

| file and line | before | after | what it is |
|---|---|---|---|
| `src/components/about/director-card.tsx:148` | `text-[12.5px]` | `+ max-lg:text-[15px]` | the role line under a portrait |
| `src/components/about/director-card.tsx:153` | `text-[12px] leading-[1.4]` | `+ max-lg:text-[15px] max-lg:leading-[1.6]` | the credential list |
| `src/components/about/director-card.tsx:211` | `text-[12px] leading-[1.45]` | `+ max-lg:text-[15px] max-lg:leading-[1.6]` | a credential line |
| `src/components/about/director-card.tsx:204` | `text-[13px]` | `+ max-lg:text-[15px]` | the biography |
| `src/components/about/director-card.tsx:266` | `text-[12px] leading-snug` | `+ max-lg:text-[15px] max-lg:leading-[1.6]` | the row variant's blurb |
| `src/components/about/director-card.tsx:355` | `text-[13px]` | `+ max-lg:text-[15px]` | the lead variant's biography |
| `src/components/about/director-card.tsx:366` | `text-[12px] leading-[1.45]` | `+ max-lg:text-[15px] max-lg:leading-[1.6]` | the lead variant's credentials |
| `src/components/home/hero.tsx:338` | `text-[13px] leading-[1.4]` | `+ max-lg:text-[15px] max-lg:leading-[1.6]` | the ten role tiles' descriptors |
| `src/components/register/role-picker.tsx:60` | `text-[14px]` | `+ max-lg:text-[15px]` | the same ten on `/register` |
| `src/routes/solutions.tsx:143` | `text-[13px]` | `+ max-lg:text-[15px]` | the rail's detail line |
| `src/routes/index.tsx:173` | `text-[12px] leading-snug` | `+ max-lg:text-[15px] max-lg:leading-[1.6]` | the three stat labels |
| `src/routes/platform.tsx:752` | `text-[13px]` | `+ max-lg:text-[15px]` | the character card's status chip |
| `src/components/partners/partners-hub.tsx:158` | `text-[11px] max-lg:text-[12px]` | `max-lg:text-[15px]` | a partner card's outcome line |
| `src/components/partners/partners-hub.tsx:288`, `:291`, `:294` | `text-[11px] max-lg:text-[12px]` | `max-lg:text-[15px]` | the three hub legend lines |
| `src/components/partners/partner-page.tsx:574` | `text-[13px]` | `+ max-lg:text-[15px]` | the platform stack's line under each tool |
| `src/components/register/registration-flow.tsx:590` | `text-sm` | `+ max-lg:text-[15px]` | the password hint (14px, outside the 10 to 13.5 range, a body run all the same) |
| `src/routes/solutions.tsx:285` | `text-[13px]` | `+ max-lg:text-[15px]` | the rail's item detail |
| `src/routes/platform.tsx:481` | `text-[12px]` | `+ max-lg:text-[15px]` | the sourced ticker's label, stacked below `md` |
| `src/routes/platform.tsx:975` | `text-[13px] sm:text-[14px]` | `max-lg:text-[15px] lg:text-[14px]` | the LivingComic speech bubble |
| `src/routes/platform.tsx:1024` | `text-[12.5px]` | `+ max-lg:text-[15px]` | the closing call's `ctaNote` |
| `src/components/site-header.tsx:355` | `text-[12px]` | `+ max-lg:text-[15px]` | **fix pass (FIX 12).** The note in the desktop Partners dropdown, rendered from `xl` only, so the floor never paints; floored so the sweep carries no unexplained body run |
| `src/components/ui/empty-slot.tsx:37` | `text-[12px]` | `+ max-lg:text-[15px]` | **fix pass (FIX 12).** `EmptySlot` has no importer in `src`, so no route renders it; floored for the same reason |

and six more that are captions rather than body and take 13 rather than 15:

| file and line | before | after |
|---|---|---|
| `src/components/home/mission-solution.tsx:516` | `text-[11.5px] max-lg:text-[12px]` | `max-lg:text-[13px]` |
| `src/routes/platform.tsx:469` | `text-[10px] max-lg:text-[12px]` | `max-lg:text-[13px]` |
| `src/routes/platform.tsx:855` | `text-[12px]` | `+ max-lg:text-[13px]` |
| `src/components/home/mission-solution.tsx:368` | `text-[12px]` | `+ max-lg:text-[13px]` (the hero tile's basis line) |
| `src/routes/platform.tsx:482` | `text-[10px] max-lg:text-[12px]` | `max-lg:text-[13px]` (the ticker's source line) |
| `src/routes/platform.tsx:672` | `<small>` with no size | `max-lg:text-[13px]` ("Find · Price · Prove") |

plus the two runs the brief names by hand, `src/components/home/mission-solution.tsx:220`
and `:419`, both `text-[12.5px]` to `+ max-lg:text-[15px]`.

### The rest of the sweep, and why each is left

`docs/wave490/typesweep.txt` is the machine-readable list, regenerated at the code head by
one stated method: every `text-[9px]` to `text-[13.5px]` utility in `src` that is not
itself behind a breakpoint prefix, and whether its line carries a `max-lg:`, `max-md:`,
`max-sm:` or `max-xl:` text size. Counted that way on all three trees: **the base
`f61b3b8`, 138 utilities, 61 unfloored; wave 490's `ee833f3`, 137, 41 unfloored; the code
head, 137, 39 unfloored**, the two fewer being the fix pass's two floors. (The wave 490
text said 174 and 133; that count also took each small `max-lg:text-[12px]` floor token as
a utility of its own. The unfloored 41 was right.) Every one of the 39 is one of the
shapes above:

| what | count | lines |
|---|---|---|
| a heading, a title or a role line, set in Barlow or at 600 and above | 15 | `director-card.tsx:202`, `:267`, `:355`; `mission-solution.tsx:150`, `:523`, `:530`; `site-footer.tsx:268`, `:380`; `site-header.tsx:372`; `about.tsx:429`; `contact.tsx:220`; `platform.tsx:376`, `:408`, `:704`, `:960` |
| a control's own name: a link, a link list or a button | 14 | `mission-solution.tsx:449`; `site-footer.tsx:260`, `:285`, `:314`, `:331`, `:350`, `:365`, `:466`; `site-header.tsx:391`; `contact.tsx:210`, `:238`; `legal.tsx:235`, `:280`; `platform.tsx:613` |
| a validation alert with `role="alert"` | 3 | `enquiry-form.tsx:124`, `:493`; `waitlist-form.tsx:276` |
| a field's help line, already at 13px | 3 | `waitlist-form.tsx:552`, `:569`, `:587` |
| a mono reference or a tabular numeral | 3 | `partner-page.tsx:562`, `section-rail.tsx:36`, `legal.tsx:222` |
| an `aria-hidden` arrow | 1 | `site-header.tsx:686` |

(The wave 490 version of this table summed to 46 against the 41 it was classifying. This
one is classified line by line from `typesweep.txt` at the code head and sums to 39.)

**One asymmetry is left standing, and it is between the two gates, not inside this one.**
Wave 490's scan was widened (section 8) to every element that renders text of its own, so
a `<p>` is on the clause rule in `scripts/wave490-phone.py` just as a `<span>` is. Wave
414's own type assertion still sorts a `p` or `li` by length, 60 characters being the line
between body and label. The two agree at the code head (0 under floor in each), but only
this wave's gate would catch a 45-character body `<p>` at 13px. Section 9, proposal 5.
(The wave 490 text put the asymmetry inside this wave's rule; that was written before the
scan was widened, and was not true of the gate as committed.)


---

## 4. The gate, at the code head, on a frozen tree

**Code head `9752c60`.** Before the run `git status --porcelain` carried nothing but
`src/routeTree.gen.ts`, a generated file whose CONTENT diff is the empty blob (the build
rewrites it with LF while the worktree is checked out with `core.autocrlf=true`, so git
reports a modification with no bytes in it). `git diff | git hash-object --stdin` was
**`e69de29bb2d1d6434b8b29ae775ad8c2e48c5391` before and `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391` after** the whole gate, so nothing under
`src` or `scripts` moved while it ran. Every figure in this section and in section 5 is
from that run. Section 6's Lighthouse runs were taken at `8b95f48`, whose source differs
from the code head only by `9752c60`'s line wrap of one JSX conditional, which compiles to
the same output.

| Gate | Command | Exit | Numbers |
|---|---|---|---|
| Lint, changed files | `bunx eslint` on the changed lintable files, LF-normalised | **0** | **0 errors, 0 warnings** over the 17 changed lintable files in `src` (the changed scripts are Python). `src/styles.css` has no matching configuration, as every CSS file in this repo |
| Lint, whole tree, this head | `bunx eslint .` on an LF-normalised `git archive` of the code head | **0** | **432 errors / 15 warnings** |
| Lint, whole tree, the base | the same, on `origin/main` `f61b3b8` | **0** | **432 errors / 15 warnings. DELTA ZERO** |
| Typecheck | `bunx tsc --noEmit` | **0** | **0 errors** |
| Build | `STATIC_BUILD=true bun run build` | **0** | **36 pages prerendered** |
| Postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | trimmed 565 characters of duplicated tail from `/contact` (section 4.1) |
| **Wave 490's gate** | `python scripts/wave490-phone.py` | **0** | **84 shots. 0 runs over 96px with edge and last-row runs counted** (10 one-screen centring runs on the 404 read and not failed, proposal 14). **9,261 span type nodes, 0 under floor; 145 runs in the open drawer, 0 under floor. 252 Verify readings, 0 under 44. 48 cards, 0 with a tail over 32px. 54 pills, 0 splitting a verb. 4 peek readings, 0 under the ink floor. 0 fixed-layer clashes.** Item 1 LOADED: 4 of 4, 3 of 3, 9 of 9 on screen and 36 of 36 in the lane at 390, 360, 1280 (COLD printed as findings). Item 11: widest gap 46.0px, tail 15.0px. Item 2 under reduced motion: 1,355 then 1,566px. Item 3: 16 landings, worst 0.50px off start; 12 clip readings, 0px cut; mask on 7 long frames of 1,293, off 16 of 1,310. Item 7: the caption names 1 dialog and no group. Item 13: four fields, all clear of the bar. **14 routes paired at 1280: 12 at 0 device px, `/` and `/platform` at 0 beyond their own noise.** PASSED |
| `git diff origin/main...HEAD -- src/content` | | | **EMPTY** |
| U+2014 and U+2013 on added lines, `src` and `scripts` | `git diff origin/main...HEAD -- src scripts` | | **0 and 0** |
| U+2014 and U+2013 on added lines, everywhere | `git diff origin/main...HEAD` | | **39 U+2014 and 28 U+2013** at the final head (30 and 18 at `ce157b4`; the fix pass 490c added the second copy of the base log, `before-first-pass.txt`, which carries the 19 the old `before.txt` did, and the re-run `before.txt` carries 19 of its own). Every one is on an added line of a log under `docs/wave490/` (`before.txt` 19, `before-first-pass.txt` 19, `base-412.txt` 14, `gate-412.txt` 14, `gate.txt` 1), and every one is a verbatim quote of text the site already ships, printed by a gate that is reading it: the year ranges in the source credits, the product capture's caption, the three portal buttons' existing `aria-label`s and a handful of sentences of existing copy. None is in `src`, `scripts` or this report. (Wave 490 wrote "0" here without the scope; the re-check counted 30 and 18. MINOR 1) |
| Hex on added lines under `src` | | | **2, both `#000`**, and both are the alpha channel of the hero strip's mask gradient in `src/styles.css`, which is the same literal `.logo-marquee`'s own mask has used since wave 412. A mask is not a colour anybody sees |
| New user-facing strings | | | **one: `aria-label="Close"`** on the capture dialog's icon-only close control, which is the single case the canon allows. The word already ships in `src/components/ui/dialog.tsx:49`. The fix pass added none |

### 4.1 The postbuild step, and the run that found it was missing

`node scripts/pages-postbuild.mjs dist/client` trims a duplicated document tail from
`/contact`. It is **not deterministic**: across the eight builds this wave made, it
trimmed 1,677, 2,242, 230 and 0 characters on different runs of the same source.

Two of this wave's runs skipped it, and the 1280 pairing is what found out: `/contact`
came out **53 CSS pixels taller** than the base, the top 2,873 rows were pixel-identical,
and the extra 53 rows at the foot were raw script text rendering as page content
(`...lastMatchId:"contactcontact"})($R["tsr"]);$_TSR.e()...`). It is a build artefact
rather than a change, the postbuild exists for it, and **every figure quoted in this
report comes from a build that had the postbuild run on it.**

### 4.2 Two readings that this wave chose and should be read as choices

**The shots are taken at one device pixel per CSS pixel.** Every measurement in this
gate is in CSS pixels, so a 2x capture answers them by doubling and halving; what it also
does is write a 40MB PNG per route, and eighty-four of those read straight back is the
single largest cost in the run. On a machine with a gigabyte of RAM free that cost turned
a four-second shot into a two-minute one: the run took **3.5 hours at 2x and 6 minutes at
1x**, for identical readings. The site is still EMULATED as a touch device, which is what
puts the `hover: none` and `pointer: coarse` arms under test; this is the shutter's
resolution and nothing else.

**And the browser is relaunched per route.** Eighty-four contexts through one Chromium
leaves it holding every page it has rendered, and the readings drift with it.

### 4.3 Rule 8 at 1280, and the two routes that needed a second look

The first run of the final gate failed rule 8 on two routes, and neither was this wave's
code:

- **`/contact`, 694 device px in the header.** The head build had prerendered `/contact` as
  the Media enquiry variant and the before set was shot on a Support build, so the two
  shots were of different pages (proposal 15), and the active "Contact Us" label hydrated
  orange on one and navy on the other. The prerendered nav markup is byte-identical in
  both. The gate script now reads which variant each head build produced and rebuilds
  until it matches the before set's, and records every attempt:
  at `9752c60` it took **five builds** (Investor enquiry, Media, Investor enquiry, Media, Support), the gate ran on the fifth, and `/contact` then paired at **0 device px** (`docs/wave490/gate-lint.txt`).
- **`/platform`, 49 device px** scattered over the three character portals, invisible side
  by side. Two shots of the SAME base build taken in two browser launches differ by
  **68,672 device px** over the same portals, so the pairing's same-launch control
  (0 px of noise that run) under-measured the page's own noise there. The final run's
  reading is in the table above.

## 5. The six earlier gates, re-run whole at the code head

Re-run in the fix pass at `9752c60`, on the frozen tree of section 4. **The wave 490
row for wave 412 said "exit 0 ... every assertion passed" over a log that ended "4
FAILURE(S)"**: the log predated `6b61aa3`, and three of its four failures were the flip bar
at 390 that `6b61aa3` fixed. The re-check made it MAJOR 2. The log committed now is this
head's run.

| Gate | Exit | Numbers |
|---|---|---|
| `python scripts/wave412-screenshots.py` | **0** | **28 shots, All assertions passed.** 275 axe INCOMPLETE colour-contrast nodes, **274 measured off the pixels, 0 unmeasured, 1 off screen** (the hero strip's second caption at 390, ruling C). The flip bar at 390: **5.21:1** on all three lines (4.83, 4.68 and 5.05:1 at 1280). Darkest raw: home @ 1280 **23.08%** (ratchet 23.70%). Darkest ground: home @ 1280 **8.17%** (flat ceiling 15%) |
| `python scripts/wave413-motion.py` | **0** | every route at 1280 and 390 plus all seven standalone probes, All assertions passed. The magic line reads 66.28px against a link of 66.28px at the top and scrolled |
| `python scripts/wave414-mobile.py` | **1** | **70 shots. 6,018 targets** (3,009 at the top and 3,009 scrolled, more than wave 490's 5,686 because links that stand alone are no longer exempt), **0 under 44x44, 0 closer than 8px**. Exempt as inline-in-text: **59** (225 under the old rule). **5,270 type nodes, 0 under their floor**, 0 under a 1.6 line box, 0 under 30 characters to the line at 360. **660 headings, 0 breaking a word. 0 fixed layers** on any profile (ruling A). 0 serious or critical axe violations. 0 shots overflow. **13 FAILURES, every one the header lockup at 768, identical on the base build.** Section 5.1 |
| `python scripts/wave421-hero-and-footer.py` | **0** | **401 pairs measured**, every pair resolved on every shot, 16 variant readings, 13 under-served images, 26 dividers read; its one off-screen node is the same hero caption at 390 (ruling C). All assertions passed |
| `python scripts/wave415-zoopla-purple.py` | **0** | the Zoopla ink mark regenerated **31,516 bytes from 31,516**, `git status public/` clean: byte-identical |
| `node scripts/wave443-contrast.mjs --build dist/client` | **0** | **29 pairs, 0 failures, 0 retired-hex hits in source, 0 in the build** |
| `python scripts/wave414-responsive-images.py --check` | **0** | every referenced image has the variants it should have; **24 alpha-bearing sources, every variant of them still carries alpha** |

**275, not 274, and the log's own summary line is why the report said 274 (fix pass 490c,
rel490b MINOR 6).** `docs/wave490/gate-412.txt:307` reads "INCOMPLETE nodes: 274 across 28
shots, 274 measured off the pixels, 0 unmeasured; 1 off screen". The per-shot counts above
it sum to **275**, and both are right about different things: `scripts/wave412-screenshots.py`
stores each shot's tally as the nodes axe returned MINUS the ones in the off-screen bucket
(`len(axe_result["incomplete"]) - len(off_screen)`, line 1169), and the summary adds up
that column. So axe returned **275** INCOMPLETE nodes across the 28 shots; **274** of them
were on screen and every one of those was measured off the pixels; **1** was the hero
caption off screen at 390. The summary's first figure is the on-screen count under a label
that reads like the total. The report now says 275, 274 and 1; the log is left as the
gate printed it.

### 5.1 The one red gate, and it is not this wave's

`scripts/wave414-mobile.py` returns 13 failures. All thirteen are the same sentence on
thirteen routes:

> the `<header>` lockup's box reads **0.794** of relative luminance on a white ground
> (0.972), under the **0.80** floor.

**It happens at 768 and at no other profile.** At 360, 390, 414 and 667x375 the same
file, `logo-lockup-400.webp`, reads **0.803** in a 118 by 44 box; at 768 the header takes
its `sm` height and the mark renders in a 140 by 52 box, where resampling the same 400px
source lands the mean six thousandths lower.

**The same gate, run against a build of `origin/main` `f61b3b8`, returns the identical 13
failures at 768** (`docs/wave490/base-414.txt`, which is the 768 run and only that).
Nothing in this branch touches the header, the lockup or the responsive pipeline.

**At 360 the lockup reads 0.803 on the base build and at the code head alike, so neither
has a lockup failure at 360.** The base build's 360 run (`docs/wave490/base-414-360.txt`,
run in the fix pass because the wave 490 text claimed a 360 base reading that no log held,
MINOR 10) does fail, 78 times, and every one of the 78 is a Verify link: the three Verify
links on all 13 routes, at the top and scrolled. That is item 12's defect, caught on the
base by the rule FIX 8 put into wave 414; the code head reads 0 of them.

It is a wave 443 regression: the Brand Kit v4 recolour moved the artwork's own luminance
and wave 443 did not re-run this gate. The floor was calibrated in wave 414b against the
v3 palette, where the mark read 0.822, with the defect it exists to catch reading 0.19.
**The second form of the same rule passes comfortably**: the mark is 0.972 - 0.794 =
**0.178 darker than its ground**, against a ceiling of 0.30, and a flattened plate is
0.65 darker.

**This wave did not touch it, and says so rather than moving the floor.** Lowering a
floor to make a red gate green is the move this repo's canon exists to prevent. It is
proposal 10, with the two honest fixes: lighten the artwork, or recalibrate the floor to
the v4 palette with the arithmetic written down.

**So the gate is NOT GREEN, and this is the sentence that says so.** Thirteen failures,
all pre-existing, all proved pre-existing by running the same instrument against the base
build, and none of them in a surface this wave touched.

## 6. Lighthouse mobile, before and after

**Rewritten in the fix pass (FIX 11, MINOR 6).** Wave 490 took one run per route per build,
on a machine running two other waves, and read /platform's LCP as 4.6 to 5.4s and
/register/investor's as 3.6 to 4.2s with nothing in the diff to explain either, and
/about's best practices as 100 to 96 without naming the audit. `scripts/wave490-perf.py`
now runs Lighthouse 13 mobile **five times per route per build** and reports the median of
each metric; every run is in `docs/wave490/lighthouse.txt` and the median run's report is
kept as `docs/wave490/lh-{before,after}-*.json`.

**The failing best-practices audit was `errors-in-console`, and it was the test server.** A
first five-run batch failed it in 13 of 40 runs across BOTH builds, and every one of those
console errors was `net::ERR_CONNECTION_REFUSED` on a font or a script chunk: the server
borrowed from wave 414 is a single-threaded `socketserver.TCPServer` with a listen backlog
of 5, and Lighthouse opens more connections than that at once. The script now carries its
own server, threaded with a backlog of 128 and the same gzip rule, and on it **best
practices is 100 on all forty runs**. Nothing on the site logs an error.

Medians of five, `before` = `origin/main` `f61b3b8`, `after` = the code head:

| Route | | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Transferred |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | before | 66 | 100 | **100** | 100 | 3,613ms | 6,326ms | 153ms | **0** | 962 KiB |
| `/` | after | 65 | 100 | **100** | 100 | 3,638ms | 6,361ms | 151ms | **0** | **955 KiB** |
| `/platform` | before | 77 | 100 | **100** | 92 | 2,772ms | 5,014ms | 2ms | **0** | 763 KiB |
| `/platform` | after | 78 | 100 | **100** | 92 | 2,773ms | **4,768ms** | 1ms | **0** | 767 KiB |
| `/register/investor` | before | 81 | 100 | **100** | 92 | 3,024ms | 4,147ms | 5ms | **0** | 479 KiB |
| `/register/investor` | after | 80 | 100 | **100** | 92 | 3,124ms | 4,239ms | 5ms | **0** | 480 KiB |
| `/about` | before | 78 | 98 | **100** | 92 | 3,021ms | 4,627ms | 0ms | **0** | 693 KiB |
| `/about` | after | 78 | 98 | **100** | 92 | 2,927ms | 4,569ms | 2ms | **0** | 694 KiB |

**No median LCP regression over 200ms on `/platform` (minus 246ms) or `/register/investor`
(plus 92ms)**, so the brief's "find its cause" has nothing to find there; the single-run
readings of wave 490 were the spread of one run. The home page moves by 35ms, which is
inside its own run-to-run spread of 6,315 to 6,400ms on the base.

**It did find one cause, in this pass's own change.** With the first nine crests at
`fetchpriority="high"` (commit `62dba1d`, item 1) the home page's median LCP read
**6,654ms**, and the same head with every tile at `low` read 6,353ms: that change cost the
hero photograph 300ms and was taken back in `76eba85` before the after-runs above.

**That batch was not logged (fix pass 490c, rel490b MINOR 1).** The two medians above, and
the five runs a side behind them, are not in `docs/wave490/lighthouse.txt`, which holds
only the before and after batches in the table. The fix pass 490c looked for the output in
the worktree, in its temporary files and in the operator's working notes and did not find
it. So the rollback in `76eba85` rests on the two figures stated here and in that commit,
and not on a committed log. The rollback itself costs nothing to trust: the after batch
above, which is logged, is the state it left, and it reads 6,361ms on the home page
against 6,326ms on the base.

**THE TWO WEIGHTS THE BRIEF ASKS FOR: the home page is 962 KiB before and 955 KiB after.**
It got LIGHTER, by 7 KiB, while gaining eighteen eagerly-fetched council crests weighing
**73,714 bytes**, because item 2 took the solution face's `trio-wave.webp`, a 144 KB lazy
image, into a subtree that is `display: none` below `md`.

**The deterministic figure:** the whole built asset directory is **2,210.6 KiB before and 2,222.1 KiB after, +11.5 KiB**: the Radix dialog item 7 pulls in (+11.3 KiB in wave 490), and 0.2 KiB of this pass's class and markup changes.

## 7. The mutation checks

**The strongest one was run first and covers ten assertions at once.** The baseline run
(`python scripts/wave490-phone.py --build <a build of f61b3b8> --mode before`) is every
fix in this wave reverted simultaneously, against the same instrument, and it reads as
below. The base column is quoted from `docs/wave490/before.txt`, re-run in the fix pass
490c with the script as it stands at the code head, and the last column is its line:

| assertion | base | head | `before.txt` |
|---|---|---|---|
| item 1, the whole lane decoded 1.5s after the strip is seen, 390, slow 4G, LOADED (the fix pass's instrument) | **4 of 36** | **36 of 36** | 229, 230 |
| rule 2, runs over 96px with edges and last rows counted, home at 360/390/414 | **3** (280, 301, 279px) | **0** | 298, 301, 321, 341 |
| item 2, the tail under the visible face at 390 | **297.6px** | **47.4px** | 9 |
| item 2, the swap under reduced motion at 390 | 1,559px throughout, **fails** | 1,355 then 1,566px | 250, 251, 926 |
| item 3, the peeking headline's share of its ground at 390 | **0.177** | **0.833** | 12 |
| item 4, span type nodes under floor | **350 of 9,297** | **0 of 9,261** | 298 |
| item 5, the ticker at 390 | 6 items, 3 clones, 1 animation, **17 runs outside the viewport** | 3 items, 0 clones, 0 animations, **0 outside** | 103 |
| item 6, the character over the copy at 390 | **3 text clashes**, outside the padding box | **0 clashes**, inside it | 104 |
| item 7, a control that opens the capture | **none** | 348 x 187.4, dialog named, axe 0 | 247, 248 |
| item 8, fixed-layer clashes over the run | **86** | **0** | 298 |
| item 9, card tails over 32px | **16 of 48** | **0 of 48** | 298 |
| item 10, pills with the verb beside a wrapped role | **2** | **0** | 298 |
| item 11, widest gap between two inks at 390 (not a defect) | 46.0px | 46.0px | 162 |
| item 12, Verify readings under 44 | **143 of 252** | **0 of 252** | 298 |

(Item 8 read **85** in the wave 490 text, off `docs/wave490/before-first-pass.txt:239`,
and reads **86** on the same base now. The item 8 count is the same code in both scripts
(`git diff ee833f3 9752c60 -- scripts/wave490-phone.py` changes only its summary's
punctuation), and the one extra is a single reading: on `/solutions` at 390 the left-hand
control landed on "Property Finder" (`before.txt:129` and `:625`), where the first pass
read 0 clashes. It is run-to-run variation in where the page sits after two viewports of
scroll, on the base, and it does not touch the head's 0.)

**And two single-fix mutations, to show the method rather than the aggregate.** Each
reverted one change, rebuilt, ran the gate on one route, and was restored:

| mutation | result |
|---|---|
| the `.hero-band` mask deleted from `src/styles.css`, rebuilt | `item3 home @ 390 strip mask=none ... share=0.176`, **FAILED: 1** |
| `md:min-h-[356px]` put back to `min-h-[356px]`, rebuilt | `worst tail under any content=46px`, **FAILED: 2** (two director cards) |

Both restored; `git diff -- src` was empty afterwards and the tree hash before and after
the final gate is the same empty blob.

### 7.2 The fix pass's mutations, one per new or rebuilt assertion

Each was run in a scratch build of the source with one change made, against the committed
gate, and the source was restored and rebuilt afterwards (`git diff HEAD -- src` empty each
time). The commit that carries each assertion quotes its own run. **The three the re-check
rel490b asked to see raw, 3a (FIX 2), 3b (FIX 3) and 3c (FIX 4), were run again in the fix
pass 490c, and their full output, FAILED with the mutation and PASSED without it, is
`docs/wave490/mutations.txt`**: 3a FAILED: 3 (233px at each of 360, 390 and 414, where the
fix pass 490b recorded FAILED: 1), 3b FAILED: 9 (222 to 223px), 3c FAILED: 1 (1,559px on
both faces), and PASSED on the restored head each time.

| assertion | mutation | result |
|---|---|---|
| FIX 1, wave 412's bucket narrowed | none needed: it is a narrowing | the bucket holds 1 node at the head, on home @ 390 |
| FIX 2, item 11 from leaf inks | `pb-[200px]` on `.registration-actions` | **does not apply below `lg`** (an unlayered rule sets the bar's padding); unchanged, passes |
| | `pb-[200px]!` | **FAILED: 1**, 233px before "Already registered? Sign in"; re-run in 490c at three widths, **FAILED: 3** (`mutations.txt`, 3a) |
| FIX 3, rule 2 with edges | the base build | **3** runs, 280, 301 and 279px, the brief's hole (`before.txt:301`, `:321`, `:341`) |
| | a 200px spacer inside each `/the-problem` section | **FAILED: 9**, 222 to 223px, interior (`mutations.txt`, 3b) |
| FIX 4, the swap changes height | the base build | **FAILED: 1**, 1,559px on both faces (`mutations.txt`, 3c; `before.txt:926`) |
| FIX 5, the LOADED reading | the base build (lazy tiles) | **FAILED: 3**, 32, 32 and 25 of 36 undecoded |
| FIX 8, wave 414's shares-a-line rule | the rule before the three link fixes | **8** target failures, the three links |
| FIX 9, snap, clip | `scroll-snap-type: none` and `max-height: 1.5rem` on the caption | **FAILED: 22** |
| FIX 10, the landscape bar | `pt-[120px]!` on the account step's bar | **FAILED: 2**, bar at 138 over a field ending at 206 |
| FIX 12, the drawer's type | the drawer's ten partner rows at `text-[11px] font-normal` | **FAILED: 10** |
| FIX 13, the caption named once | `aria-labelledby` put back on the scroll group | **FAILED: 1**, `group: 1` |

### 7.1 Two assertions that do NOT bind, named rather than counted

A read-only review of the diff found both, and they are reported here rather than
quietly left in the count.

**Item 10's first half is vacuous, and the script says so where it is written.** The
assertion `verb.getClientRects().length === 1` reads 0 failures on the BASE build at
every width: the verb never split. `whitespace-nowrap` on the verb is therefore asserted
by nothing. It is kept because it is the guard rule 7 asks for against a longer verb, and
the half that binds is the one beside it, which reads 2 on the base and 0 here.

**Item 8's register-route sub-assertion is a tautology in both directions.** It fails
only when the sticky bar is on screen AND the control is present. On the base the bar is
not on screen at the scroll position tested; at this head the control is not rendered
below `lg` at all. It can never fire. The load-bearing assertion for item 8 is the
clash count, which is 85 on the base and 0 here.

## 8. The read-only review, and what it changed

**The fix pass ran no review sub-agent of its own.** Its review is the independent re-check
rel490 (section 0), every finding of which is answered there, and the one place this
section's wave 490 text was wrong (the `start > 0` guard) is corrected below.

One review agent read `git diff origin/main...HEAD` before the gate and was asked three
questions. It returned findings on all three and **four of them changed the branch.**

**1. Did any string change?** It confirmed `src/content` is untouched and that
`aria-label="Close"` is the only authored literal, noting that the word already ships in
`src/components/ui/dialog.tsx:49`. It also noted that the capture's caption is now
rendered a SECOND time as the dialog's `sr-only` title. That is a reuse rather than a new
string, and the second rendering is not heard twice: Radix marks the rest of the document
`aria-hidden` while a modal dialog is open, so the visible `figcaption` is out of the
tree at the moment the title is in it.

**2. Could any touched surface move at 1280?** It cleared every `max-lg:`, `max-md:` and
`@media (max-width: 767px)` change by scope, and named four things that are unscoped:

- the pill's `flex-wrap`, `gap-y-0.5` and `whitespace-nowrap` apply at every width, and
  the claim that the desktop does not move rests on no pill wrapping at 1280. **True, and
  it is a content-dependent argument rather than a scoping one.** It is measured both
  ways: the 1280 pill reads 43px tall on the base and 43px here, and `/solutions` pairs at
  **0 moved pixels against 0 pixels of noise.**
- the character illustration's `block`, `w-auto` and `object-contain` have no `md:`
  counterpart. They are no-ops at 1280 (an absolutely positioned image is blockified,
  `width: auto` is the default, and `object-fit` does nothing when the box already
  matches the ratio), and the 1280 reading is `art=169x280 at (1066,2952) opacity=0.25`
  on both builds.
- `body:has(.drawer-panel) .back-to-top { display: none }` is unscoped, and `:has()`
  matches on presence rather than on visibility. The drawer is `xl:hidden`, so it cannot
  be OPENED at 1280, but a visitor who opens it at 1279 and resizes to 1280 leaves the
  panel mounted and the control hidden until they close it or navigate. **Narrow, real,
  and stated.**
- `loading="eager"` on the crests applies at 1280 too, and the pairing cannot see it
  because `.logo-marquee` is both touched and animated. **True.** The desktop reading is
  in section 2 item 1: 11 of 36 decoded before, 36 of 36 after, 18 requests either way.

It also observed that `TOUCHED` used the bare selectors `figure` and `article`, which
exempt by breadth rather than by measurement. `figure` on `/platform` was **narrowed to
`figure.panel`**, which is the one figure this wave touches. `article` on `/about` is
kept: every `article` on that route IS a director card and every director card is
touched.

**3. Would any new assertion pass with its fix reverted?** It found the two vacuous
assertions in section 7.1, and **one real coverage hole that changed the code**: the span
scan walked only inside `p`, `li` and `article`, and two of the runs the brief names by
hand have no such ancestor, so their fixes were unasserted. The scan now walks every
element that renders text of its own, which brought every card title and source credit
into it, which in turn needed the heading and source-line shapes. **Thirteen more runs
got a floor as a result** and the node count went from 1,519 to 9,261.

It also warned that rule 2's `start > 0` guard means a run reaching a section's last row
is never reported, so the scan no longer sees item 2's hole. **Wave 490 answered that this
was the design. It was wrong to**, and the independent re-check made it MAJOR 3b: a rule
that cannot see the one defect it was written for has never been seen to fail. The fix
pass counts edge and last-row runs, allowing a run at an edge the section's own padding on
that side (summed down the wrappers that sit on that edge), and the scan now reports the
base build's hole at 280, 301 and 279px and fails a 200px interior spacer (FIX 3).


---

## 9. Proposals for Callum, each with a recommended default

Nothing in this section was touched.

**1. The two "OPTION" eyebrows on `/platform` are internal design labels on a public
page.** `src/content/platform.ts` carries them verbatim:

```
eyebrow: "OPTION 4 · CHARACTER PORTALS",
eyebrow: "OPTION 2 · PLATFORM MISSION CONTROL",
```

A visitor reading "OPTION 4" above a section is being shown the inside of a design review.
*Recommended default: delete both eyebrows.* It is a removal and adds no words, so it
needs no copy from anybody. Callum's ruling of 25 September was that they stay this wave
and go in the report as a proposal, and this is that.

**2. The three Verify links are under 44px on the desktop too.** Item 12 raises them below
`lg`, where the reference line wraps and the link stands alone. At 1280 the footer's
registration badges are a three-column grid and the same thing happens inside each card:
measured, "Verify the broker on the FCA register" is **208.3 by 15.1** at 1280 on every
route. Rule 6 is a phone rule and rule 8 says the desktop does not move, so this wave
measured it and stopped. *Recommended default: raise them at every width in a wave that
owns the desktop footer*, which is one class and a re-shoot of fourteen desktop pages.

**3. The "What we do" cards' corner reserve on a phone.** Item 9 measured them and changed
nothing: `pb-[104px]` is not empty, it holds the character illustration, which ends 111px
past the card's padding edge, and rule 2's pixel scan, with edge runs counted, returns 0
runs over 96px on `/about` at every width. What is true is that the character is 68px wide on a 350px card, so the
reserve is filled on the right and open on the left. *Recommended default: keep.* If it
should be tighter on a phone, the change is `max-md:pb-[76px]` beside a `max-md:h-[104px]`
on the artwork, and it needs the pill re-measured against the art at 360 because they
would then be competing for the same 26px.

**4. The sourced-figure ticker stops at `md`; a tablet is still a reader.** Item 5 stacks
the three figures below 768 because that is what the brief asks for. At 768 the lane is
back: measured, **6 items on a 3,546px track with 1 running animation and 16 text runs
outside the viewport**. Rule 4 says a reader must not chase a sourced statistic, and a
tablet reader is a reader. *Recommended default: move the cut from `md` to `lg`.* It is
one media query and one number in `platform.tsx`.

**5. Wave 414's type assertion still sorts a paragraph by length.** Wave 490's gate puts
every run of text, `<p>` included, on the clause rule (15px below `lg` for 20 characters or
more with a space in them); wave 414's own assertion still calls a `p` or `li` under 60
characters a label at 12px. At the code head both read 0 under floor, so nothing on the site
is caught by one and missed by the other today. (The wave 490 text named
`src/routes/solutions.tsx:285` as a 13px body `<p>` that passed. It did not pass: this wave
floored it, `text-[13px] max-lg:text-[15px]`, and the re-check was right to call the
sentence wrong. It also promised a count in section 4 that section 4 never carried.)
*Recommended default: carry the clause rule into `scripts/wave414-mobile.py` in a type
wave, so the older gate cannot pass what the newer one fails.*

**6. The back-to-top control has no phone form (RULING A, assumed 25 September 2026,
pending Callum's word).** This is a removal Callum did not ask for, and it is put to him as
one. Item 8 is the arithmetic: a 44px target cannot stand beside a full-width column in a
20px gutter, so the control is offered from `lg`. *Recommended default: leave it off a
phone.* To restore item 8's original spec (right gutter on the safe area at every width,
hidden while the register bar or the drawer is on screen) is one commit, `git revert
78d44ec`, which applies cleanly at the code head. If Callum wants one, the honest shapes
are a lane reserved for it (`<main>` gets a right padding below `lg` and the column
narrows by 56px, which costs every line on every route) or an inline control at the foot
of each long route, which costs nothing and is reachable only where somebody has already
finished reading. The second is the one to build.

**7. The home hero carries no sentence saying what the company does above the fold on a
phone.** The `h1` is visually hidden and the visible words are the three headlines and
"Register to join the waitlist as". *Recommended default: none this wave.* A one-line
strapline is a new string and that is Callum's to write.

**8. The home stat cards step in from 350 to 309px wide at 390.** Measured and unchanged.
It reads as intended at 390 and tight at 360. *Recommended default: keep.*

**9. The flip bar's DESKTOP gradient is still a text-bearing control filled partly with
orange-500.** Item 8 of section 5 has the measurement: at 390 all three of its lines read
**4.27:1 against a 4.5:1 floor** on a build of `origin/main`, which this wave fixed below
`lg` by ending the gradient at orange-600. At 1280 the same bar passes the gate, because
the lines sit on a darker part of the gradient there, but it is the same composition and
`CLAUDE.md` says the fill of any text-bearing control is orange-600. *Recommended
default: end the gradient at orange-600 at every width in a wave that owns the desktop
home page.* One class, and a re-shoot of one desktop route.

**10. The header lockup reads 0.794 against a 0.80 floor at 768, on `origin/main` and
here alike.** Section 5.1 has the evidence: thirteen identical failures on both builds,
0.803 at every other profile, and the relative form of the same rule passing at 0.178
against a 0.30 ceiling. It is wave 443's recolour meeting a floor calibrated against wave
414's palette. *Recommended default: recalibrate the floor to the v4 palette, with the
arithmetic written into `scripts/wave414-mobile.py` beside it, rather than lighten the
artwork.* The artwork is the approved mark; the floor is a number this repo chose, and it
was chosen when the mark was a different colour. Either way it is a decision this wave
had no mandate to take on its own.


**11. The flip bar below `lg` now ends its gradient at orange-600, not orange-500 (RULING B,
assumed 25 September 2026, pending Callum's word).** A visible change on the home page on a
phone, and it was not in the brief. The three white lines on the bar read **4.27:1 against
a 4.5:1 floor** at 390 on `origin/main`; ending the gradient at orange-600, the brand token
`CLAUDE.md` names as the fill of any text-bearing control, reads **5.21:1** at the code
head. No new colour. *Recommended default: keep*, and proposal 9 carries the same change to
the desktop.

**12. The five data-source logos miss the 1.5s budget on a cold slow 4G load.** Item 1's
finding: 0 to 1 of 5 decoded 1.5s after the grid is seen when a visitor scrolls to it on
the first styled frame, all by +2.0 to +2.75s. Eager at low priority is slower, lazy at
high no faster. *Recommended default: keep them plain lazy*, as the brief allows. The one
change that would meet the budget is to inline the five SVGs (1.3 to 6.4KB each) in the
page, which is a build change for a wave that owns the home page's weight.

**13. A phone visitor who scrolls before the page hydrates is sent back to the top.**
Measured on a cold slow 4G load at 390: scrolled to y=2,639, hydrated at 5,365ms, at
scrollY 0 by 6,257ms. Not the router's `scrollRestoration` flag (a scratch build with it
off does the same). **It is pre-existing**: the base `f61b3b8` goes back to the top the
same way, at 390 and at 1280, two runs each (fix pass 490c, section 0c,
`docs/wave490/hydration-jump.txt`). *Recommended default: a short wave to find the cause*
(the router's initial-load scroll reset is the first suspect) and keep the reader's
position through hydration. No string involved.

**14. The 404 page centres its message in a box a screen tall.** Rule 2's rewritten scan
reads 293 to 341px of ground above and 280 to 328px below the message at 360 to 414, and
prints them rather than failing them, because they are the centring of a one-screen
composition (`flex min-h-screen items-center`), not a band between two pieces of content.
*Recommended default: keep.*

**15. `/contact` is served as whichever enquiry variant the prerender wrote last.** The
build prerenders `/contact?enquiry=waitlist`, `partner`, `demo`, `investor`, `media` and
`support` as well as `/contact`, and all of them write `contact/index.html`. Four builds of
`origin/main` `f61b3b8` in a row produced the **Media** variant once (the Media button
pressed, the deadline field shown, "we reply the same working day where a deadline is
given") and the **Support** variant three times, and five builds of the code head produced
**Investor enquiry, Media, Investor enquiry, Media and Support**; none is the plain contact
page. So a
visitor who types the address, on the live site, gets an enquiry type chosen by a race in
the build, and after hydration the header's "Contact Us" can read orange or navy
depending on which. It is pre-existing, it is the same instability wave 490's section 4.1
met in the postbuild step, and this pass did not touch it. *Recommended default: a short
build wave that writes the query variants somewhere other than `contact/index.html`, or
does not prerender them, so `/contact` is one known page.*
The evidence and the mechanism are set out in the section "A pre-existing build defect this
wave did not cause and does not fix", near the top of this report (fix pass 490c).

**16. The five data-source logos' decode state is now a FINDING, not a failure (fix pass
490c, rel490b MINOR 2).** This is a check that was LOOSENED, and it was loosened without a
ruling. In the wave 490 gate a data logo on screen and not decoded inside 1.5s failed the
run; since the fix pass it is printed as `item1 FINDING` for every reading, cold and loaded
alike, and the whole-lane check is asserted on the council crests only
(`scripts/wave490-phone.py`, the `name == "data" or phase == "cold"` branch of
`logo_probe`). It was taken under the brief's own wording for these five ("plain lazy is
fine, but ... measure it"), and item 1 carries the measurement: 0 to 3 of 5 decoded at +1.5s
on the cold reading, 5 of 5 on the loaded one. The wave 490 script (`ee833f3`) failed a
data logo on screen and undecoded at +1.5s, and failed the whole data row too; the fix pass
kept the reading and dropped the failure. *Recommended default: accept the finding,
and inline the five SVGs (1.3 to 6.4KB each) in a later wave that owns the home page's
weight*, at which point the reading can be asserted again, since an inlined SVG has nothing
to decode over the network.

**17. Three links outside item 12's literal list were given 44px line boxes below `lg`
(fix pass 490c, rel490b MINOR 4).** Item 12 named the footer's three Verify links. FIX 8's
tighter rule in wave 414 found three more of the same shape and the fix pass raised them
the same way, `max-lg:min-h-11 max-lg:items-center`, with `max-lg:inline-flex` on the two
that were plain inline links: `src/components/contact/enquiry-form.tsx:486` ("Read the
Privacy Policy"), `src/routes/legal.tsx:177` (the Companies House register link, already
`inline-flex`) and `src/routes/solutions.tsx:329` ("Find a home"). No string changed, the three routes pair at
**0 device px** at 1280, and on a phone each link now stands in a visible 44px line box
where it used to be a 19 to 24px one. It is a visible change on three routes that the brief
did not list. *Recommended default: accept*, because it is item 12's own fix applied to the
three links item 12's rule, once it was written into wave 414, says are the same defect.

---

## 10. What Cowork should show Callum first

Three routes, three widths, the pairs that carry the wave.

| # | show | at | what he will see |
|---|---|---|---|
| 1 | `docs/screenshots/wave490/before/home-390.png` beside `docs/screenshots/wave490/home-390.png` | **390** | the council crests are crests instead of blank plates, the orange D has gone from the right edge of the hero, and the purpose section ends 47px under its last line instead of 298 |
| 2 | `before/platform-390.png` beside `platform-390.png` | **390** | three sourced statistics standing still in three rows instead of one sliding past cut in half, Petra above the copy at full strength instead of a smudge behind it, and a product capture that opens when you tap it |
| 3 | `before/about-360.png` beside `about-360.png` | **360** | five team cards the height of what is in them, and credential lines at 15px instead of 12 |

And two sentences he should hear with them. **The back-to-top button is gone from phones
and tablets**, because at 390 there is no place to put a 44px circle that is not on top of
a line of text; that is ruling A, assumed pending his word, and `git revert 78d44ec` gives
it back in one commit (proposal 6). **The orange bar on the home page ends in a deeper
orange on a phone**, so its white words pass; that is ruling B (proposal 11).

## 11. The file list

Source (every file `git diff --name-only origin/main...c9d9303 -- src` prints; the fix pass
490c added no file to the list):

- `src/components/about/director-card.tsx`
- `src/components/contact/enquiry-form.tsx` (fix pass, FIX 8)
- `src/components/home/hero.tsx`
- `src/components/home/mission-solution.tsx`
- `src/components/partners/partner-page.tsx`
- `src/components/partners/partners-hub.tsx`
- `src/components/register/registration-flow.tsx`
- `src/components/register/role-picker.tsx`
- `src/components/site-footer.tsx`
- `src/components/site-header.tsx` (fix pass, FIX 12)
- `src/components/ui/back-to-top.tsx`
- `src/components/ui/empty-slot.tsx` (fix pass, FIX 12)
- `src/components/ui/logo-marquee.tsx` (and the fix pass, FIX 5; and one comment in the fix pass 490c, FIX B, `c9d9303`)
- `src/routes/index.tsx`
- `src/routes/legal.tsx` (fix pass, FIX 8)
- `src/routes/platform.tsx` (and the fix pass, FIX 13)
- `src/routes/solutions.tsx` (and the fix pass, FIX 8)
- `src/styles.css`

Scripts and documentation:

- `scripts/wave490-phone.py` (new; rebuilt in places by the fix pass, FIX 2 to 5, 9, 10, 12, 13)
- `scripts/wave490-perf.py` (new; five runs and medians in the fix pass, FIX 11)
- `scripts/wave412-screenshots.py` (an off-screen bucket, narrowed by ruling C to the hero strip below 768, FIX 1)
- `scripts/wave414-mobile.py` (fix pass, FIX 8: the shares-a-line half of the inline exemption)
- `scripts/wave421-hero-and-footer.py` (the orange headline's selector corrected, the same bucket carried through and narrowed)
- `docs/WAVE490_REPORT.md` (this file)
- `docs/wave490/**`: `before.txt` (re-run in the fix pass 490c), `before-first-pass.txt`, `mutations.txt`, `hydration-probe.py` and `hydration-jump.txt`, `contact-variants.txt` (all four new in the fix pass 490c), `gate.txt`, `base-412.txt`, `base-414.txt`, `base-414-360.txt`, `gate-412.txt`, `gate-413.txt`, `gate-414.txt`, `gate-415.txt`, `gate-421.txt`, `gate-443.json`, `gate-lint.txt`, `lighthouse.txt`, `typesweep.txt` and the eight median Lighthouse reports
- `docs/screenshots/wave490/**` and `docs/screenshots/wave490/before/**`
- `.gitignore` (one line, `docs/screenshots/wave490/control/`)

**No `src/content` file. No `src/routeTree.gen.ts`. No platform file. No new colour and no
hex in a component.**
