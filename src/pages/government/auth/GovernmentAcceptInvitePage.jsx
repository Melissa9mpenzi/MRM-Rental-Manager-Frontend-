import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, KeyRound, BadgeCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { governmentAuthApi } from "../../../api/governmentAuthApi";
import { apiErrorMessage } from "../../../lib/apiError";
import { GOV_PORTAL } from "../../../config/governmentPortal";
import { Input } from "../../../components/ui/Input";

const STEPS = ["Identity", "Password", "Security"];

export default function GovernmentAcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [step, setStep] = useState(0);
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [securityPin, setSecurityPin] = useState("");
  const [workIdConfirm, setWorkIdConfirm] = useState("");

  useEffect(() => {
    if (!token) return;
    governmentAuthApi
      .verifyInvitation(token)
      .then(setInvite)
      .catch((err) => toast.error(apiErrorMessage(err, "Invalid invitation.")));
  }, [token]);

  const submit = async () => {
    if (!token || !invite) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (securityPin.length < 4) {
      toast.error("Security PIN must be at least 4 digits.");
      return;
    }
    if (workIdConfirm.trim() !== invite.work_id) {
      toast.error("Work ID must match your invitation.");
      return;
    }
    setLoading(true);
    try {
      await governmentAuthApi.acceptInvitation({
        token,
        password,
        security_pin: securityPin,
        work_id_confirm: workIdConfirm.trim(),
      });
      toast.success("Account activated. Sign in with your new password.");
      navigate(`${GOV_PORTAL.login}?email=${encodeURIComponent(invite.email)}`, { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not activate account."));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="gov-auth-form-card text-center text-sm text-white/60">
        <p>Missing invitation token. Open the link from your invitation email.</p>
        <Link to={GOV_PORTAL.login} className="mt-3 inline-block font-semibold text-emerald-400">
          Government sign in
        </Link>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="gov-auth-form-card text-center text-sm text-white/50">
        Verifying invitation…
      </div>
    );
  }

  return (
    <div className="gov-auth-form-card">
      <div className="mb-4 flex justify-center gap-2">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              i === step ? "bg-emerald-600 text-white" : "bg-white/10 text-white/40"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-emerald-400">
            <BadgeCheck size={20} />
            <span className="font-bold text-white">Confirm your identity</span>
          </div>
          <p className="text-white/55">
            <strong className="text-white">{invite.full_name}</strong>
            <br />
            {invite.email} · {invite.agency?.toUpperCase()} · {invite.role?.replace("gov_", "").toUpperCase()}
          </p>
          <Input
            required
            label="Confirm work ID"
            placeholder={invite.work_id}
            value={workIdConfirm}
            onChange={(e) => setWorkIdConfirm(e.target.value)}
          />
          <button
            type="button"
            onClick={() => (workIdConfirm.trim() ? setStep(1) : toast.error("Enter your work ID"))}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white"
          >
            Continue
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock size={20} />
            <span className="font-bold text-white">Create secure password</span>
          </div>
          <Input
            required
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            required
            type="password"
            label="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button type="button" onClick={() => setStep(2)} className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <KeyRound size={20} />
            <span className="font-bold text-white">Security PIN & 2FA</span>
          </div>
          <p className="text-xs text-white/50">
            Choose a 4–8 digit PIN for sensitive actions. After sign-in you will complete mandatory two-factor
            verification (authenticator / OTP).
          </p>
          <Input
            required
            inputMode="numeric"
            label="Security PIN"
            maxLength={8}
            value={securityPin}
            onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ""))}
          />
          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Activating…" : (
              <>
                Activate account <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
