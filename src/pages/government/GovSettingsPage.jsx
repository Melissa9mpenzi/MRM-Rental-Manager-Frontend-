import { Shield, Key, FileCheck, Globe } from "lucide-react";
import GovModuleHeader from "../../components/government/GovModuleHeader";

export default function GovSettingsPage() {
  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="System Settings"
        subtitle="Security and compliance policies for the national government portal."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="gov-glass p-4">
          <Shield className="text-emerald-400" size={20} />
          <h3 className="mt-2 font-bold text-white">Authentication</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-white/65">
            <li>✓ Invitation-only officer accounts</li>
            <li>✓ Mandatory 2FA each session</li>
            <li>✓ No public or social signup</li>
            <li>✓ Work ID + security PIN on accept</li>
          </ul>
        </div>
        <div className="gov-glass p-4">
          <Key className="text-cyan-400" size={20} />
          <h3 className="mt-2 font-bold text-white">Access control</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-white/65">
            <li>✓ Role-scoped NIRA / KCCA / URA modules</li>
            <li>✓ System admin: full platform + gov</li>
            <li>○ IP allowlist (production)</li>
          </ul>
        </div>
        <div className="gov-glass p-4">
          <FileCheck className="text-purple-400" size={20} />
          <h3 className="mt-2 font-bold text-white">Audit</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-white/65">
            <li>✓ All verification actions logged</li>
            <li>✓ Gov login session records</li>
            <li>○ Blockchain anchors (planned)</li>
          </ul>
        </div>
        <div className="gov-glass p-4">
          <Globe className="text-amber-400" size={20} />
          <h3 className="mt-2 font-bold text-white">Integrations</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-white/65">
            <li>✓ NIRA KYC workflow</li>
            <li>✓ KCCA property registry</li>
            <li>✓ URA tax compliance reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
