import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";

const OPTIONS = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

export default function ThemeSelector({ compact = false }) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      className={
        compact
          ? "inline-flex rounded-xl border border-rd-stroke bg-white/5 p-0.5"
          : "grid grid-cols-3 gap-2"
      }
      role="radiogroup"
      aria-label="Theme"
    >
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = preference === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(id)}
            className={
              compact
                ? `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-brand-teal text-[#041208]"
                      : "text-brand-mid hover:text-brand-dark"
                  }`
                : `flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-semibold transition-all ${
                    active
                      ? "border-brand-teal/50 bg-brand-tealLt text-brand-teal shadow-glow"
                      : "border-rd-stroke bg-white/[0.04] text-brand-mid hover:border-brand-teal/30 hover:text-brand-dark"
                  }`
            }
          >
            <Icon size={compact ? 14 : 20} />
            {!compact && label}
            {compact && <span className="hidden sm:inline">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
