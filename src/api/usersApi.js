import api from "./client";

/** Profile + role (JWT user must be authenticated). */
export const usersApi = {
  getMe: () => api.get("/users/me").then((r) => r.data),
  putMe: (data) => api.put("/users/me", data).then((r) => r.data),
  kycSubmit: () => api.post("/users/me/kyc-submit").then((r) => r.data),
  uploadKycDocuments: (formData) =>
    api.post("/users/me/kyc-documents", formData, { timeout: 120000 }).then((r) => r.data),
  changePassword: (current_password, new_password) => {
    const fd = new FormData();
    fd.append("current_password", current_password);
    fd.append("new_password", new_password);
    return api.post("/users/me/change-password", fd).then((r) => r.data);
  },
};
