import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, CreditCard,
  BarChart2, Settings, LogOut, X, Wrench,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import mrmLogo from "../../assets/MRM-LOGO.png";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard",       icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/properties",      icon: Building2,  label: "Properties" },
      { to: "/tenants",         icon: Users,      label: "Tenants" },
      { to: "/payments",        icon: CreditCard, label: "Payments" },
      { to: "/maintenance",     icon: Wrench,     label: "Maintenance" },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/reports/arrears", icon: BarChart2,  label: "Arrears Report" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/settings",        icon: Settings,   label: "Settings" },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-gradient-to-b from-[#161d23] to-[#1e2a33]
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center">
              <img src={mrmLogo} alt="MRM" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <div className="text-white font-bold text-base tracking-tight leading-none">MRM</div>
              <div className="text-brand-teal text-[10px] font-semibold tracking-wide">RENTAL MANAGER</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 group
                      ${isActive
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
                        : "text-white/55 hover:text-white hover:bg-white/8"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={17}
                          className={`flex-shrink-0 transition-colors ${isActive ? "text-brand-teal" : "group-hover:text-white/80"}`}
                        />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-teal flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ring-2 ring-brand-teal/30">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-bold truncate">{user?.full_name}</div>
              <div className="text-white/40 text-[11px] truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 text-sm font-semibold transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}