import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link2, Wallet, Database, CreditCard, BookOpen } from "lucide-react";
import { blockchainApi } from "../../api/blockchainApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import {
  SettingsFieldRow,
  SettingsLayout,
  SettingsPanel,
  SettingsSection,
  SettingsStatusBadge,
} from "../../components/settings/SettingsPortal";

const TABS = [
  { id: "network", label: "Network", icon: Link2, description: "RPC & chain" },
  { id: "treasury", label: "Treasury", icon: Wallet, description: "Sui contracts" },
  { id: "storage", label: "Walrus", icon: Database, description: "Durable proofs" },
  { id: "fiat", label: "Fiat bridge", icon: CreditCard, description: "MoMo / Pesapal" },
];

function boolBadge(ok, okLabel, failLabel) {
  return (
    <SettingsStatusBadge status={ok ? "ok" : "warn"}>
      {ok ? okLabel : failLabel}
    </SettingsStatusBadge>
  );
}

export default function SuiSettingsPage() {
  const [tab, setTab] = useState("network");
  const { data, isLoading } = useQuery({
    queryKey: ["blockchain-status"],
    queryFn: () => blockchainApi.status(),
    staleTime: 60_000,
  });

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0];
  const gateway = data?.fiat_gateway || {};

  return (
    <AppPageScaffold
      variant="showcase"
      icon={Wallet}
      title="Sui configuration"
      description="On-chain network, treasury, Walrus storage, and fiat gateway status for RentDirect hybrid payments."
    >
      <div className="settings-portal settings-portal--sui">
        <SettingsLayout activeTab={tab} onTabChange={setTab} tabs={TABS}>
          <SettingsPanel
            kicker="Blockchain · Infrastructure"
            title={activeTab.label}
            description={activeTab.description}
          >
            {isLoading ? (
              <p className="text-sm text-white/45">Loading chain configuration…</p>
            ) : (
              <>
                {tab === "network" && (
                  <SettingsSection
                    title="Sui network"
                    subtitle="Public RPC and deployment identifiers."
                    badge={boolBadge(data?.enabled, "Enabled", "Disabled")}
                  >
                    <SettingsFieldRow label="Network" value={data?.network} />
                    <SettingsFieldRow label="RPC endpoint" value={data?.rpc_url} mono />
                    <SettingsFieldRow label="Explorer" value={data?.explorer_base_url || "Default"} mono />
                  </SettingsSection>
                )}

                {tab === "treasury" && (
                  <SettingsSection
                    title="Treasury & packages"
                    subtitle="Smart contract deployment for receipts and escrow."
                    tone="violet"
                    badge={boolBadge(data?.treasury_configured, "Configured", "Missing")}
                  >
                    <SettingsFieldRow
                      label="Treasury address"
                      value={data?.treasury_configured ? "Set in environment" : "Missing SUI_TREASURY_ADDRESS"}
                      mono
                    />
                    <SettingsFieldRow label="Package ID" value={data?.package_id || "Not deployed"} mono />
                    <SettingsFieldRow
                      label="Receipt anchoring"
                      value={data?.receipt_anchoring ? "Active" : "Inactive"}
                      badge={boolBadge(data?.receipt_anchoring, "Active", "Inactive")}
                    />
                  </SettingsSection>
                )}

                {tab === "storage" && (
                  <SettingsSection
                    title="Walrus durable storage"
                    subtitle="Immutable artifact storage for KYC, property packets, and audit bundles."
                    tone="cyan"
                    badge={boolBadge(data?.walrus_configured, "Connected", "Optional")}
                  >
                    <SettingsFieldRow
                      label="Walrus publisher"
                      value={data?.walrus_configured ? "Configured" : "Not set — optional"}
                    />
                    <SettingsFieldRow
                      label="Inventory"
                      value={`${data?.walrus_inventory?.total_artifacts ?? 0} artifacts`}
                    />
                  </SettingsSection>
                )}

                {tab === "fiat" && (
                  <SettingsSection
                    title="Fiat payment gateway"
                    subtitle="MTN MoMo and Pesapal bridge alongside on-chain settlement."
                    tone="amber"
                    badge={boolBadge(gateway?.configured, "Configured", gateway?.mock_enabled ? "Mock" : "Off")}
                  >
                    <SettingsFieldRow label="Provider" value={gateway?.provider || "—"} />
                    <SettingsFieldRow label="Mode" value={gateway?.mode || "—"} />
                    <SettingsFieldRow
                      label="Live payments"
                      value={gateway?.live_payments ? "Yes" : "No"}
                      badge={boolBadge(gateway?.live_payments, "Live", "Test / mock")}
                    />
                  </SettingsSection>
                )}

                <SettingsSection title="Documentation" subtitle="Operator runbooks for treasury and Walrus setup." tone="violet">
                  <p className="text-sm leading-relaxed text-white/60">
                    See{" "}
                    <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">docs/SUI_PAYMENTS.md</code> and{" "}
                    <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">docs/HACKATHON_SUI_WALRUS.md</code>{" "}
                    for treasury configuration, judge demo flow, and Walrus publisher setup.
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-white/40">
                    <BookOpen size={14} />
                    Changes require API environment variables on Vercel — redeploy after updating secrets.
                  </p>
                </SettingsSection>
              </>
            )}
          </SettingsPanel>
        </SettingsLayout>
      </div>
    </AppPageScaffold>
  );
}
