import { ArrowRight, Calculator, HeartHandshake, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import terraceSubject from "@/assets/platform-terrace-subject.jpg";
import { IconCircle } from "@/components/ui/icon-circle";
import { Reveal } from "@/components/ui/reveal";
import { MatchPanel } from "@/components/platform/match-panel";
import { aiTeam, type Specialist } from "@/content/platform";
import { cn } from "@/lib/utils";

const icons: Record<Specialist["icon"], LucideIcon> = {
  search: Search,
  calculator: Calculator,
  "heart-handshake": HeartHandshake,
};

/** Petra · Peter · Pippa — three named specialists, equal weight. */
export function AiTeam() {
  return (
    <div>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {aiTeam.specialists.map((person, i) => {
          const Icon = icons[person.icon];
          return (
            <Reveal as="li" key={person.id} index={i} className="h-full">
              <div className="panel flex h-full flex-col overflow-hidden">
                <span aria-hidden="true" className="block h-[3px] w-full bg-teal-500" />
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <IconCircle icon={Icon} size="lg" tone="teal" />
                  <h3 className="heading-tight text-xl font-bold text-white">
                    {person.name} · {person.role}
                  </h3>
                  <p className="text-sm leading-relaxed text-mist">{person.body}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ul>

      {/* Peter's worked example — sits beside his card */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Reveal className="hidden md:block">
          <img
            src={terraceSubject}
            alt="Red-brick British terraced house of the kind assessed in the analysis"
            width={1024}
            height={1280}
            loading="lazy"
            className="h-full w-full rounded-xl object-cover ring-1 ring-navy-700/20"
          />
        </Reveal>
        <Reveal className="md:col-span-2">
          <p className="eyebrow text-teal-400">{aiTeam.workedExampleLabel}</p>
          <div className="mt-3">
            <MatchPanel tabLabel="Peter’s analysis" />
          </div>
        </Reveal>
      </div>


      {/* Flow strip — only the final step is orange */}
      <Reveal className="mt-10">
        <ol className="flex flex-wrap items-center gap-3">
          {aiTeam.flow.map((step, i) => {
            const orange = step.tone === "orange";
            return (
              <li key={step.id} className="flex items-center gap-3">
                {i > 0 ? (
                  <ArrowRight
                    aria-hidden="true"
                    className={cn("size-4 shrink-0", orange ? "text-orange-500" : "text-teal-500")}
                  />
                ) : null}
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-4 py-2 font-heading text-sm font-semibold",
                    orange
                      ? "border-orange-500 text-orange-500"
                      : "border-teal-600/60 text-teal-600",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </Reveal>

      <p className="measure mt-6 text-[13px] leading-relaxed text-slate-muted">
        {aiTeam.disclaimer}
      </p>
    </div>
  );
}
