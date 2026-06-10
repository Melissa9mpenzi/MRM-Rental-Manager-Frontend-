import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { Input } from "../../components/ui/Input";
import useAuthStore from "../../store/authStore";
import { pathAllowedForRole } from "../../config/access";
import { mustCompleteKycBeforeApp, postLoginDestination } from "../../lib/onboardingAuth";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const verifyTotpLogin = useAuthStore((s) => s.verifyTotpLogin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const from = location.state?.from?.pathname;
  const [totpStep, setTotpStep] = useState(null);
  const [totpCode, setTotpCode] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(postLoginDestination(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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
      const result = await login(data);
      if (result?.needsTotp) {
        setTotpStep({
          token: result.totpPendingToken,
          email: data.email,
        });
        toast("Enter the 6-digit code from your authenticator app.");
        return;
      }
      const user = useAuthStore.getState().user;
      toast.success("Welcome back!");
      goAfterLogin(user);
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
    }
  };

  const goAfterLogin = (loggedInUser) => {
    if (
      from &&
      pathAllowedForRole(from, loggedInUser?.role) &&
      from !== "/auth/kyc" &&
      !mustCompleteKycBeforeApp(loggedInUser)
    ) {
      navigate(from, { replace: true });
      return;
    }
    navigate(postLoginDestination(loggedInUser), { replace: true });
  };

  const onVerifyTotp = async (e) => {
    e.preventDefault();
    if (!totpStep?.token || totpCode.trim().length < 6) {
      toast.error("Enter your 6-digit code.");
      return;
    }
    try {
      await verifyTotpLogin({ totpPendingToken: totpStep.token, code: totpCode.trim() });
      toast.success("Welcome back!");
      goAfterLogin(useAuthStore.getState().user);
    } catch (err) {
      toast.error(err.message || "Invalid code.");
    }
  };

  if (totpStep) {
    return (
      <div className="card rounded-2xl p-6 shadow-card sm:p-8">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Shield size={24} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">Two-factor authentication</h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Enter the code from your authenticator app for {totpStep.email}
          </p>
        </div>
        <form onSubmit={onVerifyTotp} className="space-y-4">
          <Input
            label="Authenticator code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <button
            type="submit"
            disabled={isLoading || totpCode.length < 6}
            className="btn-primary w-full py-3 text-sm font-bold"
          >
            {isLoading ? "Verifying…" : "Verify and sign in"}
          </button>
          <button
            type="button"
            className="w-full text-xs font-semibold text-gray-400 hover:text-gray-700"
            onClick={() => {
              setTotpStep(null);
              setTotpCode("");
            }}
          >
            Back to sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-6 shadow-card sm:p-8">
      <div className="mb-5 text-center">
        <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">Welcome back</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">Sign in to RentDirect UG</p>
      </div>

      <SocialAuthButtons disabled={isLoading} />

      <div className="my-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-[11px] font-medium text-gray-400">or sign in with email</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          <div className="mt-1.5 text-right">
            <Link to="/forgot-password" className="text-[11px] font-semibold text-teal-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-sm font-bold"
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

      <div className="my-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-[11px] font-medium text-gray-400">New here?</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <Link
        to="/register"
        className="btn-outline flex w-full items-center justify-center py-2.5 text-sm font-bold"
      >
        Create a free account
      </Link>

      <p className="mt-4 text-center text-[11px] text-gray-400">
        <Link to="/auth/verify-otp" className="font-semibold text-teal-600 hover:underline">
          Try onboarding
        </Link>
        {" · "}
        <Link to="/" className="font-semibold text-gray-500 hover:text-gray-700">
          Home
        </Link>
      </p>
    </div>
  );
}
