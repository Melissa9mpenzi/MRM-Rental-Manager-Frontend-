import api from "./client";

function unwrap(r) {
  const body = r.data;
  if (body && typeof body === "object" && body.data !== undefined && body.success === true) {
    return body.data;
  }
  return body?.data ?? body;
}

export const workspaceApi = {
  /** Admin-only platform summary */
  adminSummary: () => api.get("/workspace/admin/summary").then(unwrap),

  /** Paginated user directory (admin) */
  adminUsers: (params = {}) => api.get("/workspace/admin/users", { params }).then(unwrap),

  adminProperties: (params = {}) => api.get("/workspace/admin/properties", { params }).then(unwrap),

  adminKycReview: (userId, body) =>
    api.patch(`/workspace/admin/users/${userId}/kyc-review`, body).then(unwrap),

  adminUserAccount: (userId, body) =>
    api.patch(`/workspace/admin/users/${userId}/account`, body).then(unwrap),

  adminDeleteUser: (userId) =>
    api.delete(`/workspace/admin/users/${userId}`).then(unwrap),

  /** Staff or admin — operations-style summary for the agent workspace */
  staffSummary: () => api.get("/workspace/staff/summary").then(unwrap),
};
