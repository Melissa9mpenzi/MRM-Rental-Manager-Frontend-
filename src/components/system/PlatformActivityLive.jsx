import { Activity, UserPlus, Banknote, CreditCard, AlertTriangle } from "lucide-react";
import PlatformActivityMap from "./PlatformActivityMap";

const fmtFull = (n) => new Intl.NumberFormat("en-UG").format(n || 0);
const fmtMoney = (n) => `UGX ${new Intl.NumberFormat("en-UG", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0)}`;

const EMPTY_STATS = {
  online_now: 0,
  new_signups_today: 0,
  payments_today_ugx: 0,
  transactions_today: 0,
  system_alerts: 0,
};

function StatRow({ icon: Icon, label, value, warn, loading }) {
  return (
    <li className={`sys-live-stat ${warn ? "sys-live-stat--warn" : ""}`}>
      <span className="sys-live-stat__icon">
        <Icon size={16} />
      </span>
      <span className="sys-live-stat__label">{label}</span>
      <span className="sys-live-stat__value">{loading ? "…" : value}</span>
    </li>
  );
}

export default function PlatformActivityLive({
  live,
  mapNodes = [],
  loading = false,
  updatedLabel,
}) {
  const stats = live ?? EMPTY_STATS;
  const nodes = mapNodes ?? [];

  const rows = [
    { icon: Activity, label: "Online Now", value: fmtFull(stats.online_now) },
    { icon: UserPlus, label: "New Signups", value: fmtFull(stats.new_signups_today) },
    { icon: Banknote, label: "Payments Today", value: fmtMoney(stats.payments_today_ugx) },
    { icon: CreditCard, label: "Transactions", value: fmtFull(stats.transactions_today) },
    {
      icon: AlertTriangle,
      label: "System Alerts",
      value: fmtFull(stats.system_alerts),
      warn: (stats.system_alerts ?? 0) > 0,
    },
  ];

  return (
    <div className="sys-live-panel">
      <div className="sys-live-panel__header">
        <div>
          <h2 className="sys-panel__title">Platform Activity (Live)</h2>
          {updatedLabel && <p className="sys-live-panel__updated">{updatedLabel}</p>}
        </div>
        <span className="sys-live-panel__badge">
          <span className="sys-map-live-dot" aria-hidden />
          Live
        </span>
      </div>

      <div className="sys-live-panel__body">
        <div className="sys-live-panel__map">
          <PlatformActivityMap nodes={nodes} loading={loading} />
        </div>
        <ul className="sys-live-panel__stats">
          {rows.map((row) => (
            <StatRow key={row.label} {...row} loading={loading} />
          ))}
        </ul>
      </div>
    </div>
  );
}
