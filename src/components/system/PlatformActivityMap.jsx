import { useId, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UGANDA_OUTLINE, UGANDA_VIEWBOX } from "../../lib/ugandaMapRegions";
import {
  arcPath,
  buildActivityRegions,
  normalizeMapNodes,
  pickHubNode,
} from "../../lib/platformActivityMap";

async function loadUgandaGeo() {
  const res = await fetch("/data/uganda-adm2.geojson");
  if (!res.ok) throw new Error("Map data unavailable");
  return res.json();
}

/**
 * Super Admin — Platform Activity (Live) map (mockup style).
 */
export default function PlatformActivityMap({ nodes = [], loading = false }) {
  const uid = useId().replace(/:/g, "");
  const glowId = `sys-glow-${uid}`;

  const { data: geojson, isLoading: geoLoading } = useQuery({
    queryKey: ["uganda-choropleth-geo"],
    queryFn: loadUgandaGeo,
    staleTime: Infinity,
  });

  const normalized = useMemo(() => normalizeMapNodes(nodes), [nodes]);
  const regions = useMemo(
    () => (geojson ? buildActivityRegions(geojson, normalized) : []),
    [geojson, normalized]
  );
  const hub = useMemo(() => pickHubNode(normalized), [normalized]);
  const others = useMemo(
    () => normalized.filter((n) => n.district !== hub.district || normalized.length === 1),
    [normalized, hub.district]
  );

  const busy = loading || geoLoading;

  return (
    <div className="sys-activity-map">
      {busy && (
        <div className="sys-activity-map__loading">
          <span>Syncing live activity…</span>
        </div>
      )}

      <svg viewBox={UGANDA_VIEWBOX} className="sys-activity-map__svg" aria-label="Uganda live platform activity">
        <defs>
          <radialGradient id={glowId} cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.2)" />
            <stop offset="55%" stopColor="rgba(99, 102, 241, 0.08)" />
            <stop offset="100%" stopColor="rgba(11, 14, 20, 0)" />
          </radialGradient>
          <filter id={`${uid}-blur`}>
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        <rect width="100" height="115" fill="rgba(8, 12, 22, 0.95)" />
        <ellipse cx="52" cy="48" rx="42" ry="48" fill={`url(#${glowId})`} />

        {regions.map((r) =>
          r.paths.map((d, i) => (
            <path
              key={`${r.id}-${i}`}
              d={d}
              fill={r.fill}
              stroke="rgba(15, 23, 42, 0.65)"
              strokeWidth="0.3"
            />
          ))
        )}

        <path
          d={UGANDA_OUTLINE}
          fill="none"
          stroke="rgba(34, 211, 238, 0.35)"
          strokeWidth="0.9"
        />

        {others.map((n) => (
          <path
            key={`arc-${n.district}`}
            d={arcPath(hub.x, hub.y, n.x, n.y)}
            fill="none"
            stroke="rgba(148, 163, 184, 0.35)"
            strokeWidth="0.55"
            strokeDasharray="2 2"
            opacity="0.85"
          />
        ))}

        {normalized.map((n) => {
          const isHub = n.district === hub.district;
          const r = isHub ? 5.5 : Math.max(2.5, 2 + (n.count || 0) / 80);
          return (
            <g key={n.district}>
              <circle
                cx={n.x}
                cy={n.y}
                r={r + 3}
                fill={isHub ? "rgba(0, 200, 150, 0.35)" : "rgba(99, 102, 241, 0.25)"}
                filter={`url(#${uid}-blur)`}
                className={isHub ? "sys-activity-map__hub-glow" : "sys-map-node__ring"}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={isHub ? "#00c896" : "rgba(34, 211, 238, 0.75)"}
                stroke={isHub ? "#ecfdf5" : "rgba(199, 210, 254, 0.9)"}
                strokeWidth={isHub ? 1 : 0.5}
                className="sys-map-node__core"
              />
              <title>
                {n.district}: {n.count} active properties
              </title>
            </g>
          );
        })}

        <g transform={`translate(${hub.x}, ${hub.y})`} className="sys-activity-map__pin">
          <path
            d="M0 -5.2 C2 -5.2 3.6 -3.2 3.6 -1.1 C3.6 1.4 0 5.8 0 5.8 S-3.6 1.4 -3.6 -1.1 C-3.6 -3.2 -2 -5.2 0 -5.2 Z"
            fill="#00c896"
            stroke="#ecfdf5"
            strokeWidth="0.65"
          />
          <circle cy="-1.4" r="1.1" fill="#041208" />
        </g>
      </svg>
    </div>
  );
}
