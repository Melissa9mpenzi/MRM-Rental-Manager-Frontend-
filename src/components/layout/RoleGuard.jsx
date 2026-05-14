import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";

/**
 * Enforces that `user.role` is one of `allowed` API roles before rendering nested routes.
 * Wrong role → redirect to that user's home dashboard (never trust client-only role for access).
 */
export default function RoleGuard({ allowed = [] }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const role = user?.role;

  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowed.includes(role)) {
    return <Navigate to={defaultDashboardPath(role)} replace state={{ forbidden: true }} />;
  }

  return <Outlet />;
}
