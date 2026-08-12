export interface PartnerProfile {
  id: string;
  label: string;
  pluralLabel: string;
  path: string;
  icon: string;
  summary: string;
  whoTheyAre: string;
  platformIntro: string;
  platformSteps: [string, string, string];
  impactIntro: string;
  impactPoints: [string, string, string];
  diagram: {
    inputs: [string, string];
    centre: string;
    outputs: [string, string, string];
  };
}

/**
 * The same ten audiences shown in the homepage registration journey. These
 * pages explain a role in the ecosystem; they do not claim that every visitor
 * or organisation is already a contracted partner.
 */
export const partnerProfiles: PartnerProfile[] = [
  {
    id: "investor",
    label: "Investor",
    pluralLabel: "Investors",
    path: "/partner-with-investor",
    icon: "CircleDollarSign",
    summary: "Connect capital with evidenced housing demand and a clearly defined delivery route.",
    whoTheyAre:
      "Investors provide the capital that can bring suitable homes into use. They may be individuals, companies or institutions looking for property opportunities with a clear social purpose as well as a commercial case.",
    platformIntro:
      "The platform is being designed to bring demand evidence, property information and delivery partners into one traceable workflow, helping investors understand what is needed before deciding whether an opportunity is right for them.",
    platformSteps: [
      "Review demand-led property opportunities and their supporting evidence.",
      "See the proposed housing, lease and delivery structure in one place.",
      "Track the home, its delivery partners and the intended social outcome.",
    ],
    impactIntro:
      "When capital starts with a real housing need, it can help create homes that are more likely to remain useful, occupied and accountable over time.",
    impactPoints: [
      "Direct capital towards evidenced local need.",
      "Support the acquisition or improvement of suitable homes.",
      "Make the intended social purpose visible alongside the property case.",
    ],
    diagram: {
      inputs: ["Capital", "Investment criteria"],
      centre: "Investor",
      outputs: ["Suitable homes", "Delivery partners", "Impact reporting"],
    },
  },
  {
    id: "landlord",
    label: "Landlord",
    pluralLabel: "Landlords",
    path: "/partner-with-landlord",
    icon: "Home",
    summary:
      "Bring suitable property into a housing network built around verified need and responsible delivery.",
    whoTheyAre:
      "Landlords own homes that may be suitable for supported, temporary or other needs-led housing. They range from individual property owners to larger portfolio landlords.",
    platformIntro:
      "The platform will help landlords present a property once, understand where it may fit and connect with the organisations responsible for leasing, housing management, care and support.",
    platformSteps: [
      "List property details, location, condition and availability.",
      "Compare the home with verified housing requirements.",
      "Coordinate due diligence, works, lease information and ongoing records.",
    ],
    impactIntro:
      "A suitable existing home can become part of the answer more quickly when its owner can see the need, the delivery structure and the responsibilities involved.",
    impactPoints: [
      "Bring existing homes into purposeful use.",
      "Reduce gaps between property owners and housing organisations.",
      "Support clearer standards, responsibilities and records around each home.",
    ],
    diagram: {
      inputs: ["Available property", "Property information"],
      centre: "Landlord",
      outputs: ["Demand match", "Lease route", "Managed home"],
    },
  },
  {
    id: "developer",
    label: "Developer",
    pluralLabel: "Developers",
    path: "/partner-with-developer",
    icon: "HardHat",
    summary:
      "Plan new homes and conversions around an identified brief rather than assumed demand.",
    whoTheyAre:
      "Developers create new housing or convert existing buildings. Their decisions shape location, layout, accessibility, specification and the long-term usefulness of a property.",
    platformIntro:
      "The platform is intended to give developers earlier visibility of housing requirements and the organisations involved, so proposals can be tested against a real brief before time and money are committed.",
    platformSteps: [
      "Explore location-specific demand and property requirements.",
      "Share sites, schemes or conversion opportunities with relevant partners.",
      "Keep specifications, milestones and delivery responsibilities connected.",
    ],
    impactIntro:
      "Building to an evidenced need can reduce the risk of delivering the wrong kind of home in the wrong place.",
    impactPoints: [
      "Shape schemes around real household and service requirements.",
      "Build accessibility and support needs into the brief earlier.",
      "Create a clearer route from development opportunity to occupied home.",
    ],
    diagram: {
      inputs: ["Land or building", "Commissioning brief"],
      centre: "Developer",
      outputs: ["Designed scheme", "Suitable homes", "Delivery handover"],
    },
  },
  {
    id: "housing-association",
    label: "Housing Association",
    pluralLabel: "Housing Associations",
    path: "/partner-with-housing-association",
    icon: "Building2",
    summary: "Connect homes, leases, tenancies and support partners through one shared view.",
    whoTheyAre:
      "Housing associations and Registered Providers manage homes and tenancies for people whose housing needs are not met by the open market. They bring housing governance, management and long-term stewardship to the model.",
    platformIntro:
      "The platform will help housing associations review suitable supply, connect it with demand and keep lease, property, placement and support information aligned around each home.",
    platformSteps: [
      "Review homes matched to an identified housing requirement.",
      "Coordinate property checks, lease information and delivery partners.",
      "Maintain a shared view of stock, tenancies, support and reporting.",
    ],
    impactIntro:
      "Housing expertise turns a property into a properly managed home and creates the accountability needed around the tenancy.",
    impactPoints: [
      "Increase access to suitable, well-managed housing supply.",
      "Connect tenancy management with property and support information.",
      "Give commissioners and delivery partners a clearer operational picture.",
    ],
    diagram: {
      inputs: ["Housing demand", "Matched property"],
      centre: "Housing Association",
      outputs: ["Lease & tenancy", "Housing management", "Resident home"],
    },
  },
  {
    id: "local-authority",
    label: "Local Authority",
    pluralLabel: "Local Authorities",
    path: "/partner-with-local-authority",
    icon: "Landmark",
    summary:
      "Turn local housing requirements into a brief that the wider market can understand and respond to.",
    whoTheyAre:
      "Local authorities understand local housing pressure, commission services and hold responsibilities for people who need safe and suitable accommodation.",
    platformIntro:
      "The platform is being built to translate housing requirements into a clearer demand signal and connect that signal with suitable property, housing organisations and care or support providers.",
    platformSteps: [
      "Set out location, property and household requirements.",
      "Review potential homes and the proposed delivery team.",
      "Keep referrals, placements and agreed reporting connected.",
    ],
    impactIntro:
      "A clearer demand signal helps the market respond to what a place actually needs instead of working from assumptions.",
    impactPoints: [
      "Make local housing priorities easier for partners to act on.",
      "Improve visibility from requirement to proposed home.",
      "Support more coordinated placement and delivery decisions.",
    ],
    diagram: {
      inputs: ["Local need", "Commissioning priorities"],
      centre: "Local Authority",
      outputs: ["Housing brief", "Partner response", "Placement oversight"],
    },
  },
  {
    id: "care-provider",
    label: "Care Provider",
    pluralLabel: "Care Providers",
    path: "/partner-with-care-provider",
    icon: "HeartHandshake",
    summary:
      "Connect a person’s care requirements with a home and delivery team that can support them.",
    whoTheyAre:
      "Care providers deliver regulated personal care and help people live safely and independently. Their insight is essential when a property must work around an individual’s daily needs.",
    platformIntro:
      "The platform will help care providers contribute requirements earlier, coordinate with housing partners and keep the home, placement and agreed care delivery connected.",
    platformSteps: [
      "Record the practical housing implications of an agreed care requirement.",
      "Review potential homes and the partners responsible for delivery.",
      "Coordinate placement information, visits and agreed outcome reporting.",
    ],
    impactIntro:
      "Housing and care work better when neither is planned in isolation from the other.",
    impactPoints: [
      "Help match the physical home with day-to-day care needs.",
      "Reduce information gaps between care and housing teams.",
      "Keep the person and their agreed outcomes visible in delivery decisions.",
    ],
    diagram: {
      inputs: ["Care requirement", "Professional assessment"],
      centre: "Care Provider",
      outputs: ["Care plan", "Housing coordination", "Supported resident"],
    },
  },
  {
    id: "support-provider",
    label: "Support Provider",
    pluralLabel: "Support Providers",
    path: "/partner-with-support-provider",
    icon: "Users",
    summary: "Coordinate practical, person-centred support around a safe and suitable home.",
    whoTheyAre:
      "Support providers help people sustain a tenancy, build independence and manage the practical challenges of everyday life. Their work may sit alongside housing management and regulated care.",
    platformIntro:
      "The platform will help support teams understand the proposed home, share relevant placement information and coordinate their part of delivery with housing and other services.",
    platformSteps: [
      "Set out the support a person or household will need around the home.",
      "See property, placement and partner responsibilities in one shared record.",
      "Record agreed activity and outcomes without separating them from the housing context.",
    ],
    impactIntro:
      "The right support can help turn a placement into a stable home and a stronger route towards independence.",
    impactPoints: [
      "Help people settle into and sustain their home.",
      "Connect practical support with housing responsibilities.",
      "Make agreed progress and outcomes easier to understand.",
    ],
    diagram: {
      inputs: ["Support needs", "Placement information"],
      centre: "Support Provider",
      outputs: ["Support plan", "Tenancy support", "Greater independence"],
    },
  },
  {
    id: "social-worker",
    label: "Social Worker",
    pluralLabel: "Social Workers",
    path: "/partner-with-social-worker",
    icon: "UserRoundCheck",
    summary:
      "Bring the person’s needs, voice and professional assessment into the housing journey.",
    whoTheyAre:
      "Social workers assess need, safeguard people and coordinate support across services. They often see first-hand where unsuitable housing creates risk or prevents progress.",
    platformIntro:
      "The platform will give social workers a clearer route to describe housing and support requirements, follow a referral and understand who is responsible for each part of the proposed solution.",
    platformSteps: [
      "Share an agreed referral and the practical requirements for a suitable home.",
      "See progress from requirement through matching and partner coordination.",
      "Keep the person’s circumstances and agreed outcomes central to the record.",
    ],
    impactIntro:
      "A connected process can reduce repeated explanations and make it easier to keep housing decisions centred on the person.",
    impactPoints: [
      "Strengthen the person’s voice in housing decisions.",
      "Reduce gaps between assessment, referral and delivery.",
      "Improve clarity about actions, ownership and next steps.",
    ],
    diagram: {
      inputs: ["Person’s voice", "Professional assessment"],
      centre: "Social Worker",
      outputs: ["Clear referral", "Coordinated partners", "Suitable support"],
    },
  },
  {
    id: "broker",
    label: "Broker",
    pluralLabel: "Brokers & Agents",
    path: "/partner-with-broker",
    icon: "Handshake",
    summary:
      "Bring credible property opportunities into a demand-led network and help owners understand the route forward.",
    whoTheyAre:
      "Brokers and estate agents connect property owners, buyers and opportunities. They can help widen the supply of suitable homes when they understand the specification and delivery route required.",
    platformIntro:
      "The platform will allow brokers to present suitable opportunities, compare them with current housing requirements and connect owners with the organisations able to assess and deliver them.",
    platformSteps: [
      "Submit an opportunity with the information partners need to assess it.",
      "See where its location and specification align with evidenced demand.",
      "Coordinate introductions and track the opportunity through the next steps.",
    ],
    impactIntro:
      "Better-informed property introductions save time and help more suitable homes reach the right delivery partners.",
    impactPoints: [
      "Bring more relevant opportunities into the housing pipeline.",
      "Help owners understand required standards and delivery structures.",
      "Reduce speculative introductions that do not match an identified need.",
    ],
    diagram: {
      inputs: ["Owner instruction", "Property opportunity"],
      centre: "Broker / Agent",
      outputs: ["Verified listing", "Demand match", "Partner introduction"],
    },
  },
  {
    id: "resident",
    label: "Resident",
    pluralLabel: "Residents",
    path: "/partner-with-resident",
    icon: "User",
    summary:
      "Keep the person, their needs and the meaning of home at the centre of every decision.",
    whoTheyAre:
      "Residents are the people and families who need a safe, suitable home. They are not a supply category or a data point; their circumstances, choices and goals are the reason the wider network exists.",
    platformIntro:
      "The platform is intended to help authorised housing and support teams coordinate around the person, while giving residents a clearer understanding of the proposed home, support and next steps where appropriate.",
    platformSteps: [
      "Capture relevant housing needs, preferences and accessibility requirements.",
      "Connect the proposed home with the responsible housing and support teams.",
      "Keep agreed actions and outcomes visible to the people authorised to deliver them.",
    ],
    impactIntro:
      "The goal is not simply a placement. It is a home that is suitable, supported and able to provide a stronger foundation for daily life.",
    impactPoints: [
      "Keep individual needs and preferences central.",
      "Make responsibilities and next steps clearer.",
      "Support a more joined-up journey into a suitable home.",
    ],
    diagram: {
      inputs: ["Needs & preferences", "Choice & consent"],
      centre: "Resident",
      outputs: ["Suitable home", "Connected support", "Personal outcomes"],
    },
  },
];

export const partnerNavItems = partnerProfiles.map(({ label, path }) => ({ label, to: path }));

export function getPartnerProfile(id: string) {
  const profile = partnerProfiles.find((partner) => partner.id === id);
  if (!profile) throw new Error(`Unknown partner profile: ${id}`);
  return profile;
}
