import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import { apiErrorMessage } from "../../lib/apiError";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/index.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "tenant",
    password: "",
    confirm: "",
  });

  useEffect(() => {
    if (searchParams.get("step") === "verify") {
      const em = searchParams.get("email");
      if (em) setEmail(decodeURIComponent(em));
      setStep(2);
    }
  }, [searchParams]);

  async function handleVerifyToken(e) {
    e.preventDefault();
    let token = verifyToken.trim();
    let addr = email.trim();
    if (token.includes("http") && token.includes("token=")) {
      try {
        const u = new URL(token.split(/\s/).find((s) => s.startsWith("http")) || token);
        addr = addr || decodeURIComponent(u.searchParams.get("email") || "");
        token = decodeURIComponent(u.searchParams.get("token") || "");
      } catch {
        /* keep raw token */
      }
    }
    if (!addr || !token) {
      toast.error("Enter the email and verification token (or paste the full verify link).");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email: addr, token });
      const msg = res?.message || "Email verified.";
      toast.success(msg);
      navigate("/login", { replace: true, state: { email: addr } });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Verification failed."));
    } finally {
      setLoading(false);
    }
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleRegister(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      setEmail(form.email);
      setStep(2);
      toast.success("Account created! Check your email for a 6-digit code and verification link.");
    } catch (err) {
      const d = err.response?.data?.detail;
      const msg = typeof d === "string" ? d : d?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { n: 1, label: "Account" },
    { n: 2, label: "Verify" },
  ];

  return (
    <div className="card-glass rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
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
        <>
          <div className="mb-3">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Create your account</h1>
            <p className="mt-0.5 text-xs text-white/55">RentDirect UG · quick signup</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-x-3 md:gap-y-2.5">
            <Input
              required
              icon={User}
              label="Full name"
              placeholder="John Mukasa"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
            />
            <Input
              required
              type="email"
              icon={Mail}
              label="Email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <div className="md:col-span-2">
              <Input
                required
                icon={Phone}
                label="Phone"
                placeholder="+256 700 000 000"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Select
                className="select-auth"
                label="Sign up as"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                options={[
                  { value: "tenant", label: "Tenant — browse & rent (fastest path)" },
                  { value: "landlord", label: "Landlord — list & manage properties (KYC + approval)" },
                  { value: "agent", label: "Agent — agency workspace (KYC + approval)" },
                ]}
              />
              <p className="mt-1 text-[10px] text-white/40 sm:text-[11px]">
                Admins are created internally only. After email verification you can sign in; landlords and agents go
                through KYC and moderation before publishing listings.
              </p>
            </div>
            <Input
              required
              type="password"
              icon={Lock}
              label="Password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
            <Input
              required
              type="password"
              icon={Lock}
              label="Confirm"
              placeholder="Repeat"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
            />

            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary mt-1 w-full rounded-xl py-2.5 text-sm font-bold shadow-md sm:py-3">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create account <ArrowRight size={15} />
                  </span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-3 text-center text-[10px] text-white/50 sm:text-xs">
            Have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-teal hover:underline">
              Sign in
            </Link>
            {" · "}
            <Link to="/auth/verify-otp" className="font-semibold text-brand-teal hover:underline">
              OTP screen →
            </Link>
          </p>
        </>
      )}

      {step === 2 && (
        <div className="animate-fade-in text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-teal/25 bg-brand-tealLt/30 sm:h-14 sm:w-14">
            <MailCheck size={26} className="text-brand-teal sm:h-7 sm:w-7" />
          </div>
          <h1 className="text-lg font-bold text-white sm:text-xl">Check your email</h1>
          <p className="mx-auto mt-1.5 max-w-[320px] text-xs text-white/55 sm:text-sm">
            We emailed <strong className="text-white">{email || "your address"}</strong> a <strong className="text-white">6-digit code</strong> and a verification link. Enter the code below, or open the link.
          </p>
          <form onSubmit={handleVerifyToken} className="mt-4 space-y-3 text-left">
            <Input
              type="email"
              icon={Mail}
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-white/70">6-digit code or link token</label>
              <textarea
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                rows={3}
                placeholder="e.g. 482913 — or paste the full verification link"
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-xs text-white placeholder:text-white/35 outline-none focus:border-brand-teal/50"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-2.5 text-sm font-bold sm:py-3">
              {loading ? "Verifying…" : "Verify email"}
            </button>
          </form>
          <Link
            to="/login"
            className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold sm:py-3"
          >
            Go to sign in <ArrowRight size={15} />
          </Link>
          <div className="mt-3 space-y-1.5 text-[10px] sm:text-xs">
            <Link to="/auth/verify-otp" className="block font-semibold text-brand-teal hover:underline">
              Optional OTP screen
            </Link>
            <button type="button" onClick={() => setStep(1)} className="text-white/45 underline-offset-2 hover:text-white">
              Different email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
