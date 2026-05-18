import api from "./client";

export const savedListingsApi = {
  list: () => api.get("/saved-units").then((r) => r.data),

  add: (unitId) => api.post("/saved-units", { unit_id: Number(unitId) }).then((r) => r.data),

  remove: (unitId) => api.delete(`/saved-units/${Number(unitId)}`),
};
