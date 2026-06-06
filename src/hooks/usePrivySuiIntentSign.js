import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { rawSign, isUnifiedWallet } from "@privy-io/js-sdk-core";
import { toHex } from "@mysten/sui/utils";
import { enrichPrivySuiWalletPubkey, resolvePrivySuiWalletForPay } from "../lib/privySuiWallet";

/** Privy signing helpers (resolved via vite alias — not public package exports). */
import { u as useInternalPrivy } from "privy-sign-internal/context";
import { u as useSignWithUserSigner } from "privy-sign-internal/user-signer";

function unifiedSuiWallets(user) {
  return (user?.linkedAccounts || []).filter((acct) => {
    if (acct.type !== "wallet") return false;
    if (acct.chainType !== "sui") return false;
    if (acct.walletClientType !== "privy" || acct.imported) return false;
    return isUnifiedWallet({ id: acct.id, recovery_method: acct.recoveryMethod });
  });
}

/**
 * Sign a Sui intent message via Privy raw_sign (bytes + blake2b256).
 * Required for Sui — the public signRawHash hook only supports precomputed hash and returns 400 for Sui.
 */
export function usePrivySuiIntentSign() {
  const { user } = usePrivy();
  const { privy } = useInternalPrivy();
  const { signWithUserSigner } = useSignWithUserSigner();

  const signSuiIntent = useCallback(
    async (address, intentMessageBytes) => {
      if (!user) throw new Error("Privy user required");
      const wallet = unifiedSuiWallets(user).find((w) => w.address === address);
      if (!wallet?.id) {
        throw new Error("Privy Sui wallet not found. Reconnect with Google, Apple, or email.");
      }

      const response = await rawSign(privy, signWithUserSigner, {
        wallet_id: wallet.id,
        params: {
          bytes: toHex(intentMessageBytes),
          encoding: "hex",
          hash_function: "blake2b256",
        },
      });

      const signature = response?.data?.signature ?? response?.signature;
      if (!signature) {
        throw new Error("Privy could not sign this Sui payment.");
      }
      return { signature };
    },
    [user, privy, signWithUserSigner],
  );

  const resolveWalletForPay = useCallback(
    async (address) => resolvePrivySuiWalletForPay(user, privy, address),
    [user, privy],
  );

  return { signSuiIntent, resolveWalletForPay, enrichWallet: (wallet) => enrichPrivySuiWalletPubkey(wallet, privy) };
}
