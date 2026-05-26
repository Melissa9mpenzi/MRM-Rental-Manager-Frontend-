import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HardDrive } from "lucide-react";
import { governmentApi } from "../../api/governmentApi";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovTablePagination from "../../components/government/GovTablePagination";
import WalrusProofBadge from "../../components/sui/WalrusProofBadge";

export default function GovAuditPage() {
  const [page, setPage] = useState(1);
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["gov-audit"],
    queryFn: () => governmentApi.auditLogs(),
  });

  const exportWalrus = useMutation({
    mutationFn: () => governmentApi.exportAuditWalrus({ limit: 100 }),
    onSuccess: (data) => {
      toast.success(
        data?.walrus_blob_id
          ? `Audit bundle anchored (${data.entry_count ?? 0} entries)`
          : "Export completed",
      );
      refetch();
    },
    onError: (e) => toast.error(e?.response?.data?.detail?.message || e.message || "Export failed"),
  });

  const totalPages = Math.max(1, Math.ceil(logs.length / 15) || 200);

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="Audit Logs"
        subtitle="Immutable trail of verification, property, tax, and officer actions — each entry can be anchored on Walrus."
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
        <HardDrive size={18} className="text-cyan-400" />
        <p className="flex-1 text-xs text-white/60">
          Export the current audit slice as one JSON bundle on Walrus for judges (secondary hackathon track).
        </p>
        <button
          type="button"
          disabled={exportWalrus.isPending || logs.length === 0}
          onClick={() => exportWalrus.mutate()}
          className="rounded-lg bg-cyan-600/90 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          {exportWalrus.isPending ? "Publishing…" : "Export to Walrus"}
        </button>
        {exportWalrus.data?.walrus_blob_id ? (
          <WalrusProofBadge
            blobId={exportWalrus.data.walrus_blob_id}
            contentHash={exportWalrus.data.content_hash}
            url={exportWalrus.data.walrus_url}
            walrusLive={exportWalrus.data.walrus_live}
            storageType={exportWalrus.data.storage_type}
            label="Bundle"
          />
        ) : null}
      </div>

      <div className="gov-glass gov-table-wrap">
        <table className="gov-table w-full min-w-[1024px]">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Details</th>
              <th>Walrus</th>
              <th>IP Address</th>
              <th>Date &amp; Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-white/45">
                  No audit entries recorded yet.
                </td>
              </tr>
            )}
            {logs.map((row) => (
              <tr key={row.id}>
                <td className="font-medium text-white">{row.user || (row.user_id ? `Officer #${row.user_id}` : "System")}</td>
                <td className="text-emerald-300/90">{row.action}</td>
                <td className="capitalize text-white/70">{row.module || "—"}</td>
                <td className="max-w-xs truncate text-white/60" title={row.details}>
                  {row.details || "—"}
                </td>
                <td>
                  <WalrusProofBadge
                    blobId={row.walrus_blob_id}
                    contentHash={row.content_hash}
                    url={row.walrus_url}
                    walrusLive={row.walrus_live}
                    storageType={row.storage_type}
                  />
                </td>
                <td className="font-mono text-xs text-white/50">{row.ip_address || "—"}</td>
                <td className="whitespace-nowrap text-white/45">
                  {row.created_at?.replace("T", " ").slice(0, 19) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <GovTablePagination page={page} totalPages={totalPages > 5 ? 200 : totalPages} onPage={setPage} />
      </div>
    </div>
  );
}
