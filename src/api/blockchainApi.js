import api from "./client";

function unwrap(r) {
  const body = r.data;
  if (body && typeof body === "object" && body.data !== undefined && body.success === true) {
    return body.data;
  }
  return body?.data ?? body;
}

export const blockchainApi = {
  status: () => api.get("/blockchain/status").then(unwrap),
  dashboard: () => api.get("/blockchain/dashboard").then(unwrap),
  myWallet: () => api.get("/blockchain/wallet/me").then(unwrap),
  ensureWallet: () => api.post("/blockchain/wallet/ensure").then(unwrap),
  requestFaucet: (data) => api.post("/blockchain/wallet/faucet", data).then(unwrap),
  privyWalletPubkey: (data) => api.post("/blockchain/wallet/privy-pubkey", data).then(unwrap),
  privyWalletPolicy: (data) => api.post("/blockchain/wallet/privy-policy", data).then(unwrap),
  payPlatformSui: (reference) =>
    api.post(`/payments/checkout/${reference}/pay-platform-sui`).then(unwrap),
  linkWallet: (data) => api.post("/blockchain/wallet/link", data).then(unwrap),
  receipts: (params = {}) => api.get("/blockchain/receipts", { params }).then(unwrap),
  receipt: (id) => api.get(`/blockchain/receipts/${id}`).then(unwrap),
  escrows: () => api.get("/blockchain/escrow").then(unwrap),
  createEscrow: (leaseId) => api.post(`/blockchain/escrow/lease/${leaseId}`).then(unwrap),
  releaseEscrow: (escrowId, data = {}) =>
    api.post(`/blockchain/escrow/${escrowId}/release`, data).then(unwrap),
  walrusInventory: () => api.get("/blockchain/walrus/inventory").then(unwrap),
};
