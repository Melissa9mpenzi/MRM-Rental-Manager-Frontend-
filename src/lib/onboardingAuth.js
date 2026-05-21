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

  if ((role === "landlord" || role === "staff") && user.email_verified) {
    const trusted = Boolean(user.trusted_for_commerce);
    const kycStatus = user.kyc_review_status || "none";
    if (!trusted && kycStatus !== "approved") {
      if (!user.kyc_submitted_at) return "/auth/kyc";
      if (kycStatus === "pending") return "/verification-pending";
      if (kycStatus === "rejected") return "/auth/kyc";
    }
  }

  return defaultDashboardPath(role);
}
