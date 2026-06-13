import { Building2, ExternalLink, ShieldCheck } from "lucide-react";

function shortId(value) {
  if (!value || value.length < 14) return value;
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function kccaBadge(govStatus) {
  const gov = (govStatus || "pending").toLowerCase();
  if (gov === "verified") {
    return {
      label: "KCCA verified",
      title: "Government property compliance — approved by a KCCA officer",
      className: "border-emerald-500/35 bg-emerald-500/15 text-emerald-300",
      Icon: Building2,
    };
  }
  if (gov === "rejected" || gov === "illegal") {
    return {
      label: gov === "illegal" ? "KCCA flagged" : "KCCA rejected",
      title: "Government property compliance — not approved",
      className: "border-red-500/35 bg-red-500/15 text-red-300",
      Icon: Building2,
    };
  }
  if (gov === "inspection") {
    return {
      label: "KCCA inspection",
      title: "Government property compliance — field inspection scheduled",
      className: "border-amber-500/35 bg-amber-500/15 text-amber-200",
      Icon: Building2,
    };
  }
  return {
    label: "KCCA pending",
    title: "Government property compliance — awaiting KCCA officer review",
    className: "border-amber-500/35 bg-amber-500/15 text-amber-200",
    Icon: Building2,
  };
}

function suiBadge(property) {
  const status = property?.sui_identity_status;
  if (status === "minted") {
    return {
      label: "Sui listing verified",
      detail: property?.sui_identity_object_id,
      title: "Automatic on-chain listing identity — property ID, wallet, location, timestamp",
      className: "border-cyan-500/35 bg-cyan-500/15 text-cyan-200",
    };
  }
  if (status === "anchored") {
    return {
      label: "Sui listing anchored",
      detail: null,
      title: "On-chain listing record anchored on Sui",
      className: "border-cyan-500/35 bg-cyan-500/15 text-cyan-200",
    };
  }
  if (status === "registered") {
    return {
      label: "Sui listing registered",
      detail: null,
      title: "Listing identity registered — on-chain mint pending package/gas",
      className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100/90",
    };
  }
  return {
    label: "Sui required for marketplace",
    detail: null,
    title:
      "This property is hidden from tenant search until Sui listing identity is registered. Open the property once to backfill, or re-save after deploy.",
    className: "border-amber-500/35 bg-amber-500/10 text-amber-200",
  };
}

/**
 * Shows both verification layers on every property:
 * 1. Sui listing identity (automatic on create)
 * 2. KCCA government compliance (officer review)
 */
export default function PropertyVerificationBadges({
  property,
  compact = false,
  showLinks = true,
  className = "",
}) {
  const kcca = kccaBadge(property?.gov_verification_status);
  const sui = suiBadge(property);
  const KccaIcon = kcca.Icon;
  const explorerUrl = property?.sui_identity_explorer_url;
  const verifyUrl = property?.sui_identity_verify_url;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {!compact ? (
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/35">
          Property verification
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          title={kcca.title}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${kcca.className}`}
        >
          <KccaIcon size={11} />
          {kcca.label}
        </span>
        <span
          title={sui.title}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${sui.className}`}
        >
          <ShieldCheck size={11} />
          {sui.label}
        </span>
        {sui.detail ? (
          <span className="font-mono text-[10px] text-white/40" title={sui.detail}>
            {shortId(sui.detail)}
          </span>
        ) : null}
        {showLinks && explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 hover:underline"
          >
            SuiScan <ExternalLink size={10} />
          </a>
        ) : null}
        {showLinks && verifyUrl ? (
          <a
            href={verifyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 hover:underline"
          >
            Verify
          </a>
        ) : null}
      </div>
    </div>
  );
}

export const PROPERTY_LISTING_IDENTITY_TAGLINE =
  "Every property listing receives a verifiable on-chain identity on Sui, helping reduce fraud and duplicate listings.";

export const PROPERTY_VERIFICATION_NOTE =
  "Sui proves who listed the property and when — not that the building physically exists. KCCA officer review covers existence and compliance. Marketplace search requires Sui identity.";
