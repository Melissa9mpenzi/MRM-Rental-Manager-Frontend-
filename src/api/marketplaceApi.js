import api from "./client";

export const marketplaceApi = {
  list: (params = {}) =>
    api.get("/marketplace/listings", { params }).then((r) => r.data),

  get: (unitId) => api.get(`/marketplace/listings/${unitId}`).then((r) => r.data),
};
