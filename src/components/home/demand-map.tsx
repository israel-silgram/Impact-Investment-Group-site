import * as React from "react";

import { SourceLine } from "@/components/ui/source-line";
import { demandNodes, type DemandNode } from "@/content/home";
import { cn } from "@/lib/utils";

/**
 * DemandMap — the UK rendered as a constellation: a fine node-and-line network
 * in teal at low opacity, with glowing orange nodes at points of demand.
 * Inline SVG only. No screenshots, no map tiles.
 */

const OUTLINE =
  "M190,10 L215,35 L230,70 L250,80 L255,120 L240,145 L265,160 L275,205 L285,250 L300,270 L290,300 L310,320 L335,335 L345,352 L325,375 L335,395 L320,415 L300,430 L285,425 L255,440 L235,430 L215,445 L190,455 L160,470 L165,450 L195,435 L210,415 L185,410 L160,415 L150,395 L165,385 L155,360 L170,340 L200,335 L205,320 L185,310 L180,285 L165,265 L175,240 L160,225 L140,215 L130,190 L145,175 L120,160 L110,140 L130,130 L115,110 L100,90 L120,75 L105,55 L135,45 L150,20 Z";

/** Nearest-neighbour links, computed once so the lattice is stable. */
function buildLinks(nodes: DemandNode[]) {
  const links: { a: DemandNode; b: DemandNode }[] = [];
  nodes.forEach((a, i) => {
    const others = nodes
      .filter((_, j) => j !== i)
      .map((b) => ({ b, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { b } of others) {
      if (!links.some((l) => (l.a === b && l.b === a) || (l.a === a && l.b === b))) {
        links.push({ a, b });
      }
    }
  });
  return links;
}

const LINKS = buildLinks(demandNodes);

export function DemandMap({ className }: { className?: string }) {
  const [activeId, setActiveId] = React.useState(demandNodes[0]!.id);
  const active = demandNodes.find((n) => n.id === activeId) ?? demandNodes[0]!;

  return (
    <div className={cn("grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center", className)}>
      <div className="relative mx-auto w-full max-w-[26rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[36px] bg-teal-950/40 blur-2xl"
        />
        <svg
          viewBox="85 0 285 485"
          role="group"
          aria-label="Map of the United Kingdom showing areas of supported housing demand"
          className="relative w-full"
        >
          <defs>
            <radialGradient id="demand-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-orange-400)" stopOpacity="0.75" />
              <stop offset="100%" stopColor="var(--color-orange-500)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d={OUTLINE}
            fill="var(--color-teal-950)"
            fillOpacity="0.35"
            stroke="var(--color-teal-400)"
            strokeOpacity="0.28"
            strokeWidth="1"
          />

          <g stroke="var(--color-teal-400)" strokeOpacity="0.22" strokeWidth="0.75">
            {LINKS.map(({ a, b }) => (
              <line key={`${a.id}-${b.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            ))}
          </g>

          {demandNodes.map((node, i) => {
            const isActive = node.id === activeId;
            return (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r="11" fill="url(#demand-glow)" />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isActive ? 5 : 3}
                  fill="var(--color-orange-500)"
                  className="demand-node"
                  style={{ animationDelay: `${(i % 6) * 380}ms` }}
                />
                {/* 44px hit area, keyboard reachable */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="16"
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.name} demand detail`}
                  aria-pressed={isActive}
                  className="cursor-pointer outline-none focus-visible:stroke-teal-400 focus-visible:[stroke-width:2]"
                  onMouseEnter={() => setActiveId(node.id)}
                  onFocus={() => setActiveId(node.id)}
                  onClick={() => setActiveId(node.id)}
                />
              </g>
            );
          })}
        </svg>
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

        <SourceLine className="mt-5" source="Platform sourcing data · illustrative interface data" />
      </aside>
    </div>
  );
}
