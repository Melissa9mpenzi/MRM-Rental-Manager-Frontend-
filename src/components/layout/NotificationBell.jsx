import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import toast from "react-hot-toast";
import { notificationsApi } from "../../api/notificationsApi";
import { notificationsPathForRole } from "../../config/access";
import { normalizeNotif } from "../../lib/notificationUtils";
import useAuthStore from "../../store/authStore";
import GovTopbarDropdown from "../government/GovTopbarDropdown";

const POLL_OPEN_MS = 12_000;
const POLL_IDLE_MS = 25_000;

/**
 * Real-time notification bell (API + optional gov compliance alerts).
 * variant: app | gov | sys
 */
export default function NotificationBell({
  variant = "app",
  govAlerts = [],
  govBadgeExtra = 0,
  onOpenChange,
  className = "",
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "landlord";
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const pollMs = open ? POLL_OPEN_MS : POLL_IDLE_MS;

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notif-count", role],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: pollMs,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });

  const { data: raw, isError, isLoading, refetch } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => notificationsApi.list(),
    refetchInterval: open ? pollMs : false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });

  const notifications = useMemo(
    () => (Array.isArray(raw) ? raw : []).map(normalizeNotif),
    [raw]
  );

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
    onError: () => toast.error("Could not mark notifications as read."),
  });

  const markOne = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
    onError: () => toast.error("Could not update notification."),
  });

  const allHref = notificationsPathForRole(role);
  const badge = Math.min(99, Math.max(0, unreadCount) + Math.max(0, govBadgeExtra));

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => setOpen((o) => !o);

  const buttonClass =
    variant === "gov" || variant === "sys"
      ? `gov-icon-btn relative ${open ? "gov-icon-btn--active" : ""} ${className}`
      : `relative flex h-9 w-9 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white ${className}`;

  const panelApp = (
    <div className="absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-2rem)] animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-rd-elevated/95 shadow-modal backdrop-blur-2xl">
      <PanelHeader
        hasUnread={notifications.some((n) => !n.is_read)}
        onMarkAll={() => markAll.mutate()}
        onRefresh={() => refetch()}
      />
      <PanelBody
        isLoading={isLoading}
        isError={isError}
        notifications={notifications}
        markOne={markOne}
        onClose={() => setOpen(false)}
        govAlerts={govAlerts}
        variant={variant}
        navigate={navigate}
      />
      <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3 text-center">
        <Link
          to={allHref}
          onClick={() => setOpen(false)}
          className="text-xs font-bold text-[#00C896] hover:underline"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );

  const panelGov = (
    <GovTopbarDropdown open={open} onClose={() => setOpen(false)} className="gov-topbar-menu--wide">
      <p className="gov-topbar-menu__title">Notifications</p>
      {isLoading && <p className="gov-topbar-menu__empty">Loading…</p>}
      {isError && <p className="gov-topbar-menu__empty text-red-300">Could not load notifications.</p>}
      {!isLoading &&
        !isError &&
        notifications.slice(0, 5).map((n) => (
          <button
            key={n.id}
            type="button"
            role="menuitem"
            className="gov-topbar-menu__alert w-full text-left"
            onClick={() => {
              setOpen(false);
              if (n.link) navigate(n.link);
            }}
          >
            <span className={`gov-topbar-menu__dot ${n.is_read ? "" : "gov-topbar-menu__dot--high"}`} />
            <span>
              <span className="block font-medium text-white/90">{n.title}</span>
              <span className="block text-[11px] text-white/50">{n.message}</span>
            </span>
          </button>
        ))}
      {govAlerts.length > 0 && (
        <>
          <p className="gov-topbar-menu__title mt-2 border-t border-white/10 pt-2">Compliance alerts</p>
          {govAlerts.slice(0, 6).map((a) => (
            <button
              key={a.id}
              type="button"
              role="menuitem"
              className="gov-topbar-menu__alert w-full text-left"
              onClick={() => {
                setOpen(false);
                if (a.to) navigate(a.to);
                else navigate("/government/fraud");
              }}
            >
              <span className={`gov-topbar-menu__dot gov-topbar-menu__dot--${a.severity || "medium"}`} />
              <span>
                <span className="block font-medium text-white/90">{a.title}</span>
                <span className="block text-[11px] text-white/50">{a.subject || a.detail}</span>
              </span>
            </button>
          ))}
        </>
      )}
      {!isLoading && notifications.length === 0 && govAlerts.length === 0 && (
        <p className="gov-topbar-menu__empty">All caught up.</p>
      )}
      <Link to={allHref} className="gov-topbar-menu__footer" onClick={() => setOpen(false)}>
        View all →
      </Link>
    </GovTopbarDropdown>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={buttonClass}
        title="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
      >
        <Bell size={18} />
        {badge > 0 && (
          <span
            className={
              variant === "gov" || variant === "sys"
                ? "gov-icon-btn__badge"
                : "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-teal px-1 text-[10px] font-bold text-[#041208]"
            }
          >
            {badge > 99 ? "99+" : badge > 9 && variant !== "gov" && variant !== "sys" ? "9+" : badge}
          </span>
        )}
      </button>
      {variant === "gov" || variant === "sys" ? (open ? panelGov : null) : open ? panelApp : null}
    </div>
  );
}

function PanelHeader({ hasUnread, onMarkAll, onRefresh }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
      <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/90">Notifications</h3>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onRefresh} className="text-[10px] font-semibold text-white/45 hover:text-white">
          Refresh
        </button>
        {hasUnread && (
          <button type="button" onClick={onMarkAll} className="text-xs font-semibold text-[#00C896] hover:underline">
            Mark all read
          </button>
        )}
      </div>
    </div>
  );
}

function PanelBody({ isLoading, isError, notifications, markOne, onClose, govAlerts, variant, navigate }) {
  return (
    <div className="max-h-80 overflow-y-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-white/45">
          <p className="text-sm">Loading…</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center text-sm text-red-300">
          Could not load notifications.
        </div>
      ) : (
        <>
          {notifications.length === 0 && govAlerts.length === 0 ? (
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
                        <Link
                          to={n.link}
                          onClick={onClose}
                          className="text-xs font-bold leading-snug text-white hover:text-[#00C896]"
                        >
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
          {variant === "app" && govAlerts.length > 0 && (
            <div className="border-t border-white/10 px-4 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Compliance</p>
              {govAlerts.slice(0, 4).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-white/80 hover:bg-white/[0.06]"
                  onClick={() => {
                    onClose();
                    navigate(a.to || "/government/fraud");
                  }}
                >
                  {a.title}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
