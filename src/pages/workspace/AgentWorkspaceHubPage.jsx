import { Link } from "react-router-dom";
import {
  LayoutGrid,
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
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import {
  SettingsLinkGrid,
  SettingsPanel,
  SettingsSection,
  SettingsStatusBadge,
} from "../../components/settings/SettingsPortal";

const MODULES = [
  { label: "Listings", description: "Public catalogue moderation", to: "/agent/workspace/listings", icon: Building2 },
  { label: "Moderation", description: "Flagged content queue", to: "/agent/workspace/moderation", icon: Shield },
  { label: "Payments", description: "Platform rent reconciliation", to: "/agent/workspace/payments", icon: CreditCard },
  { label: "Contracts", description: "Lease registry & hashes", to: "/agent/workspace/contracts", icon: FileText },
  { label: "Fraud detection", description: "Risk scores & velocity", to: "/agent/workspace/fraud", icon: AlertTriangle },
  { label: "Analytics", description: "GMV and marketplace health", to: "/agent/workspace/analytics", icon: BarChart3 },
  { label: "Reports", description: "Scheduled exports", to: "/agent/workspace/reports", icon: FileSpreadsheet },
  { label: "Support", description: "Ticket inbox & SLA", to: "/agent/workspace/support", icon: LifeBuoy },
  { label: "Audit logs", description: "Privileged action trail", to: "/agent/workspace/audit", icon: ScrollText },
  { label: "System settings", description: "Feature flags & integrations", to: "/agent/workspace/system", icon: Settings },
];

export default function AgentWorkspaceHubPage() {
  return (
    <AppPageScaffold
      variant="command"
      icon={LayoutGrid}
      title="Operations workspace"
      description="Platform moderation, finance, and compliance modules for staff and super-admin agents."
    >
      <div className="settings-portal">
        <SettingsPanel
          kicker="Staff · Operations hub"
          title="Workspace modules"
          description="Industrial console for catalogue, payments, fraud, and support workflows."
        >
          <SettingsSection
            title="Access level"
            subtitle="Some modules redirect to live system-admin routes when you have elevated permissions."
            badge={<SettingsStatusBadge status="ok">Staff</SettingsStatusBadge>}
          >
            <SettingsLinkGrid links={MODULES} />
          </SettingsSection>
          <SettingsSection title="Super admin" subtitle="Full platform control lives in the system console." tone="violet">
            <p className="text-sm text-white/55">
              System administrators should use{" "}
              <Link to="/system/dashboard" className="font-bold text-[#00C896] hover:underline">
                Super Admin Console
              </Link>{" "}
              for user management, wallets, and platform settings.
            </p>
          </SettingsSection>
        </SettingsPanel>
      </div>
    </AppPageScaffold>
  );
}
