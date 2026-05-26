import { Link } from "react-router-dom";
import { useSuiDashboard, fmtSui, shortHash } from "../../lib/useSuiDashboard";
import SuiStatusBadge from "../../components/sui/SuiStatusBadge";

export default function SuiReceiptsPage() {
  const { data } = useSuiDashboard();
  const rows = data?.receipts || [];

  return (
    <section className="space-y-4">
      <article className="sui-panel sui-table-wrap">
        <table className="sui-table">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Method</th>
              <th>Amount (UGX)</th>
              <th>TX</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-white/40">No blockchain receipts yet. Pay via MoMo, Pesapal, or Sui wallet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>RCP-{String(r.id).padStart(5, "0")}</td>
                  <td>{r.payment_method}</td>
                  <td>{r.amount_ugx}</td>
                  <td className="sui-hash">{shortHash(r.tx_digest || r.receipt_hash)}</td>
                  <td><SuiStatusBadge status={r.status} /></td>
                  <td><Link to={`/sui/receipts/${r.id}`} className="sui-link text-xs">View</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>
    </section>
  );
}
