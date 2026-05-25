import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, ShieldOff } from "lucide-react";
import toast from "react-hot-toast";
import { governmentApi } from "../../api/governmentApi";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovWorkflowBanner from "../../components/government/GovWorkflowBanner";
import { apiErrorMessage } from "../../lib/apiError";

export default function GovBlacklistPage() {
  const qc = useQueryClient();
  const [reason, setReason] = useState("");
  const [targetId, setTargetId] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["gov-nira-blacklist"],
    queryFn: () => governmentApi.niraBlacklist(),
  });

  const suspend = useMutation({
    mutationFn: (body) => governmentApi.niraSuspend(body),
    onSuccess: () => {
      toast.success("Account suspended");
      setReason("");
      setTargetId("");
      qc.invalidateQueries({ queryKey: ["gov-nira-blacklist"] });
      qc.invalidateQueries({ queryKey: ["gov-nira"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not suspend account")),
  });

  const unsuspend = useMutation({
    mutationFn: (userId) => governmentApi.niraUnsuspend(userId),
    onSuccess: () => {
      toast.success("Suspension lifted");
      qc.invalidateQueries({ queryKey: ["gov-nira-blacklist"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not lift suspension")),
  });

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="NIRA — Blacklist & suspensions"
        subtitle="Suspend fraudsters, fake landlords, and scammers. NIRA officers cannot access payments or system configuration."
      />
      <GovWorkflowBanner highlightAgency="nira" />

      <form
        className="gov-glass grid gap-3 p-4 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          const id = Number(targetId);
          if (!id) {
            toast.error("Enter a user ID from the KYC queue");
            return;
          }
          suspend.mutate({ user_id: id, reason: reason || undefined });
        }}
      >
        <label className="text-xs font-semibold text-white/70">
          User ID
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="From KYC queue"
          />
        </label>
        <label className="md:col-span-2 text-xs font-semibold text-white/70">
          Reason
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Fake ID, duplicate account, identity theft…"
          />
        </label>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={suspend.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600/90 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
          >
            <Ban size={16} />
            Suspend account
          </button>
        </div>
      </form>

      <div className="gov-glass overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
          Blacklist & rejected identities
        </div>
        {isLoading ? (
          <p className="p-4 text-sm text-white/45">Loading…</p>
        ) : (
          <table className="gov-table w-full text-left text-sm">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>KYC</th>
                <th>Reason</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className="border-t border-white/5">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{r.full_name}</div>
                    <div className="text-xs text-white/45">{r.email}</div>
                  </td>
                  <td className="px-3 py-2 capitalize text-white/70">{r.role}</td>
                  <td className="px-3 py-2 text-white/60">{r.kyc_review_status}</td>
                  <td className="max-w-xs truncate px-3 py-2 text-white/55">{r.reason}</td>
                  <td className="px-3 py-2">
                    {r.gov_suspended ? (
                      <button
                        type="button"
                        disabled={unsuspend.isPending}
                        onClick={() => unsuspend.mutate(r.user_id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1 text-[10px] font-bold text-white/80"
                      >
                        <ShieldOff size={12} />
                        Lift suspension
                      </button>
                    ) : (
                      <span className="text-xs text-amber-300">KYC rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && rows.length === 0 && (
          <p className="p-4 text-sm text-white/45">No suspended or rejected accounts.</p>
        )}
      </div>
    </div>
  );
}
