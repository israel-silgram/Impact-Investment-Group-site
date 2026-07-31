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
  "M215,18 L232,40 L252,34 L262,58 L250,78 L268,96 L258,118 L272,140 L262,162 L282,186 L300,178 L312,200 L300,224 L316,246 L300,268 L316,292 L308,316 L326,340 L318,366 L332,392 L318,418 L330,446 L312,470 L318,498 L296,520 L272,516 L256,534 L232,528 L214,548 L188,540 L170,556 L150,540 L136,556 L118,536 L128,512 L112,492 L124,470 L106,448 L120,424 L104,400 L118,376 L104,352 L120,330 L108,306 L124,282 L112,258 L128,236 L116,212 L134,190 L124,166 L142,146 L134,122 L152,102 L146,78 L166,58 L176,34 Z";

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
          viewBox="90 0 260 580"
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
                <circle cx={node.x} cy={node.y} r="16" fill="url(#demand-glow)" />
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
                  r="22"
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
