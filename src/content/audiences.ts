/** "Register as" role cards on the home page. Copy edits happen here, not in JSX. */
export interface AudienceRole {
  id: string;
  label: string;
  detail: string;
  /** lucide-react icon name, resolved in the component. */
  icon: string;
  /** Enquiry type deep-linked into /contact. */
  enquiry: string;
}

export const registerRoles: AudienceRole[] = [
  { id: "investor", label: "Investor", detail: "Fund homes, earn returns", icon: "CircleDollarSign", enquiry: "investor" },
  { id: "landlord", label: "Landlord", detail: "Lease homes securely", icon: "Home", enquiry: "partner" },
  { id: "developer", label: "Developer", detail: "Build homes nationally", icon: "Crane", enquiry: "partner" },
  { id: "housing-association", label: "Housing Association", detail: "Buy, sell & lease homes", icon: "Building2", enquiry: "sales" },
  { id: "local-authority", label: "Local Authority", detail: "Access housing supply", icon: "Landmark", enquiry: "sales" },
  { id: "care-provider", label: "Care Provider", detail: "Access housing", icon: "HeartHandshake", enquiry: "sales" },
  { id: "support-provider", label: "Support Provider", detail: "Access housing", icon: "Users", enquiry: "sales" },
  { id: "social-worker", label: "Social Worker", detail: "Access housing and support", icon: "UserHeart", enquiry: "support" },
  { id: "broker", label: "Broker", detail: "Partner and provide services", icon: "Handshake", enquiry: "partner" },
  { id: "resident", label: "Resident", detail: "Find suitable homes", icon: "User", enquiry: "support" },
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
    alt: "Keys handed over on the doorstep of a UK brick terraced house",
  },
  {
    id: "support",
    title: "Delivering Support",
    tone: "orange",
    alt: "A care worker talking with an older resident in her living room",
  },
  {
    id: "lives",
    title: "Transforming Lives",
    tone: "neutral",
    alt: "A family standing outside the front door of their home",
  },
];
