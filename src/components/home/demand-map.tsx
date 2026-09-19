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

/**
 * The phone's control, and the desktop's heading, in one place.
 *
 * NO NEW STRING. The options are `commissioningAuthorities`' own names, which
 * the readout already prints, and the accessible name comes from the
 * "Selected area" eyebrow that is already beside it, wired with
 * `aria-labelledby`. 16px, because it is a form control and iOS zooms into
 * anything smaller. min-h-11, because it is the one control on this section a
 * thumb has to hit.
 *
 * ⚠ DECLARED AT MODULE SCOPE, AND THAT IS THE WHOLE POINT OF IT BEING
 * HERE. It was first written inside `DemandMap`, beside the hooks. A function
 * component declared inside another is a NEW TYPE on every render, so React
 * cannot match it against the last one: it unmounts the old subtree and mounts
 * a fresh one. Every selection sets `activeId`, which re-renders `DemandMap`,
 * which threw this `<select>` away and built another, so the node holding
 * focus was removed and `document.activeElement` fell back to the body. A
 * keyboard visitor lost the control the moment they used it, and in Chromium a
 * closed `<select>` fires `change` on an arrow key, so it was lost mid
 * selection rather than after one. Below 1024px this is the ONLY control the
 * map has: the polygons are `aria-hidden` with pointer events off. Found by
 * the rel414 re-check; `scripts/wave414-mobile.py`'s picker probe asserts the
 * select still holds focus after a keyboard change and that the figures moved.
 */
function AuthorityPicker({
  id,
  labelledBy,
  value,
  onChange,
}: {
  id: string;
  labelledBy: string;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <select
      id={id}
      data-authority-picker=""
      aria-labelledby={labelledBy}
      /* There is no autofill token for "which local authority is this reader
         looking at", and an absent attribute lets a browser guess. */
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 min-h-11 w-full cursor-pointer rounded-[10px] border border-rule bg-page px-3 py-2 font-heading text-base font-bold text-ink focus-visible:border-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 lg:hidden"
    >
      {commissioningAuthorities.map((authority) => (
        <option key={authority.id} value={authority.id}>
          {authority.name}
        </option>
      ))}
    </select>
  );
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
  /**
   * ⚠ WAVE 414: ON A PHONE THE POLYGONS ARE NOT THE CONTROL.
   *
   * The eighteen authorities are selected by pressing one of 137 invisible
   * district polygons laid over the dot field. At 1280 the smallest of them
   * is a comfortable target. At 390 the map is 360px wide and the England
   * boundary file does not care: Hartlepool renders 4.56 by 3.68 CSS pixels,
   * Derby 3.48 by 3.56. Wave 414's probe found 137 of them under 44 by 44 on
   * every phone shot, and no amount of padding can be added to a polygon
   * whose shape IS its meaning.
   *
   * So below 1024px the control is a `<select>`, which the brief names as the
   * alternative and which a phone renders as a full-height native picker with
   * a row per option: eighteen targets a thumb cannot miss, in the platform's
   * own idiom, with no new string anywhere (the options are the authority
   * names the map already displays and the label is the readout's existing
   * "Selected area" eyebrow). The polygons stay for the pointer and the
   * keyboard at 1024 and above, where they were never the problem.
   *
   * Defaulted to false and set in an effect, so the prerendered HTML is the
   * one the desktop wants and nothing here can mismatch at hydration. The
   * select is in the markup at every width and hidden with CSS, so it is
   * never content that needs JavaScript to exist; only the polygons' tab
   * stops are moved by this state, and a tab stop on a control that needs
   * JavaScript to do anything is no loss when JavaScript has not arrived.
   */
  const [coarse, setCoarse] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const read = () => setCoarse(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const staticPaths = React.useRef<Path2D[] | null>(null);

  /**
   * The phone's control, and the desktop's heading, in one place.
   *
   * NO NEW STRING. The options are `commissioningAuthorities`' own names,
   * which the readout already prints, and the accessible name comes from the
   * "Selected area" eyebrow that is already beside it, wired with
   * `aria-labelledby`. 16px, because it is a form control and iOS zooms into
   * anything smaller. min-h-11, because it is the one control on this section
   * a thumb has to hit.
   */
  const pickerId = React.useId();

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
      {/*
       * THE MAP'S OWN PLATE. THE ONE NAVY ISLAND ON THIS ROUTE.
       *
       * The map used to float on the section with no card and no ground of its
       * own, because the section behind it was navy already. Wave 412 made the
       * page light, and this field cannot come with it: it is drawn on a
       * canvas as thousands of luminous dots, with orange hubs whose halos are
       * radial gradients fading to transparent. All of that is light ADDED to
       * darkness. On white the dots wash out, the halos disappear and the mesh
       * between hubs reads as dirt on the screen.
       *
       * So the map keeps its darkness and gives up its full bleed: a rounded
       * navy plate inside a cream section, which is what rule 2 of this wave
       * means by an island. `section-dark` is the site's word for it, and the
       * screenshot gate counts these inside <main> and fails at more than one.
       *
       * The readout beside and below it is NOT in here. It is type and
       * numbers, it belongs to the light page, and it is a white card.
       */}
      <div
        className={cn(
          "section-dark relative mx-auto w-full px-3 py-4 sm:px-4 sm:py-5",
          overlay || below ? "max-w-[34rem] lg:max-w-none" : "max-w-[30rem]",
        )}
      >
        {/*
         * ── WAVE 413: THE FIELD IS NOT THERE YET, AND IT SAYS SO ──────────
         *
         * `buildDotField()` walks about seven thousand points against the
         * England boundary file and runs in an idle callback, deliberately, so
         * it cannot delay the first paint. What that left on the screen in the
         * meantime was an empty navy plate: no dots, no landmass, nothing to
         * say whether this was a map still arriving or a map that had failed.
         * On a slow phone that state lasted long enough to be read as broken.
         *
         * The skeleton is a plate with a slow sheen across it, which is the
         * one shape a visitor already reads as "this is coming". It is
         * aria-hidden and carries no text; the SVG over it is real and is
         * already there, so the eighteen authorities are selectable by
         * keyboard from the first frame whether or not the dots have landed.
         *
         * Then the canvas fades in over 300ms rather than appearing between
         * two frames, because seven thousand luminous dots arriving at once on
         * a dark plate is a flash.
         */}
        {field === null ? (
          <span aria-hidden="true" className="map-skeleton absolute inset-0" />
        ) : null}

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          data-map={field === null ? undefined : "in"}
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
                  role={coarse ? undefined : "button"}
                  tabIndex={coarse ? undefined : 0}
                  aria-hidden={coarse ? true : undefined}
                  aria-label={coarse ? undefined : `${authority.name} commissioning detail`}
                  aria-pressed={coarse ? undefined : authority.id === activeId}
                  onMouseEnter={select}
                  onFocus={select}
                  onClick={select}
                  onTouchStart={select}
                  /* pointer-events off below lg as well as the attributes
                     above, so the polygon is not a target for a thumb either:
                     the select beneath the map is. */
                  className="cursor-pointer outline-none focus-visible:stroke-teal-400 focus-visible:[stroke-width:2] max-lg:pointer-events-none"
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
            <p className="w-full lg:w-auto">
              <span id={`${pickerId}-label`} className="eyebrow block text-teal-600">
                Selected area
              </span>
              <AuthorityPicker
                id={pickerId}
                labelledBy={`${pickerId}-label`}
                value={activeId}
                onChange={setActiveId}
              />
              <span className="heading-tight mt-1 hidden font-heading text-xl font-bold text-ink lg:block">
                {active.name}
              </span>
            </p>
            <p>
              <span className="text-[11px] max-lg:text-[12px] uppercase tracking-[0.14em] text-ink-soft">
                Homes sourced
              </span>
              <span className="block font-heading text-xl font-bold text-ink">
                {active.homesSourced.toLocaleString("en-GB")}
              </span>
            </p>
            <p>
              <span className="text-[11px] max-lg:text-[12px] uppercase tracking-[0.14em] text-ink-soft">
                Potential rooms
              </span>
              <span className="block font-heading text-xl font-bold text-ink">
                {active.potentialRooms.toLocaleString("en-GB")}
              </span>
            </p>
            <p className="min-w-[9rem] flex-1">
              <span className="text-[11px] max-lg:text-[12px] uppercase tracking-[0.14em] text-ink-soft">
                Demand intensity
              </span>
              <span className="mt-2 block h-2 w-full overflow-hidden rounded-full bg-rule">
                <span
                  className="block h-full rounded-full bg-teal-600 transition-[width] duration-500 ease-[var(--ease-out-soft)]"
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
              "mt-6 lg:absolute lg:right-0 lg:top-6 lg:mt-0 lg:w-[17rem] lg:bg-page/92 lg:backdrop-blur-sm",
          )}
        >
          <p id={`${pickerId}-label`} className="eyebrow text-teal-600">
            Selected area
          </p>
          <AuthorityPicker
            id={pickerId}
            labelledBy={`${pickerId}-label`}
            value={activeId}
            onChange={setActiveId}
          />
          <p className="heading-tight mt-2 hidden text-2xl font-bold text-ink lg:block">
            {active.name}
          </p>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">Homes sourced</dt>
              <dd className="font-heading text-xl font-bold text-ink">
                {active.homesSourced.toLocaleString("en-GB")}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">Potential rooms</dt>
              <dd className="font-heading text-xl font-bold text-ink">
                {active.potentialRooms.toLocaleString("en-GB")}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                Demand intensity
              </dt>
              <dd className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-rule">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-[width] duration-500 ease-[var(--ease-out-soft)]"
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
