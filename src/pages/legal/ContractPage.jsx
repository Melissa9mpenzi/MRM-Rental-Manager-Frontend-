import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, ShieldCheck, PenLine, Link2, Database } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { tenantPortalApi } from "../../api/tenantPortalApi";

export default function ContractPage() {
  const user = useAuthStore((s) => s.user);
  const dash = user ? defaultDashboardPath(user.role) : "/dashboard";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tenant-my-lease-contract"],
    queryFn: () => tenantPortalApi.myLease(),
    enabled: user?.role === "tenant",
    retry: false,
  });

  const lease = data?.lease;
  const prop = data?.property;
  const tenant = data?.tenant;
  const unit = data?.unit;

  const titleLine =
    prop?.name && unit?.unit_number ? `${prop.name} · Unit ${unit.unit_number}` : prop?.name || "Lease contract";

  return (
    <AppPageScaffold
      variant="vault"
      icon={FileText}
      title="Lease contract"
      description={user?.role === "tenant" ? "Data from GET /tenant/my-lease" : "Lease workspace"}
      actions={
        <Link to={dash} className="text-sm font-semibold text-brand-teal hover:underline">
          ← Dashboard
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {user?.role !== "tenant" && (
          <p className="text-sm text-white/50">Open this page as a tenant to load your active lease from the API.</p>
        )}

        {user?.role === "tenant" && isLoading && <p className="text-sm text-white/45">Loading lease…</p>}

        {user?.role === "tenant" && isError && (
          <div className="card-glass border border-amber-500/25 bg-amber-500/10 p-6 text-sm text-amber-100">
            No tenant profile or lease found. Accept a landlord invite or ask your landlord to activate your lease.
          </div>
        )}

        {user?.role === "tenant" && data && !lease && (
          <div className="card-glass p-6 text-sm text-white/55">You are linked as a tenant, but there is no active lease on file yet.</div>
        )}

        {user?.role === "tenant" && lease && (
          <div className="card-glass border border-white/[0.1] p-8 shadow-card">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal/15 text-brand-teal">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40">Residential lease</div>
                  <div className="text-lg font-bold text-white">{titleLine}</div>
                </div>
              </div>
              <span className="rounded-full border border-[#00C896]/35 bg-[#00C896]/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#00C896]">
                {lease.status || "Active"}
              </span>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl border border-brand-teal/25 bg-brand-teal/10 p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-brand-teal">
                <ShieldCheck size={18} />
                Verified record in your RentDirect account
              </div>
              <div className="grid gap-2 text-xs text-white/60 sm:grid-cols-2">
                <div>
                  <span className="font-bold text-white/80">Lease ID</span>
                  <p className="mt-1 font-mono text-[11px] text-white/55">{lease.id}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Database size={16} className="mt-0.5 flex-shrink-0 text-brand-teal" />
                  <div>
                    <span className="font-bold text-white/80">Storage</span>
                    <p className="mt-1 text-white/55">On-chain anchoring can be added when your legal stack is ready.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/55">
                <Link2 size={14} className="text-brand-teal" />
                <span>API-sourced lease summary</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Tenant</h3>
                <p className="mt-2 text-sm font-bold text-white">{tenant?.full_name || user?.full_name}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Property</h3>
                <p className="mt-2 text-sm text-white/80">{prop?.address || "—"}</p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08]">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-white/[0.06] text-white/75">
                  <tr>
                    <th className="bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Lease start</th>
                    <td className="px-4 py-3 font-semibold text-white">{lease.start_date || "—"}</td>
                  </tr>
                  <tr>
                    <th className="bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Lease end</th>
                    <td className="px-4 py-3 font-semibold text-white">{lease.end_date || "—"}</td>
                  </tr>
                  <tr>
                    <th className="bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Monthly rent</th>
                    <td className="px-4 py-3 font-bold text-[#00C896]">
                      UGX {Number(lease.monthly_rent || 0).toLocaleString()} / month
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 sm:flex-none"
              >
                <PenLine size={18} /> Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </AppPageScaffold>
  );
}
