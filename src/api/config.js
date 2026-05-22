/**
 * Dual API configuration — public platform vs government portal.
 *
 * Local dev: set VITE_API_URL in `.env` (see `.env.example`).
 * Production: `.env.production` or Vercel env vars point at the deployed backend.
 */

export const PRODUCTION_BACKEND_URL =
  "https://mrm-rental-manager-backend.vercel.app";

export const PRODUCTION_FRONTEND_URL =
  "https://mrm-rental-manager-frontend-pink.vercel.app";

function resolveApiUrl(explicit, fallback) {
  const raw = explicit?.replace(/\/$/, "");
  if (raw) return raw;
  if (import.meta.env.PROD) return fallback;
  return "http://localhost:8000";
}

export const PLATFORM_API_URL = resolveApiUrl(
  import.meta.env.VITE_API_URL,
  PRODUCTION_BACKEND_URL
);

export const GOVERNMENT_API_URL = resolveApiUrl(
  import.meta.env.VITE_GOV_API_URL,
  PLATFORM_API_URL
);

/** Uploads / property photos — served from platform API origin (no `/api/v1`). */
export function platformApiOrigin() {
  return PLATFORM_API_URL;
}

export function governmentApiOrigin() {
  return GOVERNMENT_API_URL;
}

/** Build `/api/v1/...` path prefix for rare raw `fetch` calls. */
export function platformApiV1(path = "") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${PLATFORM_API_URL}/api/v1${p}`;
}
