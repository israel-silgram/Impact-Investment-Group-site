# Wave 777 report: the site's palette follows the platform, navy and teal a touch lighter

Site lane of wave 777 (brief `Briefs/CLAUDE_CODE_wave777_one-palette-lighter-navy-and-teal.md` in the Context Library). Built in a temporary detached copy of `origin/main` `7d8212e` by Tommy's new-account cloud session; written up by the operator chair from the builder's records, the gate output in `docs/wave777/` and the fresh review.

## Questions and answers

- Tommy, 27 Oct 2026 08:20 UK: may the orange drop below its contrast floor? "Graphics only (Recommended)". No orange value moved: even a graphic sits about 0.01 of lightness from its floor on the platform's tightest bed.
- Tommy approved the preview at 11:20 UK on 27 Oct 2026 without naming a teal. Assumed (27 Oct 2026): the recommended smaller lift for the teal fill, `#258D8A`, which keeps a luminance gap of 1.11:1 to the orange; the alternative was `#319693` (1.01:1), the gap wave 442 kept on purpose.

## What the brief got wrong

- S3 asked for two green runs of `scripts/wave412-screenshots.py`. The base itself is red on one node (the `/platform` "03" disc at 1280 cannot be measured off the pixels in the cloud environment), so every run here carries that one inherited failure and nothing else.
- Five component files needed a surface move the brief did not list: teal text on the 12% teal tint fell to 4.39:1, so those surfaces moved to the opaque pale teal bed (`bg-secondary`); the home flip bar's desktop gradient read 4.30:1 under its label and now runs `orange-700` to `orange-600`. The enquiry form's panel moved too although it carries only a teal glyph (harmless; the review's item 3).
- The site has no navy-2, navy-3, muted-on-navy or management agent tokens, so four of the brief's lifted values had nothing to move here.
- The gate's `--baseline` mode reads a commit (`bb39b3ed`) that is not in this repo.

## Tokens, old to new

| Token | Old | New |
|---|---|---|
| `--brand-ink` | #0A2C60 | #14366A |
| `--brand-teal` | #208A87 | #258D8A |
| `--brand-teal-ink` | #1A706E | #267977 |
| `--brand-teal-on-ink` | #66C4C2 | #70CECC |
| `--bg-tint` | #FBF6F0 | #FEF8F5 (the platform's, R523-1) |
| `--bg-cream` | #F5EDE4 | #F8F0EC (the platform's, R523-1) |
| `--brand-primary-fill` | not declared | #CC4A22 (R541-1), used by `orange-600`, `--primary`, `--sidebar-primary` |
| `teal-700`, `teal-800` | Tailwind's default teal | `--brand-teal-ink` |
| `--secondary` | 12% teal mix | `--brand-teal-soft` #EBF6F6 |

Every orange value is unchanged. Values stay six-digit hex for the demand map's canvas.

## The tightest pairings after, read off `docs/wave777/contrast-after-build.json`

| Foreground | Background | Ratio | Floor |
|---|---|---|---|
| `--color-page` #FDFDFB | `--color-orange-600` #CC4A22 | 4.51:1 | 4.5 |
| `--color-teal-600` #267977 | `--color-cream-card` #F8F0EC | 4.57:1 | 4.5 |
| `--color-white` #FFFFFF | `--color-orange-600` #CC4A22 | 4.60:1 | 4.5 |
| `--color-white` #FFFFFF | `--primary` #CC4A22 | 4.60:1 | 4.5 |
| `--color-white` #FFFFFF | `--sidebar-primary` #CC4A22 | 4.60:1 | 4.5 |
| `--color-teal-600` #267977 | `--secondary` #EBF6F6 | 4.66:1 | 4.5 |
| `--secondary-foreground` #267977 | `--secondary` #EBF6F6 | 4.66:1 | 4.5 |
| `--sidebar-accent-foreground` #267977 | `--sidebar-accent` #EBF6F6 | 4.66:1 | 4.5 |
| `--color-orange-500` #E15E31 | `--color-cream-card` #F8F0EC | 3.19:1 | 3 |
| `--color-orange-700` #BB441B | `--color-cream-card` #F8F0EC | 4.72:1 | 4.5 |
| `--color-ink-soft` #647289 | `--color-page` #FDFDFB | 4.78:1 | 4.5 |
| `--color-orange-500` #E15E31 | `--color-navy-950` #14366A | 3.31:1 | 3 |
| `--color-orange-500` #E15E31 | `--color-navy-800` #14366A | 3.31:1 | 3 |
| `--color-destructive-on-light` #C92A2A | `--color-cream-card` #F8F0EC | 4.85:1 | 4.5 |

## Gate table (final tree `40ccbc0`; `src` and `scripts` unchanged since)

| Check | Result |
|---|---|
| `STATIC_BUILD=true npx vite build` | rc 0 |
| `node scripts/wave443-contrast.mjs` and `--build dist/client` | rc 0 both; 62 pairs, 0 failures, 0 retired colours in source or build, 0 translucent hovers on an orange fill |
| `python scripts/wave412-screenshots.py` | rc 1, ONE failure, inherited and present on the base: the `/platform` "03" disc at 1280 cannot be measured off the shot. axe 0 violations over 28 shots; 274 incomplete nodes, 273 measured off the pixels with no failure. Home at 1280: raw 22.61%, ground 8.63% |
| Mutations | The builder's six arms in the first pass and two in the fix pass (the teal back to #319693, a root-page hover back to `/90`) each turned the gate red; the fresh review ran four more on a scratch copy (`--secondary` back to the tint, `teal-800` deleted, `orange-600` to `--brand-primary`, an old hex planted in a component), each red |
| `bun install` | NOT RUN: `bun.lock` pins tarballs on a private registry this environment cannot reach; dependencies came from `pnpm install --no-frozen-lockfile`, no lockfile committed |

## Preview captures

Before (base `7d8212e`) and after (final tree), 28 PNGs each at 1280 and 390, were kept outside the repo for Tommy's preview (`/home/claude/iip-work/preview/site/before/` and `after/` in the cloud session) and published in the wave 777 preview artifact. The tracked `docs/screenshots/wave412` evidence is unchanged.

## Findings, not changed in this wave

- The partner icon gradients (`partners-hub.tsx`) use Tailwind's default colours, outside the brand.
- The raster logos, favicon and OG image carry an older navy (about #022353, #001E4A, #00112B).
- The error page's own "Go home" link hovers to the teal fill with navy text at 2.31:1 (2.33:1 before this wave).
- The unused library button hover (`button.tsx` `primary/90`) is 3.96:1; nothing renders it.
- Orange-500 on the navy island is 3.31:1 (3.79:1 before): large text and graphics only, as `CLAUDE.md` now says; no small orange word sits on an island today.
- Stale ratio comments remain in lines this wave did not touch, and `scripts/wave295-*` still hard-code the pre-v4 palette.

## MANUAL (Callum)

None.

## MANUAL (Cowork)

None.
