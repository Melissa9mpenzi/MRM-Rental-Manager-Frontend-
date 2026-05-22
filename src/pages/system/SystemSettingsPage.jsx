import { Shield, Database, Bell, Globe } from "lucide-react";
import PortalPageHeader from "../../components/system/PortalPageHeader";

const POLICIES = [
  { icon: Shield, title: "Security", items: ["Mandatory 2FA for system admin", "Government invitation-only access", "Session audit on gov login"] },
  { icon: Database, title: "Data", items: ["PostgreSQL (Neon) · public schema", "Daily backups recommended in production", "PII encrypted at rest (hosting provider)"] },
  { icon: Bell, title: "Notifications", items: ["Email OTP for public registration", "Government invite emails", "Payment webhooks (MTN / Pesapal)"] },
  { icon: Globe, title: "Deployment", items: ["API: VITE_API_URL", "Gov API: VITE_GOV_API_URL", "CORS locked to frontend origin"] },
];

export default function SystemSettingsPage() {
  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Platform Settings"
        description="Global configuration for RentDirect UG (Super Admin)."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {POLICIES.map(({ icon: Icon, title, items }) => (
          <div key={title} className="gov-glass p-4">
            <div className="flex items-center gap-2">
              <Icon size={18} className="text-emerald-400" />
              <h3 className="font-bold text-white">{title}</h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-white/65">
              {items.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
