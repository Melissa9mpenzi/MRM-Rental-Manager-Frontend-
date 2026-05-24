/** Super Admin / Global Administrator navigation (matches platform mockup). */

export const SYSTEM_NAV_SECTIONS = [
  {
    title: "Platform Management",
    items: [
      { id: "overview", label: "Global Overview", path: "/system/dashboard", icon: "overview" },
      { id: "users", label: "Users & Roles", path: "/system/users", icon: "users" },
      { id: "dashboards", label: "All Dashboards", path: "/system/dashboards", icon: "dashboards" },
      { id: "properties", label: "Properties", path: "/system/properties", icon: "properties" },
      { id: "contracts", label: "Contracts", path: "/system/contracts", icon: "contracts" },
      { id: "payments", label: "Payments & Escrow", path: "/system/payments", icon: "payments" },
      { id: "receipts", label: "Receipt center", path: "/system/receipts", icon: "contracts" },
      { id: "wallets", label: "Wallets", path: "/system/wallets", icon: "wallets" },
      { id: "messages", label: "Messages", path: "/system/messages", icon: "messages" },
    ],
  },
  {
    title: "Government Integration",
    items: [
      { id: "nira", label: "NIRA (KYC)", path: "/government/nira", icon: "nira" },
      { id: "kcca", label: "KCCA (Properties)", path: "/government/kcca", icon: "kcca" },
      { id: "ura", label: "URA (Tax Compliance)", path: "/government/ura", icon: "ura" },
      { id: "gov-overview", label: "All Agencies", path: "/government/overview", icon: "gov" },
    ],
  },
  {
    title: "System Administration",
    items: [
      { id: "settings", label: "System Settings", path: "/system/settings", icon: "settings" },
      { id: "permissions", label: "Permissions & Roles", path: "/system/users", icon: "permissions" },
      { id: "audit", label: "Audit Logs", path: "/government/audit", icon: "audit" },
      { id: "security", label: "Security Center", path: "/government/fraud", icon: "security" },
      { id: "announcements", label: "Announcements", path: "/system/announcements", icon: "announcements" },
      { id: "support", label: "Support Tickets", path: "/system/support", icon: "support" },
    ],
  },
];
