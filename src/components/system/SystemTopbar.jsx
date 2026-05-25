import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Search,
  Bell,
  MessageSquare,
  Moon,
  Menu,
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
import { platformApi } from "../../api/platformApi";
import GovCommandPalette from "../government/GovCommandPalette";
import GovTopbarDropdown from "../government/GovTopbarDropdown";

function initials(name) {
  return (name || "SA")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SystemTopbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const role = user?.role || "system_admin";
  const onGovPortal = pathname.startsWith("/government");
  const onSystemPortal = pathname.startsWith("/system");

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

  const { data: sysStatus } = useQuery({
    queryKey: ["platform-system-status"],
    queryFn: () => platformApi.systemStatus(),
    enabled: onSystemPortal,
    staleTime: 30_000,
  });

  const operational =
    sysStatus?.status === "operational" ||
    sysStatus?.all_systems_operational !== false ||
    !sysStatus?.status;

  const notifCount = onGovPortal ? Math.min(99, alerts.length || 0) : Math.min(99, sysStatus?.alert_count ?? 12);
  const msgCount = 5;
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

  if (onSystemPortal) {
    return (
      <>
        <header className="sys-topbar sys-topbar--console shrink-0">
          <button type="button" className="gov-icon-btn lg:hidden" onClick={onMenuClick} aria-label="Toggle menu">
            <Menu size={20} />
          </button>

          <button
            type="button"
            className="sys-topbar__search-center"
            onClick={openPalette}
            aria-label="Open search"
          >
            <Search size={15} className="text-white/35" />
            <span>Search anything… (users, properties, payments…)</span>
            <kbd>⌘K</kbd>
          </button>

          <div
            className={`sys-status-pill ${operational ? "sys-status-pill--ok" : "sys-status-pill--warn"}`}
            title="Platform status"
          >
            <span className="sys-status-pill__dot" />
            Global System Status: {operational ? "All Systems Operational" : "Degraded"}
          </div>

          <div className="sys-topbar__actions">
            <button type="button" className="gov-icon-btn" title="Search" onClick={openPalette}>
              <Search size={18} />
            </button>
            <button
              type="button"
              className="gov-icon-btn relative"
              title="Messages"
              onClick={() => navigate("/system/messages")}
            >
              <MessageSquare size={18} />
              {msgCount > 0 && <span className="gov-icon-btn__badge">{msgCount}</span>}
            </button>
            <button
              type="button"
              className={`gov-icon-btn relative ${notifOpen ? "gov-icon-btn--active" : ""}`}
              title="Notifications"
              onClick={() => {
                setNotifOpen((o) => !o);
                setProfileOpen(false);
              }}
            >
              <Bell size={18} />
              {notifCount > 0 && (
                <span className="gov-icon-btn__badge">{notifCount > 99 ? "99+" : notifCount}</span>
              )}
            </button>
            <button
              type="button"
              className="gov-icon-btn"
              title="Theme"
              onClick={() => toast("Dark theme active.", { icon: "🌙" })}
            >
              <Moon size={18} />
            </button>

            <button
              type="button"
              className="sys-topbar__profile"
              onClick={() => {
                setProfileOpen((o) => !o);
                setNotifOpen(false);
              }}
            >
              <span className="sys-topbar__profile-avatar">{initials(user?.full_name)}</span>
              <span className="hidden min-w-0 md:block">
                <span className="block truncate text-xs font-bold text-white">{user?.full_name || "Super Admin"}</span>
                <span className="block text-[10px] text-white/45">Global Administrator</span>
              </span>
            </button>
            <GovTopbarDropdown open={profileOpen} onClose={() => setProfileOpen(false)}>
              <div className="gov-topbar-menu__profile">
                <p className="font-semibold text-white">{user?.full_name}</p>
                <p className="text-xs text-emerald-400/90">Global Administrator</p>
              </div>
              <Link to="/system/settings" className="gov-topbar-menu__link" onClick={() => setProfileOpen(false)}>
                <Settings size={16} />
                System settings
              </Link>
              <Link to="/government/audit" className="gov-topbar-menu__link" onClick={() => setProfileOpen(false)}>
                <ScrollText size={16} />
                Audit logs
              </Link>
              <button type="button" className="gov-topbar-menu__link gov-topbar-menu__link--danger" onClick={handleLogout}>
                <LogOut size={16} />
                Sign out
              </button>
            </GovTopbarDropdown>
          </div>
        </header>
        <GovCommandPalette open={paletteOpen} onClose={closePalette} role={role} />
      </>
    );
  }

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
              {onGovPortal ? "Government portal — full agency oversight" : "RentDirect UG platform"}
            </p>
          </div>
          <button type="button" className="gov-topbar__search order-last w-full md:order-none md:max-w-md md:flex-1" onClick={openPalette}>
            <Search size={14} className="text-white/40" />
            <span className="text-white/45">{onGovPortal ? "Search government modules…" : "Search…"}</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button type="button" className={`gov-icon-btn relative ${notifOpen ? "gov-icon-btn--active" : ""}`} onClick={() => setNotifOpen((o) => !o)}>
              <Bell size={18} />
              {notifCount > 0 && <span className="gov-icon-btn__badge">{notifCount}</span>}
            </button>
            <button type="button" className={`gov-icon-btn ${profileOpen ? "gov-icon-btn--active" : ""}`} onClick={() => setProfileOpen((o) => !o)}>
              <User size={18} />
            </button>
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
