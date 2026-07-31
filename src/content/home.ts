/**
 * Home page copy and data. Nothing in here is invented: every figure carries
 * its published source. Illustrative product data is labelled at the panel.
 */

export interface LiveCount {
  id: string;
  value: string;
  label: string;
}

/** The quiet single line under the hero buttons. */
export const heroCounts: LiveCount[] = [
  { id: "homes", value: "188,000+", label: "homes sourced & analysed" },
  { id: "rooms", value: "618,000+", label: "potential homing opportunities" },
  { id: "areas", value: "1,693", label: "towns & areas covered" },
];

export const heroCountsSource = "live from our platform";

export interface ProblemBar {
  id: string;
  label: string;
  value: number;
  display: string;
  source: string;
  /** Orange marks the gap the business exists to close. */
  tone: "teal" | "orange";
}

export const problemBars: ProblemBar[] = [
  {
    id: "children-ta",
    label: "Children in temporary accommodation in England",
    value: 176130,
    display: "176,130",
    source:
      "gov.uk · Statutory homelessness in England: Oct–Dec 2025 · at 31 December 2025",
    tone: "teal",
  },
  {
    id: "homelessness-duty",
    label: "Households owed a homelessness duty in England, 2024–25",
    value: 330410,
    display: "330,410",
    source:
      "gov.uk · Statutory homelessness in England: financial year 2024-25 · full year 2024–25",
    tone: "teal",
  },
  {
    id: "supported-2040",
    label: "Supported homes England is projected to need by 2040",
    value: 677202,
    display: "677,202",
    source:
      "National Housing Federation · How much supported housing will we need by 2040? · projection published 17 April 2024",
    tone: "orange",
  },
];

export const nhsCostPanel = {
  value: "£102m / yr",
  label:
    "The annual NHS cost of people waiting in hospital for supported housing to be available",
  source:
    "Inside Housing · Lack of supported housing places costs NHS £102m per year · as reported April 2026",
} as const;

export const bnbSpendPanel = {
  value: "430%",
  label:
    "Rise in council spend on B&B emergency accommodation for homeless households, 2010/11 to 2019/20",
  source: "Local Government Association · released July 2021",
} as const;

export interface GroupSolution {
  id: string;
  title: string;
  entity: string;
  summary: string;
  icon: string;
  /** Muted qualifier that must always travel with a care claim. */
  qualifier?: string;
}

export const groupSolutions: GroupSolution[] = [
  {
    id: "source",
    title: "Source & convert",
    entity: "Impact Investment Group",
    summary: "Finds and packages the right property, in the areas where demand is proven.",
    icon: "Search",
  },
  {
    id: "lease",
    title: "Lease & manage",
    entity: "Rhema Social Impact Group",
    summary:
      "Holds the head lease — 5 year+ FRI, CPI or internal repairing — and under-leases each home to a UK Registered Provider.",
    icon: "FileCheck2",
  },
  {
    id: "support",
    title: "Care & support",
    entity: "Elevate Supported Living",
    summary:
      "Delivers the care and support around the household, and runs a human allocation gate at the centre of every placement.",
    qualifier: "Care Quality Commission registration is currently in progress.",
    icon: "HeartHandshake",
  },
];

export interface EcosystemStage {
  id: string;
  spine: string;
  title: string;
  detail: string;
  /** Revealed on hover or tap — the hero rail deliberately withholds this. */
  owner: string;
  tone: "teal" | "orange";
}

export const ecosystemStages: EcosystemStage[] = [
  {
    id: "source",
    spine: "Source",
    title: "Source property",
    detail: "Stock identified against published commissioning demand.",
    owner: "Impact Investment Group",
    tone: "teal",
  },
  {
    id: "verify",
    spine: "Verify",
    title: "Verify property",
    detail: "Due diligence, condition and compliance checks completed.",
    owner: "Impact Investment Group",
    tone: "teal",
  },
  {
    id: "lease",
    spine: "Lease",
    title: "Secure leases",
    detail: "Lease held with a trusted, accountable counterparty.",
    owner: "Rhema Social Impact Group",
    tone: "teal",
  },
  {
    id: "home",
    spine: "Home",
    title: "Deliver homes",
    detail: "Home brought to safe, decent standard and let.",
    owner: "Rhema Social Impact Group",
    tone: "orange",
  },
  {
    id: "support",
    spine: "Support",
    title: "Support provided",
    detail: "Care and support wrapped around the household.",
    owner: "Elevate Supported Living",
    tone: "orange",
  },
];



export const demandMapNote =
  "Built from published commissioning briefs · 18 of ~296 English local authorities · their briefs shape what we source, which is not a partnership, endorsement or approval by any council.";

export interface PlatformCapability {
  id: string;
  title: string;
  detail: string;
  icon: string;
}

export const platformCapabilities: PlatformCapability[] = [
  { id: "matching", title: "Matching", detail: "Referral to room, with the evidence attached.", icon: "GitCompareArrows" },
  { id: "intelligence", title: "Property intelligence", detail: "Condition, compliance and yield in one record.", icon: "Building2" },
  { id: "analytics", title: "Analytics", detail: "Demand, placements and outcomes over time.", icon: "ChartNoAxesColumn" },
];

export interface MatchRow {
  id: string;
  property: string;
  rooms: string;
  score: number;
}

/** Illustrative interface data — labelled at the LiveWindow. */
export const matchRows: MatchRow[] = [
  { id: "m1", property: "3-bed terrace", rooms: "4 rooms", score: 92 },
  { id: "m2", property: "2-bed semi", rooms: "3 rooms", score: 78 },
];
