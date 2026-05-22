import { useEffect, useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (canAccessGovernmentPortal(role) && sessionStorage.getItem("rd_gov_2fa_verified") !== "1") {
      navigate(GOV_PORTAL.verify2fa, { replace: true });
    }
  }, [role, navigate]);

  return (
    <div className="gov-portal">
      {sidebarOpen && (
        <button
          type="button"
          className="gov-sidebar-backdrop lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`gov-sidebar-shell ${sidebarOpen ? "gov-sidebar-shell--open" : ""}`}>
        <GovSidebar role={role} user={user} onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="gov-portal__main">
        <GovTopbar role={role} systemStatus={systemStatus} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <div className="gov-portal__scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
