import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Lock, ShieldCheck } from "lucide-react";
import BrandMark from "../brand/BrandMark";

function fmtUgx(n) {
  return `UGX ${Number(n || 0).toLocaleString()}`;
}

/**
 * Branded handoff before Pesapal hosted checkout.
 * Pesapal owns the payment page; we keep RentDirect branding until redirect.
 */
export default function PaymentCheckoutHandoff({
  open,
  amount,
  invoiceLabel,
  paymentLink,
  onRedirect,
  onCancel,
  countdownSec = 3,
}) {
  const [seconds, setSeconds] = useState(countdownSec);

  useEffect(() => {
    if (!open) {
      setSeconds(countdownSec);
      return undefined;
    }
    setSeconds(countdownSec);
    const tick = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [open, countdownSec]);

  useEffect(() => {
    if (!open || seconds > 0 || !paymentLink) return;
    onRedirect?.(paymentLink);
  }, [open, seconds, paymentLink, onRedirect]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-[#0a1210]/92 p-4 pt-[max(5rem,18vh)] backdrop-blur-md sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-handoff-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a2622] to-[#121a18] shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5 text-center">
          <BrandMark imgClassName="mx-auto h-9 w-auto object-contain" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-brand-teal/90">
            Secure checkout
          </p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="text-center">
            <h2 id="checkout-handoff-title" className="text-lg font-extrabold text-white">
              Redirecting to payment…
            </h2>
            <p className="mt-2 text-sm text-white/60">
              You&apos;ll complete MTN, Airtel, or card payment on Pesapal&apos;s secure page.
              We record your rent when the provider confirms.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
            {invoiceLabel && (
              <div className="flex justify-between text-white/70">
                <span>Invoice</span>
                <span className="font-semibold text-white">{invoiceLabel}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-white/10 pt-3 font-extrabold text-white">
              <span>Amount</span>
              <span className="text-brand-teal">{fmtUgx(amount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-white/50">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>256-bit encrypted · PCI-compliant partner checkout</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-brand-teal/30 border-t-brand-teal"
              aria-hidden
            />
            <p className="text-sm font-semibold text-white/80">
              {seconds > 0 ? `Opening in ${seconds}s…` : "Opening secure payment…"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-white/40" aria-hidden />
            <span className="text-xs text-white/45">
              Powered by{" "}
              <span className="font-bold text-white/70">Pesapal</span>
              {" · "}
              Uganda&apos;s trusted payment network
            </span>
          </div>
        </div>

        <div className="flex gap-2 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!paymentLink}
            onClick={() => onRedirect?.(paymentLink)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-teal py-2.5 text-sm font-extrabold text-[#041208] hover:brightness-110 disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Pay now
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
