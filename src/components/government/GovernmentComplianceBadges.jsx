import { Shield, Building2, Landmark } from "lucide-react";
import { COMPLIANCE_BADGES } from "../../config/governmentRoles";

const ICONS = {
  nira_verified_landlord: Shield,
  kcca_approved_property: Building2,
  ura_compliant: Landmark,
};

const TONE_CLASS = {
  nira_verified_landlord: "border-emerald-500/35 bg-emerald-500/15 text-emerald-200",
  kcca_approved_property: "border-cyan-500/35 bg-cyan-500/15 text-cyan-200",
  ura_compliant: "border-amber-500/35 bg-amber-500/15 text-amber-200",
};

/**
 * @param {{ compliance?: Record<string, boolean>, compact?: boolean, className?: string }} props
 */
export default function GovernmentComplianceBadges({ compliance = {}, compact = false, className = "" }) {
  const active = COMPLIANCE_BADGES.filter((b) => compliance[b.key]);
  if (!active.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {active.map((b) => {
        const Icon = ICONS[b.key] || Shield;
        return (
          <span
            key={b.key}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-bold ${
              compact ? "text-[9px]" : "text-[10px]"
            } ${TONE_CLASS[b.key] || TONE_CLASS.nira_verified_landlord}`}
            title={b.label}
          >
            <Icon size={compact ? 10 : 12} />
            {compact ? b.label.split(" ")[0] : b.label}
          </span>
        );
      })}
    </div>
  );
}
