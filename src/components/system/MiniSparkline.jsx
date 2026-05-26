/** Tiny trend line for KPI cards (mockup-style). */
export default function MiniSparkline({ values = [], color = "#00c896" }) {
  const data = values.length ? values : [3, 5, 4, 7, 6, 9, 8];
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100;
      const y = 22 - ((v - min) / range) * 18;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 24" className="mt-2 h-6 w-full opacity-80" preserveAspectRatio="none" aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}
