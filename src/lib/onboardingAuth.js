import { defaultDashboardPath } from "../config/access";
import { isGovernmentOfficer } from "../config/governmentAccess";
import { GOV_PORTAL } from "../config/governmentPortal";

/** Roles that must complete ID + selfie KYC before using the main app. */
export function requiresKycCommerce(role) {
  return role === "landlord" || role === "staff" || role === "agent";
}

/**
 * Landlord / agent must upload KYC (or resubmit if rejected) before leaving onboarding.
 * Pending review can use the dashboard (banner only).
 */
export function mustCompleteKycBeforeApp(user) {
  if (!user || !requiresKycCommerce(user.role)) return false;
  if (!user.kyc_submitted_at) return true;
  if ((user.kyc_review_status || "").toLowerCase() === "rejected") return true;
  return false;
}

/** Paths reachable before KYC is submitted (or after reject until resubmit). */
export function kycOnboardingAllowedPaths(role) {
  const base = ["/auth/kyc", "/verification-pending"];
  if (role === "landlord") {
    return [...base, "/landlord/settings", "/landlord/profile"];
  }
  if (role === "staff" || role === "agent") {
    return [...base, "/agent/settings", "/agent/profile"];
  }
  return base;
}

export function isKycOnboardingAllowedPath(pathname, role) {
  return kycOnboardingAllowedPaths(role).some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Post-login routing.
 * - Government officers: government portal login + 2FA
 * - Landlord / agent: KYC upload required before dashboard (same flow)
 */
export function postLoginDestination(user) {
  if (!user) return "/login";
  const role = user.role;

  if (isGovernmentOfficer(role)) {
    return GOV_PORTAL.login;
  }

  if (mustCompleteKycBeforeApp(user)) {
    return "/auth/kyc";
  }

  return defaultDashboardPath(role);
}
