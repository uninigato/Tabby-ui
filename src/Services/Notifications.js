import { request } from "./Client";

// My 50 most recent, newest first
export function getNotifications() {
  return request("/api/notifications");
}

export function markRead(id) {
  return request(`/api/notifications/${id}/read`, { method: "POST" });
}

export function markAllRead() {
  return request("/api/notifications/read-all", { method: "POST" });
}