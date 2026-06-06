import { blockchainApi } from "../api/blockchainApi";

const FAUCET_API_KEY = "rd:api-faucet";

export function suiFaucetWebUrl(address, network = "testnet") {
  if (!address) return "https://faucet.sui.io/";
  const net = String(network || "testnet").toLowerCase();
  return `https://faucet.sui.io/?address=${encodeURIComponent(address)}&network=${encodeURIComponent(net)}`;
}

function apiFaucetEnabled() {
  try {
    return sessionStorage.getItem(FAUCET_API_KEY) !== "0";
  } catch {
    return true;
  }
}

function markApiFaucetUnavailable() {
  try {
    sessionStorage.setItem(FAUCET_API_KEY, "0");
  } catch {
    /* ignore */
  }
}

/** Best-effort testnet gas via API (falls back to opening public faucet page). */
export async function requestTestnetGas(address, { network = "testnet", openOnFail = true } = {}) {
  if (!address) throw new Error("Wallet address required for faucet.");
  if (!apiFaucetEnabled()) {
    return { ok: false, via: "skipped", url: suiFaucetWebUrl(address, network) };
  }
  try {
    const data = await blockchainApi.requestFaucet({ sui_address: address });
    return { ok: Boolean(data?.requested), via: "api", data };
  } catch (err) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      markApiFaucetUnavailable();
    }
    if (openOnFail && typeof window !== "undefined") {
      window.open(suiFaucetWebUrl(address, network), "_blank", "noopener,noreferrer");
    }
    return { ok: false, via: "web", url: suiFaucetWebUrl(address, network) };
  }
}

export function isInsufficientSuiError(err) {
  const msg = String(err?.message || err?.response?.data?.detail?.message || err?.response?.data?.detail || "");
  return /insufficient|gas|coin|balance|funds/i.test(msg);
}

export class SuiPaymentError extends Error {
  constructor(message, { alreadyToasted = false, needsFaucet = false } = {}) {
    super(message);
    this.name = "SuiPaymentError";
    this.alreadyToasted = alreadyToasted;
    this.needsFaucet = needsFaucet;
  }
}
