import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { tenantsApi } from "../../api/tenantsApi";

export default function MoveOutModal({ tenant, onClose }) {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: () => tenantsApi.moveOut(tenant.id),
    onSuccess: () => {
      toast.success(`${tenant.full_name} has been moved out.`);
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["tenant", tenant.id] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Move-out failed."),
  });

  const canConfirm = confirm.trim().toLowerCase() === "move out";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md animate-fade-in rounded-3xl border border-white/12 bg-rd-elevated/95 p-6 shadow-modal backdrop-blur-2xl">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
          <AlertTriangle size={28} className="text-amber-300" />
        </div>

        <h2 className="mb-1 text-center text-xl font-bold text-white">Confirm move-out</h2>
        <p className="mb-6 text-center text-sm text-white/65">
          You are about to move out{" "}
          <strong className="text-white">{tenant.full_name}</strong> from their unit.
          Their status will be set to <em>inactive</em> and their unit will be marked as vacant.
        </p>

        {/* Warning boxes */}
        <div className="mb-5 space-y-1 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-100/95">
          <p>• Payment history will be preserved</p>
          <p>• Any outstanding balance must be settled separately</p>
          <p>• This action can be reversed by re-activating the tenant</p>
        </div>

        {/* Type to confirm */}
        <div className="mb-5">
          <label className="input-label text-xs">
            Type <strong>move out</strong> to confirm
          </label>
          <input
            className="input-field"
            placeholder="move out"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="btn-outline flex-1"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => mutation.mutate()}
            disabled={!canConfirm || mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <LogOut size={15} />
            )}
            Move Out
          </button>
        </div>
      </div>
    </div>
  );
}
