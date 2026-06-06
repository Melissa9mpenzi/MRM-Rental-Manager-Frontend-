import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import { apiErrorMessage } from "../../lib/apiError";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/index.jsx";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
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
      const q = em ? `?email=${encodeURIComponent(em)}` : "";
      navigate(`/auth/verify-otp${q}`, { replace: true });
    }
  }, [searchParams, navigate]);

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
      const res = await authApi.register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      const fallback = res?.verification_otp_fallback || res?.dev_verification_otp;
      if (res?.email_sent === false) {
        toast.error(
          fallback
            ? "Email could not be sent. Use the code shown on the next screen."
            : "Email could not be sent. Tap Resend code on the next screen.",
          { duration: 8000 }
        );
      } else {
        toast.success("Account created! Check your email for a 6-digit code (and spam folder).");
      }
      navigate(`/auth/verify-otp?email=${encodeURIComponent(form.email)}`, {
        replace: true,
        state: {
          devOtp: fallback,
          emailSent: res?.email_sent !== false,
        },
      });
    } catch (err) {
      const d = err.response?.data?.detail;
      const msg = typeof d === "string" ? d : d?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-glass rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-3">
        <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Create your account</h1>
        <p className="mt-0.5 text-xs text-white/55">RentDirect UG · quick signup</p>
      </div>

      <SocialAuthButtons
        disabled={loading}
        hint="Google or Apple — quick sign-in with your existing account."
      />

      <div className="my-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-medium text-white/45">or register with email</span>
        <div className="h-px flex-1 bg-white/10" />
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
            label="Sign up as"
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            options={[
              { value: "tenant", label: "Tenant — browse & rent" },
              { value: "landlord", label: "Landlord — list & manage properties" },
              { value: "agent", label: "Agent — agency workspace" },
            ]}
          />
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
      </p>
    </div>
  );
}
