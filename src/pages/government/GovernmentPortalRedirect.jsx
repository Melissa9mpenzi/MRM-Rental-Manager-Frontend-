import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { defaultGovernmentPath } from "../../config/governmentAccess";

export default function GovernmentPortalRedirect() {
  const role = useAuthStore((s) => s.user?.role);
  return <Navigate to={defaultGovernmentPath(role)} replace />;
}
