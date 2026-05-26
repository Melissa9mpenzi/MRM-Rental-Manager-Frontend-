import { Link } from "react-router-dom";
import { DEMO_CREDENTIALS, DEFI_DEMO_FLOW, PITCH_LINE } from "../../config/demoStory";
import {
  HACKATHON_TRACKS,
  SUI_DEPLOYMENT,
  JUDGE_ONE_LINER,
  JUDGE_FAQ,
  WALRUS_USE_CASES,
  SUI_DEMO_FLOW,
  WINNING_POSITIONING,
  SUI_NATIVE_TAGLINE,
} from "../../config/hackathonPositioning";

export default function DemoGuidePage() {
  const primary = HACKATHON_TRACKS.primary;
  const secondary = HACKATHON_TRACKS.secondary;

  return (
    <div className="min-h-screen bg-[#060a0e] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-semibold text-emerald-400 hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold">Hackathon demo guide</h1>
        <p className="mt-2 text-lg text-white/75">{SUI_NATIVE_TAGLINE}</p>
        <p className="mt-2 text-sm text-white/55">{WINNING_POSITIONING}</p>
        <p className="mt-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
          <strong>Judge one-liner:</strong> {JUDGE_ONE_LINER}
        </p>

        <div className="mt-4 rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4">
          <p className="text-sm font-bold text-violet-200">{JUDGE_FAQ.title}</p>
          <p className="mt-2 text-sm text-white/70">{JUDGE_FAQ.shortAnswer}</p>
          <ul className="mt-3 space-y-2 text-xs text-white/55">
            {JUDGE_FAQ.points.map((p) => (
              <li key={p.heading}>
                <strong className="text-violet-200">{p.heading}:</strong> {p.body}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="text-xs font-bold uppercase text-violet-300">{primary.badge}</p>
            <p className="mt-1 font-bold">{primary.label}</p>
            <p className="mt-2 text-xs text-white/55">{primary.summary}</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <p className="text-xs font-bold uppercase text-cyan-300">{secondary.badge}</p>
            <p className="mt-1 font-bold">{secondary.label}</p>
            <p className="mt-2 text-xs text-white/55">{secondary.summary}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-white/50">
          Deploy on <strong className="text-white">{SUI_DEPLOYMENT.label}</strong> — set{" "}
          <code className="text-xs">SUI_NETWORK=testnet</code> and <code className="text-xs">VITE_SUI_NETWORK=testnet</code>
        </p>

        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Run <code className="font-mono text-xs">python -m app.utils.seed_data</code> on the backend first.
        </p>

        <h2 className="mt-10 text-lg font-bold">Sui judge demo (5 min)</h2>
        <ol className="mt-4 space-y-2">
          {SUI_DEMO_FLOW.map((s) => (
            <li key={s.step} className="flex gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
              <span className="font-black text-violet-400">{s.step}</span>
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-xs text-white/45">{s.detail}</div>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-lg font-bold">Product flow (supporting)</h2>
        <ol className="mt-4 space-y-2">
          {DEFI_DEMO_FLOW.map((s) => (
            <li key={s.step} className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span className="font-black text-emerald-400">{s.step}</span>
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-xs text-white/45">{s.detail}</div>
                <Link to={s.path} className="text-xs font-bold text-emerald-400 hover:underline">
                  {s.path} →
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-lg font-bold">Walrus artifacts (secondary)</h2>
        <ul className="mt-3 space-y-1 text-sm text-white/60">
          {WALRUS_USE_CASES.map((w) => (
            <li key={w.key}>
              <strong className="text-white/80">{w.title}</strong> — {w.desc}
            </li>
          ))}
        </ul>

        {!import.meta.env.PROD && (
          <>
        <h2 className="mt-10 text-lg font-bold">Local QA accounts (development only)</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-white/45">
              <tr>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Password</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {DEMO_CREDENTIALS.map((c) => (
                <tr key={c.email} className="border-t border-white/5">
                  <td className="px-4 py-3 font-semibold">{c.role}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/70">{c.email}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.password}</td>
                  <td className="px-4 py-3">
                    <Link to={c.portal} className="text-xs font-bold text-emerald-400 hover:underline">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </>
        )}

        <p className="mt-8 text-xs text-white/40">
          Avoid positioning as DeepBook / DEX — we are rental payment infrastructure. See HACKATHON.md in the repo.
        </p>
      </div>
    </div>
  );
}
