import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Landmark, CheckCircle2, Clock, Banknote } from "lucide-react";
import { governmentApi } from "../../api/governmentApi";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovModuleKpis from "../../components/government/GovModuleKpis";
import GovTablePagination from "../../components/government/GovTablePagination";

const fmt = (n) => new Intl.NumberFormat("en-UG").format(Math.round(n || 0));

export default function UraDashboardPage() {
  const [page, setPage] = useState(1);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["gov-ura"],
    queryFn: () => governmentApi.uraReports({ limit: 80 }),
  });

  const stats = useMemo(() => {
    const revenue = rows.reduce((s, r) => s + (r.monthly_income_ugx || 0), 0);
    const compliant = rows.filter((r) => r.tax_status === "compliant").length;
    const pending = rows.filter((r) => r.tax_status !== "compliant").length;
    return {
      landlords: rows.length,
      revenue,
      compliant,
      pending,
    };
  }, [rows]);

  const kpis = [
    {
      icon: Landmark,
      label: "Registered Landlords",
      value: stats.landlords.toLocaleString(),
      tone: "purple",
    },
    {
      icon: Banknote,
      label: "Rental Revenue (UGX)",
      value: `UGX ${fmt(stats.revenue)}`,
      tone: "yellow",
    },
    {
      icon: CheckCircle2,
      label: "Tax Compliant",
      value: stats.compliant.toLocaleString(),
      tone: "emerald",
    },
    {
      icon: Clock,
      label: "Pending Review",
      value: stats.pending.toLocaleString(),
      tone: "amber",
    },
  ];

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="URA — Rental Tax Compliance"
        subtitle="Monitor rental income, landlord tax profiles, and transaction compliance from platform payments."
      />

      <GovModuleKpis items={kpis} />

      <div className="gov-glass gov-table-wrap">
        <table className="gov-table w-full min-w-[880px]">
          <thead>
            <tr>
              <th>Landlord / Business</th>
              <th>TIN</th>
              <th>Revenue (UGX)</th>
              <th>Tax Status</th>
              <th>Last Paid</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-white/45">
                  No tax records yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.payment_id}>
                <td className="font-medium text-white">{r.landlord}</td>
                <td className="font-mono text-xs text-white/65">{r.tin || `TIN-${String(r.payment_id).padStart(8, "0")}`}</td>
                <td className="text-white/85">UGX {fmt(r.monthly_income_ugx)}</td>
                <td>
                  <span
                    className={
                      r.tax_status === "compliant" ? "gov-badge gov-badge-verified" : "gov-badge gov-badge-pending"
                    }
                  >
                    {r.tax_status}
                  </span>
                </td>
                <td className="text-white/45">{r.paid_at?.slice(0, 10) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <GovTablePagination page={page} totalPages={Math.max(1, Math.ceil((rows.length || 10) / 10))} onPage={setPage} />
      </div>
    </div>
  );
}
