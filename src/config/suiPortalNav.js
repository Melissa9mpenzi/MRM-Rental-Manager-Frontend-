/** Sui admin console navigation */
export const SUI_NAV = [
  {
    title: "Console",
    items: [
      { id: "overview", label: "Overview", path: "/sui/dashboard", icon: "overview" },
      { id: "transactions", label: "Transactions", path: "/sui/transactions", icon: "transactions" },
      { id: "escrow", label: "Escrow", path: "/sui/escrow", icon: "escrow" },
      { id: "contracts", label: "Contracts", path: "/sui/contracts", icon: "contracts" },
      { id: "wallets", label: "Wallets", path: "/sui/wallets", icon: "wallets" },
      { id: "receipts", label: "Receipts", path: "/sui/receipts", icon: "receipts" },
      { id: "analytics", label: "Analytics", path: "/sui/analytics", icon: "analytics" },
    ],
  },
  {
    title: "Links",
    items: [
      { id: "explorer", label: "Explorer", path: "https://suiscan.xyz/", external: true, icon: "explorer" },
      { id: "docs", label: "Settings", path: "/sui/settings", icon: "docs" },
      { id: "support", label: "Back to admin", path: "/system/dashboard", icon: "support" },
    ],
  },
];

export const SUI_NETWORKS = [
  { id: "testnet", label: "Testnet", recommended: true },
  { id: "devnet", label: "Devnet" },
  { id: "mainnet", label: "Mainnet" },
];
