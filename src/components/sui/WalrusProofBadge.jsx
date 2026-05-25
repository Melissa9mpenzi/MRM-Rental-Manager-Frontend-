import { HardDrive, ExternalLink } from "lucide-react";

/**
 * Compact Walrus proof indicator (blob id or demo hash anchor).
 */
export default function WalrusProofBadge({
  blobId,
  url,
  demoMode,
  label = "Walrus",
  className = "",
}) {
  if (!blobId) {
    return (
      <span className={`text-[10px] text-white/35 ${className}`} title="Not anchored yet">
        —
      </span>
    );
  }

  const short = blobId.length > 20 ? `${blobId.slice(0, 10)}…${blobId.slice(-6)}` : blobId;
  const isDemo = demoMode ?? blobId.startsWith("hash:");

  return (
    <span
      className={`inline-flex max-w-[140px] items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9px] ${className} ${
        isDemo
          ? "border-amber-500/30 bg-amber-500/10 text-amber-200/90"
          : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200/90"
      }`}
      title={blobId}
    >
      <HardDrive size={10} className="shrink-0 opacity-80" />
      <span className="truncate">{label}: {short}</span>
      {url && !isDemo ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-cyan-300 hover:text-white"
          aria-label="Open Walrus blob"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={10} />
        </a>
      ) : null}
    </span>
  );
}
