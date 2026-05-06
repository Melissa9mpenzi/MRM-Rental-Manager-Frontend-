import api from "./client";

export const tenantsApi = {
  list: (params = {}) =>
    api.get("/tenants", { params }).then((r) => r.data),

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