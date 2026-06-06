import toast from "react-hot-toast";
import { Transaction } from "@mysten/sui/transactions";
import { messageWithIntent, toSerializedSignature } from "@mysten/sui/cryptography";
import { publicKeyFromRawBytes } from "@mysten/sui/verify";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { toHex } from "@mysten/sui/utils";
import { paymentsApi } from "../api/paymentsApi";
import { blockchainApi } from "../api/blockchainApi";
import { apiErrorMessage } from "./apiError";
import { isPrivyConfigured } from "./privyConfig";

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
    const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let zeros = 0;
    for (const ch of text) {
      if (ch === "1") zeros += 1;
      else break;
    }
    let num = 0n;
    for (const ch of text) {
      const idx = alphabet.indexOf(ch);
      if (idx < 0) throw new Error("bad base58");
      num = num * 58n + BigInt(idx);
    }
    let hex = num.toString(16);
    if (hex.length % 2) hex = `0${hex}`;
    const decoded = hexToBytes(hex);
    const withPad = new Uint8Array(zeros + decoded.length);
    withPad.set(decoded, zeros);
    return publicKeyFromRawBytes("ED25519", withPad.slice(-32));
  } catch {
    throw new Error("Could not read Privy Sui public key.");
  }
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

async function signAndSubmitPrivyTx({ wallet, sui, network, rpcUrl, signRawHash }) {
  if (!wallet?.address) {
    throw new Error("No Privy Sui wallet address.");
  }
  if (!signRawHash) {
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

  const { signature } = await signRawHash({
    address: wallet.address,
    chainType: "sui",
    bytes: toHex(intentMessage),
    encoding: "hex",
    hash_function: "blake2b256",
  });

  const publicKey = decodeSuiPublicKey(wallet.publicKey);
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

  const digest = result?.digest;
  if (!digest) {
    throw new Error("Sui network did not return a transaction digest.");
  }
  return { digest, sender: wallet.address };
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
  signRawHash,
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

  const { digest, sender } = await signAndSubmitPrivyTx({
    wallet,
    sui,
    network,
    rpcUrl,
    signRawHash,
  });

  await confirmOnServer(ref, digest, sender);
  return body;
}

/**
 * Pay Sui rent via Privy — tries server raw_sign when available, else browser sign + confirm-sui.
 */
export async function runPrivyServerSuiCheckout({
  invoiceId,
  getAccessToken,
  login,
  createSuiWallet,
  resolveWallet,
  signRawHash,
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

  if (login) {
    toast.error("Sign in with Google, Apple, or email using the Privy panel above, then tap Pay again.", {
      duration: 7000,
    });
    throw new Error("Privy session required");
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
  if (!wallet?.address && !token) {
    toast.error("Sign in with Google, Apple, or email (Privy) to pay with Sui.");
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

  let serverError = null;
  if (token) {
    try {
      toast("Signing with your Privy Sui wallet…", { duration: 6000 });
      await paymentsApi.payPrivySui(ref, { access_token: token });
      toast.success("Sui payment sent — on-chain receipt recorded.");
      onCompleted?.(checkout);
      return checkout;
    } catch (err) {
      const status = err?.response?.status;
      if (status && status !== 404 && status !== 405) {
        throw err;
      }
      serverError = err;
    }
  }

  if (!signRawHash) {
    if (serverError) {
      throw serverError;
    }
    toast.error("Privy wallet signing is unavailable. Try MoMo or Pesapal.");
    throw new Error("Privy client signing unavailable");
  }

  if (!wallet?.address) {
    toast.error("Create a Privy Sui wallet first (sign in with Google / Apple / email).");
    throw new Error("No Privy Sui wallet");
  }

  try {
    await runPrivyClientSuiCheckout({
      checkout,
      wallet,
      signRawHash,
      network: chain.network,
      rpcUrl: chain.rpc_url,
    });
  } catch (err) {
    const msg = apiErrorMessage(err, err?.message || "Privy Sui payment failed.");
    if (/insufficient|gas|coin/i.test(msg)) {
      toast.error(
        "Your Privy Sui wallet needs testnet SUI for gas. Use a faucet, then try again.",
        { duration: 8000 },
      );
    }
    throw err;
  }

  toast.success("Sui payment verified — blockchain receipt recorded.");
  onCompleted?.(checkout);
  return checkout;
}
