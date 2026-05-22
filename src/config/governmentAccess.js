/**
 * Government portal — NIRA / KCCA / URA officers (invitation-only).
 * System administrator is separate (seed-only, runs entire platform).
 */

export const GOV_OFFICER_ROLES = {
  nira: "gov_nira",
  kcca: "gov_kcca",
  ura: "gov_ura",
};

export const ALL_GOV_OFFICER_ROLES = Object.values(GOV_OFFICER_ROLES);

export const GOVERNMENT_PORTAL_ROLES = [...ALL_GOV_OFFICER_ROLES, "system_admin"];

export function isGovernmentOfficer(role) {
  return ALL_GOV_OFFICER_ROLES.includes(role);
}

export function isSystemAdministrator(role) {
  return role === "system_admin";
}

export function isGovernmentRole(role) {
  return isGovernmentOfficer(role);
}

export function canAccessGovernmentPortal(role) {
  return isGovernmentOfficer(role) || isSystemAdministrator(role);
}

export function governmentAgencyForRole(role) {
  switch (role) {
    case GOV_OFFICER_ROLES.nira:
      return "nira";
    case GOV_OFFICER_ROLES.kcca:
      return "kcca";
    case GOV_OFFICER_ROLES.ura:
      return "ura";
    case "system_admin":
      return "all";
    default:
      return null;
  }
}

/**
 * Sidebar navigation — each item lists which officer agencies may access.
 * System administrator sees every item.
 */
export const GOV_NAV = [
  { id: "overview", label: "Overview", path: "/government/overview", agencies: ["nira", "kcca", "ura"] },
  { id: "nira", label: "NIRA Verification", path: "/government/nira", agencies: ["nira"] },
  { id: "kcca", label: "KCCA Property Verification", path: "/government/kcca", agencies: ["kcca"] },
  { id: "ura", label: "URA Tax Compliance", path: "/government/ura", agencies: ["ura"] },
  { id: "fraud", label: "Fraud Detection", path: "/government/fraud", agencies: ["nira", "kcca", "ura"] },
  { id: "approvals", label: "Approvals", path: "/government/approvals", agencies: [], systemAdminOnly: true },
  { id: "inspections", label: "Inspection Requests", path: "/government/inspections", agencies: ["kcca"] },
  { id: "analytics", label: "Reports & Analytics", path: "/government/analytics", agencies: ["ura"] },
  { id: "audit", label: "Audit Logs", path: "/government/audit", agencies: ["nira", "kcca", "ura"] },
  {
    id: "officers",
    label: "Officers",
    path: "/government/officers",
    agencies: [],
    systemAdminOnly: true,
  },
  {
    id: "users",
    label: "Platform users",
    path: "/government/users",
    agencies: [],
    systemAdminOnly: true,
  },
  { id: "settings", label: "System Settings", path: "/government/settings", agencies: ["nira", "kcca", "ura"] },
];

export function navItemsForRole(role) {
  const agency = governmentAgencyForRole(role);
  const isAdmin = isSystemAdministrator(role);
  return GOV_NAV.filter((item) => {
    if (item.systemAdminOnly && !isAdmin) return false;
    if (isAdmin) return true;
    if (!agency) return false;
    return item.agencies.includes(agency);
  });
}

export function defaultGovernmentPath(role) {
  const items = navItemsForRole(role);
  return items[0]?.path || "/government/overview";
}

export function pathAllowedForGovernment(pathname, role) {
  if (!pathname?.startsWith("/government")) return false;
  if (pathname === "/government" || pathname === "/government/") return true;
  return navItemsForRole(role).some(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );
}

/** Quick actions on overview — scoped to agency (icons assigned in overview page). */
export function quickActionsForAgency(agency) {
  const all = [
    { id: "officers", label: "Add New Officer", to: "/government/officers", agencies: ["all"] },
    { id: "nira", label: "New Verification Request", to: "/government/nira", agencies: ["nira", "all"] },
    { id: "kcca", label: "Property Verification", to: "/government/kcca", agencies: ["kcca", "all"] },
    { id: "ura", label: "Tax Compliance Report", to: "/government/ura", agencies: ["ura", "all"] },
    { id: "analytics", label: "Generate Report", to: "/government/analytics", agencies: ["ura", "all"] },
    { id: "settings", label: "Portal Settings", to: "/government/settings", agencies: ["nira", "kcca", "ura", "all"] },
  ];
  const key = agency === "all" ? "all" : agency;
  return all.filter((a) => a.agencies.includes(key) || (key === "all" && a.agencies.includes("all")));
}
