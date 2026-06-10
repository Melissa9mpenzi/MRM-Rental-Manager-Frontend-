import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  ArrowDownLeft,
  Plus,
  Landmark,
  Smartphone,
  Shield,
  AlertCircle,
} from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import PaymentMethodBadge from "../../components/payments/PaymentMethodBadge";
import PaymentMethodIcon from "../../components/payments/PaymentMethodIcon";
import EscrowStatusPanel from "../../components/blockchain/EscrowStatusPanel";
import { paymentsApi } from "../../api/paymentsApi";
import { blockchainApi } from "../../api/blockchainApi";
import WalletReputationCard from "../../components/sui/WalletReputationCard";
import { apiErrorMessage } from "../../lib/apiError";
import { PLATFORM_API_URL } from "../../api/config";
import { ErrorPanel, LoadingPanel } from "../../components/ui/StatePanel";

function fmt(n) {
  return `UGX ${Number(n || 0).toLocaleString()}`;
}

const METHOD_LABELS = {
  mtn_momo: "MTN MoMo",
  airtel: "Airtel Money",
  bank: "Bank transfer",
  sui: "Sui wallet",
  pesapal: "Pesapal / Card",
  card: "Card",
  other: "Pesapal",
  cash: "Cash (legacy)",
};

export default function LandlordWalletPage() {
  const walletQuery = useQuery({
    queryKey: ["wallet-summary", "landlord"],
    queryFn: () => paymentsApi.walletSummary(),
    refetchInterval: 45_000,
  });

  const gatewayQuery = useQuery({
    queryKey: ["payment-gateway-status"],
    queryFn: () => paymentsApi.gatewayStatus(),
    staleTime: 60_000,
  });

  const escrowsQuery = useQuery({
    queryKey: ["blockchain-escrows", "landlord"],
    queryFn: () => blockchainApi.escrows(),
    retry: false,
  });

  const myWalletQuery = useQuery({
    queryKey: ["blockchain-wallet-me", "landlord"],
    queryFn: () => blockchainApi.myWallet(),
    staleTime: 30_000,
    retry: false,
  });

  const w = walletQuery.data || {};
  const recent = useMemo(
    () => (Array.isArray(w.recent_payments) ? w.recent_payments : []),
    [w.recent_payments]
  );

  const gw = gatewayQuery.data || {};
  const onlineConfigured = gw.configured === true;

  return (
    <AppPageScaffold
      variant="ledger"
      icon={Wallet}
      title="Wallet"
      description="Collections, payouts, and on-chain receipts."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to="/landlord/payments/new" className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold">
            <Plus size={16} /> Record payment
          </Link>
          <Link
            to="/landlord/payments"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white/75 hover:border-[#00C896]/40 hover:text-[#00C896]"
          >
            All payments
          </Link>
        </div>
      }
    >
      {walletQuery.isLoading ? (
        <LoadingPanel className="h-40" />
      ) : walletQuery.isError ? (
        <ErrorPanel
          title="Could not load wallet"
          description={
            apiErrorMessage(
              walletQuery.error,
              "Could not load payment totals from the API."
            ) +
            ` (GET ${PLATFORM_API_URL}/api/v1/payments/wallet-summary)`
          }
          onRetry={() => walletQuery.refetch()}
        />
      ) : (
        <div className="space-y-6">
          <WalletReputationCard
            reputation={myWalletQuery.data?.reputation}
            suiAddress={myWalletQuery.data?.sui_address}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-glass relative overflow-hidden p-5 sm:col-span-2">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00C896]/20 blur-2xl" />
              <div className="text-xs font-bold uppercase tracking-wider text-white/45">Available (collected)</div>
              <div className="mt-1 text-3xl font-extrabold text-[#00C896]">
                {fmt(w.available_ugx ?? w.total_collected_ugx)}
              </div>
              <p className="mt-2 text-xs text-white/50">
                {w.payment_count ?? 0} rent payments recorded · {fmt(w.this_month_collected_ugx)} this month
                {w.collection_rate_pct != null ? ` (${w.collection_rate_pct}% of expected)` : ""}
              </p>
            </div>
            <div className="card-glass p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200/90">
                <AlertCircle size={14} /> Outstanding
              </div>
              <div className="mt-1 text-2xl font-bold text-amber-200">{fmt(w.outstanding_rent_ugx)}</div>
              <p className="mt-2 text-xs text-white/45">
                {w.tenants_in_arrears ?? 0} tenant(s) behind ·{" "}
                <Link to="/landlord/reports/arrears" className="text-[#00C896] hover:underline">
                  Arrears report
                </Link>
              </p>
            </div>
            <div className="card-glass p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-200/90">
                <Shield size={14} /> Escrow held
              </div>
              <div className="mt-1 text-2xl font-bold text-violet-200">{fmt(w.escrow_held_ugx)}</div>
              <p className="mt-2 text-xs text-white/45">
                {w.escrow_active_count ?? 0} active Sui escrow hold(s)
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card-glass p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Smartphone size={16} className="text-sky-300" />
                Online collections (MoMo / Pesapal / Sui)
              </h3>
              <div className="text-2xl font-bold text-sky-200">{fmt(w.by_method_online_ugx)}</div>
              <p className="mt-2 text-xs text-white/45">
                {onlineConfigured
                  ? `Gateway: ${gw.provider || "configured"} (${gw.mode || "live"}) — tenants can pay from the app.`
                  : "Online gateway not configured — set MTN MoMo or Pesapal keys on the API to enable tenant payments."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(w.by_method || {})
                  .filter(([k]) => !["cash", "bank"].includes(k))
                  .map(([key, val]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/70"
                    >
                      <PaymentMethodIcon method={key} className="h-5 w-5 rounded" />
                      {METHOD_LABELS[key] || key}: {fmt(val)}
                    </span>
                  ))}
              </div>
            </div>

            <div className="card-glass p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Landmark size={16} className="text-white/60" />
                Bank transfers (recorded)
              </h3>
              <div className="text-2xl font-bold text-white">{fmt(w.by_method_manual_ugx)}</div>
              <p className="mt-2 text-xs text-white/45">
                Bank transfers you record manually — not auto-settled via MoMo or Pesapal.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["bank"].map((key) =>
                  w.by_method?.[key] ? (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/70"
                    >
                      <PaymentMethodIcon method={key} className="h-5 w-5 rounded" />
                      {METHOD_LABELS[key]}: {fmt(w.by_method[key])}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          </div>

          {(escrowsQuery.data?.length > 0 || (w.escrow_active_count ?? 0) > 0) && (
            <div className="card-glass p-5">
              <EscrowStatusPanel escrows={Array.isArray(escrowsQuery.data) ? escrowsQuery.data : []} />
              <Link to="/landlord/receipts" className="mt-3 inline-block text-xs font-bold text-violet-300 hover:underline">
                View receipts →
              </Link>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/50">
            <strong className="text-white/70">Payout note:</strong> Balances here are rent recorded in RentDirect UG (your
            ledger). Automatic payout to your personal MoMo or bank account requires linking a settlement API in production;
            until then, use <Link to="/landlord/payments" className="text-[#00C896] hover:underline">Payments</Link> to reconcile
            and withdraw offline.
          </div>

          <div className="card-glass overflow-hidden">
            <div className="border-b border-white/[0.08] px-5 py-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">Recent collections</h2>
            </div>
            <div className="overflow-x-auto">
              {recent.length === 0 ? (
                <div className="p-8 text-center text-sm text-white/45">
                  No payments recorded yet.{" "}
                  <Link to="/landlord/payments/new" className="font-bold text-[#00C896] hover:underline">
                    Record a payment
                  </Link>
                </div>
              ) : (
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-bold uppercase tracking-wide text-white/40">
                    <tr>
                      <th className="px-5 py-3">Tenant / property</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {recent.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3">
                          <div className="font-medium text-white">{t.tenant_name || "Tenant"}</div>
                          <div className="text-xs text-white/45">
                            {t.property_name || "—"}
                            {t.unit_number ? ` · ${t.unit_number}` : ""}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-white/50">{t.payment_date ?? "—"}</td>
                        <td className="px-5 py-3">
                          <PaymentMethodBadge method={t.payment_method} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-[#00C896]">
                            <ArrowDownLeft size={14} />
                            +{fmt(t.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </AppPageScaffold>
  );
}
