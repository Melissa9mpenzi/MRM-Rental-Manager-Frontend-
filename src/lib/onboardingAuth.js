import { defaultDashboardPath } from "../config/access";
import { isGovernmentOfficer } from "../config/governmentAccess";
import { GOV_PORTAL } from "../config/governmentPortal";

/** Roles that must complete ID + selfie KYC before using the main app. */
export function requiresKycCommerce(role) {
  return role === "landlord" || role === "staff" || role === "agent";
}

/**
 * Landlord / agent has finished the KYC onboarding step (may still be pending NIRA review).
 */
export function hasPassedKycOnboarding(user) {
  if (!user || !requiresKycCommerce(user.role)) return true;
  if (user.trusted_for_commerce) return true;
  const status = (user.kyc_review_status || "none").toLowerCase();
  if (status === "approved") return true;
  if (status === "pending" && user.kyc_submitted_at) return true;
  return false;
}

/**
 * Must visit /auth/kyc to upload (or re-upload after rejection).
 * Returning users who already submitted or were approved are not sent back.
 */
export function mustCompleteKycBeforeApp(user) {
  if (!user || !requiresKycCommerce(user.role)) return false;
  if (hasPassedKycOnboarding(user)) return false;
  if ((user.kyc_review_status || "").toLowerCase() === "rejected") return true;
  if (!user.kyc_submitted_at) return true;
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
