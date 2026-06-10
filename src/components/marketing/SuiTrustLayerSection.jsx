import { Link } from "react-router-dom";
import {
  ArrowDown,
  Building2,
  FileText,
  Fingerprint,
  Receipt,
  Star,
  Wallet,
} from "lucide-react";
import {
  SUI_TRUST_CONTRAST,
  SUI_TRUST_FLOW,
  SUI_TRUST_HEADLINE,
  SUI_TRUST_NARRATIVE,
  SUI_TRUST_PILLARS,
} from "../../config/suiTrustLayer";

const AC = "#10B981";

const FLOW_ICONS = {
  "landlord-wallet": Wallet,
  listing: Building2,
  "property-object": Fingerprint,
  "tenant-wallet": Wallet,
  agreement: FileText,
  payment: Wallet,
  receipt: Receipt,
  reputation: Star,
};

export default function SuiTrustLayerSection({ id = "trust-layer", embedded = false }) {
  const content = (
    <>
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cyan-200">
          Sui trust layer
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">{SUI_TRUST_HEADLINE}</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">{SUI_TRUST_NARRATIVE}</p>
        <p className="mt-3 text-xs font-semibold text-white/40">{SUI_TRUST_CONTRAST}</p>
      </div>

      {/* Flow diagram */}
      <div className="mx-auto mt-12 max-w-md">
        <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-white/35">
          How rent becomes verifiable on Sui
        </p>
        <ol className="relative space-y-0">
          {SUI_TRUST_FLOW.map((step, i) => {
            const Icon = FLOW_ICONS[step.id] || Wallet;
            const isLast = i === SUI_TRUST_FLOW.length - 1;
            return (
              <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast ? (
                  <span
                    className="absolute left-[1.15rem] top-10 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-cyan-500/50 to-emerald-500/30"
                    aria-hidden
                  />
                ) : null}
                <div
                  className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/15 text-cyan-200"
                  style={{ boxShadow: `0 0 20px ${AC}22` }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="text-sm font-bold text-white">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{step.detail}</p>
                  {step.path ? (
                    <Link
                      to={step.path}
                      className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide text-emerald-400 hover:underline"
                    >
                      Open in app →
                    </Link>
                  ) : null}
                </div>
                {!isLast ? (
                  <ArrowDown className="absolute -bottom-1 left-3 h-4 w-4 text-cyan-500/40" aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Four pillars: traditional vs Sui */}
      <div className="mt-16 grid gap-5 lg:grid-cols-2">
        {SUI_TRUST_PILLARS.map((pillar) => (
          <div
            key={pillar.key}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-extrabold text-white">{pillar.title}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-300/80">Traditional</p>
                <p className="mt-2 text-xs text-white/55">{pillar.traditional.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {pillar.traditional.problems.map((p) => (
                    <li key={p} className="text-[11px] text-white/45">
                      · {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">{pillar.suiTitle}</p>
                <p className="mt-2 text-xs text-white/60">{pillar.sui.summary}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-cyan-100/80">{pillar.sui.explanation}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-white/30">
                  On Sui: {pillar.sui.stored.join(" · ")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          to="/browse-properties"
          className="rounded-2xl px-6 py-3 text-sm font-bold text-[#041208]"
          style={{ backgroundColor: AC }}
        >
          Browse verified listings
        </Link>
        <Link
          to="/login"
          className="rounded-2xl border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-bold text-white hover:border-emerald-500/40"
        >
          Sign in
        </Link>
      </div>
    </>
  );

  if (embedded) {
    return <div className="space-y-2">{content}</div>;
  }

  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-white/[0.06] bg-gradient-to-b from-[#060a0e] via-[#080d12] to-[#060a0e] py-16 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">{content}</div>
    </section>
  );
}
