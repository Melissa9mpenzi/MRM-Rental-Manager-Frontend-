import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wrench, Plus, Clock, CheckCircle2,
  AlertTriangle, RefreshCw, X, Upload, DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { maintenanceApi } from "../../api/maintenanceApi";
import { propertiesApi } from "../../api/propertiesApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

import { platformApiOrigin } from "../../api/config";

const BASE_URL = platformApiOrigin();

const STATUS_CONFIG = {
  open:        { label: "Open",        color: "bg-red-500/15 text-red-200 ring-1 ring-red-500/25",     icon: AlertTriangle },
  in_progress: { label: "In Progress", color: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25", icon: RefreshCw },
  resolved:    { label: "Resolved",    color: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30", icon: CheckCircle2 },
  closed:      { label: "Closed",      color: "bg-white/10 text-white/50 ring-1 ring-white/15",   icon: X },
};
const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "text-white/45"   },
  medium: { label: "Medium", color: "text-amber-300/95"  },
  high:   { label: "High",   color: "text-orange-300" },
  urgent: { label: "Urgent", color: "text-red-300 font-bold" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function CreateModal({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ unit_id: "", title: "", description: "", priority: "medium" });
  const [photo, setPhoto] = useState(null);
  const [selectedProp, setSelectedProp] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => propertiesApi.list({}),
  });
  const { data: units = [] } = useQuery({
    queryKey: ["units", selectedProp],
    queryFn: () => propertiesApi.getUnits(selectedProp),
    enabled: !!selectedProp,
  });

  const mutation = useMutation({
    mutationFn: (fd) => maintenanceApi.create(fd),
    onSuccess: () => { toast.success("Maintenance request created!"); qc.invalidateQueries({ queryKey: ["maintenance"] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to create request."),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.unit_id || !form.title) { toast.error("Unit and title are required."); return; }
    const fd = new FormData();
    fd.append("unit_id", form.unit_id);
    fd.append("title", form.title);
    if (form.description) fd.append("description", form.description);
    fd.append("priority", form.priority);
    if (photo) fd.append("photo", photo);
    mutation.mutate(fd);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/12 bg-rd-elevated/95 p-6 shadow-modal backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New maintenance request</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Property</label>
              <select className="input-field" value={selectedProp} onChange={(e) => { setSelectedProp(e.target.value); set("unit_id", ""); }}>
                <option value="">— Select —</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Unit <span className="text-brand-teal">*</span></label>
              <select className="input-field" required value={form.unit_id} onChange={(e) => set("unit_id", e.target.value)} disabled={!selectedProp}>
                <option value="">— Select —</option>
                {units.map((u) => <option key={u.id} value={u.id}>Unit {u.unit_number}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Title <span className="text-brand-teal">*</span></label>
            <input className="input-field" placeholder="e.g. Leaking roof in bedroom" required value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input-field resize-none min-h-[80px]" placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Priority</label>
              <select className="input-field" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">🚨 Urgent</option>
              </select>
            </div>
            <div>
              <label className="input-label">Photo (optional)</label>
              <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed text-xs font-semibold transition-colors ${photo ? "border-brand-teal text-brand-teal" : "border-brand-tealLt text-brand-mid hover:border-brand-teal"}`}>
                <Upload size={14} /><span className="truncate">{photo ? photo.name : "Upload photo"}</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files[0] || null)} />
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-outline flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Plus size={15}/> Submit</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateModal({ request, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    status: request.status,
    resolution_note: request.resolution_note || "",
    cost_incurred: request.cost_incurred || "0",
  });
  const mutation = useMutation({
    mutationFn: (data) => maintenanceApi.update(request.id, data),
    onSuccess: () => { toast.success("Request updated!"); qc.invalidateQueries({ queryKey: ["maintenance"] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.detail || "Update failed."),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/12 bg-rd-elevated/95 p-6 shadow-modal backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Update request</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className="mb-4 border-b border-white/10 pb-3 text-sm font-semibold text-white/90">{request.title}</p>
        <div className="space-y-4">
          <div>
            <label className="input-label">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="input-label">Cost Incurred (UGX)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
              <input type="number" className="input-field pl-9" min="0" value={form.cost_incurred} onChange={(e) => setForm((f) => ({ ...f, cost_incurred: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="input-label">Resolution Note</label>
            <textarea className="input-field resize-none min-h-[80px]" placeholder="What was done to fix the issue?" value={form.resolution_note} onChange={(e) => setForm((f) => ({ ...f, resolution_note: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-outline flex-1" onClick={onClose}>Cancel</button>
            <button type="button" className="btn-primary flex-1" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
              {mutation.isPending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ req, onUpdate }) {
  const priority = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG.medium;
  return (
    <div className="card hover:border-brand-teal transition-all duration-150 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold uppercase tracking-wide ${priority.color}`}>{priority.label}</span>
            <StatusBadge status={req.status} />
          </div>
          <div className="font-bold text-brand-dark leading-snug">{req.title}</div>
          <div className="text-xs text-brand-mid mt-0.5">{req.property_name}{req.unit_number && ` · Unit ${req.unit_number}`}</div>
        </div>
        {req.photo_path && (
          <a href={`${BASE_URL}${req.photo_path}`} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-brand-tealLt">
            <img src={`${BASE_URL}${req.photo_path}`} alt="photo" className="w-full h-full object-cover" />
          </a>
        )}
      </div>
      {req.description && <p className="text-xs text-brand-mid leading-relaxed line-clamp-2">{req.description}</p>}
      {req.resolution_note && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          <strong className="text-emerald-50">Resolution:</strong> {req.resolution_note}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-brand-mid pt-2 border-t border-brand-tealLt/50">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {req.created_at ? new Date(req.created_at).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </span>
        {req.cost_incurred && req.cost_incurred !== "0" && (
          <span className="font-semibold text-brand-dark">UGX {Number(req.cost_incurred).toLocaleString()}</span>
        )}
        <button onClick={() => onUpdate(req)} className="text-brand-teal font-semibold hover:underline">Update →</button>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const [filterStatus, setFilterStatus] = useState("");
  const [createOpen,   setCreateOpen]   = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);

  const { data: requests = [], isLoading, isError } = useQuery({
    queryKey: ["maintenance", filterStatus],
    queryFn: () => maintenanceApi.list(filterStatus ? { status: filterStatus } : {}),
    refetchInterval: 30000,
  });

  const counts = {
    all:         requests.length,
    open:        requests.filter((r) => r.status === "open").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    resolved:    requests.filter((r) => r.status === "resolved").length,
  };

  return (
    <AppPageScaffold
      variant="tickets"
      icon={Wrench}
      title="Maintenance"
      description="Track and manage property maintenance requests"
      actions={
        <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> New Request
        </button>
      }
    >
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open",        count: counts.open,        color: "border-red-500/30 bg-red-500/10 text-red-100",    icon: AlertTriangle },
          { label: "In Progress", count: counts.in_progress, color: "border-amber-500/30 bg-amber-500/10 text-amber-100", icon: RefreshCw },
          { label: "Resolved",    count: counts.resolved,    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100", icon: CheckCircle2 },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-3 ${color}`}>
            <Icon size={22} className="flex-shrink-0 opacity-80" />
            <div>
              <div className="text-2xl font-bold leading-none">{count}</div>
              <div className="text-xs font-semibold mt-0.5 opacity-70">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "",            label: "All",         count: counts.all },
          { value: "open",        label: "Open",        count: counts.open },
          { value: "in_progress", label: "In Progress", count: counts.in_progress },
          { value: "resolved",    label: "Resolved",    count: counts.resolved },
        ].map((tab) => (
          <button key={tab.value} onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterStatus === tab.value
                ? "bg-brand-teal text-[#041208] shadow-sm"
                : "border border-white/12 bg-white/[0.06] text-white/70 hover:border-brand-teal/45 hover:text-brand-teal"
            }`}>
            {tab.label}
            {tab.count > 0 && <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filterStatus === tab.value ? "bg-white/20" : "bg-brand-tealLt"}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-brand-tealLt/30" />)}
        </div>
      ) : isError ? (
        <div className="card py-14 text-center">
          <p className="font-bold text-brand-dark">Could not load maintenance requests</p>
          <p className="mt-1 text-sm text-brand-mid">Check the API and try again.</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-brand-tealLt flex items-center justify-center mx-auto">
            <Wrench size={24} className="text-brand-teal" />
          </div>
          <div className="font-bold text-brand-dark">No maintenance requests</div>
          <p className="text-sm text-brand-mid">{filterStatus ? "No requests with this status." : "Log your first maintenance issue to get started."}</p>
          {!filterStatus && <button className="btn-primary mx-auto" onClick={() => setCreateOpen(true)}><Plus size={16} /> New Request</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {requests.map((req) => <RequestCard key={req.id} req={req} onUpdate={setUpdateTarget} />)}
        </div>
      )}

      {createOpen  && <CreateModal onClose={() => setCreateOpen(false)} />}
      {updateTarget && <UpdateModal request={updateTarget} onClose={() => setUpdateTarget(null)} />}
    </AppPageScaffold>
  );
}
