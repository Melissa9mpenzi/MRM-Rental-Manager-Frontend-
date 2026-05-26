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
        <h2 className="text-xl font-bold text-white">Agent workspace</h2>
        <p className="mt-0.5 text-sm text-white/55">Operations snapshot · CRM stages ship when lead data exists</p>
      </div>

      <KycStatusBanner user={user} roleLabel="agent" />

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load workspace data. You need a staff or admin login and a running API.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Users, label: "Pipeline (CRM)", value: isLoading ? "…" : String(kpis.total_leads ?? 0) },
          { icon: Target, label: "Active tickets", value: isLoading ? "…" : String(kpis.active_deals ?? 0) },
          { icon: Wallet, label: "Commissions (YTD)", value: isLoading ? "…" : fmtUGX(kpis.commissions_ytd_ugx ?? 0) },
          { icon: Clock, label: "Pending payout", value: isLoading ? "…" : fmtUGX(kpis.pending_payout_ugx ?? 0) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="stat-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
              <Icon size={18} />
            </div>
            <div className="mt-2 text-xl font-extrabold text-white">{value}</div>
            <div className="text-xs font-semibold text-white/45">{label}</div>
          </div>
        ))}
      </div>

      <div className="card-glass">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wrench className="text-[#00C896]" size={18} />
            <h3 className="text-sm font-bold text-white">Maintenance (platform)</h3>
          </div>
          <span className="text-xs text-white/45">
            Open {maint.open ?? 0} · In progress {maint.in_progress ?? 0} · Resolved {maint.resolved ?? 0}
          </span>
        </div>
        <p className="mt-1 text-xs text-white/45">
          {data?.properties_listed ?? 0} active listings on the platform · full maintenance tools live under each landlord account.
        </p>
      </div>

      <div className="card-glass">
        <div className="mb-4 flex items-center gap-2">
          <KanbanSquare className="text-[#00C896]" size={18} />
          <h3 className="text-sm font-bold text-white">Pipeline stages</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {pipeline.map((p) => (
            <div
              key={p.stage}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-center transition hover:border-[#00C896]/30"
            >
              <div className="text-2xl font-extrabold text-white">{p.count}</div>
              <div className="mt-1 text-[11px] font-semibold text-white/50">{p.stage}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
          <Link to="/agent/leads" className="text-[#00C896] hover:underline">Manage leads →</Link>
          <Link to="/browse-properties" className="text-white/55 hover:text-white">Browse listings →</Link>
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <h3 className="mb-3 text-sm font-bold text-white">Recent leads</h3>
        {leads.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/45">
            No leads yet. Add prospects from the Leads page.
          </p>
        ) : (
          <div className="-mx-1 max-h-[280px] overflow-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="sticky top-0 border-b border-white/[0.08] bg-[#121a22]/95 text-white/45 backdrop-blur">
                <tr>
                  <th className="py-2 pr-2 font-semibold">Client</th>
                  <th className="py-2 pr-2 font-semibold">Listing</th>
                  <th className="py-2 pr-2 font-semibold">Stage</th>
                  <th className="py-2 pr-2 font-semibold">Budget</th>
                  <th className="py-2 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/80">
                {leads.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.04]">
                    <td className="py-2.5 pr-2 align-top">
                      <div className="font-semibold text-white">{row.client}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-white/45">
                        <Phone size={10} className="flex-shrink-0" />
                        {row.phone}
                      </div>
                    </td>
                    <td className="max-w-[180px] py-2.5 pr-2 align-top text-white/60">{row.listing}</td>
                    <td className="py-2.5 pr-2 align-top">
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 font-semibold text-violet-200">
                        {row.stage}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 align-top font-semibold text-[#00C896]">{row.budget}</td>
                    <td className="py-2.5 align-top text-white/45">{row.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-glass">
        <h3 className="mb-4 text-sm font-bold text-white">Commission trend (UGX millions)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="m" tick={{ fill: "#8b9db0", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8b9db0", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(18,26,34,0.95)",
                color: "#f1f5f9",
              }}
            />
            <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} dot={{ fill: "#7C3AED", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AppPageScaffold>
  );
}
