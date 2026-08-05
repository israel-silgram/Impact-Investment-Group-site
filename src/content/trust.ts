/**
 * Council and data-provider credits, plus the platform's own coverage
 * figures.
 *
 * Everything here was copied from the production site at
 * `Impact-Investment-Platform/iip-frontend/iip-web` rather than rebuilt:
 * the council list from `src/components/marketing/CommissioningStrip.jsx`,
 * the data sources from `src/lib/dataSources.js`, and the artwork from
 * `public/logos/` with filenames unchanged.
 *
 * The disclaimers below are the reason this can ship at all. Council crests
 * are protected marks and a wall of them reads as endorsement unless it says
 * otherwise, and OpenStreetMap's ODbL *requires* attribution wherever its
 * data is credited. None of these lines is decoration — do not trim them to
 * make a layout fit.
 */

export interface LogoCredit {
  name: string;
  logo: string;
}

/**
 * The 18 councils whose published commissioning briefs shape what the
 * platform sources. Every entry has artwork — a council without a logo is
 * left out rather than shown as bare text.
 *
 * ARTWORK: these point at `councils/normalised/`, not at the original
 * `-128.webp` files beside them. The originals are inconsistent in a way no
 * amount of CSS could fix: ten carry a white background baked in, four are
 * properly transparent, and Liverpool and Salford are white-out-of-colour
 * lockups — a purple block and a pink block. Aspect ratios ran from 1:1
 * (Manchester) to 4:1 (Newcastle), so a row of equal-width plates still
 * looked ragged, because each file brought its own padding with it.
 *
 * The normalised set is generated from those originals: flattened onto white,
 * trimmed of the file's own padding, then rescaled so every mark occupies the
 * same optical AREA — sqrt(w × h) held constant — and centred in a 240 × 104
 * canvas. A square crest and a wide wordmark therefore carry equal visual
 * weight in the lane. No mark is cropped, recoloured or distorted; only the
 * empty space around it changes.
 *
 * The originals are deliberately kept in place. If a council reissues its
 * mark, replace the original and regenerate — do not hand-edit the normalised
 * file.
 *
 * This also rules out the treatment that would suit the navy best — logos
 * knocked back to white with no plates. Liverpool and Salford would come
 * through as solid rectangles, because in their artwork the colour IS the
 * background. That needs reversed-out versions from the councils themselves.
 */
export const commissioningCouncils: LogoCredit[] = [
  {
    name: "North East Lincolnshire Council",
    logo: "/images/logos/councils/normalised/north-east-lincolnshire.webp",
  },
  { name: "Newcastle City Council", logo: "/images/logos/councils/normalised/newcastle.webp" },
  { name: "Sunderland City Council", logo: "/images/logos/councils/normalised/sunderland.webp" },
  { name: "Hartlepool Borough Council", logo: "/images/logos/councils/normalised/hartlepool.webp" },
  { name: "Middlesbrough Council", logo: "/images/logos/councils/normalised/middlesbrough.webp" },
  {
    name: "Stockton-on-Tees Borough Council",
    logo: "/images/logos/councils/normalised/stockton-on-tees.webp",
  },
  { name: "County Durham Council", logo: "/images/logos/councils/normalised/county-durham.webp" },
  { name: "Manchester City Council", logo: "/images/logos/councils/normalised/manchester.webp" },
  { name: "Salford City Council", logo: "/images/logos/councils/normalised/salford.webp" },
  { name: "Liverpool City Council", logo: "/images/logos/councils/normalised/liverpool.webp" },
  { name: "Wirral Council", logo: "/images/logos/councils/normalised/wirral.webp" },
  { name: "Lancashire County Council", logo: "/images/logos/councils/normalised/lancashire.webp" },
  { name: "Cumberland Council", logo: "/images/logos/councils/normalised/cumberland.webp" },
  {
    name: "Westmorland and Furness Council",
    logo: "/images/logos/councils/normalised/westmorland-and-furness.webp",
  },
  { name: "Nottingham City Council", logo: "/images/logos/councils/normalised/nottingham.webp" },
  { name: "Derby City Council", logo: "/images/logos/councils/normalised/derby.webp" },
  {
    name: "Lincolnshire County Council",
    logo: "/images/logos/councils/normalised/lincolnshire.webp",
  },
  {
    name: "East Riding of Yorkshire Council",
    logo: "/images/logos/councils/normalised/east-riding-of-yorkshire.webp",
  },
];

export const councilsEyebrow = "Built around what local authorities are commissioning";

/**
 * The count, split so the panel can set the figure at display scale.
 *
 * `councilsCount` and `councilsCountOf` are not decoration: together they are
 * the "18 of the ~296" claim that used to open the disclaimer. Showing 18
 * crests without the denominator implies national coverage the platform does
 * not have, so if the figure is ever displayed without `councilsCountOf`
 * beside it, the sentence has to go back into the disclaimer.
 */
export const councilsCount = "18";
export const councilsCountOf = "of ~296 English local authorities";
export const councilsCountLabel = "Local authorities we build around";

/*
 * THE ORIGINAL DISCLAIMER, verbatim from the production site's
 * CommissioningStrip. Kept here so it can be restored, not paraphrased:
 *
 *   "These are 18 of the ~296 local authorities in England, in the areas we
 *    source most. Their logos indicate the commissioning briefs we build
 *    around — not a partnership, endorsement or approval by any council."
 *
 * The version below is shorter because the anchored panel now carries the
 * first claim structurally: "18" is set at display scale with "of ~296 English
 * local authorities" directly beneath it, so repeating "These are 18 of the
 * ~296 local authorities in England" in prose said the same thing twice.
 *
 * Every substantive claim survives the cut:
 *
 *   18 of ~296, England ....... `councilsCount` + `councilsCountOf`
 *   why these 18 .............. "These are the areas we source most."
 *   what the logos mean ....... "Their published commissioning briefs shape
 *                                what we build around"
 *   the denial ................ "not a partnership, endorsement or approval
 *                                by any council" — WORD FOR WORD
 *
 * The denial is the clause that does the legal work and it is unchanged. Do
 * not shorten it further, and do not separate it from the logos: wherever the
 * crests go, this goes with them.
 */
export const councilsDisclaimer =
  "These are the areas we source most. Their published commissioning briefs shape what we build around — not a partnership, endorsement or approval by any council.";

export interface DataSource extends LogoCredit {
  id: string;
  /** Rides the image alt — what the platform actually reads from it. */
  blurb: string;
  /** Intrinsic artwork size, so a lazy tile reserves its true width. */
  artwork: { w: number; h: number };
}

/**
 * A logo here is a claim that the running platform queries that source.
 * Companies House is deliberately absent: the old repo records that its
 * integration is key-gated on a variable never provisioned in production,
 * so crediting it would claim something the platform does not do.
 */
export const dataSources: DataSource[] = [
  {
    id: "land-registry",
    name: "HM Land Registry",
    logo: "/images/logos/data/hm-land-registry.svg",
    artwork: { w: 440, h: 200 },
    blurb: "Sold prices · price-paid comparables",
  },
  {
    id: "ons",
    name: "Office for National Statistics",
    logo: "/images/logos/data/ons.svg",
    artwork: { w: 595.3, h: 116.3 },
    blurb: "Population estimates & private-rent trends",
  },
  {
    id: "postcodes-io",
    name: "postcodes.io",
    logo: "/images/logos/data/postcodes-io.svg",
    artwork: { w: 440, h: 200 },
    blurb: "Postcode validation & geocoding",
  },
  {
    id: "openstreetmap",
    name: "OpenStreetMap",
    logo: "/images/logos/data/openstreetmap.svg",
    artwork: { w: 440, h: 200 },
    blurb: "Walkable amenities around a home",
  },
  {
    id: "epc-register",
    name: "Energy Performance Register",
    logo: "/images/logos/data/epc-register.svg",
    artwork: { w: 440, h: 200 },
    blurb: "Energy ratings · floor area",
  },
];

export const dataSourcesEyebrow = "Powered by authoritative UK data";

/** Both lines are legal, not decorative. */
export const dataSourcesDisclaimer =
  "Public data used under licence. These publishers do not endorse this platform.";
/** ODbL requires the contributor credit *and* an indication of the licence. */
export const openStreetMapAttribution = "© OpenStreetMap contributors · ODbL";

export interface PlatformStat {
  value: string;
  label: string;
  detail: string;
  /** The middle card is filled — teal, never orange. Orange is for actions. */
  emphasis?: boolean;
}

/*
 * ⚠️ THESE FIGURES ARE A STATIC SNAPSHOT, NOT LIVE.
 *
 * On the production site these three tiles read `GET /api/public/platform-stats`
 * and follow an honest ladder: skeleton while in flight, the banded figure on
 * success, and the literal word "Growing" on failure — never a fabricated
 * number. This repo has no backend and no such endpoint, so the values below
 * are transcribed from what that site was displaying.
 *
 *   Source:    Impact-Investment-Platform production site, HomeStatsBand
 *   Recorded:  3 August 2026
 *
 * They will drift. Either point the caption at a real endpoint or change the
 * "live from our platform" line, because as it stands the caption claims
 * something the page cannot currently do.
 */
export const platformStats: PlatformStat[] = [
  {
    value: "193,000+",
    label: "homes sourced & analysed",
    detail: "Sourced across the UK, each run through our analysis.",
  },
  {
    value: "634,000+",
    label: "potential homing opportunities",
    detail: "Counted as the bedrooms across those homes — each a potential supported room.",
    emphasis: true,
  },
  {
    value: "1,693",
    label: "towns & areas covered",
    detail: "Towns and areas with at least one home sourced.",
  },
];

export const platformStatsSource = "live from our platform";
