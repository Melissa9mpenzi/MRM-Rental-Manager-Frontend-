import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { agentCrmApi } from "../../api/agentCrmApi";
import { ErrorPanel, EmptyPanel, LoadingPanel } from "../../components/ui/StatePanel";
import { DEAL_STATUSES, fmtUgx } from "../../lib/agentCrmUtils";

export default function AgentDealsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", offer_amount_ugx: "", commission_ugx: "", notes: "" });

  const { data: deals = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["agent-deals", statusFilter],
    queryFn: () => agentCrmApi.deals(statusFilter ? { status: statusFilter } : {}),
  });

  const saveMut = useMutation({
    mutationFn: () =>
      agentCrmApi.createDeal({
        title: form.title.trim(),
        offer_amount_ugx: form.offer_amount_ugx ? Number(form.offer_amount_ugx) : undefined,
        commission_ugx: form.commission_ugx ? Number(form.commission_ugx) : undefined,
        notes: form.notes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-deals"] });
      qc.invalidateQueries({ queryKey: ["workspace-staff-summary"] });
      toast.success("Deal created");
      setShowForm(false);
    },
    onError: () => toast.error("Could not save deal"),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => agentCrmApi.updateDeal(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-deals"] });
      qc.invalidateQueries({ queryKey: ["agent-commissions"] });
      toast.success("Deal updated");
    },
  });

  return (
    <AppPageScaffold
      title="Deals"
      description="Pipeline of offers, negotiations, and closed commissions."
      actions={
        <button type="button" className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New deal
        </button>
      }
    >
      <select className="input-field mb-4 w-full max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All statuses</option>
        {DEAL_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {showForm && (
        <div className="card-glass mb-4 grid gap-3 p-4 sm:grid-cols-2">
          <input className="input-field sm:col-span-2" placeholder="Deal title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <input className="input-field" type="number" placeholder="Offer UGX" value={form.offer_amount_ugx} onChange={(e) => setForm((f) => ({ ...f, offer_amount_ugx: e.target.value }))} />
          <input className="input-field" type="number" placeholder="Commission UGX" value={form.commission_ugx} onChange={(e) => setForm((f) => ({ ...f, commission_ugx: e.target.value }))} />
          <div className="flex gap-2 sm:col-span-2">
            <button type="button" className="btn-primary rounded-lg px-4 py-2 text-sm font-bold" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>Save</button>
            <button type="button" className="rounded-lg border border-white/15 px-4 py-2 text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <LoadingPanel /> : isError ? <ErrorPanel title="Could not load deals" onRetry={refetch} /> : deals.length === 0 ? (
        <EmptyPanel title="No deals" description="Create a deal when you start negotiating with a lead." />
      ) : (
        <div className="space-y-2">
          {deals.map((d) => (
            <div key={d.id} className="card-glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-bold text-white">{d.title}</div>
                <div className="mt-1 text-sm text-white/55">
                  {d.offer_amount_ugx ? fmtUgx(d.offer_amount_ugx) : "—"} offer
                  {d.commission_ugx ? ` · ${fmtUgx(d.commission_ugx)} commission` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase">{d.status}</span>
                {d.status === "open" && (
                  <button
                    type="button"
                    className="rounded-lg bg-[#00C896]/20 px-3 py-1 text-xs font-bold text-[#00C896]"
                    onClick={() => statusMut.mutate({ id: d.id, status: "won" })}
                  >
                    Mark won
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppPageScaffold>
  );
}
