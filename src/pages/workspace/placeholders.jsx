import { Link } from "react-router-dom";
import ModuleShell from "./ModuleShell.jsx";

function make(title, subtitle, children = null) {
  function Page() {
    return (
      <ModuleShell title={title} subtitle={subtitle}>
        {children}
      </ModuleShell>
    );
  }
  Page.displayName = `Workspace_${title.replace(/\s+/g, "_")}`;
  return Page;
}

const hint = (
  <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 text-xs text-white/45">
    This screen matches the RentDirect UG navigation model. Wire it to your API when endpoints are ready.
  </p>
);

export const LandlordReportsHubPage = make(
  "Reports",
  "Financial and compliance exports. Arrears is live today; add more report types as the backend grows.",
  <div className="flex flex-wrap gap-3">
    <Link
      to="/landlord/reports/arrears"
      className="rounded-xl border border-[#00C896]/35 bg-[#00C896]/10 px-4 py-3 text-sm font-bold text-[#00C896] hover:bg-[#00C896]/20"
    >
      Arrears report →
    </Link>
    <Link
      to="/landlord/maintenance"
      className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 hover:border-[#00C896]/35 hover:text-[#00C896]"
    >
      Maintenance log →
    </Link>
    <span className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/45">Rent roll (soon)</span>
    <span className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/45">Tax summary (soon)</span>
  </div>,
);

export const AdminListingsPage = make(
  "Listings",
  "Browse and moderate the public catalogue — boost verified supply and remove stale inventory.",
  <Link to="/browse-properties" className="inline-flex text-sm font-bold text-[#00C896] hover:underline">
    Open public catalogue →
  </Link>,
);

export const AdminModerationPage = make(
  "Moderation",
  "Queue for flagged listings, abusive chat, and duplicate photos.",
  hint,
);

export const AdminPaymentsPage = make(
  "Payments",
  "Platform-wide rent flows, refunds, and reconciliation against PSP settlements.",
  hint,
);

export const AdminContractsPage = make(
  "Contracts",
  "Registry of on-chain hashes, template versions, and dispute holds.",
  hint,
);

export const AdminFraudPage = make(
  "Fraud detection",
  "Risk scores, device fingerprints, and velocity alerts across the marketplace.",
  hint,
);

export const AdminAnalyticsPage = make(
  "Analytics",
  "GMV, active leases, cohort retention, and marketplace health indices.",
  hint,
);

export const AdminReportsPage = make(
  "Reports",
  "Scheduled exports for finance, compliance, and leadership reviews.",
  hint,
);

export const AdminSupportPage = make(
  "Support",
  "Ticket inbox, SLA timers, and canned responses for the operations team.",
  hint,
);

export const AdminAuditLogsPage = make(
  "Audit logs",
  "Immutable trail of admin actions, config changes, and privileged reads.",
  hint,
);

export const AdminSystemSettingsPage = make(
  "System settings",
  "Feature flags, fee tables, maintenance windows, and integration keys (super-admin).",
  hint,
);
