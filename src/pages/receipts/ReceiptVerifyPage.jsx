import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ShieldX } from "lucide-react";
import { receiptsApi } from "../../api/receiptsApi";
import ReceiptDocument from "../../components/receipts/ReceiptDocument";
import ReceiptBlockchainProof from "../../components/receipts/ReceiptBlockchainProof";
import { receiptTypeConfig } from "../../lib/receiptTheme";
import "../../styles/receipt-portal.css";

export default function ReceiptVerifyPage() {
  const { token } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["receipt-verify", token],
    queryFn: () => receiptsApi.verify(token),
    enabled: Boolean(token),
  });

  const valid = data?.valid;
  const doc = valid
    ? {
        ...data,
        receipt_type: data.tx_hash ? "blockchain" : "rent_payment",
        verification_url: typeof window !== "undefined" ? window.location.href : "",
      }
    : null;

  return (
    <div className="receipt-verify-public">
      <div className="receipt-page">
        <div className={`receipt-hero ${valid ? "receipt-hero--valid" : "receipt-hero--invalid"}`}>
          {isLoading ? (
            <p>Verifying receipt…</p>
          ) : error || !valid ? (
            <>
              <ShieldX className="mx-auto mb-3 text-red-400" size={48} />
              <h1 className="text-xl font-bold text-white">Receipt not verified</h1>
              <p className="mt-2 text-sm text-white/60">{data?.message || "Invalid or expired verification link."}</p>
            </>
          ) : (
            <>
              <ShieldCheck className="mx-auto mb-3 text-emerald-400" size={48} />
              <h1 className="text-xl font-bold text-white">Valid RentDirect UG receipt</h1>
              <p className="mt-2 text-sm text-white/60">{data.message}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider" style={{ color: receiptTypeConfig(doc).accent }}>
                {receiptTypeConfig(doc).badge}
              </p>
            </>
          )}
        </div>

        {valid && doc ? (
          <>
            <div className="receipt-detail-layout mt-6">
              <ReceiptDocument receipt={doc} />
              <ReceiptBlockchainProof receipt={doc} />
            </div>
            <p className="receipt-seal mt-4">RentDirect UG · Government-ready audit infrastructure · Uganda</p>
            <p className="text-center mt-4">
              <Link to="/login" className="text-sm text-emerald-400 hover:underline">Sign in to RentDirect UG</Link>
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
