/**
 * Google / Apple / email via Privy → POST /api/v1/auth/privy
 * Requires VITE_PRIVY_APP_ID and API PRIVY_APP_ID + PRIVY_APP_SECRET.
 */
import { authApi } from "../api/authApi";

export function isPrivySocialAvailable() {
  return Boolean((import.meta.env.VITE_PRIVY_APP_ID || "").trim());
}

/** Find embedded Sui wallet on Privy user object (linkedAccounts / wallets). */
export function findPrivySuiAddress(privyUser) {
  return findPrivySuiWallet(privyUser)?.address ?? null;
}

/** @returns {{ address: string, publicKey?: string, walletId?: string } | null} */
export function findPrivySuiWallet(privyUser) {
  if (!privyUser) return null;
  const linked = privyUser.linkedAccounts || privyUser.linked_accounts || [];
  for (const acct of linked) {
    const chain = acct.chainType || acct.chain_type;
    const addr = acct.address;
    if (chain === "sui" && addr) {
      return {
        address: addr,
        publicKey: acct.publicKey || acct.public_key || null,
        walletId: acct.id || acct.wallet_id || null,
      };
    }
  }
  const wallets = privyUser.wallets || [];
  for (const w of wallets) {
    const chain = w.chainType || w.chain_type;
    if (chain === "sui" && w.address) {
      return {
        address: w.address,
        publicKey: w.publicKey || w.public_key || null,
        walletId: w.id || w.wallet_id || null,
      };
    }
  }
  return null;
}

export function privyAuthErrorMessage(err, fallback = "Sign-in failed.") {
  const code = err?.code || err?.name;
  if (code === "user_cancelled" || code === "exited_auth_flow") return null;
  return err?.message || fallback;
}

/**
 * After Privy login completes, exchange access token for RentDirect JWT.
 * @param {object} opts
 * @param {() => Promise<string|null>} opts.getAccessToken
 * @param {object} [opts.privyUser]
 * @param {string} [opts.role] - tenant | landlord | staff (register page)
 * @param {string} [opts.suiAddress] - embedded Sui wallet from Privy
 */
export async function exchangePrivyForApiSession({
  getAccessToken,
  privyUser,
  role,
  suiAddress: suiAddressProp,
}) {
  let suiAddress = suiAddressProp || findPrivySuiAddress(privyUser);

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Could not get Privy access token.");
  }

  const body = { access_token: accessToken };
  if (suiAddress) body.sui_address = suiAddress;
  if (role) body.role = role;

  const res = await authApi.privySignIn(body);
  return res?.data ?? res;
}
