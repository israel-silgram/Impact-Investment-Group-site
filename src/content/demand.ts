/**
 * The 18 English local authorities whose published commissioning briefs shape
 * what the platform sources.
 *
 * `districts` lists the 2013 local-authority-district names (LAD13NM) used by
 * the cached boundary file in src/data/england-lad.json. Some of the 18 do not
 * exist under 2013 boundaries: Cumberland and Westmorland and Furness were
 * created in 2023, and Lancashire and Lincolnshire are county councils, so each
 * is matched through its constituent districts.
 *
 * The figures below are illustrative interface data — labelled as such at the
 * panel — not published statistics.
 */
export interface CommissioningAuthority {
  id: string;
  name: string;
  /** 2013 LAD13NM names that make up this authority in the boundary file. */
  districts: string[];
  homesSourced: number;
  potentialRooms: number;
  /** 0–100, drives the teal intensity bar. */
  intensity: number;
}

export const commissioningAuthorities: CommissioningAuthority[] = [
  {
    id: "manchester",
    name: "Manchester",
    districts: ["Manchester"],
    homesSourced: 1240,
    potentialRooms: 4090,
    intensity: 92,
  },
  {
    id: "salford",
    name: "Salford",
    districts: ["Salford"],
    homesSourced: 410,
    potentialRooms: 1350,
    intensity: 74,
  },
  {
    id: "liverpool",
    name: "Liverpool",
    districts: ["Liverpool"],
    homesSourced: 520,
    potentialRooms: 1710,
    intensity: 78,
  },
  {
    id: "wirral",
    name: "Wirral",
    districts: ["Wirral"],
    homesSourced: 265,
    potentialRooms: 870,
    intensity: 64,
  },
  {
    id: "newcastle-upon-tyne",
    name: "Newcastle upon Tyne",
    districts: ["Newcastle upon Tyne"],
    homesSourced: 240,
    potentialRooms: 790,
    intensity: 61,
  },
  {
    id: "sunderland",
    name: "Sunderland",
    districts: ["Sunderland"],
    homesSourced: 218,
    potentialRooms: 716,
    intensity: 58,
  },
  {
    id: "hartlepool",
    name: "Hartlepool",
    districts: ["Hartlepool"],
    homesSourced: 96,
    potentialRooms: 315,
    intensity: 38,
  },
  {
    id: "middlesbrough",
    name: "Middlesbrough",
    districts: ["Middlesbrough"],
    homesSourced: 152,
    potentialRooms: 500,
    intensity: 49,
  },
  {
    id: "stockton-on-tees",
    name: "Stockton-on-Tees",
    districts: ["Stockton-on-Tees"],
    homesSourced: 128,
    potentialRooms: 420,
    intensity: 45,
  },
  {
    id: "county-durham",
    name: "County Durham",
    districts: ["County Durham"],
    homesSourced: 305,
    potentialRooms: 1000,
    intensity: 68,
  },
  {
    id: "lancashire",
    name: "Lancashire",
    districts: [
      "Burnley",
      "Chorley",
      "Fylde",
      "Hyndburn",
      "Lancaster",
      "Pendle",
      "Preston",
      "Ribble Valley",
      "Rossendale",
      "South Ribble",
      "West Lancashire",
      "Wyre",
    ],
    homesSourced: 486,
    potentialRooms: 1600,
    intensity: 76,
  },
  {
    id: "cumberland",
    name: "Cumberland",
    districts: ["Allerdale", "Carlisle", "Copeland"],
    homesSourced: 112,
    potentialRooms: 368,
    intensity: 41,
  },
  {
    id: "westmorland-and-furness",
    name: "Westmorland and Furness",
    districts: ["Barrow-in-Furness", "Eden", "South Lakeland"],
    homesSourced: 88,
    potentialRooms: 290,
    intensity: 36,
  },
  {
    id: "nottingham",
    name: "Nottingham",
    districts: ["Nottingham"],
    homesSourced: 264,
    potentialRooms: 866,
    intensity: 63,
  },
  {
    id: "derby",
    name: "Derby",
    districts: ["Derby"],
    homesSourced: 186,
    potentialRooms: 610,
    intensity: 55,
  },
  {
    id: "lincolnshire",
    name: "Lincolnshire",
    districts: [
      "Boston",
      "East Lindsey",
      "Lincoln",
      "North Kesteven",
      "South Holland",
      "South Kesteven",
      "West Lindsey",
    ],
    homesSourced: 342,
    potentialRooms: 1125,
    intensity: 70,
  },
  {
    id: "north-east-lincolnshire",
    name: "North East Lincolnshire",
    districts: ["North East Lincolnshire"],
    homesSourced: 134,
    potentialRooms: 440,
    intensity: 46,
  },
  {
    id: "east-riding-of-yorkshire",
    name: "East Riding of Yorkshire",
    districts: ["East Riding of Yorkshire"],
    homesSourced: 176,
    potentialRooms: 578,
    intensity: 52,
  },
];

export const DEFAULT_AUTHORITY_ID = "manchester";
