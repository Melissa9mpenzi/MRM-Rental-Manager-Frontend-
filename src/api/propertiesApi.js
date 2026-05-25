import api from "./client";

export const propertiesApi = {
  list: (params = {}) =>
    api.get("/properties", { params }).then((r) => r.data),

  get: (id) =>
    api.get(`/properties/${id}`).then((r) => r.data),

  create: (data) =>
    api.post("/properties", data).then((r) => r.data),

  update: (id, data) =>
    api.patch(`/properties/${id}`, data).then((r) => r.data),

  uploadPhoto: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/properties/${id}/photo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  uploadVideo: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/properties/${id}/video`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
    }).then((r) => r.data);
  },

  archive: (id) =>
    api.post(`/properties/${id}/archive`).then((r) => r.data),

  restore: (id) =>
    api.post(`/properties/${id}/restore`).then((r) => r.data),

  /** POST alias — Vercel/old deploys may return 405 on DELETE */
  delete: (id) =>
    api.post(`/properties/${id}/delete`).then((r) => r.data),

  listUnits: (propertyId) =>
    api.get(`/properties/${propertyId}/units`).then((r) => r.data),

  // alias used in tenant & maintenance forms
  getUnits: (propertyId) =>
    api.get(`/properties/${propertyId}/units`).then((r) => r.data),

  createUnit: (propertyId, data) =>
    api.post(`/properties/${propertyId}/units`, data).then((r) => r.data),

  updateUnit: (unitId, data) =>
    api.patch(`/units/${unitId}`, data).then((r) => r.data),

  updateUnitStatus: (unitId, status) =>
    api.patch(`/units/${unitId}/status`, { status }).then((r) => r.data),

  deleteUnit: (unitId) =>
    api.delete(`/units/${unitId}`),
};