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
  { id: "homes", value: "179,000+", label: "homes" },
  { id: "rooms", value: "591,000+", label: "rooms" },
  { id: "areas", value: "1,688", label: "areas" },
];

export const heroCountsSource = "Live from the platform";

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
    label: "Children in temporary accommodation",
    value: 176130,
    display: "176,130",
    source: "gov.uk",
    tone: "teal",
  },
  {
    id: "homelessness-duty",
    label: "Households owed a homelessness duty",
    value: 330410,
    display: "330,410",
    source: "gov.uk",
    tone: "teal",
  },
  {
    id: "supported-2040",
    label: "Supported homes needed by 2040",
    value: 677202,
    display: "677,202",
    source: "National Housing Federation",
    tone: "orange",
  },
];

export const nhsCostPanel = {
  value: "£102m / yr",
  label: "NHS cost of people waiting in hospital for supported housing",
  source: "Inside Housing · April 2026",
} as const;

export interface GroupSolution {
  id: string;
  title: string;
  entity: string;
  summary: string;
  icon: string;
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
    summary: "Holds the lease and manages the home to safe, decent standards.",
    icon: "FileCheck2",
  },
  {
    id: "support",
    title: "Care & support",
    entity: "Elevate Supported Living",
    summary: "Delivers the support around the household, day to day.",
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

export interface DemandNode {
  id: string;
  name: string;
  /** Percentage coordinates inside the map viewBox. */
  x: number;
  y: number;
  homesSourced: number;
  potentialRooms: number;
  /** 0–100, drives the teal intensity bar. */
  intensity: number;
}

export const demandNodes: DemandNode[] = [
  { id: "glasgow", name: "Glasgow", x: 150, y: 178, homesSourced: 210, potentialRooms: 690, intensity: 54 },
  { id: "edinburgh", name: "Edinburgh", x: 195, y: 168, homesSourced: 168, potentialRooms: 552, intensity: 48 },
  { id: "newcastle", name: "Newcastle", x: 245, y: 215, homesSourced: 240, potentialRooms: 790, intensity: 61 },
  { id: "leeds", name: "Leeds", x: 255, y: 285, homesSourced: 380, potentialRooms: 1240, intensity: 74 },
  { id: "manchester", name: "Manchester", x: 215, y: 305, homesSourced: 1240, potentialRooms: 4090, intensity: 92 },
  { id: "liverpool", name: "Liverpool", x: 193, y: 318, homesSourced: 520, potentialRooms: 1710, intensity: 78 },
  { id: "sheffield", name: "Sheffield", x: 265, y: 300, homesSourced: 305, potentialRooms: 1000, intensity: 68 },
  { id: "nottingham", name: "Nottingham", x: 280, y: 322, homesSourced: 264, potentialRooms: 866, intensity: 63 },
  { id: "birmingham", name: "Birmingham", x: 240, y: 355, homesSourced: 910, potentialRooms: 2980, intensity: 88 },
  { id: "leicester", name: "Leicester", x: 275, y: 345, homesSourced: 198, potentialRooms: 650, intensity: 57 },
  { id: "cardiff", name: "Cardiff", x: 200, y: 405, homesSourced: 226, potentialRooms: 742, intensity: 60 },
  { id: "bristol", name: "Bristol", x: 225, y: 403, homesSourced: 288, potentialRooms: 944, intensity: 66 },
  { id: "london", name: "London", x: 300, y: 395, homesSourced: 1180, potentialRooms: 3870, intensity: 96 },
  { id: "reading", name: "Reading", x: 275, y: 402, homesSourced: 142, potentialRooms: 466, intensity: 44 },
  { id: "brighton", name: "Brighton", x: 290, y: 420, homesSourced: 120, potentialRooms: 394, intensity: 41 },
  { id: "southampton", name: "Southampton", x: 255, y: 420, homesSourced: 156, potentialRooms: 512, intensity: 47 },
  { id: "plymouth", name: "Plymouth", x: 195, y: 440, homesSourced: 98, potentialRooms: 322, intensity: 36 },
  { id: "norwich", name: "Norwich", x: 330, y: 345, homesSourced: 134, potentialRooms: 440, intensity: 43 },
];

export const demandMapNote =
  "Built from published commissioning briefs and platform sourcing data · 18 of ~296 authorities today.";

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
