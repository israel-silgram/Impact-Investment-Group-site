# Task 02 — Fix the hero images, then merge Our Purpose | The Problem

Read `CLAUDE.md` first. Task 01 is complete — tokens, navigation and Book a Demo removal
are all done and verified. This task has two parts. Do part A first; it is a five-minute fix
that unblocks visual review.

---

## Part A — Fix the broken hero images

### The problem

`src/assets/` contains three files named `hero-1-providing-homes.png.asset.json`,
`hero-2-delivering-support.png.asset.json` and `hero-3-transforming-lives.png.asset.json`.

These are **Lovable asset descriptors, not images.** They point at
`/__l5e/assets-v1/<uuid>/...` which only resolves inside Lovable's hosting. On a local dev
server, and in any build outside Lovable, the three hero photographs render as broken
images showing their alt text.

### The fix

The real PNG files are now committed at:

```
public/images/hero-1-providing-homes.png
public/images/hero-2-delivering-support.png
public/images/hero-3-transforming-lives.png
```

In `src/components/home/hero.tsx` (and `src/content/home.ts` if the paths live there),
replace the `.asset.json` imports with plain public paths:

```
/images/hero-1-providing-homes.png
/images/hero-2-delivering-support.png
/images/hero-3-transforming-lives.png
```

Keep the existing `alt` text — it is good and accurate.

Then delete the three now-unused `.asset.json` files from `src/assets/`.

### While you are in the hero

Check these against the mock-up and fix any that are off:

- The three photographs must be **identical dimensions** and sit on one row with equal gaps.
  Aspect ratio 16:10, `object-fit: cover`, 12px radius, 1px border at
  `rgba(255,255,255,0.14)`.
- The ten role cards must be **equal height within a row**. Right now cards with two-line
  role names sit lower than the others. Use a grid with stretched items, not inline blocks.
- The "Register as" divider rules should use `orange-500`.

---

## Part B — Merge Our Purpose and The Problem into one section

The client wants these as **one section**, with **Our Purpose on the left** and
**The Problem on the right**. They are currently two stacked sections.

### Layout

Section background `navy-900`. Standard padding: 96px desktop, 56px mobile.

**Row 1 — two columns, equal width, 48px gap.** Stacks to one column below 900px.

**Left column — Our Purpose**

- Eyebrow, `teal-400`, uppercase, +0.14em tracking: `OUR PURPOSE`
- Headline, H1 scale, Barlow 700, white, with the phrase **"a home to live in"** in
  `orange-500`:
  `To ensure that every person has a home to live in`
- Keep the existing purpose body copy from `src/content/home.ts` — it is good.
- Above the headline, place a `HandHeart` icon in a 60px circle ring, orange accent.

**Right column — The Problem**

- Eyebrow, `teal-400`, uppercase: `THE PROBLEM`
- Headline, H2 scale: keep `The housing system is fragmented`
- Keep the existing body copy.
- The five bullet points currently render as plain list items. **Replace every one with a
  Lucide icon in a circle ring**, per the icon spec in `CLAUDE.md`. Suggested mapping:

  | Bullet | Icon | Accent |
  |---|---|---|
  | Suitable properties remain empty while demand grows | `House` | orange |
  | Housing opportunities are identified too late | `Clock` | teal |
  | Investment isn't always directed where it creates the greatest impact | `Network` | teal |
  | Providers spend valuable time searching for accommodation | `ClipboardList` | orange |
  | Families and individuals wait longer than necessary | `Users` | orange |

- Above the headline, place a `MessageCircleQuestion` icon in a circle ring, teal accent.

### Row 2 — full-width image band

Directly beneath the two columns, full-bleed edge to edge:

```
public/images/our-purpose-band.png
```

- Height 420px desktop, 260px mobile. `object-fit: cover`, positioned so the people on the
  right stay in frame.
- Overlay a left-to-right gradient scrim: `navy-900` at 88% → 40% → transparent by 55% width.
  The blueprint drawing on the left must stay visible through it — it is intentional.
- Over the scrim, on the left third: `From plans on a page to keys in a hand.` in white,
  H2 scale, max three lines, with a 40px × 3px `orange-500` rule beneath it.

### Row 3 — the data boxes

Below the band, a responsive grid of stat cards. 3 across desktop, 2 tablet, 1 mobile.

The five existing stats in `src/content/home.ts` (176,130 / 330,410 / 677,202 / £102m /
430%) are **real, sourced and must be kept exactly as they are, with their citations.**
Do not alter the figures or the source lines.

Add a sixth card using the existing stat-card component:

```
Icon: PoundSterling   Figure: [FIGURE TBC]   Label: CAPITAL REQUIRED TO DELIVER
```

Give every card a Lucide icon in a circle ring:

| Stat | Icon |
|---|---|
| 176,130 children in temporary accommodation | `Baby` |
| 330,410 households owed a homelessness duty | `House` |
| 677,202 supported homes needed by 2040 | `ClipboardList` |
| £102m/yr NHS cost | `Hospital` |
| 430% rise in B&B spend | `TrendingUp` |
| [FIGURE TBC] capital required | `PoundSterling` |

Stat figures use `teal-400` on navy. Labels 13px uppercase, +0.12em tracking.

### Row 4 — platform statement

A full-width panel, `navy-800`, 14px radius, 32px padding, 3px left border in `teal-400`.
Inside: a `BrainCircuit` icon in `teal-400` at 28px, then, at H3 scale in white:

```
[AI-DRIVEN PLATFORM STATEMENT — TBC]
```

Render that bracketed text literally. **Do not invent wording.** It is pending from the client.

---

## Rules

- No emoji anywhere. Lucide icons only.
- Never invent a figure. Missing numbers render as literal `[FIGURE TBC]`.
- No hard-coded hex values — tokens only.
- The client also wants figures for local authority waiting lists, children's homes and a
  five-year build target. Those are **not yet supplied**. Do not add placeholder cards for
  them in this task; we will add them when the numbers arrive.

## Definition of done

- [ ] Three hero photographs render locally from `/images/...`
- [ ] The three `.asset.json` files are deleted
- [ ] Hero role cards are equal height in a row
- [ ] Our Purpose and The Problem are one section, purpose left, problem right
- [ ] Every bullet in The Problem is an icon in a circle ring — no plain bullets, no ticks
- [ ] The full-width band renders with the scrim and the statement over it
- [ ] All five original stats intact with citations; sixth card added as `[FIGURE TBC]`
- [ ] `npm run lint` passes and `npm run build` succeeds
- [ ] Renders correctly at 375px, 768px, 1280px and 1600px

Report what changed, anything you could not do, and which of the client's notes this
satisfies. **Do not commit or push.**
