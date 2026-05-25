import { HardDrive, FileText, Shield, Building2, Lock, Landmark } from "lucide-react";
import { WALRUS_USE_CASES, SUI_DEPLOYMENT } from "../../config/hackathonPositioning";

const ICONS = {
  receipts: FileText,
  contracts: FileText,
  kyc: Shield,
  property: Building2,
  escrow: Lock,
  audit: Landmark,
};

export default function WalrusUseCasesPanel({ walrusConfigured, inventory }) {
  const counts = inventory?.counts;
  return (
    <div className="sui-panel border-cyan-500/20 bg-cyan-500/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sui-panel__title flex items-center gap-2">
            <HardDrive size={16} className="text-cyan-400" />
            Walrus — decentralized proofs
          </p>
          <p className="mt-1 text-xs text-white/50">
            Secondary hackathon track. Network: <strong className="text-cyan-200">{SUI_DEPLOYMENT.label}</strong>
            {walrusConfigured ? " · Publisher connected" : " · Demo mode (content hashes until publisher URL is set)"}
          </p>
        </div>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-cyan-200">
          Special track
        </span>
      </div>
      {counts && (
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-white/50">
          <span className="rounded-full border border-white/10 px-2 py-0.5">
            KYC <strong className="text-cyan-200">{counts.kyc_manifests ?? 0}</strong>
          </span>
          <span className="rounded-full border border-white/10 px-2 py-0.5">
            Properties <strong className="text-cyan-200">{counts.property_packets ?? 0}</strong>
          </span>
          <span className="rounded-full border border-white/10 px-2 py-0.5">
            Audit <strong className="text-cyan-200">{counts.audit_entries ?? 0}</strong>
          </span>
          <span className="rounded-full border border-white/10 px-2 py-0.5">
            Receipts <strong className="text-cyan-200">{counts.payment_receipts ?? 0}</strong>
          </span>
          <span className="rounded-full border border-white/10 px-2 py-0.5">
            Escrow <strong className="text-cyan-200">{(counts.escrow_lease_proofs ?? 0) + (counts.escrow_release_proofs ?? 0)}</strong>
          </span>
        </div>
      )}
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {WALRUS_USE_CASES.map((u) => {
          const Icon = ICONS[u.key] || FileText;
          const countKey =
            u.key === "kyc"
              ? "kyc_manifests"
              : u.key === "property"
                ? "property_packets"
                : u.key === "audit"
                  ? "audit_entries"
                  : u.key === "receipts"
                    ? "payment_receipts"
                    : u.key === "escrow"
                      ? "escrow_lease_proofs"
                      : null;
          const n = countKey && counts ? counts[countKey] : null;
          return (
            <li
              key={u.key}
              className="flex gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5 transition hover:border-cyan-500/25"
            >
              <Icon size={14} className="mt-0.5 shrink-0 text-cyan-400/80" />
              <div>
                <p className="text-xs font-bold text-white">
                  {u.title}
                  {n != null ? <span className="ml-1 font-normal text-cyan-300/80">({n})</span> : null}
                </p>
                <p className="text-[10px] leading-snug text-white/45">{u.desc}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
