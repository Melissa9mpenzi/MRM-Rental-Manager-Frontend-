import { LifeBuoy } from "lucide-react";
import PortalPageHeader from "../../components/system/PortalPageHeader";

export default function SystemSupportPage() {
  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Support Tickets"
        description="Platform support queue for escalations from all user roles."
      />
      <div className="gov-glass p-6 text-center">
        <LifeBuoy className="mx-auto text-cyan-400" size={40} />
        <p className="mt-4 text-sm text-white/60">No open tickets in this environment.</p>
        <p className="mt-2 text-xs text-white/40">Integrate with your helpdesk (email / Zendesk) in production.</p>
      </div>
    </div>
  );
}
