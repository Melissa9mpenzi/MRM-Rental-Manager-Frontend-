import BrandMark from "../brand/BrandMark";
import PaymentMethodIcon from "../payments/PaymentMethodIcon";
import { methodLabel, qrImageUrl, receiptTypeConfig } from "../../lib/receiptTheme";
import { receiptForDocument } from "../../lib/receiptRedaction";

function Row({ label, value, mono }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className="receipt-doc__row">
      <span className="receipt-doc__label">{label}</span>
      <span className={`receipt-doc__value ${mono ? "receipt-doc__value--mono" : ""}`}>{value}</span>
    </div>
  );
}

/** Printable official payment receipt — minimal PII, no internal hashes. */
export default function ReceiptDocument({ receipt, className = "" }) {
  if (!receipt) return null;

  const doc = receiptForDocument(receipt);
  const theme = receiptTypeConfig(doc);
  const verifyUrl = doc.verification_url || "";
  const issued = doc.issued_at
    ? new Date(doc.issued_at).toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const period = doc.period_label || "—";

  const type = doc.receipt_type || "rent_payment";
  const isEscrow = type === "security_deposit" || doc.status === "escrowed";
  const isTax = type === "government_tax";
  const isCommission = type === "commission";
  const statusLabel =
    doc.status === "escrowed"
      ? "HELD IN ESCROW"
      : doc.status === "paid"
        ? "PAID"
        : (doc.status || "PAID").toUpperCase();

  return (
    <article
      className={`receipt-doc ${className}`}
      style={{ "--receipt-accent": theme.accent, "--receipt-accent-soft": theme.accentSoft }}
    >
      <header className="receipt-doc__header">
        <div className="receipt-doc__brand">
          <BrandMark imgClassName="receipt-doc__logo h-12 w-auto max-w-[200px] object-contain" />
          <p className="receipt-doc__tagline">Official payment receipt</p>
        </div>
        <span className={`receipt-doc__badge receipt-doc__badge--${theme.badgeClass}`}>{statusLabel}</span>
      </header>

      <div className="receipt-doc__title-block">
        <h1>{theme.title}</h1>
        <div className="receipt-doc__meta">
          <span>
            <strong>Receipt No.</strong> {doc.receipt_number}
          </span>
          <span>
            <strong>Date issued</strong> {issued}
          </span>
        </div>
      </div>

      <section className="receipt-doc__amount-hero">
        <span>{isEscrow ? "Deposit amount" : isTax ? "Tax amount" : isCommission ? "Commission" : "Amount received"}</span>
        <strong>
          {doc.currency || "UGX"} {Number(doc.amount || 0).toLocaleString()}
        </strong>
      </section>

      <section className="receipt-doc__property">
        <div className="receipt-doc__property-info">
          <p className="receipt-doc__section-label">Tenancy</p>
          <p className="receipt-doc__property-name">{doc.property_name || "—"}</p>
          <p className="receipt-doc__muted">{doc.property_address || "—"}</p>
          <Row label="Unit" value={doc.unit_number} />
          <Row label="Billing period" value={period} />
          {!isCommission && <Row label="Paid by" value={doc.tenant_name} />}
          <Row label="Received by" value={doc.landlord_name} />
        </div>
      </section>

      <section className="receipt-doc__section">
        <p className="receipt-doc__section-label">Payment details</p>

        <div className="receipt-doc__method-row">
          {!isTax && (
            <PaymentMethodIcon method={doc.payment_method || "other"} className="receipt-doc__method-icon" />
          )}
          <div>
            <Row label="Payment method" value={methodLabel(doc.payment_method)} />
            <Row label="Payment reference" value={doc.transaction_reference} mono />
            {isEscrow && <Row label="Status" value="Held in escrow until lease end" />}
            {isTax && (
              <>
                <Row label="Tax type" value="Rental income tax" />
                <Row
                  label="VAT"
                  value={doc.vat_amount ? `UGX ${Number(doc.vat_amount).toLocaleString()}` : "—"}
                />
                <Row label="URA reference" value={doc.ura_compliance_code || doc.tax_id} />
              </>
            )}
            {isCommission && <Row label="Agent" value={doc.tenant_name} />}
          </div>
        </div>
      </section>

      {doc.tx_hash && (
        <section className="receipt-doc__section receipt-doc__section--muted">
          <p className="receipt-doc__section-label">Digital verification</p>
          <Row label="Record status" value="Registered on RentDirect UG" />
          <Row label="Transaction" value={doc.tx_hash} mono />
        </section>
      )}

      {verifyUrl && (
        <section className="receipt-doc__qr">
          <img src={qrImageUrl(verifyUrl, 100)} alt="Verify receipt" width={100} height={100} />
          <div>
            <p className="receipt-doc__qr-title">Verify this receipt</p>
            <p className="receipt-doc__qr-hint">
              Scan to confirm authenticity. Use receipt number <strong>{doc.receipt_number}</strong> if asked by
              your bank or landlord.
            </p>
          </div>
        </section>
      )}

      <footer className="receipt-doc__footer">
        <p>System-generated document · RentDirect UG · Uganda</p>
        <p>For support, quote your receipt number. This receipt is not a tax invoice unless marked URA compliant.</p>
      </footer>
    </article>
  );
}
