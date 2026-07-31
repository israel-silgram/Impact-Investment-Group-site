import { ArrowRight } from "lucide-react";
import { cashFlow, groupStructure } from "@/content/about";

/** Group structure diagram: three connected panels plus the cash-flow line. */
export function GroupDiagram() {
  return (
    <div className="mt-10">
      <ol className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
        {groupStructure.map((entity, i) => (
          <li key={entity.id} className="contents">
            <div className="flex h-full flex-col gap-3 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/60 p-6">
              <span className="eyebrow text-teal-400">{`0${i + 1}`}</span>
              <h3 className="font-heading text-lg font-bold text-white">{entity.name}</h3>
              <p className="font-heading text-sm font-semibold text-mist">{entity.role}</p>
              <p className="text-sm leading-relaxed text-slate-muted">{entity.body}</p>
            </div>
            {i < groupStructure.length - 1 ? (
              <span
                aria-hidden="true"
                className="flex items-center justify-center py-1 lg:py-0"
              >
                <span className="hidden h-px w-8 bg-navy-600 lg:block" />
                <ArrowRight className="size-4 rotate-90 text-teal-500 lg:rotate-0" />
                <span className="hidden h-px w-8 bg-navy-600 lg:block" />
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-950 p-6">
        <p className="eyebrow text-slate-muted">{cashFlow.label}</p>
        <ol className="mt-4 flex flex-wrap items-center gap-3">
          {cashFlow.steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="rounded-full border border-teal-500 px-4 py-2 font-heading text-sm font-semibold text-teal-400">
                {step}
              </span>
              {i < cashFlow.steps.length - 1 ? (
                <ArrowRight aria-hidden="true" className="size-4 text-teal-500" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
