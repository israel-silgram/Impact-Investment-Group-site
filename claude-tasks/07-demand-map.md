# Task 07 — Rebuild the Live UK Demand map to match Mock-up 2

Read `CLAUDE.md` first. This is the most technically demanding task in the project. Take it
slowly and do not start until Task 06 is finished.

**The requirement:** the map must be a 1:1 visual replica of `mock_up_2_image_with_map.png`
— same quality, same colours, same luminous network feel — **while keeping every piece of
existing interactivity exactly as it works today.**

Reference image: `public/images/logo-reference-mockup2.png` shows the logo crop; ask the
client for the full mock-up file if it is not already in the repo. Study the map before
writing code.

---

## ⚠️ Read this first — a blocker you must resolve

`src/data/england-lad.json` contains **England only**. The mock-up map shows **the whole
UK** — Scotland, Wales, Northern Ireland and England, with glowing hubs in Scotland and
Northern Ireland clearly visible.

A faithful replica is impossible with England-only geography.

**Resolution — use two layers:**

1. **Visual layer** — a simplified **UK-wide** boundary set for the dot landmass, so
   Scotland, Wales and Northern Ireland render. A low-resolution UK TopoJSON is sufficient;
   it only needs to be accurate enough to read as the UK silhouette at ~600px tall.
2. **Interactive layer** — keep `england-lad.json` exactly as it is for hover, click,
   selection and the region/local-authority dropdowns.

Non-English areas render as landmass but are not selectable. If the client wants them
interactive later that needs real data, which does not exist yet.

If you cannot source a UK boundary file, **stop and report it** rather than shipping an
England-only map and calling it done.

---

## Exact colours — sampled from the mock-up, not estimated

```
map background        #000D2A   (radial, lifting to navy-900 #00112b at the edges)
landmass dot body     #001D5B
landmass dot mid      #01235D
dot core / highlight  #D4FFFF   (near-white cyan — used sparingly)
hub node ring         #F27216
hub node hot core     #FFEFB2   (pale yellow-white)
hub halo mid          #BF4B1B
```

**Density matters.** In the mock-up, blue pixels occupy about **5.8%** of the map area and
orange about **1.1%**. It is sparse and luminous, not a solid filled shape. If your dots
look like a filled map, they are too dense or too large.

---

## Build spec

### 1. Background

Radial gradient centred behind the map: `#000D2A` at the centre lifting to `navy-900` at the
edges. No border, no card, no panel — the map floats on the section.

### 2. Landmass as a dot field

Replace the current filled-polygon choropleth with a **point matrix**.

- Generate a regular grid of candidate points across the UK bounding box, spacing ≈3.5px at
  the map's rendered size
- Keep only points falling **inside** a landmass polygon (point-in-polygon test using the
  existing `d3-geo` projection)
- Draw each as a circle, radius 0.8–1.4px
- Base fill `#001D5B`
- Points within ~2 grid steps of a coastline render brighter, mixing toward `#D4FFFF` at
  30–45% opacity — this is what makes the outline read
- **Precompute this grid once** and memoise it. Never regenerate on hover, resize-throttle
  only, or the map will crawl.

### 3. Demand drives brightness

This must remain a data map, not decoration.

Each dot inherits the demand intensity of the local authority it sits in. Higher demand →
higher opacity and a slight shift toward `#D4FFFF`. Low demand areas stay near `#001D5B`.

The existing demand data and category filters must continue to drive this. Changing a demand
category must visibly change the map.

### 4. Hub nodes

20–25 glowing hubs at major population centres, matching the mock-up's distribution.

Each hub:

- Hot core: 2–3px circle, `#FFEFB2`
- Inner glow: 6–10px radial, `#F27216`
- Outer halo: 18–30px radial, `#F27216` fading to transparent by the edge
- **Radius scales with demand volume** for that area — this is a data encoding, not decoration

### 5. Connection lines

- Thin lines between geographically near hubs, 0.5px, `#F27216` at 12–18% opacity
- Plus 3–4 large sweeping arcs crossing the map, 0.75px, `#D4FFFF` at 6–10% opacity, drawn as
  quadratic curves well outside the landmass — visible in the mock-up as wide circular sweeps
- Do not connect every hub to every other hub. The mock-up is a sparse mesh, not a web.

### 6. Motion

- Hubs pulse gently, 2.5–4s, staggered so they are not synchronised
- Opacity swing no wider than 0.75 → 1.0. Subtle.
- **Wrap all of it in `prefers-reduced-motion: reduce`** and render static when set

---

## Interactivity — must not regress

Everything below works today and must still work identically afterwards:

- Hover a local authority → highlight and tooltip
- Click → select, updating Selected Area, Homes Sourced, Potential Rooms, Demand Intensity
- Demand category filters
- Region dropdown
- Local Authority dropdown
- The ONS boundary attribution and the illustrative-data disclaimer

**How to keep it working:** render the interactive `england-lad.json` polygons as a
transparent layer **on top of** the dot field — `fill: transparent`, `pointer-events: all`,
no stroke. They become invisible hit targets. On hover, brighten that authority's dots and
scale its hub via a CSS class or an opacity overlay — **do not re-run the point-in-polygon
work on every mouse move.**

---

## Performance

The dot field will be several thousand elements. Watch for:

- If SVG circle count exceeds ~4,000, render the dot field to `<canvas>` and keep only the
  interactive polygons in SVG
- Memoise the projection and the generated grid
- Throttle resize to 150ms
- Target 60fps on hover, and no layout thrash

Also check `react-simple-maps` still behaves — it declares support only up to React 18 and
this project runs React 19. If it fights the point-in-polygon work, `d3-geo` alone is enough;
it is already a dependency.

---

## The left-hand column

Beside the map, the four icon-led statements the client approved — these are final copy, use
them verbatim:

| Icon | Heading | Body |
|---|---|---|
| `Network` (teal) | Demand-Led Intelligence | View areas where local authorities, housing associations and care and support organisations require housing. |
| `BrainCircuit` (teal) | AI-Powered Analysis | The platform analyses demand by location, property type, household need and support requirements. |
| `HandCoins` (orange) | Connect to Opportunity | Investors, landlords and developers can identify where suitable homes are required. |
| `TrendingUp` (teal) | Deliver Measurable Impact | Each property opportunity can be connected to a real housing requirement and potential social outcome. |

Above them, place `human-insight.jpg` — position it so the woman faces **toward** the map,
not away from it. Flip horizontally if needed.

---

## Dropdown disclaimer — approved copy, use verbatim

Beneath the Region and Local Authority dropdowns:

> The information shown in this demonstration is provided for illustrative purposes. The
> completed platform will deliver detailed regional and local authority analysis, live
> housing-demand intelligence, intelligent partner connections and property-matching
> capabilities.

Keep the existing ONS attribution and commissioning-briefs disclaimer as well. Neither may be
removed — they are compliance text.

---

## Definition of done

- [ ] Map renders the **whole UK**, not England only
- [ ] Landmass is a dot field, not filled polygons
- [ ] Colours match the sampled values above
- [ ] Dot density reads sparse and luminous, roughly matching the mock-up's coverage
- [ ] 20–25 hubs with hot core, inner glow and outer halo, sized by demand
- [ ] Sparse connection mesh plus 3–4 sweeping arcs
- [ ] Hubs pulse, and stop under `prefers-reduced-motion`
- [ ] Hover, click, category filters and both dropdowns work exactly as before
- [ ] Selected Area / Homes Sourced / Potential Rooms / Demand Intensity all still update
- [ ] Four icon statements and `human-insight.jpg` in the left column
- [ ] Disclaimer copy present verbatim, ONS attribution intact
- [ ] 60fps on hover; no console warnings
- [ ] `npm run lint` passes and `npm run build` succeeds
- [ ] Renders correctly at 375px, 768px, 1280px, 1600px — on mobile the map stacks above the statements

Report what changed, what the UK boundary source was, and any place the replica had to
compromise. **Do not commit or push.**
