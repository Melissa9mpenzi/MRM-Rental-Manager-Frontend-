import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, Plus, Search, ChevronRight, Phone, Home } from "lucide-react";
import { tenantsApi } from "../../api/tenantsApi";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/index.jsx";
import ArrearsBadge from "../../components/domain/ArrearsBadge";
import AddTenantModal from "../../components/domain/AddTenantModal";

const STATUS_OPTIONS = ["all","active","inactive","evicted"];

export default function TenantsPage() {
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("active");
  const [addOpen,  setAddOpen]  = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants", debouncedSearch, status],
    queryFn: () => tenantsApi.list({
      search: debouncedSearch,
      status: status === "all" ? "" : status,
    }),
  });

  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(window._st);
    window._st = setTimeout(() => setDebouncedSearch(v), 400);
  };

  const tenantsInArrears = tenants.filter(t => t.balance_due > 0).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">Tenants</h2>
          <p className="text-brand-mid text-sm mt-0.5">
            {tenants.length} tenant{tenants.length !== 1 ? "s" : ""}
            {tenantsInArrears > 0 && (
              <span className="text-red-500 ml-2 font-semibold">· {tenantsInArrears} in arrears</span>
            )}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus size={16}/> Add Tenant</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
          <input
            className="input-field pl-9"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors
                ${status === s ? "bg-brand-teal text-white" : "bg-white text-brand-mid border border-brand-tealLt hover:border-brand-teal hover:text-brand-teal"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_,i) => <div key={i} className="card h-20 animate-pulse bg-brand-tealLt/30" />)}
        </div>
      ) : tenants.length === 0 ? (
        <div className="card">
          <EmptyState icon={Users} title="No tenants found"
            description="Add your first tenant to start tracking rent and payments."
            action={<Button onClick={() => setAddOpen(true)}><Plus size={16}/> Add Tenant</Button>} />
        </div>
      ) : (
        <div className="space-y-2">
          {tenants.map(t => (
            <Link key={t.id} to={`/tenants/${t.id}`}
              className="card flex items-center gap-4 hover:border-brand-teal hover:shadow-md transition-all group p-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {t.full_name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-brand-dark">{t.full_name}</span>
                  <ArrearsBadge months={t.months_in_arrears} balance={t.balance_due} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                    ${t.status === "active" ? "bg-emerald-100 text-emerald-700"
                    : t.status === "inactive" ? "bg-gray-100 text-gray-600"
                    : "bg-red-100 text-red-700"}`}>
                    {t.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-brand-mid flex-wrap">
                  <span className="flex items-center gap-1"><Phone size={11}/>{t.phone}</span>
                  {t.property_name && <span className="flex items-center gap-1"><Home size={11}/>{t.property_name} · {t.unit_number}</span>}
                  <span>UGX {parseFloat(t.monthly_rent).toLocaleString()}/mo</span>
                </div>
              </div>
              {/* Balance */}
              <div className="text-right flex-shrink-0">
                {t.balance_due > 0 ? (
                  <>
                    <div className="text-sm font-bold text-red-600">
                      UGX {parseFloat(t.balance_due).toLocaleString()}
                    </div>
                    <div className="text-xs text-red-400">due</div>
                  </>
                ) : (
                  <div className="text-sm font-bold text-emerald-600">Paid up</div>
                )}
              </div>
              <ChevronRight size={16} className="text-brand-mid group-hover:text-brand-teal flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}

      <AddTenantModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}