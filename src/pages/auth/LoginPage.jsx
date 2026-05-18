import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "../../components/ui/Input";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath, pathAllowedForRole } from "../../config/access";
import { postLoginDestination } from "../../lib/onboardingAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const from = location.state?.from?.pathname;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");
    const email = params.get("email");
    const error = params.get("error");
    const message = params.get("message");

    if (verified === "true") {
      toast.success("Email verified successfully! You can now sign in.");
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
      toast("Email already verified. Please sign in.");
      navigate("/login", { replace: true });
    }
  }, [location.search, navigate]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { email: location.state?.email || new URLSearchParams(location.search).get("email") || "" },
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      const user = useAuthStore.getState().user;
      const next = postLoginDestination(user);
      const home = defaultDashboardPath(user?.role);
      const needsOnboarding = next !== home;
      if (!needsOnboarding && from && pathAllowedForRole(from, user?.role)) {
        toast.success("Welcome back!");
        navigate(from, { replace: true });
        return;
      }
      if (from && needsOnboarding) toast.success("Welcome back! Complete the next step to continue.");
      else toast.success("Welcome back!");
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
    }
  };

  return (
    <div className="card-glass rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-3 text-center">
        <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Welcome back</h1>
        <p className="mt-0.5 text-xs text-white/55 sm:text-sm">Sign in to RentDirect UG</p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] py-2 text-[10px] font-semibold text-white/35 sm:text-xs"
        >
          Google <span className="text-white/25">· soon</span>
        </button>
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] py-2 text-[10px] font-semibold text-white/35 sm:text-xs"
        >
          Apple <span className="text-white/25">· soon</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
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
          <div className="mt-1 text-right">
            <Link to="/forgot-password" className="text-[11px] font-semibold text-brand-teal hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full rounded-xl py-2.5 text-sm font-bold shadow-md hover:shadow-lg sm:py-3"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign in <ArrowRight size={15} />
            </span>
          )}
        </button>
      </form>

      <div className="my-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-medium text-white/45">New here?</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Link to="/register" className="btn-outline flex w-full items-center justify-center rounded-xl py-2 text-xs font-bold sm:text-sm">
        Create a free account
      </Link>

      <p className="mt-3 text-center text-[10px] text-white/45 sm:text-xs">
        <Link to="/auth/verify-otp" className="font-semibold text-brand-teal hover:underline">
          Try onboarding
        </Link>
        {" · "}
        <Link to="/" className="font-semibold text-white/55 hover:text-white">
          Home
        </Link>
      </p>
    </div>
  );
}
