import { createApiClient } from "./createApiClient";
import { PLATFORM_API_URL } from "./config";

const api = createApiClient({ baseUrl: PLATFORM_API_URL, timeout: 20_000 });

export const platformApi = {
  activity: (limit = 25) =>
    api.get("/platform/activity", { params: { limit } }).then((r) => r.data?.data ?? r.data ?? []),
  search: (q) =>
    api.get("/platform/search", { params: { q } }).then((r) => r.data?.data ?? r.data ?? {}),
  systemStatus: () =>
    api.get("/platform/system-status").then((r) => r.data?.data ?? r.data ?? {}),
  dataSummary: () =>
    api.get("/platform/data-summary").then((r) => r.data?.data ?? r.data ?? {}),
};
