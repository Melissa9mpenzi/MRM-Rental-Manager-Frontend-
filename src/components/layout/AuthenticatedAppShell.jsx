import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import GlobalSearch from "../enterprise/GlobalSearch";
import SystemStatusBar from "../enterprise/SystemStatusBar";
import NotificationBell from "./NotificationBell";
import UserProfileMenu from "./UserProfileMenu";
import SuiWalletHeader from "../sui/SuiWalletHeader";
import ThemeToggleButton from "../ui/ThemeToggleButton";
import useAuthStore from "../../store/authStore";
import { isSuiRoute } from "../../config/suiSidebarNav";

const BREADCRUMBS = {
  "/dashboard": ["Home"],
  "/browse-properties": ["Browse", "Search"],
  "/tenant/dashboard": ["Tenant", "Dashboard"],
  "/tenant/saved": ["Tenant", "Saved"],
  "/tenant/applications": ["Tenant", "Applications"],
  "/tenant/wallet": ["Tenant", "Wallet"],
  "/tenant/notifications": ["Tenant", "Notifications"],
  "/tenant/profile": ["Tenant", "Profile"],
  "/tenant/pay": ["Tenant", "Payments"],
  "/tenant/contract": ["Tenant", "Lease contracts"],
  "/tenant/messages": ["Tenant", "Messages"],
  "/tenant/settings": ["Tenant", "Settings"],
  "/landlord/dashboard": ["Landlord", "Dashboard"],
  "/landlord/properties": ["Landlord", "Properties"],
  "/landlord/properties/new": ["Landlord", "Properties", "Add"],
  "/landlord/applicants": ["Landlord", "Applicants"],
  "/landlord/contracts": ["Landlord", "Contracts"],
  "/landlord/analytics": ["Landlord", "Analytics"],
  "/landlord/reports": ["Landlord", "Reports"],
  "/landlord/notifications": ["Landlord", "Notifications"],
  "/landlord/wallet": ["Landlord", "Wallet"],
  "/landlord/tenants": ["Landlord", "Tenants"],
  "/landlord/tenants/new": ["Landlord", "Tenants", "Add"],
  "/landlord/payments": ["Landlord", "Payments"],
  "/landlord/payments/new": ["Landlord", "Payments", "Record"],
  "/landlord/maintenance": ["Landlord", "Maintenance"],
  "/landlord/reports/arrears": ["Landlord", "Reports", "Arrears"],
  "/landlord/messages": ["Landlord", "Messages"],
  "/landlord/profile": ["Landlord", "Profile"],
  "/landlord/settings": ["Landlord", "Settings"],
  "/agent/dashboard": ["Agent", "Dashboard"],
  "/agent/leads": ["Agent", "Leads"],
  "/agent/clients": ["Agent", "Clients"],
  "/agent/schedules": ["Agent", "Schedules"],
  "/agent/deals": ["Agent", "Deals"],
  "/agent/commissions": ["Agent", "Commissions"],
  "/agent/analytics": ["Agent", "Analytics"],
  "/agent/notifications": ["Agent", "Notifications"],
  "/agent/messages": ["Agent", "Messages"],
  "/agent/profile": ["Agent", "Profile"],
  "/agent/settings": ["Agent", "Settings"],
  "/sui/dashboard": ["Blockchain", "Overview"],
  "/sui/transactions": ["Blockchain", "Transactions"],
  "/sui/escrow": ["Blockchain", "Escrow"],
  "/sui/contracts": ["Blockchain", "Smart contracts"],
  "/sui/wallets": ["Blockchain", "Wallets"],
  "/sui/receipts": ["Blockchain", "Receipts"],
  "/sui/analytics": ["Blockchain", "Analytics"],
  "/sui/settings": ["Blockchain", "Settings"],
};

const SUI_CRUMB_LABELS = {
  dashboard: "Overview",
  transactions: "Transactions",
  escrow: "Escrow",
  contracts: "Smart contracts",
  wallets: "Wallets",
  receipts: "Receipts",
  analytics: "Analytics",
  settings: "Settings",
};

function getcrumbs(pathname, role) {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  if (pathname.startsWith("/sui/receipts/")) return ["Blockchain", "Receipts", "Detail"];
  if (pathname.startsWith("/sui/")) {
    const segment = pathname.split("/")[2] || "dashboard";
    return ["Blockchain", SUI_CRUMB_LABELS[segment] || segment];
  }
  if (pathname.startsWith("/landlord/properties/")) return ["Landlord", "Properties", "Details"];
  if (pathname.startsWith("/landlord/tenants/") && pathname !== "/landlord/tenants/new")
    return ["Landlord", "Tenants", "Profile"];
  if (pathname.startsWith("/property/")) return ["Browse", "Listing"];
  const prefix = role === "tenant" ? "Tenant" : role === "staff" || role === "agent" ? "Agent" : "Landlord";
  return [prefix, "App"];
}

export default function AuthenticatedAppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "landlord";
  const crumbs = getcrumbs(location.pathname, role);
  const onSui = isSuiRoute(location.pathname);

  useEffect(() => {
    if (location.state?.forbidden) {
      toast.error("You do not have access to that area.");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-brand-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-40 flex h-14 flex-shrink-0 items-center gap-3 border-b border-white/10 bg-rd-elevated/80 px-4 shadow-sm backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          <GlobalSearch />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => (
              <div key={`${c}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={13} className="flex-shrink-0 text-white/25" />}
                <span
                  className={
                    i === crumbs.length - 1 ? "truncate font-bold text-white" : "text-xs text-white/45"
                  }
                >
                  {c}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-50 flex flex-shrink-0 items-center gap-1.5">
            <ThemeToggleButton />
            {onSui && <SuiWalletHeader />}
            <NotificationBell variant="app" />
            <UserProfileMenu variant="app" showName={false} />
          </div>
        </header>

        <div className="hidden border-b border-white/[0.06] bg-black/20 px-4 py-1.5 lg:flex lg:justify-end">
          <SystemStatusBar compact />
        </div>
        <main
          className="overflow-panel-y min-h-0 flex-1 bg-rd-gradient bg-rd-mesh p-4 lg:p-6"
          data-app-role={role}
        >
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
