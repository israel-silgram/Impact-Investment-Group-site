# Task 03 — Logo usage and killing every tick

Read `CLAUDE.md` first — it has been updated with a new **Logo usage** section. Tasks 01 and
02 are complete. This task has two parts, both small but both client-flagged.

---

## Part A — Logo

The logo is already a coded SVG in `src/components/logo.tsx` and it is a faithful
reconstruction of the official mark. **Do not replace it with an image file.**

Two reference crops of the official artwork are committed for comparison:

```
public/images/logo-reference-mockup1.png
public/images/logo-reference-mockup2.png
```

### A1. Fix the cream-background bug

The logo currently renders its neutral elements in **white**, hard-coded via `text-white`.
That is correct on navy and **invisible on cream**. As more cream sections land, this will
break.

Add a variant to the component:

```tsx
export function Logo({ className, variant = "on-navy" }: {
  className?: string;
  variant?: "on-navy" | "on-cream";
})
```

- `on-navy` — neutral elements `text-white` (current behaviour, unchanged)
- `on-cream` — neutral elements `text-navy-900`

Orange is `orange-500` in both variants and never changes.

Audit every place the logo is rendered — header, footer, anywhere else — and pass the
correct variant for the background it sits on.

### A2. Verify against the reference

Open `public/images/logo-reference-mockup1.png` and compare. Check specifically:

- The orange arc sits on the **upper** portion of the ring; the lower arc is neutral
- The house has a **chimney** on the right slope of the roof
- Two figures inside: **taller neutral adult on the left, shorter orange child on the right**
- "Impact" neutral, "Investment" orange
- "Platform" in wide-tracked uppercase, flanked by two orange rules

Correct anything that has drifted. Do not redesign it — match the reference.

### A3. Favicon

`public/favicon.png` predates the token change. Regenerate it from the ring-and-house mark
alone (no wordmark) on a `navy-900` background, using `orange-500` `#ff7a29`. If you cannot
generate a PNG, note it in your report and I will supply one.

---

## Part B — Replace every tick with a brand icon

The client has raised this twice. Plain checkmarks are still all over the site and they must
all go. This is the single most visible remaining inconsistency.

### Find them

```
rg -n "Check|check" src/components src/content src/routes
```

Look for `Check`, `CheckCircle`, `CheckCircle2`, `Check2`, `BadgeCheck` and any literal `✓`
or `✔` characters, plus any list rendering a generic bullet or tick marker.

### Replace them

Every one becomes a **Lucide icon in a circle ring**, per the icon spec in `CLAUDE.md`:
26px icon in a 56px ring, stroke 1.6px, neutral stroke with exactly one detail element in the
accent colour. There is an existing `src/components/ui/icon-circle.tsx` — use it rather than
building a new one.

**Our Solution — "One Platform. One Network. One Shared Purpose."**

| Line | Icon | Accent |
|---|---|---|
| Share verified housing demand | `Share2` | teal |
| Identify suitable properties | `Search` | teal |
| Connect with Housing Associations | `Building2` | orange |
| Match Care and Support Providers with available accommodation | `HandHeart` | orange |
| Introduce investors to demand-led opportunities | `HandCoins` | orange |
| Track placements | `MapPin` | teal |
| Measure outcomes | `TrendingUp` | teal |
| Demonstrate social impact | `Heart` | orange |

**Final CTA — "Join the UK's Housing, Care and Support Ecosystem"**

| Line | Icon | Accent |
|---|---|---|
| Build more homes | `Crane` | orange |
| Deliver better support | `HandHeart` | orange |
| Connect investment with verified need | `Network` | teal |
| Strengthen communities | `Users` | orange |
| Improve outcomes | `TrendingUp` | teal |
| Create lasting social impact | `Heart` | orange |
| Transform lives | `Sparkles` | teal |

**Anywhere else you find a tick** — pick the closest icon from the table in `CLAUDE.md`.
Teal for anything about data, AI, measurement or verification. Orange for anything about
people, homes, care or action. Never two accents in one icon.

### Layout note

These lists currently run as dense inline rows. With icons they need room to breathe — use a
grid, 2 columns on desktop and 1 on mobile, 16px gap, icon left and text vertically centred
beside it. Do not let the icons shrink below 24px or the ring below 48px.

### Accent balance

The documented proportion target in `styles.css` is navy 70% / neutral 20% / teal 7% /
orange 3%. Adding this many icons risks tipping it. Once done, step back and check the page
does not read as orange-heavy — if it does, move the more neutral lines to teal.

---

## Rules

- No emoji anywhere. Lucide icons only.
- Tokens only — no hard-coded hex.
- Do not touch copy in this task. Icons and logo only.
- Do not reinstate How the Ecosystem Works or the AI Platform section. Both are deliberately
  removed. There is no Home nav item — the logo is the home link. These three decisions are
  confirmed by the client.

## Definition of done

- [ ] `Logo` accepts a variant and renders correctly on both navy and cream
- [ ] Every logo instance passes the correct variant for its background
- [ ] Logo matches the reference crops
- [ ] Favicon regenerated, or flagged in the report
- [ ] `rg "Check|✓|✔" src/` returns no tick used as a bullet marker
- [ ] Every former tick is a Lucide icon in a circle ring with a single accent
- [ ] Icon lists laid out with room to breathe, 2-up desktop / 1-up mobile
- [ ] Page does not read as orange-heavy
- [ ] `npm run lint` passes and `npm run build` succeeds
- [ ] Renders correctly at 375px, 768px, 1280px, 1600px

Report what changed, anything you could not do, and which client notes this satisfies.
**Do not commit or push.**
