import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { platformApi } from "../../api/platformApi";

/** Shown on payment and admin flows — surfaces real config issues before a global demo. */
export default function ProductionReadinessBanner() {
  const { data } = useQuery({
    queryKey: ["platform-readiness"],
    queryFn: () => platformApi.readiness(),
    staleTime: 120_000,
    retry: 1,
  });

  if (!data) return null;

  const issues = data.issues || [];
  const warnings = data.warnings || [];
  const ready = data.ready_for_global_demo;

  if (ready && warnings.length === 0) {
    return (
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        <div>
          <strong>Production-ready.</strong> Live payments and database are configured. Sui/Walrus optional
          items may still show as warnings on <code className="text-xs">/api/v1/platform/readiness</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <div className="flex items-start gap-2">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <strong>{ready ? "Configured with warnings" : "Action required before global demo"}</strong>
          {issues.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-amber-100/90">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
          {warnings.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-amber-100/70">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
