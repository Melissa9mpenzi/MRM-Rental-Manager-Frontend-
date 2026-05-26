import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Shield,
  LogOut,
  LayoutGrid,
  Menu,
  ChevronDown,
  ScrollText,
  Settings,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import {
  governmentAgencyForRole,
  isSystemAdministrator,
  navItemsForRole,
} from "../../config/governmentAccess";
import { AGENCY_HOME_PATH, AGENCY_LABELS } from "../../config/govTopbarConfig";
import { governmentApi } from "../../api/governmentApi";
import NotificationBell from "../layout/NotificationBell";
import UserProfileMenu from "../layout/UserProfileMenu";
import GovCommandPalette from "./GovCommandPalette";
import GovTopbarDropdown from "./GovTopbarDropdown";

function formatToday() {
  return new Date().toLocaleDateString("en-UG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function roleLabel(role) {
  if (role === "system_admin") return "Super Admin";
  if (role === "gov_nira") return "NIRA Officer";
  if (role === "gov_kcca") return "KCCA Officer";
  if (role === "gov_ura") return "URA Officer";
  return "Government Officer";
}

export default function GovTopbar({ role, systemStatus, onMenuClick }) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const agency = governmentAgencyForRole(role);
  const isAdmin = isSystemAdministrator(role);
  const navItems = navItemsForRole(role);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [agencyView, setAgencyView] = useState(agency || "all");

  const { data: alerts = [] } = useQuery({
    queryKey: ["gov-fraud", agency],
    queryFn: () => governmentApi.fraudAlerts(),
    staleTime: 60_000,
  });

  const { data: overview } = useQuery({
    queryKey: ["gov-overview", agency],
    queryFn: () => governmentApi.overview(),
    staleTime: 60_000,
  });

  const govBadgeExtra = Math.max(
    0,
    Number(overview?.pending_kyc || 0) + Number(overview?.pending_inspections || 0)
  );
  const govAlertItems = (alerts || []).map((a) => ({
    ...a,
    to: "/government/fraud",
  }));

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setAgencyView(agency || "all");
  }, [agency]);

  const handleLogout = async () => {
    await logout();
    navigate("/government/login");
  };

  const handleAgencyChange = (e) => {
    const next = e.target.value;
    setAgencyView(next);
    const path = AGENCY_HOME_PATH[next] || AGENCY_HOME_PATH.all;
    navigate(path);
  };

  const closeMenus = () => {
    setModulesOpen(false);
  };

  const agencyLabel = AGENCY_LABELS[agencyView] || AGENCY_LABELS[agency] || AGENCY_LABELS.all;

  return (
    <>
      <header className="gov-topbar">
        <div className="gov-topbar__row gov-topbar__row--title">
          <button
            type="button"
            className="gov-icon-btn lg:hidden"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
          <div className="gov-topbar__titles min-w-0 flex-1 lg:hidden">
            <h1 className="truncate text-base font-bold text-white">Government Dashboard</h1>
            <p className="text-[11px] text-white/45">National Rental Infrastructure System</p>
          </div>
          <label className="gov-topbar__agency-select">
            <span className="sr-only">Agency</span>
            <select
              value={isAdmin ? agencyView : agency}
              onChange={handleAgencyChange}
              disabled={!isAdmin}
              aria-label="Agency context"
            >
              {isAdmin ? (
                <>
                  <option value="all">{AGENCY_LABELS.all}</option>
                  <option value="nira">{AGENCY_LABELS.nira}</option>
                  <option value="kcca">{AGENCY_LABELS.kcca}</option>
                  <option value="ura">{AGENCY_LABELS.ura}</option>
                </>
              ) : (
                <option value={agency}>{agencyLabel}</option>
              )}
            </select>
            <ChevronDown size={16} className="gov-topbar__agency-chevron pointer-events-none" aria-hidden />
          </label>
        </div>

        <div className="gov-topbar__row gov-topbar__row--actions">
          <button
            type="button"
            className="gov-topbar__search hidden md:flex"
            onClick={openPalette}
            aria-label="Open search"
          >
            <Search size={14} className="text-white/40" />
            <span className="text-white/45">Search anything…</span>
            <kbd>Ctrl K</kbd>
          </button>

          <div className="gov-topbar__date hidden xl:block">
            <div>{formatToday()}</div>
            <div className="mt-0.5 flex items-center justify-end text-[10px] text-emerald-400/90">
              <span className="gov-topbar__status-dot" />
              {systemStatus === "operational" ? "All systems operational" : "Degraded mode"}
            </div>
          </div>

          <div className="gov-topbar__icons">
            <div className="relative">
              <button
                type="button"
                className={`gov-icon-btn hidden sm:flex ${modulesOpen ? "gov-icon-btn--active" : ""}`}
                title="Modules"
                aria-expanded={modulesOpen}
                aria-haspopup="menu"
                onClick={() => setModulesOpen((o) => !o)}
              >
                <LayoutGrid size={18} />
              </button>
              <GovTopbarDropdown open={modulesOpen} onClose={() => setModulesOpen(false)}>
                <p className="gov-topbar-menu__title">Go to module</p>
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    role="menuitem"
                    className="gov-topbar-menu__link"
                    onClick={() => setModulesOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </GovTopbarDropdown>
            </div>

            <NotificationBell
              variant="gov"
              govAlerts={govAlertItems}
              govBadgeExtra={govBadgeExtra}
              onOpenChange={() => setModulesOpen(false)}
            />

            <button
              type="button"
              className="gov-icon-btn"
              title="Audit & security"
              onClick={() => {
                closeMenus();
                navigate("/government/audit");
              }}
            >
              <Shield size={18} />
            </button>

            <UserProfileMenu
              variant="gov"
              subtitle={roleLabel(role)}
              showName={false}
              extraLinks={[
                { to: "/government/audit", label: "My activity (audit)", icon: ScrollText },
              ]}
            />

            <button type="button" onClick={handleLogout} className="gov-icon-btn lg:hidden" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <GovCommandPalette open={paletteOpen} onClose={closePalette} role={role} />
    </>
  );
}
