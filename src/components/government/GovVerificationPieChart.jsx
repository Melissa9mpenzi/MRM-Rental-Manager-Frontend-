import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const fmt = (n) => new Intl.NumberFormat("en-UG").format(n || 0);

/**
 * Verification Overview — donut pie with Verified / Pending KYC / Rejected (or agency variants).
 */
export default function GovVerificationPieChart({ data = [], loading = false }) {
  const total = data.reduce((s, x) => s + (x.value || 0), 0);
  const hasSlices = total > 0 && data.length > 0;

  return (
    <div className="gov-verification-pie">
      <div className="gov-verification-pie__chart">
        {loading && (
          <div className="gov-verification-pie__loading">Loading chart…</div>
        )}
        {!loading && hasSlices && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                stroke="rgba(11, 14, 20, 0.9)"
                strokeWidth={2}
                isAnimationActive
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [fmt(value), name]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #334155",
                  background: "#111827",
                  color: "#f1f5f9",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        {!loading && !hasSlices && (
          <p className="gov-verification-pie__empty">No verification data yet.</p>
        )}
        {hasSlices && (
          <div className="gov-verification-pie__center" aria-hidden>
            <span className="gov-verification-pie__total">{fmt(total)}</span>
            <span className="gov-verification-pie__total-label">Total</span>
          </div>
        )}
      </div>

      <ul className="gov-verification-pie__legend" aria-label="Verification breakdown">
        {data.map((entry) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <li key={entry.name} className="gov-verification-pie__legend-item">
              <span className="gov-verification-pie__swatch" style={{ background: entry.color }} />
              <span className="gov-verification-pie__legend-label">{entry.name}</span>
              <span className="gov-verification-pie__legend-value">
                {fmt(entry.value)}
                <span className="text-white/40"> ({pct}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
