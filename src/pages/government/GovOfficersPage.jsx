import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { governmentAuthApi } from "../../api/governmentAuthApi";
import { apiErrorMessage } from "../../lib/apiError";

const ROLE_OPTIONS = [
  { value: "gov_nira", label: "NIRA Officer", agency: "nira" },
  { value: "gov_kcca", label: "KCCA Officer", agency: "kcca" },
  { value: "gov_ura", label: "URA Officer", agency: "ura" },
];

export default function GovOfficersPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "gov_nira",
    work_id: "",
  });

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["gov-invitations"],
    queryFn: () => governmentAuthApi.listInvitations(),
  });

  const createMut = useMutation({
    mutationFn: (body) => governmentAuthApi.createInvitation(body),
    onSuccess: (res) => {
      toast.success(res?.message || "Invitation sent.");
      if (res?.dev_invite_token) {
        toast(`Dev invite link token: ${res.dev_invite_token}`, { duration: 8000 });
      }
      qc.invalidateQueries({ queryKey: ["gov-invitations"] });
      setForm({ full_name: "", email: "", phone: "", role: "gov_nira", work_id: "" });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not send invitation.")),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const opt = ROLE_OPTIONS.find((r) => r.value === form.role);
    createMut.mutate({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || undefined,
      role: form.role,
      agency: opt?.agency || "nira",
      work_id: form.work_id,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Government officers</h1>
        <p className="mt-1 text-sm text-white/50">
          Invitation-only for NIRA, KCCA, and URA. System administrator is seed-only.
        </p>
      </div>

      <form onSubmit={onSubmit} className="gov-glass grid gap-3 p-4 md:grid-cols-2">
        <label className="block text-xs font-semibold text-white/70">
          Full name
          <input
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
        </label>
        <label className="block text-xs font-semibold text-white/70">
          Official email
          <input
            required
            type="email"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
        <label className="block text-xs font-semibold text-white/70">
          Phone (optional)
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </label>
        <label className="block text-xs font-semibold text-white/70">
          Work ID
          <input
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={form.work_id}
            onChange={(e) => setForm((f) => ({ ...f, work_id: e.target.value }))}
          />
        </label>
        <label className="block text-xs font-semibold text-white/70 md:col-span-2">
          Agency & role
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={createMut.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
          >
            <UserPlus size={16} />
            {createMut.isPending ? "Sending…" : "Send secure invitation"}
          </button>
        </div>
      </form>

      <div className="gov-glass overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
          Invitations
        </div>
        {isLoading ? (
          <p className="p-4 text-sm text-white/45">Loading…</p>
        ) : (
          <table className="gov-table w-full text-left text-sm">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Agency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id} className="border-t border-white/5">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{inv.full_name}</div>
                    <div className="flex items-center gap-1 text-xs text-white/45">
                      <Mail size={12} />
                      {inv.email}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white/70">
                    {inv.agency?.toUpperCase()} · {inv.role?.replace("gov_", "")}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        inv.status === "accepted"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : inv.status === "pending"
                            ? "bg-amber-500/20 text-amber-200"
                            : "bg-white/10 text-white/50"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && invitations.length === 0 && (
          <p className="p-4 text-sm text-white/45">No invitations yet.</p>
        )}
      </div>
    </div>
  );
}
