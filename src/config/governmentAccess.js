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
      return "all";
  }
}

/** Sidebar navigation — matches enterprise government dashboard mockup */
export const GOV_NAV = [
  { id: "overview", label: "Overview", path: "/government/overview", agencies: ["all", "nira", "kcca", "ura"] },
  { id: "nira", label: "NIRA Verification", path: "/government/nira", agencies: ["all", "nira"] },
  { id: "kcca", label: "KCCA Property Verification", path: "/government/kcca", agencies: ["all", "kcca"] },
  { id: "ura", label: "URA Tax Compliance", path: "/government/ura", agencies: ["all", "ura"] },
  { id: "fraud", label: "Fraud Detection", path: "/government/fraud", agencies: ["all", "nira", "kcca", "ura"] },
  { id: "approvals", label: "Approvals", path: "/government/approvals", agencies: ["all"] },
  { id: "inspections", label: "Inspection Requests", path: "/government/inspections", agencies: ["all", "kcca"] },
  { id: "analytics", label: "Reports & Analytics", path: "/government/analytics", agencies: ["all", "ura"] },
  { id: "audit", label: "Audit Logs", path: "/government/audit", agencies: ["all", "nira", "kcca", "ura"] },
  {
    id: "officers",
    label: "Officers",
    path: "/government/officers",
    agencies: ["all"],
    systemAdminOnly: true,
  },
  {
    id: "users",
    label: "Platform users",
    path: "/government/users",
    agencies: ["all"],
    systemAdminOnly: true,
  },
  { id: "settings", label: "System Settings", path: "/government/settings", agencies: ["all"] },
];

export function navItemsForRole(role) {
  const agency = governmentAgencyForRole(role);
  return GOV_NAV.filter(
    (item) =>
      (item.agencies.includes("all") || item.agencies.includes(agency)) &&
      (!item.systemAdminOnly || isSystemAdministrator(role))
  );
}

export function defaultGovernmentPath(role) {
  const items = navItemsForRole(role);
  return items[0]?.path || "/government/overview";
}

export function pathAllowedForGovernment(pathname, role) {
  if (!pathname?.startsWith("/government")) return false;
  return navItemsForRole(role).some(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );
}
