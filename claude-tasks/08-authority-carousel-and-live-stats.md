# Task 08 — Local authority carousel and live platform stats

Read `CLAUDE.md` first. Tasks 01–07 come first.

**Hard rule for this task: do NOT create any new sections.** Everything here goes inside a
section that already exists. The client has been explicit that the homepage must not grow.

---

## The source — it is already on this machine

Do not rebuild these from screenshots. The original components and logo files live in the
old production site, cloned locally at:

```
C:\Users\sus3jamals\repositories\Impact-Investment-Platform\iip-frontend\iip-web\
```

Go and read it. You are looking for:

1. The **local authority logo carousel** — the scrolling band headed
   "BUILT AROUND WHAT LOCAL AUTHORITIES ARE COMMISSIONING"
2. The **live platform statistics** block — "What we're doing about it, live."
3. The **data provenance** row — "POWERED BY AUTHORITATIVE UK DATA"
4. All associated **logo image files** — council logos and data-provider logos

Copy the logo assets into `public/images/logos/` in this repo, keeping their filenames.
Copy the carousel component's animation logic exactly — the client wants the same scroll
behaviour, not an approximation. Restyle it to this project's brand.

If that path does not exist or you cannot read it, **stop and report it** rather than
substituting placeholder logos.

---

## Part A — Local authority carousel → the FOOTER

The client's original brief put this at the bottom of the site: *"bottom of the website
scrolling local authorities, so there is interaction at the bottom of the website, the
footer."* That is where it goes.

Place it in `src/components/site-footer.tsx`, as a band **above** the existing footer
columns — not as its own page section.

### Styling

- Background `navy-800`, full-bleed, 40px vertical padding
- Eyebrow, centred, `teal-400`, 12px uppercase +0.14em:
  `BUILT AROUND WHAT LOCAL AUTHORITIES ARE COMMISSIONING`
- Logos in white rounded cards, 8px radius, 12px padding, height ~56px, `object-fit: contain`
- Continuous horizontal scroll, right to left, ~40s per full cycle, seamless loop
- Pause on hover
- Fade masks on both edges so logos dissolve rather than clip
- **Wrap the animation in `prefers-reduced-motion: reduce`** — render a static wrapped row
  when set

### Mandatory disclaimer — do not drop this

Beneath the carousel, centred, 12px, white at 60%:

> These are 18 of the ~296 local authorities in England, in the areas we source most. Their
> logos indicate the commissioning briefs we build around — not a partnership, endorsement
> or approval by any council.

**This is not optional and must not be shortened.** Displaying council logos without it
implies endorsement these councils have not given. If the disclaimer will not fit the
layout, change the layout, not the disclaimer.

---

## Part B — Live platform statistics → LIVE UK DEMAND

The three figures — homes sourced, potential homing opportunities, towns and areas covered
— go into the **existing Live UK Demand section**, directly above the map. They are the
platform's own coverage data, so they belong with the demand map, not floating alone.

Three cards in a row, 3-up desktop / 1-up mobile:

| Figure | Label | Sub-line |
|---|---|---|
| 193,000+ | homes sourced & analysed | Sourced across the UK, each run through our analysis. |
| 634,000+ | potential homing opportunities | Counted as the bedrooms across those homes — each a potential supported room. |
| 1,693 | towns & areas covered | Towns and areas with at least one home sourced. |

Styling on navy: `navy-800` card, `border-on-navy`, 14px radius, 24px padding. Figure at
44px/800 in `teal-400`. Label 15px white. Sub-line 13px white at 65%. Then a
`live from our platform` line, 12px, `teal-400`, with a small `Activity` or `Radio` icon.

The old site emphasises the middle card with a filled background. Keep that idea, but use
`teal-600` fill with white text — **not** orange. Orange is reserved for calls to action, and
a stat card is not one.

### ⚠️ Check whether these numbers are live

The old site labels them "live from our platform", implying they come from an API. This repo
has no backend.

- If you can identify the endpoint in the old codebase and it is publicly reachable, wire it
  up.
- If not, hard-code the three values **and add a code comment recording the date and source**,
  and report it. A number labelled "live" that is actually static will drift and eventually
  be wrong — the client needs to know that is the situation.

Note the current site shows 188,000+ / 618,000+ / 1,693 while the old site shows
193,000+ / 634,000+ / 1,693. **Use the higher, newer figures** and flag the discrepancy in
your report.

---

## Part C — Data provenance row → LIVE UK DEMAND

The "POWERED BY AUTHORITATIVE UK DATA" logo row — HM Land Registry, Office for National
Statistics, postcodes.io, OpenStreetMap, Energy Performance Register — goes **beneath the
map**, in the same section.

This is deliberate: it is the provenance of the map's data, so it should sit next to what it
describes rather than in the footer.

- Static row, not scrolling. Five white cards, same treatment as the council logos, ~44px tall.
- Eyebrow above, centred, `teal-400`: `POWERED BY AUTHORITATIVE UK DATA`

### Mandatory attributions — legal, not decorative

> Public data used under licence. These publishers do not endorse this platform.

> © OpenStreetMap contributors · ODbL · [Where our data comes from](/data-sources)

OpenStreetMap's ODbL licence **requires** attribution. Keep the existing ONS boundary
attribution and the commissioning-briefs disclaimer too. None of these may be removed to
save space.

If `/data-sources` does not exist in this project, link to `/about` and note it in your
report.

---

## Placement summary

| Content | Goes into | New section? |
|---|---|---|
| Local authority carousel | Site footer, above the columns | No |
| Three live stat cards | Live UK Demand, above the map | No |
| Data provenance logos | Live UK Demand, below the map | No |

---

## Definition of done

- [ ] Logo assets copied from the old repo, not recreated or substituted
- [ ] Carousel scroll behaviour matches the original
- [ ] Carousel sits in the footer, not as its own section
- [ ] Council disclaimer present, in full
- [ ] Three stat cards in Live UK Demand above the map, middle card teal-filled, not orange
- [ ] Whether the stats are live or static is resolved and reported
- [ ] Provenance row below the map with all attributions intact
- [ ] OpenStreetMap ODbL attribution present
- [ ] Animations respect `prefers-reduced-motion`
- [ ] **No new top-level sections were added**
- [ ] `npm run lint` passes and `npm run build` succeeds
- [ ] Renders correctly at 375px, 768px, 1280px, 1600px

Report what you copied, where it came from, whether the stats are live, and any disclaimer
you had to reposition. **Do not commit or push.**
