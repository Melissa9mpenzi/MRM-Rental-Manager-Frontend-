import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Mail, Copy, RefreshCw, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { governmentAuthApi } from "../../api/governmentAuthApi";
import { apiErrorMessage } from "../../lib/apiError";

const ROLE_OPTIONS = [
  { value: "gov_nira", label: "NIRA Officer", agency: "nira" },
  { value: "gov_kcca", label: "KCCA Officer", agency: "kcca" },
  { value: "gov_ura", label: "URA Officer", agency: "ura" },
];

function copyText(text) {
  if (!text) return Promise.reject(new Error("Nothing to copy"));
  return navigator.clipboard.writeText(text);
}

function handleInviteEmailResult(payload, fallbackEmail) {
  const emailSent = payload?.email_sent === true || payload?.email_sent === 1;
  const apiMessage = payload?._message;
  if (emailSent) {
    toast.success(apiMessage || `Invitation email sent to ${payload?.email || fallbackEmail}.`);
  } else {
    toast.error(
      apiMessage ||
        "Invitation saved, but email was not sent. Configure SMTP on the backend or share the invite link manually.",
      { duration: 10000 }
    );
    if (payload?.invite_url) {
      toast(
        (t) => (
          <span className="flex flex-col gap-2 text-sm">
            <span>Share this link with the officer:</span>
            <button
              type="button"
              className="break-all text-left font-mono text-xs text-emerald-300 underline"
              onClick={() => {
                copyText(payload.invite_url)
                  .then(() => {
                    toast.success("Invite link copied");
                    toast.dismiss(t.id);
                  })
                  .catch(() => toast.error("Could not copy link"));
              }}
            >
              {payload.invite_url}
            </button>
          </span>
        ),
        { duration: 20000 }
      );
    }
  }
  if (payload?.dev_invite_token && !emailSent) {
    toast(`Dev invite token: ${payload.dev_invite_token}`, { duration: 8000 });
  }
}

export default function GovOfficersPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "gov_nira",
    work_id: "",
  });

  const { data: invitationData, isLoading } = useQuery({
    queryKey: ["gov-invitations"],
    queryFn: () => governmentAuthApi.listInvitations(),
  });

  const invitations = invitationData?.items ?? [];
  const smtpConfigured = invitationData?.smtp_configured;
  const inviteBaseUrl = invitationData?.frontend_base_url;

  const createMut = useMutation({
    mutationFn: (body) => governmentAuthApi.createInvitation(body),
    onSuccess: (payload) => {
      handleInviteEmailResult(payload, form.email);
      qc.invalidateQueries({ queryKey: ["gov-invitations"] });
      setForm({ full_name: "", email: "", phone: "", role: "gov_nira", work_id: "" });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not send invitation.")),
  });

  const resendMut = useMutation({
    mutationFn: (id) => governmentAuthApi.resendInvitation(id),
    onSuccess: (payload) => {
      handleInviteEmailResult(payload, payload?.email);
      qc.invalidateQueries({ queryKey: ["gov-invitations"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not resend invitation.")),
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

      {smtpConfigured === false && (
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold">Email is not configured on the server</p>
            <p className="mt-1 text-amber-100/80">
              Officer invitations are saved, but no email is sent until SMTP is set on the
              backend: <code className="text-xs">SMTP_HOST</code>,{" "}
              <code className="text-xs">SMTP_USER</code>,{" "}
              <code className="text-xs">SMTP_PASSWORD</code>,{" "}
              <code className="text-xs">SMTP_FROM</code>. For Gmail, use an app password.
              Also set <code className="text-xs">FRONTEND_BASE_URL</code> to your live site
              {inviteBaseUrl ? ` (currently ${inviteBaseUrl})` : ""} so invite links are correct.
            </p>
            <p className="mt-2 text-amber-100/80">
              For pending officers below, use <strong>Copy invite link</strong> or{" "}
              <strong>Resend email</strong> after fixing SMTP.
            </p>
          </div>
        </div>
      )}

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
            className="select-field mt-1"
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
          <div className="overflow-x-auto">
            <table className="gov-table w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Agency</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                    <td className="px-3 py-2">
                      {inv.status === "pending" && inv.invite_url ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
                            onClick={() =>
                              copyText(inv.invite_url)
                                .then(() => toast.success("Invite link copied"))
                                .catch(() => toast.error("Could not copy link"))
                            }
                          >
                            <Copy size={12} />
                            Copy invite link
                          </button>
                          <button
                            type="button"
                            disabled={resendMut.isPending}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-600/20 px-2 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50"
                            onClick={() => resendMut.mutate(inv.id)}
                          >
                            <RefreshCw size={12} className={resendMut.isPending ? "animate-spin" : ""} />
                            Resend email
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/35">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && invitations.length === 0 && (
          <p className="p-4 text-sm text-white/45">No invitations yet.</p>
        )}
      </div>
    </div>
  );
}
