import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  X,
  Search,
  MessageSquare,
  FileText,
  UserCircle,
  Heart,
  ClipboardList,
  Wallet,
  Bell,
  UserPlus,
  LineChart,
  PieChart,
  Target,
  Calendar,
  Briefcase,
  Coins,
  Plus,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import BrandMark from "../brand/BrandMark";
import {
  getSuiSidebarItems,
  SUI_SIDEBAR_EXTERNAL,
  isSuiRoute,
} from "../../config/suiSidebarNav";
import { API_ROLES } from "../../config/access";

const LANDLORD_NAV = [
  { to: "/landlord/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/landlord/properties", icon: Building2, label: "Properties" },
  { to: "/landlord/properties/new", icon: Plus, label: "Add property" },
  { to: "/landlord/applicants", icon: UserPlus, label: "Applicants" },
  { to: "/landlord/tenants", icon: Users, label: "Tenants" },
  { to: "/landlord/contracts", icon: FileText, label: "Contracts" },
  { to: "/landlord/payments", icon: CreditCard, label: "Payments" },
  { to: "/landlord/receipts", icon: FileText, label: "Receipts" },
  { to: "/landlord/analytics", icon: LineChart, label: "Analytics" },
  { to: "/landlord/reports", icon: PieChart, label: "Reports" },
  { to: "/landlord/messages", icon: MessageSquare, label: "Rental Hub" },
  { to: "/landlord/notifications", icon: Bell, label: "Notifications" },
  { to: "/landlord/wallet", icon: Wallet, label: "Wallet" },
  { to: "/landlord/profile", icon: UserCircle, label: "Profile" },
  { to: "/landlord/settings", icon: Settings, label: "Settings" },
];

const TENANT_NAV = [
  { to: "/tenant/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/browse-properties", icon: Search, label: "Search Properties" },
  { to: "/tenant/saved", icon: Heart, label: "Saved properties" },
  { to: "/tenant/applications", icon: ClipboardList, label: "Applications" },
  { to: "/tenant/contract", icon: FileText, label: "Lease contracts" },
  { to: "/tenant/pay", icon: CreditCard, label: "Payments" },
  { to: "/tenant/receipts", icon: FileText, label: "Receipts" },
  { to: "/tenant/wallet", icon: Wallet, label: "Wallet" },
  { to: "/tenant/messages", icon: MessageSquare, label: "Rental Hub" },
  { to: "/tenant/notifications", icon: Bell, label: "Notifications" },
  { to: "/tenant/profile", icon: UserCircle, label: "Profile" },
  { to: "/tenant/settings", icon: Settings, label: "Settings" },
];

const AGENT_NAV = [
  { to: "/agent/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/agent/leads", icon: Target, label: "Leads" },
  { to: "/agent/clients", icon: Users, label: "Clients" },
  { to: "/browse-properties", icon: Building2, label: "Properties" },
  { to: "/agent/schedules", icon: Calendar, label: "Schedules" },
  { to: "/agent/deals", icon: Briefcase, label: "Deals" },
  { to: "/agent/commissions", icon: Coins, label: "Commissions" },
  { to: "/agent/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/agent/workspace", icon: Briefcase, label: "Operations" },
  { to: "/agent/messages", icon: MessageSquare, label: "Rental Hub" },
  { to: "/agent/notifications", icon: Bell, label: "Notifications" },
  { to: "/agent/profile", icon: UserCircle, label: "Profile" },
  { to: "/agent/settings", icon: Settings, label: "Settings" },
];

const ADMIN_CONSOLE_LINK = {
  to: "/system/dashboard",
  icon: LayoutDashboard,
  label: "Admin console",
};

function navForRole(role, pathname) {
  if (role === API_ROLES.system_admin && isSuiRoute(pathname)) {
    return [ADMIN_CONSOLE_LINK];
  }
  if (role === "tenant") return TENANT_NAV;
  if (role === "staff" || role === "agent") return AGENT_NAV;
  return LANDLORD_NAV;
}

function navLinkClass(isActive, variant = "default") {
  if (variant === "sui") {
    return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group ${
      isActive
        ? "bg-violet-50 text-violet-700 border border-violet-200/70"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent"
    }`;
  }
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group ${
    isActive
      ? "bg-teal-50 text-teal-700 border border-teal-200/70"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 border border-transparent"
  }`;
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role ?? "landlord";
  const items = navForRole(role, location.pathname);
  const suiItems = getSuiSidebarItems(role);
  const showBlockchain = suiItems.length > 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const ExtIcon = SUI_SIDEBAR_EXTERNAL.icon;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex h-dvh max-h-dvh w-64 min-h-0 flex-col
          border-r border-gray-100 bg-white shadow-sidebar
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:h-full lg:max-h-none lg:translate-x-0 lg:flex
        `}
      >
        {/* Logo header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <BrandMark imgClassName="h-9 w-auto max-w-[170px] object-contain" />
            <div className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
              {role}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-panel-y px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Menu
          </div>
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={
                to === "/landlord/properties" ||
                to === "/tenant/dashboard" ||
                to === "/landlord/dashboard" ||
                to === "/agent/dashboard"
              }
              onClick={onClose}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={`flex-shrink-0 ${
                      isActive ? "text-teal-600" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}

          {showBlockchain && (
            <>
              <div className="mx-1 my-3 border-t border-gray-100" />
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-violet-400">
                Sui
              </div>
              {suiItems.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) => navLinkClass(isActive, "sui")}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        className={`flex-shrink-0 ${
                          isActive ? "text-violet-600" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
              <a
                href={SUI_SIDEBAR_EXTERNAL.href}
                target="_blank"
                rel="noopener noreferrer"
                className={navLinkClass(false, "sui")}
                onClick={onClose}
              >
                <ExtIcon size={16} className="text-gray-400" />
                {SUI_SIDEBAR_EXTERNAL.label}
                <ExtIcon size={11} className="ml-auto opacity-40" />
              </a>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="shrink-0 space-y-3 border-t border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white ring-2 ring-teal-100">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-gray-800">{user?.full_name}</div>
              <div className="truncate text-[11px] text-gray-400">{user?.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
