import { JUDGE_FAQ } from "../../config/hackathonPositioning";

/** Answers the “why Sui & Walrus?” question for demos and judges. */
export default function SuiJudgePitchPanel() {
  return (
    <div className="sui-panel border-violet-500/25 bg-violet-500/5">
      <p className="sui-panel__title text-violet-200">{JUDGE_FAQ.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{JUDGE_FAQ.shortAnswer}</p>
      <ul className="mt-4 space-y-2.5">
        {JUDGE_FAQ.points.map((p) => (
          <li key={p.heading} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
            <p className="text-xs font-bold text-violet-200">{p.heading}</p>
            <p className="mt-1 text-[11px] leading-snug text-white/55">{p.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-white/40">{JUDGE_FAQ.walrusStrategy}</p>
    </div>
  );
}
