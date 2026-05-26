import { useState } from "react";
import { Outlet } from "react-router-dom";
import SystemSidebar from "../components/system/SystemSidebar";
import SystemTopbar from "../components/system/SystemTopbar";
import "../styles/system-admin.css";
import "../styles/government-portal.css";

export default function SystemPortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="sys-portal">
      {sidebarOpen && (
        <button
          type="button"
          className="sys-sidebar-backdrop lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`sys-sidebar-shell ${sidebarOpen ? "sys-sidebar-shell--open" : ""}`}
      >
        <SystemSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="sys-portal__main">
        <SystemTopbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="sys-main sys-main--full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
