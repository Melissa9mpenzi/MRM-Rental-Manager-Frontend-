import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useSuiDashboard, fmtSui, shortHash } from "../../lib/useSuiDashboard";
import SuiStatusBadge from "../../components/sui/SuiStatusBadge";

export default function SuiDashboardPage() {
  const { data, isLoading } = useSuiDashboard();
  const totals = data?.totals || {};
  const net = data?.network_status || {};
  const volume = data?.volume_by_day || [];
  const byType = data?.transactions_by_type || [];
  const recent = data?.recent_transactions || [];
  const contracts = data?.smart_contracts || [];

  const kpis = [
    { label: "Total SUI Balance", value: data?.wallet?.sui_balance != null ? fmtSui(data.wallet.sui_balance) : "—", delta: "+2.4%" },
    { label: "Total Transactions", value: totals.transactions ?? 0, delta: "+12%" },
    { label: "Total Volume (SUI)", value: fmtSui(totals.volume_sui), delta: "+8.1%" },
    { label: "Active Escrow", value: totals.active_escrow ?? 0, delta: "+3" },
    { label: "Smart Contracts", value: totals.smart_contracts ?? 0, delta: "Live" },
  ];

  return (
    <div className="space-y-5">
      <div className="sui-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="sui-kpi">
            <p className="sui-kpi__label">{k.label}</p>
            <p className="sui-kpi__value">{isLoading ? "…" : k.value}</p>
            <p className="sui-kpi__delta">{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="sui-grid-charts">
        <div className="sui-panel">
          <p className="sui-panel__title">Transaction Volume (SUI)</p>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volume}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sui-panel">
          <p className="sui-panel__title">Transactions By Type</p>
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {byType.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sui-panel space-y-3">
          <p className="sui-panel__title">Network Status</p>
          <SuiStatusBadge status={net.healthy ? "Healthy" : "Offline"} />
          <dl className="space-y-1 text-xs text-white/60">
            <div className="flex justify-between"><dt>Block Height</dt><dd>{net.block_height}</dd></div>
            <div className="flex justify-between"><dt>TPS</dt><dd>{net.tps}</dd></div>
            <div className="flex justify-between"><dt>Checkpoint</dt><dd className="sui-hash">{net.checkpoint}</dd></div>
            <div className="flex justify-between"><dt>Gas (MIST)</dt><dd>{net.gas_mist}</dd></div>
          </dl>
        </div>
      </div>

      <div className="sui-grid-2">
        <div className="sui-panel">
          <p className="sui-panel__title mb-3">Recent Transactions</p>
          <div className="sui-table-wrap">
            <table className="sui-table">
              <thead>
                <tr>
                  <th>TX Hash</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-white/40">No on-chain transactions yet.</td></tr>
                ) : (
                  recent.map((tx) => (
                    <tr key={tx.id}>
                      <td className="sui-hash">{shortHash(tx.tx_hash)}</td>
                      <td>{tx.type}</td>
                      <td>{tx.from}</td>
                      <td>{tx.to}</td>
                      <td>{fmtSui(tx.amount_sui)}</td>
                      <td><SuiStatusBadge status={tx.status} /></td>
                      <td className="text-white/45">{(tx.time || "").slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sui-panel">
          <p className="sui-panel__title mb-3">Top Smart Contracts</p>
          <div className="space-y-2">
            {(contracts.length ? contracts : [{ name: "RentDirect Escrow", type: "Escrow", status: "Pending deploy" }]).map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-xs text-white/45">{c.type}</p>
                </div>
                <SuiStatusBadge status={c.status || "Active"} />
              </div>
            ))}
          </div>
          <Link to="/sui/contracts" className="sui-link mt-3 inline-block text-xs">View all contracts →</Link>
        </div>
      </div>
    </div>
  );
}
