import { useQuery } from "@tanstack/react-query";
import { tenantsApi } from "../../api/tenantsApi";
import { Link } from "react-router-dom";
import { Download, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import ArrearsBadge from "../../components/domain/ArrearsBadge";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

function exportCSV(data) {
  const headers = ["Tenant","Phone","Property","Unit","Monthly Rent","Total Paid","Balance Due","Months in Arrears"];
  const rows = data.map(t => [
    t.full_name, t.phone, t.property_name||"", t.unit_number||"",
    t.monthly_rent, "", parseFloat(t.balance_due||0).toFixed(0), t.months_in_arrears||0,
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `arrears_report_${new Date().toISOString().split("T")[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function ArrearsReportPage() {
  const { data: tenants = [], isLoading, isError } = useQuery({
    queryKey: ["tenants", "", "active"],
    queryFn: () => tenantsApi.list({ status: "active" }),
  });

  const inArrears = tenants.filter(t => (t.balance_due || 0) > 0)
    .sort((a,b) => parseFloat(b.balance_due) - parseFloat(a.balance_due));

  const totalArrears = inArrears.reduce((s,t) => s + parseFloat(t.balance_due||0), 0);

  return (
    <AppPageScaffold
      variant="ledger"
      icon={BarChart3}
      title="Arrears report"
      description={`${inArrears.length} tenants in arrears · UGX ${totalArrears.toLocaleString()} total owed`}
      actions={
        <Button variant="outline" onClick={() => exportCSV(inArrears)}>
          <Download size={14} /> Export CSV
        </Button>
      }
    >

      {isLoading ? (
        <div className="card h-32 animate-pulse bg-brand-tealLt/30" />
      ) : isError ? (
        <div className="card py-14 text-center">
          <h3 className="font-bold text-brand-dark">Could not load arrears data</h3>
          <p className="mt-1 text-sm text-brand-mid">Try again when the API is available.</p>
        </div>
      ) : inArrears.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <AlertCircle size={24} className="text-emerald-300" />
          </div>
          <h3 className="font-bold text-brand-dark">All tenants are up to date!</h3>
          <p className="text-brand-mid text-sm mt-1">No outstanding balances found.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-brand-mid text-xs border-b border-brand-tealLt">
                <th className="text-left pb-3">Tenant</th>
                <th className="text-left pb-3">Property / Unit</th>
                <th className="text-right pb-3">Monthly Rent</th>
                <th className="text-right pb-3">Balance Due</th>
                <th className="text-left pb-3 pl-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-tealLt/50">
              {inArrears.map(t => (
                <tr key={t.id} className="hover:bg-red-500/10">
                  <td className="py-3">
                    <Link to={`/landlord/tenants/${t.id}`} className="font-semibold text-brand-dark hover:text-brand-teal">
                      {t.full_name}
                    </Link>
                    <div className="text-xs text-brand-mid">{t.phone}</div>
                  </td>
                  <td className="py-3 text-brand-mid">{t.property_name || "—"} · {t.unit_number || "—"}</td>
                  <td className="py-3 text-right text-brand-dark">UGX {parseFloat(t.monthly_rent).toLocaleString()}</td>
                  <td className="py-3 text-right font-bold text-red-400">UGX {parseFloat(t.balance_due).toLocaleString()}</td>
                  <td className="py-3 pl-4">
                    <ArrearsBadge months={t.months_in_arrears} balance={t.balance_due} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-tealLt">
                <td colSpan={3} className="pt-3 text-sm font-bold text-brand-dark">Total</td>
                <td className="pt-3 text-right font-bold text-red-600 text-base">
                  UGX {totalArrears.toLocaleString()}
                </td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </AppPageScaffold>
  );
}