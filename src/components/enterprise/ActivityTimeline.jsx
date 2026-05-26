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
  nira: "border-emerald-500/30 bg-emerald-500/10",
  kcca: "border-cyan-500/30 bg-cyan-500/10",
  ura: "border-amber-500/30 bg-amber-500/10",
  payment: "border-violet-500/30 bg-violet-500/10",
  platform: "border-white/15 bg-white/5",
};

export default function ActivityTimeline({ items = [], title = "Recent activity", max = 8 }) {
  const rows = items.slice(0, max);
  if (!rows.length) {
    return (
      <div className="enterprise-card p-4">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="mt-3 text-sm text-white/45">Activity will appear as verifications and payments occur.</p>
      </div>
    );
  }

  return (
    <div className="enterprise-card p-4">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <ul className="mt-3 space-y-2">
        {rows.map((ev) => {
          const Icon = ICONS[ev.type] || Shield;
          const tone = TONE[ev.type] || TONE.platform;
          return (
            <li
              key={ev.id}
              className={`flex gap-3 rounded-xl border px-3 py-2.5 transition hover:bg-white/[0.02] ${tone}`}
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-black/20">
                <Icon size={14} className="text-white/80" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white">{ev.title}</p>
                <p className="truncate text-[11px] text-white/50">{ev.detail}</p>
              </div>
              <time className="flex-shrink-0 text-[10px] font-medium text-white/35">
                {ev.at ? ev.at.replace("T", " ").slice(0, 16) : "—"}
              </time>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
