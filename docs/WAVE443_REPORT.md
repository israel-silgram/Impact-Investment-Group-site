# Wave 443 report

Status: implementation, local checks and independent read-only review complete; live integration pending. Feature branch only.

## Ledger and authority

- Site base: `bb39b3ed0eab0f9942882a0c63c45c79e8c49bf9`.
- Branch: `feat/wave443-the-site-takes-brand-kit-v4` in `C:\Users\Israel\Documents\repos\iigs-uc443`.
- Code head: `94adbed77b9c72dd95e8f0fc56d5bd22dd3c986e` (implementation `4adde9c5857cd5b1ae0a18a5514e6508742e7121`, followed by reviewed contrast-comment corrections).
- Palette authority: platform Brand Kit v4 at `101a18d5fbd0b97adafa4ea68aaf84c6196e86b4`.
- User asked for brighter orange close to `#f06b3c` and a complementary scheme across both products. The exact platform scheme is used here. Its primary `#E15E31` is reserved for graphics; `#BB441B` carries small white labels and orange text. The reference orange alone does not meet the graphic floor on several warm surfaces.
- User explicitly authorised recolouring existing pixels while preserving the artwork. No generated replacement image is used. The dirty primary site checkout and shared vault were not changed.

## Measurement before the change

The [before inventory](wave443/before-orange-inventory.json) records 374 orange-related source lines across 35 files, including historical comments. Each entry retains its path, line and actual source, exposing literal values versus named roles. Raster provenance, sizes and original byte hashes appear in the [asset integrity record](wave443/asset-integrity.json). The eight before frames below came from the baseline site build.

`scripts/wave443-contrast.mjs` resolves the actual stylesheet declarations and aliases, and compares the exact v4 values with the platform table. It measures 29 principal flat text and graphic pairs. This is a bounded palette audit, not a full accessibility audit of every overlay, hover, image background or interaction. Baseline teal ink on the deepest cream failed at 4.239:1; the new pair passes. Complete machine-readable rows: [before](wave443/before-contrast.json), [after source](wave443/after-contrast.json), [after build](wave443/after-build-contrast.json).

| Foreground | Ground | Floor | Before | After |
|---|---|---:|---:|---:|
| `--color-ink` | `--color-white` | 4.5 | 18.8330 | 13.6179 |
| `--color-ink-muted` | `--color-white` | 4.5 | 6.9731 | 6.9731 |
| `--color-orange-700` | `--color-white` | 4.5 | 6.4958 | 5.3089 |
| `--color-teal-600` | `--color-white` | 4.5 | 5.2488 | 5.8549 |
| `--color-ink` | `--color-page` | 4.5 | 18.8330 | 13.3713 |
| `--color-ink-muted` | `--color-page` | 4.5 | 6.9731 | 6.8468 |
| `--color-orange-700` | `--color-page` | 4.5 | 6.4958 | 5.2127 |
| `--color-teal-600` | `--color-page` | 4.5 | 5.2488 | 5.7488 |
| `--color-ink` | `--color-page-alt` | 4.5 | 16.7520 | 12.6727 |
| `--color-ink-muted` | `--color-page-alt` | 4.5 | 6.2026 | 6.4891 |
| `--color-orange-700` | `--color-page-alt` | 4.5 | 5.7780 | 4.9404 |
| `--color-teal-600` | `--color-page-alt` | 4.5 | 4.6688 | 5.4485 |
| `--color-ink` | `--color-cream-card` | 4.5 | 15.2098 | 11.7480 |
| `--color-ink-muted` | `--color-cream-card` | 4.5 | 5.6316 | 6.0156 |
| `--color-orange-700` | `--color-cream-card` | 4.5 | 5.2461 | 4.5799 |
| `--color-teal-600` | `--color-cream-card` | 4.5 | 4.2390 | 5.0509 |
| `--color-white` | `--color-orange-600` | 4.5 | 5.3406 | 5.3089 |
| `--color-white` | `--primary` | 4.5 | 5.3406 | 5.3089 |
| `--color-white` | `--sidebar-primary` | 4.5 | 5.3406 | 5.3089 |
| `--color-white` | `--color-navy-950` | 4.5 | 19.7250 | 13.6179 |
| `--color-white` | `--color-navy-800` | 4.5 | 16.9540 | 13.6179 |
| `--color-teal-400` | `--color-navy-950` | 4.5 | 8.1952 | 6.6403 |
| `--color-orange-500` | `--color-page` | 3.0 | 4.2257 | 3.5266 |
| `--color-orange-500` | `--color-page-alt` | 3.0 | 3.7588 | 3.3423 |
| `--color-orange-500` | `--color-cream-card` | 3.0 | 3.4127 | 3.0985 |
| `--color-orange-500` | `--color-navy-950` | 3.0 | 4.6679 | 3.7916 |
| `--color-ink-soft` | `--color-white` | 4.5 | 4.8724 | 4.8724 |
| `--color-ink-soft` | `--color-page` | 4.5 | 4.8724 | 4.7841 |
| `--color-destructive-on-light` | `--color-page-alt` | 4.5 | 4.8542 | 5.0784 |

## Exact palette taken from platform v4

| Token | v3 | v4 | Role and measured pair |
|---|---|---|---|
| `--brand-primary` | `#C15F3C` | `#E15E31` | Orange graphics; white 3.59:1, navy 3.79:1 |
| `--brand-primary-ink` | `#AE4E30` | `#BB441B` | Orange text and small-text controls; white 5.31:1, deepest warm paper 4.58:1 |
| `--brand-primary-soft` | `#FCF1EC` | `#FFF0EB` | Accent wash only; orange ink 4.78:1 |
| `--brand-primary-light` | `#D98A6C` | `#F07E56` | Decorative light accent |
| `--brand-primary-on-ink` | `#F0A886` | `#FFA181` | Dark-navigation accent fill only; never text on navy |
| `--brand-teal` | `#189591` | `#208A87` | Supporting graphics; white 4.16:1 |
| `--brand-teal-ink` | `#117976` | `#1A706E` | Teal text and text-bearing fill; white 5.85:1 |
| `--brand-teal-soft` | `#E9F7F6` | `#EBF6F6` | Care wash; teal ink 5.31:1 |
| `--brand-teal-on-ink` | `#4FC7C2` | `#66C4C2` | Teal on navy; 6.64:1 |
| `--brand-ink` | `#0A2C60` | `#0A2C60` | Navy identity and focus ring; white 13.62:1 |
| `--brand-slate` | `#647289` | `#647289` | Neutral text; white 4.87:1 |
| `--bg-canvas` | `#FDFDFB` | `#FDFDFB` | Bone paper |
| `--bg-tint` | `#FBF6F0` | `#FBF6F0` | Neutral information bed |
| `--bg-cream` | `#F5EDE4` | `#F5EDE4` | Deep warm paper |
| `--dv-track` | `#EDE4DA` | `#F3EAE0` | Chart track for the brighter accent |

## Repointing and asset treatment

- `src/styles.css` defines the 15 canonical values once. Tailwind, shadcn, section surfaces, focus rings, page chrome, orange fade and Resident glow reference them. Original gradient stops, strengths, shadows, timing and layout are retained. Existing neutral text and destructive red roles remain.
- Home hero, mission, partner hub, partner page, About, Platform and Solutions use orange ink for actual text. The partner timeline uses the ink fill and white small step numbers. The contact crisis title is white on navy.
- Existing brand-coloured shadow and gradient literals in the director card, partner artwork, platform decorations and problem illustrations now read canonical variables. SVG map accents do the same. The canvas map reads navy and teal from the computed canonical CSS variables; the dot positions, demand values, bucketing, alpha and interaction are unchanged.
- `src/components/logo.tsx` documents the authorised existing-artwork recolour. The eight existing WebP lockups/marks, favicon and social PNG keep the original artwork, geometry, dimensions and alpha. Logo words use ink on light backgrounds and white on navy; graphic orange uses primary. The original navy and all pixels outside the orange selection are byte-identical after decoding.
- `scripts/wave443-recolour.py` regenerates only the explicit ten assets from the immutable base. The orange mask uses hue <= 0.18, saturation >= 0.28, red > green x 1.05, red > blue x 1.2 and nonzero alpha. The word region is to the right of 40.5% of lockup width. Every selected pixel receives the exact role colour. Default execution verifies without changing files.
- The site has no checked-in OG producer in its scripts. Its existing social PNG was recoloured directly, preserving every non-orange pixel; no artwork was transplanted from the different platform logo.
- Lossless WebP with `exact=True` is necessary to preserve unselected RGB and alpha. This increases the used raster payload, listed below. Original raster compression noise outside the orange mask is deliberately preserved. The 400px responsive lockup now costs 71,612 bytes rather than 30,488 bytes; a source-artwork cleanup or lossy re-encode would require relaxing exact pixel preservation.

| Asset | Dimensions | Orange pixels | Before bytes | After bytes | Outside changes | Alpha changes |
|---|---|---:|---:|---:|---:|---:|
| `public/images/brand/logo-lockup.webp` | 711 x 264 | 13375 | 80988 | 146636 | 0 | 0 |
| `public/images/brand/logo-lockup-reverse.webp` | 711 x 264 | 13324 | 69930 | 112798 | 0 | 0 |
| `public/images/brand/logo-lockup-400.webp` | 400 x 149 | 5157 | 30488 | 71612 | 0 | 0 |
| `public/images/brand/logo-lockup-640.webp` | 640 x 238 | 11427 | 58392 | 137596 | 0 | 0 |
| `public/images/brand/logo-lockup-reverse-400.webp` | 400 x 149 | 5094 | 26022 | 53868 | 0 | 0 |
| `public/images/brand/logo-lockup-reverse-640.webp` | 640 x 238 | 11315 | 49964 | 101398 | 0 | 0 |
| `public/images/brand/logo-mark.webp` | 254 x 264 | 5779 | 33278 | 62368 | 0 | 0 |
| `public/images/brand/logo-mark-reverse.webp` | 254 x 264 | 5787 | 28430 | 46494 | 0 | 0 |
| `public/images/brand/og-default.png` | 1200 x 630 | 18642 | 136263 | 107980 | 0 | 0 |
| `public/favicon.png` | 128 x 128 | 1256 | 2487 | 3142 | 0 | 0 |

Total 91156 selected pixels. All ten rasters pass expected-role, dimensions, alpha and outside-mask invariants. Total file size changed from 516242 to 843892 bytes.

## Paired browser frames

Captured through the in-app Browser at 390 x 844 and 1280 x 900. The CSS file was explicitly verified after reload as `styles-BrR68dcl.css` with primary `#e15e31`; cached baseline route documents were replaced before the final captures. The full-page home frames retain the site's existing scroll-triggered reveal behaviour, so they are not proof of every below-fold animation state. Hero, footer and registration views were inspected directly.

| View | Width | Before | After |
|---|---:|---|---|
| home | 390 | [before](screenshots/wave443/before-home-390.png) | [after](screenshots/wave443/after-home-390.png) |
| hero | 390 | [before](screenshots/wave443/before-hero-390.png) | [after](screenshots/wave443/after-hero-390.png) |
| footer | 390 | [before](screenshots/wave443/before-footer-390.png) | [after](screenshots/wave443/after-footer-390.png) |
| register | 390 | [before](screenshots/wave443/before-register-390.png) | [after](screenshots/wave443/after-register-390.png) |
| home | 1280 | [before](screenshots/wave443/before-home-1280.png) | [after](screenshots/wave443/after-home-1280.png) |
| hero | 1280 | [before](screenshots/wave443/before-hero-1280.png) | [after](screenshots/wave443/after-hero-1280.png) |
| footer | 1280 | [before](screenshots/wave443/before-footer-1280.png) | [after](screenshots/wave443/after-footer-1280.png) |
| register | 1280 | [before](screenshots/wave443/before-register-1280.png) | [after](screenshots/wave443/after-register-1280.png) |

[Browser layout evidence](wave443/browser-layout.json) confirms no registration page horizontal overflow. Resident centres are 195px at 390px and 639.98px at 1280px; the original 45% ring and 22% glow remain, now from v4 teal. No registration was submitted and no live account or API data was modified.

## Verification and boundaries

- `bun test scripts/wave358-registration.test.ts`: 9 pass, 0 fail, 25 assertions. [Log](wave443/registration-tests.log).
- `bunx tsc --noEmit`: exit 0. [Log](wave443/typecheck.log), empty on success.
- `STATIC_BUILD=true bun run build`: exit 0, 36 prerender routes. [Final build](wave443/build.log); [earlier initial build](wave443/build-initial.log) retained. Standard chunk-size and upstream unused-import warnings remain.
- `node scripts/pages-postbuild.mjs dist/client`: pass. The existing postprocessor trimmed the contact page's duplicate document tail. [Log](wave443/postbuild.log).
- `node scripts/wave443-contrast.mjs --build dist/client`: all 29 pairs pass, exact 15-token parity, zero retired-hex/RGB matches in source and built text. Historical source comments and intentionally retained before evidence are excluded from that runtime scan.
- `python scripts/wave414-responsive-images.py --check`: all expected image variants present, 24 alpha-bearing sources retain alpha. [Log](wave443/responsive-images.log).
- `python scripts/wave443-recolour.py`: all 10 exact asset checks pass. [JSON](wave443/asset-integrity.json).
- `git diff --check`: pass. Newly authored code and prose add no em or en dashes; pre-existing copy was preserved.

The tests and frames were produced at implementation head `4adde9c`; the only follow-up source edits were four CSS comment corrections requested by the independent reviewer. The production build and contrast/source scan were repeated at final code head `94adbed`, and the compiled CSS filename and size remained identical. The final documentation commit contains evidence only; no source changed after that code head. The parent coordinator independently reviewed the CSS/token/map/logo diffs, asset integrity and layout JSON, and mobile registration plus desktop hero frames. No blocking functional or layout issue was found. The reviewer requested corrected current contrast annotations (13.62, 5.31 and 5.85) and explicit documentation of the lossless WebP byte increase; both are addressed. Full interactive accessibility, all 36 routes at all widths, production deployment and serving-SHA verification were not performed here. The worktree remains available for the coordinator's integration. No main, pre-prod or prod tier was pushed.

## Documentation-only proof

`git diff --stat 94adbed..HEAD` contains only this report, the plan and evidence under `docs/`. The exact changed paths are recorded in [docs-only-diff.txt](wave443/docs-only-diff.txt). The final head is the documentation commit that includes this report.

## Code file list

- `public/favicon.png`
- `public/images/brand/logo-lockup-400.webp`
- `public/images/brand/logo-lockup-640.webp`
- `public/images/brand/logo-lockup-reverse-400.webp`
- `public/images/brand/logo-lockup-reverse-640.webp`
- `public/images/brand/logo-lockup-reverse.webp`
- `public/images/brand/logo-lockup.webp`
- `public/images/brand/logo-mark-reverse.webp`
- `public/images/brand/logo-mark.webp`
- `public/images/brand/og-default.png`
- `scripts/wave443-contrast.mjs`
- `scripts/wave443-recolour.py`
- `src/components/about/director-card.tsx`
- `src/components/home/demand-map.tsx`
- `src/components/home/hero.tsx`
- `src/components/home/mission-solution.tsx`
- `src/components/logo.tsx`
- `src/components/partners/partner-page.tsx`
- `src/components/partners/partners-hub.tsx`
- `src/routes/about.tsx`
- `src/routes/contact.tsx`
- `src/routes/platform.tsx`
- `src/routes/solutions.tsx`
- `src/routes/the-problem.tsx`
- `src/styles.css`
