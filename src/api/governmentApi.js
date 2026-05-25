import govApi from "./govClient";

export const governmentApi = {
  me: () => govApi.get("/government/me").then((r) => r.data?.data ?? r.data),
  overview: () => govApi.get("/government/overview").then((r) => r.data?.data ?? r.data),
  niraQueue: (params) =>
    govApi.get("/government/nira/queue", { params, timeout: 45_000 }).then((r) => {
      const d = r.data?.data ?? r.data;
      if (d && Array.isArray(d.items)) {
        return {
          items: d.items,
          pendingInDatabase: d.pending_in_database ?? 0,
          repairedFromUploads: d.repaired_from_uploads ?? 0,
          environment: d.environment,
        };
      }
      return {
        items: Array.isArray(d) ? d : [],
        pendingInDatabase: Array.isArray(d) ? d.filter((x) => x.verification_status === "pending").length : 0,
        repairedFromUploads: 0,
        environment: undefined,
      };
    }),
  niraDecision: (body) => govApi.post("/government/nira/decision", body).then((r) => r.data?.data ?? r.data),
  kccaProperties: (params) =>
    govApi.get("/government/kcca/properties", { params }).then((r) => r.data?.data ?? r.data),
  kccaDecision: (body) => govApi.post("/government/kcca/decision", body).then((r) => r.data?.data ?? r.data),
  uraReports: (params) => govApi.get("/government/ura/reports", { params }).then((r) => r.data?.data ?? r.data),
  fraudAlerts: () => govApi.get("/government/fraud/alerts").then((r) => r.data?.data ?? r.data),
  auditLogs: () => govApi.get("/government/audit-logs").then((r) => r.data?.data ?? r.data),
  exportAuditWalrus: (params) =>
    govApi.post("/government/audit/export-walrus", null, { params }).then((r) => r.data?.data ?? r.data),
  workflow: () => govApi.get("/government/workflow").then((r) => r.data?.data ?? r.data),
  niraBlacklist: () => govApi.get("/government/nira/blacklist").then((r) => r.data?.data ?? r.data),
  niraSuspend: (body) => govApi.post("/government/nira/suspend", body).then((r) => r.data?.data ?? r.data),
  niraUnsuspend: (userId) =>
    govApi.post(`/government/nira/unsuspend/${userId}`).then((r) => r.data?.data ?? r.data),
};
