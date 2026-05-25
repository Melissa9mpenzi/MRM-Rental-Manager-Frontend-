import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { BarChart2 } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { agentCrmApi } from "../../api/agentCrmApi";
import { ErrorPanel, LoadingPanel } from "../../components/ui/StatePanel";

export default function AgentAnalyticsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["agent-analytics"],
    queryFn: () => agentCrmApi.analytics(),
  });

  const kpis = data?.kpis ?? {};
  const funnel = data?.funnel ?? [];
  const trend = data?.commission_trend ?? [];
  const dealsByStatus = data?.deals_by_status ?? [];

  return (
    <AppPageScaffold
      icon={BarChart2}
      title="Analytics"
      description="Conversion funnels, pipeline health, and commission trends from your CRM data."
    >
      {isLoading ? (
        <LoadingPanel className="h-48" />
      ) : isError ? (
        <ErrorPanel title="Could not load analytics" onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Total leads", value: kpis.total_leads ?? 0 },
              { label: "Active viewings", value: kpis.active_viewings ?? 0 },
              { label: "Closed leads", value: kpis.closed_leads ?? 0 },
              { label: "Won deals", value: kpis.won_deals ?? 0 },
              { label: "Conversion", value: `${kpis.conversion_pct ?? 0}%` },
            ].map(({ label, value }) => (
              <div key={label} className="card-glass p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wide text-white/40">{label}</div>
                <div className="mt-1 text-2xl font-extrabold text-[#00C896]">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card-glass p-4">
              <h3 className="mb-3 text-sm font-bold text-white">Lead funnel</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={funnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="stage" tick={{ fill: "#8b9db0", fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "#8b9db0", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#121a22", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card-glass p-4">
              <h3 className="mb-3 text-sm font-bold text-white">Commission trend (UGX millions)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="m" tick={{ fill: "#8b9db0", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#8b9db0", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#121a22", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <Line type="monotone" dataKey="v" stroke="#00C896" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-glass p-4">
            <h3 className="mb-3 text-sm font-bold text-white">Deals by status</h3>
            <div className="flex flex-wrap gap-4">
              {dealsByStatus.map((d) => (
                <div key={d.status} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="text-xs capitalize text-white/45">{d.status}</div>
                  <div className="text-xl font-bold text-white">{d.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppPageScaffold>
  );
}
