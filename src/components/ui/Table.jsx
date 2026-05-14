export function Table({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto card p-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.06] text-[11px] font-semibold uppercase tracking-wide text-white/55">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={i % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent"}>
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 text-white/75">
                  {typeof c.cell === 'function' ? c.cell(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

