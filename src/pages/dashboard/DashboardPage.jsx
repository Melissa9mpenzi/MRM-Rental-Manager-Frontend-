import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Building2, Users, DoorOpen, DoorClosed, Wrench,
  TrendingUp, AlertCircle, ChevronRight, CreditCard,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { dashboardApi } from "../../api/dashboardApi";
import useAuthStore from "../../store/authStore";

function StatCard({ icon: Icon, label, value, sub, color = "teal" }) {
  const colors = { teal: "bg-brand-tealLt text-brand-teal", blue: "bg-blue-50 text-blue-600", red: "bg-red-50 text-red-600", gray: "bg-gray-100 text-gray-500" };
  return (
    <div className="card flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-brand-dark leading-tight truncate">{value}</div>
        <div className="text-xs font-semibold text-brand-mid mt-0.5">{label}</div>
        {sub && <div className="text-xs text-brand-mid/70 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function OccupancyRing({ rate }) {
  const r = 28, circ = 2 * Math.PI * r;
  const filled = (rate / 100) * circ;
  const color = rate >= 80 ? "#5e8d83" : rate >= 50 ? "#d97706" : "#ef4444";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f0f4f4" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}
        style={{ transform: "rotate(90deg)", transformOrigin: "36px 36px" }}>
        {rate}%
      </text>
    </svg>
  );
}

function RecentProperty({ p }) {
  return (
    <Link to={`/properties/${p.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-tealLt/40 transition-colors group">
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-brand-tealLt">
        {p.photo_path
          ? <img src={`http://localhost:8000${p.photo_path}`} alt={p.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Building2 size={18} className="text-brand-teal"/></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-brand-dark text-sm truncate">{p.name}</div>
        <div className="text-xs text-brand-mid">{p.occupied_units}/{p.total_units} occupied</div>
        <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-brand-teal rounded-full" style={{ width: `${p.occupancy_rate}%` }} />
        </div>
      </div>
      <ChevronRight size={14} className="text-brand-mid group-hover:text-brand-teal flex-shrink-0" />
    </Link>
  );
}

const fmtUGX = n => `UGX ${new Intl.NumberFormat("en-UG").format(Math.round(n || 0))}`;

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,
  });

  const sk = (h) => <div className={`card animate-pulse bg-brand-tealLt/30 ${h}`} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-dark">Good day, {user?.full_name?.split(" ")[0]} 👋</h2>
        <p className="text-brand-mid text-sm mt-0.5">Here's your portfolio at a glance</p>
      </div>

      {/* KPI row 1 */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i}>{sk("h-24")}</div>)}</div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Building2}  label="Properties"     value={stats?.total_properties}  sub={`${stats?.total_units} units`} />
          <StatCard icon={Users}      label="Active Tenants" value={stats?.total_tenants}      sub={`${stats?.occupancy_rate}% occupancy`} />
          <StatCard icon={CreditCard} label="Collected (this month)" value={fmtUGX(stats?.this_month_collected)} color="blue" />
          <StatCard icon={AlertCircle} label="Total Arrears" value={fmtUGX(stats?.total_arrears)} sub={`${stats?.tenants_in_arrears} tenant(s)`} color="red" />
        </div>
      )}

      {/* Row 2: income chart + occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="card">
          <h3 className="text-sm font-bold text-brand-dark mb-4">Monthly Rent Collected (6 months)</h3>
          {isLoading ? sk("h-44") : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.monthly_income || []} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f0ef" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#576e6a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#576e6a" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip formatter={(v) => [`UGX ${v.toLocaleString()}`, "Collected"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #d4e8e5", fontSize: 12 }} />
                <Bar dataKey="collected" fill="#5e8d83" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Occupancy ring */}
        <div className="card">
          <h3 className="text-sm font-bold text-brand-dark mb-4">Unit Occupancy</h3>
          {isLoading ? sk("h-44") : (stats?.total_units || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle size={28} className="text-brand-mid mb-2" />
              <p className="text-brand-mid text-sm">No units yet.</p>
              <Link to="/properties" className="text-brand-teal text-sm font-semibold mt-1 hover:underline">Add a property →</Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <OccupancyRing rate={stats?.occupancy_rate || 0} />
              <div className="space-y-2 flex-1">
                {[
                  { label:"Occupied",    value: stats?.occupied_units,    color:"bg-brand-teal" },
                  { label:"Vacant",      value: stats?.vacant_units,      color:"bg-gray-300" },
                  { label:"Maintenance", value: stats?.maintenance_units, color:"bg-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                    <span className="text-brand-mid flex-1">{label}</span>
                    <span className="font-bold text-brand-dark">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: recent properties + top arrears */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-brand-dark">Recent Properties</h3>
            <Link to="/properties" className="text-xs text-brand-teal font-semibold hover:underline">View all</Link>
          </div>
          {isLoading ? sk("h-32") : (stats?.recent_properties || []).length === 0 ? (
            <div className="text-center py-6 text-brand-mid text-sm">
              <Link to="/properties" className="text-brand-teal font-semibold hover:underline">Add your first property →</Link>
            </div>
          ) : (stats?.recent_properties || []).map(p => <RecentProperty key={p.id} p={p} />)}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-brand-dark">Top Arrears</h3>
            <Link to="/reports/arrears" className="text-xs text-brand-teal font-semibold hover:underline">Full report</Link>
          </div>
          {isLoading ? sk("h-32") : (stats?.top_arrears || []).length === 0 ? (
            <div className="text-center py-6 text-emerald-600 text-sm font-semibold">✓ All tenants paid up</div>
          ) : (stats?.top_arrears || []).map(a => (
            <Link key={a.id} to={`/tenants/${a.id}`}
              className="flex items-center justify-between py-2.5 border-b border-brand-tealLt/50 hover:bg-brand-tealLt/20 px-1 rounded transition-colors">
              <div>
                <div className="text-sm font-semibold text-brand-dark">{a.full_name}</div>
                <div className="text-xs text-brand-mid">{a.property_name} · {a.unit_number}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-red-600">UGX {parseFloat(a.balance_due).toLocaleString()}</div>
                <div className="text-xs text-red-400">{a.months_in_arrears}mo</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Maintenance alert */}
      {!isLoading && (stats?.maintenance_units || 0) > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <Wrench size={18} className="text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 font-semibold">
            {stats.maintenance_units} unit{stats.maintenance_units > 1 ? "s" : ""} under maintenance
          </span>
          <Link to="/properties" className="ml-auto text-xs text-amber-700 font-bold hover:underline">View →</Link>
        </div>
      )}
    </div>
  );
}