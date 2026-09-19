import { propertyReportNote, propertyReportRows } from "@/content/platform";

/** Property report card. Every row names the publisher it came from. */
export function PropertyReport() {
  return (
    <div className="panel p-5 sm:p-6">
      <p className="eyebrow text-teal-600">Property report</p>
      <p className="heading-tight mt-2 text-xl font-bold text-ink">3-bed terrace · M14</p>

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr>
            <th
              scope="col"
              className="border-b border-rule pb-3 pr-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
            >
              Row
            </th>
            <th
              scope="col"
              className="border-b border-rule pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
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
                className="border-b border-rule py-4 pr-4 font-heading text-sm font-semibold text-ink"
              >
                {row.row}
              </th>
              <td className="border-b border-rule py-4 text-sm font-medium text-teal-600">
                {row.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-5 text-[13px] max-lg:text-[15px] leading-relaxed text-ink-muted">
        {propertyReportNote}
      </p>
    </div>
  );
}
