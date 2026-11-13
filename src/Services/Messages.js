import { request } from "./Client";

// The conversation with one friend, oldest first (the last 100 messages).
// Pass afterId to get only messages newer than that id.
export function getConversation(friendId, afterId) {
  const query = afterId ? `?afterId=${afterId}` : "";
  return request(`/api/messages/${friendId}${query}`);
}

// Resolves with the saved message: { id, senderId, recipientId, content, sentAt }
export function sendMessage(friendId, content) {
  return request(`/api/messages/${friendId}`, {
    method: "POST",
    body: { content },
  });
}

// [{ friendId, count }] for every friend who has sent me unread messages
export function getUnreadCounts() {
  return request("/api/messages/unread");
}

// Everything that friend sent me counts as read from now on
export function markConversationRead(friendId) {
  return request(`/api/messages/${friendId}/read`, { method: "POST" });
}