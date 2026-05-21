import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { governmentApi } from "../../api/governmentApi";

function badgeClass(status) {
  if (status === "approved") return "gov-badge gov-badge-verified";
  if (status === "rejected") return "gov-badge gov-badge-rejected";
  return "gov-badge gov-badge-pending";
}

export default function NiraDashboardPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["gov-nira", filter],
    queryFn: () => governmentApi.niraQueue({ status: filter === "all" ? undefined : filter }),
  });

  const decide = useMutation({
    mutationFn: (body) => governmentApi.niraDecision(body),
    onSuccess: () => {
      toast.success("NIRA decision recorded");
      qc.invalidateQueries({ queryKey: ["gov-nira"] });
      qc.invalidateQueries({ queryKey: ["gov-overview"] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail?.message || e.message || "Failed"),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">NIRA — Identity Verification</h2>
        <p className="text-sm text-white/50">
          Verify tenants, landlords, and agents using national ID workflow. Decisions sync to platform KYC.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === s ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/55 hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="gov-glass overflow-x-auto">
        <table className="gov-table w-full min-w-[720px]">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>NIN</th>
              <th>Role</th>
              <th>Status</th>
              <th>Face Match</th>
              <th>Fraud Risk</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-white/45">
                  No records in this queue.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.user_id}>
                <td className="font-medium text-white">{r.full_name}</td>
                <td className="text-white/70">{r.nin}</td>
                <td className="capitalize text-white/60">{r.role}</td>
                <td>
                  <span className={badgeClass(r.verification_status)}>{r.verification_status}</span>
                </td>
                <td>{r.face_match_pct}%</td>
                <td>
                  <span className={r.fraud_risk === "high" ? "gov-badge gov-badge-high" : "gov-badge gov-badge-pending"}>
                    {r.fraud_risk}
                  </span>
                </td>
                <td className="text-white/45">{r.submitted_at?.slice(0, 10) || "—"}</td>
                <td>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ user_id: r.user_id, decision: "approved" })}
                      className="rounded bg-emerald-600/80 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-600"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ user_id: r.user_id, decision: "rejected" })}
                      className="rounded bg-red-600/80 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
