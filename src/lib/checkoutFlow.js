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

export function classifyCheckoutFlow(checkout) {
  const next = checkout?.next_action || {};
  const provider = String(checkout?.provider || "").toLowerCase();
  if (next.payment_link) return "pesapal_redirect";
  if (next.type === "ussd_prompt" || provider === "mtn_momo") return "momo_in_app";
  return "unknown";
}

export async function validateTenantCheckoutGateway(methodId) {
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
  if (!gw.live_payments) {
    toast.error("Online payments are not available on this server. Contact the platform operator.");
    throw new Error("Payments not live");
  }

  const supports = gw.supports || {};
  if (methodId === "airtel" && !supports.airtel) {
    toast.error(
      "Airtel is not enabled on this server. Ask admin to set PAYMENT_GATEWAY_PROVIDER=pesapal, or pay with MTN.",
    );
    throw new Error("Airtel not supported");
  }
  if (methodId === "pesapal" && !supports.card) {
    toast.error("Card / Pesapal payments need PAYMENT_GATEWAY_PROVIDER=pesapal on the API server.");
    throw new Error("Pesapal not supported");
  }

  return gw;
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
 * Initiate checkout and return flow metadata for branded UI handoff.
 */
export async function initiateTenantCheckout({ invoiceId, methodId, phone }) {
  await validateTenantCheckoutGateway(methodId);
  const checkout = await startTenantCheckout({ invoiceId, methodId, phone });
  return {
    checkout,
    flow: classifyCheckoutFlow(checkout),
    next: checkout?.next_action || {},
    reference: checkout?.reference,
  };
}

/**
 * Tenant checkout with optional UI hooks for Pesapal handoff and MTN in-app polling.
 * When hooks are omitted, falls back to toast + background poll (legacy).
 */
export async function runTenantCheckoutUi({
  invoiceId,
  methodId,
  phone,
  onCompleted,
  onPesapalHandoff,
  onMomoProcessing,
}) {
  try {
    const { checkout, flow, next, reference } = await initiateTenantCheckout({
      invoiceId,
      methodId,
      phone,
    });

    if (flow === "pesapal_redirect" && next.payment_link) {
      if (onPesapalHandoff) {
        await onPesapalHandoff({
          checkout,
          paymentLink: next.payment_link,
          reference,
          amount: checkout.amount,
        });
        return checkout;
      }
      window.location.assign(next.payment_link);
      toast("Complete payment on the secure Pesapal page. We record when confirmed.", {
        duration: 6000,
      });
    } else if (flow === "momo_in_app") {
      if (onMomoProcessing) {
        await onMomoProcessing({
          checkout,
          reference,
          message: next.message,
          phone: phone?.trim(),
          amount: checkout.amount,
        });
        return checkout;
      }
      toast(
        next.message ||
          "Check your MTN phone and approve the MoMo prompt. Payment records when MTN confirms.",
        { duration: 8000 },
      );
    } else {
      toast.error("Payment could not be started. Check server payment configuration.");
      throw new Error("Missing payment action");
    }

    if (!reference) return checkout;

    const result = await pollCheckoutUntilDone(reference);
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
