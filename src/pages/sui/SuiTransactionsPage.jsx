import { useState } from "react";
import { Link } from "react-router-dom";
import { useSuiDashboard, fmtSui, shortHash } from "../../lib/useSuiDashboard";
import SuiStatusBadge from "../../components/sui/SuiStatusBadge";

const FILTERS = ["All", "Payments", "Escrow", "Contracts"];

export default function SuiTransactionsPage() {
  const { data } = useSuiDashboard();
  const [filter, setFilter] = useState("All");
  const rows = (data?.recent_transactions || []).filter((tx) => {
    if (filter === "All") return true;
    return tx.type?.toLowerCase().includes(filter.slice(0, -1).toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="sui-tabs">
        {FILTERS.map((f) => (
          <button key={f} type="button" className={`sui-tab ${filter === f ? "sui-tab--active" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="sui-panel sui-table-wrap">
        <table className="sui-table">
          <thead>
            <tr>
              <th>TX Hash</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Time</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-white/40">No transactions.</td></tr>
            ) : (
              rows.map((tx) => (
                <tr key={tx.id}>
                  <td className="sui-hash">{shortHash(tx.tx_hash)}</td>
                  <td>{tx.type}</td>
                  <td>{fmtSui(tx.amount_sui)}</td>
                  <td><SuiStatusBadge status={tx.status} /></td>
                  <td className="text-white/45">{(tx.time || "").slice(0, 16).replace("T", " ")}</td>
                  <td>
                    {tx.receipt?.id && (
                      <Link to={`/sui/receipts/${tx.receipt.id}`} className="sui-link text-xs">Receipt</Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
