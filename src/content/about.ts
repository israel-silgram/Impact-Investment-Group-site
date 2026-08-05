/** Copy for /about. Edit here — never inside JSX. */

/*
 * THE PAGE'S FOUR SECTIONS.
 *
 * Client copy, supplied whole and used verbatim — the section names are his
 * and are set as the H2s rather than being paraphrased into something
 * house-styled. Everything the page carried before is still here; it now sits
 * inside whichever of these four sections it answers:
 *
 *   Who We Are ......... the director and the team context
 *   Why We Exist ....... the vision and mission cards
 *   What We Do ......... the group structure, partner types, technology
 *                        partners and the commissioning context
 *   Why Partner ........ the values, how a partnership starts, what we ask
 *
 * The previous hero statement is retired but kept, because it is the sharpest
 * sentence written for this page and may be wanted again:
 *
 *   "Somebody is waiting in a hospital bed, a hostel or a placement that was
 *    never right for them — not because the money is missing, but because
 *    nobody joined the home, the lease and the support together. That is the
 *    work we do."
 */

export const whoWeAre = {
  eyebrow: "About us",
  title: "Who We Are",
  lead: "Connecting property, investment and housing demand to transform lives.",
  body: [
    "Impact Investment Group is building a national property and housing ecosystem that connects investors, landlords and developers with local authorities, housing associations, and organisations delivering care and support.",
    "We combine property expertise, sector relationships and technology to help create safe, suitable and sustainable homes for individuals, families and communities across the UK.",
  ],
};

export const whyWeExist = {
  eyebrow: "Purpose",
  title: "Why We Exist",
  lead: "The UK does not simply have a shortage of property. It has a disconnected housing system.",
  body: [
    "Local authorities, housing associations, care providers and support organisations need access to suitable homes, while investors, landlords and developers need clearer information about demand, partnerships and long-term property opportunities.",
    "Our mission is to bring these organisations together, increase the supply of suitable housing and ensure property investment is driven by genuine local need.",
  ],
};

export const whatWeDo = {
  eyebrow: "The ecosystem",
  title: "What We Do",
  lead: "Our ecosystem connects every stage of the housing journey.",
  body: [
    "We identify housing demand, source and match suitable properties, connect investment partners, support leases and management arrangements, and coordinate with housing, care and support organisations.",
    "Through our developing AI-powered platform, partners will be able to view housing demand, advertise properties, identify opportunities and build the relationships required to deliver more homes nationally.",
  ],
};

export const whyPartner = {
  eyebrow: "Partnership",
  title: "Why Partner With Us?",
  body: [
    "With more than 30 years of experience across property, housing, care and support, we understand both the investment opportunity and the responsibility involved in providing homes for people who need them.",
    "We are building more than an estate agency or property platform. We are creating a collaborative national network focused on delivering measurable social impact, sustainable partnerships and responsible investment.",
  ],
  /** The same three-part line the homepage hero is built on. */
  strapline: "Providing Homes. Delivering Support. Transforming Lives.",
  cta: "Register Your Interest Today",
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
  bio?: string;
  /** Short credential lines, as supplied by the client. */
  credentials?: string[];
  /** lucide-react icon name, resolved in the component. */
  icon?: string;
  /** Orange marks the lead only — the accent has to stay scarce. */
  accent?: "teal" | "orange";
}

/*
 * THE TEAM.
 *
 * Names, roles and credential lines are the client's, transcribed from the
 * existing production site. Two deliberate changes, both easy to reverse:
 *
 *  1. Honorifics dropped — "Miss Maria Avallone" became "Maria Avallone".
 *     "Miss" states a woman's marital status where the men's titles state
 *     nothing, which reads dated on an investor-facing page. "Dr" is kept: it
 *     is a professional qualification, not a courtesy title.
 *  2. "$100 million in raises" is kept exactly as supplied, but it is a DOLLAR
 *     figure on a UK site quoting UK charitable fundraising. Worth confirming
 *     with Jonathan whether it should read £ — it is the only currency on the
 *     page and a reader will notice.
 *
 * NO PORTRAITS YET. `portrait` is wired and DirectorCard renders a photograph
 * the moment one is set; until then it falls back to initials in a navy circle
 * with a teal ring, never a stock face. The old production repo's `public/`
 * folder has no team photographs in it — they are most likely in its
 * `src/assets`. Drop the files into `public/images/team/` and set `portrait`.
 *
 * Israel leads: his card is full width above the other four, at a larger size,
 * with the only orange accent on the page. That is the "big dog" treatment,
 * done with hierarchy rather than by shrinking anyone else.
 */
export const team: Director[] = [
  {
    name: "Israel Silgram",
    role: "Impact Director",
    initials: "IS",
    icon: "HandHeart",
    accent: "orange",
    credentials: [
      "Care professional",
      "30+ years developing, systemising and scaling social-impact businesses",
      "Property-led care and support for vulnerable people",
    ],
    bio: "Israel Silgram is a passionate motivated leader and is committed to seeing the quality of vulnerable people's lives improve. He is a dynamic and highly skilled social entrepreneur with proven experience in both children and adult social care. A business leader with significant strategic and operational success within children and adult services, across commercial businesses and charities.",
  },
  {
    name: "Maria Avallone",
    role: "Asset Manager",
    initials: "MA",
    icon: "House",
    credentials: [
      "Children's and adult services",
      "20+ years managing and developing social-impact businesses",
    ],
  },
  {
    name: "Dr Jonathan Elton",
    role: "Chief Investment Officer",
    initials: "JE",
    icon: "HandCoins",
    credentials: [
      "Background in raising money for charitable causes",
      "Over $100 million in raises",
    ],
  },
  {
    name: "Callum Saxon",
    role: "Chief Technology Officer",
    initials: "CS",
    icon: "BrainCircuit",
    credentials: [
      "BSc Computer Science",
      "Special Recognition Award winner",
      "5+ years professional experience",
    ],
  },
  {
    name: "Shahab Jamali",
    role: "Software Engineer & AI Specialist",
    initials: "SJ",
    icon: "Sparkles",
    credentials: ["Software engineering · AI · LLMs", "4 years professional experience"],
  },
];

/** The lead, kept as its own export so callers do not index into the array. */
export const director: Director = team[0]!;

export const teamEyebrow = "Who we are";
export const teamTitle = "The team";

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
