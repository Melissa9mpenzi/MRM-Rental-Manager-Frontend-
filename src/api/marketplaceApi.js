import api from "./client";

export const marketplaceApi = {
  list: (params = {}) => {
    const q = { ...params };
    if (Array.isArray(q.amenities) && q.amenities.length) {
      q.amenities = q.amenities.join(",");
    }
    return api.get("/marketplace/listings", { params: q }).then((r) => r.data);
  },

  get: (unitId) => api.get(`/marketplace/listings/${unitId}`).then((r) => r.data),
};
