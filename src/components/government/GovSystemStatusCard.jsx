function formatNow() {
  const d = new Date();
  return {
    date: d.toLocaleDateString("en-UG", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-UG", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function GovSystemStatusCard({ status = "operational" }) {
  const { date, time } = formatNow();
  const ok = status === "operational";

  return (
    <div className="gov-system-status">
      <p className="gov-system-status__date">{date}</p>
      <p className="gov-system-status__time">{time}</p>
      <div className="gov-system-status__divider" />
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">System Status</p>
      <p className={`gov-system-status__label ${ok ? "gov-system-status__label--ok" : ""}`}>
        <span className="gov-system-status__pulse" aria-hidden />
        {ok ? "All Systems Operational" : "Degraded Mode"}
      </p>
    </div>
  );
}
