import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import {
  isKycOnboardingAllowedPath,
  mustCompleteKycBeforeApp,
} from "../../lib/onboardingAuth";

/**
 * Blocks landlord / agent app routes until KYC documents are submitted
 * (mirrors landlord onboarding — dashboard only after upload, pending review is OK).
 */
export default function KycOnboardingGuard() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!mustCompleteKycBeforeApp(user)) {
    return <Outlet />;
  }

  if (isKycOnboardingAllowedPath(location.pathname, user?.role)) {
    return <Outlet />;
  }

  return <Navigate to="/auth/kyc" replace state={{ from: location }} />;
}
