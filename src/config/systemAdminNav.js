/** Super Admin Console navigation — mockup-aligned sections */

export const SYSTEM_NAV_SECTIONS = [
  {
    title: "Dashboard",
    items: [{ id: "dashboard", label: "Dashboard", path: "/system/dashboard", icon: "overview" }],
  },
  {
    title: "Core Management",
    items: [
      { id: "users", label: "User Management", path: "/system/users", icon: "users" },
      { id: "roles", label: "Role & Permissions", path: "/system/users", icon: "permissions" },
      { id: "gov-agencies", label: "Government Agencies", path: "/government/overview", icon: "gov" },
      { id: "verification", label: "Verification Center", path: "/government/nira", icon: "nira" },
      { id: "properties", label: "Property Oversight", path: "/system/properties", icon: "properties" },
      { id: "moderation", label: "Approvals & Moderation", path: "/system/users", icon: "moderation" },
    ],
  },
  {
    title: "Financial Control",
    items: [
      { id: "payments", label: "Payments & Escrow", path: "/system/payments", icon: "payments" },
      { id: "wallets", label: "Wallets & Settlements", path: "/system/wallets", icon: "wallets" },
      { id: "transactions", label: "Transactions Monitor", path: "/system/payments", icon: "transactions" },
      { id: "commissions", label: "Commissions & Fees", path: "/system/payments", icon: "commissions" },
      { id: "revenue", label: "Revenue Analytics", path: "/system/dashboard", icon: "revenue" },
    ],
  },
  {
    title: "System Control",
    items: [
      { id: "settings", label: "Platform Settings", path: "/system/settings", icon: "settings" },
      { id: "fraud", label: "AI & Fraud Detection", path: "/government/fraud", icon: "fraud", badge: "AI" },
      { id: "blockchain", label: "Sui console", path: "/sui/dashboard", icon: "blockchain" },
      { id: "audit", label: "Audit Logs", path: "/government/audit", icon: "audit" },
      { id: "reports", label: "Reports & Analytics", path: "/system/dashboards", icon: "reports" },
    ],
  },
];
