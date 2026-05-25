import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blockchainApi } from "../../api/blockchainApi";
import SuiStatusBadge from "../../components/sui/SuiStatusBadge";
import { fmtSui } from "../../lib/useSuiDashboard";

export default function SuiReceiptDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["sui-receipt", id],
    queryFn: () => blockchainApi.receipt(id),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-white/50">Loading receipt…</p>;
  if (!data) return <p className="text-red-300">Receipt not found.</p>;

  const suiAmt = data.amount_ugx ? fmtSui(Number(data.amount_ugx) / 6_000_000) : "—";

  return (
    <section className="max-w-lg space-y-4">
      <Link to="/sui/receipts" className="sui-link text-sm">← Back to receipts</Link>
      <article className="sui-panel space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white">Blockchain Receipt</h2>
          <SuiStatusBadge status={data.status} />
        </header>
        <dl className="space-y-3 text-sm">
          <Row label="Receipt ID" value={data.receipt_id || `RCP-${data.id}`} />
          <Row label="Type" value={data.type || "Payment"} />
          <Row label="Related To" value={data.related_to || "Rent Payment"} />
          <Row label="Amount (SUI)" value={suiAmt} />
          <Row label="Amount (UGX)" value={data.amount_ugx} />
          <Row label="TX Hash" value={data.tx_digest || "—"} mono />
          <Row label="Receipt Hash" value={data.receipt_hash || "—"} mono />
          <Row label="Date" value={(data.created_at || "").slice(0, 19).replace("T", " ")} />
        </dl>
        {data.explorer_url && (
          <a href={data.explorer_url} target="_blank" rel="noopener noreferrer" className="sui-btn-primary inline-block">
            View on Sui Explorer
          </a>
        )}
      </article>
    </section>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
      <dt className="text-white/45">{label}</dt>
      <dd className={`text-right font-semibold text-white ${mono ? "sui-hash max-w-[220px] truncate" : ""}`}>{value}</dd>
    </div>
  );
}
