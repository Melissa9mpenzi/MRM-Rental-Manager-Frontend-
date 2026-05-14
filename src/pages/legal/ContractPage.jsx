import { Link } from "react-router-dom";
import { FileText, ShieldCheck, PenLine, Link2, Database } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function ContractPage() {
  const user = useAuthStore((s) => s.user);
  const dash = user ? defaultDashboardPath(user.role) : "/dashboard";

  return (
    <AppPageScaffold
      variant="vault"
      icon={FileText}
      title="Lease contract"
      description="Residential lease · #RC-2024-000123"
      actions={
        <Link to={dash} className="text-sm font-semibold text-brand-teal hover:underline">
          ← Dashboard
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
      <div className="card-glass border border-white/[0.1] p-8 shadow-card">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal/15 text-brand-teal">
              <FileText size={24} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/40">Residential lease</div>
              <div className="text-lg font-bold text-white">Modern Apartment · Kampala</div>
            </div>
          </div>
          <span className="rounded-full border border-[#00C896]/35 bg-[#00C896]/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#00C896]">
            Active
          </span>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-brand-teal/25 bg-brand-teal/10 p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-brand-teal">
            <ShieldCheck size={18} />
            Verified on blockchain · Sui Network
          </div>
          <div className="grid gap-2 text-xs text-white/60 sm:grid-cols-2">
            <div>
              <span className="font-bold text-white/80">Contract hash</span>
              <p className="mt-1 break-all font-mono text-[11px] text-white/55">
                0x9f2c4e1a8b7d6c5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Database size={16} className="mt-0.5 flex-shrink-0 text-brand-teal" />
              <div>
                <span className="font-bold text-white/80">Storage</span>
                <p className="mt-1 text-white/55">Walrus — decentralized object storage (preview).</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/55">
            <Link2 size={14} className="text-brand-teal" />
            <span className="break-all">object: 0x7f3a…c91e</span>
            <span className="text-white/35">·</span>
            <span className="break-all">digest: 9d2e…01ab</span>
          </div>
          <p className="text-[11px] text-white/40">Anchored 2026-05-01T10:00:00Z (sample)</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Landlord</h3>
            <p className="mt-2 text-sm font-bold text-white">Alpha Apartments Ltd</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Tenant</h3>
            <p className="mt-2 text-sm font-bold text-white">John Doe</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 sm:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Property</h3>
            <p className="mt-2 text-sm text-white/80">Modern Apartment, Kololo, Kampala, Uganda</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08]">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-white/[0.06] text-white/75">
              <tr>
                <th className="bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Lease start</th>
                <td className="px-4 py-3 font-semibold text-white">1 Jan 2026</td>
              </tr>
              <tr>
                <th className="bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Lease end</th>
                <td className="px-4 py-3 font-semibold text-white">31 Dec 2026</td>
              </tr>
              <tr>
                <th className="bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Monthly rent</th>
                <td className="px-4 py-3 font-bold text-[#00C896]">UGX 1,200,000 / month</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prose prose-invert mt-8 max-w-none space-y-4 border-t border-white/10 pt-8 text-sm text-white/70">
          <p>
            <strong className="text-white">Deposit.</strong> One month held in escrow per platform rules and released after
            move-out inspection.
          </p>
          <p>
            <strong className="text-white">Use.</strong> Residential use only; subletting requires written consent from the
            landlord.
          </p>
        </div>

        <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/40">
              <PenLine size={14} /> Landlord — digital signature
            </div>
            <p className="mt-3 font-serif text-2xl italic text-white/80">Alpha A.</p>
            <p className="mt-1 text-xs font-semibold text-white/50">Alpha Apartments Ltd</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/40">
              <PenLine size={14} /> Tenant — digital signature
            </div>
            <p className="mt-3 font-serif text-2xl italic text-white/80">John D.</p>
            <p className="mt-1 text-xs font-semibold text-white/50">John Doe</p>
          </div>
        </div>
      </div>
    </div>
    </AppPageScaffold>
  );
}
