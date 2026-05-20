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
 * Google + Apple sign-in (Firebase). Works on login and register:
 * backend only links existing RentDirect accounts (register with email first).
 */
export default function SocialAuthButtons({ disabled = false, hint }) {
  const navigate = useNavigate();
  const loginWithFirebase = useAuthStore((s) => s.loginWithFirebase);
  const storeLoading = useAuthStore((s) => s.isLoading);
  const [busy, setBusy] = useState(null);

  const configured = isFirebaseSocialAvailable();
  const blocked = disabled || storeLoading || busy;

  async function run(provider, signInFn) {
    if (blocked) return;
    if (!configured) {
      toast.error(
        "Social sign-in is not set up. Add VITE_FIREBASE_* to .env (see .env.example), then restart the dev server.",
      );
      return;
    }
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
      toast.error(
        apiErrorMessage(err, fbMsg || `${provider} sign-in failed. Use email/password or register first.`),
      );
    } finally {
      setBusy(null);
    }
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
          onClick={() => run("Google", signInWithGoogleFirebase)}
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
          onClick={() => run("Apple", signInWithAppleFirebase)}
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
          Configure Firebase in <code className="text-white/45">.env</code> to enable these buttons.
        </p>
      ) : null}
    </div>
  );
}
