import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FileText, Shield } from "lucide-react";
import { receiptsApi } from "../../api/receiptsApi";
import { ReceiptCard } from "../../components/receipts/ReceiptCard";
import "../../styles/receipt-portal.css";

export default function AdminReceiptsPage() {
  const navigate = useNavigate();
  const { data: stats } = useQuery({ queryKey: ["receipt-admin-stats"], queryFn: receiptsApi.adminStats });
  const { data, isLoading } = useQuery({
    queryKey: ["receipts-admin-list"],
    queryFn: () => receiptsApi.list({ limit: 200 }),
  });
  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText size={24} /> Receipt management
        </h1>
        <p className="text-sm text-white/50 mt-1">All platform receipts · audit · tax · blockchain verification</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Total", stats?.total_receipts],
          ["Paid", stats?.paid],
          ["Escrowed", stats?.escrowed],
          ["On-chain", stats?.blockchain_verified],
        ].map(([label, val]) => (
          <div key={label} className="receipt-panel text-center">
            <p className="text-xs text-white/45 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{val ?? "—"}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-white/45">
        <Shield size={14} /> Fraud checks · refund workflow · URA tax reports (audit log integration)
      </div>

      {isLoading ? (
        <p className="text-white/50">Loading…</p>
      ) : (
        <div className="receipt-grid">
          {rows.map((r) => (
            <ReceiptCard key={r.id} receipt={r} onView={() => navigate(`/system/receipts/${r.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
