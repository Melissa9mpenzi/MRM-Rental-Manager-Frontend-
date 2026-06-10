import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Building2, Users, Wrench,
  AlertCircle, ChevronRight, CreditCard, Sparkles,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { dashboardApi } from "../../api/dashboardApi";
import { propertyPhotoUrl } from "../../lib/mediaUrl";
import useAuthStore from "../../store/authStore";
import PlatformDistributionHint from "../../components/layout/PlatformDistributionHint";
import KycStatusBanner from "../../components/domain/KycStatusBanner";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import ActivityTimeline from "../../components/enterprise/ActivityTimeline";
import { platformApi } from "../../api/platformApi";

function StatCard({ icon: Icon, label, value, sub, color = "teal" }) {
  const colors = {
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-sky-50 text-sky-600",
    red: "bg-red-50 text-red-500",
    gray: "bg-gray-50 text-gray-400",
  };
  return (
    <div className="stat-card">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-2xl font-bold leading-tight text-gray-900">{value}</div>
        <div className="mt-0.5 text-xs font-semibold text-gray-500">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  );
}

function OccupancyRing({ rate }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (rate / 100) * circ;
  const color = rate >= 80 ? "#0D9488" : rate >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill={color}
        style={{ transform: "rotate(90deg)", transformOrigin: "36px 36px" }}
      >
        {rate}%
      </text>
    </svg>
  );
}

function RecentProperty({ p }) {
  return (
    <Link
      to={`/landlord/properties/${p.id}`}
      className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
    >
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-teal-50">
        {propertyPhotoUrl(p.photo_path) ? (
          <img
            src={propertyPhotoUrl(p.photo_path)}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 size={18} className="text-teal-600" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-gray-800">{p.name}</div>
        <div className="text-xs text-gray-500">
          {p.occupied_units}/{p.total_units} occupied
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-teal-500" style={{ width: `${p.occupancy_rate}%` }} />
        </div>
      </div>
      <ChevronRight size={14} className="flex-shrink-0 text-gray-300 group-hover:text-teal-600" />
    </Link>
  );
}

const fmtUGX = (n) => `UGX ${new Intl.NumberFormat("en-UG").format(Math.round(n || 0))}`;

export default function LandlordDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["platform-activity"],
    queryFn: () => platformApi.activity(10),
    refetchInterval: 60000,
  });

  const sk = (h) => <div className={`rounded-xl animate-pulse bg-gray-100 ${h}`} />;

  return (
    <AppPageScaffold variant="dashboard" hideHeader>
      <PlatformDistributionHint role={user?.role} />

      <div>
        <h2 className="text-xl font-bold text-gray-900">Good day, {user?.full_name?.split(" ")[0]} 👋</h2>
        <p className="mt-0.5 text-sm text-gray-500">Landlord overview — revenue, occupancy, and arrears</p>
      </div>

      <KycStatusBanner user={user} roleLabel="landlord" />

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load dashboard stats.{" "}
          <button type="button" className="ml-2 font-bold underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {/* AI insights */}
      <div className="enterprise-card flex flex-col gap-2 border-violet-100 bg-violet-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-violet-600" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">AI insights</p>
            <p className="mt-1 text-sm text-gray-700">
              {stats?.tenants_in_arrears > 0
                ? `${stats.tenants_in_arrears} tenant(s) in arrears — consider a payment reminder.`
                : "Occupancy and collections look healthy. Suggested action: publish a vacant unit on the marketplace."}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-gray-400">Powered by platform analytics</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>{sk("h-24")}</div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={Building2} label="Properties" value={stats?.total_properties} sub={`${stats?.total_units} units`} />
          <StatCard icon={Users} label="Active Tenants" value={stats?.total_tenants} sub={`${stats?.occupancy_rate}% occupancy`} />
          <StatCard icon={CreditCard} label="Collected (this month)" value={fmtUGX(stats?.this_month_collected)} color="blue" />
          <StatCard icon={AlertCircle} label="Total Arrears" value={fmtUGX(stats?.total_arrears)} sub={`${stats?.tenants_in_arrears} tenant(s)`} color="red" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly income chart */}
        <div className="card-glass">
          <h3 className="mb-4 text-sm font-bold text-gray-800">Monthly rent collected (6 months)</h3>
          {isLoading ? (
            sk("h-44")
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.monthly_income || []} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                  }
                />
                <Tooltip
                  formatter={(v) => [`UGX ${Number(v).toLocaleString()}`, "Collected"]}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                    background: "#ffffff",
                    color: "#111827",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="collected" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Occupancy */}
        <div className="card-glass">
          <h3 className="mb-4 text-sm font-bold text-gray-800">Unit occupancy</h3>
          {isLoading ? (
            sk("h-44")
          ) : (stats?.total_units || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle size={28} className="mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No units yet.</p>
              <Link to="/landlord/properties" className="mt-1 text-sm font-semibold text-teal-600 hover:underline">
                Add a property →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <OccupancyRing rate={stats?.occupancy_rate || 0} />
              <div className="flex-1 space-y-2">
                {[
                  { label: "Occupied", value: stats?.occupied_units, color: "bg-teal-500" },
                  { label: "Vacant", value: stats?.vacant_units, color: "bg-gray-200" },
                  { label: "Maintenance", value: stats?.maintenance_units, color: "bg-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${color}`} />
                    <span className="flex-1 text-gray-500">{label}</span>
                    <span className="font-bold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent properties */}
        <div className="card-glass">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Recent properties</h3>
            <Link to="/landlord/properties" className="text-xs font-semibold text-teal-600 hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            sk("h-32")
          ) : (stats?.recent_properties || []).length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              <Link to="/landlord/properties" className="font-semibold text-teal-600 hover:underline">
                Add your first property →
              </Link>
            </div>
          ) : (
            (stats?.recent_properties || []).map((p) => <RecentProperty key={p.id} p={p} />)
          )}
        </div>

        {/* Top arrears */}
        <div className="card-glass">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Top arrears</h3>
            <Link to="/landlord/reports/arrears" className="text-xs font-semibold text-teal-600 hover:underline">
              Full report
            </Link>
          </div>
          {isLoading ? (
            sk("h-32")
          ) : (stats?.top_arrears || []).length === 0 ? (
            <div className="py-6 text-center text-sm font-semibold text-teal-600">✓ All tenants paid up</div>
          ) : (
            (stats?.top_arrears || []).map((a) => (
              <Link
                key={a.id}
                to={`/landlord/tenants/${a.id}`}
                className="flex items-center justify-between rounded border-b border-gray-50 px-1 py-2.5 transition-colors hover:bg-gray-50"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800">{a.full_name}</div>
                  <div className="text-xs text-gray-400">
                    {a.property_name} · {a.unit_number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">UGX {parseFloat(a.balance_due).toLocaleString()}</div>
                  <div className="text-xs text-red-500">{a.months_in_arrears}mo</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <ActivityTimeline items={activity} title="Compliance & payments timeline" />

      {!isLoading && (stats?.maintenance_units || 0) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <Wrench size={18} className="flex-shrink-0 text-amber-500" />
          <span className="text-sm font-semibold text-amber-800">
            {stats.maintenance_units} unit{stats.maintenance_units > 1 ? "s" : ""} under maintenance
          </span>
          <Link to="/landlord/properties" className="ml-auto text-xs font-bold text-amber-600 hover:underline">
            View →
          </Link>
        </div>
      )}
    </AppPageScaffold>
  );
}
