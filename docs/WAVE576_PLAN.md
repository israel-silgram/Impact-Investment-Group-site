# Wave 576 plan: the site says ten per cent goes to Metro World Child UK

Base `origin/main` `73fcf6f` (wave 567's head). Branch
`feat/wave576-the-site-says-ten-percent-goes-to-metro-world-child`. Claimed by commit
`b51d4c5` (which carries this plan; it is not empty) before the first edit of `src`; no other `feat/wave576*` on the site or platform remote, no
`docs/WAVE576*` on the site's `origin/main`, no queue row 576.

Callum's sentence ships verbatim, from one constant, in `src/content/charity.ts`. It is
not a PROPOSAL.

## Work

- W1. `src/content/charity.ts` (new): the `charityPledge` export. Only file in `src` that
  holds the charity's name.
- W2. `src/components/site-footer.tsx`: one `<p>` in the legal band, between the legal
  links and `legalNotice`, every route including the register pages.
- W3. `src/routes/index.tsx`: a cream band between `<MissionSolution />` and
  `<CouncilPanel />`, the sentence alone, Barlow 700, no new link, font, image or CSS.
- W4. `src/content/about.ts`: `summaries.whoWeAre` gains a third line. `about.tsx`
  unchanged.

## Tests

`scripts/wave576-charity.py` in the shape of `wave567-copy.py`: constant, single-source
check, per-page footer counts, hydrated readings at 1280 and 390, home LCP and preloads
against the base record, arms `a1` (drops the full stop) and `a2` (types the sentence into
the footer), each expected to exit 1. Red run on a detached build of `73fcf6f`.

## Gate

Wave 567's gate whole, on the frozen head. By design the footer differs on every page and
`main` on `/` and `/about`; each pairing gate is re-based only its own sanctioned way, with
a dated comment, and no rule is loosened for every route.

## Not in this wave

The platform (575), any logo, image, icon or link for the charity, the header, the hero,
any other copy, new fonts, tokens, CSS or preloads, `main`.
