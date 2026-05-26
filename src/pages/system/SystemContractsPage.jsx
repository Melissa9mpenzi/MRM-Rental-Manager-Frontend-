import { Users, FileCheck, ClipboardList } from "lucide-react";
import PortalPageHeader from "../../components/system/PortalPageHeader";
import SystemKpiRow from "../../components/system/SystemKpiRow";

export default function SystemContractsPage() {
  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Contracts"
        description="Active tenancies and lease records across the platform."
      />
      <SystemKpiRow
        cards={[
          { key: "tenants_active", label: "Active tenancies", icon: Users, tone: "emerald" },
          { key: "users_total", label: "Platform users", icon: FileCheck, tone: "purple" },
        ]}
      />
      <div className="gov-glass flex items-start gap-4 p-5">
        <ClipboardList className="shrink-0 text-emerald-400" size={32} />
        <div>
          <p className="text-sm text-white/70">
            Lease documents and digital contracts are managed per tenant–landlord pairing. Use tenant and landlord
            dashboards for contract detail, or government overview for compliance status.
          </p>
          <p className="mt-2 text-xs text-white/40">Full contract registry API — next release.</p>
        </div>
      </div>
    </div>
  );
}
