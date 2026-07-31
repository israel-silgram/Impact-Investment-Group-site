import * as React from "react";
import { LiveWindow } from "@/components/ui/live-window";
import { heroSummary } from "@/content/platform";

/** Hero product panel at rest: a summary state with tabs and a soft orange glow. */
export function HeroWindow() {
  const [tab, setTab] = React.useState(heroSummary.tabs[0]!.id);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[48px] bg-orange-500/20 blur-3xl"
      />
      <LiveWindow
        className="relative"
        tabs={heroSummary.tabs}
        activeTab={tab}
        onTabChange={setTab}
        ariaLabel="Platform summary interface preview"
      >
        <div className="grid grid-cols-2 gap-4">
          {heroSummary.metrics.map((metric) => (
            <div
              key={metric.id}
              className="rounded-[var(--radius-panel)] border border-navy-700 bg-navy-900/60 p-4"
            >
              <p className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none text-white">
                {metric.value}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-muted">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        {tab === "evidence" ? (
          <dl className="mt-5 space-y-3">
            {[
              ["Compliance", "EPC · gas · electrical held on record"],
              ["Provenance", "Land Registry · ONS · EPC Register"],
              ["Confirmation", "Officer sign-off required"],
            ].map(([term, detail]) => (
              <div
                key={term}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-navy-700 pb-3 last:border-0 last:pb-0"
              >
                <dt className="font-heading text-sm font-semibold text-white">{term}</dt>
                <dd className="text-sm text-slate-muted">{detail}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <ul className="mt-5 space-y-2">
            {heroSummary.rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-4 rounded-[10px] border border-navy-700 bg-navy-900/40 px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate font-heading text-sm font-semibold text-white">
                    {row.property}
                  </span>
                  <span className="text-[12px] text-slate-muted">{row.rooms}</span>
                </span>
                <span className="shrink-0 font-heading text-sm font-bold text-teal-400">
                  {row.score}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </LiveWindow>
    </div>
  );
}
