import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  DollarSign,
  Info,
  Mail,
  LogIn,
  UserPlus,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import mrmLogo from "../../assets/MRM-LOGO.png";
import useAuthStore from "../../store/authStore";

const ACCENT = "#10B981";

const LINKS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/browse-properties", label: "Browse Properties", icon: Search },
  { to: "/pricing", label: "Pricing", icon: DollarSign },
  { to: "/about", label: "About Us", icon: Info },
  { to: "/contact", label: "Contact", icon: Mail },
];

function isBrowseOrListingPath(pathname) {
  return pathname.startsWith("/browse-properties") || pathname.startsWith("/property/");
}

export default function MarketingSidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const hideDashboardHere = isAuthed && isBrowseOrListingPath(location.pathname);

  const close = () => setMobileOpen?.(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/browse-properties");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh w-64 min-h-0 flex-col border-r border-white/[0.08]
          bg-gradient-to-b from-[#0c1219] to-[#060a0e] transition-transform duration-300 ease-out
          lg:static lg:h-full lg:max-h-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex shrink-0 items-center justify-end border-b border-white/[0.06] px-2 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="shrink-0 border-b border-white/[0.08] px-4 py-5">
          <Link to="/" className="flex items-center gap-3" onClick={close}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06]">
              <img src={mrmLogo} alt="" className="h-6 w-auto opacity-95" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white">
                RentDirect <span style={{ color: ACCENT }}>UG</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Public site</div>
            </div>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-panel-y px-2 py-4">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Explore</div>
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "border border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                    : "border border-transparent text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              <Icon size={17} className="flex-shrink-0 opacity-80" />
              {label}
            </NavLink>
          ))}

          <div className="mt-6 px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Account</div>
          {isAuthed && !hideDashboardHere ? (
            <Link
              to="/dashboard"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            >
              <LayoutDashboard size={17} />
              Dashboard
            </Link>
          ) : null}
          {isAuthed && hideDashboardHere ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut size={17} />
              Sign out
            </button>
          ) : null}
          {!isAuthed ? (
            <>
              <Link
                to="/login"
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                <LogIn size={17} />
                Login
              </Link>
              <Link
                to="/register"
                onClick={close}
                className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#041208] transition hover:brightness-110"
                style={{ backgroundColor: ACCENT }}
              >
                <UserPlus size={17} />
                Register
              </Link>
            </>
          ) : null}
        </nav>

        <div className="shrink-0 border-t border-white/[0.08] px-4 py-4 text-[10px] text-white/35">
          © {new Date().getFullYear()} RentDirect UG
        </div>
      </aside>
    </>
  );
}

/** Top bar for marketing pages (mobile menu + optional title slot) */
export function MarketingTopBar({ title, onMenu }) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[#060a0e]/90 px-4 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onMenu}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 hover:bg-white/10"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      {title && <span className="truncate text-sm font-bold text-white">{title}</span>}
    </header>
  );
}
