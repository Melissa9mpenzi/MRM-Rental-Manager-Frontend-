import api from "./client";

export const messagesApi = {
  threads: () => api.get("/messages/threads").then((r) => r.data),

  threadMessages: (threadId) =>
    api.get(`/messages/threads/${threadId}/messages`).then((r) => r.data),

  postMessage: (threadId, body) =>
    api.post(`/messages/threads/${threadId}/messages`, { body }).then((r) => r.data),

  start: (unitId, body) =>
    api.post("/messages/start", { unit_id: Number(unitId), body }).then((r) => r.data),
};
