export function Table({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto card p-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2.5 text-left">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={`transition-colors hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2.5 text-gray-700">
                  {typeof c.cell === "function" ? c.cell(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
