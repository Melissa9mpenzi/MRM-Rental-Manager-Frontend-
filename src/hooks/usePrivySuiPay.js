import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateWallet, useSignRawHash } from "@privy-io/react-auth/extended-chains";
import { findPrivySuiWallet } from "../lib/privySocialSignIn";
import { isPrivyConfigured } from "../lib/privyConfig";
import { runPrivyServerSuiCheckout } from "../lib/privySuiCheckout";

/** Privy embedded Sui wallet checkout for Pay rent. */
export function usePrivySuiPay() {
  const { authenticated, login, getAccessToken, user: privyUser } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signRawHash } = useSignRawHash();

  const pay = useCallback(
    async ({ invoiceId, onCompleted }) => {
      return runPrivyServerSuiCheckout({
        invoiceId,
        getAccessToken,
        login: authenticated ? undefined : login,
        signRawHash,
        createSuiWallet: async () => {
          const existing = findPrivySuiWallet(privyUser);
          if (existing?.address) return existing;
          const { user, wallet } = await createWallet({ chainType: "sui" });
          const created =
            findPrivySuiWallet(user) ||
            (wallet?.address
              ? {
                  address: wallet.address,
                  publicKey: wallet.publicKey || wallet.public_key || null,
                }
              : null);
          return created;
        },
        resolveWallet: async () => {
          const fromUser = findPrivySuiWallet(privyUser);
          if (fromUser?.address) return fromUser;
          return null;
        },
        onCompleted,
      });
    },
    [authenticated, login, getAccessToken, createWallet, signRawHash, privyUser],
  );

  const wallet = findPrivySuiWallet(privyUser);

  return {
    pay,
    privyConfigured: isPrivyConfigured(),
    privyAuthenticated: authenticated,
    suiAddress: wallet?.address ?? null,
  };
}
