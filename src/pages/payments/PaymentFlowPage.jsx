import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import PaymentMethodIcon from "../../components/payments/PaymentMethodIcon";
import ConnectWalletButton from "../../components/blockchain/ConnectWalletButton";
import PlatformSuiWallet from "../../components/blockchain/PlatformSuiWallet";
import { tenantPortalApi } from "../../api/tenantPortalApi";
import { TENANT_PAY_METHODS } from "../../lib/paymentMethods";
import { fetchGatewayStatus, pollCheckoutUntilDone, runTenantCheckoutUi } from "../../lib/checkoutFlow";
import { apiErrorMessage } from "../../lib/apiError";
import { fetchBlockchainStatus, runPlatformSuiCheckout, runSuiCheckout } from "../../lib/suiCheckout";
import useAuthStore from "../../store/authStore";
import { receiptsApi } from "../../api/receiptsApi";
import PaymentReceiptSuccess from "../../components/receipts/PaymentReceiptSuccess";
import "../../styles/receipt-portal.css";

function fmt(n) {
  return `UGX ${Number(n || 0).toLocaleString()}`;
}

export default function PaymentFlowPage() {
  const [searchParams] = useSearchParams();
  const returnRef = searchParams.get("checkout");
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [method, setMethod] = useState("mtn_momo");
  const [phone, setPhone] = useState(user?.phone || "");
  const [paying, setPaying] = useState(false);
  const [suiExternalWallet, setSuiExternalWallet] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [linking, setLinking] = useState(false);
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const profileQuery = useQuery({
    queryKey: ["tenant-me-pay"],
    queryFn: () => tenantPortalApi.myProfile(),
    retry: false,
  });

  const invoicesQuery = useQuery({
    queryKey: ["tenant-my-invoices-pay"],
    queryFn: () => tenantPortalApi.myInvoices(),
    retry: false,
    enabled: profileQuery.isSuccess,
  });

  const gatewayQuery = useQuery({
    queryKey: ["payment-gateway-status"],
    queryFn: fetchGatewayStatus,
    staleTime: 60_000,
  });

  const blockchainQuery = useQuery({
    queryKey: ["blockchain-status"],
    queryFn: fetchBlockchainStatus,
    staleTime: 60_000,
  });

  const paymentsQuery = useQuery({
    queryKey: ["tenant-my-payments-pay"],
    queryFn: () => tenantPortalApi.myPayments(),
    retry: false,
  });

  const openInvoice = useMemo(() => {
    const rows = Array.isArray(invoicesQuery.data) ? invoicesQuery.data : [];
    return rows.find((inv) => {
      const st = String(inv.status || "").toLowerCase();
      return st !== "paid" && st !== "cancelled" && Number(inv.balance_due || 0) > 0;
    });
  }, [invoicesQuery.data]);

  const totalDue = Number(openInvoice?.balance_due ?? 0);

  const history = useMemo(() => {
    const rows = Array.isArray(paymentsQuery.data) ? paymentsQuery.data : [];
    return [...rows]
      .sort((a, b) => String(b.payment_date).localeCompare(String(a.payment_date)))
      .slice(0, 8);
  }, [paymentsQuery.data]);

  async function showLatestReceipt() {
    try {
      const rows = await receiptsApi.list({ limit: 1 });
      if (rows?.[0]) setSuccessReceipt(rows[0]);
    } catch {
      /* receipt may lag slightly */
      setTimeout(async () => {
        try {
          const rows = await receiptsApi.list({ limit: 1 });
          if (rows?.[0]) setSuccessReceipt(rows[0]);
        } catch { /* ignore */ }
      }, 1500);
    }
  }

  useEffect(() => {
    if (!returnRef) return;
    pollCheckoutUntilDone(returnRef).then(async (result) => {
      if (result.done) {
        qc.invalidateQueries({ queryKey: ["tenant-my-invoices-pay"] });
        qc.invalidateQueries({ queryKey: ["tenant-my-payments-pay"] });
        qc.invalidateQueries({ queryKey: ["receipts-list"] });
        await showLatestReceipt();
      }
    });
  }, [returnRef, qc]);

  async function handleReconnectRental() {
    setLinking(true);
    try {
      await tenantPortalApi.reconnectProfile();
      toast.success("Rental record linked to this login.");
      await profileQuery.refetch();
      await invoicesQuery.refetch();
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err,
          "Could not link your rental. Ask your landlord to add this email on your tenant record."
        ),
        { duration: 6000 }
      );
    } finally {
      setLinking(false);
    }
  }

  function explainPayBlocked() {
    if (noProfile) {
      return `Link your rental to ${user?.email || "this login"} (same email the landlord used). You do not need to accept the invite again.`;
    }
    if (!openInvoice?.id) {
      return "There is no rent bill ready yet. Your landlord must assign you a unit and active lease, or all invoices are already paid.";
    }
    return null;
  }

  function handleMethodSelect(id) {
    setMethod(id);
    const blocked = explainPayBlocked();
    if (blocked) toast.error(blocked, { duration: 5000 });
  }

  async function handlePay() {
    const blocked = explainPayBlocked();
    if (blocked) {
      toast.error(blocked, { duration: 5000 });
      return;
    }
    if (method !== "sui" && !phone.trim()) {
      toast.error("Enter your Mobile Money phone (256…).");
      return;
    }
    if (method === "sui" && suiExternalWallet && !account?.address) {
      toast.error("Connect your Sui wallet first (Slush, Nightly, Suiet, etc.), or uncheck “browser wallet”.");
      return;
    }
    setPaying(true);
    try {
      const onDone = async () => {
        qc.invalidateQueries({ queryKey: ["tenant-my-invoices-pay"] });
        qc.invalidateQueries({ queryKey: ["tenant-my-payments-pay"] });
        qc.invalidateQueries({ queryKey: ["receipts-list"] });
        qc.invalidateQueries({ queryKey: ["wallet-summary"] });
        qc.invalidateQueries({ queryKey: ["blockchain-receipts"] });
        await showLatestReceipt();
      };
      if (method === "sui") {
        let checkout;
        if (suiExternalWallet) {
          checkout = await runSuiCheckout({
            invoiceId: openInvoice.id,
            signAndExecuteTransaction,
            accountAddress: account.address,
            onCompleted: onDone,
          });
        } else {
          checkout = await runPlatformSuiCheckout({
            invoiceId: openInvoice.id,
            onCompleted: onDone,
          });
        }
        if (!checkout) return;
      } else {
        await runTenantCheckoutUi({
          invoiceId: openInvoice.id,
          methodId: method,
          phone,
          onCompleted: onDone,
        });
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Payment could not be started. Try another method."), {
        duration: 6000,
      });
    } finally {
      setPaying(false);
    }
  }

  const noProfile =
    (profileQuery.isError && profileQuery.error?.response?.status === 404) ||
    (invoicesQuery.isError && invoicesQuery.error?.response?.status === 404);
  const payBlocked = Boolean(explainPayBlocked());

  return (
    <>
      {successReceipt && (
        <PaymentReceiptSuccess receipt={successReceipt} onClose={() => setSuccessReceipt(null)} />
      )}
    <AppPageScaffold
      variant="ledger"
      icon={CreditCard}
      title="Pay rent"
      description="Hybrid payments: MTN MoMo, Pesapal (Airtel/card), and Sui — your wallet is created with your email account."
    >
      {gatewayQuery.data && !gatewayQuery.data.configured && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Configure <strong>MTN MoMo</strong> or <strong>Pesapal</strong> on the API server. See{" "}
          <code className="rounded bg-black/30 px-1 text-xs">docs/PAYMENT_GATEWAY.md</code>.
        </div>
      )}
      {gatewayQuery.data?.configured && (
        <div className="mb-4 rounded-xl border border-brand-teal/30 bg-brand-teal/10 px-4 py-3 text-sm text-brand-teal">
          {gatewayQuery.data.setup_hint}
          {gatewayQuery.data.provider === "mtn_momo" && !gatewayQuery.data.supports?.airtel && (
            <span className="mt-1 block text-white/70">
              Airtel/card: set <code className="text-xs">PAYMENT_GATEWAY_PROVIDER=pesapal</code> on the API.
            </span>
          )}
        </div>
      )}
      {blockchainQuery.data?.enabled && (
        <div className="mb-4 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
          <strong>Sui blockchain</strong> active on {blockchainQuery.data.network}. Fiat payments can
          generate immutable receipts; wallet payments use on-chain settlement.
        </div>
      )}
      {noProfile && (
        <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-semibold">No tenant profile linked</p>
          <p className="mt-1 text-amber-100/90">
            You are signed in as <strong>{user?.email || "—"}</strong>. If you already accepted the invite, you do{" "}
            <strong>not</strong> need to do it again — link that rental record to this login (same email).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={linking}
              onClick={handleReconnectRental}
              className="inline-flex rounded-lg bg-amber-500/25 px-4 py-2 text-sm font-bold text-amber-50 hover:bg-amber-500/35 disabled:opacity-50"
            >
              {linking ? "Linking…" : "Link rental to this account"}
            </button>
            <Link
              to="/tenant/accept-invite"
              className="inline-flex rounded-lg border border-amber-400/40 px-4 py-2 text-sm font-bold text-amber-50 hover:bg-amber-500/15"
            >
              I still have an invite link
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-glass space-y-6 p-6">
          <h2 className="text-lg font-bold text-white">Payment summary</h2>
          {invoicesQuery.isLoading ? (
            <p className="text-sm text-white/45">Loading invoice…</p>
          ) : openInvoice ? (
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm">
              <Row label={`Invoice ${openInvoice.invoice_number ?? ""}`} value={fmt(totalDue)} />
              <div className="border-t border-white/10 pt-3">
                <div className="flex justify-between font-extrabold text-white">
                  <span>Total due</span>
                  <span className="text-brand-teal">{fmt(totalDue)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
              <p className="font-semibold text-white/80">No open invoices with a balance due.</p>
              <p className="mt-2">
                {noProfile
                  ? "Link your account first (see above), then return here."
                  : "If you have an active lease, refresh this page — we create this month’s rent bill automatically. Otherwise ask your landlord to add you as a tenant and start a lease."}
              </p>
              {!noProfile && (
                <button
                  type="button"
                  className="mt-3 text-sm font-bold text-brand-teal hover:underline"
                  onClick={() => {
                    qc.invalidateQueries({ queryKey: ["tenant-my-invoices-pay"] });
                    invoicesQuery.refetch();
                  }}
                >
                  Refresh invoice
                </button>
              )}
            </div>
          )}

          {method === "sui" ? (
            <div className="space-y-3">
              <label className="mb-1 block text-xs font-semibold text-white/60">Your Sui wallet</label>
              {!suiExternalWallet ? (
                <PlatformSuiWallet />
              ) : (
                <ConnectWalletButton />
              )}
              <label className="flex cursor-pointer items-center gap-2 text-xs text-white/55">
                <input
                  type="checkbox"
                  checked={suiExternalWallet}
                  onChange={(e) => setSuiExternalWallet(e.target.checked)}
                  className="rounded border-white/20"
                />
                Use browser wallet instead (Slush, Suiet, Nightly — advanced)
              </label>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/60">MoMo phone</label>
              <input
                className="input-field w-full"
                placeholder="256700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          <div>
            <h3 className="mb-1 text-sm font-bold text-white">Payment methods</h3>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Payment method">
              {TENANT_PAY_METHODS.map((m) => (
                <MethodRadio
                  key={m.id}
                  config={m}
                  selected={method === m.id}
                  onSelect={() => handleMethodSelect(m.id)}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={paying}
            onClick={handlePay}
            className={`w-full rounded-xl py-3.5 text-base font-extrabold shadow-glow transition ${
              payBlocked
                ? "cursor-not-allowed bg-brand-teal/40 text-[#041208]/70"
                : "bg-brand-teal text-[#041208] hover:brightness-110"
            }`}
            aria-disabled={payBlocked || paying}
          >
            {paying ? "Starting checkout…" : payBlocked ? "Pay now (not ready)" : "Pay now"}
          </button>
          {payBlocked && (
            <p className="text-center text-xs text-white/45">
              Select a payment method above after your rent bill is ready — then tap Pay now.
            </p>
          )}
        </div>

        <div className="card-glass p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Payment history</h2>
          {paymentsQuery.isLoading ? (
            <p className="text-sm text-white/45">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-white/45">No payments on file yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <PaymentMethodIcon method={h.payment_method} className="h-9 w-9 flex-shrink-0 rounded-lg" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">
                        {h.property_name || "Rent payment"}
                      </div>
                      <div className="text-xs text-white/45">{h.payment_date}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm font-extrabold text-brand-teal">{fmt(h.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppPageScaffold>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-white/70">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function MethodRadio({ config, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition ${
        selected
          ? "border-brand-teal/60 bg-brand-teal/12"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      <PaymentMethodIcon method={config.id} className="h-11 w-11 flex-shrink-0 rounded-xl" />
      <div className="min-w-0">
        <div className="text-sm font-bold text-white">{config.label}</div>
        <div className="text-xs text-white/45">{config.sub}</div>
      </div>
    </button>
  );
}
