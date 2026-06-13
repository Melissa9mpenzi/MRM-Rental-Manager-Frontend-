import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, Target, Wallet, Clock, KanbanSquare, Phone, Wrench } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import useAuthStore from "../../store/authStore";
import { workspaceApi } from "../../api/workspaceApi";
import PlatformDistributionHint from "../../components/layout/PlatformDistributionHint";
import KycStatusBanner from "../../components/domain/KycStatusBanner";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

const fmtUGX = (n) =>
  n >= 1_000_000
    ? `UGX ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `UGX ${Math.round(n / 1_000)}K`
      : `UGX ${Math.round(n || 0)}`;

export default function AgentDashboardRd() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspace-staff-summary"],
    queryFn: () => workspaceApi.staffSummary(),
    refetchInterval: 60000,
  });

  const kpis = data?.kpis ?? {};
  const pipeline = data?.pipeline_stages ?? [];
  const leads = data?.recent_leads ?? [];
  const trend = data?.commission_trend ?? [];
  const maint = data?.maintenance ?? {};

  return (
    <AppPageScaffold variant="insights" hideHeader>
      <PlatformDistributionHint role={user?.role || "staff"} />

      <div>
        <h2 className="text-xl font-bold text-gray-900">Agent workspace</h2>
        <p className="mt-0.5 text-sm text-gray-500">Operations snapshot · CRM stages ship when lead data exists</p>
      </div>

      <KycStatusBanner user={user} roleLabel="agent" />

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load workspace data. You need a staff or admin login and a running API.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Users, label: "Pipeline (CRM)", value: isLoading ? "…" : String(kpis.total_leads ?? 0), color: "bg-violet-50 text-violet-600" },
          { icon: Target, label: "Active tickets", value: isLoading ? "…" : String(kpis.active_deals ?? 0), color: "bg-teal-50 text-teal-600" },
          { icon: Wallet, label: "Commissions (YTD)", value: isLoading ? "…" : fmtUGX(kpis.commissions_ytd_ugx ?? 0), color: "bg-sky-50 text-sky-600" },
          { icon: Clock, label: "Pending payout", value: isLoading ? "…" : fmtUGX(kpis.pending_payout_ugx ?? 0), color: "bg-amber-50 text-amber-600" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              <Icon size={18} />
            </div>
            <div className="mt-2 text-xl font-extrabold text-gray-900">{value}</div>
            <div className="text-xs font-semibold text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Maintenance summary */}
      <div className="card-glass">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wrench className="text-teal-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800">Maintenance (platform)</h3>
          </div>
          <span className="text-xs text-gray-400">
            Open {maint.open ?? 0} · In progress {maint.in_progress ?? 0} · Resolved {maint.resolved ?? 0}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {data?.properties_listed ?? 0} active listings on the platform · full maintenance tools live under each landlord account.
        </p>
      </div>

      {/* Pipeline stages */}
      <div className="card-glass">
        <div className="mb-4 flex items-center gap-2">
          <KanbanSquare className="text-teal-600" size={18} />
          <h3 className="text-sm font-bold text-gray-800">Pipeline stages</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {pipeline.map((p) => (
            <div
              key={p.stage}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center transition hover:border-teal-200 hover:bg-teal-50"
            >
              <div className="text-2xl font-extrabold text-gray-900">{p.count}</div>
              <div className="mt-1 text-[11px] font-semibold text-gray-500">{p.stage}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
          <Link to="/agent/leads" className="text-teal-600 hover:underline">Manage leads →</Link>
          <Link to="/browse-properties" className="text-gray-400 hover:text-gray-700">Browse listings →</Link>
        </div>
      </div>

      {/* Recent leads table */}
      <div className="card-glass overflow-hidden">
        <h3 className="mb-3 text-sm font-bold text-gray-800">Recent leads</h3>
        {leads.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No leads yet. Add prospects from the Leads page.
          </p>
        ) : (
          <div className="-mx-1 max-h-[280px] overflow-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="sticky top-0 border-b border-gray-100 bg-white text-gray-400">
                <tr>
                  <th className="py-2 pr-2 font-semibold">Client</th>
                  <th className="py-2 pr-2 font-semibold">Listing</th>
                  <th className="py-2 pr-2 font-semibold">Stage</th>
                  <th className="py-2 pr-2 font-semibold">Budget</th>
                  <th className="py-2 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {leads.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-2 align-top">
                      <div className="font-semibold text-gray-800">{row.client}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-gray-400">
                        <Phone size={10} className="flex-shrink-0" />
                        {row.phone}
                      </div>
                    </td>
                    <td className="max-w-[180px] py-2.5 pr-2 align-top text-gray-500">{row.listing}</td>
                    <td className="py-2.5 pr-2 align-top">
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 font-semibold text-violet-700">
                        {row.stage}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 align-top font-semibold text-teal-600">{row.budget}</td>
                    <td className="py-2.5 align-top text-gray-400">{row.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Commission trend chart */}
      <div className="card-glass">
        <h3 className="mb-4 text-sm font-bold text-gray-800">Commission trend (UGX millions)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="m" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                background: "#ffffff",
                color: "#111827",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} dot={{ fill: "#7C3AED", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AppPageScaffold>
  );
}
