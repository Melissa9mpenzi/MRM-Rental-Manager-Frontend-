import toast from "react-hot-toast";
import { paymentsApi } from "../api/paymentsApi";
import { apiErrorMessage } from "./apiError";
import { resolvePaymentMethod } from "./paymentMethods";

/** UI method id → API payment_method */
export function apiMethodFromUiId(methodId) {
  const cfg = resolvePaymentMethod(methodId);
  return cfg.apiValue;
}

export async function fetchGatewayStatus() {
  return paymentsApi.gatewayStatus();
}

export async function pollCheckoutUntilDone(reference, { maxAttempts = 40, intervalMs = 3000 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await paymentsApi.getCheckout(reference);
    const st = String(data?.status || "").toLowerCase();
    if (st === "completed") return { done: true, data };
    if (st === "failed") return { done: false, failed: true, data };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { done: false, timeout: true };
}

export async function startTenantCheckout({ invoiceId, methodId, phone }) {
  const payment_method = apiMethodFromUiId(methodId);
  return paymentsApi.initiateCheckout({
    invoice_id: invoiceId,
    payment_method,
    phone: phone?.trim() || undefined,
  });
}

/**
 * Real Flutterwave checkout: opens hosted pay page, verifies with provider via API poll.
 */
export async function runTenantCheckoutUi({
  invoiceId,
  methodId,
  phone,
  onCompleted,
}) {
  const gw = await fetchGatewayStatus();
  if (!gw?.configured) {
    toast.error(
      "Online payments are not configured. Add MTN MoMo or Pesapal keys to the API .env (see PAYMENT_GATEWAY.md).",
    );
    throw new Error("Payment gateway not configured");
  }
  if (gw.mock_enabled) {
    toast.error("Server is in mock mode — configure MTN MoMo or Pesapal for real payments.");
    throw new Error("Mock payments enabled");
  }

  const supports = gw.supports || {};
  if (methodId === "airtel" && !supports.airtel) {
    toast.error(
      "Airtel is not enabled on this server. Ask admin to set PAYMENT_GATEWAY_PROVIDER=pesapal, or pay with MTN.",
    );
    throw new Error("Airtel not supported");
  }
  const methodCfg = resolvePaymentMethod(methodId);
  if (methodCfg.comingSoon) {
    toast.error("Blockchain payments are coming soon.");
    throw new Error("Payment method not available");
  }
  if (methodId === "card" && !supports.card) {
    toast.error("Card payments need Pesapal on the server (PAYMENT_GATEWAY_PROVIDER=pesapal).");
    throw new Error("Card not supported");
  }

  try {
    const checkout = await startTenantCheckout({ invoiceId, methodId, phone });
    const ref = checkout?.reference;
    const next = checkout?.next_action || {};
    const link = next.payment_link;

    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      toast(
        "Complete payment on the secure page (MTN, Airtel, or card). We record when the provider confirms.",
        { duration: 6000 },
      );
    } else if (next.type === "ussd_prompt" || gw.provider === "mtn_momo") {
      toast(
        next.message ||
          "Check your MTN phone and approve the MoMo prompt. Payment records when MTN confirms.",
        { duration: 8000 },
      );
    } else {
      toast.error("Payment could not be started. Check server payment configuration.");
      throw new Error("Missing payment action");
    }

    if (!ref) return checkout;

    const result = await pollCheckoutUntilDone(ref);
    if (result.done) {
      toast.success("Payment confirmed and recorded.");
      onCompleted?.(result.data);
    } else if (result.failed) {
      toast.error(result.data?.failure_reason || "Payment failed or was cancelled.");
    } else {
      toast("Still processing. Keep this tab open or check Wallet in a minute.");
    }
    return checkout;
  } catch (err) {
    toast.error(apiErrorMessage(err, "Could not start payment."));
    throw err;
  }
}
