# Wave 298 · The site names its company and links its policies

**Repo:** `israel-silgram/Impact-Investment-Group-site` (the MARKETING SITE, not the platform)
**Branch:** `feat/wave298-the-site-names-its-company`, worktree `../iigs-uc298`
**Base:** `origin/main` `8f15cdb`, unchanged throughout the session
**Brief:** `CLAUDE_CODE_wave298_the-site-names-its-company.md` (Callum, 9 Sep 2026, 13:40 UK)
**Source review:** `Impact Investment Group/05-Artifacts/legal-footer-review-2026-09-09/REVIEW.md`
**Status:** ready. `main` was not pushed, merged or rebased. Cowork lands it.
**Gated head:** the mailbox pass of 10 September 2026. The only commit above it
is this report, which no build, lint or audit reads.

**Callum's decisions are applied.** O-1, O-2, O-3 and O-4 in section 5 are
answered rather than open. What remains open is O-5 (one browser check on the
ICO register), O-6 (a change wave 295 owes) and O-7 (a pre-existing defect in a
file nothing currently ships).

**⚠ O-1 WAS AMENDED ON 10 SEPTEMBER 2026 AND THE GENERAL ADDRESS CHANGED AGAIN.**
`hello@impactig.co.uk` is not a real mailbox and never was. The general address
across the whole site is now **`enquires@impactig.co.uk`**, spelt with no second
"i", which is how the mailbox exists. Section 12 records the pass.

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
| R298-5 | The three mailboxes Callum settled, shown on `/legal` and named at the point of collection | `src/content/legal.ts`, `src/routes/legal.tsx`, `src/content/contact.ts` |
| R298-6 | Crisis signposting above the fold on the resident page only | `src/content/partners.ts`, `src/components/partners/partner-page.tsx` |
| R298-7 | Independent review pass, its findings, and this report | section 6 |

`src/components/home/site-footer.tsx` **is not rendered by any route.** `__root.tsx`
draws `@/components/site-footer`; nothing imports the other one. It was changed
anyway, and a comment says why: restoring it must not silently drop the legal
links, which is the exact failure this wave was called in to fix.

**Five files outside the brief's list were touched, and each has a reason:**

| File | What, and why it is not in the brief's list |
|---|---|
| `src/styles.css` | ONE rule. The keyboard focus ring on cream measured 2.14:1 against the 3:1 SC 1.4.11 and 2.4.11 require, and the four new footer links are cream-ground by construction, so it was their only focus affordance. Section 6, finding 6. |
| `src/routeTree.gen.ts` | Generated, not written. Adding `src/routes/legal.tsx` regenerates it on the next build; committing it is how the route resolves without a build step. |
| `scripts/wave298-axe.py` | NEW. The footer census and the axe pass. A gate has to live somewhere, and the brief asked for a recorded axe pass. |
| `scripts/wave298-screenshots.py` | NEW. Takes the twelve screenshots R298-7 asks for, from the two static builds. |
| `src/routes/contact.tsx` | ONE meta description, in the 10 September mailbox pass. It carried its own hard-coded copy of the general address, and Callum's instruction was to replace every general-enquiries use of it. Section 12.3. |

Both scripts are build-time auditors and neither ships: nothing under `src/`
imports them, and the site has no new dependency because of them.

**`src/content/trust.ts` was named in the brief as "the insurance evidence" and
is not where that lives.** It holds the eighteen commissioning councils and their
disclaimer, the five data-source credits and the OpenStreetMap attribution, and
the three static platform-stat tiles. The insurance card is
`trustRegistrations` in `src/content/site.ts`, which is what was changed.
`trust.ts` is untouched by this wave.

---

## 3. The verified company record

Read from the **Companies House public register**, read only, by WebFetch, on
**9 September 2026**: the company profile page,
`https://find-and-update.company-information.service.gov.uk/company/16650494`,
and its filing history, `/filing-history`.

| Field | Value | Evidence |
|---|---|---|
| Registered company name | Impact Investment Group UK Limited | Company page heading |
| Company registration number | 16650494 | Company page |
| Registered office, **as filed** | `Renewal Trust Business Centre 3 Hawksworth St Nottingham NG3 2EG` | **Form AD01, filed 29 May 2026**, quoted verbatim from the filing history |
| Registered office, as the profile page prints it | `Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG` | Company page, verbatim |
| Registered office, as this site prints it | `Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG` | Accepted by Callum on 9 Sep 2026 (O-4). Differs from the filing: see below |
| Jurisdiction of registration | England and Wales | Advanced search filtered to `companyJurisdiction=england-wales` returns this company |
| Company type | Private limited company | Company page |
| Incorporated | 14 August 2025 | Company page |
| Status | Active | Company page |
| SIC codes (not published on the site) | 68100, 68209, 68320 | Company page |

Two other companies match the name loosely and are **not** this one: IMPACT GROUP
(UK) LIMITED (05391046, London) and IMPACT GROUP UK HOLDINGS LTD (15928699,
dissolved 3 Feb 2026).

**On the registered office, and the one place this wave departs from the filed
address.** There are three strings in play.

The company profile page assembles the address from separate fields and its own
comma lands mid-name: the premises field is `Renewal Trust Business` and the
first address line is `Centre 3 Hawksworth St`. That is why it prints
`Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG`.

**The filing settles it.** Form AD01 of 29 May 2026 records the change of
registered office and prints the new address as one unbroken, unpunctuated line:
`Registered office address changed from New Broad Street House 35 New Broad
Street London EC2M 1NH England to Renewal Trust Business Centre 3 Hawksworth St
Nottingham NG3 2EG on 29 May 2026`. So the building name really is "Renewal
Trust Business Centre", the profile page's comma really is a field-split
artefact, and the street really is **"3 Hawksworth St"**, abbreviated.

**Callum accepted the tidied reading on 9 September 2026 (O-4)** and the site
prints `Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG`.
Against the filed form that makes one substantive change, expanding `St` to
`Street`, and adds two commas the filing does not carry. `src/content/legal.ts`
holds all three strings: `registeredOffice` is what renders,
`registeredOfficeAsRegistered` is the profile page's, and
`registeredOfficeAsFiled` is the AD01's. Neither of the last two is rendered;
they exist so anyone can check the reasoning without repeating the lookup.

**⚠ THE PLATFORM AND THE SITE CURRENTLY DISCLOSE THE SAME ADDRESS IN TWO
DIFFERENT FORMS.** Wave 297 is `ready` printing
`Renewal Trust Business Centre, 3 Hawksworth St, Nottingham, NG3 2EG`, following
the AD01 exactly. This wave prints `Street` and drops the comma before the
postcode. Both are defensible readings of the same filing and only one of them
should ship. **It is a one-line edit on either side and it is Callum's call.**
Section 11 item 3 carries it forward as a landing blocker.

**One reason this got a decision at all:** an earlier draft of this wave made
these edits while its comment described the change as comma-only. The
independent review pass caught it, the address was reverted to the register's
string, and it is printed tidied again now only because Callum said so. The
difference between the two states is not the string; it is that one was a silent
assumption and the other is a decision on the record. The cleanest fix of all
remains correcting the premises field at Companies House, after which the
profile page, the filing and both properties read the same.

The vault's `IIP_MASTER_SOURCE_OF_TRUTH.md` independently records `3 Hawksworth
Street, Nottingham NG3 2EG` as Elevate Supported Living's registered office,
which corroborates the street and postcode and confirms the field-split reading.

**The ICO registration could not be verified from this session, and is still
awaiting one browser check.** `ico.org.uk` returns HTTP 403 to automated fetches
on every path tried, including its own public pages, so neither
`ESDWebPages/Entry/ZB957755` nor the register search could be read. `ZB957755`
was **not invented**: it is the reference the site already published before this
wave and the reference the platform's Terms already publish, attributed there to
Impact Investment Group UK Limited by name. It is published here on that
evidence, shown with its verify link so a reader can check it in one click, and
**marked in this report and in the handover as awaiting confirmation.** See O-5,
and section 11 item 5.

---

## 4. Every string changed, before and after

### 4.1 The footer notice (`src/content/site.ts`, `legalNotice`) · both footers, every route

Before:

> Not authorised or regulated by the FCA · not a Collective Investment Scheme · capital at risk · sourcing, packaging and managed investment services, not advice · take independent advice. **Registered office: Impact Investment Group UK Limited.** © 2026, an Impact Investment Group initiative.

After:

> Not authorised or regulated by the FCA · not a Collective Investment Scheme · capital at risk · sourcing, packaging and managed investment services, not advice · take independent advice. **Impact Investment Group UK Limited is registered in England and Wales, company number 16650494. Registered office: Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG.** © 2026, an Impact Investment Group initiative.

The regulatory framing is untouched, word for word. Only the registered-office
clause changed, and the four values in it are interpolated from `companyRecord`
so they cannot drift from the record in section 3.

### 4.2 The insurance card (`src/content/site.ts`, `trustRegistrations[insurance].details`)

Before: `PI limit £100,000 · PL limit £10,000,000` · **`Cover 13 Aug 2025 – 12 Aug 2026`** · `Underwritten by Victor Insurance / MS Amlin via Insurance-Desk Services`

After: `PI limit £100,000 · PL limit £10,000,000` · **`Current insurance evidence available on request`** · `Underwritten by Victor Insurance / MS Amlin via Insurance-Desk Services`

The replacement is R298-4's prescribed wording. It stops the site showing an
ended period as current, and it does not by itself evidence that cover exists
today: the label and the two limits still come off the expired certificate.
**Callum deferred that gap on 9 September 2026, with one review trigger, the
renewed certificate arriving.** O-3 carries the decision and the wording for
both outcomes.

### 4.3 The notice at collection (`src/content/contact.ts`) · beside the submit control on `/contact`

Before, one flat string with no controller and no link:

> UK GDPR · we use your details only to answer this enquiry · ICO ZB957755

After, rendered as one sentence with two real anchors in it:

> **Impact Investment Group UK Limited** is the data controller for this form. We use your details only to answer this enquiry. To ask about the data we hold about you, write to **admin@impactig.co.uk**. UK GDPR · ICO ZB957755 · **Read the Privacy Policy** (opens in a new tab)

The purpose clause is the same promise, word for word. Three things were added
and nothing was weakened: the controller is named, there is an address to write
to about the data itself (a different question from how to reach the business,
which the general address answers), and the Privacy Policy is one click away. No box was added; no box is pre-ticked; the only checkbox
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

**The nav that holds them is `aria-label="Legal and policies"`, not "Legal".**
One of the four links is itself called Legal, and a region sharing its name with
a link inside it announces as "Legal, navigation" immediately before "Legal,
link", which gives a screen-reader user no way to tell the container from its
contents. Both footer components use the same string and the footer census
(section 7) asserts it on every page.

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
- `Legal and data-protection enquiries, including requests about personal data, are read at the address above.`
- Card blurbs, **three of them, one per document**: `The terms on which the services are provided.` · `How personal data is collected, used and stored.` · `The qualifications that apply to figures, matches and claims.`

There is no fourth card blurb. The documents index is built from the EXTERNAL
links only, so the fourth link, `Legal`, never becomes a card: a card on the
Legal page describing the Legal page would link the reader to where they already
are. `description` is optional on `LegalLink` for that reason and the `Legal`
entry carries none. An earlier draft of this report listed a fourth blurb that
the page has never rendered.

Mailboxes shown, as Callum settled them on 9 September 2026:
`enquires@impactig.co.uk` (General enquiries), `support@impactig.co.uk` (Support),
`admin@impactig.co.uk` (Legal and data protection). **No address on
`impactinvestmentplatform.com` survives anywhere in the built site**, measured
across all 18 pages.

`canonical` and `og:url` are absolute: `https://impactinvestmentgroup.co.uk/legal`,
taken from this repo's `public/CNAME`. Every other route on the site still emits
root-relative values for both, which is the same defect and is not this wave's to
fix; section 11 item 6 carries it forward.

No claim of regulatory authorisation or exemption appears on the page. The
company's regulatory position is stated once, in the footer notice, and it says
what the company is not.

### 4.6 The resident crisis signpost (NEW, `src/content/partners.ts` → `crisisSignpost`)

Heading: `If you need help now`

Body:

> This page describes a network that looks for homes that may suit you. It is not an emergency service and it cannot house you today. A person from the housing and support team confirms every match before anything happens. If you need help now, these lines are there for anyone.

The helpline numbers are **not** new copy: the panel reads `crisisLines` and
`crisisNote` from `src/content/site.ts`, the same source the footer uses, so a
changed number cannot be right in one place and stale in the other. Samaritans
116 123, Shelter 0808 800 4444, NHS 111, and `If life is at risk, call 999.`

`crisisSignpost` is optional on `PartnerProfile` and is set on the resident
profile alone. `If you need help now` occurs **once** in the whole built site.
The resident page's existing `importantNote` about circumstances, assessments,
eligibility and statutory decision-making is present, once, unchanged.

**The heading is a real `<h2>`, and the heading order is deliberately
imperfect.** The panel sits above the page's `<h1>`, so its heading is a level 2
before any level 1 exists. That is the trade, made knowingly:

- Pressing H is how most screen-reader users move through a page. A labelled
  `<section>` alone is reachable only through the landmarks or regions list,
  which is a deliberate detour. For crisis signposting, discoverability beats
  tidiness.
- `h2` then `h1` is a **decrease** in level. axe's `heading-order` rule does not
  flag it and no success criterion forbids it; the rule is about skipping levels
  on the way down.
- `aria-labelledby` points the section at that heading, so the block is also
  announced by name in the regions list.

An intermediate revision made it a `<p>` to keep the outline clean and lost the
heading entirely. Both reviewers were right about their own half; this is the
shape that satisfies both, and the component comment records the trade so it is
not silently undone a third time.

### 4.7 Not rendered, corrected anyway

`src/content/contact.ts` → `registeredOffice` was an unused block carrying a
company NAME under the title `Registered office`, the same defect as 4.1. It now
carries `address` and `number` from `companyRecord` too, so restoring the block
cannot reintroduce the defect.

---

## 5. The questions, and what Callum decided

Four of the seven are closed. **O-1, O-2, O-3 and O-4 are decisions of
9 September 2026 (evening) and are recorded here so the reasoning behind each
survives the wave.** O-5, O-6 and O-7 remain.

**O-1 · The mailboxes. ANSWERED.** (R298-5)
*The question was:* `legal@` and `privacy@impactinvestmentplatform.com` were
published on `/legal` on the authority of the platform's own Terms and Privacy
Policy, with nobody having tested that anyone reads them. A subject-access
request into an unread mailbox is a real failure with a statutory clock on it.
*Callum's decision:* all three mailboxes move to `impactig.co.uk` and are
monitored.

| Purpose | Address |
|---|---|
| General enquiries | `enquires@impactig.co.uk` (amended 10 Sep, see section 12) |
| Support | `support@impactig.co.uk` |
| Legal and data protection | `admin@impactig.co.uk` |

The two `impactinvestmentplatform.com` addresses are **retired, not
republished**, and appear nowhere in the built site. `admin@impactig.co.uk` is
also named in the notice at collection on `/contact`, because how to reach the
controller about the data is a different question from how to reach the
business, and the general address answers the second one. `mailboxesNote` on
`/legal` reads
`Legal and data-protection enquiries, including requests about personal data,
are read at the address above.` **Wave 297 must move the platform's Terms and
Privacy Policy to the same three;** until it has, the published documents and
this page name different addresses, and the documents are what a reader relies
on.

**O-2 · The controller. ANSWERED, and the page still waits on wave 297.**
*The question was:* the platform's Terms name Impact Investment Group UK Limited
in a company table but make "the platform" the contracting party, and the
Privacy Policy makes "the platform" the controller, without identifying another
entity.
*Callum's decision:* the controller is **Impact Investment Group UK Limited**,
and wave 297 is aligning the platform's Terms and Privacy Policy to that entity
and to the mailboxes above.

The contact form names that controller, which R298-3 directed and which is now
also Callum's decision. **`/legal` still says only where the documents are
published, and that is deliberate.** Until wave 297 has actually changed those
documents, a reader who clicks through from a sentence saying they are published
by Impact Investment Group UK Limited would not find that entity named in them.
The replacement sentence is written out in full in the comment above
`policiesNote` in `src/content/legal.ts`, ready to drop in the day 297 lands:

> "The Terms of Service, Privacy Policy and Disclaimer are published by Impact
> Investment Group UK Limited on the platform at app.impactinvestmentgroup.co.uk.
> This site publishes no separate versions of them; those documents are the ones
> that apply."

**O-3 · The insurance card. DEFERRED BY CALLUM.** (R298-4)
*The position:* the dated cover period is gone from everything that renders,
which is what the ruling asked for. It does not make the card fully honest on
its own. The card still reads `PI & PL Insured` and still states `PI limit
£100,000 · PL limit £10,000,000`, and both came off the certificate that expired
on 12 August 2026.
*Callum's decision, 9 September 2026: the card ships as it stands.* This is a
decision on the record, not an open question. It has **one review trigger: the
renewed certificate arriving.** Nothing else reopens it, and the card should not
be quietly softened in the meantime.

*When the certificate arrives:* add the insurer and the period BESIDE the
"available on request" line, never instead of it, and diary their removal for the
day that period ends. Proposed detail line: `"Cover <start> to <end>,
<insurer>"`.
*If it turns out there is no current cover:* the honest card is
`details: ["Insurance evidence available on request"]`, with the label changed
from `PI & PL Insured` to `Professional indemnity and public liability` and the
limits removed until a current certificate supports them.

**O-4 · The registered office. ACCEPTED.**
*The question was:* print the register's string verbatim,
`Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG`, which is
exactly checkable and slightly odd to read, or the tidied form.
*Callum's decision, 9 September 2026:* print the tidied form,
**`Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG`**.

`registeredOfficeAsRegistered` (the profile page's string) and
`registeredOfficeAsFiled` (the AD01's) sit beside it, unrendered, so the
reasoning can be checked without repeating the lookup. The departures are named
in the code comment with the date and the decision.

**⚠ AND THIS IS NOW THE ONE PLACE WHERE THE TWO WAVES DISAGREE.** Wave 297 went
to the filing history for its evidence and prints
`Renewal Trust Business Centre, 3 Hawksworth St, Nottingham, NG3 2EG`, which is
the AD01 verbatim apart from punctuation. This site prints `Street` and no comma
before the postcode. **Both properties would disclose the same registered office
in two different forms, which is exactly the kind of small inconsistency a
solicitor or a council procurement officer notices.** Neither is wrong; they
should simply match. A one-line edit in `src/content/legal.ts` here, or in
`packages/branding/config.ts` there. Callum picks. The AD01's own `St` is the
easier one to defend, because it is what the company actually filed.

The cleanest fix of all is still to correct the premises field at Companies
House, after which the profile page, the filing and both properties read the
same and none of this matters.

**O-5 · One click to confirm the ICO registration. STILL OPEN, and it is the
one published value on this site that no machine in this session could check.**
`ico.org.uk` answers HTTP 403 to automated fetches on every path tried, so
`ZB957755` could not be read off the register. It is not invented: it is the
reference the site already published before this wave, and the reference the
platform's Terms publish, attributed there to Impact Investment Group UK Limited
by name. It is published on that evidence and shown with its verify link.

*What is needed:* somebody with a browser opens
`https://ico.org.uk/ESDWebPages/Search`, searches `ZB957755`, and confirms the
registered name on the entry is **Impact Investment Group UK Limited**. One
minute. Then this line can be marked verified in `src/content/legal.ts` and
here.
*If the name on the register is different:* stop, because the site, the
platform's Terms and this report all attribute that reference to this company,
and all three would need correcting together.

**O-6 · Wave 295's `/register` form needs the same notice.** (R298-3, measured
across waves) At this wave's base commit `/contact` is the only form on the site
that collects personal data, and it is fixed. Wave 295, `ready` and not yet on
`main`, adds a waitlist form whose privacy line (`registerPrivacy` in
`src/content/register.ts`) names no controller, gives no address for data
questions, and links to the ICO register search rather than to a Privacy Policy.
**This wave did not touch it: the brief forbids touching wave 295's register
routes.** Proposed change for whoever lands 295, updated for Callum's O-1 and
O-2 decisions:
`body: "Impact Investment Group UK Limited is the data controller. We store your answers to shape what the platform does and to match you when it opens. We do not sell them and we do not pass them to anyone outside Impact Investment Group. To ask about the data we hold about you, write to admin@impactig.co.uk. Registered with the ICO under ZB957755."`,
`linkLabel: "Read the Privacy Policy"`,
`href: "https://app.impactinvestmentgroup.co.uk/privacy"`.

**O-7 · The sitemap does not ship, and never has.** `src/routes/sitemap[.]xml.ts`
is a server handler and the GitHub Pages build sets `nitro: false`, so no
`sitemap.xml` is emitted and `robots.txt` names none. Confirmed again on the
final build: `dist/client` contains 18 `index.html` files and no `sitemap.xml`.
Its `BASE_URL` is also still `""`, which would make every `<loc>` relative and
invalid if it did ship. `/legal` was added to the file so it is in the sitemap
the day somebody fixes the route, and both the route and `legal.tsx` carry a
comment saying so. Pre-existing, out of this wave's scope, worth a small
follow-up wave alongside the absolute-canonical fix in section 11 item 6.

---

## 6. R298-7 · the independent review pass, and what it changed

One adversarial pass, a subagent reading the **rendered prerendered HTML** and the
screenshots rather than the diff, against the review's findings and the rulings.
It raised ten numbered findings plus a group of minors. Six were fixed in code
(commit `126592e`), one more after re-measuring (`027ebd9`), and three became
questions for Callum, all three of which he has since answered (section 5).

A **second** review pass then read the diff and found nine more things, fixed in
`d6db1b6` along with Callum's decisions. Its two majors are the last two rows of
this table; its minors are folded into the rows they correct.

| # | Finding | Outcome |
|---|---|---|
| 1 | The registered office was tidied in three ways and the comment claimed only the comma had moved | **Fixed, then decided.** The address was first reverted to the register's string, character for character, and the tidy was put to Callum as O-4. He accepted the tidied form on 9 Sep 2026, so the site prints `Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG` again. What changed is not the string but its standing: the comment now names all three departures, who accepted them and when, and `registeredOfficeAsRegistered` holds the register's exact text beside it. |
| 2 | The insurance card still asserts current cover, with limits, on an expired certificate | **Raised as O-3, not silently changed, and Callum has since DEFERRED it.** R298-4 prescribes the replacement sentence and routes the residue to a question; the card ships as it stands, with one review trigger (the renewed certificate arriving) recorded in O-3 and in the code comment. |
| 3 | `/legal`'s "Registrations and cover" lead implied the company is on the FCA register, on a page whose footer says it is not | **Fixed.** The sentence now ends `The FCA reference below belongs to the insurance broker, not to this company.` |
| 4 | `/legal` asserted the platform's documents are "published by the company" and "are the ones that apply", both determinations nobody has made | **Fixed.** The sentence now states only where the documents are. The residual conflict is O-2. |
| 5 | Two mailboxes on a third domain, unexplained and untested | **Fixed, by Callum's decision.** The page first said whose mailboxes they were; O-1 then retired them. All three addresses are now on `impactig.co.uk` and monitored, and `impactinvestmentplatform.com` appears nowhere in the built site. |
| 6 | The keyboard focus ring in every light section is teal-400 on cream, 2.14:1 against the 3:1 SC 1.4.11 and 2.4.11 require | **Fixed**, after re-measuring. See the note below: the first two attempts to measure it said 16.75:1 and were wrong. |
| 7 | No report, and untracked scratch trees in the working tree | **Fixed.** This report, and section 9. |
| 8 | The page that names the company was titled after the platform | **Fixed.** `Legal and company information · Impact Investment Group UK Limited`. |
| 9 | `"12 Aug 2026"` still in `src/`, so the brief's gate did not pass as written | **Fixed.** Two comments reworded to describe the defect without quoting the date. `grep` over `src/` now returns nothing. |
| 10 | `/legal`'s comment claimed the page was added to the sitemap, but nothing in `sitemap[.]xml.ts` ships under a static build | **Fixed in the comments, kept as O-7.** The route is a server handler and the build sets `nitro: false`, so no `sitemap.xml` is emitted at all. Both the route and `legal.tsx` now say so. Emitting one is a follow-up, not this wave. |
| 11a | The crisis panel opened with an `h2` above the page's `h1` | **Fixed, then reversed on the second pass, and the trade is now written down.** It became an `aria-label`led region with a `<p>`, which cleaned the outline and cost the block its heading. It is an `<h2>` again, with `aria-labelledby` pointing the section at it, so heading navigation reaches it AND it is named in the regions list. Section 4.6 carries the reasoning. |
| 12 | **Second pass, MAJOR.** R298-1 was audited on four representative pages, which says nothing about the other fourteen | **Fixed.** A footer census now enumerates every `index.html` the static build emits and asserts, in each one, all four labels and exactly one legal nav. 18 of 18. Section 7. |
| 13 | **Second pass, MAJOR.** The ICO reference is published but was never verified | **Recorded, not hidden.** It stays published on the evidence it has, and is marked as awaiting a one-click browser check in O-5 and in the handover, section 11 item 5. |
| 14 | **Second pass, minors.** A card blurb the page never renders; section 6 skipping 10 and 11; "one file outside the brief" when it was four; a footer comment quoting the wrong ratio; section 8 inconsistent on the controller colour; nothing said about `src/content/trust.ts`; relative canonical and `og:url` on `/legal`; "open to anyone" | **All fixed.** In order: the `Legal` link's description is dropped and `description` is optional; this table now runs 1 to 14; section 2 lists all four files; the footer comment says what actually resolves and why; section 8 explains the controller row; section 2 says what `trust.ts` holds; both `/legal` head values are absolute; and the copy reads "there for anyone". |
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
`npm run lint` reports **20,830 problems at the base commit and 21,218 here**,
and the whole of that +388 is `Delete ␍` from `core.autocrlf` on Windows landing
on the lines this wave added to files that are stored with CRLF. It is a property
of the working copy, not of anything committed: the two files the wave created
are LF and score zero. Both numbers were measured the same way, the base from a
throwaway detached worktree of `8f15cdb` sharing this one's `node_modules`, which
was removed afterwards.

The meaningful measurement is **eslint over the committed blobs**, base against
head, which is what CI and Lovable actually see:

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
| **Footer census over EVERY page** (`scripts/wave298-axe.py`, first pass) | **18 of 18 pages: 4 of 4 labels and exactly 1 `<nav aria-label="Legal and policies">` in each.** 0 failures. See the note below on what 18 means. |
| `tsc --noEmit` | 22 errors, **all pre-existing and identical to the base**: 18 in `partner-page.tsx`, 2 in `about.tsx`, 2 in `vite.config.ts`. Zero in any file this wave created. |
| `STATIC_BUILD=true vite build` | rc 0. **32 pages prerendered, up from 31**, `failOnError: true`, no retries. `/legal` is in the list and `dist/client/legal/index.html` exists. |
| axe-core, WCAG 2.2 AA + best practice, `/`, `/contact`, `/legal`, `/partner-with-resident` at 360 and 1440, against a build of the base commit as control | **0 new violation nodes, 1 fixed on each pre-existing page.** Run repeatedly, identical every time. |
| The same script's three manual checks (one `h1` per page; every legal link at least 24px on its smallest side; every legal link reachable by Tab alone) | **0 failures**, 8 page-width combinations |
| Focus-ring contrast, measured after the transition settles | 2.14:1 before, **4.67:1 after** |
| Measured contrast on every element this wave authored | all pass, section 8 |
| `rg` for the dated insurance line in `src/` | **absent** (`12 Aug 2026`, `13 Aug 2025`, `12 August 2026`, `Cover 13`) |
| Em dashes in every line this wave authored | **0** |
| Emoji in the rendered text of all 32 pages | **none** |
| Icons | Lucide only: `Landmark`, `ShieldCheck`, `ScrollText`, `Mail`, `LifeBuoy`, `ArrowUpRight` |
| New dependency | none. axe-core is pointed at an extracted copy by env var and is not in `package.json` |

**On the page count, because two different numbers are both correct.** The
prerenderer reports **32 pages**; the build emits **18 `index.html` files**, and
18 is the number that matters. `src/routes` holds 18 page routes (19 `.tsx`
files, of which `__root.tsx` is the layout), and `dist/client` holds exactly 18
directories with an `index.html` in each. The other 14 of the prerenderer's 32
are duplicate crawl targets that resolve to routes already emitted: seven
`/contact?enquiry=...` query variants and seven `/solutions#...` hash variants.
18 + 14 = 32. Nothing is missing and nothing extra is written.

The **non-route outputs** in `dist/client` are `assets/`, `images/`,
`favicon.png`, `robots.txt`, `methodology-pack.txt` and `CNAME`. There is no
`sitemap.xml` (O-7). Every `.html` file in the build is an `index.html`, so the
census covers the whole of the site's HTML with nothing excluded by the glob.

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
| Notice at collection, data-contact link | `#00112b` | `#ffffff` | 12px/600 | **18.83:1** | |
| Notice at collection, policy link | `#00112b` | `#ffffff` | 12px/600 | **18.83:1** | 136 x 15 |
| `/legal` H2 | `#00112b` | `#ffffff` | 26px/700 | **18.83:1** | |
| `/legal` company value | `#00112b` | `#ffffff` | 17px/600 | **18.83:1** | |
| `/legal` field label | `#647289` | `#ffffff` | 12px/700 | **4.87:1** | |
| Crisis heading | `#ffffff` | `#00112b` | 17px/700 | **18.83:1** | 630 x 26 |
| Crisis body | `#c6d2e4` | `#00112b` | 14px/400 | **12.32:1** | 601 x 91 |
| Crisis phone link | `#ffffff` | `#00112b` | 14px/600 | **18.83:1** | **44 x 44** |

Three notes on this table.

**The controller's name is the same colour as the body text around it, and its
emphasis is weight, not colour.** Its span carries `text-mist`, but it sits
inside the form, which is `bg-navy-800/50`, and the light-section rule
`.section-light [class*="bg-navy-"] [class*="text-mist"]` maps that to
`--color-slate` `#647289`, the same value the paragraph gets. So the row above
reads identically to the body row, and that is correct rather than a
transcription error: the name is distinguished by `font-semibold` alone, at
4.87:1 on white. Colour is not carrying any meaning there, which is what SC
1.4.1 asks.

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

All twelve were retaken from the final build, after Callum's decisions, so the
address, the three mailboxes, the notice at collection and the crisis wording in
them are the ones that ship. The two `footer-before` shots are of the base
commit and are unchanged by anything in this wave.

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
  of the base commit, used as the axe and screenshot control), a second throwaway
  worktree used only to lint the base commit, `.wave298-lint/`,
  `.wave298-lint-report.py` and the `.wave298-patch*.py`, `.wave298-report.py`
  and `.wave298-queue.py` edit scripts. None was ever committed, and none is
  needed to rebuild anything: `scripts/wave298-axe.py` and
  `scripts/wave298-screenshots.py` are the two that are.

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
3. **⚠ WAVE 297 IS ALSO `ready`, AND THE TWO WAVES DISAGREE ABOUT TWO THINGS.
   Both are one-line edits and both should be settled before either lands.**

   *The registered office.* 297 prints
   `Renewal Trust Business Centre, 3 Hawksworth St, Nottingham, NG3 2EG`,
   sourced to form AD01 of 29 May 2026, which is the strongest evidence there
   is and which this wave has independently confirmed. This site prints
   `Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG`,
   which Callum accepted on 9 September 2026 before that filing had been
   quoted to him. The difference is `St` against `Street` and one comma.
   Neither is wrong; they should match. `registeredOffice` in
   `src/content/legal.ts` here, `COMPANY_DETAILS` in
   `packages/branding/config.ts` there. **The AD01's own `St` is the easier one
   to defend, because it is what the company filed.**

   *The mailboxes.* 297's report, written before Callum's evening decision,
   still prints `legal@impactinvestmentplatform.com` and
   `privacy@impactinvestmentplatform.com` and asks him to confirm them. **He
   has since retired both** (O-1): legal and data protection go to
   `admin@impactig.co.uk`, support to `support@impactig.co.uk`, general
   enquiries go to `enquires@impactig.co.uk` (amended 10 Sep, section 12).
   297's own report says this is "one
   edit to `COMPANY_DETAILS`". Until that edit is made, the platform's Terms
   and Privacy Policy publish two addresses this site has retired, and the
   published documents are what a reader relies on.

   Everything else agrees: same company name, same number `16650494`, same
   jurisdiction, same controller (O-2), same insurance position (O-3).
4. **When 297 lands, one sentence on `/legal` should change.** The replacement
   for `policiesNote` is written out in O-2 and in the comment above it in
   `src/content/legal.ts`. It is a one-line edit and it is the last thing
   holding `/legal` back from naming the company as the publisher of those
   documents.
5. **CALLUM: please confirm the ICO reference.** Open
   `https://ico.org.uk/ESDWebPages/Search`, search `ZB957755`, and check the
   registered name on the entry reads **Impact Investment Group UK Limited**.
   It is the one published value on this site that no automated check in this
   session could reach, because `ico.org.uk` returns 403 to them. It is not
   invented, and it is not verified either. One minute closes it. See O-5.
6. **Two small follow-ups this wave found and deliberately did not take.**
   `/legal` emits an absolute `canonical` and `og:url`; every other route still
   emits root-relative ones, which no crawler can resolve reliably. And nothing
   in `src/routes/sitemap[.]xml.ts` ships at all under the static build (O-7).
   Both are pre-existing, both are small, and neither belongs in a legal and
   compliance wave.

---

## 12. Review fixes, 10 September 2026: the general mailbox

**Callum, 14:50 UK, 10 September 2026: `hello@impactig.co.uk` is not a real
mailbox.** It had been printed across this site since long before wave 298, and
nothing had ever bounced to anyone who would notice. The general enquiries
address is **`enquires@impactig.co.uk`**. `support@impactig.co.uk` and
`admin@impactig.co.uk` are unchanged.

### 12.1 The spelling is not a typo

`enquires`, with no second "i". That is how the mailbox was created and it is
the address that receives mail. A well-meant correction to `enquiries@` would
send every general enquiry on this site to a mailbox that does not exist,
silently. Both `src/content/legal.ts` and the `contactDetails` block in
`src/content/site.ts` now carry a comment saying so in terms, and both also say
that `hello@` was never real, so it cannot be copied back out of an old commit,
an old screenshot, or the before-and-after tables in this report.

### 12.2 O-1 as amended

| Purpose | Address | Changed |
|---|---|---|
| General enquiries | `enquires@impactig.co.uk` | **Yes**, from `hello@impactig.co.uk` |
| Support | `support@impactig.co.uk` | No |
| Legal and data protection | `admin@impactig.co.uk` | No |

The two `impactinvestmentplatform.com` addresses remain retired. Nothing on this
site presents the general address as the support or the data-protection contact,
so nothing had to be reclassified: every use of `hello@` was a general-enquiries
use. That was checked rather than assumed, and section 12.3 lists all five.

### 12.3 Every occurrence, and what it became

`git grep hello@` over the whole repository found five in shipped source, plus
this report. Each was a general-enquiries use.

| Where | Was | Now |
|---|---|---|
| `src/content/site.ts`, `contactDetails.email` | `"hello@impactig.co.uk"` | reads `generalEnquiriesAddress` |
| `src/content/legal.ts`, `legalMailboxes` General enquiries row | `"hello@impactig.co.uk"` | reads `generalEnquiriesAddress` |
| `src/routes/contact.tsx`, the page's `<meta name="description">` | `"... Email hello@impactig.co.uk or call +44 7539 088373."` | interpolates `contactDetails.email` and `contactDetails.phone` |
| `src/components/contact/enquiry-form.tsx`, the submit-failure line | `... or email hello@impactig.co.uk directly.` | interpolates `contactDetails.email` |
| `src/content/contact.ts`, a code comment | ``` `hello@` answers enquiries ``` | ``` `enquires@` answers enquiries ``` |

`CLAUDE.md` also contains `callum.saxon@impactig.co.uk`. That is a personal
address in a project brief, not a general-enquiries use, and it was left alone.
There is no JSON-LD or structured-data block anywhere on this site, so there was
no machine-readable copy of the address to miss.

### 12.4 One address, one place

Two of those five were hard-coded duplicates of a string that had just proved it
can change: the meta description and the failure line. **They now interpolate**,
so the next mailbox change is one edit rather than five.

The constant lives in `src/content/legal.ts` as `generalEnquiriesAddress`, and
`contactDetails.email` in `src/content/site.ts` imports it. **The direction
matters and is not arbitrary.** `site.ts` already imports `companyRecord` from
`legal.ts`, so putting the address in `site.ts` and importing it back would make
a cycle between two modules of top-level `const`s. That resolves to `undefined`
at evaluation time rather than failing loudly, which would have printed
`mailto:undefined` on the Legal page. `legal.ts` imports nothing, which is what
makes it the safe home for the shared value.

### 12.5 The gate, re-run in full

| Gate | Result |
|---|---|
| `git grep hello@` over `src`, `public`, `scripts`, `vite.config.ts` | **Only the two comments that warn against reinstating it.** No shipped string. |
| `hello@` in the built output | **absent from all 18 pages** |
| `enquires@impactig.co.uk` in the built output | **41 occurrences across all 18 pages; none missing it** |
| `/legal` mailboxes, rendered | `enquires@`, `support@`, `admin@`, all `impactig.co.uk` |
| `/contact` meta description, rendered | `Tell us what you need and a person replies within one working day. Email enquires@impactig.co.uk or call +44 7539 088373.` |
| `tsc --noEmit` | 22 errors, **all pre-existing and identical to the base**: 18 `partner-page.tsx`, 2 `about.tsx`, 2 `vite.config.ts` |
| `STATIC_BUILD=true vite build` | rc 0, 32 prerendered, 18 `index.html` |
| Footer census, every emitted page | **18 of 18: 4 of 4 labels, exactly 1 legal nav** |
| **Render census, every emitted page (NEW)** | **18 of 18 render: 0 new page errors, body text present, one h1, one legal nav** |
| axe, 4 pages x 2 widths, against the base build | **0 new violation nodes, 0 failures** |
| Em dashes authored | **0**, in this pass and across the wave |
| Committed-content lint | unchanged, section 7 |

### 12.6 The render census, and why it now exists

**A build in this pass emitted a `/contact` that rendered nothing, and every
file-level check passed it.** The inline TanStack router manifest was spliced
mid-token:

> `"/contact":$R[8]={preloads:$Relf.$_TSR,delete self.$R.tsr)},p(e){...`

which threw `Unexpected identifier 'self'`, then `Invariant failed`, and left
`document.body.innerText` empty. The markup above that script was perfectly
intact, so the footer census saw four legal labels and one legal nav and
reported the page healthy. Only the axe pass noticed, and only because
`/contact` happens to be one of the four pages it audits.

It did not reproduce on rebuild, so it is a **build flake, not a source
defect**. That is precisely why it needed a standing check: a flake nobody
catches is a blank page on the live site, and fourteen of the eighteen pages
have no axe coverage at all.

`scripts/wave298-axe.py` now loads **every** emitted page in a real browser and
asserts it renders: no new uncaught page error, body text present, exactly one
`h1`, exactly one legal nav.

**It has a before/after control, like the axe pass, and finding out why took a
red gate.** Its first run failed `/contact` on React error #418, a hydration
mismatch. Measured against a build of the base commit, **`/contact` throws
#418 at `8f15cdb` too**, and `/` and `/about` throw nothing in either build. So
it is pre-existing, this wave neither caused it nor was asked to fix it, and the
census reports it as pre-existing rather than failing on it. React minifies its
errors and appends the arguments to the URL, so the census keys on the error
**number** rather than the message; two different hydration mismatches would
otherwise look like two unrelated strings.

**That #418 is worth a follow-up wave and is not one this pass should take.** A
hydration mismatch on the contact page means React discards the server-rendered
markup for the mismatched subtree and re-renders it on the client, which is a
flash of changed content for a real visitor on the one page that asks them to
type something.
