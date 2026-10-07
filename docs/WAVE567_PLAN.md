# Wave 567 plan: match it, no funnel on the register pages, five years plus

Written before the first edit, 7 October 2026. Branch
`feat/wave567-the-site-says-match-it-and-five-years-plus`, worktree `iigs-uc567`, base
`origin/main` `26b308b` (wave 507's head). Claimed by empty commit `d44b872`:
`feat/wave56*` returned nothing on the site remote, and 56, 560, 562 and 566 on the
platform remote; no `docs/WAVE567*` on the site's `origin/main`; no queue row 567. So 567
was free on both and nothing was renamed.

## 1. The brief's probes, at this tip

| Probe | Result |
|---|---|
| `git rev-parse --short origin/main` | `26b308b` |
| `title: "Find it, price it, prove it."` in `src/content/services.ts` | one line, `:17` |
| `term: "25 years"` in `src/content/services.ts` | one line, `:197` |
| `aria-labelledby="funnel-heading"` in `src/components/site-footer.tsx` | one line, `:157` (the brief says `:146`; the section is the same one) |
| `leaseComparison` readers | `src/routes/platform.tsx:392` and `:396`, `.term` only; `label`, `title` and `detail` are read by nothing |
| `useRouterState` already in use | `src/routes/__root.tsx:183` and `src/components/site-header.tsx:74`, both `select: (s) => s.location.pathname` |

Line numbers in the brief are a few lines out in places (the funnel comment is at `:146`
to `:156`, the section at `:157`); every named string is where the brief says it is.

## 2. What the brief has wrong, found before the first edit

1. **`404.html` has no footer and so no funnel, at the base.** It is the 1,039 byte
   static page `scripts/pages-postbuild.mjs` writes, not a prerender of the not-found
   route. At `26b308b` `funnel-heading` is present once in 29 of the 30 pages and absent
   from `404.html`. The expected counts at the head are therefore **18 with** (the 29
   less `/register/` and the ten role pages) and **12 without** (those eleven and the
   404), not 19 and 11.
2. **A second triad string exists, in a module nothing imports.**
   `src/content/platform.ts:141` holds `label: "Pippa proves it"` in `aiTeam.flow`.
   Nothing in `src` imports `@/content/platform`, so it is rendered nowhere. It is
   changed with the rest so the source says one thing, and it is named in the report as
   not user-facing.
3. **The acceptance grep for W3 is wider than the triad.** `proves` also matches two
   comments about company filings (`src/content/legal.ts:33`, `src/routes/legal.tsx:169`).
   They are not the triad and are left; the report prints them.
4. **The OG card carries no words.** `scripts/wave493-og.py` draws the lockup on white
   and "no words that are not in the artwork".

## 3. The edits

- **W1** `src/components/site-footer.tsx`: the `useRouterState` import, the hook, the
  conditional around the funnel `<section>`, and the two comments. Nothing else.
- **W2** `src/content/services.ts` (`differenceStory[2]`, `leaseComparison`) and
  `src/routes/platform.tsx` (`DIFFERENCE_VISUAL`, the size branch by the value's shape,
  the strip rendering one content field per side).
- **W3** `src/content/services.ts` (P1 to P4 and two comments), `src/routes/platform.tsx`
  (P5 to P8 and four comments), `src/content/platform.ts:141` (unrendered).
- **The guard** NEW `scripts/wave567-copy.py`: the funnel count per prerendered page, the
  hydrated funnel on five routes at 1280 and 390, the `/platform` strings with each of the
  three chapters selected and no "25" in the section, the two meta values, and the shots
  for Callum. `--mode before` on the base build is its red run.

## 4. The routes and the funnel

| Page | Base | Head |
|---|---|---|
| `/`, `/about/`, `/contact/`, `/legal/`, `/partners/`, `/platform/`, `/solutions/`, `/the-problem/`, the ten `/partner-with-*/` (18 pages) | 1 | 1 |
| `/register/` | 1 | 0 |
| `/register/<role>/`, ten roles (broker, care-provider, developer, housing-association, investor, landlord, local-authority, resident, social-worker, support-provider) | 1 | 0 |
| `/404.html` | 0 | 0 |

A path under `/register/` that is not a role (the not-found component inside the root
layout, reached by client navigation) also loses the funnel. Nothing is changed for it.

## 5. The gates, in the order they will run on the frozen head

`wave567-copy.py`, `wave507-titles.py` (before on the base build, done:
`docs/wave567/gate-507-before.txt`), `wave412-screenshots.py`, `wave413-motion.py`,
`wave414-mobile.py`, `wave414-responsive-images.py --check`, `wave415-zoopla-purple.py`,
`wave421-hero-and-footer.py`, `wave443-contrast.mjs --build dist/client`,
`wave490-phone.py`, `wave493-logo.py`, `wave493-og.py --check`, `wave502-logo-name.py`,
`tsc --noEmit`, `eslint` on the changed `src` files, the dash grep on the added lines.

Pairing gates and what is expected to differ by design:

| Gate | Pairs | Expected to differ |
|---|---|---|
| 507 | 60 full-page shots with the base build | `/platform` (main), `/register` and the ten role pages (footer); the other 18 pages at 0 px |
| 490 rule 8 | 14 routes at 1280 with `docs/screenshots/wave490/before` | `/platform` (the hero title, the tools section, How we differ); the three register routes inside the footer, which the rule already declares touched on every route |
| 502 | header and open panel, 39 shots | none: this wave touches neither |
| 493 logo | 1280, outside the logo's reach | to be read off the run |
| 421 | no stored set; reads fifteen footer pairs per page | the four funnel pairs stop resolving on the three register routes it visits |

Where a gate has to learn that a route changes on purpose, it learns it for that route
only, with a dated comment naming this wave. No rule is loosened for every route.
