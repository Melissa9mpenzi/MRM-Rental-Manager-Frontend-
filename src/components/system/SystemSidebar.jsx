import { NavLink, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  Building2,
  FileText,
  Wallet,
  MessageSquare,
  Shield,
  Landmark,
  Settings,
  ScrollText,
  Megaphone,
  LifeBuoy,
  KeyRound,
} from "lucide-react";
import { SYSTEM_NAV_SECTIONS } from "../../config/systemAdminNav";
import useAuthStore from "../../store/authStore";
import SystemBrandMark from "./SystemBrandMark";

const ICONS = {
  overview: LayoutDashboard,
  users: Users,
  dashboards: Grid3X3,
  properties: Building2,
  contracts: FileText,
  payments: Wallet,
  wallets: Wallet,
  messages: MessageSquare,
  nira: Shield,
  kcca: Building2,
  ura: Landmark,
  gov: Shield,
  settings: Settings,
  permissions: KeyRound,
  audit: ScrollText,
  security: Shield,
  announcements: Megaphone,
  support: LifeBuoy,
};

function initials(name) {
  return (name || "SA")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SystemSidebar({ onNavigate }) {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="sys-sidebar" aria-label="Super Admin navigation">
      <header className="sys-sidebar__header">
        <SystemBrandMark />
      </header>

      <nav className="sys-sidebar__nav" aria-label="Main menu">
        {SYSTEM_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="sys-sidebar__group">
            <p className="sys-sidebar__section">{section.title}</p>
            {section.items.map((item) => {
              const Icon = ICONS[item.icon] || LayoutDashboard;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/system/dashboard"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `sys-sidebar__nav-link ${isActive ? "sys-sidebar__nav-link--active" : ""}`
                  }
                >
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <footer className="sys-sidebar__footer">
        <Link to="/government/officers" className="sys-sidebar__create" onClick={onNavigate}>
          <Plus size={16} strokeWidth={2.5} />
          Create New
        </Link>

        <div className="sys-sidebar__user">
          <div className="sys-sidebar__avatar">{initials(user?.full_name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.full_name || "Super Admin"}</p>
            <p className="text-[11px] text-white/45">Global Administrator</p>
          </div>
          <span className="sys-sidebar__online" title="Online" />
        </div>
      </footer>
    </aside>
  );
}
