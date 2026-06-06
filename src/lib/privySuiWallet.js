import { getWallet, isUnifiedWallet } from "@privy-io/js-sdk-core";
import { blockchainApi } from "../api/blockchainApi";
import { findPrivySuiWallet } from "./privySocialSignIn";

function unwrapPrivyData(res) {
  if (!res) return null;
  if (res.data && typeof res.data === "object") return res.data;
  return res;
}

function unifiedSuiLinkedAccounts(user) {
  return (user?.linkedAccounts || []).filter((acct) => {
    if (acct.type !== "wallet") return false;
    if (acct.chainType !== "sui") return false;
    if (acct.walletClientType !== "privy" || acct.imported) return false;
    return isUnifiedWallet({ id: acct.id, recovery_method: acct.recoveryMethod });
  });
}

/** Load Sui wallet public key from Privy when linkedAccounts omit it. */
export async function enrichPrivySuiWalletPubkey(wallet, privyClient, getAccessToken) {
  if (!wallet?.address) return wallet;
  if (wallet.publicKey) return wallet;

  const walletId = wallet.walletId || wallet.id;
  if (walletId && privyClient) {
    try {
      const res = await getWallet(privyClient, { wallet_id: walletId });
      const data = unwrapPrivyData(res);
      const publicKey = data?.public_key || data?.publicKey || null;
      if (publicKey) {
        return { ...wallet, walletId, publicKey };
      }
    } catch {
      /* client getWallet often lacks permission — use backend */
    }
  }

  if (getAccessToken) {
    try {
      const token = await getAccessToken();
      if (token) {
        const data = await blockchainApi.privyWalletPubkey({
          access_token: token,
          sui_address: wallet.address,
        });
        if (data?.public_key) {
          return {
            ...wallet,
            walletId: data.wallet_id || walletId,
            publicKey: data.public_key,
          };
        }
      }
    } catch {
      /* fall through */
    }
  }

  return wallet;
}

/** Ask API to attach PRIVY_SUI_POLICY_ID before browser or server raw_sign. */
export async function ensurePrivySuiWalletPolicy(address, getAccessToken) {
  if (!address || !getAccessToken) return null;
  try {
    const token = await getAccessToken();
    if (!token) return null;
    return await blockchainApi.privyWalletPolicy({
      access_token: token,
      sui_address: address,
    });
  } catch {
    return null;
  }
}

/** Resolve Privy Sui wallet + public key for client-side transaction submit. */
export async function resolvePrivySuiWalletForPay(user, privyClient, address, getAccessToken) {
  let wallet = findPrivySuiWallet(user);
  if (address && wallet?.address && wallet.address !== address) {
    wallet = null;
  }

  if (!wallet?.address && user && address) {
    const unified = unifiedSuiLinkedAccounts(user).find((acct) => acct.address === address);
    if (unified) {
      wallet = {
        address: unified.address,
        publicKey: unified.publicKey || unified.public_key || null,
        walletId: unified.id || null,
      };
    }
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
  return enrichPrivySuiWalletPubkey(wallet, privyClient, getAccessToken);
}
