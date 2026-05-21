/**
 * Public platform API — tenant, landlord, agent, register, marketplace.
 * Env: VITE_API_URL
 */
import { createApiClient } from "./createApiClient";
import { PLATFORM_API_URL } from "./config";

const api = createApiClient({
  baseUrl: PLATFORM_API_URL,
  loginPath: "/login",
});

export default api;
