export default function SuiStatusBadge({ status }) {
  const s = String(status || "pending").toLowerCase();
  let tone = "neutral";
  if (s.includes("success") || s === "active" || s === "anchored" || s === "completed" || s === "released") {
    tone = "success";
  } else if (s.includes("fail") || s === "cancelled") tone = "danger";
  else if (s.includes("pend") || s === "processing" || s === "held") tone = "warn";
  else if (s === "funded") tone = "violet";

  return <span className={`sui-badge sui-badge--${tone}`}>{status}</span>;
}
