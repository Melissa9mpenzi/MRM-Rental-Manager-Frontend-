import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Shield, UserX, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { workspaceApi } from "../../api/workspaceApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "tenant", label: "Tenant" },
  { value: "landlord", label: "Landlord" },
  { value: "staff", label: "Staff" },
  { value: "system_admin", label: "System administrator" },
  { value: "gov_nira", label: "NIRA officer" },
  { value: "gov_kcca", label: "KCCA officer" },
  { value: "gov_ura", label: "URA officer" },
];

export default function AdminUsersListPage({ embedded = false }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0);
  const limit = 25;
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);

  const kycMutation = useMutation({
    mutationFn: ({ id, action }) => workspaceApi.adminKycReview(id, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace-admin-users"] });
      toast.success("KYC status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail?.message || err.response?.data?.detail || "KYC update failed");
    },
  });

  const accountMutation = useMutation({
    mutationFn: ({ id, action }) => workspaceApi.adminUserAccount(id, { action }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["workspace-admin-users"] });
      toast.success(data?.message || "Account updated");
    },
    onError: (err) => {
      const d = err.response?.data?.detail;
      toast.error(typeof d === "string" ? d : d?.message || "Could not update account");
    },
  });

  function handleDisconnect(u) {
    if (u.id === me?.id) {
      toast.error("You cannot disconnect your own account.");
      return;
    }
    const label = u.full_name || u.email;
    if (
      !window.confirm(
        `Disconnect ${label}? They will be signed out and cannot log in until you reconnect the account.`
      )
    ) {
      return;
    }
    accountMutation.mutate({ id: u.id, action: "disconnect" });
  }

  function handleReconnect(u) {
    accountMutation.mutate({ id: u.id, action: "reconnect" });
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspace-admin-users", search, role, page],
    queryFn: () =>
      workspaceApi.adminUsers({
        limit,
        offset: page * limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(role ? { role } : {}),
      }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const body = (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35"
            placeholder="Search email or name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select
          className="select-field !w-auto min-w-[10rem]"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(0);
          }}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="card-glass h-48 animate-pulse border border-white/[0.08] bg-white/[0.04]" />
      ) : isError ? (
        <div className="card-glass border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200">
          Could not load users. You need an admin account and a working API connection.
        </div>
      ) : (
        <div className="card-glass overflow-hidden border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/[0.08] bg-white/[0.04] text-xs font-bold uppercase tracking-wide text-white/45">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Email verified</th>
                  <th className="px-4 py-3">KYC</th>
                  <th className="px-4 py-3">Trusted</th>
                  <th className="px-4 py-3">Actions</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/85">
                {items.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{u.full_name}</div>
                      <div className="text-xs text-white/45">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-semibold text-sky-200">
                        <Shield size={12} />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="text-emerald-300">Active</span>
                      ) : (
                        <span className="text-red-300/90" title={u.gov_suspended ? "Suspended / disconnected" : ""}>
                          Disconnected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{u.email_verified ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-xs capitalize text-white/70">{u.kyc_review_status || "—"}</td>
                    <td className="px-4 py-3 text-xs">{u.trusted_for_commerce ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex min-w-[10rem] flex-col gap-1.5">
                        {(u.role === "landlord" || u.role === "staff") && u.kyc_review_status === "pending" && (
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              disabled={kycMutation.isPending || accountMutation.isPending}
                              onClick={() => kycMutation.mutate({ id: u.id, action: "approve" })}
                              className="rounded-lg bg-emerald-600/90 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-500"
                            >
                              Approve KYC
                            </button>
                            <button
                              type="button"
                              disabled={kycMutation.isPending || accountMutation.isPending}
                              onClick={() => kycMutation.mutate({ id: u.id, action: "reject" })}
                              className="rounded-lg border border-white/15 px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10"
                            >
                              Reject KYC
                            </button>
                          </div>
                        )}
                        {u.is_active ? (
                          <button
                            type="button"
                            disabled={accountMutation.isPending || u.id === me?.id}
                            onClick={() => handleDisconnect(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-40"
                            title={u.id === me?.id ? "Cannot disconnect yourself" : "Revoke access and sign-out sessions"}
                          >
                            <UserX size={12} />
                            Disconnect
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={accountMutation.isPending}
                            onClick={() => handleReconnect(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/20"
                          >
                            <UserCheck size={12} />
                            Reconnect
                          </button>
                        )}
                        {!((u.role === "landlord" || u.role === "staff") && u.kyc_review_status === "pending") &&
                          u.is_active &&
                          u.id !== me?.id && (
                            <span className="text-[10px] text-white/30">Revokes login sessions</span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > limit && (
            <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3 text-xs text-white/55">
              <button
                type="button"
                disabled={page === 0}
                className="font-semibold text-[#00C896] disabled:opacity-30"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span>
                {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
              </span>
              <button
                type="button"
                disabled={(page + 1) * limit >= total}
                className="font-semibold text-[#00C896] disabled:opacity-30"
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Users & Roles</h2>
          <p className="text-sm text-white/50">
            {total} account{total === 1 ? "" : "s"} · search, filter, and KYC moderation
          </p>
        </div>
        {body}
      </div>
    );
  }

  return (
    <AppPageScaffold
      variant="command"
      icon={Users}
      title="Users"
      description={`${total} account${total === 1 ? "" : "s"} · search and filter by role`}
    >
      {body}
    </AppPageScaffold>
  );
}
