import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  Check,
  ChevronRight,
  Search,
  CreditCard,
  MessageCircle,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import GlobalSearch from "../enterprise/GlobalSearch";
import SystemStatusBar from "../enterprise/SystemStatusBar";
import { notificationsApi } from "../../api/notificationsApi";
import { notificationsPathForRole } from "../../config/access";
import useAuthStore from "../../store/authStore";

const KIND = {
  success: { Icon: CreditCard, wrap: "bg-emerald-500/20 text-emerald-300" },
  info: { Icon: MessageCircle, wrap: "bg-sky-500/20 text-sky-200" },
  warning: { Icon: FileText, wrap: "bg-amber-500/20 text-amber-200" },
  contract: { Icon: Calendar, wrap: "bg-violet-500/20 text-violet-200" },
  default: { Icon: AlertTriangle, wrap: "bg-white/10 text-white/60" },
};

function mapNotifTypeToKind(notifType) {
  if (!notifType) return "info";
  const t = typeof notifType === "string" ? notifType : notifType?.value ?? String(notifType);
  if (t === "payment_received") return "success";
  if (t === "arrears" || t === "rent_due") return "warning";
  if (t === "lease_expiring") return "contract";
  return "info";
}

function normalizeNotif(n) {
  const kind = n.kind || mapNotifTypeToKind(n.notif_type);
  const cfg = KIND[kind] || KIND.default;
  const created = n.created_at ? new Date(n.created_at) : null;
  const timeLabel =
    created && !Number.isNaN(created.getTime()) ? formatDistanceToNow(created, { addSuffix: true }) : "";
  return { ...n, kind, cfg, timeLabel };
}

// Map path → breadcrumb labels (role-prefixed app)
const BREADCRUMBS = {
  "/dashboard": ["Home"],
  "/browse-properties": ["Browse", "Search"],
  "/tenant/dashboard": ["Tenant", "Dashboard"],
  "/tenant/saved": ["Tenant", "Saved"],
  "/tenant/applications": ["Tenant", "Applications"],
  "/tenant/wallet": ["Tenant", "Wallet"],
  "/tenant/notifications": ["Tenant", "Notifications"],
  "/tenant/profile": ["Tenant", "Profile"],
  "/tenant/pay": ["Tenant", "Payments"],
  "/tenant/contract": ["Tenant", "Lease contracts"],
  "/tenant/messages": ["Tenant", "Messages"],
  "/tenant/settings": ["Tenant", "Settings"],
  "/landlord/dashboard": ["Landlord", "Dashboard"],
  "/landlord/properties": ["Landlord", "Properties"],
  "/landlord/properties/new": ["Landlord", "Properties", "Add"],
  "/landlord/applicants": ["Landlord", "Applicants"],
  "/landlord/contracts": ["Landlord", "Contracts"],
  "/landlord/analytics": ["Landlord", "Analytics"],
  "/landlord/reports": ["Landlord", "Reports"],
  "/landlord/notifications": ["Landlord", "Notifications"],
  "/landlord/wallet": ["Landlord", "Wallet"],
  "/landlord/tenants": ["Landlord", "Tenants"],
  "/landlord/tenants/new": ["Landlord", "Tenants", "Add"],
  "/landlord/payments": ["Landlord", "Payments"],
  "/landlord/payments/new": ["Landlord", "Payments", "Record"],
  "/landlord/maintenance": ["Landlord", "Maintenance"],
  "/landlord/reports/arrears": ["Landlord", "Reports", "Arrears"],
  "/landlord/messages": ["Landlord", "Messages"],
  "/landlord/settings": ["Landlord", "Settings"],
  "/agent/dashboard": ["Agent", "Dashboard"],
  "/agent/leads": ["Agent", "Leads"],
  "/agent/clients": ["Agent", "Clients"],
  "/agent/schedules": ["Agent", "Schedules"],
  "/agent/deals": ["Agent", "Deals"],
  "/agent/commissions": ["Agent", "Commissions"],
  "/agent/analytics": ["Agent", "Analytics"],
  "/agent/notifications": ["Agent", "Notifications"],
  "/agent/messages": ["Agent", "Messages"],
  "/agent/settings": ["Agent", "Settings"],
  "/admin/dashboard": ["Admin", "Dashboard"],
  "/admin/users": ["Admin", "Users"],
  "/admin/listings": ["Admin", "Listings"],
  "/admin/moderation": ["Admin", "Moderation"],
  "/admin/payments": ["Admin", "Payments"],
  "/admin/contracts": ["Admin", "Contracts"],
  "/admin/fraud": ["Admin", "Fraud detection"],
  "/admin/analytics": ["Admin", "Analytics"],
  "/admin/reports": ["Admin", "Reports"],
  "/admin/support": ["Admin", "Support"],
  "/admin/audit-logs": ["Admin", "Audit logs"],
  "/admin/system-settings": ["Admin", "System settings"],
  "/admin/notifications": ["Admin", "Notifications"],
  "/admin/messages": ["Admin", "Messages"],
  "/admin/settings": ["Admin", "Settings"],
};

function getcrumbs(pathname) {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  if (pathname.startsWith("/landlord/properties/")) return ["Landlord", "Properties", "Details"];
  if (pathname.startsWith("/landlord/tenants/") && pathname !== "/landlord/tenants/new")
    return ["Landlord", "Tenants", "Profile"];
  if (pathname.startsWith("/property/")) return ["Browse", "Listing"];
  return ["App"];
}

function NotificationPanel({ onClose }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "landlord";

  const { data: raw, isError, isLoading } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => notificationsApi.list(),
  });

  const notifications = useMemo(() => (Array.isArray(raw) ? raw : []).map(normalizeNotif), [raw]);

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
    onError: () => toast.error("Could not reach server."),
  });

  const markOne = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
    onError: () => toast.error("Could not reach server."),
  });

  const allHref = notificationsPathForRole(role);

  return (
    <div className="absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-2rem)] animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-rd-elevated/95 shadow-modal backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/90">Notifications</h3>
        {notifications.some((n) => !n.is_read) && (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            className="text-xs font-semibold text-[#00C896] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-white/45">
            <p className="text-sm">Loading…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center text-sm text-red-300">
            Could not load notifications.
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-white/45">
            <Bell size={24} className="mb-2 opacity-40" />
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          notifications.map((n) => {
            const { Icon, wrap } = n.cfg;
            return (
              <div
                key={n.id}
                className={`flex gap-3 border-b border-white/[0.06] px-4 py-3 transition-colors hover:bg-white/[0.04] ${
                  !n.is_read ? "bg-brand-tealLt/10" : ""
                }`}
              >
                <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${wrap}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    {n.link ? (
                      <Link to={n.link} onClick={onClose} className="text-xs font-bold leading-snug text-white hover:text-[#00C896]">
                        {n.title}
                      </Link>
                    ) : (
                      <div className="text-xs font-bold text-white">{n.title}</div>
                    )}
                    {n.timeLabel ? (
                      <span className="flex-shrink-0 text-[10px] font-semibold text-white/35">{n.timeLabel}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">{n.message}</p>
                </div>
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => markOne.mutate(n.id)}
                    className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#00C896] hover:bg-white/10"
                    aria-label="Mark read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3 text-center">
        <Link to={allHref} onClick={onClose} className="text-xs font-bold text-[#00C896] hover:underline">
          View all notifications
        </Link>
      </div>
    </div>
  );
}

/**
 * Shared chrome for logged-in users: sidebar, top bar, scroll region.
 * Pass `<Outlet />` or any main content as `children`.
 */
export default function AuthenticatedAppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const location = useLocation();
  const crumbs = getcrumbs(location.pathname);
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "landlord";

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notif-count", role],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (location.state?.forbidden) {
      toast.error("You do not have access to that area.");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-brand-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-white/10 bg-rd-elevated/80 px-4 shadow-sm backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          <GlobalSearch />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => (
              <div key={`${c}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={13} className="flex-shrink-0 text-white/25" />}
                <span
                  className={
                    i === crumbs.length - 1 ? "truncate font-bold text-white" : "text-xs text-white/45"
                  }
                >
                  {c}
                </span>
              </div>
            ))}
          </div>

          <div className="relative flex-shrink-0" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-teal px-1 text-[10px] font-bold text-[#041208]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>
        </header>

        <div className="hidden border-b border-white/[0.06] bg-black/20 px-4 py-1.5 lg:flex lg:justify-end">
          <SystemStatusBar compact />
        </div>
        <main
          className="overflow-panel-y min-h-0 flex-1 bg-rd-gradient bg-rd-mesh p-4 lg:p-6"
          data-app-role={role}
        >
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
