import api from "./client";

function unwrap(r) {
  return r.data?.data ?? r.data;
}

export const verifyApi = {
  /** Unified QR — token only, server resolves kind */
  resolve: (token) => api.get(`/verify/${encodeURIComponent(token)}`).then(unwrap),
  receipt: (token) => api.get(`/verify/receipt/${encodeURIComponent(token)}`).then(unwrap),
  contract: (token) => api.get(`/verify/contract/${encodeURIComponent(token)}`).then(unwrap),
  property: (token) => api.get(`/verify/property/${encodeURIComponent(token)}`).then(unwrap),
  compliance: (token) => api.get(`/verify/compliance/${encodeURIComponent(token)}`).then(unwrap),
};

export function verifyPageUrl(token) {
  if (!token) return "";
  return typeof window !== "undefined"
    ? `${window.location.origin}/verify/${token}`
    : `/verify/${token}`;
}
