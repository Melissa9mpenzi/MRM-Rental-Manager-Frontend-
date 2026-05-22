import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Mail } from "lucide-react";
import { workspaceApi } from "../../api/workspaceApi";
import PortalPageHeader from "../../components/system/PortalPageHeader";

export default function SystemMessagesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["workspace-admin-summary"],
    queryFn: () => workspaceApi.adminSummary(),
  });
  const users = data?.recent_users ?? [];

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Messages"
        description="Platform-wide messaging and support threads."
      />
      <div className="gov-glass p-4">
        <h3 className="gov-panel-title flex items-center gap-2">
          <MessageSquare size={16} />
          Recent accounts (message context)
        </h3>
        <ul className="mt-4 space-y-2">
          {isLoading && <li className="text-sm text-white/45">Loading…</li>}
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold text-white">{u.full_name}</p>
                <p className="text-xs text-white/45">{u.email}</p>
              </div>
              <span className="text-[10px] uppercase text-white/35">{u.role}</span>
            </li>
          ))}
          {!isLoading && users.length === 0 && (
            <li className="text-sm text-white/45">No users yet.</li>
          )}
        </ul>
        <p className="mt-4 flex items-center gap-2 text-xs text-white/40">
          <Mail size={14} />
          In-app messaging hub — integrated with tenant / landlord routes in next sprint.
        </p>
      </div>
    </div>
  );
}
