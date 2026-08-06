import * as React from "react";

import { SourceLine } from "@/components/ui/source-line";
import {
  commissioningAuthorities,
  DEFAULT_AUTHORITY_ID,
  type CommissioningAuthority,
} from "@/content/demand";
import englandLad from "@/data/england-lad.json";
import { cn } from "@/lib/utils";
import {
  buildDotField,
  buildHubs,
  buildLinks,
  HEIGHT,
  pathFor,
  WIDTH,
  type DotField,
} from "./demand-map-field";

/**
 * DemandMap — the whole UK as a luminous dot field, with the eighteen English
 * commissioning authorities carrying data-sized hubs.
 *
 * The dot field is a canvas: ~7,000 circles is well past the point where SVG
 * stops being sensible. Everything interactive stays in SVG on top of it —
 * transparent local-authority polygons as hit targets — so hover, selection,
 * the filters and both dropdowns behave exactly as they did before.
 */

/** Sampled from the mock-up rather than estimated. */
const DOT_BASE = [0x00, 0x1d, 0x5b] as const;
const DOT_HOT = [0xd4, 0xff, 0xff] as const;

interface LadFeature {
  type: "Feature";
  properties: { LAD13CD: string; LAD13NM: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: unknown };
}

const COLLECTION = englandLad as unknown as { features: LadFeature[] };

/** district name → authority index, for the interactive hit targets. */
const DISTRICT_TO_INDEX = new Map<string, number>();
commissioningAuthorities.forEach((authority, index) => {
  for (const district of authority.districts) DISTRICT_TO_INDEX.set(district, index);
});

/** Only the commissioning districts need hit targets; the rest are scenery. */
const HIT_TARGETS = COLLECTION.features
  .map((feature) => {
    const index = DISTRICT_TO_INDEX.get(feature.properties.LAD13NM);
    if (index === undefined) return null;
    const d = pathFor(feature as never);
    if (!d) return null;
    return { d, index, name: feature.properties.LAD13NM };
  })
  .filter((entry): entry is { d: string; index: number; name: string } => entry !== null);

const HUBS = buildHubs();
const LINKS = buildLinks(HUBS);

const UNMATCHED = commissioningAuthorities
  .filter((authority) => !HUBS.some((hub) => hub.id === authority.id))
  .map((authority) => authority.name);
if (UNMATCHED.length > 0) {
  // Never silently dropped: surfaced so the district alias map can be fixed.
  console.warn("[DemandMap] authorities with no matched 2013 districts:", UNMATCHED.join(", "));
}

const mix = (t: number, channel: 0 | 1 | 2) =>
  Math.round(DOT_BASE[channel] + (DOT_HOT[channel] - DOT_BASE[channel]) * t);

/** Brightness buckets: a dozen fills rather than seven thousand. */
const BUCKETS = 12;

/** Landmass brightness before demand is applied — coastline does the drawing. */
const baseT = (edge: number) => 0.24 + edge * 0.46;

function addDot(paths: Path2D[], x: number, y: number, rawT: number) {
  const t = Math.max(0, Math.min(1, rawT));
  const radius = 0.85 + t * 0.55;
  const path = paths[Math.min(BUCKETS - 1, Math.round(t * (BUCKETS - 1)))]!;
  path.moveTo(x + radius, y);
  path.arc(x, y, radius, 0, Math.PI * 2);
}

export function DemandMap({
  className,
  visibleIds,
  readout = "beside",
}: {
  className?: string;
  /** When set, authorities outside this list are dimmed (filter state). */
  visibleIds?: string[];
  /**
   * "beside" keeps the readout in its own column — right for the narrow
   * embeds on /platform and /the-problem. "overlay" floats it over the map.
   * "below" puts the three figures in a horizontal bar UNDER the map, which
   * is the homepage treatment: it is the only mode where the map gets the
   * full width of its column.
   *
   * ⚠️ THIS UNION IS LOAD-BEARING. index.tsx asks for "below". If that mode is
   * ever removed from this file again, the prop silently falls through to
   * "beside", the readout takes an 18rem column out of the map's 560px, and
   * the map renders at 240px — which is exactly the bug this comment exists to
   * stop happening a second time.
   */
  readout?: "beside" | "overlay" | "below";
}) {
  const [activeId, setActiveId] = React.useState(
    commissioningAuthorities.find((a) => a.id === DEFAULT_AUTHORITY_ID)?.id ??
      commissioningAuthorities[0]!.id,
  );
  const [field, setField] = React.useState<DotField | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const staticPaths = React.useRef<Path2D[] | null>(null);

  const active: CommissioningAuthority =
    commissioningAuthorities.find((a) => a.id === activeId) ?? commissioningAuthorities[0]!;
  const activeIndex = commissioningAuthorities.indexOf(active);

  const isDimmed = React.useCallback(
    (id: string) => (visibleIds ? !visibleIds.includes(id) : false),
    [visibleIds],
  );

  /** Built once per page load, off the first paint. */
  React.useEffect(() => {
    let cancelled = false;
    const build = () => {
      if (!cancelled) setField(buildDotField());
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    if (idle) idle(build);
    else window.setTimeout(build, 0);
    return () => {
      cancelled = true;
    };
  }, []);

  const paint = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !field) return;

    // Back the canvas with the size it is actually displayed at, not the
    // viewBox. Painting into a 620-wide buffer and letting CSS scale it down
    // renders every dot sub-pixel, which is what turns the field into a smudge.
    const rendered = canvas.clientWidth || WIDTH;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const unit = (rendered / WIDTH) * dpr;
    const width = Math.round(WIDTH * unit);
    const height = Math.round(HEIGHT * unit);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(unit, 0, 0, unit, 0, 0);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const { data, count } = field;

    // Dots outside every commissioning authority — the large majority — can
    // never change brightness, so their paths are built once and re-filled.
    // Only the authority dots are rebuilt when the selection or filter moves,
    // which is what keeps a hover repaint inside a frame.
    if (!staticPaths.current) {
      const built: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      for (let i = 0; i < count; i++) {
        const offset = i * 4;
        if (data[offset + 3]! >= 0) continue;
        addDot(built, data[offset]!, data[offset + 1]!, baseT(data[offset + 2]!));
      }
      staticPaths.current = built;
    }

    const dynamic: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
    for (let i = 0; i < count; i++) {
      const offset = i * 4;
      const authority = data[offset + 3]!;
      if (authority < 0) continue;

      let t = baseT(data[offset + 2]!);
      const item = commissioningAuthorities[authority]!;
      if (isDimmed(item.id)) {
        t *= 0.45;
      } else {
        t += 0.16 + (item.intensity / 100) * 0.3;
        if (authority === activeIndex) t += 0.24;
      }
      addDot(dynamic, data[offset]!, data[offset + 1]!, t);
    }

    for (let b = 0; b < BUCKETS; b++) {
      const t = b / (BUCKETS - 1);
      ctx.fillStyle = `rgba(${mix(t, 0)}, ${mix(t, 1)}, ${mix(t, 2)}, ${(0.62 + t * 0.38).toFixed(3)})`;
      ctx.fill(staticPaths.current[b]!);
      ctx.fill(dynamic[b]!);
    }
  }, [field, activeIndex, isDimmed]);

  React.useEffect(() => {
    paint();
  }, [paint]);

  /** Repaint only when the device pixel ratio changes, throttled. */
  React.useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(paint, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [paint]);

  const overlay = readout === "overlay";
  const below = readout === "below";

  return (
    <div
      className={cn(
        overlay || below
          ? "relative"
          : "grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center",
        className,
      )}
    >
      {/* The map floats on the section — no card, no border, and now no ground
          of its own either: the `demand-map-ground` radial vignette that used
          to sit here was removed with the sweeps, so the dot field sits
          directly on whatever the section's background is. Under "overlay" it
          takes the whole column and the readout rides over it from lg up,
          dropping beneath on narrower screens so neither has to shrink. */}
      <div
        className={cn(
          "relative mx-auto w-full",
          overlay || below ? "max-w-[34rem] lg:max-w-none" : "max-w-[30rem]",
        )}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full"
        />

        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="group"
          aria-label="Map of the United Kingdom. The eighteen English local authorities whose commissioning briefs shape what we source are marked and selectable."
          className="relative w-full"
        >
          <defs>
            <radialGradient id="hub-halo">
              <stop offset="0%" stopColor="#F27216" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#F27216" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#F27216" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hub-inner">
              <stop offset="0%" stopColor="#FFEFB2" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#F27216" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#BF4B1B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/*
           * ⚠️ THE WIDE SWEEPS ARE GONE. Four pale arcs used to be drawn here,
           * across the whole viewBox at 6–9% opacity. They were atmosphere and
           * nothing else — they carried no data — and Callum did not want them:
           * they read as a pattern behind the map rather than as part of it.
           * `SWEEPS` is still exported from demand-map-field.ts if they are
           * ever wanted back; nothing else consumes it.
           */}

          {/* Sparse mesh between neighbouring hubs. */}
          <g aria-hidden="true" stroke="#F27216" strokeWidth="0.5" strokeOpacity="0.15">
            {LINKS.map(({ a, b }) => (
              <line key={`${a.id}-${b.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            ))}
          </g>

          {/* Hubs. Radius carries homes sourced; the glow is not decoration. */}
          <g aria-hidden="true">
            {HUBS.map((hub, i) => {
              const dimmed = isDimmed(hub.id);
              const isActive = hub.id === activeId;
              const scale = 1 + hub.weight * 0.9 + (isActive ? 0.35 : 0);
              return (
                <g
                  key={hub.id}
                  transform={`translate(${hub.x} ${hub.y})`}
                  opacity={dimmed ? 0.18 : 1}
                  className={dimmed ? undefined : "demand-hub"}
                  style={{ animationDelay: `${(i % 7) * 420}ms` }}
                >
                  <circle r={14 * scale} fill="url(#hub-halo)" />
                  <circle r={5 * scale} fill="url(#hub-inner)" />
                  <circle r={1.5 * scale} fill="#FFEFB2" />
                </g>
              );
            })}
          </g>

          {/* Interactive layer: invisible hit targets over the dot field. The
              point-in-polygon work never runs again after the field is built. */}
          <g>
            {HIT_TARGETS.map((target) => {
              const authority = commissioningAuthorities[target.index]!;
              const select = () => setActiveId(authority.id);
              return (
                <path
                  key={`${authority.id}-${target.name}`}
                  d={target.d}
                  fill="transparent"
                  stroke="none"
                  role="button"
                  tabIndex={0}
                  aria-label={`${authority.name} commissioning detail`}
                  aria-pressed={authority.id === activeId}
                  onMouseEnter={select}
                  onFocus={select}
                  onClick={select}
                  onTouchStart={select}
                  className="cursor-pointer outline-none focus-visible:stroke-teal-400 focus-visible:[stroke-width:2]"
                >
                  <title>{authority.name}</title>
                </path>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ── "below": the three figures as a horizontal bar under the map ──
          Same numbers, same aria-live region, same source line — only the
          shape changes. This exists so the map can have the full width of its
          column instead of surrendering 18rem of it to a side panel. */}
      {below ? (
        <aside aria-live="polite" className="panel mt-5 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
            <p>
              <span className="eyebrow block text-teal-400">Selected area</span>
              <span className="heading-tight mt-1 block font-heading text-xl font-bold text-white">
                {active.name}
              </span>
            </p>
            <p>
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-muted">
                Homes sourced
              </span>
              <span className="block font-heading text-xl font-bold text-white">
                {active.homesSourced.toLocaleString("en-GB")}
              </span>
            </p>
            <p>
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-muted">
                Potential rooms
              </span>
              <span className="block font-heading text-xl font-bold text-white">
                {active.potentialRooms.toLocaleString("en-GB")}
              </span>
            </p>
            <p className="min-w-[9rem] flex-1">
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-muted">
                Demand intensity
              </span>
              <span className="mt-2 block h-2 w-full overflow-hidden rounded-full bg-navy-700">
                <span
                  className="block h-full rounded-full bg-teal-500 transition-[width] duration-500 ease-[var(--ease-out-soft)]"
                  style={{ width: `${active.intensity}%` }}
                />
              </span>
              <span className="sr-only">{active.intensity} out of 100</span>
            </p>
          </div>
          <SourceLine
            className="mt-4"
            source="Boundaries: ONS Local Authority Districts (2013) and Natural Earth, Open Government Licence · figures are illustrative interface data"
          />
        </aside>
      ) : (
      <aside
        aria-live="polite"
        className={cn(
          "panel p-5",
          overlay &&
            "mt-6 lg:absolute lg:right-0 lg:top-6 lg:mt-0 lg:w-[17rem] lg:bg-navy-800/85 lg:backdrop-blur-sm",
        )}
      >
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
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-muted">
              Potential rooms
            </dt>
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
          source="Boundaries: ONS Local Authority Districts (2013) and Natural Earth, Open Government Licence · figures are illustrative interface data"
        />
      </aside>
      )}
    </div>
  );
}
