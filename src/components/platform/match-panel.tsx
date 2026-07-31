import { ArrowRight, Check } from "lucide-react";
import { LiveWindow } from "@/components/ui/live-window";
import { DotMeter } from "@/components/platform/dot-meter";
import { matchFactors, matchOverall } from "@/content/platform";

/** Match-detail state. The evidence breakdown carries more weight than the score. */
export function MatchPanel({ tabLabel = "Match detail" }: { tabLabel?: string }) {
  return (
    <LiveWindow
      ariaLabel="Match detail interface preview"
      tabs={[{ id: "match", label: tabLabel }]}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-muted">Overall match</p>
          <p className="mt-1 inline-block font-heading text-3xl font-bold leading-none text-white">
            <span className="border-b-2 border-orange-500 pb-1">{matchOverall}</span>
          </p>
        </div>
        <p className="font-heading text-sm font-semibold text-mist">3-bed terrace · M14</p>
      </div>

      <div className="mt-6 rounded-[var(--radius-panel)] border border-teal-600/60 bg-teal-950/40 p-5">
        <p className="eyebrow text-teal-400">Evidence</p>
        <div className="mt-4 space-y-4">
          {matchFactors.map((factor) => (
            <DotMeter key={factor.id} label={factor.label} filled={factor.filled} />
          ))}
        </div>
        <ul className="mt-5 space-y-2 border-t border-teal-600/40 pt-4">
          {[
            "Every factor is traceable to a source record.",
            "Model version is stamped on the match.",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 text-[13px] leading-relaxed text-mist">
              <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-teal-400" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-[10px] border border-navy-700 bg-navy-900/50 px-4 py-3">
        <span className="text-[13px] text-slate-muted">Awaiting officer confirmation</span>
        <span className="inline-flex min-h-11 items-center gap-2 font-heading text-sm font-semibold text-teal-400">
          Confirm placement
          <ArrowRight aria-hidden="true" className="size-4" />
        </span>
      </div>
    </LiveWindow>
  );
}
