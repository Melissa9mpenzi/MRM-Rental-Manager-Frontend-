import { Link } from "react-router-dom";
import {
  UserPlus,
  Shield,
  Settings,
  Megaphone,
  BarChart3,
  ScrollText,
  AlertTriangle,
  Clock,
} from "lucide-react";
const QUICK_ACTIONS = [
  { label: "Add Admin/Officer", icon: UserPlus, to: "/government/officers", tone: "sys-qa--purple" },
  { label: "Manage Roles", icon: Shield, to: "/system/users", tone: "sys-qa--blue" },
  { label: "System Settings", icon: Settings, to: "/system/settings", tone: "sys-qa--cyan" },
  { label: "Send Announcement", icon: Megaphone, to: "/system/announcements", tone: "sys-qa--green" },
  { label: "View Reports", icon: BarChart3, to: "/system/dashboards", tone: "sys-qa--gold" },
  { label: "Platform Logs", icon: ScrollText, to: "/government/audit", tone: "sys-qa--violet" },
];

function formatAuditTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 3600) return `${Math.max(1, Math.floor(sec / 60))}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return d.toLocaleDateString("en-UG", { month: "short", day: "numeric" });
}

export default function SystemAdminRightRail({ summary, gov, fraudAlerts = [], health = 99.98 }) {
  const pendingKyc = gov?.pending_kyc ?? 0;
  const pendingProps = gov?.pending_inspections ?? 0;
  const flagged = gov?.flagged_accounts ?? 0;
  const govVerifications = pendingKyc + pendingProps;

  const pendingRows = [
    { label: "KYC / Identity (NIRA)", count: pendingKyc, to: "/government/nira" },
    { label: "Properties (KCCA)", count: pendingProps, to: "/government/kcca" },
    { label: "Flagged accounts", count: flagged, to: "/government/fraud" },
    { label: "Gov. verifications", count: govVerifications, to: "/government/overview" },
  ];

  const alerts = [];
  if (flagged > 0) {
    alerts.push({ text: "High fraud / rejected KYC signals", severity: "high", to: "/government/fraud" });
  }
  if (pendingProps > 0) {
    alerts.push({ text: "KCCA property reviews pending", severity: "medium", to: "/government/kcca" });
  }
  if (pendingKyc > 0) {
    alerts.push({ text: "NIRA identity queue not empty", severity: "medium", to: "/government/nira" });
  }
  if ((summary?.maintenance_open ?? 0) > 0) {
    alerts.push({ text: "Open maintenance tickets", severity: "low", to: "/system/support" });
  }
  fraudAlerts.slice(0, 2).forEach((a) => {
    alerts.push({ text: a.title || a.subject || "Fraud alert", severity: a.severity || "high", to: "/government/fraud" });
  });
  if (alerts.length === 0) {
    alerts.push({ text: "All systems operational", severity: "ok", to: "/system/dashboard" });
  }

  const activities = (summary?.recent_audit ?? []).slice(0, 6).map((a) => ({
    id: a.id,
    text: `${a.action || "Action"} · ${a.table_name || "system"}${a.record_id ? ` #${a.record_id}` : ""}`,
    time: formatAuditTime(a.created_at),
  }));

  return (
    <aside className="sys-right-rail">
      <section className="sys-rail-card">
        <h2 className="sys-rail-card__title">Pending Approvals</h2>
        <ul className="sys-pending-list">
          {pendingRows.map((r) => (
            <li key={r.label}>
              <Link to={r.to} className="sys-pending-list__row">
                <span>{r.label}</span>
                <span className="sys-pending-list__count">{r.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/government/nira" className="sys-rail-btn">
          Review all approvals
        </Link>
      </section>

      <section className="sys-rail-card">
        <h2 className="sys-rail-card__title flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" />
          System Alerts
        </h2>
        <ul className="sys-alert-list">
          {alerts.slice(0, 4).map((a, i) => (
            <li key={`${a.text}-${i}`}>
              <Link to={a.to} className={`sys-alert-list__item sys-alert-list__item--${a.severity}`}>
                {a.text}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sys-rail-card">
        <h2 className="sys-rail-card__title flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" />
          Recent Activities
        </h2>
        {activities.length === 0 ? (
          <p className="text-[11px] text-white/40">No audit events yet.</p>
        ) : (
          <ul className="sys-activity-timeline">
            {activities.map((a) => (
              <li key={a.id} className="sys-activity-timeline__item">
                <span className="sys-activity-timeline__dot" />
                <div>
                  <p className="sys-activity-timeline__text">{a.text}</p>
                  <p className="sys-activity-timeline__time">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sys-rail-card">
        <h2 className="sys-rail-card__title">Quick Actions</h2>
        <div className="sys-quick-grid">
          {QUICK_ACTIONS.map(({ label, icon: Icon, to, tone }) => (
            <Link key={label} to={to} className={`sys-quick-action ${tone}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="sys-rail-card sys-rail-card--health">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">System health</p>
        <p className="mt-1 text-lg font-extrabold text-emerald-400">Excellent</p>
        <p className="text-xs text-white/55">Platform health score (live alerts &amp; queue)</p>
      </section>
    </aside>
  );
}
