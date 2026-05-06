import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Bell, Check, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "./Sidebar";
import { notificationsApi } from "../../api/notificationsApi";
import { Link } from "react-router-dom";

// Map path → breadcrumb label
const BREADCRUMBS = {
  "/dashboard":       ["Dashboard"],
  "/properties":      ["Properties"],
  "/tenants":         ["Tenants"],
  "/tenants/new":     ["Tenants", "Add Tenant"],
  "/payments":        ["Payments"],
  "/payments/new":    ["Payments", "Record Payment"],
  "/maintenance":     ["Maintenance"],
  "/reports/arrears": ["Reports", "Arrears"],
  "/settings":        ["Settings"],
};

function getcrumbs(pathname) {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  if (pathname.startsWith("/properties/")) return ["Properties", "Details"];
  if (pathname.startsWith("/tenants/"))    return ["Tenants", "Profile"];
  return ["Dashboard"];
}

function NotificationPanel({ onClose }) {
  const qc = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
  });
  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notif-count"] }); },
  });
  const markOne = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notif-count"] }); },
  });

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-brand-tealLt z-50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-tealLt bg-brand-bg/50">
        <h3 className="font-bold text-brand-dark text-sm">Notifications</h3>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={() => markAll.mutate()} className="text-xs text-brand-teal font-semibold hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-brand-mid">
            <Bell size={24} className="mb-2 opacity-40" />
            <p className="text-sm">All caught up!</p>
          </div>
        ) : notifications.map((n) => (
          <div key={n.id}
            className={`flex gap-3 px-4 py-3 border-b border-brand-tealLt/40 hover:bg-brand-tealLt/20 transition-colors ${!n.is_read ? "bg-brand-tealLt/10" : ""}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? "bg-brand-teal" : "bg-transparent"}`} />
            <div className="flex-1 min-w-0">
              {n.link
                ? <Link to={n.link} onClick={onClose} className="text-xs font-bold text-brand-dark hover:text-brand-teal">{n.title}</Link>
                : <div className="text-xs font-bold text-brand-dark">{n.title}</div>
              }
              <p className="text-xs text-brand-mid mt-0.5 line-clamp-2">{n.message}</p>
            </div>
            {!n.is_read && (
              <button onClick={() => markOne.mutate(n.id)} className="text-brand-teal hover:text-brand-dark flex-shrink-0 mt-0.5">
                <Check size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const notifRef  = useRef();
  const location  = useLocation();
  const crumbs    = getcrumbs(location.pathname);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notif-count"],
    queryFn:  notificationsApi.unreadCount,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f5f4]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Top bar ── */}
        <header className="h-14 bg-white/90 backdrop-blur-sm border-b border-brand-tealLt/60 flex items-center px-4 gap-3 flex-shrink-0 shadow-sm">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-tealLt text-brand-mid hover:text-brand-dark transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
            {crumbs.map((c, i) => (
              <div key={c} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={13} className="text-brand-mid/50 flex-shrink-0" />}
                <span className={i === crumbs.length - 1 ? "font-bold text-brand-dark truncate" : "text-brand-mid text-xs"}>
                  {c}
                </span>
              </div>
            ))}
          </div>

          {/* Notification bell */}
          <div className="relative flex-shrink-0" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-tealLt transition-colors"
            >
              <Bell size={18} className="text-brand-mid" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}