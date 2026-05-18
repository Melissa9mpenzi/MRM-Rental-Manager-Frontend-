import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";

/**
 * Admin second step after password login. Wire TOTP / Firebase MFA here in production.
 * For local development, entering any 6 digits marks the browser session as verified.
 */
export default function AdminTwoFaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user || user.role !== "admin") {
    return (
      <div className="card-glass rounded-2xl border border-white/[0.1] p-5 text-center text-sm text-white/70">
        <p>Admin session not found.</p>
        <Link to="/login" className="mt-3 inline-block font-semibold text-brand-teal hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length < 6) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    try {
      sessionStorage.setItem("rd_admin_2fa_verified", "1");
      toast.success("Second factor accepted.");
      navigate(defaultDashboardPath("admin"), { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-glass rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-4 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-teal/30 bg-brand-tealLt/25">
          <ShieldCheck className="h-6 w-6 text-brand-teal" />
        </div>
        <h1 className="text-lg font-bold text-white sm:text-xl">Admin verification</h1>
        <p className="mt-1 text-[11px] text-white/55 sm:text-xs">
          Enterprise policy: second factor after password (Authenticator, SMS, or email OTP via Firebase). Dev
          builds accept any 6-digit code.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/70">6-digit code</label>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={12}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-3 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-white outline-none focus:border-brand-teal/50"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold sm:py-3"
        >
          Continue <ArrowRight size={16} />
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          useAuthStore.getState().logout();
          navigate("/login", { replace: true });
        }}
        className="mt-3 w-full text-center text-[11px] font-semibold text-white/45 hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
}
