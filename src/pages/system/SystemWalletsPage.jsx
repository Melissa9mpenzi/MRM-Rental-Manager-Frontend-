import { Wallet, Lock, ArrowRightLeft } from "lucide-react";
import PortalPageHeader from "../../components/system/PortalPageHeader";
import SystemKpiRow from "../../components/system/SystemKpiRow";

export default function SystemWalletsPage() {
  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Wallets"
        description="Tenant wallets, landlord balances, and escrow accounts."
      />
      <SystemKpiRow
        cards={[
          { key: "payments_rent_this_month", label: "Volume (month)", icon: Wallet, tone: "emerald", format: (n) => `UGX ${Number(n || 0).toLocaleString()}` },
          { key: "tenants_active", label: "Active wallets", icon: ArrowRightLeft, tone: "blue" },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="gov-glass border-l-4 border-emerald-500/50 p-4">
          <Lock size={20} className="text-emerald-400" />
          <p className="mt-2 font-semibold text-white">Escrow</p>
          <p className="mt-1 text-sm text-white/55">Funds held until KCCA + URA clearance on new leases.</p>
        </div>
        <div className="gov-glass border-l-4 border-cyan-500/50 p-4">
          <Wallet size={20} className="text-cyan-400" />
          <p className="mt-2 font-semibold text-white">Payouts</p>
          <p className="mt-1 text-sm text-white/55">Landlord disbursements after tenant payment confirmation.</p>
        </div>
      </div>
    </div>
  );
}
