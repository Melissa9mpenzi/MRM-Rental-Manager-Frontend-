import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shield, Building2, Users, Activity, AlertTriangle, ListChecks } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import useAuthStore from "../../store/authStore";
import { workspaceApi } from "../../api/workspaceApi";
import PlatformDistributionHint from "../../components/layout/PlatformDistributionHint";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

const ROLE_COLORS = {
  tenant: "#00C896",
  landlord: "#3B82F6",
  staff: "#7C3AED",
  admin: "#f59e0b",
};

function userSplitFromRoles(byRole) {
  if (!byRole || typeof byRole !== "object") return [];
  const entries = Object.entries(byRole).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (!total) return [];
  return entries.map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1) + "s",
    value: Math.round((value / total) * 100),
    color: ROLE_COLORS[name] || "#94a3b8",
  }));
}

export default function AdminDashboardRd() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspace-admin-summary"],
    queryFn: () => workspaceApi.adminSummary(),
    refetchInterval: 60000,
  });

  const userSplit = userSplitFromRoles(data?.users_by_role);
  const monthly = data?.monthly_platform ?? [];
  const recentAudit = data?.recent_audit ?? [];
  const recentUsers = data?.recent_users ?? [];

  const fmt = (n) => new Intl.NumberFormat("en-UG").format(Math.round(n || 0));

  return (
    <AppPageScaffold variant="command" hideHeader>
      <PlatformDistributionHint role={user?.role || "admin"} />

      <div>
        <h2 className="text-xl font-bold text-white">Platform administration</h2>
        <p className="mt-0.5 text-sm text-white/55">Live counts from your database</p>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load admin summary. Sign in as an admin and ensure the API is running.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { icon: Users, label: "Total users", value: isLoading ? "…" : fmt(data?.users_total) },
          { icon: Building2, label: "Properties", value: isLoading ? "…" : fmt(data?.properties_total) },
          {
            icon: Activity,
            label: "Rent collected (month)",
            value: isLoading ? "…" : `UGX ${fmt(data?.payments_rent_this_month)}`,
          },
          { icon: Shield, label: "Active tenants", value: isLoading ? "…" : fmt(data?.tenants_active) },
          {
            icon: AlertTriangle,
            label: "Maintenance open",
            value: isLoading ? "…" : fmt((data?.maintenance_open ?? 0) + (data?.maintenance_in_progress ?? 0)),
            warn: true,
          },
        ].map(({ icon: Icon, label, value, warn }) => (
          <div key={label} className="stat-card">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                warn ? "bg-red-500/15 text-red-300" : "bg-sky-500/15 text-sky-300"
              }`}
            >
              <Icon size={18} />
            </div>
            <div className="mt-2 text-xl font-extrabold text-white">{value}</div>
            <div className="text-xs font-semibold text-white/45">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card-glass lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-white">Last 6 months — signups, new properties, rent volume</h3>
          {monthly.length === 0 && !isLoading ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-white/45">No trend data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#8b9db0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: "#8b9db0", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#8b9db0", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(18,26,34,0.95)",
                    color: "#f1f5f9",
                  }}
                />
                <Line yAxisId="left" type="monotone" dataKey="users" name="New users" stroke="#00C896" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="properties" name="New properties" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="payment_volume"
                  name="Rent volume"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-glass flex flex-col">
          <h3 className="mb-2 text-sm font-bold text-white">Users by role</h3>
          {userSplit.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-sm text-white/45">No users yet.</div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={userSplit}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {userSplit.map((e, i) => (
                      <Cell key={i} fill={e.color} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Share"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(18,26,34,0.95)",
                      color: "#f1f5f9",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                {userSplit.map((u) => (
                  <span key={u.name} className="flex items-center gap-1.5 text-white/60">
                    <span className="h-2 w-2 rounded-full" style={{ background: u.color }} />
                    {u.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card-glass overflow-hidden">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListChecks className="text-[#00C896]" size={18} />
              <h3 className="text-sm font-bold text-white">Recent signups</h3>
            </div>
            <Link to="/admin/users" className="text-xs font-semibold text-[#00C896] hover:underline">
              Directory →
            </Link>
          </div>
          <div className="space-y-2 text-xs">
            {recentUsers.length === 0 ? (
              <p className="py-6 text-center text-white/45">No recent users.</p>
            ) : (
              recentUsers.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-bold text-white/90">{row.full_name}</div>
                    <div className="mt-0.5 text-white/45">
                      {row.email} · {row.role}
                    </div>
                  </div>
                  <span className="mt-1 inline-flex w-fit rounded-full bg-sky-500/20 px-2 py-0.5 font-semibold text-sky-200 sm:mt-0">
                    {row.email_verified ? "Verified" : "Unverified"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-glass overflow-hidden">
          <h3 className="mb-3 text-sm font-bold text-white">Audit trail</h3>
          {recentAudit.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/45">No audit rows yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {recentAudit.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-semibold text-[#00C896]">{row.action}</span>
                  <span className="min-w-0 flex-1 text-white/70">
                    {row.table_name || "—"} #{row.record_id ?? "—"}
                  </span>
                  <span className="text-white/40">{row.created_at ? new Date(row.created_at).toLocaleString() : "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppPageScaffold>
  );
}
