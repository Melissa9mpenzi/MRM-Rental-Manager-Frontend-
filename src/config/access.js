/**
 * RentDirect UG — web access model.
 * Roles: tenant, agent (staff), landlord, government officers, system administrator.
 */

import {
  canAccessGovernmentPortal,
  defaultGovernmentPath,
  isSystemAdministrator,
  pathAllowedForGovernment,
} from "./governmentAccess";

export const API_ROLES = {
  tenant: "tenant",
  landlord: "landlord",
  staff: "staff",
  agent: "agent",
  system_admin: "system_admin",
  gov_nira: "gov_nira",
  gov_kcca: "gov_kcca",
  gov_ura: "gov_ura",
};

export function defaultDashboardPath(role) {
  switch (role) {
    case API_ROLES.tenant:
      return "/tenant/dashboard";
    case API_ROLES.landlord:
      return "/landlord/dashboard";
    case API_ROLES.staff:
    case API_ROLES.agent:
      return "/agent/dashboard";
    case API_ROLES.system_admin:
      return "/system/dashboard";
    case API_ROLES.gov_nira:
    case API_ROLES.gov_kcca:
    case API_ROLES.gov_ura:
      return defaultGovernmentPath(role);
    default:
      return "/landlord/dashboard";
  }
}

export function notificationsPathForRole(role) {
  switch (role) {
    case API_ROLES.tenant:
      return "/tenant/notifications";
    case API_ROLES.landlord:
      return "/landlord/notifications";
    case API_ROLES.staff:
    case API_ROLES.agent:
      return "/agent/notifications";
    case API_ROLES.system_admin:
      return "/system/notifications";
    case API_ROLES.gov_nira:
    case API_ROLES.gov_kcca:
    case API_ROLES.gov_ura:
      return "/government/notifications";
    default:
      return "/landlord/notifications";
  }
}

export function profilePathForRole(role) {
  switch (role) {
    case API_ROLES.tenant:
      return "/tenant/profile";
    case API_ROLES.landlord:
      return "/landlord/profile";
    case API_ROLES.staff:
    case API_ROLES.agent:
      return "/agent/profile";
    case API_ROLES.system_admin:
      return "/system/settings";
    case API_ROLES.gov_nira:
    case API_ROLES.gov_kcca:
    case API_ROLES.gov_ura:
      return "/government/settings";
    default:
      return null;
  }
}

export function settingsPathForRole(role) {
  switch (role) {
    case API_ROLES.tenant:
      return "/tenant/settings";
    case API_ROLES.landlord:
      return "/landlord/settings";
    case API_ROLES.staff:
    case API_ROLES.agent:
      return "/agent/settings";
    case API_ROLES.system_admin:
      return "/system/settings";
    default:
      return "/landlord/settings";
  }
}

export function messagesPathForRole(role) {
  switch (role) {
    case API_ROLES.tenant:
      return "/tenant/messages";
    case API_ROLES.landlord:
      return "/landlord/messages";
    case API_ROLES.staff:
    case API_ROLES.agent:
      return "/agent/messages";
    case API_ROLES.system_admin:
      return "/government/overview";
    default:
      return "/tenant/messages";
  }
}

const PREFIX = {
  tenant: "/tenant",
  landlord: "/landlord",
  agent: "/agent",
  system: "/system",
  government: "/government",
  sui: "/sui",
};

export function pathAllowedForRole(pathname, role) {
  if (!pathname || !role) return false;
  if (pathname === "/dashboard") return true;
  if (pathname === "/verification-pending") return true;
  if (pathname.startsWith("/browse-properties") || pathname.startsWith("/property/")) return true;

  if (role === API_ROLES.tenant) {
    return pathname === PREFIX.tenant || pathname.startsWith(`${PREFIX.tenant}/`);
  }
  if (role === API_ROLES.landlord) {
    return pathname === PREFIX.landlord || pathname.startsWith(`${PREFIX.landlord}/`);
  }
  if (role === API_ROLES.staff || role === API_ROLES.agent) {
    return pathname === PREFIX.agent || pathname.startsWith(`${PREFIX.agent}/`);
  }
  if (isSystemAdministrator(role)) {
    return (
      pathname === PREFIX.system ||
      pathname.startsWith(`${PREFIX.system}/`) ||
      pathname.startsWith(PREFIX.government) ||
      pathname === PREFIX.sui ||
      pathname.startsWith(`${PREFIX.sui}/`)
    );
  }
  if (canAccessGovernmentPortal(role)) {
    return pathAllowedForGovernment(pathname, role);
  }
  return false;
}
