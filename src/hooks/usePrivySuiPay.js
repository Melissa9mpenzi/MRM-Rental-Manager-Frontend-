import { useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { findPrivySuiWallet, privyAuthErrorMessage } from "../lib/privySocialSignIn";
import { isPrivyConfigured } from "../lib/privyConfig";
import { isPrivySessionActive, waitForPrivySession } from "../lib/privySession";
import { runPrivyServerSuiCheckout } from "../lib/privySuiCheckout";
import { usePrivySuiIntentSign } from "./usePrivySuiIntentSign";

/** Privy embedded Sui wallet checkout for Pay rent. */
export function usePrivySuiPay() {
  const { authenticated, login, getAccessToken, user: privyUser } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signSuiIntent } = usePrivySuiIntentSign();
  const sessionRef = useRef({ authenticated: false, user: null });
  sessionRef.current = { authenticated, user: privyUser };

  const ensurePrivySession = useCallback(async () => {
    if (isPrivySessionActive(sessionRef.current)) return true;
    if (!login) return false;

    toast("Connect with Google, Apple, or email to pay with Sui…", { duration: 6000 });
    try {
      await login();
    } catch (err) {
      const msg = privyAuthErrorMessage(err);
      if (msg) toast.error(msg);
      return false;
    }

    const ready = await waitForPrivySession(sessionRef);
    if (!ready) {
      toast.error(
        "Privy sign-in did not finish. Add this site URL to Privy allowed domains, then try again.",
        { duration: 8000 },
      );
    }
    return ready;
  }, [login]);

  const pay = useCallback(
    async ({ invoiceId, onCompleted }) => {
      const connected = await ensurePrivySession();
      if (!connected) return null;

      return runPrivyServerSuiCheckout({
        invoiceId,
        getAccessToken,
        signSuiIntent,
        createSuiWallet: async () => {
          const currentUser = sessionRef.current.user;
          const existing = findPrivySuiWallet(currentUser);
          if (existing?.address) return existing;

          const { user: freshUser, wallet } = await createWallet({ chainType: "sui" });
          if (freshUser) sessionRef.current.user = freshUser;

          return (
            findPrivySuiWallet(freshUser || currentUser) ||
            (wallet?.address
              ? {
                  address: wallet.address,
                  publicKey: wallet.publicKey || wallet.public_key || null,
                  walletId: wallet.id || wallet.wallet_id || null,
                }
              : null)
          );
        },
        resolveWallet: async () => findPrivySuiWallet(sessionRef.current.user),
        onCompleted,
      });
    },
    [ensurePrivySession, getAccessToken, createWallet, signSuiIntent],
  );

  const wallet = findPrivySuiWallet(privyUser);

  return {
    pay,
    privyConfigured: isPrivyConfigured(),
    privyAuthenticated: isPrivySessionActive({ authenticated, user: privyUser }),
    suiAddress: wallet?.address ?? null,
  };
}
