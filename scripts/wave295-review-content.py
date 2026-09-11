"""Wave 295 review fixes: every change to src/content/register.ts.

Callum's decisions of 9 Sep evening and the independent review's items 1, 2 and
9, applied to the content file in one pass so the strings can be diffed as a
unit. Asserts on every anchor, so a second run fails loudly rather than half
applying.
"""

import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "src", "content", "register.ts")

EDITS = [
    # ── Callum: the price bands are accepted exactly as proposed ──────────
    (
        """ * PRICE BANDS, PROPOSED AND NOT CONFIRMED. Callum's to sign off, per R295-4.
 *
 * Two ladders, because the question means a different thing to a housing
 * association with a software line in its budget than to a landlord with four
 * houses. Both carry an honest bottom rung: somebody who would only use it
 * free is a real answer and a useful one, and leaving that rung off would push
 * them into a band they do not mean, which is worse than not asking.
 */""",
        """ * PRICE BANDS, CONFIRMED BY CALLUM ON 9 SEP 2026, exactly as proposed.
 *
 * Two ladders, because the question means a different thing to a housing
 * association with a software line in its budget than to a landlord with four
 * houses. Both carry an honest bottom rung: somebody who would only use it
 * free is a real answer and a useful one, and leaving that rung off would push
 * them into a band they do not mean, which is worse than not asking.
 *
 * These are now a PRICING INSTRUMENT and not a draft. Moving a band edge makes
 * every answer already collected against the old edges incomparable with the
 * new ones, so a change here is a change to the data, not to some copy.
 */""",
    ),
    # ── Review 1: the consent version ─────────────────────────────────────
    (
        """/** The divider in the hero, above the same ten tiles. */
export const registerAsDivider = "Register to join the waitlist as";""",
        """/** The divider in the hero, above the same ten tiles. */
export const registerAsDivider = "Register to join the waitlist as";

/**
 * WHICH WORDS THE PERSON AGREED TO, sent with every registration as
 * `consent_version`.
 *
 * ⚠️ BUMP THIS THE SAME DAY ANY CONSENT LABEL CHANGES, and treat that as the
 * point of the field. A stored `consent_email: true` is worth nothing on its
 * own: under UK GDPR what has to be demonstrable is what the person was
 * actually shown, and the only way to reconstruct that from a row is the
 * version stamp beside it. The labels this stamp covers are `consentBlock`
 * below, `residentHealthConsent`, and `registerPrivacy.body`.
 *
 * Date stamped rather than numbered so the row itself says when, and so two
 * people editing copy in the same week cannot both claim "v2".
 */
export const CONSENT_VERSION = "2026-09-10";""",
    ),
    # ── Review 2: the privacy line, wording Callum authorised ─────────────
    (
        """/**
 * ⚠️ THE SITE HAS NO PRIVACY NOTICE PAGE. There is no /privacy route to link
 * to, so this line links to the ICO register entry, which is a real
 * destination anyone can check, rather than to a 404. When a privacy notice is
 * published, point `href` at it and change `linkLabel` to "Read our privacy
 * notice". Flagged to Callum in docs/WAVE295_REPORT.md.
 */
export const registerPrivacy = {
  body: "We store your answers to shape what the platform does and to match you when it opens. We do not sell them and we do not pass them to anyone outside Impact Investment Group. Registered with the ICO under ZB957755.",
  linkLabel: "Check our ICO registration",
  href: "https://ico.org.uk/ESDWebPages/Search",
} as const;""",
        """/**
 * The privacy line. Wording proposed by wave 298 and authorised by Callum on
 * 9 Sep 2026, and it is not ours to reword without him.
 *
 * ⚠️ THE OLD LINE SAID WE DO NOT PASS ANSWERS TO ANYONE OUTSIDE THE GROUP,
 * WHICH WAS NOT TRUE. The registration is emailed and texted by third-party
 * suppliers and hosted on someone else's machines, so it names them as a class
 * instead of pretending they do not exist. It also names the controller,
 * because a data subject who wants to exercise a right has to know who to
 * write to, and gives the mailbox that answers those.
 *
 * The link now points at the platform's published Privacy Policy. The site
 * itself still has no /privacy route of its own; that is why the href is
 * absolute and off-site.
 */
export const registerPrivacy = {
  body: "Impact Investment Group UK Limited is the data controller. We store your answers to shape what the platform does and to match you when it opens. We do not sell them, and we share them only with the suppliers that run our email, text messages and hosting. Registered with the ICO under ZB957755. Questions about your data: admin@impactig.co.uk",
  linkLabel: "Read the Privacy Policy",
  href: "https://app.impactinvestmentgroup.co.uk/privacy",
} as const;

/**
 * THE RESIDENT PAGE'S SPECIAL-CATEGORY CONSENT.
 *
 * ⚠️ REQUIRED, UNTICKED, AND ONLY WHERE IT APPLIES. Three of that page's
 * answers are health or disability data about the person filling it in, and
 * two more are about somebody else entirely: "Someone I care for" and "A young
 * person I support". That is Article 9 special-category data, and the lawful
 * basis the rest of this form runs on does not reach it. So the page asks, in
 * words, and refuses to send those particular answers without a yes.
 *
 * It is deliberately NOT one of the two alert boxes. Those are optional and
 * the form submits happily without them. This one gates the answers it names
 * and nothing else: leave every one of those options alone and this box never
 * has to be ticked.
 */
export const residentHealthConsent = {
  id: "consentHealth",
  label:
    "I agree that you may use what I have told you about health, disability or support needs to look for suitable housing for me or the person I am helping",
  /** Shown only when one of the options below has been chosen. */
  requiredMessage:
    "Please tick the box above so we may use what you told us about health, disability or support needs. Or clear those answers and send the rest.",
} as const;

/**
 * The resident answers that turn `residentHealthConsent` from optional into
 * required. Values, not ids: these are the option strings themselves, so the
 * gate cannot drift from the words on the page.
 */
export const RESIDENT_SPECIAL_CATEGORY_OPTIONS = {
  who_for: ["Someone I care for", "A young person I support"],
  home_needs: ["Adapted for a disability", "Somewhere with support attached"],
} as const;""",
    ),
    # ── Review 2: the resident free-text goes ─────────────────────────────
    (
        """      {
        id: "situation_detail",
        label: "Anything you want us to know?",
        help: "Only if you want to. It helps us look for the right thing.",
        kind: "textarea",
        placeholder: "In your own words",
        maxLength: 2000,
      },
    ],
    submitLabel: "Add me to the list",""",
        """      /*
       * ⚠️ THE OPEN "Anything you want us to know?" BOX IS DELETED, NOT MOVED.
       *
       * On a page a person in housing difficulty lands on, a free-text box is
       * an invitation to write about a diagnosis, a court order, an abusive
       * ex-partner or a child's needs, and this site's privacy notice does not
       * yet say what happens to any of that. The other questions here are
       * closed lists we chose, so we know in advance what we are asking for
       * and can say so; a free-text box is the one field where we cannot.
       *
       * It comes back when the privacy notice covers free text, and not
       * before. Recorded in docs/WAVE295_REPORT.md under "Review fixes".
       */
    ],
    submitLabel: "Add me to the list",""",
    ),
]

# ── Review 9: the three ledes that promise six questions and render five ──
LEDES = [
    (
        "matches funded capital to housing demand councils and providers have already declared. Answer six questions now",
        "matches funded capital to the housing demand councils and providers publish. Answer five questions now",
    ),
    (
        "Answer six questions about the placements you are trying to make",
        "Answer five questions about the placements you are trying to make",
    ),
    (
        "Answer six questions about what you broker and where",
        "Answer five questions about what you broker and where",
    ),
]

# ── Review 9: claims the product cannot evidence yet ──────────────────────
CLAIMS = [
    (
        "It puts you at the front of the queue when the platform opens, and it puts your answer in the room while we are still deciding what it does.",
        "It puts you on the list before the platform opens, and it puts your answer in the room while we are still deciding what it does.",
    ),
    (
        "Councils and providers are already telling us where they need homes. Answer six questions",
        "Councils and providers publish where they need homes. Answer six questions",
    ),
    (
        "Every opportunity underwritten on named public data, with its source shown",
        "Every opportunity to be underwritten on named public data, with its source shown",
    ),
    (
        "Every figure underwritten on named public data, with its source shown",
        "Every figure to be underwritten on named public data, with its source shown",
    ),
    (
        "Named providers and councils, not anonymous enquiries",
        "Named providers and councils on the platform, not anonymous enquiries",
    ),
    (
        "Declared demand by area, so a scheme has an end user before it starts",
        "Published demand by area, so a scheme can have an end user before it starts",
    ),
    (
        "you can read declared demand by area before you buy the land",
        "you can read published demand by area before you buy the land",
    ),
    (
        "Demand by area is there to read from day one, not after a sales process",
        "Demand by area is there to read from the day it opens, not after a sales process",
    ),
    (
        "your stock is matched against that demand instead of sitting on a portal",
        "your stock is put in front of that demand instead of sitting on a portal",
    ),
    (
        "Your property matched against declared demand, not guessed at",
        "Your property matched against published demand, not guessed at",
    ),
    (
        "Your property is matched against declared demand from day one",
        "Your property is matched against published demand from the day it opens",
    ),
    (
        "Your declared need matched against real supply, by area",
        "Your stated need matched against real supply, by area",
    ),
    (
        "Stock, support partners and declared demand in one view",
        "Stock, support partners and published demand in one view",
    ),
    (
        "The platform exists to turn a council's declared need into property that actually appears.",
        "The platform exists to turn a council's stated need into property that actually appears.",
    ),
    (
        "Stock, support partners and declared demand in one view.",
        "Stock, support partners and published demand in one view.",
    ),
]


def main():
    s = io.open(P, encoding="utf-8").read()

    for old, new in EDITS:
        if old not in s:
            raise SystemExit(f"ANCHOR NOT FOUND:\n{old[:160]}")
        s = s.replace(old, new, 1)

    for old, new in LEDES:
        if old not in s:
            raise SystemExit(f"LEDE NOT FOUND:\n{old[:120]}")
        s = s.replace(old, new, 1)

    changed = 0
    for old, new in CLAIMS:
        n = s.count(old)
        if n:
            s = s.replace(old, new)
            changed += n
    print(f"claims reworded: {changed} occurrence(s)")

    # "this week" appears once per role and is the same promise every time.
    n = s.count("Your answers go into what we are building this week, not at launch")
    s = s.replace(
        "Your answers go into what we are building this week, not at launch",
        "Your answers go into what we are still deciding to build, not into a pile for launch day",
    )
    print(f'"this week" reworded: {n} occurrence(s)')

    io.open(P, "w", encoding="utf-8", newline="").write(s)
    print("ok src/content/register.ts")


if __name__ == "__main__":
    main()
