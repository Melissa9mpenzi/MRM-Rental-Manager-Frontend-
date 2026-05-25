const STATUS_CLASS = {
  paid: "receipt-badge--paid",
  pending: "receipt-badge--pending",
  failed: "receipt-badge--failed",
  escrowed: "receipt-badge--escrowed",
  refunded: "receipt-badge--refunded",
  confirmed: "receipt-badge--confirmed",
  tax: "receipt-badge--tax",
};

export default function ReceiptStatusBadge({ status }) {
  const key = String(status || "paid").toLowerCase();
  return (
    <span className={`receipt-badge ${STATUS_CLASS[key] || STATUS_CLASS.paid}`}>
      {key.toUpperCase()}
    </span>
  );
}

export function ReceiptAmount({ amount, currency = "UGX" }) {
  return (
    <span className="receipt-amount">
      {currency} {Number(amount || 0).toLocaleString()}
    </span>
  );
}

export function ReceiptCard({ receipt, onView, compact }) {
  if (!receipt) return null;
  return (
    <article className={`receipt-card ${compact ? "receipt-card--compact" : ""}`}>
      <header className="receipt-card__head">
        <div>
          <p className="receipt-card__number">{receipt.receipt_number}</p>
          <p className="receipt-card__meta">{receipt.period_label || receipt.property_name}</p>
        </div>
        <ReceiptStatusBadge status={receipt.status} />
      </header>
      <div className="receipt-card__body">
        <ReceiptAmount amount={receipt.amount} currency={receipt.currency} />
        <p className="receipt-card__method">{(receipt.payment_method || "").replace(/_/g, " ")}</p>
      </div>
      {receipt.smart_summary && !compact && (
        <p className="receipt-card__summary">{receipt.smart_summary}</p>
      )}
      <footer className="receipt-card__foot">
        {onView ? (
          <button type="button" className="receipt-btn receipt-btn--ghost" onClick={() => onView(receipt)}>
            View receipt
          </button>
        ) : null}
      </footer>
    </article>
  );
}
