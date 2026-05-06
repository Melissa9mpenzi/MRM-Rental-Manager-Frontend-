import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import { Input } from "../../components/ui/Input";
import mrmLogo from "../../assets/MRM-LOGO.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail]     = useState("");
  const [form, setForm]       = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* ── Step 1: Register ── */
  async function handleRegister(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await authApi.register({
        full_name: form.full_name,
        email:     form.email,
        phone:     form.phone,
        password:  form.password,
      });
      setEmail(form.email);
      setStep(2);
      toast.success("Account created! Check your email for the verification link.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Step indicator ── */
  const steps = [
    { n: 1, label: "Create account" },
    { n: 2, label: "Verify email"   },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-brand-tealLt/60 p-8 md:p-10 animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
            <img src={mrmLogo} alt="MRM" className="h-10 w-auto object-contain" />
          </div>
        </div>
      </div>
      
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${step >= s.n ? "bg-brand-teal text-white" : "bg-brand-tealLt text-brand-mid"}`}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span className={`text-xs font-semibold transition-colors ${step === s.n ? "text-brand-dark" : "text-brand-mid"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px transition-colors duration-500 ${step > s.n ? "bg-brand-teal" : "bg-brand-tealLt"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Form ── */}
      {step === 1 && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Create your account</h1>
            <p className="text-brand-mid text-sm mt-1">Start managing your properties in minutes.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input required icon={User} label="Full name" placeholder="John Mukasa"
              value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            <Input required type="email" icon={Mail} label="Email address" placeholder="you@example.com"
              value={form.email} onChange={(e) => set("email", e.target.value)} />
            <Input required icon={Phone} label="Phone number" placeholder="+256 700 000 000"
              value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            <Input required type="password" icon={Lock} label="Password" placeholder="Min. 6 characters"
              value={form.password} onChange={(e) => set("password", e.target.value)} />
            <Input required type="password" icon={Lock} label="Confirm password" placeholder="Repeat password"
              value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 mt-2 rounded-xl text-[15px] shadow-md">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Create Account <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-brand-mid mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-teal font-semibold hover:underline">Sign in</Link>
          </p>
        </>
      )}

      {/* ── Step 2: Check Email ── */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="flex flex-col items-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-brand-tealLt flex items-center justify-center mb-4">
              <MailCheck size={30} className="text-brand-teal" />
            </div>
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight text-center">Check your email</h1>
            <p className="text-brand-mid text-sm mt-2 text-center max-w-[280px]">
              We sent a verification link to{" "}
              <strong className="text-brand-dark">{email}</strong>.{" "}
              Click the link to verify your account.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-sm text-brand-mid">
              Once verified, you can sign in to your account.
            </p>
            
            <Link
              to="/login"
              className="w-full btn-primary py-3 rounded-xl text-[15px] shadow-md inline-flex items-center justify-center gap-2"
            >
              Go to Sign In <ArrowRight size={16} />
            </Link>
            
            <div className="pt-2">
              <button onClick={() => setStep(1)}
                className="text-xs text-brand-mid hover:text-brand-dark underline underline-offset-2">
                Use a different email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}