export default function EscrowStatusPanel({ escrows = [] }) {
  if (!escrows.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/50">
        No active escrow holds. Deposits can be held on Sui when a lease uses smart escrow.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white">Escrow status</h3>
      {escrows.map((e) => (
        <div
          key={e.id}
          className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm"
        >
          <div className="flex justify-between">
            <span className="text-white/80">Lease #{e.lease_id}</span>
            <span className="font-semibold uppercase text-amber-200">{e.status}</span>
          </div>
          <p className="mt-1 text-xs text-white/55">UGX {Number(e.amount_ugx).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
