import { defaultDashboardPath } from "../config/access";
import { isGovernmentOfficer } from "../config/governmentAccess";
import { GOV_PORTAL } from "../config/governmentPortal";

/**
 * Post-login routing.
 * - Government officers: government portal login + 2FA
 * - System administrator: main login → /system/dashboard (optional gov 2FA for portal)
 */
export function postLoginDestination(user) {
  if (!user) return "/login";
  const role = user.role;

  if (isGovernmentOfficer(role)) {
    return GOV_PORTAL.login;
  }

  // Landlord / agent: always open the dashboard after login.
  // KYC is optional from the dashboard banner (not forced on every sign-in).
  return defaultDashboardPath(role);
}
