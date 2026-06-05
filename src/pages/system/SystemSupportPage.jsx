import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LifeBuoy } from "lucide-react";
import toast from "react-hot-toast";
import { workspaceApi } from "../../api/workspaceApi";
import PortalPageHeader from "../../components/system/PortalPageHeader";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];

export default function SystemSupportPage() {
  const qc = useQueryClient();
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: () => workspaceApi.adminSupportTickets(),
    staleTime: 30_000,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }) => workspaceApi.updateSupportTicket(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast.success("Ticket updated.");
    },
    onError: () => toast.error("Could not update ticket."),
  });

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Support Tickets"
        description="Platform support queue for escalations from all user roles."
      />
      <div className="gov-glass overflow-x-auto p-4">
        {isLoading ? (
          <p className="text-sm text-white/45">Loading…</p>
        ) : tickets.length === 0 ? (
          <div className="py-8 text-center">
            <LifeBuoy className="mx-auto text-cyan-400" size={40} />
            <p className="mt-4 text-sm text-white/60">No support tickets yet.</p>
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm text-white/80">
            <thead className="border-b border-white/10 text-xs uppercase text-white/40">
              <tr>
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Subject</th>
                <th className="px-2 py-2">Priority</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="px-2 py-2 font-mono text-xs">{t.id}</td>
                  <td className="px-2 py-2">
                    <p className="font-semibold text-white">{t.subject}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{t.body}</p>
                  </td>
                  <td className="px-2 py-2 capitalize text-xs">{t.priority || "normal"}</td>
                  <td className="px-2 py-2">
                    <select
                      value={t.status || "open"}
                      disabled={updateMut.isPending}
                      onChange={(e) => updateMut.mutate({ id: t.id, status: e.target.value })}
                      className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-xs text-white/35">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
