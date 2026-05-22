import api from "./client";

export const workspaceApi = {
  /** Admin-only platform summary */
  adminSummary: () => api.get("/workspace/admin/summary").then((r) => r.data),

  /** Paginated user directory (admin) */
  adminUsers: (params = {}) =>
    api.get("/workspace/admin/users", { params }).then((r) => r.data),

  adminProperties: (params = {}) =>
    api.get("/workspace/admin/properties", { params }).then((r) => r.data),

  adminKycReview: (userId, body) =>
    api.patch(`/workspace/admin/users/${userId}/kyc-review`, body).then((r) => r.data),

  /** Staff or admin — operations-style summary for the agent workspace */
  staffSummary: () => api.get("/workspace/staff/summary").then((r) => r.data),
};
