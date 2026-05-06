export default function ArrearsBadge({ months, balance }) {
  if (!balance || balance <= 0) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
      Paid up
    </span>
  );
  const color = months >= 3 ? "bg-red-100 text-red-700" : months >= 1 ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {months >= 1 ? `${months}mo arrears` : "Partial"}
    </span>
  );
}