/** NIRA / KCCA / URA agency marks shown in the government header strip */
const AGENCIES = [
  { id: "nira", label: "NIRA", sub: "Identity", color: "#00c896" },
  { id: "kcca", label: "KCCA", sub: "Property", color: "#22d3ee" },
  { id: "ura", label: "URA", sub: "Tax", color: "#a78bfa" },
];

export default function GovAgencyLogos() {
  return (
    <div className="gov-agency-logos" aria-label="Partner agencies">
      {AGENCIES.map((a) => (
        <div key={a.id} className="gov-agency-logos__item" style={{ "--agency-color": a.color }}>
          <span className="gov-agency-logos__badge">{a.label}</span>
          <span className="gov-agency-logos__sub">{a.sub}</span>
        </div>
      ))}
    </div>
  );
}
