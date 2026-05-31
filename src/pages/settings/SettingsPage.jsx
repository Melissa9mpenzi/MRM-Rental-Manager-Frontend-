import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Lock, Receipt, Shield, Eye } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { SettingsLayout, SettingsPanel } from "../../components/settings/SettingsPortal";
import {
  ProfileSettingsSection,
  PrivacySettingsSection,
  SecuritySettingsSection,
  TenantBillingSection,
} from "../../components/settings/AccountSettingsSections";
import { useAccountSettings } from "../../hooks/useAccountSettings";
import { tenantPortalApi } from "../../api/tenantPortalApi";
import { profilePathForRole } from "../../config/access";

const TABS = [
  { id: "profile", label: "Profile", icon: User, description: "Identity & contact" },
  { id: "security", label: "Security", icon: Lock, description: "Password & 2FA" },
  { id: "billing", label: "Billing", icon: Receipt, description: "Invoices & rent" },
  { id: "privacy", label: "Privacy", icon: Eye, description: "Data export" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const profilePath = profilePathForRole("tenant");
  const acct = useAccountSettings({ securityTabActive: tab === "security" });

  const { data: invoices = [] } = useQuery({
    queryKey: ["tenant-my-invoices-settings"],
    queryFn: () => tenantPortalApi.myInvoices(),
    enabled: tab === "billing",
    retry: false,
  });
  const invRows = Array.isArray(invoices) ? invoices : [];

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <AppPageScaffold
      variant="vault"
      icon={Shield}
      title="Account settings"
      description="Manage identity, security credentials, billing visibility, and personal data controls."
    >
      <SettingsLayout activeTab={tab} onTabChange={setTab} tabs={TABS}>
        <SettingsPanel kicker={`Section · ${activeTab.label}`} title={activeTab.label} description={activeTab.description}>
          {tab === "profile" && (
            <ProfileSettingsSection
              user={acct.user}
              profilePath={profilePath}
              fullName={acct.fullName}
              setFullName={acct.setFullName}
              phone={acct.phone}
              setPhone={acct.setPhone}
              nationalId={acct.nationalId}
              setNationalId={acct.setNationalId}
              profileMut={acct.profileMut}
            />
          )}
          {tab === "security" && (
            <SecuritySettingsSection
              curPw={acct.curPw}
              setCurPw={acct.setCurPw}
              newPw={acct.newPw}
              setNewPw={acct.setNewPw}
              pwMut={acct.pwMut}
              totpEnabled={acct.totpEnabled}
              totpSetup={acct.totpSetup}
              totpCode={acct.totpCode}
              setTotpCode={acct.setTotpCode}
              disableCode={acct.disableCode}
              setDisableCode={acct.setDisableCode}
              setupTotpMut={acct.setupTotpMut}
              enableTotpMut={acct.enableTotpMut}
              disableTotpMut={acct.disableTotpMut}
            />
          )}
          {tab === "billing" && <TenantBillingSection invRows={invRows} />}
          {tab === "privacy" && (
            <PrivacySettingsSection exporting={acct.exporting} downloadExport={acct.downloadExport} />
          )}
        </SettingsPanel>
      </SettingsLayout>
    </AppPageScaffold>
  );
}
