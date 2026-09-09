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
 * ON THE REGISTERED OFFICE. Companies House prints the address from separate
 * fields and its own comma lands mid-name:
 *
 *   "Renewal Trust Business, Centre 3 Hawksworth St, Nottingham, NG3 2EG"
 *
 * That is the premises field ("Renewal Trust Business") running into the first
 * address line ("Centre 3 Hawksworth St"). `registeredOffice` below rejoins
 * them without the field-split comma. Street and postcode are unchanged, and
 * `registeredOfficeAsRegistered` keeps the register's exact string so the two
 * can always be compared. Callum to confirm the presentation.
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
  registeredOffice: "Renewal Trust Business Centre, 3 Hawksworth Street, Nottingham NG3 2EG",
  /** The register's own string, kept verbatim. Not rendered. */
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
    description: "The terms on which the company provides its services.",
  },
  {
    label: "Privacy Policy",
    href: `${platformDocsBase}/privacy`,
    external: true,
    description: "How the company collects, uses and stores personal data.",
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

/** Where the site says its policies are published, and that it has none of its own. */
export const policiesNote =
  "The Terms of Service, Privacy Policy and Disclaimer are published by the company on the platform at app.impactinvestmentgroup.co.uk. This site publishes no separate versions of them; the platform documents are the ones that apply.";

export const legalPageEyebrow = "Company information";
export const legalPageTitle = "Legal";
export const legalPageLead =
  "Who this company is, where it is registered, and where to find the documents that govern its services.";

/**
 * ⚠ NEVER PRINT A COVER PERIOD AS CURRENT. The footer used to carry
 * "Cover 13 Aug 2025 – 12 Aug 2026", which was still on the live site in
 * September 2026, a month after it expired. A visitor reading it had no way to
 * tell whether the policy had been renewed. This sentence replaces it and is
 * true whatever the renewal date turns out to be. If Callum supplies a current
 * certificate, add the insurer and the period BESIDE this line, never instead
 * of it, and set a reminder to remove them the day the period ends.
 */
export const insuranceEvidenceLine = "Current insurance evidence available on request";
