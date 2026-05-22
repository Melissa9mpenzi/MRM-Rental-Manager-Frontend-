import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Bell,
  MessageSquare,
  Globe,
  Moon,
  Menu,
  Crown,
  LogOut,
  LayoutGrid,
  Shield,
  User,
  Settings,
  ScrollText,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { navItemsForRole } from "../../config/governmentAccess";
import { governmentApi } from "../../api/governmentApi";
import GovCommandPalette from "../government/GovCommandPalette";
import GovTopbarDropdown from "../government/GovTopbarDropdown";

function formatNow() {
  const d = new Date();
  return `${d.toLocaleDateString("en-UG", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}, ${d.toLocaleTimeString("en-UG", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function SystemTopbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const role = user?.role || "system_admin";
  const onGovPortal = pathname.startsWith("/government");

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: alerts = [] } = useQuery({
    queryKey: ["gov-fraud", "all"],
    queryFn: () => governmentApi.fraudAlerts(),
    enabled: onGovPortal,
    staleTime: 60_000,
  });

  const notifCount = onGovPortal ? Math.min(99, alerts.length || 0) : 12;
  const govNav = navItemsForRole(role);

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

  const handleLogout = async () => {
    await logout();
    navigate(onGovPortal ? "/government/login" : "/login");
  };

  return (
    <>
      <header className="sys-topbar shrink-0 border-b border-white/10 bg-[#0b0e14]/95 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-5">
          <button type="button" className="gov-icon-btn lg:hidden" onClick={onMenuClick} aria-label="Toggle menu">
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1 lg:max-w-[280px]">
            <h1 className="truncate text-base font-bold text-white">
              Welcome back, {user?.full_name?.split(" ")[0] || "Super Admin"} 👋
            </h1>
            <p className="truncate text-[11px] text-white/45">
              {onGovPortal
                ? "Government portal — full agency oversight"
                : "You have full control over the entire RentDirect UG Platform."}
            </p>
          </div>

          <button
            type="button"
            className="gov-topbar__search order-last w-full md:order-none md:max-w-md md:flex-1"
            onClick={openPalette}
            aria-label="Open search"
          >
            <Search size={14} className="text-white/40" />
            <span className="text-white/45">
              {onGovPortal ? "Search government modules…" : "Search anything… (Users, Properties, Contracts)"}
            </span>
            <kbd>Ctrl K</kbd>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onGovPortal && (
              <div className="relative">
                <button
                  type="button"
                  className={`gov-icon-btn hidden sm:flex ${modulesOpen ? "gov-icon-btn--active" : ""}`}
                  title="Modules"
                  onClick={() => {
                    setModulesOpen((o) => !o);
                    setNotifOpen(false);
                    setProfileOpen(false);
                  }}
                >
                  <LayoutGrid size={18} />
                </button>
                <GovTopbarDropdown open={modulesOpen} onClose={() => setModulesOpen(false)}>
                  <p className="gov-topbar-menu__title">Government modules</p>
                  {govNav.map((item) => (
                    <Link key={item.id} to={item.path} className="gov-topbar-menu__link" onClick={() => setModulesOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </GovTopbarDropdown>
              </div>
            )}

            <div className="relative">
              <button
                type="button"
                className={`gov-icon-btn relative ${notifOpen ? "gov-icon-btn--active" : ""}`}
                title="Notifications"
                onClick={() => {
                  if (onGovPortal) {
                    setNotifOpen((o) => !o);
                    setModulesOpen(false);
                    setProfileOpen(false);
                  } else {
                    navigate("/system/dashboard");
                  }
                }}
              >
                <Bell size={18} />
                {notifCount > 0 && <span className="gov-icon-btn__badge">{notifCount > 9 ? "9+" : notifCount}</span>}
              </button>
              {onGovPortal && (
                <GovTopbarDropdown open={notifOpen} onClose={() => setNotifOpen(false)} className="gov-topbar-menu--wide">
                  <p className="gov-topbar-menu__title">Notifications</p>
                  {alerts.length === 0 && <p className="gov-topbar-menu__empty">No active alerts.</p>}
                  {alerts.slice(0, 5).map((a) => (
                    <button
                      key={a.id}
                      type="button"
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
                  <Link to="/government/fraud" className="gov-topbar-menu__footer" onClick={() => setNotifOpen(false)}>
                    Fraud center →
                  </Link>
                </GovTopbarDropdown>
              )}
            </div>

            {!onGovPortal && (
              <button type="button" className="gov-icon-btn relative" title="Messages" onClick={() => navigate("/system/support")}>
                <MessageSquare size={18} />
                <span className="gov-icon-btn__badge">8</span>
              </button>
            )}

            {onGovPortal ? (
              <button type="button" className="gov-icon-btn" title="Audit & security" onClick={() => navigate("/government/audit")}>
                <Shield size={18} />
              </button>
            ) : (
              <>
                <button type="button" className="gov-icon-btn hidden sm:flex" title="Language" aria-label="Language">
                  <Globe size={18} />
                </button>
                <button type="button" className="gov-icon-btn hidden sm:flex" title="Theme" aria-label="Theme">
                  <Moon size={18} />
                </button>
              </>
            )}

            <span
              className="hidden items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-amber-200 lg:flex"
              title="Super Admin"
            >
              <Crown size={16} />
            </span>

            <div className="relative">
              <button
                type="button"
                className={`gov-icon-btn ${profileOpen ? "gov-icon-btn--active" : ""}`}
                title="Profile"
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
                  <p className="font-semibold text-white">{user?.full_name}</p>
                  <p className="text-xs text-amber-300/90">Super Admin</p>
                </div>
                {onGovPortal ? (
                  <>
                    <Link to="/government/settings" className="gov-topbar-menu__link" onClick={() => setProfileOpen(false)}>
                      <Settings size={16} />
                      Government settings
                    </Link>
                    <Link to="/government/audit" className="gov-topbar-menu__link" onClick={() => setProfileOpen(false)}>
                      <ScrollText size={16} />
                      Audit logs
                    </Link>
                  </>
                ) : (
                  <Link to="/system/settings" className="gov-topbar-menu__link" onClick={() => setProfileOpen(false)}>
                    <Settings size={16} />
                    System settings
                  </Link>
                )}
                <button type="button" className="gov-topbar-menu__link gov-topbar-menu__link--danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  Sign out
                </button>
              </GovTopbarDropdown>
            </div>

            <span className="hidden text-[10px] text-white/50 xl:inline">{formatNow()}</span>
            <button type="button" onClick={handleLogout} className="gov-icon-btn lg:hidden" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <GovCommandPalette
        open={paletteOpen}
        onClose={closePalette}
        role={role}
      />
    </>
  );
}
