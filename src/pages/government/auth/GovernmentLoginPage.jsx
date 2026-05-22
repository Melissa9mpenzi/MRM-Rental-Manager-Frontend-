import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../../../components/ui/Input";
import useAuthStore from "../../../store/authStore";
import { GOV_PORTAL } from "../../../config/governmentPortal";
import { isGovernmentOfficer } from "../../../config/governmentAccess";

export default function GovernmentLoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const governmentLogin = useAuthStore((s) => s.governmentLogin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const em = params.get("email");
    if (em) setEmail(decodeURIComponent(em));
  }, [params]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await governmentLogin({ email, password });
      const role = data?.user?.role;
      if (!isGovernmentOfficer(role)) {
        toast.error("Use the main RentDirect login for system administrators.");
        return;
      }
      if (data?.dev_gov_2fa_otp) {
        toast.error(
          `Email not sent (configure SMTP). Dev code: ${data.dev_gov_2fa_otp}`,
          { duration: 12_000 }
        );
      } else if (data?.otp_email_sent !== false) {
        toast.success(`Verification code sent to ${email.trim()}. Check your inbox.`);
      } else {
        toast.success("Signed in. Enter the verification code from your email.");
      }
      navigate(GOV_PORTAL.verify2fa, { replace: true });
    } catch (err) {
      toast.error(err.message || "Sign-in failed.");
    }
  };

  return (
    <div className="gov-auth-form-card">
      <h2>Government officer sign in</h2>
      <p className="gov-auth-form-sub">
        Invitation-only access. No Google, Facebook, or public registration.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input
          required
          type="email"
          icon={Mail}
          label="Official email"
          placeholder="officer@agency.ug"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <Input
          required
          type="password"
          icon={Lock}
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit" disabled={isLoading} className="gov-auth-submit">
          {isLoading ? "Signing in…" : (
            <>
              Secure sign in <ArrowRight size={18} strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      <p className="gov-auth-form-footer">
        Received an invitation?{" "}
        <Link to={GOV_PORTAL.acceptInvite}>Activate your account</Link>
      </p>
    </div>
  );
}
