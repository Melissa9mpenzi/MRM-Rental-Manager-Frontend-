import govApi from "./govClient";

export const governmentApi = {
  me: () => govApi.get("/government/me").then((r) => r.data?.data ?? r.data),
  overview: () => govApi.get("/government/overview").then((r) => r.data?.data ?? r.data),
  niraQueue: (params) => govApi.get("/government/nira/queue", { params }).then((r) => r.data?.data ?? r.data),
  niraDecision: (body) => govApi.post("/government/nira/decision", body).then((r) => r.data?.data ?? r.data),
  kccaProperties: (params) =>
    govApi.get("/government/kcca/properties", { params }).then((r) => r.data?.data ?? r.data),
  kccaDecision: (body) => govApi.post("/government/kcca/decision", body).then((r) => r.data?.data ?? r.data),
  uraReports: (params) => govApi.get("/government/ura/reports", { params }).then((r) => r.data?.data ?? r.data),
  fraudAlerts: () => govApi.get("/government/fraud/alerts").then((r) => r.data?.data ?? r.data),
  auditLogs: () => govApi.get("/government/audit-logs").then((r) => r.data?.data ?? r.data),
};
