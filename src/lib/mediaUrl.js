import { platformApiOrigin } from "../api/config";

const FALLBACK_IMAGE = "/images/hero-villa.jpg";

/** Base URL for static uploads (same host as API, no `/api/v1`). */
export function apiOrigin() {
  return platformApiOrigin();
}

function isDeployedSpa() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host.endsWith(".vercel.app") || host.includes("rentdirect");
}

export function isLegacyUploadPath(path) {
  if (!path || typeof path !== "string") return false;
  return path.startsWith("/uploads/") || path.startsWith("uploads/");
}

/** Turn upload path from API into a full URL. */
export function uploadMediaUrl(path) {
  if (!path) return null;
  if (typeof path === "string" && path.startsWith("http")) return path;
  if (isLegacyUploadPath(path) && isDeployedSpa()) return null;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiOrigin()}${p}`;
}

/** Turn `photo_path` from API into a full URL for `<img src>`. */
export function listingImageUrl(path) {
  if (!path) return FALLBACK_IMAGE;
  if (typeof path === "string" && path.startsWith("http")) return path;
  if (typeof path === "string" && path.startsWith("/images/")) return path;
  if (isLegacyUploadPath(path) && isDeployedSpa()) return FALLBACK_IMAGE;
  return uploadMediaUrl(path) || FALLBACK_IMAGE;
}

/** Use on <img onError> to avoid blank/broken cards. */
export function mediaImageFallback(event) {
  const img = event?.currentTarget;
  if (!img || img.dataset.fallbackApplied === "1") return;
  img.dataset.fallbackApplied = "1";
  img.src = FALLBACK_IMAGE;
}
