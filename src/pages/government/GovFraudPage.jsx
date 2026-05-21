import { useQuery } from "@tanstack/react-query";
import { governmentApi } from "../../api/governmentApi";

export default function GovFraudPage() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["gov-fraud"],
    queryFn: () => governmentApi.fraudAlerts(),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Fraud Detection Center</h2>
        <p className="text-sm text-white/50">AI-assisted alerts for identity fraud, illegal listings, and suspicious payments.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {isLoading && <p className="text-white/45">Loading alerts…</p>}
        {alerts.map((a) => (
          <div key={a.id} className="gov-glass border-l-4 border-red-500/60 p-4">
            <div className="flex items-center justify-between">
              <span className="gov-badge gov-badge-high">{a.severity}</span>
              <span className="text-[10px] uppercase text-white/40">{a.type}</span>
            </div>
            <h3 className="mt-2 font-semibold text-white">{a.title}</h3>
            <p className="mt-1 text-sm text-white/60">{a.subject}</p>
            <p className="mt-1 text-xs text-white/45">{a.detail}</p>
            <p className="mt-2 text-[10px] text-white/35">{a.created_at?.slice(0, 19) || ""}</p>
          </div>
        ))}
        {!isLoading && alerts.length === 0 && (
          <p className="text-white/45">No active fraud alerts.</p>
        )}
      </div>
    </div>
  );
}
