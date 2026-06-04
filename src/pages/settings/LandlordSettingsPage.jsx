import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Lock,
  Building2,
  CreditCard,
  Wrench,
  Eye,
  Shield,
} from "lucide-react";
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
import { propertiesApi } from "../../api/propertiesApi";
import { paymentsApi } from "../../api/paymentsApi";

const TABS = [
  { id: "profile", label: "Profile", icon: User, description: "Identity & KYC" },
  { id: "security", label: "Security", icon: Lock, description: "Password & 2FA" },
  { id: "portfolio", label: "Portfolio", icon: Building2, description: "Properties & tenants" },
  { id: "payments", label: "Payments", icon: CreditCard, description: "Gateway & wallet" },
  { id: "operations", label: "Operations", icon: Wrench, description: "Hubs & reports" },
  { id: "privacy", label: "Privacy", icon: Eye, description: "Data export" },
];

function kycStatus(user) {
  const s = user?.kyc_status || user?.verification_status;
  if (!s) return { label: "Not submitted", status: "neutral" };
  const lower = String(s).toLowerCase();
  if (lower.includes("approved") || lower.includes("verified")) return { label: "Verified", status: "ok" };
  if (lower.includes("pending") || lower.includes("submitted")) return { label: "Pending review", status: "warn" };
  if (lower.includes("reject")) return { label: "Rejected", status: "err" };
  return { label: String(s), status: "neutral" };
}

export default function LandlordSettingsPage() {
  const [tab, setTab] = useState("profile");
  const profilePath = profilePathForRole("landlord");
  const acct = useAccountSettings({ securityTabActive: tab === "security" });
  const { user } = acct;
  const kyc = kycStatus(user);

  const { data: properties = [] } = useQuery({
    queryKey: ["landlord-settings-properties"],
    queryFn: () => propertiesApi.list(),
    enabled: tab === "portfolio",
  });
  const propRows = Array.isArray(properties) ? properties : [];

  const { data: wallet } = useQuery({
    queryKey: ["landlord-settings-wallet"],
    queryFn: () => paymentsApi.walletSummary(),
    enabled: tab === "payments",
  });
  const { data: gateway } = useQuery({
    queryKey: ["landlord-settings-gateway"],
    queryFn: () => paymentsApi.gatewayStatus(),
    enabled: tab === "payments",
  });

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];
  const gwLive = gateway?.configured && !gateway?.mock_enabled;

  return (
    <AppPageScaffold
      variant="registry"
      icon={Shield}
      title="Landlord settings"
      description="Portfolio configuration, payment rails, operational shortcuts, and account security."
    >
      <SettingsLayout activeTab={tab} onTabChange={setTab} tabs={TABS}>
        <SettingsPanel kicker="Landlord · Configuration" title={activeTab.label} description={activeTab.description}>
          {tab === "profile" && (
            <ProfileSettingsSection
              user={user}
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

          {tab === "portfolio" && (
            <>
              <SettingsSection
                title="Portfolio snapshot"
                subtitle="Live counts from your landlord property registry."
                badge={<SettingsStatusBadge status={kyc.status}>{kyc.label}</SettingsStatusBadge>}
              >
                <SettingsMetricGrid
                  items={[
                    { label: "Properties", value: propRows.length },
                    { label: "KYC", value: kyc.label },
                    { label: "Role", value: "Landlord" },
                    { label: "Listings", value: propRows.filter((p) => p.is_active !== false).length },
                  ]}
                />
              </SettingsSection>
              <SettingsSection title="Portfolio modules" subtitle="Jump to registry screens." tone="cyan">
                <SettingsLinkGrid
                  links={[
                    { label: "Properties", description: "Units, photos, and availability", to: "/landlord/properties" },
                    { label: "Tenants", description: "Active tenancies and contacts", to: "/landlord/tenants" },
                    { label: "Applicants", description: "Incoming rental applications", to: "/landlord/applicants" },
                    { label: "Contracts", description: "Lease records and terms", to: "/landlord/contracts" },
                    { label: "Add property", description: "Publish a new listing", to: "/landlord/properties/new" },
                    { label: "Profile & KYC", description: "Verification documents", to: profilePath },
                  ]}
                />
              </SettingsSection>
            </>
          )}

          {tab === "payments" && (
            <>
              <SettingsSection
                title="Payment gateway"
                subtitle="MTN MoMo, Airtel, and card rails configured on the API host."
                badge={
                  <SettingsStatusBadge status={gwLive ? "ok" : gateway?.mock_enabled ? "warn" : "err"}>
                    {gwLive ? "Live" : gateway?.mock_enabled ? "Mock" : "Not configured"}
                  </SettingsStatusBadge>
                }
              >
                <SettingsFieldRow label="Provider" value={gateway?.provider || "—"} />
                <SettingsFieldRow label="Mode" value={gateway?.mode || "—"} />
                <SettingsFieldRow label="MTN MoMo" value={gateway?.supports?.mtn_momo ? "Supported" : "No"} />
                <SettingsFieldRow label="Airtel / card" value={gateway?.supports?.airtel || gateway?.supports?.card ? "Supported" : "Via Pesapal"} />
              </SettingsSection>
              <SettingsSection title="Collections summary" subtitle="Rent payments recorded against your portfolio." tone="amber">
                <SettingsMetricGrid
                  items={[
                    {
                      label: "Collected",
                      value: `UGX ${Number(wallet?.total_paid_ugx || 0).toLocaleString()}`,
                    },
                    { label: "Payments", value: wallet?.payment_count ?? 0 },
                    { label: "Scope", value: wallet?.scope || "landlord" },
                    { label: "Online share", value: wallet?.online_share_pct != null ? `${wallet.online_share_pct}%` : "—" },
                  ]}
                />
                <div className="mt-4">
                  <SettingsLinkGrid
                    links={[
                      { label: "Wallet", description: "Balances and payout view", to: "/landlord/wallet" },
                      { label: "Payments ledger", description: "All rent transactions", to: "/landlord/payments" },
                      { label: "Record payment", description: "MoMo, Pesapal, bank, or Sui entry", to: "/landlord/payments/new" },
                      { label: "Receipts", description: "Downloadable receipts", to: "/landlord/receipts" },
                    ]}
                  />
                </div>
              </SettingsSection>
            </>
          )}

          {tab === "operations" && (
            <SettingsSection title="Operations hub" subtitle="Day-to-day landlord workflows." tone="violet">
              <SettingsLinkGrid
                links={[
                  { label: "Rental Hub", description: "Tenant messaging & calls", to: "/landlord/messages" },
                  { label: "Maintenance", description: "Work orders and requests", to: "/landlord/maintenance" },
                  { label: "Reports", description: "Arrears and exports", to: "/landlord/reports" },
                  { label: "Analytics", description: "Occupancy and revenue", to: "/landlord/analytics" },
                  { label: "Notifications", description: "In-app alerts", to: "/landlord/notifications" },
                  { label: "Sui portal", description: "On-chain receipts & escrow", to: "/sui/dashboard" },
                ]}
              />
            </SettingsSection>
          )}

          {tab === "privacy" && (
            <PrivacySettingsSection exporting={acct.exporting} downloadExport={acct.downloadExport} />
          )}
        </SettingsPanel>
      </SettingsLayout>
    </AppPageScaffold>
  );
}
