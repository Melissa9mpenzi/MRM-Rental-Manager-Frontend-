import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { defaultGovernmentPath, pathAllowedForGovernment } from "../../config/governmentAccess";

/** Redirect officers away from other agencies' routes (e.g. NIRA → not KCCA/URA). */
export default function GovernmentRouteGuard() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (!pathname.startsWith("/government")) return;
    if (!pathAllowedForGovernment(pathname, role)) {
      navigate(defaultGovernmentPath(role), { replace: true });
    }
  }, [pathname, role, navigate]);

  return <Outlet />;
}
