import { useNavigate } from "react-router-dom";
import { CheckCircle2, Download, Share2, Link2 } from "lucide-react";
import ReceiptDocument from "./ReceiptDocument";
import { maskPersonName } from "../../lib/receiptRedaction";
import { receiptsApi } from "../../api/receiptsApi";
import api from "../../api/client";
import toast from "react-hot-toast";

/** Post-payment success screen — matches mobile mockup */
export default function PaymentReceiptSuccess({ receipt, onClose, receiptsPath = "/tenant/receipts" }) {
  const navigate = useNavigate();
  if (!receipt) return null;

  const downloadPdf = async () => {
    try {
      const res = await api.get(`/receipts/${receipt.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${receipt.receipt_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Could not download PDF");
    }
  };

  const share = async () => {
    const url = receipt.verification_url || receiptsApi.verifyPageUrl(receipt.verification_token);
    try {
      if (navigator.share) await navigator.share({ title: receipt.receipt_number, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="receipt-success-overlay">
      <div className="receipt-success-modal">
        <div className="receipt-success-modal__hero">
          <CheckCircle2 size={56} className="text-emerald-400" strokeWidth={1.5} />
          <h2>Payment Successful!</h2>
          <p className="receipt-success-modal__amount">
            {receipt.currency || "UGX"} {Number(receipt.amount || 0).toLocaleString()}
          </p>
          <p className="receipt-success-modal__id">{receipt.receipt_number}</p>
        </div>

        <ul className="receipt-success-modal__summary">
          <li><span>Property</span><strong>{receipt.property_name || "—"}</strong></li>
          <li><span>Received by</span><strong>{maskPersonName(receipt.landlord_name) || "—"}</strong></li>
          <li><span>Method</span><strong>{(receipt.payment_method || "").replace(/_/g, " ")}</strong></li>
          <li><span>Date</span><strong>{receipt.issued_at ? new Date(receipt.issued_at).toLocaleDateString() : "—"}</strong></li>
          <li><span>Status</span><strong className="text-emerald-400">{(receipt.status || "paid").toUpperCase()}</strong></li>
        </ul>

        <div className="receipt-success-modal__actions">
          <button type="button" className="receipt-btn receipt-btn--primary flex-1 justify-center" onClick={downloadPdf}>
            <Download size={16} /> Download PDF
          </button>
          <button type="button" className="receipt-btn receipt-btn--ghost flex-1 justify-center" onClick={share}>
            <Share2 size={16} /> Share receipt
          </button>
        </div>

        <button
          type="button"
          className="receipt-success-modal__chain"
          onClick={() => navigate(`${receiptsPath}/${receipt.id}`)}
        >
          <Link2 size={14} /> View full receipt
        </button>

        {onClose && (
          <button type="button" className="receipt-success-modal__dismiss" onClick={onClose}>
            Continue
          </button>
        )}

        <div className="receipt-success-modal__doc-preview">
          <ReceiptDocument receipt={receipt} />
        </div>
      </div>
    </div>
  );
}
