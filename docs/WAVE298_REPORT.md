# Wave 298 · The site names its company and links its policies

**Repo:** `israel-silgram/Impact-Investment-Group-site` (the MARKETING SITE, not the platform)
**Branch:** `feat/wave298-the-site-names-its-company`, worktree `../iigs-uc298`
**Base:** `origin/main` `8f15cdb`, unchanged throughout the session
**Brief:** `CLAUDE_CODE_wave298_the-site-names-its-company.md` (Callum, 9 Sep 2026, 13:40 UK)
**Source review:** `Impact Investment Group/05-Artifacts/legal-footer-review-2026-09-09/REVIEW.md`
**Status:** ready. `main` was not pushed, merged or rebased. Cowork lands it.
**Gated head:** `5f5cb08`. The only commit above it is the one correcting a wave
295 sha in section 11, which no build, lint or audit reads.

The platform half is wave 297 (`feat/wave297-the-footer-says-five-things`, worktree
`../iip-uc297`). At the time this wave built, 297 had pushed its claiming commit
`6a98ca13` and had no report, so **the company record below was looked up
independently rather than taken from 297**. The two waves must agree; section 3
is the record 297 should be holding.

---

## 1. The review's site findings, verified against the live pages first

A review is evidence, not truth, so each finding was re-measured against the
production site before anything was changed. All six stand.

| # | The review said | Measured on the live site, 9 Sep 2026 | Stands |
|---|---|---|---|
| 1 | The homepage and contact footers carry no Terms, Privacy or Disclaimer links | `https://impactinvestmentgroup.co.uk/` and `/contact`: the footer carries site links, contact routes, partner pages, crisis lines and three registration cards. No Terms, Privacy, Disclaimer or Legal link anywhere on either page. | Yes |
| 2 | The contact form has an ICO reference but no privacy-policy link at the point of collection | `/contact` renders exactly `UK GDPR · we use your details only to answer this enquiry · ICO ZB957755` beside the submit button. No controller named, no link. | Yes |
| 3 | The footer's registered-office field shows a company name instead of a postal address | The footer notice ended `Registered office: Impact Investment Group UK Limited.` The registered number and jurisdiction appear nowhere on the site. | Yes |
| 4 | The footer presents current insurance status with a cover period that ended 12 August 2026 | The insurance card read `PI & PL Insured` over `PI limit £100,000 · PL limit £10,000,000 · Cover 13 Aug 2025 – 12 Aug 2026`, twenty-eight days after that period ended. | Yes |
| 5 | The site's contact is `hello@impactig.co.uk`; the platform's legal contacts are on `impactinvestmentplatform.com` | `hello@impactig.co.uk` in twenty places across the built site. The platform's Terms name `legal@impactinvestmentplatform.com` and its Privacy Policy `privacy@impactinvestmentplatform.com`. | Yes |
| 6 | The resident pathway page shows no crisis banner in its main content | `/partner-with-resident`: no Samaritans, Shelter, NHS 111 or 999 anywhere in `<main>`. They appear only in the shared footer. The page's own qualification about assessments and statutory decision-making is present and was kept. | Yes |

**Measured additionally, because R298-1 turns on it:** the site publishes no
Terms, Privacy Policy or Disclaimer of its own. There is no `/terms`, `/privacy`
or `/disclaimer` route in `src/routes`, and no such page in the prerendered
output at the base commit. The platform's documents are therefore the canonical
ones and the site links straight to them, which is the branch R298-1 anticipated.

**Safeguards named in the brief's item 7, checked present and unchanged in the
built output after the wave:** the investor, resident and care-provider pathway
qualifications; the Services page's illustrative-data label; the homepage's
overlapping-populations and illustrative conversion and map notes. Keyword counts
across all seventeen pre-existing pages, before to after: `illustrative` 2 to 2,
`Illustrative` 1 to 1, `due diligence` 2 to 2, `not guaranteed` 1 to 1,
`overlapping` 1 to 1. `independent` and `capital at risk` go 17 to 18, the extra
one being the new `/legal` page. **On every page the wave did not target, the only
change in the extracted text is the footer.**

---

## 2. What was built

| Ruling | What was done | Where |
|---|---|---|
| R298-1 | Four legal links in the footer of every route | `src/components/site-footer.tsx`, `src/components/home/site-footer.tsx`, `src/content/legal.ts` |
| R298-2 | New prerendered `/legal` page carrying the verified company record | NEW `src/routes/legal.tsx`, NEW `src/content/legal.ts`, `vite.config.ts`, `src/routes/sitemap[.]xml.ts` |
| R298-3 | Notice at collection beside the submit control | `src/content/contact.ts`, `src/components/contact/enquiry-form.tsx` |
| R298-4 | The dated cover period removed from the footer and the trust content | `src/content/site.ts`, `src/content/legal.ts` |
| R298-5 | The three mailboxes shown on `/legal`, with O-1 raised | `src/content/legal.ts`, `src/routes/legal.tsx` |
| R298-6 | Crisis signposting above the fold on the resident page only | `src/content/partners.ts`, `src/components/partners/partner-page.tsx` |
| R298-7 | Independent review pass, its findings, and this report | section 6 |

`src/components/home/site-footer.tsx` **is not rendered by any route.** `__root.tsx`
draws `@/components/site-footer`; nothing imports the other one. It was changed
anyway, and a comment says why: restoring it must not silently drop the legal
links, which is the exact failure this wave was called in to fix.

One file outside the brief's list was touched: **`src/styles.css`**, one rule, for
the reason in section 6 finding 6. It is registered in the Landing-Queue row.

---

## 3. The verified company record

Read from the **Companies House public register**, read only, by WebFetch, on
**9 September 2026**:
`https://find-and-update.company-information.service.gov.uk/company/16650494`

| Field | Value | Evidence |
|---|---|---|
| Registered company name | Impact Investment Group UK Limited | Company page heading |
| Company registration number | 16650494 | Company page |
| Registered office | `Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG` | Company page, verbatim |
| Jurisdiction of registration | England and Wales | Advanced search filtered to `companyJurisdiction=england-wales` returns this company |
| Company type | Private limited company | Company page |
| Incorporated | 14 August 2025 | Company page |
| Status | Active | Company page |
| SIC codes (not published on the site) | 68100, 68209, 68320 | Company page |

Two other companies match the name loosely and are **not** this one: IMPACT GROUP
(UK) LIMITED (05391046, London) and IMPACT GROUP UK HOLDINGS LTD (15928699,
dissolved 3 Feb 2026).

**On the registered office, which looks wrong and is right.** Companies House
assembles the address from separate fields and its own comma lands mid-name: the
premises field is `Renewal Trust Business` and the first address line is
`Centre 3 Hawksworth St`, so what is really "Renewal Trust Business Centre,
3 Hawksworth Street" prints with the comma inside the building name. An earlier
draft of this wave tidied it to
`Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG` and the
code comment described that as a comma move. It was three edits: the comma, `St`
expanded to `Street`, and the comma before the postcode deleted. The independent
review pass caught it. **The site now prints the register's string character for
character**, so a reader comparing the two matches them exactly. The tidied form
is O-4 below, for Callum.

The vault's `IIP_MASTER_SOURCE_OF_TRUTH.md` independently records `3 Hawksworth
Street, Nottingham NG3 2EG` as Elevate Supported Living's registered office,
which corroborates the street and postcode and confirms the field-split reading.

**The ICO registration could not be verified from this session.** `ico.org.uk`
returns HTTP 403 to automated fetches on every path tried, including its own
public pages, so neither `ESDWebPages/Entry/ZB957755` nor the register search
could be read. `ZB957755` was **not invented**: it is the reference the site
already published and the platform's Terms already publish, attributed there to
Impact Investment Group UK Limited by name. It is shown with its verify link so a
reader can check it in one click, and O-5 asks Callum to do that check once.

---

## 4. Every string changed, before and after

### 4.1 The footer notice (`src/content/site.ts`, `legalNotice`) · both footers, every route

Before:

> Not authorised or regulated by the FCA · not a Collective Investment Scheme · capital at risk · sourcing, packaging and managed investment services, not advice · take independent advice. **Registered office: Impact Investment Group UK Limited.** © 2026, an Impact Investment Group initiative.

After:

> Not authorised or regulated by the FCA · not a Collective Investment Scheme · capital at risk · sourcing, packaging and managed investment services, not advice · take independent advice. **Impact Investment Group UK Limited is registered in England and Wales, company number 16650494. Registered office: Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG.** © 2026, an Impact Investment Group initiative.

The regulatory framing is untouched, word for word. Only the registered-office
clause changed, and the four values in it are interpolated from `companyRecord`
so they cannot drift from the record in section 3.

### 4.2 The insurance card (`src/content/site.ts`, `trustRegistrations[insurance].details`)

Before: `PI limit £100,000 · PL limit £10,000,000` · **`Cover 13 Aug 2025 – 12 Aug 2026`** · `Underwritten by Victor Insurance / MS Amlin via Insurance-Desk Services`

After: `PI limit £100,000 · PL limit £10,000,000` · **`Current insurance evidence available on request`** · `Underwritten by Victor Insurance / MS Amlin via Insurance-Desk Services`

The replacement is R298-4's prescribed wording. See O-3: it stops the site
showing an ended period as current, and it does not by itself evidence that cover
exists today.

### 4.3 The notice at collection (`src/content/contact.ts`) · beside the submit control on `/contact`

Before, one flat string with no controller and no link:

> UK GDPR · we use your details only to answer this enquiry · ICO ZB957755

After, rendered as one sentence with the Privacy Policy as a real anchor:

> **Impact Investment Group UK Limited** is the data controller for this form. We use your details only to answer this enquiry. UK GDPR · ICO ZB957755 · **Read the Privacy Policy** (opens in a new tab)

The purpose clause is the same promise, word for word. Two things were added and
nothing was weakened. No box was added; no box is pre-ticked; the only checkbox
on the form is the pre-existing investor risk acknowledgement, which is gated to
`route === "investor"` and starts unticked. `type="checkbox"` count on the
prerendered `/contact` is **0** for the default route.

### 4.4 The four legal links (NEW, `src/content/legal.ts`, `legalLinks`)

| Label | Destination | External |
|---|---|---|
| Terms of Service | `https://app.impactinvestmentgroup.co.uk/terms` | yes |
| Privacy Policy | `https://app.impactinvestmentgroup.co.uk/privacy` | yes |
| Disclaimer | `https://app.impactinvestmentgroup.co.uk/disclaimer` | yes |
| Legal | `/legal` | no |

Order is fixed and matches the platform's own footer. External links carry
`target="_blank" rel="noreferrer noopener"` and an in-anchor
`<span class="sr-only">(opens in a new tab)</span>`, so the accessible name is
"Terms of Service (opens in a new tab)".

### 4.5 The `/legal` page (NEW, `src/routes/legal.tsx` + `src/content/legal.ts`)

Page title: `Legal and company information · Impact Investment Group UK Limited`
Eyebrow: `Company information` · H1: `Legal`
Lead: `Who this company is, where it is registered, and where to find the documents that govern its services.`

Four sections, each an H2 on the cream: **The company** (the seven fields in
section 3, plus `Read from the Companies House public register on 9 September
2026.` and `View the entry on the Companies House register`); **Registrations and
cover** (the three existing `trustRegistrations` cards, unchanged apart from
4.2); **The documents**; **Contacting the company**.

New sentences on the page, in full:

- `Each of these is checkable on the register that issues it, and a listing is not an approval of anything the company does. The FCA reference below belongs to the insurance broker, not to this company.`
- `The Terms of Service, Privacy Policy and Disclaimer are published on the platform at app.impactinvestmentgroup.co.uk. This site publishes no separate versions of them.`
- `The legal and data-protection addresses are the mailboxes published in the platform's own Terms of Service and Privacy Policy.`
- `Post can be sent to the registered office above. To ask a question about this site rather than about the company, use the contact form.`
- Card blurbs: `The terms on which the services are provided.` · `How personal data is collected, used and stored.` · `The qualifications that apply to figures, matches and claims.` · `Company registration details, registrations and contacts.`

Mailboxes shown: `hello@impactig.co.uk` (General enquiries),
`legal@impactinvestmentplatform.com` (Legal),
`privacy@impactinvestmentplatform.com` (Data protection and privacy).

No claim of regulatory authorisation or exemption appears on the page. The
company's regulatory position is stated once, in the footer notice, and it says
what the company is not.

### 4.6 The resident crisis signpost (NEW, `src/content/partners.ts` → `crisisSignpost`)

Heading: `If you need help now`

Body:

> This page describes a network that looks for homes that may suit you. It is not an emergency service and it cannot house you today. A person from the housing and support team confirms every match before anything happens. If you need help now, these lines are open to anyone.

The helpline numbers are **not** new copy: the panel reads `crisisLines` and
`crisisNote` from `src/content/site.ts`, the same source the footer uses, so a
changed number cannot be right in one place and stale in the other. Samaritans
116 123, Shelter 0808 800 4444, NHS 111, and `If life is at risk, call 999.`

`crisisSignpost` is optional on `PartnerProfile` and is set on the resident
profile alone. `If you need help now` occurs **once** in the whole built site.
The resident page's existing `importantNote` about circumstances, assessments,
eligibility and statutory decision-making is present, once, unchanged.

### 4.7 Not rendered, corrected anyway

`src/content/contact.ts` → `registeredOffice` was an unused block carrying a
company NAME under the title `Registered office`, the same defect as 4.1. It now
carries `address` and `number` from `companyRecord` too, so restoring the block
cannot reintroduce the defect.

---

## 5. Outstanding questions for Callum, with the wording ready to drop in

**O-1 · Are the two platform mailboxes controlled and monitored?** (R298-5)
`legal@impactinvestmentplatform.com` and `privacy@impactinvestmentplatform.com`
are now published on `/legal`, on the authority of the platform's own Terms and
Privacy Policy. Nobody has tested that anyone reads them; the review says so in
terms and made no delivery test. A subject-access request into an unread mailbox
is a real failure with a statutory clock on it.
*If yes:* nothing changes. *If no, or unknown:* delete the two rows from
`legalMailboxes` in `src/content/legal.ts` and delete `mailboxesNote` from the
page. One working address beats three published ones. The proposed single-row
replacement is:
`{ purpose: "Legal and data protection", address: "hello@impactig.co.uk" }`.

**O-2 · Which legal entity is the contracting party and the data controller?**
(R298-2, and the review's finding 2)
The platform's Terms name Impact Investment Group UK Limited in a company table
but make "the platform" the contracting party and describe it as legally distinct
from the operating companies without identifying another entity; the Privacy
Policy makes "the platform" the controller. This site now names Impact Investment
Group UK Limited as the controller of the contact form, which R298-3 directed,
**and that is a statement the linked Privacy Policy does not itself make.**
The wave did not resolve this, because it is a legal decision and wave 297 owns
the platform documents. `/legal` was deliberately reworded so the site makes no
determination: it says where the documents are, and nothing about who publishes
them or whom they bind.
*Proposed, once the entity is settled:* restore `policiesNote` to
`"The Terms of Service, Privacy Policy and Disclaimer are published by <entity> on the platform at app.impactinvestmentgroup.co.uk. This site publishes no separate versions of them; those documents are the ones that apply."`
and make wave 297 change the Terms and the Privacy Policy to name the same
entity. Until then the two sites must not disagree, and today they do not: this
site attributes nothing.

**O-3 · The insurance renewal date and insurer.** (R298-4)
The dated cover period is gone from everything that renders, which is what the
ruling asked for. It does not make the card fully honest on its own: the card
still reads `PI & PL Insured` and still states `PI limit £100,000 · PL limit
£10,000,000`, and those came off the certificate that expired on 12 August 2026.
*If Callum supplies the renewed certificate:* add the insurer and the period
BESIDE the "available on request" line, never instead of it, and diary its
removal for the day the period ends. Proposed detail line:
`"Cover <start> to <end>, <insurer>"`.
*If he cannot:* the honest card is
`details: ["Insurance evidence available on request"]` with the label changed
from `PI & PL Insured` to `Professional indemnity and public liability`, and the
limits removed until a current certificate supports them. **This is the one place
in the wave where the shipped wording is weaker than the evidence would justify,
and the brief routed it here rather than to a code change.**

**O-4 · How should the registered office be printed?**
The site prints the register's string verbatim,
`Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG`, which is
exactly checkable and slightly odd to read. The tidied form is
`Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG`.
*If Callum wants the tidy:* change `registeredOffice` in
`src/content/legal.ts` and leave `registeredOfficeAsRegistered` alone, because
that field is what keeps the comparison possible. The better fix is to correct
the premises field at Companies House so the register and the site agree without
anyone having to choose.

**O-5 · One click to confirm the ICO registration.** `ico.org.uk` blocks
automated fetches (403 on every path tried), so `ZB957755` could not be verified
from this session. It is published on the strength of the site's existing text
and the platform's Terms, both of which attribute it to this company by name.
Somebody with a browser should search the ICO register once and confirm the
registered name matches, then this line can be marked verified.

**O-6 · Wave 295's `/register` form needs the same notice.** (R298-3, measured
across waves) At this wave's base commit `/contact` is the only form on the site
that collects personal data, and it is fixed. Wave 295, `ready` in
`../iigs-uc295` and not yet on `main`, adds a waitlist form whose privacy line
(`registerPrivacy` in `src/content/register.ts`) names no controller and links to
the ICO register search rather than to a Privacy Policy. **This wave did not touch
it: the brief forbids touching wave 295's register routes.** Proposed change for
whoever lands 295:
`body: "Impact Investment Group UK Limited is the data controller. We store your answers to shape what the platform does and to match you when it opens. We do not sell them and we do not pass them to anyone outside Impact Investment Group. Registered with the ICO under ZB957755."`,
`linkLabel: "Read the Privacy Policy"`,
`href: "https://app.impactinvestmentgroup.co.uk/privacy"`.

**O-7 · The sitemap does not ship, and never has.** `src/routes/sitemap[.]xml.ts`
is a server handler and the GitHub Pages build sets `nitro: false`, so no
`sitemap.xml` is emitted and `robots.txt` names none. Its `BASE_URL` is also
still `""`, which would make every `<loc>` relative and invalid if it did ship.
`/legal` was added to the file so it is in the sitemap the day somebody fixes the
route, and both the route and `legal.tsx` now carry a comment saying so.
Pre-existing, out of this wave's scope, worth a small follow-up wave.

---

## 6. R298-7 · the independent review pass, and what it changed

One adversarial pass, a subagent reading the **rendered prerendered HTML** and the
screenshots rather than the diff, against the review's findings and the rulings.
It raised nine numbered findings plus a group of minors. Six were fixed in code
(commit `126592e`), one more after re-measuring (`027ebd9`), and three became
outstanding questions.

| # | Finding | Outcome |
|---|---|---|
| 1 | The registered office was tidied in three ways and the comment claimed only the comma had moved | **Fixed.** The register's string, verbatim, everywhere. Comment rewritten to list all three departures and why none is taken. O-4 offers the tidy to Callum. |
| 2 | The insurance card still asserts current cover, with limits, on an expired certificate | **Raised as O-3, not silently changed.** R298-4 prescribes the replacement sentence and routes the residue to an outstanding question; the gap and the exact proposed wording are in O-3, and the code comment points at it. |
| 3 | `/legal`'s "Registrations and cover" lead implied the company is on the FCA register, on a page whose footer says it is not | **Fixed.** The sentence now ends `The FCA reference below belongs to the insurance broker, not to this company.` |
| 4 | `/legal` asserted the platform's documents are "published by the company" and "are the ones that apply", both determinations nobody has made | **Fixed.** The sentence now states only where the documents are. The residual conflict is O-2. |
| 5 | Two mailboxes on a third domain, unexplained and untested | **Half fixed.** The page now says whose mailboxes they are. Whether they are monitored is O-1. |
| 6 | The keyboard focus ring in every light section is teal-400 on cream, 2.14:1 against the 3:1 SC 1.4.11 and 2.4.11 require | **Fixed**, after re-measuring. See the note below: the first two attempts to measure it said 16.75:1 and were wrong. |
| 7 | No report, and untracked scratch trees in the working tree | **Fixed.** This report, and section 9. |
| 8 | The page that names the company was titled after the platform | **Fixed.** `Legal and company information · Impact Investment Group UK Limited`. |
| 9 | `"12 Aug 2026"` still in `src/`, so the brief's gate did not pass as written | **Fixed.** Two comments reworded to describe the defect without quoting the date. `grep` over `src/` now returns nothing. |
| 11a | The crisis panel opened with an `h2` above the page's `h1` | **Fixed.** It is an `aria-label`led region, so it is still announced and still listed in the regions rotor, with the heading order left alone. |
| 11b | `/legal`'s canonical and `og:url` are relative | **Not changed.** Every page on the site does this; it is a site-wide pattern, not this wave's, and changing one page would make the site inconsistent without fixing anything. |
| 11c | `hover:text-white` is inert on the cream footer | **Not changed.** Pre-existing across the whole footer. The four new links are underlined, so their affordance does not depend on hover. |
| 11d | `/legal` is entirely cream, with no navy alternation | **Not changed.** The section rhythm in `CLAUDE.md` is for the marketing pages; a company-information page reading as one calm light document is right. |

**On finding 6, and why the first two measurements lied.** The base rule is
`:focus-visible { outline: 2px solid var(--color-teal-400) }`. Reading
`getComputedStyle(el).outlineColor` on a focused footer link returned
`rgb(0, 17, 43)` (navy, 16.75:1) in **both** builds, which would have made the
finding a false alarm. Two things were wrong with that reading. Focusing the
element with `.focus()` does not make it match `:focus-visible`; and once focus
was driven from the keyboard instead, the value read was still wrong, because
Tailwind's `transition-colors` animates `outline-color` over 200ms and the read
happened mid-transition from `currentColor`. Waiting 320ms after the Tab gives
the settled value:

| Build | Element | Settled outline colour | On | Ratio |
|---|---|---|---|---|
| before `8f15cdb` | footer link, cream ground | `rgb(47, 186, 170)` teal-400 | `#f7f1e6` | **2.14:1 FAIL** |
| after | the new footer legal link | `rgb(23, 121, 111)` teal-600 | `#f7f1e6` | **4.67:1 PASS** |
| after | footer site link, cream ground | `rgb(23, 121, 111)` teal-600 | `#f7f1e6` | **4.67:1 PASS** |

The fix is one unlayered rule in `src/styles.css`:
`.section-light :focus-visible { outline-color: var(--color-teal-600); }`.
It applies site-wide on cream grounds, is visible only while an element holds
keyboard focus, and only ever makes the ring darker. The finding is pre-existing,
but the four new footer links are cream-ground by construction and this was their
only focus affordance, so it was fixed rather than inherited.

**The review also confirmed, independently:** the four links are present exactly
once each in the footer of all eighteen prerendered pages including the ten
`partner-with-*` pages and `/about`, `/platform`, `/partners`, `/the-problem` and
`/solutions`; the footer markup is byte-identical across all seventeen non-legal
pages and differs on `/legal` only by `aria-current="page"` on the self-link; all
three external documents return 200; the company fields match a Companies House
record it fetched itself; `If you need help now` occurs once; and no page the
wave did not target changed outside the footer.

---

## 7. The gate

Run in the foreground on a frozen tree at `027ebd9`. Nothing was backgrounded and
no watcher was armed.

**This repo's lint number is not a gate, for the reason wave 295 recorded.**
`npm run lint` reports tens of thousands of `Delete ␍` problems from
`core.autocrlf` on Windows, which is a property of the working copy and not of
anything committed. The meaningful measurement is **eslint over the committed
blobs**, base against head, which is what CI and Lovable see:

| File | base `8f15cdb` | head | delta |
|---|---|---|---|
| `src/components/contact/enquiry-form.tsx` | 3 | 3 | 0 |
| `src/components/home/site-footer.tsx` | 1 | 1 | 0 |
| `src/components/partners/partner-page.tsx` | 6 | 6 | 0 |
| `src/components/site-footer.tsx` | 0 | 0 | 0 |
| `src/content/contact.ts` | 2 | 2 | 0 |
| `src/content/legal.ts` | new | **0** | 0 |
| `src/content/partners.ts` | 0 | 0 | 0 |
| `src/content/site.ts` | 0 | 0 | 0 |
| `src/routes/legal.tsx` | new | **0** | 0 |
| `src/routes/sitemap[.]xml.ts` | 0 | 0 | 0 |
| `vite.config.ts` | 0 | 0 | 0 |
| **total** | **12** | **12** | **0** |

Every remaining problem is the same pre-existing prettier finding on the same
content. The four this wave did add were fixed by hand (`739f5a6`) rather than
with `eslint --fix`, so that no file was rewritten from CRLF to LF: that is the
trap wave 295 hit, where a two-line change became a 1,114-line diff on a
Lovable-synced repo.

| Gate | Result |
|---|---|
| `tsc --noEmit` | 22 errors, **all pre-existing and identical to the base**: 18 in `partner-page.tsx`, 2 in `about.tsx`, 2 in `vite.config.ts`. Zero in any file this wave created. |
| `STATIC_BUILD=true vite build` | rc 0. **32 pages prerendered, up from 31**, `failOnError: true`, no retries. `/legal` is in the list and `dist/client/legal/index.html` exists. |
| axe-core, WCAG 2.2 AA + best practice, `/`, `/contact`, `/legal`, `/partner-with-resident` at 360 and 1440, against a build of the base commit as control | **0 new violation nodes, 1 fixed on each pre-existing page.** Run twice, identical both times. |
| The same script's three manual checks (one `h1` per page; every legal link at least 24px on its smallest side; every legal link reachable by Tab alone) | **0 failures**, 8 page-width combinations |
| Focus-ring contrast, measured after the transition settles | 2.14:1 before, **4.67:1 after** |
| Measured contrast on every element this wave authored | all pass, section 8 |
| `rg` for the dated insurance line in `src/` | **absent** (`12 Aug 2026`, `13 Aug 2025`, `12 August 2026`, `Cover 13`) |
| Em dashes in every line this wave authored | **0** |
| Emoji in the rendered text of all 32 pages | **none** |
| Icons | Lucide only: `Landmark`, `ShieldCheck`, `ScrollText`, `Mail`, `LifeBuoy`, `ArrowUpRight` |
| New dependency | none. axe-core is pointed at an extracted copy by env var and is not in `package.json` |

`/legal` finishes with **7 axe findings at each width, none of them the page's
own**: eight nodes in the shared footer and one in the shared header, every one of
which also fires on `/` and `/contact` in the base build. They are pre-existing
`color-contrast` findings on `text-slate-muted` labels and on the orange
`Register Here` button, and they are out of this wave's scope. The one the wave
did fix is listed below.

**One pre-existing contrast finding was fixed**, because it is the disclosure the
wave exists to make readable: the footer's legal notice was `text-slate-muted`,
which `.section-light` maps to `--color-slate` `#647289`, **4.33:1** on the cream
and a fail for 11px body copy. It is now `text-mist`, which maps to
`--color-slate-ink` `#4e5a6e`, **6.20:1**. That is one class on one element. The
other `slate-muted` labels in the footer are untouched and still fail.

---

## 8. Measured contrast and target size, this wave's own elements

Computed in the browser against the real rendered background, at 1440.

| Element | Foreground | Background | Size/weight | Ratio | Box |
|---|---|---|---|---|---|
| Footer legal link | `#00112b` | `#f7f1e6` | 13px/500 | **16.75:1** | 124 x 32 |
| Footer legal notice | `#4e5a6e` | `#f7f1e6` | 11px/400 | **6.20:1** | 833 x 54 |
| Notice at collection, body | `#647289` | `#ffffff` | 12px/400 | **4.87:1** | 530 x 33 |
| Notice at collection, controller | `#647289` | `#ffffff` | 12px/600 | **4.87:1** | 212 x 15 |
| Notice at collection, policy link | `#00112b` | `#ffffff` | 12px/600 | **18.83:1** | 136 x 15 |
| `/legal` H2 | `#00112b` | `#ffffff` | 26px/700 | **18.83:1** | |
| `/legal` company value | `#00112b` | `#ffffff` | 17px/600 | **18.83:1** | |
| `/legal` field label | `#647289` | `#ffffff` | 12px/700 | **4.87:1** | |
| Crisis heading | `#ffffff` | `#00112b` | 17px/700 | **18.83:1** | 630 x 26 |
| Crisis body | `#c6d2e4` | `#00112b` | 14px/400 | **12.32:1** | 601 x 91 |
| Crisis phone link | `#ffffff` | `#00112b` | 14px/600 | **18.83:1** | **44 x 44** |

Two notes on this table.

The **notice-at-collection policy link resolves to navy, not teal**, and that is
the cascade working rather than a mistake. Its class list contains
`hover:text-white`, which the unlayered `.section-light [class*="text-white"]`
rule matches at all times, so on a light section the link renders navy at
18.83:1; on a navy section the same element would render teal. It is underlined
and semibold either way, so its affordance never depends on colour. Left as it
is deliberately: it adapts to the ground, which a hard-coded colour would not.

The **crisis phone links are 44 x 44**, width as well as height. `"111"` sets a
15px-wide line, so the NHS number was a 15 x 44 target. WCAG 2.2 SC 2.5.8 passes
that on the spacing exception, since the three rows are 50px apart, and axe
passed it. `min-w-11` was added anyway: a 15px-wide crisis number is a bad target
whether or not it conforms.

---

## 9. Screenshots

`docs/screenshots/wave298/`, twelve files, JPEG, at 360 and 1440, all taken from
the static builds through Playwright by `scripts/wave298-screenshots.py`.

| File | What |
|---|---|
| `footer-before-{360,1440}.jpg` | the footer at the base commit, `/contact` |
| `footer-after-{360,1440}.jpg` | the same footer with the four legal links and the corrected notice |
| `legal-page-{360,1440}.jpg` | `/legal` whole |
| `legal-company-block-{360,1440}.jpg` | the company record on its own |
| `contact-form-{360,1440}.jpg` | the form with the notice at collection beside the submit button |
| `resident-crisis-signpost-{360,1440}.jpg` | the crisis panel above the fold |

At 360 the four legal links wrap to two centred rows and stay legible. In the
full-page shots the site header appears part-way down the image: that is a
Playwright artefact with a sticky header on a full-page capture, not a rendering
defect. The element-cropped shots are unaffected.

---

## 10. What was left alone

- **`main` was not pushed, merged or rebased**, and there was no force-push. A
  push to `main` deploys `impactinvestmentgroup.co.uk`, and Lovable forbids
  history rewrites. Cowork lands this.
- **Nothing outside this worktree was touched.** `git add -u` was never used;
  every commit named its files. The sibling worktree `../iigs-uc295` and the
  platform worktrees were read from and never written to.
- **No page outside the ruling's scope changed**, except that the footer is on
  every page by construction. The nine non-resident pathway pages carry no crisis
  panel, as R298-6 requires.
- **No statistic, testimonial, figure or citation was added, removed or altered.**
  The five sourced figures in `CLAUDE.md` section 6 are untouched.
- **No new dependency, no data operation, no secret, no `render.yaml`, no
  migration.** This is the site repo; nothing in `Impact-Investment-Platform` was
  touched, so no platform test, build or audit is owed and none was run.
- **Scratch removed at session end:** the `.wave298-before` git worktree (a build
  of the base commit, used as the axe and screenshot control), `.wave298-lint/`,
  `.wave298-lint-report.py` and `.wave298-patch.py`. None was ever committed.

## 11. For whoever lands this

1. **Land wave 295 first.** It is `ready` on the same repo, on
   `feat/wave295-register-to-join-the-waitlist`, and its `/register` form posts
   into a 404 until wave 294 is live. Its branch has moved since the Landing-Queue
   row was written (`3030490` at that point, `2d9b7a7` when this wave finished),
   so take its head from the remote rather than from either record. Three files overlap,
   all in disjoint regions: `src/content/site.ts` (295 edits `registerRoute`, 298
   edits `legalNotice` and `trustRegistrations`), `vite.config.ts` (295 parses its
   prerender list from `audiences.ts`, 298 appends one literal `/legal` entry) and
   `src/routes/sitemap[.]xml.ts` (295 appends the register routes, 298 appends
   `/legal`). 295 also edits `src/styles.css`, in the `@theme` token block; this
   wave adds one rule in the light-sections block, about 500 lines away.
2. **Merge `origin/main` into this branch, never rebase**, and re-run the build
   and the axe gate afterwards, because the footer is layout.
3. **Wave 297 must say the same things.** Same company record (section 3), same
   mailbox decision (O-1), same insurance position (O-3). If 297's own Companies
   House lookup disagrees with section 3, stop and reconcile before either lands.
4. **Do not let the copy through without O-1 and O-3 answered.** Everything else
   in this wave is evidenced; those two are published on somebody else's word.
