import { useQuery } from "@tanstack/react-query";
import { Wallet, Lock, ArrowRightLeft } from "lucide-react";
import { paymentsApi } from "../../api/paymentsApi";
import { blockchainApi } from "../../api/blockchainApi";
import PortalPageHeader from "../../components/system/PortalPageHeader";
import SystemKpiRow from "../../components/system/SystemKpiRow";

export default function SystemWalletsPage() {
  const { data: walletSummary, isLoading: walletLoading } = useQuery({
    queryKey: ["admin-wallet-summary"],
    queryFn: () => paymentsApi.walletSummary(),
    staleTime: 60_000,
  });
  const { data: chainDash } = useQuery({
    queryKey: ["admin-blockchain-dashboard"],
    queryFn: () => blockchainApi.dashboard(),
    staleTime: 60_000,
  });

  const totals = chainDash?.totals || {};
  const byMethod = walletSummary?.by_method || {};

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Wallets"
        description="Tenant wallets, landlord balances, and on-chain activity."
      />
      <SystemKpiRow
        cards={[
          {
            key: "payments_rent_this_month",
            label: "Volume (month)",
            icon: Wallet,
            tone: "emerald",
            format: (n) => `UGX ${Number(n || 0).toLocaleString()}`,
          },
          { key: "tenants_active", label: "Active wallets", icon: ArrowRightLeft, tone: "blue" },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="gov-glass border-l-4 border-emerald-500/50 p-4">
          <Lock size={20} className="text-emerald-400" />
          <p className="mt-2 font-semibold text-white">Fiat rent collected</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {walletLoading ? "…" : `UGX ${Number(walletSummary?.total_paid_ugx || 0).toLocaleString()}`}
          </p>
          <p className="mt-1 text-xs text-white/45">{walletSummary?.payment_count || 0} payments · scope {walletSummary?.scope || "—"}</p>
        </div>
        <div className="gov-glass border-l-4 border-cyan-500/50 p-4">
          <Wallet size={20} className="text-cyan-400" />
          <p className="mt-2 font-semibold text-white">Sui on-chain</p>
          <p className="mt-1 text-2xl font-bold text-white">{totals.transactions ?? 0} tx</p>
          <p className="mt-1 text-xs text-white/45">
            Volume {totals.volume_sui ?? 0} SUI · {totals.active_escrow ?? 0} active escrow
          </p>
        </div>
      </div>
      <div className="gov-glass p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-white/40">Payments by method</p>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          {Object.keys(byMethod).length === 0 ? (
            <li className="text-white/45">No payment breakdown yet.</li>
          ) : (
            Object.entries(byMethod).map(([method, amount]) => (
              <li key={method} className="flex justify-between gap-4">
                <span className="capitalize">{method.replace(/_/g, " ")}</span>
                <span className="font-mono">UGX {Number(amount || 0).toLocaleString()}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
