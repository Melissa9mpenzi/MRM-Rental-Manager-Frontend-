import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { agentCrmApi } from "../../api/agentCrmApi";
import { ErrorPanel, EmptyPanel, LoadingPanel } from "../../components/ui/StatePanel";
import { CLIENT_TYPES, fmtDt } from "../../lib/agentCrmUtils";

const emptyForm = { full_name: "", phone: "", email: "", client_type: "renter", notes: "", follow_up_at: "" };

export default function AgentClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data: clients = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["agent-clients", search],
    queryFn: () => agentCrmApi.clients(search.trim() ? { q: search.trim() } : {}),
  });

  const saveMut = useMutation({
    mutationFn: () =>
      agentCrmApi.createClient({
        ...form,
        full_name: form.full_name.trim(),
        follow_up_at: form.follow_up_at ? new Date(form.follow_up_at).toISOString() : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-clients"] });
      toast.success("Client added");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Could not save client"),
  });

  return (
    <AppPageScaffold
      title="Clients"
      description="CRM-style roster of buyers and renters you represent, with notes and follow-up tasks."
      actions={
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} /> Add client
        </button>
      }
    >
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="input-field w-full pl-9"
        />
      </div>

      {showForm && (
        <div className="card-glass mb-4 grid gap-3 p-4 sm:grid-cols-2">
          <input
            className="input-field sm:col-span-2"
            placeholder="Full name *"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <input className="input-field" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <select className="input-field" value={form.client_type} onChange={(e) => setForm((f) => ({ ...f, client_type: e.target.value }))}>
            {CLIENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="input-field"
            value={form.follow_up_at}
            onChange={(e) => setForm((f) => ({ ...f, follow_up_at: e.target.value }))}
          />
          <textarea className="input-field sm:col-span-2" rows={2} placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-2 sm:col-span-2">
            <button type="button" className="btn-primary rounded-lg px-4 py-2 text-sm font-bold" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              Save
            </button>
            <button type="button" className="rounded-lg border border-white/15 px-4 py-2 text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <LoadingPanel /> : isError ? <ErrorPanel title="Could not load clients" onRetry={refetch} /> : clients.length === 0 ? (
        <EmptyPanel title="No clients" description="Add renters or buyers you are representing." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <div key={c.id} className="card-glass border border-white/[0.08] p-4">
              <div className="font-bold text-white">{c.full_name}</div>
              <div className="mt-1 text-xs capitalize text-violet-300">{c.client_type}</div>
              <div className="mt-2 text-sm text-white/55">{c.phone || c.email || "—"}</div>
              {c.follow_up_at && (
                <div className="mt-2 text-xs text-amber-200/90">Follow-up: {fmtDt(c.follow_up_at)}</div>
              )}
              {c.notes && <p className="mt-2 text-xs text-white/45 line-clamp-3">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </AppPageScaffold>
  );
}
