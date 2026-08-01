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
    id: "demand",
    spine: "Demand",
    title: "Verified demand is identified",
    detail: "Published commissioning need, confirmed before anything is sourced.",
    owner: "Local authorities & NHS",
    tone: "teal",
  },
  {
    id: "analyse",
    spine: "Analyse",
    title: "The platform analyses property options",
    detail: "The most appropriate options are scored against that demand.",
    owner: "Impact Investment Group",
    tone: "teal",
  },
  {
    id: "ha",
    spine: "Provider",
    title: "Suitable housing associations are identified",
    detail: "Registered providers matched to the brief and the area.",
    owner: "Rhema Social Impact Group",
    tone: "teal",
  },
  {
    id: "capital",
    spine: "Capital",
    title: "Investors and owners are matched to opportunities",
    detail: "Demand-led opportunities, not speculative stock.",
    owner: "Impact Investment Group",
    tone: "teal",
  },
  {
    id: "secure",
    spine: "Secure",
    title: "Properties are secured through long-term arrangements",
    detail: "Held on a 5 year+ FRI, CPI or internal repairing lease.",
    owner: "Rhema Social Impact Group",
    tone: "teal",
  },
  {
    id: "prepare",
    spine: "Prepare",
    title: "Care and support providers prepare the placement",
    detail: "Support planned around the household before anyone moves.",
    owner: "Elevate Supported Living",
    tone: "teal",
  },
  {
    id: "move",
    spine: "Move",
    title: "Individuals move into suitable accommodation",
    detail: "A human housing officer confirms every match.",
    owner: "Elevate Supported Living",
    tone: "orange",
  },
  {
    id: "support",
    spine: "Support",
    title: "Support is delivered",
    detail: "Care and support wrapped around the household.",
    owner: "Elevate Supported Living",
    tone: "orange",
  },
  {
    id: "measure",
    spine: "Measure",
    title: "Outcomes are monitored and measured",
    detail: "Placements, tenancies sustained and voids recorded over time.",
    owner: "Impact Investment Platform",
    tone: "orange",
  },
  {
    id: "community",
    spine: "Community",
    title: "Communities benefit from housing stability",
    detail: "Fewer moves, fewer emergency placements, steadier neighbourhoods.",
    owner: "Every partner in the chain",
    tone: "orange",
  },
];

export const ecosystemCopy = {
  eyebrow: "How the ecosystem works",
  title: "One Connection Creates Many Outcomes",
  lead: "Ten connected stages, with the responsible party revealed at each one. Hover or tap a stage.",
  close:
    "This journey transforms what has traditionally been a fragmented process into one connected pathway.",
};

export const purposeCopy = {
  eyebrow: "Our purpose",
  title: "Housing is more than bricks and mortar",
  body: "Every home creates the opportunity for stability, independence and a better future. Across the UK, millions of people are affected by housing challenges — from families living in temporary accommodation and care leavers moving into adulthood, to people leaving hospital, older people requiring specialist accommodation and individuals needing ongoing care and support. At the same time, investors, landlords, developers and housing providers are looking for opportunities to deliver long-term value and positive social impact. Our mission is to connect these two worlds.",
};

export const challengeCopy = {
  eyebrow: "The challenge",
  title: "The housing system is fragmented",
  lead: "Local Authorities understand demand. Housing Associations manage housing. Care and Support Providers deliver services. Investors provide capital. Property Owners own housing. Developers build homes. Each organisation has valuable information, yet much of it remains disconnected.",
  points: [
    "Suitable properties remain empty while demand grows",
    "Housing opportunities are identified too late",
    "Investment isn't always directed where it creates the greatest impact",
    "Providers spend valuable time searching for accommodation",
    "Families and individuals wait longer than necessary for safe, suitable homes",
  ],
  close:
    "This isn't because organisations don't want to collaborate. It's because the systems available to them weren't designed to connect everyone together.",
};

export const solutionCopy = {
  eyebrow: "Our solution",
  title: "One Platform. One Network. One Shared Purpose.",
  lead: "Impact Investment Platform has been designed to become the digital infrastructure connecting the UK's housing, care and support ecosystem. Rather than replacing existing organisations, we help them collaborate more effectively.",
  points: [
    "Share verified housing demand",
    "Identify suitable properties",
    "Connect with Housing Associations",
    "Match Care and Support Providers with available accommodation",
    "Introduce investors to demand-led opportunities",
    "Track placements",
    "Measure outcomes",
    "Demonstrate social impact",
  ],
  subBlockTitle: "The accountable chain behind it",
};

export const demandMapCopy = {
  eyebrow: "Live UK demand",
  title: "Visualising Housing Need Across the Nation",
  lead: "Understanding demand is the first step towards solving it. The platform includes a live demand intelligence map that helps partners identify where housing is needed most.",
  filtersLabel: "Demand categories",
  filters: [
    "Temporary accommodation",
    "Supported housing",
    "Care leavers",
    "Hospital discharge",
    "Mental health",
    "Learning disabilities",
    "Older people",
    "Families",
    "Domestic abuse",
    "Homelessness",
  ],
  /**
   * Placeholder selectors — the region/authority datasets are not wired yet, so
   * the controls carry their labels and options but no filtering behaviour.
   */
  selectors: [
    {
      id: "region",
      label: "Region",
      options: [
        "England \u00b7 all regions",
        "North West",
        "North East",
        "Yorkshire and the Humber",
        "West Midlands",
        "East Midlands",
        "East of England",
        "London",
        "South East",
        "South West",
      ],
    },
    {
      id: "authority",
      label: "Local authority",
      options: ["All commissioning authorities"],
    },
  ],
};

export const connectCopy = {
  eyebrow: "Who we connect",
  title: "Every Organisation. One Platform.",
  extras:
    "We also connect Mortgage Brokers, Solicitors, Surveyors, Contractors, Technology Partners and the communities these homes sit in.",
  close:
    "Each organisation has its own dedicated experience while remaining connected to the wider ecosystem.",
};

export const aiPlatformCopy = {
  eyebrow: "AI platform",
  title: "Intelligence That Supports Better Decisions",
  lead: "Artificial Intelligence sits at the centre of the platform. Rather than replacing professional judgement, AI enhances decision-making.",
  points: [
    "Match people with suitable homes",
    "Identify the right investment opportunities",
    "Forecast housing demand",
    "Recommend suitable delivery partners",
    "Reduce property voids",
    "Increase placement speed",
    "Improve occupancy",
    "Monitor social impact",
  ],
};

export const closingCopy = {
  title: "Join the UK's Housing, Care and Support Ecosystem",
  lead: "Whether you are seeking housing, investing in communities, developing homes, commissioning services or delivering care and support, there is a place for you within the platform.",
  points: [
    "Build more homes",
    "Deliver better support",
    "Connect investment with verified need",
    "Strengthen communities",
    "Improve outcomes",
    "Create lasting social impact",
    "Transform lives",
  ],
};

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
