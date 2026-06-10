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
  "/agent/workspace": ["Agent", "Operations"],
  "/agent/workspace/listings": ["Agent", "Operations", "Listings"],
  "/agent/workspace/moderation": ["Agent", "Operations", "Moderation"],
  "/agent/workspace/payments": ["Agent", "Operations", "Payments"],
  "/agent/workspace/contracts": ["Agent", "Operations", "Contracts"],
  "/agent/workspace/fraud": ["Agent", "Operations", "Fraud"],
  "/agent/workspace/analytics": ["Agent", "Operations", "Analytics"],
  "/agent/workspace/reports": ["Agent", "Operations", "Reports"],
  "/agent/workspace/support": ["Agent", "Operations", "Support"],
  "/agent/workspace/audit": ["Agent", "Operations", "Audit"],
  "/agent/workspace/system": ["Agent", "Operations", "Settings"],
  "/sui/dashboard": ["Sui", "Overview"],
  "/sui/transactions": ["Sui", "Transactions"],
  "/sui/escrow": ["Sui", "Escrow"],
  "/sui/contracts": ["Sui", "Contracts"],
  "/sui/wallets": ["Sui", "Wallets"],
  "/sui/receipts": ["Sui", "Receipts"],
  "/sui/analytics": ["Sui", "Analytics"],
  "/sui/settings": ["Sui", "Settings"],
};

const SUI_CRUMB_LABELS = {
  dashboard: "Overview",
  transactions: "Transactions",
  escrow: "Escrow",
  contracts: "Contracts",
  wallets: "Wallets",
  receipts: "Receipts",
  analytics: "Analytics",
  settings: "Settings",
};

function getcrumbs(pathname, role) {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  if (pathname.startsWith("/sui/receipts/")) return ["Sui", "Receipts", "Detail"];
  if (pathname.startsWith("/sui/")) {
    const segment = pathname.split("/")[2] || "dashboard";
    return ["Sui", SUI_CRUMB_LABELS[segment] || segment];
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
    <div className="flex h-dvh min-h-0 w-full overflow-hidden" style={{ backgroundColor: "#F8FAFB" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar — white, clean */}
        <header className="relative z-40 flex h-14 flex-shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <GlobalSearch />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => (
              <div key={`${c}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={13} className="flex-shrink-0 text-gray-300" />}
                <span
                  className={
                    i === crumbs.length - 1
                      ? "truncate font-bold text-gray-800"
                      : "text-xs text-gray-400"
                  }
                >
                  {c}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-50 flex flex-shrink-0 items-center gap-1.5">
            {onSui && <SuiWalletHeader />}
            <NotificationBell variant="app" />
            <UserProfileMenu variant="app" showName={false} />
          </div>
        </header>

        <div className="hidden border-b border-gray-100 bg-white px-4 py-1.5 lg:flex lg:justify-end">
          <SystemStatusBar compact />
        </div>
        <main
          className="overflow-panel-y min-h-0 flex-1 bg-[#F8FAFB] p-4 lg:p-6"
          data-app-role={role}
        >
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
