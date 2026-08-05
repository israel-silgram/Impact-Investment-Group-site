# Impact Investment Platform — Website Project Brief

This file is the handover from a Claude Cowork session. Read it before doing any work
on this project. It contains the brand system, the client's meeting notes, an audit of
the current site, and the register of what is done, pending and blocked.

**Owner:** Callum Saxon (callum.saxon@impactig.co.uk)
**Manager / stakeholder:** Israel — the amendment requests below are his.
**Scope right now:** the homepage / landing page ONLY. Do not touch other pages.

---

## 1. What this project is

A marketing website for **Impact Investment Platform** — a UK supported-housing platform
connecting local authorities, housing associations, care and support providers, investors,
landlords and developers, with an AI-driven demand-matching layer.

Current build lives in Lovable and is published at
`https://impact-property-connect.lovable.app`.

There is a separate, much larger production codebase (`Impact-Investment-Platform`)
containing the existing site at `iip-frontend/iip-web/`. **That is not this project.**
Do not confuse the two.

---

## 2. Brand system — authoritative

Derived by sampling pixels from two approved mock-ups. These values are final unless
Callum says otherwise. Nothing in the codebase should use a hard-coded colour.

### Colour tokens

**The design system already exists** in `src/styles.css` under `@theme`. Do NOT invent new
token names — edit the existing ones. Components must never hard-code a hex.

The existing navy scale is correct and matches the mock-ups. Leave it alone:

```
--color-navy-950: #000b1c    --color-navy-900: #00112b   (page background)
--color-navy-800: #041c3d    --color-navy-700: #0a2a52    --color-navy-600: #143c6b
```

**Three corrections are required:**

| Token | Currently | Change to | Why |
|---|---|---|---|
| `--color-orange-500` | `#ee4d00` | `#ff7a29` | Mock-up 1 is the approved brand reference and its orange is amber, not the red-orange of Mock-up 2. `#ff7a29` is already in the file as `orange-400` — promote it. |
| `--color-orange-600` | `#d9430a` | `#e56600` | Button fills only. White on `#ff7a29` is 2.6:1 and fails; on `#e56600` it is 3.4:1 and passes for large text. |
| `--color-mist-bg` | `#ebf1f8` | `#f7f1e6` | This is the light-section background. It is currently pale **blue**. Israel asked for **cream**. This single change is most of what "add the cream" means. |

Add two new tokens alongside them:

```
--color-cream-card: #efe6d6;   /* cards sitting on the cream */
--color-orange-700: #c25400;   /* orange TEXT on cream — the only orange readable there */
```

### Working on cream — read before building any light section

Measured against `#f7f1e6`:

| Colour | Ratio | Verdict |
|---|---|---|
| `orange-500` `#ff7a29` | 2.3:1 | **FAIL** — icons and fills only, never text |
| `orange-600` `#e56600` | 3.0:1 | **FAIL** — do not use for text |
| `orange-700` `#c25400` | 4.1:1 | Large text only — headline emphasis, 26px+ |
| `teal-400` `#2fbaaa` | 2.1:1 | **FAIL** on cream (it is the on-navy teal) |
| `teal-500` `#1e9e8f` | 3.0:1 | **FAIL** for text |
| `teal-600` `#17796f` | 4.7:1 | **PASS** — eyebrows, stats, icon strokes, body |
| `navy-900` `#00112b` | 16.8:1 | **PASS** — default body text |

So on a cream section: body text is `navy-900`, eyebrows and stat figures are `teal-600`,
headline emphasis is `orange-700`, and `orange-500` survives only inside icon glyphs and
button fills. Icon rings become `rgba(0,17,43,0.18)`. Cards become white or `cream-card`
with a `border-on-cream`. The logo must use its `on-cream` variant.

The teal scale (`--color-teal-400: #2fbaaa` etc.) already exists and is fine. It is
under-used rather than missing — see the usage rules below.

`--primary` in the `:root` shadcn layer is `#ee4d00` and must follow `orange-500`.

### What each colour is for

Each colour has exactly one job. This is what stops the page drifting section to section,
which is the specific complaint Israel raised.

- **Navy** — structure only. Backgrounds and containers. Never an accent.
- **Orange** — human and action. People, care, hearts, CTAs, the single most important
  phrase in a headline.
- **Teal** — data and AI. All AI language, statistics, map network lines, data icons,
  charts. The technology voice.
- **Cream** — breathing room. Alternating light sections so the page isn't one dark slab.

### Hard accessibility rules (measured, not guessed)

| Combination | Ratio | Rule |
|---|---|---|
| White on navy-800 | 18.8:1 | Default body text |
| navy-800 on cream-100 | 16.8:1 | Default text on light sections |
| orange-500 on navy-800 | 7.2:1 | Safe for headings and body on navy |
| teal-400 on navy-800 | 7.4:1 | Safe for stats, labels, icons on navy |
| teal-600 on cream-100 | 5.3:1 | Safe for text and icons on cream |
| White on orange-600 | 3.4:1 | Button labels only, 16px semibold min |
| White on orange-500 | 2.6:1 | **NEVER.** This is why buttons use orange-600 |
| orange-500 on cream-100 | 2.3:1 | **NEVER for text.** Fills and icons only |

### Section rhythm

Alternate `navy-800` → `cream-100` → `navy-800` → `cream-100` down the page. Hero and the
demand map are always navy — the glow effects need darkness.

Section padding is identical everywhere: **96px desktop / 56px mobile.** No exceptions.
Content max-width 1200px, 24px gutters.

### Typography — use the fonts already installed

The project already loads Anton, Barlow, Inter Variable and JetBrains Mono, mapped to
`--font-display`, `--font-heading`, `--font-sans` and `--font-mono`. Use these. Do not
introduce a new typeface.

- `--font-heading` (**Barlow**) — all section headlines and the hero. This is what matches
  the mock-ups.
- `--font-sans` (**Inter**) — body copy, labels, UI.
- `--font-display` (**Anton**) — reserve for the very largest display moments only. Do not
  use it for ordinary section headings; it is too condensed and breaks the mock-up look.

```
Display   52px / 800 / letter-spacing -0.02em / line-height 1.1   (Barlow)
H1        36px / 700 / -0.01em                                    (Barlow)
H2        26px / 700                                              (Barlow)
H3        19px / 600                                              (Barlow)
Lede      17px / 400 / line-height 1.6                            (Inter)
Body      15px / 400 / line-height 1.65                           (Inter)
Eyebrow   12px / 600 / +0.14em tracking / UPPERCASE / teal         (Inter)
```

Headline emphasis = colouring one phrase orange. Never a second typeface, never underlines.
Body never below 15px. Line length capped at 68 characters.

**The colour proportion target documented in `styles.css` is correct — keep it:**
navy 70% · white/neutral 20% · teal 7% · orange 3%. Orange marks the one action a page
exists to get. Teal marks data, verification and secondary actions.

### Icon system

**Lucide icons only. No emoji anywhere on this site, ever. No AI-generated icon images.**

Spec: 24px icon centred in a 60px circle. Stroke 1.6px, rounded caps and joins. Ring is
1.5px at `rgba(255,255,255,0.28)` on navy, `rgba(0,17,43,0.18)` on cream. Icon stroke is
white on navy / navy-800 on cream, with **exactly one** detail element in the accent colour
— orange for human icons, teal for data icons. Never two accents. Never filled shapes.

Role icons: Investor `HandCoins` · Landlord `House` · Developer `Crane` · Housing Association
`House`+`Users` · Local Authority `Landmark` · Care Provider `HandHeart` · Support Provider
`UsersRound` · Social Worker `UserRound`+`Heart` · Broker `Handshake` · Resident `UserRound`

Conversational icons — Israel explicitly asked for these, paired with copy so statements and
questions feel human rather than flat:

| Moment | Icon | Accent |
|---|---|---|
| Asking a question / thinking | `MessageCircleQuestion` / `Lightbulb` | teal |
| Making a statement | `MessageSquareQuote` / `Megaphone` | orange |
| People in a meeting | `Users` / `Presentation` | orange |
| Care, purpose, affirmation | `Heart` / `HandHeart` | orange |
| AI / intelligence | `BrainCircuit` / `Sparkles` | teal |
| Data network | `Network` / `Share2` | teal |
| Trusted data source | `ShieldCheck` | teal |
| Working 24/7 | `Clock` | teal |
| National demand | `MapPin` / `Map` | orange |
| Live property database | `Database` | teal |
| Families | `Users` | orange |
| Children | `Baby` | orange |
| Hospital discharge | `Hospital` | orange |
| Waiting list | `ClipboardList` | orange |

**Replace every tick, checkmark and plain bullet on the site with an icon from this set.**

### Logo usage

The official mark is reproduced as a coded SVG in `src/components/logo.tsx`. It is a faithful
reconstruction of the approved artwork and should be used everywhere — never a raster image,
never a retyped wordmark. Reference crops of the official artwork are committed at
`public/images/logo-reference-mockup1.png` and `logo-reference-mockup2.png` for comparison.

**Anatomy** — a split ring (orange upper arc, neutral lower arc) enclosing an outlined house
with a chimney, containing two figures: a taller neutral adult on the left and a shorter
orange child on the right. Beside it, the stacked wordmark: "Impact" in neutral, "Investment"
in `orange-500`, and "Platform" beneath in wide-tracked caps flanked by two orange rules.

**Rules**

- **On navy** — neutral elements render white, orange unchanged. This is the default.
- **On cream** — neutral elements must render `navy-900`, orange unchanged. White-on-cream is
  invisible. The component needs a variant prop for this; do not place the navy-ground logo
  on a light section without it.
- The orange is never substituted, tinted or gradient-filled.
- The ring-and-house mark may be used alone as a favicon, avatar or compact header mark.
  **The wordmark is never used without the mark.**
- Minimum sizes: 32px for the mark alone, 140px wide for the full lockup.
- Clear space on all sides equals the height of the "I" in "Impact".
- Never stretch, rotate, skew, outline, add shadows, or apply effects.
- Never place the logo over a busy photograph without a scrim behind it.
- The logo is always the link to the homepage — there is no Home nav item.

### Imagery

Photoreal UK residential settings — Victorian terraces, brick, sash windows. Warm golden-hour
or soft interior lamplight with amber highlights tying back to the brand orange. Real people
mid-moment, natural diversity of age and ethnicity. 12px corner radius, 1px subtle border,
shallow depth of field. Images in the same row are always identical dimensions.

Never: generic corporate stock, cold blue-grey lighting, cut-out people on flat backgrounds,
duotones, colour overlays, visible AI artefacts.

### Components

- **Primary button** — orange-600 fill, white 16px semibold, fully rounded pill, 13px/26px
  padding, optional right arrow.
- **Secondary button** — transparent, 1.5px white border at 40% opacity. Only beside a primary.
- **Data button** — teal-600 fill. Platform, demo and map actions only.
- **Card on navy** — navy-700 fill, 1px border-on-navy, 14px radius, 20–24px padding.
- **Card on cream** — white fill, 1px border-on-cream, 14px radius, 20–24px padding.
- **Stat figure** — 44px/800, teal-400 on navy or teal-600 on cream, 13px uppercase label
  at +0.12em tracking.
- **Hover** — 200ms ease-out. Cards lift 2px and lighten one navy step.

---

## 3. Navigation — confirmed, not yet implemented

```
Logo (links to homepage) · About Us · Our Services · The Problem ·
The Solution · Contact Us · [Register Here] · Login
```

- **No Homepage tab** — the logo is the home link.
- Nav links 15px/500, white on navy, orange underline on hover, orange when active.
- **Register Here** is a primary pill button (orange-600).
- **Login** is a plain text link, far right, lighter weight.
- **"Book a Demo" must be removed from the entire site** — every instance, every section,
  every footer. It currently appears in the nav, the Live UK Demand section and the final CTA.

---

## 4. Agreed homepage structure

| # | Section | State |
|---|---|---|
| 1 | **Hero** — identical to Mock-up 1 | Built, needs brand pass |
| 2 | **Our Purpose \| The Problem** — ONE section, purpose left, problem right | Not merged yet |
| 3 | **Our Solution** | Needs AI content |
| 4 | **The Accountable Chain Behind It** | Keep as-is |
| 5 | **Live UK Demand** — the map | Needs restyle to Mock-up 2 |
| 6 | **Who We Connect** — condensed band | Done |
| 7 | **Join the UK's Housing, Care and Support Ecosystem** | Keep |
| 8 | **Footer** | Needs scrolling local authorities |

**Deleted and staying deleted:** the process strip · How the Ecosystem Works · the
"Providing homes / three AI images" band · Success Stories.

**Deleted TEMPORARILY — must come back:** the **AI Platform** section
("Intelligence That Supports Better Decisions") and its Matches / Demand / Placements
demo panel. Removed only because the copy is pending from Israel. Reinstate once it lands.

---

## 5. Israel's meeting notes — the source requirements

### Global
- Remove "Book a Demo" everywhere.
- Mock-up 1 is the approved direction — implement it.
- Consistency of colours and branding. Cream is a core colour.
- Create a brand kit file. (Done — this document plus the brand kit HTML.)
- Vibrancy matters: teal, cream, white alongside the navy and orange.
- **Every section must be a mini-breakdown of Mock-up 1** — same colour treatment, same
  branding, same imagery quality. Not "similar". Identical.
- Consistent font sizing, imagery and icon style throughout.
- Icons not emoji. Match the icon to the tone: thinking-person for questions,
  speaking/meeting for statements. Visual, interactive, affirming — like human conversation.
- Introduce people-based icons alongside sentences, paragraphs, statements and questions.

### Our Purpose | The Problem (one section)
Purpose: **to ensure that every person has a home to live in.** Support it with data,
presented in boxes:
- Homes needed to alleviate UK homelessness
- Homes needed for hospital discharge
- Homes needed for local authority waiting lists
- Homes needed for children (children's homes)
- Homes to be built over 5 years
- Capital required to deliver (£ figure)

Plus a statement that the platform is building a national AI-driven [wording pending].
Imagery: the de-anchored hero image from the old iip-web site, as a full-width band.

### Our Solution
- Icons instead of ticks for bullet points.
- Bring AI to the front. Keywords: **demand-led · AI-driven intelligence · qualified,
  intelligent AI data.**
- Say what the platform actually is and does: demand-led, AI-driven intelligence data
  connects all organisations, saves time and money, connects people, gets solutions to
  market far faster than conventional means.
- Headline statement: *"Our platform works 24/7 to create seamless, intelligent matching,
  ensuring all partners have the resources, solutions and opportunities to deliver
  individual and national impact."*
- Three boxes with icons drawing on: AI data · national demand · trusted data sources ·
  Zoopla partnership · access to 1 million homes · national database of live available
  property · live AI API · partners Zoopla and HomeSource.
- Footer: scrolling local authority names/logos — interactive element at the bottom.

### Live UK Demand
- **The map must match Mock-up 2** — the glowing particle/network UK map on deep navy with
  orange hotspot nodes and connecting arcs. Keep the existing interactivity, restyle the
  visuals.
- Use the space to the LEFT of the map for **3–4 icon bullet points** with short statements:
  AI-driven data, demand-led from local authorities, connecting partners to demand — how it
  works, how it benefits the user, how it benefits the world.
- Demand categories need icon consistency with the rest of the site.
- **Add categories:** local authority waiting list, children. (Families already exists.)
- Region & Local Authority dropdown: add a note that this is illustrative for demonstration
  purposes; the real platform performs detailed data analysis and connections. Frame it as a
  taster with a near-perfect demo available.
- A carousel is wanted within this section.

### Landing page structure
The landing page should be a **summary/snapshot of each of the six nav pages**, each linking
through to its full page. **This has not been built or specified yet.**

---

## 6. Data already on the site (verified, cited)

Do not invent numbers. These are already present and sourced:

| Figure | What | Source |
|---|---|---|
| 176,130 | Children in temporary accommodation in England | gov.uk, at 31 Dec 2025 |
| 330,410 | Households owed a homelessness duty, 2024–25 | gov.uk, full year 2024–25 |
| 677,202 | Supported homes England needs by 2040 | National Housing Federation, Apr 2024 |
| £102m/yr | NHS cost of people waiting in hospital for supported housing | Inside Housing, Apr 2026 |
| 430% | Rise in council B&B emergency accommodation spend, 2010/11–2019/20 | LGA, Jul 2021 |

---

## 7. Blocked — needed from Israel before these can be finished

1. Exact AI / data-driven platform wording
2. Local authority waiting list figure
3. Children's homes figure
4. Homes to build in 5 years target
5. Capital required / fundraising figure
6. The three ChatGPT links containing the full site content
7. Confirmation of the teal shade

Render every missing figure as literal bracketed placeholder text — e.g. `[FIGURE TBC]` —
so it is obvious it is pending. **Never invent a number on this project.**

---

## 8. Working rules

- Homepage only. Do not touch other pages without being asked.
- No emoji anywhere in the product.
- No fabricated data, statistics or citations.
- Every section must pass the Mock-up 1 consistency test before it is considered done.
- When a section is finished, state which of Israel's notes it satisfies and which remain open.
