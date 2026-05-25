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

/** Blockchain section in the main app sidebar (no nested Sui portal). */
export const SUI_SIDEBAR_ITEMS = [
  { to: "/sui/dashboard", icon: LayoutDashboard, label: "Blockchain overview", end: true },
  { to: "/sui/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/sui/escrow", icon: Shield, label: "Escrow" },
  { to: "/sui/contracts", icon: FileCode2, label: "Smart contracts" },
  { to: "/sui/wallets", icon: Wallet, label: "Wallets" },
  { to: "/sui/receipts", icon: Receipt, label: "On-chain receipts" },
  { to: "/sui/analytics", icon: BarChart3, label: "Chain analytics" },
  { to: "/sui/settings", icon: Settings, label: "Sui settings" },
];

export const SUI_SIDEBAR_EXTERNAL = {
  href: "https://suiscan.xyz/testnet",
  icon: ExternalLink,
  label: "Sui Explorer",
};

export function isSuiRoute(pathname) {
  return pathname === "/sui" || pathname.startsWith("/sui/");
}
