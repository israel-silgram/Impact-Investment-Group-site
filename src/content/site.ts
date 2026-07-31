/** Site navigation. Kept as data so copy edits never touch layout. */
export interface NavItem {
  label: string;
  to: string;
}

export const primaryNav: NavItem[] = [
  { label: "The Problem", to: "/the-problem" },
  { label: "Our Solutions", to: "/solutions" },
  { label: "The Platform", to: "/platform" },
  { label: "About", to: "/about" },
];

export const siteName = "Impact Investment Platform";

export const contactDetails = {
  email: "hello@impactig.co.uk",
  phone: "+44 7539 088373",
  hours: "Mon–Fri, 9–5",
} as const;

export const footerSiteLinks: NavItem[] = [
  { label: "The Problem", to: "/the-problem" },
  { label: "Our Solutions", to: "/solutions" },
  { label: "The Platform", to: "/platform" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/** Each deep-links to /contact with the enquiry type pre-selected. */
export const contactRoutes: { label: string; enquiry: string }[] = [
  { label: "Join the wait list", enquiry: "waitlist" },
  { label: "Speak to the team", enquiry: "team" },
  { label: "Become a partner", enquiry: "partner" },
  { label: "Investor pre-release access", enquiry: "investor" },
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
    details: [
      "PI limit £100,000 · PL limit £10,000,000",
      "Cover 13 Aug 2025 – 12 Aug 2026",
      "Underwritten by Victor Insurance / MS Amlin via Insurance-Desk Services",
    ],
  },
];

/** Verbatim and unedited. Do not rewrite. */
export const legalNotice =
  "Not authorised or regulated by the FCA · not a Collective Investment Scheme · capital at risk · sourcing, packaging and managed investment services, not advice · take independent advice. Registered office: Impact Investment Group UK Limited. © 2026, an Impact Investment Group initiative.";
