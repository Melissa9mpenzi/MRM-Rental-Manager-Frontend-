import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { governmentApi } from "../../api/governmentApi";
import useAuthStore from "../../store/authStore";
import { governmentAgencyForRole } from "../../config/governmentAccess";
import GovModuleHeader from "../../components/government/GovModuleHeader";

function severityBadge(severity) {
  const s = String(severity || "medium").toLowerCase();
  if (s === "high") return "gov-badge gov-badge-high";
  if (s === "low") return "gov-badge gov-badge-verified";
  return "gov-badge gov-badge-medium";
}

export default function GovFraudPage() {
  const agency = governmentAgencyForRole(useAuthStore((s) => s.user?.role)) || "all";
  const { data: alerts = [], isLoading, isError } = useQuery({
    queryKey: ["gov-fraud", agency],
    queryFn: () => governmentApi.fraudAlerts({ limit: 80 }),
  });

  const reviewHref =
    agency === "nira"
      ? "/government/nira"
      : agency === "kcca"
        ? "/government/kcca"
        : agency === "ura"
          ? "/government/ura"
          : "/government";

  const riskData = useMemo(() => {
    const high = alerts.filter((a) => a.severity === "high").length;
    const medium = alerts.filter((a) => a.severity === "medium").length;
    const low = alerts.filter((a) => a.severity === "low").length;
    if (!alerts.length) return [];
    const total = high + medium + low || 1;
    return [
      { name: "High Risk", value: Math.round((high / total) * 100), color: "#EF4444" },
      { name: "Medium Risk", value: Math.round((medium / total) * 100), color: "#F59E0B" },
      { name: "Low Risk", value: Math.max(0, 100 - Math.round((high / total) * 100) - Math.round((medium / total) * 100)), color: "#22D3EE" },
    ].filter((x) => x.value > 0);
  }, [alerts]);

  const cases = useMemo(() => {
    return [...alerts]
      .sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 };
        return (rank[a.severity] ?? 2) - (rank[b.severity] ?? 2);
      })
      .slice(0, 12);
  }, [alerts]);

  const riskTotal = riskData.reduce((s, x) => s + x.value, 0);

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="Fraud Detection Center"
        subtitle={
          agency === "nira"
            ? "Identity fraud and KYC risk alerts for NIRA officers."
            : agency === "kcca"
              ? "Illegal listings and property fraud for KCCA officers."
              : agency === "ura"
                ? "Tax and payment anomaly alerts for URA officers."
                : "Alerts across identity, property, and tax modules."
        }
      />

      <div className="gov-fraud-grid">
        <div className="gov-glass p-4">
          <h2 className="gov-panel-title">Risk Distribution</h2>
          <div className="relative mt-4 h-64">
            {riskData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={2}>
                      {riskData.map((e) => (
                        <Cell key={e.name} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
                  <span className="text-xl font-bold text-white">{riskTotal}%</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/45">Risk index</span>
                </div>
              </>
            ) : (
              <p className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-white/45">
                {isLoading && "Loading…"}
                {isError && "Could not load fraud alerts. Refresh or try again shortly."}
                {!isLoading && !isError && "No fraud alerts in the system yet."}
                {!isLoading && !isError && agency === "nira" && (
                  <Link to={reviewHref} className="text-xs font-semibold text-emerald-300 hover:underline">
                    Open NIRA verification queue →
                  </Link>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="gov-glass p-4">
          <h2 className="gov-panel-title">Recent High Risk Cases</h2>
          {isLoading && <p className="mt-4 text-sm text-white/45">Loading alerts…</p>}
          {!isLoading && !cases.length && (
            <p className="mt-4 text-sm text-white/45">
              {isError
                ? "Alerts could not be loaded."
                : agency === "nira"
                  ? "No high-risk cases yet. Pending KYC, rejected identity checks, and suspended accounts appear here automatically."
                  : "No cases to display. Flagged KYC or compliance issues will appear here."}
              {!isError && agency === "nira" && (
                <Link to={reviewHref} className="mt-2 inline-block text-xs font-semibold text-emerald-300 hover:underline">
                  Review KYC queue →
                </Link>
              )}
            </p>
          )}
          <div className="mt-3 max-h-[420px] overflow-y-auto pr-1">
            {cases.map((a) => (
              <div key={a.id} className="gov-risk-case">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{a.title}</p>
                    <p className="mt-0.5 text-xs text-white/55">{a.subject}</p>
                  </div>
                  <span className={severityBadge(a.severity)}>{a.severity}</span>
                </div>
                <p className="mt-2 text-xs text-white/50">{a.detail}</p>
                <p className="mt-2 text-[10px] text-white/35">{a.created_at?.replace("T", " ").slice(0, 19) || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
