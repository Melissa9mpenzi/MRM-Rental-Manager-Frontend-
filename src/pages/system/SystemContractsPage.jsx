import { useQuery } from "@tanstack/react-query";
import { Users, FileCheck, ClipboardList } from "lucide-react";
import { leasesApi } from "../../api/leasesApi";
import PortalPageHeader from "../../components/system/PortalPageHeader";
import SystemKpiRow from "../../components/system/SystemKpiRow";

export default function SystemContractsPage() {
  const { data: leases = [], isLoading } = useQuery({
    queryKey: ["admin-leases-registry"],
    queryFn: () => leasesApi.list(),
    staleTime: 60_000,
  });
  const rows = Array.isArray(leases) ? leases : [];

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Contracts"
        description="Active tenancies and lease records across the platform."
      />
      <SystemKpiRow
        cards={[
          { key: "tenants_active", label: "Active tenancies", icon: Users, tone: "emerald" },
          { key: "users_total", label: "Platform users", icon: FileCheck, tone: "purple" },
        ]}
      />
      <div className="gov-glass overflow-x-auto p-4">
        <h3 className="gov-panel-title flex items-center gap-2">
          <ClipboardList size={16} />
          Lease registry ({rows.length})
        </h3>
        <table className="mt-4 w-full min-w-[720px] text-left text-sm text-white/80">
          <thead className="border-b border-white/10 text-xs uppercase text-white/40">
            <tr>
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Tenant</th>
              <th className="px-2 py-2">Property / unit</th>
              <th className="px-2 py-2">Rent (UGX)</th>
              <th className="px-2 py-2">Start</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-2 py-6 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-6 text-center text-white/45">
                  No leases recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td className="px-2 py-2 font-mono text-xs">{l.id}</td>
                  <td className="px-2 py-2">{l.tenant_name || "—"}</td>
                  <td className="px-2 py-2 text-xs">
                    {l.property_name || "—"}
                    {l.unit_number ? ` · ${l.unit_number}` : ""}
                  </td>
                  <td className="px-2 py-2">{Number(l.monthly_rent || 0).toLocaleString()}</td>
                  <td className="px-2 py-2 text-xs">{l.start_date || "—"}</td>
                  <td className="px-2 py-2 capitalize text-xs">{l.status || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
