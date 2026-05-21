import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { governmentApi } from "../../api/governmentApi";

export default function KccaDashboardPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["gov-kcca", filter],
    queryFn: () => governmentApi.kccaProperties({ status: filter === "all" ? undefined : filter }),
  });

  const decide = useMutation({
    mutationFn: (body) => governmentApi.kccaDecision(body),
    onSuccess: () => {
      toast.success("KCCA property decision recorded");
      qc.invalidateQueries({ queryKey: ["gov-kcca"] });
      qc.invalidateQueries({ queryKey: ["gov-overview"] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail?.message || e.message || "Failed"),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">KCCA — Property Verification</h2>
        <p className="text-sm text-white/50">Validate listings, plot numbers, building compliance, and landlord licensing.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["pending", "verified", "inspection", "rejected", "illegal", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === s ? "bg-cyan-500/20 text-cyan-200" : "bg-white/5 text-white/55"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="gov-glass overflow-x-auto">
        <table className="gov-table w-full min-w-[800px]">
          <thead>
            <tr>
              <th>Property</th>
              <th>Location</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.property_id}>
                <td className="font-medium text-white">{r.name}</td>
                <td className="text-white/60">
                  {r.address}
                  <br />
                  <span className="text-[10px] text-white/40">{r.district}</span>
                </td>
                <td className="text-white/70">{r.owner_name}</td>
                <td>
                  <span className="gov-badge gov-badge-pending capitalize">{r.status}</span>
                </td>
                <td>{r.is_published ? "Yes" : "No"}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => decide.mutate({ property_id: r.property_id, decision: "verified" })}
                      className="rounded bg-emerald-600/80 px-2 py-1 text-[10px] font-bold text-white"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => decide.mutate({ property_id: r.property_id, decision: "inspection" })}
                      className="rounded bg-amber-600/80 px-2 py-1 text-[10px] font-bold text-white"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => decide.mutate({ property_id: r.property_id, decision: "rejected" })}
                      className="rounded bg-red-600/80 px-2 py-1 text-[10px] font-bold text-white"
                    >
                      Block
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
