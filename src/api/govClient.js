/**
 * Government portal API — officers, invitations, gov auth, gov modules.
 * Env: VITE_GOV_API_URL (falls back to VITE_API_URL)
 */
import { createApiClient } from "./createApiClient";
import { GOVERNMENT_API_URL } from "./config";

const govApi = createApiClient({
  baseUrl: GOVERNMENT_API_URL,
  loginPath: "/government/login",
  timeout: 45_000,
});

export default govApi;
