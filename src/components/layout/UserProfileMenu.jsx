import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, UserCircle, ScrollText } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { profilePathForRole, settingsPathForRole } from "../../config/access";
import { userInitials } from "../../lib/userInitials";
import GovTopbarDropdown from "../government/GovTopbarDropdown";

function roleLabel(role) {
  switch (role) {
    case "system_admin":
      return "Global Administrator";
    case "gov_nira":
      return "NIRA Officer";
    case "gov_kcca":
      return "KCCA Officer";
    case "gov_ura":
      return "URA Officer";
    case "tenant":
      return "Tenant";
    case "staff":
    case "agent":
      return "Agent";
    case "landlord":
      return "Landlord";
    default:
      return "User";
  }
}

/**
 * Avatar + profile dropdown for all portal topbars.
 * variant: app | gov | sys
 */
export default function UserProfileMenu({
  variant = "app",
  subtitle,
  showName = true,
  extraLinks = [],
}) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "landlord";
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const profilePath = profilePathForRole(role);
  const settingsPath = settingsPathForRole(role);
  const initials = userInitials(user?.full_name);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    if (role?.startsWith("gov_") || role === "system_admin") {
      navigate("/government/login");
    } else {
      navigate("/login");
    }
  };

  const triggerClass =
    variant === "sys"
      ? "sys-topbar__profile"
      : variant === "gov"
        ? `gov-icon-btn ${open ? "gov-icon-btn--active" : ""}`
        : "relative flex h-9 w-9 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white";

  const avatarInner =
    variant === "gov" ? (
      <span className="gov-sidebar__avatar text-[10px]">{initials}</span>
    ) : (
      <span
        className={
          variant === "sys"
            ? "sys-topbar__profile-avatar"
            : "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal/40 to-sky-500/30 text-xs font-bold text-white ring-2 ring-white/10"
        }
      >
        {initials}
      </span>
    );

  const linkClass =
    variant === "app"
      ? "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/85 transition-colors hover:bg-white/[0.06] hover:text-[#00C896]"
      : "gov-topbar-menu__link";

  const dangerClass =
    variant === "app"
      ? "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
      : "gov-topbar-menu__link gov-topbar-menu__link--danger";

  const menu = (
    <>
      <div
        className={
          variant === "app"
            ? "border-b border-white/10 bg-white/[0.03] px-4 py-3"
            : "gov-topbar-menu__profile"
        }
      >
        <div className="flex items-center gap-3">
          <span
            className={
              variant === "app"
                ? "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal/40 to-sky-500/30 text-sm font-bold text-white ring-2 ring-white/10"
                : "flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-200"
            }
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{user?.full_name || "User"}</p>
            <p className="text-xs text-[#00C896]">{subtitle || roleLabel(role)}</p>
            <p className="mt-0.5 truncate text-[11px] text-white/45">{user?.email}</p>
          </div>
        </div>
      </div>
      {profilePath && (
        <Link to={profilePath} role="menuitem" className={linkClass} onClick={() => setOpen(false)}>
          <UserCircle size={16} />
          My profile
        </Link>
      )}
      <Link to={settingsPath} role="menuitem" className={linkClass} onClick={() => setOpen(false)}>
        <Settings size={16} />
        Settings
      </Link>
      {extraLinks.map((item) => (
        <Link key={item.to} to={item.to} role="menuitem" className={linkClass} onClick={() => setOpen(false)}>
          {item.icon ? <item.icon size={16} /> : null}
          {item.label}
        </Link>
      ))}
      <button type="button" role="menuitem" className={dangerClass} onClick={handleLogout}>
        <LogOut size={16} />
        Sign out
      </button>
    </>
  );

  const appPanel = open ? (
    <div
      role="menu"
      className="absolute right-0 top-[calc(100%+0.5rem)] z-[200] w-72 max-w-[calc(100vw-1.5rem)] animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-[#0f141c] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
    >
      {menu}
    </div>
  ) : null;

  if (variant === "gov") {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          className={triggerClass}
          title="Profile"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((o) => !o)}
        >
          {avatarInner}
        </button>
        <GovTopbarDropdown open={open} onClose={() => setOpen(false)}>
          {menu}
        </GovTopbarDropdown>
      </div>
    );
  }

  if (variant === "sys") {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          className={triggerClass}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {avatarInner}
          {showName && (
            <span className="hidden min-w-0 md:block">
              <span className="block truncate text-xs font-bold text-white">
                {user?.full_name || "Super Admin"}
              </span>
              <span className="block text-[10px] text-white/45">
                {subtitle || roleLabel(role)}
              </span>
            </span>
          )}
        </button>
        <GovTopbarDropdown open={open} onClose={() => setOpen(false)}>
          {menu}
        </GovTopbarDropdown>
      </div>
    );
  }

  return (
    <div className="relative z-50" ref={ref}>
      <button
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Profile menu"
        onClick={() => setOpen((o) => !o)}
      >
        {avatarInner}
      </button>
      {appPanel}
    </div>
  );
}
