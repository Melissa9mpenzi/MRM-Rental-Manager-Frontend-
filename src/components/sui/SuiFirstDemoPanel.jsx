import { Link } from "react-router-dom";
import {
  SUI_DEMO_FLOW,
  SUI_NATIVE_TAGLINE,
  WHY_NOT_WITHOUT_SUI,
  HACKATHON_TRACKS,
} from "../../config/hackathonPositioning";

/** Judge-facing demo script + Sui-native positioning */
export default function SuiFirstDemoPanel() {
  const primary = HACKATHON_TRACKS.primary;

  return (
    <div className="space-y-4">
      <div className="sui-panel border-violet-500/30 bg-gradient-to-br from-violet-600/15 to-cyan-600/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">
          {primary.badge} · {primary.label}
        </p>
        <h2 className="mt-2 text-lg font-extrabold leading-snug text-white">{SUI_NATIVE_TAGLINE}</h2>
        <p className="mt-2 text-xs leading-relaxed text-white/60">{primary.summary}</p>
      </div>

      <div className="sui-panel border-amber-500/25 bg-amber-500/5">
        <p className="text-sm font-bold text-amber-200">{WHY_NOT_WITHOUT_SUI.title}</p>
        <p className="mt-2 text-xs leading-relaxed text-white/65">{WHY_NOT_WITHOUT_SUI.answer}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {WHY_NOT_WITHOUT_SUI.pillars.map((p) => (
            <li key={p.title} className="rounded-lg border border-white/8 bg-black/25 px-3 py-2">
              <p className="text-[11px] font-bold text-cyan-200">{p.title}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-white/50">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="sui-panel">
        <p className="sui-panel__title">5-minute judge demo</p>
        <ol className="mt-3 space-y-2">
          {SUI_DEMO_FLOW.map((s) => (
            <li key={s.step} className="flex gap-3 rounded-lg border border-white/8 px-3 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/25 text-xs font-black text-violet-200">
                {s.step}
              </span>
              <div>
                <p className="text-xs font-bold text-white">{s.title}</p>
                <p className="text-[10px] text-white/50">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          {primary.demoPaths.map((path) => (
            <Link
              key={path}
              to={path.startsWith("/verify") ? "/receipts" : path}
              className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold text-violet-200 hover:bg-violet-500/20"
            >
              {path}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
