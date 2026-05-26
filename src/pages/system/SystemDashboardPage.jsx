import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Building2,
  FileCheck,
  Banknote,
  Shield,
  Cpu,
  CheckCircle2,
  Wallet,
  ScrollText,
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
  BarChart,
  Bar,
} from "recharts";
import { workspaceApi } from "../../api/workspaceApi";
import { governmentApi } from "../../api/governmentApi";
import SystemAdminRightRail from "../../components/system/SystemAdminRightRail";
import ProductionReadinessBanner from "../../components/layout/ProductionReadinessBanner";
import MiniSparkline from "../../components/system/MiniSparkline";

const fmt = (n) => new Intl.NumberFormat("en-UG", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
const fmtFull = (n) => new Intl.NumberFormat("en-UG").format(n || 0);
const fmtMoney = (n) => `UGX ${fmt(n)}`;
const fmtMoneyFull = (n) => `UGX ${fmtFull(Math.round(n || 0))}`;

const ROLE_COLORS = ["#00C896", "#3B82F6", "#A78BFA", "#22D3EE", "#F59E0B"];

function pctTrend(series, key) {
  const arr = series || [];
  if (arr.length < 2) return null;
  const prev = arr[arr.length - 2][key] ?? 0;
  const cur = arr[arr.length - 1][key] ?? 0;
  if (!prev) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
}

function platformHealthScore(live, summary) {
  const alerts = live?.system_alerts ?? 0;
  const openMaint = (summary?.maintenance_open ?? 0) + (summary?.maintenance_in_progress ?? 0);
  return Math.max(0, Math.min(100, 100 - alerts * 4 - openMaint * 2));
}

const BOTTOM_STRIP = [
  { icon: Users, label: "User Management", sub: "users", to: "/system/users", tone: "purple" },
  { icon: CheckCircle2, label: "Verification Center", sub: "pending", to: "/government/nira", tone: "cyan" },
  { icon: Building2, label: "Property Oversight", sub: "properties", to: "/system/properties", tone: "blue" },
  { icon: Wallet, label: "Payments Monitor", sub: "payments", to: "/system/payments", tone: "gold" },
  { icon: Cpu, label: "Fraud Detection (AI)", sub: "alerts", to: "/government/fraud", tone: "red" },
  { icon: ScrollText, label: "Audit Logs", sub: "logs", to: "/government/audit", tone: "violet" },
];

export default function SystemDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspace-admin-summary"],
    queryFn: () => workspaceApi.adminSummary(),
    refetchInterval: 30_000,
  });

  const { data: gov } = useQuery({
    queryKey: ["gov-overview"],
    queryFn: () => governmentApi.overview(),
    retry: false,
  });

  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ["gov-fraud", "all"],
    queryFn: () => governmentApi.fraudAlerts(),
    staleTime: 60_000,
  });

  const monthly = data?.monthly_platform ?? [];
  const platformChart = monthly.map((m) => ({
    month: m.month,
    users: m.users || 0,
    properties: m.properties || 0,
    revenue: Math.round((m.payment_volume || 0) / 1_000_000),
    contracts: m.leases ?? 0,
  }));

  const usersTotal = data?.users_total ?? 0;
  const propsTotal = data?.properties_total ?? 0;
  const contractsTotal = data?.tenants_active ?? 0;
  const revenueNum = data?.payments_rent_this_month ?? 0;
  const health = platformHealthScore(data?.platform_live, data);

  const byRole = data?.users_by_role ?? {};
  const govOfficers = (byRole.gov_nira || 0) + (byRole.gov_kcca || 0) + (byRole.gov_ura || 0);
  const rolePie = [
    { name: "Tenants", value: byRole.tenant || 0, pct: 0 },
    { name: "Landlords", value: byRole.landlord || 0, pct: 0 },
    { name: "Agents", value: (byRole.staff || 0) + (byRole.agent || 0), pct: 0 },
    { name: "Gov. Officers", value: govOfficers, pct: 0 },
  ];
  const roleTotal = rolePie.reduce((s, r) => s + r.value, 0) || 1;
  rolePie.forEach((r) => {
    r.pct = Math.round((100 * r.value) / roleTotal);
  });

  const revenueBars = monthly.map((m) => ({
    month: m.month,
    rentals: m.payment_volume || 0,
  }));

  const kpis = [
    {
      icon: Users,
      label: "Total Users",
      value: fmt(usersTotal),
      trend: pctTrend(monthly, "users"),
      tone: "purple",
      spark: monthly.map((m) => m.users || 0),
    },
    {
      icon: Building2,
      label: "Total Properties",
      value: fmt(propsTotal),
      trend: pctTrend(monthly, "properties"),
      tone: "blue",
      spark: monthly.map((m) => m.properties || 0),
    },
    {
      icon: Banknote,
      label: "Total Revenue (UGX)",
      value: fmtMoney(revenueNum),
      trend: pctTrend(monthly, "payment_volume"),
      tone: "gold",
      spark: monthly.map((m) => m.payment_volume || 0),
    },
    {
      icon: FileCheck,
      label: "Active Contracts",
      value: fmt(contractsTotal),
      trend: null,
      tone: "emerald",
      spark: monthly.map((m) => m.payment_volume || 0),
    },
  ];

  const verifiedUserPct =
    usersTotal > 0 ? Math.round((100 * (gov?.verified_users ?? 0)) / usersTotal) : null;
  const verifiedPropPct =
    propsTotal > 0 ? Math.round((100 * (gov?.verified_properties ?? 0)) / propsTotal) : null;
  const taxRevenueUgx = gov?.tax_revenue_ugx ?? revenueNum ?? 0;

  const govCards = [
    {
      code: "NIRA",
      title: "Identity Verification",
      today: gov?.verified_users ?? 0,
      rate: verifiedUserPct,
      to: "/government/nira",
      className: "sys-gov-integ--nira",
    },
    {
      code: "KCCA",
      title: "Property Verification",
      today: gov?.verified_properties ?? 0,
      rate: verifiedPropPct,
      to: "/government/kcca",
      className: "sys-gov-integ--kcca",
    },
    {
      code: "URA",
      title: "Tax Compliance",
      today: Math.round(taxRevenueUgx),
      rate: taxRevenueUgx > 0 ? 100 : 0,
      to: "/government/ura",
      className: "sys-gov-integ--ura",
    },
  ];

  const bottomValues = {
    users: fmtFull(usersTotal),
    pending: fmtFull(gov?.pending_kyc ?? 0),
    properties: fmtFull(propsTotal),
    payments: fmtMoney(revenueNum),
    alerts: fmtFull(gov?.flagged_accounts ?? fraudAlerts.length),
    logs: fmtFull(data?.live_data?.payments_total ?? (data?.recent_audit ?? []).length),
  };

  return (
    <div className="sys-dashboard">
      <ProductionReadinessBanner />
      {isError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load platform summary. Ensure the API is running.
        </div>
      )}

      {!isLoading && data?.live_data && !data.live_data.has_rental_operations && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
          <strong className="font-semibold">Live data only — no demo seed.</strong> You have real sign-ups (
          {fmtFull(data.live_data.users_total)} users, {fmtFull(data.live_data.properties)} properties) but no tenants,
          leases, or rent payments yet. Add tenants and record payments in the landlord portal to populate revenue and
          compliance dashboards.
        </div>
      )}

      <div className="sys-dashboard__kpis">
        {kpis.map(({ icon: Icon, label, value, trend, tone, spark }) => (
          <div key={label} className={`sys-kpi-card sys-kpi-card--${tone}`}>
            <div className="flex items-start justify-between">
              <div className={`sys-kpi-card__icon sys-kpi-card__icon--${tone}`}>
                <Icon size={20} />
              </div>
              {trend != null && (
                <span className={`sys-kpi-card__trend ${trend >= 0 ? "sys-kpi-card__trend--up" : "sys-kpi-card__trend--down"}`}>
                  {trend >= 0 ? "+" : ""}
                  {trend.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="sys-kpi-card__label">{label}</p>
            <p className="sys-kpi-card__value">{isLoading ? "…" : value}</p>
            {spark?.length > 0 && <MiniSparkline values={spark} color={tone === "gold" ? "#fbbf24" : tone === "purple" ? "#a78bfa" : "#60a5fa"} />}
          </div>
        ))}
      </div>

      <div className="sys-dashboard__body">
        <div className="sys-dashboard__main">
          <div className="sys-panel sys-panel--chart">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="sys-panel__title">Platform Overview</h2>
              <span className="text-[10px] text-white/40">Last 6 months · live database</span>
            </div>
            <div className="mt-3 h-56">
              {platformChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={platformChart}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line yAxisId="left" type="monotone" dataKey="users" name="Users" stroke="#00C896" strokeWidth={2} dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="properties" name="Properties" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (M UGX)" stroke="#FBBF24" strokeWidth={2} dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="contracts" name="Active leases" stroke="#A78BFA" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-white/45">
                  {isLoading ? "Loading…" : "No trend data yet."}
                </p>
              )}
            </div>
          </div>

          <div className="sys-dashboard__mid-grid">
            <div className="sys-panel">
              <h2 className="sys-panel__title">Users by Role</h2>
              <div className="relative mt-2 h-44">
                {roleTotal > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={rolePie.filter((r) => r.value > 0)} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={62}>
                          {rolePie.map((_, i) => (
                            <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-white">{isLoading ? "…" : fmt(usersTotal)}</span>
                      <span className="text-[10px] text-white/45">users</span>
                    </div>
                  </>
                ) : (
                  <p className="flex h-full items-center justify-center text-xs text-white/45">No users yet</p>
                )}
              </div>
              <ul className="mt-2 space-y-1.5">
                {rolePie.map((r, i) => (
                  <li key={r.name} className="flex justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-white/70">
                      <span className="h-2 w-2 rounded-full" style={{ background: ROLE_COLORS[i] }} />
                      {r.name}
                    </span>
                    <span className="font-semibold text-white">
                      {r.pct}% ({fmt(r.value)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sys-panel">
              <h2 className="sys-panel__title">Government Integration Status</h2>
              <div className="mt-3 space-y-2">
                {govCards.map((g) => (
                  <Link key={g.code} to={g.to} className={`sys-gov-integ ${g.className}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white">
                          {g.code} <span className="font-normal text-white/50">· {g.title}</span>
                        </p>
                        <p className="mt-1 text-[10px] text-emerald-400/90">● Active</p>
                      </div>
                      <Shield size={18} className="opacity-60" />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                      <span className="text-white/45">
                        {g.code === "URA" ? "Revenue (UGX)" : "Count"}:{" "}
                        <strong className="text-white">
                          {isLoading ? "…" : g.code === "URA" ? fmtMoney(g.today) : fmtFull(g.today)}
                        </strong>
                      </span>
                      <span className="text-right text-white/45">
                        {g.rate != null ? (
                          <>
                            Rate: <strong className="text-emerald-400">{g.rate}%</strong>
                          </>
                        ) : (
                          <span className="text-white/35">—</span>
                        )}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="sys-panel">
              <h2 className="sys-panel__title">Revenue Analytics</h2>
              <p className="text-[10px] text-white/40">Rent volume by month (UGX)</p>
              <div className="mt-2 h-44">
                {revenueBars.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueBars}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} tickFormatter={(v) => fmt(v)} />
                      <Tooltip formatter={(v) => fmtMoneyFull(v)} contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                      <Bar dataKey="rentals" name="Rentals" fill="#00C896" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex h-full items-center justify-center text-xs text-white/45">No revenue data</p>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-white/50">
                <span>Rentals {fmtMoney(revenueNum)}</span>
                <span>Commissions ~{fmtMoney(revenueNum * 0.12)}</span>
                <span>Taxes (URA) ~{fmtMoney(revenueNum * 0.1)}</span>
              </div>
            </div>
          </div>

          <div className="sys-bottom-strip">
            {BOTTOM_STRIP.map(({ icon: Icon, label, sub, to, tone }) => (
              <Link key={label} to={to} className={`sys-bottom-card sys-bottom-card--${tone}`}>
                <Icon size={22} className="sys-bottom-card__icon" />
                <p className="sys-bottom-card__label">{label}</p>
                <p className="sys-bottom-card__value">{isLoading ? "…" : bottomValues[sub] ?? "—"}</p>
              </Link>
            ))}
          </div>
        </div>

        <SystemAdminRightRail summary={data} gov={gov} fraudAlerts={fraudAlerts} health={health} />
      </div>
    </div>
  );
}
