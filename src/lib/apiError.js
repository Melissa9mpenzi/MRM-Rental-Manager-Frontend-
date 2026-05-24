export function isRequestTimeout(err) {
  if (!err) return false;
  const code = err.code || "";
  const msg = String(err.message || "");
  return !err.response && (code === "ECONNABORTED" || msg.toLowerCase().includes("timeout"));
}

/** True when the browser could not complete HTTP (server down, reload, CORS block). */
export function isNetworkFailure(err) {
  if (!err) return false;
  if (isRequestTimeout(err)) return false;
  const code = err.code || "";
  const msg = String(err.message || "");
  return (
    !err.response &&
    (code === "ERR_NETWORK" ||
      msg.includes("Network Error") ||
      msg.includes("ERR_CONNECTION_RESET") ||
      msg.includes("Failed to fetch"))
  );
}

import { GOVERNMENT_API_URL, PLATFORM_API_URL, PRODUCTION_BACKEND_URL } from "../api/config";

function looksLikeLocalDevUrl(url) {
  if (!url) return true;
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(url);
}

function apiOriginForError(err) {
  const url = String(err?.config?.url || err?.request?.responseURL || "");
  if (url.includes("/government/")) {
    return GOVERNMENT_API_URL;
  }
  return PLATFORM_API_URL;
}

/** Normalize FastAPI `detail` (string or `{ success, message }`) for toasts / thrown Errors. */
export function apiErrorMessage(err, fallback = "Something went wrong.") {
  if (isRequestTimeout(err)) {
    const base = apiOriginForError(err);
    return `The server at ${base} took too long to respond. Wait a few seconds and try again. If this keeps happening, check that the backend and database are running.`;
  }
  if (isNetworkFailure(err)) {
    const base = apiOriginForError(err);
    if (looksLikeLocalDevUrl(base) && typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app")) {
      return `This site is calling ${base}, which only works on your PC. In the Vercel frontend project, set VITE_API_URL to ${PRODUCTION_BACKEND_URL} and redeploy.`;
    }
    if (looksLikeLocalDevUrl(base)) {
      return `Cannot reach the API at ${base}. Start the backend (uvicorn on port 8000) and refresh.`;
    }
    return `Cannot reach the API at ${base}. The server may be waking up (Vercel cold start) — wait 30 seconds and try again. Check ${PRODUCTION_BACKEND_URL}/health in your browser.`;
  }
  const d = err?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (d && typeof d === "object" && typeof d.message === "string") return d.message;
  if (Array.isArray(d)) {
    const first = d[0];
    if (first && typeof first.msg === "string") return first.msg;
  }
  return fallback;
}
