import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { AppleBrandIcon, GoogleBrandIcon } from "../auth/BrandSignInIcons";
import PrivyEmailOtpLogin from "../auth/PrivyEmailOtpLogin";
import toast from "react-hot-toast";
import { privyAuthErrorMessage } from "../../lib/privySocialSignIn";

async function waitForPrivyToken(getAccessToken, attempts = 15) {
  for (let i = 0; i < attempts; i += 1) {
    const token = await getAccessToken?.();
    if (token) return token;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

/**
 * Privy auth for Sui payments only — does not create or replace RentDirect login session.
 * Sui wallet is created when the user taps Pay (not here — avoids 401 before session is ready).
 */
export default function PrivySuiConnect({ disabled = false }) {
  const { login, ready, getAccessToken } = usePrivy();
  const [busy, setBusy] = useState(null);
  const [showEmail, setShowEmail] = useState(false);

  async function runSocial(provider, loginMethods) {
    if (disabled || !ready || busy) return;
    setBusy(provider);
    try {
      await login({ loginMethods });
      const token = await waitForPrivyToken(getAccessToken);
      if (!token) {
        toast.error("Privy sign-in did not finish. Try again.");
        return;
      }
      toast.success("Sui wallet connected — tap Pay when ready.");
    } catch (err) {
      const msg = privyAuthErrorMessage(err);
      if (msg) toast.error(msg);
    } finally {
      setBusy(null);
    }
  }

  if (showEmail) {
    return (
      <div className="mt-3 space-y-2">
        <PrivyEmailOtpLogin compact autoFinishSession={false} disabled={disabled || !ready} />
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
