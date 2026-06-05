import api from "./client";

/** Logged-in tenant (`require_tenant`) — `/api/v1/tenant/*`. */
export const tenantPortalApi = {
  myProfile: () => api.get("/tenant/me").then((r) => r.data),
  reconnectProfile: () => api.post("/tenant/reconnect").then((r) => r.data),
  pendingInvitation: () => api.get("/tenant/pending-invitation").then((r) => r.data),
  acceptRental: () => api.post("/tenant/accept-rental").then((r) => r.data),
  updateMe: (data) => api.patch("/tenant/me", data).then((r) => r.data),
  myLease: () => api.get("/tenant/my-lease").then((r) => r.data),
  myPayments: () => api.get("/tenant/my-payments").then((r) => r.data),
  myInvoices: () => api.get("/tenant/my-invoices").then((r) => r.data),
  verifyInvite: (token) =>
    api.get("/tenant/invite/verify", { params: { token } }).then((r) => r.data),
  acceptInvite: (body) =>
    api.post("/tenant/invite/accept", body).then((r) => r.data),
};
