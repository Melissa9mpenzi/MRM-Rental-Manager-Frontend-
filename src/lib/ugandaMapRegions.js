/** Uganda map — real country outline (GeoJSON) + district positions from lat/lon. */

/** GeoJSON ring for Uganda (lon, lat). Source: world.geo.json / Natural Earth. */
const UGANDA_RING = [
  [31.86617, -1.02736],
  [30.76986, -1.01455],
  [30.419105, -1.134659],
  [29.821519, -1.443322],
  [29.579466, -1.341313],
  [29.587838, -0.587406],
  [29.8195, -0.2053],
  [29.875779, 0.59738],
  [30.086154, 1.062313],
  [30.468508, 1.583805],
  [30.85267, 1.849396],
  [31.174149, 2.204465],
  [30.77332, 2.33989],
  [30.83385, 3.50917],
  [31.24556, 3.7819],
  [31.88145, 3.55827],
  [32.68642, 3.79232],
  [33.39, 3.79],
  [34.005, 4.249885],
  [34.47913, 3.5556],
  [34.59607, 3.05374],
  [35.03599, 1.90584],
  [34.6721, 1.17694],
  [34.18, 0.515],
  [33.893569, 0.109814],
  [33.903711, -0.95],
  [31.86617, -1.02736],
];

const MIN_LON = 29.55;
const MAX_LON = 35.1;
const MIN_LAT = -1.48;
const MAX_LAT = 4.3;

export const UGANDA_VIEWBOX = "0 0 100 115";

/** Project WGS84 to SVG viewBox coordinates. */
export function projectUganda(lon, lat) {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * 100;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 115;
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function buildOutlinePath() {
  return UGANDA_RING.map(([lon, lat], i) => {
    const { x, y } = projectUganda(lon, lat);
    return `${i === 0 ? "M" : "L"}${x} ${y}`;
  }).join(" ");
}

export const UGANDA_OUTLINE = `${buildOutlinePath()} Z`;

/** District centres (lat, lon) → projected in buildMapNodes */
export const DISTRICT_GEO = {
  Kampala: { lat: 0.3476, lon: 32.5825 },
  Wakiso: { lat: 0.4044, lon: 32.4597 },
  Mukono: { lat: 0.3533, lon: 32.7553 },
  Entebbe: { lat: 0.0515, lon: 32.4633 },
  Jinja: { lat: 0.4244, lon: 33.2042 },
  Mbale: { lat: 1.0651, lon: 34.175 },
  Gulu: { lat: 2.7746, lon: 32.2989 },
  Lira: { lat: 2.249, lon: 32.8998 },
  Mbarara: { lat: -0.6067, lon: 30.6546 },
  "Fort Portal": { lat: 0.671, lon: 30.275 },
  Masaka: { lat: -0.3333, lon: 31.7333 },
  Arua: { lat: 3.0201, lon: 30.9111 },
};

export function scoreToFill(score) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  if (s >= 85) return "rgba(0, 200, 150, 0.72)";
  if (s >= 70) return "rgba(0, 200, 150, 0.5)";
  if (s >= 55) return "rgba(234, 179, 8, 0.65)";
  return "rgba(239, 68, 68, 0.55)";
}

export function scoreToStroke(score) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  if (s >= 85) return "#00c896";
  if (s >= 70) return "#34d399";
  if (s >= 55) return "#eab308";
  return "#f87171";
}

export function normalizeDistrictName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "Unknown";
  const key = Object.keys(DISTRICT_GEO).find((k) => k.toLowerCase() === raw.toLowerCase());
  return key || raw;
}

export function normalizeRegions(rows) {
  const merged = new Map();
  for (const r of Array.isArray(rows) ? rows : []) {
    const district = normalizeDistrictName(r.district);
    const count = Math.max(0, Number(r.count ?? r.properties) || 0);
    const pending = Math.max(0, Number(r.pending) || 0);
    const score = Math.min(100, Math.max(0, Number(r.score) || 0));
    const prev = merged.get(district);
    if (!prev) {
      merged.set(district, { district, score, count, properties: count, pending });
      continue;
    }
    const total = prev.count + count;
    prev.score = total
      ? Math.round((prev.score * prev.count + score * count) / total)
      : score;
    prev.count = total;
    prev.properties = total;
    prev.pending += pending;
  }
  return [...merged.values()];
}

export function resolveRegionalCompliance(apiRows) {
  return normalizeRegions(apiRows);
}

function districtPosition(district) {
  const geo = DISTRICT_GEO[district];
  if (geo) return projectUganda(geo.lon, geo.lat);
  const name = district || "X";
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h + name.charCodeAt(i) * (i + 1)) % 97;
  return { x: 20 + (h % 60), y: 25 + ((h * 3) % 70) };
}

export function buildMapNodes(regions) {
  const list = resolveRegionalCompliance(regions);
  return list.slice(0, 12).map((r) => {
    const district = r.district || "Unknown";
    const pos = districtPosition(district);
    const score = r.score ?? 50;
    const count = r.count ?? r.properties ?? 0;
    return {
      district,
      x: pos.x,
      y: pos.y,
      score,
      count,
      size: Math.max(4, 3 + Math.round(score / 18)),
      intensity: score / 100,
      fill: scoreToFill(score),
      stroke: scoreToStroke(score),
    };
  });
}

