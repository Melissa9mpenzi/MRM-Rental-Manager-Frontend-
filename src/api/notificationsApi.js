import api from "./client";

function unwrap(r) {
  const body = r.data;
  if (body && typeof body === "object" && body.data !== undefined && body.success === true) {
    return body.data;
  }
  return body?.data ?? body;
}

export const notificationsApi = {
  list: () => api.get("/notifications").then(unwrap).then((d) => (Array.isArray(d) ? d : [])),
  unreadCount: () =>
    api.get("/notifications/unread-count").then(unwrap).then((d) => (typeof d === "object" && d?.count != null ? d.count : 0)),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/mark-all-read"),
};
