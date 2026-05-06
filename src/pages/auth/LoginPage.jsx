import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { Input } from "../../components/ui/Input";
import useAuthStore from "../../store/authStore";
import mrmLogo from "../../assets/MRM-LOGO.png";

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const login     = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const from      = location.state?.from?.pathname || "/dashboard";

  // Handle verification success from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");
    const email = params.get("email");
    const error = params.get("error");
    const message = params.get("message");

    if (verified === "true") {
      toast.success("Email verified successfully! You can now sign in.");
      // Clear the query params
      navigate("/login", { replace: true, state: { email } });
    } else if (error === "token_expired") {
      toast.error("Verification link has expired. Please register again.");
      navigate("/login", { replace: true });
    } else if (error === "invalid_token") {
      toast.error("Invalid verification link.");
      navigate("/login", { replace: true });
    } else if (error === "account_not_found") {
      toast.error("Account not found. Please register.");
      navigate("/login", { replace: true });
    } else if (message === "already_verified") {
      toast.info("Email already verified. Please sign in.");
      navigate("/login", { replace: true });
    }
  }, [location.search, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: location.state?.email || new URLSearchParams(location.search).get("email") || "" },
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-brand-tealLt/60 p-8 md:p-10">
      {/* Logo and Heading */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
            <img src={mrmLogo} alt="MRM" className="h-10 w-auto object-contain" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Welcome back</h1>
        <p className="text-brand-mid text-sm mt-1">Sign in to manage your properties</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
          })}
        />

        <div>
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Your password"
            required
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-xs text-brand-teal font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 text-[15px] mt-2 rounded-xl shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              Sign in <ArrowRight size={16} />
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-brand-tealLt" />
        <span className="text-xs text-brand-mid font-medium">New to MRM?</span>
        <div className="flex-1 h-px bg-brand-tealLt" />
      </div>

      <Link
        to="/register"
        className="w-full btn-outline py-2.5 text-sm flex items-center justify-center rounded-xl"
      >
        Create a free account
      </Link>
    </div>
  );
}