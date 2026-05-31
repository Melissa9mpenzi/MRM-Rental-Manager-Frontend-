import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Lock, Eye, Shield, Briefcase } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import {
  SettingsFieldRow,
  SettingsLayout,
  SettingsLinkGrid,
  SettingsMetricGrid,
  SettingsPanel,
  SettingsSection,
  SettingsStatusBadge,
} from "../../components/settings/SettingsPortal";
import {
  ProfileSettingsSection,
  PrivacySettingsSection,
  SecuritySettingsSection,
} from "../../components/settings/AccountSettingsSections";
import { useAccountSettings } from "../../hooks/useAccountSettings";
import { profilePathForRole } from "../../config/access";
import { workspaceApi } from "../../api/workspaceApi";

const TABS = [
  { id: "profile", label: "Profile", icon: User, description: "Identity & contact" },
  { id: "security", label: "Security", icon: Lock, description: "Password & 2FA" },
  { id: "workspace", label: "Workspace", icon: Briefcase, description: "CRM & operations" },
  { id: "privacy", label: "Privacy", icon: Eye, description: "Data export" },
];

export default function AgentSettingsPage() {
  const [tab, setTab] = useState("profile");
  const profilePath = profilePathForRole("agent");
  const acct = useAccountSettings({ securityTabActive: tab === "security" });

  const { data: staffSummary } = useQuery({
    queryKey: ["agent-settings-staff-summary"],
    queryFn: () => workspaceApi.staffSummary(),
    enabled: tab === "workspace",
    retry: false,
  });

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <AppPageScaffold
      variant="concierge"
      icon={Shield}
      title="Agent settings"
      description="CRM workspace preferences, pipeline shortcuts, and account security."
    >
      <SettingsLayout activeTab={tab} onTabChange={setTab} tabs={TABS}>
        <SettingsPanel kicker="Agent · Configuration" title={activeTab.label} description={activeTab.description}>
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

          {tab === "workspace" && (
            <>
              <SettingsSection
                title="Pipeline snapshot"
                subtitle="Live CRM metrics from the staff workspace API."
                badge={<SettingsStatusBadge status="ok">Staff API</SettingsStatusBadge>}
              >
                <SettingsMetricGrid
                  items={[
                    { label: "Leads", value: staffSummary?.kpis?.total_leads ?? "—" },
                    { label: "Active deals", value: staffSummary?.kpis?.active_deals ?? "—" },
                    { label: "Properties", value: staffSummary?.properties_listed ?? "—" },
                    { label: "Maint. open", value: staffSummary?.maintenance?.open ?? "—" },
                  ]}
                />
              </SettingsSection>
              <SettingsSection title="CRM modules" subtitle="Agent operations console." tone="cyan">
                <SettingsLinkGrid
                  links={[
                    { label: "Leads", description: "Prospect pipeline", to: "/agent/leads" },
                    { label: "Clients", description: "Active relationships", to: "/agent/clients" },
                    { label: "Schedules", description: "Viewings and follow-ups", to: "/agent/schedules" },
                    { label: "Deals", description: "Closing pipeline", to: "/agent/deals" },
                    { label: "Commissions", description: "Earned and pending", to: "/agent/commissions" },
                    { label: "Operations hub", description: "Platform moderation tools", to: "/agent/workspace" },
                  ]}
                />
              </SettingsSection>
              <SettingsSection title="Workspace policy" subtitle="Data handling for field agents." tone="violet">
                <SettingsFieldRow label="Data source" value="RentDirect staff API" />
                <SettingsFieldRow label="Listings access" value="Public catalogue + assigned clients" />
                <SettingsFieldRow label="Messaging" value="Rental Hub threads" />
              </SettingsSection>
            </>
          )}

          {tab === "privacy" && (
            <PrivacySettingsSection exporting={acct.exporting} downloadExport={acct.downloadExport} />
          )}
        </SettingsPanel>
      </SettingsLayout>
    </AppPageScaffold>
  );
}
