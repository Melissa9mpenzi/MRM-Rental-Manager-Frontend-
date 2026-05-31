import { useState } from "react";
import { Shield, Key, FileCheck, Globe, Scale } from "lucide-react";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import {
  SettingsFieldRow,
  SettingsLayout,
  SettingsPanel,
  SettingsPolicyCard,
  SettingsSection,
  SettingsStatusBadge,
} from "../../components/settings/SettingsPortal";

const TABS = [
  { id: "auth", label: "Authentication", icon: Shield, description: "Officer access" },
  { id: "access", label: "Access control", icon: Key, description: "Role boundaries" },
  { id: "audit", label: "Audit", icon: FileCheck, description: "Compliance logs" },
  { id: "integrations", label: "Integrations", icon: Globe, description: "National systems" },
];

const AUTH_ITEMS = [
  { text: "Invitation-only officer accounts", done: true },
  { text: "Mandatory 2FA each session", done: true },
  { text: "No public or social signup", done: true },
  { text: "Work ID + security PIN on accept", done: true },
];

const ACCESS_ITEMS = [
  { text: "Role-scoped NIRA / KCCA / URA modules", done: true },
  { text: "System admin: full platform + gov", done: true },
  { text: "IP allowlist (production)", done: false },
];

const AUDIT_ITEMS = [
  { text: "All verification actions logged", done: true },
  { text: "Government login session records", done: true },
  { text: "Blockchain anchors for audit exports", done: true },
];

const INTEGRATION_ITEMS = [
  { text: "NIRA KYC workflow", done: true },
  { text: "KCCA property registry", done: true },
  { text: "URA tax compliance reports", done: true },
];

export default function GovSettingsPage() {
  const [tab, setTab] = useState("auth");
  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <div className="settings-portal settings-portal--gov space-y-5">
      <GovModuleHeader
        title="System settings"
        subtitle="Security, compliance, and integration policies for the national government portal."
      />

      <SettingsSection
        title="Portal compliance posture"
        subtitle="Secure GovTech configuration enforced for all officer sessions."
        badge={<SettingsStatusBadge status="ok">Compliant</SettingsStatusBadge>}
      >
        <SettingsFieldRow label="Access model" value="Invitation-only" />
        <SettingsFieldRow label="Session 2FA" value="Required per login" />
        <SettingsFieldRow label="Public signup" value="Disabled" />
      </SettingsSection>

      <SettingsLayout activeTab={tab} onTabChange={setTab} tabs={TABS}>
        <SettingsPanel
          kicker="Government · Policy"
          title={activeTab.label}
          description={activeTab.description}
        >
          {tab === "auth" && (
            <div className="settings-portal__policy-grid">
              <SettingsPolicyCard icon={Shield} title="Authentication" items={AUTH_ITEMS} tone="cyan" />
              <SettingsPolicyCard icon={Scale} title="Officer onboarding" items={AUTH_ITEMS.slice(0, 3)} tone="emerald" />
            </div>
          )}
          {tab === "access" && (
            <div className="settings-portal__policy-grid">
              <SettingsPolicyCard icon={Key} title="Access control" items={ACCESS_ITEMS} tone="purple" />
              <SettingsPolicyCard icon={Shield} title="Privileged roles" items={ACCESS_ITEMS.slice(0, 2)} tone="cyan" />
            </div>
          )}
          {tab === "audit" && (
            <div className="settings-portal__policy-grid">
              <SettingsPolicyCard icon={FileCheck} title="Audit trail" items={AUDIT_ITEMS} tone="amber" />
              <SettingsPolicyCard icon={FileCheck} title="Retention" items={AUDIT_ITEMS.slice(0, 2)} tone="emerald" />
            </div>
          )}
          {tab === "integrations" && (
            <div className="settings-portal__policy-grid">
              <SettingsPolicyCard icon={Globe} title="National integrations" items={INTEGRATION_ITEMS} tone="cyan" />
              <SettingsPolicyCard icon={Globe} title="Data exchange" items={INTEGRATION_ITEMS} tone="purple" />
            </div>
          )}
        </SettingsPanel>
      </SettingsLayout>
    </div>
  );
}
