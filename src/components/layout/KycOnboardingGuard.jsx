import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import {
  isKycOnboardingAllowedPath,
  mustCompleteKycBeforeApp,
  requiresKycCommerce,
} from "../../lib/onboardingAuth";

/**
 * Blocks landlord / agent app routes until KYC documents are submitted
 * (mirrors landlord onboarding — dashboard only after upload, pending review is OK).
 */
export default function KycOnboardingGuard() {
  const user = useAuthStore((s) => s.user);
  const refreshSessionUser = useAuthStore((s) => s.refreshSessionUser);
  const location = useLocation();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (user && requiresKycCommerce(user.role)) {
        await refreshSessionUser();
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSessionUser, user?.id, user?.role]);

  if (!hydrated && user && requiresKycCommerce(user.role)) {
    return null;
  }

  if (!mustCompleteKycBeforeApp(user)) {
    return <Outlet />;
  }

  if (isKycOnboardingAllowedPath(location.pathname, user?.role)) {
    return <Outlet />;
  }

  return <Navigate to="/auth/kyc" replace state={{ from: location }} />;
}
