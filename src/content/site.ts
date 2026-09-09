import { companyRecord, insuranceEvidenceLine } from "@/content/legal";

/** Site navigation. Kept as data so copy edits never touch layout. */
export interface NavItem {
  label: string;
  to: string;
}

/**
 * Confirmed navigation. There is deliberately no Homepage item — the logo is
 * the home link. "Register Here" and "Log in" are chrome, not nav items, and
 * live in the header itself.
 */
export const primaryNav: NavItem[] = [
  { label: "About Us", to: "/about" },
  { label: "Our Services", to: "/platform" },
  { label: "The Problem", to: "/the-problem" },
  { label: "The Solution", to: "/solutions" },
  { label: "Partners", to: "/partners" },
  { label: "Contact Us", to: "/contact" },
];

/** Where every "Register Here" action points. One destination, one label. */
export const registerRoute = {
  label: "Register Here",
  to: "/contact",
  search: { enquiry: "waitlist", type: "waitlist" },
} as const;

export const siteName = "Impact Investment Platform";

/**
 * The closing line every page ends on — home, About, Our Services, The Problem.
 *
 * ⚠️ THIS LIVES HERE BECAUSE IT IS SITE-WIDE, NOT BECAUSE ANY ONE PAGE OWNS IT.
 * It used to be defined inside content/about.ts, which meant the Problem page
 * either imported About's content (wrong) or kept its own copy of the same
 * sentence (worse — two copies drift, and then two pages close on subtly
 * different brand lines).
 *
 * `beats` is the same sentence split for display: the middle beat takes the
 * accent, the outer two stay white. Rejoin with a space to get `strapline`
 * back. If one changes, change both.
 *
 * The 'Coming soon · register your interest' line above the buttons is NOT
 * here — it belongs to <PreReleaseBadge>, which every page already renders.
 */
export const closingStrapline = "Providing Homes. Delivering Support. Transforming Lives.";
export const closingBeats = ["Providing Homes.", "Delivering Support.", "Transforming Lives."];

/** Supporting positioning line. "Intelligent infrastructure", never "AI-powered platform". */
export const positioningLine =
  "Building Homes. Delivering Support. Transforming Lives. The UK's intelligent infrastructure for housing, care and support.";

/** One-line description used in site metadata and in the footer. */
export const siteDescription =
  "We are building the UK's specialist property, care, AI and social impact platform — connecting investors, housing associations, landlords, providers and partners to create homes for families in temporary accommodation and vulnerable adults needing supported housing.";

export const contactDetails = {
  email: "hello@impactig.co.uk",
  phone: "+44 7539 088373",
  hours: "Mon–Fri, 9–5",
} as const;

/** Same labels as the header, so the two never drift apart. */
export const footerSiteLinks: NavItem[] = [
  { label: "About Us", to: "/about" },
  { label: "Our Services", to: "/platform" },
  { label: "The Problem", to: "/the-problem" },
  { label: "The Solution", to: "/solutions" },
  { label: "Partners", to: "/partners" },
  { label: "Contact Us", to: "/contact" },
];

/** Each deep-links to /contact with the enquiry type pre-selected. */
export const contactRoutes: { label: string; enquiry: string }[] = [
  { label: "Talk to the team", enquiry: "demo" },
  { label: "Register your interest", enquiry: "waitlist" },
  { label: "Become a partner", enquiry: "partner" },
  { label: "Investor enquiry", enquiry: "investor" },
  { label: "Media", enquiry: "media" },
  { label: "Support", enquiry: "support" },
];

export const crisisLines: { label: string; detail: string }[] = [
  { label: "Samaritans", detail: "116 123" },
  { label: "Shelter", detail: "0808 800 4444" },
  { label: "NHS", detail: "111" },
];

export const crisisNote = "If life is at risk, call 999.";

export interface TrustRegistration {
  id: string;
  category: string;
  label: string;
  reference: string;
  verifyLabel: string;
  verifyHref: string;
  /** Extra published terms shown beneath the reference. Never abbreviate. */
  details?: string[];
}

export const trustRegistrations: TrustRegistration[] = [
  {
    id: "ico",
    category: "Data protection",
    label: "ICO Registered",
    reference: "ZB957755",
    verifyLabel: "Verify on register",
    verifyHref: "https://ico.org.uk/ESDWebPages/Search",
  },
  {
    id: "prs",
    category: "Consumer redress",
    label: "PRS Member",
    reference: "PRS053648",
    verifyLabel: "Verify with the scheme",
    verifyHref: "https://www.theprs.co.uk/Membership/Search",
    details: ["Provider: HF Resolution Ltd t/a PRS", "Scheme phone: 0333 321 9418"],
  },
  {
    id: "insurance",
    category: "Indemnity & liability",
    label: "PI & PL Insured",
    reference: "FCA broker FRN 305402",
    verifyLabel: "Verify the broker on the FCA register",
    verifyHref: "https://register.fca.org.uk/s/",
    /*
     * ⚠ THE COVER PERIOD IS GONE AND MUST NOT COME BACK AS A FIXED DATE RANGE.
     * This card read "Cover 13 Aug 2025 – 12 Aug 2026" and was still saying so
     * on the live site in September 2026, a month after that period ended,
     * beside a heading that reads "PI & PL Insured". A period that has passed,
     * presented as current cover, is the one thing this card cannot do.
     * `insuranceEvidenceLine` (content/legal.ts) replaces it and stays true
     * through every renewal. If a current certificate is supplied, add the
     * insurer and dates BESIDE that line, never instead of it. (Wave 298.)
     */
    details: [
      "PI limit £100,000 · PL limit £10,000,000",
      insuranceEvidenceLine,
      "Underwritten by Victor Insurance / MS Amlin via Insurance-Desk Services",
    ],
  },
];

/**
 * The regulatory framing is verbatim and unedited. Do not rewrite it, and do
 * not add a claim of authorisation or exemption to it.
 *
 * ⚠ ONE CLAUSE CHANGED, IN WAVE 298. It used to read "Registered office:
 * Impact Investment Group UK Limited.", which is a company NAME under a label
 * that promises a postal ADDRESS, and the address is the one thing a reader
 * checking a registered office is looking for. It now carries the company's registered
 * name, its number, the jurisdiction it is registered in and the actual
 * registered office, all four read off the Companies House public register
 * (see content/legal.ts for the source, the date and the address note).
 * If any of them changes on the register, change it there, not here.
 */
export const legalNotice =
  `Not authorised or regulated by the FCA · not a Collective Investment Scheme · capital at risk · sourcing, packaging and managed investment services, not advice · take independent advice. ${companyRecord.name} is registered in ${companyRecord.jurisdiction}, company number ${companyRecord.number}. Registered office: ${companyRecord.registeredOffice}. © 2026, an Impact Investment Group initiative.`;
