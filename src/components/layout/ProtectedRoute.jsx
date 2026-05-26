import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { GOV_PORTAL, isGovernmentPublicAuthPath } from "../../config/governmentPortal";

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const path = location.pathname;

  if (!isAuthenticated) {
    if (path.startsWith("/government") && !isGovernmentPublicAuthPath(path)) {
      return <Navigate to={GOV_PORTAL.login} state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}