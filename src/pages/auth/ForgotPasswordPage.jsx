import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import { apiErrorMessage } from "../../lib/apiError";
import { Input } from "../../components/ui/Input";

function OtpInput({ value, onChange, inputRef, onKeyDown }) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      className="h-11 w-9 rounded-lg border-2 border-white/15 bg-white/[0.06] text-center text-lg font-bold text-white caret-transparent transition-all focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30 sm:h-12 sm:w-10 sm:text-xl"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const inputRefs = useRef([]);

  const otp = digits.join("");

  function handleDigit(idx, e) {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  }
  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  }
  function handlePaste(e) {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) {
      setDigits(p.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  }

  async function handleSend(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setStep(2);
      toast.success("Reset code sent! Check your email.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await authApi.forgotPassword({ email });
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("New code sent!");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not resend. Try again."));
    } finally {
      setResending(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, new_password: newPassword });
      toast.success("Password reset! You can now sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid or expired code."));
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "Reset" },
  ];

  return (
    <div className="card-glass animate-fade-in rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-3 flex items-center gap-1.5 sm:mb-4 sm:gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all sm:h-7 sm:w-7 sm:text-xs ${
                step >= s.n ? "bg-brand-teal text-[#041208]" : "border border-white/10 bg-white/5 text-white/45"
              }`}
            >
              {step > s.n ? "✓" : s.n}
            </div>
            <span className={`truncate text-[10px] font-semibold sm:text-xs ${step === s.n ? "text-white" : "text-white/45"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 ${step > s.n ? "bg-brand-teal/60" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <h1 className="text-lg font-bold text-white sm:text-xl">Forgot password?</h1>
          <p className="mb-3 mt-0.5 text-xs text-white/55">We&apos;ll send a reset code to your email.</p>
          <form onSubmit={handleSend} className="space-y-3">
            <Input
              required
              type="email"
              icon={Mail}
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-2.5 text-sm font-bold shadow-md sm:py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Sending…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Send reset code <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>
          <Link to="/login" className="mt-3 flex items-center gap-1.5 text-[11px] text-white/55 transition-colors hover:text-brand-teal sm:text-xs">
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="mb-3 flex flex-col items-center">
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-teal/25 bg-brand-tealLt/30 sm:h-12 sm:w-12">
              <ShieldCheck size={22} className="text-brand-teal sm:h-6 sm:w-6" />
            </div>
            <h1 className="text-center text-lg font-bold text-white sm:text-xl">Check your email</h1>
            <p className="mt-0.5 text-center text-[11px] text-white/55 sm:text-xs">
              6-digit code sent to <strong className="text-white">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-3">
            <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <OtpInput
                  key={i}
                  value={d}
                  inputRef={(el) => (inputRefs.current[i] = el)}
                  onChange={(e) => handleDigit(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <Input
                required
                type="password"
                icon={Lock}
                label="New password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPass(e.target.value)}
              />
              <Input
                required
                type="password"
                icon={Lock}
                label="Confirm"
                placeholder="Repeat"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full rounded-xl py-2.5 text-sm font-bold shadow-md disabled:opacity-50 sm:py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Resetting…
                </span>
              ) : (
                "Reset password"
              )}
            </button>
          </form>

          <div className="mt-2 space-y-1 text-center">
            <p className="text-[10px] text-white/45">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-teal hover:underline disabled:opacity-50 sm:text-xs"
            >
              <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
              {resending ? "Sending…" : "Resend code"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setDigits(["", "", "", "", "", ""]);
            }}
            className="mt-2 flex items-center gap-1.5 text-[11px] text-white/55 transition-colors hover:text-brand-teal sm:text-xs"
          >
            <ArrowLeft size={13} /> Different email
          </button>
        </div>
      )}
    </div>
  );
}
