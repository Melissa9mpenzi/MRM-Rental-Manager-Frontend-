import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { defaultGovernmentPath } from "../../config/governmentAccess";
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

  const submit = async (e) => {
    e.preventDefault();
    if (code.replace(/\D/g, "").length < 6) {
      setErr("Enter the 6-digit code from your authenticator.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      await governmentAuthApi.verify2fa({ code });
      sessionStorage.setItem("rd_gov_2fa_verified", "1");
      toast.success("Verified. Entering secure portal.");
      navigate(defaultGovernmentPath(user?.role), { replace: true });
    } catch (ex) {
      setErr(apiErrorMessage(ex, "Verification failed."));
    } finally {
      setLoading(false);
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
          Secure portal access for {user?.full_name || "officer"}. Use your authenticator app or agency OTP.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            maxLength={8}
            placeholder="000000"
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
          All access is logged. Development: any 6+ digit code is accepted when 2FA is not fully wired.
        </p>
        <button
          type="button"
          onClick={() => navigate(GOV_PORTAL.login)}
          className="mt-3 w-full text-center text-xs text-white/50 hover:text-emerald-300"
        >
          Back to government sign in
        </button>
      </div>
    </GovernmentAuthShell>
  );
}
