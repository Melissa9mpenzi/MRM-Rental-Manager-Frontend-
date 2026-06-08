import { Building2, CreditCard, FileText, Layers } from "lucide-react";
import { SUI_BLOCKCHAIN_VALUE } from "../../config/hackathonPositioning";

const AC = "#10B981";

const ICONS = {
  property: Building2,
  agreements: FileText,
  payments: CreditCard,
  ownership: Layers,
};

export default function SuiBlockchainValueSection({ id = "blockchain", compact = false, embedded = false }) {
  const { title, subtitle, pillars } = SUI_BLOCKCHAIN_VALUE;

  const content = (
    <>
      <div className={`mx-auto text-center ${compact ? "max-w-2xl" : "max-w-3xl"}`}>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
          Sui · Walrus · Move
        </div>
        <h2 className={`mt-4 font-extrabold text-white ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}`}>
          {title}
        </h2>
        <p className={`mt-3 text-white/55 ${compact ? "text-sm" : "text-sm sm:text-base"}`}>{subtitle}</p>
      </div>

      <div className={`mt-10 grid gap-4 sm:grid-cols-2 ${compact ? "" : "lg:gap-5"}`}>
        {pillars.map(({ key, title: pillarTitle, body, tagline, benefits, featured }) => {
          const Icon = ICONS[key] || Building2;
          return (
            <div
              key={key}
              className={`rounded-2xl border bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-[#10B981]/30 ${
                featured ? "border-cyan-500/30 sm:col-span-2" : "border-white/[0.08]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10"
                  style={{ backgroundColor: `${AC}18`, color: featured ? "#22d3ee" : AC }}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
                {featured ? (
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                    Automatic + KCCA
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{pillarTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
              {featured && tagline ? (
                <p className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm leading-relaxed text-cyan-100/90">
                  {tagline}
                </p>
              ) : null}
              {benefits?.length ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                  {benefits.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-xs leading-snug text-white/60"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {featured ? (
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-white/35">
                  Two layers: Sui listing identity (auto) · KCCA compliance (officer review)
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );

  if (embedded) {
    return <div className="space-y-2">{content}</div>;
  }

  return (
    <section
      id={id}
      className={`scroll-mt-24 border-t border-white/[0.06] bg-gradient-to-b from-[#080d12] to-[#060a0e] ${compact ? "py-10" : "py-16 lg:py-24"}`}
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">{content}</div>
    </section>
  );
}
