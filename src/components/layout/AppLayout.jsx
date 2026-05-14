import { Outlet } from "react-router-dom";
import AuthenticatedAppShell from "./AuthenticatedAppShell";

/** Authenticated module shell (sidebar + top bar). Child routes render in `<Outlet />`. */
export default function AppLayout() {
  return (
    <AuthenticatedAppShell>
      <Outlet />
    </AuthenticatedAppShell>
  );
}
