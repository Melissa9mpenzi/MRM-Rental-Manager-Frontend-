import { Search, Bell, Shield, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { governmentAgencyForRole } from "../../config/governmentAccess";
import GovAgencyLogos from "./GovAgencyLogos";

const AGENCY_LABELS = {
  all: "All Agencies",
  nira: "NIRA — Identity",
  kcca: "KCCA — Property",
  ura: "URA — Tax",
};

function formatToday() {
  return new Date().toLocaleDateString("en-UG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GovTopbar({ role, systemStatus }) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const agency = governmentAgencyForRole(role);

  const handleLogout = async () => {
    await logout();
    navigate("/government/login");
  };

  return (
    <header className="gov-topbar flex shrink-0 flex-col gap-3 border-b border-white/10 px-5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">Government Dashboard</h1>
          <p className="text-[11px] text-white/45">National Rental Infrastructure System</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85"
            defaultValue={agency}
            disabled={agency !== "all"}
          >
            <option value={agency}>{AGENCY_LABELS[agency] || AGENCY_LABELS.all}</option>
            {agency === "all" && (
              <>
                <option value="nira">{AGENCY_LABELS.nira}</option>
                <option value="kcca">{AGENCY_LABELS.kcca}</option>
                <option value="ura">{AGENCY_LABELS.ura}</option>
              </>
            )}
          </select>

          <div className="gov-topbar__search hidden md:flex">
            <Search size={14} className="text-white/40" />
            <input type="search" placeholder="Search records" aria-label="Search" />
            <kbd>Ctrl K</kbd>
          </div>

          <div className="gov-topbar__date hidden lg:block">
            <div>{formatToday()}</div>
            <div className="mt-0.5 flex items-center justify-end text-[10px] text-emerald-400/90">
              <span className="gov-topbar__status-dot" />
              {systemStatus === "operational" ? "All systems operational" : "Degraded mode"}
            </div>
          </div>

          <button type="button" className="gov-icon-btn" title="Notifications">
            <Bell size={18} />
            <span className="gov-icon-btn__badge">12</span>
          </button>
          <button type="button" className="gov-icon-btn" title="Security">
            <Shield size={18} />
          </button>
          <button type="button" className="gov-icon-btn" title="Profile">
            <User size={18} />
          </button>
          <button type="button" onClick={handleLogout} className="gov-icon-btn" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <GovAgencyLogos />
    </header>
  );
}
