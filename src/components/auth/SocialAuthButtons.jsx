import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { postLoginDestination } from "../../lib/onboardingAuth";
import { apiErrorMessage } from "../../lib/apiError";
import {
  firebaseAuthErrorMessage,
  isFirebaseSocialAvailable,
  signInWithAppleFirebase,
  signInWithGoogleFirebase,
} from "../../lib/firebaseSocialSignIn";
import {
  exchangePrivyForApiSession,
  isPrivySocialAvailable,
  privyAuthErrorMessage,
} from "../../lib/privySocialSignIn";
import { AppleBrandIcon, GoogleBrandIcon } from "./BrandSignInIcons";
import PrivySocialAuthInner from "./PrivySocialAuthInner";

/**
 * Social sign-in: Privy (preferred) when VITE_PRIVY_APP_ID is set, else Firebase fallback.
 * Privy: one-tap Google/Apple + embedded Sui wallet + auto RentDirect account on first login.
 */
export default function SocialAuthButtons({ disabled = false, hint, registerRole = "tenant" }) {
  const navigate = useNavigate();
  const loginWithFirebase = useAuthStore((s) => s.loginWithFirebase);
  const loginWithPrivy = useAuthStore((s) => s.loginWithPrivy);
  const storeLoading = useAuthStore((s) => s.isLoading);
  const [busy, setBusy] = useState(null);

  const usePrivy = isPrivySocialAvailable();
  const useFirebase = !usePrivy && isFirebaseSocialAvailable();
  const configured = usePrivy || useFirebase;
  const blocked = disabled || storeLoading || busy;

  async function runFirebase(provider, signInFn) {
    if (blocked) return;
    setBusy(provider);
    try {
      const data = await signInFn();
      await loginWithFirebase(data);
      const user = useAuthStore.getState().user;
      toast.success("Welcome back!");
      navigate(postLoginDestination(user), { replace: true });
    } catch (err) {
      const fbMsg = firebaseAuthErrorMessage(err);
      if (fbMsg === null) return;
      toast.error(apiErrorMessage(err, fbMsg || `${provider} sign-in failed.`));
    } finally {
      setBusy(null);
    }
  }

  if (usePrivy) {
    return (
      <PrivySocialAuthInner
        disabled={blocked}
        busy={busy}
        setBusy={setBusy}
        hint={hint}
        registerRole={registerRole}
        onSession={async (sessionData) => {
          await loginWithPrivy(sessionData);
          const user = useAuthStore.getState().user;
          const isNew = sessionData?.is_new_user;
          toast.success(isNew ? "Account created — welcome to RentDirect!" : "Welcome back!");
          navigate(postLoginDestination(user), { replace: true });
        }}
        onError={(err, provider) => {
          const msg = privyAuthErrorMessage(err);
          if (msg === null) return;
          toast.error(apiErrorMessage(err, msg || `${provider} sign-in failed.`));
        }}
      />
    );
  }

  return (
    <div>
      {hint ? (
        <p className="mb-2 text-center text-[10px] text-white/50 sm:text-xs">{hint}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={blocked}
          onClick={() => runFirebase("Google", signInWithGoogleFirebase)}
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
          disabled={blocked}
          onClick={() => runFirebase("Apple", signInWithAppleFirebase)}
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
      {!configured ? (
        <p className="mt-1.5 text-center text-[10px] text-white/35">
          Add <code className="text-white/45">VITE_PRIVY_APP_ID</code> (recommended) or Firebase keys in{" "}
          <code className="text-white/45">.env</code>.
        </p>
      ) : null}
    </div>
  );
}
