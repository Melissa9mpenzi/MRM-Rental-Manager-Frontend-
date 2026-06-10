import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Shield,
  FileCode2,
  Wallet,
  Receipt,
  BarChart3,
  ExternalLink,
  BookOpen,
  LifeBuoy,
} from "lucide-react";
import BrandMark from "../brand/BrandMark";
import { SUI_NAV } from "../../config/suiPortalNav";
import { settingsPathForRole } from "../../config/access";
import useAuthStore from "../../store/authStore";
import { fmtSui } from "../../lib/useSuiDashboard";

const ICONS = {
  overview: LayoutDashboard,
  dashboard: LayoutDashboard,
  transactions: ArrowLeftRight,
  escrow: Shield,
  contracts: FileCode2,
  wallets: Wallet,
  receipts: Receipt,
  analytics: BarChart3,
  explorer: ExternalLink,
  docs: BookOpen,
  support: LifeBuoy,
};

function initials(name) {
  return (name || "RD")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SuiSidebar({ onNavigate, wallet }) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || "tenant";
  const settingsPath = settingsPathForRole(role);

  return (
    <aside className="sui-sidebar">
      <header className="sui-sidebar__header">
        <Link to="/" className="sui-sidebar__brand block" onClick={onNavigate}>
          <BrandMark imgClassName="h-9 w-auto max-w-[160px] object-contain" />
        </Link>
        <p className="mt-1 text-[11px] text-white/40">Sui console</p>
      </header>

      <nav className="sui-sidebar__nav">
        {SUI_NAV.map((section) => (
          <div key={section.title}>
            <p className="sui-sidebar__section">{section.title}</p>
            {section.items.map((item) => {
              const Icon = ICONS[item.icon] || LayoutDashboard;
              if (item.external) {
                return (
                  <a
                    key={item.id}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sui-sidebar__link"
                    onClick={onNavigate}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    <ExternalLink size={12} className="ml-auto opacity-50" />
                  </a>
                );
              }
              const to = item.path === "__role_settings__" ? settingsPath : item.path;
              return (
                <NavLink
                  key={item.id}
                  to={to}
                  end={to === "/sui/dashboard"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `sui-sidebar__link ${isActive ? "sui-sidebar__link--active" : ""}`
                  }
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.badge && <span className="sui-sidebar__badge">{item.badge}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}

        <div className="sui-sidebar__wallet-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">SUI Wallet</p>
          <p className="mt-1 font-bold text-white">
            {wallet?.sui_balance != null ? fmtSui(wallet.sui_balance) : "Connect wallet"}
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/40">Escrow Balance</p>
          <p className="mt-0.5 font-semibold text-violet-300">{fmtSui(wallet?.escrow_balance ?? 0)}</p>
        </div>
      </nav>

      <footer className="sui-sidebar__footer">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-200">
            {initials(user?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.full_name || "User"}</p>
            <p className="text-[10px] text-white/45 capitalize">{user?.role?.replace(/_/g, " ") || "Tenant"}</p>
          </div>
        </div>
      </footer>
    </aside>
  );
}
