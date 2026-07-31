import { propertyReportNote, propertyReportRows } from "@/content/platform";

/** Property report card. Every row names the publisher it came from. */
export function PropertyReport() {
  return (
    <div className="panel p-5 sm:p-6">
      <p className="eyebrow text-teal-400">Property report</p>
      <p className="heading-tight mt-2 text-xl font-bold text-white">3-bed terrace · M14</p>

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr>
            <th
              scope="col"
              className="border-b border-navy-700 pb-3 pr-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-muted"
            >
              Row
            </th>
            <th
              scope="col"
              className="border-b border-navy-700 pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-muted"
            >
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {propertyReportRows.map((row) => (
            <tr key={row.id}>
              <th
                scope="row"
                className="border-b border-navy-800 py-4 pr-4 font-heading text-sm font-semibold text-white"
              >
                {row.row}
              </th>
              <td className="border-b border-navy-800 py-4 text-sm font-medium text-teal-400">
                {row.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-5 text-[13px] leading-relaxed text-slate-muted">{propertyReportNote}</p>
    </div>
  );
}
