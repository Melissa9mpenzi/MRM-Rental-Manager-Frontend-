import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Shield } from "lucide-react";
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

export default function AdminUsersListPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0);
  const limit = 25;
  const qc = useQueryClient();

  const kycMutation = useMutation({
    mutationFn: ({ id, action }) => workspaceApi.adminKycReview(id, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace-admin-users"] });
    },
  });

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

  return (
    <AppPageScaffold
      variant="command"
      icon={Users}
      title="Users"
      description={`${total} account${total === 1 ? "" : "s"} · search and filter by role`}
    >
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
          className="rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-sm text-white"
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
                        <span className="text-white/45">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{u.email_verified ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-xs capitalize text-white/70">{u.kyc_review_status || "—"}</td>
                    <td className="px-4 py-3 text-xs">{u.trusted_for_commerce ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      {(u.role === "landlord" || u.role === "staff") && u.kyc_review_status === "pending" ? (
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            disabled={kycMutation.isPending}
                            onClick={() => kycMutation.mutate({ id: u.id, action: "approve" })}
                            className="rounded-lg bg-emerald-600/90 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-500"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={kycMutation.isPending}
                            onClick={() => kycMutation.mutate({ id: u.id, action: "reject" })}
                            className="rounded-lg border border-white/15 px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/35">—</span>
                      )}
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
    </AppPageScaffold>
  );
}
