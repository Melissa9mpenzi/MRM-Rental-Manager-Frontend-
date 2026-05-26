import api from "./client";

export const leasesApi = {
  list: (params = {}) => api.get("/leases/", { params }).then((r) => r.data),

  get: (id) => api.get(`/leases/${id}`).then((r) => r.data),

  create: (data) => api.post("/leases/", data).then((r) => r.data),

  update: (id, data) => api.put(`/leases/${id}`, data).then((r) => r.data),

  terminate: (id, data) => api.post(`/leases/${id}/terminate`, data).then((r) => r.data),
};
