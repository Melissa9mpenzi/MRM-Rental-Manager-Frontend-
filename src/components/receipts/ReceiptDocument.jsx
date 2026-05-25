import BrandMark from "../brand/BrandMark";
import PaymentMethodIcon from "../payments/PaymentMethodIcon";
import { methodLabel, qrImageUrl, receiptTypeConfig } from "../../lib/receiptTheme";

function Row({ label, value, mono }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className="receipt-doc__row">
      <span className="receipt-doc__label">{label}</span>
      <span className={`receipt-doc__value ${mono ? "receipt-doc__value--mono" : ""}`}>{value}</span>
    </div>
  );
}

/** Printable white receipt document — matches RentDirect UG mockup */
export default function ReceiptDocument({ receipt, className = "" }) {
  if (!receipt) return null;

  const theme = receiptTypeConfig(receipt);
  const verifyUrl = receipt.verification_url || "";
  const issued = receipt.issued_at
    ? new Date(receipt.issued_at).toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const lease =
    receipt.lease_start && receipt.lease_end
      ? `${receipt.lease_start} → ${receipt.lease_end}`
      : receipt.period_label || "—";

  const type = receipt.receipt_type || "rent_payment";
  const isEscrow = type === "security_deposit" || receipt.status === "escrowed";
  const isTax = type === "government_tax";
  const isCommission = type === "commission";
  const isChain = Boolean(receipt.tx_hash) || type === "blockchain";

  return (
    <article
      className={`receipt-doc ${className}`}
      style={{ "--receipt-accent": theme.accent, "--receipt-accent-soft": theme.accentSoft }}
    >
      <header className="receipt-doc__header">
        <div className="receipt-doc__brand">
          <BrandMark imgClassName="receipt-doc__logo h-12 w-auto max-w-[200px] object-contain" />
        </div>
        <span className={`receipt-doc__badge receipt-doc__badge--${theme.badgeClass}`}>{theme.badge}</span>
      </header>

      <div className="receipt-doc__title-block">
        <h1>{theme.title}</h1>
        <div className="receipt-doc__meta">
          <span>
            <strong>Receipt ID</strong> {receipt.receipt_number}
          </span>
          <span>
            <strong>Date issued</strong> {issued}
          </span>
        </div>
      </div>

      <section className="receipt-doc__property">
        <div className="receipt-doc__property-img" aria-hidden>
          <svg viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="8" fill="#e2e8f0" />
            <path d="M12 40 L32 22 L52 40 V52 H12 Z" fill="#94a3b8" />
            <rect x="26" y="36" width="12" height="16" fill="#64748b" />
          </svg>
        </div>
        <div className="receipt-doc__property-info">
          <p className="receipt-doc__section-label">Property</p>
          <p className="receipt-doc__property-name">{receipt.property_name || "—"}</p>
          <p className="receipt-doc__muted">{receipt.property_address || "—"}</p>
          <Row label="Landlord" value={receipt.landlord_name} />
          <Row label="Lease period" value={lease} />
          {!isCommission && <Row label="Tenant" value={receipt.tenant_name} />}
        </div>
      </section>

      <section className="receipt-doc__section">
        <p className="receipt-doc__section-label">
          {isEscrow ? "Deposit details" : isTax ? "Tax details" : isCommission ? "Commission" : "Payment details"}
        </p>

        <div className="receipt-doc__amount-box">
          <span>{isEscrow ? "Deposit amount" : isTax ? "Total tax paid" : isCommission ? "Commission amount" : "Amount paid"}</span>
          <strong>
            {receipt.currency || "UGX"} {Number(receipt.amount || 0).toLocaleString()}
          </strong>
        </div>

        <div className="receipt-doc__method-row">
          {!isTax && (
            <PaymentMethodIcon method={receipt.payment_method || "other"} className="receipt-doc__method-icon" />
          )}
          <div>
            <Row label="Payment method" value={methodLabel(receipt.payment_method)} />
            {isEscrow && (
              <>
                <Row label="Escrow ID" value={receipt.receipt_number} />
                <Row label="Smart contract" value={receipt.contract_id || "Sui Network (pending deploy)"} mono />
                <Row
                  label="Release conditions"
                  value="At end of lease period, subject to property inspection"
                />
                <Row label="Status" value="Held in Escrow" />
              </>
            )}
            {isCommission && (
              <>
                <Row label="Agent" value={receipt.tenant_name} />
                <Row label="Commission rate" value="5%" />
              </>
            )}
            {isTax && (
              <>
                <Row label="Tax type" value="Rental Income Tax" />
                <Row label="VAT (18%)" value={receipt.vat_amount ? `UGX ${Number(receipt.vat_amount).toLocaleString()}` : "—"} />
                <Row label="URA ref" value={receipt.ura_compliance_code || receipt.tax_id} />
                <Row label="Tax period" value={receipt.period_label} />
              </>
            )}
            {isChain && (
              <>
                <Row label="Network" value="Sui Mainnet" />
                <Row label="Wallet address" value={receipt.wallet_address} mono />
                <Row label="Transaction hash" value={receipt.tx_hash} mono />
                <Row label="Smart contract" value={receipt.contract_id} mono />
                <Row label="Gas fee" value={receipt.gas_fees_mist ? `${receipt.gas_fees_mist} MIST` : "—"} />
              </>
            )}
            {!isEscrow && !isTax && !isCommission && (
              <>
                <Row label="Transaction ID" value={receipt.transaction_reference} mono />
                <Row label="Reference" value={receipt.receipt_number} />
                <Row label="Payment status" value="Successful" />
                <Row label="Period" value={receipt.period_label} />
              </>
            )}
          </div>
        </div>
      </section>

      {receipt.smart_summary && (
        <p className="receipt-doc__summary">{receipt.smart_summary}</p>
      )}

      {verifyUrl && (
        <section className="receipt-doc__qr">
          <img src={qrImageUrl(verifyUrl, 100)} alt="Verify receipt QR" width={100} height={100} />
          <div>
            <p className="receipt-doc__qr-title">Scan to verify this receipt</p>
            <p className="receipt-doc__qr-url">{verifyUrl.replace(/^https?:\/\//, "")}</p>
          </div>
        </section>
      )}

      {receipt.walrus_blob_id && (
        <p className="receipt-doc__walrus">
          Secured on Sui Blockchain · Stored on Walrus: <code>{receipt.walrus_blob_id.slice(0, 24)}…</code>
        </p>
      )}

      <footer className="receipt-doc__footer">
        <span>System-generated receipt · RentDirect UG</span>
        <span>support@rentdirect.ug · +256 700 000 000</span>
      </footer>
    </article>
  );
}
