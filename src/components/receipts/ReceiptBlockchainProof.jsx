import { ExternalLink, ShieldCheck } from "lucide-react";
import { maskWalletOrHash } from "../../lib/receiptRedaction";

/** Sidebar on receipt detail — verification only, no raw hashes or blob IDs. */
export default function ReceiptBlockchainProof({ receipt }) {
  const hasVerify = Boolean(receipt?.verification_url || receipt?.verification_token);
  const hasChain = Boolean(receipt?.tx_hash);

  if (!hasVerify && !hasChain) return null;

  return (
    <aside className="receipt-proof-panel">
      <p className="receipt-proof-panel__title">
        <ShieldCheck size={14} className="inline mr-1 text-emerald-400" />
        Verification
      </p>
      <p className="text-xs text-white/55 leading-relaxed mb-3">
        This receipt is registered on RentDirect UG. Share the QR code or receipt number for confirmation — not your
        full payment reference or wallet details.
      </p>
      <dl className="receipt-proof-panel__list">
        <div>
          <dt>Receipt number</dt>
          <dd className="font-mono text-[11px]">{receipt.receipt_number}</dd>
        </div>
        {hasChain && (
          <div>
            <dt>Transaction (masked)</dt>
            <dd className="font-mono text-[10px]">{maskWalletOrHash(receipt.tx_hash)}</dd>
          </div>
        )}
      </dl>
      {receipt.explorer_url && (
        <a
          href={receipt.explorer_url}
          target="_blank"
          rel="noreferrer"
          className="receipt-btn receipt-btn--violet w-full justify-center mt-3 text-xs"
        >
          <ExternalLink size={12} /> View on explorer
        </a>
      )}
    </aside>
  );
}
