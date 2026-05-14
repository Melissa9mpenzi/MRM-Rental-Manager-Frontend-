import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";

/** Maps `/dashboard` → the correct role-prefixed home. */
export default function RoleHomeRedirect() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  return <Navigate to={defaultDashboardPath(role)} replace />;
}
