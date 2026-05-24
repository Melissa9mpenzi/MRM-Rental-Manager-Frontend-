import { useState } from "react";
import { Outlet } from "react-router-dom";
import SuiSidebar from "../components/sui/SuiSidebar";
import SuiTopbar from "../components/sui/SuiTopbar";
import { useSuiDashboard } from "../lib/useSuiDashboard";
import "../styles/sui-portal.css";

export default function SuiPortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data } = useSuiDashboard();

  return (
    <div className="sui-portal">
      {sidebarOpen && (
        <button type="button" className="sui-sidebar-backdrop lg:hidden" aria-label="Close" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`sui-sidebar-shell ${sidebarOpen ? "sui-sidebar-shell--open" : ""}`}>
        <SuiSidebar wallet={data?.wallet} onNavigate={() => setSidebarOpen(false)} />
      </div>
      <div className="sui-portal__main">
        <SuiTopbar network={data?.network} onMenuClick={() => setSidebarOpen(true)} />
        <main className="sui-main">
          <Outlet context={{ dashboard: data }} />
        </main>
      </div>
    </div>
  );
}
