import api from "./client";

function unwrap(r) {
  const body = r.data;
  if (body && typeof body === "object" && body.data !== undefined && body.success === true) {
    return body.data;
  }
  return body?.data ?? body;
}

export const agentCrmApi = {
  leads: (params) => api.get("/workspace/staff/leads", { params }).then(unwrap),
  createLead: (data) => api.post("/workspace/staff/leads", data).then(unwrap),
  updateLead: (id, data) => api.patch(`/workspace/staff/leads/${id}`, data).then(unwrap),
  deleteLead: (id) => api.delete(`/workspace/staff/leads/${id}`).then(unwrap),

  clients: (params) => api.get("/workspace/staff/clients", { params }).then(unwrap),
  createClient: (data) => api.post("/workspace/staff/clients", data).then(unwrap),
  updateClient: (id, data) => api.patch(`/workspace/staff/clients/${id}`, data).then(unwrap),

  schedules: () => api.get("/workspace/staff/schedules").then(unwrap),
  createSchedule: (data) => api.post("/workspace/staff/schedules", data).then(unwrap),
  updateSchedule: (id, data) => api.patch(`/workspace/staff/schedules/${id}`, data).then(unwrap),

  deals: (params) => api.get("/workspace/staff/deals", { params }).then(unwrap),
  createDeal: (data) => api.post("/workspace/staff/deals", data).then(unwrap),
  updateDeal: (id, data) => api.patch(`/workspace/staff/deals/${id}`, data).then(unwrap),

  commissions: (params) => api.get("/workspace/staff/commissions", { params }).then(unwrap),
  createCommission: (data) => api.post("/workspace/staff/commissions", data).then(unwrap),
  updateCommission: (id, data) => api.patch(`/workspace/staff/commissions/${id}`, data).then(unwrap),

  analytics: () => api.get("/workspace/staff/analytics").then(unwrap),
};
