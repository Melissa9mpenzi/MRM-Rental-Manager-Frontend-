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
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-teal-700">
          Sui trust layer
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">{SUI_TRUST_HEADLINE}</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-500 sm:text-base">{SUI_TRUST_NARRATIVE}</p>
        <p className="mt-3 text-xs font-semibold text-gray-400">{SUI_TRUST_CONTRAST}</p>
      </div>

      {/* Flow diagram */}
      <div className="mx-auto mt-12 max-w-md">
        <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
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
                    className="absolute left-[1.15rem] top-10 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-teal-300 to-teal-100"
                    aria-hidden
                  />
                ) : null}
                <div
                  className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-600"
                  style={{ boxShadow: `0 0 16px ${AC}22` }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                  <p className="text-sm font-bold text-gray-800">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{step.detail}</p>
                  {step.path ? (
                    <Link
                      to={step.path}
                      className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide text-teal-600 hover:underline"
                    >
                      Open in app →
                    </Link>
                  ) : null}
                </div>
                {!isLast ? (
                  <ArrowDown className="absolute -bottom-1 left-3 h-4 w-4 text-teal-300" aria-hidden />
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
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-extrabold text-gray-900">{pillar.title}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Traditional</p>
                <p className="mt-2 text-xs text-gray-600">{pillar.traditional.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {pillar.traditional.problems.map((p) => (
                    <li key={p} className="text-[11px] text-gray-500">
                      · {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">{pillar.suiTitle}</p>
                <p className="mt-2 text-xs text-gray-600">{pillar.sui.summary}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-teal-700">{pillar.sui.explanation}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
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
          className="rounded-2xl px-6 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: AC }}
        >
          Browse verified listings
        </Link>
        <Link
          to="/login"
          className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:border-teal-300 hover:text-teal-600 transition-colors"
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
      className="scroll-mt-24 border-t border-gray-100 bg-white py-16 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">{content}</div>
    </section>
  );
}
