import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";
import { defaultGovernmentPath, isSystemAdministrator } from "../../config/governmentAccess";
import { governmentAuthApi } from "../../api/governmentAuthApi";
import { apiErrorMessage } from "../../lib/apiError";
import { GOV_PORTAL } from "../../config/governmentPortal";
import GovernmentAuthShell from "../../components/government/GovernmentAuthShell";
import "../../styles/government-auth.css";
import "../../styles/government-portal.css";

export default function GovernmentTwoFaPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const otpRequested = useRef(false);

  useEffect(() => {
    if (!isSystemAdministrator(user?.role) || otpRequested.current) return;
    otpRequested.current = true;
    (async () => {
      try {
        const data = await governmentAuthApi.resend2fa();
        if (data?.dev_gov_2fa_otp) {
          toast.error(`Email not sent. Dev code: ${data.dev_gov_2fa_otp}`, { duration: 12_000 });
        } else if (data?.otp_email_sent !== false) {
          toast.success(`Verification code sent to ${user?.email || "your email"}.`);
        }
      } catch (ex) {
        toast.error(apiErrorMessage(ex, "Could not send verification code."));
      }
    })();
  }, [user?.role, user?.email]);

  const submit = async (e) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, "").slice(0, 6);
    if (digits.length < 6) {
      setErr("Enter the 6-digit code from your email.");
      return;
    }
    if (loading) return;
    setLoading(true);
    setErr("");
    try {
      await governmentAuthApi.verify2fa({ code: digits });
      sessionStorage.setItem("rd_gov_2fa_verified", "1");
      toast.success("Verified. Entering secure portal.");
      const dest = isSystemAdministrator(user?.role)
        ? defaultDashboardPath(user.role)
        : defaultGovernmentPath(user?.role);
      navigate(dest, { replace: true });
    } catch (ex) {
      setErr(apiErrorMessage(ex, "Verification failed."));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setErr("");
    try {
      const data = await governmentAuthApi.resend2fa();
      if (data?.dev_gov_2fa_otp) {
        toast.error(`Email not sent. Dev code: ${data.dev_gov_2fa_otp}`, { duration: 12_000 });
      } else if (data?.otp_email_sent !== false) {
        toast.success(`New code sent to ${user?.email || "your official email"}.`);
      } else {
        toast.success("Code regenerated. Check your email.");
      }
    } catch (ex) {
      toast.error(apiErrorMessage(ex, "Could not resend code."));
    } finally {
      setResending(false);
    }
  };

  return (
    <GovernmentAuthShell>
      <div className="gov-auth-form-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <Shield size={28} />
        </div>
        <h2 className="mt-4 text-center">Mandatory 2FA</h2>
        <p className="gov-auth-form-sub text-center">
          Secure portal access for <strong>{user?.full_name || "officer"}</strong>.
          {" "}
          Enter the 6-digit code we sent to{" "}
          <strong className="text-white/90">{user?.email || "your official email"}</strong>.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            maxLength={8}
            placeholder="000000"
            autoComplete="one-time-code"
            className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-center text-xl tracking-[0.35em] text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          />
          {err && <p className="text-center text-sm text-red-400">{err}</p>}
          <button type="submit" disabled={loading} className="gov-auth-submit">
            {loading ? "Verifying…" : (
              <>
                Verify & enter portal <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-white/40">
          Code expires in 15 minutes. All access is logged.
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="mt-2 w-full text-center text-xs text-emerald-400/90 hover:text-emerald-300 disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code to my email"}
        </button>
        <button
          type="button"
          onClick={() => navigate(isSystemAdministrator(user?.role) ? "/login" : GOV_PORTAL.login)}
          className="mt-3 w-full text-center text-xs text-white/50 hover:text-emerald-300"
        >
          {isSystemAdministrator(user?.role) ? "Back to main sign in" : "Back to government sign in"}
        </button>
      </div>
    </GovernmentAuthShell>
  );
}
