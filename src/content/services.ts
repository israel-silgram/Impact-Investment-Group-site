/**
 * Copy for /platform — "Our Services" in the navigation.
 *
 * Transcribed from the old production page at iip-web.onrender.com/platform and
 * then cut hard. The originals ran to four and five lines each; what is here is
 * one line per idea, with the words worth seeing marked for emphasis.
 *
 * Emphasis is data, not markup — `{ t, em }` inside a segment array — so a
 * sentence and its bolding change in the same place. `ink` is bold in the
 * section's strongest text colour, `accent` is bold orange.
 */

export type Seg = string | { t: string; em: "ink" | "accent" };

export const servicesHero = {
  eyebrow: "Our services",
  title: "Find it, price it, prove it.",
  lead: "One platform, end to end.",
  summary: [
    "We source UK residential property, price every home against ",
    { t: "named public data", em: "ink" as const },
    ", and follow it into ",
    { t: "managed supported housing", em: "accent" as const },
    " — every figure sourced, or honestly blank.",
  ] satisfies Seg[],
  image: {
    src: "/images/platform-finder.webp",
    alt: "The Property Finder inside the platform: a plain-language search box, matching property cards with beds, rent and gross yield, and an investor pack export panel.",
    caption:
      "Real product UI — the Property Finder. Figures shown are illustrative review data, not live listings.",
  },
};

/** Four steps. One line each — the old page gave each of them a paragraph. */
export const steps = [
  {
    id: "search",
    image: "/images/steps/search.webp",
    name: "Search",
    body: "Describe the home you want in plain words. Matches, map and area demand answer side by side.",
    accent: "teal" as const,
  },
  {
    id: "assess",
    image: "/images/steps/assess.webp",
    name: "Assess",
    body: "Every home carries its numbers in the open — each one sourced, marked an estimate, or left blank.",
    accent: "orange" as const,
  },
  {
    id: "reserve",
    image: "/images/steps/reserve.webp",
    name: "Reserve",
    body: "Move on a home through the platform. Enquiry, paperwork and progress stay in one place.",
    accent: "white" as const,
  },
  {
    id: "managed",
    image: "/images/steps/managed.webp",
    name: "Managed",
    body: "Rhema holds the lease, Elevate delivers the care — and the home reaches someone who needs it.",
    accent: "teal" as const,
  },
];

/**
 * ── FIND IT · PRICE IT · PROVE IT ─────────────────────────────────────────
 *
 * This section used to be SIX things: three tools in a row, and inside the
 * third one, three analysts. A reader met six items and had to work out how
 * they related to each other before any of it meant anything.
 *
 * Petra, Peter and Pippa already are find / price / prove, so the two lists
 * collapsed into one. Three steps, three faces, and the tool each one works in
 * named on a chip beside it. Roughly 120 words became 45.
 *
 * ⚠️ THE CHIPS NAME A TOOL OR A PROPERTY, NOT A CLAIM ABOUT THE ANALYST.
 * Pippa's chip is "Impact score" and NOT "Demand Map" — the Demand Map is a
 * tool the visitor uses, not something she runs, and saying otherwise would
 * misdescribe the product. The Demand Map keeps its own line under the trio
 * (`workflowFooter`) for exactly that reason. If either is ever edited, keep
 * that separation.
 */
export const toolsEyebrow = "The platform, live";
export const toolsHeading = "Find it. Price it. Prove it.";
export const toolsLead = "Three analysts on every deal, inside one platform.";

export interface WorkflowStep {
  id: string;
  /** Character artwork in public/images/ai-team/. Cut out, shared baseline. */
  portrait: string;
  /** The headline. "<Name> <verbs> it." — keep the full stop. */
  claim: string;
  body: string;
  /** The tool or property this step happens in. Two or three words. */
  chip: string;
  accent: "teal" | "orange";
}

export const workflow: WorkflowStep[] = [
  {
    id: "petra",
    portrait: "/images/ai-team/petra.webp",
    claim: "Petra finds it.",
    body: "Describe the home in plain English. She searches the whole sourced market.",
    chip: "Property Finder",
    accent: "teal",
    // was: "Scans the sourced market for homes that fit your brief."
  },
  {
    id: "peter",
    portrait: "/images/ai-team/peter.webp",
    claim: "Peter prices it.",
    body: "Valuation and cost work, run on named public data.",
    chip: "Every figure traceable",
    accent: "orange",
    // was: "Runs the valuation and cost work on named public data."
  },
  {
    id: "pippa",
    portrait: "/images/ai-team/pippa.webp",
    claim: "Pippa proves it.",
    body: "Scores the social impact of every home the platform offers.",
    chip: "Impact score",
    accent: "teal",
    // was: "Scores the social impact of every home the platform offers."
  },
];

/**
 * The Demand Map, which is NOT one of the three analysts.
 *
 * It was a tool of its own in the old three-stop layout and it still has to be
 * named on this page — it is the thing that shows where supported housing is
 * actually needed, and the honesty of it (public figures first, estimates
 * labelled, blanks left blank) is a selling point, not a footnote. It sits
 * under the trio rather than inside it.
 */
export const workflowFooter =
  "All three read the same Demand Map — where supported housing is needed, town by town. Public figures first, estimates labelled, blanks left honest.";

/** Not optional. The trio is analysis, and the page has to say so. */
export const aiTeamNote =
  "Analysis, not financial advice — every figure sourced or a labelled estimate.";

export const compareHeading = "Built differently — on purpose.";
/*
 * ⚠️ NO LONGER RENDERED. "Contrast, not attack. Public, sourced facts only."
 * sat under the heading and announced the section's own good manners; the
 * attribution line under the record already says it is public record, and the
 * panel is now visibly a file rather than an argument. Kept in case the tone of
 * the section is ever questioned — this is what it used to promise.
 */
export const compareNote = "Contrast, not attack. Public, sourced facts only.";
export const compareUpdated = "Updated 2 June 2026";

/*
 * ⚠️ THE LEFT COLUMN NAMES REAL FIRMS AND REAL FINDINGS.
 *
 * Each line was shortened but NOT weakened: every one still states exactly what
 * the named regulator found, and the attribution line below travels with them.
 * Do not add an entry, do not drop the attribution, and do not turn a finding
 * into an implication — the protection here is the precision.
 */
/*
 * Each `detail` was tightened again — and the regulator moved INTO the line
 * rather than trailing at the end of it, which is the opposite of weakening:
 * the finding and who found it now sit in the same breath. Originals kept
 * alongside so any of it can be checked at a glance.
 */
export const sectorRecord = [
  {
    id: "home-reit",
    name: "Home REIT",
    detail: "Collapsed · Serious Fraud Office investigation",
    // was: "Collapsed. Subject to a Serious Fraud Office investigation."
  },
  {
    id: "house-crowd",
    name: "The House Crowd",
    detail: "Liquidation, owing tens of millions",
    // was: "Went into liquidation owing tens of millions."
  },
  {
    id: "qualia",
    name: "Qualia",
    detail: "FCA: care-room scheme operated like a Ponzi",
    // was: "FCA found the care-room scheme operated like a Ponzi."
  },
  {
    id: "lease",
    name: "Lease-based providers",
    detail: "Numerous non-compliant · Regulator of Social Housing",
    // was: "Numerous found non-compliant by the Regulator of Social Housing."
  },
];

/**
 * The marker in the corner of the record panel.
 *
 * ⚠️ IT IS A LABEL, NOT A STAMP. The mock-up had this rotated like a rubber
 * stamp across the corner and it was pulled back deliberately: these are live
 * regulatory findings about named companies, and a jaunty graphic device over
 * them reads as flippant to exactly the reader who matters most. It keeps the
 * letterspacing and the border. It does not keep the tilt.
 */
export const sectorRecordMark = "Public record";

export const sectorRecordHeading = "The sector's record";

export const trustSource =
  "Public record — Serious Fraud Office · Financial Conduct Authority · Regulator of Social Housing";

/** The other half of the contrast. Integration folded in as the third line. */
export const ourBuildHeading = "How we're built";

export const ourBuild = [
  { id: "no-guarantee", title: "No 'guaranteed' returns", detail: "We have never advertised one." },
  { id: "sourced", title: "Every figure sourced", detail: "Or openly marked unavailable." },
  { id: "one-product", title: "One product, three sides", detail: "Investor, referral and impact measurement together." },
];

export const ourBuildNote =
  "Strong specialists exist on each side. Our edge is the integration — not a claim to have invented matching.";

export const ourBuildLabel = "Our own analysis";

/** Published figures. Each carries its publisher and date; none may lose it. */
export const demandFigures = [
  {
    id: "registers",
    value: "1.34m",
    label: "households on local-authority housing registers",
    source: "gov.uk · at 31 March 2025",
    accent: "orange" as const,
  },
  {
    id: "ta",
    /*
     * Updated from 131,140. That figure had no date on it and had gone stale —
     * the current published number is 134,210 at 31 December 2025, from the
     * quarterly statutory homelessness release. It is quoted on /the-problem
     * too; if one moves, BOTH move, or the site contradicts itself.
     */
    value: "134,210",
    label: "households in temporary accommodation",
    source: "gov.uk · at 31 December 2025",
    accent: "teal" as const,
  },
  {
    id: "spend",
    value: "£2.7bn",
    label: "council spend on temporary accommodation",
    source: "gov.uk · 2024–25",
    accent: "white" as const,
  },
];

export const servicesClose = {
  title: "Every figure, sourced — or honestly blank.",
  /*
   * "Register here to request access" is the meaning, but it is far too long
   * for a pill — it wraps to two lines at every width below a desktop. Split
   * in two instead: the button carries the action and the line beneath it
   * carries the consequence. Both halves survive, neither is cramped.
   */
  cta: "Register for Access",
  ctaNote: "Registering puts you in the queue for platform access.",
};

/** Capital-at-risk wording, verbatim from the old page. Never shortened. */
export const capitalAtRisk =
  "Capital at risk. The Impact Investment Platform provides property sourcing, deal packaging and managed investment services, not financial, legal, tax, or mortgage advice. Investing into property on the platform is also a direct investment into the lives of the people housed by Elevate Supported Living.";
