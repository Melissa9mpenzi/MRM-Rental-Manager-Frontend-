import api from "./client";

export const notificationsApi = {
  list:        ()   => api.get("/notifications").then(r => r.data),
  unreadCount: ()   => api.get("/notifications/unread-count").then(r => r.data.count),
  markRead:    (id) => api.post(`/notifications/${id}/read`),
  markAllRead: ()   => api.post("/notifications/mark-all-read"),
};