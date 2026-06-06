import toast from "react-hot-toast";
import { paymentsApi } from "../api/paymentsApi";
import { blockchainApi } from "../api/blockchainApi";
import { isPrivyConfigured } from "./privyConfig";

/**
 * Pay Sui rent via Privy — server signs with Privy raw_sign (no pysui on Vercel).
 * Requires an active Privy session in the browser (getAccessToken).
 */
export async function runPrivyServerSuiCheckout({
  invoiceId,
  getAccessToken,
  login,
  createSuiWallet,
  onCompleted,
}) {
  const chain = await blockchainApi.status();
  if (!chain?.enabled) {
    toast.error(
      "Sui payments are not enabled on this server. Use MTN MoMo, Airtel, or Pesapal.",
      { duration: 7000 },
    );
    return null;
  }
  if (!isPrivyConfigured()) {
    toast.error(
      "Privy is not configured on the web app. Set VITE_PRIVY_APP_ID, or pay with MTN MoMo / Pesapal.",
      { duration: 7000 },
    );
    return null;
  }

  let token = await getAccessToken?.();
  if (!token && login) {
    await login();
    token = await getAccessToken?.();
  }
  if (!token) {
    toast.error("Sign in with Google, Apple, or email (Privy) to pay with Sui.");
    throw new Error("Privy session required");
  }

  if (createSuiWallet) {
    try {
      await createSuiWallet();
    } catch {
      /* wallet may already exist */
    }
  }

  const checkout = await paymentsApi.initiateCheckout({
    invoice_id: invoiceId,
    payment_method: "sui",
  });
  const ref = checkout?.reference;
  if (!ref) {
    toast.error("Could not start Sui checkout.");
    throw new Error("Missing checkout reference");
  }

  toast("Signing with your Privy Sui wallet…", { duration: 6000 });

  await paymentsApi.payPrivySui(ref, { access_token: token });

  toast.success("Sui payment sent — on-chain receipt recorded.");
  onCompleted?.(checkout);
  return checkout;
}
