/**
 * FAQ for /contact.
 *
 * Transcribed verbatim from the accordion on the old production homepage
 * (iip-web.onrender.com). NOT summarised — unlike the marketing copy elsewhere
 * on this site, several of these answers are the places where risk, regulation
 * and safeguarding are actually stated, and shortening them would change what
 * the business has committed to in writing.
 *
 * Three answers in particular are load-bearing:
 *
 *   "Is this regulated…"   the capital-at-risk and FCA position, in full
 *   "Who lives in the…"    CQC registration in progress, and that placement
 *                          decisions are never made by the platform
 *   "I'm looking for a…"   the crisis numbers, and that the seeker pathway
 *                          supports but never substitutes statutory services
 *
 * If any of these is ever edited, it needs the same sign-off as the compliance
 * text in the footer.
 */

export interface FaqItem {
  id: string;
  q: string;
  /** One paragraph per entry — rendered as separate <p> elements. */
  a: string[];
}

export const faqEyebrow = "Questions";
export const faqHeading = "The questions people ask us most.";

export const faq: FaqItem[] = [
  {
    id: "what",
    q: "What is The Impact Investment Platform?",
    a: [
      "One platform connecting the people who fund homes, the people who run them and the people who need them. The Impact Investment Platform sources UK residential property and helps convert it into safe, supported housing, with rental income underpinned by long institutional leases. The cash flow runs from the housing association, through Rhema Social Impact Group, to the investor.",
      "Impact Investment Group sources and packages every deal and runs the investor community. It provides property sourcing and managed-investment services — it is not an estate agent, and it does not give financial, legal, tax or mortgage advice.",
    ],
  },
  {
    id: "regulated",
    q: "Is this regulated, and what are the risks?",
    a: [
      "Capital at risk. Property is illiquid and its value can rise or fall; income and returns are never promised, and past performance is not a guide to the future.",
      "Impact Investment Group is not authorised or regulated by the Financial Conduct Authority (FCA), and the platform is not a Collective Investment Scheme. Take independent professional advice before you invest.",
      "The Impact Investment Platform provides property sourcing, deal packaging and managed investment services, not financial, legal, tax, or mortgage advice. Investing into property on the platform is also a direct investment into the lives of the people housed by Elevate Supported Living.",
    ],
  },
  {
    id: "lease",
    q: "How does the 5 year+ lease work?",
    a: [
      "Rhema Social Impact Group holds the head lease directly with the investor — a 5 year+ FRI, CPI or internal repairing lease, paid monthly in advance — and under-leases each home to a UK Registered Provider.",
      "Rhema Social Impact Group carries compliance, repairs and reporting, so the investor is not exposed to individual-tenant credit risk. The lease is a commitment, not a promise of any particular return — capital remains at risk.",
    ],
  },
  {
    id: "residents",
    q: "Who lives in the homes, and who provides the care?",
    a: [
      "The homes provide safe, supported housing for adults who need it. Elevate Supported Living delivers the care and support, with safeguarding and a human allocation gate at the centre of every placement.",
      "Elevate Supported Living is in the process of registering with the Care Quality Commission (CQC), the regulator of care services. The home itself sits with a UK Registered Provider, regulated by the Regulator of Social Housing. Placement decisions are made by the Registered Provider and, where involved, the local authority — never by the platform.",
    ],
  },
  {
    id: "seeker",
    q: "I'm looking for a home — can this help me?",
    a: [
      "The platform can show homes that may suit you, and a real person — not an algorithm — reviews every enquiry. A human housing officer confirms every match. We never say a home is yours until that has happened.",
      "The seeker pathway supports — but never substitutes — statutory housing and social care services. If you need support right now, help is one tap away: Samaritans 116 123 · Shelter 0808 800 4444 · NHS 111. If life is at risk, call 999.",
    ],
  },
  {
    id: "organisations",
    q: "How do organisations work with you?",
    a: [
      "Connecting organisations is the point of the platform. We work with housing associations, local authorities, care providers and estate agents. Housing associations and Registered Providers take on under-leases; local authorities and care providers refer people who need supported housing; estate agents and vendors bring suitable homes to source.",
      "Whatever the route, the aim is the same — turning ordinary homes into places where people are safe and supported. Talk to Impact Investment Group to find the right fit.",
    ],
  },
  {
    id: "numbers",
    q: "How do you keep the numbers honest?",
    a: [
      "Every figure on the platform is one of three things: a real number with a named source, an estimate clearly labelled as such with its method shown, or an honest blank where we have not sourced it yet.",
      "We never invent a number to fill a gap, and we never dress a placeholder up as real. If something is not known, the platform says so.",
    ],
  },
];
