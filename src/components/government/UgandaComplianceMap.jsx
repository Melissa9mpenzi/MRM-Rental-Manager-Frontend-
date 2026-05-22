import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UGANDA_OUTLINE, UGANDA_VIEWBOX } from "../../lib/ugandaMapRegions";
import { buildChoroplethFeatures } from "../../lib/ugandaChoropleth";

async function loadUgandaGeo() {
  const res = await fetch("/data/uganda-adm2.geojson");
  if (!res.ok) throw new Error("Could not load Uganda map data");
  return res.json();
}

/**
 * Compliance by Region — choropleth map (mockup style).
 */
export default function UgandaComplianceMap({
  regions = [],
  loading: overviewLoading = false,
  selectedDistrict,
  onSelectDistrict,
}) {
  const [hovered, setHovered] = useState(null);

  const { data: geojson, isLoading: geoLoading, isError: geoError } = useQuery({
    queryKey: ["uganda-choropleth-geo"],
    queryFn: loadUgandaGeo,
    staleTime: Infinity,
  });

  const features = useMemo(
    () => (geojson ? buildChoroplethFeatures(geojson, regions) : []),
    [geojson, regions]
  );

  const loading = overviewLoading || geoLoading;
  const active = selectedDistrict || hovered;

  return (
    <div className="uganda-choropleth">
      {loading && (
        <div className="uganda-choropleth__loading">
          <span>Loading map…</span>
        </div>
      )}

      {geoError && !loading && (
        <div className="uganda-choropleth__error">
          Map data failed to load. Check that <code>/data/uganda-adm2.geojson</code> is available.
        </div>
      )}

      {!geoError && (
        <svg viewBox={UGANDA_VIEWBOX} className="uganda-choropleth__svg" aria-label="Uganda compliance by region">
          <path
            d={UGANDA_OUTLINE}
            className="uganda-choropleth__outline"
            fill="rgba(8, 12, 18, 0.6)"
            stroke="rgba(148, 163, 184, 0.25)"
            strokeWidth="0.8"
          />

          {features.map((f) => {
            const isActive = active === f.district || hovered === f.id;
            return (
              <g
                key={f.id}
                className={`uganda-choropleth__region ${isActive ? "uganda-choropleth__region--active" : ""}`}
                onMouseEnter={() => setHovered(f.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelectDistrict?.(f.district)}
                style={{ cursor: onSelectDistrict ? "pointer" : "default" }}
                role="button"
                tabIndex={0}
                aria-label={`${f.id}: ${f.score}% compliance`}
              >
                {f.paths.map((d, i) => (
                  <path
                    key={`${f.id}-${i}`}
                    d={d}
                    fill={f.fill}
                    stroke={isActive ? "#fff" : "rgba(11, 14, 20, 0.55)"}
                    strokeWidth={isActive ? 1.1 : 0.35}
                  />
                ))}
                <title>
                  {f.id} ({f.district}): {f.score}% · {f.count} records
                </title>
              </g>
            );
          })}
        </svg>
      )}

      <div className="uganda-choropleth__legend-bar" aria-hidden>
        <div className="uganda-choropleth__gradient" />
        <div className="uganda-choropleth__legend-labels">
          <span>Low Compliance</span>
          <span>High Compliance</span>
        </div>
      </div>

      {!loading && features.length > 0 && (
        <p className="uganda-choropleth__meta">
          {features.length} sub-regions · hover for detail
        </p>
      )}
    </div>
  );
}
