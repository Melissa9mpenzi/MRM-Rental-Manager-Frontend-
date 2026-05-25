import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { governmentApi } from "../../api/governmentApi";
import useAuthStore from "../../store/authStore";
import { UserPlus, Shield, Building2, Banknote, FileText, Megaphone, ScrollText } from "lucide-react";
import { governmentAgencyForRole, quickActionsForAgency, isSystemAdministrator } from "../../config/governmentAccess";
import {
  overviewStatCards,
  trendLinesForAgency,
  overviewPanelTitle,
  trendPanelTitle,
  regionPanelTitle,
} from "../../config/governmentOverviewConfig";
import GovStatCard from "../../components/government/GovStatCard";
import GovWorkflowBanner from "../../components/government/GovWorkflowBanner";
import GovSystemStatusCard from "../../components/government/GovSystemStatusCard";
import UgandaComplianceMap from "../../components/government/UgandaComplianceMap";
import GovVerificationPieChart from "../../components/government/GovVerificationPieChart";
import { resolveRegionalCompliance } from "../../lib/ugandaMapRegions";
import { resolveVerificationBreakdown } from "../../lib/govVerificationBreakdown";

const fmt = (n) => new Intl.NumberFormat("en-UG", { notation: "compact" }).format(n || 0);
const fmtFull = (n) => new Intl.NumberFormat("en-UG").format(n || 0);

export default function GovernmentOverviewPage() {
  const role = useAuthStore((s) => s.user?.role);
  const agency = governmentAgencyForRole(role) || "all";
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["gov-overview", agency],
    queryFn: () => governmentApi.overview(),
    refetchInterval: 60000,
  });

  const { data: fraudAlerts = [] } = useQuery({
    queryKey: ["gov-fraud-alerts-overview", agency],
    queryFn: () => governmentApi.fraudAlerts(),
    refetchInterval: 60000,
  });

  const breakdown = useMemo(
    () => resolveVerificationBreakdown(data?.verification_breakdown),
    [data?.verification_breakdown]
  );
  const trend = data?.activity_trend ?? [];
  const regions = useMemo(
    () => resolveRegionalCompliance(data?.regional_compliance),
    [data?.regional_compliance]
  );
  const mapHasNoData = !regions.some((r) => (r?.count ?? r?.properties ?? 0) > 0);
  const cards = overviewStatCards(agency, data, { isLoading, fmtFull, fmt });
  const trendLines = trendLinesForAgency(agency);
  const ACTION_ICONS = {
    officers: UserPlus,
    nira: Shield,
    kcca: Building2,
    ura: Banknote,
    analytics: FileText,
    charter: ScrollText,
    settings: Megaphone,
  };
  const quickActions = quickActionsForAgency(agency).map((a) => ({
    ...a,
    icon: ACTION_ICONS[a.id] || FileText,
  }));
  const alerts = fraudAlerts.slice(0, 5).map((a) => ({
    level: a.severity || "medium",
    text: a.title ? `${a.title}${a.subject ? ` — ${a.subject}` : ""}` : a.subject || "Alert",
    time: a.created_at ? a.created_at.replace("T", " ").slice(0, 16) : "—",
  }));
  const isAdmin = isSystemAdministrator(role);

  const gridCols = cards.length <= 4 ? "md:grid-cols-2 xl:grid-cols-6" : "md:grid-cols-3 xl:grid-cols-12";

  return (
    <div className="space-y-5">
      <GovWorkflowBanner highlightAgency={isAdmin ? undefined : agency} />

      {!isAdmin && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-100">
          {agency === "nira" && "NIRA officer — identity, KYC, fraud, and blacklist only (no payments or system config)."}
          {agency === "kcca" && "KCCA officer — property verification, inspections, and GIS (no wallets or payments)."}
          {agency === "ura" && "URA officer — tax, revenue, and transaction compliance (no KYC documents or passwords)."}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load overview data. Ensure the API is running and you are signed in.
        </div>
      )}

      <div className={`grid grid-cols-2 gap-3 ${gridCols}`}>
        {cards.map((c) => (
          <div key={c.label} className={cards.length <= 4 ? "xl:col-span-1" : "xl:col-span-2"}>
            <GovStatCard {...c} />
          </div>
        ))}
        <div className={cards.length <= 4 ? "col-span-2 xl:col-span-2" : "col-span-2 md:col-span-3 xl:col-span-2"}>
          <GovSystemStatusCard />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="gov-glass p-4 xl:col-span-4">
          <h2 className="gov-panel-title">{overviewPanelTitle(agency)}</h2>
          <div className="mt-4">
            <GovVerificationPieChart data={breakdown} loading={isLoading} />
          </div>
        </div>

        <div className="gov-glass p-4 xl:col-span-8">
          <h2 className="gov-panel-title">{trendPanelTitle(agency)}</h2>
          <div className="mt-4 h-56 min-h-[224px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={224}>
              <LineChart data={trend}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {trendLines.map((line) => (
                  <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    name={line.name}
                    stroke={line.stroke}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="gov-glass p-4 lg:col-span-8">
          <h2 className="gov-panel-title">{regionPanelTitle(agency)}</h2>
          {mapHasNoData && !isLoading && !isError && (
            <p className="mt-1 text-[11px] text-amber-200/80">
              No regional data yet — add properties with districts in the platform to see compliance on the map.
            </p>
          )}
          <div className="gov-region-map mt-4">
            <div className="gov-region-map__viz gov-region-map__viz--tall">
              <UgandaComplianceMap
                regions={regions}
                loading={isLoading}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={setSelectedDistrict}
              />
            </div>
            <div className="gov-region-list">
              {regions.map((r, idx) => (
                <button
                  key={`${r.district}-${idx}`}
                  type="button"
                  className={`gov-region-row w-full text-left transition ${
                    selectedDistrict === r.district ? "ring-1 ring-emerald-500/50" : ""
                  }`}
                  onMouseEnter={() => setSelectedDistrict(r.district)}
                  onMouseLeave={() => setSelectedDistrict(null)}
                  onClick={() => setSelectedDistrict(r.district)}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-white/80">{r.district}</span>
                      <span className="text-sm font-bold text-emerald-300">{r.score}%</span>
                    </div>
                    <div className="gov-region-row__bar">
                      <div className="gov-region-row__fill" style={{ width: `${r.score}%` }} />
                    </div>
                    {r.count != null && (
                      <p className="mt-1 text-[10px] text-white/40">{r.count} records in district</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="gov-glass p-4">
            <h2 className="gov-panel-title">Quick Actions</h2>
            <div className="mt-3 space-y-2">
              {quickActions.map(({ label, to, icon: Icon }) => (
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
              {!alerts.length && (
                <p className="text-sm text-white/45">No recent alerts. Fraud and compliance flags will appear here.</p>
              )}
              {alerts.map((a) => (
                <div key={`${a.text}-${a.time}`} className="gov-alert-item">
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
