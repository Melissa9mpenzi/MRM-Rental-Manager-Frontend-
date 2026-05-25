import api from "./client";

/** API returns tenant profiles for the logged-in landlord — not payment/cash transactions. */
function asTenantList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export const tenantsApi = {
  list: (params = {}) =>
    api.get("/tenants", { params }).then((r) => asTenantList(r.data)),

  get: (id) =>
    api.get(`/tenants/${id}`).then((r) => r.data),

  create: (formData) =>
    api.post("/tenants", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),

  update: (id, formData) =>
    api.put(`/tenants/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),

  moveOut: (id) =>
    api.post(`/tenants/${id}/move-out`).then((r) => r.data),
};