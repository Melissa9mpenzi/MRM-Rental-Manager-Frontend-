import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  Building2,
  FileText,
  Wallet,
  Shield,
  Landmark,
  Settings,
  ScrollText,
  Megaphone,
  LifeBuoy,
  CheckCircle2,
  BarChart3,
  ArrowLeftRight,
  Percent,
  LineChart,
  Cpu,
  Boxes,
  ClipboardCheck,
} from "lucide-react";
import { SYSTEM_NAV_SECTIONS } from "../../config/systemAdminNav";
import useAuthStore from "../../store/authStore";
import SystemBrandMark from "./SystemBrandMark";
import MiniSparkline from "./MiniSparkline";

const ICONS = {
  overview: LayoutDashboard,
  users: Users,
  permissions: KeyRound,
  properties: Building2,
  moderation: ClipboardCheck,
  payments: Wallet,
  wallets: Wallet,
  transactions: ArrowLeftRight,
  commissions: Percent,
  revenue: LineChart,
  settings: Settings,
  fraud: Cpu,
  blockchain: Boxes,
  audit: ScrollText,
  reports: BarChart3,
  nira: Shield,
  kcca: Building2,
  ura: Landmark,
  gov: Shield,
  messages: Megaphone,
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

export default function SystemSidebar({ onNavigate, healthSpark = [98, 99, 99.5, 99.8, 99.9, 99.98] }) {
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
                  {item.badge ? (
                    <span className="sys-sidebar__ai-badge">{item.badge}</span>
                  ) : null}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sys-sidebar__health-widget">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">System Health</p>
            <p className="text-sm font-bold text-emerald-400">Excellent</p>
            <p className="text-[10px] text-white/45">99.98% uptime</p>
          </div>
          <CheckCircle2 size={22} className="text-emerald-400/80" />
        </div>
        <MiniSparkline values={healthSpark} color="#00c896" />
      </div>

      <footer className="sys-sidebar__footer">
        <Link to="/government/officers" className="sys-sidebar__create" onClick={onNavigate}>
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
