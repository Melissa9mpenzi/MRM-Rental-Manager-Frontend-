import { getWallet } from "@privy-io/js-sdk-core";
import { findPrivySuiWallet } from "./privySocialSignIn";

function unwrapPrivyData(res) {
  if (!res) return null;
  if (res.data && typeof res.data === "object") return res.data;
  return res;
}

/** Load Sui wallet public key from Privy when linkedAccounts omit it. */
export async function enrichPrivySuiWalletPubkey(wallet, privyClient) {
  if (!wallet?.address) return wallet;
  if (wallet.publicKey) return wallet;

  const walletId = wallet.walletId || wallet.id;
  if (!walletId || !privyClient) return wallet;

  try {
    const res = await getWallet(privyClient, { wallet_id: walletId });
    const data = unwrapPrivyData(res);
    const publicKey = data?.public_key || data?.publicKey || null;
    if (publicKey) {
      return { ...wallet, walletId, publicKey };
    }
  } catch {
    /* fall through */
  }
  return wallet;
}

/** Resolve Privy Sui wallet + public key for client-side transaction submit. */
export async function resolvePrivySuiWalletForPay(user, privyClient, address) {
  let wallet = findPrivySuiWallet(user);
  if (address && wallet?.address && wallet.address !== address) {
    wallet = null;
  }

  if (!wallet?.address && user?.linkedAccounts && address) {
    for (const acct of user.linkedAccounts) {
      if (acct.type !== "wallet") continue;
      if (acct.chainType !== "sui" || acct.address !== address) continue;
      wallet = {
        address: acct.address,
        publicKey: acct.publicKey || acct.public_key || null,
        walletId: acct.id || null,
      };
      break;
    }
  }

  if (!wallet?.address) return null;
  return enrichPrivySuiWalletPubkey(wallet, privyClient);
}
