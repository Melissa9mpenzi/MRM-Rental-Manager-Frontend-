import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardApi } from "../../api/dashboardApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { ErrorPanel, LoadingPanel } from "../../components/ui/StatePanel";

const fmtUGX = (n) => `UGX ${new Intl.NumberFormat("en-UG").format(Math.round(n || 0))}`;
const PIE_COLORS = ["#00C896", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function LandlordAnalyticsPage() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 60_000,
  });

  const occupancyData = (stats?.occupancy_by_property || []).filter((p) => p.total_units > 0);

  return (
    <AppPageScaffold
      variant="ledger"
      icon={BarChart3}
      title="Analytics"
      description="Occupancy trends, rent collection velocity, and portfolio KPIs from your live data"
    >
      {isLoading ? (
        <LoadingPanel className="h-48" />
      ) : isError ? (
        <ErrorPanel title="Could not load analytics" onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card-glass p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-white/40">Occupancy</div>
              <div className="mt-2 text-3xl font-extrabold text-[#00C896]">
                {stats?.occupancy_rate ?? 0}%
              </div>
              <div className="mt-1 text-[10px] text-white/45">
                {stats?.occupied_units ?? 0} / {stats?.total_units ?? 0} units occupied
              </div>
            </div>
            <div className="card-glass p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-white/40">Collection rate</div>
              <div className="mt-2 text-3xl font-extrabold text-sky-300">
                {stats?.collection_rate ?? 0}%
              </div>
              <div className="mt-1 text-[10px] text-white/45">
                {fmtUGX(stats?.this_month_collected)} of {fmtUGX(stats?.expected_monthly_rent)} expected
              </div>
            </div>
            <div className="card-glass p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-white/40">Avg. tenancy</div>
              <div className="mt-2 text-3xl font-extrabold text-violet-300">
                {stats?.avg_tenancy_months ?? 0}
              </div>
              <div className="mt-1 text-[10px] text-white/45">months (active tenants)</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card-glass p-4">
              <h3 className="mb-4 text-sm font-bold text-white">Rent collected (6 months)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.monthly_income || []} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8b9db0" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#8b9db0" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                    }
                  />
                  <Tooltip
                    formatter={(v) => [fmtUGX(v), "Collected"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "#1a2332",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="collected" fill="#00C896" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card-glass p-4">
              <h3 className="mb-4 text-sm font-bold text-white">Occupancy by property</h3>
              {occupancyData.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/45">Add properties and units to see breakdown.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      dataKey="occupied_units"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {occupancyData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, _n, entry) => [
                        `${v} occupied · ${entry.payload.occupancy_rate}%`,
                        entry.payload.name,
                      ]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "#1a2332",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card-glass overflow-x-auto p-4">
            <h3 className="mb-3 text-sm font-bold text-white">Property occupancy</h3>
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/50">
                  <th className="pb-2 pr-4">Property</th>
                  <th className="pb-2 pr-4 text-right">Occupied</th>
                  <th className="pb-2 pr-4 text-right">Vacant</th>
                  <th className="pb-2 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {occupancyData.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-4">
                      <Link to={`/landlord/properties/${p.id}`} className="font-semibold text-[#00C896] hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-right text-white/70">{p.occupied_units}</td>
                    <td className="py-2 pr-4 text-right text-white/70">{p.vacant_units}</td>
                    <td className="py-2 text-right font-bold text-white">{p.occupancy_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/landlord/reports/arrears" className="rounded-lg border border-[#00C896]/35 px-4 py-2 font-bold text-[#00C896] hover:bg-[#00C896]/10">
              Arrears report →
            </Link>
            <Link to="/landlord/dashboard" className="rounded-lg border border-white/15 px-4 py-2 font-bold text-white/70 hover:text-white">
              Dashboard →
            </Link>
          </div>
        </div>
      )}
    </AppPageScaffold>
  );
}
