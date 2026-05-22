import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Building2,
  Landmark,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ScrollText,
  BarChart3,
  Settings,
  Users,
  UserPlus,
} from "lucide-react";
import { navItemsForRole, isSystemAdministrator } from "../../config/governmentAccess";
import GovBrandMark from "./GovBrandMark";

const ICONS = {
  overview: LayoutDashboard,
  nira: Shield,
  kcca: Building2,
  ura: Landmark,
  fraud: AlertTriangle,
  approvals: CheckCircle2,
  inspections: ClipboardList,
  audit: ScrollText,
  analytics: BarChart3,
  settings: Settings,
  users: Users,
  officers: UserPlus,
};

function roleLabel(role) {
  if (isSystemAdministrator(role)) return "Super Admin";
  const map = { gov_nira: "NIRA Officer", gov_kcca: "KCCA Officer", gov_ura: "URA Officer" };
  return map[role] || "Government Officer";
}

function initials(name) {
  return (name || "GO")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function GovSidebar({ role, user, onNavigate }) {
  const items = navItemsForRole(role);

  return (
    <aside className="gov-sidebar">
      <div className="gov-sidebar__header">
        <GovBrandMark />
        <p className="gov-sidebar__tagline">National Rental Infrastructure System</p>
      </div>

      <nav className="gov-sidebar__nav" aria-label="Government portal">
        {items.map((item) => {
          const Icon = ICONS[item.id] || LayoutDashboard;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `gov-sidebar__nav-link ${isActive ? "gov-sidebar__nav-link--active" : ""}`
              }
            >
              <Icon size={17} className="shrink-0 opacity-90" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="gov-sidebar__user">
        <div className="flex items-center gap-3">
          <div className="gov-sidebar__avatar">{initials(user?.full_name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.full_name || "Officer"}</p>
            <p className="text-xs text-emerald-400/90">{roleLabel(role)}</p>
          </div>
          <span className="gov-sidebar__online" title="Online" />
        </div>
      </div>
    </aside>
  );
}
