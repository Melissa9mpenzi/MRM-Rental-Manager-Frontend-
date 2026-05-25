import { Link } from "react-router-dom";
import { Clock, Mail } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";

/** Shown to landlords/agents after KYC submit while moderation reviews the account. */
export default function PendingApprovalPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const home = defaultDashboardPath(role);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/[0.1] bg-white/[0.04] p-5 text-center sm:p-6">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
        <Clock className="h-7 w-7 text-amber-200" />
      </div>
      <h1 className="text-lg font-bold text-white sm:text-xl">Verification in progress</h1>
      <p className="mt-2 text-sm text-white/60">
        Thanks for submitting KYC. NIRA-linked identity checks and platform officers will review your documents.
        You stay signed in and can use your dashboard while you wait — publishing listings and payouts unlock after
        approval.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          to={home}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.1]"
        >
          Open dashboard
        </Link>
        <a
          href="mailto:support@rentdirect.ug"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-teal/40 bg-brand-teal/15 px-4 py-2.5 text-sm font-semibold text-brand-teal"
        >
          <Mail size={16} /> Contact support
        </a>
      </div>
    </div>
  );
}
