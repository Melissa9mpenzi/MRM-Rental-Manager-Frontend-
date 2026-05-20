import api from "./client";

export const paymentsApi = {
  gatewayStatus: () => api.get("/payments/gateway/status").then((r) => r.data),
  walletSummary: () => api.get("/payments/wallet-summary").then((r) => r.data),
  initiateCheckout: (data) =>
    api.post("/payments/checkout/initiate", data).then((r) => r.data),
  getCheckout: (reference) =>
    api.get(`/payments/checkout/${reference}`).then((r) => r.data),
  list:        (params = {}) => api.get("/payments", { params }).then((r) => r.data),
  listForTenant: (tenantId)  => api.get(`/tenants/${tenantId}/payments`).then((r) => r.data),
  create:      (data)        => api.post("/payments", data).then((r) => r.data),
  update:      (id, data)    => api.patch(`/payments/${id}`, data).then((r) => r.data),
  delete:      (id)          => api.delete(`/payments/${id}`),
  receiptUrl:  (id)          => `${api.defaults.baseURL}/payments/${id}/receipt`,
  uploadProof: (id, formData) =>
    api.post(`/payments/${id}/proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
};