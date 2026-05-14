import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CreditCard,
  MessageCircle,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { notificationsApi } from "../../api/notificationsApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

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

function normalizeItem(n) {
  const kind = n.kind || mapNotifTypeToKind(n.notif_type);
  const cfg = KIND[kind] || KIND.default;
  const created = n.created_at ? new Date(n.created_at) : null;
  const timeLabel = created && !Number.isNaN(created.getTime())
    ? formatDistanceToNow(created, { addSuffix: true })
    : "";
  return { ...n, kind, cfg, timeLabel };
}

export default function SharedInAppNotificationsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "landlord";

  const { data: raw, isLoading, isError } = useQuery({
    queryKey: ["notifications", role],
    queryFn: () => notificationsApi.list(),
  });

  const items = useMemo(() => (Array.isArray(raw) ? raw : []).map(normalizeItem), [raw]);
  const [localRead, setLocalRead] = useState(() => new Set());

  const effective = useMemo(
    () =>
      items.map((n) => ({
        ...n,
        is_read: n.is_read || localRead.has(String(n.id)),
      })),
    [items, localRead],
  );

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
      toast.success("Marked all as read.");
    },
    onError: () => {
      toast.error("Could not mark all as read.");
    },
  });

  const markOne = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
    onError: () => {
      toast.error("Could not mark as read.");
    },
  });

  const unread = effective.filter((n) => !n.is_read).length;

  return (
    <AppPageScaffold
      variant="concierge"
      icon={Bell}
      title="Notifications"
      description="Payments, messages, applications, and lease reminders — full history."
      actions={
        unread > 0 ? (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-[#00C896] transition hover:bg-[#00C896]/10"
          >
            Mark all as read
          </button>
        ) : null
      }
    >
      <div className="card-glass divide-y divide-white/[0.06] overflow-hidden border border-white/[0.08]">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-white/45">Loading…</div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-red-300">Could not load notifications.</div>
        ) : effective.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-white/45">
            <Bell size={28} className="opacity-40" />
            <p className="text-sm">All caught up.</p>
          </div>
        ) : (
          effective.map((n) => {
            const { Icon, wrap } = n.cfg;
            return (
              <div
                key={n.id}
                className={`flex gap-4 px-4 py-4 transition-colors hover:bg-white/[0.03] ${!n.is_read ? "bg-brand-tealLt/5" : ""}`}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${wrap}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    {n.link ? (
                      <Link to={n.link} className="text-sm font-bold text-white hover:text-[#00C896]">
                        {n.title}
                      </Link>
                    ) : (
                      <div className="text-sm font-bold text-white">{n.title}</div>
                    )}
                    {n.timeLabel && <span className="text-[11px] font-semibold text-white/35">{n.timeLabel}</span>}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">{n.message}</p>
                </div>
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => markOne.mutate(n.id)}
                    className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#00C896] hover:bg-white/10"
                    aria-label="Mark read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </AppPageScaffold>
  );
}
