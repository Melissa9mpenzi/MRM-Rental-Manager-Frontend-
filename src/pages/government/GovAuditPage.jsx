import { useQuery } from "@tanstack/react-query";
import { governmentApi } from "../../api/governmentApi";

export default function GovAuditPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["gov-audit"],
    queryFn: () => governmentApi.auditLogs(),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Audit Logs</h2>
        <p className="text-sm text-white/50">Immutable trail of verification, property, tax, and officer actions.</p>
      </div>

      <div className="gov-glass overflow-x-auto">
        <table className="gov-table w-full min-w-[700px]">
          <thead>
            <tr>
              <th>Time</th>
              <th>Officer ID</th>
              <th>Action</th>
              <th>Module</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {logs.map((row) => (
              <tr key={row.id}>
                <td className="text-white/50">{row.created_at?.replace("T", " ").slice(0, 19)}</td>
                <td>{row.user_id ?? "—"}</td>
                <td className="font-mono text-xs text-emerald-300/90">{row.action}</td>
                <td>{row.module}</td>
                <td className="max-w-md truncate text-white/60">{row.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
