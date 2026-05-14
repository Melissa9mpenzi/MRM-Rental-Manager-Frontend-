/** Normalize FastAPI `detail` (string or `{ success, message }`) for toasts / thrown Errors. */
export function apiErrorMessage(err, fallback = "Something went wrong.") {
  const d = err?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (d && typeof d === "object" && typeof d.message === "string") return d.message;
  if (Array.isArray(d)) {
    const first = d[0];
    if (first && typeof first.msg === "string") return first.msg;
  }
  return fallback;
}
