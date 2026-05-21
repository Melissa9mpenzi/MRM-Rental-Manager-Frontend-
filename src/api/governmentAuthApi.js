import govApi from "./govClient";

export const governmentAuthApi = {
  createInvitation: (body) =>
    govApi.post("/government/invitations", body).then((r) => r.data?.data ?? r.data),
  listInvitations: () => govApi.get("/government/invitations").then((r) => r.data?.data ?? r.data),
  verifyInvitation: (token) =>
    govApi.get("/government/invitation/verify", { params: { token } }).then((r) => r.data?.data ?? r.data),
  acceptInvitation: (body) => govApi.post("/government/invitation/accept", body).then((r) => r.data ?? r),
  login: (body) => govApi.post("/government/auth/login", body).then((r) => r.data?.data ?? r.data),
  verify2fa: (body) => govApi.post("/government/auth/verify-2fa", body).then((r) => r.data ?? r),
  loginSessions: () => govApi.get("/government/auth/sessions").then((r) => r.data?.data ?? r.data),
};
