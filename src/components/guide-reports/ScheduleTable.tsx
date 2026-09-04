import type { ScheduleRow } from "@/data/guide-reports";

export function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-card-2 text-right">
            <th className="w-10 px-3 py-2.5 text-[11px] font-extrabold text-txt-dim">
              #
            </th>
            <th className="w-[140px] px-3 py-2.5 text-[11px] font-extrabold text-txt-dim">
              לוח זמנים
            </th>
            <th className="px-3 py-2.5 text-[11px] font-extrabold text-txt-dim">
              פירוט המסלול ואופי הפעילות
            </th>
            <th className="w-[28%] px-3 py-2.5 text-[11px] font-extrabold text-txt-dim">
              תיאומים ומנהלות
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.n}
              className="border-b border-line last:border-0 even:bg-card/60"
            >
              <td className="px-3 py-3 align-top">
                <span className="num text-[12px] font-bold text-txt-dim">
                  {row.n}
                </span>
              </td>
              <td className="px-3 py-3 align-top">
                <span className="num text-[12.5px] font-extrabold text-txt">
                  {row.time}
                </span>
              </td>
              <td className="px-3 py-3 align-top text-[12.5px] leading-relaxed">
                {row.activity}
              </td>
              <td className="px-3 py-3 align-top text-[12.5px] leading-relaxed text-txt-dim">
                {row.logistics || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
