import { useQuery } from "@tanstack/react-query";
import { workspaceApi } from "../../api/workspaceApi";

const fmt = (n) => new Intl.NumberFormat("en-UG", { notation: "compact" }).format(n || 0);

export default function SystemKpiRow({ cards }) {
  const { data, isLoading } = useQuery({
    queryKey: ["workspace-admin-summary"],
    queryFn: () => workspaceApi.adminSummary(),
    staleTime: 60_000,
  });

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, tone, format }) => {
        const raw = data?.[key];
        const value = isLoading ? "…" : format ? format(raw) : fmt(raw);
        return (
          <div key={key} className="sys-stat-card">
            <div className={`gov-stat-card__icon gov-stat-card__icon--${tone} sys-stat-card__icon--${tone}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-white/45">{label}</p>
            <p className="mt-1 text-xl font-bold text-white">{value}</p>
          </div>
        );
      })}
    </div>
  );
}
