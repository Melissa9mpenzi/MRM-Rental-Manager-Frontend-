import { Shield, Building2, Landmark, Wallet, User } from "lucide-react";

const ICONS = {
  nira: Shield,
  kcca: Building2,
  ura: Landmark,
  payment: Wallet,
  user: User,
  platform: Shield,
};

const TONE = {
  nira:     "border-teal-100 bg-teal-50",
  kcca:     "border-sky-100 bg-sky-50",
  ura:      "border-amber-100 bg-amber-50",
  payment:  "border-violet-100 bg-violet-50",
  platform: "border-gray-100 bg-gray-50",
};

const ICON_COLOR = {
  nira:     "text-teal-600",
  kcca:     "text-sky-600",
  ura:      "text-amber-600",
  payment:  "text-violet-600",
  platform: "text-gray-500",
};

export default function ActivityTimeline({ items = [], title = "Recent activity", max = 8 }) {
  const rows = items.slice(0, max);
  if (!rows.length) {
    return (
      <div className="enterprise-card p-4">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="mt-3 text-sm text-gray-400">Activity will appear as verifications and payments occur.</p>
      </div>
    );
  }

  return (
    <div className="enterprise-card p-4">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <ul className="mt-3 space-y-2">
        {rows.map((ev) => {
          const Icon = ICONS[ev.type] || Shield;
          const tone = TONE[ev.type] || TONE.platform;
          const iconColor = ICON_COLOR[ev.type] || ICON_COLOR.platform;
          return (
            <li
              key={ev.id}
              className={`flex gap-3 rounded-xl border px-3 py-2.5 transition hover:brightness-95 ${tone}`}
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/60">
                <Icon size={14} className={iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800">{ev.title}</p>
                <p className="truncate text-[11px] text-gray-500">{ev.detail}</p>
              </div>
              <time className="flex-shrink-0 text-[10px] font-medium text-gray-400">
                {ev.at ? ev.at.replace("T", " ").slice(0, 16) : "—"}
              </time>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
