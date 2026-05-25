import govApi from "./govClient";

export const governmentAuthApi = {
  createInvitation: (body) =>
    govApi
      .post("/government/invitations", body, { timeout: 30_000 })
      .then((r) => r.data?.data ?? r.data),
  listInvitations: () =>
    govApi.get("/government/invitations").then((r) => {
      const d = r.data?.data ?? r.data;
      if (d && Array.isArray(d.items)) {
        return {
          items: d.items,
          smtp_configured: d.smtp_configured,
          frontend_base_url: d.frontend_base_url,
        };
      }
      return {
        items: Array.isArray(d) ? d : [],
        smtp_configured: undefined,
        frontend_base_url: undefined,
      };
    }),
  resendInvitation: (invitationId) =>
    govApi
      .post(`/government/invitations/${invitationId}/resend`, null, { timeout: 30_000 })
      .then((r) => r.data?.data ?? r.data),
  verifyInvitation: (token) =>
    govApi.get("/government/invitation/verify", { params: { token } }).then((r) => r.data?.data ?? r.data),
  acceptInvitation: (body) => govApi.post("/government/invitation/accept", body).then((r) => r.data ?? r),
  login: (body) => govApi.post("/government/auth/login", body).then((r) => r.data?.data ?? r.data),
  verify2fa: (body) => govApi.post("/government/auth/verify-2fa", body).then((r) => r.data ?? r),
  resend2fa: () => govApi.post("/government/auth/resend-2fa").then((r) => r.data?.data ?? r.data),
  loginSessions: () => govApi.get("/government/auth/sessions").then((r) => r.data?.data ?? r.data),
};
