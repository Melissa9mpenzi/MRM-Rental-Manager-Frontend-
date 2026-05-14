import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Building2, Briefcase, Shield } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";

const ROLES = [
  { id: "tenant", apiRole: "tenant", title: "Tenant", desc: "Find and rent", icon: User, accent: "from-sky-500/20 to-transparent" },
  { id: "landlord", apiRole: "landlord", title: "Landlord", desc: "List & manage", icon: Building2, accent: "from-brand-teal/20 to-transparent" },
  { id: "agent", apiRole: "staff", title: "Agent", desc: "Leads & clients", icon: Briefcase, accent: "from-violet-500/25 to-transparent" },
  {
    id: "admin",
    apiRole: null,
    title: "Admin",
    desc: "RentDirect only",
    icon: Shield,
    accent: "from-white/10 to-transparent",
    disabled: true,
  },
];

/**
 * Persist role via API (staff for “Agent” in UI), then send user to their dashboard.
 */
export default function SelectRolePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateProfileRemote = useAuthStore((s) => s.updateProfileRemote);
  const [busy, setBusy] = useState(false);

  const pick = async (apiRole, disabled) => {
    if (disabled || !apiRole) return;
    if (!isAuthenticated) {
      toast.error("Sign in first, then choose your role.");
      navigate("/login", { state: { from: { pathname: "/auth/select-role" } } });
      return;
    }
    setBusy(true);
    try {
      const user = await updateProfileRemote({ role: apiRole });
      toast.success("Role saved.");
      navigate(defaultDashboardPath(user.role), { replace: true });
    } catch (err) {
      toast.error(err.message || "Could not save role.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-glass animate-fade-in rounded-2xl border border-white/[0.1] p-4 shadow-card sm:p-5">
      <div className="mb-3 text-center sm:mb-4">
        <h1 className="text-lg font-bold text-white sm:text-xl">Select your role</h1>
        <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
          {isAuthenticated
            ? "This updates your account in the API and opens the right dashboard."
            : "Sign in to save your role to your account."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {ROLES.map(({ id, apiRole, title, desc, icon: Icon, accent, disabled }) => (
          <button
            key={id}
            type="button"
            disabled={disabled || busy}
            onClick={() => pick(apiRole, disabled)}
            className={`group flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition sm:p-3.5 ${
              disabled
                ? "cursor-not-allowed border-white/[0.06] bg-white/[0.02] opacity-55"
                : `border-white/[0.1] bg-gradient-to-br ${accent} hover:border-brand-teal/45 hover:shadow-glow`
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg border bg-white/[0.06] ${
                disabled ? "border-white/10 text-white/35" : "border-white/10 text-brand-teal"
              }`}
            >
              <Icon size={18} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-sm font-bold text-white">{title}</span>
                {disabled && (
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/50">
                    Invite
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[10px] leading-tight text-white/50 sm:text-[11px]">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] text-white/50 sm:text-xs">
        <Link to="/login" className="font-semibold text-brand-teal hover:underline">
          Sign in
        </Link>
        {" · "}
        <Link to="/register" className="font-semibold text-brand-teal hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
