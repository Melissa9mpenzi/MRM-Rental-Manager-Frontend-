import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { rentalHubApi } from "../../api/rentalHubApi";
import PortalPageHeader from "../../components/system/PortalPageHeader";

export default function SystemMessagesPage() {
  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["admin-message-threads"],
    queryFn: () => rentalHubApi.adminThreads({ limit: 100 }),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Messages"
        description="Platform-wide Rental Hub threads (read-only registry)."
      />
      <div className="gov-glass overflow-x-auto p-4">
        <h3 className="gov-panel-title flex items-center gap-2">
          <MessageSquare size={16} />
          Conversation registry ({threads.length})
        </h3>
        <table className="mt-4 w-full min-w-[640px] text-left text-sm text-white/80">
          <thead className="border-b border-white/10 text-xs uppercase text-white/40">
            <tr>
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">Subject</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Participants</th>
              <th className="px-2 py-2">Last message</th>
              <th className="px-2 py-2">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-2 py-6 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            ) : threads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-6 text-center text-white/45">
                  No threads yet.
                </td>
              </tr>
            ) : (
              threads.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="px-2 py-2 font-mono text-xs">{t.id}</td>
                  <td className="max-w-[160px] truncate px-2 py-2 font-semibold text-white">{t.subject || "—"}</td>
                  <td className="px-2 py-2 capitalize text-xs text-white/55">{t.thread_type || "—"}</td>
                  <td className="px-2 py-2 text-xs text-white/55">
                    {(t.participants || []).map((p) => p.name || p.email).join(", ") || "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-2 py-2 text-xs text-white/45">{t.last_message || "—"}</td>
                  <td className="px-2 py-2 text-xs text-white/35">
                    {t.updated_at ? new Date(t.updated_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
