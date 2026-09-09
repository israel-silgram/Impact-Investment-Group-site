/**
 * THE COMPANY RECORD, AND WHERE THE POLICIES LIVE.
 *
 * ⚠ EVERY VALUE IN `companyRecord` IS COPIED FROM THE COMPANIES HOUSE PUBLIC
 * REGISTER. Nothing here may be typed from memory, inferred from a domain
 * name, or filled with a placeholder. If a field cannot be evidenced it is
 * omitted from the page and raised as an outstanding question in the wave
 * report, because a wrong company number on a legal page is worse than a
 * missing one.
 *
 *   Source:    https://find-and-update.company-information.service.gov.uk/company/16650494
 *   Read on:   9 September 2026 (wave 298)
 *
 * ON THE REGISTERED OFFICE: IT IS THE REGISTER'S STRING, CHARACTER FOR
 * CHARACTER, AND IT LOOKS ODD ON PURPOSE. Companies House assembles the
 * address from separate fields and its own comma lands mid-name:
 *
 *   "Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG"
 *
 * The premises field is "Renewal Trust Business" and the first address line is
 * "Centre 3 Hawksworth St", so the comma sits inside what is really "Renewal
 * Trust Business Centre, 3 Hawksworth Street". Tidying it would be three
 * separate edits to a legally disclosed value: moving the comma, expanding
 * "St" to "Street", and dropping the comma before the postcode. An earlier
 * draft of this file DID tidy it and described the change as comma-only, which
 * is how a small improvement quietly becomes an unverified claim.
 *
 * So it is printed exactly as the register prints it, and a reader comparing
 * the two matches them character for character. The tidied form is a proposed
 * change in the wave 298 report for Callum to accept or refuse; if he accepts
 * it, change `registeredOffice` and leave `registeredOfficeAsRegistered`
 * alone, because that field is what makes the comparison possible.
 */

export interface CompanyRecordField {
  /** Shown as the row label. */
  label: string;
  /** The verified value. */
  value: string;
}

export const companyRecord = {
  name: "Impact Investment Group UK Limited",
  number: "16650494",
  registeredOffice: "Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG",
  /**
   * The register's own string. Identical to `registeredOffice` today, and kept
   * as a separate field so that if the tidied form is ever adopted there is
   * still one place holding what Companies House actually says.
   */
  registeredOfficeAsRegistered:
    "Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG",
  jurisdiction: "England and Wales",
  companyType: "Private limited company",
  incorporated: "14 August 2025",
  status: "Active",
  registerHref: "https://find-and-update.company-information.service.gov.uk/company/16650494",
  registerLabel: "View the entry on the Companies House register",
  /** When the values above were last read off the register. */
  verifiedOn: "9 September 2026",
} as const;

/** The rows the Legal page prints, in the order a reader checks them. */
export const companyRecordFields: CompanyRecordField[] = [
  { label: "Registered company name", value: companyRecord.name },
  { label: "Company registration number", value: companyRecord.number },
  { label: "Registered office", value: companyRecord.registeredOffice },
  { label: "Jurisdiction of registration", value: companyRecord.jurisdiction },
  { label: "Company type", value: companyRecord.companyType },
  { label: "Incorporated", value: companyRecord.incorporated },
  { label: "Status on the register", value: companyRecord.status },
];

/**
 * The four footer legal links, in the order they are shown.
 *
 * ⚠ TERMS, PRIVACY AND DISCLAIMER ARE EXTERNAL BY MEASUREMENT, NOT BY CHOICE.
 * This site publishes no Terms, Privacy Policy or Disclaimer of its own (there
 * is no `/terms`, `/privacy` or `/disclaimer` route in `src/routes`), so the
 * documents published on the platform are the canonical ones and the site
 * links straight to them. If this site ever gains its own, point these three
 * at the local routes and drop `external`.
 *
 * `Legal` is internal: the company block below is about this company and is
 * prerendered here so it survives with no network hop and no sign-in.
 */
export interface LegalLink {
  label: string;
  href: string;
  external: boolean;
  /** One line of context, used on the Legal page's index of documents. */
  description: string;
}

const platformDocsBase = "https://app.impactinvestmentgroup.co.uk";

export const legalLinks: LegalLink[] = [
  {
    label: "Terms of Service",
    href: `${platformDocsBase}/terms`,
    external: true,
    description: "The terms on which the services are provided.",
  },
  {
    label: "Privacy Policy",
    href: `${platformDocsBase}/privacy`,
    external: true,
    description: "How personal data is collected, used and stored.",
  },
  {
    label: "Disclaimer",
    href: `${platformDocsBase}/disclaimer`,
    external: true,
    description: "The qualifications that apply to figures, matches and claims.",
  },
  {
    label: "Legal",
    href: "/legal",
    external: false,
    description: "Company registration details, registrations and contacts.",
  },
];

/**
 * The Privacy Policy on its own, for the notice at collection on /contact.
 * Derived from `legalLinks` so the two can never point at different documents.
 */
export const privacyPolicyHref = legalLinks.find((l) => l.label === "Privacy Policy")!.href;

/** The three published mailboxes. See the wave 298 report for the open question. */
export interface LegalMailbox {
  purpose: string;
  address: string;
}

export const legalMailboxes: LegalMailbox[] = [
  { purpose: "General enquiries", address: "hello@impactig.co.uk" },
  { purpose: "Legal", address: "legal@impactinvestmentplatform.com" },
  { purpose: "Data protection and privacy", address: "privacy@impactinvestmentplatform.com" },
];

/*
 * THE SECOND AND THIRD MAILBOXES ARE ON A THIRD DOMAIN AND THE PAGE SAYS SO.
 * This site is served from impactinvestmentgroup.co.uk and its documents from
 * app.impactinvestmentgroup.co.uk, so two addresses at
 * impactinvestmentplatform.com read as a typo unless something explains them.
 * They are the addresses the platform's own Terms and Privacy Policy publish,
 * which is the only reason they are here.
 *
 * NOBODY HAS TESTED THAT THEY ARE MONITORED. The review says so in terms and
 * made no delivery test. A subject-access request into an unread mailbox is a
 * real failure, so this is outstanding question O-1 in the wave 298 report. If
 * Callum cannot confirm them, delete the two rows rather than leaving them:
 * one working address beats three published ones.
 */
export const mailboxesNote =
  "The legal and data-protection addresses are the mailboxes published in the platform's own Terms of Service and Privacy Policy.";

/*
 * THIS SENTENCE STATES WHERE THE DOCUMENTS ARE AND NOTHING ELSE.
 * It used to add "published by the company" and "the platform documents are
 * the ones that apply". Neither is ours to say: the review records that the
 * Terms name the contracting party as "the platform" and the Privacy Policy
 * names "the platform" as controller, without identifying a legal entity. So
 * attributing the documents to this company, and declaring them applicable to
 * a reader of this site, are both legal determinations nobody has made. They
 * are outstanding question O-2 in the wave 298 report instead.
 */
export const policiesNote =
  "The Terms of Service, Privacy Policy and Disclaimer are published on the platform at app.impactinvestmentgroup.co.uk. This site publishes no separate versions of them.";

export const legalPageEyebrow = "Company information";
export const legalPageTitle = "Legal";
export const legalPageLead =
  "Who this company is, where it is registered, and where to find the documents that govern its services.";

/**
 * ⚠ NEVER PRINT A COVER PERIOD AS CURRENT. The footer used to carry a fixed
 * twelve-month cover period that was still on the live site a month after it
 * had ended, beside a card headed "PI & PL Insured". A visitor reading it had
 * no way to tell whether the policy had been renewed. R298-4 prescribes the
 * sentence below in its place.
 *
 * ⚠ AND IT DOES NOT MAKE THE CARD FULLY HONEST ON ITS OWN. The card still
 * carries "PI & PL Insured" and two specific limits, and those came off the
 * same certificate that expired. Removing the date stops the site presenting
 * an ended period AS CURRENT, which is what the ruling asked for; it does not
 * evidence that cover exists today. That gap is outstanding question O-3 in
 * the wave 298 report, with the proposed wording, and it is Callum's to close
 * by supplying the renewed certificate. If he does, add the insurer and the
 * period BESIDE this line, never instead of it, and set a reminder to remove
 * them the day that period ends.
 */
export const insuranceEvidenceLine = "Current insurance evidence available on request";
