import { defaultDashboardPath } from "../config/access";

/**
 * Where to send the user after login or when hitting `/dashboard`.
 * Tenant: home after email verify. Landlord/agent: KYC → pending → home. Admin: mandatory 2FA gate each session.
 */
export function postLoginDestination(user) {
  if (!user) return "/login";
  const role = user.role;

  if (role === "admin" && sessionStorage.getItem("rd_admin_2fa_verified") !== "1") {
    return "/auth/admin-2fa";
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
