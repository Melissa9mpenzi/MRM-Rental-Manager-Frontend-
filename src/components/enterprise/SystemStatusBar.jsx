import { useQuery } from "@tanstack/react-query";
import { Activity, CreditCard, Database, Link2, HardDrive } from "lucide-react";
import { platformApi } from "../../api/platformApi";

const STATUS_DOT = {
  operational: "bg-emerald-400",
  healthy: "bg-emerald-400",
  synced: "bg-cyan-400",
  active: "bg-cyan-400",
  "testnet-ready": "bg-amber-400",
  degraded: "bg-amber-400",
  local: "bg-white/40",
};

function Pill({ icon: Icon, label, state }) {
  const dot = STATUS_DOT[state] || STATUS_DOT.operational;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-white/65">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <Icon size={11} className="text-white/40" />
      {label}
    </span>
  );
}

export default function SystemStatusBar({ compact = false }) {
  const { data } = useQuery({
    queryKey: ["system-status"],
    queryFn: () => platformApi.systemStatus(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  if (!data) return null;

  if (compact) {
    const issues = Array.isArray(data.issues) ? data.issues : [];
    const degraded =
      issues.length > 0 ||
      data.database === "misconfigured" ||
      data.api !== "operational";
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
          degraded ? "text-amber-300/90" : "text-emerald-300/90"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            degraded ? "bg-amber-400" : "animate-pulse bg-emerald-400"
          }`}
        />
        {degraded ? "Some services need attention" : "All systems operational"}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Pill icon={Activity} label="API operational" state={data.api} />
      <Pill icon={Database} label="Database" state={data.database} />
      <Pill icon={CreditCard} label={`Payments ${data.payments}`} state={data.payments} />
      <Pill icon={Link2} label={`Sui ${data.blockchain}`} state={data.blockchain} />
      <Pill icon={HardDrive} label={`Storage ${data.storage}`} state={data.storage} />
    </div>
  );
}
