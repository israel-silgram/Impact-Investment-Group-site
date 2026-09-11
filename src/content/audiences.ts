/** The wait-list role tiles and the three-panel band. Copy edits happen here, not in JSX. */

export interface AudienceRole {
  /**
   * Also the URL segment of this role's wait-list page, /register/<id>, and the
   * `role` field of the payload that page posts. Changing an id breaks a live
   * link and orphans every answer already stored against the old one.
   */
  id: string;
  label: string;
  detail: string;
  /** lucide-react icon name, resolved in the component. */
  icon: string;
  /** "route-out" tiles are styled with a teal ring — a way out, not a pitch. */
  tone?: "default" | "route-out";
}

export const registerRoles: AudienceRole[] = [
  {
    id: "investor",
    label: "Investor",
    detail: "Fund homes, earn returns",
    icon: "CircleDollarSign",
  },
  { id: "landlord", label: "Landlord", detail: "Lease homes securely", icon: "Home" },
  { id: "developer", label: "Developer", detail: "Build homes nationally", icon: "HardHat" },
  {
    id: "housing-association",
    label: "Housing Association",
    detail: "Buy, sell & lease homes",
    icon: "Building2",
  },
  {
    id: "local-authority",
    label: "Local Authority",
    detail: "Access housing supply",
    icon: "Landmark",
  },
  { id: "care-provider", label: "Care Provider", detail: "Access housing", icon: "HeartHandshake" },
  { id: "support-provider", label: "Support Provider", detail: "Access housing", icon: "Users" },
  {
    id: "social-worker",
    label: "Social Worker",
    detail: "Access housing and support",
    icon: "UserRoundCheck",
  },
  { id: "broker", label: "Broker", detail: "Partner and provide services", icon: "Handshake" },
  {
    id: "resident",
    label: "Resident",
    detail: "Find suitable homes",
    icon: "User",
    // Still a route out and never a sales section. /register/resident asks what
    // this person needs and where; it does not sell them anything.
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
