import { Link } from "react-router-dom";

export default function GovApprovalsPage() {
  return (
    <div className="gov-glass space-y-4 p-6">
      <h2 className="text-lg font-bold text-white">Approvals</h2>
      <p className="text-sm text-white/55">
        Cross-agency approval queue. Use agency dashboards for detailed decisions:
      </p>
      <ul className="list-inside list-disc space-y-2 text-sm text-emerald-300/90">
        <li>
          <Link to="/government/nira" className="hover:underline">
            NIRA identity queue
          </Link>
        </li>
        <li>
          <Link to="/government/kcca" className="hover:underline">
            KCCA property validation
          </Link>
        </li>
        <li>
          <Link to="/government/ura" className="hover:underline">
            URA compliance reports
          </Link>
        </li>
      </ul>
    </div>
  );
}
