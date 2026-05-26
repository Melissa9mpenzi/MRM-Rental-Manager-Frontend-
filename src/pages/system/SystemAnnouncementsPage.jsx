import { Megaphone } from "lucide-react";
import PortalPageHeader from "../../components/system/PortalPageHeader";

export default function SystemAnnouncementsPage() {
  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Announcements"
        description="Broadcast system messages to tenants, landlords, agents, and government officers."
      />
      <div className="gov-glass p-6 text-center">
        <Megaphone className="mx-auto text-amber-400" size={40} />
        <p className="mt-4 text-sm text-white/60">Announcement composer — coming in the next release.</p>
        <p className="mt-2 text-xs text-white/40">Use Government → System Settings for security notices today.</p>
      </div>
    </div>
  );
}
