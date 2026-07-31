/** Copy and field configuration for /contact. */

export const enquiryRouteIds = [
  "demo",
  "sales",
  "partner",
  "investor",
  "media",
  "support",
] as const;

export type EnquiryRouteId = (typeof enquiryRouteIds)[number];

export interface EnquiryRoute {
  id: EnquiryRouteId;
  label: string;
  subline: string;
  /** Promised reply time, shown once a route is selected. */
  reply: string;
  /** Internal desk the enquiry is routed to. */
  routedTo: string;
}

export const enquiryRoutes: EnquiryRoute[] = [
  {
    id: "demo",
    label: "Book a demo",
    subline: "See the platform on your own caseload · 30 min",
    reply: "We reply within one working day",
    routedTo: "Platform team",
  },
  {
    id: "sales",
    label: "Speak to sales",
    subline: "Pricing, contracts, procurement routes",
    reply: "We reply within one working day",
    routedTo: "Commercial team",
  },
  {
    id: "partner",
    label: "Become a partner",
    subline: "HAs, care providers, developers, agents",
    reply: "We reply within two working days",
    routedTo: "Partnerships team",
  },
  {
    id: "investor",
    label: "Investor enquiry",
    subline: "Pre-release access · capital at risk",
    reply: "We reply within one working day",
    routedTo: "Investor relations",
  },
  {
    id: "media",
    label: "Media",
    subline: "Press, interviews, factual checks",
    reply: "We reply the same working day where a deadline is given",
    routedTo: "Press office",
  },
  {
    id: "support",
    label: "Support",
    subline: "Existing users and partners",
    reply: "We reply within one working day",
    routedTo: "Support desk",
  },
];

export const roleOptions = [
  "Local authority · commissioning",
  "Local authority · housing",
  "NHS · discharge or ICB",
  "Housing association",
  "Care or support provider",
  "Investor",
  "Landlord",
  "Developer",
  "Estate agent",
  "Journalist",
  "Other",
];

export const entityTypeOptions = [
  "Housing association",
  "Care or support provider",
  "Developer",
  "Estate agent",
  "Landlord",
  "Technology or data provider",
  "Other",
];

export const ticketSizeOptions = [
  "Under £250k",
  "£250k – £1m",
  "£1m – £5m",
  "£5m – £25m",
  "Over £25m",
  "Not yet decided",
];

export const demoSlots = [
  "Tuesday · 10:00",
  "Wednesday · 14:30",
  "Friday · 09:30",
];

export const investorAcknowledgement =
  "I understand my capital is at risk and that this is not a Collective Investment Scheme, and that Impact Investment Group is not authorised or regulated by the FCA.";

export const privacyLine =
  "UK GDPR · we use your details only to answer this enquiry · ICO ZB957755";

export const lookingForHome = {
  title: "Looking for a home?",
  body: "This form is for organisations. If you need somewhere to live, or you support someone who does, use this route instead.",
  action: "Find a home",
};

export const registeredOffice = {
  title: "Registered office",
  entity: "Impact Investment Group UK Limited",
};
