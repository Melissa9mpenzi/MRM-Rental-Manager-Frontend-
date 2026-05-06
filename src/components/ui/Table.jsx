export function Table({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto card p-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-brand-dark text-brand-teal">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={i % 2 === 0 ? 'bg-white' : 'bg-brand-bg'}>
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 text-brand-mid">
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

