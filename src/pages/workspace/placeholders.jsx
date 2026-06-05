import {
  PieChart,
  Building2,
  Shield,
  CreditCard,
  FileText,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  LifeBuoy,
  ScrollText,
  Settings,
} from "lucide-react";
import WorkspaceModulePage from "../../components/workspace/WorkspaceModulePage";

export const LandlordReportsHubPage = () => (
  <WorkspaceModulePage
    variant="ledger"
    icon={PieChart}
    title="Reports"
    subtitle="Financial and compliance exports for your portfolio."
    kicker="Landlord · Reports"
    status="ok"
    statusLabel="Live"
    links={[
      { label: "Arrears report", description: "Tenants behind on rent", to: "/landlord/reports/arrears" },
      { label: "Maintenance log", description: "Work order history", to: "/landlord/maintenance" },
      { label: "Analytics", description: "Occupancy and revenue", to: "/landlord/analytics" },
      { label: "Payments ledger", description: "All rent transactions", to: "/landlord/payments" },
      { label: "Rent roll", description: "Unit-level rent schedule", soon: true },
      { label: "Tax summary", description: "URA-ready export", soon: true },
    ]}
  />
);

export const AdminListingsPage = () => (
  <WorkspaceModulePage
    icon={Building2}
    title="Listings"
    subtitle="Browse and moderate the public catalogue — boost verified supply and remove stale inventory."
    metrics={[
      { label: "Catalogue", value: "Public" },
      { label: "Moderation", value: "Manual" },
    ]}
    links={[
      { label: "Public catalogue", description: "Browse all published listings", to: "/browse-properties" },
      { label: "System properties", description: "Super-admin property oversight", to: "/system/properties" },
      { label: "Add listing (landlord)", description: "Landlord publish flow", to: "/landlord/properties/new" },
    ]}
  />
);

export const AdminModerationPage = () => (
  <WorkspaceModulePage
    icon={Shield}
    title="Moderation"
    subtitle="Queue for flagged listings, abusive chat, and duplicate photos."
    status="warn"
    statusLabel="Queue"
    links={[
      { label: "User management", description: "KYC review and account actions", to: "/system/users" },
      { label: "Rental Hub (admin)", description: "Platform thread registry", to: "/system/messages" },
      { label: "Fraud alerts", description: "Government fraud module", to: "/government/fraud" },
      { label: "Auto-moderation AI", description: "Rental Hub trust scoring", soon: true },
    ]}
  />
);

export const AdminPaymentsPage = () => (
  <WorkspaceModulePage
    variant="ledger"
    icon={CreditCard}
    title="Payments"
    subtitle="Platform-wide rent flows, refunds, and reconciliation against PSP settlements."
    links={[
      { label: "System payments", description: "Platform payment monitor", to: "/system/payments" },
      { label: "Wallets & settlements", description: "Escrow and disbursements", to: "/system/wallets" },
      { label: "Landlord wallet", description: "Owner collections view", to: "/landlord/wallet" },
      { label: "Sui receipts", description: "On-chain payment proofs", to: "/sui/receipts" },
    ]}
  />
);

export const AdminContractsPage = () => (
  <WorkspaceModulePage
    icon={FileText}
    title="Contracts"
    subtitle="Registry of lease records, template versions, and on-chain hashes."
    links={[
      { label: "System contracts", description: "Platform lease registry", to: "/system/contracts" },
      { label: "Landlord contracts", description: "Owner tenancy documents", to: "/landlord/contracts" },
      { label: "Tenant lease", description: "Tenant contract portal", to: "/tenant/contract" },
      { label: "Sui escrow", description: "On-chain escrow holds", to: "/sui/escrow" },
    ]}
  />
);

export const AdminFraudPage = () => (
  <WorkspaceModulePage
    variant="command"
    icon={AlertTriangle}
    title="Fraud detection"
    subtitle="Risk scores, device fingerprints, and velocity alerts across the marketplace."
    links={[
      { label: "Government fraud", description: "National fraud alerts", to: "/government/fraud" },
      { label: "Verification center", description: "NIRA KYC queue", to: "/government/nira" },
      { label: "Audit export", description: "Walrus audit bundles", to: "/government/audit" },
      { label: "Velocity rules engine", description: "Configurable thresholds", soon: true },
    ]}
  />
);

export const AdminAnalyticsPage = () => (
  <WorkspaceModulePage
    icon={BarChart3}
    title="Analytics"
    subtitle="GMV, active leases, cohort retention, and marketplace health indices."
    links={[
      { label: "System dashboards", description: "Platform KPI boards", to: "/system/dashboards" },
      { label: "Landlord analytics", description: "Owner portfolio metrics", to: "/landlord/analytics" },
      { label: "Agent analytics", description: "CRM pipeline metrics", to: "/agent/analytics" },
      { label: "Cohort retention", description: "Tenant lifecycle analysis", soon: true },
    ]}
  />
);

export const AdminReportsPage = () => (
  <WorkspaceModulePage
    icon={FileSpreadsheet}
    title="Reports"
    subtitle="Scheduled exports for finance, compliance, and leadership reviews."
    links={[
      { label: "Landlord reports", description: "Arrears and maintenance", to: "/landlord/reports" },
      { label: "Government overview", description: "Compliance exports", to: "/government/overview" },
      { label: "Data export (user)", description: "Personal data JSON", to: "/tenant/settings" },
      { label: "Scheduled CSV jobs", description: "Automated delivery", soon: true },
    ]}
  />
);

export const AdminSupportPage = () => (
  <WorkspaceModulePage
    icon={LifeBuoy}
    title="Support"
    subtitle="Ticket inbox, SLA timers, and canned responses for the operations team."
    links={[
      { label: "System support", description: "Platform ticket queue", to: "/system/support" },
      { label: "Announcements", description: "Broadcast notices", to: "/system/announcements" },
      { label: "Rental Hub", description: "User messaging context", to: "/landlord/messages" },
      { label: "Zendesk integration", description: "External helpdesk", soon: true },
    ]}
  />
);

export const AdminAuditLogsPage = () => (
  <WorkspaceModulePage
    variant="command"
    icon={ScrollText}
    title="Audit logs"
    subtitle="Immutable trail of admin actions, config changes, and privileged reads."
    links={[
      { label: "Government audit", description: "Officer action logs", to: "/government/audit" },
      { label: "Platform activity", description: "Live activity feed API", to: "/system/dashboard" },
      { label: "Walrus inventory", description: "Anchored artifact counts", to: "/sui/settings" },
      { label: "Immutable log stream", description: "Centralized SIEM export", soon: true },
    ]}
  />
);

export const AdminSystemSettingsPage = () => (
  <WorkspaceModulePage
    icon={Settings}
    title="System settings"
    subtitle="Feature flags, fee tables, maintenance windows, and integration keys."
    links={[
      { label: "Platform settings", description: "Readiness & policies", to: "/system/settings" },
      { label: "Sui configuration", description: "Network & treasury", to: "/sui/settings" },
      { label: "Government settings", description: "Officer portal policies", to: "/government/settings" },
      { label: "Feature flags UI", description: "Runtime toggles", soon: true },
    ]}
  />
);
