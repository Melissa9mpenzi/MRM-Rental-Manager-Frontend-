import api from "./client";

function asList(data) {
  return Array.isArray(data) ? data : [];
}

export const maintenanceApi = {
  list: (params = {}) =>
    api.get("/maintenance", { params }).then((r) => asList(r.data)),

  get: (id) =>
    api.get(`/maintenance/${id}`).then((r) => r.data),

  create: (formData) =>
    api.post("/maintenance", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),

  update: (id, formData) => {
    // formData is a plain object — convert to FormData for PATCH
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, v);
    });
    return api.patch(`/maintenance/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  delete: (id) =>
    api.delete(`/maintenance/${id}`).then((r) => r.data),
};
