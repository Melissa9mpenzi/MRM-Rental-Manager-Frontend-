import { useState } from "react";
import { CreditCard, Smartphone, Coins, Building2 } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

const HISTORY = [
  { id: 1, label: "May 2026 rent", amount: "2,800,000", when: "May 2 · MTN MoMo", ok: true },
  { id: 2, label: "Apr 2026 rent", amount: "2,800,000", when: "Apr 1 · Visa", ok: true },
  { id: 3, label: "Service fee", amount: "28,000", when: "Mar 28 · Sui", ok: true },
];

const PAYMENT_METHODS = [
  {
    id: "mtn",
    label: "MTN Mobile Money",
    sub: "Pay with your MTN MoMo wallet",
    icon: Smartphone,
  },
  {
    id: "airtel",
    label: "Airtel Money",
    sub: "Pay with your Airtel Money wallet",
    icon: Smartphone,
  },
  {
    id: "card",
    label: "Visa / Mastercard",
    sub: "Debit or credit card",
    icon: CreditCard,
  },
  {
    id: "sui",
    label: "Sui Wallet",
    sub: "Sui Network · on-chain settlement (preview)",
    icon: Coins,
  },
];

export default function PaymentFlowPage() {
  const [method, setMethod] = useState("mtn");

  return (
    <AppPageScaffold
      variant="ledger"
      icon={CreditCard}
      title="Pay rent"
      description="Review the breakdown, pick a method, and confirm."
    >
      <div className="grid gap-6 lg:grid-cols-2">
      <div className="card-glass space-y-6 p-6">
        <h2 className="text-lg font-bold text-white">Payment summary</h2>
        <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm">
          <Row label="Rent (May 2026)" value="UGX 2,800,000" />
          <Row label="Platform service fee" value="UGX 28,000" />
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between font-extrabold text-white">
              <span>Total due</span>
              <span className="text-brand-teal">UGX 2,828,000</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-bold text-white">Payment methods</h3>
          <p className="mb-3 text-xs text-white/45">Select one option (mockup-style radio list).</p>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Payment method">
            {PAYMENT_METHODS.map((m) => (
              <MethodRadio key={m.id} config={m} selected={method === m.id} onSelect={() => setMethod(m.id)} />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-xl bg-brand-teal py-3.5 text-base font-extrabold text-[#041208] shadow-glow transition hover:brightness-110"
        >
          Pay now
        </button>
      </div>

      <div className="card-glass p-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="text-brand-teal" size={18} />
          <h2 className="text-lg font-bold text-white">Transaction history</h2>
        </div>
        <div className="space-y-2">
          {HISTORY.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
            >
              <div>
                <div className="text-sm font-bold text-white">{h.label}</div>
                <div className="text-xs text-white/45">{h.when}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-brand-teal">UGX {h.amount}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400/90">
                  {h.ok ? "Paid" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
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
  const Icon = config.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition ${
        selected
          ? "border-brand-teal/60 bg-brand-teal/12 shadow-[0_0_20px_rgba(0,192,118,0.12)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
          selected ? "border-brand-teal bg-brand-teal" : "border-white/35 bg-transparent"
        }`}
        aria-hidden
      >
        {selected && <span className="h-2 w-2 rounded-full bg-[#041208]" />}
      </span>
        <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25">
          <Icon size={22} className={selected ? "text-brand-teal" : "text-white/70"} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white">{config.label}</div>
          <div className="text-xs text-white/45">{config.sub}</div>
        </div>
      </div>
    </button>
  );
}
