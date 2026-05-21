import { Link } from "react-router-dom";

export default function GovInspectionsPage() {
  return (
    <div className="gov-glass space-y-4 p-6">
      <h2 className="text-lg font-bold text-white">Inspection Requests</h2>
      <p className="text-sm text-white/55">
        Properties marked for inspection appear in the{" "}
        <Link to="/government/kcca" className="text-cyan-300 hover:underline">
          KCCA dashboard
        </Link>{" "}
        with status <strong className="text-white">inspection</strong>. Officers can schedule field visits and
        update outcomes there.
      </p>
    </div>
  );
}
