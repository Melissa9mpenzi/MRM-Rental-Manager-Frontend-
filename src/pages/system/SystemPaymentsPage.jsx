import { useQuery } from "@tanstack/react-query";
import { Banknote, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { workspaceApi } from "../../api/workspaceApi";
import PortalPageHeader from "../../components/system/PortalPageHeader";
import SystemKpiRow from "../../components/system/SystemKpiRow";

const fmtMoney = (n) =>
  `UGX ${new Intl.NumberFormat("en-UG", { notation: "compact" }).format(Number(n) || 0)}`;

export default function SystemPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["workspace-admin-summary"],
    queryFn: () => workspaceApi.adminSummary(),
  });
  const monthly = data?.monthly_platform ?? [];

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Payments & Escrow"
        description="Rent collection, MoMo / Pesapal gateways, and escrow holds."
      />
      <SystemKpiRow
        cards={[
          {
            key: "payments_rent_this_month",
            label: "Rent this month",
            icon: Banknote,
            tone: "orange",
            format: fmtMoney,
          },
        ]}
      />
      <div className="gov-glass p-4">
        <h3 className="gov-panel-title flex items-center gap-2">
          <TrendingUp size={16} />
          Rent volume (6 months)
        </h3>
        <div className="mt-4 h-56">
          {monthly.length === 0 && !isLoading ? (
            <p className="flex h-full items-center justify-center text-sm text-white/40">No payment data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="payment_volume" name="Rent (UGX)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
