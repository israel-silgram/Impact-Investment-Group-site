# WAVE 295 · Register to join the waitlist

**Branch** `feat/wave295-register-to-join-the-waitlist`, off `origin/main` at `8f15cdb`.
**`main` was not pushed, merged or rebased.** Cowork pushes `main` once wave 294's endpoint is live.

Callum, 9 Sep 2026: match the site's orange to the platform's, change the button to
"Register to join the waitlist", make the ten hero tiles say "Register to join the waitlist as"
and land on a registration page that asks each user type its own questions, invite email and SMS
alerts, and make the writing persuasive enough to convert before the platform is live.

---

## 1 · The plan, as measured

1. The tokens are in `src/styles.css` `@theme`; `--primary` shadows `orange-500`; there is no hex in a component.
2. The platform's live orange is `#C15F3C`, NOT the `#C6613F` the brief names. Section 2 is the evidence.
3. `registerRoute` is one object drawn in four places (header, mobile drawer, page shell, footer) plus `/platform`'s closing band. Change it once.
4. The hero's ten tiles scattered into `/solutions#anchor` and `/contact`; they all become `/register/<id>`.
5. The router is TanStack file-based: `register.index.tsx` is `/register`, `register.$role.tsx` is `/register/:role`, `routeTree.gen.ts` regenerates on build.
6. Forms post cross-origin because the deployed site is static and has no server; the live path is `{apiBase}/public/<name>`, with no `/api` segment.
7. The prerender list in `vite.config.ts` must gain eleven pages, and the sitemap route the same.
8. `react-hook-form` + `zod` + `@hookform/resolvers` are all present; no new dependency is needed.
9. The role glyph map lives inside `hero.tsx`; the picker needs the same glyphs, so it must move out rather than be copied.
10. Every question is optional, so the schema has to accept what an untouched control reads back as.
11. The site has no privacy notice page to link to.
12. Screenshots need a real pre-wave build, so the "before" is built from `8f15cdb` with the new files removed.

---

## 2 · R295-1 · The orange

### The brief names the orange the platform retired

R295-1 says `orange-500` becomes `#C6613F` and that white on it measures about 5.3:1.
Both are wrong, and the platform's own repository is the witness:

- `docs/DESIGN_SYSTEM.md`: "Wave 15 normalised the brand orange to a token, and **wave 34 moved that token's value to `#C15F3C`**. The value moved; 209 declarations in the two token files and another 88 across the component stylesheets did not, because they carried the retired orange as the raw literal `rgba(198, 97, 63, α)`." (198, 97, 63 is `#C6613F`.)
- `.claude/skills/iip-web-design/SKILL.md`: "Wave 55 existed because `#C6613F` (**the orange retired in wave 15**) was still hard-coded 297 times ... `src/__tests__/brandKitV3Law.test.js` now **fails the build on a reintroduction**."
- `docs/BRAND_KIT.md` `--brand-primary` is **`#C15F3C`**, `--brand-primary-ink` is **`#AE4E30`**.

Measured: white on `#C6613F` is **4.05:1**, not 5.3:1. **5.34:1 is `#AE4E30`'s figure**, which is where the
brief's number came from. Shipping `#C6613F` would have put the one orange the platform explicitly
killed onto the marketing site, in the wave whose entire point is that the two match.

**So the site takes the platform's live ramp.** This is the ruling's intent (`"The orange is the
platform's"`) served against the platform's actual tokens rather than a stale transcription of them.
Flagging it rather than silently substituting: if you want `#C6613F` anyway, say so and it is a
one-line change to `styles.css`.

### The ramp

| Token | Was | Now | Where it comes from | Job |
|---|---|---|---|---|
| `--color-orange-400` | `#ff7a29` | ~~`#f0a886`~~ **RETIRED** | the kit's light terracotta | it carried orange text on navy for one day. Callum removed it: see section 11, "One orange". |
| `--color-orange-500` | `#ff7a29` | **`#c15f3c`** | the platform's `--brand-primary` | fills, marks, icon glyphs, large headline words |
| `--color-orange-600` | `#e56600` | **`#ae4e30`** | the platform's `--brand-primary-ink` | the button fill |
| `--color-orange-700` | `#c25400` | **`#9a4429`** | derived here | orange body text on the cream |
| `--primary` | `#ff7a29` | **`#c15f3c`** | follows `orange-500` | shadcn layer |
| `--chart-4`, `--sidebar-primary` | `#ff7a29` | **`#c15f3c`** | followed the amber as raw literals | |

`orange-700` is derived and not lifted, because the platform has no ground as dark as this site's
cream `#f7f1e6` and therefore has no token for body text on it. It is `orange-600` taken down one
step until it cleared 4.5:1 with room to spare on all three light grounds.

⚠️ **`orange-400` no longer exists.** Everything below in this section is the wave as first built,
with a lighter tint carrying small orange text on navy. Callum read it and ruled that one orange
serves every word and every button. Section 11 is what replaced it, and the FAILS rows below that
name `orange-400` are kept only because they are why it was there.


### The contrast table, measured

Generated by `scripts/wave295-contrast.cjs`, computed from the hexes, before beside after.
WCAG: **4.5:1** normal text, **3:1** large text (24px, or 18.66px bold) and non-text marks (1.4.11).

### Every pair the orange tokens touch

| Foreground | Ground | Before | After | After verdict |
|---|---|---:|---:|---|
| `orange-500` `#c15f3c` | navy-950 `#000b1c` | 7.58:1 | **4.67:1** | AA any size |
| `orange-600` `#ae4e30` | navy-950 `#000b1c` | 5.85:1 | **3.69:1** | AA large text / non-text only |
| `orange-700` `#9a4429` | navy-950 `#000b1c` | 4.29:1 | **3.04:1** | AA large text / non-text only |
| `orange-500` `#c15f3c` | navy-900 `#00112b` | 7.24:1 | **4.46:1** | AA large text / non-text only |
| `orange-600` `#ae4e30` | navy-900 `#00112b` | 5.59:1 | **3.53:1** | AA large text / non-text only |
| `orange-700` `#9a4429` | navy-900 `#00112b` | 4.09:1 | **2.90:1** | FAILS |
| `orange-500` `#c15f3c` | navy-800 `#041c3d` | 6.51:1 | **4.01:1** | AA large text / non-text only |
| `orange-600` `#ae4e30` | navy-800 `#041c3d` | 5.03:1 | **3.17:1** | AA large text / non-text only |
| `orange-700` `#9a4429` | navy-800 `#041c3d` | 3.68:1 | **2.61:1** | FAILS |
| `orange-500` `#c15f3c` | navy-700 `#0a2a52` | 5.50:1 | **3.39:1** | AA large text / non-text only |
| `orange-600` `#ae4e30` | navy-700 `#0a2a52` | 4.25:1 | **2.68:1** | FAILS |
| `orange-700` `#9a4429` | navy-700 `#0a2a52` | 3.11:1 | **2.21:1** | FAILS |
| `orange-500` `#c15f3c` | cream (mist-bg) `#f7f1e6` | 2.32:1 | **3.76:1** | AA large text / non-text only |
| `orange-600` `#ae4e30` | cream (mist-bg) `#f7f1e6` | 3.00:1 | **4.75:1** | AA any size |
| `orange-700` `#9a4429` | cream (mist-bg) `#f7f1e6` | 4.09:1 | **5.78:1** | AA any size |
| `orange-500` `#c15f3c` | cream-card `#efe6d6` | 2.10:1 | **3.41:1** | AA large text / non-text only |
| `orange-600` `#ae4e30` | cream-card `#efe6d6` | 2.72:1 | **4.31:1** | AA large text / non-text only |
| `orange-700` `#9a4429` | cream-card `#efe6d6` | 3.72:1 | **5.25:1** | AA any size |
| `orange-500` `#c15f3c` | white `#ffffff` | 2.60:1 | **4.23:1** | AA large text / non-text only |
| `orange-600` `#ae4e30` | white `#ffffff` | 3.37:1 | **5.34:1** | AA any size |
| `orange-700` `#9a4429` | white `#ffffff` | 4.60:1 | **6.50:1** | AA any size |

### Text ON an orange fill

| Foreground | Fill | Before | After | After verdict |
|---|---|---:|---:|---|
| white | `orange-500` `#c15f3c` | 2.60:1 | **4.23:1** | AA large text / non-text only |
| white | `orange-600` `#ae4e30` | 3.37:1 | **5.34:1** | AA any size |
| white | `orange-700` `#9a4429` | 4.60:1 | **6.50:1** | AA any size |
| navy-900 | `orange-500` `#c15f3c` | 7.24:1 | **4.46:1** | AA large text / non-text only |
| navy-900 | `orange-600` `#ae4e30` | 5.59:1 | **3.53:1** | AA large text / non-text only |
| navy-900 | `orange-700` `#9a4429` | 4.09:1 | **2.90:1** | FAILS |

### The hero's ghosted street, worst case

| Foreground | Before | After | After verdict |
|---|---:|---:|---|
| white `#ffffff` | 13.30:1 | **13.30:1** | AA any size |
| orange-500 `#c15f3c` | 5.11:1 | **3.15:1** | AA large text / non-text only |
| orange-600 `#ae4e30` | 3.95:1 | **2.49:1** | FAILS |
| orange-700 `#9a4429` | 2.89:1 | **2.05:1** | FAILS |

### The retired hex the brief named

| Pair | Ratio |
|---|---:|
| white on `#C6613F` (brief's value) | **4.05:1** |
| white on `#C15F3C` (the platform's live `--brand-primary`) | **4.23:1** |
| white on `#AE4E30` (the platform's `--brand-primary-ink`) | **5.34:1** |

**Reading the FAILS rows: none of them occur.** Audited with `grep` across `src`:

- `orange-700` is used only inside `.section-light` sections (about, platform, solutions, contact, partners, the footer's cream band). It never touches navy.
- `orange-400` is used only on navy grounds (the header, the hero headline, form error text, the delivery spine). It never touches cream, and `.section-light` would rewrite it to navy ink if it did.
- `orange-600` on navy exists only as a **fill** (the header's Partners panel, the primary button), never as text, so it answers to the 3:1 non-text floor.

### What moved, and what had to move with it

**Better than before:**

- **The primary button.** White on `orange-600` was **3.4:1**, AA for large text only, which is why `button.tsx` locks the label at 16px semibold. It is now **5.34:1** and passes at any size. The lock stays; it is a primary action, not a small control.
- **Orange text on the cream.** `orange-700` was **4.1:1**, large text only. It is now **5.78:1** and passes at body size. Three separate size floors in the codebase existed only to satisfy the old figure: `about.tsx`'s 20px claim line, `platform.tsx`'s 19px emphasis and `content/about.ts`'s "the orange has to live on the first line". **The code is unchanged** and the floors stay, because they are also typographic decisions and this wave does not move other pages (R295-6). Their comments now say they are choices rather than requirements, so whoever revisits them knows which they are.

**Worse, and dealt with:**

`orange-500` on navy fell from **6.51:1** to **4.01:1**. That still clears the 3:1 floor for large text
and for non-text marks, which covers the glow, the map hotspots, the logo's orange, the divider rules
and every icon glyph. It does NOT clear 4.5:1 for small text, and four places on the site were setting
small orange text on navy. All four are in files this wave owns, and all four now take `orange-400`:

| Place | Size | Was | Now |
|---|---|---|---|
| `styles.css` `.nav-link[data-status=active]` label | 15px | 6.51:1 | **8.60:1** |
| `site-header.tsx` Partners numerals | 9px mono | 6.51:1 | **8.60:1** |
| `site-header.tsx` mobile drawer numerals | 10px mono | 6.51:1 | **8.60:1** |
| `site-header.tsx` mobile drawer active label | 28px | 6.51:1 | **8.60:1** |

The 2px `.nav-link` underline **keeps `orange-500`**: it is a non-text mark at 4.01:1, and it is what
holds the brand terracotta in the chrome.

Two more, both measured and both handled:

- **The hero's orange headline word** sits over the ghosted street photograph, where the terracotta measures **3.15:1** against the brightest pixel of the composite. It clears the 3:1 large-text floor with nothing left over, over a photograph. It takes `orange-400` at **6.75:1**. *This is the one visible aesthetic change you may want to argue with: "Delivering Support" is now a lighter terracotta than the fills around it. See `hero-after-*.webp`.*
- **The header's Partners dropdown panel** was `bg-orange-500` with navy-950 text at 12px. Navy on the terracotta is 4.46:1, a hair under the 4.5:1 floor for that size. It is now `bg-orange-600` with **white at 5.34:1**, which is also what the platform's own white-on-orange law requires.

`--destructive` stays `#d9430a` and is deliberately not a brand orange, so a failed field never reads
as a call to action. It is now more saturated than the brand orange rather than less, which if
anything sharpens the distinction.

**Nine comments across the codebase quoted the old ratios.** They are corrected, comment-only, no
behaviour: `director-card.tsx` (its whole contrast table), `site-footer.tsx`, `about.tsx` (three),
`content/about.ts`, `platform.tsx`, `solutions.tsx`, `delivery-spine.tsx`, `button.tsx` (two).
A comment that states a wrong measurement is worse than no comment, because the next person sizes a
heading by it.

---

## 3 · R295-2 · The labels

| | Before | After |
|---|---|---|
| `registerRoute.label` | `Register Here` | **`Register to join the waitlist`** |
| `registerRoute.to` | `/contact` with `?enquiry=waitlist` | **`/register`** |
| The hero divider | `Register as` | **`Register to join the waitlist as`** |
| The ten tiles | `/solutions#anchor` (nine) and `/contact?enquiry=support` (resident) | **`/register/<role id>`** (all ten) |

One string, drawn in the header, the mobile drawer, the page shell, the footer and `/platform`'s
closing band, so the button cannot say three different things. Still one action per page.

**Refuter: the string `Register Here` appears nowhere in `src`, comments included.** The last one was
a comment in `hero.tsx` describing the button above the Zoopla credit.

---

## 4 · R295-3 and R295-4 · The flow

### The two routes

- **`/register`**: the heading, one line of lede, the ten tiles, one closing line. Nothing else, per R295-3. **No orange action on the page**: the tiles are the action, and a primary button beside them would be an eleventh choice competing with the ten. The header button is chrome and sits outside the count.
- **`/register/<role>`**: one `h1`, the role's lede, three reasons to join now, its own questions, contact details, the two alert boxes, the privacy line, submit. Ten ids, a closed set: anything else is a `notFound()`, so a mistyped or retired link fails loudly rather than rendering an empty page.

The resident page is **help and not sales**: no price band, no early-access offer, and the crisis
numbers sit above the questions rather than only in the footer, rendered from `crisisLines` in
`content/site.ts` so there is one copy of each number.

### The payload, printed by the code that builds it

`scripts/wave295-payload-example.ts` calls the same `buildWaitlistPayload` the form calls.

```
─── investor, fully answered, both boxes ticked ─────────────────
{
  "role": "investor",
  "name": "Dana Whitfield",
  "email": "dana@northfieldcapital.co.uk",
  "organisation": "Northfield Capital",
  "phone": "07700 900123",
  "answers": {
    "investment_focus": [
      "HMOs and shared supported living",
      "Portfolios and blocks"
    ],
    "ticket_size": "£1m to £4.9m",
    "regions": "the North West",
    "frictions": [
      "Deals reach me too late to act on"
    ],
    "frictions_detail": "Lost a block in Bolton because the pack arrived nine days late.",
    "tool_budget": "£400 to £999 a month"
  },
  "consentEmail": true,
  "consentSms": true,
  "source": "site-register"
}

─── investor, minimum viable, NEITHER box ticked ────────────────
{
  "role": "investor",
  "name": "Sam Okafor",
  "email": "sam@example.co.uk",
  "organisation": "Okafor Holdings",
  "answers": {},
  "consentEmail": false,
  "consentSms": false,
  "source": "site-register"
}

─── resident, no organisation, no phone ─────────────────────────
{
  "role": "resident",
  "name": "Amara Bello",
  "email": "amara@example.com",
  "answers": {
    "who_for": "Me and my children",
    "home_needs": [
      "Near a school",
      "Just somewhere settled and safe"
    ],
    "location": "Nottingham",
    "timing": "Within a month"
  },
  "consentEmail": true,
  "consentSms": false,
  "source": "site-register"
}

POST target: https://iip-backend-cy7o.onrender.com/public/waitlist
```

**The envelope is camelCase, the answer keys are snake_case.** That is the site's existing shape:
the live enquiry POST already sends `routedTo`, `ticketSize` and `entityType` camelCase on the wire.
Blank answers are dropped rather than sent empty, whitespace is trimmed, and `organisation` and
`phone` are omitted entirely when absent rather than sent null, because the platform's site-enquiry
model uses `extra="forbid"` and an explicit null is a different thing from a missing key.

### ⚠️ FOR WAVE 294: the path has no `/api` segment

R295-4 writes the endpoint as `POST {apiBase}/api/public/waitlist`. **The live path is
`{apiBase}/public/waitlist`.** The backend mounts `site_enquiry.router` with `prefix="/public"`
(`iip-backend/app/main.py`), and the site's existing contact form posts to `apiUrl("/public/enquiry")`,
not `/api/public/enquiry`. The site is built to the path that actually exists. If wave 294 mounts it
at `/api/public/waitlist` instead, the two will not meet and the form will show its failure line with
nothing in the backend logs to explain it.

Three other things wave 294 needs from this side:

1. `answers` is a free-shaped object of the ids in section 4. Store it whole (JSON column) rather than as columns, or the next role added to the site becomes a migration.
2. `consentEmail` and `consentSms` are booleans that are genuinely `false` most of the time. They are not a proxy for "registered".
3. `source` is the constant `"site-register"`, to tell these apart from the `/contact` wait-list enquiries already in `site_enquiries`.

### The answer-id contract

Printed by `scripts/wave295-contract.ts` from the content file. **These ids are stable. Renaming one
orphans every answer already stored against the old name.**

| Role | Question ids, in page order | Kinds |
|---|---|---|
| `investor` | `investment_focus` · `ticket_size` · `regions` · `frictions` · `frictions_detail` · `tool_budget` | mstmts |
| `landlord` | `property_types` · `regions` · `lease_preference` · `frictions` · `frictions_detail` · `discovery` · `tool_budget` | mtsmtss |
| `developer` | `build_types` · `pipeline_scale` · `regions` · `frictions` · `frictions_detail` · `discovery` · `tool_budget` | mstmtss |
| `housing-association` | `activity` · `stock_scale` · `regions` · `frictions` · `frictions_detail` · `discovery` · `tool_budget` | mstmtss |
| `local-authority` | `pressures` · `placement_volume` · `regions` · `frictions` · `frictions_detail` · `discovery` · `tool_budget` | mstmtss |
| `care-provider` | `service_types` · `property_needs` · `regions` · `frictions` · `frictions_detail` · `tool_budget` | mstmts |
| `support-provider` | `support_types` · `property_needs` · `regions` · `frictions` · `frictions_detail` · `tool_budget` | mstmts |
| `social-worker` | `caseload_needs` · `urgency` · `regions` · `frictions` · `frictions_detail` · `tool_budget` | mstmts |
| `broker` | `services` · `deal_volume` · `regions` · `frictions` · `frictions_detail` · `tool_budget` | mstmts |
| `resident` | `who_for` · `home_needs` · `location` · `timing` · `situation_detail` | smtst |

| Answer id | Kind | Roles that send it |
|---|---|---|
| `activity` | multi | housing-association |
| `build_types` | multi | developer |
| `caseload_needs` | multi | social-worker |
| `deal_volume` | single | broker |
| `discovery` | single | landlord, developer, housing-association, local-authority |
| `frictions` | multi | investor, landlord, developer, housing-association, local-authority, care-provider, support-provider, social-worker, broker |
| `frictions_detail` | textarea | investor, landlord, developer, housing-association, local-authority, care-provider, support-provider, social-worker, broker |
| `home_needs` | multi | resident |
| `investment_focus` | multi | investor |
| `lease_preference` | single | landlord |
| `location` | text | resident |
| `pipeline_scale` | single | developer |
| `placement_volume` | single | local-authority |
| `pressures` | multi | local-authority |
| `property_needs` | single | care-provider, support-provider |
| `property_types` | multi | landlord |
| `regions` | text | investor, landlord, developer, housing-association, local-authority, care-provider, support-provider, social-worker, broker |
| `service_types` | multi | care-provider |
| `services` | multi | broker |
| `situation_detail` | textarea | resident |
| `stock_scale` | single | housing-association |
| `support_types` | multi | support-provider |
| `ticket_size` | single | investor |
| `timing` | single | resident |
| `tool_budget` | single | investor, landlord, developer, housing-association, local-authority, care-provider, support-provider, social-worker, broker |
| `urgency` | single | social-worker |
| `who_for` | single | resident |

Question BLOCKS per role: min 5, max 6 (R295-4 allows three to six).
Answer IDS per role:      min 5, max 7 (the extra id is the frictions free-text, drawn inside its question).

R295-4 counts a question the way a visitor does: the frictions multi-choice "plus a free-text line"
is one question with two answers, and it is drawn that way. `scripts/wave295-contract.ts` **exits
non-zero** if any role ever leaves the three-to-six range, so the cap is a check and not a claim.

### The alerts invitation

Two boxes, both unticked, both optional, and **the form submits with neither and records neither**.
There is no validation rule that could stop it, and there never should be: the answers are what this
page exists to collect, and gating them behind a marketing consent trades the thing we need for the
thing we would like. A pre-ticked box would also not be a consent under UK GDPR.

The one coherence rule, which is not a gate: tick the text-me box and leave the phone blank, and the
form asks for the number, because the alternative is promising somebody a text we cannot send.

---

## 5 · R295-5 · The copy

No statistic, no testimonial, no promise of a return, no "AI underwrites" anywhere on either route.
The one claim that touches the formula is worded as **"underwritten on named public data, with its
source shown"**, verbatim from the platform's own phrasing.

Every string is in section 8, printed from `src/content/register.ts` by `scripts/wave295-copy.ts`
rather than pasted here, so the report cannot drift from the product.

**One deliberate exception to the no-em-dash canon, and only one.** The two new routes' `<title>`
tags read `Register to join the waitlist — The Impact Investment Platform`, because every other
page on the site already uses that separator (`Contact — ...`, `Partner with X — ...`) and two
pages formatted differently from the other seven is a visible inconsistency in a browser tab. It
is matching an established pattern rather than authoring prose. Every other em dash this wave
wrote, in comments and in copy, has been removed; the ones remaining in the diff are pre-existing
lines that a formatter moved.

---

## 6 · Gates and refuters

| Gate | Result |
|---|---|
| `npm run lint`, measured on COMMITTED CONTENT | **0 errors on every file this wave created**, and the edited files went from **537 problems to 475**. See the note below. |
| `tsc --noEmit` | **clean** on every file this wave touches. Pre-existing errors in `partner-page.tsx`, `about.tsx` and `vite.config.ts` are untouched and predate the branch. |
| `STATIC_BUILD=true npm run build` | **35 pages prerendered**, up from 31, with `failOnError: true`. No retries, no phantom crawls. |
| `/register` and all ten `/register/<role>` prerender | **yes**, verified in `dist/client/register/*/index.html` |
| Exactly one `h1` per page | **yes**, all eleven |
| The `Register Here` string anywhere in `src` | **nowhere**, comments included |
| The form submits with BOTH consent boxes unticked | **yes**, driven in a real browser; posts and reaches the success state |
| Neither consent box carries a `checked` attribute | **yes**; the only `checked` in the HTML is Tailwind's `has-checked:` variant |
| The payload matches the contract | **yes**, printed above by the function the form calls |
| axe-core, WCAG 2.2 AA + best-practice, 11 pages × 2 widths | **22 of 22 clean.** No serious or critical violations. |
| 44px targets | **every one**, inside `main`, at 360 and 1440 |
| Keyboard order | **submit reachable by Tab alone**, no trap |

### A note on `npm run lint`, because the raw number is misleading

`npm run lint` fails on this repository and always has: at `8f15cdb` it reports
**21,083 problems**, almost all of them `Delete ␍`. That is an artefact of `core.autocrlf=true`
on Windows, which checks files out with CRLF while prettier wants LF. It is a property of the
working copy, not of anything committed, so the honest measurement is on **committed content**
(`git show :<path>`), which is what CI and Lovable actually see:

| | Base `8f15cdb` | This branch |
|---|---:|---:|
| The fifteen files this wave edits | **537 problems** | **475** |
| ...of which `src/routes/platform.tsx` | 475 | 474 |
| The nine files this wave creates | n/a | **0 errors** (3 `react-refresh` warnings, the kind `button.tsx` already carried) |

Every edited file except `platform.tsx` is now at zero. `platform.tsx` is the one blob in this
repository stored with CRLF line endings, so prettier objects to all 475 of its lines, and it did
before this branch too.

**`platform.tsx` is byte-identical to `8f15cdb` apart from two hunks.** An `eslint --fix` pass over
it had converted the whole file to LF, which produced a 1,114-line diff on a file this wave changes
in two places, on a repository that syncs to Lovable. That was reverted and the two changes
reapplied to the original bytes. Reformatting a file nobody asked to reformat is not this wave's to
do, and a diff that large hides the two lines that matter.

**The axe run is scoped to `<main>`**, because the header, footer and skip link are shared with every
page and are out of this wave's scope (R295-6). `/contact` and `/about` are run as the baseline that
proves it: they produce the same three `landmark-*` notices and the same footer `color-contrast`
finding. **Nothing fires on a `/register` page that does not also fire on those.** That the contrast
rule is clean inside `main` on all eleven new pages is the real result of section 2.

The one sub-44px target inside `main` is the privacy line's "Check our ICO registration", an inline
link in a sentence, which is WCAG 2.2 SC 2.5.8's explicit "Inline" exception. The checker encodes
that exception rather than waiving it.

`axe-core` is deliberately **not** a dependency. It is pointed at an extracted copy through an
environment variable, because it audits the build and the site does not ship it.

### Three real bugs the gates found

1. **Nobody could submit with a question left blank.** `react-hook-form` reads an untouched radio group back as `null` and an untouched checkbox group as `false`, or as an array with `false` in every unticked slot. The zod record accepted none of those, the error landed on `answers` where nothing renders it, and the submit button did nothing with no message to say why. Every question on these pages is optional, so this broke the common case. Found by driving the form in a browser, not by reading it.
2. **The prerenderer chased three roles that do not exist.** The role list in `vite.config.ts` was read from `export const registerRoles` to the end of the file, so the id regex also swallowed `pillarCards` beneath it and the prerenderer went looking for `/register/homes`, `/register/support` and `/register/lives`. It failed, retried and dropped each one while still printing "Prerendered 35 pages" and exiting 0. Found in the crawl log, not the exit code.
3. **`vite.config.ts` could not find its own source file.** It resolved the role list off `import.meta.url`, and Vite bundles the config into `node_modules/.vite-temp` before running it, so the path pointed at the temp directory. The static build died on the config's own guard.

---

## 7 · Decisions for you, and what is open

### Three things I need you to confirm

1. **The orange hex.** The site now carries the platform's live `#C15F3C`, not the brief's `#C6613F`, for the reasons in section 2. Say the word if you want `#C6613F` anyway.
2. **The price bands.** Proposed, not confirmed, per R295-4. Two ladders, in section 8. Both carry an honest bottom rung ("it would have to be free to us"), because a person who would only use it free is a real answer and leaving that rung off pushes them into a band they do not mean.
3. ~~**The hero's orange headline** is the lighter terracotta.~~ **SETTLED, and section 11 is the answer.** You read this and ruled that there is one orange. "Delivering Support" is now `#c15f3c`, the same as the button, and the photograph behind it gave way instead: 14% to 7%, with the wash over it raised. It measures 4.16:1 at 360px and 4.23:1 at 1440px against a 3:1 floor, up from 3.55:1 and 3.78:1. Compare `hero-before-1440.webp` with `hero-after-1440.webp`.

### Three things this wave could not finish

1. **The site has no privacy notice page.** R295-3 asks for a link to one and there is no `/privacy` route to link to. Rather than ship a link to a 404, the privacy line names what we store, says we do not sell it, cites ICO ZB957755 and links to the ICO register, which is a real destination anyone can check. When a privacy notice exists, `registerPrivacy` in `content/register.ts` is a two-line change.
2. **Wave 294's endpoint is not live.** The form posts to `{apiBase}/public/waitlist` and will show its failure line until wave 294 answers there. The success state in the screenshots is real: the form is filled and submitted through the actual React handler and only the network answer is stubbed. **`main` should not move until that endpoint is up**, which is what the brief already says.
3. **Nine roles ask about their organisation and the tenth does not.** A resident has no organisation, and asking would be a small insult. Wave 294's model needs `organisation` to be genuinely optional.

### Smaller things noticed and deliberately left alone (R295-6)

- `pillarCards` in `content/audiences.ts` is exported and never used anywhere. Dead data. Left in place; it is not this wave's to delete, and it is now documented as the thing that confused the prerender crawl.
- The `AudienceRole.target` field is gone, because all ten tiles now go to one place. `tone: "route-out"` stays and still gives the resident tile its teal ring.
- `sitemap.xml`'s `BASE_URL` is still the empty string with a TODO on it, so every `<loc>` is a bare path. Pre-existing, and now eleven entries longer.
- The site header's "Log in" still points at `/contact?enquiry=waitlist`. Out of scope, and it is arguably now the wrong destination given `/register` exists.

---

## 8 · MANUAL (Callum): the copy, read before `main` moves

Printed from `src/content/register.ts` by `scripts/wave295-copy.ts`. Every string on both new routes.

### The two labels (R295-2)

- **The button, everywhere it is drawn** `Register to join the waitlist`
- **The hero divider** `Register to join the waitlist as`
- **Where the button points** `/register`

### The picker, /register

- **Eyebrow** `The waiting list`
- **h1** `Register to join the waitlist`
- **Lede** `Pick the one that fits you and we will ask a handful of questions that actually apply to you, and none that do not. It takes about two minutes, and the answers decide what gets built first.`
- **Above the tiles** `I am registering as`
- **Under the tiles** `Registering costs nothing and commits you to nothing. It puts you at the front of the queue when the platform opens, and it puts your answer in the room while we are still deciding what it does.`

### Shared across all ten role pages

- **Consent heading** `Want us to tell you when it opens?`
- **Consent help** `Both optional. Leave them alone and we still keep your answers, we just will not contact you.`
- **Consent box 1 (unticked)** `Email me when the platform opens and when a match is worth my time`
- **Consent box 2 (unticked)** `Text me the same (SMS now, WhatsApp when we switch it on)`
- **Privacy line** `We store your answers to shape what the platform does and to match you when it opens. We do not sell them and we do not pass them to anyone outside Impact Investment Group. Registered with the ICO under ZB957755.`
- **Privacy link** `Check our ICO registration -> https://ico.org.uk/ESDWebPages/Search`
- **Failure line** `That did not send. Please try again, or email hello@impactig.co.uk directly.`
- **Contact heading** `Where do we reach you?`
- **name** `Your name`
- **email** `Email`
- **emailHelp** `Where the one message that says it is open will go.`
- **organisation** `Organisation`
- **phone** `Phone`
- **phoneHelp** `Optional. Only needed if you ticked the text box above.`
- **Success page's one other action** `See what we are building -> /platform`

### Price bands, PROPOSED and yours to confirm

Organisation ladder (investor, developer, housing association, local authority, care provider, support provider, broker):

  - It would have to be free to us
  - Under £50 a month
  - £50 to £149 a month
  - £150 to £399 a month
  - £400 to £999 a month
  - £1,000 a month or more
  - It would need a business case before I could say

Personal ladder (landlord, social worker; the social worker also gets 'My employer would decide, not me'):

  - It would have to be free to me
  - Under £20 a month
  - £20 to £49 a month
  - £50 to £99 a month
  - £100 a month or more
  - Not sure yet

### The resident page's urgent note

- **Heading** `If you need help today`
- **Body** `This is a waiting list and nobody reads it out of hours. If you have nowhere to sleep tonight, or you are in danger, use one of these instead.`
- The three numbers under it are rendered from `crisisLines` in content/site.ts, not retyped.

### /register/investor

- **Eyebrow** `Register to join the waitlist`
- **h1** `Tell us the deal you want to see, and see it first`
- **Lede** `We are building the platform that matches funded capital to housing demand councils and providers have already declared. Answer six questions now and your criteria are in the matching engine on the day it opens, before anything is advertised anywhere.`
- **What they get for joining now**
  - (Clock) First look at matched opportunities, ahead of the general list
  - (MessageSquareQuote) A say in what we build, while the roadmap is still open
  - (ShieldCheck) Every opportunity underwritten on named public data, with its source shown
- **Questions**
  - `investment_focus` · multi · **What are you looking to fund?**
    - help: Pick as many as apply.
    - [ ] Single lets to supported housing providers
    - [ ] HMOs and shared supported living
    - [ ] Children's homes and specialist settings
    - [ ] Portfolios and blocks
    - [ ] New build and development finance
    - [ ] Bridging and short term facilities
    - [ ] Not decided yet, show me what is there
  - `ticket_size` · single · **What size of commitment are you working with?**
    - [ ] Under £100,000
    - [ ] £100,000 to £249,000
    - [ ] £250,000 to £499,000
    - [ ] £500,000 to £999,000
    - [ ] £1m to £4.9m
    - [ ] £5m and above
    - [ ] Prefer not to say
  - `regions` · text · **Which parts of the UK interest you most?**
    - placeholder: For example: the North West, the East Midlands, or anywhere with the right lease
  - `frictions` · multi · **What has slowed you down before?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Deals reach me too late to act on
    - [ ] No way to verify the demand behind a deal
    - [ ] The provider or the lease covenant is hard to check
    - [ ] Due diligence packs arrive incomplete
    - [ ] Too much of it happens over email
    - [ ] Nothing reaches me off market
    - [ ] Hard to compare one opportunity against another
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a deal that fell over at the last stage, and why
  - `tool_budget` · single · **If a tool like this saved you real time, what could you justify paying for it each month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to us
    - [ ] Under £50 a month
    - [ ] £50 to £149 a month
    - [ ] £150 to £399 a month
    - [ ] £400 to £999 a month
    - [ ] £1,000 a month or more
    - [ ] It would need a business case before I could say
- **Organisation field** `Organisation or fund`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `Your criteria are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. Matching against your criteria starts on day one, not after you set it all up again
- **Meta description** `Join the Impact Investment Platform waiting list as an investor. Tell us the deal you want to see and your criteria are in the matching engine the day it opens.`

### /register/landlord

- **Eyebrow** `Register to join the waitlist`
- **h1** `Tell us what you own, and we will bring the demand to you`
- **Lede** `Councils and providers are already telling us where they need homes. Answer six questions about your property and what you want from a lease, and when the platform opens your stock is matched against that demand instead of sitting on a portal.`
- **What they get for joining now**
  - (MapPin) Your property matched against declared demand, not guessed at
  - (MessageSquareQuote) A say in what we build, while the roadmap is still open
  - (ShieldCheck) Named providers and councils, not anonymous enquiries
- **Questions**
  - `property_types` · multi · **What do you own, or plan to own?**
    - help: Pick as many as apply.
    - [ ] Houses
    - [ ] Flats
    - [ ] HMOs
    - [ ] Ground floor or step free units
    - [ ] Whole blocks
    - [ ] Land or empty buildings
    - [ ] Nothing yet, I am looking to buy
  - `regions` · text · **Where are your properties, or where would you buy?**
    - placeholder: For example: Grimsby, Nottingham, anywhere in the East Midlands
  - `lease_preference` · single · **What would you want from a lease?**
    - [ ] Guaranteed rent on a long lease, five years or more
    - [ ] Guaranteed rent on a shorter lease
    - [ ] Full management with rent collection
    - [ ] A straight tenant find
    - [ ] Open to whichever works best on the property
    - [ ] Not sure yet, show me the options
  - `frictions` · multi · **What has been hard about letting into the supported sector?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Voids between tenancies
    - [ ] Finding a provider I can actually trust
    - [ ] Arrears and chasing rent
    - [ ] Damage and putting the property back
    - [ ] Licensing and compliance paperwork
    - [ ] Agents who do not understand supported housing
    - [ ] No idea who genuinely needs my kind of property
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a let that went wrong, and what would have stopped it
  - `discovery` · single · **How do you fill a property today?**
    - [ ] A letting agent
    - [ ] Portals like Rightmove or Zoopla
    - [ ] Providers who approach me directly
    - [ ] The council contacts me
    - [ ] Word of mouth and my own network
    - [ ] Social media groups
    - [ ] I have not let one yet
  - `tool_budget` · single · **If a tool like this saved you real time, what could you justify paying for it each month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to me
    - [ ] Under £20 a month
    - [ ] £20 to £49 a month
    - [ ] £50 to £99 a month
    - [ ] £100 a month or more
    - [ ] Not sure yet
- **Organisation field** `Company name, or your own name if you let personally`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `What you own and what you want from a lease are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. Your property is matched against declared demand from day one
- **Meta description** `Join the Impact Investment Platform waiting list as a landlord. Tell us what you own and what you want from a lease, and we will match it against declared demand.`

### /register/developer

- **Eyebrow** `Register to join the waitlist`
- **h1** `Know where the demand is before you commit to the site`
- **Lede** `The hardest part of a supported housing scheme is not building it, it is knowing there is an end user waiting at the other end. Answer six questions and when the platform opens you can read declared demand by area before you buy the land.`
- **What they get for joining now**
  - (Map) Declared demand by area, so a scheme has an end user before it starts
  - (MessageSquareQuote) A say in what we build, while the roadmap is still open
  - (Network) Providers and councils on the same platform as your pipeline
- **Questions**
  - `build_types` · multi · **What do you build?**
    - help: Pick as many as apply.
    - [ ] New build houses
    - [ ] New build flats and blocks
    - [ ] Conversions and change of use
    - [ ] Modular and offsite
    - [ ] Refurbishment of existing stock
    - [ ] Children's homes and specialist settings
  - `pipeline_scale` · single · **How many units are in your pipeline for the next two years?**
    - [ ] Under 10
    - [ ] 10 to 49
    - [ ] 50 to 149
    - [ ] 150 to 499
    - [ ] 500 or more
    - [ ] Nothing committed yet
  - `regions` · text · **Where do you build, or where would you go for the right demand?**
    - placeholder: For example: the North West, or anywhere the numbers work
  - `frictions` · multi · **What holds a scheme up?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Not knowing where the demand actually is
    - [ ] No end user lined up before we commit
    - [ ] Planning and section 106 timescales
    - [ ] Funding gaps between stages
    - [ ] Finding a provider to take the completed units
    - [ ] Specification changes late in the day
    - [ ] Land that never reaches the open market
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a scheme that stalled, and what would have unstalled it
  - `discovery` · single · **How do you find out where the demand is today?**
    - [ ] Relationships with individual councils
    - [ ] Relationships with providers and housing associations
    - [ ] Published local authority strategies and needs assessments
    - [ ] Agents and land finders
    - [ ] Our own research
    - [ ] Honestly, we mostly go on experience
  - `tool_budget` · single · **If a tool like this saved you real time, what could your business justify paying for it each month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to us
    - [ ] Under £50 a month
    - [ ] £50 to £149 a month
    - [ ] £150 to £399 a month
    - [ ] £400 to £999 a month
    - [ ] £1,000 a month or more
    - [ ] It would need a business case before I could say
- **Organisation field** `Company name`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `What you build and where you build it are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. Demand by area is there to read from day one, not after a sales process
- **Meta description** `Join the Impact Investment Platform waiting list as a developer. Read declared demand by area before you commit to a site.`

### /register/housing-association

- **Eyebrow** `Register to join the waitlist`
- **h1** `Stock, partners and demand, in one view`
- **Lede** `Acquisition, disposal, leasing and finding the right support partner are four separate searches today, in four separate places. Answer six questions and help us make them one. Your answers shape the build while it is still being decided.`
- **What they get for joining now**
  - (Network) Stock, support partners and declared demand in one view
  - (MessageSquareQuote) A say in what we build, while the roadmap is still open
  - (ShieldCheck) Every figure underwritten on named public data, with its source shown
- **Questions**
  - `activity` · multi · **What would you use the platform for?**
    - help: Pick as many as apply.
    - [ ] Acquiring stock
    - [ ] Disposing of stock
    - [ ] Leasing units in
    - [ ] Leasing units out
    - [ ] Finding care and support partners
    - [ ] Placing people who need a home
    - [ ] Seeing what is available before we commit
  - `stock_scale` · single · **Roughly how many homes do you manage?**
    - [ ] Under 250
    - [ ] 250 to 999
    - [ ] 1,000 to 4,999
    - [ ] 5,000 to 19,999
    - [ ] 20,000 or more
  - `regions` · text · **Which local authority areas do you operate in?**
    - placeholder: For example: Greater Manchester and Lancashire
  - `frictions` · multi · **What is hardest today?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Finding suitable property in the right area
    - [ ] Matching a property to the right support provider
    - [ ] Slow legals and due diligence
    - [ ] No single view of what is available
    - [ ] Voids we cannot fill
    - [ ] Data that does not match between partners
    - [ ] Procurement rules that slow everything down
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a scheme that took far longer than it should have, and where the time went
  - `discovery` · single · **How does available property reach you today?**
    - [ ] Agents we already work with
    - [ ] Developers approaching us directly
    - [ ] Portals and open market listings
    - [ ] Other associations and councils
    - [ ] Our own acquisitions team
    - [ ] It mostly does not, we go and look for it
  - `tool_budget` · single · **If a tool like this saved your team real time, what could you justify paying for it each month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to us
    - [ ] Under £50 a month
    - [ ] £50 to £149 a month
    - [ ] £150 to £399 a month
    - [ ] £400 to £999 a month
    - [ ] £1,000 a month or more
    - [ ] It would need a business case before I could say
- **Organisation field** `Association name`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `What you need and where you operate are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. Stock, partners and demand are matched against your areas from day one
- **Meta description** `Join the Impact Investment Platform waiting list as a housing association. Stock, support partners and declared demand in one view.`

### /register/local-authority

- **Eyebrow** `Register to join the waitlist`
- **h1** `Tell us where the pressure is, and we will go and find the homes`
- **Lede** `The platform exists to turn a council's declared need into property that actually appears. Answer six questions about where your pressure is hardest, and that need is in the system while we are still choosing which areas to open first.`
- **What they get for joining now**
  - (Map) Your declared need matched against real supply, by area
  - (MessageSquareQuote) A say in which areas and which needs we open first
  - (ShieldCheck) Every figure underwritten on named public data, with its source shown
- **Questions**
  - `pressures` · multi · **Where is the pressure hardest right now?**
    - help: Pick as many as apply.
    - [ ] Families in temporary accommodation
    - [ ] Single homeless adults
    - [ ] Hospital discharge
    - [ ] Care leavers
    - [ ] Children needing a residential placement
    - [ ] Adults with a learning disability or autism
    - [ ] Domestic abuse and emergency placements
  - `placement_volume` · single · **Roughly how many placements do you need to make in a year?**
    - [ ] Under 50
    - [ ] 50 to 199
    - [ ] 200 to 499
    - [ ] 500 to 999
    - [ ] 1,000 or more
    - [ ] Not something I would have to hand
  - `regions` · text · **Which areas do you place into?**
    - help: Including anywhere out of area you currently have to use.
    - placeholder: For example: in borough where possible, Kent and Essex when it is not
  - `frictions` · multi · **What makes a placement hard?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Nothing suitable is available when we need it
    - [ ] The cost of emergency and bed and breakfast placements
    - [ ] Providers who cannot take our referrals
    - [ ] Out of area placements we would rather not make
    - [ ] No way to see supply before we commit
    - [ ] Landlords who will not work with us
    - [ ] Contract and framework paperwork
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a placement that took weeks, and what the blockage actually was
  - `discovery` · single · **How do you find available property today?**
    - [ ] Framework and contracted providers
    - [ ] Approaches from landlords and agents
    - [ ] Our own housing options team
    - [ ] Other councils
    - [ ] Spot purchasing when we have to
    - [ ] It is mostly phone calls and relationships
  - `tool_budget` · single · **If a tool like this saved your team real time, what could the authority justify paying for it each month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to us
    - [ ] Under £50 a month
    - [ ] £50 to £149 a month
    - [ ] £150 to £399 a month
    - [ ] £400 to £999 a month
    - [ ] £1,000 a month or more
    - [ ] It would need a business case before I could say
- **Organisation field** `Council or authority name`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `Where your pressure is and where you place are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. Your areas and your pressures are weighted in which regions we open first
- **Meta description** `Join the Impact Investment Platform waiting list as a local authority. Tell us where the pressure is hardest and we will match it against real supply.`

### /register/care-provider

- **Eyebrow** `Register to join the waitlist`
- **h1** `Stop losing referrals because the building is not there`
- **Lede** `You can win the commission and still have nowhere to put anyone. Answer five questions about the property you need and where you need it, and when the platform opens landlords and developers are matched to that, not to a general advert.`
- **What they get for joining now**
  - (HandHeart) Property matched to the service you actually deliver
  - (MessageSquareQuote) A say in what we build, while the roadmap is still open
  - (Network) Landlords and developers on the same platform as your need
- **Questions**
  - `service_types` · multi · **What do you deliver?**
    - help: Pick as many as apply.
    - [ ] Supported living
    - [ ] Residential care
    - [ ] Domiciliary care
    - [ ] Complex needs and behaviour that challenges
    - [ ] Mental health support
    - [ ] Learning disability and autism support
    - [ ] Older people's services
  - `property_needs` · single · **What do you need most?**
    - [ ] Property in areas we already work
    - [ ] Property in new areas we want to enter
    - [ ] Larger properties for shared settings
    - [ ] Self contained units
    - [ ] Adaptations to property we already hold
    - [ ] Not property, better referrals
  - `regions` · text · **Where do you need property?**
    - placeholder: For example: within twenty minutes of our Nottingham base
  - `frictions` · multi · **What gets in the way?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Landlords who will not lease to us
    - [ ] Property that needs work before we can use it
    - [ ] Void costs while we wait for referrals
    - [ ] The commission and the property never line up
    - [ ] No way to show a landlord we are a safe tenant
    - [ ] Nothing in the right catchment
    - [ ] Building requirements for regulation and inspection
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a referral you had to turn down, and what you were missing
  - `tool_budget` · single · **If a tool like this saved your team real time, what could you justify paying for it each month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to us
    - [ ] Under £50 a month
    - [ ] £50 to £149 a month
    - [ ] £150 to £399 a month
    - [ ] £400 to £999 a month
    - [ ] £1,000 a month or more
    - [ ] It would need a business case before I could say
- **Organisation field** `Organisation name`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `What you deliver and where you need property are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. Landlords and developers are matched against your catchment from day one
- **Meta description** `Join the Impact Investment Platform waiting list as a care provider. Property matched to the service you deliver and the areas you work in.`

### /register/support-provider

- **Eyebrow** `Register to join the waitlist`
- **h1** `The commission comes first and the building never does`
- **Lede** `Support gets funded and then has nowhere to happen. Answer five questions about who you support and where, and when the platform opens the property side is matched to that instead of you starting the search from nothing.`
- **What they get for joining now**
  - (UsersRound) Property matched to who you support and where
  - (MessageSquareQuote) A say in what we build, while the roadmap is still open
  - (Network) Landlords, councils and developers on one platform
- **Questions**
  - `support_types` · multi · **Who do you support?**
    - help: Pick as many as apply.
    - [ ] Housing related support
    - [ ] Floating support
    - [ ] Young people and care leavers
    - [ ] People who are homeless or rough sleeping
    - [ ] People fleeing domestic abuse
    - [ ] People leaving prison or on probation
    - [ ] Refugees and people seeking asylum
  - `property_needs` · single · **What do you need most?**
    - [ ] Property in areas we already work
    - [ ] Property in new areas we want to enter
    - [ ] Shared properties and HMOs
    - [ ] Self contained units
    - [ ] Move on accommodation
    - [ ] Not property, better referrals
  - `regions` · text · **Where do you need property?**
    - placeholder: For example: Lincolnshire, and anywhere we hold a contract
  - `frictions` · multi · **What gets in the way?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Councils commission before the property exists
    - [ ] Landlords who will not lease to us
    - [ ] Voids we carry between referrals
    - [ ] Property in the wrong place for the referral
    - [ ] Leases too short to make a service viable
    - [ ] No way to prove our track record to a landlord
    - [ ] Funding that arrives after the property has gone
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a contract you could not house, and why
  - `tool_budget` · single · **If a tool like this saved your team real time, what could you justify paying for it each month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to us
    - [ ] Under £50 a month
    - [ ] £50 to £149 a month
    - [ ] £150 to £399 a month
    - [ ] £400 to £999 a month
    - [ ] £1,000 a month or more
    - [ ] It would need a business case before I could say
- **Organisation field** `Organisation name`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `Who you support and where you need property are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. Landlords and councils are matched against your areas from day one
- **Meta description** `Join the Impact Investment Platform waiting list as a support provider. Property matched to who you support and the areas you hold contracts in.`

### /register/social-worker

- **Eyebrow** `Register to join the waitlist`
- **h1** `One place to look, instead of ringing round`
- **Lede** `You already know what the person in front of you needs. What you do not have is anywhere to look. Answer six questions about the placements you are trying to make, and they shape the search we are building.`
- **What they get for joining now**
  - (ClipboardList) One place to look, instead of a list of numbers to ring
  - (MessageSquareQuote) A say in what we build, while the roadmap is still open
  - (MapPin) Placements near family and school, not wherever had a bed
- **Questions**
  - `caseload_needs` · multi · **Who are you trying to house?**
    - help: Pick as many as apply.
    - [ ] Families in temporary accommodation
    - [ ] Young people leaving care
    - [ ] Adults with a learning disability or autism
    - [ ] People with mental health needs
    - [ ] People leaving hospital
    - [ ] People leaving prison
    - [ ] People fleeing domestic abuse
  - `urgency` · single · **How quickly do you usually need a placement?**
    - [ ] Same day
    - [ ] Within a week
    - [ ] Within a month
    - [ ] Within three months
    - [ ] It varies too much to say
  - `regions` · text · **Which areas do you place into?**
    - placeholder: For example: in borough where we can, out of area when we cannot
  - `frictions` · multi · **What makes a placement hard?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Nothing available when I need it
    - [ ] I cannot see what is available anywhere
    - [ ] Placements too far from family and school
    - [ ] Providers who will not take the referral
    - [ ] Chasing people for an answer
    - [ ] Paperwork that asks the same thing three times
    - [ ] Out of hours there is nowhere to look at all
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a placement that took far too long, and what you were missing
  - `tool_budget` · single · **If a tool like this saved you real time, what would it be worth a month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to me
    - [ ] Under £20 a month
    - [ ] £20 to £49 a month
    - [ ] £50 to £99 a month
    - [ ] £100 a month or more
    - [ ] Not sure yet
    - [ ] My employer would decide, not me
- **Organisation field** `Employer or authority`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `The placements you are trying to make are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. The search is built around the placements you told us about
- **Meta description** `Join the Impact Investment Platform waiting list as a social worker. One place to look for a placement, instead of ringing round.`

### /register/broker

- **Eyebrow** `Register to join the waitlist`
- **h1** `Both sides of your deal, on one platform`
- **Lede** `You spend half your time finding stock for buyers and the other half finding buyers for stock. Answer six questions about what you broker and where, and when the platform opens both sides are already on it.`
- **What they get for joining now**
  - (Handshake) Funded buyers and real stock on the same platform
  - (MessageSquareQuote) A say in what we build, while the roadmap is still open
  - (ShieldCheck) Counterparties on a platform, not an introduction chain
- **Questions**
  - `services` · multi · **What do you broker or provide?**
    - help: Pick as many as apply.
    - [ ] Property sourcing
    - [ ] Finance and lending
    - [ ] Insurance
    - [ ] Legal and conveyancing
    - [ ] Lettings and management
    - [ ] Refurbishment and works
    - [ ] Compliance and certification
  - `deal_volume` · single · **How many deals do you handle in a year?**
    - [ ] Under 10
    - [ ] 10 to 24
    - [ ] 25 to 99
    - [ ] 100 to 249
    - [ ] 250 or more
  - `regions` · text · **Where do you operate?**
    - placeholder: For example: the North East, or nationally
  - `frictions` · multi · **What costs you deals?**
    - help: The ones we hear most. Tick every one you have hit.
    - [ ] Finding buyers for the stock I have
    - [ ] Finding stock for the buyers I have
    - [ ] Deals that fall through late
    - [ ] Verifying who is genuinely funded
    - [ ] Getting paid on completion
    - [ ] Too many introducers on one deal
    - [ ] No visibility of institutional demand
  - `frictions_detail` · textarea *(inside the question above)* · **Anything else that has cost you time or money?**
    - placeholder: For example: a deal that collapsed, and where it actually broke
  - `tool_budget` · single · **If a tool like this saved you real time, what could you justify paying for it each month?**
    - help: There is no wrong answer and nothing is being sold. It tells us what we can afford to build.
    - [ ] It would have to be free to us
    - [ ] Under £50 a month
    - [ ] £50 to £149 a month
    - [ ] £150 to £399 a month
    - [ ] £400 to £999 a month
    - [ ] £1,000 a month or more
    - [ ] It would need a business case before I could say
- **Organisation field** `Company name`
- **Submit button** `Join the waitlist`
- **Success heading** `You are on the list`
- **Success body** `What you broker and where you operate are recorded against your email address. Nobody will call you, and there is nothing else you need to do.`
- **What happens next**
  1. Your answers go into what we are building this week, not at launch
  2. One email when the platform opens, and none between now and then unless you asked for them
  3. Both sides of your deal are matched against your areas from day one
- **Meta description** `Join the Impact Investment Platform waiting list as a broker. Funded buyers and real stock on one platform.`

### /register/resident

- **Eyebrow** `Looking for a home`
- **h1** `Tell us what you need, and where`
- **Lede** `The platform is not open yet, so we cannot offer you a home today and we will not pretend otherwise. What we can do is take down what you need now, so that when it opens we are looking for the right thing in the right place.`
- **What they get for joining now**
  - (Heart) We record what you need in your words, not as a category
  - (MapPin) Where you need to be, so a home is not somewhere you cannot live
  - (Clock) One message when it opens, and nothing else unless you ask
- **Questions**
  - `who_for` · single · **Who is the home for?**
    - [ ] Me
    - [ ] Me and my children
    - [ ] Me and my partner
    - [ ] Me and my family
    - [ ] Someone I care for
    - [ ] A young person I support
  - `home_needs` · multi · **What does the home need to be?**
    - help: Pick as many as matter to you.
    - [ ] Ground floor, or step free
    - [ ] Near a school
    - [ ] Near family or people who help me
    - [ ] Somewhere I can keep a pet
    - [ ] Adapted for a disability
    - [ ] Somewhere with support attached
    - [ ] Just somewhere settled and safe
  - `location` · text · **Where do you need to be?**
    - placeholder: A town, a city, or the area you need to stay near
  - `timing` · single · **When do you need it?**
    - [ ] Right now
    - [ ] Within a month
    - [ ] Within three months
    - [ ] Within six months
    - [ ] I am planning ahead
  - `situation_detail` · textarea · **Anything you want us to know?**
    - help: Only if you want to. It helps us look for the right thing.
    - placeholder: In your own words
- **Organisation field** `NOT ASKED`
- **Submit button** `Add me to the list`
- **Success heading** `We have got that`
- **Success body** `What you need and where you need it are recorded against your email address. Nobody will call you unless you asked us to.`
- **What happens next**
  1. We look for the right thing in the right place, not whatever is nearest
  2. One message when the platform opens, and nothing else unless you asked for it
  3. If your situation changes, write to hello@impactig.co.uk and we will update it
- **Meta description** `Tell the Impact Investment Platform what home you need and where. We record it now so we are looking for the right thing when the platform opens.`

---

## 9 · The screenshots

`docs/screenshots/wave295/`, at 360, 768 and 1440. WebP because fifteen full-page PNGs are 13 MB and
this repository syncs to Lovable; at quality 82 they are 3.2 MB and lose nothing a reviewer of a
layout would see.

| File | What |
|---|---|
| `hero-before-{360,768,1440}.webp` | the home page built from `8f15cdb` with the new files removed, so it is a real pre-wave build and not a simulation |
| `hero-after-{360,768,1440}.webp` | the same page on this branch |
| `picker-{360,768,1440}.webp` | `/register` |
| `role-investor-{360,768,1440}.webp` | `/register/investor` |
| `role-investor-success-{360,768,1440}.webp` | the same page after a real submit |

---

## 10 · Files

**Changed by intent**

| File | What |
|---|---|
| `src/styles.css` | the orange ramp, `--primary`, `--chart-4`, `--sidebar-primary`, the active nav label, four stale ratio comments |
| `src/content/site.ts` | `registerRoute`: the label and the destination |
| `src/content/audiences.ts` | `target` removed from the ten roles; the id is now the URL segment and the payload's role |
| `src/content/register.ts` | **new.** Every string and every question, typed, with a build-time assertion that no tile lacks a page |
| `src/routes/register.index.tsx` | **new.** The picker |
| `src/routes/register.$role.tsx` | **new.** One page per role |
| `src/components/register/role-icon.tsx` | **new.** The glyph map, moved out of `hero.tsx` so the hero and the picker cannot drift |
| `src/components/register/role-picker.tsx` | **new** |
| `src/components/register/waitlist-form.tsx` | **new.** The questionnaire and the payload builder |
| `src/components/register/consent-block.tsx` | **new** |
| `src/components/register/success-state.tsx` | **new** |
| `src/components/home/hero.tsx` | the divider label, the ten tile targets, the headline's orange step, the glyph map moved out |
| `src/components/site-header.tsx` | the button label and target, the Partners panel fill, four orange-on-navy steps |
| `vite.config.ts` | the prerender list, read from `audiences.ts` rather than hand-kept |
| `src/routes/sitemap[.]xml.ts` | eleven entries |

**Changed only because the label or the token moved**

`page-shell.tsx`, `site-footer.tsx`, `routes/platform.tsx` (the `search` prop, now absent from
`registerRoute`), `ui/button.tsx`, `about/director-card.tsx`, `platform/delivery-spine.tsx`,
`routes/about.tsx`, `routes/solutions.tsx`, `content/about.ts` (stale ratio comments, comment-only).

**Tools, not shipped**

`scripts/wave295-contrast.cjs`, `wave295-contract.ts`, `wave295-copy.ts`,
`wave295-payload-example.ts`, `wave295-screenshots.py`, `wave295-axe.py`.

---

---

## 11 · One orange

**Callum, after reading this report:** every orange word on the site, the hero
headline included, is the same orange as the fill of the "Register to join the waitlist" button.
Retire the lighter tint for text. Where that orange would fail WCAG 2.2 AA where the text sits,
do not lighten the orange, change the surface.

### What changed

`--color-orange-400` `#f0a886` is **gone from the token block**, not merely unused. The first cut
of this wave used it for orange text on navy, because `#c15f3c` is 4.46:1 on the page navy and the
body floor is 4.5:1. That put two oranges on the page, which is the exact thing this wave existed
to end. Twelve `text-orange-400` usages became `text-orange-500`, the active nav label in
`styles.css` followed, and so did the image-fill headline's gradient and text stroke. There is now
one orange in the site's text, `#c15f3c`, and it is the same value as `--brand-primary` on the
platform and as the button's fill.

`orange-600` `#ae4e30` and `orange-700` `#9a4429` are untouched, exactly as instructed: 600 is the
button fill's hover and active shade and the fill of any text-bearing control, 700 is orange text on
the cream. Neither is a second orange for text on navy.

### The arithmetic that decides every surface

`#c15f3c` has a relative luminance of 0.19848, so against a perfectly black ground it measures
**4.90:1** and it cannot do better anywhere. Two consequences, and they drive every change below:

- **Orange text under 24px passes only on a ground at or below navy-950.** navy-950 `#000b1c` gives 4.67:1, navy-900 `#00112b` gives 4.46:1, navy-800 4.01:1, navy-700 3.39:1.
- **Lightening a surface cannot rescue small orange text.** On pure white it is 4.23:1, still under the 4.5:1 body floor. On this site the surface that passes is always the darker one, so every change below darkens.

### The five surfaces that moved

| # | Where | The orange text on it | Was | Now | The surface change |
|---|---|---|---:|---:|---|
| 1 | The site header, every page | the active nav label, 15px | 4.46:1 on navy-900, and about 3.9:1 where a cream section scrolled under the 92% fill | **4.67:1** | `bg-navy-900/92 backdrop-blur-md` becomes an opaque `bg-navy-950`. The blur went with the translucency: behind an opaque fill it draws nothing and still costs a compositing layer. |
| 2 | The dark island inside a cream section (`.section-light .section-dark`) | the home page's "See the full picture", 13px | 4.46:1 | **4.67:1** | navy-900 becomes navy-950. A darker island on the cream is slightly more contrast against the band, not less. |
| 3 | The accountable-chain cards on `/about` | the "01 / 02 / 03" eyebrow, 11px | 4.01:1 | **4.67:1** | a new `panel-deep` utility sinks the card from navy-800 to navy-950. Defined after `panel` so it takes the background and inherits the border, radius and shadow. |
| 4 | The chip inside those cards | the partner name, "Rhema Social Impact Group", 10.5px | 3.52:1 | **4.67:1** | it was a 16% wash of its own accent, so the word sat on a tint of itself. It is now an outlined pill and the ground under the word is the card. This is also what the platform's kit does: wave 288 retired the faded orange tint as an information fill. |
| 5 | The selected chapter tab on `/platform` | its 10px accent label, "The past failures" | 3.53:1 | **4.67:1** | the `bg-navy-700/80` fill sinks to navy-950. Selection is still unmistakable: the teal border, the glow, the horizontal nudge and the filled accent disc all stay. |

**And the hero photograph**, which is the one Callum named. "Delivering Support" is set over the
ghosted street, where the old lighter tint measured 6.8:1 and `#c15f3c` measured 3.55:1 at 360px and
3.78:1 at 1440px. It is large text, so it cleared the 3:1 floor, but with almost nothing to spare
over a photograph. The photograph goes from **14% to 7%** and the wash over it from **18/4/36 to
34/30/46**, which takes the headline to **4.16:1 at 360px and 4.23:1 at 1440px**.

⚠️ **The ceiling in the hero is 4.46:1 and no wash can beat it**, because the wash is navy-900 and the
section behind it is navy-900: at 100% the ground would BE navy-900. The headline is large text and
answers to 3:1, so that ceiling is ample, and the section's own colour was not changed to chase a
floor that does not apply.

### What did NOT change, deliberately

- **The navy scale.** `CLAUDE.md` fixes it against the approved mock-ups. Darkening `--color-navy-900` from `#00112b` to `#000e26` would have cleared 4.5:1 in one token and been invisible to the eye, and it was rejected for that reason: it is a standing brand instruction, and five targeted surfaces are honest where a quiet global shift is not.
- **The orange.** Not lightened anywhere, at any size, on any ground.
- **`orange-600` and `orange-700`.** The button's hover and active shades are as they were.

### Every orange word on the site, measured on the rendered page

Produced by `scripts/wave295-orange-audit.py`, which walks twelve pages at 360 and 1440, and for
each orange word screenshots its box twice, once with the ink present and once with it transparent.
The pixels that differ are the pixels the glyphs cover, and the ground is read from the inkless shot
at only those positions, taking the 99th percentile by luminance.

⚠️ **It reads pixels rather than compositing ancestors, and that is not fussiness.** The first cut
walked the ancestor chain alpha-compositing background colours, the way axe-core's contrast rule
does, and reported the header's ground as `#000103` when the header is navy-900 at 92% over a
navy-900 page, which is `#00112b`. That error flattered the site's tightest measurement, the 15px
active nav label, from 4.46:1 to 4.94:1: one side of the 4.5:1 line to the other. Three more bugs
were found the same way and each is written down in the script: sampling the whole bounding box
caught the line above a headline in its leading, hiding a word with `visibility` removed its own
background as well as its ink, and Lenis smooth scroll moved the page between the two shutters. The
script refuses to score a pair whose scroll position, word or box moved, and reports those instead
of silently passing them.

| Page | Orange text | Size | Lightest pixel behind it | Measured | Needs | |
|---|---|---|---|---:|---:|---|
| `/` | See the full picture | 13px/700 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/` | Delivering Support | 53px/800 large | `#071730` | **4.23:1** | 3:1 | PASS |
| `/` | Delivering Support | 38px/800 large | `#0a1930` | **4.16:1** | 3:1 | PASS |
| `/about` | 02 | 11px/700 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/about` | Rhema Social Impact Group | 10px/800 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/about` | About Us | 15px/500 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/about` | safe, suitable homes | 20px/700 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/about` | One chain. | 22px/700 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/contact` | Contact Us | 15px/500 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/partner-with-investor` | Partners | 15px/500 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/partner-with-investor` | building towards. | 43px/800 large | `#011021` | **4.53:1** | 3:1 | PASS |
| `/partner-with-investor` | clear purpose. | 35px/800 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/partner-with-investor` | connects. | 35px/800 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/partner-with-investor` | building towards. | 80px/800 large | `#021323` | **4.44:1** | 3:1 | PASS |
| `/partner-with-resident` | Partners | 15px/500 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/partner-with-resident` | a suitable home. | 43px/800 large | `#011021` | **4.53:1** | 3:1 | PASS |
| `/partner-with-resident` | the centre. | 35px/800 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/partner-with-resident` | around you. | 35px/800 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/partner-with-resident` | a suitable home. | 80px/800 large | `#021323` | **4.44:1** | 3:1 | PASS |
| `/partners` | Partners | 15px/500 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/partners` | One connected outcome. | 35px/800 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/platform` | The past failures | 10px/700 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/platform` | Our Services | 15px/500 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/platform` | one platform. | 36px/700 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/platform` | Activate their tool. | 32px/700 large | `#00152e` | **4.33:1** | 3:1 | PASS |
| `/platform` | one platform. | 70px/700 large | `#00152e` | **4.33:1** | 3:1 | PASS |
| `/platform` | 25 | 96px/800 large | `#262130` | **3.70:1** | 3:1 | PASS |
| `/solutions` | The Solution | 15px/500 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |
| `/solutions` | five layers | 26px/800 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/solutions` | connected | 28px/800 large | `#00112b` | **4.46:1** | 3:1 | PASS |
| `/the-problem` | The Problem | 15px/500 | `#000b1c` | **4.67:1** | 4.5:1 | PASS |

31 distinct orange words, 0 measurement(s) below threshold.

**31 distinct orange words, 0 below threshold**, at both widths. `/platform`'s marquee figures are
reported as not measurable rather than as passes: the marquee slides between the two shutters, so
there is no comparable pair. They are 22px extra-bold on the page navy, which is 4.46:1 against a
3:1 floor.

### The gates, re-run on this tree

| Gate | Result |
|---|---|
| `scripts/wave295-orange-audit.py`, 12 pages x 2 widths | **30 orange words, 0 below threshold** |
| axe-core WCAG 2.2 AA + best practice, 11 new pages x 2 widths | **22 of 22 clean**, no serious or critical violations |
| `STATIC_BUILD=true npm run build` | **35 pages prerendered**, no retries |
| `tsc --noEmit` | clean on every file this wave touches |
| `npm run lint` on the changed files | 0 errors |
| Screenshots | all 15 retaken from this build, at 360, 768 and 1440 |

`src/routes/platform.tsx` is again byte-identical to its previous commit apart from one line: an
`eslint --fix` pass converted it wholesale from CRLF to LF for the second time this wave, and it was
reverted again. It is the one blob in this repository stored with CRLF endings.

---

## 12 · Status

Every acceptance line in the brief is true, except the one that cannot be: wave 294's endpoint does
not exist yet, so the form posts into a 404 until it does. The Landing-Queue row is `ready`.

Callum's "one orange" change is in and is section 11: one orange for every word and every button,
`#c15f3c`, with five surfaces moved and the hero photograph pulled back so that nothing had to be
lightened. Thirty orange words measured on the rendered pages, none below its threshold.

**`main` was not pushed, merged or rebased. No force-push, no rebase of pushed commits.**
