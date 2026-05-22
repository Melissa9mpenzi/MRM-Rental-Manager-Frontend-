import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Building2, Users, DoorOpen, DoorClosed, Wrench,
  AlertCircle, ChevronRight, CreditCard,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { dashboardApi } from "../../api/dashboardApi";
import { listingImageUrl } from "../../lib/mediaUrl";
import useAuthStore from "../../store/authStore";
import PlatformDistributionHint from "../../components/layout/PlatformDistributionHint";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

function StatCard({ icon: Icon, label, value, sub, color = "teal" }) {
  const colors = {
    teal: "bg-brand-tealLt/60 text-brand-teal",
    blue: "bg-sky-500/15 text-sky-300",
    red: "bg-red-500/15 text-red-300",
    gray: "bg-white/10 text-white/50",
  };
  return (
    <div className="stat-card">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-2xl font-bold leading-tight text-white">{value}</div>
        <div className="mt-0.5 text-xs font-semibold text-white/50">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-white/40">{sub}</div>}
      </div>
    </div>
  );
}

function OccupancyRing({ rate }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (rate / 100) * circ;
  const color = rate >= 80 ? "#00C896" : rate >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
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
      className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/[0.06]"
    >
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-brand-tealLt/30">
        {p.photo_path ? (
          <img
            src={p.photo_path.startsWith("http") ? p.photo_path : `${listingImageUrl(p.photo_path)}`}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 size={18} className="text-brand-teal" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{p.name}</div>
        <div className="text-xs text-white/45">
          {p.occupied_units}/{p.total_units} occupied
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#00C896]" style={{ width: `${p.occupancy_rate}%` }} />
        </div>
      </div>
      <ChevronRight size={14} className="flex-shrink-0 text-white/35 group-hover:text-[#00C896]" />
    </Link>
  );
}

const fmtUGX = (n) => `UGX ${new Intl.NumberFormat("en-UG").format(Math.round(n || 0))}`;

export default function LandlordDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000,
  });

  const sk = (h) => <div className={`card-glass animate-pulse border-white/[0.12] bg-white/[0.04] ${h}`} />;

  return (
    <AppPageScaffold variant="dashboard" hideHeader>
      <PlatformDistributionHint role={user?.role} />

      <div>
        <h2 className="text-xl font-bold text-white">Good day, {user?.full_name?.split(" ")[0]} 👋</h2>
        <p className="mt-0.5 text-sm text-white/55">Landlord overview — revenue, occupancy, and arrears</p>
      </div>

      {!user?.trusted_for_commerce && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <strong className="font-bold">Limited mode.</strong> Complete KYC and wait for admin approval to publish new
          listings and unlock payouts.{" "}
          {!user?.kyc_submitted_at ? (
            <Link to="/auth/kyc" className="font-semibold text-brand-teal underline-offset-2 hover:underline">
              Submit KYC →
            </Link>
          ) : user?.kyc_review_status === "pending" ? (
            <Link to="/verification-pending" className="font-semibold text-brand-teal underline-offset-2 hover:underline">
              View status →
            </Link>
          ) : user?.kyc_review_status === "rejected" ? (
            <Link to="/auth/kyc" className="font-semibold text-brand-teal underline-offset-2 hover:underline">
              Resubmit KYC →
            </Link>
          ) : null}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load dashboard stats. Check that the API is running and you are signed in.
        </div>
      )}

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
        <div className="card-glass">
          <h3 className="mb-4 text-sm font-bold text-white">Monthly rent collected (6 months)</h3>
          {isLoading ? (
            sk("h-44")
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats?.monthly_income || []} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8b9db0" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#8b9db0" }}
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
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: 12,
                    background: "rgba(18,26,34,0.95)",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="collected" fill="#00C896" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-glass">
          <h3 className="mb-4 text-sm font-bold text-white">Unit occupancy</h3>
          {isLoading ? (
            sk("h-44")
          ) : (stats?.total_units || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle size={28} className="mb-2 text-white/40" />
              <p className="text-sm text-white/50">No units yet.</p>
              <Link to="/landlord/properties" className="mt-1 text-sm font-semibold text-[#00C896] hover:underline">
                Add a property →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <OccupancyRing rate={stats?.occupancy_rate || 0} />
              <div className="flex-1 space-y-2">
                {[
                  { label: "Occupied", value: stats?.occupied_units, color: "bg-[#00C896]" },
                  { label: "Vacant", value: stats?.vacant_units, color: "bg-white/25" },
                  { label: "Maintenance", value: stats?.maintenance_units, color: "bg-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${color}`} />
                    <span className="flex-1 text-white/50">{label}</span>
                    <span className="font-bold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card-glass">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent properties</h3>
            <Link to="/landlord/properties" className="text-xs font-semibold text-[#00C896] hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            sk("h-32")
          ) : (stats?.recent_properties || []).length === 0 ? (
            <div className="py-6 text-center text-sm text-white/50">
              <Link to="/landlord/properties" className="font-semibold text-[#00C896] hover:underline">
                Add your first property →
              </Link>
            </div>
          ) : (
            (stats?.recent_properties || []).map((p) => <RecentProperty key={p.id} p={p} />)
          )}
        </div>

        <div className="card-glass">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Top arrears</h3>
            <Link to="/landlord/reports/arrears" className="text-xs font-semibold text-[#00C896] hover:underline">
              Full report
            </Link>
          </div>
          {isLoading ? (
            sk("h-32")
          ) : (stats?.top_arrears || []).length === 0 ? (
            <div className="py-6 text-center text-sm font-semibold text-[#00C896]">✓ All tenants paid up</div>
          ) : (
            (stats?.top_arrears || []).map((a) => (
              <Link
                key={a.id}
                to={`/landlord/tenants/${a.id}`}
                className="flex items-center justify-between rounded border-b border-white/[0.06] px-1 py-2.5 transition-colors hover:bg-white/[0.04]"
              >
                <div>
                  <div className="text-sm font-semibold text-white">{a.full_name}</div>
                  <div className="text-xs text-white/45">
                    {a.property_name} · {a.unit_number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-300">UGX {parseFloat(a.balance_due).toLocaleString()}</div>
                  <div className="text-xs text-red-400/90">{a.months_in_arrears}mo</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {!isLoading && (stats?.maintenance_units || 0) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
          <Wrench size={18} className="flex-shrink-0 text-amber-400" />
          <span className="text-sm font-semibold text-amber-100">
            {stats.maintenance_units} unit{stats.maintenance_units > 1 ? "s" : ""} under maintenance
          </span>
          <Link to="/landlord/properties" className="ml-auto text-xs font-bold text-amber-200 hover:underline">
            View →
          </Link>
        </div>
      )}
    </AppPageScaffold>
  );
}
