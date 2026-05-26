import {
  CreditCard,
  MessageCircle,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const NOTIF_KIND = {
  success: { Icon: CreditCard, wrap: "bg-emerald-500/20 text-emerald-300" },
  info: { Icon: MessageCircle, wrap: "bg-sky-500/20 text-sky-200" },
  warning: { Icon: FileText, wrap: "bg-amber-500/20 text-amber-200" },
  contract: { Icon: Calendar, wrap: "bg-violet-500/20 text-violet-200" },
  default: { Icon: AlertTriangle, wrap: "bg-white/10 text-white/60" },
};

export function mapNotifTypeToKind(notifType) {
  if (!notifType) return "info";
  const t = typeof notifType === "string" ? notifType : notifType?.value ?? String(notifType);
  if (t === "payment_received") return "success";
  if (t === "arrears" || t === "rent_due") return "warning";
  if (t === "lease_expiring") return "contract";
  return "info";
}

export function normalizeNotif(n) {
  const kind = n.kind || mapNotifTypeToKind(n.notif_type);
  const cfg = NOTIF_KIND[kind] || NOTIF_KIND.default;
  const created = n.created_at ? new Date(n.created_at) : null;
  const timeLabel =
    created && !Number.isNaN(created.getTime())
      ? formatDistanceToNow(created, { addSuffix: true })
      : "";
  return { ...n, kind, cfg, timeLabel };
}
