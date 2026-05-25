import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { agentCrmApi } from "../../api/agentCrmApi";
import { ErrorPanel, EmptyPanel, LoadingPanel } from "../../components/ui/StatePanel";
import { LEAD_STAGES, fmtUgx, fmtDt } from "../../lib/agentCrmUtils";

const emptyForm = {
  full_name: "",
  phone: "",
  email: "",
  source: "inbound",
  stage: "new",
  listing_title: "",
  budget_ugx: "",
  notes: "",
};

export default function AgentLeadsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: leads = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["agent-leads", search, stageFilter],
    queryFn: () =>
      agentCrmApi.leads({
        ...(search.trim() ? { q: search.trim() } : {}),
        ...(stageFilter ? { stage: stageFilter } : {}),
      }),
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        full_name: form.full_name.trim(),
        budget_ugx: form.budget_ugx ? Number(form.budget_ugx) : undefined,
      };
      return editId
        ? agentCrmApi.updateLead(editId, payload)
        : agentCrmApi.createLead(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-leads"] });
      qc.invalidateQueries({ queryKey: ["workspace-staff-summary"] });
      toast.success(editId ? "Lead updated" : "Lead added");
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: () => toast.error("Could not save lead"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => agentCrmApi.deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-leads"] });
      qc.invalidateQueries({ queryKey: ["workspace-staff-summary"] });
      toast.success("Lead removed");
    },
    onError: () => toast.error("Could not delete lead"),
  });

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      full_name: row.full_name || "",
      phone: row.phone || "",
      email: row.email || "",
      source: row.source || "inbound",
      stage: row.stage || "new",
      listing_title: row.listing_title || "",
      budget_ugx: row.budget_ugx ? String(row.budget_ugx) : "",
      notes: row.notes || "",
    });
    setShowForm(true);
  };

  return (
    <AppPageScaffold
      variant="registry"
      title="Leads"
      description="Capture inbound enquiries, assign stages, and convert prospects into viewings."
      actions={
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold"
          onClick={() => {
            setEditId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Plus size={16} /> Add lead
        </button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, listing…"
            className="input-field w-full pl-9"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="input-field w-full sm:w-44"
        >
          <option value="">All stages</option>
          {LEAD_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="card-glass mb-4 grid gap-3 border border-[#00C896]/25 p-4 sm:grid-cols-2">
          <input
            className="input-field sm:col-span-2"
            placeholder="Full name *"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Listing / property interest"
            value={form.listing_title}
            onChange={(e) => setForm((f) => ({ ...f, listing_title: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Budget UGX"
            type="number"
            value={form.budget_ugx}
            onChange={(e) => setForm((f) => ({ ...f, budget_ugx: e.target.value }))}
          />
          <select
            className="input-field"
            value={form.stage}
            onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
          >
            {LEAD_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            className="input-field"
            placeholder="Source (inbound, referral…)"
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          />
          <textarea
            className="input-field sm:col-span-2"
            rows={2}
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="button"
              className="btn-primary rounded-lg px-4 py-2 text-sm font-bold"
              disabled={saveMut.isPending}
              onClick={() => saveMut.mutate()}
            >
              {saveMut.isPending ? "Saving…" : editId ? "Update" : "Save lead"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white/70"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel title="Could not load leads" onRetry={() => refetch()} />
      ) : leads.length === 0 ? (
        <EmptyPanel title="No leads yet" description="Add your first prospect or import from Rental Hub messages." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/45">
                <th className="pb-3 pr-3 font-semibold">Contact</th>
                <th className="pb-3 pr-3 font-semibold">Listing</th>
                <th className="pb-3 pr-3 font-semibold">Stage</th>
                <th className="pb-3 pr-3 text-right font-semibold">Budget</th>
                <th className="pb-3 pr-3 font-semibold">Updated</th>
                <th className="pb-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {leads.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.03]">
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-white">{row.full_name}</div>
                    <div className="text-xs text-white/45">{row.phone || row.email || "—"}</div>
                  </td>
                  <td className="py-3 pr-3 text-white/65">{row.listing_title || "—"}</td>
                  <td className="py-3 pr-3">
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-200">
                      {row.stage_label || row.stage}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right font-medium text-[#00C896]">
                    {row.budget_ugx ? fmtUgx(row.budget_ugx) : "—"}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/45">{fmtDt(row.updated_at)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                        onClick={() => openEdit(row)}
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-red-400/80 hover:bg-red-500/10"
                        onClick={() => {
                          if (window.confirm("Delete this lead?")) deleteMut.mutate(row.id);
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
