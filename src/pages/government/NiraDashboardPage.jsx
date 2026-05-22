import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { governmentApi } from "../../api/governmentApi";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovModuleKpis from "../../components/government/GovModuleKpis";
import GovTablePagination from "../../components/government/GovTablePagination";

function badgeClass(status) {
  if (status === "approved") return "gov-badge gov-badge-verified";
  if (status === "rejected") return "gov-badge gov-badge-rejected";
  return "gov-badge gov-badge-pending";
}

export default function NiraDashboardPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["gov-nira", filter],
    queryFn: () => governmentApi.niraQueue({ status: filter === "all" ? undefined : filter }),
  });

  const stats = useMemo(() => {
    const verified = rows.filter((r) => r.verification_status === "approved").length;
    const pending = rows.filter((r) => r.verification_status === "pending").length;
    const rejected = rows.filter((r) => r.verification_status === "rejected").length;
    return { total: rows.length, verified, pending, rejected };
  }, [rows]);

  const decide = useMutation({
    mutationFn: (body) => governmentApi.niraDecision(body),
    onSuccess: () => {
      toast.success("NIRA decision recorded");
      qc.invalidateQueries({ queryKey: ["gov-nira"] });
      qc.invalidateQueries({ queryKey: ["gov-overview"] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail?.message || e.message || "Failed"),
  });

  const kpis = [
    { icon: Users, label: "Total Verifications", value: stats.total.toLocaleString(), trend: "+8.4%", tone: "emerald", spark: [4, 6, 5, 8, 7, 9, 10] },
    { icon: CheckCircle2, label: "Verified", value: stats.verified.toLocaleString(), trend: "+11.2%", tone: "cyan", spark: [3, 5, 6, 7, 8, 9, 10] },
    { icon: Clock, label: "Pending", value: stats.pending.toLocaleString(), trend: "-4.1%", tone: "purple", spark: [6, 5, 4, 5, 4, 3, 3] },
    { icon: XCircle, label: "Rejected", value: stats.rejected.toLocaleString(), trend: "+2.0%", tone: "red", spark: [1, 2, 1, 2, 2, 3, 2] },
  ];

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="NIRA — Identity Verification"
        subtitle="Verify tenants, landlords, and agents. National ID workflow with face-match scoring."
      />

      <GovModuleKpis items={kpis} />

      <div className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === s ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/55 hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="gov-glass gov-table-wrap">
        <table className="gov-table w-full min-w-[880px]">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>NIN</th>
              <th>Verification Status</th>
              <th>Face Match %</th>
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
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/45">
                  No records in this queue.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.user_id}>
                <td className="font-medium text-white">{r.full_name}</td>
                <td className="font-mono text-xs text-white/70">{r.nin || "—"}</td>
                <td>
                  <span className={badgeClass(r.verification_status)}>{r.verification_status}</span>
                </td>
                <td className="text-white/80">{r.face_match_pct ?? "—"}%</td>
                <td className="text-white/45">{r.submitted_at?.slice(0, 10) || "—"}</td>
                <td>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ user_id: r.user_id, decision: "approved" })}
                      className="rounded-lg bg-emerald-600/90 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-600"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ user_id: r.user_id, decision: "rejected" })}
                      className="rounded-lg bg-red-600/90 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <GovTablePagination page={page} totalPages={Math.max(1, Math.ceil((rows.length || 1) / 10))} onPage={setPage} />
      </div>
    </div>
  );
}
