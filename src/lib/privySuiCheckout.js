import toast from "react-hot-toast";
import { base58 } from "@scure/base";
import { Transaction } from "@mysten/sui/transactions";
import { messageWithIntent, toSerializedSignature } from "@mysten/sui/cryptography";
import { publicKeyFromRawBytes } from "@mysten/sui/verify";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { paymentsApi } from "../api/paymentsApi";
import { blockchainApi } from "../api/blockchainApi";
import { apiErrorMessage } from "./apiError";
import { isPrivyConfigured } from "./privyConfig";
import { ensurePrivySuiWalletPolicy } from "./privySuiWallet";
import {
  isInsufficientSuiError,
  requestTestnetGas,
  SuiPaymentError,
  suiFaucetWebUrl,
} from "./suiFaucet";

function serverCheckoutDisabled() {
  return import.meta.env.VITE_PRIVY_SERVER_CHECKOUT === "false";
}

function isPrivyAuthorizationError(err) {
  const msg = apiErrorMessage(err, err?.message || "");
  return /privy-authorization-signature|authorization.private.key|authorization signature|missing_or_empty_authorization/i.test(
    msg,
  );
}

function formatSuiPayError(err, network) {
  if (isInsufficientSuiError(err)) {
    return new SuiPaymentError(
      "Your Privy wallet has no testnet SUI for gas. Tap “Get testnet SUI” on the wallet panel, wait one minute, then pay again.",
      { alreadyToasted: true, needsFaucet: true },
    );
  }
  const msg = apiErrorMessage(err, err?.message || "Privy Sui payment failed.");
  if (/raw_sign|could not sign|policy/i.test(msg)) {
    if (msg.includes("Privy policy blocked") || msg.length > 120) {
      return new SuiPaymentError(msg, { alreadyToasted: false });
    }
    return new SuiPaymentError(
      "Privy blocked this Sui payment. Add an ALLOW rule for signTransactionBytes (SplitCoins, TransferObjects, MergeCoins) with no DENY rules, attach it to your Sui wallet in Dashboard → Wallets, and set PRIVY_SUI_POLICY_ID on the API.",
      { alreadyToasted: false },
    );
  }
  if (/public key/i.test(msg)) {
    return new SuiPaymentError(
      "Sui payment could not finish — the server could not read your wallet public key. Hard refresh and pay again after the backend redeploys (browser sign + server submit).",
      { alreadyToasted: false },
    );
  }
  return new SuiPaymentError(msg);
}

function hexToBytes(hex) {
  const text = String(hex || "").trim().replace(/^0x/, "");
  if (!text || text.length % 2 !== 0) {
    throw new Error("Invalid signature bytes from Privy.");
  }
  const out = new Uint8Array(text.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(text.slice(i, i + 2), 16);
  }
  return out;
}

function decodePrivySignature(sig) {
  const bytes = hexToBytes(sig);
  return bytes.length === 65 ? bytes.slice(0, 64) : bytes;
}

function decodeSuiPublicKey(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    throw new Error("Privy Sui wallet is missing a public key. Sign out and sign in again.");
  }
  if (text.startsWith("0x")) {
    return publicKeyFromRawBytes("ED25519", hexToBytes(text));
  }
  if (/^[0-9a-fA-F]{64}$/.test(text)) {
    return publicKeyFromRawBytes("ED25519", hexToBytes(text));
  }
  try {
    const decoded = base58.decode(text);
    if (decoded.length >= 32) {
      return publicKeyFromRawBytes("ED25519", decoded.slice(-32));
    }
  } catch {
    /* try other formats */
  }
  throw new Error("Could not read Privy Sui public key.");
}

function unwrapCheckout(raw) {
  if (!raw) return null;
  if (raw.reference) return raw;
  if (raw.data?.reference) return raw.data;
  return raw;
}

function suiPayload(checkout) {
  const body = unwrapCheckout(checkout);
  return body?.next_action?.sui_payload || body?.next_action?.sui || null;
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function signAndSubmitPrivyTx({
  wallet,
  sui,
  network,
  rpcUrl,
  signSuiIntent,
  enrichWallet,
  getAccessToken,
  reference,
}) {
  if (!wallet?.address) {
    throw new Error("No Privy Sui wallet address.");
  }
  if (!signSuiIntent) {
    throw new Error("Privy signing is not available in this browser session.");
  }

  const net = (network || "testnet").toLowerCase();
  const url = rpcUrl || getJsonRpcFullnodeUrl(net);
  const client = new SuiJsonRpcClient({ url, network: net });

  const tx = new Transaction();
  tx.setSender(wallet.address);
  const [coin] = tx.splitCoins(tx.gas, [BigInt(sui.amount_mist)]);
  tx.transferObjects([coin], sui.treasury_address);

  const txBytes = await tx.build({ client });
  const intentMessage = messageWithIntent("TransactionData", txBytes);

  const { signature } = await signSuiIntent(wallet.address, intentMessage);

  const walletId = wallet.walletId || wallet.id;
  const token = getAccessToken ? await getAccessToken() : null;
  if (token && reference) {
    try {
      await paymentsApi.submitPrivySui(reference, {
        access_token: token,
        sui_address: wallet.address,
        wallet_id: walletId || undefined,
        transaction_block: bytesToBase64(txBytes),
        signature,
      });
      return { digest: null, sender: wallet.address, confirmed: true };
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        /* backend not deployed yet — fall through to client submit */
      } else {
        throw err;
      }
    }
  }

  let resolvedWallet = wallet;
  if (!resolvedWallet.publicKey && enrichWallet) {
    resolvedWallet = await enrichWallet(resolvedWallet);
  }
  if (!resolvedWallet.publicKey) {
    throw new Error(
      "Could not load Privy Sui public key. Redeploy the backend, then pay again (browser sign + server submit).",
    );
  }

  const publicKey = decodeSuiPublicKey(resolvedWallet.publicKey);
  const serialized = toSerializedSignature({
    signature: decodePrivySignature(signature),
    signatureScheme: "ED25519",
    publicKey,
  });

  const result = await client.executeTransactionBlock({
    transactionBlock: txBytes,
    signature: serialized,
    options: { showEffects: true },
  });

  const txDigest = result?.digest;
  if (!txDigest) {
    throw new Error("Sui network did not return a transaction digest.");
  }
  return { digest: txDigest, sender: resolvedWallet.address, confirmed: false };
}

async function confirmOnServer(reference, digest, walletAddress) {
  await paymentsApi.confirmSuiTx(reference, {
    tx_digest: digest,
    wallet_address: walletAddress,
  });
}

/**
 * Browser Privy sign + confirm-sui (works on production without pay-privy-sui).
 */
export async function runPrivyClientSuiCheckout({
  checkout,
  wallet,
  signSuiIntent,
  enrichWallet,
  getAccessToken,
  network,
  rpcUrl,
}) {
  const body = unwrapCheckout(checkout);
  const ref = body?.reference;
  const sui = suiPayload(body);
  if (!ref || !sui?.treasury_address || !sui?.amount_mist) {
    throw new Error("Missing Sui checkout payload from server.");
  }

  toast("Approve the SUI payment with your Privy wallet…", { duration: 6000 });

  const { digest, sender, confirmed } = await signAndSubmitPrivyTx({
    wallet,
    sui,
    network,
    rpcUrl,
    signSuiIntent,
    enrichWallet,
    getAccessToken,
    reference: ref,
  });

  if (!confirmed) {
    await confirmOnServer(ref, digest, sender);
  }
  return body;
}

/**
 * Pay Sui rent via Privy — tries server raw_sign when available, else browser sign + confirm-sui.
 */
export async function runPrivyServerSuiCheckout({
  invoiceId,
  getAccessToken,
  createSuiWallet,
  resolveWallet,
  signSuiIntent,
  enrichWallet,
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

  let wallet = null;
  if (createSuiWallet) {
    try {
      wallet = await createSuiWallet();
    } catch {
      /* wallet may already exist */
    }
  }
  if (!wallet?.address) {
    wallet = (await resolveWallet?.()) || null;
  }
  if (!wallet?.address && !token && !signSuiIntent) {
    toast.error("Connect your Sui wallet below to pay with Sui.");
    throw new Error("Privy session required");
  }

  const checkoutRaw = await paymentsApi.initiateCheckout({
    invoice_id: invoiceId,
    payment_method: "sui",
  });
  const checkout = unwrapCheckout(checkoutRaw);
  const ref = checkout?.reference;
  if (!ref) {
    toast.error("Could not start Sui checkout.");
    throw new Error("Missing checkout reference");
  }

  if (wallet?.address) {
    toast("Checking testnet SUI balance…", { duration: 4000 });
    await requestTestnetGas(wallet.address, { network: chain.network, openOnFail: false });
    const policyStatus = await ensurePrivySuiWalletPolicy(
      wallet.address,
      getAccessToken,
      wallet.walletId || wallet.id,
    );
    if (policyStatus?.configured && policyStatus.attached === false) {
      const detail = String(policyStatus.detail || "");
      if (!isPrivyAuthorizationError({ message: detail })) {
        toast.error(
          `Privy policy not attached to wallet (${detail || "check PRIVY_SUI_POLICY_ID"}). Open Dashboard → Wallets and attach your ALLOW policy manually.`,
          { duration: 10000 },
        );
      }
    }
  }

  token = (await getAccessToken?.()) || token;
  const tryServer = Boolean(token) && !serverCheckoutDisabled();

  if (tryServer) {
    try {
      toast("Signing with your Privy Sui wallet…", { duration: 6000 });
      await paymentsApi.payPrivySui(ref, { access_token: token });
      toast.success("Sui payment sent — on-chain receipt recorded.");
      onCompleted?.(checkout);
      return checkout;
    } catch (err) {
      const status = err?.response?.status;
      if (
        status === 404 ||
        status === 405 ||
        ((status === 401 || status === 400) && isPrivyAuthorizationError(err))
      ) {
        /* server raw_sign unavailable — use browser sign */
      } else if (status) {
        throw formatSuiPayError(err, chain.network);
      }
    }
  }

  if (!signSuiIntent) {
    toast.error("Privy wallet signing is unavailable. Try MTN MoMo or Pesapal.");
    throw new SuiPaymentError("Privy client signing unavailable");
  }

  if (!wallet?.address) {
    toast.error("Create a Privy Sui wallet first (sign in with Google / Apple / email).");
    throw new SuiPaymentError("No Privy Sui wallet");
  }

  if (!wallet.publicKey && enrichWallet) {
    wallet = await enrichWallet(wallet);
  }

  try {
    await runPrivyClientSuiCheckout({
      checkout,
      wallet,
      signSuiIntent,
      enrichWallet,
      getAccessToken,
      network: chain.network,
      rpcUrl: chain.rpc_url,
    });
  } catch (err) {
    const formatted = formatSuiPayError(err, chain.network);
    if (formatted.needsFaucet) {
      toast.error(formatted.message, { duration: 9000 });
      toast(`Open the Sui faucet: ${suiFaucetWebUrl(wallet.address, chain.network)}`, {
        duration: 12000,
      });
    }
    throw formatted;
  }

  toast.success("Sui payment verified — blockchain receipt recorded.");
  onCompleted?.(checkout);
  return checkout;
}
