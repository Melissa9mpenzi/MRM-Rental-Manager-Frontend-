import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { postLoginDestination } from "../../lib/onboardingAuth";

/** Maps `/dashboard` → onboarding step or the correct role home. */
export default function RoleHomeRedirect() {
  const user = useAuthStore((s) => s.user);
  const next = postLoginDestination(user);
  return <Navigate to={next} replace />;
}
