import MiniSparkline from "../system/MiniSparkline";

const TONE_COLORS = {
  emerald: "#00c896",
  amber: "#f59e0b",
  red: "#ef4444",
  cyan: "#22d3ee",
  purple: "#a78bfa",
  teal: "#14b8a6",
  yellow: "#eab308",
};

export default function GovStatCard({ icon: Icon, label, value, trend, tone = "emerald", spark }) {
  const lineColor = TONE_COLORS[tone] || TONE_COLORS.emerald;
  const trendUp = trend?.startsWith("+");

  return (
    <div className="gov-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className={`gov-stat-card__icon gov-stat-card__icon--${tone}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-semibold ${trendUp ? "text-emerald-400/90" : "text-red-400/90"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-white/45">{label}</p>
      <p className="mt-1 text-xl font-bold leading-tight text-white">{value ?? "—"}</p>
      <MiniSparkline values={spark} color={lineColor} />
    </div>
  );
}
