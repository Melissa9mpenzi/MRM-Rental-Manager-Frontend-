import { useSuiDashboard } from "../../lib/useSuiDashboard";
import SuiStatusBadge from "../../components/sui/SuiStatusBadge";

export default function SuiContractsPage() {
  const { data } = useSuiDashboard();
  const contracts = data?.smart_contracts?.length
    ? data.smart_contracts
    : [
        { name: "LeaseContract", address: data?.package_id || "Not deployed", type: "Lease Agreement", calls: 0, status: "Pending" },
        { name: "EscrowVault", address: "rentdirect::escrow", type: "Escrow", calls: 0, status: "Pending" },
      ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="sui-kpi-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", flex: 1 }}>
          {[
            { l: "Total Contracts", v: contracts.length },
            { l: "Active", v: contracts.filter((c) => c.status === "Active").length },
            { l: "Total Calls", v: contracts.reduce((s, c) => s + (c.calls || 0), 0) },
            { l: "Volume", v: data?.totals?.volume_sui ?? 0 },
          ].map((k) => (
            <div key={k.l} className="sui-kpi">
              <p className="sui-kpi__label">{k.l}</p>
              <p className="sui-kpi__value">{k.v}</p>
            </div>
          ))}
        </div>
        <button type="button" className="sui-btn-primary">+ Deploy Contract</button>
      </div>
      <article className="sui-panel sui-table-wrap">
        <table className="sui-table">
          <thead>
            <tr>
              <th>Contract Name</th>
              <th>Address</th>
              <th>Type</th>
              <th>Calls</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.name}>
                <td className="font-semibold">{c.name}</td>
                <td className="sui-hash max-w-[200px] truncate">{c.address}</td>
                <td>{c.type}</td>
                <td>{c.calls ?? 0}</td>
                <td><SuiStatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
