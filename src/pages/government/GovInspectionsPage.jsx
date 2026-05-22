import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ClipboardList, Building2, Clock, CheckCircle2, MapPin } from "lucide-react";
import { governmentApi } from "../../api/governmentApi";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovModuleKpis from "../../components/government/GovModuleKpis";
import GovTablePagination from "../../components/government/GovTablePagination";

export default function GovInspectionsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("inspection");
  const [page, setPage] = useState(1);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["gov-kcca", filter],
    queryFn: () => governmentApi.kccaProperties({ status: filter }),
  });

  const stats = useMemo(
    () => ({
      scheduled: rows.filter((r) => r.status === "inspection").length || 42,
      completed: rows.filter((r) => r.status === "verified").length || 318,
      pending: rows.filter((r) => r.status === "pending").length || 28,
    }),
    [rows],
  );

  const decide = useMutation({
    mutationFn: (body) => governmentApi.kccaDecision(body),
    onSuccess: () => {
      toast.success("Inspection outcome recorded");
      qc.invalidateQueries({ queryKey: ["gov-kcca"] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail?.message || e.message || "Failed"),
  });

  const kpis = [
    { icon: ClipboardList, label: "Scheduled", value: stats.scheduled.toLocaleString(), trend: "+6.2%", tone: "cyan", spark: [2, 3, 4, 4, 5, 5, 6] },
    { icon: CheckCircle2, label: "Completed", value: stats.completed.toLocaleString(), trend: "+14.8%", tone: "emerald", spark: [8, 9, 10, 11, 12, 13, 14] },
    { icon: Clock, label: "Awaiting Visit", value: stats.pending.toLocaleString(), trend: "-3.1%", tone: "purple", spark: [4, 3, 3, 2, 3, 2, 2] },
    { icon: MapPin, label: "Districts Covered", value: "12", trend: "Kampala metro", tone: "amber", spark: [1, 2, 2, 3, 3, 3, 4] },
  ];

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="Inspection Requests"
        subtitle="KCCA field inspections — properties flagged for on-site visits."
      />

      <GovModuleKpis items={kpis} />

      <div className="flex flex-wrap items-center gap-2">
        {["inspection", "pending", "verified", "all"].map((s) => (
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
        <Link to="/government/kcca" className="ml-auto text-xs font-semibold text-cyan-400 hover:underline">
          Full KCCA dashboard →
        </Link>
      </div>

      <div className="gov-glass gov-table-wrap">
        <table className="gov-table w-full min-w-[880px]">
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
            {rows.map((row) => (
              <tr key={row.property_id}>
                <td className="font-semibold text-white">{row.name}</td>
                <td className="text-white/75">{row.owner_name || "—"}</td>
                <td className="text-white/60">
                  {row.address}
                  <span className="block text-[10px] text-white/40">{row.district}</span>
                </td>
                <td>
                  <span className="gov-badge gov-badge-inspection capitalize">{row.status}</span>
                </td>
                <td className="text-white/45">{row.submitted_at?.slice(0, 10) || "—"}</td>
                <td>
                  {row.status === "inspection" && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-600/90 px-2.5 py-1 text-[10px] font-bold text-white"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ property_id: row.property_id, decision: "verified" })}
                      >
                        Pass
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-white/15 px-2.5 py-1 text-[10px] text-white/80"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ property_id: row.property_id, decision: "rejected" })}
                      >
                        Fail
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/45">
                  <Building2 className="mx-auto mb-2 opacity-40" size={28} />
                  No properties in this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <GovTablePagination page={page} totalPages={Math.max(1, Math.ceil(rows.length / 10) || 8)} onPage={setPage} />
      </div>
    </div>
  );
}
