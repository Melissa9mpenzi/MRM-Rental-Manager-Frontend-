import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, MessageSquare } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { rentalHubApi } from "../../api/rentalHubApi";
import { ErrorPanel, EmptyPanel, LoadingPanel } from "../../components/ui/StatePanel";

function statusLabel(thread) {
  if (thread.archived) return "Closed";
  if ((thread.unread_count || 0) > 0) return "New reply";
  return "Active";
}

function statusClass(thread) {
  if (thread.archived) return "bg-white/10 text-white/45";
  if ((thread.unread_count || 0) > 0) return "bg-emerald-500/15 text-emerald-400";
  return "bg-amber-500/15 text-amber-300";
}

export default function TenantApplicationsPage() {
  const { data: threads = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["tenant-applications"],
    queryFn: () =>
      rentalHubApi.threads({
        folder: "inbox",
        thread_type: "inquiry",
      }),
  });

  const rows = useMemo(
    () =>
      [...threads].sort((a, b) => String(b.last_at || "").localeCompare(String(a.last_at || ""))),
    [threads]
  );

  return (
    <AppPageScaffold
      variant="registry"
      icon={ClipboardList}
      title="Applications"
      description="Listing enquiries you started — message landlords and track responses"
      actions={
        <Link
          to="/browse-properties"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white/80 hover:border-[#00C896]/40 hover:text-[#00C896]"
        >
          Browse listings
        </Link>
      }
    >
      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel title="Could not load applications" onRetry={() => refetch()} />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={ClipboardList}
          title="No applications yet"
          description="When you message a landlord from a listing, your enquiry appears here."
          action={
            <Link
              to="/browse-properties"
              className="btn-primary inline-flex rounded-lg px-5 py-2 text-sm font-bold"
            >
              Find a home
            </Link>
          }
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/50">
                <th className="pb-3 pr-4 font-semibold">Listing</th>
                <th className="pb-3 pr-4 font-semibold">Landlord</th>
                <th className="pb-3 pr-4 font-semibold">Last message</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {rows.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-white/[0.04]">
                  <td className="py-3 pr-4 font-medium text-white">
                    {t.property?.title || t.title || "Listing"}
                    {t.property?.unit_number ? (
                      <span className="text-brand-mid"> · {t.property.unit_number}</span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-brand-mid">{t.peer?.name || "Landlord"}</td>
                  <td className="max-w-xs py-3 pr-4 text-xs text-white/55">
                    <span className="line-clamp-2">{t.last_preview || "—"}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(t)}`}
                    >
                      {statusLabel(t)}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      to={`/tenant/messages?thread=${t.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#00C896] hover:underline"
                    >
                      <MessageSquare size={12} /> Open chat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppPageScaffold>
  );
}
