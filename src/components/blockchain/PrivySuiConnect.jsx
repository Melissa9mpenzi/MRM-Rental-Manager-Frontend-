import { useState, useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { AppleBrandIcon, GoogleBrandIcon } from "../auth/BrandSignInIcons";
import PrivyEmailOtpLogin from "../auth/PrivyEmailOtpLogin";
import toast from "react-hot-toast";
import { privyAuthErrorMessage } from "../../lib/privySocialSignIn";
import { isPrivySessionActive, waitForPrivySession } from "../../lib/privySession";

const AUTH_WAIT_MS = 45_000;

/**
 * Privy auth for Sui payments only — does not create or replace RentDirect login session.
 * Wallet is created when the user taps Pay.
 */
export default function PrivySuiConnect({ disabled = false }) {
  const { login, ready, authenticated, user } = usePrivy();
  const [busy, setBusy] = useState(null);
  const [showEmail, setShowEmail] = useState(false);
  const awaitingAuth = useRef(false);
  const sessionRef = useRef({ authenticated: false, user: null });
  sessionRef.current = { authenticated, user };

  useEffect(() => {
    if (!awaitingAuth.current) return;
    if (!isPrivySessionActive(sessionRef.current)) return;

    awaitingAuth.current = false;
    setBusy(null);
    toast.success("Sui wallet connected — tap Pay when ready.");
  }, [authenticated, user]);

  function markConnected() {
    awaitingAuth.current = false;
    setBusy(null);
    toast.success("Sui wallet connected — tap Pay when ready.");
  }

  async function runSocial(provider, loginMethods) {
    if (disabled || !ready || busy) return;
    if (isPrivySessionActive(sessionRef.current)) {
      markConnected();
      return;
    }

    setBusy(provider);
    awaitingAuth.current = true;

    try {
      await login({ loginMethods });
      const readySession = await waitForPrivySession(sessionRef, AUTH_WAIT_MS);
      if (!readySession) {
        awaitingAuth.current = false;
        setBusy(null);
        toast.error(
          "Privy sign-in did not finish. Add this site URL to Privy allowed domains, then try again.",
          { duration: 8000 },
        );
      }
    } catch (err) {
      awaitingAuth.current = false;
      setBusy(null);
      const msg = privyAuthErrorMessage(err);
      if (msg) toast.error(msg);
    }
  }

  if (showEmail) {
    return (
      <div className="mt-3 space-y-2">
        <PrivyEmailOtpLogin
          compact
          autoFinishSession={false}
          disabled={disabled || !ready}
          onConnected={markConnected}
        />
        <button
          type="button"
          className="text-[11px] font-semibold text-white/45 hover:text-white"
          onClick={() => setShowEmail(false)}
        >
          Back to Google / Apple
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled || !ready || !!busy}
          onClick={() => runSocial("Google", ["google"])}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] py-2 text-[10px] font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          {busy === "Google" ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <GoogleBrandIcon />
          )}
          Google
        </button>
        <button
          type="button"
          disabled={disabled || !ready || !!busy}
          onClick={() => runSocial("Apple", ["apple"])}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] py-2 text-[10px] font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          {busy === "Apple" ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <AppleBrandIcon />
          )}
          Apple
        </button>
      </div>
      <button
        type="button"
        onClick={() => setShowEmail(true)}
        disabled={disabled || !ready || !!busy}
        className="w-full text-[11px] font-semibold text-brand-teal hover:underline disabled:opacity-50"
      >
        Sign in with email code
      </button>
    </div>
  );
}
