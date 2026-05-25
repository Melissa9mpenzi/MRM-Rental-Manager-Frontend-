import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { authApi } from "../../api/authApi";
import { apiErrorMessage } from "../../lib/apiError";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [email, setEmail] = useState(() => decodeURIComponent(searchParams.get("email") || ""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [fallbackOtp, setFallbackOtp] = useState(location.state?.devOtp || null);
  const [emailSent, setEmailSent] = useState(location.state?.emailSent !== false);
  const inputs = useRef([]);

  useEffect(() => {
    const em = searchParams.get("email");
    if (em) setEmail(decodeURIComponent(em));
  }, [searchParams]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const setAt = (i, v) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const resendCode = async () => {
    const addr = email.trim();
    if (!addr) {
      toast.error("Enter the email you registered with.");
      return;
    }
    setResending(true);
    try {
      const res = await authApi.resendVerification({ email: addr });
      if (res?.email_verified) {
        toast.success("Email already verified. You can sign in.");
        navigate("/login", { replace: true, state: { email: addr } });
        return;
      }
      const fallback = res?.verification_otp_fallback || res?.dev_verification_otp;
      if (fallback) setFallbackOtp(fallback);
      setEmailSent(res?.email_sent !== false);
      if (res?.email_sent === false && fallback) {
        toast.error(`Email not sent. Use this code: ${fallback}`, { duration: 12_000 });
      } else {
        toast.success(res?.message || "New code sent. Check your inbox and spam folder.");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not resend code."));
    } finally {
      setResending(false);
    }
  };

  const verify = async () => {
    const otp = digits.join("");
    const addr = email.trim();
    if (!addr) {
      toast.error("Enter the email you registered with.");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email: addr, token: otp });
      toast.success(res?.message || "Email verified. You can sign in.");
      navigate("/login", { replace: true, state: { email: addr } });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Verification failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-glass animate-fade-in rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-teal/30 bg-brand-teal/10 sm:h-12 sm:w-12">
          <ShieldCheck className="h-6 w-6 text-brand-teal sm:h-7 sm:w-7" />
        </div>
        <h1 className="text-lg font-bold text-white sm:text-xl">Verify your email</h1>
        <p className="mt-1 max-w-xs text-[11px] text-white/55 sm:text-xs">
          Enter the 6-digit code we sent
          {email ? (
            <>
              {" "}
              to <strong className="text-white">{email}</strong>
            </>
          ) : (
            " to your inbox"
          )}
          . You can also open the verification link in the email.
        </p>
        {!emailSent && (
          <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] leading-snug text-amber-200">
            We could not deliver email from the server (SMTP may be missing on production). Tap{" "}
            <strong>Resend code</strong> or use a one-time code below if shown.
          </p>
        )}
        {fallbackOtp && (
          <p className="mt-2 rounded-lg border border-[#00C896]/30 bg-[#00C896]/10 px-3 py-2 text-center text-sm font-bold tracking-widest text-[#00C896]">
            {fallbackOtp}
          </p>
        )}
      </div>

      {!email && (
        <div className="mb-4">
          <label className="mb-1 block text-[11px] font-semibold text-white/70">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand-teal/50"
          />
        </div>
      )}

      <div className="flex justify-center gap-1.5 sm:gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            value={d}
            maxLength={1}
            inputMode="numeric"
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-11 w-9 rounded-lg border border-white/[0.12] bg-white/[0.06] text-center text-lg font-bold text-white outline-none transition focus:border-brand-teal/50 focus:ring-2 focus:ring-brand-teal/20 sm:h-12 sm:w-10"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={verify}
        disabled={loading}
        className="btn-primary mt-5 w-full rounded-xl py-2.5 text-sm font-bold sm:py-3"
      >
        {loading ? "Verifying…" : "Verify & continue"}
      </button>

      <button
        type="button"
        disabled={resending || loading}
        onClick={resendCode}
        className="mt-3 w-full rounded-xl border border-white/15 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/10 disabled:opacity-50"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>

      <p className="mt-3 text-center text-[11px] text-white/50 sm:text-xs">
        Check spam/junk. Codes expire in 15 minutes.
        <br />
        <Link to="/register" className="font-semibold text-white/70 hover:text-brand-teal">
          Register with a different email
        </Link>
        {" · "}
        <Link to="/login" className="font-semibold text-brand-teal hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
