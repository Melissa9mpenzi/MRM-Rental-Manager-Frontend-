import { qrImageUrl } from "../../lib/receiptTheme";
import { verifyPageUrl } from "../../api/verifyApi";

/** Compact QR + label for receipts, contracts, property compliance */
export default function VerifyQrBlock({ token, label = "Scan to verify", size = 88 }) {
  const url = verifyPageUrl(token);
  if (!token || !url) return null;

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-3">
      <img src={qrImageUrl(url, size)} alt="" width={size} height={size} className="rounded-md bg-white p-1" />
      <p className="text-center text-[10px] font-bold uppercase tracking-wide text-white/50">{label}</p>
      <p className="max-w-[140px] truncate font-mono text-[9px] text-white/35" title={url}>
        {url.replace(/^https?:\/\//, "")}
      </p>
    </div>
  );
}
