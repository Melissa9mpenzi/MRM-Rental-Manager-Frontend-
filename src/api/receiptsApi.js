import api from "./client";
import { platformApiV1 } from "./config";

function unwrap(r) {
  return r.data?.data ?? r.data;
}

export const receiptsApi = {
  list: (params = {}) => api.get("/receipts", { params }).then(unwrap),
  get: (id) => api.get(`/receipts/${id}`).then(unwrap),
  verify: (token) => api.get(`/receipts/verify/${token}`).then(unwrap),
  adminStats: () => api.get("/receipts/admin/stats").then(unwrap),
  email: (id, toEmail) => api.post(`/receipts/${id}/email`, { to_email: toEmail || null }).then(unwrap),
  pdfUrl: (id) => platformApiV1(`/receipts/${id}/pdf`),
  verifyPageUrl: (token) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/receipt/${token}`
      : `/verify/receipt/${token}`,
};
