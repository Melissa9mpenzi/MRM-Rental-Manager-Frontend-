import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Database, Bell, Globe, Server, Activity } from "lucide-react";
import { platformApi } from "../../api/platformApi";
import PortalPageHeader from "../../components/system/PortalPageHeader";
import {
  SettingsFieldRow,
  SettingsLayout,
  SettingsMetricGrid,
  SettingsPanel,
  SettingsPolicyCard,
  SettingsSection,
  SettingsStatusBadge,
} from "../../components/settings/SettingsPortal";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity, description: "Readiness & health" },
  { id: "security", label: "Security", icon: Shield, description: "Access policies" },
  { id: "infrastructure", label: "Infrastructure", icon: Database, description: "Data & storage" },
  { id: "integrations", label: "Integrations", icon: Globe, description: "APIs & webhooks" },
];

const SECURITY_ITEMS = [
  { text: "Mandatory 2FA for system admin accounts", done: true },
  { text: "Government invitation-only officer access", done: true },
  { text: "Session audit on government login", done: true },
  { text: "IP allowlist (production hardening)", done: false },
];

const DATA_ITEMS = [
  { text: "PostgreSQL (Neon) · public schema", done: true },
  { text: "Daily backups recommended in production", done: true },
  { text: "PII encrypted at rest (hosting provider)", done: true },
];

const NOTIFY_ITEMS = [
  { text: "Email OTP for public registration", done: true },
  { text: "Government invite emails", done: true },
  { text: "Payment webhooks (MTN / Pesapal)", done: true },
];

const DEPLOY_ITEMS = [
  { text: "API origin: VITE_API_URL", done: true },
  { text: "Gov API: VITE_GOV_API_URL", done: true },
  { text: "CORS locked to frontend origin", done: true },
];

function paymentLabel(readiness) {
  if (readiness?.payments?.live_payments) return "Live";
  if (readiness?.payments?.mock_enabled) return "Mock";
  return "Not configured";
}

function paymentStatus(readiness) {
  if (readiness?.payments?.live_payments) return "ok";
  if (readiness?.payments?.mock_enabled) return "warn";
  return "err";
}

export default function SystemSettingsPage() {
  const [tab, setTab] = useState("overview");
  const { data: readiness, isLoading } = useQuery({
    queryKey: ["platform-readiness"],
    queryFn: () => platformApi.readiness(),
    staleTime: 60_000,
  });

  const issues = readiness?.issues || [];
  const warnings = readiness?.warnings || [];
  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <div className="settings-portal settings-portal--command space-y-5">
      <PortalPageHeader
        title="Platform settings"
        description="Global configuration, readiness checks, and operational policies for RentDirect UG."
      />

      <SettingsLayout activeTab={tab} onTabChange={setTab} tabs={TABS}>
        <SettingsPanel
          kicker="Super Admin · Configuration"
          title={activeTab.label}
          description={activeTab.description}
        >
          {tab === "overview" && (
            <>
              <SettingsSection
                title="Production readiness"
                subtitle="Automated checklist from the live API — no secrets exposed."
                badge={
                  isLoading ? (
                    <SettingsStatusBadge status="neutral">Checking</SettingsStatusBadge>
                  ) : (
                    <SettingsStatusBadge status={readiness?.ready_for_global_demo ? "ok" : "warn"}>
                      {readiness?.ready_for_global_demo ? "Demo ready" : "Action required"}
                    </SettingsStatusBadge>
                  )
                }
              >
                {isLoading ? (
                  <p className="text-sm text-white/45">Running readiness probe…</p>
                ) : (
                  <>
                    <SettingsMetricGrid
                      items={[
                        { label: "Payments", value: paymentLabel(readiness) },
                        {
                          label: "Blockchain",
                          value: readiness?.blockchain?.treasury_configured ? "Treasury OK" : "Not set",
                        },
                        { label: "Walrus", value: readiness?.walrus_live ? "Live" : "Hash only" },
                        { label: "Environment", value: readiness?.environment || "—" },
                      ]}
                    />
                    {issues.length > 0 ? (
                      <ul className="mt-4 space-y-1.5 text-sm text-red-300/90">
                        {issues.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {warnings.length > 0 ? (
                      <ul className="mt-3 space-y-1.5 text-sm text-amber-200/80">
                        {warnings.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                )}
              </SettingsSection>

              <SettingsSection title="Service endpoints" subtitle="Public operational status by subsystem." tone="cyan">
                <SettingsFieldRow
                  label="Payment gateway"
                  value={paymentLabel(readiness)}
                  badge={<SettingsStatusBadge status={paymentStatus(readiness)}>{paymentLabel(readiness)}</SettingsStatusBadge>}
                />
                <SettingsFieldRow
                  label="Blockchain treasury"
                  value={readiness?.blockchain?.treasury_configured ? "Configured" : "Missing"}
                  badge={
                    <SettingsStatusBadge status={readiness?.blockchain?.treasury_configured ? "ok" : "err"}>
                      {readiness?.blockchain?.treasury_configured ? "OK" : "Missing"}
                    </SettingsStatusBadge>
                  }
                />
                <SettingsFieldRow
                  label="Walrus storage"
                  value={readiness?.walrus_live ? "Live anchors" : "Content hash only"}
                  badge={
                    <SettingsStatusBadge status={readiness?.walrus_live ? "ok" : "warn"}>
                      {readiness?.walrus_live ? "Live" : "Partial"}
                    </SettingsStatusBadge>
                  }
                />
              </SettingsSection>
            </>
          )}

          {tab === "security" && (
            <div className="settings-portal__policy-grid">
              <SettingsPolicyCard icon={Shield} title="Security" items={SECURITY_ITEMS} tone="red" />
              <SettingsPolicyCard icon={Server} title="Access control" items={SECURITY_ITEMS.slice(0, 3)} tone="emerald" />
            </div>
          )}

          {tab === "infrastructure" && (
            <div className="settings-portal__policy-grid">
              <SettingsPolicyCard icon={Database} title="Data platform" items={DATA_ITEMS} tone="purple" />
              <SettingsPolicyCard icon={Bell} title="Notifications" items={NOTIFY_ITEMS} tone="amber" />
            </div>
          )}

          {tab === "integrations" && (
            <div className="settings-portal__policy-grid">
              <SettingsPolicyCard icon={Globe} title="Deployment" items={DEPLOY_ITEMS} tone="cyan" />
              <SettingsPolicyCard icon={Bell} title="External services" items={NOTIFY_ITEMS} tone="emerald" />
            </div>
          )}
        </SettingsPanel>
      </SettingsLayout>
    </div>
  );
}
