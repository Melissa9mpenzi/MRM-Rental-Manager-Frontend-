import { HardDrive, ExternalLink, Hash } from "lucide-react";

/**
 * Walrus blob or verifiable content-hash proof (never labeled as Walrus when only hashed).
 */
export default function WalrusProofBadge({
  blobId,
  contentHash,
  url,
  walrusLive,
  demoMode,
  storageType,
  label,
  className = "",
}) {
  const live =
    walrusLive === true ||
    (walrusLive == null && storageType === "walrus") ||
    (walrusLive == null && blobId && !String(blobId).startsWith("hash:") && !demoMode);
  const hash = contentHash || (blobId?.startsWith("hash:") ? blobId.slice(5) : null);
  const displayId = live ? blobId : hash;

  if (!displayId) {
    return (
      <span className={`text-[10px] text-white/35 ${className}`} title="Not anchored yet">
        —
      </span>
    );
  }

  const short = displayId.length > 20 ? `${displayId.slice(0, 10)}…${displayId.slice(-6)}` : displayId;
  const tag = label || (live ? "Walrus" : "Content hash");

  return (
    <span
      className={`inline-flex max-w-[160px] items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9px] ${className} ${
        live
          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200/90"
          : "border-amber-500/30 bg-amber-500/10 text-amber-200/90"
      }`}
      title={displayId}
    >
      {live ? <HardDrive size={10} className="shrink-0 opacity-80" /> : <Hash size={10} className="shrink-0 opacity-80" />}
      <span className="truncate">
        {tag}: {short}
      </span>
      {url && live ? (
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
