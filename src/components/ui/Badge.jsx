const COLORS = {
  Paid: 'bg-brand-teal text-white',
  Arrears: 'bg-amber-500 text-white',
  Vacant: 'bg-gray-500 text-white',
  Maintenance: 'bg-red-600 text-white',
}

export function Badge({ children }) {
  const cls = COLORS[String(children)] ?? 'bg-brand-tealLt text-brand-dark'
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${cls}`}>{children}</span>
}

