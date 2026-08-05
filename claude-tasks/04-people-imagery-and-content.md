# Task 04 — Human + AI imagery, and the client's approved narrative

Read `CLAUDE.md` first. Tasks 01–03 are complete. This task places six new photographs and
folds in newly approved copy from the client.

**Content principle for this task: the site currently has too much text. Where you add
something, cut something. Prefer fewer, stronger statements over more content.**

---

## Part A — Place the six human + AI photographs

Six images are committed at `public/images/`. They are photoreal people with a restrained
teal data-network overlay — the visual language of "human plus AI" the client asked for.

| File | Shows | Orientation |
|---|---|---|
| `human-thinking.jpg` | Woman at a desk, chin on hand, looking up in thought | Landscape |
| `human-thinking-portrait.jpg` | Same idea, tighter, portrait crop | Portrait |
| `human-statement.jpg` | Man gesturing with an open palm, mid-sentence | Landscape |
| `human-meeting.jpg` | Four colleagues around a laptop, engaged | Landscape |
| `human-partnership.jpg` | Two professionals shaking hands | Portrait |
| `human-insight.jpg` | Woman in profile facing a glowing teal network | Landscape |

### Placement

| Section | Image | Treatment |
|---|---|---|
| Our Purpose \| The Problem | `human-thinking-portrait.jpg` | Right column, beside The Problem copy. Portrait, 12px radius, 1px border. The "thinking" pose is deliberate — it pairs with a section about a question the industry has not answered. |
| Our Solution | `human-statement.jpg` | Beside the 24/7 platform statement. This is the site's strongest assertion and needs a person making it. |
| Live UK Demand | `human-insight.jpg` | Left column, above the four icon statements. Her sightline points into the map — place it so she faces the map, not away from it. |
| The Accountable Chain Behind It | `human-partnership.jpg` | Beside the three company cards |
| Who We Connect | `human-meeting.jpg` | Behind or beside the condensed band |

`human-thinking.jpg` is a spare. Do not force it in.

### Rules

- 12px corner radius, 1px border, matching every other image on the site.
- Never stretch. Use `object-fit: cover` with sensible focal positioning.
- These sit on **navy** sections. Their backgrounds are dark and warm, so they blend well.
- Do not add colour overlays, duotones or filters. They are already brand-matched.
- Every one needs meaningful `alt` text describing the person and action.

### ⚠️ One image needs fixing

`human-partnership.jpg` has an **olive-yellow background** that clashes badly with the navy
palette — it is the only one of the six that is off-brand. Options, in order of preference:

1. Place it with a navy gradient scrim over the background so the olive is suppressed
2. Mask the subjects and composite them onto `navy-900`
3. Leave it out and note it in your report — I will have it regenerated

Do not ship it looking olive against navy.

---

## Part B — Approved narrative from the client

The following is approved wording. Use it, but **cut existing copy to make room** — the
client has explicitly said there is too much content.

### Mission — use in Our Purpose

> To unlock private investment to help solve the UK's housing, care and support challenges
> while delivering strong, sustainable financial returns alongside measurable social impact.

### Vision — use in the final CTA section

> To become the UK's national infrastructure for social impact investment — unlocking
> private capital to transform housing, care and support at scale.

### Platform description — replaces the current Our Solution intro

> Impact Investment Group is building the UK's AI-powered social impact property platform,
> connecting investors, property owners, developers, housing associations, local authorities
> and organisations delivering care, support and supported living through one intelligent,
> integrated ecosystem.

Then, as the mechanism statement:

> Our demand-led, data-driven AI platform connects private investment with verified housing
> demand — intelligently aligning the right property, the right funding, the right housing
> association, the right local authority and the right care and support provider.

**Delete** the existing "Impact Investment Platform has been designed to become the digital
infrastructure…" paragraph. The new wording says the same thing better and shorter.

### Revenue streams — new, add only if it fits naturally

The platform generates recurring revenue across technology, property, care, support and
education. This is investor-facing. If there is no natural home for it on the homepage,
leave it out and note that in your report — do not force it in.

---

## Part C — New figures, NOT yet publishable

The client supplied three figures. **Only one is safe to use.**

| Figure | Status | Action |
|---|---|---|
| 176,000+ children in temporary accommodation | ✅ Already on the site as **176,130**, sourced to gov.uk | Keep the existing sourced version. Do not replace it with the rounded number. |
| **4.2 million people affected by housing need** | ⚠️ No source. Client's own wording says "an estimated" | **Do not publish.** Add as `[4.2M — SOURCE REQUIRED]` in a code comment only, not on the page. |
| **80,000+ families without settled housing** | ⚠️ No source | **Do not publish.** Same treatment. |

`CLAUDE.md` rule stands: no fabricated or unsourced statistics, ever. These two numbers are
credible and probably correct, but they need a citation before they go on a public site
making investment claims. Flag them in your report so I can chase the source.

---

## Part D — Trim

While you are in the content files, the client wants less text overall. Look for:

- Paragraphs over four lines that could be two
- Bullet lists over six items that could be four
- Any statement repeated in two sections — keep the stronger one, delete the other
- Copy that explains the same idea twice in consecutive sentences

Report what you cut. **Do not cut any sourced statistic, citation, source line, compliance
wording or crisis contact details.** Those stay regardless of length.

---

## Definition of done

- [ ] All six images placed, or a documented reason why one was not
- [ ] `human-partnership.jpg` does not read olive against navy
- [ ] Every image has a 12px radius, 1px border and real alt text
- [ ] Mission, vision and platform description in place, with the old intro paragraph deleted
- [ ] The 4.2M and 80,000 figures are NOT on the rendered page
- [ ] 176,130 remains with its gov.uk citation intact
- [ ] Net word count on the homepage has gone **down**, not up
- [ ] `npm run lint` passes and `npm run build` succeeds
- [ ] Renders correctly at 375px, 768px, 1280px, 1600px

Report what changed, what you cut, what you could not do, and which client notes this
satisfies. **Do not commit or push.**
