import { ExternalLink } from "lucide-react";
import { explorerTxUrl } from "../../lib/suiCheckout";

export default function BlockchainReceiptCard({ receipt, network = "devnet" }) {
  if (!receipt) return null;
  const url = receipt.explorer_url || explorerTxUrl(network, receipt.tx_digest);
  return (
    <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-violet-200">Blockchain receipt</p>
          <p className="mt-1 text-xs text-white/55">
            {receipt.payment_method?.replace(/_/g, " ") || "payment"} · UGX {receipt.amount_ugx}
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
          {receipt.status}
        </span>
      </div>
      {receipt.receipt_hash && (
        <p className="mt-2 break-all font-mono text-[11px] text-white/45">
          hash: {receipt.receipt_hash.slice(0, 24)}…
        </p>
      )}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-brand-teal hover:underline"
        >
          View on SuiScan <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}