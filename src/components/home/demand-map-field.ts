import { geoMercator, geoPath } from "d3-geo";
import type { GeoProjection } from "d3-geo";

import { commissioningAuthorities } from "@/content/demand";
import englandLad from "@/data/england-lad.json";
import ukOutline from "@/data/uk-outline.json";

/**
 * Geometry for the Live UK Demand map.
 *
 * Two layers, deliberately:
 *
 *   Visual      — the whole UK as a field of dots, built from a simplified
 *                 Natural Earth outline (src/data/uk-outline.json). Scotland,
 *                 Wales, Northern Ireland and the Isle of Man render as
 *                 landmass so the map reads as the UK, not England alone.
 *   Interactive — the 2013 English local-authority districts, unchanged. Only
 *                 these are selectable, because they are the only geography we
 *                 hold commissioning data for.
 *
 * Everything here is pure and framework-free so it can be measured in isolation
 * and memoised once per page load rather than recomputed on hover or resize.
 */

export const WIDTH = 620;
export const HEIGHT = 760;
/** Grid pitch in viewBox units. ~3.5 gives ≈5.6% blue coverage, as sampled. */
const SPACING = 3.5;

type Ring = [number, number][];
interface PixelPolygon {
  rings: Ring[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface Feature {
  type: string;
  properties: Record<string, string>;
  geometry: { type: string; coordinates: unknown };
}

const UK = ukOutline as unknown as { type: "FeatureCollection"; features: Feature[] };
const ENGLAND = englandLad as unknown as { type: "FeatureCollection"; features: Feature[] };

/** One projection for every layer — the dots and the hit targets must agree. */
export const projection: GeoProjection = geoMercator().fitExtent(
  [
    [8, 8],
    [WIDTH - 8, HEIGHT - 8],
  ],
  UK as never,
);

export const pathFor = geoPath(projection);

function toPixelPolygons(features: Feature[]): PixelPolygon[] {
  const polygons: PixelPolygon[] = [];
  for (const feature of features) {
    const geometry = feature.geometry;
    const groups = (
      geometry.type === "MultiPolygon" ? geometry.coordinates : [geometry.coordinates]
    ) as [number, number][][][];

    for (const polygon of groups) {
      const rings: Ring[] = [];
      for (const ring of polygon) {
        const points: Ring = [];
        for (const coordinate of ring) {
          const point = projection(coordinate);
          if (point) points.push([point[0], point[1]]);
        }
        if (points.length > 2) rings.push(points);
      }
      if (rings.length === 0) continue;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const [x, y] of rings[0]!) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      polygons.push({ rings, minX, minY, maxX, maxY });
    }
  }
  return polygons;
}

function inRing(x: number, y: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inPolygon(x: number, y: number, polygon: PixelPolygon): boolean {
  if (x < polygon.minX || x > polygon.maxX || y < polygon.minY || y > polygon.maxY) return false;
  if (!inRing(x, y, polygon.rings[0]!)) return false;
  // Any further ring is a hole.
  for (let i = 1; i < polygon.rings.length; i++) {
    if (inRing(x, y, polygon.rings[i]!)) return false;
  }
  return true;
}

/**
 * One dot per entry, stride 4: x, y, edge closeness (0–1) and the index of the
 * commissioning authority it falls inside, or -1. A flat Float32Array rather
 * than objects — this is read once per frame by the canvas painter.
 */
export interface DotField {
  data: Float32Array;
  count: number;
}

const STRIDE = 4;

let cachedField: DotField | null = null;

/** Built once per page load. Roughly 7,000 dots and ~60ms of work. */
export function buildDotField(): DotField {
  if (cachedField) return cachedField;

  const cols = Math.ceil(WIDTH / SPACING);
  const rows = Math.ceil(HEIGHT / SPACING);
  const mask = new Uint8Array(cols * rows);

  // Walk each polygon's own bounding box rather than testing every cell against
  // every polygon — the difference is roughly 200ms against 40ms.
  const land = toPixelPolygons(UK.features);
  for (const polygon of land) {
    const c0 = Math.max(0, Math.floor((polygon.minX - SPACING) / SPACING));
    const c1 = Math.min(cols - 1, Math.ceil((polygon.maxX + SPACING) / SPACING));
    const r0 = Math.max(0, Math.floor((polygon.minY - SPACING) / SPACING));
    const r1 = Math.min(rows - 1, Math.ceil((polygon.maxY + SPACING) / SPACING));
    for (let r = r0; r <= r1; r++) {
      const y = r * SPACING + SPACING / 2;
      for (let c = c0; c <= c1; c++) {
        const index = r * cols + c;
        if (mask[index]) continue;
        if (inPolygon(c * SPACING + SPACING / 2, y, polygon)) mask[index] = 1;
      }
    }
  }

  // Authority membership, so demand can drive brightness. Only the eighteen
  // commissioning authorities are tested — the other 308 districts carry no
  // data and would only cost time.
  const districtToAuthority = new Map<string, number>();
  commissioningAuthorities.forEach((authority, index) => {
    for (const district of authority.districts) districtToAuthority.set(district, index);
  });
  const authorityPolygons: { polygon: PixelPolygon; authority: number }[] = [];
  for (const feature of ENGLAND.features) {
    const authority = districtToAuthority.get(feature.properties["LAD13NM"] ?? "");
    if (authority === undefined) continue;
    for (const polygon of toPixelPolygons([feature])) {
      authorityPolygons.push({ polygon, authority });
    }
  }

  const data = new Float32Array(cols * rows * STRIDE);
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!mask[r * cols + c]) continue;
      const x = c * SPACING + SPACING / 2;
      const y = r * SPACING + SPACING / 2;

      // Edge closeness: 1 where a neighbouring cell is sea, falling away over
      // two grid steps. This is what draws the coastline out of the field.
      let edge = 0;
      for (let dr = -2; dr <= 2 && edge < 1; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const rr = r + dr;
          const cc = c + dc;
          const outside = rr < 0 || cc < 0 || rr >= rows || cc >= cols || !mask[rr * cols + cc];
          if (!outside) continue;
          const distance = Math.max(Math.abs(dr), Math.abs(dc));
          const strength = distance <= 1 ? 1 : 0.45;
          if (strength > edge) edge = strength;
          if (edge >= 1) break;
        }
      }

      let authority = -1;
      for (const entry of authorityPolygons) {
        if (inPolygon(x, y, entry.polygon)) {
          authority = entry.authority;
          break;
        }
      }

      const offset = count * STRIDE;
      data[offset] = x;
      data[offset + 1] = y;
      data[offset + 2] = edge;
      data[offset + 3] = authority;
      count++;
    }
  }

  cachedField = { data: data.subarray(0, count * STRIDE), count };
  return cachedField;
}

/** Projected centroid of an authority, in viewBox units. */
export interface Hub {
  id: string;
  name: string;
  x: number;
  y: number;
  /** 0–1, from homes sourced. Drives hub radius. */
  weight: number;
  intensity: number;
}

let cachedHubs: Hub[] | null = null;

export function buildHubs(): Hub[] {
  if (cachedHubs) return cachedHubs;

  const featureByDistrict = new Map(
    ENGLAND.features.map((feature) => [feature.properties["LAD13NM"], feature]),
  );
  const maxHomes = Math.max(...commissioningAuthorities.map((a) => a.homesSourced));

  const hubs: Hub[] = [];
  for (const authority of commissioningAuthorities) {
    const geometries = authority.districts
      .map((district) => featureByDistrict.get(district)?.geometry)
      .filter(Boolean);
    if (geometries.length === 0) continue;

    const centroid = pathFor.centroid({
      type: "GeometryCollection",
      geometries,
    } as never);
    if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) continue;

    hubs.push({
      id: authority.id,
      name: authority.name,
      // Rounded: sub-pixel drift between the server and client renders would
      // otherwise trip a hydration mismatch on the transforms.
      x: Math.round(centroid[0] * 100) / 100,
      y: Math.round(centroid[1] * 100) / 100,
      weight: Math.sqrt(authority.homesSourced / maxHomes),
      intensity: authority.intensity,
    });
  }

  cachedHubs = hubs;
  return hubs;
}

/**
 * A sparse mesh: each hub links only to its two nearest neighbours, and only
 * within range. The mock-up is a mesh, not a web — connecting every pair turns
 * it into noise.
 */
export function buildLinks(hubs: Hub[]): { a: Hub; b: Hub }[] {
  const seen = new Set<string>();
  const links: { a: Hub; b: Hub }[] = [];
  const MAX_DISTANCE = 210;

  for (const hub of hubs) {
    const neighbours = hubs
      .filter((other) => other.id !== hub.id)
      .map((other) => ({ other, d: Math.hypot(other.x - hub.x, other.y - hub.y) }))
      .sort((m, n) => m.d - n.d)
      .slice(0, 2);

    for (const { other, d } of neighbours) {
      if (d > MAX_DISTANCE) continue;
      const key = [hub.id, other.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ a: hub, b: other });
    }
  }
  return links;
}

/**
 * The wide sweeps crossing the map in the mock-up. Deliberately drawn outside
 * the landmass — they are atmosphere, not data, so they never imply a route.
 */
export const SWEEPS: string[] = [
  `M ${-40} ${560} Q ${WIDTH / 2} ${240} ${WIDTH + 40} ${470}`,
  `M ${-30} ${330} Q ${WIDTH / 2 + 60} ${620} ${WIDTH + 30} ${250}`,
  `M ${120} ${-40} Q ${WIDTH + 120} ${HEIGHT / 2} ${180} ${HEIGHT + 40}`,
  `M ${WIDTH + 30} ${90} Q ${-120} ${HEIGHT / 2 + 60} ${WIDTH - 120} ${HEIGHT + 30}`,
];
