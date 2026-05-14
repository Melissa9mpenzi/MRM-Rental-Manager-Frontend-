import { Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import AuthenticatedAppShell from "./AuthenticatedAppShell";
import MarketingLayout from "./MarketingLayout";

/**
 * Property search + listing detail use the same URLs for guests and signed-in users.
 * Guests see the marketing shell; authenticated users get the main app shell (sidebar, etc.).
 */
export default function MarketplaceShell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return (
      <AuthenticatedAppShell>
        <Outlet />
      </AuthenticatedAppShell>
    );
  }
  return <MarketingLayout />;
}
