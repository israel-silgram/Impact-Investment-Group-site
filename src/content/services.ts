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

export const toolsHeading = "Three tools, one workflow.";

export const toolsLead = "Search, read the need, then let the AI team do the legwork.";

/**
 * The three stops on the roadmap.
 *
 * `disc` is a FILL, which is why each one may be a strong colour: a filled
 * shape has no text-contrast floor, and `.section-light` exempts `svg` from its
 * orange guard, so a white glyph on the orange disc survives exactly as drawn.
 * The third stop opens out into `aiTeam` rather than getting a row of its own.
 */
export const tools = [
  {
    id: "finder",
    name: "Property Finder",
    icon: "Search",
    disc: "bg-teal-600",
    body: "Describe the brief in your own words. Matches, map and live demand answer together, every figure traceable.",
  },
  {
    id: "map",
    name: "Demand Map",
    icon: "Map",
    disc: "bg-orange-600",
    body: "Where supported housing is needed, town by town. Public figures first, estimates labelled, blanks left honest.",
  },
  {
    id: "ai",
    name: "Your AI team",
    icon: "BrainCircuit",
    disc: "bg-navy-900",
    body: "Three analysts on every deal, answering questions inside the platform.",
  },
];

/** Petra, Peter, Pippa — the old page's trio, kept. */
export const aiTeam = [
  { id: "petra", name: "Petra", role: "Finds it", body: "Scans the sourced market for homes that fit your brief.", accent: "teal" as const },
  { id: "peter", name: "Peter", role: "Prices it", body: "Runs the valuation and cost work on named public data.", accent: "orange" as const },
  { id: "pippa", name: "Pippa", role: "Proves it", body: "Scores the social impact of every home the platform offers.", accent: "teal" as const },
];

/** Not optional. The trio is analysis, and the page has to say so. */
export const aiTeamNote =
  "Analysis, not financial advice — every figure sourced or a labelled estimate.";

export const compareHeading = "Built differently — on purpose.";
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
export const sectorRecord = [
  { id: "home-reit", name: "Home REIT", detail: "Collapsed. Subject to a Serious Fraud Office investigation." },
  { id: "house-crowd", name: "The House Crowd", detail: "Went into liquidation owing tens of millions." },
  { id: "qualia", name: "Qualia", detail: "FCA found the care-room scheme operated like a Ponzi." },
  { id: "lease", name: "Lease-based providers", detail: "Numerous found non-compliant by the Regulator of Social Housing." },
];

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
    value: "131,140",
    label: "households in temporary accommodation",
    source: "gov.uk",
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
