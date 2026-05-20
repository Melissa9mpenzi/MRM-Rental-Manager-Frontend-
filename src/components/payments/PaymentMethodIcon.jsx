import { paymentLogoPath, resolvePaymentMethod } from "../../lib/paymentMethods";

/** Brand logo for MTN, Airtel, Visa, bank, cash, etc. */
export default function PaymentMethodIcon({ method, className = "h-9 w-9 rounded-lg" }) {
  const cfg = resolvePaymentMethod(method);
  return (
    <img
      src={paymentLogoPath(cfg.logo)}
      alt=""
      title={cfg.label}
      className={`object-contain ${className}`}
      width={36}
      height={36}
      draggable={false}
    />
  );
}
