import {
  LayoutDashboard,
  ArrowLeftRight,
  Shield,
  FileCode2,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  ExternalLink,
} from "lucide-react";
import { API_ROLES } from "./access";

/** Full Sui console — system administrators only. */
export const SUI_ADMIN_SIDEBAR_ITEMS = [
  { to: "/sui/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/sui/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/sui/escrow", icon: Shield, label: "Escrow" },
  { to: "/sui/contracts", icon: FileCode2, label: "Contracts" },
  { to: "/sui/wallets", icon: Wallet, label: "Wallets" },
  { to: "/sui/receipts", icon: Receipt, label: "Receipts" },
  { to: "/sui/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/sui/settings", icon: Settings, label: "Settings" },
];

export const SUI_SIDEBAR_EXTERNAL = {
  href: "https://suiscan.xyz/testnet",
  icon: ExternalLink,
  label: "Explorer",
};

export function getSuiSidebarItems(role) {
  if (role === API_ROLES.system_admin) return SUI_ADMIN_SIDEBAR_ITEMS;
  return [];
}

export function canAccessSuiPortal(role) {
  return role === API_ROLES.system_admin;
}

export function isSuiRoute(pathname) {
  return pathname === "/sui" || pathname.startsWith("/sui/");
}
