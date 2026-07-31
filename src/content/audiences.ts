/** "Register as" role tiles and the three-panel band. Copy edits happen here, not in JSX. */

export interface AudienceRole {
  id: string;
  label: string;
  detail: string;
  /** lucide-react icon name, resolved in the component. */
  icon: string;
  /** Where the tile lands. Every tile must land somewhere real. */
  target:
    | { kind: "solutions"; hash: string }
    | { kind: "contact"; enquiry: string };
  /** "route-out" tiles are styled with a teal ring — a way out, not a pitch. */
  tone?: "default" | "route-out";
}

export const registerRoles: AudienceRole[] = [
  { id: "investor", label: "Investor", detail: "Fund homes, earn returns", icon: "CircleDollarSign", target: { kind: "solutions", hash: "investors" } },
  { id: "landlord", label: "Landlord", detail: "Lease homes securely", icon: "Home", target: { kind: "solutions", hash: "landlords" } },
  { id: "developer", label: "Developer", detail: "Build homes nationally", icon: "Construction", target: { kind: "solutions", hash: "developers" } },
  { id: "housing-association", label: "Housing Association", detail: "Buy, sell & lease homes", icon: "Building2", target: { kind: "solutions", hash: "housing-associations" } },
  { id: "local-authority", label: "Local Authority", detail: "Access housing supply", icon: "Landmark", target: { kind: "solutions", hash: "local-authorities" } },
  { id: "care-provider", label: "Care Provider", detail: "Access housing", icon: "HeartHandshake", target: { kind: "solutions", hash: "care-and-support" } },
  { id: "support-provider", label: "Support Provider", detail: "Access housing", icon: "Users", target: { kind: "solutions", hash: "care-and-support" } },
  { id: "social-worker", label: "Social Worker", detail: "Access housing and support", icon: "UserRoundCheck", target: { kind: "solutions", hash: "care-and-support" } },
  { id: "broker", label: "Broker", detail: "Partner and provide services", icon: "Handshake", target: { kind: "solutions", hash: "estate-agents" } },
  {
    id: "resident",
    label: "Resident",
    detail: "Find suitable homes",
    icon: "User",
    // Route out, never a sales section: the find-a-home enquiry route.
    target: { kind: "contact", enquiry: "support" },
    tone: "route-out",
  },
];

export interface PillarCard {
  id: string;
  title: string;
  tone: "neutral" | "orange";
  /** Descriptive alt text — these are illustrative photographs, not case studies. */
  alt: string;
}

export const pillarCards: PillarCard[] = [
  {
    id: "homes",
    title: "Providing Homes",
    tone: "neutral",
    alt: "An agent handing keys to a young couple outside a brick terrace",
  },
  {
    id: "support",
    title: "Delivering Support",
    tone: "orange",
    alt: "A carer sitting with an older woman in a warmly lit living room",
  },
  {
    id: "lives",
    title: "Transforming Lives",
    tone: "neutral",
    alt: "A family of five smiling outside their front door",
  },
];
