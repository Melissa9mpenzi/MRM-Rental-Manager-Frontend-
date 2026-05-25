import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FileText, Search } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { receiptsApi } from "../../api/receiptsApi";
import ReceiptStatusBadge from "../../components/receipts/ReceiptCard";
import { RECEIPT_FILTERS, receiptTypeConfig } from "../../lib/receiptTheme";
import "../../styles/receipt-portal.css";

const TYPE_ICONS = {
  rent: "🏠",
  deposit: "🔒",
  commission: "🤝",
  tax: "🏛️",
  blockchain: "⛓️",
};

export default function ReceiptsListPage({ basePath = "/tenant/receipts" }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["receipts-list"],
    queryFn: () => receiptsApi.list({ limit: 100 }),
  });

  const rows = useMemo(() => {
    let list = Array.isArray(data) ? data : [];
    if (filter !== "all") list = list.filter((r) => r.receipt_type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.receipt_number?.toLowerCase().includes(q) ||
          r.property_name?.toLowerCase().includes(q) ||
          r.tenant_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, filter, query]);

  return (
    <AppPageScaffold
      title="My Receipts"
      subtitle="Payments & official receipts — legal, tax, and blockchain proof"
      icon={FileText}
    >
      <div className="receipt-list-toolbar">
        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            className="receipt-search pl-9"
            placeholder="Search receipts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="receipt-filters">
          {RECEIPT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`receipt-filter-chip ${filter === f.id ? "receipt-filter-chip--active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-white/50">Loading receipts…</p>
      ) : rows.length === 0 ? (
        <div className="card-glass p-8 text-center text-white/50">
          No receipts yet. Pay rent via MTN, Airtel, card, or Sui wallet to receive an official receipt.
        </div>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => {
            const theme = receiptTypeConfig(r);
            return (
              <button
                key={r.id}
                type="button"
                className="receipt-list-item"
                onClick={() => navigate(`${basePath}/${r.id}`)}
              >
                <span
                  className="receipt-list-item__icon"
                  style={{ background: theme.accentSoft, color: theme.accent }}
                >
                  {TYPE_ICONS[theme.icon] || "📄"}
                </span>
                <span className="receipt-list-item__body">
                  <span className="receipt-list-item__id">{r.receipt_number}</span>
                  <span className="receipt-list-item__sub">
                    {r.period_label || r.property_name} ·{" "}
                    {r.issued_at ? new Date(r.issued_at).toLocaleDateString() : ""}
                  </span>
                </span>
                <span className="receipt-list-item__amount">
                  {r.currency} {Number(r.amount || 0).toLocaleString()}
                </span>
                <ReceiptStatusBadge status={theme.badgeClass === "confirmed" ? "confirmed" : r.status} />
              </button>
            );
          })}
        </div>
      )}
    </AppPageScaffold>
  );
}
