# Task 05 — Cream section rhythm, and fixing the Our Purpose imbalance

Read `CLAUDE.md` first — it now has a **"Working on cream"** contrast table that this task
depends on. Tasks 01–04 are complete.

Two problems, one cause. The page is still almost entirely navy, and the Our Purpose column
is empty while The Problem column carries everything.

---

## Part A — Add the third orange

`src/styles.css`, in the `@theme` block, alongside the existing oranges:

```css
--color-orange-700: #c25400;   /* orange TEXT on cream — the only orange readable there */
--color-cream-card: #efe6d6;   /* cards sitting on cream, if not already present */
```

**Why this is not optional.** Measured against cream `#f7f1e6`:

- `orange-500` `#ff7a29` → **2.3:1** — fails badly
- `orange-600` `#e56600` → **3.0:1** — still fails
- `orange-700` `#c25400` → **4.1:1** — passes for large text

The Our Purpose headline puts "a home to live in" in orange. The moment that section becomes
cream, that phrase is unreadable unless it uses `orange-700`.

Same trap with teal: the site's `teal-400` `#2fbaaa` is **2.1:1 on cream**. On cream, teal
must be `teal-600` `#17796f` (4.7:1).

---

## Part B — Enforce the section rhythm

The client has asked for this three times. The page must alternate, not run navy throughout.

| # | Section | Background |
|---|---|---|
| 1 | Hero | `navy-900` |
| 2 | **Our Purpose \| The Problem** | **`cream-100` — change this** |
| 3 | Our Solution | `navy-900` |
| 4 | The Accountable Chain Behind It | `cream-100` (already correct) |
| 5 | Live UK Demand | `navy-900` — must stay dark, the map glow needs it |
| 6 | Who We Connect | `cream-100` (already correct) |
| 7 | Join the UK's… (final CTA) | `navy-900` |
| 8 | Footer | `navy-900` |

Flipping section 2 to cream is the only background change needed — that alone produces clean
navy / cream / navy / cream / navy / cream alternation down the page.

### What has to change inside section 2 when it goes cream

Work through every element. This is where light sections usually break:

- Body text → `navy-900`
- Eyebrows ("OUR PURPOSE", "THE PROBLEM") → `teal-600`
- Headline → `navy-900`, with the emphasis phrase in **`orange-700`**
- Icon circle rings → `rgba(0,17,43,0.18)`
- Icon strokes → `navy-900`, keeping one accent per icon (`orange-500` or `teal-600`)
- Cards and stat boxes → white fill, `border-on-cream`
- Stat figures → `teal-600`
- The `human-thinking-portrait.jpg` image → keep it, it reads well against cream
- Any logo in this section → `on-cream` variant

Check the whole section at the end. If anything is still white text or `teal-400`, it is
invisible.

---

## Part C — Fix the column imbalance

Look at the section as it renders now: the left column has a headline, one line, and a
mission quote, then roughly 200px of dead space. The right column has an image, a headline,
a paragraph, five icon bullets and a closing paragraph. It is badly lopsided.

### Left column — Our Purpose

Keep the eyebrow, headline and lede. Keep the mission quote. Then **fill the empty space
below with the data cards** — this is exactly where the client has asked for them.

A **2 × 3 grid** of compact stat cards, 12px gap, filling the remaining column height.

Each card: white fill, `border-on-cream`, 12px radius, 16px padding, and containing —

1. A Lucide icon, 20px, `navy-900` stroke with one accent, in a 40px ring
2. The figure — 30px / 800 weight / `teal-600`
3. The label — 12px, `navy-900` at 70%
4. **A basis line — 10px, `navy-900` at 55%**

The basis line is not decoration. See Part D.

| Icon | Figure | Label | Basis line |
|---|---|---|---|
| `Users` | ~4 million | PEOPLE AFFECTED BY HOUSING NEED | Estimate across all housing need categories |
| `ClipboardList` | 1.6 million | HOUSEHOLDS ON SOCIAL HOUSING WAITING LISTS | Combined UK housing registers |
| `House` | ~150,000 | HOUSEHOLDS IN TEMPORARY ACCOMMODATION | Great Britain, latest published |
| `Baby` | 176,130 | CHILDREN IN TEMPORARY ACCOMMODATION | gov.uk · England · at 31 Dec 2025 |
| `Crane` | 400–430,000 | ADDITIONAL HOMES NEEDED EACH YEAR | UK planning range |
| `PoundSterling` | £425 billion | INDICATIVE ASSET REQUIREMENT | Illustrative market value, not a budget |

### Right column — The Problem, condensed

The client wants this tighter so the section is not enormous. Reduce, do not delete:

- Headline drops from H1 to **H2 scale**
- Body copy drops to **14px**, line-height 1.6
- The five icon bullets: ring **40px** with a **20px** icon, not 56/26. Row gap 10px.
- Bullet text 14px
- The `human-thinking-portrait.jpg` image caps at **240px tall**, not its current size
- Keep the closing paragraph and the "See the full picture" link

### Balance

Both columns should finish within roughly 60px of each other in height on a 1440px viewport.
If the left still runs short, increase the data-card grid gap. If the right still runs long,
tighten line-height before cutting any copy.

---

## Part D — Every figure carries its own basis

The client's own market research is explicit that these numbers **overlap** — a person
leaving hospital may also be homeless, on a waiting list, and receiving care and support.
They must never be presented in a way that invites a visitor to add them together.

That is why each card has a basis line. Do not drop it to save space.

Add one line beneath the grid, 11px, `navy-900` at 55%:

> These figures measure overlapping populations and are not cumulative.

**The ~4 million figure is approved by the client**, worded as approximately four million —
render it as `~4 million`, never a false-precision number like 4,200,000.

**176,130 keeps its gov.uk citation exactly as it is.** Do not round it to match the others.

---

## Rules

- No emoji. Lucide icons only.
- No hard-coded hex — tokens only.
- Never invent a figure. Anything still unknown renders as `[FIGURE TBC]`.
- Do not reinstate How the Ecosystem Works, AI Platform or Success Stories. All three are
  deliberately removed and confirmed by the client.

## Definition of done

- [ ] `orange-700` and `cream-card` tokens exist
- [ ] Page alternates navy / cream / navy / cream / navy / cream down its length
- [ ] Nothing in the cream section is white text, `teal-400`, `orange-500` text or `orange-600` text
- [ ] Six data cards fill the Our Purpose column — no dead space
- [ ] Every card has a basis line, plus the non-cumulative note beneath the grid
- [ ] The Problem column is visibly tighter; nothing has been deleted
- [ ] Columns balance within ~60px at 1440px
- [ ] `npm run lint` passes and `npm run build` succeeds
- [ ] Renders correctly at 375px, 768px, 1280px, 1600px — on mobile the columns stack, Purpose first

Report what changed, and flag anything where the contrast rules forced a compromise.
**Do not commit or push.**
