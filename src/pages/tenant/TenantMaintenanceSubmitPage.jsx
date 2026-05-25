import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Wrench, Upload, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { maintenanceApi } from "../../api/maintenanceApi";
import { tenantPortalApi } from "../../api/tenantPortalApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function TenantMaintenanceSubmitPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });
  const [photo, setPhoto] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const { data: lease, isLoading: leaseLoading } = useQuery({
    queryKey: ["tenant-my-lease"],
    queryFn: () => tenantPortalApi.myLease(),
    retry: false,
  });

  const unitId =
    lease?.unit?.id ??
    lease?.unit_id ??
    (typeof lease?.unit === "number" ? lease.unit : null);

  const mutation = useMutation({
    mutationFn: (fd) => maintenanceApi.create(fd),
    onSuccess: () => {
      toast.success("Maintenance request submitted.");
      navigate("/tenant/dashboard", { replace: true });
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to submit request."),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!unitId) {
      toast.error("No active lease unit found. Ask your landlord to link your tenant profile.");
      return;
    }
    const fd = new FormData();
    fd.append("unit_id", String(unitId));
    fd.append("title", form.title.trim());
    if (form.description) fd.append("description", form.description);
    fd.append("priority", form.priority);
    if (photo) fd.append("photo", photo);
    mutation.mutate(fd);
  }

  return (
    <AppPageScaffold
      variant="tickets"
      icon={Wrench}
      title="Report maintenance issue"
      description="Submit a request for your leased unit"
      actions={
        <Link to="/tenant/messages" className="btn-outline text-sm">
          <ArrowLeft size={14} /> Back to Rental Hub
        </Link>
      }
    >
      {leaseLoading ? (
        <p className="text-sm text-white/50">Loading your lease…</p>
      ) : !unitId ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          No active lease unit is linked to your account yet. Contact your landlord or complete onboarding first.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="input-label">Title *</label>
          <input
            className="input-field"
            placeholder="e.g. Leaking roof in bedroom"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div>
          <label className="input-label">Description</label>
          <textarea
            className="input-field min-h-[100px] resize-none"
            placeholder="Describe the issue in detail…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Priority</label>
            <select
              className="input-field"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="input-label">Photo (optional)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-white/15 px-3 py-2 text-xs font-semibold text-white/60 hover:border-brand-teal">
              <Upload size={14} />
              <span className="truncate">{photo ? photo.name : "Upload photo"}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0] || null)}
              />
            </label>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={mutation.isPending || !unitId}>
          {mutation.isPending ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </AppPageScaffold>
  );
}
