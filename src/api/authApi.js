import api from "./client";

/** Login/me/etc. use `{ success, data }` — unwrapped globally in `client.js`. */
export const authApi = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  resendVerification: (data) => api.post("/auth/resend-verification", data).then((r) => r.data),
  firebaseSignIn: (data) => api.post("/auth/firebase", data).then((r) => r.data),
  privySignIn: (data) => api.post("/auth/privy", data).then((r) => r.data),
  verifyEmail: (data) => api.post("/auth/verify-email", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data).then((r) => r.data),
  resetPassword: (data) => api.post("/auth/reset-password", data).then((r) => r.data),
};