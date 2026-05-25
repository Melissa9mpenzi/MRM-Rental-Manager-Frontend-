/** Sui portal navigation — matches RentDirect UG mockup */
export const SUI_NAV = [
  {
    title: "Main",
    items: [
      { id: "overview", label: "Overview", path: "/sui/dashboard", icon: "overview" },
      { id: "transactions", label: "Transactions", path: "/sui/transactions", icon: "transactions" },
      { id: "escrow", label: "Escrow Contracts", path: "/sui/escrow", icon: "escrow" },
      { id: "contracts", label: "Smart Contracts", path: "/sui/contracts", icon: "contracts" },
      { id: "wallets", label: "Wallets", path: "/sui/wallets", icon: "wallets" },
      { id: "receipts", label: "Blockchain Receipts", path: "/sui/receipts", icon: "receipts" },
      { id: "analytics", label: "Analytics", path: "/sui/analytics", icon: "analytics" },
    ],
  },
  {
    title: "Resources",
    items: [
      { id: "explorer", label: "Sui Explorer", path: "https://suiscan.xyz/", external: true, icon: "explorer" },
      { id: "docs", label: "Sui settings", path: "/sui/settings", icon: "docs" },
      { id: "support", label: "Help & settings", path: "__role_settings__", icon: "support" },
    ],
  },
];

/** Testnet first — recommended for hackathon demos */
export const SUI_NETWORKS = [
  { id: "testnet", label: "Sui Testnet", recommended: true },
  { id: "devnet", label: "Sui Devnet" },
  { id: "mainnet", label: "Sui Mainnet" },
];
