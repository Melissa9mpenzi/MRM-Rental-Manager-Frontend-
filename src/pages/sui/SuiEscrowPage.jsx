import { useState } from "react";
import { useSuiDashboard, fmtSui } from "../../lib/useSuiDashboard";
import SuiStatusBadge from "../../components/sui/SuiStatusBadge";

const TABS = ["All", "Active", "Completed", "Cancelled"];

export default function SuiEscrowPage() {
  const { data } = useSuiDashboard();
  const [tab, setTab] = useState("All");
  const rows = (data?.escrows || []).filter((e) => {
    if (tab === "All") return true;
    if (tab === "Active") return ["pending", "funded", "held"].includes(e.status);
    if (tab === "Completed") return e.status === "released";
    return e.status === "cancelled";
  });

  return (
    <section className="space-y-4">
      <div className="sui-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`sui-tab ${tab === t ? "sui-tab--active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <article className="sui-panel sui-table-wrap">
        <table className="sui-table">
          <thead>
            <tr>
              <th>Contract ID</th>
              <th>Property</th>
              <th>Tenant</th>
              <th>Landlord</th>
              <th>Amount (SUI)</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-white/40">No escrow contracts.</td></tr>
            ) : (
              rows.map((e) => (
                <tr key={e.id}>
                  <td className="font-mono text-violet-300">{e.contract_id}</td>
                  <td>{e.property_name}</td>
                  <td className="sui-hash">{String(e.tenant).slice(0, 12)}</td>
                  <td className="sui-hash">{String(e.landlord).slice(0, 12)}</td>
                  <td>{fmtSui(e.amount_sui)}</td>
                  <td><SuiStatusBadge status={e.status} /></td>
                  <td className="text-white/45">{(e.created_at || "").slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>
    </section>
  );
}
