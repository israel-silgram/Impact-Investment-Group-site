import { Reveal } from "@/components/ui/reveal";
import { dataLayers } from "@/content/platform";

/**
 * Five joined data layers, with the named provider for each row. Nothing here
 * is a statistic — it is a description of what each source yields.
 */
export function DataLayers() {
  return (
    <div>
      {/* Table on desktop, stacked rows on mobile — same content, one source. */}
      <Reveal className="mt-10 overflow-hidden rounded-[var(--radius-panel)] border border-navy-800">
        <table className="w-full border-collapse text-left align-top">
          <caption className="sr-only">
            The five data layers, their named sources and what each one gives us
          </caption>
          <thead className="hidden md:table-header-group">
            <tr className="bg-navy-800/40">
              {["Layer", "Sources", "What it gives us"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="border-b border-navy-800 px-5 py-4 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-slate-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataLayers.layers.map((row) => (
              <tr
                key={row.id}
                className="block border-b border-navy-800 last:border-0 md:table-row"
              >
                <th
                  scope="row"
                  className="block px-5 pt-5 text-left align-top font-heading text-base font-bold text-white md:table-cell md:w-[26%] md:py-5"
                >
                  {row.layer}
                </th>
                <td className="block px-5 pt-2 align-top md:table-cell md:w-[30%] md:py-5">
                  <span className="md:hidden mr-2 font-heading text-[11px] uppercase tracking-[0.12em] text-slate-muted">
                    Sources
                  </span>
                  <span className="text-sm leading-relaxed text-teal-600">
                    {row.sources.join(" · ")}
                  </span>
                </td>
                <td className="block px-5 pb-5 pt-2 align-top text-sm leading-relaxed text-mist md:table-cell md:py-5">
                  <span className="md:hidden mr-2 font-heading text-[11px] uppercase tracking-[0.12em] text-slate-muted">
                    Gives us
                  </span>
                  {row.gives}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* The one sentence this page exists to prove. Set as a query, not a headline. */}
      <Reveal className="section-dark mt-10 rounded-[var(--radius-panel)] px-5 py-10 sm:px-10 lg:py-14">
        <p className="eyebrow text-teal-400">The question</p>
        <p className="mt-5 font-mono text-[clamp(1.125rem,2.6vw,1.875rem)] leading-snug text-white">
          <span aria-hidden="true" className="text-teal-400">
            &ldquo;
          </span>
          {dataLayers.query}
          <span aria-hidden="true" className="text-teal-400">
            &rdquo;
          </span>
        </p>
        <p className="measure mt-6 text-base leading-relaxed text-mist">{dataLayers.answer}</p>
      </Reveal>
    </div>
  );
}
