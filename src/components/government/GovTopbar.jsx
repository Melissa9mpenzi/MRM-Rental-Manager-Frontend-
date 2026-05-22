import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Bell,
  Shield,
  User,
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  const notifCount = Math.min(99, (alerts?.length || 0) + (overview?.pending_kyc || 0) + (overview?.pending_inspections || 0));

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
    setProfileOpen(false);
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
    setNotifOpen(false);
    setProfileOpen(false);
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
                onClick={() => {
                  setModulesOpen((o) => !o);
                  setNotifOpen(false);
                  setProfileOpen(false);
                }}
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

            <div className="relative">
              <button
                type="button"
                className={`gov-icon-btn ${notifOpen ? "gov-icon-btn--active" : ""}`}
                title="Notifications"
                aria-expanded={notifOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setModulesOpen(false);
                  setProfileOpen(false);
                }}
              >
                <Bell size={18} />
                {notifCount > 0 && (
                  <span className="gov-icon-btn__badge">{notifCount > 9 ? "9+" : notifCount}</span>
                )}
              </button>
              <GovTopbarDropdown open={notifOpen} onClose={() => setNotifOpen(false)} className="gov-topbar-menu--wide">
                <p className="gov-topbar-menu__title">Notifications</p>
                {alerts.length === 0 && (
                  <p className="gov-topbar-menu__empty">No active alerts right now.</p>
                )}
                {alerts.slice(0, 6).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="menuitem"
                    className="gov-topbar-menu__alert"
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/government/fraud");
                    }}
                  >
                    <span className={`gov-topbar-menu__dot gov-topbar-menu__dot--${a.severity}`} />
                    <span>
                      <span className="block font-medium text-white/90">{a.title}</span>
                      <span className="block text-[11px] text-white/50">{a.subject}</span>
                    </span>
                  </button>
                ))}
                <Link
                  to="/government/fraud"
                  className="gov-topbar-menu__footer"
                  onClick={() => setNotifOpen(false)}
                >
                  View fraud center →
                </Link>
              </GovTopbarDropdown>
            </div>

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

            <div className="relative">
              <button
                type="button"
                className={`gov-icon-btn ${profileOpen ? "gov-icon-btn--active" : ""}`}
                title="Profile"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setModulesOpen(false);
                  setNotifOpen(false);
                }}
              >
                <User size={18} />
              </button>
              <GovTopbarDropdown open={profileOpen} onClose={() => setProfileOpen(false)}>
                <div className="gov-topbar-menu__profile">
                  <p className="font-semibold text-white">{user?.full_name || "Officer"}</p>
                  <p className="text-xs text-emerald-400/90">{roleLabel(role)}</p>
                  <p className="mt-1 text-[11px] text-white/45">{user?.email}</p>
                </div>
                <Link
                  to="/government/settings"
                  role="menuitem"
                  className="gov-topbar-menu__link"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={16} />
                  Portal settings
                </Link>
                <Link
                  to="/government/audit"
                  role="menuitem"
                  className="gov-topbar-menu__link"
                  onClick={() => setProfileOpen(false)}
                >
                  <ScrollText size={16} />
                  My activity (audit)
                </Link>
                <button type="button" role="menuitem" className="gov-topbar-menu__link gov-topbar-menu__link--danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  Sign out
                </button>
              </GovTopbarDropdown>
            </div>

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
