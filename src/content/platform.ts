/**
 * Content for /platform.
 *
 * Nothing here is a verified public statistic. Every figure below sits inside a
 * LiveWindow and is labelled at the panel as illustrative interface data.
 */

export interface CapabilityLink {
  id: string;
  label: string;
}

export const capabilityLinks: CapabilityLink[] = [
  { id: "ai-matching", label: "AI matching" },
  { id: "demand-heat-maps", label: "Demand heat maps" },
  { id: "property-intelligence", label: "Property intelligence" },
  { id: "portals", label: "Portals" },
  { id: "analytics", label: "Analytics" },
  { id: "api", label: "API" },
];

/* 1 · Hero summary state -------------------------------------------------- */

export const heroSummary = {
  eyebrow: "The Platform",
  title: "Every home matched on evidence, not guesswork.",
  lead: "One record holds the brief, the property, the compliance evidence and the placement decision — so the match can be explained to a committee, line by line.",
  caption: "A clickable teaser of the real interface.",
  tabs: [
    { id: "summary", label: "Summary" },
    { id: "matches", label: "Matches" },
    { id: "evidence", label: "Evidence" },
  ],
  metrics: [
    { id: "homes", value: "1,240", label: "Homes in view" },
    { id: "match", value: "92%", label: "Top match score" },
  ],
  rows: [
    { id: "r1", property: "3-bed terrace · M14", rooms: "4 rooms", score: 92 },
    { id: "r2", property: "2-bed semi · M20", rooms: "3 rooms", score: 78 },
    { id: "r3", property: "4-bed HMO · OL8", rooms: "5 rooms", score: 71 },
  ],
};

/* 3 · AI matching --------------------------------------------------------- */

export const matchingLines = [
  "Brief in, ranked homes out",
  "Every match carries its evidence",
  "A human confirms every placement",
];

export interface MatchFactor {
  id: string;
  label: string;
  /** Filled dots out of five. */
  filled: number;
}

export const matchFactors: MatchFactor[] = [
  { id: "location", label: "Location fit", filled: 5 },
  { id: "rooms", label: "Room count", filled: 4 },
  { id: "amenities", label: "Amenities · transport", filled: 4 },
  { id: "support", label: "Support model fit", filled: 5 },
];

export const matchOverall = "92%";

/* 4 · Demand heat maps & property intelligence ---------------------------- */

export const supportFilters = [
  { id: "all", label: "All support types" },
  { id: "learning-disability", label: "Learning disability" },
  { id: "mental-health", label: "Mental health" },
  { id: "young-people", label: "Young people" },
  { id: "homelessness", label: "Homelessness" },
];

/** Illustrative segmentation, used only to demonstrate the filter behaviour. */
export const filterNodeIds: Record<string, string[]> = {
  "learning-disability": [
    "manchester",
    "birmingham",
    "leeds",
    "cardiff",
    "newcastle",
    "sheffield",
  ],
  "mental-health": ["london", "liverpool", "bristol", "nottingham", "glasgow", "brighton"],
  "young-people": ["london", "manchester", "leicester", "southampton", "norwich", "edinburgh"],
  homelessness: ["london", "birmingham", "manchester", "liverpool", "plymouth", "reading"],
};

export interface ReportRow {
  id: string;
  row: string;
  source: string;
}

export const propertyReportRows: ReportRow[] = [
  { id: "comparables", row: "Sold comparables", source: "Land Registry" },
  { id: "rent", row: "Rent trend", source: "ONS" },
  { id: "epc", row: "EPC · floor area", source: "EPC Register" },
  { id: "amenities", row: "Walkable amenities", source: "OpenStreetMap" },
];

export const propertyReportNote =
  "Public data used under licence · these publishers do not endorse this platform.";

/* 5 · Portals ------------------------------------------------------------- */

export interface Portal {
  id: string;
  label: string;
  see: string;
  do: string;
  get: string;
  /** Column headings shown in the LiveWindow preview. */
  columns: string[];
  rows: { id: string; cells: string[] }[];
}

export const portals: Portal[] = [
  {
    id: "investor",
    label: "Investor",
    see: "Portfolio, income and impact against every home you hold, with documents attached.",
    do: "Drill into a property, download the lease pack, export a quarterly statement.",
    get: "A five-year-plus lease position you can report on without chasing a managing agent.",
    columns: ["Portfolio", "Income", "Impact", "Documents"],
    rows: [
      { id: "p1", cells: ["12 homes · North West", "£— pcm", "38 rooms supported", "Lease pack"] },
      { id: "p2", cells: ["7 homes · West Midlands", "£— pcm", "21 rooms supported", "Lease pack"] },
    ],
  },
  {
    id: "housing-association",
    label: "Housing Association",
    see: "Stock, lease terms and tenancy status in one list, filtered to your patch.",
    do: "Accept a lease, log a tenancy, raise a repair against the right property record.",
    get: "Stock you can hold with confidence, and a tenancy record your auditors can follow.",
    columns: ["Property", "Lease term", "Tenancy", "Status"],
    rows: [
      { id: "h1", cells: ["3-bed terrace · M14", "5 years", "Occupied", "Live"] },
      { id: "h2", cells: ["2-bed semi · M20", "7 years", "Void", "Ready"] },
    ],
  },
  {
    id: "local-authority",
    label: "Local Authority",
    see: "Every brief you have sent, the homes matched to it and the evidence behind each match.",
    do: "Send a brief, compare ranked matches, confirm or reject a placement with a reason.",
    get: "Reporting your committee will accept, because each decision carries its audit trail.",
    columns: ["Brief", "Matched", "Top score", "Decision"],
    rows: [
      { id: "l1", cells: ["LD · 4 rooms", "6 homes", "92%", "Awaiting"] },
      { id: "l2", cells: ["MH · 3 rooms", "4 homes", "78%", "Confirmed"] },
    ],
  },
  {
    id: "care-support",
    label: "Care & Support",
    see: "Placements and rotas alongside the home they belong to, not in a separate system.",
    do: "Accept a referral, staff the rota, record a support note against the placement.",
    get: "One record per person, so support and housing stop drifting apart.",
    columns: ["Placement", "Home", "Rota", "Status"],
    rows: [
      { id: "c1", cells: ["Referral 0418", "3-bed terrace · M14", "2 waking", "Staffed"] },
      { id: "c2", cells: ["Referral 0421", "4-bed HMO · OL8", "1 waking · 1 sleep", "Open shift"] },
    ],
  },
];

/* 6 · Analytics ----------------------------------------------------------- */

export const analyticsTiles = [
  { id: "placements", label: "Placements", condition: "Fills at first placement." },
  { id: "void-days", label: "Void days", condition: "Fills once homes are live." },
];

export const analyticsNote =
  "Board-ready exports · social value reporting (HACT model, once live).";

/* 7 · API ----------------------------------------------------------------- */

export const apiEndpoints = [
  { id: "demand", method: "GET", path: "/demand?authority=…" },
  { id: "placements", method: "POST", path: "/placements" },
  { id: "report", method: "GET", path: "/properties/{id}/report" },
];

export const apiNote = "Case-management systems · CRM · finance.";

/* 8 · Governance ---------------------------------------------------------- */

export const governance = {
  eyebrow: "Governance & audit trail",
  title: "Every match, confirmation and placement is logged and exportable.",
  lines: [
    "Each match records the factors that produced it, the version of the model that ranked it and the officer who confirmed it.",
    "Nothing is deleted. A rejected match keeps its reason, so a pattern of rejections can be examined rather than lost.",
    "Exports are produced in a fixed schema for case-management systems and for committee papers.",
  ],
};
