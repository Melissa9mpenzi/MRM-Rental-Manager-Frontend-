import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Building2,
  FileCheck,
  Banknote,
  Activity,
  Shield,
  Flag,
  Database,
  Key,
  Megaphone,
  LifeBuoy,
  UserCog,
  Plug,
  Archive,
  ScrollText,
  Wrench,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { workspaceApi } from "../../api/workspaceApi";
import { governmentApi } from "../../api/governmentApi";
import MiniSparkline from "../../components/system/MiniSparkline";
import HealthRing from "../../components/system/HealthRing";
import PlatformActivityLive from "../../components/system/PlatformActivityLive";

const fmt = (n) => new Intl.NumberFormat("en-UG", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
const fmtFull = (n) => new Intl.NumberFormat("en-UG").format(n || 0);
const fmtMoney = (n) => `UGX ${fmt(n)}`;

const SPARK_COLORS = { purple: "#a78bfa", blue: "#60a5fa", emerald: "#00c896", orange: "#fbbf24" };

function formatLiveUpdated(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const sec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (sec < 60) return `Updated ${sec}s ago`;
  return `Updated ${Math.floor(sec / 60)}m ago`;
}

function platformHealthScore(live, summary) {
  const alerts = live?.system_alerts ?? 0;
  const openMaint = (summary?.maintenance_open ?? 0) + (summary?.maintenance_in_progress ?? 0);
  const penalty = alerts * 4 + openMaint * 2;
  return Math.max(0, Math.min(100, 100 - penalty));
}

const SYS_TOOLS = [
  { icon: Key, label: "Permissions", to: "/system/users", tone: "text-purple-400" },
  { icon: UserCog, label: "Role Manager", to: "/system/users", tone: "text-blue-400" },
  { icon: Flag, label: "Feature Flags", to: "/system/settings", tone: "text-emerald-400" },
  { icon: Plug, label: "API Integrations", to: "/system/settings", tone: "text-cyan-400" },
  { icon: Archive, label: "Backup & Restore", to: "/system/settings", tone: "text-amber-400" },
  { icon: ScrollText, label: "System Logs", to: "/government/audit", tone: "text-violet-400" },
  { icon: Shield, label: "Security Settings", to: "/government/fraud", tone: "text-red-400" },
  { icon: Database, label: "Database", to: "/government/audit", tone: "text-sky-400" },
  { icon: Wrench, label: "Maintenance", to: "/system/settings", tone: "text-orange-400" },
];

const ROLE_ORDER = [
  { key: "tenant", label: "Tenants", icon: Users },
  { key: "landlord", label: "Landlords", icon: Building2 },
  { key: "staff", label: "Agents", icon: Users },
  { key: "gov", label: "Government Officers", icon: Shield },
  { key: "system_admin", label: "Platform Admins", icon: Activity },
];

function buildRoleDisplay(byRole) {
  const govTotal =
    (byRole?.gov_nira || 0) + (byRole?.gov_kcca || 0) + (byRole?.gov_ura || 0);
  const merged = { ...byRole, gov: govTotal };
  return ROLE_ORDER.map(({ key, label, icon }) => ({
    label,
    icon,
    count:
      key === "staff"
        ? (merged.staff || 0) + (merged.agent || 0)
        : merged[key] ?? 0,
  }));
}

export default function SystemDashboardPage() {
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["workspace-admin-summary"],
    queryFn: () => workspaceApi.adminSummary(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  const { data: gov } = useQuery({
    queryKey: ["gov-overview"],
    queryFn: () => governmentApi.overview(),
    retry: false,
  });

  const monthly = data?.monthly_platform ?? [];
  const userGrowth = monthly.map((m) => ({
    month: m.month,
    users: m.users || 0,
    properties: m.properties || 0,
  }));

  const usersTotal = data?.users_total ?? 0;
  const propsTotal = data?.properties_total ?? 0;
  const contractsTotal = data?.tenants_active ?? 0;
  const revenueNum = data?.payments_rent_this_month ?? 0;
  const revenueTotal = fmtMoney(revenueNum);
  const revenuePie = data?.revenue_breakdown ?? [];

  const userSpark = monthly.map((m) => m.users || 0);
  const propSpark = monthly.map((m) => m.properties || 0);
  const paySpark = monthly.map((m) => m.payment_volume || 0);

  const platformLive = data?.platform_live;
  const health = platformHealthScore(platformLive, data);
  const healthLabel = health >= 90 ? "Excellent" : health >= 70 ? "Good" : health >= 50 ? "Fair" : "Needs attention";

  const govAgencies = [
    {
      code: "NIRA",
      label: "Verifications",
      value: fmtFull(gov?.verified_users ?? 0),
      to: "/government/nira",
      logoClass: "sys-agency-card__logo--nira",
    },
    {
      code: "KCCA",
      label: "Properties Verified",
      value: fmtFull(gov?.verified_properties ?? 0),
      to: "/government/kcca",
      logoClass: "sys-agency-card__logo--kcca",
    },
    {
      code: "URA",
      label: "Tax Revenue (MTD)",
      value: fmtMoney(gov?.tax_revenue_ugx ?? revenueNum),
      to: "/government/ura",
      logoClass: "sys-agency-card__logo--ura",
    },
  ];

  const kpi = [
    {
      icon: Users,
      label: "Total Users",
      value: fmt(usersTotal),
      tone: "purple",
      spark: userSpark,
      ring: false,
    },
    {
      icon: Building2,
      label: "Total Properties",
      value: fmt(propsTotal),
      tone: "blue",
      spark: propSpark,
      ring: false,
    },
    {
      icon: FileCheck,
      label: "Active Tenants",
      value: fmt(contractsTotal),
      tone: "emerald",
      spark: userSpark,
      ring: false,
    },
    {
      icon: Banknote,
      label: "Rent Revenue (MTD)",
      value: revenueTotal,
      tone: "orange",
      spark: paySpark,
      ring: false,
    },
    {
      icon: Activity,
      label: "Platform Health",
      value: `${health.toFixed(0)}%`,
      trend: healthLabel,
      tone: "emerald",
      spark: null,
      ring: true,
    },
  ];

  const roles = buildRoleDisplay(data?.users_by_role);
  const mapNodes = platformLive?.map_nodes ?? [];
  const liveUpdated = formatLiveUpdated(platformLive?.updated_at);

  return (
    <div className="space-y-5">
      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load platform summary. Check that the API is running.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpi.map(({ icon: Icon, label, value, trend, tone, spark, ring }) => (
          <div key={label} className="sys-stat-card">
            <div className="flex items-start justify-between gap-2">
              <div className={`gov-stat-card__icon gov-stat-card__icon--${tone} sys-stat-card__icon--${tone}`}>
                <Icon size={18} />
              </div>
              {ring ? (
                <HealthRing value={health} size={52} />
              ) : spark?.length > 0 ? (
                <MiniSparkline values={spark} color={SPARK_COLORS[tone] || SPARK_COLORS.emerald} />
              ) : null}
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/45">{label}</p>
            <p className="mt-0.5 text-lg font-bold text-white">{isLoading ? "…" : value}</p>
            {ring && trend && (
              <p className="mt-1 text-[10px] font-medium text-emerald-400">{trend}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="sys-panel xl:col-span-1 !p-0 overflow-hidden">
          <PlatformActivityLive
            live={platformLive}
            mapNodes={mapNodes}
            loading={isLoading || (isFetching && !isLoading)}
            updatedLabel={liveUpdated}
          />
        </div>

        <div className="sys-panel xl:col-span-1">
          <h2 className="sys-panel__title">User & Property Growth</h2>
          <p className="text-[10px] text-white/40">Last 6 months (from database)</p>
          <div className="mt-2 h-48">
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="users" name="New users" stroke="#00C896" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="properties" name="New properties" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-white/45">
                {isLoading ? "Loading…" : "No signups or properties yet."}
              </p>
            )}
          </div>
        </div>

        <div className="sys-panel xl:col-span-1">
          <h2 className="sys-panel__title">Revenue Overview (UGX)</h2>
          <div className="relative mt-2 h-44">
            {revenuePie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenuePie} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={68}>
                      {revenuePie.map((e) => (
                        <Cell key={e.name} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-white/45">Total (MTD)</span>
                  <span className="text-sm font-bold text-white">{isLoading ? "…" : revenueTotal}</span>
                </div>
              </>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-white/45">
                {isLoading ? "Loading…" : "No payments recorded this month."}
              </p>
            )}
          </div>
          {revenuePie.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-white/55">
              {revenuePie.map((e) => (
                <span key={e.name} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                  {e.name} ({e.value}%)
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="sys-panel">
          <div className="flex items-center justify-between">
            <h2 className="sys-panel__title">User Roles & Management</h2>
            <Link to="/system/users" className="text-xs font-semibold text-emerald-400 hover:underline">
              Manage →
            </Link>
          </div>
          <ul className="mt-3 space-y-0">
            {roles.map(({ label, icon: Icon, count }) => (
              <li key={label} className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0">
                <span className="flex items-center gap-2 text-sm text-white/75">
                  <Icon size={16} className="text-white/35" />
                  {label}
                </span>
                <span className="font-bold text-white">{isLoading ? "…" : fmtFull(count)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sys-panel">
          <h2 className="sys-panel__title">Government Agencies Overview</h2>
          <div className="mt-3 space-y-2">
            {govAgencies.map((a) => (
              <Link key={a.code} to={a.to} className="sys-agency-card">
                <div className="flex items-start gap-3">
                  <span className={`sys-agency-card__logo ${a.logoClass}`}>{a.code}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white">{a.code}</p>
                    <p className="text-[10px] text-white/45">{a.label}</p>
                    <p className="mt-1 text-base font-bold text-white">{isLoading && !gov ? "…" : a.value}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1 text-[9px]">
            <span className="sys-flow-step">1. User KYC (NIRA)</span>
            <span className="text-white/25">→</span>
            <span className="sys-flow-step">2. Property Check (KCCA)</span>
            <span className="text-white/25">→</span>
            <span className="sys-flow-step">3. Tax Compliance (URA)</span>
            <span className="text-white/25">→</span>
            <span className="sys-flow-step sys-flow-step--active">4. Approval (Platform)</span>
          </div>
        </div>

        <div className="sys-panel">
          <h2 className="sys-panel__title">System Administration</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {SYS_TOOLS.map(({ icon: Icon, label, to, tone }) => (
              <Link key={label} to={to} className="sys-tool-tile">
                <Icon size={20} className={tone} />
                {label}
              </Link>
            ))}
          </div>
          <Link
            to="/system/announcements"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs text-white/60 hover:border-emerald-500/25 hover:text-emerald-400"
          >
            <Megaphone size={14} />
            Announcements
          </Link>
          <Link
            to="/system/support"
            className="mt-1 flex items-center justify-center gap-2 text-xs text-white/60 hover:text-emerald-400"
          >
            <LifeBuoy size={14} />
            Support tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
