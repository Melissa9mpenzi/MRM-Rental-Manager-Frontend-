import { platformApiOrigin } from "../api/config";

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

/** DB points to old server folder — file is usually gone on Vercel. */
export function needsPhotoReupload(path) {
  if (!path) return false;
  if (typeof path === "string" && path.startsWith("http")) return false;
  return isLegacyUploadPath(path);
}

/** Turn upload path from API into a full URL. */
export function uploadMediaUrl(path) {
  if (!path) return null;
  if (typeof path === "string" && path.startsWith("http")) return path;
  if (isLegacyUploadPath(path) && isDeployedSpa()) return null;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiOrigin()}${p}`;
}

/**
 * Real property photo URL only — never substitutes a stock villa image.
 * Returns null when the original upload is missing (user must re-upload from laptop).
 */
export function propertyPhotoUrl(path) {
  if (!path) return null;
  if (typeof path === "string" && path.startsWith("http")) return path;
  if (typeof path === "string" && path.startsWith("/images/")) return null;
  if (needsPhotoReupload(path)) return null;
  return uploadMediaUrl(path);
}

/** Marketplace / search — real upload URL only; null when none or stock path. */
export function listingImageUrl(path) {
  if (!path) return null;
  if (typeof path === "string" && path.startsWith("http")) return path;
  if (typeof path === "string" && path.startsWith("/images/")) return null;
  return propertyPhotoUrl(path);
}

/** On load error: do not swap in a fake stock photo for landlord property cards. */
export function mediaImageFallback(event) {
  const img = event?.currentTarget;
  if (!img || img.dataset.fallbackApplied === "1") return;
  img.dataset.fallbackApplied = "1";
  img.style.display = "none";
  const parent = img.parentElement;
  if (parent && !parent.querySelector("[data-photo-missing]")) {
    const note = document.createElement("div");
    note.dataset.photoMissing = "1";
    note.className =
      "flex h-full min-h-[8rem] w-full flex-col items-center justify-center gap-1 bg-brand-tealLt/20 px-3 text-center text-xs text-brand-mid";
    note.textContent = "Photo unavailable — re-upload your image";
    parent.appendChild(note);
  }
}
