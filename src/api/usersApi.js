import api from "./client";

/** Profile + role (JWT user must be authenticated). */
export const usersApi = {
  getMe: () => api.get("/users/me").then((r) => r.data),
  putMe: (data) => api.put("/users/me", data).then((r) => r.data),
};
