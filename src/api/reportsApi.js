import api from "./client";

export const reportsApi = {
  arrears: () => api.get("/reports/arrears").then((r) => r.data),
};
