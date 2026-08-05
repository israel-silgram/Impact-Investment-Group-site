/**
 * /solutions content. Eight roles on one shared template.
 *
 * EDITORIAL: no statistics live here. Everything inside a `portal` block is
 * illustrative interface data and is labelled as such at the LiveWindow.
 */

export type RoleSlug =
  | "local-authorities"
  | "housing-associations"
  | "care-support-providers"
  | "investors"
  | "landlords"
  | "developers"
  | "estate-agents"
  | "contractors";

export interface PortalRow {
  primary: string;
  secondary: string;
  /** Right-hand readout. Illustrative only. */
  value: string;
}

export interface PortalState {
  /** Named state of the portal, e.g. "lease & stock view". */
  state: string;
  columns: [string, string];
  rows: PortalRow[];
  footnote: string;
  /** Secondary link label, e.g. "Open the Local Authority portal →". */
  linkLabel: string;
}

export interface RoleSection {
  slug: RoleSlug;
  /** 01–08, shown in the numbered eyebrow. */
  number: string;
  title: string;
  /** One line on the hero role card. */
  cardLine: string;
  /** lucide-react icon name. */
  icon: string;
  /** One-sentence promise, rendered as the section h2. */
  promise: string;
  /** Exactly three. Each carries its own icon — never a tick. */
  bullets: [RoleBullet, RoleBullet, RoleBullet];
  portal: PortalState;
  /** Rendered verbatim in slate-muted beneath the bullets. Investors only. */
  riskLine?: string;
  /** Commercial terms paragraph, rendered beneath the bullets. */
  terms?: string;
  /** Muted qualifier that must always travel with a care claim. */
  qualifier?: string;
  /** Compact, expand-on-click treatment for the supply side. */
  compact?: boolean;
  /** Enquiry type this role's closing routes carry. */
  enquiry: "team" | "partner" | "investor";
}

/**
 * A role bullet and the icon that carries it. Teal for data, process,
 * measurement and verification; orange for people, homes and care, and never
 * more than one orange in a card.
 */
export interface RoleBullet {
  text: string;
  /** lucide-react icon name, resolved in the component. */
  icon: string;
  tone: "teal" | "orange";
}

export const riskLine =
  "Capital at risk · not authorised or regulated by the FCA · not a Collective Investment Scheme · sourcing, packaging and managed investment services, not advice.";

export const roleSections: RoleSection[] = [
  {
    slug: "local-authorities",
    number: "01",
    title: "Local Authorities",
    cardLine: "Send the brief, get matched homes back",
    icon: "Landmark",
    promise: "Send us the brief, get matched homes.",
    bullets: [
      { text: "Send us the brief and get matched homes back.", icon: "Share2", tone: "teal" },
      { text: "Placement and support held in one record.", icon: "Database", tone: "teal" },
      { text: "Reporting your committee will accept.", icon: "ClipboardList", tone: "teal" },
    ],
    portal: {
      state: "brief & matches",
      columns: ["Brief", "Match"],
      rows: [
        { primary: "2 × single, high support", secondary: "Ward brief · 14 days", value: "3 homes" },
        { primary: "1 × family, ground floor", secondary: "Ward brief · 7 days", value: "1 home" },
        { primary: "1 × step-down from hospital", secondary: "Ward brief · 3 days", value: "2 homes" },
      ],
      footnote: "Every match carries its evidence pack",
      linkLabel: "Open the Local Authority portal",
    },
    enquiry: "team",
  },
  {
    slug: "housing-associations",
    number: "02",
    title: "Housing Associations",
    cardLine: "Take the lease, hold the tenancy, see the stock",
    icon: "Building2",
    promise: "Take the lease, hold the tenancy, see the stock.",
    bullets: [
      {
        text: "Lease terms, tenancy and compliance in one record.",
        icon: "Database",
        tone: "teal",
      },
      { text: "Stock and condition visible across the portfolio.", icon: "House", tone: "teal" },
      { text: "Support provider named against every home.", icon: "HandHeart", tone: "orange" },
    ],
    terms:
      "Take on block stock with nomination rights built in. The platform sources, underwrites and refurbishes block stock that fits the supported-housing brief, then leases it to your registered provider on a 5 year+ FRI, CPI or internal repairing lease, paid monthly in advance, with nomination rights into the placements pipeline you already run.",
    portal: {
      state: "lease & stock view",
      columns: ["Home", "Lease"],
      rows: [
        { primary: "3-bed terrace · 4 rooms", secondary: "Compliance current", value: "7 yr" },
        { primary: "2-bed semi · 3 rooms", secondary: "Compliance current", value: "5 yr" },
        { primary: "4-bed HMO · 5 rooms", secondary: "Works scheduled", value: "10 yr" },
      ],
      footnote: "Lease, tenancy and condition read from one record",
      linkLabel: "Open the Housing Association portal",
    },
    enquiry: "partner",
  },
  {
    slug: "care-support-providers",
    number: "03",
    title: "Care & Support Providers",
    cardLine: "Placements and rotas beside the home",
    icon: "HeartHandshake",
    promise: "Placements and rotas in the same place as the home.",
    bullets: [
      { text: "Placements and rotas in the same place as the home.", icon: "Clock", tone: "teal" },
      { text: "Referral to room with the evidence attached.", icon: "ShieldCheck", tone: "teal" },
      {
        text: "Hours, visits and outcomes recorded against the household.",
        icon: "Users",
        tone: "orange",
      },
    ],
    terms:
      "Elevate Supported Living delivers the care and support and runs a human allocation gate at the centre of every placement.",
    qualifier: "Care Quality Commission registration is currently in progress.",
    portal: {
      state: "placements & rotas",
      columns: ["Placement", "Cover"],
      rows: [
        { primary: "Household A · 4 rooms", secondary: "Waking nights", value: "Rota set" },
        { primary: "Household B · 3 rooms", secondary: "Daytime support", value: "Rota set" },
        { primary: "Household C · 2 rooms", secondary: "Floating support", value: "1 gap" },
      ],
      footnote: "Rota gaps surface against the home, not a spreadsheet",
      linkLabel: "Open the Provider portal",
    },
    enquiry: "team",
  },
  {
    slug: "investors",
    number: "04",
    title: "Investors",
    cardLine: "Five-year-plus leases, income and impact reported",
    icon: "CircleDollarSign",
    promise: "Five-year-plus leases. Income and impact, reported.",
    bullets: [
      {
        text: "Five-year-plus leases with accountable counterparties.",
        icon: "ShieldCheck",
        tone: "teal",
      },
      {
        text: "Income and impact reported from the same record.",
        icon: "TrendingUp",
        tone: "teal",
      },
      { text: "Sourcing and packaging handled end to end.", icon: "Network", tone: "teal" },
    ],
    terms:
      "Rhema Social Impact Group holds the head lease — a 5 year+ FRI, CPI or internal repairing lease — and under-leases each home to a UK Registered Provider.",
    riskLine,
    portal: {
      state: "income & impact",
      columns: ["Holding", "Reported"],
      rows: [
        { primary: "Portfolio · North West", secondary: "Lease term 7 yr", value: "—" },
        { primary: "Portfolio · Midlands", secondary: "Lease term 5 yr", value: "—" },
        { primary: "Single asset · Yorkshire", secondary: "Lease term 10 yr", value: "—" },
      ],
      footnote: "Return figures stay blank until audited reporting is live",
      linkLabel: "Open the Investor portal",
    },
    enquiry: "investor",
  },
  {
    slug: "landlords",
    number: "05",
    title: "Landlords",
    cardLine: "Long lease, guaranteed rent, no voids to chase",
    icon: "Home",
    promise: "Long lease, guaranteed rent, no voids to chase.",
    bullets: [
      {
        text: "Long lease held by an accountable counterparty.",
        icon: "ShieldCheck",
        tone: "teal",
      },
      {
        text: "Rent paid whether or not the room is occupied.",
        icon: "HandCoins",
        tone: "orange",
      },
      { text: "Condition and compliance managed for you.", icon: "ClipboardList", tone: "teal" },
    ],
    portal: {
      state: "lease & rent view",
      columns: ["Property", "Term"],
      rows: [
        { primary: "2-bed terrace", secondary: "Rent paid monthly", value: "5 yr" },
        { primary: "3-bed semi", secondary: "Rent paid monthly", value: "7 yr" },
      ],
      footnote: "No void periods to chase between tenancies",
      linkLabel: "Open the Landlord portal",
    },
    compact: true,
    enquiry: "partner",
  },
  {
    slug: "developers",
    number: "06",
    title: "Developers",
    cardLine: "Build to a brief that already has demand behind it",
    icon: "HardHat",
    promise: "Build to a brief that already has demand behind it.",
    bullets: [
      { text: "Briefs drawn from published commissioning demand.", icon: "MapPin", tone: "orange" },
      {
        text: "Specification agreed before you break ground.",
        icon: "ClipboardList",
        tone: "teal",
      },
      { text: "Lease counterparty identified at design stage.", icon: "Handshake", tone: "teal" },
    ],
    portal: {
      state: "demand briefs",
      columns: ["Brief", "Status"],
      rows: [
        { primary: "6 × single rooms, high support", secondary: "Area brief", value: "Open" },
        { primary: "2 × wheelchair standard", secondary: "Area brief", value: "Open" },
      ],
      footnote: "Briefs list the requirement, never a guaranteed volume",
      linkLabel: "Open the Developer portal",
    },
    compact: true,
    enquiry: "partner",
  },
  {
    slug: "estate-agents",
    number: "07",
    title: "Estate Agents",
    cardLine: "Send suitable stock, get a decision quickly",
    icon: "Handshake",
    promise: "Send suitable stock, get a decision quickly.",
    bullets: [
      { text: "Clear criteria so you know what to send.", icon: "ClipboardList", tone: "teal" },
      { text: "Decisions returned against a stated timescale.", icon: "Clock", tone: "teal" },
      {
        text: "One point of contact through to completion.",
        icon: "UserRound",
        tone: "orange",
      },
    ],
    portal: {
      state: "submitted stock",
      columns: ["Submission", "Decision"],
      rows: [
        { primary: "3-bed terrace · convertible", secondary: "Criteria met", value: "Reviewing" },
        { primary: "2-bed flat · first floor", secondary: "Criteria not met", value: "Declined" },
      ],
      footnote: "Criteria are published so submissions are not wasted",
      linkLabel: "Open the Agent portal",
    },
    compact: true,
    enquiry: "partner",
  },
  {
    slug: "contractors",
    number: "08",
    title: "Contractors",
    cardLine: "Conversion work, scheduled through the platform",
    icon: "Hammer",
    promise: "Conversion work, scheduled through the platform.",
    bullets: [
      { text: "Scope issued from the property record.", icon: "Database", tone: "teal" },
      { text: "Work scheduled and tracked to completion.", icon: "Clock", tone: "teal" },
      {
        text: "Sign-off evidenced against compliance requirements.",
        icon: "ShieldCheck",
        tone: "teal",
      },
    ],
    portal: {
      state: "works schedule",
      columns: ["Job", "Stage"],
      rows: [
        { primary: "HMO conversion · 5 rooms", secondary: "Scope issued", value: "On site" },
        { primary: "Wet room installation", secondary: "Scope issued", value: "Scheduled" },
      ],
      footnote: "Sign-off is evidenced, not asserted",
      linkLabel: "Open the Contractor portal",
    },
    compact: true,
    enquiry: "partner",
  },
];

export const notAnOrganisation = {
  heading: "Looking for a home?",
  body: "If you are looking for a home for yourself or someone you support, this page is not for you — here is the route that is.",
  action: { label: "Find a home", enquiry: "support" as const },
  closing:
    "This platform supports but never substitutes statutory housing and social care services.",
};
