import axios from "axios";

/**
 * @param {object} options
 * @param {string} options.baseUrl - API origin without /api/v1 (e.g. http://localhost:8000)
 * @param {string} [options.loginPath='/login'] - where to send user after session expiry
 * @param {number} [options.timeout=15000] - request timeout in ms
 */
export function createApiClient({ baseUrl, loginPath = "/login", timeout = 15_000 }) {
  const origin = baseUrl.replace(/\/$/, "");
  const client = axios.create({
    baseURL: `${origin}/api/v1`,
    headers: { "Content-Type": "application/json" },
    timeout,
  });

  let isRefreshing = false;
  let refreshQueue = [];

  function isAuthCredentialRequest(config) {
    const url = config?.url || "";
    return (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/firebase") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password") ||
      url.includes("/auth/verify-email") ||
      url.includes("/government/auth/login") ||
      url.includes("/government/invitation/")
    );
  }

  function clearAuthAndRedirect() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("rd_gov_2fa_verified");
    window.location.href = loginPath;
  }

  client.interceptors.request.use(
    (config) => {
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => {
      const d = response.data;
      if (
        d &&
        typeof d === "object" &&
        d.success === true &&
        Object.prototype.hasOwnProperty.call(d, "data")
      ) {
        const payload = d.data;
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          response.data = { ...payload, _message: d.message ?? null };
        } else {
          response.data = payload;
        }
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isAuthCredentialRequest(originalRequest)) {
          return Promise.reject(error);
        }
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          clearAuthAndRedirect();
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${origin}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = data.access_token;
          localStorage.setItem("access_token", newToken);
          refreshQueue.forEach(({ resolve }) => resolve(newToken));
          refreshQueue = [];
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          refreshQueue.forEach(({ reject }) => reject(refreshError));
          refreshQueue = [];
          clearAuthAndRedirect();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}
