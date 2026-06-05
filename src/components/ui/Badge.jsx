const COLORS = {
  Paid: "bg-emerald-100 text-emerald-700",
  Arrears: "bg-amber-100 text-amber-700",
  Vacant: "bg-slate-100 text-slate-500",
  Maintenance: "bg-red-100 text-red-600",
};

export function Badge({ children }) {
  const cls = COLORS[String(children)] ?? "bg-indigo-50 text-indigo-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}
