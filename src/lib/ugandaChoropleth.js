import { DISTRICT_GEO, projectUganda, resolveRegionalCompliance } from "./ugandaMapRegions";

/** Red → amber → green (matches mockup compliance gradient). */
export function scoreToChoroplethFill(score) {
  const t = Math.min(100, Math.max(0, Number(score) || 0)) / 100;
  const hue = Math.round(t * 128);
  const sat = 68;
  const light = 38 + t * 14;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function ringCentroid(ring) {
  const pts = ring;
  if (!pts?.length) return { lon: 32.5, lat: 1.2 };
  let lon = 0;
  let lat = 0;
  pts.forEach(([lo, la]) => {
    lon += lo;
    lat += la;
  });
  return { lon: lon / pts.length, lat: lat / pts.length };
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

export function scoreForRegion(regions, district) {
  const row = regions.find((r) => r.district === district);
  return row?.score ?? 62;
}

export function geometryToPaths(geometry) {
  const paths = [];
  if (!geometry) return paths;

  const projectRing = (ring) => {
    const parts = ring.map(([lon, lat], i) => {
      const { x, y } = projectUganda(lon, lat);
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    });
    return `${parts.join(" ")} Z`;
  };

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => paths.push(projectRing(ring)));
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly) => {
      poly.forEach((ring) => paths.push(projectRing(ring)));
    });
  }
  return paths;
}

/** Build SVG regions from GeoJSON features + compliance scores. */
export function buildChoroplethFeatures(geojson, apiRegions) {
  const regions = resolveRegionalCompliance(apiRegions);
  const byDistrict = Object.fromEntries(regions.map((r) => [r.district, r]));

  return (geojson?.features ?? []).map((feature) => {
    const name = feature.properties?.shapeName || "Region";
    const outer = feature.geometry?.type === "Polygon"
      ? feature.geometry.coordinates[0]
      : feature.geometry?.coordinates?.[0]?.[0];
    const centroid = ringCentroid(outer);
    const district = nearestDistrict(centroid);
    const score = scoreForRegion(regions, district);
    const meta = byDistrict[district];

    return {
      id: name,
      district,
      score,
      count: meta?.count ?? 0,
      paths: geometryToPaths(feature.geometry),
      fill: scoreToChoroplethFill(score),
    };
  });
}
