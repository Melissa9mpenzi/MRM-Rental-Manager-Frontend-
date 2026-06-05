import PaymentMethodIcon from "./PaymentMethodIcon";
import { paymentMethodLabel, resolvePaymentMethod } from "../../lib/paymentMethods";

const RING = {
  mtn_momo: "ring-yellow-500/30 bg-yellow-500/10",
  airtel: "ring-red-500/30 bg-red-500/10",
  bank: "ring-sky-500/30 bg-sky-500/10",
  pesapal: "ring-indigo-500/30 bg-indigo-500/10",
  card: "ring-indigo-500/30 bg-indigo-500/10",
  sui: "ring-blue-400/30 bg-blue-400/10",
  cash: "ring-white/15 bg-white/8",
  other: "ring-indigo-500/30 bg-indigo-500/10",
};

export default function PaymentMethodBadge({ method, showIcon = true, className = "" }) {
  const cfg = resolvePaymentMethod(method);
  const ring = RING[cfg.id] || RING.other;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold text-white ring-1 ${ring} ${className}`}
    >
      {showIcon ? <PaymentMethodIcon method={method} className="h-5 w-5 rounded-md" /> : null}
      {paymentMethodLabel(method)}
    </span>
  );
}
