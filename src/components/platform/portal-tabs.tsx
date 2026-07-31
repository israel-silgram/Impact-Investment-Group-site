import * as React from "react";
import { cn } from "@/lib/utils";
import { LiveWindow } from "@/components/ui/live-window";
import { portals } from "@/content/platform";

/** Four portals, one platform. Tab strip with teal active indicators. */
export function PortalTabs() {
  const [active, setActive] = React.useState(portals[0]!.id);
  const portal = portals.find((p) => p.id === active) ?? portals[0]!;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Portals"
        className="flex flex-wrap gap-2 border-b border-navy-700 pb-3"
      >
        {portals.map((p) => {
          const isActive = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`portal-tab-${p.id}`}
              aria-selected={isActive}
              aria-controls={`portal-panel-${p.id}`}
              onClick={() => setActive(p.id)}
              className={cn(
                "min-h-11 cursor-pointer border-b-2 px-4 font-heading text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400",
                isActive
                  ? "border-teal-500 text-white"
                  : "border-transparent text-slate-muted hover:text-mist",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`portal-panel-${portal.id}`}
        aria-labelledby={`portal-tab-${portal.id}`}
        className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start"
      >
        <dl className="space-y-6">
          {(
            [
              ["You see", portal.see],
              ["You do", portal.do],
              ["You get", portal.get],
            ] as const
          ).map(([term, detail]) => (
            <div key={term} className="border-l-2 border-teal-600 pl-5">
              <dt className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-teal-400">
                {term}
              </dt>
              <dd className="measure mt-2 text-base leading-relaxed text-mist">{detail}</dd>
            </div>
          ))}
        </dl>

        <LiveWindow ariaLabel={`${portal.label} portal preview`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse text-left">
              <thead>
                <tr>
                  {portal.columns.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="border-b border-navy-700 pb-3 pr-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-muted"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portal.rows.map((row) => (
                  <tr key={row.id}>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        className={cn(
                          "border-b border-navy-800 py-3 pr-4 text-sm",
                          i === 0 ? "font-heading font-semibold text-white" : "text-mist",
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LiveWindow>
      </div>
    </div>
  );
}
