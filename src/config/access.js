/**
 * RentDirect UG — web access model (role-prefixed private areas + public routes).
 * Route guards MUST use JWT-backed `user.role` from the auth store — not client-only overrides.
 */

/** Canonical API roles (see backend UserRole). */
export const API_ROLES = {
  tenant: "tenant",
  landlord: "landlord",
  staff: "staff",
  admin: "admin",
};

/** First screen after login for each role. */
export function defaultDashboardPath(role) {
  switch (role) {
    case API_ROLES.tenant:
      return "/tenant/dashboard";
    case API_ROLES.landlord:
      return "/landlord/dashboard";
    case API_ROLES.staff:
    case "agent":
      return "/agent/dashboard";
    case API_ROLES.admin:
      return "/admin/dashboard";
    default:
      return "/landlord/dashboard";
  }
}

/** Full notifications centre route for each role. */
export function notificationsPathForRole(role) {
  switch (role) {
    case API_ROLES.tenant:
      return "/tenant/notifications";
    case API_ROLES.landlord:
      return "/landlord/notifications";
    case API_ROLES.staff:
    case "agent":
      return "/agent/notifications";
    case API_ROLES.admin:
      return "/admin/notifications";
    default:
      return "/landlord/notifications";
  }
}

/** In-app messages route for each role. */
export function messagesPathForRole(role) {
  switch (role) {
    case API_ROLES.tenant:
      return "/tenant/messages";
    case API_ROLES.landlord:
      return "/landlord/messages";
    case API_ROLES.staff:
    case "agent":
      return "/agent/messages";
    case API_ROLES.admin:
      return "/admin/messages";
    default:
      return "/tenant/messages";
  }
}

const PREFIX = {
  tenant: "/tenant",
  landlord: "/landlord",
  agent: "/agent",
  admin: "/admin",
};

/** Whether an authenticated `role` may navigate to `pathname` (deep link / post-login return). */
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
  if (role === API_ROLES.staff || role === "agent") {
    return pathname === PREFIX.agent || pathname.startsWith(`${PREFIX.agent}/`);
  }
  if (role === API_ROLES.admin) {
    return pathname === PREFIX.admin || pathname.startsWith(`${PREFIX.admin}/`);
  }
  return false;
}
