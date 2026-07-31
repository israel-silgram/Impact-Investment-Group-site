/**
 * Typed content contracts. Copy lives in /src/content files, never in JSX.
 *
 * EDITORIAL RULE: a Stat must always carry a `source`. If the number is not
 * yet verified, set `value: "—"` and use `pendingCondition` to state what will
 * fill it. Never invent a figure.
 */

export interface Stat {
  id: string;
  /** Verified figure, or "—" when not yet available. */
  value: string;
  label: string;
  /** Inline attribution rendered in small muted text beneath the figure. */
  source: string;
  /** Required when value is "—": the condition that will fill it. */
  pendingCondition?: string;
}

export type Audience =
  | "local-authorities"
  | "housing-associations"
  | "care-providers"
  | "investors"
  | "landlords"
  | "developers"
  | "estate-agents";

export interface Solution {
  id: string;
  audience: Audience;
  title: string;
  summary: string;
  outcomes: string[];
  /** lucide-react icon name. */
  icon: string;
}

export interface CaseStudySlot {
  id: string;
  /** Null renders the dashed "Case study slot" empty state — never a stock face. */
  organisation: string | null;
  sector: string;
  quote?: string;
  attributionInitials?: string;
}

/** One orange action per page, reused verbatim in hero and closing band. */
export interface PrimaryAction {
  label: string;
  href: string;
}
