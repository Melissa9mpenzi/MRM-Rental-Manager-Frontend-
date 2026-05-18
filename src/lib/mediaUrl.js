/** Base URL for static uploads (same host as API, no `/api/v1`). */
export function apiOrigin() {
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return String(base).replace(/\/$/, "");
}

/** Turn `photo_path` from API into a full URL for `<img src>`. */
export function listingImageUrl(path) {
  if (!path) return "/images/hero-villa.jpg";
  if (typeof path === "string" && path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiOrigin()}${p}`;
}
