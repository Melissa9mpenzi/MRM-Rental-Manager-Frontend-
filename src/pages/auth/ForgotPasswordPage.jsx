import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import { Input } from "../../components/ui/Input";

function OtpInput({ value, onChange, inputRef, onKeyDown }) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-brand-tealLt bg-white text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/30 transition-all duration-150 caret-transparent"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}

export default function ForgotPasswordPage() {
  const navigate   = useNavigate();
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail]         = useState("");
  const [digits, setDigits]       = useState(["","","","","",""]);
  const [newPassword, setNewPass] = useState("");
  const [confirm, setConfirm]     = useState("");
  const inputRefs = useRef([]);

  const otp = digits.join("");

  function handleDigit(idx, e) {
    const val = e.target.value.replace(/\D/g,"").slice(-1);
    const next = [...digits]; next[idx] = val; setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  }
  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) inputRefs.current[idx-1]?.focus();
  }
  function handlePaste(e) {
    const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (p.length === 6) { setDigits(p.split("")); inputRefs.current[5]?.focus(); }
    e.preventDefault();
  }

  async function handleSend(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setStep(2);
      toast.success("Reset code sent! Check your email.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  async function handleResend() {
    setResending(true);
    try {
      await authApi.forgotPassword({ email });
      setDigits(["","","","","",""]);
      inputRefs.current[0]?.focus();
      toast.success("New code sent!");
    } catch { toast.error("Could not resend. Try again."); }
    finally { setResending(false); }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPassword !== confirm) { toast.error("Passwords do not match."); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, new_password: newPassword });
      toast.success("Password reset! You can now sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid or expired code.");
      setDigits(["","","","","",""]);
      inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  }

  const steps = [{ n:1, label:"Enter email"}, { n:2, label:"Reset password"}];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-brand-tealLt/60 p-8 md:p-10 animate-fade-in">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${step >= s.n ? "bg-brand-teal text-white":"bg-brand-tealLt text-brand-mid"}`}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span className={`text-xs font-semibold ${step===s.n?"text-brand-dark":"text-brand-mid"}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.n ? "bg-brand-teal":"bg-brand-tealLt"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-brand-dark mb-1">Forgot password?</h1>
          <p className="text-brand-mid text-sm mb-6">Enter your email and we'll send a reset code.</p>
          <form onSubmit={handleSend} className="space-y-4">
            <Input required type="email" icon={Mail} label="Email address" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl shadow-md">
              {loading
                ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Sending…</span>
                : <span className="flex items-center gap-2 justify-center">Send Reset Code <ArrowRight size={16}/></span>
              }
            </button>
          </form>
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-brand-mid hover:text-brand-teal mt-5 transition-colors">
            <ArrowLeft size={14}/> Back to sign in
          </Link>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-tealLt flex items-center justify-center mb-3">
              <ShieldCheck size={26} className="text-brand-teal" />
            </div>
            <h1 className="text-xl font-bold text-brand-dark text-center">Check your email</h1>
            <p className="text-brand-mid text-sm text-center mt-1">
              Enter the 6-digit code sent to <strong className="text-brand-dark">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <OtpInput key={i} value={d}
                  inputRef={(el) => (inputRefs.current[i] = el)}
                  onChange={(e) => handleDigit(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>

            <Input required type="password" icon={Lock} label="New password" placeholder="Min. 6 characters"
              value={newPassword} onChange={(e) => setNewPass(e.target.value)} />
            <Input required type="password" icon={Lock} label="Confirm new password" placeholder="Repeat password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} />

            <button type="submit" disabled={loading || otp.length !== 6} className="w-full btn-primary py-3 rounded-xl shadow-md disabled:opacity-50">
              {loading
                ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Resetting…</span>
                : "Reset Password"
              }
            </button>
          </form>

          <div className="text-center mt-4 space-y-2">
            <p className="text-xs text-brand-mid">Didn't receive the code?</p>
            <button onClick={handleResend} disabled={resending}
              className="inline-flex items-center gap-1.5 text-sm text-brand-teal font-semibold hover:underline disabled:opacity-50">
              <RefreshCw size={13} className={resending?"animate-spin":""} />
              {resending ? "Sending…" : "Resend code"}
            </button>
          </div>

          <button onClick={() => { setStep(1); setDigits(["","","","","",""]); }}
            className="flex items-center gap-1.5 text-sm text-brand-mid hover:text-brand-teal mt-4 transition-colors">
            <ArrowLeft size={14}/> Use a different email
          </button>
        </div>
      )}
    </div>
  );
}