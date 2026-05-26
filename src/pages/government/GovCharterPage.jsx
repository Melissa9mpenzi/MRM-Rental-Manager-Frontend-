import { Shield, Building2, Landmark } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { governmentAgencyForRole, isSystemAdministrator } from "../../config/governmentAccess";
import { GOVERNMENT_AGENCY_ROLES, GOVERNMENT_WORKFLOW, COMPLIANCE_BADGES } from "../../config/governmentRoles";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovWorkflowBanner from "../../components/government/GovWorkflowBanner";

const ICONS = { nira: Shield, kcca: Building2, ura: Landmark };

export default function GovCharterPage() {
  const role = useAuthStore((s) => s.user?.role);
  const agency = governmentAgencyForRole(role);
  const isAdmin = isSystemAdministrator(role);
  const agencies = isAdmin ? Object.keys(GOVERNMENT_AGENCY_ROLES) : agency ? [agency] : [];

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="Government compliance authorities"
        subtitle="NIRA, KCCA, and URA are verification and compliance officers — not ordinary platform admins."
      />
      <GovWorkflowBanner />

      <div className="gov-glass p-4">
        <h3 className="text-sm font-bold text-white">Trust badges on listings</h3>
        <ul className="mt-2 space-y-1 text-sm text-white/65">
          {COMPLIANCE_BADGES.map((b) => (
            <li key={b.key}>✓ {b.label}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {agencies.map((key) => {
          const def = GOVERNMENT_AGENCY_ROLES[key];
          const Icon = ICONS[key] || Shield;
          return (
            <article key={key} className="gov-glass flex flex-col p-4">
              <Icon className="text-emerald-400" size={22} />
              <h3 className="mt-2 text-lg font-bold text-white">
                {def.name} — {def.title}
              </h3>
              <p className="mt-1 text-sm text-white/55">{def.purpose}</p>
              <h4 className="mt-4 text-xs font-bold uppercase text-emerald-400/90">Responsibilities</h4>
              <ul className="mt-2 flex-1 space-y-1 text-sm text-white/65">
                {def.responsibilities.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
              <div className="mt-4 grid gap-2 text-xs">
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-100/90">
                  <strong>Access:</strong> {def.access.sees.join(", ")}
                </div>
                <div className="rounded-lg bg-red-500/10 px-3 py-2 text-red-100/80">
                  <strong>Not visible:</strong> {def.access.notSees.join(", ")}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="gov-glass p-4 text-sm text-white/60">
        <p className="font-semibold text-white">Pipeline</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {GOVERNMENT_WORKFLOW.steps.map((s) => (
            <li key={s.agency}>
              <strong className="text-white/80">{s.agency}</strong> — {s.label}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
