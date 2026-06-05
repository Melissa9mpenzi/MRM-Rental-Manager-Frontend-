import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Home } from "lucide-react";
import { tenantPortalApi } from "../../api/tenantPortalApi";
import { apiErrorMessage } from "../../lib/apiError";
import useAuthStore from "../../store/authStore";
import { postLoginDestination } from "../../lib/onboardingAuth";
import "./styles.css";

function TenantAcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    verifyToken();
  }, [token]);

  async function verifyToken() {
    if (!token) {
      toast.error("Invalid invite link. Missing token.");
      setLoading(false);
      return;
    }

    try {
      const data = await tenantPortalApi.verifyInvite(token);
      if (data?.valid) {
        setInviteValid(true);
        setInviteData(data);
      } else {
        toast.error(data?.detail || "Invalid or expired invite link.");
      }
    } catch (err) {
      toast.error("Failed to verify invite. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptInvite(e) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setVerifying(true);

    try {
      const result = await tenantPortalApi.acceptInvite({ token, password });
      const access = result?.access_token;
      const refresh = result?.refresh_token;
      if (access) {
        await useAuthStore.getState().loginWithPrivy({
          access_token: access,
          refresh_token: refresh,
          user: { email: result?.email || email, role: "tenant" },
        });
        toast.success(result?.message || "You are signed in.");
        navigate(postLoginDestination(useAuthStore.getState().user) || "/tenant/dashboard", {
          replace: true,
        });
        return;
      }
      if (result?.already_active) {
        toast.success("Invite already used. Sign in with the same email as the invite.");
      } else {
        toast.success("Account ready. Sign in with the email on this invite.");
      }
      navigate("/login", { state: { email: result?.email || email } });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to create account."));
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center py-16">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#4F6EF7]/30 border-t-[#4F6EF7]" />
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="card-glass mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Invalid invite</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/55">
          This invitation link is invalid or has expired. Please contact your landlord for a new invite.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#4F6EF7] px-6 py-3 text-sm font-bold text-[#ffffff] transition hover:brightness-110"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="card-glass overflow-hidden p-0">
      <div className="relative h-28 overflow-hidden sm:h-36">
        <img src="/images/hero-villa.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#060a0e] via-white/40 dark:via-[#060a0e]/40 to-transparent" />
      </div>

      <div className="p-6 sm:p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4F6EF7]/35 bg-[#4F6EF7]/10">
              <Home className="h-7 w-7 text-[#4F6EF7]" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Accept your invitation</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-white/55">
            Create your tenant account for {inviteData?.full_name}
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-[#4F6EF7]/25 bg-[#4F6EF7]/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4F6EF7]" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Invitation verified</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-white/55">
                Welcome! Set your password to access your tenant portal.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] p-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-white/40">Email address</p>
          <p className="mt-1 font-medium text-slate-900 dark:text-white">{email}</p>
        </div>

        <form onSubmit={handleAcceptInvite} className="space-y-5">
          <div>
            <label className="input-label">Create password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Min. 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">Confirm password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Repeat password"
                required
              />
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/35" />
            </div>
          </div>

          <button type="submit" disabled={verifying} className="btn-primary w-full">
            {verifying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#ffffff]/30 border-t-[#ffffff]" />
                Creating account…
              </span>
            ) : (
              "Create account & access portal"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-white/50">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#4F6EF7] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default TenantAcceptInvite;
