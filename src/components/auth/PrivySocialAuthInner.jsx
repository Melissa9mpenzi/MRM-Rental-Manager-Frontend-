import { usePrivy } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { exchangePrivyForApiSession } from "../../lib/privySocialSignIn";
import { AppleBrandIcon, GoogleBrandIcon } from "./BrandSignInIcons";
import PrivyEmailOtpLogin from "./PrivyEmailOtpLogin";

/** Must render inside PrivyProvider. */
export default function PrivySocialAuthInner({
  disabled,
  busy,
  setBusy,
  hint,
  registerRole,
  onSession,
  onError,
}) {
  const { login, getAccessToken, user: privyUser, authenticated, ready } = usePrivy();
  const { createWallet } = useCreateWallet();

  async function finishPrivySession() {
    let suiAddress = null;
    try {
      const { wallet } = await createWallet({ chainType: "sui" });
      suiAddress = wallet?.address || null;
    } catch {
      /* wallet may already exist — API will read linked accounts from Privy */
    }
    const data = await exchangePrivyForApiSession({
      getAccessToken,
      privyUser,
      role: registerRole,
      suiAddress,
    });
    await onSession(data);
  }

  async function run(provider, loginMethods) {
    if (disabled || !ready) return;
    setBusy(provider);
    try {
      await login({ loginMethods: loginMethods });
      await finishPrivySession();
    } catch (err) {
      onError(err, provider);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {hint ? (
        <p className="mb-2 text-center text-[10px] text-white/50 sm:text-xs">{hint}</p>
      ) : (
        <p className="mb-2 text-center text-[10px] text-white/45 sm:text-xs">
          Gmail or Apple — your Sui wallet is created automatically.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled || !ready}
          onClick={() => run("Google", ["google"])}
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
          disabled={disabled || !ready}
          onClick={() => run("Apple", ["apple"])}
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
      {authenticated && privyUser ? (
        <p className="mt-1 text-center text-[10px] text-cyan-300/70">Privy session active</p>
      ) : null}

      <div className="mt-3">
        <PrivyEmailOtpLogin
          disabled={disabled || !ready}
          registerRole={registerRole}
          onSession={onSession}
          onError={onError}
          compact
        />
      </div>
    </div>
  );
}
