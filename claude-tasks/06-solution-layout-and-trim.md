# Task 06 — Move the AI statement, remove the Accountable Chain, fix the rhythm

Read `CLAUDE.md` first. Tasks 01–05 are complete. This is a short structural task. Task 07
handles the demand map.

---

## Part A — Move the AI platform statement into Our Solution

Right now the AI statement sits in its own full-width cream band, alone, containing only
`[AI-DRIVEN PLATFORM STATEMENT — TBC]`. A whole section for one placeholder — it reads as a
mistake.

**Delete that standalone band entirely.**

Move the statement panel into the **Our Solution** section, into the empty space to the
**right of the "One Platform. One Network. One Shared Purpose." headline**. That area is
currently dead space roughly half the section width.

Layout for the top of Our Solution — two columns:

- **Left (≈55%)** — eyebrow, headline, and the platform description paragraph. Unchanged.
- **Right (≈45%)** — the AI statement panel.

The panel: `navy-800` fill, 14px radius, 28px padding, 3px left border in `teal-400`. Inside,
a `BrainCircuit` icon at 26px in `teal-400`, then the statement at H3 scale in white.

Keep `[AI-DRIVEN PLATFORM STATEMENT — TBC]` as the literal placeholder text. **Do not invent
wording.** It is still pending from the client.

Vertically align the panel's top edge with the headline's top edge, not the section top.

---

## Part B — Remove "The Accountable Chain Behind It" from the homepage

The client wants the homepage to work as a marketing landing page, not a detail page.

**Remove the section from the homepage.** Do not delete the content — move it to the About Us
page (`src/routes/about.tsx`), which is where a governance and delivery-structure explanation
belongs. If About Us already covers this ground, merge rather than duplicate.

The three companies — Impact Investment Group, Rhema Social Impact Group, Elevate Supported
Living — plus the CQC registration note must survive somewhere on the site. They are the
credibility answer to "who actually delivers this?", which institutional investors and local
authorities will ask. Losing them entirely would weaken the proposition.

Add a single line at the end of Our Solution linking through:

> Delivered through three accountable partners — [read how it works](/about)

---

## Part C — Reorder to keep the cream rhythm intact

Removing a section breaks the alternation. With the Accountable Chain gone, Our Solution
(navy) would run straight into Live UK Demand (navy) — two dark sections back to back, which
is the exact problem the client has raised repeatedly.

**Move "Who We Connect" above "Live UK Demand".** New order:

| # | Section | Background |
|---|---|---|
| 1 | Hero | `navy-900` |
| 2 | Our Purpose \| The Problem | `cream-100` |
| 3 | Our Solution | `navy-900` |
| 4 | **Who We Connect** ← moved up | `cream-100` |
| 5 | Live UK Demand | `navy-900` — must stay dark for the map glow |
| 6 | Join the UK's Housing, Care and Support Ecosystem | `cream-100` |
| 7 | Footer | `navy-900` |

That restores clean navy / cream / navy / cream / navy / cream / navy.

It also reads better: purpose → problem → solution → who is in the ecosystem → proof of
demand → join. The demand map lands immediately before the call to action, which is where
the strongest evidence should sit.

### Section 6 turning cream

The final CTA moves from navy to cream. Everything in it must be re-checked against the
cream contrast table in `CLAUDE.md`:

- Headline → `navy-900`
- Body → `navy-900` at 75%
- The seven benefit lines → icons keep `orange-500` / `teal-600` glyphs, rings become
  `rgba(0,17,43,0.18)`, text `navy-900`
- "Register Here" primary button → `orange-600` fill, white text. This still works on cream:
  it is a fill, not text on cream.
- "Contact Us" secondary button → `teal-600` border and text, not white
- "Become a Partner" → `navy-900` text
- Any logo → `on-cream` variant

---

## Definition of done

- [ ] The standalone AI statement band is gone
- [ ] The AI panel sits to the right of the Our Solution headline, top-aligned with it
- [ ] `[AI-DRIVEN PLATFORM STATEMENT — TBC]` still renders literally
- [ ] The Accountable Chain is off the homepage and present on About Us
- [ ] Our Solution links to `/about` for the delivery structure
- [ ] Section order matches the table above
- [ ] Rhythm alternates navy / cream with no two same-coloured sections adjacent
- [ ] Nothing on a cream section uses white text, `teal-400`, or orange text below `orange-700`
- [ ] `npm run lint` passes and `npm run build` succeeds
- [ ] Renders correctly at 375px, 768px, 1280px, 1600px

Report what changed and where the Accountable Chain content ended up.
**Do not commit or push.**
