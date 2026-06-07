import { useState } from "react";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { usePrivy, useLoginWithEmail } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { exchangePrivyForApiSession } from "../../lib/privySocialSignIn";
import { PRIVY_BRAND } from "../../lib/privyConfig";

/**
 * Whitelabel Privy email OTP — RentDirect dark theme (replaces generic Privy modal for email).
 */
export default function PrivyEmailOtpLogin({
  disabled = false,
  registerRole = "tenant",
  onSession,
  onError,
  onConnected,
  compact = false,
  autoFinishSession = true,
}) {
  const { getAccessToken, user: privyUser } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { sendCode, loginWithCode, state } = useLoginWithEmail();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");

  const busy =
    state?.status === "sending-code" ||
    state?.status === "submitting-code" ||
    state?.status === "done";

  async function finishSession(activeUser) {
    if (!autoFinishSession || !onSession) return;
    let suiAddress = null;
    try {
      const { wallet } = await createWallet({ chainType: "sui" });
      suiAddress = wallet?.address || null;
    } catch {
      /* wallet may already exist */
    }
    const data = await exchangePrivyForApiSession({
      getAccessToken,
      privyUser: activeUser || privyUser,
      role: registerRole,
      suiAddress,
    });
    await onSession(data);
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    try {
      await sendCode({ email: trimmed });
      setStep("code");
    } catch (err) {
      onError?.(err, "Email");
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    const trimmedCode = code.replace(/\D/g, "").slice(0, 6);
    if (trimmedCode.length < 6) return;
    try {
      const result = await loginWithCode({ code: trimmedCode, email: email.trim().toLowerCase() });
      if (autoFinishSession) {
        await finishSession(result?.user);
      } else {
        onConnected?.();
      }
    } catch (err) {
      onError?.(err, "Email");
    }
  }

  const pad = compact ? "p-3" : "p-4";

  if (step === "code") {
    return (
      <div
        className={`rounded-xl border border-brand-teal/25 bg-gradient-to-br from-brand-teal/10 to-white/[0.03] ${pad}`}
      >
        <div className="mb-3 flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-teal/30 bg-brand-teal/15 text-brand-teal"
            style={{ boxShadow: `0 0 24px ${PRIVY_BRAND.accentDim}` }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Check your email</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/55">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-brand-teal">{email}</span>. It expires in 10
              minutes.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
              Verification code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="• • • • • •"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3 text-center text-2xl font-bold tracking-[0.35em] text-white outline-none transition focus:border-brand-teal/50 focus:ring-2 focus:ring-brand-teal/20"
            />
          </label>

          <button
            type="submit"
            disabled={disabled || busy || code.length < 6}
            className="btn-primary w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify and continue"}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <button
              type="button"
              className="font-semibold text-white/45 hover:text-white"
              onClick={() => {
                setStep("email");
                setCode("");
              }}
            >
              Change email
            </button>
            <button
              type="button"
              disabled={disabled || busy}
              className="font-semibold text-brand-teal hover:underline disabled:opacity-50"
              onClick={handleSend}
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] ${pad}`}>
      <div className="mb-3 flex items-center gap-2">
        <Mail size={16} className="text-brand-teal" />
        <p className="text-xs font-bold text-white">Continue with email</p>
      </div>
      <form onSubmit={handleSend} className="space-y-2.5">
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled || busy}
          className="w-full rounded-xl border border-white/12 bg-black/25 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-brand-teal/45 focus:ring-2 focus:ring-brand-teal/15 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || busy || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-teal/35 bg-brand-teal/15 py-2.5 text-sm font-bold text-brand-teal transition hover:bg-brand-teal/25 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {busy ? "Sending code…" : "Send login code"}
          {!busy && <ArrowRight size={15} />}
        </button>
      </form>
      <p className="mt-2 text-[10px] leading-relaxed text-white/40">
        You&apos;ll receive a branded email from RentDirect with your one-time code.
      </p>
    </div>
  );
}
