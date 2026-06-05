import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Phone, Smartphone } from "lucide-react";
import BrandMark from "../brand/BrandMark";
import { pollCheckoutUntilDone } from "../../lib/checkoutFlow";

function fmtUgx(n) {
  return `UGX ${Number(n || 0).toLocaleString()}`;
}

/**
 * In-app MTN MoMo flow — USSD prompt on phone, no Pesapal redirect.
 */
export default function PaymentMomoProcessing({
  open,
  reference,
  phone,
  amount,
  invoiceLabel,
  message,
  onComplete,
  onFailed,
  onTimeout,
  onCancel,
}) {
  const [status, setStatus] = useState("waiting");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!open || !reference) return undefined;

    setStatus("waiting");
    setDetail("");
    let cancelled = false;

    (async () => {
      const result = await pollCheckoutUntilDone(reference);
      if (cancelled) return;
      if (result.done) {
        setStatus("success");
        onComplete?.(result.data);
      } else if (result.failed) {
        setStatus("failed");
        const reason = result.data?.failure_reason || "Payment failed or was cancelled.";
        setDetail(reason);
        onFailed?.(reason, result.data);
      } else {
        setStatus("timeout");
        onTimeout?.();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, reference, onComplete, onFailed, onTimeout]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-[#0a1210]/92 p-4 pt-[max(5rem,18vh)] backdrop-blur-md sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-labelledby="momo-processing-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a2622] to-[#121a18] shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5 text-center">
          <BrandMark imgClassName="mx-auto h-9 w-auto object-contain" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-brand-teal/90">
            MTN Mobile Money
          </p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFCC00]/15">
              <Smartphone className="h-7 w-7 text-[#FFCC00]" aria-hidden />
            </div>
            <h2 id="momo-processing-title" className="text-lg font-extrabold text-white">
              {status === "success"
                ? "Payment confirmed"
                : status === "failed"
                  ? "Payment not completed"
                  : status === "timeout"
                    ? "Still processing"
                    : "Approve on your phone"}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {status === "waiting"
                ? message ||
                  "Check your MTN phone and approve the MoMo prompt. Do not close this screen."
                : status === "success"
                  ? "Your rent payment has been recorded."
                  : status === "timeout"
                    ? "MTN may still be processing. Check Wallet in a minute."
                    : detail || "The payment was not completed."}
            </p>
          </div>

          {(invoiceLabel || amount) && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
              {invoiceLabel && (
                <div className="flex justify-between text-white/70">
                  <span>Invoice</span>
                  <span className="font-semibold text-white">{invoiceLabel}</span>
                </div>
              )}
              {amount != null && (
                <div className="mt-2 flex justify-between border-t border-white/10 pt-3 font-extrabold text-white">
                  <span>Amount</span>
                  <span className="text-brand-teal">{fmtUgx(amount)}</span>
                </div>
              )}
            </div>
          )}

          {phone && status === "waiting" && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/70">
              <Phone className="h-4 w-4 shrink-0 text-brand-teal" aria-hidden />
              <span>
                Prompt sent to <strong className="text-white">{phone}</strong>
              </span>
            </div>
          )}

          {status === "waiting" && (
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-brand-teal/30 border-t-brand-teal"
                aria-hidden
              />
              <p className="text-xs text-white/45">Waiting for MTN confirmation…</p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5"
          >
            {status === "waiting" ? "Close (payment may still complete)" : "Close"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
