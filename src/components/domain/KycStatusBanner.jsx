import { Link } from "react-router-dom";

/** Shared landlord / agent KYC banner (dashboard + key pages). */
export default function KycStatusBanner({ user, roleLabel = "account" }) {
  if (!user || user.trusted_for_commerce) return null;

  return (
    <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      {!user.kyc_submitted_at ? (
        <>
          <strong className="font-bold">Action required.</strong> Submit KYC to unlock full {roleLabel} features.{" "}
          <Link to="/auth/kyc" className="font-semibold text-brand-teal underline-offset-2 hover:underline">
            Complete KYC →
          </Link>
        </>
      ) : user.kyc_review_status === "pending" ? (
        <>
          <strong className="font-bold">Verification in progress.</strong> Your documents are queued for review
          (including NIRA identity checks). You can use this dashboard while you wait — publishing and payouts unlock
          after approval.{" "}
          <Link to="/verification-pending" className="font-semibold text-brand-teal underline-offset-2 hover:underline">
            Details →
          </Link>
        </>
      ) : user.kyc_review_status === "rejected" ? (
        <>
          <strong className="font-bold">KYC needs attention.</strong> Please resubmit your documents.{" "}
          <Link to="/auth/kyc" className="font-semibold text-brand-teal underline-offset-2 hover:underline">
            Resubmit KYC →
          </Link>
        </>
      ) : (
        <>
          <strong className="font-bold">Limited mode.</strong> Complete verification to unlock full features.{" "}
          <Link to="/auth/kyc" className="font-semibold text-brand-teal underline-offset-2 hover:underline">
            Submit KYC →
          </Link>
        </>
      )}
    </div>
  );
}
