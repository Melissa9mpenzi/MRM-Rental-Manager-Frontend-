import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, ShieldCheck, ShieldX, XCircle } from "lucide-react";
import { verifyApi } from "../../api/verifyApi";
import { methodLabel, qrImageUrl } from "../../lib/receiptTheme";
import { verifyPayloadForDisplay } from "../../lib/receiptRedaction";
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
  const display = verifyPayloadForDisplay(data);
  const valid = display?.valid;
  const loading = !showResult;

  const title = useMemo(() => {
    if (loading) return "Verifying on Sui…";
    if (isError || !data) return "Verification failed";
    if (valid) return display?.title || "Verified";
    return display?.title || "Not verified";
  }, [loading, isError, display, valid]);

  const headline = useMemo(() => {
    if (loading) return "Checking receipt authenticity";
    if (valid) return display?.headline || "Payment record confirmed";
    return display?.headline || display?.message || "Record could not be authenticated";
  }, [loading, valid, display]);

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
              <p className="mt-1 text-xs text-white/50">{display?.message}</p>
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

        {showResult && display && (
          <div className="verify-card">
            <div className="verify-card__section">
              <p className="verify-card__title">
                {display.kind === "receipt"
                  ? "Payment receipt"
                  : display.kind === "contract"
                    ? "Rental agreement"
                    : display.kind === "property"
                      ? "Property compliance"
                      : display.kind === "compliance"
                        ? "Government identity"
                        : "Verification"}
              </p>
              <ChecksGrid checks={display.checks} />
            </div>

            {display.kind === "receipt" && (
              <div className="verify-card__section">
                <p className="verify-card__title">Receipt summary</p>
                <VerifyRow label="Receipt number" value={display.receipt_number} mono />
                <VerifyRow label="Property" value={display.property_name} />
                <VerifyRow label="Location" value={display.property_address} />
                <VerifyRow label="Unit" value={display.unit_number} />
                <VerifyRow label="Amount" value={fmtMoney(display.amount, display.currency)} />
                <VerifyRow label="Payment method" value={methodLabel(display.payment_method)} />
                <VerifyRow label="Period" value={display.period_label} />
                <VerifyRow label="Date issued" value={fmtDate(display.issued_at)} />
                <VerifyRow label="Reference" value={display.transaction_reference} mono />
                <VerifyRow label="Status" value={display.escrow_status || display.status} />
                {display.tx_hash && (
                  <VerifyRow label="Transaction" value={display.tx_hash} mono />
                )}
                {display.explorer_url && valid && (
                  <a
                    href={display.explorer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-white"
                  >
                    View transaction <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}

            {display.kind === "contract" && (
              <div className="verify-card__section">
                <p className="verify-card__title">Agreement</p>
                <VerifyRow label="Property" value={display.property_name} />
                <VerifyRow label="Unit" value={display.unit_number} />
                <VerifyRow label="Monthly rent" value={fmtMoney(display.monthly_rent)} />
                <VerifyRow label="Status" value={display.status} />
              </div>
            )}

            {display.kind === "property" && (
              <>
                <div className="verify-card__section">
                  <p className="verify-card__title">Sui listing identity (automatic)</p>
                  <VerifyRow label="Status" value={display.sui_identity_status} />
                  <VerifyRow label="Sui object" value={display.sui_identity_object_id} mono />
                  <VerifyRow
                    label="Listed at"
                    value={display.sui_listed_at_ms ? fmtDate(new Date(display.sui_listed_at_ms)) : null}
                  />
                </div>
                <div className="verify-card__section">
                  <p className="verify-card__title">KCCA compliance (government)</p>
                  <VerifyRow label="Property" value={display.property_name} />
                  <VerifyRow label="District" value={display.district} />
                  <VerifyRow label="KCCA status" value={display.gov_verification_status} />
                </div>
              </>
            )}

            {display.kind === "compliance" && (
              <div className="verify-card__section">
                <p className="verify-card__title">Identity check</p>
                <VerifyRow label="KYC status" value={display.kyc_review_status} />
                <VerifyRow label="Verified at" value={fmtDate(display.verified_at)} />
              </div>
            )}

            {display.verification_url && (
              <div className="verify-qr-block">
                <img src={qrImageUrl(display.verification_url, 100)} alt="" width={100} height={100} />
                <p className="mt-2 text-[10px] text-white/45">Scan to verify again</p>
              </div>
            )}
          </div>
        )}

        <footer className="verify-footer">
          <strong>RentDirect UG</strong>
          Official verification service · Uganda
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
