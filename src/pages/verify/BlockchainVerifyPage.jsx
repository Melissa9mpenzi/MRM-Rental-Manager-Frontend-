import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, ShieldCheck, ShieldX, XCircle } from "lucide-react";
import { verifyApi } from "../../api/verifyApi";
import { methodLabel, qrImageUrl } from "../../lib/receiptTheme";
import WalrusProofBadge from "../../components/sui/WalrusProofBadge";
import BrandMark from "../../components/brand/BrandMark";
import "../../styles/verify-portal.css";

const VERIFY_STEPS = [
  "Loading secure record",
  "Checking hash integrity",
  "Verifying on Sui",
  "Confirming Walrus proof",
];

const CHECK_LABELS = {
  record_exists: "Record exists",
  hash_integrity: "Hash integrity",
  payment_valid: "Payment valid",
  contract_valid: "Contract / approval valid",
  chain_confirmed: "Sui transaction",
  walrus_proof: "Walrus / content proof",
  not_tampered: "Not tampered",
};

function fmtMoney(amount, currency = "UGX") {
  if (amount == null) return "—";
  return `${currency} ${Number(amount).toLocaleString()}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-UG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function VerifyRow({ label, value, mono }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className="verify-row">
      <dt>{label}</dt>
      <dd className={mono ? "font-mono text-[10px]" : ""}>{value}</dd>
    </div>
  );
}

function ChecksGrid({ checks }) {
  if (!checks) return null;
  return (
    <div className="verify-checks">
      {Object.entries(CHECK_LABELS).map(([key, label]) => {
        const ok = checks[key];
        if (ok === undefined) return null;
        return (
          <div key={key} className={`verify-check ${ok ? "verify-check--ok" : "verify-check--fail"}`}>
            {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {label}
          </div>
        );
      })}
    </div>
  );
}

export default function BlockchainVerifyPage({ forcedKind }) {
  const { token, kind: routeKind } = useParams();
  const kind = forcedKind || routeKind;

  const [phase, setPhase] = useState("loading");
  const [stepIndex, setStepIndex] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["blockchain-verify", kind, token],
    queryFn: () => {
      if (kind === "receipt") return verifyApi.receipt(token);
      if (kind === "contract") return verifyApi.contract(token);
      if (kind === "property") return verifyApi.property(token);
      if (kind === "compliance") return verifyApi.compliance(token);
      return verifyApi.resolve(token);
    },
    enabled: Boolean(token),
    retry: 1,
  });

  useEffect(() => {
    if (!isLoading && !isError) return undefined;
    const t = setInterval(() => setStepIndex((i) => (i + 1) % VERIFY_STEPS.length), 450);
    return () => clearInterval(t);
  }, [isLoading, isError]);

  useEffect(() => {
    if (isLoading) {
      setPhase("loading");
      return undefined;
    }
    const minMs = 1400;
    const t0 = Date.now();
    const finish = () => {
      const elapsed = Date.now() - t0;
      const wait = Math.max(0, minMs - elapsed);
      const t = setTimeout(() => setPhase("done"), wait);
      return () => clearTimeout(t);
    };
    return finish();
  }, [isLoading, data, isError]);

  const showResult = phase === "done" && !isLoading;
  const valid = data?.valid;
  const loading = !showResult;

  const title = useMemo(() => {
    if (loading) return "Verifying on Sui…";
    if (isError || !data) return "Verification failed";
    if (valid) return data.title || "Verified";
    return data.title || "Not verified";
  }, [loading, isError, data, valid]);

  const headline = useMemo(() => {
    if (loading) return "Running tamper-proof checks";
    if (valid) return data.headline || "Receipt Authenticated";
    return data?.headline || data?.message || "Record could not be authenticated";
  }, [loading, valid, data]);

  return (
    <div className="verify-portal">
      <div className="verify-portal__inner">
        <div className="mb-6 flex justify-center">
          <BrandMark imgClassName="h-10 w-auto opacity-90" />
        </div>

        <div
          className={`verify-hero ${loading ? "verify-hero--loading" : valid ? "verify-hero--success" : "verify-hero--fail"}`}
        >
          {loading ? (
            <>
              <div className="verify-spinner" aria-hidden />
              <h1 className="text-xl font-extrabold text-white">{title}</h1>
              <p className="mt-2 text-sm text-white/55">{headline}</p>
              <div className="verify-steps">
                {VERIFY_STEPS.map((label, i) => (
                  <div
                    key={label}
                    className={`verify-step ${i === stepIndex ? "verify-step--active" : i < stepIndex ? "verify-step--done" : ""}`}
                  >
                    <span className="verify-step__dot" />
                    {label}
                  </div>
                ))}
              </div>
            </>
          ) : valid ? (
            <>
              <ShieldCheck className="mx-auto mb-3 text-emerald-400" size={52} strokeWidth={1.5} />
              <h1 className="text-2xl font-extrabold text-emerald-100">{title}</h1>
              <p className="mt-2 text-sm font-semibold text-emerald-300/90">{headline}</p>
              <p className="mt-1 text-xs text-white/50">{data.message}</p>
            </>
          ) : (
            <>
              <ShieldX className="mx-auto mb-3 text-red-400" size={52} strokeWidth={1.5} />
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="mt-2 text-sm text-white/55">
                {data?.message || error?.message || "Invalid or unknown verification code."}
              </p>
            </>
          )}
        </div>

        {showResult && data && (
          <div className="verify-card">
            <div className="verify-card__section">
              <p className="verify-card__title">
                {data.kind === "receipt"
                  ? "Blockchain payment receipt"
                  : data.kind === "contract"
                    ? "Rental agreement"
                    : data.kind === "property"
                      ? "Property compliance"
                      : data.kind === "compliance"
                        ? "Government identity"
                        : "Verification"}
              </p>
              <ChecksGrid checks={data.checks} />
            </div>

            {data.kind === "receipt" && (
              <>
                <div className="verify-card__section">
                  <p className="verify-card__title">Main details</p>
                  <VerifyRow label="Receipt number" value={data.receipt_number} mono />
                  <VerifyRow label="Tenant" value={data.tenant_name} />
                  <VerifyRow label="Landlord" value={data.landlord_name} />
                  <VerifyRow label="Property" value={data.property_name} />
                  <VerifyRow label="Unit" value={data.unit_number} />
                  <VerifyRow label="Amount paid" value={fmtMoney(data.amount, data.currency)} />
                  <VerifyRow label="Payment method" value={methodLabel(data.payment_method)} />
                  <VerifyRow label="Period" value={data.period_label} />
                  <VerifyRow label="Date" value={fmtDate(data.issued_at)} />
                  <VerifyRow label="Reference" value={data.transaction_reference} mono />
                  <VerifyRow label="Escrow status" value={data.escrow_status || data.status} />
                </div>
                <div className="verify-card__section">
                  <p className="verify-card__title">Blockchain</p>
                  <VerifyRow label="Transaction hash" value={data.tx_hash} mono />
                  <VerifyRow label="Smart contract ID" value={data.contract_id || "—"} mono />
                  <VerifyRow
                    label="Verification status"
                    value={valid ? "Verified on Sui Blockchain" : "Pending / off-chain"}
                  />
                  {(data.walrus_blob_id || data.content_hash) && (
                    <div className="mt-2">
                      <WalrusProofBadge
                        blobId={data.walrus_blob_id}
                        contentHash={data.content_hash}
                        walrusLive={data.walrus_live}
                        storageType={data.storage_type}
                        label="Walrus proof"
                      />
                    </div>
                  )}
                  {data.explorer_url && (
                    <a
                      href={data.explorer_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-300 hover:text-white"
                    >
                      View on Sui Explorer <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </>
            )}

            {data.kind === "contract" && (
              <div className="verify-card__section">
                <p className="verify-card__title">Agreement</p>
                <VerifyRow label="Tenant" value={data.tenant_name} />
                <VerifyRow label="Landlord" value={data.landlord_name} />
                <VerifyRow label="Property" value={data.property_name} />
                <VerifyRow label="Unit" value={data.unit_number} />
                <VerifyRow label="Monthly rent" value={fmtMoney(data.monthly_rent)} />
                <VerifyRow label="Deposit" value={fmtMoney(data.deposit_amount)} />
                <VerifyRow label="Lease period" value={`${data.start_date || "—"} → ${data.end_date || "open"}`} />
                <VerifyRow label="Status" value={data.status} />
                <VerifyRow label="Agreement hash" value={data.agreement_hash} mono />
                <VerifyRow label="Smart contract ID" value={data.contract_id} mono />
                <div className="mt-2">
                  <WalrusProofBadge
                    blobId={data.walrus_blob_id}
                    contentHash={data.content_hash}
                    walrusLive={data.walrus_live}
                    storageType={data.storage_type}
                  />
                </div>
              </div>
            )}

            {data.kind === "property" && (
              <div className="verify-card__section">
                <p className="verify-card__title">KCCA property</p>
                <VerifyRow label="Property" value={data.property_name} />
                <VerifyRow label="Address" value={data.property_address} />
                <VerifyRow label="District" value={data.district} />
                <VerifyRow label="Landlord" value={data.landlord_name} />
                <VerifyRow label="KCCA status" value={data.gov_verification_status} />
                <div className="mt-2">
                  <WalrusProofBadge
                    blobId={data.walrus_blob_id}
                    contentHash={data.content_hash}
                    walrusLive={data.walrus_live}
                    storageType={data.storage_type}
                    label="Compliance packet"
                  />
                </div>
              </div>
            )}

            {data.kind === "compliance" && (
              <div className="verify-card__section">
                <p className="verify-card__title">NIRA / identity</p>
                <VerifyRow label="Name" value={data.full_name} />
                <VerifyRow label="Email" value={data.email} />
                <VerifyRow label="National ID" value={data.national_id_masked} mono />
                <VerifyRow label="KYC status" value={data.kyc_review_status} />
                <VerifyRow label="Verified at" value={fmtDate(data.verified_at)} />
                <div className="mt-2">
                  <WalrusProofBadge
                    blobId={data.walrus_blob_id}
                    contentHash={data.content_hash}
                    walrusLive={data.walrus_live}
                    storageType={data.storage_type}
                    label="KYC manifest"
                  />
                </div>
              </div>
            )}

            {data.verification_url && (
              <div className="verify-qr-block">
                <img src={qrImageUrl(data.verification_url, 100)} alt="" width={100} height={100} />
                <p className="mt-2 text-[10px] text-white/45">Scan to verify again</p>
              </div>
            )}
          </div>
        )}

        <footer className="verify-footer">
          <strong>Secured by Sui Blockchain</strong>
          Stored on Walrus
          <br />
          Powered by RentDirect UG
        </footer>

        <p className="mt-6 text-center">
          <Link to="/" className="text-xs font-bold text-emerald-400 hover:underline">
            ← rentdirect.ug
          </Link>
        </p>
      </div>
    </div>
  );
}
