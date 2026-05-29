import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";

const OPTIONS = [
  { id: "system", label: "System default", icon: Monitor },
  { id: "light", label: "Light mode", icon: Sun },
  { id: "dark", label: "Dark mode", icon: Moon },
];

export default function ThemeToggleButton({ className = "" }) {
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-sm transition-colors hover:border-brand-teal/45 hover:bg-brand-teal/15 hover:text-brand-teal"
        title="Theme: light, dark, or system"
        aria-label="Open theme menu"
        aria-expanded={open}
      >
        <Palette size={18} strokeWidth={2.25} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[200] min-w-[11.5rem] rounded-xl border border-rd-stroke bg-rd-elevated p-1.5 shadow-modal backdrop-blur-xl"
          role="menu"
        >
          <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-mid">
            Appearance
          </p>
          {OPTIONS.map(({ id, label, icon: Icon }) => {
            const active = preference === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setPreference(id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-teal/20 text-brand-teal"
                    : "text-brand-dark hover:bg-white/[0.06]"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
