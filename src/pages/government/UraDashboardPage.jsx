import { useQuery } from "@tanstack/react-query";
import { governmentApi } from "../../api/governmentApi";

const fmt = (n) => new Intl.NumberFormat("en-UG").format(Math.round(n || 0));

export default function UraDashboardPage() {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["gov-ura"],
    queryFn: () => governmentApi.uraReports({ limit: 80 }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">URA — Rental Tax Compliance</h2>
        <p className="text-sm text-white/50">
          Monitor rental income, landlord tax profiles, and transaction compliance from platform payments.
        </p>
      </div>

      <div className="gov-glass overflow-x-auto">
        <table className="gov-table w-full min-w-[760px]">
          <thead>
            <tr>
              <th>Landlord</th>
              <th>Property</th>
              <th>Monthly Income (UGX)</th>
              <th>Tax Status</th>
              <th>Compliance Score</th>
              <th>Transactions</th>
              <th>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.payment_id}>
                <td className="font-medium text-white">{r.landlord}</td>
                <td className="text-white/70">{r.property}</td>
                <td>UGX {fmt(r.monthly_income_ugx)}</td>
                <td>
                  <span
                    className={
                      r.tax_status === "compliant" ? "gov-badge gov-badge-verified" : "gov-badge gov-badge-pending"
                    }
                  >
                    {r.tax_status}
                  </span>
                </td>
                <td>{r.compliance_score}%</td>
                <td>{r.transaction_volume}</td>
                <td className="text-white/45">{r.paid_at?.slice(0, 10) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
