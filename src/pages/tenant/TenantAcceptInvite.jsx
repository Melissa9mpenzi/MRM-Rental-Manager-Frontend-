import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Home } from "lucide-react";
import toast from "react-hot-toast";
import mrmLogo from "../../assets/MRM-LOGO.png";

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
      const response = await fetch(
        `http://localhost:8000/api/v1/tenant/invite/verify?token=${token}`
      );
      const data = await response.json();

      if (response.ok && data.valid) {
        setInviteValid(true);
        setInviteData(data);
      } else {
        toast.error(data.detail || "Invalid or expired invite link.");
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
      const response = await fetch(
        "http://localhost:8000/api/v1/tenant/invite/accept",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully! Please log in.");
        navigate("/login");
      } else {
        toast.error(data.detail || "Failed to create account.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invite</h2>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired. Please contact your landlord for a new invite.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-teal text-white rounded-xl font-medium hover:bg-brand-teal/90 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={mrmLogo}
          alt="MRM"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
                <Home className="w-8 h-8 text-brand-teal" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Accept Your Invitation</h1>
            <p className="text-gray-600 mt-2">
              Create your tenant account for {inviteData?.full_name}
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Invitation Verified</p>
                <p className="text-sm text-green-700 mt-1">
                  Welcome! Set your password to access your tenant portal.
                </p>
              </div>
            </div>
          </div>

          {/* Email Display */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Email address</p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleAcceptInvite} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all"
                  placeholder="Min. 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition-all"
                  placeholder="Repeat password"
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 bg-brand-teal text-white rounded-xl font-medium hover:bg-brand-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating Account...
                </span>
              ) : (
                "Create Account & Access Portal"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-teal font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TenantAcceptInvite;
