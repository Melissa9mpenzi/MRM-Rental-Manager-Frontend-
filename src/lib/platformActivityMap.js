import { DISTRICT_GEO, normalizeDistrictName, projectUganda } from "./ugandaMapRegions";
import { geometryToPaths } from "./ugandaChoropleth";

/** Position API nodes on the shared Uganda projection. */
export function normalizeMapNodes(nodes) {
  return (nodes ?? []).map((n) => {
    const district = normalizeDistrictName(n.district);
    const geo = DISTRICT_GEO[district];
    if (geo) {
      const p = projectUganda(geo.lon, geo.lat);
      return { ...n, district, x: p.x, y: p.y };
    }
    const y = ((Number(n.y) || 45) / 80) * 115;
    return { ...n, district, x: Number(n.x) || 50, y };
  });
}

export function activityFill(count = 0, intensity = 0.3) {
  const t = Math.min(1, (count || 0) / 40 + (intensity || 0) * 0.55);
  if (t >= 0.75) return "hsla(158, 82%, 42%, 0.95)";
  if (t >= 0.45) return "hsla(192, 72%, 38%, 0.88)";
  if (t >= 0.2) return "hsla(220, 55%, 28%, 0.9)";
  return "hsla(232, 42%, 18%, 0.94)";
}

function ringCentroid(ring) {
  if (!ring?.length) return { lon: 32.5, lat: 1.2 };
  let lon = 0;
  let lat = 0;
  ring.forEach(([lo, la]) => {
    lon += lo;
    lat += la;
  });
  return { lon: lon / ring.length, lat: lat / ring.length };
}

function nearestDistrict(centroid) {
  let best = "Kampala";
  let bestD = Infinity;
  Object.entries(DISTRICT_GEO).forEach(([name, geo]) => {
    const d = (geo.lon - centroid.lon) ** 2 + (geo.lat - centroid.lat) ** 2;
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  });
  return best;
}

/** Choropleth regions colored by property activity (admin live map). */
export function buildActivityRegions(geojson, mapNodes) {
  const nodes = normalizeMapNodes(mapNodes);
  const byDistrict = Object.fromEntries(
    nodes.map((n) => [n.district, { count: n.count || 0, intensity: n.intensity ?? 0.3 }])
  );

  return (geojson?.features ?? []).map((feature) => {
    const name = feature.properties?.shapeName || "Region";
    const outer =
      feature.geometry?.type === "Polygon"
        ? feature.geometry.coordinates[0]
        : feature.geometry?.coordinates?.[0]?.[0];
    const district = nearestDistrict(ringCentroid(outer));
    const meta = byDistrict[district] || { count: 0, intensity: 0.2 };

    return {
      id: name,
      district,
      paths: geometryToPaths(feature.geometry),
      fill: activityFill(meta.count, meta.intensity),
      count: meta.count,
    };
  });
}

export function pickHubNode(nodes) {
  const list = normalizeMapNodes(nodes);
  if (!list.length) return { x: 54, y: 52, district: "Kampala", count: 0 };
  return list.reduce((a, b) => ((b.count || 0) > (a.count || 0) ? b : a), list[0]);
}

export function arcPath(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - 6 - Math.abs(x2 - x1) * 0.08;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

