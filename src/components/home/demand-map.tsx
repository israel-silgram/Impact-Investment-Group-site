import { geoCentroid, geoMercator } from "d3-geo";
import * as React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import { SourceLine } from "@/components/ui/source-line";
import {
  commissioningAuthorities,
  DEFAULT_AUTHORITY_ID,
  type CommissioningAuthority,
} from "@/content/demand";
import englandLad from "@/data/england-lad.json";
import { cn } from "@/lib/utils";

/**
 * DemandMap — England drawn from real local-authority boundaries (2013 LAD
 * GeoJSON, cached in src/data/england-lad.json and filtered to LAD13CD "E*"),
 * projected with geoMercator. The 18 commissioning authorities are highlighted
 * and carry a pulsing orange node at their centroid. Inline SVG only.
 */

type LadFeature = {
  type: "Feature";
  properties: { LAD13CD: string; LAD13NM: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
};

const COLLECTION = englandLad as unknown as {
  type: "FeatureCollection";
  features: LadFeature[];
};

const WIDTH = 620;
const HEIGHT = 760;

/** Fit England to the frame, then express the fit as centre + scale for rsm. */
const fitted = geoMercator()
  .center([-2, 54])
  .fitExtent(
    [
      [10, 10],
      [WIDTH - 10, HEIGHT - 10],
    ],
    COLLECTION as never,
  );
const MAP_SCALE = fitted.scale();
const MAP_CENTER = (fitted.invert?.([WIDTH / 2, HEIGHT / 2]) ?? [-2, 54]) as [number, number];

/** district name (LAD13NM) → authority id */
const DISTRICT_TO_AUTHORITY = new Map<string, string>();
for (const authority of commissioningAuthorities) {
  for (const district of authority.districts) {
    DISTRICT_TO_AUTHORITY.set(district, authority.id);
  }
}

const FEATURES_BY_DISTRICT = new Map(
  COLLECTION.features.map((feature) => [feature.properties.LAD13NM, feature]),
);

/**
 * Area-weighted centroid of each authority's constituent districts, projected
 * to pixel space with the same projection react-simple-maps builds internally
 * and rounded — floating-point drift between server and client renders would
 * otherwise trip a hydration mismatch on the marker transforms.
 */
const markerProjection = geoMercator()
  .center(MAP_CENTER)
  .scale(MAP_SCALE)
  .translate([WIDTH / 2, HEIGHT / 2]);

const CENTROIDS = new Map<string, [number, number]>();
const UNMATCHED: { authority: string; districts: string[] }[] = [];
for (const authority of commissioningAuthorities) {
  const geometries = authority.districts
    .map((district) => FEATURES_BY_DISTRICT.get(district)?.geometry)
    .filter((geometry): geometry is LadFeature["geometry"] => Boolean(geometry));

  const missing = authority.districts.filter((district) => !FEATURES_BY_DISTRICT.has(district));
  if (missing.length > 0) UNMATCHED.push({ authority: authority.name, districts: missing });

  if (geometries.length > 0) {
    const lonLat = geoCentroid({ type: "GeometryCollection", geometries } as never);
    const point = markerProjection(lonLat as [number, number]);
    if (point) {
      CENTROIDS.set(authority.id, [
        Math.round(point[0] * 100) / 100,
        Math.round(point[1] * 100) / 100,
      ]);
    }
  }
}


if (UNMATCHED.length > 0) {
  // Never silently dropped: surfaced so the alias map can be corrected.
  console.warn(
    "[DemandMap] commissioning authorities with unmatched 2013 districts:",
    UNMATCHED.map((entry) => `${entry.authority} → ${entry.districts.join(", ")}`).join(" | "),
  );
}

export function DemandMap({
  className,
  visibleIds,
}: {
  className?: string;
  /** When set, authorities outside this list are dimmed (filter state). */
  visibleIds?: string[];
}) {
  const [activeId, setActiveId] = React.useState(
    commissioningAuthorities.find((a) => a.id === DEFAULT_AUTHORITY_ID)?.id ??
      commissioningAuthorities[0]!.id,
  );
  const active: CommissioningAuthority =
    commissioningAuthorities.find((a) => a.id === activeId) ?? commissioningAuthorities[0]!;

  const isDimmed = (id: string) => (visibleIds ? !visibleIds.includes(id) : false);

  return (
    <div
      className={cn(
        "section-dark grid gap-8 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center",
        className,
      )}
    >
      <div className="relative mx-auto w-full max-w-[26rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[36px] bg-teal-950/40 blur-2xl"
        />
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: MAP_SCALE, center: MAP_CENTER }}
          width={WIDTH}
          height={HEIGHT}
          role="group"
          aria-label="Map of England showing the local authorities whose commissioning briefs shape what we source"
          className="relative w-full"
        >
          <defs>
            <radialGradient id="demand-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-orange-400)" stopOpacity="0.75" />
              <stop offset="100%" stopColor="var(--color-orange-500)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <Geographies geography={COLLECTION}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const authorityId = DISTRICT_TO_AUTHORITY.get(geo.properties.LAD13NM);
                const authority = authorityId
                  ? commissioningAuthorities.find((a) => a.id === authorityId)
                  : undefined;

                if (!authority) {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      tabIndex={-1}
                      style={{
                        default: {
                          fill: "var(--color-navy-800)",
                          stroke: "var(--color-teal-500)",
                          strokeOpacity: 0.25,
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: "var(--color-navy-800)",
                          stroke: "var(--color-teal-500)",
                          strokeOpacity: 0.25,
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        pressed: {
                          fill: "var(--color-navy-800)",
                          stroke: "var(--color-teal-500)",
                          strokeOpacity: 0.25,
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                      }}
                    />
                  );
                }

                const isActive = authority.id === activeId;
                const dimmed = isDimmed(authority.id);
                const select = () => setActiveId(authority.id);
                const highlight = {
                  fill: isActive ? "var(--color-teal-900)" : "var(--color-teal-950)",
                  fillOpacity: dimmed ? 0.35 : 1,
                  stroke: "var(--color-teal-400)",
                  strokeOpacity: dimmed ? 0.25 : 0.6,
                  strokeWidth: 0.6,
                  outline: "none",
                  cursor: "pointer",
                  transition: "fill 200ms var(--ease-out-soft)",
                } as const;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    role="button"
                    tabIndex={0}
                    aria-label={`${authority.name} commissioning detail`}
                    aria-pressed={isActive}
                    onMouseEnter={select}
                    onFocus={select}
                    onClick={select}
                    onTouchStart={select}
                    style={{
                      default: highlight,
                      hover: { ...highlight, fill: "var(--color-teal-800)" },
                      pressed: { ...highlight, fill: "var(--color-teal-800)" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {commissioningAuthorities.map((authority, i) => {
            const centroid = CENTROIDS.get(authority.id);
            if (!centroid) return null;
            const isActive = authority.id === activeId;
            const dimmed = isDimmed(authority.id);

            return (
              <Marker
                key={authority.id}
                coordinates={centroid}
                onMouseEnter={() => setActiveId(authority.id)}
                onFocus={() => setActiveId(authority.id)}
                onClick={() => setActiveId(authority.id)}
                onTouchStart={() => setActiveId(authority.id)}
                style={{ default: { cursor: "pointer" } }}
              >
                <g opacity={dimmed ? 0.22 : 1}>
                  {dimmed ? null : <circle r={isActive ? 14 : 11} fill="url(#demand-glow)" />}
                  <circle
                    r={isActive && !dimmed ? 5.5 : 3.5}
                    fill={isActive ? "var(--color-orange-400)" : "var(--color-orange-500)"}
                    className="demand-node"
                    style={{ animationDelay: `${(i % 6) * 380}ms` }}
                  />
                  {/* Generous hit area for touch. */}
                  <circle
                    r="16"
                    fill="transparent"
                    role="button"
                    tabIndex={0}
                    aria-label={`${authority.name} commissioning detail`}
                    aria-pressed={isActive}
                    className="cursor-pointer outline-none focus-visible:stroke-teal-400 focus-visible:[stroke-width:2]"
                  />
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      <aside aria-live="polite" className="panel p-5">
        <p className="eyebrow text-teal-400">Selected area</p>
        <p className="heading-tight mt-2 text-2xl font-bold text-white">{active.name}</p>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-muted">Homes sourced</dt>
            <dd className="font-heading text-xl font-bold text-white">
              {active.homesSourced.toLocaleString("en-GB")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-muted">Potential rooms</dt>
            <dd className="font-heading text-xl font-bold text-white">
              {active.potentialRooms.toLocaleString("en-GB")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-muted">
              Demand intensity
            </dt>
            <dd className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-navy-700">
                <div
                  className="h-full rounded-full bg-teal-500 transition-[width] duration-500 ease-[var(--ease-out-soft)]"
                  style={{ width: `${active.intensity}%` }}
                />
              </div>
              <span className="sr-only">{active.intensity} out of 100</span>
            </dd>
          </div>
        </dl>

        <SourceLine
          className="mt-5"
          source="Boundaries: ONS Local Authority Districts (2013), Open Government Licence · figures are illustrative interface data"
        />
      </aside>
    </div>
  );
}
