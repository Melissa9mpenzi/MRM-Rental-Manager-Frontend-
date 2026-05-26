import useAuthStore from "../store/authStore";
import { isSystemAdministrator } from "../config/governmentAccess";
import GovernmentPortalLayout from "./GovernmentPortalLayout";
import SystemPortalLayout from "./SystemPortalLayout";

/** Government officers → gov shell; system administrator → super-admin shell (same routes). */
export default function GovOrSystemPortalLayout(props) {
  const role = useAuthStore((s) => s.user?.role);

  if (isSystemAdministrator(role)) {
    return <SystemPortalLayout {...props} />;
  }
  return <GovernmentPortalLayout {...props} />;
}
