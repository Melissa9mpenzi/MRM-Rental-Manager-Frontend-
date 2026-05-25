import api from "./client";

function unwrap(r) {
  const body = r.data;
  if (body && typeof body === "object" && body.data !== undefined && body.success === true) {
    return body.data;
  }
  return body?.data ?? body;
}

export const rentalHubApi = {
  threads: (params = {}) =>
    api
      .get("/messages/threads", {
        params: {
          folder: params.folder ?? "inbox",
          thread_type: params.thread_type || undefined,
          q: params.q || undefined,
        },
      })
      .then(unwrap)
      .then((d) => (Array.isArray(d) ? d : [])),

  threadContext: (threadId) => api.get(`/messages/threads/${threadId}/context`).then(unwrap),

  threadMessages: (threadId) =>
    api
      .get(`/messages/threads/${threadId}/messages`)
      .then(unwrap)
      .then((d) => (Array.isArray(d) ? d : [])),

  postMessage: (threadId, body) =>
    api.post(`/messages/threads/${threadId}/messages`, { body }).then(unwrap),

  uploadAttachment: (threadId, file, caption) => {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    return api.post(`/messages/threads/${threadId}/attachments`, form).then(unwrap);
  },

  bookInspection: (threadId, payload) =>
    api.post(`/messages/threads/${threadId}/book-inspection`, payload).then(unwrap),

  markRead: (threadId) => api.post(`/messages/threads/${threadId}/read`).then(unwrap),

  archive: (threadId, archived = true) =>
    api.post(`/messages/threads/${threadId}/archive`, { archived }).then(unwrap),

  start: (unitId, body, threadType = "inquiry") =>
    api
      .post("/messages/start", { unit_id: Number(unitId), body, thread_type: threadType })
      .then(unwrap),
};
/** @deprecated use rentalHubApi */
export const messagesApi = rentalHubApi;
