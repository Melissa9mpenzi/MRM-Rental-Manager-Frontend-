import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { findPrivySuiWallet } from "../lib/privySocialSignIn";
import { isPrivyConfigured } from "../lib/privyConfig";
import { runPrivyServerSuiCheckout } from "../lib/privySuiCheckout";

/** Privy embedded Sui wallet checkout for Pay rent. */
export function usePrivySuiPay() {
  const { authenticated, login, getAccessToken, user: privyUser } = usePrivy();
  const { createWallet } = useCreateWallet();

  const pay = useCallback(
    async ({ invoiceId, onCompleted }) => {
      return runPrivyServerSuiCheckout({
        invoiceId,
        getAccessToken,
        login: authenticated ? undefined : login,
        createSuiWallet: async () => {
          const existing = findPrivySuiWallet(privyUser);
          if (existing?.address) return existing;
          await createWallet({ chainType: "sui" });
        },
        onCompleted,
      });
    },
    [authenticated, login, getAccessToken, createWallet, privyUser],
  );

  const wallet = findPrivySuiWallet(privyUser);

  return {
    pay,
    privyConfigured: isPrivyConfigured(),
    privyAuthenticated: authenticated,
    suiAddress: wallet?.address ?? null,
  };
}
