import { Star } from "lucide-react";

const LEVEL_TONE = {
  new: "border-white/15 bg-white/5 text-white/60",
  building: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  trusted: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
  established: "border-violet-500/35 bg-violet-500/10 text-violet-200",
};

export default function WalletReputationCard({ reputation, suiAddress }) {
  if (!reputation && !suiAddress) return null;

  const rep = reputation || {};
  const tone = LEVEL_TONE[rep.level] || LEVEL_TONE.new;
  const stats = rep.stats || {};

  return (
    <div className={`card-glass border p-5 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
            <Star size={14} className="text-amber-300" />
            Trust score
          </p>
          <p className="mt-1 text-xs text-white/50">Updates after listings, leases, and payments.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">{rep.score ?? 0}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">
            {rep.label || "New on-chain"}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Properties", value: stats.properties_on_sui ?? 0 },
          { label: "Agreements", value: stats.agreements_anchored ?? 0 },
          { label: "Payments", value: stats.on_chain_payments ?? 0 },
        ].map((row) => (
          <div key={row.label} className="rounded-lg border border-white/8 bg-black/20 px-2 py-2">
            <p className="text-lg font-bold text-white">{row.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">{row.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
