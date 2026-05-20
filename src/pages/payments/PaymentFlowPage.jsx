import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import PaymentMethodIcon from "../../components/payments/PaymentMethodIcon";
import { tenantPortalApi } from "../../api/tenantPortalApi";
import { TENANT_PAY_METHODS } from "../../lib/paymentMethods";
import { fetchGatewayStatus, pollCheckoutUntilDone, runTenantCheckoutUi } from "../../lib/checkoutFlow";
import useAuthStore from "../../store/authStore";

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

  const invoicesQuery = useQuery({
    queryKey: ["tenant-my-invoices-pay"],
    queryFn: () => tenantPortalApi.myInvoices(),
    retry: false,
  });

  const gatewayQuery = useQuery({
    queryKey: ["payment-gateway-status"],
    queryFn: fetchGatewayStatus,
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

  useEffect(() => {
    if (!returnRef) return;
    pollCheckoutUntilDone(returnRef).then((result) => {
      if (result.done) {
        toast.success("Payment confirmed!");
        qc.invalidateQueries({ queryKey: ["tenant-my-invoices-pay"] });
        qc.invalidateQueries({ queryKey: ["tenant-my-payments-pay"] });
      }
    });
  }, [returnRef, qc]);

  async function handlePay() {
    if (!openInvoice?.id) {
      toast.error("No open invoice to pay.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Enter your Mobile Money phone (256…).");
      return;
    }
    setPaying(true);
    try {
      await runTenantCheckoutUi({
        invoiceId: openInvoice.id,
        methodId: method,
        phone,
        onCompleted: () => {
          qc.invalidateQueries({ queryKey: ["tenant-my-invoices-pay"] });
          qc.invalidateQueries({ queryKey: ["tenant-my-payments-pay"] });
          qc.invalidateQueries({ queryKey: ["wallet-summary"] });
        },
      });
    } finally {
      setPaying(false);
    }
  }

  const noProfile = invoicesQuery.isError && invoicesQuery.error?.response?.status === 404;

  return (
    <AppPageScaffold
      variant="ledger"
      icon={CreditCard}
      title="Pay rent"
      description="Uganda payments via MTN MoMo API or Pesapal (not Flutterwave)."
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
      {noProfile && (
        <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No tenant profile linked. Accept your landlord invite first.
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
            <p className="text-sm text-white/50">No open invoices with a balance due.</p>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/60">MoMo phone</label>
            <input
              className="input-field w-full"
              placeholder="256700000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <h3 className="mb-1 text-sm font-bold text-white">Payment methods</h3>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Payment method">
              {TENANT_PAY_METHODS.map((m) => (
                <MethodRadio key={m.id} config={m} selected={method === m.id} onSelect={() => setMethod(m.id)} />
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={paying || !openInvoice}
            onClick={handlePay}
            className="w-full rounded-xl bg-brand-teal py-3.5 text-base font-extrabold text-[#041208] shadow-glow transition hover:brightness-110 disabled:opacity-40"
          >
            {paying ? "Starting checkout…" : "Pay now"}
          </button>
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
