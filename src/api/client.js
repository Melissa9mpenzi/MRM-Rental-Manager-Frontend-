import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── AXIOS INSTANCE ────────────────────────────────────────────────
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15s timeout
});

// ── REQUEST INTERCEPTOR — attach JWT ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR — handle 401 + auto-refresh ─────────────
let isRefreshing = false;
let refreshQueue = []; // queue of requests waiting on refresh

/** 401 on these routes is not an expired session — never run refresh / hard redirect. */
function isAuthCredentialRequest(config) {
  const url = config?.url || "";
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password") ||
    url.includes("/auth/verify-email")
  );
}

api.interceptors.response.use(
  (response) => {
    const d = response.data;
    if (
      d &&
      typeof d === "object" &&
      d.success === true &&
      Object.prototype.hasOwnProperty.call(d, "data")
    ) {
      response.data = d.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Only try refresh once and only on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isAuthCredentialRequest(originalRequest)) {
        return Promise.reject(error);
      }
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // No refresh token — force logout
        _clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newToken = data.access_token;
        localStorage.setItem("access_token", newToken);

        // Flush the queue
        refreshQueue.forEach(({ resolve }) => resolve(newToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        _clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function _clearAuthAndRedirect() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export default api;