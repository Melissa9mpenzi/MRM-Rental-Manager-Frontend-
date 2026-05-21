/**
 * Dual API configuration — public platform vs government portal.
 *
 * Local dev (one FastAPI on :8000):
 *   VITE_API_URL=http://localhost:8000
 *   VITE_GOV_API_URL=http://localhost:8000
 *
 * Production example:
 *   VITE_API_URL=https://api.rentdirect.ug
 *   VITE_GOV_API_URL=https://gov-api.rentdirect.ug
 */

export const PLATFORM_API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export const GOVERNMENT_API_URL =
  import.meta.env.VITE_GOV_API_URL?.replace(/\/$/, "") ||
  PLATFORM_API_URL;

/** Uploads / property photos — served from platform API origin */
export function platformApiOrigin() {
  return PLATFORM_API_URL;
}

export function governmentApiOrigin() {
  return GOVERNMENT_API_URL;
}
