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
import { AppleBrandIcon, GoogleBrandIcon } from "./BrandSignInIcons";

/**
 * Social sign-in for login/register — Firebase only.
 * Privy is reserved for Sui payments (see PrivySuiWalletPanel on the pay page).
 */
export default function SocialAuthButtons({ disabled = false, hint }) {
  const navigate = useNavigate();
  const loginWithFirebase = useAuthStore((s) => s.loginWithFirebase);
  const storeLoading = useAuthStore((s) => s.isLoading);
  const [busy, setBusy] = useState(null);

  const useFirebase = isFirebaseSocialAvailable();
  const configured = useFirebase;
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

  return (
    <div>
      {hint ? (
        <p className="mb-2 text-center text-[10px] text-white/50 sm:text-xs">{hint}</p>
      ) : null}
      {configured ? (
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
      ) : null}
      {!configured ? (
        <p className="mt-1.5 text-center text-[10px] text-white/35">
          Use email and password below to sign in. Privy is only used when you pay with Sui.
        </p>
      ) : null}
    </div>
  );
}
