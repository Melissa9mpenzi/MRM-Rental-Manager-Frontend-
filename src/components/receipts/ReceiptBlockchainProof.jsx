import { qrImageUrl } from "../../lib/receiptTheme";

export default function ReceiptBlockchainProof({ receipt }) {
  if (!receipt?.verification_hash && !receipt?.walrus_blob_id && !receipt?.tx_hash) return null;

  const verifyUrl = receipt.verification_url || "";

  return (
    <aside className="receipt-proof-panel">
      <p className="receipt-proof-panel__title">Blockchain proof</p>
      <dl className="receipt-proof-panel__list">
        {receipt.verification_hash && (
          <div>
            <dt>SHA256 hash</dt>
            <dd className="font-mono text-[10px] leading-relaxed break-all">{receipt.verification_hash}</dd>
          </div>
        )}
        {receipt.walrus_blob_id && (
          <div>
            <dt>Stored on Walrus</dt>
            <dd className="font-mono text-[10px] break-all">{receipt.walrus_blob_id}</dd>
          </div>
        )}
        {receipt.digital_signature && (
          <div>
            <dt>Digital signature</dt>
            <dd className="font-mono text-[10px] break-all">{receipt.digital_signature.slice(0, 32)}…</dd>
          </div>
        )}
      </dl>
      {verifyUrl && (
        <div className="receipt-proof-panel__qr">
          <img src={qrImageUrl(verifyUrl, 88)} alt="" width={88} height={88} />
          <p className="text-[10px] text-white/45 mt-2 text-center">Verify online</p>
        </div>
      )}
      {receipt.explorer_url && (
        <a href={receipt.explorer_url} target="_blank" rel="noreferrer" className="receipt-btn receipt-btn--violet w-full justify-center mt-3 text-xs">
          Sui Explorer
        </a>
      )}
    </aside>
  );
}
