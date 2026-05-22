import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { governmentApi } from "../../api/governmentApi";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovTablePagination from "../../components/government/GovTablePagination";

export default function GovAuditPage() {
  const [page, setPage] = useState(1);
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["gov-audit"],
    queryFn: () => governmentApi.auditLogs(),
  });

  const totalPages = Math.max(1, Math.ceil(logs.length / 15) || 200);

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="Audit Logs"
        subtitle="Immutable trail of verification, property, tax, and officer actions."
      />

      <div className="gov-glass gov-table-wrap">
        <table className="gov-table w-full min-w-[960px]">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Date &amp; Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/45">
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
