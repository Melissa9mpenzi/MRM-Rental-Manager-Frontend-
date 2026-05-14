import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, Plus, Search } from "lucide-react";
import { tenantsApi } from "../../api/tenantsApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import ArrearsBadge from "../../components/domain/ArrearsBadge";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function fmtMoney(n) {
  const v = parseFloat(n || 0);
  if (Number.isNaN(v)) return "—";
  return `UGX ${v.toLocaleString()}`;
}

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data: tenants = [], isLoading, isError } = useQuery({
    queryKey: ["tenants", search, status],
    queryFn: () =>
      tenantsApi.list({
        ...(status !== "all" ? { status } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      }),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...tenants];
    if (q) {
      list = list.filter(
        (t) =>
          (t.full_name || "").toLowerCase().includes(q) ||
          (t.phone || "").includes(q) ||
          (t.email || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => String(a.full_name).localeCompare(String(b.full_name)));
  }, [tenants, search]);

  return (
    <AppPageScaffold
      variant="ledger"
      icon={Users}
      title="Tenants"
      description={`${rows.length} record${rows.length === 1 ? "" : "s"} · search, filter, open a profile`}
      actions={
        <Link
          to="/landlord/tenants/new"
          className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold shadow-md"
        >
          <Plus size={16} /> Add tenant
        </Link>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-mid" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email…"
            className="input w-full pl-9"
            aria-label="Search tenants"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setStatus(o.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                status === o.value
                  ? "border-brand-teal bg-brand-teal/15 text-brand-dark"
                  : "border-brand-tealLt bg-white/60 text-brand-mid hover:border-brand-teal/50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="card h-40 animate-pulse bg-brand-tealLt/30" />
      ) : isError ? (
        <div className="card py-14 text-center">
          <h3 className="font-bold text-brand-dark">Could not load tenants</h3>
          <p className="mt-1 text-sm text-brand-mid">Check your connection and that the API is running, then try again.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card py-14 text-center">
          <Users className="mx-auto mb-2 h-10 w-10 text-brand-mid opacity-60" />
          <h3 className="font-bold text-brand-dark">No tenants match</h3>
          <p className="mt-1 text-sm text-brand-mid">Try another search or add your first tenant.</p>
          <Link to="/landlord/tenants/new" className="btn-primary mt-4 inline-block rounded-lg px-5 py-2 text-sm font-bold">
            Add tenant
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-brand-tealLt text-left text-xs text-brand-mid">
                <th className="pb-3 pr-4 font-semibold">Tenant</th>
                <th className="pb-3 pr-4 font-semibold">Property / unit</th>
                <th className="pb-3 pr-4 text-right font-semibold">Rent</th>
                <th className="pb-3 pr-4 text-right font-semibold">Balance</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-tealLt/60">
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-brand-tealLt/20">
                  <td className="py-3 pr-4">
                    <Link
                      to={`/landlord/tenants/${t.id}`}
                      className="font-semibold text-brand-dark hover:text-brand-teal"
                    >
                      {t.full_name}
                    </Link>
                    <div className="text-xs text-brand-mid">{t.phone || "—"}</div>
                  </td>
                  <td className="py-3 pr-4 text-brand-mid">
                    {t.property_name || "—"}
                    {t.unit_number ? ` · ${t.unit_number}` : ""}
                  </td>
                  <td className="py-3 pr-4 text-right text-brand-dark">{fmtMoney(t.monthly_rent)}</td>
                  <td className="py-3 pr-4 text-right font-medium text-brand-dark">
                    {parseFloat(t.balance_due || 0) > 0 ? (
                      <span className="text-red-500">{fmtMoney(t.balance_due)}</span>
                    ) : (
                      <span className="text-emerald-600">Paid up</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          t.status === "active"
                            ? "bg-emerald-500/15 text-emerald-700"
                            : "bg-slate-400/15 text-brand-mid"
                        }`}
                      >
                        {t.status || "—"}
                      </span>
                      {parseFloat(t.balance_due || 0) > 0 && (
                        <ArrearsBadge months={t.months_in_arrears} balance={t.balance_due} />
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppPageScaffold>
  );
}
