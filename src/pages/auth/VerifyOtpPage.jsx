import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

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

  const verify = () => {
    if (digits.some((d) => !d)) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    toast.success("Verification recorded. Continue to select your role.");
    navigate("/auth/select-role");
  };

  return (
    <div className="card-glass animate-fade-in rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-teal/30 bg-brand-teal/10 sm:h-12 sm:w-12">
          <ShieldCheck className="h-6 w-6 text-brand-teal sm:h-7 sm:w-7" />
        </div>
        <h1 className="text-lg font-bold text-white sm:text-xl">Verify OTP</h1>
        <p className="mt-1 max-w-xs text-[11px] text-white/55 sm:text-xs">
          Optional onboarding step. For production signup, verify your email from the link we send, or use{" "}
          <Link to="/register?step=verify" className="font-semibold text-brand-teal hover:underline">
            token entry on Register
          </Link>
          .
        </p>
      </div>

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

      <button type="button" onClick={verify} className="btn-primary mt-5 w-full rounded-xl py-2.5 text-sm font-bold sm:py-3">
        Verify &amp; continue
      </button>

      <p className="mt-3 text-center text-[10px] text-white/45 sm:text-xs">
        Didn&apos;t receive a code?{" "}
        <button type="button" className="font-semibold text-brand-teal hover:underline">
          Resend
        </button>
      </p>

      <p className="mt-3 text-center text-[11px] text-white/50 sm:text-xs">
        <Link to="/login" className="font-semibold text-white/70 hover:text-brand-teal">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
