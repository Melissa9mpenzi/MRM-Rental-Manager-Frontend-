import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { agentCrmApi } from "../../api/agentCrmApi";
import { ErrorPanel, EmptyPanel, LoadingPanel } from "../../components/ui/StatePanel";
import { EVENT_TYPES, fmtDt } from "../../lib/agentCrmUtils";

function defaultStart() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
}

export default function AgentSchedulesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    event_type: "viewing",
    starts_at: defaultStart(),
    location: "",
    notes: "",
  });

  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["agent-schedules"],
    queryFn: () => agentCrmApi.schedules(),
  });

  const saveMut = useMutation({
    mutationFn: () =>
      agentCrmApi.createSchedule({
        ...form,
        title: form.title.trim(),
        starts_at: new Date(form.starts_at).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-schedules"] });
      toast.success("Event scheduled");
      setShowForm(false);
    },
    onError: () => toast.error("Could not save event"),
  });

  const upcoming = [...events].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));

  return (
    <AppPageScaffold
      icon={Calendar}
      title="Schedules"
      description="Calendar of viewings, callbacks, and handovers synced with your listings."
      actions={
        <button type="button" className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Schedule
        </button>
      }
    >
      {showForm && (
        <div className="card-glass mb-4 grid gap-3 p-4 sm:grid-cols-2">
          <input className="input-field sm:col-span-2" placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <select className="input-field" value={form.event_type} onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input type="datetime-local" className="input-field" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} />
          <input className="input-field sm:col-span-2" placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <textarea className="input-field sm:col-span-2" rows={2} placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-2 sm:col-span-2">
            <button type="button" className="btn-primary rounded-lg px-4 py-2 text-sm font-bold" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>Save</button>
            <button type="button" className="rounded-lg border border-white/15 px-4 py-2 text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <LoadingPanel /> : isError ? <ErrorPanel title="Could not load schedule" onRetry={refetch} /> : upcoming.length === 0 ? (
        <EmptyPanel title="No events" description="Book a viewing or callback for your leads." />
      ) : (
        <div className="space-y-2">
          {upcoming.map((ev) => (
            <div key={ev.id} className="card-glass flex flex-wrap items-start justify-between gap-3 border border-white/[0.08] p-4">
              <div>
                <div className="font-bold text-white">{ev.title}</div>
                <div className="mt-1 text-xs capitalize text-[#00C896]">{ev.event_type} · {ev.status}</div>
                <div className="mt-1 text-sm text-white/55">{fmtDt(ev.starts_at)}</div>
                {ev.location && <div className="text-xs text-white/45">{ev.location}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppPageScaffold>
  );
}
