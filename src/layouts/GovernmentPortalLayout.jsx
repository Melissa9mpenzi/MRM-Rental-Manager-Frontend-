import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import GovSidebar from "../components/government/GovSidebar";
import GovTopbar from "../components/government/GovTopbar";
import { canAccessGovernmentPortal } from "../config/governmentAccess";
import { GOV_PORTAL } from "../config/governmentPortal";
import "../styles/government-portal.css";

export default function GovernmentPortalLayout({ systemStatus = "operational" }) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || "system_admin";
  const navigate = useNavigate();

  useEffect(() => {
    if (canAccessGovernmentPortal(role) && sessionStorage.getItem("rd_gov_2fa_verified") !== "1") {
      navigate(GOV_PORTAL.verify2fa, { replace: true });
    }
  }, [role, navigate]);

  return (
    <div className="gov-portal flex min-h-screen">
      <GovSidebar role={role} user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <GovTopbar role={role} systemStatus={systemStatus} />
        <main className="flex-1 overflow-y-auto bg-[#0b0e14] p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
