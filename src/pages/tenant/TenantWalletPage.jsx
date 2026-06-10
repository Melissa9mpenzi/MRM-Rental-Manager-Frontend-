import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Wallet, ArrowDownLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { tenantPortalApi } from "../../api/tenantPortalApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import PaymentMethodBadge from "../../components/payments/PaymentMethodBadge";
import PaymentMethodIcon from "../../components/payments/PaymentMethodIcon";
import { paymentsApi } from "../../api/paymentsApi";
import { blockchainApi } from "../../api/blockchainApi";
import BlockchainReceiptCard from "../../components/blockchain/BlockchainReceiptCard";
import EscrowStatusPanel from "../../components/blockchain/EscrowStatusPanel";
import WalletReputationCard from "../../components/sui/WalletReputationCard";

function fmt(n) {
  return `UGX ${Number(n || 0).toLocaleString()}`;
}

export default function TenantWalletPage() {
  const user = useAuthStore((s) => s.user);

  const paymentsQuery = useQuery({
    queryKey: ["tenant-my-payments"],
    queryFn: () => tenantPortalApi.myPayments(),
    enabled: user?.role === "tenant",
    retry: false,
  });

  const walletQuery = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: () => paymentsApi.walletSummary(),
    enabled: !!user,
    retry: false,
  });

  const receiptsQuery = useQuery({
    queryKey: ["blockchain-receipts"],
    queryFn: () => blockchainApi.receipts(),
    enabled: !!user,
    retry: false,
  });

  const escrowsQuery = useQuery({
    queryKey: ["blockchain-escrows"],
    queryFn: () => blockchainApi.escrows(),
    enabled: !!user,
    retry: false,
  });

  const myWalletQuery = useQuery({
    queryKey: ["blockchain-wallet-me"],
    queryFn: () => blockchainApi.myWallet(),
    enabled: !!user,
    staleTime: 30_000,
    retry: false,
  });

  const invoicesQuery = useQuery({
    queryKey: ["tenant-my-invoices"],
    queryFn: () => tenantPortalApi.myInvoices(),
    enabled: user?.role === "tenant",
    retry: false,
  });

  const noProfile =
    (paymentsQuery.isError && paymentsQuery.error?.response?.status === 404) ||
    (invoicesQuery.isError && invoicesQuery.error?.response?.status === 404);

  const outstanding = useMemo(() => {
    const rows = Array.isArray(invoicesQuery.data) ? invoicesQuery.data : [];
    return rows.reduce((s, inv) => s + Number(inv.balance_due || 0), 0);
  }, [invoicesQuery.data]);

  const y = new Date().getFullYear();
  const ytdPaid = useMemo(() => {
    const rows = Array.isArray(paymentsQuery.data) ? paymentsQuery.data : [];
    return rows.reduce((sum, p) => {
      if (!p?.payment_date) return sum;
      const d = new Date(p.payment_date);
      if (d.getFullYear() !== y) return sum;
      return sum + Number(p.amount || 0);
    }, 0);
  }, [paymentsQuery.data, y]);

  const transactions = useMemo(() => {
    const rows = Array.isArray(paymentsQuery.data) ? paymentsQuery.data : [];
    return [...rows].sort((a, b) => String(b.payment_date).localeCompare(String(a.payment_date)));
  }, [paymentsQuery.data]);

  return (
    <AppPageScaffold
      variant="ledger"
      icon={Wallet}
      title="Wallet"
      description="Payments, invoices, and on-chain receipts."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/tenant/pay"
            className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold"
          >
            Pay rent
          </Link>
          <Link
            to="/tenant/receipts"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white/75 hover:border-violet-500/40 hover:text-violet-200"
          >
            Receipts
          </Link>
        </div>
      }
    >
      {noProfile && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No tenant profile is linked to this login. Accept a landlord invite, then open this page again.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-glass relative overflow-hidden p-5 sm:col-span-2">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-teal/20 blur-2xl" />
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-teal/30 bg-brand-teal/15 text-brand-teal">
              <Wallet size={22} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/45">Paid this year</div>
              <div className="mt-1 text-3xl font-extrabold text-white">
                {paymentsQuery.isLoading ? "…" : fmt(ytdPaid)}
              </div>
              <p className="mt-2 max-w-md text-xs text-white/50">
                {walletQuery.data?.payment_count != null
                  ? `${walletQuery.data.payment_count} payments on file`
                  : "Totals from your payment history"}
              </p>
              {walletQuery.data?.by_method && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(walletQuery.data.by_method).map(([key, val]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/70"
                    >
                      <PaymentMethodIcon method={key} className="h-5 w-5 rounded" />
                      {fmt(val)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="card-glass flex flex-col justify-center p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/45">Invoice balance due</div>
          <div className="mt-1 text-2xl font-bold text-amber-200">
            {invoicesQuery.isLoading ? "…" : fmt(outstanding)}
          </div>
          <p className="mt-2 text-xs text-white/45">From open invoices on your account.</p>
        </div>
      </div>

      <WalletReputationCard
        reputation={myWalletQuery.data?.reputation}
        suiAddress={myWalletQuery.data?.sui_address}
      />

      {(receiptsQuery.data?.length > 0 || escrowsQuery.data?.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.isArray(receiptsQuery.data) && receiptsQuery.data.length > 0 && (
            <div className="card-glass space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">On-chain receipts</h2>
                <Link to="/tenant/receipts" className="text-xs font-bold text-violet-300 hover:underline">
                  All
                </Link>
              </div>
              {receiptsQuery.data.slice(0, 5).map((r) => (
                <BlockchainReceiptCard key={r.id} receipt={r} />
              ))}
            </div>
          )}
          <EscrowStatusPanel escrows={Array.isArray(escrowsQuery.data) ? escrowsQuery.data : []} />
        </div>
      )}

      <div className="card-glass overflow-hidden">
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">Payment history</h2>
        </div>
        <div className="overflow-x-auto">
          {paymentsQuery.isLoading ? (
            <div className="p-8 text-center text-sm text-white/45">Loading…</div>
          ) : paymentsQuery.isError && !noProfile ? (
            <div className="p-8 text-center text-sm text-red-300">Could not load payments.</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/45">No payments on file yet.</div>
          ) : (
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-bold uppercase tracking-wide text-white/40">
                <tr>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-medium text-white">
                      {t.property_name ? `${t.property_name}` : "Rent payment"}
                      {t.unit_number ? ` · ${t.unit_number}` : ""}
                    </td>
                    <td className="px-5 py-3 text-white/50">{t.payment_date ?? "—"}</td>
                    <td className="px-5 py-3">
                      <PaymentMethodBadge method={t.payment_method} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-brand-teal">
                        <ArrowDownLeft size={14} />+{fmt(t.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-white/40">
        Billing details:{" "}
        <Link className="font-semibold text-brand-teal hover:underline" to="/tenant/settings">
          Settings
        </Link>
        .
      </p>
    </AppPageScaffold>
  );
}
