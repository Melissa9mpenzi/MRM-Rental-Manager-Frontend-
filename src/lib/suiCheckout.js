import toast from "react-hot-toast";
import { Transaction } from "@mysten/sui/transactions";
import { paymentsApi } from "../api/paymentsApi";
import { blockchainApi } from "../api/blockchainApi";
import { apiErrorMessage } from "./apiError";

/**
 * Sui wallet checkout — hybrid with MoMo/Pesapal (does not replace fiat).
 * Requires connected wallet via @mysten/dapp-kit.
 */
export async function runSuiCheckout({
  invoiceId,
  signAndExecuteTransaction,
  accountAddress,
  onCompleted,
}) {
  const chain = await blockchainApi.status();
  if (!chain?.enabled) {
    toast.error("Sui payments not configured on the API (SUI_TREASURY_ADDRESS).");
    throw new Error("Sui not configured");
  }

  const checkout = await paymentsApi.initiateCheckout({
    invoice_id: invoiceId,
    payment_method: "sui",
  });

  const ref = checkout?.reference;
  const sui = checkout?.next_action?.sui_payload;
  if (!ref || !sui?.treasury_address || !sui?.amount_mist) {
    toast.error("Could not start Sui checkout.");
    throw new Error("Missing sui payload");
  }

  const tx = new Transaction();
  tx.setSender(accountAddress);
  const [coin] = tx.splitCoins(tx.gas, [BigInt(sui.amount_mist)]);
  tx.transferObjects([coin], sui.treasury_address);

  toast("Approve the SUI payment in your wallet…", { duration: 5000 });

  const result = await signAndExecuteTransaction({ transaction: tx });
  const digest = result?.digest;
  if (!digest) {
    toast.error("Wallet did not return a transaction digest.");
    throw new Error("No digest");
  }

  await paymentsApi.confirmSuiTx(ref, {
    tx_digest: digest,
    wallet_address: accountAddress,
  });

  toast.success("Sui payment verified — blockchain receipt recorded.");
  onCompleted?.(checkout);
  return checkout;
}

export async function fetchBlockchainStatus() {
  return blockchainApi.status();
}

export function explorerTxUrl(network, digest) {
  if (!digest) return null;
  const net = network || "testnet";
  return `https://suiscan.xyz/${net}/tx/${digest}`;
}

export { apiErrorMessage };
