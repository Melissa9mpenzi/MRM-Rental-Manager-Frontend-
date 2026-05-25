import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { agentCrmApi } from "../../api/agentCrmApi";
import { ErrorPanel, EmptyPanel, LoadingPanel } from "../../components/ui/StatePanel";
import { COMMISSION_STATUSES, fmtUgx, fmtDt } from "../../lib/agentCrmUtils";

export default function AgentCommissionsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount_ugx: "", description: "", status: "accrued" });

  const { data: rows = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["agent-commissions"],
    queryFn: () => agentCrmApi.commissions(),
  });

  const totals = rows.reduce(
    (acc, r) => {
      const a = Number(r.amount_ugx || 0);
      if (r.status === "paid") acc.paid += a;
      else if (r.status === "held") acc.held += a;
      else acc.accrued += a;
      return acc;
    },
    { paid: 0, held: 0, accrued: 0 }
  );

  const saveMut = useMutation({
    mutationFn: () =>
      agentCrmApi.createCommission({
        amount_ugx: Number(form.amount_ugx),
        description: form.description || undefined,
        status: form.status,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-commissions"] });
      qc.invalidateQueries({ queryKey: ["workspace-staff-summary"] });
      toast.success("Commission recorded");
      setShowForm(false);
    },
    onError: () => toast.error("Could not save"),
  });

  const markPaid = useMutation({
    mutationFn: (id) => agentCrmApi.updateCommission(id, { status: "paid" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-commissions"] });
      toast.success("Marked paid");
    },
  });

  return (
    <AppPageScaffold
      icon={Wallet}
      title="Commissions"
      description="Accrued fees, paid batches, and payout holds."
      actions={
        <button type="button" className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Record
        </button>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Accrued", v: totals.accrued, c: "text-amber-200" },
          { label: "On hold", v: totals.held, c: "text-violet-200" },
          { label: "Paid", v: totals.paid, c: "text-[#00C896]" },
        ].map(({ label, v, c }) => (
          <div key={label} className="card-glass p-4 text-center">
            <div className="text-xs font-bold uppercase text-white/40">{label}</div>
            <div className={`mt-1 text-lg font-extrabold ${c}`}>{fmtUgx(v)}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card-glass mb-4 grid gap-3 p-4 sm:grid-cols-2">
          <input className="input-field" type="number" placeholder="Amount UGX *" value={form.amount_ugx} onChange={(e) => setForm((f) => ({ ...f, amount_ugx: e.target.value }))} />
          <select className="input-field" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            {COMMISSION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input className="input-field sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <button type="button" className="btn-primary rounded-lg px-4 py-2 text-sm font-bold sm:col-span-2" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>Save</button>
        </div>
      )}

      {isLoading ? <LoadingPanel /> : isError ? <ErrorPanel title="Could not load commissions" onRetry={refetch} /> : rows.length === 0 ? (
        <EmptyPanel title="No commissions" description="Win a deal or record a fee manually." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/45">
                <th className="pb-2 pr-2">Description</th>
                <th className="pb-2 pr-2 text-right">Amount</th>
                <th className="pb-2 pr-2">Status</th>
                <th className="pb-2">Date</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 pr-2 text-white">{r.description || `Commission #${r.id}`}</td>
                  <td className="py-2 pr-2 text-right font-bold text-[#00C896]">{fmtUgx(r.amount_ugx)}</td>
                  <td className="py-2 pr-2 capitalize text-white/60">{r.status}</td>
                  <td className="py-2 pr-2 text-xs text-white/45">{fmtDt(r.created_at)}</td>
                  <td className="py-2">
                    {r.status !== "paid" && (
                      <button type="button" className="text-xs font-bold text-[#00C896] hover:underline" onClick={() => markPaid.mutate(r.id)}>
                        Mark paid
                      </button>
                    )}
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
