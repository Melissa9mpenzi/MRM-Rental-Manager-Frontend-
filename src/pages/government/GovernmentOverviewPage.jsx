import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  AlertTriangle,
  Building2,
  Banknote,
  FileCheck,
  UserPlus,
  FileText,
  Megaphone,
  Shield,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { governmentApi } from "../../api/governmentApi";

const fmt = (n) => new Intl.NumberFormat("en-UG", { notation: "compact" }).format(n || 0);

const QUICK_ACTIONS = [
  { icon: UserPlus, label: "Add New Officer", to: "/government/officers" },
  { icon: Shield, label: "New Verification Request", to: "/government/nira" },
  { icon: FileText, label: "Generate Report", to: "/government/analytics" },
  { icon: Megaphone, label: "System Announcement", to: "/government/settings" },
];

const SAMPLE_ALERTS = [
  { level: "high", text: "High fraud detected in Mukono district", time: "12 min ago" },
  { level: "medium", text: "KCCA inspection backlog exceeds threshold", time: "1 hr ago" },
  { level: "info", text: "URA monthly compliance report ready", time: "3 hrs ago" },
];

export default function GovernmentOverviewPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["gov-overview"],
    queryFn: () => governmentApi.overview(),
    refetchInterval: 60000,
  });

  const cards = [
    { icon: Users, label: "Verified Users", value: data?.verified_users, trend: "+12.5%", tone: "emerald" },
    { icon: Clock, label: "Pending KYC", value: data?.pending_kyc, trend: "-5.3%", tone: "amber" },
    { icon: AlertTriangle, label: "Flagged Accounts", value: data?.flagged_accounts, trend: "+8.2%", tone: "red" },
    { icon: Building2, label: "Verified Properties", value: data?.verified_properties, trend: "+15.7%", tone: "cyan" },
    { icon: Banknote, label: "Tax Revenue (UGX)", value: `UGX ${fmt(data?.tax_revenue_ugx)}`, trend: "+16.3%", tone: "purple" },
    { icon: FileCheck, label: "Active Contracts", value: data?.active_contracts, trend: "+11.4%", tone: "emerald" },
  ];

  const breakdown = data?.verification_breakdown || [];
  const trend = data?.activity_trend || [];
  const regions = data?.regional_compliance || [];

  return (
    <div className="space-y-5">
      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load government overview. Sign in as a government officer and ensure the API is running.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ icon: Icon, label, value, trend, tone }) => (
          <div key={label} className="gov-stat-card">
            <div className="flex items-start justify-between gap-2">
              <div className={`gov-stat-card__icon gov-stat-card__icon--${tone}`}>
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-medium text-emerald-400/80">{trend}</span>
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-white/45">{label}</p>
            <p className="mt-1 text-xl font-bold text-white">{isLoading ? "…" : value ?? "—"}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="gov-glass p-4 xl:col-span-1">
          <h2 className="gov-panel-title">Verification Overview</h2>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={72}>
                  {breakdown.map((e) => (
                    <Cell key={e.name} fill={e.color || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gov-glass p-4 xl:col-span-2">
          <h2 className="gov-panel-title">National Activity Trend</h2>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="nira" name="NIRA" stroke="#00C896" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="kcca" name="KCCA" stroke="#22D3EE" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ura" name="URA" stroke="#A78BFA" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="gov-glass p-4 lg:col-span-2">
          <h2 className="gov-panel-title">Compliance by Region</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((r) => (
              <div
                key={r.district}
                className="rounded-lg border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent px-3 py-2.5"
              >
                <p className="text-xs text-white/50">{r.district}</p>
                <p className="text-lg font-bold text-emerald-300">{r.score}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="gov-glass p-4">
            <h2 className="gov-panel-title">Quick Actions</h2>
            <div className="mt-3 space-y-2">
              {QUICK_ACTIONS.map(({ icon: Icon, label, to }) => (
                <Link key={label} to={to} className="gov-quick-action">
                  <Icon size={16} className="text-emerald-400" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="gov-glass p-4">
            <h2 className="gov-panel-title">Recent Alerts</h2>
            <div className="mt-2">
              {SAMPLE_ALERTS.map((a) => (
                <div key={a.text} className="gov-alert-item">
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      a.level === "high" ? "bg-red-400" : a.level === "medium" ? "bg-amber-400" : "bg-cyan-400"
                    }`}
                  />
                  <div>
                    <p className="text-white/85">{a.text}</p>
                    <p className="text-[10px] text-white/40">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
