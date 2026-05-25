import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { leasesApi } from "../../api/leasesApi";
import { ErrorPanel, EmptyPanel, LoadingPanel } from "../../components/ui/StatePanel";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "terminated", label: "Terminated" },
  { value: "expired", label: "Expired" },
];

function fmtMoney(n) {
  const v = parseFloat(n || 0);
  if (Number.isNaN(v)) return "—";
  return `UGX ${v.toLocaleString()}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function statusClass(status) {
  if (status === "active") return "bg-emerald-500/15 text-emerald-400";
  if (status === "terminated" || status === "expired") return "bg-white/10 text-white/45";
  return "bg-amber-500/15 text-amber-300";
}

export default function LandlordContractsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data: leases = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["landlord-leases", status],
    queryFn: () => leasesApi.list(status !== "all" ? { status } : {}),
  });

  const terminateMut = useMutation({
    mutationFn: (id) =>
      leasesApi.terminate(id, {
        termination_date: new Date().toISOString().slice(0, 10),
        termination_reason: "Ended by landlord",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["landlord-leases"] });
      toast.success("Lease terminated");
    },
    onError: () => toast.error("Could not terminate lease"),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...leases];
    if (q) {
      list = list.filter(
        (l) =>
          (l.tenant_name || "").toLowerCase().includes(q) ||
          (l.property_name || "").toLowerCase().includes(q) ||
          (l.unit_number || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  }, [leases, search]);

  return (
    <AppPageScaffold
      variant="ledger"
      icon={FileText}
      title="Contracts"
      description={`${rows.length} lease${rows.length === 1 ? "" : "s"} — terms, status, and move-out actions`}
      actions={
        <Link to="/landlord/tenants" className="btn-primary inline-flex rounded-lg px-4 py-2 text-sm font-bold">
          View tenants
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
            placeholder="Search tenant, property, unit…"
            className="input-field w-full pl-9"
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
                  ? "border-brand-teal/40 bg-brand-teal/15 text-[#00C896]"
                  : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/20"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel title="Could not load contracts" onRetry={() => refetch()} />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={FileText}
          title="No leases yet"
          description="Create a lease when you onboard a tenant, or they will appear here after move-in."
          action={
            <Link to="/landlord/tenants/new" className="btn-primary inline-flex rounded-lg px-5 py-2 text-sm font-bold">
              Add tenant
            </Link>
          }
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/50">
                <th className="pb-3 pr-4 font-semibold">Tenant</th>
                <th className="pb-3 pr-4 font-semibold">Property / unit</th>
                <th className="pb-3 pr-4 font-semibold">Term</th>
                <th className="pb-3 pr-4 text-right font-semibold">Rent</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.04]">
                  <td className="py-3 pr-4">
                    {l.tenant_id ? (
                      <Link to={`/landlord/tenants/${l.tenant_id}`} className="font-semibold text-white hover:text-[#00C896]">
                        {l.tenant_name || `Tenant #${l.tenant_id}`}
                      </Link>
                    ) : (
                      <span className="font-semibold text-white">{l.tenant_name || "—"}</span>
                    )}
                    <div className="text-xs text-brand-mid">{l.tenant_phone || ""}</div>
                  </td>
                  <td className="py-3 pr-4 text-brand-mid">
                    {l.property_name || "—"}
                    {l.unit_number ? ` · ${l.unit_number}` : ""}
                  </td>
                  <td className="py-3 pr-4 text-xs text-white/55">
                    {fmtDate(l.start_date)} → {l.end_date ? fmtDate(l.end_date) : "Open"}
                  </td>
                  <td className="py-3 pr-4 text-right text-brand-dark">{fmtMoney(l.monthly_rent)}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(l.status)}`}>
                      {l.status || "—"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {l.status === "active" && (
                      <button
                        type="button"
                        className="text-xs font-bold text-red-400 hover:underline"
                        disabled={terminateMut.isPending}
                        onClick={() => {
                          if (window.confirm(`Terminate lease for ${l.tenant_name || "this tenant"}?`)) {
                            terminateMut.mutate(l.id);
                          }
                        }}
                      >
                        Terminate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-white/40">
        Blockchain-verified agreement hashes and e-signatures will appear here when those integrations are enabled.
      </p>
    </AppPageScaffold>
  );
}
