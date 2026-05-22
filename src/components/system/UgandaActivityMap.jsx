import { useId } from "react";
import { UGANDA_OUTLINE, UGANDA_VIEWBOX } from "../../lib/ugandaMapRegions";

/**
 * Live Uganda activity map — real country outline + district nodes from API.
 */
export default function UgandaActivityMap({ nodes = [], loading = false }) {
  const uid = useId().replace(/:/g, "");
  const landGradId = `ug-sys-land-${uid}`;
  const list = Array.isArray(nodes) && nodes.length > 0 ? nodes : [];

  return (
    <div className="sys-map-panel__inner relative h-48 w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-[#0b0e14]/60">
          <span className="text-[10px] font-medium text-emerald-400/80">Updating live data…</span>
        </div>
      )}

      <svg viewBox={UGANDA_VIEWBOX} className="h-full w-full" aria-label="Uganda platform activity map">
        <defs>
          <linearGradient id={landGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(6, 78, 59, 0.9)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.85)" />
          </linearGradient>
        </defs>

        <path
          d={UGANDA_OUTLINE}
          fill={`url(#${landGradId})`}
          stroke="rgba(0,200,150,0.45)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />

        {list.map((n, i) => {
          const r = Math.max(3, (n.size || 8) / 2.5);
          return (
            <g key={`${n.district}-${i}`}>
              <circle cx={n.x} cy={n.y} r={r + 2} fill="rgba(0,200,150,0.2)" className="sys-map-node__ring" />
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill="rgba(0,200,150,0.55)"
                stroke="#00c896"
                strokeWidth="0.6"
                className="sys-map-node__core"
              >
                <title>
                  {n.district}: {n.count} active {n.count === 1 ? "property" : "properties"}
                </title>
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center gap-2">
        <span className="sys-map-live-dot" aria-hidden />
        <p className="text-[10px] font-semibold tracking-wide text-emerald-400/90">
          Uganda · {list.length} live {list.length === 1 ? "node" : "nodes"}
        </p>
      </div>
    </div>
  );
}
