import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { governmentApi } from "../../api/governmentApi";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovModuleKpis from "../../components/government/GovModuleKpis";
import GovTablePagination from "../../components/government/GovTablePagination";

function statusBadge(status) {
  const s = String(status || "pending").toLowerCase();
  if (s === "verified" || s === "approved") return "gov-badge gov-badge-verified";
  if (s === "rejected" || s === "illegal") return "gov-badge gov-badge-rejected";
  if (s === "inspection") return "gov-badge gov-badge-inspection";
  return "gov-badge gov-badge-pending";
}

export default function KccaDashboardPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["gov-kcca", filter],
    queryFn: () => governmentApi.kccaProperties({ status: filter === "all" ? undefined : filter }),
  });

  const stats = useMemo(() => ({
    total: rows.length,
    verified: rows.filter((r) => r.status === "verified").length,
    pending: rows.filter((r) => r.status === "pending").length,
    flagged: rows.filter((r) => r.status === "illegal" || r.status === "rejected").length,
  }), [rows]);

  const decide = useMutation({
    mutationFn: (body) => governmentApi.kccaDecision(body),
    onSuccess: () => {
      toast.success("KCCA property decision recorded");
      qc.invalidateQueries({ queryKey: ["gov-kcca"] });
      qc.invalidateQueries({ queryKey: ["gov-overview"] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail?.message || e.message || "Failed"),
  });

  const kpis = [
    { icon: Building2, label: "Total Properties", value: stats.total.toLocaleString(), trend: "+14.2%", tone: "cyan", spark: [8, 9, 10, 11, 12, 13, 14] },
    { icon: CheckCircle2, label: "Verified", value: stats.verified.toLocaleString(), trend: "+16.1%", tone: "emerald", spark: [5, 6, 7, 8, 9, 10, 11] },
    { icon: Clock, label: "Pending", value: stats.pending.toLocaleString(), trend: "-3.8%", tone: "purple", spark: [4, 4, 3, 4, 3, 3, 2] },
    { icon: AlertTriangle, label: "Flagged", value: stats.flagged.toLocaleString(), trend: "+5.4%", tone: "red", spark: [1, 2, 2, 3, 2, 3, 4] },
  ];

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="KCCA — Property Verification"
        subtitle="Validate listings, plot numbers, building compliance, and landlord licensing."
      />

      <GovModuleKpis items={kpis} />

      <div className="flex flex-wrap gap-2">
        {["pending", "verified", "inspection", "rejected", "illegal", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === s ? "bg-cyan-500/20 text-cyan-200" : "bg-white/5 text-white/55 hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="gov-glass gov-table-wrap">
        <table className="gov-table w-full min-w-[920px]">
          <thead>
            <tr>
              <th>Property / Plot</th>
              <th>Owner / Landlord</th>
              <th>Location</th>
              <th>Status</th>
              <th>Submitted On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.property_id}>
                <td className="font-medium text-white">{r.name}</td>
                <td className="text-white/75">{r.owner_name}</td>
                <td className="text-white/60">
                  {r.address}
                  <span className="block text-[10px] text-white/40">{r.district}</span>
                </td>
                <td>
                  <span className={statusBadge(r.status)}>{r.status}</span>
                </td>
                <td className="text-white/45">{r.submitted_at?.slice(0, 10) || "—"}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ property_id: r.property_id, decision: "verified" })}
                      className="rounded-lg bg-emerald-600/90 px-2 py-1 text-[10px] font-bold text-white"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ property_id: r.property_id, decision: "inspection" })}
                      className="rounded-lg bg-cyan-600/80 px-2 py-1 text-[10px] font-bold text-white"
                    >
                      Inspect
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <GovTablePagination page={page} totalPages={20} onPage={setPage} />
      </div>
    </div>
  );
}
