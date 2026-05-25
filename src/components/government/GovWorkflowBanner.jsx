import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GOVERNMENT_WORKFLOW } from "../../config/governmentRoles";

export default function GovWorkflowBanner({ highlightAgency }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-300/90">{GOVERNMENT_WORKFLOW.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/70">
        {GOVERNMENT_WORKFLOW.steps.map((step, i) => (
          <span key={step.agency} className="inline-flex items-center gap-2">
            {i > 0 && <ArrowRight size={14} className="text-white/30" />}
            <Link
              to={step.path}
              className={`rounded-lg px-2 py-0.5 font-semibold transition hover:bg-white/10 ${
                highlightAgency === step.agency ? "bg-white/10 text-white" : "text-white/75"
              }`}
            >
              {step.order}. {step.agency}
            </Link>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-white/45">
        Register → NIRA (identity) → KCCA (property) → Rent → URA (tax). Listings show trust badges when compliant.
      </p>
    </div>
  );
}
