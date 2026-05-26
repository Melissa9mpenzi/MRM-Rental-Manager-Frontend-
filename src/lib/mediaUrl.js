import { platformApiOrigin } from "../api/config";

/** Base URL for static uploads (same host as API, no `/api/v1`). */
export function apiOrigin() {
  return platformApiOrigin();
}

/** Turn upload path from API into a full URL. */
export function uploadMediaUrl(path) {
  if (!path) return null;
  if (typeof path === "string" && path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiOrigin()}${p}`;
}

/** Turn `photo_path` from API into a full URL for `<img src>`. */
export function listingImageUrl(path) {
  if (!path) return "/images/hero-villa.jpg";

  // On Vercel we don't persist /uploads, so fall back to stock image.
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app")) {
    if (typeof path === "string" && path.startsWith("/uploads/")) {
      return "/images/hero-villa.jpg";
    }
  }

  // Frontend-bundled images live under /images on the SPA host.
  if (typeof path === "string" && path.startsWith("/images/")) {
    return path;
  }

  return uploadMediaUrl(path) || "/images/hero-villa.jpg";
}
