import api from "./client";

/** Logged-in tenant (`require_tenant`) — `/api/v1/tenant/*`. */
export const tenantPortalApi = {
  myProfile: () => api.get("/tenant/me").then((r) => r.data),
  myLease: () => api.get("/tenant/my-lease").then((r) => r.data),
  myPayments: () => api.get("/tenant/my-payments").then((r) => r.data),
  myInvoices: () => api.get("/tenant/my-invoices").then((r) => r.data),
};
