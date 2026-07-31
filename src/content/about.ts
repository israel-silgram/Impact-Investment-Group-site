/** Copy for /about. Edit here — never inside JSX. */

export const aboutHero = {
  eyebrow: "About us",
  heading: "Why we exist",
  statement:
    "Somebody is waiting in a hospital bed, a hostel or a placement that was never right for them — not because the money is missing, but because nobody joined the home, the lease and the support together. That is the work we do.",
};

export const visionMission = [
  {
    id: "vision",
    label: "Our vision",
    rule: "teal" as const,
    title: "A suitable home for everyone who needs support to keep one.",
    body: "Supported housing that is chosen on evidence, held for the long term, and good enough that nobody has to move again for the wrong reasons.",
  },
  {
    id: "mission",
    label: "Our mission",
    rule: "orange" as const,
    title: "Join up supply, support and capital in one accountable chain.",
    body: "We source and convert homes to a commissioner's brief, place them with a housing association on a long lease, and wrap regulated care and support around the household — with every step recorded.",
  },
];

export const values = [
  {
    id: "trustworthy",
    icon: "shield" as const,
    title: "Trustworthy",
    body: "Registrations, indemnity and redress are published. Every claim on this site carries its source or it does not appear.",
  },
  {
    id: "professional",
    icon: "badge" as const,
    title: "Professional",
    body: "Procurement-ready paperwork, named contacts and reporting that stands up to a committee, not just a pitch.",
  },
  {
    id: "impactful",
    icon: "target" as const,
    title: "Impactful",
    body: "We measure what happens to people in the homes — placements made, tenancies sustained, voids avoided.",
  },
  {
    id: "purposeful",
    icon: "heart" as const,
    title: "Purposeful",
    body: "Long-hold capital, not a flip. The return depends on the household staying housed and well supported.",
  },
];

export interface Director {
  name: string;
  role: string;
  initials: string;
  /** Real photograph only. Left undefined until one is supplied. */
  portrait?: string;
  bio: string;
}

export const director: Director = {
  name: "Israel Silgram",
  role: "Director",
  initials: "IS",
  bio: "Israel Silgram is a passionate motivated leader and is committed to seeing the quality of vulnerable people's lives improve. He is a dynamic and highly skilled social entrepreneur with proven experience in both children and adult social care. A business leader with significant strategic and operational success within children and adult services, across commercial businesses and charities.",
};

export const teamContext =
  "The team works across property, investment and care: Impact Investment Group sources and packages the homes, Rhema Social Impact Group holds the lease and manages compliance and repairs, and Elevate Supported Living delivers the care with a human allocation gate at the centre of every placement.";

export const teamNote = "Further team details to follow.";

export const groupStructure: {
  id: string;
  name: string;
  role: string;
  body: string;
  qualifier?: string;
}[] = [
  {
    id: "iig",
    name: "Impact Investment Group",
    role: "Sources & packages · runs the investor community",
    body: "Finds and structures the homes against published commissioning briefs, and brings the capital that funds them.",
  },
  {
    id: "rhema",
    name: "Rhema Social Impact Group",
    role: "Holds the head lease · manages the home",
    body: "Holds the head lease — a 5 year+ FRI, CPI or internal repairing lease — and under-leases each home to a UK Registered Provider. Responsible for condition, compliance and repairs.",
  },
  {
    id: "elevate",
    name: "Elevate Supported Living",
    role: "Delivers the care & support",
    body: "Delivers the care and support, and runs a human allocation gate at the centre of every placement.",
    qualifier: "Care Quality Commission registration is currently in progress.",
  },
];

export const cashFlow = {
  label: "Cash flow",
  steps: ["Housing association", "Rhema", "Investor"],
};

export const partnerTypes = [
  { id: "nhs", partner: "NHS", detail: "Discharge to a suitable home, not a hospital bed" },
  {
    id: "ha",
    partner: "Housing Associations",
    detail: "Take the lease, hold the tenancy",
  },
  { id: "councils", partner: "Councils", detail: "Commission placements, set the brief" },
  {
    id: "care",
    partner: "Care Providers",
    detail: "Deliver support around the household",
  },
  { id: "investors", partner: "Investors", detail: "Fund the homes, hold them long term" },
  { id: "developers", partner: "Developers", detail: "Build and convert to the brief" },
];

export const technologyPartners = {
  partner: "Technology partners",
  detail:
    "Data providers and case-management systems the platform connects to — HM Land Registry · ONS · EPC Register · postcodes.io · OpenStreetMap · Environment Agency · Police.uk",
  note: "Public data used under licence. These publishers do not endorse this platform.",
};

export const commissioningContext = {
  eyebrow: "Commissioning context — not partnerships",
  title: "Briefs we read",
  count: "18",
  of: "of ~296 authorities",
  body: "Their published briefs shape what we source.",
  disclaimer:
    "This is not a partnership, endorsement or approval by any council.",
};

export const partnershipSteps = [
  { id: "1", title: "Tell us what you need or what you hold" },
  { id: "2", title: "Due diligence, both ways" },
  { id: "3", title: "A pilot on one home or one brief" },
  { id: "4", title: "Reporting from the first placement" },
];

export const partnerAsk = {
  title: "What we ask of partners",
  items: [
    "Registered entity",
    "Relevant regulation and insurance",
    "Named contact",
    "Willingness to be reported on",
  ],
};

export const teasers = [
  {
    id: "impact",
    eyebrow: "Social impact",
    title: "The scale of the problem, with every figure sourced.",
    action: "See the numbers",
    to: "/the-problem" as const,
  },
  {
    id: "technology",
    eyebrow: "Technology",
    title: "How matching, demand mapping and reporting actually work.",
    action: "Explore the platform",
    to: "/platform" as const,
  },
];
