import api from "./client";

export const blockchainApi = {
  status: () => api.get("/blockchain/status").then((r) => r.data),
  dashboard: () => api.get("/blockchain/dashboard").then((r) => r.data),
  myWallet: () => api.get("/blockchain/wallet/me").then((r) => r.data),
  linkWallet: (data) => api.post("/blockchain/wallet/link", data).then((r) => r.data),
  receipts: (params = {}) => api.get("/blockchain/receipts", { params }).then((r) => r.data),
  receipt: (id) => api.get(`/blockchain/receipts/${id}`).then((r) => r.data),
  escrows: () => api.get("/blockchain/escrow").then((r) => r.data),
  createEscrow: (leaseId) => api.post(`/blockchain/escrow/lease/${leaseId}`).then((r) => r.data),
  releaseEscrow: (escrowId, data = {}) =>
    api.post(`/blockchain/escrow/${escrowId}/release`, data).then((r) => r.data),
};
